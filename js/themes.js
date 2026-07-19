const DEFAULT_THEMES = [
    {
        id: 'lavanda',
        name: 'Lavanda',
        bg: '#faf5ff',
        primary: '#8b5cf6',
        accent: '#c4b5fd',
        timerColor: '#6d28d9',
        cardBg: '#ffffff',
        isDefault: true
    },
    {
        id: 'violeta-escuro',
        name: 'Violeta Escuro',
        bg: '#1e1b4b',
        primary: '#a78bfa',
        accent: '#8b5cf6',
        timerColor: '#ddd6fe',
        cardBg: '#2e1065',
        isDefault: true
    },
    {
        id: 'lilas-suave',
        name: 'Lilás Suave',
        bg: '#fdf4ff',
        primary: '#d946ef',
        accent: '#f0abfc',
        timerColor: '#86198f',
        cardBg: '#ffffff',
        isDefault: true
    },
    {
        id: 'amethyst',
        name: 'Amethyst',
        bg: '#f3e8ff',
        primary: '#7c3aed',
        accent: '#a78bfa',
        timerColor: '#5b21b6',
        cardBg: '#ffffff',
        isDefault: true
    }
];

const STORAGE_KEY = 'pomodoroThemes';
const ACTIVE_THEME_KEY = 'pomodoroActiveTheme';

class ThemeManager {
    constructor() {
        this.themes = this.loadThemes();
        this.activeThemeId = localStorage.getItem(ACTIVE_THEME_KEY) || 'lavanda';
        this.ensureDefaults();
    }

    loadThemes() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                return [];
            }
        }
        return [];
    }

    saveThemes() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.themes));
    }

    ensureDefaults() {
        const defaultIds = DEFAULT_THEMES.map(t => t.id);
        let changed = false;

        defaultIds.forEach(dt => {
            if (!this.themes.find(t => t.id === dt)) {
                this.themes.push({ ...dt });
                changed = true;
            }
        });

        if (!this.themes.find(t => t.id === this.activeThemeId)) {
            this.activeThemeId = 'lavanda';
            changed = true;
        }

        if (changed) {
            this.saveThemes();
            localStorage.setItem(ACTIVE_THEME_KEY, this.activeThemeId);
        }
    }

    getAll() {
        return this.themes;
    }

    getActive() {
        return this.themes.find(t => t.id === this.activeThemeId) || this.themes[0];
    }

    setActive(id) {
        if (this.themes.find(t => t.id === id)) {
            this.activeThemeId = id;
            localStorage.setItem(ACTIVE_THEME_KEY, id);
            this.apply(id);
            return true;
        }
        return false;
    }

    apply(id) {
        const theme = this.themes.find(t => t.id === id);
        if (!theme) return;

        const root = document.documentElement;
        root.style.setProperty('--bg', theme.bg);
        root.style.setProperty('--primary', theme.primary);
        root.style.setProperty('--accent', theme.accent);
        root.style.setProperty('--timer-color', theme.timerColor);
        root.style.setProperty('--card-bg', theme.cardBg);

        const borderColor = theme.isDefault
            ? this.lighten(theme.bg, -15)
            : this.blend(theme.cardBg, theme.primary, 0.12);

        root.style.setProperty('--border', borderColor);
        root.style.setProperty('--shadow', theme.primary + '1A');
        root.style.setProperty('--shadow-strong', theme.primary + '33');

        const textColor = this.getContrastColor(theme.bg);
        const textSecondary = this.getContrastColor(
            this.lighten(theme.bg, -8)
        );
        root.style.setProperty('--text', textColor);
        root.style.setProperty('--text-secondary', textSecondary);

        this.renderGrid();
    }

    getContrastColor(bg) {
        const hex = bg.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#1e1b4b' : '#f9fafb';
    }

    lighten(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, Math.max(0, (num >> 16) + amt));
        const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
        const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    blend(color1, color2, ratio) {
        const c1 = parseInt(color1.replace('#', ''), 16);
        const c2 = parseInt(color2.replace('#', ''), 16);
        const r = Math.round(((c1 >> 16) * (1 - ratio)) + ((c2 >> 16) * ratio));
        const g = Math.round((((c1 >> 8) & 0xFF) * (1 - ratio)) + (((c2 >> 8) & 0xFF) * ratio));
        const b = Math.round(((c1 & 0xFF) * (1 - ratio)) + ((c2 & 0xFF) * ratio));
        return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
    }

    addTheme(themeData) {
        const newTheme = {
            id: 'theme-' + Date.now(),
            name: themeData.name || 'Sem Nome',
            bg: themeData.bg || '#faf5ff',
            primary: themeData.primary || '#8b5cf6',
            accent: themeData.accent || '#c4b5fd',
            timerColor: themeData.timerColor || '#6d28d9',
            cardBg: themeData.cardBg || '#ffffff',
            isDefault: false
        };
        this.themes.push(newTheme);
        this.saveThemes();
        this.renderGrid();
        return newTheme;
    }

    deleteTheme(id) {
        const idx = this.themes.findIndex(t => t.id === id);
        if (idx === -1) return false;
        if (this.themes[idx].isDefault) return false;

        this.themes.splice(idx, 1);
        this.saveThemes();

        if (this.activeThemeId === id) {
            this.setActive('lavanda');
        } else {
            this.renderGrid();
        }
        return true;
    }

    renderGrid() {
        const grid = document.getElementById('themeGrid');
        if (!grid) return;

        grid.innerHTML = '';
        this.themes.forEach(theme => {
            const card = document.createElement('div');
            card.className = 'theme-card' + (theme.id === this.activeThemeId ? ' active' : '');
            card.dataset.themeId = theme.id;

            card.innerHTML = `
                <div class="theme-card-preview">
                    <span style="background:${theme.bg}"></span>
                    <span style="background:${theme.primary}"></span>
                    <span style="background:${theme.accent}"></span>
                    <span style="background:${theme.timerColor}"></span>
                    <span style="background:${theme.cardBg}"></span>
                </div>
                <span class="theme-card-name">${theme.name}</span>
                ${!theme.isDefault ? '<button class="delete-btn" title="Excluir tema">✕</button>' : ''}
            `;

            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-btn')) {
                    e.stopPropagation();
                    this.deleteTheme(theme.id);
                    return;
                }
                this.setActive(theme.id);
            });

            grid.appendChild(card);
        });
    }
}