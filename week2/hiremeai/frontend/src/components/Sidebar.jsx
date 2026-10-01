import {
  Archive,
  Bot,
  BriefcaseBusiness,
  FileText,
  FolderKanban,
  History,
  MessageCircle,
  Plus,
  Settings,
  Sparkles,
  UserRound
} from "lucide-react";
import Logo from "./Logo";

const navItems = [
  { label: "Chat", icon: MessageCircle },
  { label: "Resume", icon: FileText },
  { label: "Analysis", icon: Sparkles },
  { label: "History", icon: History }
];

const workspaceItems = [
  { label: "Candidate", icon: UserRound },
  { label: "Interview", icon: BriefcaseBusiness },
  { label: "Projects", icon: FolderKanban }
];

export default function Sidebar({ active, onNewChat, onSelect }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <Logo />
        <button className="sidebar-collapse" aria-label="Collapse sidebar">
          <span></span>
          <span></span>
        </button>
      </div>

      <button className="new-chat" onClick={onNewChat}>
        <Plus size={16} />
        <span>New Chat</span>
      </button>

      <div className="nav-section">
        <div className="section-label">Features</div>
        {navItems.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className={`nav-item ${active === label ? "active" : ""}`}
            onClick={() => onSelect(label)}
          >
            <Icon size={15} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="nav-section">
        <div className="section-label">Workspace</div>
        {workspaceItems.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className={`nav-item ${active === label ? "active" : ""}`}
            onClick={() => onSelect(label)}
          >
            <Icon size={15} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="sidebar-spacer" />

      <div className="premium-card">
        <div className="premium-icon">
          <Bot size={17} />
        </div>
        <div className="premium-title">HireMeAI Assistant</div>
        <div className="premium-text">
          Ask questions about the candidate and get AI-powered interview answers.
        </div>
        <button className="upgrade-button">
          <Settings size={13} />
          Configure
        </button>
      </div>
    </aside>
  );
}
