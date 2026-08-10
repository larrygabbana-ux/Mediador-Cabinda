/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Trash2, 
  Phone, 
  ArrowRight, 
  Copy, 
  Check, 
  Mic, 
  ExternalLink,
  ShieldCheck,
  Clock,
  Truck,
  RotateCcw,
  MessageSquare,
  Radio
} from 'lucide-react';
import { BotMessage, BotSettings, DynamicKnowledgeItem, GeneralLogisticsSettings } from '../types';
import { 
  solveBotQueryLocally, 
  getStoredLogisticsConfig, 
  getStoredKnowledgeBase, 
  buildLogisticsAIContext 
} from '../utils/aiBotKnowledge';

interface AiChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateView?: (view: string) => void;
  clientName?: string;
  clientTier?: string;
  botSettings?: BotSettings;
  dynamicLogisticsConfig?: GeneralLogisticsSettings;
  dynamicKnowledgeBase?: DynamicKnowledgeItem[];
}

const DEFAULT_SETTINGS: BotSettings = {
  enabled: true,
  botName: 'Assistente Executivo IA',
  welcomeMessage: 'Bem-vindo ao Mediador Cabinda Lda! Sou o Assistente Virtual Oficial 24/7. Estou pronto para prestar esclarecimentos completos e transparentes sobre o funcionamento da intermediação, prazos de entrega marítimos e aéreos, métodos de pagamento seguros (Multicaixa Express e IBAN) e rastreamento de cargas.',
  offHoursMessage: 'Estamos no período noturno/fora de expediente presencial, mas o nosso suporte inteligente continua 100% ativo com respostas imediatas.',
  autoReplyInSharedChat: true,
  businessHoursStart: '08:00',
  businessHoursEnd: '18:00',
  allowWhatsAppEscalation: true,
  whatsAppNumber: '+244942043293'
};

const QUICK_TOPICS = [
  { label: '⚙️ Como Funciona em 6 Passos', query: 'Como funciona o Mediador Cabinda e quais são os passos do processo?' },
  { label: '⏱️ Prazos de Entrega', query: 'Quais são os prazos de entrega marítimos e aéreos para Cabinda?' },
  { label: '💳 Multicaixa Express & IBAN', query: 'Como pagar por Multicaixa Express ou transferência bancária IBAN?' },
  { label: '💰 Taxas & Comissões', query: 'Quais são as taxas de intermediação, despacho aduaneiro e comissão?' },
  { label: '🚚 Rastreio de Cargas MED', query: 'Como funciona o código de rastreio MED-XXXX e como acompanhar a carga?' },
  { label: '🏢 Balcões Luanda & Cabinda', query: 'Onde ficam localizados os armazéns e balcões oficiais de atendimento?' },
  { label: '🛠️ Serralharia & Oficinas', query: 'Como solicitar serviços de serralharia e fabricação metálica em Cabinda?' },
  { label: '🛒 Fazer Pedido no App', query: 'Como faço um novo pedido ou encomenda no aplicativo?' },
  { label: '📜 Fundador João Hilário', query: 'Quem é o fundador e criador do Mediador Cabinda?' },
  { label: '📞 Falar no WhatsApp', query: 'Quero falar com um atendente humano no WhatsApp oficial' }
];

export default function AiChatbotModal({
  isOpen,
  onClose,
  onNavigateView,
  clientName,
  clientTier,
  botSettings = DEFAULT_SETTINGS,
  dynamicLogisticsConfig,
  dynamicKnowledgeBase
}: AiChatbotModalProps) {
  const currentLogistics = dynamicLogisticsConfig || getStoredLogisticsConfig();
  const currentKnowledge = dynamicKnowledgeBase || getStoredKnowledgeBase();

  // Visual Theme: 'light' (Clean White AliExpress style) by default, or 'dark' (Facebook Messenger style)
  const [chatTheme, setChatTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('mediador_cabinda_chat_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      // fallback
    }
    return 'light'; // Default to pristine Clean White (AliExpress style)
  });

  const toggleTheme = () => {
    const next = chatTheme === 'light' ? 'dark' : 'light';
    setChatTheme(next);
    try {
      localStorage.setItem('mediador_cabinda_chat_theme', next);
    } catch {
      // ignore
    }
  };

  const [messages, setMessages] = useState<BotMessage[]>(() => {
    try {
      const saved = localStorage.getItem('mediador_cabinda_chatbot_history');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [
      {
        id: 'welcome-msg',
        sender: 'bot',
        text: botSettings.welcomeMessage || DEFAULT_SETTINGS.welcomeMessage,
        timestamp: new Date().toISOString(),
        suggestedQuestions: [
          'Como funciona o Mediador Cabinda?',
          'Quais são os prazos de entrega?',
          'Como pagar por Multicaixa Express ou IBAN?',
          'Quais as taxas de intermediação e despacho?'
        ]
      }
    ];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [ttsActive, setTtsActive] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [isListeningVoice, setIsListeningVoice] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 250);
    }
  }, [isOpen, messages]);

  // Persist messages in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mediador_cabinda_chatbot_history', JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  // Text-To-Speech helper
  const speakText = (text: string, msgId?: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (speakingMsgId === msgId) {
      setSpeakingMsgId(null);
      return;
    }

    const cleanText = text.replace(/[*_#`[\]()]/g, '').replace(/https?:\/\/\S+/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-PT';
    utterance.rate = 1.05;

    if (msgId) {
      setSpeakingMsgId(msgId);
      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);
    }

    window.speechSynthesis.speak(utterance);
  };

  // Voice Recognition Handler
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-AO';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        setIsListeningVoice(true);

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputQuery(transcript);
          setIsListeningVoice(false);
          setTimeout(() => handleSendMessage(transcript), 300);
        };

        recognition.onerror = () => {
          setIsListeningVoice(false);
        };

        recognition.onend = () => {
          setIsListeningVoice(false);
        };

        recognition.start();
      } catch {
        setIsListeningVoice(false);
      }
    } else {
      const text = prompt('Dite ou escreva a sua dúvida para o Assistente IA:');
      if (text) {
        handleSendMessage(text);
      }
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputQuery).trim();
    if (!textToSend || isLoading) return;

    const userMsg: BotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputQuery('');
    setIsLoading(true);

    try {
      // 1. Attempt Server-Side Gemini API call with dynamic logistics and knowledge context
      const logisticsContextText = buildLogisticsAIContext(currentLogistics, currentKnowledge);

      const response = await fetch('/api/bot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: updatedMessages.slice(-6),
          clientName: clientName || 'Cliente Cabinda',
          clientTier: clientTier || 'Standard',
          dynamicLogisticsConfig: currentLogistics,
          dynamicKnowledgeContext: logisticsContextText
        })
      });

      let botText = '';
      let suggestedQuestions: string[] = [];
      let source: 'gemini' | 'knowledge_base' = 'knowledge_base';
      let actionLink: { label: string; view: string; icon?: string } | undefined;

      if (response.ok) {
        const data = await response.json();
        if (data.text && !data.fallback) {
          botText = data.text;
          suggestedQuestions = data.suggestedQuestions || [];
          source = 'gemini';
          
          // Match actions
          const lower = textToSend.toLowerCase();
          if (lower.includes('pedido') || lower.includes('comprar')) {
            actionLink = { label: 'Fazer Novo Pedido', view: 'fazer-pedido', icon: '🛒' };
          } else if (lower.includes('rastreio') || lower.includes('rastrear') || lower.includes('acompanhar')) {
            actionLink = { label: 'Acompanhar Encomendas', view: 'acompanhar-pedido', icon: '🚚' };
          } else if (lower.includes('pagar') || lower.includes('fatura') || lower.includes('iban')) {
            actionLink = { label: 'Ver Pagamentos & Faturas', view: 'pagamentos', icon: '💳' };
          } else if (lower.includes('servico') || lower.includes('serralharia')) {
            actionLink = { label: 'Solicitar Serviço de Serralharia', view: 'solicitar-servico', icon: '🛠️' };
          } else if (lower.includes('sobre') || lower.includes('fundador') || lower.includes('historia')) {
            actionLink = { label: 'Conhecer Sobre Nós', view: 'sobre-nos', icon: '🏢' };
          }
        }
      }

      // 2. If Gemini API was offline / fallback / quota limit, use our intelligent local knowledge engine
      if (!botText) {
        const localAnswer = solveBotQueryLocally(textToSend, currentKnowledge, currentLogistics);
        botText = localAnswer.text;
        suggestedQuestions = localAnswer.suggestedQuestions;
        actionLink = localAnswer.actionLink;
        source = 'knowledge_base';
      }

      const botMsg: BotMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botText,
        timestamp: new Date().toISOString(),
        source,
        suggestedQuestions,
        actionLink
      };

      setMessages(prev => [...prev, botMsg]);

      if (ttsActive) {
        speakText(botText);
      }
    } catch {
      // Local fallback in case of absolute network drop
      const localAnswer = solveBotQueryLocally(textToSend, currentKnowledge, currentLogistics);
      const fallbackMsg: BotMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: localAnswer.text,
        timestamp: new Date().toISOString(),
        source: 'knowledge_base',
        suggestedQuestions: localAnswer.suggestedQuestions,
        actionLink: localAnswer.actionLink
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm('Deseja limpar todo o histórico desta conversa com o Assistente IA?')) {
      const initial: BotMessage[] = [
        {
          id: `welcome-${Date.now()}`,
          sender: 'bot',
          text: botSettings.welcomeMessage || DEFAULT_SETTINGS.welcomeMessage,
          timestamp: new Date().toISOString(),
          suggestedQuestions: [
            'Como funciona o Mediador Cabinda?',
            'Quais são os prazos de entrega?',
            'Como pagar por Multicaixa Express ou IBAN?',
            'Quais as taxas de intermediação e despacho?'
          ]
        }
      ];
      setMessages(initial);
      localStorage.setItem('mediador_cabinda_chatbot_history', JSON.stringify(initial));
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  const isLight = chatTheme === 'light';

  return (
    <div 
      className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      id="ai-chatbot-modal"
      onClick={(e) => {
        // Close modal when clicking on the dark backdrop outside the chat box
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className={`w-full sm:max-w-xl h-[95vh] sm:h-[730px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-colors duration-200 animate-scale-up relative border ${
          isLight
            ? 'bg-white text-slate-900 border-slate-200'
            : 'bg-slate-950 text-slate-100 border-slate-800'
        }`}
        id="ai-chatbot-card"
      >
        {/* TOP HEADER: Clear branding + Highly visible Close button */}
        <div 
          className={`px-4 sm:px-5 py-3.5 flex items-center justify-between border-b shrink-0 relative z-10 ${
            isLight
              ? 'bg-white border-slate-200 text-slate-900 shadow-xs'
              : 'bg-slate-900 border-slate-800 text-white'
          }`}
        >
          {/* Left: Avatar + Title */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse shadow-xs"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm font-display tracking-tight text-slate-900 dark:text-white">
                  {botSettings.botName || 'Assistente Mediador IA'}
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                  Online 24/7
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Atendimento Oficial Mediador Cabinda Lda
              </p>
            </div>
          </div>

          {/* Right Action Controls + BIG VISIBLE CLOSE BUTTON */}
          <div className="flex items-center gap-1.5">
            {/* Theme Toggle (AliExpress White vs Facebook Dark) */}
            <button
              onClick={toggleTheme}
              title={isLight ? 'Alternar para Modo Escuro (Facebook)' : 'Alternar para Fundo Branco (AliExpress)'}
              className={`p-2 rounded-xl transition-all cursor-pointer text-xs font-semibold flex items-center gap-1 border ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {isLight ? '🌙' : '☀️'}
            </button>

            {/* Audio narration toggle */}
            <button
              onClick={() => {
                setTtsActive(!ttsActive);
                if (ttsActive && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
              }}
              title={ttsActive ? 'Desativar Leitura de Voz Automática' : 'Ativar Leitura de Voz Automática'}
              className={`p-2 rounded-xl transition-all cursor-pointer border ${
                ttsActive 
                  ? 'bg-amber-400 text-slate-950 font-bold border-amber-500 shadow-xs' 
                  : isLight 
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              {ttsActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Clear chat history */}
            <button
              onClick={handleClearChat}
              title="Limpar Conversa"
              className={`p-2 rounded-xl transition-all cursor-pointer border ${
                isLight
                  ? 'bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 border-slate-200 hover:border-red-200'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 border-slate-700'
              }`}
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* ULTRA-PROMINENT CLOSE "X" BUTTON (Impossible to miss) */}
            <button
              onClick={onClose}
              id="close-ai-chatbot-modal-btn"
              title="Fechar Chat e Voltar (ESC)"
              aria-label="Fechar Assistente IA"
              className="ml-1 pl-3 pr-3.5 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-red-600/20 transition-all cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[3]" />
              <span className="font-display">Fechar</span>
            </button>
          </div>
        </div>

        {/* QUICK CATEGORY CHIPS BAR (AliExpress Clean Styling) */}
        <div 
          className={`px-3.5 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 border-b relative z-10 ${
            isLight
              ? 'bg-slate-50/90 border-slate-200'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <span className="text-[11px] font-black text-amber-600 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Dúvidas Rápidas:
          </span>
          {QUICK_TOPICS.map((topic, tIdx) => (
            <button
              key={tIdx}
              onClick={() => handleSendMessage(topic.query)}
              className={`px-3 py-1 text-[11.5px] font-medium rounded-xl border shrink-0 transition-all cursor-pointer active:scale-95 whitespace-nowrap shadow-2xs ${
                isLight
                  ? 'bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-950 border-slate-250 hover:border-amber-400'
                  : 'bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-200 border-slate-700 hover:border-amber-400'
              }`}
            >
              {topic.label}
            </button>
          ))}
        </div>

        {/* MESSAGES STREAM AREA (Clean White AliExpress Canvas or Dark Mode) */}
        <div 
          className={`flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 ${
            isLight
              ? 'bg-slate-50/60'
              : 'bg-slate-950'
          }`} 
          id="ai-chat-messages-container"
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div 
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5 animate-fade-in`}
              >
                {/* Sender Tag Header */}
                <div className="flex items-center gap-2 px-1">
                  {!isUser ? (
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-amber-500" />
                      <span className={isLight ? 'text-slate-900 font-extrabold' : 'text-slate-200'}>
                        {botSettings.botName || 'Assistente Mediador IA'}
                      </span>
                      {msg.source === 'gemini' ? (
                        <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-200 px-1.5 py-0.2 rounded-full font-bold">
                          ✨ Gemini IA
                        </span>
                      ) : (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold border ${
                          isLight 
                            ? 'bg-slate-100 text-slate-700 border-slate-200' 
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          🛡️ Base Oficial
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-500">
                      👤 Você
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Message Bubble Box */}
                <div 
                  className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 text-slate-950 font-semibold rounded-tr-xs shadow-sm shadow-amber-500/20'
                      : isLight
                        ? 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs shadow-xs'
                        : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-xs shadow-md'
                  }`}
                >
                  {/* Message Body Content */}
                  <div className="space-y-2.5">
                    {msg.text.split('\n\n').map((paragraph, idx) => (
                      <p key={idx} className="leading-relaxed">
                        {paragraph.split('\n').map((line, lIdx) => {
                          const parts = line.split(/(\*\*.*?\*\*)/g);
                          return (
                            <span key={lIdx} className="block">
                              {parts.map((p, pIdx) => {
                                if (p.startsWith('**') && p.endsWith('**')) {
                                  return (
                                    <strong 
                                      key={pIdx} 
                                      className={
                                        isUser 
                                          ? 'text-slate-950 font-black' 
                                          : isLight 
                                            ? 'text-slate-950 font-black' 
                                            : 'text-amber-300 font-bold'
                                      }
                                    >
                                      {p.slice(2, -2)}
                                    </strong>
                                  );
                                }
                                return p;
                              })}
                            </span>
                          );
                        })}
                      </p>
                    ))}
                  </div>

                  {/* Direct Action Link / Navigation Button */}
                  {msg.actionLink && (
                    <div className={`mt-3.5 pt-3 border-t flex items-center justify-between ${
                      isLight ? 'border-slate-100' : 'border-slate-800'
                    }`}>
                      <button
                        onClick={() => {
                          if (onNavigateView && msg.actionLink?.view) {
                            onNavigateView(msg.actionLink.view);
                            onClose();
                          }
                        }}
                        className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
                      >
                        <span>{msg.actionLink.icon || '👉'}</span>
                        <span>{msg.actionLink.label}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Utility bar for Bot Message: Audio speech & Copy to clipboard */}
                  {!isUser && (
                    <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-[11px] ${
                      isLight ? 'border-slate-100 text-slate-500' : 'border-slate-800 text-slate-400'
                    }`}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => speakText(msg.text, msg.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                            speakingMsgId === msg.id 
                              ? 'bg-amber-100 text-amber-900 font-bold border border-amber-200' 
                              : isLight 
                                ? 'hover:text-slate-900 hover:bg-slate-100' 
                                : 'hover:text-slate-200 hover:bg-slate-800'
                          }`}
                          title="Ouvir Resposta por Áudio"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{speakingMsgId === msg.id ? 'A reproduzir...' : 'Ouvir'}</span>
                        </button>

                        <button
                          onClick={() => copyToClipboard(msg.text, msg.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                            isLight ? 'hover:text-slate-900 hover:bg-slate-100' : 'hover:text-slate-200 hover:bg-slate-800'
                          }`}
                          title="Copiar Resposta"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600 font-bold">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                        Mediador Cabinda 24/7
                      </span>
                    </div>
                  )}
                </div>

                {/* Follow-up Suggested Question Chips */}
                {!isUser && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5 pl-1 max-w-[95%]">
                    {msg.suggestedQuestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSendMessage(sug)}
                        className={`px-3 py-1.5 text-[11.5px] font-medium rounded-xl border transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 active:scale-95 ${
                          isLight
                            ? 'bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-950 border-slate-200 hover:border-amber-400'
                            : 'bg-slate-900 hover:bg-amber-400 hover:text-slate-950 text-slate-300 border-slate-800 hover:border-amber-400'
                        }`}
                      >
                        <span className="text-amber-500">💬</span> 
                        <span>{sug}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className={`flex items-center gap-2.5 p-3.5 rounded-2xl rounded-tl-xs w-44 text-xs shadow-xs border animate-pulse ${
              isLight
                ? 'bg-white border-slate-200 text-slate-700'
                : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}>
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-[11.5px] font-bold text-amber-700 ml-1 font-mono">A escrever...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT FORM DOCK (Clean White AliExpress or Dark) */}
        <div 
          className={`p-3 sm:p-4 border-t shrink-0 space-y-2 relative z-10 ${
            isLight
              ? 'bg-white border-slate-200'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Voice input button */}
            <button
              type="button"
              onClick={handleVoiceInput}
              title={isListeningVoice ? 'A escutar... Fale agora' : 'Falar por comando de voz'}
              className={`p-3 rounded-2xl border transition-all cursor-pointer shrink-0 ${
                isListeningVoice
                  ? 'bg-red-500 border-red-400 text-white animate-pulse shadow-lg shadow-red-500/30'
                  : isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 hover:border-amber-400'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:border-amber-400'
              }`}
            >
              <Mic className="w-4.5 h-4.5" />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Escreva a sua dúvida sobre compras, fretes, prazos, taxas..."
              className={`flex-1 p-3 px-4 rounded-2xl text-xs sm:text-sm border transition-all font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 ${
                isLight
                  ? 'bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400 border-slate-200'
                  : 'bg-slate-800 focus:bg-slate-750 text-white placeholder:text-slate-500 border-slate-700'
              }`}
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className={`p-3 px-4.5 rounded-2xl font-bold transition-all flex items-center gap-2 text-xs sm:text-sm cursor-pointer shadow-md shrink-0 ${
                inputQuery.trim() && !isLoading
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black active:scale-95 shadow-amber-400/20'
                  : isLight
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </form>

          {/* Bottom Security Assurance & Escalation Link + Secondary Close Button */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Respostas oficiais do Mediador Cabinda</span>
            </span>

            <div className="flex items-center gap-3">
              {botSettings.allowWhatsAppEscalation && (
                <a
                  href={`https://wa.me/${botSettings.whatsAppNumber.replace(/\+/g, '')}?text=Ol%C3%A1%2C+estou+no+aplicativo+Mediador-Cabinda+e+preciso+de+ajuda`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 hover:text-emerald-800 font-extrabold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <span>WhatsApp</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {/* Bottom explicit close link */}
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-red-600 font-bold hover:underline cursor-pointer text-[10.5px]"
              >
                ✕ Sair do Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
