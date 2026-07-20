import type { ReactNode } from "react";

import { FlashError } from "@/context/ScreenFlashContext";

type Props = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function PageHeader({ title, description, actions, children }: Props) {
  return (
    <section className="page">
      <header className="page__header">
        <div>
          <h1>{title}</h1>
          {description ? <p className="page__desc">{description}</p> : null}
        </div>
        {actions ? <div className="page__actions">{actions}</div> : null}
      </header>
      {children}
    </section>
  );
}

export function QueryError({ message }: { message: string }) {
  return (
    <>
      <FlashError message={`Erro ao carregar: ${message}`} />
      <div className="panel">
        Não foi possível carregar os dados. Verifique se a API está a correr ou se a chave API
        está correta.
      </div>
    </>
  );
}
