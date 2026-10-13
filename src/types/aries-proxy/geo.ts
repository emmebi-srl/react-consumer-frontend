export interface Comune {
  id: number;
  name: string;
  province?: string | null;
  postalCode?: string | null;
}

export interface ComuneList {
  comuni: Comune[];
}

export interface Frazione {
  id: number;
  name: string;
  comuneId: number;
}

export interface FrazioneList {
  frazioni: Frazione[];
}
