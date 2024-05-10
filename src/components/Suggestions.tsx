import {FC} from 'react';
import SuggestedWord from './SuggestedWord';

type Props = {
    title: string;
    suggestions: string[];
    emptyMsg: string;
    loadMore: () => void;
    selectSuggestion: (word: string) => () => void;
    overflows: boolean;
};

const Suggestions: FC<Props> = ({ 
    title,
    suggestions,
    emptyMsg,
    loadMore,
    selectSuggestion,
    overflows,
}) => {
    const stopPropagation = (callback: Function) => (event: React.MouseEvent) => {
        event.stopPropagation();
        return callback();
    };

    return (
            <div style={{maxWidth: '100%'}}>
                <div style={{ fontSize: '30px', marginTop: '20px'}}>{ suggestions.length > 0 ? title : emptyMsg}</div>
                { suggestions.length > 0 &&
                    <div style={{ marginTop: '10px', display: 'flex', flexFlow: 'wrap', maxWidth: '100%'}}>
                        {suggestions.map((suggestion, index) => <SuggestedWord key={index} onClick={stopPropagation(selectSuggestion(suggestion.toUpperCase()))} word={suggestion} />)}
                        {overflows && <SuggestedWord onClick={stopPropagation(loadMore)} word={'Еще...'} />}
                    </div>
                }
            </div>
    );
};

export default Suggestions;