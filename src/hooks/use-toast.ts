import { useCallback, useEffect, useState } from "react";

export type ToastMessage = {
  id: number;
  text: string;
  tone: "success" | "error";
};

export function useToast() {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const notify = useCallback((text: string, tone: ToastMessage["tone"] = "success") => {
    setToast((current) => ({ id: (current?.id ?? 0) + 1, text, tone }));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  return { toast, notify, dismissToast: () => setToast(null) };
}
