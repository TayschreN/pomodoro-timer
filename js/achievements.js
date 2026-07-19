const ACHIEVEMENTS_KEY = 'pomodoroAchievements';

const ACHIEVEMENT_DEFS = [
    {
        id: 'first-pomodoro',
        name: 'Primeiro Passo',
        desc: 'Complete seu primeiro pomodoro de foco',
        icon: '🌟',
        check: (stats) => stats.totalFocus >= 1
    },
    {
        id: 'three-pomodoros',
        name: 'Aquecendo',
        desc: 'Complete 3 pomodoros de foco',
        icon: '📋',
        check: (stats) => stats.totalFocus >= 3
    },
    {
        id: 'five-pomodoros',
        name: 'Disciplina',
        desc: 'Complete 5 pomodoros de foco',
        icon: '🔥',
        check: (stats) => stats.totalFocus >= 5
    },
    {
        id: 'ten-pomodoros',
        name: 'Foco Total',
        desc: 'Complete 10 pomodoros de foco',
        icon: '⚡',
        check: (stats) => stats.totalFocus >= 10
    },
    {
        id: 'fifteen-pomodoros',
        name: 'Determinado',
        desc: 'Complete 15 pomodoros de foco',
        icon: '💫',
        check: (stats) => stats.totalFocus >= 15
    },
    {
        id: 'twentyfive-pomodoros',
        name: 'Máquina de Produtividade',
        desc: 'Complete 25 pomodoros de foco',
        icon: '🚀',
        check: (stats) => stats.totalFocus >= 25
    },
    {
        id: 'fifty-pomodoros',
        name: 'Lendário',
        desc: 'Complete 50 pomodoros de foco',
        icon: '🏆',
        check: (stats) => stats.totalFocus >= 50
    },
    {
        id: 'seventyfive-pomodoros',
        name: 'Foco Absoluto',
        desc: 'Complete 75 pomodoros de foco',
        icon: '🎖️',
        check: (stats) => stats.totalFocus >= 75
    },
    {
        id: 'hundred-pomodoros',
        name: 'Mestre do Tempo',
        desc: 'Complete 100 pomodoros de foco',
        icon: '👑',
        check: (stats) => stats.totalFocus >= 100
    },
    {
        id: 'first-subject',
        name: 'Organizado',
        desc: 'Adicione sua primeira matéria',
        icon: '📚',
        check: (stats) => stats.subjectCount >= 1
    },
    {
        id: 'three-subjects',
        name: 'Estudioso',
        desc: 'Cadastre 3 matérias diferentes',
        icon: '📗',
        check: (stats) => stats.subjectCount >= 3
    },
    {
        id: 'first-goal',
        name: 'Meta Alcançada',
        desc: 'Atinga a meta de pomodoros de uma matéria',
        icon: '🎯',
        check: (stats) => stats.goalsReached >= 1
    },
    {
        id: 'five-goals',
        name: 'Colecionador de Metas',
        desc: 'Atinga a meta de 5 matérias diferentes',
        icon: '🏅',
        check: (stats) => stats.goalsReached >= 5
    },
    {
        id: 'ten-goals',
        name: 'Metódico',
        desc: 'Atinga a meta de 10 matérias diferentes',
        icon: '🎯',
        check: (stats) => stats.goalsReached >= 10
    },
    {
        id: 'theme-creator',
        name: 'Artista',
        desc: 'Crie seu primeiro tema personalizado',
        icon: '🎨',
        check: (stats) => stats.customThemes >= 1
    },
    {
        id: 'five-themes',
        name: 'Designer',
        desc: 'Crie 5 temas personalizados',
        icon: '🖌️',
        check: (stats) => stats.customThemes >= 5
    },
    {
        id: 'streak-3',
        name: 'Consistente',
        desc: 'Mantenha uma sequência de 3 dias de estudo',
        icon: '📅',
        check: (stats) => stats.streak >= 3
    },
    {
        id: 'streak-7',
        name: 'Inabalável',
        desc: 'Mantenha uma sequência de 7 dias de estudo',
        icon: '💪',
        check: (stats) => stats.streak >= 7
    },
    {
        id: 'streak-14',
        name: 'Persistente',
        desc: 'Mantenha uma sequência de 14 dias de estudo',
        icon: '🔗',
        check: (stats) => stats.streak >= 14
    },
    {
        id: 'streak-30',
        name: 'Mestre da Rotina',
        desc: 'Mantenha uma sequência de 30 dias de estudo',
        icon: '🌟',
        check: (stats) => stats.streak >= 30
    },
    {
        id: 'hour-focused',
        name: 'Uma Hora',
        desc: 'Acumule 60 minutos de foco',
        icon: '⏱️',
        check: (stats) => stats.totalMinutes >= 60
    },
    {
        id: 'three-hours',
        name: 'Imersão',
        desc: 'Acumule 3 horas de foco',
        icon: '📖',
        check: (stats) => stats.totalMinutes >= 180
    },
    {
        id: 'five-hours',
        name: 'Dedicação',
        desc: 'Acumule 5 horas de foco',
        icon: '🎯',
        check: (stats) => stats.totalMinutes >= 300
    },
    {
        id: 'ten-hours',
        name: 'Maratona',
        desc: 'Acumule 10 horas de foco',
        icon: '🏃',
        check: (stats) => stats.totalMinutes >= 600
    },
    {
        id: 'twenty-hours',
        name: 'Viciado em Estudo',
        desc: 'Acumule 20 horas de foco',
        icon: '⏳',
        check: (stats) => stats.totalMinutes >= 1200
    },
    {
        id: 'perfect-day',
        name: 'Dia Perfeito',
        desc: 'Complete 8 pomodoros em um único dia',
        icon: '☀️',
        check: (stats) => stats.perfectDays >= 1
    },
    {
        id: 'first-longbreak',
        name: 'Recarregado',
        desc: 'Complete sua primeira pausa longa',
        icon: '🧘',
        check: (stats) => stats.longBreaks >= 1
    }
];

class AchievementManager {
    constructor() {
        this.unlocked = this.load();
    }

    load() {
        const stored = localStorage.getItem(ACHIEVEMENTS_KEY);
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
        localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(this.unlocked));
    }

    getUnlocked() {
        return ACHIEVEMENT_DEFS.filter(a => this.unlocked.includes(a.id));
    }

    getLocked() {
        return ACHIEVEMENT_DEFS.filter(a => !this.unlocked.includes(a.id));
    }

    getAll() {
        return ACHIEVEMENT_DEFS.map(a => ({
            ...a,
            unlocked: this.unlocked.includes(a.id)
        }));
    }

    check(stats) {
        const newUnlocks = [];
        ACHIEVEMENT_DEFS.forEach(a => {
            if (!this.unlocked.includes(a.id) && a.check(stats)) {
                this.unlocked.push(a.id);
                newUnlocks.push(a);
            }
        });
        if (newUnlocks.length > 0) {
            this.save();
        }
        return newUnlocks;
    }

    getTotalCount() {
        return ACHIEVEMENT_DEFS.length;
    }

    getUnlockedCount() {
        return this.unlocked.length;
    }

    reset() {
        this.unlocked = [];
        this.save();
    }
}