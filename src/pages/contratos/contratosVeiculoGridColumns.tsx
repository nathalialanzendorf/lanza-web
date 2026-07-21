import type { Column } from "@/components/DataTable";
import { formatPlaca } from "@/lib/format";
import type { Contrato } from "@/api/types";

export const colunasVeiculoContrato: Column<Contrato>[] = [
  {
    key: "placa",
    header: "Placa",
    sortValue: (c) => formatPlaca(c.placa ?? c.veiculo?.placa),
    render: (c) => <strong>{formatPlaca(c.placa ?? c.veiculo?.placa)}</strong>,
  },
  {
    key: "marcaModelo",
    header: "Marca / modelo",
    sortValue: (c) => c.veiculo?.marcaModelo ?? "",
    render: (c) => c.veiculo?.marcaModelo ?? "—",
  },
  {
    key: "ano",
    header: "Ano",
    sortValue: (c) => c.veiculo?.anoModelo ?? "",
    render: (c) => c.veiculo?.anoModelo ?? "—",
  },
];
