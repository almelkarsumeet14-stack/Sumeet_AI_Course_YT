import { Sparkles } from "lucide-react";

export default function Logo() {
  return (
    <div className="brand">
      <div className="brand-mark">
        <Sparkles size={15} strokeWidth={2.2} />
      </div>
      <span>HireMeAI</span>
    </div>
  );
}
