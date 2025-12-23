import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Retries an async operation with exponential backoff.
 */
async function retryOperation<T>(
  operation: () => Promise<T>, 
  maxRetries: number = 3, 
  initialDelay: number = 2000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      // Check for 429 (Resource Exhausted) or 503 (Service Unavailable)
      const isRateLimit = error.status === 429 || 
                          (error.message && (error.message.includes('429') || error.message.toLowerCase().includes('quota')));
      const isServerOverload = error.status === 503;

      if ((isRateLimit || isServerOverload) && i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        console.warn(`Gemini API request failed (Attempt ${i + 1}/${maxRetries}). Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

/**
 * Sends an image to Gemini to generate a subject mask.
 * @param base64Image The base64 encoded string of the image
 * @param mimeType The MIME type of the image
 * @param aspectRatio The target aspect ratio string (e.g., "16:9")
 * @returns The base64 string of the MASK image
 */
export const generateMaskWithGemini = async (
  base64Image: string,
  mimeType: string,
  aspectRatio: string
): Promise<string> => {
  return retryOperation(async () => {
    try {
      const model = "gemini-2.5-flash-image";

      // We explicitly ask for a Binary Mask.
      // White = Subject, Black = Background.
      const prompt = `
        Generate a high-contrast binary mask for the main subject in this image.
        - The subject should be pure WHITE (#FFFFFF).
        - The background should be pure BLACK (#000000).
        - Ensure the composition and framing matches the original image EXACTLY.
        - Do not add any new elements.
        - Edges should be sharp and precise.
      `;

      const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Image
              }
            }
          ]
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any // Cast to any to satisfy TS enum if strict
          }
        }
      });

      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error("No candidates returned from Gemini.");
      }

      const parts = candidates[0].content.parts;
      let resultImageBase64 = "";

      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          resultImageBase64 = part.inlineData.data;
          break;
        }
      }

      if (!resultImageBase64) {
        throw new Error("The model did not return a mask image.");
      }

      return resultImageBase64;

    } catch (error: any) {
      console.error("Gemini API Error:", error);
      throw new Error(error.message || "Failed to generate mask with Gemini.");
    }
  });
};