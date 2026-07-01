import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Exporte les handlers GET et POST pour l'API route handler d'Uploadthing
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  // Vous pouvez ajouter des options facultatives ici, par exemple configurer le token
  // config: { token: process.env.UPLOADTHING_TOKEN } (par défaut il lit le process.env.UPLOADTHING_TOKEN)
});
