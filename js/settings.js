const SETTINGS_KEY = 'pomodoroSettings';

const DEFAULT_SETTINGS = {
    focus: 25,
    shortBreak: 5,
    longBreak: 15
};

class SettingsManager {
    constructor() {
        this.settings = this.load();
        this.onChange = null;
    }

    load() {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                return {
                    focus: parsed.focus || DEFAULT_SETTINGS.focus,
                    shortBreak: parsed.shortBreak || DEFAULT_SETTINGS.shortBreak,
                    longBreak: parsed.longBreak || DEFAULT_SETTINGS.longBreak
                };
            } catch {
                return { ...DEFAULT_SETTINGS };
            }
        }
        return { ...DEFAULT_SETTINGS };
    }

    save() {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    }

    getAll() {
        return { ...this.settings };
    }

    update(data) {
        this.settings.focus = parseInt(data.focus) || DEFAULT_SETTINGS.focus;
        this.settings.shortBreak = parseInt(data.shortBreak) || DEFAULT_SETTINGS.shortBreak;
        this.settings.longBreak = parseInt(data.longBreak) || DEFAULT_SETTINGS.longBreak;
        this.save();
        if (this.onChange) {
            this.onChange(this.getAll());
        }
    }

    populateForm() {
        document.getElementById('focusTime').value = this.settings.focus;
        document.getElementById('shortBreakTime').value = this.settings.shortBreak;
        document.getElementById('longBreakTime').value = this.settings.longBreak;
    }
}