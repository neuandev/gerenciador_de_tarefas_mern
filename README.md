# Projeto_MERN_SGTA#

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
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
```
