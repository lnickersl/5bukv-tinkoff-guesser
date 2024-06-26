import {ELetterState, TWord} from '../types';
import {CurrentWord} from './CurrentWord';
import {WordBitFLags as WordBitFlags} from './WordBitFlags';

export class WordSolver {
    private wrongLetters: Set<string> = new Set();
    private presentLetters: Map<string, number[]> = new Map();
    private placedLetters: Map<string, number[]> = new Map();

    private topRank = 0;

    public answers: string[] = [];
    public helpers: string[] = [];

    public wordGraph = new WordBitFlags();
    public wordRanks: Record<string, number> = {};

    public dictionary: string[] = [];
    public possibleAnswers: string[] = [];

    public async loadDictionary() {
        if (this.dictionary.length !== 0) return;

        const text = await this.fetchDictionary();

        this.dictionary = text.split('\r\n');
    }

    private fetchDictionary() {
        return fetch(process.env.PUBLIC_URL + '/russian-5-letter-nouns.txt').then((res) => res.text());
    }

    public setInputWords(words: TWord[]) {
        this.setLetters(words);
    }

    private setLetters(words: TWord[]) {
        if (this.dictionary.length === 0) return;

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

        this.possibleAnswers = this.filterAnswers();

        this.createRanks(this.possibleAnswers);

        this.answers = this.possibleAnswers.sort((a, b) => this.getRank(b) - this.getRank(a));

        if (this.topRank === 0) {
            this.helpers = [];
        } else {
            this.helpers = [...this.dictionary].sort((a, b) => this.getRank(b) - this.getRank(a));
        }
    }

    private filterAnswers() {
        return this.dictionary.filter((word) => {
            for (let i = 0; i < word.length; i++) {
                if (this.wrongLetters.has(word[i])) return false;
            }
            
            const currentWord = new CurrentWord(word);
            
            for (let [value, positions] of this.presentLetters) {
                if (!currentWord.excludePresentLetter(value, positions)) return false;
            }
    
            for (let [value, positions] of this.placedLetters) {
                for (let position of positions) {
                    if (!currentWord.includePlacedLetter(value, position)) return false;
                }
            }
        
            return true;
        });
    }

    private addLetterToMap(value: string, position: number, map: Map<string, number[]>) {
        let positions = map.get(value);

        if (!positions) {
            positions = [];
            map.set(value, positions);
        }

        positions.push(position);
    }

    private getRank(word: string) {
        return this.wordRanks[word] || 0;
    }

    private createRanks(words: string[]) {
        const knownLetters = new Set([...this.wrongLetters, ...this.presentLetters.keys(), ...this.placedLetters.keys()]);
        this.wordGraph.create(words);

        this.topRank = 0;
        this.wordRanks = {};

        this.dictionary.forEach((word) => {
            const rank = this.wordGraph.wordValue(word, knownLetters);

            this.wordRanks[word] = rank;

            if (rank > this.topRank) {
                this.topRank = rank;
            }
        });
    }
}