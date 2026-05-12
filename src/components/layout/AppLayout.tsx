import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { useFCMToken } from "@/hooks/useFCMToken";

interface Props {
  title: string;
  search?: string;
  children: ReactNode;
}

export function AppLayout({ title, search, children }: Props) {
  useFCMToken();
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-page">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar title={title} search={search} onMenuClick={() => setOpen(true)} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
