-- CreateTable
CREATE TABLE "PatternInsight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "insight" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "analysisCount" INTEGER NOT NULL DEFAULT 0,
    "lastAnalysisAt" TIMESTAMP(3),
    "patternType" TEXT,
    "strength" REAL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PatternInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PatternInsight_userId_key" ON "PatternInsight"("userId");
