import { createHttpApi } from "./httpApi";
it("401 antigo não remove o token de um novo login", async () => {
  let release!: (response: Response) => void;
  const pending = new Promise<Response>((resolve) => {
    release = resolve;
  });
  const fetcher = vi
    .fn()
    .mockReturnValueOnce(pending)
    .mockResolvedValue(
      new Response(JSON.stringify({ name: "Ana" }), { status: 200 }),
    );
  const api = createHttpApi("https://clinic.example/api", fetcher);
  api.setToken("antigo");
  const first = api.getProfile().catch(() => null);
  api.setToken("novo");
  release(new Response("{}", { status: 401 }));
  await first;
  await api.getProfile();
  expect(
    new Headers(fetcher.mock.calls[1][1].headers).get("Authorization"),
  ).toBe("Bearer novo");
});
it("envia autenticação e lê envelope C#", async () => {
  const fetcher = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        sucesso: true,
        dados: { name: "Ana", email: "ana@demo.com", phone: "123" },
      }),
      { status: 200 },
    ),
  );
  const api = createHttpApi("https://clinic.example/api", fetcher);
  api.setToken("token");
  expect((await api.getProfile()).name).toBe("Ana");
  expect(
    new Headers(fetcher.mock.calls[0][1].headers).get("Authorization"),
  ).toBe("Bearer token");
});
it("propaga 401 e rejeição sem recorrer à demonstração", async () => {
  const api = createHttpApi(
    "https://clinic.example/api",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ mensagem: "Sessão expirada" }), {
        status: 401,
      }),
    ),
  );
  api.setToken("token");
  await expect(api.cancelAppointment("1")).rejects.toMatchObject({
    status: 401,
  });
});
it("não coloca Content-Type JSON em upload multipart", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValue(
      new Response(JSON.stringify({ name: "Ana" }), { status: 200 }),
    );
  const api = createHttpApi("https://clinic.example/api", fetcher);
  api.setToken("token");
  await api.uploadPhoto(new File(["img"], "foto.png", { type: "image/png" }));
  expect(
    new Headers(fetcher.mock.calls[0][1].headers).has("Content-Type"),
  ).toBe(false);
  expect(fetcher.mock.calls[0][1].body).toBeInstanceOf(FormData);
});
