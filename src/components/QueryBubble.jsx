export default function QueryBubble({ type, query, reply }) {
    return (
        <div className="flex flex-col border border-[#666] w-full rounded-[4px]">
            <div className="flex flex-row bg-[#eee] border-b border-[#666] rounded-t-[4px]">
                <div className="w-24 text-center smallcaps font-bold border-r border-[#666] p-3">{type}</div>
                <div className="p-3">{query}</div>
            </div>
            <div className="p-3">{reply}</div>
        </div>
    )
}
