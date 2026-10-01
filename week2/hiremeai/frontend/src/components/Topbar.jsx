import { ChevronDown, Download, Settings2 } from "lucide-react";

export default function Topbar() {
  return (
    <header className="topbar">
      <button className="model-pill">
        <span className="status-dot"></span>
        HireMeAI
        <ChevronDown size={13} />
      </button>

      <div className="topbar-actions">
        <button className="topbar-button">
          <Settings2 size={14} />
          Configuration
        </button>
        <button className="topbar-button">
          <Download size={14} />
          Export
        </button>
      </div>
    </header>
  );
}
