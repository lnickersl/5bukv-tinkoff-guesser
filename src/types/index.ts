export enum ELetterState {
    EMPTY,
    WRONG,
    PRESENT,
    PLACED,
}

export type TLetter = {
    value: string | null;
    state: ELetterState;
};

export type TWord = {
    letters: TLetter[];
};

export type TOnInput = (letter: string) => void;

export type TCoords = [number, number];