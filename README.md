# 🌍 GreenTrack — AI-Powered Carbon Footprint Tracker

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-green--track--pi.vercel.app-00C853?style=for-the-badge)](https://green-track-pi.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-kruthika771%2FGreenTrack-181717?style=for-the-badge&logo=github)](https://github.com/kruthika771/GreenTrack)

GreenTrack is a modern, AI-powered web application that helps users track, visualize, and reduce their carbon footprint. Built with React, TypeScript, and Supabase, it features interactive dashboards, smart emission highlighting, and **EcoBot** — an AI chatbot sustainability assistant powered by Groq AI.

> 🚀 **Live at:** [https://green-track-pi.vercel.app](https://green-track-pi.vercel.app)

---

## ✨ Features

### 🧮 Carbon Footprint Calculator
- Calculate emissions across **Electricity**, **Transport**, **Food**, and **Waste** categories
- Real-time breakdown with category-level insights
- Save multiple entries over time for trend tracking

### 📊 Interactive Dashboard
- **Pie Chart & Bar Chart** with automatic highest-emission highlighting (red/orange)
- **Clickable graphs** — click any bar or pie slice to see detailed reduction tips
- **Highest Emission Alert Banner** at the top with one-click navigation
- **Clickable Entries Card** — view all past calculations with full breakdown per entry
- **Progress Over Time** — line chart tracking emission trends across entries
- **Eco Score** — score out of 100 based on total monthly emissions
- **Badges & Achievements** — gamified sustainability rewards
- **PDF Export** — download a professional carbon report

### 🤖 EcoBot — AI Sustainability Assistant
- **Floating chatbot widget** available on every page (bottom-right corner)
- Powered by **Groq AI** (Llama 3.3 70B Versatile) for lightning-fast responses
- **Context-aware** — automatically reads your actual carbon footprint data from Supabase and gives personalized, data-driven advice
- **Quick question buttons** for instant insights:
  - 🔍 Why is my emission high?
  - 💡 How to reduce my footprint?
  - 📊 Which category is highest?
  - 🌱 Eco-friendly tips
- **Multi-language support**: English, हिंदी (Hindi), తెలుగు (Telugu), ಕನ್ನಡ (Kannada)
- **Voice input** via browser Speech Recognition API
- **Chat history** saved in localStorage (persists across sessions)
- **Typing animation** with smooth spring transitions

### 🔐 Authentication
- Email/Password signup & login
- Google OAuth (via Supabase Auth)
- Protected dashboard & calculator routes

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript (Vite) |
| **Styling** | Tailwind CSS |
| **UI Components** | shadcn/ui + Radix UI |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **Backend & Auth** | Supabase (PostgreSQL + Auth) |
| **AI Chatbot** | Groq API (Llama 3.3 70B) |
| **PDF Generation** | jsPDF + jspdf-autotable |
| **Icons** | Lucide React |
| **Routing** | React Router DOM |
| **Hosting** | Vercel |

---

## 📁 Project Structure

```
GreenTrack/
├── public/
│   ├── _redirects              # Netlify SPA routing
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── EcoChatbot.tsx      # 🤖 AI chatbot widget (Groq + multi-language)
│   │   ├── AuthModal.tsx       # Login/signup modal
│   │   ├── CalculationResults.tsx
│   │   ├── Layout.tsx          # App layout & navigation
│   │   ├── NavLink.tsx
│   │   └── ui/                 # shadcn/ui components
│   ├── contexts/
│   │   └── AuthContext.tsx     # Auth state management
│   ├── integrations/
│   │   └── supabase/           # Supabase client & types
│   ├── lib/
│   │   ├── carbon.ts           # Carbon calculation engine
│   │   └── utils.ts
│   ├── pages/
│   │   ├── Home.tsx            # Landing page
│   │   ├── CalculatorPage.tsx  # Carbon calculator form
│   │   ├── DashboardPage.tsx   # Interactive dashboard + charts
│   │   ├── TipsPage.tsx        # Eco tips
│   │   └── AboutPage.tsx       # About page
│   ├── App.tsx                 # Root app with routing + EcoBot
│   ├── main.tsx
│   └── index.css               # Global styles
├── supabase/
│   └── migrations/             # Database schema (profiles, carbon_history)
├── .env.example                # Environment variable template
├── vercel.json                 # Vercel SPA routing config
├── tailwind.config.ts
├── vite.config.ts
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- A [Supabase](https://supabase.com/) project
- A [Groq](https://console.groq.com/) API key (free tier available)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kruthika771/GreenTrack.git
   cd GreenTrack
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Copy `.env.example` to `.env` and fill in your keys:
   ```env
   VITE_SUPABASE_PROJECT_ID="your_supabase_project_id"
   VITE_SUPABASE_URL="https://your_project_id.supabase.co"
   VITE_SUPABASE_PUBLISHABLE_KEY="your_supabase_anon_key"
   VITE_GROQ_API_KEY="your_groq_api_key"
   ```

4. **Run Supabase migration**:
   Execute the SQL in `supabase/migrations/` in your Supabase SQL Editor to create the `profiles` and `carbon_history` tables.

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. Open `http://localhost:8080` in your browser.

---

## 🌐 Deployment

This project is deployed on **Vercel**:

| Setting | Value |
|---------|-------|
| **Platform** | [Vercel](https://vercel.com) |
| **Framework** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Live URL** | [green-track-pi.vercel.app](https://green-track-pi.vercel.app) |

### Deploy Your Own

1. Fork this repo
2. Import it on [vercel.com/new](https://vercel.com/new)
3. Add all 4 environment variables from `.env.example`
4. Click Deploy
5. Update Supabase Auth → **Site URL** & **Redirect URLs** with your new Vercel domain

---

## 📸 Screenshots

### 🏠 Home Page
Modern landing page with eco-themed design and animated elements.

### 📊 Dashboard
Interactive charts with highest-emission highlighting, clickable entries, badges, and PDF export.

### 🤖 EcoBot
Floating AI assistant with multi-language support, voice input, and personalized sustainability advice.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/kruthika771/GreenTrack/issues).

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).

---

<p align="center">
  Made with 💚 for a greener planet 🌍
</p>
