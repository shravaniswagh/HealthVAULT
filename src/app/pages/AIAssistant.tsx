import { useState, useEffect, useRef } from "react";
import { Send, Bot, Loader2, RefreshCw, Sparkles, Brain } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const quickQuestions = [
  "What does my LDL cholesterol mean?",
  "How can I lower my blood sugar?",
  "Why is my Vitamin D low?",
  "Is my blood pressure dangerous?",
  "Summarize my health data",
  "What should I eat to improve my health?",
];

function MessageBubble({ message, userInitials }: { message: ChatMessage; userInitials: string }) {
  const isUser = message.role === "user";

  const formatContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, i) => {
      if (line.includes("**")) {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className="mb-0.5">
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j}>{part}</strong> : part
            )}
          </p>
        );
      }
      if (line.startsWith("- ") || line.startsWith("• ") || line.match(/^\d+\./)) {
        return <li key={i} className="ml-4 text-gray-700">{line.replace(/^[-•]\s/, "").replace(/^\d+\.\s/, "")}</li>;
      }
      if (line === "") return <br key={i} />;
      return <p key={i} className="mb-0.5">{line}</p>;
    });
  };

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {isUser ? (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
          {userInitials}
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? "bg-blue-600 text-white rounded-tr-sm"
          : "bg-white border border-gray-100 text-gray-700 rounded-tl-sm shadow-sm"
      }`}>
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div className="space-y-0.5">{formatContent(message.content)}</div>
        )}
        <p className={`text-[10px] mt-1.5 ${isUser ? "text-blue-200 text-right" : "text-gray-400"}`}>
          {new Date(message.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

export function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [abnormalMetrics, setAbnormalMetrics] = useState<any[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const userInitials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  useEffect(() => {
    // Load metrics for health context panel
    api.getMetrics()
      .then((metrics: any[]) => {
        setAbnormalMetrics(metrics.filter((m) => m.status !== "normal").slice(0, 5));
        // Build greeting
        const greeting = metrics.length > 0
          ? `Hello${user?.name ? " " + user.name.split(" ")[0] : ""}! 👋 I'm your AI Health Assistant. I have access to your health data and can answer questions about your metrics, explain results, and provide personalized recommendations.\n\nHow can I help you today?`
          : `Hello${user?.name ? " " + user.name.split(" ")[0] : ""}! 👋 I'm your AI Health Assistant. You haven't uploaded any health reports yet, but I can still answer general health questions.\n\nHow can I help you today?`;

        setMessages([{
          id: "welcome",
          role: "assistant",
          content: greeting,
          timestamp: new Date().toISOString(),
        }]);
      })
      .catch(() => {
        setMessages([{
          id: "welcome",
          role: "assistant",
          content: "Hello! 👋 I'm your AI Health Assistant. How can I help you today?",
          timestamp: new Date().toISOString(),
        }]);
      });
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMsg: ChatMessage = {
      id: `m${Date.now()}`,
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const data = await api.chat(updatedMessages.map((m) => ({ role: m.role, content: m.content })));
      const aiMsg: ChatMessage = {
        id: `m${Date.now() + 1}`,
        role: "assistant",
        content: data.content,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `m${Date.now() + 1}`,
        role: "assistant",
        content: `Sorry, I encountered an error: ${err.message}. Please ensure the backend server is running.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-73px)]">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden lg:flex flex-col w-64 border-r border-gray-100 bg-white p-4 gap-4 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <p className="text-sm font-semibold text-gray-700">Quick Questions</p>
            </div>
            <div className="space-y-1.5">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="w-full text-left text-xs text-gray-600 px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors border border-transparent hover:border-blue-100 leading-relaxed"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {abnormalMetrics.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2.5">Abnormal Metrics</p>
              <div className="space-y-2">
                {abnormalMetrics.map((m) => (
                  <div key={m.id} className={`px-3 py-2 rounded-xl text-xs border ${
                    m.status === "high" || m.status === "critical" ? "bg-red-50 border-red-100 text-red-700"
                    : m.status === "low" ? "bg-blue-50 border-blue-100 text-blue-700"
                    : "bg-amber-50 border-amber-100 text-amber-700"
                  }`}>
                    <span className="font-medium">{m.short_name || m.name}:</span> {m.value} {m.unit}
                    <span className="ml-1 text-[10px] font-bold uppercase">({m.status})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setMessages([])}
            className="mt-auto flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> New conversation
          </button>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#F8FAFC]">
          {/* Chat header */}
          <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">AI Health Assistant</p>
              <p className="text-[11px] text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" /> Powered by Gemini
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} userInitials={userInitials} />
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="bg-white border-t border-gray-100 p-4">
            <div className="flex items-end gap-3 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your health data, metrics, or lifestyle tips..."
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 text-sm bg-gray-50 disabled:opacity-60"
                />
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 shadow-sm"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-2">
              AI responses are for informational purposes only. Always consult a healthcare professional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
