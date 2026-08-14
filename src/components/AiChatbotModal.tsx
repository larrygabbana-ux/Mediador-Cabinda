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
  Radio,
  Image as ImageIcon,
  Camera,
  Paperclip,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Download,
  Building2,
  CheckCircle2,
  Plus,
  HelpCircle,
  Store
} from 'lucide-react';
import { BotMessage, BotMessageAttachment, BotSettings, DynamicKnowledgeItem, GeneralLogisticsSettings } from '../types';
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
  { label: '📸 Intermediar Meu Fornecedor', query: 'Tenho o meu próprio fornecedor em Luanda e quero que o Mediador Cabinda faça a intermediação e vistoria com segurança.' },
  { label: '⚙️ Como Funciona em 6 Passos', query: 'Como funciona o Mediador Cabinda e quais são os passos do processo?' },
  { label: '⏱️ Prazos de Entrega', query: 'Quais são os prazos de entrega marítimos e aéreos para Cabinda?' },
  { label: '💳 Multicaixa Express & IBAN', query: 'Como pagar por Multicaixa Express ou transferência bancária IBAN?' },
  { label: '💰 Taxas & Comissões', query: 'Quais são as taxas de intermediação, despacho aduaneiro e comissão?' },
  { label: '🚚 Rastreio de Cargas MED', query: 'Como funciona o código de rastreio MED-XXXX e como acompanhar a carga?' },
  { label: '🏢 Balcões Luanda & Cabinda', query: 'Onde ficam localizados os armazéns e balcões oficiais de atendimento?' },
  { label: '🌾 Produtos Típicos Cabinda ➔ Luanda', query: 'Como pedir Xikuanga, Fumba, Kitáboa e Banana Pão de Cabinda para Luanda?' },
  { label: '🛠️ Serralharia & Oficinas', query: 'Como solicitar serviços de serralharia e fabricação metálica em Cabinda?' },
  { label: '📞 Falar no WhatsApp', query: 'Quero falar com um atendente humano no WhatsApp oficial' }
];

// Sample showcase photos for instant testing of custom supplier mediation
const SAMPLE_SUPPLIER_PHOTOS: { name: string; type: 'gallery' | 'camera' | 'document'; url: string; label: string; desc: string }[] = [
  {
    name: 'gerador-diesel-5kva-luanda.jpg',
    type: 'gallery',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    label: 'Gerador 5.5KVA (São Paulo)',
    desc: 'Equipamento elétrico em Luanda'
  },
  {
    name: 'lote-pecas-auto-viana.jpg',
    type: 'gallery',
    url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
    label: 'Peças Auto & Filtros',
    desc: 'Lote mecânico em armazém'
  },
  {
    name: 'cartao-fornecedor-proforma.jpg',
    type: 'document',
    url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
    label: 'Pro-forma / Orçamento',
    desc: 'Cotação de fornecedor em Luanda'
  },
  {
    name: 'produtos-frescos-cabinda.jpg',
    type: 'gallery',
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
    label: 'Xikuanga & Fumba Cabinda',
    desc: 'Encomenda de produtos alimentares'
  }
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
        text: `${botSettings.welcomeMessage || DEFAULT_SETTINGS.welcomeMessage}\n\n📸 **Novidade:** Já pode anexar fotos da sua galeria de produtos ou cartões de visita do seu fornecedor próprio em Luanda para pedir vistoria e intermediação 100% segura contra burlas!`,
        timestamp: new Date().toISOString(),
        suggestedQuestions: [
          'Como funciona a intermediação com meu próprio fornecedor?',
          'Como funciona o Mediador Cabinda?',
          'Quais são os prazos de entrega?',
          'Como pagar por Multicaixa Express ou IBAN?'
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

  // Photo / Attachment States
  const [pendingAttachments, setPendingAttachments] = useState<BotMessageAttachment[]>([]);
  const [showSampleGallery, setShowSampleGallery] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; name?: string } | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxImage) {
          setLightboxImage(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, lightboxImage]);

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

  // Process and compress image files safely for fast uploading and low storage usage
  const processImageFile = (file: File, type: 'gallery' | 'camera'): Promise<BotMessageAttachment> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawUrl = e.target?.result as string;
        if (!rawUrl) {
          resolve({
            url: '',
            name: file.name,
            type,
            size: '0 KB'
          });
          return;
        }

        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 1200;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width = Math.round((width * MAX_HEIGHT) / height);
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressedUrl = canvas.toDataURL('image/jpeg', 0.85);
              const approxKb = Math.round((compressedUrl.length * 3) / 4 / 1024);
              const sizeFormatted = approxKb > 1024 ? `${(approxKb / 1024).toFixed(1)} MB` : `${approxKb} KB`;
              resolve({
                url: compressedUrl,
                name: file.name,
                type,
                size: sizeFormatted
              });
              return;
            }
          } catch {
            // fallback if canvas not available
          }

          const originalKb = Math.round(file.size / 1024);
          resolve({
            url: rawUrl,
            name: file.name,
            type,
            size: originalKb > 1024 ? `${(originalKb / 1024).toFixed(1)} MB` : `${originalKb} KB`
          });
        };

        img.onerror = () => {
          const originalKb = Math.round(file.size / 1024);
          resolve({
            url: rawUrl,
            name: file.name,
            type,
            size: originalKb > 1024 ? `${(originalKb / 1024).toFixed(1)} MB` : `${originalKb} KB`
          });
        };

        img.src = rawUrl;
      };

      reader.onerror = () => {
        resolve({
          url: '',
          name: file.name,
          type,
          size: '0 KB'
        });
      };

      reader.readAsDataURL(file);
    });
  };

  // Handle Photo File Uploads from Gallery or Device Files
  const handleFilesSelected = async (files: FileList | null, type: 'gallery' | 'camera' = 'gallery') => {
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      alert('Por favor selecione apenas ficheiros de imagem (JPG, PNG, WEBP).');
      return;
    }

    const processed = await Promise.all(validFiles.map(file => processImageFile(file, type)));
    const validAttachments = processed.filter(a => Boolean(a.url));

    setPendingAttachments(prev => [...prev, ...validAttachments]);

    // Reset native input elements so user can pick again or pick same files
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Add Sample Preset Photo
  const handleAddSamplePhoto = (sample: typeof SAMPLE_SUPPLIER_PHOTOS[0]) => {
    setPendingAttachments(prev => [
      ...prev,
      {
        url: sample.url,
        name: sample.name,
        type: sample.type,
        size: '1.2 MB'
      }
    ]);
    setShowSampleGallery(false);
  };

  const removePendingAttachment = (index: number) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files, 'gallery');
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const rawText = (customText || inputQuery).trim();
    const hasAttachmentsToSend = pendingAttachments.length > 0;

    if (!rawText && !hasAttachmentsToSend) return;
    if (isLoading) return;

    // If user attached a photo without writing text, supply a natural descriptive question
    const textToSend = rawText || (hasAttachmentsToSend 
      ? 'Anexei esta(s) foto(s) da minha galeria do produto / fornecedor que encontrei. Gostaria que o Mediador Cabinda fizesse a intermediação segura, vistoria presencial e transporte com garantia total.' 
      : '');

    const currentAttachments = [...pendingAttachments];
    const isSupplierRequest = hasAttachmentsToSend || /(fornecedor|foto|galeria|comprar com fornecedor|intermediar|burla|seguran[çc]a)/i.test(textToSend);

    const userMsg: BotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
      attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
      photoUrl: currentAttachments[0]?.url,
      isSupplierIntermediation: isSupplierRequest
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputQuery('');
    setPendingAttachments([]);
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
          dynamicKnowledgeContext: logisticsContextText,
          attachments: currentAttachments
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
          if (hasAttachmentsToSend || lower.includes('fornecedor') || lower.includes('intermediar')) {
            actionLink = { label: 'Criar Pedido com este Fornecedor', view: 'fazer-pedido', icon: '🛡️' };
          } else if (lower.includes('pedido') || lower.includes('comprar')) {
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
        const localAnswer = solveBotQueryLocally(textToSend, currentKnowledge, currentLogistics, currentAttachments);
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
        actionLink,
        isSupplierIntermediation: isSupplierRequest
      };

      setMessages(prev => [...prev, botMsg]);

      if (ttsActive) {
        speakText(botText);
      }
    } catch {
      // Local fallback in case of absolute network drop
      const localAnswer = solveBotQueryLocally(textToSend, currentKnowledge, currentLogistics, currentAttachments);
      const fallbackMsg: BotMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: localAnswer.text,
        timestamp: new Date().toISOString(),
        source: 'knowledge_base',
        suggestedQuestions: localAnswer.suggestedQuestions,
        actionLink: localAnswer.actionLink,
        isSupplierIntermediation: isSupplierRequest
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
          text: `${botSettings.welcomeMessage || DEFAULT_SETTINGS.welcomeMessage}\n\n📸 **Dica:** Pode anexar fotos da sua galeria do seu fornecedor em Luanda para intermediar o negócio com segurança anti-burla!`,
          timestamp: new Date().toISOString(),
          suggestedQuestions: [
            'Como funciona a intermediação com meu próprio fornecedor?',
            'Como funciona o Mediador Cabinda?',
            'Quais são os prazos de entrega?',
            'Como pagar por Multicaixa Express ou IBAN?'
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
    <>
      <div 
        className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in"
        id="ai-chatbot-modal"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={(e) => {
          // Close modal when clicking on the dark backdrop outside the chat box
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {/* Hidden Native File and Camera Inputs */}
        <input 
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files, 'gallery')}
        />
        <input 
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files, 'camera')}
        />

        <div 
          className={`w-full sm:max-w-xl h-[92dvh] sm:h-[720px] max-h-[100dvh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-colors duration-200 animate-scale-up relative border ${
            isLight
              ? 'bg-white text-slate-900 border-slate-200'
              : 'bg-slate-950 text-slate-100 border-slate-800'
          }`}
          id="ai-chatbot-card"
        >
          {/* Drag & Drop Visual Overlay */}
          {isDraggingOver && (
            <div className="absolute inset-0 z-50 bg-amber-500/90 backdrop-blur-xs flex flex-col items-center justify-center text-slate-950 p-6 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-3xl bg-slate-950 text-amber-400 flex items-center justify-center mb-3 shadow-xl animate-bounce">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-black">Solte as Fotos Aqui</h4>
              <p className="text-sm font-semibold max-w-sm mt-1 text-slate-900">
                Adicione fotos da sua galeria para intermediar produtos ou fornecedores com segurança
              </p>
            </div>
          )}

          {/* TOP HEADER: Clear branding + Controls + Close button */}
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
                  Intermediação Segura & Vistoria Presencial
                </p>
              </div>
            </div>

            {/* Right Action Controls + Big Visible Close Button */}
            <div className="flex items-center gap-1.5">
              {/* Sample Photo Button */}
              <button
                type="button"
                onClick={() => setShowSampleGallery(!showSampleGallery)}
                title="Ver exemplos de fotos de fornecedores"
                className={`p-2 rounded-xl transition-all cursor-pointer text-xs font-semibold flex items-center gap-1 border ${
                  showSampleGallery
                    ? 'bg-amber-400 text-slate-950 font-bold border-amber-500'
                    : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px] hidden sm:inline">Exemplos</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                title={isLight ? 'Alternar para Modo Escuro' : 'Alternar para Fundo Branco'}
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
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                {ttsActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {/* Clear History */}
              <button
                onClick={handleClearChat}
                title="Limpar Histórico da Conversa"
                className={`p-2 rounded-xl transition-all cursor-pointer border ${
                  isLight
                    ? 'bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 border-slate-200'
                    : 'bg-slate-800 hover:bg-red-950/60 hover:text-red-300 text-slate-400 border-slate-700'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Big Close Button */}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-red-600 text-slate-600 hover:text-white transition-all flex items-center justify-center font-bold cursor-pointer ml-1 shadow-xs border border-slate-200 hover:border-red-600"
                title="Fechar Chatbot (ESC)"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* SAMPLES POPOVER: Quick 1-click photos for testing supplier mediation */}
          {showSampleGallery && (
            <div className={`p-3 border-b text-xs relative z-20 animate-fade-in ${
              isLight ? 'bg-amber-50/80 border-amber-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Exemplos Rápidos de Fotos de Fornecedores (1 Clique para Testar):</span>
                </div>
                <button 
                  onClick={() => setShowSampleGallery(false)}
                  className="text-slate-500 hover:text-slate-900 text-xs cursor-pointer font-bold"
                >
                  ✕ Fechar
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SAMPLE_SUPPLIER_PHOTOS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddSamplePhoto(sample)}
                    className={`p-2 rounded-xl border flex items-center gap-2 text-left transition-all cursor-pointer hover:scale-[1.02] ${
                      isLight 
                        ? 'bg-white hover:border-amber-400 border-slate-200 shadow-2xs' 
                        : 'bg-slate-800 hover:border-amber-400 border-slate-700'
                    }`}
                  >
                    <img 
                      src={sample.url} 
                      alt={sample.label}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" 
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-[11px] truncate text-slate-900 dark:text-white">{sample.label}</p>
                      <p className="text-[10px] text-slate-500 truncate">{sample.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QUICK SUGGESTIONS PILLS */}
          <div 
            className={`px-3 py-2 border-b flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 ${
              isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider pl-1 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Tópicos:
            </span>
            {QUICK_TOPICS.map((topic, idx) => (
              <button
                key={idx}
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

          {/* MESSAGES STREAM AREA */}
          <div 
            className={`flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-5 space-y-4 ${
              isLight
                ? 'bg-slate-50/60'
                : 'bg-slate-950'
            }`} 
            id="ai-chat-messages-container"
          >
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const hasPhotos = Boolean(msg.attachments && msg.attachments.length > 0);

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
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <span>👤 Você</span>
                        {hasPhotos && (
                          <span className="text-[9px] bg-amber-200 text-slate-950 px-1.5 py-0.2 rounded-full font-bold">
                            📸 {msg.attachments?.length} foto(s) da galeria
                          </span>
                        )}
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
                    {/* Render Attached Photo(s) if present */}
                    {hasPhotos && (
                      <div className="mb-3 space-y-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-900 dark:text-amber-300">
                          <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                          <span>Foto(s) do Fornecedor / Produto Anexada(s):</span>
                        </div>

                        <div className={`grid ${msg.attachments!.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
                          {msg.attachments!.map((att, attIdx) => (
                            <div 
                              key={attIdx}
                              onClick={() => setLightboxImage({ url: att.url, name: att.name || `Foto ${attIdx + 1}` })}
                              className="relative group rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-950 cursor-pointer aspect-4/3 shadow-sm hover:shadow-md transition-all"
                            >
                              <img 
                                src={att.url} 
                                alt={att.name || 'Foto anexada'} 
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-[11px] font-bold">
                                <Maximize2 className="w-4 h-4" />
                                <span>Ver em Ecrã Inteiro</span>
                              </div>
                              {att.name && (
                                <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-white text-[10px] px-2 py-1 truncate">
                                  {att.name}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Supplier Intermediation Safety Badge Banner */}
                    {msg.isSupplierIntermediation && !isUser && (
                      <div className="mb-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-start gap-2.5">
                        <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-[11.5px] leading-tight text-amber-950 dark:text-amber-200">
                          <p className="font-extrabold">Intermediação Segura Anti-Burla</p>
                          <p className="text-[10.5px] text-amber-900/80 dark:text-amber-300/80 mt-0.5">
                            O Mediador Cabinda realiza a vistoria física presencial em Luanda e protege 100% do seu pagamento sob custódia legal.
                          </p>
                        </div>
                      </div>
                    )}

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
                <span className="text-[11.5px] font-bold text-amber-700 ml-1 font-mono">A analisar foto & dados...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* PENDING ATTACHMENTS TRAY: Previews before sending */}
          {pendingAttachments.length > 0 && (
            <div className={`p-2.5 sm:p-3 border-t shrink-0 animate-fade-in z-20 ${
              isLight ? 'bg-amber-50/95 border-amber-200 text-slate-900' : 'bg-slate-900/95 border-slate-800 text-slate-100'
            }`}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-5 h-5 rounded-md bg-amber-400 text-slate-950 flex items-center justify-center font-black text-[11px] shrink-0 shadow-xs">
                    {pendingAttachments.length}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-black truncate text-slate-900 dark:text-amber-300">
                      {pendingAttachments.length === 1 ? '1 Foto Selecionada' : `${pendingAttachments.length} Fotos Selecionadas`}
                    </p>
                  </div>
                </div>

                {/* DIRECT SEND BUTTON IN PHOTO BAR + CLEAR BUTTON */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={isLoading}
                    className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all border border-amber-500/30"
                  >
                    <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                    <span>Enviar {pendingAttachments.length > 1 ? `(${pendingAttachments.length})` : ''}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPendingAttachments([])}
                    className="p-1 sm:p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold cursor-pointer transition-colors"
                    title="Remover todas as fotos"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Thumbnails list with horizontal scroll and delete badges */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-h-18">
                {pendingAttachments.map((att, idx) => (
                  <div 
                    key={idx}
                    className="relative rounded-xl overflow-hidden border-2 border-amber-400 shrink-0 w-13 h-13 sm:w-14 sm:h-14 bg-slate-900 group shadow-xs"
                  >
                    <img 
                      src={att.url} 
                      alt={att.name || 'Preview'} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                    <button
                      type="button"
                      onClick={() => removePendingAttachment(idx)}
                      className="absolute top-0.5 right-0.5 w-4.5 h-4.5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center font-bold text-[10px] shadow-md cursor-pointer transition-colors"
                      title="Remover foto"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                    {att.size && (
                      <span className="absolute bottom-0 inset-x-0 bg-slate-950/85 text-[7px] text-white text-center truncate px-0.5 font-mono">
                        {att.size}
                      </span>
                    )}
                  </div>
                ))}

                {/* Add More Photos Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl border-2 border-dashed border-amber-400/80 flex flex-col items-center justify-center gap-0.5 text-amber-800 dark:text-amber-300 hover:bg-amber-100/50 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0 text-[8.5px] font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Fotos</span>
                </button>
              </div>

              {/* Quick contextual suggestions when photos are attached */}
              <div className="flex flex-wrap items-center gap-1 mt-1.5 pt-1.5 border-t border-amber-200 dark:border-slate-800">
                <span className="text-[9.5px] font-bold text-slate-500">Sugestão:</span>
                <button
                  type="button"
                  onClick={() => {
                    setInputQuery('Gostaria de solicitar a intermediação e vistoria presencial para esta mercadoria do meu fornecedor.');
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-amber-200/80 hover:bg-amber-300 text-slate-900 font-bold border border-amber-300 transition-colors cursor-pointer"
                >
                  🛡️ Pedir Intermediação deste Fornecedor
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputQuery('Qual é a taxa de intermediação e o frete para enviar este artigo para Cabinda?');
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 font-medium border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  💰 Calcular Frete & Taxas
                </button>
              </div>
            </div>
          )}

          {/* INPUT FORM DOCK */}
          <div 
            className={`p-2.5 sm:p-3 border-t shrink-0 sticky bottom-0 z-30 space-y-1.5 ${
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
              className="flex items-center gap-1.5 sm:gap-2"
            >
              {/* Photo Gallery Attachment Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Adicionar fotos da galeria (produto, loja ou fornecedor)"
                className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer shrink-0 relative ${
                  pendingAttachments.length > 0
                    ? 'bg-amber-400 text-slate-950 font-black border-amber-500 shadow-md ring-2 ring-amber-400/50'
                    : isLight
                      ? 'bg-slate-100 hover:bg-amber-50 text-slate-700 border-slate-200 hover:border-amber-400'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:border-amber-400'
                }`}
              >
                <ImageIcon className="w-4 sm:w-4.5 h-4 sm:h-4.5 text-amber-600 dark:text-amber-400" />
                {pendingAttachments.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-slate-950 text-amber-300 text-[9.5px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {pendingAttachments.length}
                  </span>
                )}
              </button>

              {/* Camera Capture Button */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                title="Tirar foto com a câmara agora"
                className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer shrink-0 hidden sm:flex ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 hover:border-amber-400'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:border-amber-400'
                }`}
              >
                <Camera className="w-4 sm:w-4.5 h-4 sm:h-4.5" />
              </button>

              {/* Voice input button */}
              <button
                type="button"
                onClick={handleVoiceInput}
                title={isListeningVoice ? 'A escutar... Fale agora' : 'Falar por comando de voz'}
                className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer shrink-0 ${
                  isListeningVoice
                    ? 'bg-red-500 border-red-400 text-white animate-pulse shadow-lg shadow-red-500/30'
                    : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 hover:border-amber-400'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:border-amber-400'
                }`}
              >
                <Mic className="w-4 sm:w-4.5 h-4 sm:h-4.5" />
              </button>

              {/* Input text bar */}
              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={
                  pendingAttachments.length > 0
                    ? `Enviar ${pendingAttachments.length} foto(s) ou escreva uma mensagem...`
                    : 'Escreva a sua dúvida ou anexe foto...'
                }
                className={`flex-1 min-w-0 p-2.5 sm:p-3 px-3 sm:px-4 rounded-2xl text-xs sm:text-sm border transition-all font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 ${
                  isLight
                    ? 'bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400 border-slate-200'
                    : 'bg-slate-800 focus:bg-slate-750 text-white placeholder:text-slate-500 border-slate-700'
                }`}
                disabled={isLoading}
              />

              {/* Submit button: ALWAYS visible and enabled on mobile & desktop */}
              <button
                type="submit"
                disabled={(!inputQuery.trim() && pendingAttachments.length === 0) || isLoading}
                className={`p-2.5 sm:p-3 px-3.5 sm:px-4.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-1.5 text-xs sm:text-sm cursor-pointer shadow-md shrink-0 ${
                  (inputQuery.trim() || pendingAttachments.length > 0) && !isLoading
                    ? 'bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black active:scale-95 shadow-amber-400/25 ring-2 ring-amber-400/40'
                    : isLight
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                }`}
              >
                <Send className="w-4 h-4 shrink-0" />
                <span className="font-extrabold whitespace-nowrap">
                  {pendingAttachments.length > 0 ? `Enviar (${pendingAttachments.length})` : 'Enviar'}
                </span>
              </button>
            </form>

            {/* Bottom Security Assurance & Escalation Link + Secondary Close Button */}
            <div className="flex items-center justify-between text-[10.5px] text-slate-500 px-1 pt-0.5">
              <span className="flex items-center gap-1.5 truncate">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Intermediação segura com fornecedor</span>
              </span>

              <div className="flex items-center gap-2.5 shrink-0">
                {botSettings.allowWhatsAppEscalation && (
                  <a
                    href={`https://wa.me/${botSettings.whatsAppNumber.replace(/\+/g, '')}?text=Ol%C3%A1%2C+estou+no+aplicativo+Mediador-Cabinda+e+preciso+de+ajuda+com+o+meu+fornecedor`}
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
                  className="text-slate-400 hover:text-red-600 font-bold hover:underline cursor-pointer text-[10px]"
                >
                  ✕ Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX IMAGE VIEWER */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-150 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          {/* Lightbox Controls Top Bar */}
          <div 
            className="absolute top-4 inset-x-4 max-w-4xl mx-auto flex items-center justify-between bg-slate-900/80 border border-slate-800 px-4 py-2.5 rounded-2xl text-white z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 truncate">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <span className="text-xs sm:text-sm font-bold truncate">
                {lightboxImage.name || 'Visualização da Foto do Fornecedor'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLightboxZoom(prev => Math.min(prev + 0.25, 2.5))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                title="Ampliar (Zoom In)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setLightboxZoom(prev => Math.max(prev - 0.25, 0.75))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                title="Reduzir (Zoom Out)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setLightboxZoom(1)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono cursor-pointer"
                title="Redefinir Zoom"
              >
                {Math.round(lightboxZoom * 100)}%
              </button>

              <a
                href={lightboxImage.url}
                target="_blank"
                rel="noreferrer"
                download={lightboxImage.name || 'foto-fornecedor.jpg'}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                title="Abrir em Nova Aba"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white cursor-pointer ml-1"
                title="Fechar (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lightbox Image Stage */}
          <div 
            className="max-w-4xl max-h-[85vh] overflow-auto flex items-center justify-center p-2 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={lightboxImage.url} 
              alt={lightboxImage.name || 'Foto ampliada'}
              referrerPolicy="no-referrer"
              style={{ transform: `scale(${lightboxZoom})`, transition: 'transform 0.2s ease-out' }}
              className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl border border-slate-800"
            />
          </div>

          <p className="text-slate-400 text-xs mt-3 select-none">
            Clique fora da imagem ou pressione <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded-sm font-mono text-[10px]">ESC</kbd> para fechar
          </p>
        </div>
      )}
    </>
  );
}
