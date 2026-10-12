import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "./App";
import { createDemoApi } from "../services/demoApi";
import type { PatientApi } from "../services/PatientApi";
import { ApiError } from "../services/ApiError";
it("upload de foto preserva alterações de contato ainda não salvas", async () => {
  const api = await readyApi();
  api.uploadPhoto = async () => ({
    ...(await api.getProfile()),
    photoUrl: "data:image/png;base64,aA==",
  });
  const user = userEvent.setup();
  renderAt(api, "/perfil");
  const email = await screen.findByLabelText("E-mail");
  await user.clear(email);
  await user.type(email, "rascunho@demo.com");
  await user.upload(
    screen.getByLabelText("Alterar foto"),
    new File(["fake"], "foto.png", { type: "image/png" }),
  );
  expect(await screen.findByText("Sua foto foi atualizada.")).toBeVisible();
  expect(email).toHaveValue("rascunho@demo.com");
});
it("não permite editar contato durante uma atualização pendente", async () => {
  const api = await readyApi();
  const original = api.updateProfile;
  let release!: () => void;
  const waiting = new Promise<void>((r) => {
    release = r;
  });
  api.updateProfile = async (input) => {
    await waiting;
    return original(input);
  };
  const user = userEvent.setup();
  renderAt(api, "/perfil");
  const email = await screen.findByLabelText("E-mail");
  await user.click(screen.getByRole("button", { name: "Salvar alterações" }));
  expect(email).toBeDisabled();
  release();
  expect(
    await screen.findByText("Seus dados foram atualizados."),
  ).toBeVisible();
});
async function readyApi() {
  const api = createDemoApi();
  const session = await api.login("paciente@demo.com", "Clinica123");
  api.setToken(session.token);
  await api.changePassword("Clinica123", "NovaSenha123");
  return api;
}
function renderAt(api: PatientApi, path: string, required = false) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes
        api={api}
        initialSession={{
          token: "demo-patient-session",
          mustChangePassword: required,
        }}
      />
    </MemoryRouter>,
  );
}
it("primeiro acesso exige troca de senha antes das consultas", async () => {
  renderAt(createDemoApi(), "/consultas", true);
  expect(
    await screen.findByRole("heading", { name: "Crie sua nova senha" }),
  ).toBeVisible();
  expect(screen.queryByRole("heading", { name: "Consultas" })).toBeNull();
});
it("cancelamento exige confirmação e atualiza o cartão", async () => {
  const user = userEvent.setup();
  renderAt(await readyApi(), "/consultas");
  const cancel = await screen.findAllByRole("button", { name: "Cancelar" });
  await user.click(cancel[0]);
  expect(
    screen.getByRole("dialog", { name: "Cancelar consulta?" }),
  ).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Cancelar consulta" }));
  expect(await screen.findByText("Consulta cancelada.")).toBeVisible();
  expect(screen.getByText("Cancelada")).toBeVisible();
});
it("rejeição pelo servidor mantém consulta sem anunciar sucesso", async () => {
  const api = await readyApi();
  api.cancelAppointment = async () => {
    throw new ApiError("O prazo terminou.", 409);
  };
  const user = userEvent.setup();
  renderAt(api, "/consultas");
  await user.click(
    (await screen.findAllByRole("button", { name: "Cancelar" }))[0],
  );
  await user.click(screen.getByRole("button", { name: "Cancelar consulta" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "O prazo terminou.",
  );
  expect(screen.queryByText("Consulta cancelada.")).toBeNull();
  expect(screen.getByText("Aguardando confirmação")).toBeVisible();
});
it("401 em ação retorna ao login sem sucesso", async () => {
  const api = await readyApi();
  api.confirmAppointment = async () => {
    throw new ApiError("Sessão expirada", 401);
  };
  const user = userEvent.setup();
  renderAt(api, "/consultas");
  await user.click(await screen.findByRole("button", { name: "Confirmar" }));
  expect(
    await screen.findByRole("heading", { name: "Dentu’s Clinic" }),
  ).toBeVisible();
  expect(screen.queryByText("Consulta confirmada.")).toBeNull();
});
it("duplo toque aguarda resposta sem anunciar sucesso antecipado", async () => {
  const api = await readyApi();
  const original = api.confirmAppointment;
  let release!: () => void;
  const barrier = new Promise<void>((r) => {
    release = r;
  });
  const action = vi.fn(async (id: string) => {
    await barrier;
    return original(id);
  });
  api.confirmAppointment = action;
  const user = userEvent.setup();
  renderAt(api, "/consultas");
  await user.dblClick(await screen.findByRole("button", { name: "Confirmar" }));
  expect(screen.queryByText("Consulta confirmada.")).toBeNull();
  expect(action).toHaveBeenCalledTimes(1);
  release();
  expect(await screen.findByText("Consulta confirmada.")).toBeVisible();
});
it("abre detalhes do histórico", async () => {
  const user = userEvent.setup();
  renderAt(await readyApi(), "/prontuario");
  await user.click(
    await screen.findByRole("link", {
      name: "Orientações do atendimento: Limpeza",
    }),
  );
  expect(
    await screen.findByRole("heading", { name: "Orientações do atendimento" }),
  ).toBeVisible();
  expect(screen.getByText(/cerdas macias/)).toBeVisible();
});
it("registro inexistente permite voltar ao histórico", async () => {
  renderAt(await readyApi(), "/prontuario/inexistente");
  expect(await screen.findByText("Registro não encontrado.")).toBeVisible();
  expect(screen.getByRole("link", { name: /voltar/i })).toBeVisible();
});
it("erro no perfil preserva campos e nome não é editável", async () => {
  const api = await readyApi();
  api.updateProfile = async () => {
    throw new ApiError("Não foi possível salvar.", 500);
  };
  const user = userEvent.setup();
  renderAt(api, "/perfil");
  const email = await screen.findByLabelText("E-mail");
  await user.clear(email);
  await user.type(email, "novo@demo.com");
  await user.click(screen.getByRole("button", { name: "Salvar alterações" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Não foi possível salvar.",
  );
  expect(email).toHaveValue("novo@demo.com");
  expect(screen.queryByRole("textbox", { name: "Nome" })).toBeNull();
});
it("arquivo inválido não substitui avatar nem chama API", async () => {
  const api = await readyApi();
  const upload = vi.spyOn(api, "uploadPhoto");
  const user = userEvent.setup({ applyAccept: false });
  renderAt(api, "/perfil");
  const input = await screen.findByLabelText("Alterar foto");
  await user.upload(
    input,
    new File(["x"], "arquivo.txt", { type: "text/plain" }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(/JPG/);
  expect(upload).not.toHaveBeenCalled();
});
it("sem internet bloqueia ações", async () => {
  const api = await readyApi();
  const online = vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
  renderAt(api, "/consultas");
  expect(await screen.findByText(/sem internet/i)).toBeVisible();
  await waitFor(() =>
    expect(screen.queryByRole("button", { name: "Confirmar" })).toBeNull(),
  );
  online.mockRestore();
});
