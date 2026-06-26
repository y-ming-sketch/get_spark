"use client";

import { useState } from "react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";

export default function Page() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-cream-50 dark:bg-ink-800 text-ink-700 dark:text-ink-50">
      <ChatSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
      <ChatWindow />
    </main>
  );
}
