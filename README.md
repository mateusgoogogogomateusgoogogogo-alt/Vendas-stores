# MTGX Stores — pacote para hospedagem

## Execução

O arquivo principal da vitrine é `index.html`. A aplicação pode ser executada com FastAPI ou com o servidor Node opcional.

### FastAPI

Requer Python 3.11 ou superior:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
HOST=0.0.0.0 PORT=3000 python fastapi_server.py
```

O provedor deve encaminhar o domínio para a porta definida pela variável `PORT`. O servidor também pode ser iniciado pelo script `start.sh`.

### Banco de dados

O banco continua sendo **JSON**, armazenado em `data/store.json`. Faça backup desse arquivo antes de atualizações ou migrações. O servidor grava alterações de forma atômica para reduzir o risco de arquivo incompleto.

## Estrutura

- `index.html`: entrada da vitrine.
- `fastapi_server.py`: API FastAPI, arquivos estáticos, painel, estoque e persistência JSON.
- `requirements.txt`: dependências Python.
- `data/store.json`: banco de dados JSON.
- `public/`: assets e aplicação compilada.
- `server.mjs`: servidor Node opcional de compatibilidade.

## Endpoints principais

- `GET /api/health`
- `GET /api/store`
- `GET /api/products`
- `POST /api/tickets`
- `POST /api/leads`
- `POST /api/suggestions`
- `POST /api/stock-requests`
- `POST /api/admin/key/verify`
- `GET /api/admin/stats` com o header `x-admin-key`
- `GET /api/admin/inbox` com o header `x-admin-key`

O checkout registra o pedido e encaminha o cliente ao WhatsApp configurado no painel. Altere a Key administrativa antes de publicar a aplicação.
