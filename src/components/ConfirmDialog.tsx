import { useEffect, useRef } from "react";
import { X, CalendarX2 } from "lucide-react";
export function ConfirmDialog({
  title,
  description,
  busy,
  error,
  onClose,
  onConfirm,
}: {
  title: string;
  description: string;
  busy: boolean;
  error: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const busyRef = useRef(busy);
  busyRef.current = busy;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busyRef.current) closeRef.current();
      if (event.key === "Tab") {
        const targets = panel.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),a[href],input:not(:disabled),[tabindex="0"]',
        );
        if (!targets?.length) {
          event.preventDefault();
          return;
        }
        const first = targets[0],
          last = targets[targets.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
      document.body.style.overflow = oldOverflow;
      previous?.focus();
    };
  }, []);
  return (
    <div className="modal-backdrop">
      <div
        ref={panel}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <button
          className="icon-button modal-close"
          aria-label="Fechar"
          onClick={onClose}
          disabled={busy}
        >
          <X size={20} />
        </button>
        <span className="modal-symbol">
          <CalendarX2 size={30} />
        </span>
        <h2 id="dialog-title">{title}</h2>
        <p id="dialog-description">{description}</p>
        {error && (
          <p role="alert" className="feedback error">
            {error}
          </p>
        )}
        <div className="button-row">
          <button
            className="button secondary"
            onClick={onClose}
            disabled={busy}
          >
            Voltar
          </button>
          <button className="button danger" onClick={onConfirm} disabled={busy}>
            {busy ? "Cancelando…" : "Cancelar consulta"}
          </button>
        </div>
      </div>
    </div>
  );
}
