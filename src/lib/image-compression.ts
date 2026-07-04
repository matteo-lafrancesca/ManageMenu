/**
 * Compresse et redimensionne une image côté client via Canvas HTML5.
 *
 * Stratégie :
 * 1. Redimensionne l'image pour qu'elle ne dépasse pas maxWidth × maxHeight en conservant le ratio.
 * 2. Encode en WebP si le navigateur le supporte (meilleur ratio qualité/poids), sinon en JPEG.
 * 3. Si le fichier résultant dépasse `targetSizeKB`, réduit la qualité par paliers jusqu'à atteindre
 *    la cible ou atteindre la qualité minimale `minQuality`.
 *
 * @param file         Le fichier image original.
 * @param maxWidth     Largeur maximale de l'image finale (défaut: 1200px).
 * @param maxHeight    Hauteur maximale de l'image finale (défaut: 1200px).
 * @param quality      Qualité initiale (0–1, défaut: 0.82).
 * @param targetSizeKB Taille cible en Ko — si dépassée, on ré-encode avec une qualité réduite (défaut: 350 Ko).
 * @param minQuality   Qualité minimale acceptable, même si la cible n'est pas atteinte (défaut: 0.4).
 * @returns Le fichier File compressé, ou le fichier d'origine en cas d'erreur.
 */
export async function compressImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.82,
  targetSizeKB = 350,
  minQuality = 0.4
): Promise<File> {
  if (typeof window === 'undefined') return file;
  if (!file.type.startsWith('image/')) return file;

  // Détecter le support WebP pour un meilleur taux de compression
  const supportsWebP = (() => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').startsWith('data:image/webp');
    } catch {
      return false;
    }
  })();

  const mimeType = supportsWebP ? 'image/webp' : 'image/jpeg';
  const ext = supportsWebP ? 'webp' : 'jpg';

  // Charger l'image dans un élément <img>
  const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  // Lire le fichier en Data URL
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  let img: HTMLImageElement;
  try {
    img = await loadImage(dataUrl);
  } catch {
    console.error('[ImageCompression] Échec du chargement de l\'image.');
    return file;
  }

  // Calculer les dimensions cibles en conservant le ratio
  let { width, height } = img;
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  // Dessiner l'image redimensionnée dans un canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.warn('[ImageCompression] Impossible d\'obtenir le contexte Canvas 2D.');
    return file;
  }
  ctx.drawImage(img, 0, 0, width, height);

  // Encoder avec la qualité donnée et retourner un File
  const encodeCanvas = (q: number): Promise<File | null> =>
    new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(null); return; }
          const lastDot = file.name.lastIndexOf('.');
          const baseName = lastDot !== -1 ? file.name.slice(0, lastDot) : file.name;
          resolve(
            new File([blob], `${baseName || 'photo'}.${ext}`, {
              type: mimeType,
              lastModified: Date.now(),
            })
          );
        },
        mimeType,
        q
      );
    });

  // Première tentative
  let currentQuality = quality;
  let result = await encodeCanvas(currentQuality);

  if (!result) {
    console.warn('[ImageCompression] La conversion canvas→blob a échoué.');
    return file;
  }

  const targetBytes = targetSizeKB * 1024;

  // Compression adaptative : réduire la qualité par paliers si trop lourd
  while (result.size > targetBytes && currentQuality - 0.08 >= minQuality) {
    currentQuality = parseFloat((currentQuality - 0.08).toFixed(2));
    const attempt = await encodeCanvas(currentQuality);
    if (attempt) result = attempt;
  }

  console.log(
    `[ImageCompression] ${file.name} — Original: ${(file.size / 1024).toFixed(1)} Ko` +
    ` → Compressé (${mimeType}, q=${currentQuality}): ${(result.size / 1024).toFixed(1)} Ko` +
    ` (${width}×${height}px)`
  );

  return result;
}
