import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type { PatientApi } from "../services/PatientApi";
import type { Session } from "../services/types";
import { ApiError } from "../services/ApiError";
import {
  readRememberedSession,
  saveRememberedSession,
  clearRememberedSession,
} from "../services/sessionStorage";
type Context = {
  session: Session | null;
  api: PatientApi;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
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
  const generation = useRef(0);
  const remember = useRef(!initialSession && !!readRememberedSession());
  const [session, setSession] = useState<Session | null>(() => {
    const restored = initialSession ?? readRememberedSession();
    api.setToken(restored?.token ?? null);
    return restored;
  });
  const logout = useCallback(() => {
    generation.current += 1;
    clearRememberedSession();
    remember.current = false;
    api.setToken(null);
    setSession(null);
  }, [api]);
  const run = useCallback(
    async <T,>(operation: (service: PatientApi) => Promise<T>) => {
      const issuedUnder = generation.current;
      try {
        return await operation(api);
      } catch (error) {
        if (
          error instanceof ApiError &&
          error.status === 401 &&
          issuedUnder === generation.current
        )
          logout();
        throw error;
      }
    },
    [api, logout],
  );
  const login = useCallback(
    async (email: string, password: string, keep = false) => {
      const next = await api.login(email, password);
      if (!next?.token || typeof next.mustChangePassword !== "boolean")
        throw new Error(
          "Resposta de login incompatível. Confira o contrato com a clínica.",
        );
      api.setToken(next.token);
      generation.current += 1;
      remember.current = keep;
      saveRememberedSession(next, keep);
      setSession(next);
    },
    [api],
  );
  const completePasswordChange = useCallback(
    () =>
      setSession((current) => {
        const next = current ? { ...current, mustChangePassword: false } : null;
        if (next) saveRememberedSession(next, remember.current);
        return next;
      }),
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
