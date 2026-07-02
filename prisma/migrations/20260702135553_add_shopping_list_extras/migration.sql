-- CreateTable
CREATE TABLE "shopping_list_extras" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "ingredient_id" INTEGER,
    "quantite" REAL,
    "unite" TEXT,
    "repas_id" INTEGER,
    "week" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "shopping_list_extras_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "shopping_list_extras_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "shopping_list_extras_repas_id_fkey" FOREIGN KEY ("repas_id") REFERENCES "repas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
