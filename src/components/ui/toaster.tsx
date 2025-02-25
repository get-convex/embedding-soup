import { useToast, Toast } from "./toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-0 z-[100] flex flex-col gap-2 p-4 max-h-screen w-full sm:top-auto sm:bottom-0 sm:right-0 sm:max-w-sm sm:p-4">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
}
