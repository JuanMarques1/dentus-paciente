import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { PatientApi } from "../services/PatientApi";
import type { Session } from "../services/types";
import { ApiError } from "../services/ApiError";
type Context = {
  session: Session | null;
  api: PatientApi;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  completePasswordChange: () => void;
  run: <T>(operation: (api: PatientApi) => Promise<T>) => Promise<T>;
};
const SessionContext = createContext<Context | null>(null);
export function SessionProvider({
  api,
  initialSession,
  children,
}: {
  api: PatientApi;
  initialSession?: Session;
  children: ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(() => {
    api.setToken(initialSession?.token ?? null);
    return initialSession ?? null;
  });
  const logout = useCallback(() => {
    api.setToken(null);
    setSession(null);
  }, [api]);
  const run = useCallback(
    async <T,>(operation: (service: PatientApi) => Promise<T>) => {
      try {
        return await operation(api);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) logout();
        throw error;
      }
    },
    [api, logout],
  );
  const login = useCallback(
    async (email: string, password: string) => {
      const next = await api.login(email, password);
      if (!next?.token || typeof next.mustChangePassword !== "boolean")
        throw new Error(
          "Resposta de login incompatível. Confira o contrato com a clínica.",
        );
      api.setToken(next.token);
      setSession(next);
    },
    [api],
  );
  const completePasswordChange = useCallback(
    () =>
      setSession((current) =>
        current ? { ...current, mustChangePassword: false } : null,
      ),
    [],
  );
  const value = useMemo(
    () => ({ session, api, run, login, logout, completePasswordChange }),
    [session, api, run, login, logout, completePasswordChange],
  );
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("SessionProvider ausente");
  return context;
}
