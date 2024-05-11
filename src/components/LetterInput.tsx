import {FC, useCallback, useEffect, useRef} from 'react';
import style from '../App.module.scss';
import {ELetterState, TCoords, TLetter} from '../types';

type Props = {
    onInput: (inputLetter: Partial<TLetter>) => void,
    letter: TLetter,
    setActive: () => void,
    moveActive: (vector: TCoords) => void,
    isActive: boolean,
}

const nextState = {
    [ELetterState.WRONG]: ELetterState.PRESENT,
    [ELetterState.PRESENT]: ELetterState.PLACED,
    [ELetterState.PLACED]: ELetterState.WRONG,
}

const stateClass = {
    [ELetterState.EMPTY]: style.letterEmpty,
    [ELetterState.WRONG]: style.letterWrong,
    [ELetterState.PRESENT]: style.letterPresent,
    [ELetterState.PLACED]: style.letterPlaced,
}

const LetterInput: FC<Props> = ({
    onInput,
    letter,
    setActive,
    moveActive,
    isActive,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleInput = useCallback((event: React.FormEvent<HTMLInputElement>) => {
        const nativeEvent = event.nativeEvent as InputEvent;

        event.preventDefault();

        if (!nativeEvent.data) return;

        const input = nativeEvent.data.slice(0, 1);

        if (!/[абвгдеёжзийклмнопрстуфхцчшщъыьэюя]/i.test(input)) return;

        let inputLetter = input.toUpperCase();

        if (inputLetter === 'Ё') {
            inputLetter = 'Е';
        }

        event.currentTarget.value = inputLetter;

        moveActive([0, 1]);

        if (letter.value === inputLetter) return;

        onInput({ value: inputLetter, state: ELetterState.WRONG });
    }, [onInput, moveActive, letter]);

    const handleContextMenu = useCallback((event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        if (letter.state === ELetterState.EMPTY) return;

        onInput({ state: nextState[letter.state] })
    }, [onInput, letter]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Backspace' || event.key === 'Delete') {
            event.currentTarget.value = '';

            onInput({ value: null, state: ELetterState.EMPTY});
            
            moveActive([0, event.key === 'Backspace' ? -1 : 1]);
        }
    }, [onInput, moveActive]);

    const handleClick = useCallback((event: React.MouseEvent) => {
        if (isActive) return handleContextMenu(event);

        event.stopPropagation();

        setActive();
    }, [setActive, isActive, handleContextMenu]);

    useEffect(() => {
        if (isActive) {
            inputRef.current?.focus();
        }
    }, [isActive]);

    const classNames = [style.letterBox, stateClass[letter.state]];
    
    if (isActive) classNames.push(style.letterActive);

    return (
        <label className={style.letterBoxLabel}>
            <div 
                className={classNames.join(' ')}
                onContextMenu={handleContextMenu}
                onClick={(event: React.MouseEvent) => event.stopPropagation()}
            >
                {letter.value || <>&nbsp;</>}
            </div>
            <input
                ref={inputRef}
                type="url"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                unselectable="on"
                pattern="[АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя]"
                className={style.letterInput}
                onClick={handleClick}
                onInputCapture={handleInput}
                onKeyDown={handleKeyDown}
                translate="no"
            />
        </label>
    );
  }
  
  export default LetterInput;