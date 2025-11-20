const processingInteractions = new Set<string>();

export const startProcessing = (interactionId: string) => {
  processingInteractions.add(interactionId);
};

export const stopProcessing = (interactionId: string) => {
  processingInteractions.delete(interactionId);
};

export const isProcessing = (interactionId: string): boolean => {
  return processingInteractions.has(interactionId);
};

export const clearProcessingState = () => {
  processingInteractions.clear();
};
