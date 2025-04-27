# 🤖 Chat Bot Webhook

This is the webhook server that handles chatbot queries from the Smart Agri Assistant frontend.

## ✨ Features

- Receives farmer queries from frontend.
- Sends the queries to **Groq LLaMA 3 70B** AI model.
- Returns responses translated into the selected language.
- Designed for fast, scalable AI interaction.

## 🏗️ Project Structure

```
chat-bot-webhook/
├── index.js         # Server entry point
├── .env             # Environment variables
├── package.json
├── package-lock.json
└── .gitignore
```

## ⚙️ Technologies Used

- **Backend:** Node.js, Express.js
- **AI Model:** Groq LLaMA 3 70B
- **Hosting:** Render

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/sanafathima-00/chat-bot-webhook.git
```

### 2. Install dependencies

```bash
cd chat-bot-webhook
npm install
```

### 3. Setup Environment Variables

Create a `.env` file inside `chat-bot-webhook/` folder:

```env
PORT=5001
GROQ_API_KEY=your_groq_api_key_here
```

### 4. Start the Server

```bash
npm start
```

Server will start at [http://localhost:5001](http://localhost:5001)
