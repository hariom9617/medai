import { Menu, Search, User as UserIcon } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  title: string;
  search?: string;
  onMenuClick: () => void;
}

export function Navbar({ title, search, onMenuClick }: NavbarProps) {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-100 bg-white px-4 md:px-8">
      <button
        onClick={onMenuClick}
        className="grid h-10 w-10 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">{title}</h1>
      <div className="ml-auto flex items-center gap-2 md:gap-4">
        {search && (
          <div className="relative hidden sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder={search}
              className="h-10 w-72 rounded-full border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}
        <NotificationBell />
        <div className="flex items-center gap-2.5">
          <div className="hidden text-right md:block">
            <p className="text-sm font-semibold text-slate-900 leading-tight">{user?.fullName}</p>
            <p className="text-xs text-slate-500 leading-tight capitalize">{user?.role}</p>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-500">
            <UserIcon className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
