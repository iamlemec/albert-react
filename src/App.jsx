import { useState, useEffect, useRef } from 'react'
import QueryBubble from './components/QueryBubble'
import './App.css'

export default function App() {
    const [messages, setMessages] = useState([])
    const [query, setQuery] = useState('')
    const messagesEndRef = useRef(null)

    function appendReply(msgs, value) {
        const [type, query, reply] = msgs[msgs.length-1];
        const lastMessage = [type, query, reply + value]
        return [...msgs.slice(0, -1), lastMessage];
    }
    
    async function sendMessage() {
        // send request to server
        let response = await fetch('http://localhost:8000/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: query })
        })

        // create new message stub
        const msg = ['query', query, '']
        setMessages(msgs => [...msgs, msg])

        // construct streaming response
        const codec = new TextDecoderStream();
        const reader = response.body.pipeThrough(codec);
        for await (const value of reader) {
            setMessages(msgs => appendReply(msgs, value));
        }
    }

    function onKeyDown(e) {
        if (e.key === 'Enter') {
            sendMessage()
        }
    }

    function scrollToBottom() {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages]);

    return (
        <div className="flex flex-col items-center w-full h-full">
            <div id="chat-box" className="text-lg pt-[150px] pb-[250px] flex flex-col items-center w-[1200px] overflow-scroll no-scrollbar">
                <div id="message-list" className="flex flex-col gap-8 w-full">
                    {messages.map(([type, query, reply], index) => (
                        <QueryBubble key={index} type={type} query={query} reply={reply} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div id="input-area" className="absolute bottom-32 m-auto w-[800px]">
                <input
                    type="text"
                    placeholder="Type your message here"
                    className="text-lg p-3.5 rounded border border-[#666] shadow-md focus:outline-none w-full"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => onKeyDown(e)}
                />
            </div>
        </div>
    )
}
