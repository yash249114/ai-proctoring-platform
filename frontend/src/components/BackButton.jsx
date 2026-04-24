import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function BackButton({ to, text = "Back" }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => to ? navigate(to) : navigate(-1)}
      className="group flex items-center gap-1.5 text-gray-400 hover:text-white transition-all mb-6"
    >
      <div className="p-1 rounded-lg bg-white/5 border border-white/10 group-hover:border-white/20 group-hover:bg-white/10 transition-all">
        <ChevronLeft className="w-4 h-4" />
      </div>
      <span className="text-sm font-medium">{text}</span>
    </button>
  );
}
