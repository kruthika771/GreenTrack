# 🌍 GreenTrack — Carbon Footprint Tracker

GreenTrack is a modern, AI-powered web application that helps users track, visualize, and reduce their carbon footprint. Built with React, TypeScript, and Supabase, it features interactive dashboards, smart emission highlighting, and an AI chatbot sustainability assistant.

## ✨ Features

### 🧮 Carbon Footprint Calculator
- Calculate emissions across **Electricity**, **Transport**, **Food**, and **Waste**
- Real-time breakdown with category-level insights

### 📊 Interactive Dashboard
- **Pie Chart & Bar Chart** with automatic highest-emission highlighting (red)
- **Clickable graphs** — click any bar/slice to see detailed reduction tips
- **Highest Emission Alert Banner** with one-click action
- **Progress Over Time** line chart (multi-entry tracking)
- **Clickable Entries Card** — view all past calculations with full breakdown
- **Badges & Achievements** system

### 🤖 EcoBot — AI Chatbot Assistant
- Floating chatbot widget available on every page
- Powered by **Groq AI** (Llama 3.3 70B) for lightning-fast responses
- **Context-aware** — reads your actual carbon data and gives personalized advice
- **Quick question buttons** for instant insights
- **Multi-language support**: English, हिंदी, తెలుగు, ಕನ್ನಡ
- **Voice input** (browser Speech Recognition API)
- **Chat history** saved locally (persists across sessions)

### 🔐 Authentication
- Email/Password signup & login
- Google OAuth (via Supabase Auth)

### 📄 PDF Export
- Export your full carbon report as a professional PDF

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript (Vite) |
| **Styling** | Tailwind CSS |
| **UI Components** | shadcn/ui + Radix UI |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **Backend & Auth** | Supabase (PostgreSQL) |
| **AI Chatbot** | Groq API (Llama 3.3 70B) |
| **PDF Generation** | jsPDF + jspdf-autotable |
| **Icons** | Lucide React |
| **Routing** | React Router DOM |

## 📁 Project Structure

```
green-tracker-planet-main/
├── public/
│   └── _redirects          # Netlify SPA routing
├── src/
│   ├── components/
│   │   ├── EcoChatbot.tsx   # AI chatbot widget
│   │   ├── AuthModal.tsx    # Login/signup modal
│   │   ├── Layout.tsx       # App layout & nav
│   │   └── ui/              # shadcn/ui components
│   ├── contexts/
│   │   └── AuthContext.tsx   # Auth state management
│   ├── integrations/
│   │   └── supabase/        # Supabase client config
│   ├── lib/
│   │   └── carbon.ts        # Carbon calculation engine
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── CalculatorPage.tsx
│   │   ├── DashboardPage.tsx # Main dashboard with charts
│   │   ├── TipsPage.tsx
│   │   └── AboutPage.tsx
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   └── migrations/          # Database schema
├── .env.example             # Environment variable template
├── index.html
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
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
   Create a `.env` file in the project root:
   ```env
   VITE_SUPABASE_PROJECT_ID="your_supabase_project_id"
   VITE_SUPABASE_URL="https://your_project_id.supabase.co"
   VITE_SUPABASE_PUBLISHABLE_KEY="your_supabase_anon_key"
   VITE_GROQ_API_KEY="your_groq_api_key"
   ```

4. **Run the Supabase migration**:
   Execute the SQL in `supabase/migrations/` in your Supabase SQL Editor to create the required tables (`profiles`, `carbon_history`).

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. Open `http://localhost:8080` in your browser.

## 🌐 Deployment

This project is configured for **Netlify** deployment:
- The `public/_redirects` file handles SPA client-side routing
- Add all `.env` variables to Netlify → Site Settings → Environment Variables
- Update your Supabase Auth "Site URL" to match your Netlify domain

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/kruthika771/GreenTrack/issues).

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
