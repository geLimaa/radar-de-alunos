-- CreateEnum
CREATE TYPE "StudyYear" AS ENUM ('high_school_1', 'high_school_2', 'high_school_3', 'prep');

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('standard', 'premium', 'elite');

-- CreateEnum
CREATE TYPE "SchoolType" AS ENUM ('public', 'private');

-- CreateEnum
CREATE TYPE "MentorshipFrequency" AS ENUM ('monthly', 'biweekly');

-- CreateTable
CREATE TABLE "ClusteringRun" (
    "id" TEXT NOT NULL,
    "seed" INTEGER NOT NULL,
    "referenceDate" DATE NOT NULL,
    "studentCount" INTEGER NOT NULL,
    "k" INTEGER NOT NULL,
    "features" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClusteringRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cluster" (
    "id" TEXT NOT NULL,
    "clusterNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "featureMeans" JSONB NOT NULL,
    "runId" TEXT NOT NULL,

    CONSTRAINT "Cluster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "sourceId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "studyYear" "StudyYear" NOT NULL,
    "plan" "Plan" NOT NULL,
    "enrolledAt" DATE NOT NULL,
    "daysSinceLastActivity" INTEGER,
    "lessonsLast30d" INTEGER NOT NULL,
    "completedMentorships" INTEGER NOT NULL,
    "missedMentorships" INTEGER NOT NULL,
    "avgMentorshipRating" DOUBLE PRECISION,
    "simulationsTaken" INTEGER NOT NULL,
    "avgEssayScore" DOUBLE PRECISION,
    "tenureDays" INTEGER NOT NULL,
    "desiredCourse" TEXT NOT NULL,
    "schoolType" "SchoolType" NOT NULL,
    "mentorshipFrequency" "MentorshipFrequency" NOT NULL,
    "correctRateLanguages" DOUBLE PRECISION,
    "correctRateHuman" DOUBLE PRECISION,
    "correctRateNature" DOUBLE PRECISION,
    "correctRateMath" DOUBLE PRECISION,
    "essaysSubmitted" INTEGER NOT NULL,
    "runId" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Cluster_runId_idx" ON "Cluster"("runId");

-- CreateIndex
CREATE UNIQUE INDEX "Cluster_runId_clusterNumber_key" ON "Cluster"("runId", "clusterNumber");

-- CreateIndex
CREATE INDEX "Student_runId_idx" ON "Student"("runId");

-- CreateIndex
CREATE INDEX "Student_clusterId_idx" ON "Student"("clusterId");

-- CreateIndex
CREATE INDEX "Student_daysSinceLastActivity_idx" ON "Student"("daysSinceLastActivity");

-- CreateIndex
CREATE UNIQUE INDEX "Student_runId_sourceId_key" ON "Student"("runId", "sourceId");

-- AddForeignKey
ALTER TABLE "Cluster" ADD CONSTRAINT "Cluster_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ClusteringRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ClusteringRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "Cluster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
