// components/form/submit-button.tsx
//
// button-primary token (DESIGN.md): pill, solid sky-deep fill, white
// caption-weight label, padding py-3/px-5. Focus ring is `ink` (not
// sky-deep) offset 2px — a same-hue ring on a sky-deep fill is invisible
// and is forbidden by the token spec. Disabled (incl. while the action is
// in flight) swaps to the surface-sunken/ink-muted pair.

"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-sky-deep px-5 py-3 text-caption text-white transition-colors hover:bg-[#3D5464] focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 disabled:bg-surface-sunken disabled:text-ink-muted"
    >
      {children}
    </button>
  );
}
