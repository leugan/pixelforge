/**
 * Loads an image from a source URL or Base64 string.
 */
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error("Failed to load image"));
    img.src = src;
  });
};

/**
 * Calculates the closest supported Gemini aspect ratio for the given dimensions.
 */
export const getGeminiAspectRatio = (width: number, height: number): string => {
  const ratio = width / height;
  
  // Supported Gemini aspect ratios
  const supported = [
    { id: "1:1", val: 1 },
    { id: "4:3", val: 4/3 },
    { id: "3:4", val: 3/4 },
    { id: "16:9", val: 16/9 },
    { id: "9:16", val: 9/16 },
  ];

  // Find the aspect ratio with the smallest difference
  const bestMatch = supported.reduce((prev, curr) => 
    Math.abs(curr.val - ratio) < Math.abs(prev.val - ratio) ? curr : prev
  );

  return bestMatch.id;
};

/**
 * Composites the original image with the generated mask to create a transparent PNG.
 */
export const compositeImageWithMask = async (
  originalUrl: string,
  maskBase64: string
): Promise<string> => {
  const [original, mask] = await Promise.all([
    loadImage(originalUrl),
    loadImage(`data:image/png;base64,${maskBase64}`),
  ]);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error("Could not get canvas context");

  // Set canvas to original image size
  canvas.width = original.naturalWidth;
  canvas.height = original.naturalHeight;

  // 1. Draw Original Image
  ctx.drawImage(original, 0, 0);
  
  // Get the pixel data of the original image
  const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = originalImageData.data;

  // 2. Prepare Mask Data
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = canvas.width;
  maskCanvas.height = canvas.height;
  const maskCtx = maskCanvas.getContext('2d');
  if (!maskCtx) throw new Error("Could not get mask canvas context");

  maskCtx.drawImage(mask, 0, 0, canvas.width, canvas.height);
  const maskImageData = maskCtx.getImageData(0, 0, canvas.width, canvas.height);
  const maskPixels = maskImageData.data;

  // 3. Apply Mask to Alpha Channel
  for (let i = 0; i < data.length; i += 4) {
    const maskValue = maskPixels[i];
    data[i + 3] = maskValue < 10 ? 0 : maskValue; 
  }

  // 4. Put processed data back
  ctx.putImageData(originalImageData, 0, 0);

  return canvas.toDataURL('image/png');
};

/**
 * Performs a Magic Wand selection.
 */
export const performMagicWand = async (
  imageSrc: string,
  startX: number,
  startY: number,
  tolerance: number = 30
): Promise<string> => {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error("Could not get canvas context");

  const width = img.naturalWidth;
  const height = img.naturalHeight;
  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data; 

  const getIndex = (x: number, y: number) => (y * width + x) * 4;

  const startIndex = getIndex(startX, startY);
  const startR = data[startIndex];
  const startG = data[startIndex + 1];
  const startB = data[startIndex + 2];

  const stack = [[startX, startY]];
  const visited = new Uint8Array(width * height); 

  const matches = (r: number, g: number, b: number) => {
    return (
      Math.abs(r - startR) <= tolerance &&
      Math.abs(g - startG) <= tolerance &&
      Math.abs(b - startB) <= tolerance
    );
  };

  while (stack.length > 0) {
    const pop = stack.pop();
    if (!pop) break;
    const [x, y] = pop;

    const pixelIndex = y * width + x;
    if (visited[pixelIndex]) continue;
    visited[pixelIndex] = 1;

    const idx = pixelIndex * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    if (matches(r, g, b)) {
      data[idx + 3] = 0;
      if (x > 0) stack.push([x - 1, y]);
      if (x < width - 1) stack.push([x + 1, y]);
      if (y > 0) stack.push([x, y - 1]);
      if (y < height - 1) stack.push([x, y + 1]);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
};

/**
 * Resizes an image to target dimensions.
 */
export const resizeImage = async (
  imageSrc: string,
  targetWidth: number,
  targetHeight: number
): Promise<string> => {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Could not get canvas context");
  
  // Use better interpolation for downscaling if possible, but default drawImage is decent
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  
  return canvas.toDataURL('image/png');
};

/**
 * Extracts dominant colors from an image.
 */
export const extractColors = async (
  imageSrc: string,
  maxColors: number = 6
): Promise<Array<{r: number, g: number, b: number, hex: string}>> => {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  // Resize to small dimension for faster processing
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Canvas error");

  const sampleSize = 100;
  canvas.width = sampleSize;
  canvas.height = sampleSize;
  ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

  const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
  const colorMap = new Map<string, number>();

  // Quantize and count
  for (let i = 0; i < imageData.length; i += 4) {
    if (imageData[i + 3] < 128) continue; // Ignore transparent pixels

    // Round colors to group similar shades (Quantization)
    const r = Math.round(imageData[i] / 10) * 10;
    const g = Math.round(imageData[i + 1] / 10) * 10;
    const b = Math.round(imageData[i + 2] / 10) * 10;
    
    const key = `${r},${g},${b}`;
    colorMap.set(key, (colorMap.get(key) || 0) + 1);
  }

  // Sort by frequency
  const sorted = [...colorMap.entries()].sort((a, b) => b[1] - a[1]);

  // Convert back to objects
  const colors = sorted.slice(0, maxColors).map(([key]) => {
    const [r, g, b] = key.split(',').map(Number);
    const toHex = (c: number) => c.toString(16).padStart(2, '0');
    return {
      r, g, b,
      hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`
    };
  });

  return colors;
};
