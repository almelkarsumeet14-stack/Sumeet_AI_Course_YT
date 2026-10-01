import { useState } from "react";
import { Check, FileText, RotateCcw, X } from "lucide-react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import AiOrb from "./components/AiOrb";
import ChatInput from "./components/ChatInput";
import ChatMessage from "./components/ChatMessage";
import SuggestionCards from "./components/SuggestionCard";
import { askHireMeAI } from "./services/api";

export default function App() {
  const [active, setActive] = useState("Chat");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendQuestion = async (question) => {
    setError("");
    setMessages((current) => [
      ...current,
      { role: "user", content: question }
    ]);
    setLoading(true);

    try {
      const data = await askHireMeAI(question);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.answer || "No answer returned by the backend." }
      ]);
    } catch (err) {
      setError(err.message || "Unable to connect to HireMeAI backend.");
    } finally {
      setLoading(false);
    }
  };

  const newChat = () => {
    setMessages([]);
    setError("");
    setActive("Chat");
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="app-shell">
      <Sidebar
        active={active}
        onNewChat={newChat}
        onSelect={setActive}
      />

      <main className="main-panel">
        <Topbar />

        <section className={`workspace ${hasMessages ? "conversation-mode" : ""}`}>
          {!hasMessages ? (
            <>
              <div className="hero">
                <AiOrb />
                <p className="eyebrow">AI RESUME & INTERVIEW ASSISTANT</p>
                <h1>Ready to meet your next candidate?</h1>
                <p className="hero-subtitle">
                  Ask HireMeAI anything about the resume and get professional,
                  resume-grounded answers.
                </p>
              </div>

              <div className="quick-actions">
                <button onClick={() => sendQuestion("Give me a concise summary of this candidate's resume.")}>
                  <FileText size={14} />
                  Analyze Resume
                </button>
                <button onClick={() => sendQuestion("What are this candidate's strongest technical skills?")}>
                  <Check size={14} />
                  Key Skills
                </button>
                <button onClick={() => sendQuestion("What interview questions should I ask this candidate?")}>
                  <RotateCcw size={14} />
                  Interview Prep
                </button>
              </div>
            </>
          ) : (
            <div className="conversation">
              <div className="conversation-header">
                <div>
                  <div className="conversation-label">CANDIDATE ASSISTANT</div>
                  <h2>Resume Conversation</h2>
                </div>
                <button className="clear-button" onClick={newChat}>
                  <X size={14} />
                  New chat
                </button>
              </div>

              <div className="messages">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={`${message.role}-${index}`}
                    role={message.role}
                    content={message.content}
                  />
                ))}
                {loading && (
                  <div className="message-row assistant-message">
                    <div className="message-avatar ai-avatar">✦</div>
                    <div className="message-bubble typing">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="error-banner">
              <strong>Connection error:</strong> {error}
              <span>Make sure the FastAPI backend is running on port 8000.</span>
            </div>
          )}

          <div className="composer-area">
            <ChatInput onSend={sendQuestion} disabled={loading} />
            {!hasMessages && (
              <SuggestionCards onPrompt={sendQuestion} />
            )}
            <p className="disclaimer">
              HireMeAI answers are generated from the candidate resume available to the backend.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
