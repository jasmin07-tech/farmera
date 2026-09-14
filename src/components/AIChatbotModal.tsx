import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import {
  Bot,
  Send,
  X,
  Sparkles,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Copy,
  Check,
  RefreshCw,
  HelpCircle,
  Sprout,
  Store,
  QrCode,
  TrendingUp,
  UserCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useFarmStore } from '../services/store';
import { translations } from '../i18n/translations';
import { Language, UserRole } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  source?: 'gemini-3.8-flash' | 'domain-fallback';
}

interface AIChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: string) => void;
  onOpenQRScanner?: () => void;
  onOpenPassportById?: (farmerId: string) => void;
  initialPrompt?: string;
}

const QUICK_PROMPTS_BY_ROLE: Record<UserRole, string[]> = {
  customer: [
    'How does FarmEra eliminate 40% middlemen costs?',
    'What crops were freshly harvested today?',
    'How does live weather affect produce freshness and delivery?',
    'How do I verify a farmer using the Digital Farm Passport?',
    'Best storage tips to keep organic greens fresh',
    'How is FarmEra direct price compared to supermarkets?',
  ],
  farmer: [
    'How does today\'s live weather affect my spraying and harvest window?',
    'Organic remedy for aphids and tomato leaf curl',
    'How do I list my morning harvest with GPS live photo?',
    'Recipe and preparation method for Jeevamrutham',
    'How does the AI Demand Forecast predict crop prices?',
    'When will my harvest payout be credited to my bank?',
  ],
  bulk_buyer: [
    'How can restaurants procure farm-gate produce in bulk?',
    'What is the minimum order quantity for FPO direct supply?',
    'How does AI Route Optimization streamline batch deliveries?',
    'Can I get GST invoice and FPO compliance certificates?',
  ],
};

export const AIChatbotModal: React.FC<AIChatbotModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onOpenQRScanner,
  onOpenPassportById,
  initialPrompt,
}) => {
  const { currentUser, currentLang, farmers, crops, actions } = useFarmStore();
  const t = translations[currentLang];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      setInputText(initialPrompt);
    }
  }, [initialPrompt]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Initialize welcoming message on open or language/role switch
  useEffect(() => {
    if (messages.length === 0) {
      const getInitialGreeting = (): string => {
        if (currentLang === 'ta') {
          if (currentUser.role === 'farmer') {
            return `**வணக்கம் ${currentUser.name} அவர்களே!** 🌾\n\nநான் உங்கள் **FarmEra கிசான் AI உதவியாளர்**. இயற்கை பூச்சி மேலாண்மை (பஞ்சகாவ்யா, வேப்ப எண்ணெய்), நேரடி மண்டி விலைகள், அறுவடை பட்டியல் மற்றும் டிஜிட்டல் பாஸ்போர்ட் குறித்து எதையும் என்னிடம் கேட்கலாம்!`;
          }
          return `**வணக்கம்!** 🥗\n\nநான் உங்கள் **FarmEra AI உதவியாளர்**. இடைத்தரகர்கள் இல்லாத நேரடி விவசாயச் சந்தை, புதிய காய்கறிகள், சேமிப்பு குறிப்புகள் மற்றும் விவசாயிகளின் கதைகளைப் பற்றி அறிய நான் தயாராக உள்ளேன்.`;
        }

        if (currentLang === 'hi') {
          if (currentUser.role === 'farmer') {
            return `**नमस्ते ${currentUser.name} जी!** 🌾\n\nमैं आपका **FarmEra किसान AI सहायक** हूँ। जैविक खाद (जीवामृत, पंचगव्य), कीट नियंत्रण, मंडी भाव और डिजिटल फार्म पासपोर्ट के बारे में कुछ भी पूछें।`;
          }
          return `**नमस्ते!** 🥗\n\nमैं आपका **FarmEra AI सहायक** हूँ। बिना बिचौलियों के ताज़ा उपज, डिजिटल फार्म पासपोर्ट, बचत और फसल भंडारण के बारे में जो चाहें पूछें!`;
        }

        // English greeting
        if (currentUser.role === 'farmer') {
          return `**Greetings ${currentUser.name}!** 🌾\n\nI am your **FarmEra Kisan AI Assistant** powered by Gemini. I can assist you with:\n\n- **Natural & Organic Agronomy**: Formulations for Jeevamrutham, Panchagavya, and natural pest solutions.\n- **Market Transparency**: Real-time mandi comparisons and how you earn 95%+ directly in your bank.\n- **Digital Farm Passport**: Uploading live GPS-verified camera photos of your crops.\n- **AI Demand Intelligence**: Optimal harvest timing to avoid market gluts.`;
        } else if (currentUser.role === 'bulk_buyer') {
          return `**Hello ${currentUser.name}!** 🏢\n\nI am your **FarmEra Commercial Procurement AI**. Ask me about institutional bulk purchasing directly from partner FPO collectives, scheduled batch deliveries, and traceability compliance.`;
        }

        return `**Hello ${currentUser.name}!** 🌿\n\nWelcome to **FarmEra's Direct Farm Network**. I am your personal AI companion. Ask me anything about:\n\n- **Freshness & Traceability**: How our GPS-verified Digital Farm Passports work.\n- **Zero Middlemen Savings**: How cutting 40% mandi commissions saves you money and rewards farmers.\n- **Produce Storage**: How to store native heirloom crops for maximum freshness.\n- **Farms & Harvests**: Today's morning harvest from Pollachi, Nilgiris, and Thanjavur.`;
      };

      setMessages([
        {
          id: 'welcome-1',
          role: 'model',
          content: getInitialGreeting(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [currentUser.role, currentLang]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  // Handle Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang =
        currentLang === 'ta' ? 'ta-IN' : currentLang === 'hi' ? 'hi-IN' : 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          handleSendMessage(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      speechRecognitionRef.current = recognition;
    }
  }, [currentLang]);

  const toggleVoiceInput = () => {
    if (!speechRecognitionRef.current) {
      alert('Speech recognition is not supported in this browser environment. Please type your question.');
      return;
    }

    if (isListening) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        speechRecognitionRef.current.lang =
          currentLang === 'ta' ? 'ta-IN' : currentLang === 'hi' ? 'hi-IN' : 'en-IN';
        speechRecognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const handleSpeakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Strip markdown formatting for cleaner speech
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#/g, '')
      .replace(/`/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang =
      currentLang === 'ta' ? 'ta-IN' : currentLang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-8).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            userName: currentUser.name,
            role: currentUser.role,
            language: currentLang,
            activeTab: 'marketplace',
            availableCropsCount: crops.length,
            registeredFarmersCount: farmers.length,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        content: data.reply || 'Here is what I found for you!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'gemini-3.8-flash',
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Chat request failed:', err);
      // Fallback message if network issues occur
      const fallbackAiMessage: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'model',
        content:
          currentLang === 'ta'
            ? `மன்னிக்கவும், தகவலைப் பெறுவதில் தாமதம் ஏற்பட்டுள்ளது. நீங்கள் 'Fresh Marketplace' அல்லது 'AI Demand' பக்கத்தை நேரில் பார்வையிடலாம்.`
            : currentLang === 'hi'
            ? `क्षमा करें, कनेक्शन में रुकावट आई है। आप 'मार्केटप्लेस' में ताज़ा फसलें सीधे देख सकते हैं।`
            : `**Network Notice:** Unable to contact the AI server. However, FarmEra's marketplace and passport features are operating fully offline. You can explore fresh produce in the Marketplace tab or scan farm QR codes.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'domain-fallback',
      };
      setMessages((prev) => [...prev, fallbackAiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isMaximized
          ? 'inset-2 sm:inset-4 md:inset-8 bg-white rounded-2xl shadow-2xl border border-stone-300 flex flex-col overflow-hidden'
          : 'bottom-4 right-4 w-[95vw] sm:w-[440px] h-[600px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden'
      }`}
      id="ai-chatbot-window"
    >
      {/* Top Header Bar */}
      <div className="bg-stone-900 text-white px-4 py-3 flex items-center justify-between border-b border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-stone-900 animate-pulse"></span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-1">
                <span>FarmEra AI</span>
                <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 uppercase">
                  Gemini
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-stone-400 font-medium">
              {currentUser.role === 'farmer'
                ? 'Kisan Agronomy & Payout Assistant'
                : 'Direct Farm-to-Fork Companion'}
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-1">
          {/* Audio read-aloud toggle */}
          <button
            onClick={() => {
              if (isSpeaking) {
                window.speechSynthesis?.cancel();
                setIsSpeaking(false);
              } else if (messages.length > 0) {
                const lastModelMsg = [...messages].reverse().find((m) => m.role === 'model');
                if (lastModelMsg) handleSpeakText(lastModelMsg.content);
              }
            }}
            className={`p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors ${
              isSpeaking ? 'text-amber-400 bg-amber-950/40' : ''
            }`}
            title={isSpeaking ? 'Stop speaking' : 'Read latest answer aloud'}
            aria-label="Speech audio"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Reset chat */}
          <button
            onClick={handleClearChat}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            title="Clear chat history"
            aria-label="Clear chat"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Maximize / restore */}
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors hidden sm:block"
            title={isMaximized ? 'Restore size' : 'Maximize window'}
            aria-label="Resize window"
          >
            {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            title="Close chatbot"
            aria-label="Close"
            id="close-ai-chatbot-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Role & Language Bar */}
      <div className="bg-stone-100/90 border-b border-stone-200 px-4 py-1.5 flex items-center justify-between text-[11px] text-stone-600">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Role: <strong className="text-stone-900">{currentUser.role === 'farmer' ? '🌾 Farmer' : currentUser.role === 'bulk_buyer' ? '🏢 Bulk Buyer' : '🥗 Customer'}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-stone-400">•</span>
          <span>Lang: <strong className="uppercase text-stone-900">{currentLang}</strong></span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  isUser
                    ? 'bg-stone-800 text-white'
                    : 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/20'
                }`}
              >
                {isUser ? (
                  currentUser.name.charAt(0) || 'U'
                ) : (
                  <Sprout className="w-4 h-4" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-stone-900 text-white rounded-tr-none'
                    : 'bg-white border border-stone-200 text-stone-800 rounded-tl-none'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="space-y-2">
                    <div className="markdown-body prose prose-stone prose-xs max-w-none text-xs leading-relaxed space-y-2">
                      <Markdown>{msg.content}</Markdown>
                    </div>

                    {/* Footer bar on assistant messages: timestamp, copy, speak */}
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-stone-100 text-[10px] text-stone-400">
                      <div className="flex items-center gap-1.5">
                        <span>{msg.timestamp}</span>
                        {msg.source && (
                          <span className="px-1 py-0.2 rounded bg-stone-100 text-stone-500 font-mono text-[9px]">
                            {msg.source === 'gemini-3.8-flash' ? 'gemini-3.8' : 'offline'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleSpeakText(msg.content)}
                          className="p-1 hover:text-stone-700 rounded transition-colors"
                          title="Read aloud"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleCopyText(msg.id, msg.content)}
                          className="p-1 hover:text-stone-700 rounded transition-colors"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Sprout className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.15s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.3s]"></span>
                </span>
                <span>Thinking with Gemini...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-3 py-2 bg-white border-t border-stone-100 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-1.5">
        <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider flex items-center gap-0.5 shrink-0 pl-1">
          <Sparkles className="w-3 h-3 text-amber-500" /> Suggestions:
        </span>
        {(QUICK_PROMPTS_BY_ROLE[currentUser.role] || QUICK_PROMPTS_BY_ROLE.customer).map(
          (prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className="text-[11px] bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-stone-700 px-2.5 py-1 rounded-full border border-stone-200 shrink-0 transition-colors disabled:opacity-50"
            >
              {prompt}
            </button>
          )
        )}
      </div>

      {/* Input Form Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
      >
        {/* Voice dictation button */}
        <button
          type="button"
          onClick={toggleVoiceInput}
          className={`p-2.5 rounded-xl border transition-all ${
            isListening
              ? 'bg-red-500 text-white border-red-600 animate-pulse'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
          }`}
          title={isListening ? 'Listening... click to stop' : 'Dictate with microphone (Tamil, Hindi, English)'}
          aria-label="Microphone dictation"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            isListening
              ? 'Listening to speech...'
              : currentLang === 'ta'
              ? 'பயிர்கள், மண்டி விலை, இயற்கை உரம் பற்றிக் கேளுங்கள்...'
              : currentLang === 'hi'
              ? 'फसल, जैविक खाद या सही दाम के बारे में पूछें...'
              : 'Ask anything about crops, direct pricing, pest remedies...'
          }
          className="flex-1 bg-stone-100 hover:bg-stone-100/80 focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-900 transition-all placeholder:text-stone-400"
          id="ai-chatbot-input"
          disabled={isLoading}
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white p-2.5 rounded-xl transition-all shadow-sm shadow-emerald-700/20 active:scale-95 shrink-0"
          title="Send message"
          id="ai-chatbot-send-btn"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
