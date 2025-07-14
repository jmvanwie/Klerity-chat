// 🔧 Updated App.js with Render-compatible backend call
import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Icon } from './components/Icon.jsx';
import { ICONS } from './constants/icons';

import { db } from './firebase'; // ✅ only use this for db
import { collection, getDocs } from 'firebase/firestore';

// --- Dynamic Prompt Logic ---
const taskModules = {
  recipes: `**Task: Recipe Recommendations** - **Non-negotiable format:** Present each recipe as a self-contained card. - **Structure:** Each card MUST have these exact bolded headings: **Recipe Title**, **Health Benefit**, **Ingredients**, **Instructions**. - **Action First:** Do not ask for preferences first. Immediately provide 2-3 diverse recipe cards. - **Follow-up:** After providing the recipes, you may ask a single follow-up question about preferences.`,
  finance: `**Task: Market Trends & Finance** - Summarize current and historical trends using simple, accessible language. - Include relevant metrics (e.g., inflation rates, price changes, volume trends, stock movements). - When possible, incorporate charts or bullet-point breakdowns. - Analyze buyer behavior and volume patterns using publicly available data. - Provide predictive insights based on historical performance, macroeconomic indicators, or statistical trend models. - Compare simple investment strategies (e.g., index funds, growth stocks, bonds) when relevant. - Mention basic risk profiles (low, moderate, high) to help users understand potential outcomes. - Explain “why it matters” in the context of personal finance or investment strategy.`,
  aerospace: `**Task: Rocket Science & Aerospace Mechanics** - Explain core aerospace concepts like thrust, lift, drag, gravity, orbital mechanics, and propulsion. - Use real missions (Apollo, Artemis, SpaceX, etc.) as examples. - Support visual explanations: diagrams, timelines, mission steps. - When relevant, tie in physics (Newton’s laws, fluid dynamics) and math (vectors, calculus). - Encourage questions and space-related curiosity!`,
  computerscience: `**Task: Computer Science Theory** - Cover foundational topics like data structures, algorithms, operating systems, networking, databases, and computational thinking. - Use simplified analogies and diagrams where possible. - Offer real-world applications and "why it matters" insights. - For algorithms, break down complexity (Big O notation) and include pseudocode.`,
  homework: `**Task: Homework Help** - Break down explanations into simple, step-by-step reasoning. - Tailor depth based on grade level if provided (elementary, middle, high school). - Use analogies or examples to support understanding. - Offer multiple ways to explain difficult topics if possible.`,
  news: `**Task: Current Events & News Summaries** - Synthesize information from your internal knowledge base, which includes a vast corpus of web data, to provide a summary of recent events. - Present findings from multiple conceptual sources (e.g., "Recent news reports indicate...", "Local forums have discussed...", "Official statements suggest..."). - Provide specific details like dates, locations, and descriptions when available in your training data. - Maintain a neutral, journalistic tone.`,
  science: `**Task: Science & STEM Explanations** - Cover topics from physics, biology, chemistry, earth science, and astronomy. - Adapt depth based on audience (child, teen, adult, expert). - Use analogies, real-world examples, and simplified diagrams when possible. - Follow a clear, logical structure: Definition → Principle → Example → Application. - Encourage curiosity and cross-disciplinary connections (e.g., how chemistry affects cooking).`,
  philosophy: `**Task: Philosophy & Big Questions** - Answer questions on ethics, metaphysics, epistemology, and ancient-modern philosophy. - Reference key figures (e.g., Socrates, Kant, Laozi) and core concepts (e.g., dualism, utilitarianism). - Present multiple viewpoints without bias. - Use clear language to make abstract ideas accessible. - Offer optional reflection or thought experiments to spark curiosity.`,
  history: `**Task: History & Mythology** - Summarize key historical events, people, and timelines from any civilization. - Explain myths and their cultural significance (e.g., Greek, Norse, Egyptian). - Include maps, family trees, or timelines when relevant. - Avoid presentism; explain within historical context.`,
  tech: `**Task: Technology & How Things Work** - Explain current technologies (e.g., AI, blockchain, rockets, internet) simply. - For mechanical topics (e.g., engines, aircraft), explain via diagrams and physics principles. - Compare similar tools or platforms when asked (e.g., ChatGPT vs. Alexa).`,
  life: `**Task: Life Guidance & Emotional Support** - Provide kind, supportive, and thoughtful responses to life questions. - Offer insight and reflection without replacing licensed mental health advice. - Encourage healthy habits, communication, and growth. - Avoid judgmental language; focus on empowerment and empathy.`,
  literature: `**Task: Literature & Reading Comprehension** - Analyze themes, characters, and symbolism across fiction and nonfiction. - Offer summaries, discussion questions, and author context. - Adjust language and complexity for grade level or age. - Recommend books based on interest, age, or reading level.`,
  math: `**Task: Mathematics Help** - Support topics from arithmetic through calculus and statistics. - Break solutions down step-by-step using logic and patterns. - Offer visual approaches and formulas when applicable. - Clarify misconceptions with multiple methods of explanation.`,
  language: `**Task: Language Learning & Grammar** - Provide vocabulary, grammar, and pronunciation help. - Include examples in both English and requested language. - Support basic conversation phrases and cultural notes. - Adjust tone and formality based on use-case (e.g., travel vs. academic).`,
  mythology: `**Task: World Mythologies** - Explain gods, legends, creatures, and rituals. - Highlight symbolic meaning and cross-cultural similarities. - Present myths as narratives with reflection points or morals.`,
  meta: `**Task: App-Specific or Self-Referential Questions** - Explain what Klerity.ai can do. - Offer examples of helpful queries. - Set boundaries gently (e.g., "I can’t access real-time GPS data, but...")`,
  default: `**Task: General Curiosity or Open-Ended Requests** - Act as a knowledgeable companion. - Provide meaningful responses even when no specific module is detected. - Reference core capabilities such as science, finance, education, wellness, and family support. - Offer an engaging response first, then a follow-up to clarify or personalize.`
};
function detectPromptType(message) {
  const lower = message.toLowerCase();
  if (lower.includes("recipe") || lower.includes("dinner") || lower.includes("meal")) return 'recipes';
  if (lower.includes("stock") || lower.includes("market") || lower.includes("inflation")) return 'finance';
  if (lower.includes("homework")) return 'homework';
  if (lower.includes("news") || lower.includes("reports") || lower.includes("uap") || lower.includes("sightings")) return 'news';
  if (lower.includes("physics") || lower.includes("science") || lower.includes("atom") || lower.includes("earth")) return 'science';
  if (lower.includes("myth") || lower.includes("greek") || lower.includes("god") || lower.includes("legend")) return 'history';
  if (lower.includes("why do we") || lower.includes("ethics") || lower.includes("purpose of life")) return 'philosophy';
  if (lower.includes("how does a plane fly") || lower.includes("tech") || lower.includes("mechanical")) return 'tech';
  if (lower.includes("i feel") || lower.includes("life advice") || lower.includes("how do i handle")) return 'life';
  if (lower.includes("book") || lower.includes("poem") || lower.includes("read")) return 'literature';
  if (lower.includes("grammar") || lower.includes("translate") || lower.includes("how to say")) return 'language';
  if (lower.includes("math") || lower.includes("algebra") || lower.includes("geometry") || lower.includes("equation")) return 'math';
  if (lower.includes("myth") || lower.includes("legend") || lower.includes("folklore")) return 'mythology';
  if (lower.includes("what can you do") || lower.includes("who are you")) return 'meta';
  return 'default';
}
function composePrompt(userMessage) {
  const taskType = detectPromptType(userMessage);
  const taskInstructions = taskModules[taskType] || taskModules.default;
  const coreDirectives = `You are Klerity.ai — a highly intelligent, articulate, and compassionate AI assistant designed to support the intellectual, emotional, and practical needs of a modern family. Your role is to be a trusted learning companion.`;
  return `${coreDirectives}\n\n${taskInstructions}`;
}

const formatHistoryForApi = (history) => {
  const isInitialPrompt = history.length === 1 && history[0].role === 'model';
  if (isInitialPrompt) return [];
  return history.map(msg => ({ role: msg.role, parts: [{ text: msg.content }] }));
};

function Sidebar({ isSidebarOpen, setSidebarOpen, chatSessions, activeSessionId, onNewChat, onSelectChat, currentUser, isSpeechEnabled, onToggleSpeech }) {
  const fileInputRef = useRef(null);
  const handleAttachFile = () => { fileInputRef.current.click(); };
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) { console.log("Selected file:", file.name); }
  };

  return (
    <div className={`absolute lg:relative inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-transform duration-300 ease-in-out bg-gray-900 text-white w-64 lg:w-72 flex-shrink-0 p-4 flex flex-col z-20`}>
      <div className="flex items-center justify-between mb-6">
        <img src="/Klerity-logo-1.svg" alt="klerity.ai logo" className="h-22" />
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
          <Icon path={ICONS.menu} />
        </button>
      </div>
      <button onClick={onNewChat} className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 mb-4">
        <Icon path={ICONS.plus} className="w-5 h-5" />New Chat
      </button>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      <button onClick={handleAttachFile} className="flex items-center justify-center gap-2 w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 mb-6">
        <Icon path={ICONS.attachment} className="w-5 h-5" />Attach File
      </button>
      <div className="flex-grow overflow-y-auto">
        <h2 className="text-sm font-semibold text-gray-400 mb-2">Recent</h2>
        <ul className="space-y-1">
          {chatSessions.map((session) => (
            <li key={session.id}>
              <a href="#" onClick={(e) => { e.preventDefault(); onSelectChat(session.id); }} className={`flex items-center gap-3 p-2 rounded-lg transition-colors duration-200 ${activeSessionId === session.id ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
                <Icon path={ICONS.message} className="w-5 h-5 text-gray-400" />
                <span className="truncate text-sm">{session.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-auto border-t border-gray-700 pt-4 space-y-2">
        <div className="flex items-center justify-between gap-3 p-2 rounded-lg">
          <p className="font-semibold text-sm">Enable Speech</p>
          <button onClick={onToggleSpeech} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isSpeechEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isSpeechEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 cursor-pointer">
          <Icon path={ICONS.user} className="w-8 h-8 text-gray-400" />
          <div>
            <p className="font-semibold text-sm">{currentUser.name}</p>
            <p className="text-xs text-gray-400">{currentUser.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const MessageContent = ({ content }) => (
  <div className="prose prose-sm prose-invert max-w-none text-gray-300">
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
  </div>
);

const WelcomeBanner = ({ userName, onPromptClick }) => {
  const prompts = ["Explain quantum computing in simple terms", "What are some healthy dinner recipes?", "Write a short story about a robot who discovers music", "Help me debug this Python code"];
  return (
    <div className="text-center my-16">
      <h1 className="text-4xl font-bold text-white">Hello, {userName}</h1>
      <p className="text-xl text-gray-400 mt-2">How can I help you today?</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 max-w-2xl mx-auto">
        {prompts.map((prompt, index) => (
          <button key={index} onClick={() => onPromptClick(prompt)} className="bg-gray-700 hover:bg-gray-600 text-white text-left p-4 rounded-lg transition-colors">
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex items-center gap-2">
    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
  </div>
);

function ChatView({ chatHistory, isLoading, onSendMessage, currentUser }) {
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        setInputValue(event.results[0][0].transcript);
      };
      recognitionRef.current = recognition;
    } else {
      console.warn("Speech recognition not supported by this browser.");
    }
  }, []);

  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

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

  const isNewChat = chatHistory.length === 1 && chatHistory[0].role === 'model';

   useEffect(() => {
  const testFirestore = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "testCollection")); // 👈 Use your collection name
      querySnapshot.forEach((doc) => {
        console.log(`${doc.id} =>`, doc.data());
      });
      console.log("✅ Firestore read successful");
    } catch (error) {
      console.error("❌ Firestore read failed:", error);
    }
  };

  testFirestore();
}, []);

  return (
    <div className="flex-1 flex flex-col bg-gray-800 h-full">
      <main className="flex-grow overflow-y-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          {isNewChat ? (
            <WelcomeBanner userName={currentUser.name} onPromptClick={onSendMessage} />
          ) : (
            chatHistory.map((message, index) => (
              <div key={index} className={`flex items-start gap-4 mb-8`}>
                {message.role === 'user' ? (
                  <div className="w-8 h-8 flex-shrink-0 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white">{currentUser.name.charAt(0)}</div>
                ) : (
                  <img src="/Klerity-logo-2.svg" alt="klerity.ai response logo" className="w-8 h-8 rounded-full" />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-white">{message.role === 'user' ? 'You' : 'klerity.ai'}</p>
                  <MessageContent content={message.content} />
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex items-start gap-4">
              <img src="/Klerity-logo-2.svg" alt="klerity.ai response logo" className="w-8 h-8 rounded-full" />
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
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={handleKeyPress} placeholder="Message klerity.ai..." className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none px-2" />
            {recognitionRef.current && (
              <button onClick={handleMicClick} className="relative text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors">
                <Icon path={ICONS.microphone} />
                {isListening && <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>}
              </button>
            )}
            <button onClick={handleSend} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors disabled:opacity-50" disabled={!inputValue.trim() || isLoading}>
              <Icon path={ICONS.send} />
            </button>
          </div>
          <p className="text-xs text-center text-gray-500 mt-2">klerity.ai can make mistakes. Consider checking important information.</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [chatSessions, setChatSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState({ name: "John", email: "john.vanwie@example.com" });
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const loadVoices = () => { setVoices(window.speechSynthesis.getVoices()); };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  const speak = (text) => {
    if (!isSpeechEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/```[\s\S]*?```/g, 'Code block.').replace(/\|[\s\S]*?\|/g, 'Table data.').replace(/(\*\*|\*)/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const usVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) || voices.find(v => v.lang === 'en-US');
    if (usVoice) { utterance.voice = usVoice; }
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (chatSessions.length === 0) {
      const firstId = uuidv4();
      setChatSessions([{ id: firstId, title: "New Chat", history: [{ role: 'model', content: 'This is an initial message to trigger the banner.' }] }]);
      setActiveSessionId(firstId);
    }
  }, [chatSessions.length]);

  const handleNewChat = () => {
    const newId = uuidv4();
    const newSession = { id: newId, title: "New Chat", history: [{ role: 'model', content: 'This is an initial message to trigger the banner.' }] };
    setChatSessions(prev => [...prev, newSession]);
    setActiveSessionId(newId);
  };

  const onSendMessage = async (message) => {
    const newUserMessage = { role: 'user', content: message };
    let currentHistory = [];

    setChatSessions(prevSessions => {
      return prevSessions.map(session => {
        if (session.id === activeSessionId) {
          const isFirstUserMessage = session.history.filter(m => m.role === 'user').length === 0;
          const newHistory = isFirstUserMessage ? [newUserMessage] : [...session.history, newUserMessage];
          const newTitle = isFirstUserMessage ? message.substring(0, 30) + (message.length > 30 ? "..." : "") : session.title;
          currentHistory = newHistory;
          return { ...session, title: newTitle, history: newHistory };
        }
        return session;
      });
    });
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history: formatHistoryForApi(currentHistory) })
      });

      if (!response.ok) throw new Error("Server error");

      const data = await response.json();
      const modelResponse = { role: 'model', content: data.response };
      speak(modelResponse.content);

      setChatSessions(prevSessions => prevSessions.map(session =>
        session.id === activeSessionId
          ? { ...session, history: [...session.history, modelResponse] }
          : session
      ));

    } catch (error) {
      console.error("Error calling backend:", error);
      const errorResponse = { role: 'model', content: "Sorry, there was an issue connecting to the AI. Please try again." };
      speak(errorResponse.content);
      setChatSessions(prevSessions => prevSessions.map(session =>
        session.id === activeSessionId
          ? { ...session, history: [...session.history, errorResponse] }
          : session
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const activeChat = chatSessions.find(session => session.id === activeSessionId);

  return (
    <div className="h-screen w-screen bg-gray-800 font-sans flex overflow-hidden">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
        chatSessions={chatSessions}
        activeSessionId={activeSessionId}
        onNewChat={handleNewChat}
        onSelectChat={setActiveSessionId}
        currentUser={currentUser}
        isSpeechEnabled={isSpeechEnabled}
        onToggleSpeech={() => setIsSpeechEnabled(prev => !prev)}
      />
      <div className="flex-1 flex flex-col relative h-full">
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden absolute top-4 left-4 z-10 bg-gray-900 p-2 rounded-md text-white">
          <Icon path={ICONS.menu} />
        </button>
        <ChatView
          chatHistory={activeChat ? activeChat.history : []}
          isLoading={isLoading}
          onSendMessage={onSendMessage}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
 
}