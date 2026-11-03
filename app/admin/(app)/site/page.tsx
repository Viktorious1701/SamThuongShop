// app/admin/(app)/site/page.tsx
//
// Portfolio-only revamp (R4) — "Site": everything on the public site that
// isn't a gallery (Home hero + tagline, About, record, contact).

import { requireOperator } from "@/lib/server/require-operator";
import { getSiteContent } from "@/lib/server/site-content";
import { listImageOptions } from "@/lib/server/portfolio";
import { SiteEditor } from "./site-editor";

// The portrait upload resizes a full-resolution photo with sharp.
export const maxDuration = 60;

export default async function SitePage() {
  await requireOperator();
  const [content, photos] = await Promise.all([getSiteContent(), listImageOptions()]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-h2 text-ink">Site</h1>
        <p className="text-caption text-ink-muted">
          The Home page, the About page and your contact details. Write Vietnamese first; English
          can be left empty and the site will show the Vietnamese.
        </p>
      </div>
      <SiteEditor initial={content} photos={photos} />
    </div>
  );
}
