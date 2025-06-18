# 🧠 ChatCraftAI

**ChatCraftAI** is a full-stack AI-powered real-time chat application with 1:1 and group messaging, typing indicators, grammar correction, conversation summaries, and AI-suggested replies. Built with **Next.js**, **Express.js**, **PostgreSQL**, **Prisma**, **Socket.IO**, and Docker.

---

## 🚀 Features

- ✅ Real-time chat with Socket.IO  
- ✅ One-to-One and Group chat support  
- ✅ Typing indicators  
- ✅ AI-powered smart replies (🤖 button)  
- ✅ Live grammar suggestions  
- ✅ Conversation summaries & sentiment detection  
- ✅ JWT-based auth (login/register)  
- ✅ User profile with avatar & display name  
- ✅ Fully Dockerized

---

## 📦 Tech Stack

| Layer       | Tech                                      |
|------------|-------------------------------------------|
| Frontend   | React, Next.js 14 (App Router)            |
| Backend    | Express.js, Socket.IO, Prisma             |
| Database   | PostgreSQL                                |
| Auth       | JWT (Access + Refresh Tokens)             |
| AI Helpers | OpenAI / Custom AI Endpoints              |
| DevOps     | Docker & Docker Compose                   |

---

## ⚙️ Setup (Local)

### 1. Clone the Repo

```bash
git clone https://github.com/s-mujtaba-haider/ChatCraftAI.git
cd ChatCraftAI
````

### 2. Configure Environment

Create `.env` files for `backend/.env` and `frontend/.env.local`. Example for backend:

```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/chatcraftai
JWT_SECRET=your_secret_here
```

Frontend can use cookies and environment for base URL if needed.

---

### 3. Run with Docker

```bash
docker compose up --build
```

* Backend: `http://localhost:5000`
* Frontend: `http://localhost:3000`
* PostgreSQL: `localhost:5432` (in container network)

---

## 🧪 API Endpoints (Backend)

| Method | Endpoint                        | Description              |
| ------ | ------------------------------- | ------------------------ |
| POST   | `/api/auth/register`            | Register a new user      |
| POST   | `/api/auth/login`               | Login & get tokens       |
| POST   | `/api/conversations/1to1`       | Start 1-to-1 chat        |
| POST   | `/api/conversations/group`      | Create group chat        |
| POST   | `/api/conversations/group/join` | Join group by ID         |
| GET    | `/api/conversations`            | Fetch user chats         |
| GET    | `/api/conversations/groups`     | List all public groups   |
| POST   | `/api/ai/grammar-correct`       | Grammar correction       |
| POST   | `/api/ai/quick-replies`         | Suggested replies        |
| GET    | `/api/ai/summary/:id`           | Get conversation summary |

---

## 👤 Team & Credits

Developed by [**Mujtaba Haider**](https://github.com/s-mujtaba-haider).
