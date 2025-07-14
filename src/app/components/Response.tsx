import './css/response.css';
import * as Types from '@/lib/types/types_new';

interface ResponseProps {
    chatResponse: Types.TextContentItem;
}


export const Response: React.FC<ResponseProps> = ({chatResponse}) => {

    const BASIC_STYLE = `${chatResponse.isAiResponse ? "AIRESPONSE" : "USERRESPONSE"}`;

    if (typeof chatResponse.items !== 'string') {
        chatResponse.items = JSON.stringify(chatResponse.items);
    }

    if (chatResponse.items.startsWith('<p>') && chatResponse.items.endsWith('</p>')) {
        chatResponse.items = chatResponse.items.slice(3, -4);
    } else if (chatResponse.items.startsWith('<div>') && chatResponse.items.endsWith('</div>')) {
        chatResponse.items = chatResponse.items.slice(5, -6);
    }

    return (
        <>
            {chatResponse.type === "text" && 
                <div className={BASIC_STYLE} dangerouslySetInnerHTML={{ __html: chatResponse.items }}></div>
            }
            {chatResponse.type !== "text" &&
                <div className={BASIC_STYLE}>This response type has not been set up in Response.tsx</div>
            }
        </>
    );
};