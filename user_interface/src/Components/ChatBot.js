import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { 
    TextField, 
    Button, 
    Box,
    Fab,
    Typography,
    IconButton
} from "@mui/material";
import {
    Close as CloseIcon,
    LiveHelp,
    Sms
} from "@mui/icons-material";
import { REVIEWSBASEURL } from '../constants.js';

import { addResponse, updateLastResponse } from "../Redux/chatSlice.js";
import '../Styles/ChatBot.css';

const ChatBot = ({ restaurantName }) => {
    const [message, setMessage] = useState("");
    const [showChat, setShowChat] = useState(false);
    const [forceScroll, setForceScroll] = useState(false);
    const chatContainerRef = useRef(null);
    const responses = useSelector((state) => state.chat.responses);
    const dispatch = useDispatch();
    const systemContent = "You are a chat bot that only answers questions regarding food and gives suggestions regarding food choices. Do not answer any questions that do not pertain to food."

    const handleChatToggle = () => {
        setShowChat((prevShowChat) => !prevShowChat);
        setForceScroll(true);
    };

    const handleChange = (event) => {
        setMessage(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");

        dispatch(addResponse({ user: message }));

        // Construct payload for the chat bot
        // Previous responses (stored in Redux state) are taken into account
        const payload = {
            messages: [
                { role: "system", content: systemContent },
                ...responses.map((response) => [
                    { role: "user", content: response.user },
                    { role: "assistant", content: response.bot },
                ]).flat(),
                { role: "user", content: message },
                ],
            };

        try {
            // API call to chat bot (OpenAI API - Chat Completion)
            const response = await axios.post(`${REVIEWSBASEURL}/chat`, payload);
            const chatResponse = response.data.response;
        
            dispatch(updateLastResponse({ user: message, bot: chatResponse }));

            setMessage("");
            } catch (error) {
            console.error("Error:", error);
            }
    };

    useEffect(() => {
        // Auto scroll chat window to the bottom when user enters text and response exceeds chat window
        if (chatContainerRef.current && (responses.length > 0 || forceScroll)) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            setForceScroll(false);
        }
    }, [responses, showChat, forceScroll]);

    return (
        <Box>
            {showChat && (
                <Box className="chat-container">
                    <IconButton
                        sx={{
                            position: "absolute",
                            top: 1,
                            right: 1,
                            padding: 1,
                            color: "white",
                        }}
                        onClick={() => setShowChat(false)}
                        >
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h6" className="chat-header">
                        {restaurantName} Chat Bot
                    </Typography>
                    <Box ref={chatContainerRef} className="chat-text-container">
                        {responses.map((response, index) => (
                            <Box key={index} sx={{ marginBottom: "20px", wordWrap: "break-word", width: "90%" }}>
                                {/* Conditionally render user chat when not empty to handle inital state of the chat bot */}
                                {response.user && (
                                <>
                                    <strong>User:</strong> {response.user}
                                    <br />
                                </>
                                )}
                                {/* New line only for first chat message */}
                                {index === 0 && <br />}
                                {/* Conditionally render the Sms icon here based on whether the chat bot is typing or not since it is not serializable */}
                                <strong>Chat Bot:</strong> {response.isTyping ? <Sms color="primary" /> : response.bot}
                            </Box>
                        ))}
                    </Box>
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{
                            width: "85%",
                            display: "flex",
                            flexDirection: "column",
                            margin: "0 auto",
                        }}
                    >
                        <TextField
                            fullWidth
                            value={message}
                            onChange={handleChange}
                            label="Have a question?"
                            variant="outlined"
                            multiline
                            rows={2}
                            // Allow the user to submit chat by pressing on enter key, shift+enter for new line
                            onKeyDown={(event) => {
                                if (event.key === "Enter" && !event.shiftKey) {
                                    event.preventDefault();
                                    handleSubmit(event);
                                    setMessage("");
                                }
                            }}
                        />
                        <Box sx={{ margin: "20px" }}>
                            <Button type="submit" variant="outlined" color="primary">
                                Submit
                            </Button>
                        </Box>
                    </Box>
                </Box>
            )}
            {/* Fab */}
            <Box className="fab-container">
                <Fab
                    color="primary"
                    aria-label="open chat"
                    onClick={handleChatToggle}
                    sx={{
                        backgroundColor: showChat ? "red" : null,
                        "&:hover": {
                            backgroundColor: showChat ? "error.dark" : null,
                        },
                    }}
                >
                    {showChat ? <CloseIcon /> : <LiveHelp />}
                </Fab>
            </Box>
        </Box>
    );
};      

export default ChatBot;
