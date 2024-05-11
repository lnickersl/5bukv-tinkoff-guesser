import {useCallback, useEffect, useState} from 'react';
import style from './App.module.scss';
import Word from './components/Word';
import {ELetterState, TCoords, TLetter, TWord} from './types';
import {WordSolver} from './helpers/WordSolver';
import Suggestions from './components/Suggestions';

const LETTERS = 5;
const WORDS = 6;

const RESULT_LIMIT = 30;
const RESULT_INCREASE = 10;

type Result = { total: number, results: string[] };

const initLetter = (): TLetter => ({
    value: null,
    state: ELetterState.EMPTY,
});

const initWord = (): TWord => ({ letters: Array(LETTERS).fill(initLetter()) });

const initWords = () => Array(WORDS).fill(initWord());

const solver = new WordSolver();

function App() {
    const [words, setWords] = useState<TWord[]>(initWords());
    const [answers, setAnswers] = useState<Result>({ total: 0, results: [] });
    const [helpers, setHelpers] = useState<Result>({ total: 0, results: [] });

    const [answersLimit, setAnswersLimit] = useState<number>(RESULT_LIMIT);
    const [helpersLimit, setHelpersLimit] = useState<number>(RESULT_LIMIT);

    const [active, setActive] = useState<TCoords | null>(null);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (solver.dictionary.length !== 0) return;

        const loadDictionary = async () => {
            await solver.loadDictionary();

            setIsLoading(false);
        };
        loadDictionary();
    }, []);

    useEffect(() => {
        solver.setInputWords(words);
    }, [words]);

    useEffect(() => {
        const answers = solver.getAnswers();

        setAnswers({ 
            total: answers.length, 
            results: [...answers.slice(0, answersLimit)] 
        });
    
    }, [words, isLoading, answersLimit]);

    useEffect(() => {
        const helpers = solver.getHelpers();

        setHelpers({ 
            total: helpers.length, 
            results: [...helpers.slice(0, helpersLimit)]
        });
    }, [words, isLoading, helpersLimit]);

    const updateWord = (prevWords: TWord[], wordIndex: number, word: TWord): TWord[] => {
        return [ ...prevWords.slice(0, wordIndex), word, ...prevWords.slice(wordIndex + 1)];
    }

    const updateLetter = (word: TWord, letterIndex: number, letter: TLetter): TWord => {
        return { letters: [ ...word.letters.slice(0, letterIndex), letter, ...word.letters.slice(letterIndex + 1)] };
    }

    const onInput = useCallback((wordIndex: number) => (letterIndex: number) => (input: Partial<TLetter>) => {
        let oldLetter = words?.[wordIndex]?.letters?.[letterIndex];

        let inputLetter = {...oldLetter, ...input};

        setWords((prevWords) => {
            const newWord = updateLetter(prevWords[wordIndex], letterIndex, inputLetter);

            return updateWord(prevWords, wordIndex, newWord)
        });
    }, [words]);

    const switchActive = useCallback((callback: (value: TCoords | null) => TCoords | null) => {
        setActive((oldActive) => {
            const newActive = callback(oldActive);

            return newActive;
        });
    }, [setActive]);

    const makeActive = useCallback((wordIndex: number) => (letterIndex: number) => () => {
        switchActive(() => [wordIndex, letterIndex]);
    }, [switchActive]);

    const moveActive =  useCallback((vector: TCoords) => {
        switchActive((coords) => {
            if (!coords) return null;

            let wordI = coords[0];
            let letterI = coords[1];

            let wordV = vector[0];
            let letterV = vector[1];

            if (letterV !== 0) {
                letterI += letterV;
                if (letterI > LETTERS - 1) {
                    wordV++;
                    if (wordI + wordV < WORDS) {
                        letterI = 0;
                    } else {
                        letterI = LETTERS - 1;
                    }
                }
                if (letterI < 0) {
                    wordV--;
                    if (wordI + wordV >= 0) {
                        letterI = LETTERS - 1;
                    } else {
                        letterI = 0;
                    }
                }
            }

            if (wordV !== 0) {
                wordI += wordV;

                if (wordI < 0) wordI = 0;
                if (wordI > WORDS - 1) wordI = WORDS - 1;
            }

            return [wordI, letterI];
        });
    }, [switchActive]);

    const handleClick = useCallback((event: React.MouseEvent) => {
        switchActive(() => null);
    }, [switchActive]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLElement>) => {
        switch (event.key) {
            case 'ArrowUp':
                moveActive([-1, 0]);
                break;
            case 'ArrowDown':
                moveActive([1, 0]);
                break;
            case 'ArrowLeft':
                moveActive([0, -1]);
                break;
            case 'ArrowRight':
                moveActive([0, 1]);
                break;
        }
    }, [moveActive]);

    const findEmptyWord = useCallback(() => {
        for (let index in words) {
            if (words[index].letters.every((letter) => letter.value === null)) return Number(index);
        }
        return null;
    }, [words]);

    const handleSelectSuggestion = useCallback((word: string) => () => {
        const emptyWordIndex = findEmptyWord();

        if (emptyWordIndex === null) return;

        let newWord = word.split('').map((letter) => ({
            value: letter,
            state: ELetterState.WRONG,
        }));

        setWords((prevWord) => updateWord(prevWord, emptyWordIndex, { letters: newWord }));
        setActive(null);

    }, [findEmptyWord, setWords]);

    const addAnswersLimit = useCallback(() => {
        setAnswersLimit((oldLimit) => oldLimit + RESULT_INCREASE);
    }, [setAnswersLimit]);

    const addHelpersLimit = useCallback(() => {
        setHelpersLimit((oldLimit) => oldLimit + RESULT_INCREASE);
    }, [setHelpersLimit]);

    const isActive = (wordIndex: number) => (letterIndex: number) => {
        return wordIndex === active?.[0] && letterIndex === active?.[1];
    };

    return (
        <div className={style.app} onKeyDown={handleKeyDown} onClick={handleClick}>
            <div className={style.game}>
                <header className={style.title}>
                    <div>Помощник "5 букв"</div>
                </header>
                <div className={style.field}>
                    {words.map((word, wordIndex) => <Word key={wordIndex} onInput={onInput(wordIndex)} setActive={makeActive(wordIndex)} moveActive={moveActive} isActive={isActive(wordIndex)} word={word} />)}
                </div>
                { isLoading ? (<div>{'Загрузка...'}</div>) : (
                    <div className={style.solution}>
                        <Suggestions 
                            title={`Возможные ответы (${answers.total}):`} 
                            emptyMsg = {'Варианты слов не найдены'}  
                            loadMore={addAnswersLimit} 
                            selectSuggestion={handleSelectSuggestion} 
                            suggestions={answers.results} 
                            overflows={answers.total > answersLimit}
                        />
                        <Suggestions 
                            title={'Слова для сужения круга ответов:'} 
                            emptyMsg = {''} 
                            loadMore={addHelpersLimit} 
                            selectSuggestion={handleSelectSuggestion} 
                            suggestions={helpers.results} 
                            overflows={helpers.total > helpersLimit}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
