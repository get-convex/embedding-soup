import * as React from "react";
import { createContext, useContext, useState } from "react";

import { cn } from "../../lib/utils";
import { X } from "lucide-react";

type ToastProps = {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
  duration?: number;
};

type ToastActionElement = React.ReactElement;

type ToastContextType = {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, "id">) => void;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function Toast({
  id,
  title,
  description,
  action,
  variant = "default",
  ...props
}: ToastProps) {
  const { dismissToast } = useToast();

  return (
    <div
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all",
        variant === "default" && "bg-white text-gray-900 border-gray-200",
        variant === "destructive" && "bg-rose-600 text-white border-rose-600",
        variant === "success" && "bg-green-600 text-white border-green-600",
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        {title && <div className="font-semibold">{title}</div>}
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
      {action && <div>{action}</div>}
      <button
        onClick={() => dismissToast(id)}
        className={cn(
          "absolute right-2 top-2 rounded-md p-1",
          "text-gray-500 opacity-70 transition-opacity hover:opacity-100",
          variant === "destructive" && "text-white",
          variant === "success" && "text-white",
        )}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, ...toast }]);

    if (toast.duration !== Infinity) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, toast.duration || 3000);
    }
  };

  const dismissToast = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toasts, addToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");

  return context;
}

export function toast({
  title,
  description,
  variant = "default",
  duration = 3000,
  action,
}: Omit<ToastProps, "id">) {
  const { addToast } = useToast();
  addToast({ title, description, variant, duration, action });
}
