/**
 * Toast hook for displaying notifications
 * Simplified version for RBAC implementation
 */

"use client";

import { useState, useCallback } from "react";

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = useCallback((props: ToastProps) => {
    // For now, just use alert - can be replaced with proper toast UI later
    const message = props.title + (props.description ? "\n" + props.description : "");
    if (props.variant === "destructive") {
      alert("❌ " + message);
    } else {
      alert("✓ " + message);
    }
  }, []);

  return { toast, toasts };
}
