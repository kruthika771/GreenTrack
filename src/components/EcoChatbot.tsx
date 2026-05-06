import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Leaf, Mic, MicOff, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { CarbonBreakdown } from "@/lib/carbon";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

type Language = "en" | "hi" | "te" | "kn";

const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  hi: "हिंदी",
  te: "తెలుగు",
  kn: "ಕನ್ನಡ",
};

// ─── Quick Questions ──────────────────────────────────────────────────────────
const QUICK_QUESTIONS: Record<Language, { label: string; query: string }[]> = {
  en: [
    { label: "🔍 Why is my emission high?", query: "Why is my emission high?" },
    { label: "💡 How to reduce my footprint?", query: "How can I reduce my carbon footprint?" },
    { label: "📊 Which category is highest?", query: "Which category is highest in my carbon footprint?" },
    { label: "🌱 Eco-friendly tips", query: "Give me tips for an eco-friendly lifestyle" },
  ],
  hi: [
    { label: "🔍 मेरा उत्सर्जन अधिक क्यों है?", query: "मेरा कार्बन उत्सर्जन अधिक क्यों है?" },
    { label: "💡 फुटप्रिंट कैसे कम करें?", query: "मैं अपना कार्बन फुटप्रिंट कैसे कम कर सकता हूं?" },
    { label: "📊 कौन सी श्रेणी सबसे अधिक है?", query: "मेरे कार्बन फुटप्रिंट में कौन सी श्रेणी सबसे अधिक है?" },
    { label: "🌱 पर्यावरण अनुकूल सुझाव", query: "पर्यावरण अनुकूल जीवनशैली के लिए सुझाव दें" },
  ],
  te: [
    { label: "🔍 నా ఉద్గారం ఎందుకు ఎక్కువ?", query: "నా కార్బన్ ఉద్గారం ఎందుకు ఎక్కువగా ఉంది?" },
    { label: "💡 ఫుట్‌ప్రింట్ తగ్గించడం ఎలా?", query: "నా కార్బన్ ఫుట్‌ప్రింట్ ను ఎలా తగ్గించాలి?" },
    { label: "📊 అత్యధిక వర్గం ఏది?", query: "నా కార్బన్ ఫుట్‌ప్రింట్‌లో అత్యధిక వర్గం ఏది?" },
    { label: "🌱 పర్యావరణ అనుకూల చిట్కాలు", query: "పర్యావరణ అనుకూల జీవనశైలి కోసం చిట్కాలు ఇవ్వండి" },
  ],
  kn: [
    { label: "🔍 ನನ್ನ ಹೊರಸೂಸುವಿಕೆ ಹೆಚ್ಚು ಏಕೆ?", query: "ನನ್ನ ಕಾರ್ಬನ್ ಹೊರಸೂಸುವಿಕೆ ಏಕೆ ಹೆಚ್ಚಾಗಿದೆ?" },
    { label: "💡 ಫುಟ್‌ಪ್ರಿಂಟ್ ಕಡಿಮೆ ಮಾಡುವುದು ಹೇಗೆ?", query: "ನನ್ನ ಕಾರ್ಬನ್ ಫುಟ್‌ಪ್ರಿಂಟ್ ಅನ್ನು ಹೇಗೆ ಕಡಿಮೆ ಮಾಡಬಹುದು?" },
    { label: "📊 ಅತಿ ಹೆಚ್ಚಿನ ವರ್ಗ ಯಾವುದು?", query: "ನನ್ನ ಕಾರ್ಬನ್ ಫುಟ್‌ಪ್ರಿಂಟ್‌ನಲ್ಲಿ ಅತಿ ಹೆಚ್ಚಿನ ವರ್ಗ ಯಾವುದು?" },
    { label: "🌱 ಪರಿಸರ ಸ್ನೇಹಿ ಸಲಹೆಗಳು", query: "ಪರಿಸರ ಸ್ನೇಹಿ ಜೀವನಶೈಲಿಗೆ ಸಲಹೆಗಳನ್ನು ನೀಡಿ" },
  ],
};

// ─── System Prompt Builder ────────────────────────────────────────────────────
function buildSystemPrompt(breakdown: CarbonBreakdown | null, lang: Language): string {
  const langInstruction =
    lang === "hi"
      ? "IMPORTANT: Respond entirely in Hindi (हिंदी). Use Devanagari script."
      : lang === "te"
      ? "IMPORTANT: Respond entirely in Telugu (తెలుగు). Use Telugu script."
      : lang === "kn"
      ? "IMPORTANT: Respond entirely in Kannada (ಕನ್ನಡ). Use Kannada script."
      : "Respond in English.";

  const dataContext = breakdown
    ? `
The user's latest monthly carbon footprint data is:
- Electricity: ${breakdown.electricity} kg CO2
- Transport: ${breakdown.transport} kg CO2
- Food: ${breakdown.food} kg CO2
- Waste: ${breakdown.waste} kg CO2
- Total: ${breakdown.total} kg CO2
The highest category is: ${getHighestCategory(breakdown).name} at ${getHighestCategory(breakdown).value} kg CO2.`
    : "\nThe user has not yet calculated their carbon footprint. Encourage them to use the calculator first.";

  return `You are EcoBot 🌱, a friendly, knowledgeable sustainability assistant for the GreenTrack carbon footprint tracker app.

${langInstruction}

Your personality:
- Warm, encouraging, and optimistic
- Use eco-related emojis naturally (🌍🌱🍃💚♻️🚲🌿)
- Keep responses concise but helpful (2-4 short paragraphs max)
- Use bullet points for tips and suggestions

Your capabilities:
- Answer general questions about carbon footprint and sustainability
- Analyze the user's carbon data and identify problem areas
- Provide personalized, actionable suggestions to reduce emissions
- Explain why certain categories cause high emissions
- Guide users step-by-step to improve sustainability

Response structure for emission-related questions:
1. Simple explanation of the situation
2. Reason why the category is high
3. 3-5 practical suggestions to reduce it

${dataContext}

If the user asks about their data and they have data available, always reference their actual numbers. Be specific and personalized, not generic.`;
}

function getHighestCategory(breakdown: CarbonBreakdown): { name: string; value: number } {
  const categories = [
    { name: "Electricity", value: breakdown.electricity },
    { name: "Transport", value: breakdown.transport },
    { name: "Food", value: breakdown.food },
    { name: "Waste", value: breakdown.waste },
  ];
  return categories.reduce((max, c) => (c.value > max.value ? c : max), categories[0]);
}

// ─── Chat Storage ─────────────────────────────────────────────────────────────
const CHAT_STORAGE_KEY = "greentrack_chat_history";

function loadChatHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
  } catch {
    return [];
  }
}

function saveChatHistory(messages: ChatMessage[]) {
  // Keep last 50 messages
  const toSave = messages.slice(-50);
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(toSave));
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function EcoChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [breakdown, setBreakdown] = useState<CarbonBreakdown | null>(null);
  const [language, setLanguage] = useState<Language>("en");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load chat history on mount
  useEffect(() => {
    const saved = loadChatHistory();
    if (saved.length > 0) {
      setMessages(saved);
    }
  }, []);

  // Save chat history whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages);
    }
  }, [messages]);

  // Fetch user's carbon data (re-fetch every time chat opens to stay in sync with dashboard)
  useEffect(() => {
    async function fetchData() {
      if (!user || !isOpen) return;
      const { data } = await supabase
        .from("carbon_history")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true });
      if (data && data.length > 0) {
        const latest = data[data.length - 1];
        setBreakdown({
          electricity: Number(latest.electricity),
          transport: Number(latest.transport),
          food: Number(latest.food),
          waste: Number(latest.waste),
          total: Number(latest.total),
        });
      }
    }
    fetchData();
  }, [user, isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Setup speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === "hi" ? "hi-IN" : language === "te" ? "te-IN" : language === "kn" ? "kn-IN" : "en-US";

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // Build conversation history for context (last 10 messages)
      const recentMessages = [...messages.slice(-10), userMsg];
      const conversationParts = recentMessages.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: buildSystemPrompt(breakdown, language) },
              ...recentMessages.map((m) => ({
                role: m.role === "bot" ? "assistant" : "user",
                content: m.content,
              })),
            ],
            max_tokens: 500,
            temperature: 0.7,
          }),
        }
      );

      const data = await response.json();

      let botText = "I'm having trouble responding right now. Please try again! 🌿";
      if (data.choices?.[0]?.message?.content) {
        botText = data.choices[0].message.content;
      } else if (data.error) {
        botText = `Oops! ${data.error.message} 🍂`;
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: botText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: "Sorry, I couldn't connect right now. Please check your internet connection and try again! 🌍",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  }, [messages, breakdown, language]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(CHAT_STORAGE_KEY);
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-2xl flex items-center justify-center group hover:shadow-emerald-500/30 transition-shadow duration-300"
            aria-label="Open EcoBot Chat"
          >
            <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
            {/* Pulse ring */}
            <span className="absolute w-full h-full rounded-full bg-emerald-400/30 animate-ping" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-3rem)] rounded-2xl shadow-2xl border border-emerald-200/30 overflow-hidden flex flex-col"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.97), rgba(240,253,244,0.97))",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide">EcoBot 🌱</h3>
                  <p className="text-[10px] text-emerald-100 font-medium">Your Sustainability Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Language toggle */}
                <div className="relative">
                  <button
                    onClick={() => setShowLangMenu(!showLangMenu)}
                    className="p-2 rounded-lg hover:bg-white/15 transition-colors text-xs font-semibold"
                    title="Change language"
                  >
                    <Globe className="w-4 h-4" />
                  </button>
                  {showLangMenu && (
                    <div className="absolute right-0 top-10 bg-white rounded-xl shadow-xl border border-emerald-100 py-1 min-w-[120px] z-50">
                      {(Object.entries(LANGUAGE_LABELS) as [Language, string][]).map(([code, label]) => (
                        <button
                          key={code}
                          onClick={() => { setLanguage(code); setShowLangMenu(false); }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-emerald-50 transition-colors ${
                            language === code ? "text-emerald-600 font-bold bg-emerald-50" : "text-gray-700"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Clear history */}
                {messages.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="p-2 rounded-lg hover:bg-white/15 transition-colors text-[10px] font-semibold"
                    title="Clear chat history"
                  >
                    🗑️
                  </button>
                )}
                {/* Close */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/15 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth" style={{ scrollbarWidth: "thin" }}>
              {/* Welcome message when empty */}
              {messages.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
                  <div className="text-4xl mb-3">🌍</div>
                  <h4 className="font-bold text-emerald-800 text-sm mb-1">
                    {language === "hi" ? "नमस्ते! मैं EcoBot हूँ" : language === "te" ? "నమస్కారం! నేను EcoBot" : language === "kn" ? "ನಮಸ್ಕಾರ! ನಾನು EcoBot" : "Hi! I'm EcoBot"}
                  </h4>
                  <p className="text-xs text-gray-500 mb-5 px-4">
                    {language === "hi"
                      ? "मुझसे अपने कार्बन फुटप्रिंट के बारे में कुछ भी पूछें!"
                      : language === "te"
                      ? "మీ కార్బన్ ఫుట్‌ప్రింట్ గురించి ఏదైనా అడగండి!"
                      : language === "kn"
                      ? "ನಿಮ್ಮ ಕಾರ್ಬನ್ ಫುಟ್‌ಪ್ರಿಂಟ್ ಬಗ್ಗೆ ಏನಾದರೂ ಕೇಳಿ!"
                      : "Ask me anything about your carbon footprint, eco-tips, or sustainability!"}
                  </p>
                  {breakdown && (
                    <div className="mb-5 mx-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200/60 text-left">
                      <p className="text-[10px] font-bold text-emerald-700 mb-2 uppercase tracking-wider">📊 Your Data Loaded</p>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px] text-gray-600">
                        <span>⚡ Electricity: <strong>{breakdown.electricity} kg</strong></span>
                        <span>🚗 Transport: <strong>{breakdown.transport} kg</strong></span>
                        <span>🍽️ Food: <strong>{breakdown.food} kg</strong></span>
                        <span>🗑️ Waste: <strong>{breakdown.waste} kg</strong></span>
                      </div>
                      <p className="text-[10px] text-emerald-600 font-semibold mt-2">Total: {breakdown.total} kg CO2/month</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Chat Messages */}
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "bot" && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                      <Leaf className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-br-md"
                        : "bg-white border border-emerald-100/60 text-gray-700 rounded-bl-md shadow-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-white border border-emerald-100/60 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length === 0 && (
              <div className="px-4 pb-2 flex-shrink-0">
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_QUESTIONS[language].map((q) => (
                    <button
                      key={q.label}
                      onClick={() => sendMessage(q.query)}
                      className="text-[11px] px-3 py-1.5 rounded-full border border-emerald-200 text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100 hover:border-emerald-300 transition-all font-medium"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <form
              onSubmit={handleSubmit}
              className="px-4 py-3 border-t border-emerald-100 bg-white/80 flex items-center gap-2 flex-shrink-0"
            >
              {/* Voice button */}
              {recognitionRef.current && (
                <button
                  type="button"
                  onClick={toggleVoice}
                  className={`p-2 rounded-full transition-all ${
                    isListening
                      ? "bg-red-100 text-red-500 animate-pulse"
                      : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                  }`}
                  title={isListening ? "Stop listening" : "Voice input"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}

              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  language === "hi"
                    ? "अपना संदेश लिखें..."
                    : language === "te"
                    ? "మీ సందేశాన్ని టైప్ చేయండి..."
                    : language === "kn"
                    ? "ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಟೈಪ್ ಮಾಡಿ..."
                    : "Ask about your footprint..."
                }
                className="flex-1 bg-emerald-50/50 border border-emerald-200/60 rounded-xl px-3.5 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-300 transition-all"
                disabled={isTyping}
              />

              <button
                type="submit"
                disabled={isTyping || !input.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white disabled:opacity-40 hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
