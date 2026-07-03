-- CreateIndex
CREATE INDEX "programmation_user_id_idx" ON "programmation"("user_id");

-- CreateIndex
CREATE INDEX "programmation_repas_id_idx" ON "programmation"("repas_id");

-- CreateIndex
CREATE INDEX "repas_user_id_idx" ON "repas"("user_id");

-- CreateIndex
CREATE INDEX "repas_ingredients_repas_id_idx" ON "repas_ingredients"("repas_id");

-- CreateIndex
CREATE INDEX "repas_ingredients_ingredient_id_idx" ON "repas_ingredients"("ingredient_id");

-- CreateIndex
CREATE INDEX "shopping_list_extras_user_id_idx" ON "shopping_list_extras"("user_id");

-- CreateIndex
CREATE INDEX "shopping_list_extras_repas_id_idx" ON "shopping_list_extras"("repas_id");

-- CreateIndex
CREATE INDEX "shopping_list_extras_ingredient_id_idx" ON "shopping_list_extras"("ingredient_id");
