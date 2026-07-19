const SUBJECTS_KEY = 'pomodoroSubjects';
const ACTIVE_SUBJECT_KEY = 'pomodoroActiveSubject';

class SubjectManager {
    constructor() {
        this.subjects = this.load();
        this.activeSubjectId = localStorage.getItem(ACTIVE_SUBJECT_KEY);
        this.onChange = null;
    }

    load() {
        const stored = localStorage.getItem(SUBJECTS_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                return [];
            }
        }
        return [];
    }

    save() {
        localStorage.setItem(SUBJECTS_KEY, JSON.stringify(this.subjects));
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
}