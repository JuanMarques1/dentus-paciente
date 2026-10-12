import { createDemoApi } from "./demoApi";
it("recusa credenciais incorretas e exige troca no primeiro acesso", async () => {
  const api = createDemoApi();
  await expect(api.login("paciente@demo.com", "errada")).rejects.toThrow(
    /senha/i,
  );
  const session = await api.login("paciente@demo.com", "Clinica123");
  expect(session.mustChangePassword).toBe(true);
});
it("confirma e cancela com persistência na sessão", async () => {
  const api = createDemoApi();
  const session = await api.login("paciente@demo.com", "Clinica123");
  api.setToken(session.token);
  await api.changePassword("Clinica123", "NovaSenha123");
  const [appointment] = await api.listAppointments();
  expect((await api.confirmAppointment(appointment.id)).status).toBe(
    "confirmed",
  );
  expect((await api.cancelAppointment(appointment.id)).status).toBe(
    "cancelled",
  );
  expect((await api.listAppointments())[0].status).toBe("cancelled");
});
it("bloqueia dados sem sessão e atualiza o e-mail de login", async () => {
  const api = createDemoApi();
  await expect(api.getProfile()).rejects.toThrow();
  const session = await api.login("paciente@demo.com", "Clinica123");
  api.setToken(session.token);
  await api.changePassword("Clinica123", "NovaSenha123");
  await api.updateProfile({ email: "novo@demo.com", phone: "(15) 99999-1234" });
  api.setToken(null);
  await expect(
    api.login("paciente@demo.com", "NovaSenha123"),
  ).rejects.toThrow();
  expect(
    (await api.login("novo@demo.com", "NovaSenha123")).mustChangePassword,
  ).toBe(false);
});
