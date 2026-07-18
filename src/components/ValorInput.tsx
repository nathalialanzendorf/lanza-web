import { formatValorInput, parseValorInput } from "@/lib/format";

type ValorInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  /** Permite 0,00 (ex.: entrada na retirada). */
  allowZero?: boolean;
  "aria-label"?: string;
};

export function ValorInput({
  value,
  onChange,
  disabled,
  required,
  placeholder = "0,00",
  allowZero,
  "aria-label": ariaLabel,
}: ValorInputProps) {
  return (
    <input
      className="input"
      type="text"
      inputMode="decimal"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={() => {
        const n = parseValorInput(value, { allowZero });
        if (n != null) onChange(formatValorInput(n));
      }}
      required={required}
      disabled={disabled}
      placeholder={placeholder}
      aria-label={ariaLabel}
    />
  );
}
