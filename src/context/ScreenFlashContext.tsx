import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { IconClose } from "@/components/icons";

const AUTO_DISMISS_MS = 5000;

type FlashKind = "error" | "success";

type FlashMessage = {
  id: number;
  kind: FlashKind;
  text: string;
};

type ScreenFlashContextValue = {
  showError: (text: string) => void;
  showSuccess: (text: string) => void;
  dismiss: () => void;
};

const ScreenFlashContext = createContext<ScreenFlashContextValue | null>(null);

function ScreenFlashBanner({
  message,
  onDismiss,
}: {
  message: FlashMessage;
  onDismiss: () => void;
}) {
  const isError = message.kind === "error";

  return (
    <div className="screen-flash" role="presentation">
      <div
        className={`screen-flash__inner screen-flash__inner--${message.kind}`}
        role={isError ? "alert" : "status"}
        aria-live={isError ? "assertive" : "polite"}
      >
        <p className="screen-flash__text">{message.text}</p>
        <button
          type="button"
          className="screen-flash__close btn btn--icon"
          aria-label="Fechar mensagem"
          onClick={onDismiss}
        >
          <IconClose className="row-actions__icon" title="" />
        </button>
      </div>
    </div>
  );
}

export function ScreenFlashProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<FlashMessage | null>(null);
  const idRef = useRef(0);

  const dismiss = useCallback(() => setMessage(null), []);

  const show = useCallback((kind: FlashKind, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    idRef.current += 1;
    setMessage({ id: idRef.current, kind, text: trimmed });
  }, []);

  const showError = useCallback((text: string) => show("error", text), [show]);
  const showSuccess = useCallback((text: string) => show("success", text), [show]);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [message, dismiss]);

  return (
    <ScreenFlashContext.Provider value={{ showError, showSuccess, dismiss }}>
      {children}
      {message ? <ScreenFlashBanner message={message} onDismiss={dismiss} /> : null}
    </ScreenFlashContext.Provider>
  );
}

export function useScreenFlash() {
  const ctx = useContext(ScreenFlashContext);
  if (!ctx) {
    throw new Error("useScreenFlash must be used within ScreenFlashProvider");
  }
  return ctx;
}

export function useFlashFormMessages(error?: string | null, success?: string | null) {
  const { showError, showSuccess } = useScreenFlash();

  useEffect(() => {
    if (error) showError(error);
  }, [error, showError]);

  useEffect(() => {
    if (success) showSuccess(success);
  }, [success, showSuccess]);
}

export function FlashError({ message }: { message: string | null | undefined }) {
  const { showError } = useScreenFlash();

  useEffect(() => {
    if (message) showError(message);
  }, [message, showError]);

  return null;
}

export function FlashSuccess({ message }: { message: string | null | undefined }) {
  const { showSuccess } = useScreenFlash();

  useEffect(() => {
    if (message) showSuccess(message);
  }, [message, showSuccess]);

  return null;
}
