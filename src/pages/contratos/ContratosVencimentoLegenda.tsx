import { PROXIMO_VENCER_DIAS } from "@/lib/contratoVencimento";

type Props = {
  vencidos: number;
  proximos: number;
};

export function ContratosVencimentoLegenda({ vencidos, proximos }: Props) {
  return (
    <p className="field__hint contratos-renovar__legenda">
      <span className="badge badge--danger">Vencido</span> fim previsto já passou ·{" "}
      <span className="badge badge--warn">Próximo</span> vence em até {PROXIMO_VENCER_DIAS} dias
      {vencidos + proximos > 0 ? (
        <>
          {" "}
          — {vencidos} vencido{vencidos === 1 ? "" : "s"}, {proximos} próximo
          {proximos === 1 ? "" : "s"}
        </>
      ) : null}
    </p>
  );
}
