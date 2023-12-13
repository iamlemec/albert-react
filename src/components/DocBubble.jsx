export default function DocBubble({ title, children }) {
    return (
        <div className="flex flex-col border border-[#666] w-full rounded-[4px]">
            <div className="flex flex-row bg-[#eee] rounded-t-[4px] last:rounded-b-[4px]">
                <div className="w-24 text-center smallcaps font-bold border-r border-[#666] p-3">doc</div>
                <div className="p-3">{title}</div>
            </div>
            <div className="flex flex-col">
                {children.map((child, index) => (
                    <div key={index} className="flex flex-row p-3 border-t border-[#666]">{child}</div>
                ))}
            </div>
        </div>
    )
}
