# NetPulse - Centroflora v3.1

**Projeto:** NetPulse - Monitor de Rede  
**Cliente:** Grupo Centroflora  
**Versão:** 3.1  
**Data:** 31/03/2026

---

## Novidades na v3.1

- Campo `filial` adicionado a todos os hosts
- Suporte a múltiplas filiais: **Parnaíba - PI**, **Botucatu - SP**, **Campinas - SP**, **Barueri - SP**
- Nova ação WebSocket `add_filial` para criar filiais dinamicamente
- Nova rota `GET /api/filiais` retorna lista de filiais cadastradas
- Placeholders automáticos para filiais sem hosts (não fazem ping)
- Ao adicionar o primeiro host real de uma filial, o placeholder some automaticamente

---

## Arquivos do projeto

| Arquivo | Descrição |
|---|---|
| `server.js` | Servidor Node.js com WebSocket puro, suporte a filiais |
| `hosts.json` | 21 hosts de Parnaíba + placeholders de Botucatu, Campinas e Barueri |
| `package.json` | Manifesto v3.1.0 |
| `NetPulse.bat` | Launcher Windows |
| `NetPulse_PARAR.bat` | Para o servidor |
| `LEIA-ME.txt` | Instruções de uso |

---

## Filiais monitoradas

| Filial | Hosts |
|---|---|
| Parnaíba - PI | 21 hosts pré-configurados |
| Botucatu - SP | Aguardando cadastro |
| Campinas - SP | Aguardando cadastro |
| Barueri - SP | Aguardando cadastro |

---

## Roadmap

- [ ] Frontend com seções por filial (drag & drop)
- [ ] Alertas sonoros configuráveis
- [ ] Exportação de relatórios por filial
- [ ] Autenticação básica
- [ ] Notificações por e-mail ou Telegram

---

## Histórico de versões

| Versão | Data | Descrição |
|---|---|---|
| v3.1 | 31/03/2026 | Suporte a múltiplas filiais |
| v3.0 | 31/03/2026 | Versão inicial Parnaíba-PI |
