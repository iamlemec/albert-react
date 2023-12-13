import Markdown from 'react-markdown'

function trimPrefix(text) {
    return text.replace(/^(Answer|Response|ANSWER|RESPONSE|answer|response|A): */, '');
}

export default function QueryBubble({ type, query, reply }) {
    return (
        <div className="flex flex-col border border-[#666] w-full rounded-[4px]">
            <div className="flex flex-row bg-[#eee] rounded-t-[4px] last:rounded-b-[4px]">
                <div className="w-24 text-center smallcaps font-bold border-r border-[#666] p-3">{type}</div>
                <div className="p-3">{query}</div>
            </div>
            {reply.length > 0 &&
                <div className="reply p-3 border-t border-[#666]">
                    <Markdown>{trimPrefix(reply)}</Markdown>
                </div>
            }
        </div>
    )
}
