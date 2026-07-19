document.addEventListener('DOMContentLoaded', () => {
    const themeManager = new ThemeManager();
    const settingsManager = new SettingsManager();
    const subjectManager = new SubjectManager();
    const achievementManager = new AchievementManager();
    const timer = new Timer(settingsManager.getAll());

    const timerDisplay = document.getElementById('timerDisplay');
    const sessionLabel = document.getElementById('sessionLabel');
    const startBtn = document.getElementById('startBtn');
    const skipBtn = document.getElementById('skipBtn');
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
    const reportBtn = document.getElementById('reportBtn');
    const reportModal = document.getElementById('reportModal');
    const reportBody = document.getElementById('reportBody');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const achievementsBtn = document.getElementById('achievementsBtn');
    const achievementsModal = document.getElementById('achievementsModal');
    const achievementsBody = document.getElementById('achievementsBody');
    const sessionPomodorosDiv = document.getElementById('sessionPomodoros');

    const progressFill = document.querySelector('.progress-ring-fill');
    const CIRCUMFERENCE = 816.81;

    let notificationTimeout = null;
    let editingThemeId = null;
    let sessionPomodorosCount = 0;

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

    function updateSessionPomodoros() {
        const dots = sessionPomodorosDiv.querySelectorAll('.pomodoro-dot');
        dots.forEach((dot, i) => {
            if (i < sessionPomodorosCount) {
                dot.classList.add('completed');
            } else {
                dot.classList.remove('completed');
            }
        });
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

    function updateAchievements() {
        const report = subjectManager.getReport();
        const customThemes = themeManager.getAll().filter(t => !t.isDefault).length;
        const stats = {
            totalFocus: report.totalFocus,
            totalMinutes: report.totalMinutes,
            subjectCount: subjectManager.getAll().length,
            goalsReached: subjectManager.getAll().filter(s => s.completed >= s.target).length,
            customThemes: customThemes,
            streak: report.streak,
            perfectDays: report.perfectDays,
            longBreaks: report.longBreaks
        };
        const newAchievements = achievementManager.check(stats);
        newAchievements.forEach(a => {
            setTimeout(() => {
                showNotification(`🏆 Conquista desbloqueada: ${a.name}!`, true);
            }, 2000);
        });
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

    function renderReport() {
        const report = subjectManager.getReport();
        let html = '';

        const focusHours = Math.floor(report.totalMinutes / 60);
        const focusMins = report.totalMinutes % 60;
        const totalTimeStr = focusHours > 0 ? `${focusHours}h${focusMins}min` : `${focusMins}min`;

        html += `<div class="report-summary">
            <div class="report-stat">
                <span class="report-stat-value">${report.totalFocus}</span>
                <span class="report-stat-label">Pomodoros totais</span>
            </div>
            <div class="report-stat">
                <span class="report-stat-value">${totalTimeStr}</span>
                <span class="report-stat-label">Tempo focado</span>
            </div>
            <div class="report-stat">
                <span class="report-stat-value">${report.todaySessions}</span>
                <span class="report-stat-label">Pomodoros hoje</span>
            </div>
            <div class="report-stat">
                <span class="report-stat-value">${report.streak}</span>
                <span class="report-stat-label">Dias seguidos</span>
            </div>
        </div>`;

        html += `<div class="report-summary" style="margin-top:12px">
            <div class="report-stat">
                <span class="report-stat-value">${report.weekSessions}</span>
                <span class="report-stat-label">Esta semana</span>
            </div>
            <div class="report-stat">
                <span class="report-stat-value">${report.monthSessions}</span>
                <span class="report-stat-label">Este mês</span>
            </div>
            <div class="report-stat">
                <span class="report-stat-value">${report.avgPerDay}</span>
                <span class="report-stat-label">Média por dia</span>
            </div>
            <div class="report-stat">
                <span class="report-stat-value">${report.bestDay}</span>
                <span class="report-stat-label">Melhor dia</span>
            </div>
        </div>`;

        html += `<div class="report-summary" style="margin-top:12px">
            <div class="report-stat">
                <span class="report-stat-value">${report.totalBreaks}</span>
                <span class="report-stat-label">Pausas feitas</span>
            </div>
            <div class="report-stat">
                <span class="report-stat-value">${report.longBreaks}</span>
                <span class="report-stat-label">Pausas longas</span>
            </div>
            <div class="report-stat">
                <span class="report-stat-value">${report.perfectDays}</span>
                <span class="report-stat-label">Dias perfeitos</span>
            </div>
            <div class="report-stat">
                <span class="report-stat-value">${report.totalSessions}</span>
                <span class="report-stat-label">Sessões totais</span>
            </div>
        </div>`;

        if (report.bySubject.length > 0) {
            html += `<h3 style="margin:20px 0 12px;font-size:15px;color:var(--text)">Matérias estudadas</h3>`;
            html += `<div class="report-subjects">`;
            report.bySubject.forEach(s => {
                const hours = Math.floor(s.totalMinutes / 60);
                const mins = s.totalMinutes % 60;
                const timeStr = hours > 0 ? `${hours}h${mins}min` : `${mins}min`;
                html += `<div class="report-subject-item">
                    <div class="report-subject-name">${s.subjectName}</div>
                    <div class="report-subject-stats">
                        ${s.totalPomodoros} pomodoros · ${timeStr}
                    </div>
                </div>`;
            });
            html += `</div>`;
        }

        if (report.totalSessions === 0) {
            html += `<div style="text-align:center;padding:32px 0;color:var(--text-secondary);font-size:14px">
                Nenhum pomodoro registrado ainda. Complete alguns para ver seu relatório!
            </div>`;
        }

        reportBody.innerHTML = html;
    }

    function renderAchievements() {
        const all = achievementManager.getAll();
        const unlocked = achievementManager.getUnlockedCount();
        const total = achievementManager.getTotalCount();

        let html = `<div class="achievement-progress">
            <span class="achievement-progress-text">${unlocked} de ${total} conquistas</span>
            <div class="achievement-progress-bar">
                <div class="achievement-progress-fill" style="width:${(unlocked/total)*100}%"></div>
            </div>
        </div>`;

        html += `<div class="achievement-grid">`;
        all.forEach(a => {
            html += `<div class="achievement-card ${a.unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${a.icon}</div>
                <div class="achievement-info">
                    <span class="achievement-name">${a.name}</span>
                    <span class="achievement-desc">${a.desc}</span>
                </div>
                ${a.unlocked ? '<span class="achievement-check">✓</span>' : '<span class="achievement-lock">🔒</span>'}
            </div>`;
        });
        html += `</div>`;

        achievementsBody.innerHTML = html;
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
            sessionPomodorosCount++;
            updateSessionPomodoros();

            const subj = subjectManager.getActive();
            const subjName = subj ? subj.name : 'Sem Matéria';
            const duration = settingsManager.getAll().focus;
            subjectManager.logSession(
                subj ? subj.id : null,
                subjName,
                'focus',
                duration
            );

            const result = subjectManager.incrementActive();
            if (result) {
                updateSubjectDisplay();
                updateAchievements();
                if (result.reached) {
                    setTimeout(() => {
                        showNotification(`🎉 Parabéns! Você completou a meta de ${result.name}!`, true);
                    }, 1000);
                }
            } else {
                updateAchievements();
            }
        } else {
            const settings = settingsManager.getAll();
            const type = session === 'longBreak' ? 'longBreak' : 'shortBreak';
            const duration = session === 'longBreak' ? settings.longBreak : settings.shortBreak;
            subjectManager.logSession(null, 'Pausa', type, duration);
            if (session === 'longBreak') {
                updateAchievements();
            }
        }
    };

    timer.onSkip = (session) => {
        playNotification();
        showNotification('⏭ Pomodoro concluído!', false);
        startBtn.textContent = 'Iniciar';
        startBtn.classList.remove('running');

        if (session === 'focus') {
            sessionPomodorosCount++;
            updateSessionPomodoros();

            const subj = subjectManager.getActive();
            const subjName = subj ? subj.name : 'Sem Matéria';
            const duration = settingsManager.getAll().focus;
            subjectManager.logSession(
                subj ? subj.id : null,
                subjName,
                'focus',
                duration
            );

            const result = subjectManager.incrementActive();
            if (result) {
                updateSubjectDisplay();
                updateAchievements();
                if (result.reached) {
                    setTimeout(() => {
                        showNotification(`🎉 Parabéns! Você completou a meta de ${result.name}!`, true);
                    }, 1000);
                }
            } else {
                updateAchievements();
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

    // Skip
    skipBtn.addEventListener('click', () => {
        timer.skip();
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
    themeManager.onEditTheme = (themeId) => {
        editingThemeId = themeId;
        const theme = themeManager.getAll().find(t => t.id === themeId);
        if (!theme) return;
        document.getElementById('themeEditorTitle').textContent = 'Editar Tema';
        document.getElementById('themeName').value = theme.name;
        document.getElementById('themeBg').value = theme.bg;
        document.getElementById('themePrimary').value = theme.primary;
        document.getElementById('themeAccent').value = theme.accent;
        document.getElementById('themeTimerColor').value = theme.timerColor;
        document.getElementById('themeCardBg').value = theme.cardBg;
        document.getElementById('themeEditor').classList.remove('hidden');
    };

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
        const data = {
            name,
            bg: document.getElementById('themeBg').value,
            primary: document.getElementById('themePrimary').value,
            accent: document.getElementById('themeAccent').value,
            timerColor: document.getElementById('themeTimerColor').value,
            cardBg: document.getElementById('themeCardBg').value
        };

        if (editingThemeId) {
            themeManager.updateTheme(editingThemeId, data);
            document.getElementById('themeEditor').classList.add('hidden');
            if (themeManager.activeThemeId === editingThemeId) {
                themeManager.apply(editingThemeId);
            } else {
                themeManager.renderGrid();
            }
        } else {
            const theme = themeManager.addTheme(data);
            document.getElementById('themeEditor').classList.add('hidden');
            themeManager.setActive(theme.id);
        }
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
        updateAchievements();
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

    // Report
    reportBtn.addEventListener('click', () => {
        renderReport();
        reportModal.classList.remove('hidden');
    });

    clearHistoryBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja limpar todo o histórico de estudos?')) {
            subjectManager.clearHistory();
            renderReport();
            updateAchievements();
            showNotification('Histórico limpo!', false);
        }
    });

    // Achievements
    achievementsBtn.addEventListener('click', () => {
        renderAchievements();
        achievementsModal.classList.remove('hidden');
    });

    // Apply initial theme
    themeManager.apply(themeManager.activeThemeId);

    // Initial display
    updateDisplay(timer.remainingSeconds, timer.totalSeconds, timer.currentSession);
    updateDocumentTitle(timer.remainingSeconds);
    updateSubjectDisplay();
    updateSessionPomodoros();

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

    // Keyboard shortcut: space to toggle timer
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;
        if (e.key === ' ' || e.code === 'Space') {
            e.preventDefault();
            timer.toggle();
        }
    });
});