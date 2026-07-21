export const CATEGORIAS_DESPESA_PARCEIRO = [
  "Seguro",
  "Rastreador",
  "Manutenção",
  "IPVA",
  "Licenciamento",
  "Outros",
] as const;

export type CategoriaDespesaParceiro = (typeof CATEGORIAS_DESPESA_PARCEIRO)[number];
