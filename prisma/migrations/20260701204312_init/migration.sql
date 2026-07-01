-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "repas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "titre" TEXT NOT NULL,
    "recette" TEXT,
    "photo_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "repas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ingredients" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "repas_id" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "quantite" TEXT,
    "categorie" TEXT NOT NULL,
    CONSTRAINT "ingredients_repas_id_fkey" FOREIGN KEY ("repas_id") REFERENCES "repas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "programmation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "repas_id" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "heure" INTEGER NOT NULL,
    CONSTRAINT "programmation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "programmation_repas_id_fkey" FOREIGN KEY ("repas_id") REFERENCES "repas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
