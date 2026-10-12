import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  UserRound,
  LogOut,
  KeyRound,
  Check,
  Mail,
  Phone,
} from "lucide-react";
import { useResource, useAction, useOnline } from "../../app/hooks";
import { useSession } from "../../app/SessionProvider";
import { ScreenState, Feedback } from "../../components/ScreenState";
export function ProfilePage() {
  const resource = useResource((api) => api.getProfile()),
    action = useAction(),
    online = useOnline(),
    { run, logout } = useSession();
  const [email, setEmail] = useState(""),
    [phone, setPhone] = useState("");
  useEffect(() => {
    if (resource.data) {
      setEmail(resource.data.email);
      setPhone(resource.data.phone);
    }
  }, [resource.data]);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (phone.replace(/\D/g, "").length < 10) {
      action.setError("Informe um telefone com DDD.");
      return;
    }
    void action.execute(async () => {
      const updated = await run((api) =>
        api.updateProfile({ email: email.trim(), phone }),
      );
      resource.setData(updated);
    }, "Seus dados foram atualizados.");
  };
  const photo = async (file: File) => {
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      action.setError("Escolha uma imagem JPG, PNG ou WebP de até 5 MB.");
      return;
    }
    await action.execute(async () => {
      const updated = await run((api) => api.uploadPhoto(file));
      resource.setData((current) =>
        current ? { ...current, photoUrl: updated.photoUrl } : updated,
      );
    }, "Sua foto foi atualizada.");
  };
  return (
    <section className="page profile-page">
      <p className="eyebrow">SEU ESPAÇO</p>
      <h1 className="sr-only">Meu perfil</h1>
      {resource.loading || resource.error ? (
        <ScreenState
          loading={resource.loading}
          error={resource.error}
          retry={resource.retry}
        />
      ) : (
        resource.data && (
          <>
            <div className="avatar-wrap">
              <div className="avatar">
                {resource.data.photoUrl ? (
                  <img
                    src={resource.data.photoUrl}
                    width="176"
                    height="176"
                    alt="Sua foto de perfil"
                  />
                ) : (
                  <UserRound size={88} strokeWidth={1.35} />
                )}
              </div>
              <label
                className={`photo-button ${action.busy || !online ? "disabled" : ""}`}
                title="Alterar foto"
              >
                <Camera size={20} />
                <input
                  className="sr-only"
                  type="file"
                  aria-label="Alterar foto"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={action.busy || !online}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void photo(file);
                    event.target.value = "";
                  }}
                />
              </label>
            </div>
            <h2 className="profile-name">{resource.data.name}</h2>
            <p className="profile-caption">Bom ter você por aqui.</p>
            <form className="form profile-form" onSubmit={submit}>
              <label>
                E-mail
                <span className="input-icon">
                  <Mail size={17} />
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </span>
              </label>
              <label>
                Telefone
                <span className="input-icon">
                  <Phone size={17} />
                  <input
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    required
                  />
                </span>
              </label>
              <Feedback error={action.error} success={action.success} />
              <button
                className="button primary"
                disabled={action.busy || !online}
              >
                {action.busy ? (
                  "Salvando…"
                ) : (
                  <>
                    <Check size={17} />
                    Salvar alterações
                  </>
                )}
              </button>
            </form>
            <div className="profile-actions">
              <Link className="button muted" to="/senha">
                <KeyRound size={17} />
                Alterar senha
              </Link>
              <button className="button danger" onClick={logout}>
                <LogOut size={17} />
                Sair
              </button>
            </div>
            <p className="end-note">
              Para alterar seu nome, fale com a clínica.
            </p>
          </>
        )
      )}
    </section>
  );
}
