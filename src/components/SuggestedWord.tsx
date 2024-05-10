import {FC} from 'react';
import style from '../App.module.scss'

type Props = {
    word: string;
    onClick?: Function;
};

const SuggestedWord: FC<Props> = ({
    word,
    onClick,
}) => {
    return (
        <span className={style.solutionWord} onClick={(event: React.MouseEvent) => onClick?.(event)} style={{ marginLeft: '5px' }}>{word}</span>
    );
}

export default SuggestedWord;