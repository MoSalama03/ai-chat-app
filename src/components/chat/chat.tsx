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
    <section className="max-w-2xl mx-auto my-10 p-4">
      <div className="mx-auto p-4">
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
<footer className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 mt-12">
  <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
    <div className="flex flex-col items-center justify-between md:flex-row">
      {/* Name with subtle animation */}
      <div className="flex items-center space-x-2">
        <p className="text-lg font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
          Crafted with <span className="text-red-500">♥</span> by Muhammed Salama
        </p>
      </div>

      {/* Social links */}
      <div className="mt-4 md:mt-0 flex space-x-6">
        <a 
          target="_blank"
          href="https://x.com/MSalama57788" 
          className="text-gray-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          aria-label="Twitter"
        >
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
          </svg>
        </a>
        <a 
        target="_blank"
          href="https://github.com/MoSalama03" 
          className="text-gray-500 hover:text-green-700 dark:hover:text-green-300 transition-colors"
          aria-label="GitHub"
        >
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
        </a>
      </div>
    </div>

    {/* Copyright */}
    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} Muhammed Salama. All rights reserved.
      </p>
    </div>
  </div>
</footer>
    </section>
  );
}