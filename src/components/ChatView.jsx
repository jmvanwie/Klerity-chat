import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import WelcomeBanner from './WelcomeBanner';

const MessageContent = ({ content }) => (
  <div className="prose prose-sm prose-invert max-w-none text-gray-300">
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
  </div>
);

const TypingIndicator = () => (
  <div className="flex items-center gap-2">
    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
  </div>
);

export default function ChatView({
  chatHistory,
  isLoading,
  onSendMessage,
  currentUser,
  examplePrompts = []
}) {
  const chatEndRef = useRef(null);
  const [inputValue, setInputValue] = useState("");

  const isNewChat = chatHistory.length === 1 && chatHistory[0].role === 'model';

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-800 h-full">
      <main className="flex-grow overflow-y-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          {isNewChat ? (
            <WelcomeBanner
              userName={currentUser.name}
              onPromptClick={onSendMessage}
              examples={examplePrompts}
            />
          ) : (
            chatHistory.map((message, index) => (
              <div key={index} className={`flex items-start gap-4 mb-8`}>
                <div className="w-8 h-8 flex-shrink-0 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white">
                  {message.role === 'user' ? currentUser.name.charAt(0) : '🤖'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">
                    {message.role === 'user' ? 'You' : 'klerity.ai'}
                  </p>
                  <MessageContent content={message.content} />
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white">🤖</div>
              <div className="flex-1">
                <p className="font-semibold text-white">klerity.ai</p>
                <TypingIndicator />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      <footer className="bg-gray-800 border-t border-gray-700 p-4 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center bg-gray-900 rounded-lg p-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message klerity.ai..."
              className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none px-2"
            />
            <button
              onClick={handleSend}
              className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors disabled:opacity-50"
              disabled={!inputValue.trim() || isLoading}
            >
              ▶
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
