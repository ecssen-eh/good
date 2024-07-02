-- CreateTable
CREATE TABLE "CauseDraftPublication" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "profileId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CauseDraftPublication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cause" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "publicationId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "profileAddress" TEXT NOT NULL,

    CONSTRAINT "Cause_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CauseDonation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "causeId" UUID NOT NULL,
    "fromProfileId" TEXT NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "txHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CauseDonation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CauseDraftPublication_profileId_idx" ON "CauseDraftPublication"("profileId");

-- CreateIndex
CREATE INDEX "CauseDraftPublication_createdAt_updatedAt_idx" ON "CauseDraftPublication"("createdAt", "updatedAt");

-- AddForeignKey
ALTER TABLE "CauseDonation" ADD CONSTRAINT "CauseDonation_causeId_fkey" FOREIGN KEY ("causeId") REFERENCES "Cause"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

