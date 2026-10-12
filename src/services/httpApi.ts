import type { PatientApi } from "./PatientApi";
import type {
  Session,
  Profile,
  Appointment,
  RecordSummary,
  RecordDetails,
} from "./types";
import { ApiError } from "./ApiError";
// Proposed routes: the group's existing API does not yet expose these patient operations.
export const routes = {
  login: "/auth/login",
  password: "/paciente/senha",
  profile: "/paciente/perfil",
  photo: "/paciente/foto",
  appointments: "/paciente/consultas",
  records: "/paciente/prontuario",
};
export function createHttpApi(
  base: string,
  fetcher: typeof fetch = fetch,
): PatientApi {
  let token: string | null = null;
  if (!base) throw new Error("Configure VITE_API_BASE_URL para usar a API.");
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    if (!navigator.onLine)
      throw new ApiError("Você está sem internet. Reconecte para continuar.");
    const headers = new Headers(init.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (init.body && !(init.body instanceof FormData))
      headers.set("Content-Type", "application/json");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    let response: Response;
    try {
      response = await fetcher(base.replace(/\/$/, "") + path, {
        ...init,
        headers,
        signal: controller.signal,
        cache: "no-store",
      });
    } catch (error) {
      throw new ApiError(
        error instanceof Error && error.name === "AbortError"
          ? "A clínica demorou a responder. Tente novamente."
          : "Não foi possível conectar à clínica. Tente novamente.",
      );
    } finally {
      clearTimeout(timer);
    }
    const body = await response.json().catch(() => null);
    if (!response.ok || body?.sucesso === false || body?.success === false) {
      if (response.status === 401) token = null;
      throw new ApiError(
        body?.mensagem ??
          body?.message ??
          "Não foi possível concluir a operação.",
        response.status,
      );
    }
    return (body?.dados ?? body?.data ?? body) as T;
  }
  const post = (body: unknown): RequestInit => ({
    method: "POST",
    body: JSON.stringify(body),
  });
  return {
    setToken(value) {
      token = value;
    },
    login: (email, password) =>
      request<Session>(routes.login, post({ email, senha: password })),
    changePassword: (current, next) =>
      request<void>(routes.password, {
        method: "PUT",
        body: JSON.stringify({ senhaAtual: current, novaSenha: next }),
      }),
    getProfile: () => request<Profile>(routes.profile),
    updateProfile: (input) =>
      request<Profile>(routes.profile, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    uploadPhoto(file) {
      const data = new FormData();
      data.append("foto", file);
      return request<Profile>(routes.photo, { method: "PUT", body: data });
    },
    listAppointments: () => request<Appointment[]>(routes.appointments),
    confirmAppointment: (id) =>
      request<Appointment>(
        `${routes.appointments}/${encodeURIComponent(id)}/confirmar`,
        { method: "PUT" },
      ),
    cancelAppointment: (id) =>
      request<Appointment>(
        `${routes.appointments}/${encodeURIComponent(id)}/cancelar`,
        { method: "PUT" },
      ),
    listRecords: () => request<RecordSummary[]>(routes.records),
    getRecord: (id) =>
      request<RecordDetails>(`${routes.records}/${encodeURIComponent(id)}`),
  };
}
