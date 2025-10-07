-- CreateTable
CREATE TABLE "conversoes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigoTs" TEXT NOT NULL,
    "resultado" TEXT NOT NULL,
    "prompt" TEXT,
    "modelo" TEXT NOT NULL DEFAULT 'gpt-4',
    "tokens" INTEGER,
    "tempo" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
