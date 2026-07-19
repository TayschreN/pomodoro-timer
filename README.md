# 🍅 Pomodoro Timer — Meraki

Um timer Pomodoro elegante e completo, desenvolvido com carinho (meraki) para ajudar você a manter o foco nos estudos.

![Screenshot do Pomodoro Timer](screenshot.png)

## ✨ Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| ⏱️ **Timer Pomodoro** | Ciclos de Foco, Pausa Curta e Pausa Longa com durações ajustáveis |
| 📚 **Matérias** | Cadastre matérias com metas de pomodoros; o contador avança automaticamente a cada foco concluído |
| 🎨 **Temas** | 4 temas pré-instalados + editor para criar seus próprios temas com 5 cores personalizáveis |
| 🏆 **Conquistas** | 16 conquistas desbloqueáveis que motivam sua rotina de estudos |
| 📊 **Relatório** | Estatísticas detalhadas: pomodoros por matéria, tempo focado, streak de dias e mais |
| ⏭️ **Pular** | Pule o pomodoro atual — ainda assim contabilizado como concluído |
| 🔔 **Notificações** | Som e aviso visual ao final de cada sessão |
| 💾 **Persistência** | Temas, matérias, histórico e conquistas salvos automaticamente no navegador |

## 🚀 Como usar

1. Abra o arquivo `index.html` no navegador
2. Escolha um tema no painel lateral (🎨 no celular)
3. Cadastre suas matérias clicando em **📚 Matérias**
4. Ajuste as durações nas **Configurações** (⚙)
5. Selecione uma matéria e clique em **Iniciar**

## 🎯 Conquistas

| Emblema | Nome | Requisito |
|---|---|---|
| 🌟 | Primeiro Passo | 1 pomodoro |
| 🔥 | Disciplina | 5 pomodoros |
| ⚡ | Foco Total | 10 pomodoros |
| 🚀 | Máquina de Produtividade | 25 pomodoros |
| 🏆 | Lendário | 50 pomodoros |
| 👑 | Mestre do Tempo | 100 pomodoros |
| 📅 | Consistente | 3 dias seguidos |
| 💪 | Inabalável | 7 dias seguidos |
| 🌟 | Mestre da Rotina | 30 dias seguidos |
| 🎯 | Meta Alcançada | 1 meta batida |
| 🎨 | Artista | 1 tema criado |
| e mais... | | |

## 🛠️ Tecnologia

- HTML5 + CSS3 (design responsivo com variáveis CSS e animações)
- JavaScript puro (sem dependências externas)
- `localStorage` para persistência de dados
- Web Audio API para notificação sonora

## 📁 Estrutura do projeto

```
pomodoro-timer/
├── index.html          # Estrutura principal
├── css/
│   └── style.css       # Estilos com variáveis CSS
├── js/
│   ├── app.js          # Orquestração principal
│   ├── timer.js        # Lógica do cronômetro
│   ├── themes.js       # Gerenciamento de temas
│   ├── subjects.js     # Gerenciamento de matérias e histórico
│   ├── settings.js     # Configurações de duração
│   └── achievements.js # Sistema de conquistas
├── assets/
│   └── logo-meraki.png # Logotipo Meraki
├── screenshot.png
├── .gitignore
└── README.md
```

## 📄 Licença

MIT
