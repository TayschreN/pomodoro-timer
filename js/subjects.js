const SUBJECTS_KEY = 'pomodoroSubjects';
const ACTIVE_SUBJECT_KEY = 'pomodoroActiveSubject';
const HISTORY_KEY = 'pomodoroHistory';

class SubjectManager {
    constructor() {
        this.subjects = this.load();
        this.history = this.loadHistory();
        this.activeSubjectId = localStorage.getItem(ACTIVE_SUBJECT_KEY);
        this.onChange = null;
    }

    load() {
        const stored = localStorage.getItem(SUBJECTS_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) return parsed;
            } catch {
            }
        }
        return [];
    }

    save() {
        localStorage.setItem(SUBJECTS_KEY, JSON.stringify(this.subjects));
    }

    loadHistory() {
        const stored = localStorage.getItem(HISTORY_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) return parsed;
            } catch {
            }
        }
        return [];
    }

    saveHistory() {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(this.history));
    }

    getAll() {
        return [...this.subjects];
    }

    getActive() {
        if (!this.activeSubjectId) return null;
        return this.subjects.find(s => s.id === this.activeSubjectId) || null;
    }

    setActive(id) {
        if (!id || this.subjects.find(s => s.id === id)) {
            this.activeSubjectId = id;
            localStorage.setItem(ACTIVE_SUBJECT_KEY, id);
            if (this.onChange) this.onChange();
            return true;
        }
        return false;
    }

    add(name, target) {
        const subject = {
            id: 'subj-' + Date.now(),
            name: name.trim() || 'Sem Nome',
            target: Math.max(1, parseInt(target) || 10),
            completed: 0
        };
        this.subjects.push(subject);
        this.save();
        this.setActive(subject.id);
        return subject;
    }

    delete(id) {
        const idx = this.subjects.findIndex(s => s.id === id);
        if (idx === -1) return false;
        this.subjects.splice(idx, 1);
        this.save();
        if (this.activeSubjectId === id) {
            const next = this.subjects.length > 0 ? this.subjects[0].id : null;
            this.setActive(next);
        } else {
            if (this.onChange) this.onChange();
        }
        return true;
    }

    incrementActive() {
        if (!this.activeSubjectId) return null;
        const subj = this.subjects.find(s => s.id === this.activeSubjectId);
        if (!subj) return null;
        subj.completed = (subj.completed || 0) + 1;
        this.save();
        if (this.onChange) this.onChange();

        if (subj.completed >= subj.target) {
            return { reached: true, name: subj.name };
        }
        return { reached: false, name: subj.name };
    }

    getRemaining(id) {
        const subj = this.subjects.find(s => s.id === id);
        if (!subj) return 0;
        return Math.max(0, subj.target - subj.completed);
    }

    logSession(subjectId, subjectName, type, durationMinutes) {
        this.history.push({
            id: 'log-' + Date.now(),
            subjectId: subjectId || 'none',
            subjectName: subjectName || 'Sem Matéria',
            type: type,
            duration: durationMinutes,
            completedAt: new Date().toISOString()
        });
        this.saveHistory();
    }

    getReport() {
        const totalSessions = this.history.length;
        const focusSessions = this.history.filter(h => h.type === 'focus');
        const breakSessions = this.history.filter(h => h.type === 'shortBreak' || h.type === 'longBreak');
        const longBreaks = this.history.filter(h => h.type === 'longBreak').length;
        const totalFocus = focusSessions.length;
        const totalMinutes = focusSessions.reduce((sum, h) => sum + h.duration, 0);

        const today = new Date().toDateString();
        const todayFocus = focusSessions.filter(
            h => new Date(h.completedAt).toDateString() === today
        );

        const todayMinutes = todayFocus.reduce((sum, h) => sum + h.duration, 0);

        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekFocus = focusSessions.filter(
            h => new Date(h.completedAt) >= weekStart
        );

        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthFocus = focusSessions.filter(
            h => new Date(h.completedAt) >= monthStart
        );

        const bySubject = {};
        focusSessions.forEach(h => {
            const key = h.subjectId || 'none';
            if (!bySubject[key]) {
                bySubject[key] = {
                    subjectId: key,
                    subjectName: h.subjectName || 'Sem Matéria',
                    totalPomodoros: 0,
                    totalMinutes: 0
                };
            }
            bySubject[key].totalPomodoros++;
            bySubject[key].totalMinutes += h.duration;
        });

        const streak = this.calculateStreak();

        const focusByDay = {};
        focusSessions.forEach(h => {
            const day = new Date(h.completedAt).toDateString();
            focusByDay[day] = (focusByDay[day] || 0) + 1;
        });
        const perfectDays = Object.values(focusByDay).filter(c => c >= 8).length;

        const avgPerDay = focusByDay.length > 0
            ? (totalFocus / focusByDay.length).toFixed(1)
            : '0';

        const bestDay = focusByDay.length > 0
            ? Math.max(...Object.values(focusByDay))
            : 0;

        return {
            totalSessions,
            totalFocus,
            totalMinutes,
            todaySessions: todayFocus.length,
            todayMinutes,
            weekSessions: weekFocus.length,
            monthSessions: monthFocus.length,
            totalBreaks: breakSessions.length,
            longBreaks,
            bySubject: Object.values(bySubject).sort((a, b) => b.totalPomodoros - a.totalPomodoros),
            streak,
            perfectDays,
            avgPerDay: parseFloat(avgPerDay),
            bestDay
        };
    }

    calculateStreak() {
        const focusSessions = this.history
            .filter(h => h.type === 'focus')
            .map(h => new Date(h.completedAt).toDateString())
            .sort((a, b) => new Date(b) - new Date(a));

        if (focusSessions.length === 0) return 0;

        const uniqueDays = [...new Set(focusSessions)].sort((a, b) => new Date(b) - new Date(a));

        let streak = 1;
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) {
            return 0;
        }

        for (let i = 1; i < uniqueDays.length; i++) {
            const prev = new Date(uniqueDays[i - 1]);
            const curr = new Date(uniqueDays[i]);
            const diffDays = (prev - curr) / 86400000;
            if (diffDays <= 1.5) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    clearHistory() {
        this.history = [];
        this.saveHistory();
    }
}