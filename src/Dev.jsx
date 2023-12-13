import { useState, useEffect, useRef } from 'react'
import DocBubble from './components/DocBubble'

const doc0 = ['testing.md', ['this is a chunk', 'quadratic complexity is a beast']]

export default function Dev() {
    const [docs, setDocs] = useState([doc0])
    const [query, setQuery] = useState('')

    async function fetchDocs() {
        const response = await fetch('http://localhost:8000/chunks', {
            method: 'GET'
        })
        let data = await response.json()
        console.log(data)
        setDocs(data)
    }

    function onKeyDown(e) {
        if (e.key === 'Enter') {
            // sendMessage()
        }
    }

    useEffect(() => {
        fetchDocs()
    }, [])

    return (
        <div className="flex flex-row justify-start w-full h-full">
            <div id="side-bar" className="w-[20%] h-full p-3 border-r">
                <textarea
                    type="text"
                    rows="10"
                    autoFocus
                    placeholder="Type your query here..."
                    className="text-md font-mono p-3 rounded border border-[#666] focus:outline-none resize-none w-full"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => onKeyDown(e)}
                ></textarea>
            </div>
            <div
                id="chat-box"
                className="text-lg p-3 flex flex-col items-center w-[80%] overflow-scroll no-scrollbar"
            >
                <div id="message-list" className="flex flex-col gap-8 w-full">
                    {docs.map(([title, chunks], index) => (
                        <DocBubble key={index} title={title}>{chunks}</DocBubble>
                    ))}
                </div>
            </div>
        </div>
    )
}
