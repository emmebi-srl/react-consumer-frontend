import { atom, useAtom, useSetAtom } from 'jotai';

export const activeParagraphIndexAtom = atom<number | null>(null);
export const useSetActiveParagraphIndex = () => useSetAtom(activeParagraphIndexAtom);
export const useActiveParagraphIndex = () => useAtom(activeParagraphIndexAtom);

export const activeGeneralInfoAtom = atom<boolean | null>(true);
export const useActiveGeneralInfo = () => useAtom(activeGeneralInfoAtom);

export const editModeAtom = atom<boolean>(false);
export const useSetEditMode = () => useSetAtom(editModeAtom);
export const useEditMode = () => useAtom(editModeAtom);
