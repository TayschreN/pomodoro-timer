document.addEventListener('DOMContentLoaded', () => {
    const themeManager = new ThemeManager();
    const settingsManager = new SettingsManager();
    const timer = new Timer(settingsManager.getAll());

    const timerDisplay = document.getElementById('timerDisplay');
    const sessionLabel = document.getElementById('sessionLabel');
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const saveSettingsBtn = document.getElementById('saveSettings');
    const newThemeBtn = document.getElementById('newThemeBtn');
    const saveThemeBtn = document.getElementById('saveTheme');
    const fabThemeBtn = document.getElementById('fabThemeBtn');
    const closeThemePanel = document.getElementById('closeThemePanel');
    const themePanel = document.getElementById('themePanel');
    const notification = document.getElementById('notification');
    const notificationMsg = document.getElementById('notificationMsg');

    const progressFill = document.querySelector('.progress-ring-fill');
    const CIRCUMFERENCE = 816.81;

    let notificationTimeout = null;
    let editingThemeId = null;

    function updateDisplay(remaining, total, session) {
        timerDisplay.textContent = timer.formatTime(remaining);
        sessionLabel.textContent = timer.getSessionLabel(session);

        const progress = total > 0 ? ((total - remaining) / total) * 100 : 0;
        const offset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;
        progressFill.style.strokeDashoffset = offset;
    }

    function updateStartButton() {
        if (timer.isRunning) {
            startBtn.textContent = 'Pausar';
            startBtn.classList.add('running');
        } else {
            startBtn.textContent = 'Iniciar';
            startBtn.classList.remove('running');
        }
    }

    function showNotification(msg) {
        notificationMsg.textContent = msg;
        notification.classList.remove('hidden');
        setTimeout(() => notification.classList.add('show'), 10);
        if (notificationTimeout) clearTimeout(notificationTimeout);
        notificationTimeout = setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.classList.add('hidden'), 300);
        }, 4000);
    }

    function updateDocumentTitle(remaining) {
        document.title = timer.isRunning
            ? timer.formatTime(remaining) + ' - Pomodoro Timer'
            : 'Pomodoro Timer';
    }

    // Timer callbacks
    timer.onTick = (remaining, total, session) => {
        updateDisplay(remaining, total, session);
        updateDocumentTitle(remaining);
    };

    timer.onComplete = (session) => {
        playNotification();
        const labels = {
            focus: 'Foco concluído! Hora da pausa.',
            shortBreak: 'Pausa curta concluída! Hora de focar.',
            longBreak: 'Pausa longa concluída! Hora de focar.'
        };
        showNotification(labels[session] || 'Tempo esgotado!');
        startBtn.textContent = 'Iniciar';
        startBtn.classList.remove('running');
    };

    timer.onStateChange = (state) => {
        updateStartButton();
    };

    // Session tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('active')) return;
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            timer.setSession(tab.dataset.session);
            updateDisplay(timer.remainingSeconds, timer.totalSeconds, timer.currentSession);
            updateDocumentTitle(timer.remainingSeconds);
        });
    });

    // Start / Pause
    startBtn.addEventListener('click', () => {
        timer.toggle();
    });

    // Reset
    resetBtn.addEventListener('click', () => {
        timer.reset();
        updateDocumentTitle(timer.remainingSeconds);
    });

    // Settings
    settingsManager.populateForm();

    settingsBtn.addEventListener('click', () => {
        settingsManager.populateForm();
        document.getElementById('settingsModal').classList.remove('hidden');
    });

    saveSettingsBtn.addEventListener('click', () => {
        const data = {
            focus: document.getElementById('focusTime').value,
            shortBreak: document.getElementById('shortBreakTime').value,
            longBreak: document.getElementById('longBreakTime').value
        };
        settingsManager.update(data);
        timer.updateSettings(settingsManager.getAll());
        updateDisplay(timer.remainingSeconds, timer.totalSeconds, timer.currentSession);
        document.getElementById('settingsModal').classList.add('hidden');
    });

    // Theme editor
    newThemeBtn.addEventListener('click', () => {
        editingThemeId = null;
        document.getElementById('themeEditorTitle').textContent = 'Novo Tema';
        document.getElementById('themeName').value = '';
        document.getElementById('themeBg').value = '#ffffff';
        document.getElementById('themePrimary').value = '#7c3aed';
        document.getElementById('themeAccent').value = '#a78bfa';
        document.getElementById('themeTimerColor').value = '#4c1d95';
        document.getElementById('themeCardBg').value = '#f5f3ff';
        document.getElementById('themeEditor').classList.remove('hidden');
    });

    saveThemeBtn.addEventListener('click', () => {
        const name = document.getElementById('themeName').value.trim() || 'Sem Nome';
        const theme = themeManager.addTheme({
            name,
            bg: document.getElementById('themeBg').value,
            primary: document.getElementById('themePrimary').value,
            accent: document.getElementById('themeAccent').value,
            timerColor: document.getElementById('themeTimerColor').value,
            cardBg: document.getElementById('themeCardBg').value
        });
        document.getElementById('themeEditor').classList.add('hidden');
        themeManager.setActive(theme.id);
    });

    // Apply initial theme
    themeManager.apply(themeManager.activeThemeId);

    // Initial display
    updateDisplay(timer.remainingSeconds, timer.totalSeconds, timer.currentSession);
    updateDocumentTitle(timer.remainingSeconds);

    // FAB (mobile theme toggle)
    fabThemeBtn.addEventListener('click', () => {
        themePanel.classList.toggle('open');
    });

    closeThemePanel.addEventListener('click', () => {
        themePanel.classList.remove('open');
    });

    // Modal close handlers
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById(btn.dataset.modal).classList.add('hidden');
        });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.add('hidden');
            }
        });
    });

    document.querySelectorAll('[data-modal]').forEach(btn => {
        if (btn.classList.contains('modal-close')) return;
        btn.addEventListener('click', () => {
            document.getElementById(btn.dataset.modal).classList.add('hidden');
        });
    });
});