export interface CommunicationChannel {
  type: string;
  value: string;
}

export const parseCommunicationChannels = (
  data: string | null
): CommunicationChannel[] => {
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error parsing communication channels:", error);
    return [];
  }
};

export const stringifyCommunicationChannels = (
  channels: CommunicationChannel[]
): string => {
  return JSON.stringify(channels);
};
