import {ELetterState, TWord} from '../types';

export class WordSolver {
    private wrongLetters: Set<string> = new Set();
    private presentLetters: Map<string, number[]> = new Map();
    private placedLetters: Map<string, number[]> = new Map();

    private currentLetters: Map<string, number[]> = new Map();
    private letterRanks: Record<string, number> = {};

    public dictionary: string[] = [];

    public setDictionary(dictionary: string[]) {
        if (this.dictionary.length !== 0) return;

        this.dictionary = dictionary;
    }

    public setInputWords(words: TWord[]) {
        this.setLetters(words);
    }

    public getAnswers() {
        const answers = this.evaluateWords((word) => {
            this.currentLetters = new Map();

            for (let i = 0; i < word.length; i++) {
                if (this.wrongLetters.has(word[i])) return false;
            }
    
            this.addCurrentLetters(word);
            
            for (let [value, positions] of this.presentLetters) {
                if (!this.excludePresentLetter(value, positions)) return false;
            }
    
            for (let [value, positions] of this.placedLetters) {
                for (let position of positions) {
                    if (!this.includePlacedLetter(value, position)) return false;
                }
            }
        
            return true;
        });

        return answers;
    }

    public getHelpers() {
        const helpers = this.evaluateWords((word) => {
            this.currentLetters = new Map();

            for (let i = 0; i < word.length; i++) {
                if (
                    this.wrongLetters.has(word[i]) ||
                    this.presentLetters.has(word[i]) ||
                    this.placedLetters.has(word[i])
                ) return false;
            }
    
            this.addCurrentLetters(word);
        
            return true;
        });

        return helpers;
    }

    private setLetters(words: TWord[]) {
        this.wrongLetters = new Set();
        this.presentLetters = new Map();
        this.placedLetters = new Map();

        words.forEach((word) => {
            word.letters.forEach((letter, index) => {
                if (!letter.value) return;

                const value = letter.value.toLocaleLowerCase();

                switch (letter.state) {
                    case ELetterState.WRONG:
                        this.wrongLetters.add(value);
                        break;
                    case ELetterState.PRESENT:
                        this.addLetterToMap(value, index + 1, this.presentLetters);
                        break;
                    case ELetterState.PLACED:
                        this.addLetterToMap(value, index + 1, this.placedLetters);
                        break;
                };
            });
        });
    }

    private evaluateWords(filterFunction: (word: string) => boolean) {
        let checked = this.dictionary.filter(filterFunction)
        
        this.countTopLetters(checked);

        return checked.sort((a, b) => this.getWordValue(b) - this.getWordValue(a));
    }

    private getWordValue(word: string) {
            let set = new Set(word.split(''));
            let value = 0;
            set.forEach(l => {
                value += this.letterRanks[l]
            })
            return value
    }

    private countTopLetters(words: string[]) {
        this.letterRanks = {}

        words.forEach(word => {
            let unique = new Set(word.split(''));

            unique.forEach((letter) => {
                this.letterRanks[letter] = (this.letterRanks[letter] || 0) + 1;
            });
        });
    }

    private excludePresentLetter(value: string, exc: number[]) {
        let exclude = new Set(exc);
        let positions = this.currentLetters.get(value);

        if (!positions) return false;

        for (let pos of positions) {
            if (exclude.has(pos)) return false;
        }

        return true;
    }

    private includePlacedLetter(value: string, position: number) {
        let positions = this.currentLetters.get(value);

        if (!positions) return false;

        return positions.some(pos => pos === position);
    }

    private addCurrentLetters(word: string) {
        for (let i = 0; i < word.length; i++) {
            this.addLetterToMap(word[i], 1 + Number(i), this.currentLetters);
        }
    }

    private addLetterToMap(value: string, position: number, map: Map<string, number[]>) {
        let positions = map.get(value);

        if (!positions) {
            positions = [];
            map.set(value, positions);
        }

        positions.push(position);
    }
}