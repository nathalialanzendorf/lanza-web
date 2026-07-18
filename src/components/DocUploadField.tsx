import { useRef, useState } from "react";

import { lanzaApi } from "@/api/endpoints";
import { LanzaApiError } from "@/api/client";
import { ocrDocumentoNoNavegador } from "@/lib/documentoOcrClient";

export type DocUploadTipo = "cnh" | "comprovante-residencia" | "crlv";

type DocUploadFieldProps = {
  label: string;
  tipo: DocUploadTipo;
  accept?: string;
  hint?: string;
  disabled?: boolean;
  onParsed: (data: { campos: Record<string, unknown>; avisos: string[] }) => void;
  onError?: (message: string) => void;
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const raw = String(reader.result ?? "");
      const base64 = raw.includes(",") ? raw.split(",")[1]! : raw;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo"));
    reader.readAsDataURL(file);
  });
}

function isImagem(nomeArquivo: string): boolean {
  return /\.(jpe?g|png|webp|jfif)$/i.test(nomeArquivo);
}

function deveTentarOcrLocal(tipo: DocUploadTipo): boolean {
  return tipo === "cnh" || tipo === "comprovante-residencia";
}

function erroPermiteFallback(err: unknown): boolean {
  if (err instanceof DOMException && err.name === "TimeoutError") return true;
  if (err instanceof LanzaApiError) {
    return err.status === 504 || err.status === 502 || err.status === 503;
  }
  return false;
}

export function DocUploadField({
  label,
  tipo,
  accept = ".pdf,.jpg,.jpeg,.png,.webp",
  hint,
  disabled,
  onParsed,
  onError,
}: DocUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [nomeArquivo, setNomeArquivo] = useState<string | null>(null);
  const [avisos, setAvisos] = useState<string[]>([]);

  async function lerComOcrLocal(
    nome: string,
    conteudoBase64: string,
  ): Promise<{ campos: Record<string, unknown>; avisos: string[] }> {
    setStatus("Servidor demorou — lendo OCR no navegador…");

    let imagemBase64 = conteudoBase64;
    let mime = "image/jpeg";

    if (!isImagem(nome)) {
      const img = await lanzaApi.extrairImagemDocumento({
        tipo,
        nomeArquivo: nome,
        conteudoBase64,
      });
      if (!img.data.imagemBase64) {
        throw new LanzaApiError(422, img.data.avisos?.join(" ") || "Imagem não extraída do PDF.");
      }
      imagemBase64 = img.data.imagemBase64;
      mime = img.data.mime || "image/jpeg";
    }

    const text = await ocrDocumentoNoNavegador(imagemBase64, mime);
    const parsed = await lanzaApi.parseTextoDocumento({ tipo, text });
    const avisosLista = [
      ...(parsed.data.avisos ?? []),
      "OCR executado no navegador (fallback — servidor excedeu o tempo).",
    ];
    return {
      campos: (parsed.data.campos ?? {}) as Record<string, unknown>,
      avisos: avisosLista,
    };
  }

  async function handleFile(file: File | null) {
    if (!file) return;
    setLoading(true);
    setNomeArquivo(file.name);
    setAvisos([]);
    setStatus(
      tipo === "cnh" || tipo === "comprovante-residencia"
        ? "Lendo documento (OCR pode levar alguns segundos)…"
        : "Lendo documento…",
    );
    try {
      const conteudoBase64 = await fileToBase64(file);
      let campos: Record<string, unknown>;
      let avisosLista: string[];

      try {
        const r = await lanzaApi.lerDocumento({
          tipo,
          nomeArquivo: file.name,
          conteudoBase64,
        });
        campos = (r.data.campos ?? {}) as Record<string, unknown>;
        avisosLista = r.data.avisos ?? [];
      } catch (err) {
        if (!deveTentarOcrLocal(tipo) || !erroPermiteFallback(err)) {
          throw err;
        }
        const local = await lerComOcrLocal(file.name, conteudoBase64);
        campos = local.campos;
        avisosLista = local.avisos;
      }

      setAvisos(avisosLista);
      onParsed({ campos, avisos: avisosLista });
    } catch (err) {
      const msg = err instanceof LanzaApiError ? err.message : "Falha ao ler documento.";
      onError?.(msg);
    } finally {
      setLoading(false);
      setStatus(null);
    }
  }

  return (
    <div className="doc-upload">
      <label className="field">
        <span className="field__label">{label}</span>
        {hint ? <span className="field__hint">{hint}</span> : null}
        <input
          ref={inputRef}
          type="file"
          className="input doc-upload__input"
          accept={accept}
          disabled={disabled || loading}
          onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
        />
      </label>
      {loading && status ? <p className="doc-upload__status">{status}</p> : null}
      {nomeArquivo && !loading ? (
        <p className="doc-upload__status">
          Arquivo: <strong>{nomeArquivo}</strong>
        </p>
      ) : null}
      {avisos.length > 0 ? (
        <ul className="doc-upload__avisos">
          {avisos.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
