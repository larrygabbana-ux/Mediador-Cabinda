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
  MessageSquare, 
  HelpCircle, 
  ChevronDown, 
  Mic, 
  ExternalLink,
  ShieldCheck,
  Clock,
  Truck
} from 'lucide-react';
import { BotMessage, BotSettings } from '../types';
import { solveBotQueryLocally, POPULAR_QUESTIONS } from '../utils/aiBotKnowledge';

interface AiChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateView?: (view: string) => void;
  clientName?: string;
  clientTier?: string;
  botSettings?: BotSettings;
}

const DEFAULT_SETTINGS: BotSettings = {
  enabled: true,
  botName: 'Mano Mediador IA',
  welcomeMessage: 'Olá! Sou o Assistente Virtual 24/7 do Mediador Cabinda. Posso esclarecer qualquer dúvida sobre encomendas, prazos, pagamentos por Multicaixa Express/IBAN e rastreio de cargas.',
  offHoursMessage: 'Estamos no período noturno/fora de expediente, mas eu estou 100% online para ajudá-lo com respostas imediatas!',
  autoReplyInSharedChat: true,
  businessHoursStart: '08:00',
  businessHoursEnd: '18:00',
  allowWhatsAppEscalation: true,
  whatsAppNumber: '+244942043293'
};

export default function AiChatbotModal({
  isOpen,
  onClose,
  onNavigateView,
  clientName,
  clientTier,
  botSettings = DEFAULT_SETTINGS
}: AiChatbotModalProps) {
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
          'Quais as taxas de intermediação?'
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

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
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
    } else {
      // Fallback prompt
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
      // 1. Attempt Server-Side Gemini API call
      const response = await fetch('/api/bot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: updatedMessages.slice(-6),
          clientName: clientName || 'Cliente Cabinda',
          clientTier: clientTier || 'Standard'
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
            actionLink = { label: 'Ver Pagamentos', view: 'pagamentos', icon: '💳' };
          } else if (lower.includes('servico') || lower.includes('serralharia')) {
            actionLink = { label: 'Solicitar Serviço', view: 'solicitar-servico', icon: '🛠️' };
          }
        }
      }

      // 2. If Gemini API was offline / fallback, use our rich local knowledge engine
      if (!botText) {
        const localAnswer = solveBotQueryLocally(textToSend);
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

      // If global TTS is active, speak the answer
      if (ttsActive) {
        speakText(botText);
      }
    } catch {
      // Local fallback in case of absolute network drop
      const localAnswer = solveBotQueryLocally(textToSend);
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
    if (confirm('Deseja limpar o histórico da conversa com o Assistente IA?')) {
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
            'Quais as taxas de intermediação?'
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

  return (
    <div 
      className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in"
      id="ai-chatbot-modal"
    >
      <div 
        className="bg-white w-full sm:max-w-lg h-[92vh] sm:h-[680px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-scale-up"
        id="ai-chatbot-card"
      >
        {/* HEADER */}
        <div className="bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white font-display">
                  {botSettings.botName || 'Mano Mediador IA'}
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Online 24/7
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Atendimento inteligente a qualquer hora (com ou sem expediente)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            {/* Audio narration toggle */}
            <button
              onClick={() => {
                setTtsActive(!ttsActive);
                if (ttsActive && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
              }}
              title={ttsActive ? 'Desativar Leitura de Voz Automática' : 'Ativar Leitura de Voz Automática'}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                ttsActive ? 'bg-amber-400 text-slate-950 font-bold' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              {ttsActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Clear chat history */}
            <button
              onClick={handleClearChat}
              title="Limpar Conversa"
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-xl transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Close modal */}
            <button
              onClick={onClose}
              title="Fechar Assistente"
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* QUICK TOPIC CHIPS BAR */}
        <div className="bg-amber-50/80 border-b border-amber-100/80 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-600" /> Tópicos:
          </span>
          <button
            onClick={() => handleSendMessage('Quais são os prazos de entrega para Cabinda?')}
            className="px-2.5 py-1 bg-white hover:bg-amber-100 text-slate-700 text-[10px] font-bold rounded-lg border border-amber-200/80 shrink-0 transition-all cursor-pointer shadow-2xs"
          >
            ⏱️ Prazos
          </button>
          <button
            onClick={() => handleSendMessage('Como pagar por Multicaixa Express ou IBAN?')}
            className="px-2.5 py-1 bg-white hover:bg-amber-100 text-slate-700 text-[10px] font-bold rounded-lg border border-amber-200/80 shrink-0 transition-all cursor-pointer shadow-2xs"
          >
            💳 Pagamentos
          </button>
          <button
            onClick={() => handleSendMessage('Quais são as taxas de intermediação e comissão?')}
            className="px-2.5 py-1 bg-white hover:bg-amber-100 text-slate-700 text-[10px] font-bold rounded-lg border border-amber-200/80 shrink-0 transition-all cursor-pointer shadow-2xs"
          >
            💰 Taxas
          </button>
          <button
            onClick={() => handleSendMessage('Como rastrear a minha encomenda?')}
            className="px-2.5 py-1 bg-white hover:bg-amber-100 text-slate-700 text-[10px] font-bold rounded-lg border border-amber-200/80 shrink-0 transition-all cursor-pointer shadow-2xs"
          >
            🚚 Rastreio
          </button>
          <button
            onClick={() => handleSendMessage('Como solicitar serviços de serralharia?')}
            className="px-2.5 py-1 bg-white hover:bg-amber-100 text-slate-700 text-[10px] font-bold rounded-lg border border-amber-200/80 shrink-0 transition-all cursor-pointer shadow-2xs"
          >
            🛠️ Serviços
          </button>
          <button
            onClick={() => handleSendMessage('Onde fica o armazém e balcão em Cabinda?')}
            className="px-2.5 py-1 bg-white hover:bg-amber-100 text-slate-700 text-[10px] font-bold rounded-lg border border-amber-200/80 shrink-0 transition-all cursor-pointer shadow-2xs"
          >
            🏢 Balcões
          </button>
          <button
            onClick={() => handleSendMessage('Quero falar com um operador humano no WhatsApp')}
            className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[10px] font-extrabold rounded-lg border border-emerald-300 shrink-0 transition-all cursor-pointer shadow-2xs flex items-center gap-1"
          >
            <Phone className="w-2.5 h-2.5 text-emerald-700" /> WhatsApp
          </button>
        </div>

        {/* MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60" id="ai-chat-messages-container">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div 
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5 animate-fade-in`}
              >
                <div className="flex items-center gap-1.5 px-1">
                  {!isUser && (
                    <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                      🤖 {botSettings.botName || 'Assistente IA'}
                      {msg.source === 'gemini' && (
                        <span className="text-[8px] bg-amber-200/60 text-amber-900 px-1.5 py-0.2 rounded-full font-mono">
                          Gemini
                        </span>
                      )}
                    </span>
                  )}
                  <span className="text-[9px] text-slate-400 font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div 
                  className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-3.5 text-xs shadow-xs leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                  }`}
                >
                  {/* Message body text */}
                  <div className="space-y-2">
                    {msg.text.split('\n\n').map((paragraph, idx) => (
                      <p key={idx} className="leading-relaxed">
                        {paragraph.split('\n').map((line, lIdx) => {
                          // Format bold text
                          const parts = line.split(/(\*\*.*?\*\*)/g);
                          return (
                            <span key={lIdx} className="block">
                              {parts.map((p, pIdx) => {
                                if (p.startsWith('**') && p.endsWith('**')) {
                                  return (
                                    <strong key={pIdx} className={isUser ? 'text-amber-300 font-bold' : 'text-slate-950 font-bold'}>
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

                  {/* Action link button if attached */}
                  {msg.actionLink && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => {
                          if (onNavigateView && msg.actionLink?.view) {
                            onNavigateView(msg.actionLink.view);
                            onClose();
                          }
                        }}
                        className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <span>{msg.actionLink.icon || '👉'}</span>
                        <span>{msg.actionLink.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Tool actions on bot message (Audio reader & Copy) */}
                  {!isUser && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[10px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => speakText(msg.text, msg.id)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                            speakingMsgId === msg.id ? 'bg-amber-100 text-amber-900 font-bold' : 'hover:text-slate-700'
                          }`}
                          title="Ouvir Resposta por Áudio"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>{speakingMsgId === msg.id ? 'A falar...' : 'Ouvir'}</span>
                        </button>

                        <button
                          onClick={() => copyToClipboard(msg.text, msg.id)}
                          className="flex items-center gap-1 hover:text-slate-700 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                          title="Copiar Resposta"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600 font-bold">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>

                      <span className="text-[8.5px] text-slate-350 font-mono">
                        Mediador Cabinda 24/7
                      </span>
                    </div>
                  )}
                </div>

                {/* Suggested follow-up questions */}
                {!isUser && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1 pl-1 max-w-[95%]">
                    {msg.suggestedQuestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSendMessage(sug)}
                        className="px-2.5 py-1 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 text-[10px] font-bold rounded-xl border border-slate-200 hover:border-amber-300 transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                      >
                        <span>💬</span> {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 p-3 bg-white border border-slate-200/80 rounded-2xl rounded-tl-xs w-28 text-slate-400 text-xs shadow-xs animate-pulse">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-[10px] font-bold text-slate-500 ml-1">A pensar...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT FORM */}
        <div className="p-3 bg-white border-t border-slate-100 shrink-0 space-y-2">
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
              title="Falar por voz"
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isListeningVoice
                  ? 'bg-red-500 border-red-600 text-white animate-pulse'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Escreva a sua dúvida sobre encomendas, prazos, taxas..."
              className="flex-1 p-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all"
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className={`p-2.5 px-3.5 rounded-xl font-bold transition-all flex items-center gap-1.5 text-xs cursor-pointer shadow-xs ${
                inputQuery.trim() && !isLoading
                  ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 font-black active:scale-95'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </form>

          {/* Bottom Help and Escalation Bar */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Respostas baseadas nas políticas oficiais de Cabinda
            </span>

            {botSettings.allowWhatsAppEscalation && (
              <a
                href={`https://wa.me/${botSettings.whatsAppNumber.replace(/\+/g, '')}?text=Ol%C3%A1%2C+preciso+de+ajuda+com+o+Mediador+Cabinda`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 hover:text-emerald-800 font-extrabold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Falar no WhatsApp</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
