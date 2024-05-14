import {LetterNode} from './LetterNode';

export class WordGraph {
    private letterMap = new Map<string, [ letter: LetterNode, strength: number ]>();

    public create(dictionary: string[]) {
        this.letterMap = new Map();

        dictionary.forEach((word) => {
            let letters = new Set(word);

            for (let primary of letters) {
                let primaryLetter = this.getLetter(primary);
                let primaryNode = primaryLetter[0];
                
                for (let secondary of letters) {
                    if (primary === secondary) continue;
                    
                    let secondaryNode = this.getLetter(secondary)[0];
                    
                    primaryNode.addConnection(secondaryNode);
                }

                primaryLetter[1]++;
            }
        });
    }

    public wordValue(word: string, knownLetters: Set<string>) {
        let letters = new Set(word);

        let total = 0;

        let exclude = new Set([...letters, ...knownLetters]);

        letters.forEach((primary) => {
            if (knownLetters.has(primary)) return;
             
            let primaryLetter = this.getLetter(primary);

            total += primaryLetter[0].total(exclude);
        });

        return total;
    }

    private getLetter(value: string) {
        let letter = this.letterMap.get(value);

        if (!letter) {
            letter = [new LetterNode(value), 0];

            this.letterMap.set(value, letter)
        }

        return letter;
    }
}