import React, { useState } from "react";
import "./Chatbot.css";

const Chat = () => {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!userInput.trim()) {
      alert("Please enter a message!");
      return;
    }

    const newMessages = [...messages, { text: userInput, sender: "user" }];
    setMessages(newMessages);
    setUserInput("");
    setLoading(true);

    const skinDiseasePrompt = `You are an AI dermatologist providing helpful, informative, and safe medical advice on skin diseases. Ensure responses are concise (around 6 lines) and to the point. Provide direct answers with essential details only. If needed, suggest consulting a dermatologist. Here is the user's question: ${userInput}`;

    const apiKey = "AIzaSyCXdoqotN9cG2n5gpRGRatXYYS8qxTerLo"; // Replace with your actual API key

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: skinDiseasePrompt }] }],
          }),
        }
      );

      const data = await res.json();
      const botResponse = data.candidates && data.candidates.length > 0
        ? data.candidates[0].content.parts[0].text
        : "No response from AI. Try again!";

      setMessages([...newMessages, { text: botResponse, sender: "bot" }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages([...newMessages, { text: "Error fetching response!", sender: "bot" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center ss">
      <div className="chat-container">
        <div className="chat-header">Skin Disease Consultation</div>
        <button className="home-btn w-100" onClick={() => window.location.href = '/appointment'}>🏠 Home</button>
        <div className="chat-body">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <div className="message-text">{msg.text}</div>
            </div>
          ))}
        </div>
        <div className="chat-footer">
          <textarea
            className="form-control"
            placeholder="Ask your skin-related question..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
          <button className="send-btn" onClick={sendMessage} disabled={loading}>
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
