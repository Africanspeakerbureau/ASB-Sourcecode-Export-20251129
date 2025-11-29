import { createContext, useContext, useState, ReactNode } from "react";

type Toast = { id: number; text: string; type?: "success" | "error" };
const Ctx = createContext<{ push: (t: Omit<Toast, "id">) => void }>({ push: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const push = (t: Omit<Toast, "id">) => {
    const id = Date.now();
    setItems((s) => [...s, { id, ...t }]);
    setTimeout(() => setItems((s) => s.filter((i) => i.id !== id)), 3200);
  };
  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-[10000]">
        {items.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2 rounded-lg shadow text-white ${
              t.type === "error" ? "bg-red-600" : "bg-emerald-600"
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
export const useToast = () => useContext(Ctx);
