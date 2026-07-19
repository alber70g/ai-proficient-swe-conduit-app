-- CreateTable
CREATE TABLE "_UserMutes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_UserMutes_AB_unique" ON "_UserMutes"("A", "B");

-- CreateIndex
CREATE INDEX "_UserMutes_B_index" ON "_UserMutes"("B");

-- AddForeignKey
ALTER TABLE "_UserMutes" ADD CONSTRAINT "_UserMutes_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserMutes" ADD CONSTRAINT "_UserMutes_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
