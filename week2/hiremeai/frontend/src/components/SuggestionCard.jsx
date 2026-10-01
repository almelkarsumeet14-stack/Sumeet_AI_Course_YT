import { FileSearch, MessageSquareText, UserRoundSearch } from "lucide-react";

const cards = [
  {
    title: "Resume Analysis",
    description: "Understand the candidate's skills, experience and projects.",
    icon: FileSearch,
    prompt: "Give me a concise summary of this candidate's resume."
  },
  {
    title: "Interview Questions",
    description: "Ask role-focused questions based only on the resume.",
    icon: MessageSquareText,
    prompt: "What technical questions can an HR interviewer ask this candidate?"
  },
  {
    title: "Candidate Chat",
    description: "Get professional answers as if the candidate is responding.",
    icon: UserRoundSearch,
    prompt: "Tell me about this candidate's strongest skills."
  }
];

export default function SuggestionCards({ onPrompt }) {
  return (
    <div className="suggestion-grid">
      {cards.map(({ title, description, icon: Icon, prompt }) => (
        <button className="suggestion-card" key={title} onClick={() => onPrompt(prompt)}>
          <div className="suggestion-icon">
            <Icon size={16} />
          </div>
          <div className="suggestion-content">
            <div className="suggestion-title">{title}</div>
            <div className="suggestion-description">{description}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
