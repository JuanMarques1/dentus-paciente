import type { PatientApi } from "./PatientApi";
import type { Appointment, Profile, RecordDetails } from "./types";
import { ApiError } from "./ApiError";
import { canCancelAt } from "../features/appointments/rules";
import { demoAuthKey, readRememberedSession } from "./sessionStorage";
export function createDemoApi(
  latency = 0,
  storage: Storage | null = null,
): PatientApi {
  let token: string | null = null,
    password = "Clinica123",
    mustChangePassword = true;
  let profile: Profile = {
    name: "João Victor Carrilho Loza",
    email: "paciente@demo.com",
    phone: "(15) 99999-6789",
  };
  try {
    if (storage && readRememberedSession()) {
      const saved = JSON.parse(storage.getItem(demoAuthKey) ?? "null");
      if (
        typeof saved?.password === "string" &&
        typeof saved.email === "string" &&
        typeof saved.mustChangePassword === "boolean"
      ) {
        password = saved.password;
        profile.email = saved.email;
        mustChangePassword = saved.mustChangePassword;
      }
    }
  } catch {
    /* Only fictitious demo credentials can be restored. */
  }
  const saveDemoAuth = () => {
    try {
      if (storage && readRememberedSession())
        storage.setItem(
          demoAuthKey,
          JSON.stringify({
            password,
            email: profile.email,
            mustChangePassword,
          }),
        );
    } catch {
      /* Optional storage. */
    }
  };
  const future = (days: number, hour: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(hour, 30, 0, 0);
    return date.toISOString();
  };
  let appointments: Appointment[] = [
    {
      id: "1",
      procedure: "Limpeza",
      dentist: "Gustavo Pereira",
      startsAt: future(3, 14),
      clinicTimeZone: "America/Sao_Paulo",
      status: "pending",
      canConfirm: true,
      canCancel: true,
    },
    {
      id: "2",
      procedure: "Clareamento",
      dentist: "Gabriel Santos",
      startsAt: future(7, 17),
      clinicTimeZone: "America/Sao_Paulo",
      status: "confirmed",
      canConfirm: false,
      canCancel: true,
    },
  ];
  const records: RecordDetails[] = [
    {
      id: "1",
      date: "2026-09-21",
      title: "Limpeza",
      dentist: "Gustavo Pereira",
      summary: "Limpeza e orientações de higiene bucal.",
      instructions:
        "Escove os dentes após as refeições com uma escova de cerdas macias. Use fio dental diariamente. Caso perceba sensibilidade persistente, entre em contato com a clínica.",
      treatmentPlan:
        "Acompanhamento preventivo e avaliação na próxima consulta.",
    },
    {
      id: "2",
      date: "2026-09-14",
      title: "Avaliação inicial",
      dentist: "Gabriel Santos",
      summary: "Avaliação e planejamento dos cuidados.",
      instructions:
        "Mantenha sua rotina de higiene e compareça à consulta de acompanhamento agendada.",
      treatmentPlan:
        "Limpeza profissional, avaliação do clareamento e acompanhamento periódico.",
    },
  ];
  const pause = async () => {
    if (latency) await new Promise((resolve) => setTimeout(resolve, latency));
    if (!navigator.onLine)
      throw new ApiError("Você está sem internet. Reconecte para continuar.");
  };
  const authorize = async () => {
    await pause();
    if (!token) throw new ApiError("Sua sessão expirou. Entre novamente.", 401);
    if (mustChangePassword)
      throw new ApiError("Defina sua nova senha para continuar.", 403);
  };
  const update = async (id: string, status: "confirmed" | "cancelled") => {
    await authorize();
    const current = appointments.find((item) => item.id === id);
    if (!current) throw new ApiError("Consulta não encontrada.", 404);
    if (
      status === "cancelled" &&
      (!current.canCancel || !canCancelAt(current.startsAt, Date.now()))
    )
      throw new ApiError(
        "O prazo para cancelar terminou. Entre em contato com a clínica.",
        409,
      );
    if (status === "confirmed" && !current.canConfirm)
      throw new ApiError("Esta consulta não pode ser confirmada.", 409);
    const result = {
      ...current,
      status,
      canConfirm: false,
      canCancel: status === "confirmed",
    };
    appointments = appointments.map((item) => (item.id === id ? result : item));
    return structuredClone(result);
  };
  return {
    setToken(value) {
      token = value;
    },
    async login(email, enteredPassword) {
      await pause();
      if (
        email.trim().toLowerCase() !== profile.email.toLowerCase() ||
        enteredPassword !== password
      )
        throw new ApiError("E-mail ou senha inválidos.", 401);
      return { token: "demo-patient-session", mustChangePassword };
    },
    async changePassword(current, next) {
      await pause();
      if (!token) throw new ApiError("Entre novamente.", 401);
      if (current !== password)
        throw new ApiError("A senha atual está incorreta.", 400);
      if (next.length < 8 || next === current)
        throw new ApiError(
          "Use uma nova senha com pelo menos 8 caracteres.",
          400,
        );
      password = next;
      mustChangePassword = false;
      saveDemoAuth();
    },
    async getProfile() {
      await authorize();
      return structuredClone(profile);
    },
    async updateProfile(input) {
      await authorize();
      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) ||
        input.phone.replace(/\D/g, "").length < 10
      )
        throw new ApiError("Confira o e-mail e o telefone.", 400);
      profile = { ...profile, ...input, email: input.email.trim() };
      saveDemoAuth();
      return structuredClone(profile);
    },
    async uploadPhoto(file) {
      await authorize();
      if (
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 5 * 1024 * 1024
      )
        throw new ApiError(
          "Escolha uma imagem JPG, PNG ou WebP de até 5 MB.",
          400,
        );
      const photoUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () =>
          reject(new ApiError("Não foi possível ler a foto."));
        reader.readAsDataURL(file);
      });
      profile = { ...profile, photoUrl };
      return structuredClone(profile);
    },
    async listAppointments() {
      await authorize();
      return structuredClone(appointments);
    },
    confirmAppointment: (id) => update(id, "confirmed"),
    cancelAppointment: (id) => update(id, "cancelled"),
    async listRecords() {
      await authorize();
      return records.map(({ instructions: _, treatmentPlan: __, ...summary }) =>
        structuredClone(summary),
      );
    },
    async getRecord(id) {
      await authorize();
      const record = records.find((item) => item.id === id);
      if (!record) throw new ApiError("Registro não encontrado.", 404);
      return structuredClone(record);
    },
  };
}
