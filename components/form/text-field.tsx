// components/form/text-field.tsx
//
// Shared form field for the register/login forms (Story 1.4) — the
// `text-input` token spec from DESIGN.md: surface field, 1px ink-muted
// border, rounded-md, ink text over an ink-muted placeholder, padding
// spacing-3/spacing-4. Focus adds a 2px sky-deep ring (an inset ring
// instead of a border-width swap, so focusing never shifts layout). Error
// state swaps the border to `error` and renders the message as TEXT plus a
// non-color icon beneath the field — never color alone
// (EXPERIENCE.md Accessibility Floor).
//
// Required fields carry a visible non-color marker next to the label
// ("Bắt buộc" / "Required", translated by the caller) in addition to
// `aria-required` — asterisk-only or color-only is not enough.

import type { InputHTMLAttributes } from "react";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: string;
  requiredLabel?: string;
  error?: string;
};

export function TextField({
  id,
  label,
  requiredLabel,
  error,
  required,
  className,
  ...inputProps
}: TextFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="flex items-baseline gap-2">
        <span className="text-caption text-ink">{label}</span>
        {required && requiredLabel ? (
          <span className="text-caption text-ink-muted">
            ({requiredLabel})
          </span>
        ) : null}
      </label>

      <input
        id={id}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-md border bg-surface px-4 py-3 text-body text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-deep ${
          error ? "border-error" : "border-ink-muted"
        } ${className ?? ""}`}
        {...inputProps}
      />

      {error ? (
        <p
          id={errorId}
          className="flex items-start gap-1.5 text-caption text-error"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
            className="mt-0.5 shrink-0"
          >
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="8" x2="12" y2="13" />
            <circle cx="12" cy="16" r="0.5" fill="currentColor" />
          </svg>
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
