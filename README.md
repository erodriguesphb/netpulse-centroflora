# 🟢 NetPulse - Monitor de Rede
**Grupo Centroflora — Filial Parnaíba-PI**

Monitor de rede em tempo real via ICMP, TCP e DNS. Roda localmente com Node.js puro, sem dependências externas.

---

## 🚀 Como usar

### Requisito
- [Node.js LTS](https://nodejs.org) instalado

### Iniciar
1. Clone ou baixe o repositório
2. Dê duplo clique em **`NetPulse.bat`**
3. O navegador abre automaticamente em `http://localhost:8080`

### Parar
- Dê duplo clique em **`NetPulse_PARAR.bat`**

---

## 📁 Estrutura do projeto

```
netpulse/
├── server.js              # Servidor Node.js (HTTP + WebSocket puro)
├── hosts.json             # Hosts monitorados (salvo automaticamente)
├── package.json           # Manifesto do projeto
├── NetPulse.bat           # Launcher Windows
├── NetPulse_PARAR.bat     # Para o servidor
└── LEIA-ME.txt            # Instruções para o usuário final
```

---

## ⚙️ Funcionalidades

- **Probes:** ICMP (ping), TCP Port Check, DNS Lookup
- **Tempo real** via WebSocket puro (sem socket.io)
- **Persistência** automática em `hosts.json`
- **Pause/Resume** por host individual
- **Traceroute** por host
- **Histórico** de latência (300 pontos) e mudanças de status (50 eventos)
- **Alertas** de mudança de status (up/warn/down) em broadcast
- **Sem dependências externas** — apenas módulos nativos do Node.js

---

## 🖥️ Hosts monitorados (padrão)

| Categoria | Hosts |
|---|---|
| Rede | FIREWALL, SW-CORE, SW-ADMINISTRATIVO, SW-INDUSTRIAL, SW-ATROPINA |
| Servidores | PNB-AD, FILESERVER, NAS-SERVER |
| APs Wi-Fi | AP-ADM, AP-MANUTENÇÃO, AP-AUDITORIO, AP-LAB, AP-ARUBA SLTI |
| Impressoras | PRINT-ADM, PRINT-LAB, PRINT-MANUT, PRINT-RH, PRINT-COLOR |
| Outros | INTERNET, PONTO, IPHONE 16 |

---

## 🗺️ Roadmap

- [ ] Frontend `public/index.html` — cards drag & drop com status colorido
- [ ] Alertas sonoros configuráveis (.wav / .mp3)
- [ ] Exportação de relatórios
- [ ] Autenticação básica
- [ ] Notificações por e-mail ou Telegram

---

## 📌 Versão atual

`v3.0` — snapshot de 31/03/2026
