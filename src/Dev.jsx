import { useState, useEffect, useRef } from 'react'
import DocBubble from './components/DocBubble'

const doc0 = ['testing.md', ['this is a chunk', 'quadratic complexity is a beast']]

function sum(arr) {
    return arr.reduce((acc, x) => acc + x, 0)
}

function calcCutoff(arrs, num) {
    const flat = [].concat(...arrs)
    flat.sort((a, b) => a - b)
    const num1 = Math.min(flat.length, num)
    return flat[flat.length - num1]
}

export default function Dev() {
    const [docs, setDocs] = useState([doc0])
    const [simil, setSimil] = useState(null)
    const [number, setNumber] = useState(10)
    const [query, setQuery] = useState('')

    async function fetchDocs() {
        const response = await fetch('http://localhost:8000/chunks', {
            method: 'GET'
        })
        const data = await response.json()
        setDocs(data)
    }

    async function fetchSimil() {
        const response = await fetch('http://localhost:8000/simil', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: query })
        })
        let data = await response.json()
        setSimil(data)
    }

    function onQueryKeyDown(e) {
        if (e.key === 'Enter') {
            e.preventDefault()
            fetchSimil()
        }
    }

    useEffect(() => {
        fetchDocs()
    }, [])

    // compute target cutoff for number
    const cut = (simil != null) ? calcCutoff(simil, number) : Infinity

    // compute total number of characters
    const pairs = docs.map(([title, chunks], index) =>
        (simil == null) ? [title, []] : [title, chunks
            .map((c, j) => [c, simil[index][j]])
            .filter(([c, s]) => s >= cut)
    ])

    // get full context size
    const context = sum(pairs.map(([title, chunks]) =>
        sum(chunks.map(([c, s]) => c.length))
    ))

    return (
        <div className="flex flex-row justify-start w-full h-full">
            <div id="side-bar" className="w-[20%] h-full p-5 border-r border-[#888]">
                <textarea
                    type="text"
                    rows="10"
                    autoFocus
                    placeholder="Type your query here..."
                    className="text-md font-mono p-3 rounded border border-[#888] focus:outline-none resize-none w-full"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => onQueryKeyDown(e)}
                ></textarea>
                <div className="flex flex-col mt-5">
                    <span className="smallcaps">chunks: {number}</span>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={number}
                        onChange={e => setNumber(e.target.value)}
                    />
                </div>
                <div className="mt-10">
                    <div className="smallcaps font-bold">Stats</div>
                    <div className="smallcaps">context (chars): {context}</div>
                </div>
            </div>
            <div id="chat-box" className="text-lg p-5 flex flex-col items-center w-[80%] overflow-scroll">
                <div id="message-list" className="flex flex-col gap-8 w-full">
                    {pairs.map(([title, chunks], index) => (
                        <DocBubble key={index} title={title}>{chunks}</DocBubble>
                    ))}
                </div>
            </div>
        </div>
    )
}
