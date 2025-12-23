export interface ProcessedImage {
  originalUrl: string;
  processedUrl: string | null;
  fileName: string;
}

export interface ProcessingState {
  isLoading: boolean;
  error: string | null;
}
