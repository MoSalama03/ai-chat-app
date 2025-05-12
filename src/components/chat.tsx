import { useState } from "react";
import type { Message } from "../types/types";

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

   // Using React 19's Action for async AI response
  // src/components/Chat.tsx
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
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: input }],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const aiText = data.choices[0]?.message?.content || "Sorry, I didn't get that.";

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString() + "-ai",
        text: aiText,
        sender: "ai",
      },
    ]);
  } catch (error) {
    console.error("API call failed:", error);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString() + "-ai",
        text: "Failed to fetch response. Check your API key and network.",
        sender: "ai",
      },
    ]);
  }

  setIsLoading(false);
};

  return (
    <section className="max-w-2xl mx-auto p-4">
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