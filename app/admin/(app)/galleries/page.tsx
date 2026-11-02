// app/admin/(app)/galleries/page.tsx
//
// Story 1.6 — the operator's portfolio tree: top-level groups / standalone
// galleries, each group's child galleries indented beneath it. The (app)
// layout guards on the operator role (AD-9); requireOperator() here is
// belt-and-braces, matching the products page.

import Link from "next/link";
import { requireOperator } from "@/lib/server/require-operator";
import { listGalleryTree, type AdminGalleryNode } from "@/lib/server/portfolio";
import { GalleryRowControls } from "./gallery-row-controls";

function StatusPill({ published }: { published: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-caption ${
        published ? "bg-sage-soft/20 text-sage-deep" : "bg-surface-sunken text-ink-muted"
      }`}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}

function Row({
  g,
  kind,
  isFirst,
  isLast,
}: {
  g: Omit<AdminGalleryNode, "children">;
  kind: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4">
      <div className="min-w-0 flex-1">
        <p className="truncate text-body text-ink">{g.nameEn}</p>
        <p className="truncate text-caption text-ink-muted">
          {g.nameVi} · {kind} · /portfolio/{g.slug}
        </p>
      </div>
      <StatusPill published={g.published} />
      <GalleryRowControls
        id={g.id}
        name={g.nameEn}
        published={g.published}
        isFirst={isFirst}
        isLast={isLast}
      />
    </div>
  );
}

export default async function GalleriesPage() {
  await requireOperator();
  const tree = await listGalleryTree();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-h2 text-ink">Portfolio</h1>
          <p className="text-caption text-ink-muted">
            Groups (e.g. Chim Việt Nam) hold galleries; galleries (e.g. Tràm
            Chim) hold images. Visitors only see published galleries that have
            images.
          </p>
        </div>
        <Link
          href="/admin/galleries/new"
          className="shrink-0 rounded-full bg-sky-deep px-5 py-3 text-caption text-white transition-colors hover:bg-[#3D5464]"
        >
          + New gallery
        </Link>
      </div>

      {tree.length === 0 ? (
        <p className="text-body text-ink-muted">
          No galleries yet. Create a group such as “Chim Việt Nam”, then add
          galleries inside it — or create a standalone gallery.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border bg-surface">
          {tree.map((g, i) => {
            const isGroup = g.children.length > 0;
            const kind = isGroup
              ? `Group · ${g.children.length} galler${g.children.length === 1 ? "y" : "ies"}`
              : `${g.imageCount} image${g.imageCount === 1 ? "" : "s"}`;
            return (
              <li key={g.id}>
                <Row g={g} kind={kind} isFirst={i === 0} isLast={i === tree.length - 1} />
                {isGroup ? (
                  <ul className="ml-6 border-l border-border">
                    {g.children.map((c, j) => (
                      <li key={c.id}>
                        <Row
                          g={c}
                          kind={`${c.imageCount} image${c.imageCount === 1 ? "" : "s"}`}
                          isFirst={j === 0}
                          isLast={j === g.children.length - 1}
                        />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
