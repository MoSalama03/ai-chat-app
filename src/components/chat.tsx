import { useState, useEffect } from "react";
import type { Message } from "../types/types";

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Add initial AI message when component mounts
  useEffect(() => {
    setMessages([{
      id: "initial-ai-message",
      text: "How can I Help you today?",
      sender: "ai",
    }]);
  }, []);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!input.trim() || isLoading) return; // Prevent spamming

  // Add user message
  const userMessage: Message = {
    id: Date.now().toString(),
    text: input,
    sender: "user",
  };
  setMessages((prev) => [...prev, userMessage]);
  setInput("");
  setIsLoading(true);


     try {
      // Call Groq API directly
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: input }
          ],
          model: "llama3-70b-8192",
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();
      const aiText = data.choices[0]?.message?.content || "Sorry, I didn’t get that.";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-ai",
          text: aiText,
          sender: "ai",
        },
      ]);
    } catch (error) {
      console.error("Groq API error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-error",
          text: "Failed to fetch AI response. Please try again.",
          sender: "ai",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
};

  return (
    <section className="max-w-2xl mx-auto my-16 p-4">
      <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <h1 className="text-xl font-bold">AI Chat</h1>
      </div>
    </div>
      <div className="bg-gray-100 rounded-lg p-4 h-[400px] overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id}  className={`mb-4 ${message.sender === "user" ? "text-right" : "text-left"}`}>
            <span className={`inline-block px-4 py-2 rounded-lg ${message.sender === "user"
              ? "bg-blue-500 text-white"
              : "bg-gray-300 text-black"
            }`}>{message.text}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 border rounded-lg"
          placeholder="Type a message..."
        />
        <button 
        type="submit"
        disabled={isLoading}
        className={`bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 ${
          isLoading ? "opacity-50" : "hover:bg-blue-600"
        }`}>{isLoading ? "Sending..." : "Send"}</button>
      </form>
    </section>
  );
}