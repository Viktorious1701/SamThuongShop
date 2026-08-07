// components/form/select-field.tsx
//
// Select sibling of TextField, same `text-input` token spec. Used for the
// variant format picker (Physical Print / Digital Download).

import type { SelectHTMLAttributes } from "react";

type Option = { value: string; label: string };

type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> & {
  id: string;
  label: string;
  options: Option[];
  error?: string;
};

export function SelectField({
  id,
  label,
  options,
  error,
  className,
  ...selectProps
}: SelectFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-caption text-ink">
        {label}
      </label>

      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-md border bg-surface px-4 py-3 text-body text-ink focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-deep ${
          error ? "border-error" : "border-ink-muted"
        } ${className ?? ""}`}
        {...selectProps}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error ? (
        <p id={errorId} className="text-caption text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
