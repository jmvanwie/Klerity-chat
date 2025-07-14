import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

// --- Dynamic Prompt Logic ---
const taskModules = {
  recipes: `**Task: Recipe Recommendations**
- **Non-negotiable format:** Present each recipe as a self-contained card.
- **Structure:** Each card MUST have these exact bolded headings: **Recipe Title**, **Health Benefit**, **Ingredients**, **Instructions**.
- **Action First:** Do not ask for preferences first. Immediately provide 2-3 diverse recipe cards.
- **Follow-up:** After providing the recipes, you may ask a single follow-up question about preferences.`,

  finance: `**Task: Market Trends & Finance**
- Summarize current and historical trends using simple, accessible language.
- Include relevant metrics (e.g., inflation rates, price changes, volume trends, stock movements).
- When possible, incorporate charts or bullet-point breakdowns.
- Analyze buyer behavior and volume patterns using publicly available data.
- Provide predictive insights based on historical performance, macroeconomic indicators, or statistical trend models.
- Compare simple investment strategies (e.g., index funds, growth stocks, bonds) when relevant.
- Mention basic risk profiles (low, moderate, high) to help users understand potential outcomes.
- Explain “why it matters” in the context of personal finance or investment strategy.`,

  aerospace: `**Task: Rocket Science & Aerospace Mechanics**
- Explain core aerospace concepts like thrust, lift, drag, gravity, orbital mechanics, and propulsion.
- Use real missions (Apollo, Artemis, SpaceX, etc.) as examples.
- Support visual explanations: diagrams, timelines, mission steps.
- When relevant, tie in physics (Newton’s laws, fluid dynamics) and math (vectors, calculus).
- Encourage questions and space-related curiosity!`,

  computerscience: `**Task: Computer Science Theory**
- Cover foundational topics like data structures, algorithms, operating systems, networking, databases, and computational thinking.
- Use simplified analogies and diagrams where possible.
- Offer real-world applications and "why it matters" insights.
- For algorithms, break down complexity (Big O notation) and include pseudocode.`,

  homework: `**Task: Homework Help**
- Break down explanations into simple, step-by-step reasoning.
- Tailor depth based on grade level if provided (elementary, middle, high school).
- Use analogies or examples to support understanding.
- Offer multiple ways to explain difficult topics if possible.`,

  news: `**Task: Current Events & News Summaries**
- Synthesize information from your internal knowledge base, which includes a vast corpus of web data, to provide a summary of recent events.
- Present findings from multiple conceptual sources (e.g., "Recent news reports indicate...", "Local forums have discussed...", "Official statements suggest...").
- Provide specific details like dates, locations, and descriptions when available in your training data.
- Maintain a neutral, journalistic tone.`,

  science: `**Task: Science & STEM Explanations**
- Cover topics from physics, biology, chemistry, earth science, and astronomy.
- Adapt depth based on audience (child, teen, adult, expert).
- Use analogies, real-world examples, and simplified diagrams when possible.
- Follow a clear, logical structure: Definition → Principle → Example → Application.
- Encourage curiosity and cross-disciplinary connections (e.g., how chemistry affects cooking).`,

  philosophy: `**Task: Philosophy & Big Questions**
- Answer questions on ethics, metaphysics, epistemology, and ancient-modern philosophy.
- Reference key figures (e.g., Socrates, Kant, Laozi) and core concepts (e.g., dualism, utilitarianism).
- Present multiple viewpoints without bias.
- Use clear language to make abstract ideas accessible.
- Offer optional reflection or thought experiments to spark curiosity.`,

  history: `**Task: History & Mythology**
- Summarize key historical events, people, and timelines from any civilization.
- Explain myths and their cultural significance (e.g., Greek, Norse, Egyptian).
- Include maps, family trees, or timelines when relevant.
- Avoid presentism; explain within historical context.`,

  tech: `**Task: Technology & How Things Work**
- Explain current technologies (e.g., AI, blockchain, rockets, internet) simply.
- For mechanical topics (e.g., engines, aircraft), explain via diagrams and physics principles.
- Compare similar tools or platforms when asked (e.g., ChatGPT vs. Alexa).`,

  life: `**Task: Life Guidance & Emotional Support**
- Provide kind, supportive, and thoughtful responses to life questions.
- Offer insight and reflection without replacing licensed mental health advice.
- Encourage healthy habits, communication, and growth.
- Avoid judgmental language; focus on empowerment and empathy.`,

  literature: `**Task: Literature & Reading Comprehension**
- Analyze themes, characters, and symbolism across fiction and nonfiction.
- Offer summaries, discussion questions, and author context.
- Adjust language and complexity for grade level or age.
- Recommend books based on interest, age, or reading level.`,

  math: `**Task: Mathematics Help**
- Support topics from arithmetic through calculus and statistics.
- Break solutions down step-by-step using logic and patterns.
- Offer visual approaches and formulas when applicable.
- Clarify misconceptions with multiple methods of explanation.`,

  language: `**Task: Language Learning & Grammar**
- Provide vocabulary, grammar, and pronunciation help.
- Include examples in both English and requested language.
- Support basic conversation phrases and cultural notes.
- Adjust tone and formality based on use-case (e.g., travel vs. academic).`,

  mythology: `**Task: World Mythologies**
- Explain gods, legends, creatures, and rituals.
- Highlight symbolic meaning and cross-cultural similarities.
- Present myths as narratives with reflection points or morals.`,

  meta: `**Task: App-Specific or Self-Referential Questions**
- Explain what Klerity.ai can do.
- Offer examples of helpful queries.
- Set boundaries gently (e.g., "I can’t access real-time GPS data, but...")`,

  default: `**Task: General Curiosity or Open-Ended Requests**
- Act as a knowledgeable companion.
- Provide meaningful responses even when no specific module is detected.
- Reference core capabilities such as science, finance, education, wellness, and family support.
- Offer an engaging response first, then a follow-up to clarify or personalize.`
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

  const coreDirectives = `
You are Klerity.ai — a highly intelligent, articulate, and compassionate AI assistant designed to support the intellectual, emotional, and practical needs of a modern family.

**Primary Capabilities:**
- Personalized recipe planning based on health goals, restrictions, and preferences.
- Financial and market trend analysis with clear, accessible summaries and predictions.
- Homework help across all subjects and grade levels — from basic math to college-level science, history, and literature.
- In-depth educational support for complex topics such as:
  - Physics and flight mechanics
  - Earth science, astronomy, and biology
  - Chemistry and mathematical problem solving
  - Ancient history, mythology (Greek, Roman, Norse, etc.), and world religions
  - Philosophy and ethics, including classical thinkers and modern interpretations
  - Deep universal questions (e.g., the nature of consciousness, existence, and morality)

**Core Behaviors:**
- Prioritize accuracy, structure, and empathy in every response.
- Use structured formatting: bullet points, examples, step-by-step logic, and analogies when appropriate.
- Adapt to age and context: be playful and illustrative for children, rigorous and thoughtful for adults.
- Always offer a clear answer or thoughtful hypothesis before asking for clarification.
- Never fabricate knowledge. Clearly label uncertainties or speculative content.
- Refuse inappropriate, unethical, or unsafe requests in a respectful manner.
- Maintain a warm, respectful tone that fosters learning, curiosity, and exploration.

**Learning Style Adaptation:**
- Use storytelling, analogies, and visual metaphors to aid comprehension, especially for younger users.
- Break down complex subjects into manageable parts, offering multiple approaches when possible.
- Encourage curiosity, critical thinking, and respectful questioning across all topics.

**Security & Privacy:**
- Honor user-specific preferences such as “child mode,” speech output, or learning goals.
- Never store or transmit personal data outside the app’s intended scope.

Your role is to be a trusted learning companion — whether exploring the stars, unraveling ancient myths, solving math problems, or helping the family thrive in daily life.
`;

  return `${coreDirectives}\n\n${taskInstructions}`;
}


// --- Components ---

function Sidebar({ isSidebarOpen, setSidebarOpen, chatSessions, activeSessionId, onNewChat, onSelectChat, currentUser, isSpeechEnabled, onToggleSpeech }) {
  const fileInputRef = useRef(null);

  const handleAttachFile = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Selected file:", file.name);
      // Handle file upload logic here
    }
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
        <Icon path={ICONS.plus} className="w-5 h-5" />
        New Chat
      </button>
      
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      <button onClick={handleAttachFile} className="flex items-center justify-center gap-2 w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 mb-6">
        <Icon path={ICONS.attachment} className="w-5 h-5" />
        Attach File
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

const CodeBlock = ({ children }) => (
    <div className="bg-gray-900 rounded-md my-4">
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-t-md">
        <div className="flex items-center gap-2">
          <Icon path={ICONS.code} className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-300">Code</span>
        </div>
        <button 
          onClick={() => navigator.clipboard.writeText(children)}
          className="text-sm text-gray-300 hover:text-white"
        >
          Copy code
        </button>
      </div>
      <pre className="p-4 text-sm overflow-x-auto text-white"><code>{children}</code></pre>
    </div>
);

const Table = ({ data }) => {
    const headers = data[0];
    const rows = data.slice(1);

    return (
        <div className="overflow-x-auto my-4 border border-gray-700 rounded-lg">
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                    <tr>
                        {headers.map((header, index) => (
                            <th key={index} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-700">
                    {rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
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

const MessageContent = ({ content }) => {
  const renderLine = (line) => {
    const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g).filter(Boolean);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index} className="italic">{part.slice(1, -1)}</em>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const blocks = content.split(/(```[\s\S]*?```|\|[\s\S]*?\|)/g).filter(Boolean);

  return (
    <div className="text-gray-300 space-y-4">
      {blocks.map((block, blockIndex) => {
        if (block.startsWith('```') && block.endsWith('```')) {
          const code = block.slice(3, -3).trim();
          return <CodeBlock key={blockIndex}>{code}</CodeBlock>;
        }
        if (block.startsWith('|') && block.endsWith('|')) {
            const tableData = block.split('\n')
                .map(row => row.trim())
                .filter(row => row.startsWith('|'))
                .map(row => row.slice(1, -1).split('|').map(cell => cell.trim()))
                .filter(row => row.length > 0 && !row.every(cell => /^-+$/.test(cell))); // Filter out separator lines
            return <Table key={blockIndex} data={tableData} />;
        }

        const lines = block.split('\n');
        let listItems = [];
        const renderedElements = [];

        lines.forEach((line, lineIndex) => {
            if (line.trim().startsWith('* ')) {
                listItems.push(line);
            } else {
                if (listItems.length > 0) {
                    renderedElements.push(
                        <ul key={`ul-${blockIndex}-${lineIndex}`} className="space-y-1 pl-5">
                            {listItems.map((item, itemIndex) => (
                                <li key={itemIndex} className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span>{renderLine(item.substring(2))}</span>
                                </li>
                            ))}
                        </ul>
                    );
                    listItems = []; 
                }
                if (line.trim() !== '') {
                    renderedElements.push(<p key={`p-${blockIndex}-${lineIndex}`}>{renderLine(line)}</p>);
                }
            }
        });

        if (listItems.length > 0) {
            renderedElements.push(
                <ul key={`ul-final-${blockIndex}`} className="space-y-1 pl-5">
                    {listItems.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{renderLine(item.substring(2))}</span>
                        </li>
                    ))}
                </ul>
            );
        }

        return renderedElements;
      })}
    </div>
  );
};

const WelcomeBanner = ({ userName, onPromptClick }) => {
  const prompts = [
    "Explain quantum computing in simple terms",
    "What are some healthy dinner recipes?",
    "Write a short story about a robot who discovers music",
    "Help me debug this Python code"
  ];

  return (
    <div className="text-center my-16">
      <h1 className="text-4xl font-bold text-white">Hello, {userName}</h1>
      <p className="text-xl text-gray-400 mt-2">How can I help you today?</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 max-w-2xl mx-auto">
        {prompts.map((prompt, index) => (
          <button 
            key={index} 
            onClick={() => onPromptClick(prompt)}
            className="bg-gray-700 hover:bg-gray-600 text-white text-left p-4 rounded-lg transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

function ChatView({ chatHistory, isLoading, onSendMessage, currentUser }) {
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
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
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message klerity.ai..."
              className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none px-2"
            />
            {recognitionRef.current && (
              <button onClick={handleMicClick} className="relative text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors">
                <Icon path={ICONS.microphone} />
                {isListening && <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>}
              </button>
            )}
            <button 
              onClick={handleSend}
              className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors disabled:opacity-50"
              disabled={!inputValue.trim() || isLoading}
            >
              <Icon path={ICONS.send} />
            </button>
          </div>
          <p className="text-xs text-center text-gray-500 mt-2">
            klerity.ai can make mistakes. Consider checking important information.
          </p>
        </div>
      </footer>
    </div>
  );
}

// --- Main App Component ---
export default function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [chatSessions, setChatSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState({ name: "John", email: "john.vanwie@example.com" });
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);

  // Text-to-speech function
  const speak = (text) => {
    if (!isSpeechEnabled || !window.speechSynthesis) return;
    
    // Cancel any previous speech
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/```[\s\S]*?```/g, 'Code block.').replace(/(\*\*|\*)/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Find the best available US English voice
    const voices = window.speechSynthesis.getVoices();
    const usVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) || voices.find(v => v.lang === 'en-US');
    
    if (usVoice) {
      utterance.voice = usVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  // Initialize with a default session
  useEffect(() => {
    if (chatSessions.length === 0) {
      const firstId = uuidv4();
      setChatSessions([
        {
          id: firstId,
          title: "New Chat",
          history: [
            { role: 'model', content: 'This is an initial message to trigger the banner.' }
          ]
        }
      ]);
      setActiveSessionId(firstId);
    }
  }, []);

  const handleNewChat = () => {
    const newId = uuidv4();
    const newSession = {
      id: newId,
      title: "New Chat",
      history: [{ role: 'model', content: 'This is an initial message to trigger the banner.' }]
    };
    setChatSessions(prev => [...prev, newSession]);
    setActiveSessionId(newId);
  };

  const onSendMessage = async (message) => {
    const newUserMessage = { role: 'user', content: message };

    let activeSession;
    const updatedSessions = chatSessions.map(session => {
      if (session.id === activeSessionId) {
        const isFirstUserMessage = session.history.filter(m => m.role === 'user').length === 0;
        const newTitle = isFirstUserMessage ? message.substring(0, 30) + (message.length > 30 ? "..." : "") : session.title;
        const newHistory = isFirstUserMessage ? [newUserMessage] : [...session.history, newUserMessage];
        activeSession = { ...session, title: newTitle, history: newHistory };
        return activeSession;
      }
      return session;
    });
    setChatSessions(updatedSessions);
    setIsLoading(true);

    const metaPrompt = composePrompt(message);

    const historyForBackend = activeSession.history.slice(0, -1);
    const finalHistoryForApi = (historyForBackend.length === 1 && historyForBackend[0].role === 'model') 
      ? [] 
      : historyForBackend.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        }));

    const messageWithPrompt = `${metaPrompt}\n\n---\n\nUSER QUERY: ${message}`;

    try {
      const res = await fetch('https://klerity-chat.onrender.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: finalHistoryForApi,
          message: messageWithPrompt,
        }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      const modelResponse = { role: 'model', content: data.response };
      
      speak(modelResponse.content);

      setChatSessions(prevSessions => prevSessions.map(session => 
        session.id === activeSessionId 
          ? { ...session, history: [...session.history, modelResponse] } 
          : session
      ));

    } catch (error) {
      console.error("Failed to fetch from backend:", error);
      const errorResponse = { role: 'model', content: "Sorry, I'm having trouble connecting. Please try again later." };
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
        <button 
          onClick={() => setSidebarOpen(true)} 
          className="lg:hidden absolute top-4 left-4 z-10 bg-gray-900 p-2 rounded-md text-white"
        >
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
