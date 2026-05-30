-- CreateTable
CREATE TABLE "HotelSearchHistory" (
    "id" SERIAL NOT NULL,
    "query" TEXT NOT NULL,
    "hotelId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HotelSearchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HotelSearchHistory_createdAt_idx" ON "HotelSearchHistory"("createdAt");

-- CreateIndex
CREATE INDEX "HotelSearchHistory_hotelId_idx" ON "HotelSearchHistory"("hotelId");

-- AddForeignKey
ALTER TABLE "HotelSearchHistory" ADD CONSTRAINT "HotelSearchHistory_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
