# 🟢 NetPulse - Monitor de Rede
**Grupo Centroflora**

Monitor de rede em tempo real via ICMP, TCP e DNS. Roda localmente com Node.js puro, sem dependências externas. Suporte a múltiplas filiais.

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
├── hosts.json             # Hosts monitorados por filial
├── package.json           # Manifesto do projeto
├── NetPulse.bat           # Launcher Windows
├── NetPulse_PARAR.bat     # Para o servidor
├── LEIA-ME.txt            # Instruções para o usuário final
└── VERSION.md             # Histórico de versões
```

---

## ⚙️ Funcionalidades

- **Probes:** ICMP (ping), TCP Port Check, DNS Lookup
- **Múltiplas filiais** — hosts agrupados por unidade
- **Tempo real** via WebSocket puro (sem socket.io)
- **Persistência** automática em `hosts.json`
- **Pause/Resume** por host individual
- **Traceroute** por host
- **Histórico** de latência (300 pontos) e mudanças de status (50 eventos)
- **API REST** — `GET /api/hosts` e `GET /api/filiais`
- **Sem dependências externas** — apenas módulos nativos do Node.js

---

## 🏢 Filiais monitoradas

| Filial | Status |
|---|---|
| Parnaíba - PI | ✅ 21 hosts configurados |
| Botucatu - SP | 🔧 Aguardando cadastro |
| Campinas - SP | 🔧 Aguardando cadastro |
| Barueri - SP | 🔧 Aguardando cadastro |

---

## 🗺️ Roadmap

- [ ] Frontend com seções por filial (cards drag & drop)
- [ ] Alertas sonoros configuráveis (.wav / .mp3)
- [ ] Exportação de relatórios por filial
- [ ] Autenticação básica
- [ ] Notificações por e-mail ou Telegram

---

## 📌 Histórico de versões

| Versão | Data | Descrição |
|---|---|---|
| v3.1 | 31/03/2026 | Suporte a múltiplas filiais |
| v3.0 | 31/03/2026 | Versão inicial Parnaíba-PI |
