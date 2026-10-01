export default function ChatMessage({ role, content }) {
  const isUser = role === "user";

  return (
    <div className={`message-row ${isUser ? "user-message" : "assistant-message"}`}>
      <div className={`message-avatar ${isUser ? "user-avatar" : "ai-avatar"}`}>
        {isUser ? "You" : "✦"}
      </div>
      <div className="message-bubble">
        {content}
      </div>
    </div>
  );
}
