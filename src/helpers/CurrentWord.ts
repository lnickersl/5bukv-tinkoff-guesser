export class CurrentWord {
    private currentLetters: Map<string, number[]> = new Map();

    constructor(word: string) {
        for (let i = 0; i < word.length; i++) {
            this.addLetter(word[i], 1 + Number(i));
        }
    }

    public excludePresentLetter(value: string, exc: number[]) {
        let exclude = new Set(exc);
        let positions = this.currentLetters.get(value);

        if (!positions) return false;

        for (let pos of positions) {
            if (exclude.has(pos)) return false;
        }

        return true;
    }

    public includePlacedLetter(value: string, position: number) {
        let positions = this.currentLetters.get(value);

        if (!positions) return false;

        return positions.some(pos => pos === position);
    }

    private addLetter(value: string, position: number) {
        let positions = this.currentLetters.get(value);

        if (!positions) {
            positions = [];
            this.currentLetters.set(value, positions);
        }

        positions.push(position);
    }
}