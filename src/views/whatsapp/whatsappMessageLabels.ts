/** Media and other non-text messages are stored without text: label what the customer sent. */
export const whatsappMessageTypeLabels: Record<string, string> = {
  image: 'Immagine',
  audio: 'Audio',
  video: 'Video',
  document: 'Documento',
  sticker: 'Sticker',
  location: 'Posizione',
  contacts: 'Contatto',
  reaction: 'Reazione',
};

export const getWhatsappMessageText = (text: string | null | undefined, type: string) =>
  text || whatsappMessageTypeLabels[type] || `Messaggio di tipo "${type}"`;
