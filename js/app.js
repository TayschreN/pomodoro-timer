document.addEventListener('DOMContentLoaded', () => {
    const themeManager = new ThemeManager();
    const settingsManager = new SettingsManager();
    const subjectManager = new SubjectManager();
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
    const subjectsBtn = document.getElementById('subjectsBtn');
    const subjectsModal = document.getElementById('subjectsModal');
    const subjectList = document.getElementById('subjectList');
    const addSubjectOpenBtn = document.getElementById('addSubjectOpenBtn');
    const addSubjectForm = document.getElementById('addSubjectForm');
    const addSubjectBtn = document.getElementById('addSubjectBtn');
    const subjectName = document.getElementById('subjectName');
    const subjectTarget = document.getElementById('subjectTarget');
    const activeSubject = document.getElementById('activeSubject');
    const noSubjectMsg = document.getElementById('noSubjectMsg');
    const subjectContent = document.getElementById('subjectContent');
    const subjectNameDisplay = document.getElementById('subjectNameDisplay');
    const subjectIcon = document.getElementById('subjectIcon');
    const subjectStats = document.getElementById('subjectStats');
    const subjectProgressFill = document.getElementById('subjectProgressFill');
    const subjectFaltam = document.getElementById('subjectFaltam');

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

    function showNotification(msg, isSuccess) {
        notificationMsg.textContent = msg;
        notification.classList.remove('hidden');
        if (isSuccess) {
            notification.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        } else {
            notification.style.background = '';
        }
        setTimeout(() => notification.classList.add('show'), 10);
        if (notificationTimeout) clearTimeout(notificationTimeout);
        notificationTimeout = setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.classList.add('hidden'), 300);
        }, 4500);
    }

    function updateDocumentTitle(remaining) {
        document.title = timer.isRunning
            ? timer.formatTime(remaining) + ' - Pomodoro Timer'
            : 'Pomodoro Timer';
    }

    function updateSubjectDisplay() {
        const subj = subjectManager.getActive();
        if (!subj) {
            noSubjectMsg.style.display = 'block';
            subjectContent.style.display = 'none';
            return;
        }
        noSubjectMsg.style.display = 'none';
        subjectContent.style.display = 'block';

        subjectNameDisplay.textContent = subj.name;
        subjectStats.textContent = `${subj.completed} de ${subj.target}`;

        const pct = subj.target > 0 ? Math.min(100, (subj.completed / subj.target) * 100) : 0;
        subjectProgressFill.style.width = pct + '%';

        const remaining = Math.max(0, subj.target - subj.completed);
        subjectFaltam.textContent = `faltam ${remaining} pomodoro${remaining !== 1 ? 's' : ''}`;

        const icons = ['📖', '🧮', '🔬', '✏️', '🗺️', '🎵', '💻', '📝', '🧠', '📚'];
        const iconIdx = subj.name.length % icons.length;
        subjectIcon.textContent = icons[iconIdx];
    }

    function renderSubjectList() {
        const subjects = subjectManager.getAll();
        const activeSubj = subjectManager.getActive();

        if (subjects.length === 0) {
            subjectList.innerHTML = `
                <div style="text-align:center;padding:24px 0;color:var(--text-secondary);font-size:14px">
                    Nenhuma matéria cadastrada ainda.
                </div>
            `;
            return;
        }

        subjectList.innerHTML = '';
        subjects.forEach(subj => {
            const item = document.createElement('div');
            const isActive = activeSubj && activeSubj.id === subj.id;
            item.className = 'subject-list-item' + (isActive ? ' active' : '');
            item.dataset.subjectId = subj.id;

            const remaining = Math.max(0, subj.target - subj.completed);
            const remainingText = remaining === 0 ? 'Concluída! 🎉' : `${subj.completed} feitos, faltam ${remaining}`;

            item.innerHTML = `
                <div class="subject-info">
                    <span class="subject-info-name">${subj.name}</span>
                    <span class="subject-info-stats">${remainingText}</span>
                </div>
                <div class="subject-actions">
                    <button class="subject-delete" title="Excluir matéria">✕</button>
                </div>
            `;

            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('subject-delete')) {
                    e.stopPropagation();
                    subjectManager.delete(subj.id);
                    renderSubjectList();
                    updateSubjectDisplay();
                    return;
                }
                subjectManager.setActive(subj.id);
                renderSubjectList();
                updateSubjectDisplay();
            });

            subjectList.appendChild(item);
        });
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
        showNotification(labels[session] || 'Tempo esgotado!', false);
        startBtn.textContent = 'Iniciar';
        startBtn.classList.remove('running');

        if (session === 'focus') {
            const result = subjectManager.incrementActive();
            if (result) {
                updateSubjectDisplay();
                if (result.reached) {
                    setTimeout(() => {
                        showNotification(`🎉 Parabéns! Você completou a meta de ${result.name}!`, true);
                    }, 1000);
                }
            }
        }
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

    settingsManager.onChange = (settings) => {
        timer.updateSettings(settings);
        updateDisplay(timer.remainingSeconds, timer.totalSeconds, timer.currentSession);
    };

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
        document.getElementById('settingsModal').classList.add('hidden');
    });

    // Theme editor
    newThemeBtn.addEventListener('click', () => {
        editingThemeId = null;
        document.getElementById('themeEditorTitle').textContent = 'Novo Tema';
        document.getElementById('themeName').value = '';
        document.getElementById('themeBg').value = '#faf5ff';
        document.getElementById('themePrimary').value = '#8b5cf6';
        document.getElementById('themeAccent').value = '#c4b5fd';
        document.getElementById('themeTimerColor').value = '#6d28d9';
        document.getElementById('themeCardBg').value = '#ffffff';
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

    // Subjects
    subjectManager.onChange = () => {
        updateSubjectDisplay();
    };

    subjectsBtn.addEventListener('click', () => {
        renderSubjectList();
        subjectsModal.classList.remove('hidden');
    });

    addSubjectOpenBtn.addEventListener('click', () => {
        addSubjectOpenBtn.style.display = 'none';
        addSubjectForm.style.display = 'flex';
        addSubjectForm.style.flexDirection = 'column';
        addSubjectForm.style.gap = '12px';
        subjectName.focus();
    });

    function addSubject() {
        const name = subjectName.value.trim();
        if (!name) {
            showNotification('Digite um nome para a matéria', false);
            return;
        }
        subjectManager.add(name, subjectTarget.value);
        subjectName.value = '';
        subjectTarget.value = '30';
        addSubjectForm.style.display = 'none';
        addSubjectOpenBtn.style.display = 'block';
        renderSubjectList();
        updateSubjectDisplay();
    }

    addSubjectBtn.addEventListener('click', addSubject);

    subjectName.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addSubject();
    });

    activeSubject.addEventListener('click', () => {
        if (subjectManager.getAll().length > 0) {
            renderSubjectList();
            subjectsModal.classList.remove('hidden');
        } else {
            subjectsBtn.click();
        }
    });

    // Apply initial theme
    themeManager.apply(themeManager.activeThemeId);

    // Initial display
    updateDisplay(timer.remainingSeconds, timer.totalSeconds, timer.currentSession);
    updateDocumentTitle(timer.remainingSeconds);
    updateSubjectDisplay();

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
            if (btn.dataset.modal === 'subjectsModal') {
                addSubjectForm.style.display = 'none';
                addSubjectOpenBtn.style.display = 'block';
            }
        });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.add('hidden');
                if (overlay.id === 'subjectsModal') {
                    addSubjectForm.style.display = 'none';
                    addSubjectOpenBtn.style.display = 'block';
                }
            }
        });
    });

    document.querySelectorAll('[data-modal]').forEach(btn => {
        if (btn.classList.contains('modal-close')) return;
        btn.addEventListener('click', () => {
            document.getElementById(btn.dataset.modal).classList.add('hidden');
        });
    });

    // Keyboard shortcut: space to toggle timer
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;
        if (e.key === ' ' || e.code === 'Space') {
            e.preventDefault();
            timer.toggle();
        }
    });
});