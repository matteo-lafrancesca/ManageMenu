/**
 * Compresse et redimensionne une image côté client en utilisant un Canvas HTML5.
 * Redimensionne l'image pour qu'elle ne dépasse pas les dimensions maximales spécifiées
 * et la convertit en JPEG avec la qualité demandée pour limiter le poids du fichier.
 *
 * @param file Le fichier d'image original à compresser.
 * @param maxWidth La largeur maximale de l'image finale (défaut: 800).
 * @param maxHeight La hauteur maximale de l'image finale (défaut: 800).
 * @param quality La qualité JPEG (de 0 à 1, défaut: 0.75).
 * @returns Une promesse résolue avec le fichier File compressé en JPEG, ou le fichier d'origine en cas d'erreur.
 */
export async function compressImage(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.75
): Promise<File> {
  // S'assurer que nous sommes dans un environnement de navigateur
  if (typeof window === 'undefined') {
    return file;
  }

  // Ne pas compresser si le fichier n'est pas une image
  if (!file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculer les dimensions avec conservation du ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.warn("Impossible d'obtenir le contexte Canvas 2D pour la compression");
          resolve(file);
          return;
        }

        // Dessiner l'image redimensionnée dans le canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir le canvas en Blob JPEG compressé
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              console.warn("La conversion Canvas en Blob a échoué");
              resolve(file);
              return;
            }
            
            // Construire le nom du fichier en changeant l'extension en .jpg
            const lastDotIndex = file.name.lastIndexOf('.');
            const nameWithoutExtension = lastDotIndex !== -1 ? file.name.substring(0, lastDotIndex) : file.name;
            const newFileName = `${nameWithoutExtension || 'photo'}.jpg`;

            const compressedFile = new File([blob], newFileName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            console.log(`[ImageCompression] Fichier d'origine: ${(file.size / 1024).toFixed(1)} Ko, Fichier compressé: ${(compressedFile.size / 1024).toFixed(1)} Ko`);
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = (err) => {
        console.error("Erreur de chargement de l'image pour la compression:", err);
        resolve(file);
      };
    };

    reader.onerror = (err) => {
      console.error("Erreur lors de la lecture du fichier pour la compression:", err);
      resolve(file);
    };
  });
}
