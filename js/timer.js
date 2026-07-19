class Timer {
    constructor(settings) {
        this.settings = { ...settings };
        this.currentSession = 'focus';
        this.totalSeconds = this.settings.focus * 60;
        this.remainingSeconds = this.totalSeconds;
        this.isRunning = false;
        this.interval = null;

        this.onTick = null;
        this.onComplete = null;
        this.onStateChange = null;
    }

    setSession(session) {
        if (!['focus', 'shortBreak', 'longBreak'].includes(session)) return;
        this.stop();
        this.currentSession = session;
        this.totalSeconds = this.settings[session] * 60;
        this.remainingSeconds = this.totalSeconds;
        if (this.onTick) this.onTick(this.remainingSeconds, this.totalSeconds, this.currentSession);
        if (this.onStateChange) this.onStateChange('stopped');
    }

    updateSettings(settings) {
        this.settings = { ...settings };
        if (!this.isRunning) {
            this.totalSeconds = this.settings[this.currentSession] * 60;
            this.remainingSeconds = this.totalSeconds;
            if (this.onTick) this.onTick(this.remainingSeconds, this.totalSeconds, this.currentSession);
        }
    }

    start() {
        if (this.isRunning) return;
        if (this.remainingSeconds <= 0) {
            this.reset();
        }
        this.isRunning = true;
        if (this.onStateChange) this.onStateChange('running');
        this.interval = setInterval(() => {
            this.remainingSeconds--;
            if (this.onTick) {
                this.onTick(this.remainingSeconds, this.totalSeconds, this.currentSession);
            }
            if (this.remainingSeconds <= 0) {
                this.complete();
            }
        }, 1000);
    }

    pause() {
        if (!this.isRunning) return;
        this.isRunning = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        if (this.onStateChange) this.onStateChange('paused');
    }

    stop() {
        this.isRunning = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    reset() {
        this.stop();
        this.remainingSeconds = this.totalSeconds;
        if (this.onTick) this.onTick(this.remainingSeconds, this.totalSeconds, this.currentSession);
        if (this.onStateChange) this.onStateChange('stopped');
    }

    complete() {
        this.stop();
        if (this.onTick) this.onTick(0, this.totalSeconds, this.currentSession);
        if (this.onComplete) this.onComplete(this.currentSession);
        if (this.onStateChange) this.onStateChange('completed');
    }

    toggle() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.start();
        }
    }

    getSessionLabel(session) {
        const labels = {
            focus: 'Foco',
            shortBreak: 'Pausa Curta',
            longBreak: 'Pausa Longa'
        };
        return labels[session] || 'Foco';
    }

    formatTime(seconds) {
        const m = Math.max(0, Math.floor(seconds / 60));
        const s = Math.max(0, Math.floor(seconds % 60));
        return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    getProgress() {
        if (this.totalSeconds <= 0) return 100;
        return ((this.totalSeconds - this.remainingSeconds) / this.totalSeconds) * 100;
    }

    destroy() {
        this.stop();
        this.onTick = null;
        this.onComplete = null;
        this.onStateChange = null;
    }
}

function playNotification() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const now = audioCtx.currentTime;

        [523.25, 659.25, 783.99].forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.4, now + i * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);
            osc.start(now + i * 0.12);
            osc.stop(now + i * 0.12 + 0.4);
        });
    } catch {
    }
}