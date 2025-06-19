import './css/response.css';
import { ChatResponse } from '../../lib/types/types';

interface ResponseProps {
    chatResponse: ChatResponse;
    removeFromHistory: (index: number) => void;
}


export const Response: React.FC<ResponseProps> = ({chatResponse, removeFromHistory}) => {

    const BASIC_STYLE = `${chatResponse.isAiResponse ? "AIRESPONSE" : "USERRESPONSE"}`;

    const removeResponse = () => {
        removeFromHistory(chatResponse.id);
    };

    if (chatResponse.body.startsWith('<p>') && chatResponse.body.endsWith('</p>')) {
        chatResponse.body = chatResponse.body.slice(3, -4);
    } else if (chatResponse.body.startsWith('<div>') && chatResponse.body.endsWith('</div>')) {
        chatResponse.body = chatResponse.body.slice(5, -6);
    }

    return (
        <>
            {chatResponse.type === "response" && 
                <div className={BASIC_STYLE} dangerouslySetInnerHTML={{ __html: chatResponse.body }}></div>
            }
            {chatResponse.type !== "response" &&
                <div className={BASIC_STYLE}>This response type has not been set up in Response.tsx</div>
            }
        </>
    );
};