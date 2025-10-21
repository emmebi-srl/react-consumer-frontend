// Define global variables

export {};

declare global {
  interface Window {
    mapHandler: ReturnType<typeof import('~/components/Maps/MapHandler').createMapHandler> | null | undefined;
  }
}
