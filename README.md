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

---

## 📁 Estrutura do projeto

```text
gerenciador_de_tarefas_mern/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── taskController.js
│   │   │   └── userController.js
│   │   │
│   │   ├── models/
│   │   │   ├── Task.js
│   │   │   └── User.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   └── taskRoutes.js
│   │   │
│   │   ├── middlewares/
│   │   │   └── authMiddleware.js
│   │   │
│   │   └── server.js
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── Dockerfile
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Login.css
│   │   │   ├── Cadastro.jsx
│   │   │   ├── Cadastro.css
│   │   │   ├── Dashboard.jsx
│   │   │   └── Dashboard.css
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
├── docker-compose.yml
└── README.md
```


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
