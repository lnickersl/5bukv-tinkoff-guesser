export class WordBitFLags {
    private letterMap = new Map<string, number>();

    private flagDictionary: number[] = [];
    
    constructor() {
        //Creating flags of а-я (32)
        for (let i = 0; i < 32; i++) {
            this.letterMap.set(String.fromCharCode(1072+i), 1 << i);
        }
    }

    public create(dictionary: string[]) {
        this.flagDictionary = [];

        dictionary.forEach((word) => {
            this.flagDictionary.push(this.wordFlags(word));
        });
    }

    public wordValue(word: string, knownLetters: Set<string>) {
        const currentFlags = this.wordFlags(word, knownLetters);
        let count = 0;
        this.flagDictionary.forEach((wordFlags) => {
            if ((currentFlags & wordFlags) !== 0) count++;
        });
        return count;
    }

    private wordFlags(word: string, knownLetters?: Set<string>) {
        let flags = 0;
        (new Set(word)).forEach((letter) => {
            if (knownLetters?.has(letter)) return;

            flags += this.letterMap.get(letter) || 0;
        });
        return flags;
    }
}