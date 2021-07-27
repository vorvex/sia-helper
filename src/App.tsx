import { IconButton, InputBase } from '@material-ui/core'
import { CachedRounded, SendRounded } from '@material-ui/icons';
import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

type Message = {
    ts:number,
    sender: 'sia'|'me',
    message:string
};

type Session = {
    restaurantId:string,
    callSid:string,
    token:string
}

const sendMessage = async (text:string, session:Session) => axios.post(`https://api.gastronaut.ai/v03/sia/detectInput`, { ...session, text }).then(response => response.data as { dialogflowResponse:string, token:string });

const App = () => {

    const scrollRef = useRef<HTMLDivElement|null>(null);
    const [value, setvalue] = useState("");
    const [messages, setmessages] = useState<Message[]>([]);
    const [session, setsession] = useState<Session>({ restaurantId: 'restaurant-apollo', callSid: '', token: '' });
    const [error, seterror] = useState("");



    const handleSubmit:React.FormEventHandler<HTMLFormElement> = async e => {
        try {
            e.preventDefault();

            seterror("");

            const newMessage:Message = {
                ts: Date.now(),
                sender: 'me',
                message: value
            }

            setmessages(msg => ([...msg, newMessage]));
            setvalue("");
            const { dialogflowResponse:message, token } = await sendMessage(value, session);

            const response:Message = {
                ts: Date.now(),
                sender: 'sia',
                message
            }

            setmessages(msg => ([...msg, response]));
            setsession(session => ({ ...session, token }));

        } catch (error) {
            seterror(error.message);
        }
    }

    const handleNewSession = async () => {
        let callSid = uuidv4();
        let calledNumber = "+4962217333018";

        const { data } = await axios.post(`https://api.gastronaut.ai/v03/sia/`, { 
            callSid,
            calledNumber,
            callerId: '+4980060000'
        });

        const { token = '', dialogflowResponse:message = '' } = data as { token:string, dialogflowResponse:string };

        setsession({ callSid, token, restaurantId: 'restaurant-apollo' });
        setmessages([{ ts: Date.now(), message, sender: 'sia' }]);

    }

    useEffect(() => {
        handleNewSession();
    }, []);

    useEffect(() => {
        if(scrollRef.current) {
            scrollRef.current.scrollIntoView();
        }
    }, [messages])

    return (
        <div className="container">
            <div className="header">
                <IconButton onClick={handleNewSession}>
                    <CachedRounded />
                </IconButton>
            </div>
            <div className="body">
                {messages.sort((a,b) => a.ts - b.ts).map(msg => (
                    <div key={msg.ts} className={`message ${msg.sender}`}>
                        <div>{msg.message}</div>
                    </div>
                ))}
                <div ref={e => { scrollRef.current = e }} />
            </div>
            <form onSubmit={handleSubmit} className="footer">
                <InputBase
                    value={value}
                    onChange={e => setvalue(e.target.value)}
                    placeholder="Message"
                    className="newMessage"
                />
                <IconButton type="submit">
                    <SendRounded/>
                </IconButton>
            </form>
        </div>
    )
}

export default App
