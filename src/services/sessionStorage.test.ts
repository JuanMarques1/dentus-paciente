import {
  clearRememberedSession,
  readRememberedSession,
  saveRememberedSession,
  rememberedSessionKey,
} from "./sessionStorage";
import { createDemoApi } from "./demoApi";
const session = { token: "demo-patient-session", mustChangePassword: true };
it("mantém sessão somente quando solicitado e limpa ao sair", () => {
  saveRememberedSession(session, false);
  expect(readRememberedSession()).toBeNull();
  saveRememberedSession(session, true);
  expect(readRememberedSession()).toEqual(session);
  clearRememberedSession();
  expect(readRememberedSession()).toBeNull();
});
it("ignora sessão inválida ou expirada", () => {
  localStorage.setItem(rememberedSessionKey, "bad-json");
  expect(readRememberedSession()).toBeNull();
  localStorage.setItem(
    rememberedSessionKey,
    JSON.stringify({ session, expiresAt: Date.now() - 1 }),
  );
  expect(readRememberedSession()).toBeNull();
});
it("retoma demonstração lembrada sem exigir a senha provisória novamente", async () => {
  const api = createDemoApi(0, localStorage);
  const session = await api.login("paciente@demo.com", "Clinica123");
  api.setToken(session.token);
  saveRememberedSession(session, true);
  await api.changePassword("Clinica123", "NovaSenha123");
  const restored = createDemoApi(0, localStorage);
  restored.setToken(session.token);
  expect((await restored.getProfile()).email).toBe("paciente@demo.com");
  expect(
    (await restored.login("paciente@demo.com", "NovaSenha123"))
      .mustChangePassword,
  ).toBe(false);
});
