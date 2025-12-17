export interface CommunicationChannel {
  type: string;
  value: string;
}

export const parseCommunicationChannels = (
  data: string | CommunicationChannel[] | null | undefined
): CommunicationChannel[] => {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data;
  }

  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Error parsing communication channels:", error);
      return [];
    }
  }

  return [];
};

export const stringifyCommunicationChannels = (
  channels: CommunicationChannel[]
): string => {
  return JSON.stringify(channels);
};
