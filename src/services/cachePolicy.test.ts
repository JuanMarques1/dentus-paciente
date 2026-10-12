import { canCacheRequest } from "../../public/cache-policy.js";
const origin = "https://portal.example",
  assets = ["/assets/app.js", "/icons/icon-192.png"];
it("permite somente os recursos estáticos listados", () => {
  expect(
    canCacheRequest(new Request(`${origin}/assets/app.js`), origin, assets),
  ).toBe(true);
  expect(
    canCacheRequest(
      new Request(`${origin}/api/paciente/prontuario`),
      origin,
      assets,
    ),
  ).toBe(false);
  expect(
    canCacheRequest(
      new Request("https://other.example/assets/app.js"),
      origin,
      assets,
    ),
  ).toBe(false);
});
it("não guarda autenticação, upload nem URLs com parâmetros", () => {
  expect(
    canCacheRequest(
      new Request(`${origin}/assets/app.js`, {
        headers: { Authorization: "Bearer token" },
      }),
      origin,
      assets,
    ),
  ).toBe(false);
  expect(
    canCacheRequest(
      new Request(`${origin}/icons/icon-192.png`, {
        method: "POST",
        body: "foto",
      }),
      origin,
      assets,
    ),
  ).toBe(false);
  expect(
    canCacheRequest(
      new Request(`${origin}/assets/app.js?paciente=1`),
      origin,
      assets,
    ),
  ).toBe(false);
});
