-- Portfolio-only revamp: species -> caption (not every photo is a bird).
-- Hand-edited from the generated DROP/ADD to RENAME so existing text is kept.
ALTER TABLE "PortfolioImage" RENAME COLUMN "speciesVi" TO "captionVi";
ALTER TABLE "PortfolioImage" RENAME COLUMN "speciesEn" TO "captionEn";

-- CreateTable
CREATE TABLE "SiteContent" (
    "id" TEXT NOT NULL DEFAULT 'site',
    "heroImageId" TEXT,
    "taglineVi" TEXT,
    "taglineEn" TEXT,
    "aboutTeaserVi" TEXT,
    "aboutTeaserEn" TEXT,
    "bioVi" TEXT,
    "bioEn" TEXT,
    "portraitKey" TEXT,
    "portraitOriginalKey" TEXT,
    "portraitWidth" INTEGER,
    "portraitHeight" INTEGER,
    "portraitBlurDataUrl" TEXT,
    "exhibitionsVi" TEXT,
    "exhibitionsEn" TEXT,
    "awardsVi" TEXT,
    "awardsEn" TEXT,
    "pressVi" TEXT,
    "pressEn" TEXT,
    "email" TEXT,
    "facebookUrl" TEXT,
    "zalo" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SiteContent" ADD CONSTRAINT "SiteContent_heroImageId_fkey" FOREIGN KEY ("heroImageId") REFERENCES "PortfolioImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

