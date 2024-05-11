import {FC} from 'react';
import LetterInput from './LetterInput';
import {TCoords, TLetter, TWord} from '../types';
import style from '../App.module.scss';

type Props = {
    onInput: (letterIndex: number) => (input: Partial<TLetter>) => void,
    word: TWord,
    setActive: (letterIndex: number) => () => void,
    moveActive: (vector: TCoords) => void,
    isActive: (letterIndex: number) => boolean,
}

const Word: FC<Props> = ({ 
    onInput,
    word,
    setActive,
    moveActive,
    isActive,
}) => {
    return (
        <div className={style.word}>
            {word.letters.map((letter, letterIndex) => {
                return <LetterInput key={letterIndex} onInput={onInput(letterIndex)} setActive={setActive(letterIndex)} moveActive={moveActive} isActive={isActive(letterIndex)} letter={letter} />
            })}
        </div>
    );
}

export default Word;