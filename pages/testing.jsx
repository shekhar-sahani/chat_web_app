import { useEffect, useRef, useState } from "react";
import { useSocket } from "../context/socketContext"

export default function Testing() {
    const {socket} = useSocket();
    const [messages, setMessages] = useState([]);
    const textRef = useRef();
    const socketIdRef = useRef();


    function handleSubmit(e) {
        e.preventDefault();
        const text = textRef.current.value.trim();
        const socketId = socketIdRef.current.value.trim();
        if (!text || !socketId) return;

        socket.emit("message-sent", { text, socketId });
        setMessages((prevMessages) => [...prevMessages, text]);
        textRef.current.value = '';
        socketIdRef.current.value = '';
    }

    useEffect(() => {
        if (!socket) return;
        
        socket.on('message-received', (text) => {
            console.log('message received', text);
            setMessages((prevMessages) => [...prevMessages, text]);
        });

        return () => {
            socket.off('message-received');
            socket.off('welcome');
        };
    }, [socket]);
    return (
        <div className=" flex items-center flex-col mt-10 " >
            <h1 className=" text-2xl " > Socket Id: {socket && socket.id} </h1>
            <form onSubmit={handleSubmit} className="my-10" >
            <input placeholder="socket id" className="input input-bordered" ref={socketIdRef} type="text" />
                <input placeholder="message" className="input input-bordered" ref={textRef} type="text" />
                <button type="submit" className=" btn btn-neutral " > Submit </button>
            </form>
            <div>
                {messages.map((item, id) => (
                    <p key={id} > {item} </p>
                ))}
            </div>
        </div>
    )
}