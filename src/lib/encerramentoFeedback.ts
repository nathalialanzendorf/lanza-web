import { LanzaApiError } from "@/api/client";
import { formatPlaca } from "@/lib/format";

const MOTIVO_LABEL: Record<string, string> = {
  devolvido: "devolvido",
  recuperado: "recuperado",
  troca: "troca de veículo",
};

type EncerrarPayload = {
  contrato?: {
    clienteNome?: string | null;
    placa?: string | null;
    dataEncerramento?: string | null;
    motivoEncerramento?: string | null;
  };
  clienteStatus?: { aviso?: string | null };
};

export function mensagemErroApi(err: unknown, fallback: string): string {
  if (err instanceof LanzaApiError) return err.message;
  if (err instanceof Error && err.message.trim()) return err.message;
  return fallback;
}

export function mensagemSucessoEncerramento(data: unknown): string {
  const payload = data as EncerrarPayload;
  const c = payload.contrato;
  const detalhes: string[] = [];

  if (c?.clienteNome?.trim() || c?.placa?.trim()) {
    const nome = c.clienteNome?.trim() || "Cliente";
    const placa = c.placa?.trim() ? formatPlaca(c.placa) : "";
    detalhes.push(placa ? `${nome} · ${placa}` : nome);
  }
  if (c?.dataEncerramento?.trim()) {
    detalhes.push(`data ${c.dataEncerramento.trim()}`);
  }
  if (c?.motivoEncerramento) {
    const motivo = MOTIVO_LABEL[c.motivoEncerramento] ?? c.motivoEncerramento;
    detalhes.push(`motivo ${motivo}`);
  }

  let msg =
    detalhes.length > 0
      ? `Contrato encerrado com sucesso (${detalhes.join(", ")}).`
      : "Contrato encerrado com sucesso.";

  const aviso = payload.clienteStatus?.aviso?.trim();
  if (aviso) msg += ` ${aviso}`;

  return msg;
}
