import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SessionProvider, useSession } from "./SessionProvider";
import { createDemoApi } from "../services/demoApi";
import { ApiError } from "../services/ApiError";
function Harness() {
  const { run, logout, login, session } = useSession();
  return (
    <>
      <p>{session?.token ?? "sem sessão"}</p>
      <button
        onClick={() => void run((api) => api.getProfile()).catch(() => {})}
      >
        Iniciar requisição
      </button>
      <button
        onClick={() => {
          logout();
          void login("novo@demo.com", "mock");
        }}
      >
        Trocar sessão
      </button>
    </>
  );
}
it("401 de requisição anterior não encerra uma nova sessão", async () => {
  const api = createDemoApi();
  let reject!: (error: Error) => void;
  api.getProfile = () =>
    new Promise((_, failure) => {
      reject = failure;
    });
  api.login = async () => ({ token: "nova-sessao", mustChangePassword: false });
  const user = userEvent.setup();
  render(
    <SessionProvider
      api={api}
      initialSession={{ token: "antiga-sessao", mustChangePassword: false }}
    >
      <Harness />
    </SessionProvider>,
  );
  await user.click(screen.getByRole("button", { name: "Iniciar requisição" }));
  await user.click(screen.getByRole("button", { name: "Trocar sessão" }));
  expect(await screen.findByText("nova-sessao")).toBeVisible();
  reject(new ApiError("Sessão expirada", 401));
  await new Promise((resolve) => setTimeout(resolve, 20));
  expect(screen.getByText("nova-sessao")).toBeVisible();
});
