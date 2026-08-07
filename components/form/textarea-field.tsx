// components/form/textarea-field.tsx
//
// Multi-line sibling of TextField, same `text-input` token spec (surface
// field, ink-muted border, inset sky-deep focus ring, error border + text
// with a non-color icon). Used for the bilingual product descriptions.

import type { TextareaHTMLAttributes } from "react";

type TextareaFieldProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "id"
> & {
  id: string;
  label: string;
  requiredLabel?: string;
  error?: string;
};

export function TextareaField({
  id,
  label,
  requiredLabel,
  error,
  required,
  className,
  rows = 4,
  ...textareaProps
}: TextareaFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="flex items-baseline gap-2">
        <span className="text-caption text-ink">{label}</span>
        {required && requiredLabel ? (
          <span className="text-caption text-ink-muted">({requiredLabel})</span>
        ) : null}
      </label>

      <textarea
        id={id}
        rows={rows}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-md border bg-surface px-4 py-3 text-body text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-deep ${
          error ? "border-error" : "border-ink-muted"
        } ${className ?? ""}`}
        {...textareaProps}
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
