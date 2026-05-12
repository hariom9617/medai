import { Link } from "react-router-dom";
import { Pill } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-sm">
        <Pill className="h-4 w-4" />
      </span>
      <span className="text-xl font-bold tracking-tight text-primary">MedAI</span>
    </Link>
  );
}
