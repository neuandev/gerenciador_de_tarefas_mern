# Projeto_MERN_SGTA

Sistema web de gerenciamento de tarefas desenvolvido com a stack MERN, utilizando autenticação de usuários com JWT e banco de dados MongoDB.

O projeto permite que cada usuário crie, visualize, edite e exclua suas próprias tarefas de forma autenticada.

---

## 📌 Sobre o projeto

O **Gerenciador de Tarefas MERN** foi desenvolvido como projeto acadêmico para aplicação prática de conceitos de desenvolvimento web, APIs REST, autenticação, banco de dados e segurança.

O sistema possui:

- Cadastro de usuários;
- Login com autenticação;
- Criação de tarefas;
- Listagem de tarefas do usuário autenticado;
- Edição de tarefas;
- Exclusão de tarefas;
- Organização das tarefas em dashboards;
- Reordenação persistente das tarefas por arrastar e soltar;
- Alteração do status da tarefa;
- Proteção das rotas com JWT;
- Senhas armazenadas utilizando hash com bcrypt;
- Validação de dados;
- Interface web desenvolvida com React.

---

## 🚀 Tecnologias utilizadas

### Backend

- Node.js
- Express
- MongoDB
- MongoDB Atlas
- Mongoose
- JWT (JSON Web Token)
- bcrypt
- CORS
- dotenv
- Nodemon

### Frontend

- React
- Vite
- React Router DOM
- Axios
- HTML
- CSS
- JavaScript

### Ferramentas

- Visual Studio Code
- Git
- GitHub
- Thunder Client
- MongoDB Atlas
- Docker
- Docker Compose

---

## 📁 Estrutura do projeto

```text
gerenciador_de_tarefas_mern/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── dashboardController.js
│   │   │   ├── taskController.js
│   │   │   └── userController.js
│   │   ├── models/
│   │   │   ├── Dashboard.js
│   │   │   ├── Task.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   └── taskRoutes.js
│   │   ├── middlewares/
│   │   │   └── authMiddleware.js
│   │   └── server.js
│   ├── .env.example
│   ├── .gitignore
│   ├── Dockerfile
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   └── ...
│
├── docker-compose.yml
└── README.md
```

---

## 🐳 Atividade prática: MongoDB com Docker

O banco de dados MongoDB pode ser executado em um contêiner Docker, utilizando a imagem oficial `mongo:6`. O Docker Compose mantém o MongoDB acessível apenas pela rede interna do Compose e utiliza o volume nomeado `dados` para preservar os registros mesmo após a recriação do contêiner.

### Pré-requisitos

- Docker Desktop instalado e com o mecanismo em execução;
- Node.js e NPM instalados;
- Visual Studio Code ou outro editor;
- Arquivo de ambiente configurado.

### 1. Configurar as variáveis de ambiente

Na pasta `backend`, copie o arquivo de exemplo para criar seu arquivo local:

```bash
cp backend/.env.example backend/.env
```

No Windows PowerShell, se preferir:

```powershell
Copy-Item backend/.env.example backend/.env
```

Abra `backend/.env` e configure uma chave JWT própria com pelo menos 32 caracteres. Para executar a API diretamente no computador, mantenha a URI:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/trabalho_final
JWT_SECRET=sua_chave_secreta_com_mais_de_32_caracteres
```

Não envie o arquivo `.env` ao GitHub. Ele está listado no `.gitignore`.

### 1.1 Alternar entre MongoDB local (Docker) e MongoDB Atlas

O projeto mantém suporte aos dois ambientes sem remover a configuração do Atlas:

- **API executada diretamente no computador:** use uma instância MongoDB instalada localmente ou uma URI do MongoDB Atlas no `backend/.env`. O MongoDB iniciado pelo Compose não publica a porta `27017` no computador; portanto, não fica acessível por `localhost:27017`.
- **API executada diretamente no computador com MongoDB Atlas:** substitua o valor de `MONGODB_URI` pela string de conexão fornecida pelo MongoDB Atlas. Mantenha usuário e senha apenas no arquivo local `.env`, nunca no GitHub.
- **API executada pelo Docker Compose:** o serviço `backend` recebe automaticamente `MONGODB_URI=mongodb://mongo:27017/trabalho_final`, pois dentro da rede Docker o banco é acessado pelo nome do serviço `mongo`.

Assim, a URI definida no Compose só vale para o contêiner do back-end; ao executar `npm run dev` localmente, a aplicação utiliza a URI configurada no seu `backend/.env`.

### 2. Iniciar o MongoDB com Docker Compose

Na raiz do repositório, execute:

```bash
docker compose up -d mongo
```

Para iniciar os serviços do projeto (MongoDB, back-end e front-end) em conjunto, depois de configurar o arquivo `.env`, utilize:

```bash
docker compose up -d
```

Verifique os contêineres:

```bash
docker compose ps
```

O serviço MongoDB utiliza:

- Imagem: `mongo:6`;
- Porta interna do contêiner: `27017` (não publicada no computador);
- Volume persistente: `dados`;
- Verificação de saúde para que o back-end aguarde o banco ficar pronto.

Quando o back-end é executado dentro do Docker Compose, a URI é definida como `mongodb://mongo:27017/trabalho_final`, usando o nome do serviço na rede interna. Quando a API é executada diretamente no computador com `npm run dev`, configure no `.env` uma instância MongoDB local que esteja instalada e em execução ou uma URI do MongoDB Atlas.

### 3. Conexão com Mongoose

O projeto já utiliza Mongoose e dotenv como dependências. A conexão foi organizada em `backend/src/config/database.js`, e o servidor importa essa função antes de iniciar a API.

Para executar a API diretamente no computador, abra um terminal na pasta `backend` e execute:

```bash
npm install
npm run dev
```

Aguarde as mensagens de conexão com o MongoDB e de inicialização do servidor.

### 4. Encerrar o ambiente

Para parar os serviços e remover os contêineres e a rede:

```bash
docker compose down
```

O volume nomeado `dados` é preservado. Não utilize `docker compose down -v` se quiser manter os registros armazenados.

Para iniciar novamente:

```bash
docker compose up -d
```

### Persistência dos dados

Os dados do MongoDB ficam armazenados no volume Docker `dados`, montado em `/data/db` dentro do contêiner. Assim, reiniciar ou recriar o contêiner sem remover o volume não apaga os registros.

---

## 🎨 Atividade prática: Design e Componentização Front-end com IA

Foi adicionada uma página demonstrativa de gerenciamento de tarefas para a atividade de componentização em React. Ela pode ser acessada em:

`http://localhost:5173/atividade-frontend`

### Componentes desenvolvidos

- `ActivityHeader.jsx`: cabeçalho da aplicação.
- `ActivitySidebar.jsx`: navegação e filtros por status.
- `TaskCard.jsx`: cartão reutilizável para cada tarefa.
- `AtividadeFrontend.jsx`: página principal, estado React, filtros, busca e indicadores.
- `AtividadeFrontend.css`: estilos responsivos da página.

### Dados simulados e React

A página utiliza um array local com seis tarefas, armazenado no estado com `useState`. A renderização dinâmica utiliza `.map()` e a propriedade `key={task.id}`. Os filtros, a busca e a conclusão das tarefas atualizam a interface sem depender do back-end.

### Como executar

No terminal:

```bash
cd frontend
npm install
npm run dev
```

Acesse a rota `/atividade-frontend` no endereço indicado pelo Vite.

### Prompts preparados para a atividade

Os textos abaixo são os prompts de referência preparados para documentar o processo conforme foi instruído nas aulas. Eles devem ser utilizados/adaptados nas ferramentas de prototipagem e geração visual e podem ser ajustados conforme o resultado real obtido pela dupla.

**Prompt para Galileo AI**

> Crie uma interface web desktop e responsiva para um gerenciador de tarefas chamado TaskFlow. O público é formado por estudantes e equipes pequenas. Utilize um visual moderno, limpo e profissional, com fundo cinza muito claro, cartões brancos, detalhes em roxo/índigo, cantos arredondados e tipografia sem serifa. A tela deve conter um cabeçalho com marca e avatar, uma barra lateral com filtros Todas as tarefas, Em andamento e Concluídas, uma área principal com saudação, data, cartões de resumo (total, em andamento e concluídas), barra de progresso geral e uma grade de cartões de tarefas. Cada cartão deve exibir categoria, título, descrição, responsável, data e status. Priorize hierarquia visual, legibilidade, espaçamento consistente e adaptação para dispositivos móveis.

**Prompt para v0 da Vercel**

> Desenvolva uma página React funcional chamada TaskFlow usando JavaScript e CSS responsivo, dividida em componentes independentes: ActivityHeader, ActivitySidebar e TaskCard. A página principal deve manter seis tarefas de exemplo em um estado useState, cada uma com id, title, description, category, owner, initials, date e status. Renderize os cartões com tasks.map e key={task.id}. Implemente filtros para todas, pendentes e concluídas, campo de busca por título/descrição/responsável, indicadores de quantidade e barra de progresso. Adicione um botão em cada cartão para alternar entre pendente e concluída, atualizando o estado sem recarregar a página. Use componentes reutilizáveis, HTML semântico, acessibilidade básica e layout responsivo. Não conecte a API nesta demonstração: utilize somente dados simulados locais.

### Captura de tela

Após executar a aplicação, adicione uma captura real da página em `docs/screenshots/atividade-frontend.png` e inclua-a abaixo:

`![Interface TaskFlow](docs/screenshots/atividade-frontend.png)`

> Observação: a captura deve ser gerada após executar e conferir a interface localmente. Os prompts acima estão documentados como referências preparadas; substitua-os caso a dupla utilize versões diferentes nas ferramentas.
