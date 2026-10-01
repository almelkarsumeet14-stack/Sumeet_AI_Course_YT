import { ArrowUp, Paperclip, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState("");

  const submit = () => {
    const question = value.trim();
    if (!question || disabled) return;
    onSend(question);
    setValue("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="chat-input-shell">
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything about this candidate..."
        rows={2}
        disabled={disabled}
      />

      <div className="input-toolbar">
        <div className="input-tools">
          <button type="button" title="Attach">
            <Paperclip size={14} />
            Attach
          </button>
          <button type="button" title="Options">
            <SlidersHorizontal size={14} />
            Options
          </button>
        </div>

        <button
          className="send-button"
          onClick={submit}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
        >
          <ArrowUp size={17} />
        </button>
      </div>
    </div>
  );
}
