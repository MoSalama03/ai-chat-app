import { useState, useEffect } from "react";
import type { Message } from "../../types/types";
import ThemeToggle from "../theme-toggle/themeToggle.tsx";
import { FaRobot } from "react-icons/fa";


export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [editText, setEditText] = useState('');
  const [, setEditingId] = useState<string | null>(null);
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
  }

    const startEditing = (id: string, currentText: string) => {
      setEditingId(id);
      setEditText(currentText);
      setMessages((prev) => prev.map(message => message.id === id ? {...message, isEditing : true} : message));
      setEditingId(null);
      setEditText('');
    }

    // Save edited message
  const saveEdit = async (id: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, text: editText, isEditing: false } : msg
    ));
    setEditingId(null);
    setEditText('');
  };

  // Cancel editing
  const cancelEdit = (id: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, isEditing: false } : msg
    ));
    setEditingId(null);
  };

  return (
    <section className="max-w-2xl mx-auto my-16 p-4">
      <div className="max-w-2xl mx-auto p-4">
  <div className="flex justify-between items-center mb-4">
    <div className="flex items-center gap-2">
      <FaRobot className="text-blue-500 dark:text-blue-400 text-2xl" />
      <h1 className="text-xl font-bold">AI Chat</h1>
    </div>
    <div className="flex items-center gap-2">
      <ThemeToggle />
    </div>
    </div>
  </div>

  {/* Messages container */}
      <section className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-[400px] overflow-y-auto">
  {messages.map((message) => (
    <div key={message.id} className={`mb-4 ${message.sender === "user" ? "text-right" : "text-left"}`}>
      {message.isEditing ? (
        // Edit Mode UI
        <div className="flex flex-col space-y-2">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            rows={3}
          />
          <div className="flex space-x-2 justify-end">
            <button
              onClick={() => saveEdit(message.id)}
              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg"
            >
              Save
            </button>
            <button
              onClick={() => cancelEdit(message.id)}
              className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        // Normal Message UI
        <div className="relative group">
          <span className={`inline-block px-4 py-2 rounded-lg ${
            message.sender === "user"
              ? "bg-blue-500 text-white"
              : "bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100"
          }`}>
            {message.text}
          </span>
          {message.sender === "user" && (
            <button
              onClick={() => startEditing(message.id, message.text)}
              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 
                        bg-gray-200 dark:bg-gray-700 rounded-full p-1 transition-opacity"
              aria-label="Edit message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  ))}
</section>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900
           dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Type a message..."
        />
        <button 
        type="submit"
        disabled={isLoading}
        className={`bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 
                    dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg ${
          isLoading ? "opacity-50" : "hover:bg-blue-600"
        }`}>
          {isLoading ? "Sending..." : "Send"}
          </button>
      </form>
    </section>
  );
}