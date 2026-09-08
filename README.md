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

O banco continua sendo **JSON**, armazenado em `store.json`. Faça backup desse arquivo antes de atualizações ou migrações. O servidor grava alterações de forma atômica para reduzir o risco de arquivo incompleto.

## Estrutura

- `index.html`: entrada da vitrine.
- `fastapi_server.py`: API FastAPI, arquivos estáticos, painel, estoque e persistência JSON.
- `requirements.txt`: dependências Python.
- `store.json`: banco de dados JSON.
- a pasta única do pacote: assets e aplicação compilada.
- `server.mjs`: servidor Node opcional de compatibilidade.

## Atualização de interface

O pacote inclui `stability-pass.css` e `stability-pass.js`, carregados depois do build compilado. Essa camada corrige overflow horizontal, melhora alvos de toque, respeita áreas seguras de dispositivos móveis, transforma a navegação do Control Studio em uma barra rolável no celular e mantém formulários e listas fluidos em telas estreitas. No painel administrativo, efeitos decorativos e animações de entrada não podem mais ocultar conteúdo dinâmico. O dashboard também apresenta um estado visual honesto para o gráfico de interesses quando ainda não há registros, sem inventar valores.

O arquivo `profile-galaxy.js` adiciona a experiência visual galáctica ao modal do perfil verificado. No menu **Loja e perfil** do Control Studio é possível ativar ou desativar o efeito, controlar partículas, intensidade, velocidade e cor principal. As opções são salvas junto às configurações da loja em `store.json` e aplicadas também em dispositivos móveis.

O banner principal voltou a usar o `metal-waves.gif` original. O `banner-gif-pass.js` reaplica o GIF após as atualizações do carrossel para impedir que uma troca de slide substitua a animação por uma imagem estática.

Na seção **Equipe ADM**, o painel agora consulta um diretório de usuários e contatos da loja para seleção visual, com busca por nome, contato ou origem. O usuário escolhido pode ser promovido sem digitar Open ID manualmente; os procedimentos `admin.userDirectory`, `admin.admins` e `admin.addAdmin` cuidam da leitura e gravação. O cadastro de cada membro fica persistido em `store.json`; a chave principal do painel continua sendo o mecanismo de autenticação local desta versão.

As camadas `performance-pass.js` e `refinement-pass.css` reduzem o custo inicial de imagens abaixo da dobra, ativam decodificação assíncrona, adiam a pintura de seções longas e refinam os estados de foco, toque e seleção no mobile.

## Confirmação de pagamento e entrega

Na aba **Catálogo e estoque**, a área **Libere produtos pagos** permite escolher um produto, informar um link HTTP(S) ou caminho local de entrega e gerar quantos códigos forem necessários. O sistema armazena apenas o hash do código, mostra somente uma prévia no histórico e marca o código como usado de forma atômica no primeiro resgate. Uma segunda tentativa é recusada.

Na vitrine, o botão **Acessar produto** abre a validação pública. Depois de digitar o código recebido do ADM, o cliente recebe um token de acesso persistente no navegador e pode abrir o link do produto na área **Meus produtos liberados**. O código de confirmação é de uso único; o link de acesso gerado deve ser tratado como credencial e não deve ser compartilhado.

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
