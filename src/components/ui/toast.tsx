import { CircleCheck, CircleX, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ToastMessage } from "@/hooks/use-toast";

export function Toast({ message, onDismiss }: { message: ToastMessage | null; onDismiss: () => void }) {
  if (!message) return null;

  const error = message.tone === "error";
  const Icon = error ? CircleX : CircleCheck;

  return (
    <div
      key={message.id}
      role={error ? "alert" : "status"}
      aria-live={error ? "assertive" : "polite"}
      className="fixed right-4 bottom-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] items-start gap-3 rounded-xl border bg-popover p-4 text-sm text-popover-foreground shadow-lg"
    >
      <Icon className={`mt-0.5 size-4 shrink-0 ${error ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`} />
      <span className="min-w-0 flex-1">{message.text}</span>
      <Button variant="ghost" size="icon-xs" aria-label="Đóng thông báo" onClick={onDismiss}>
        <X />
      </Button>
    </div>
  );
}
