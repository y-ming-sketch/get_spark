"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  MessageSquare,
  Trash2,
  Pencil,
  Check,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from "lucide-react";
import { useSpark } from "@/lib/store";
import { cn, formatRelativeTime } from "@/lib/utils";
import { APP_VERSION } from "@/lib/version";
import { SparkWordmark } from "../SparkLogo";
import { ThemeToggle } from "../ThemeToggle";

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  onOpenSettings: () => void;
}

export function ChatSidebar({ collapsed, onToggle, onOpenSettings }: Props) {
  const t = useTranslations("chat");
  const tSidebar = useTranslations("sidebar");

  const conversations = useSpark((s) => s.conversations);
  const activeId = useSpark((s) => s.activeId);
  const newConversation = useSpark((s) => s.newConversation);
  const selectConversation = useSpark((s) => s.selectConversation);
  const deleteConversation = useSpark((s) => s.deleteConversation);
  const renameConversation = useSpark((s) => s.renameConversation);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const beginRename = (id: string, title: string) => {
    setEditingId(id);
    setDraft(title);
  };

  const commitRename = () => {
    if (editingId && draft.trim()) {
      renameConversation(editingId, draft.trim());
    }
    setEditingId(null);
    setDraft("");
  };

  if (collapsed) {
    return (
      <aside className="flex w-14 shrink-0 flex-col items-center border-e border-cream-300 dark:border-ink-500 bg-cream-100 dark:bg-ink-800 py-3 gap-2">
        <button
          onClick={onToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-cream-200 dark:hover:bg-ink-600 transition-colors"
          aria-label={t("openSidebarAria")}
        >
          <PanelLeftOpen size={18} />
        </button>
        <button
          onClick={() => newConversation()}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-spark-500 text-white hover:bg-spark-600 transition-colors"
          aria-label={t("newChatAria")}
        >
          <Plus size={18} />
        </button>
        <div className="mt-auto">
          <button
            onClick={onOpenSettings}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-400 hover:bg-cream-200 dark:hover:bg-ink-600 hover:text-ink-700 dark:hover:text-ink-100 transition-colors"
            aria-label={tSidebar("openSettings")}
          >
            <Settings size={18} />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-e border-cream-300 dark:border-ink-500 bg-cream-100 dark:bg-ink-800">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <SparkWordmark />
        <button
          onClick={onToggle}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-cream-200 dark:hover:bg-ink-600 transition-colors"
          aria-label={t("closeSidebarAria")}
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      {/* New chat */}
      <div className="px-3 pb-2">
        <button
          onClick={() => newConversation()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-spark-500 px-3 py-2 text-sm font-medium text-white hover:bg-spark-600 transition-colors"
        >
          <Plus size={16} />
          {t("newChat")}
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin">
        {conversations.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-ink-400 whitespace-pre-line">
            {t("conversationsEmpty")}
          </p>
        ) : (
          <ul className="space-y-0.5">
            {conversations.map((c) => {
              const isActive = c.id === activeId;
              const isEditing = c.id === editingId;
              return (
                <li key={c.id}>
                  <div
                    className={cn(
                      "group flex items-center gap-2 rounded-lg px-2 py-2 text-sm cursor-pointer transition-colors",
                      isActive
                        ? "bg-cream-200 dark:bg-ink-600"
                        : "hover:bg-cream-200/60 dark:hover:bg-ink-700",
                    )}
                    onClick={() => !isEditing && selectConversation(c.id)}
                  >
                    <MessageSquare
                      size={14}
                      className="shrink-0 text-ink-400"
                    />
                    {isEditing ? (
                      <input
                        autoFocus
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitRename();
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 min-w-0 rounded border border-spark-500/40 bg-white dark:bg-ink-800 px-1.5 py-0.5 text-sm outline-none"
                      />
                    ) : (
                      <div className="min-w-0 flex-1">
                        <div className="truncate">{c.title}</div>
                        <div className="text-[10px] text-ink-400">
                          {formatRelativeTime(c.updatedAt)}
                        </div>
                      </div>
                    )}

                    {isEditing ? (
                      <div className="flex shrink-0 items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            commitRename();
                          }}
                          className="p-1 text-ink-400 hover:text-spark-500"
                          aria-label={t("saveNameAria")}
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(null);
                          }}
                          className="p-1 text-ink-400 hover:text-ink-700"
                          aria-label={t("cancelAria")}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            beginRename(c.id, c.title);
                          }}
                          className="p-1 text-ink-400 hover:text-ink-700 dark:hover:text-ink-100"
                          aria-label={t("renameAria")}
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              confirm(
                                t("deleteConfirm", { title: c.title }),
                              )
                            ) {
                              deleteConversation(c.id);
                            }
                          }}
                          className="p-1 text-ink-400 hover:text-spark-500"
                          aria-label={t("deleteAria")}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-cream-300 dark:border-ink-500 px-3 py-3">
        <div className="flex items-center justify-between">
          <ThemeToggle />
          <button
            onClick={onOpenSettings}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 hover:bg-cream-200 dark:hover:bg-ink-600 hover:text-ink-700 dark:hover:text-ink-100 transition-colors"
            aria-label={tSidebar("openSettings")}
          >
            <Settings size={14} />
          </button>
        </div>
        <p className="mt-2 text-[10px] text-ink-400">
          {tSidebar("footer", { version: APP_VERSION })}
        </p>
      </div>
    </aside>
  );
}
