/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Client, Message, Order } from '../types';
import { 
  Send, 
  User, 
  ShieldCheck, 
  Clock, 
  Paperclip, 
  Image as ImageIcon, 
  MapPin, 
  FileText, 
  Camera, 
  X, 
  Download, 
  AlertOctagon, 
  ArrowDown, 
  Compass, 
  CheckCircle2, 
  Printer,
  ChevronDown,
  ArrowLeft,
  Shield,
  Search,
  MessageSquare,
  Phone,
  Settings
} from 'lucide-react';

interface SharedChatProps {
  order?: Order | null;
  currentUserRole: 'client' | 'admin';
  messages: Message[];
  onSendMessage: (
    text: string, 
    attachment?: {
      url: string;
      type: 'photo' | 'document' | 'location' | 'invoice' | 'receipt' | 'transport_guide' | 'dispatch_proof';
      name: string;
      coords?: { lat: number; lng: number; address: string };
    },
    isPriority?: boolean,
    senderOverride?: 'client' | 'admin',
    channelIdOverride?: string
  ) => void;
  onBack?: () => void;
  clientId?: string;
  clients?: Client[];
  orders?: Order[];
  onMarkChannelAsRead?: (channelId: string) => void;
  showModalAlert?: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
}

type ChatStatusType = 'online' | 'absent' | 'serving' | 'out_of_hours';

export function sanitizeCommunicationText(text: string): { sanitized: string; blocked: boolean; triggers: string[] } {
  let censored = text;
  let blocked = false;
  const triggers: string[] = [];

  // 1. Phone numbers pattern (e.g. +244..., 923..., etc)
  const phonePattern = /(\+?244)?\s?9[1-9]\d[\s.-]?\d{3}[\s.-]?\d{3}/g;
  if (phonePattern.test(censored)) {
    censored = censored.replace(phonePattern, '[CONTACTO BLOQUEADO - INTERMEDIAÇÃO OBRIGATÓRIA]');
    blocked = true;
    triggers.push('Telefone/WhatsApp');
  }

  // 2. Email pattern
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  if (emailPattern.test(censored)) {
    censored = censored.replace(emailPattern, '[EMAIL BLOQUEADO - INTERMEDIAÇÃO OBRIGATÓRIA]');
    blocked = true;
    triggers.push('E-mail');
  }

  // 3. Web links (e.g. http, www)
  const webPattern = /(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,5}(\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)?/gi;
  if (webPattern.test(censored)) {
    const matches = censored.match(webPattern);
    if (matches) {
      const actualLinks = matches.filter(m => !/^\d+(\.\d+)+$/.test(m));
      if (actualLinks.length > 0) {
        censored = censored.replace(webPattern, '[LINK BLOQUEADO - INTERMEDIAÇÃO OBRIGATÓRIA]');
        blocked = true;
        triggers.push('Link Externo');
      }
    }
  }

  // 4. IBAN / Bank Details (AO06)
  const ibanPattern = /AO06[\s.-]?\d{4}[\s.-]?\d{4}[\s.-]?\d{12}[\s.-]?\d{2}/gi;
  if (ibanPattern.test(censored)) {
    censored = censored.replace(ibanPattern, '[IBAN BLOQUEADO - INTERMEDIAÇÃO OBRIGATÓRIA]');
    blocked = true;
    triggers.push('Coordenadas Bancárias (IBAN)');
  }

  return { sanitized: censored, blocked, triggers };
}

// Fixed Predefined Contacts list for the WhatsApp Simulation
const STATIC_PRESETS = [
  { id: 'fornecedor-topack', name: 'Fornecedor Topack (Luanda)', role: 'Parceiro Homologado de Recipientes', avatar: '🏭', status: 'online' as const, phone: '+244 945 888 777' },
  { id: 'loja-central-cabinda', name: 'Loja Central Cabinda', role: 'Estoques & Retalhos Locais', avatar: '🏬', status: 'online' as const, phone: '+244 931 444 555' },
  { id: 'transportadora-xpto', name: 'Transportadora XPTO', role: 'Rotas Rodoviárias e Cabotagem Marítima', avatar: '🚢', status: 'online' as const, phone: '+244 912 333 444' }
];

export default function SharedChat({ 
  order, 
  currentUserRole, 
  messages, 
  onSendMessage, 
  onBack,
  clientId,
  clients,
  orders,
  onMarkChannelAsRead,
  showModalAlert
}: SharedChatProps) {
  const [inputText, setInputText] = useState('');
  const [showAttachmentsMenu, setShowAttachmentsMenu] = useState(false);
  const [chatStatus, setChatStatus] = useState<ChatStatusType>('online');
  const [searchQuery, setSearchQuery] = useState('');

  // Fallback local alert modal state for iframe sandbox compatibility
  const [localToast, setLocalToast] = useState<{ title: string; message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const triggerAlert = (title: string, msgText: string, type: 'success' | 'info' | 'warning' = 'info') => {
    if (showModalAlert) {
      showModalAlert(title, msgText, type);
    } else {
      setLocalToast({ title, message: msgText, type });
    }
  };

  // Track selected chat channel ID (WhatsApp style list switching)
  const [activeChannelId, setActiveChannelId] = useState<string>('');

  // Simulated Camera Mode
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPreviewImage, setCameraPreviewImage] = useState<string | null>(null);
  const [cameraCountdown, setCameraCountdown] = useState<number | null>(null);

  // Simulated Location Picker Mode
  const [locationPickerActive, setLocationPickerActive] = useState(false);

  // Simulated Document picker
  const [documentPickerActive, setDocumentPickerActive] = useState(false);
  const [customDocName, setCustomDocName] = useState('');
  const [customDocType, setCustomDocType] = useState<'invoice' | 'receipt' | 'transport_guide' | 'dispatch_proof' | 'document'>('document');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load active channel ID on launch or coordinate with props.order
  useEffect(() => {
    if (order) {
      setActiveChannelId(order.id);
    } else {
      const savedChannel = localStorage.getItem('mediador_active_channel');
      if (savedChannel) {
        setActiveChannelId(savedChannel);
      } else {
        if (currentUserRole === 'admin' && clients && clients.length > 0) {
          setActiveChannelId(`general-${clients[0].id}`);
        } else {
          setActiveChannelId('general');
        }
      }
    }
  }, [order, currentUserRole, clients]);

  // Auto-send product inquiry message when selected from catalog
  useEffect(() => {
    if (currentUserRole === 'client' && activeChannelId && clientId) {
      const prefilled = localStorage.getItem('mediador_prefilled_product_message');
      if (prefilled) {
        localStorage.removeItem('mediador_prefilled_product_message');
        // Small delay to ensure that the chat channel and parent states are fully synced
        const timer = setTimeout(() => {
          executeSend(prefilled);
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [currentUserRole, activeChannelId, clientId]);

  // Save selection on change
  const handleSelectChannel = (chanId: string) => {
    setActiveChannelId(chanId);
    if (!order) {
      localStorage.setItem('mediador_active_channel', chanId);
    }
    // Auto voice announcement
    const contactName = chanId.startsWith('general-')
      ? (clients?.find(c => c.id === chanId.replace('general-', ''))?.name || 'Cliente Support')
      : (STATIC_PRESETS.find(c => c.id === chanId)?.name || (chanId === 'general' ? 'Direção Geral' : `Pedido ${chanId}`));
    notifyUser(`Conversa com ${contactName} aberta.`);
  };

  // Pre-seed realistic chat histories for each channel if no live messages exist
  const getConversationMessages = (channelId: string) => {
    const targetChannelId = (currentUserRole === 'client' && channelId === 'general' && clientId)
      ? `general-${clientId}`
      : channelId;

    const live = messages.filter((m) => m.orderId === targetChannelId);
    if (live.length > 0) return live;

    const dummyDate = new Date();
    const formattedYest = new Date(dummyDate.getTime() - 24 * 3600 * 1000).toISOString();
    const formatted2hAgo = new Date(dummyDate.getTime() - 2 * 3600 * 1000).toISOString();

    if (targetChannelId === 'fornecedor-topack') {
      return [
        {
          id: 'seed-f-1',
          orderId: 'fornecedor-topack',
          sender: 'admin',
          text: 'Olá! Confirmamos que temos em stock imediato 50 unidades dos recipientes industriais de pressão no armazém portuário de Luanda.',
          timestamp: formattedYest,
          read: true
        },
        {
          id: 'seed-f-2',
          orderId: 'fornecedor-topack',
          sender: 'client',
          text: 'Excelente notícia! O Mediador Cabinda já foi acionado para providenciar o freight marítimo de cabotagem.',
          timestamp: formatted2hAgo,
          read: true
        }
      ] as Message[];
    }

    if (targetChannelId === 'loja-central-cabinda') {
      return [
        {
          id: 'seed-l-1',
          orderId: 'loja-central-cabinda',
          sender: 'admin',
          text: 'Saudações, as bobinas de cabo de cobre isolado de 16mm já foram devidamente reservadas no armazém central para levantamento.',
          timestamp: formattedYest,
          read: true
        }
      ] as Message[];
    }

    if (targetChannelId === 'transportadora-xpto') {
      return [
        {
          id: 'seed-t-1',
          orderId: 'transportadora-xpto',
          sender: 'admin',
          text: 'Notificação Logística: O navio de cabotagem acaba de atracar no porto de Luanda para carregamento.',
          timestamp: formattedYest,
          read: true
        },
        {
          id: 'seed-t-2',
          orderId: 'transportadora-xpto',
          sender: 'client',
          text: 'Perfeito, aguardamos o início da travessia para Cabinda.',
          timestamp: formatted2hAgo,
          read: true
        }
      ] as Message[];
    }

    if (targetChannelId === 'general') {
      return [
        {
          id: 'seed-g-1',
          orderId: 'general',
          sender: 'admin',
          text: 'Bem-vindo ao canal do Mediador Cabinda! Estamos online e conectados com as alfândegas da AGT e portos de Angola. Como podemos apoiar o seu transporte hoje?',
          timestamp: formattedYest,
          read: true
        }
      ] as Message[];
    }

    if (targetChannelId.startsWith('general-')) {
      const matchClientId = targetChannelId.replace('general-', '');
      const clientObj = (clients || []).find(c => c.id === matchClientId);
      const name = clientObj ? clientObj.name : 'Cliente';
      return [
        {
          id: `seed-g-cli-${matchClientId}`,
          orderId: targetChannelId,
          sender: 'admin',
          text: `Olá ${name}! Bem-vindo à mesa de coordenação executiva do Mediador Cabinda. Analisamos a regularidade da sua licença portuária. Como podemos apoiar o seu despacho aduaneiro hoje?`,
          timestamp: formattedYest,
          read: true
        }
      ] as Message[];
    }

    return [];
  };

  const currentChannelMessages = getConversationMessages(activeChannelId);

  // Load chat status from local storage
  useEffect(() => {
    const savedStatus = localStorage.getItem('mediador_cabinda_chat_status');
    if (savedStatus) {
      setChatStatus(savedStatus as ChatStatusType);
    }
  }, []);

  // Auto Scroll Chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChannelMessages.length, activeChannelId]);

  // Reactive unread message marking
  useEffect(() => {
    if (onMarkChannelAsRead && activeChannelId) {
      const targetChanId = (currentUserRole === 'client' && activeChannelId === 'general' && clientId)
        ? `general-${clientId}`
        : activeChannelId;
      onMarkChannelAsRead(targetChanId);
    }
  }, [activeChannelId, messages.length, onMarkChannelAsRead, currentUserRole, clientId]);

  const handleUpdateStatus = (newStatus: ChatStatusType) => {
    setChatStatus(newStatus);
    localStorage.setItem('mediador_cabinda_chat_status', newStatus);
  };

  const notifyUser = (soundText: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const voice = new SpeechSynthesisUtterance(soundText);
        voice.lang = 'pt-AO';
        window.speechSynthesis.speak(voice);
      } catch (e) {
        console.log("Chat speech synthesis error:", e);
      }
    }
  };

  const executeSend = (
    text: string, 
    attach?: {
      url: string;
      type: 'photo' | 'document' | 'location' | 'invoice' | 'receipt' | 'transport_guide' | 'dispatch_proof';
      name: string;
      coords?: { lat: number; lng: number; address: string };
    },
    isPriority?: boolean
  ) => {
    const { sanitized, blocked, triggers } = sanitizeCommunicationText(text);
    
    if (blocked) {
      triggerAlert(
        "Regulamento de Segurança Interna ⚠️",
        `Detetámos dados confidenciais (${triggers.join(', ')}) na sua mensagem.\n\nPor razões de conformidade e garantia da intermediação, os canais de contacto direto da empresa foram ocultados. Use a nossa plataforma de faturação de Cabinda para a transação 100% segura.`,
        "warning"
      );
    }

    const destChanId = (currentUserRole === 'client' && activeChannelId === 'general' && clientId)
      ? `general-${clientId}`
      : activeChannelId;

    // Specifying destChanId so messages go to the actual clicked conversation!
    onSendMessage(sanitized, attach, isPriority, currentUserRole, destChanId);
    setInputText('');
    setShowAttachmentsMenu(false);

    // Trigger immediate simulated response based on selected channel context
    if (currentUserRole === 'client') {
      setTimeout(() => {
        let responseText = 'Olá! Recebemos a sua mensagem. Nossos operadores estão validando a entrega para Cabinda.';
        
        if (isPriority) {
          responseText = '🚨 *[ATENDIMENTO PRIORITÁRIO ATIVADO]* Olá! Sou o despachante de plantão. Identificamos a urgência comercial regulamentar e estamos acelerando o trâmite portuário.';
        } else if (attach?.type === 'photo') {
          responseText = `Confirmamos a receção da fotografia: "${attach.name}". O nosso agente comercial já compareceu na loja homologada para aferição de stock físico de Luanda.`;
        } else if (attach?.type === 'document') {
          responseText = `Guia ou comprovativo arquivado de forma confidencial: "${attach.name}". O departamento financeiro procedeu ao registo oficial para despacho fiscal.`;
        } else if (attach?.type === 'location') {
          responseText = `📍 Coordenadas logísticas anotadas: "${attach.coords?.address}". Fretamento marítimo ajustado com o transportador.`;
        } else if (activeChannelId === 'fornecedor-topack') {
          responseText = 'Olá! O Senhor Diretor Geral do Mediador Cabinda recebeu a sua mensagem e está agora a falar diretamente com o parceiro de recipientes Topack para validar stocks e negociar preços para si.';
        } else if (activeChannelId === 'loja-central-cabinda') {
          responseText = 'Olá! O Senhor Diretor Geral do Mediador Cabinda recebeu o seu pedido aduaneiro e está em coordenação com a Loja Central de Cabinda para garantir as mercadorias de forma ultra-segura.';
        } else if (activeChannelId === 'transportadora-xpto') {
          responseText = 'Olá! O Senhor Diretor Geral do Mediador Cabinda está em contacto direto com o armador da Transportadora XPTO sobre esta carga aérea/marítima e actualizará o seu estado brevemente.';
        } else if (text.toLowerCase().includes('preço') || text.toLowerCase().includes('orçamento') || text.toLowerCase().includes('quanto')) {
          responseText = 'O orçamento oficial detalhado com frete marítimo e desembaraço de portos está a ser computado pela mesa executiva.';
        } else if (text.toLowerCase().includes('pagamento') || text.toLowerCase().includes('paguei')) {
          responseText = 'Agradecemos o envio do comprovante bancário de Luanda/Cabinda. Despacharemos a carga em conformidade com o porto assim que confirmado.';
        }

        // Send simulated reply into the correct active context
        onSendMessage(responseText, undefined, false, 'admin', destChanId);
        notifyUser("Nova mensagem recebida no canal do Mediador.");
      }, 1500);
    }
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    executeSend(inputText.trim());
  };

  // Simulated Camera captures
  const handleTriggerSimulatedCameraSnapshot = () => {
    setCameraCountdown(3);
    const interval = setInterval(() => {
      setCameraCountdown((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          const images = [
            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1597484211616-3615260192b1?w=500&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60'
          ];
          setCameraPreviewImage(images[Math.floor(Math.random() * images.length)]);
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 850);
  };

  const handleSendCameraPhoto = () => {
    if (!cameraPreviewImage) return;
    executeSend('📸 Fotografia capturada pelo visor de tempo real do Mediador', {
      url: cameraPreviewImage,
      type: 'photo',
      name: `captura_fiscal_${Date.now()}.png`
    });
    setCameraActive(false);
    setCameraPreviewImage(null);
    setShowAttachmentsMenu(false);
  };

  const handleSendGalleryPhoto = (url: string, name: string) => {
    executeSend(`🖼️ Fotografia selecionada da galeria física do dispositivo: ${name}`, {
      url,
      type: 'photo',
      name
    });
    setShowAttachmentsMenu(false);
  };

  // Simulated Location Selection
  const handleSendLocation = (address: string, lat: number, lng: number) => {
    executeSend(`📍 Localização de entrega/recolha enviada: ${address}`, {
      url: `https://maps.google.com/?q=${lat},${lng}`,
      type: 'location',
      name: address,
      coords: { lat, lng, address }
    });
    setLocationPickerActive(false);
    setShowAttachmentsMenu(false);
  };

  // Simulated Custom Document Sender
  const handleSendCustomDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDocName.trim()) return;

    let emoji = '📄';
    let suffix = 'pdf';
    let fileType: any = 'document';

    if (customDocType === 'invoice') { emoji = '🧾'; fileType = 'invoice'; }
    if (customDocType === 'receipt') { emoji = '💳'; fileType = 'receipt'; }
    if (customDocType === 'transport_guide') { emoji = '🚚'; fileType = 'transport_guide'; }
    if (customDocType === 'dispatch_proof') { emoji = '🛡️'; fileType = 'dispatch_proof'; }

    const finalizedName = `${customDocName.trim().replace(/\s+/g, '_').toLowerCase()}.${suffix}`;

    executeSend(`${emoji} Documento Oficial: ${customDocName.trim()}`, {
      url: '#file_downloader_simulated',
      type: fileType,
      name: finalizedName
    });

    setDocumentPickerActive(false);
    setCustomDocName('');
    setShowAttachmentsMenu(false);
  };

  const handleTriggerPriority = () => {
    if (confirm('Deseja acionar a prioridade máxima para a sua mercadoria? \nComo cliente VIP, o seu canal no porto será marcado com sinalética de urgência.')) {
      executeSend('⚠️ [URGENTE PORTO] Solicito o despacho imediato desta mercadoria prioritária na cabotagem.', undefined, true);
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const getStatusDetails = (status: ChatStatusType) => {
    switch (status) {
      case 'online': 
        return { label: 'Online', color: 'bg-green-500 text-green-400', desc: 'Operações prontas no porto' };
      case 'absent': 
        return { label: 'Ausente', color: 'bg-amber-500 text-amber-400', desc: 'Em inspeção de terminal' };
      case 'serving': 
        return { label: 'Em Atendimento', color: 'bg-sky-500 text-sky-400', desc: 'Forte demanda aduaneira' };
      case 'out_of_hours': 
        return { label: 'Fora do Horário', color: 'bg-slate-400 text-slate-500', desc: 'Das 08:00 às 18:00 AO' };
    }
  };

  const quickReplies = currentUserRole === 'client' ? [
    'Qual o ponto de situação do contentor?',
    'Já anexei o comprovante do Multicaixa.',
    'Consigo levantar hoje no Armazém C-4 de Cabinda?'
  ] : [
    'Mercadoria vistoriada e faturada em Luanda!',
    'Aguardando validação do banco para embarque.',
    'Sua carga já se encontra carregada na cabotagem.'
  ];

  // Dynamically compile conversations list (including custom supplier / carrier filters)
  const uniqueMessageChannelIds = Array.from(new Set(messages.map(m => m.orderId)));
  const allConversations = (() => {
    let list: Array<{
      id: string;
      name: string;
      role: string;
      avatar: string;
      status: 'online' | 'absent' | 'serving' | 'out_of_hours';
      phone: string;
    }> = [];

    if (currentUserRole === 'client') {
      // 1. Core General Channel
      list.push({
        id: 'general',
        name: 'Direção Geral (Mediador Cabinda)',
        role: 'Equipa de Operações e Despachos',
        avatar: '👑',
        status: 'online',
        phone: '+244 942 043 293'
      });

      // 2. Partner presets
      list.push(
        { id: 'fornecedor-topack', name: 'Fornecedor Topack (Luanda)', role: 'Parceiro Homologado de Recipientes', avatar: '🏭', status: 'online', phone: '+244 945 888 777' },
        { id: 'loja-central-cabinda', name: 'Loja Central Cabinda', role: 'Estoques & Retalhos Locais', avatar: '🏬', status: 'online', phone: '+244 931 444 555' },
        { id: 'transportadora-xpto', name: 'Transportadora XPTO', role: 'Rotas Rodoviárias e Cabotagem Marítima', avatar: '🚢', status: 'online', phone: '+244 912 333 444' }
      );

      // 3. Current Client Orders
      const myOrders = (orders || []).filter(o => o.clientId === clientId);
      myOrders.forEach(ord => {
        list.push({
          id: ord.id,
          name: `Pedido #${ord.id} (${ord.productName})`,
          role: `Estado: ${ord.status}`,
          avatar: '📦',
          status: 'online',
          phone: ord.shippingCarrier || 'Em Trânsito'
        });
      });

      // Incorporate any missing channels with custom messages that have client tag
      uniqueMessageChannelIds.forEach(id => {
        if (id && id !== 'general' && id !== 'undefined' && !list.some(item => item.id === id)) {
          // If this matches any order of mine, keep it
          const ord = myOrders.find(o => o.id === id);
          if (ord) {
            list.push({
              id: id,
              name: `Pedido #${id}`,
              role: 'Despacho Exclusivo',
              avatar: '📦',
              status: 'online',
              phone: 'N/A'
            });
          }
        }
      });

    } else {
      // ADMIN (GESTÃO DE CONVERSAS)

      // 1. Registered Client Channels (Support General)
      (clients || []).forEach(cli => {
        list.push({
          id: `general-${cli.id}`,
          name: cli.name,
          role: `Apoio • ${cli.tier} • ${cli.phone}`,
          avatar: '👤',
          status: 'online',
          phone: cli.phone
        });
      });

      // 2. Orders Chats
      (orders || []).forEach(ord => {
        list.push({
          id: ord.id,
          name: `Pedido #${ord.id} - ${ord.clientName}`,
          role: `${ord.productName} (${ord.quantity}x)`,
          avatar: '📦',
          status: 'online',
          phone: ord.clientPhone
        });
      });

      // 3. Preset partners
      list.push(
        { id: 'fornecedor-topack', name: 'Fornecedor Topack (Luanda)', role: 'Parceiro Homologado de Recipientes', avatar: '🏭', status: 'online', phone: '+244 945 888 777' },
        { id: 'loja-central-cabinda', name: 'Loja Central Cabinda', role: 'Estoques & Retalhos Locais', avatar: '🏬', status: 'online', phone: '+244 931 444 555' },
        { id: 'transportadora-xpto', name: 'Transportadora XPTO', role: 'Rotas Rodoviárias e Cabotagem Marítima', avatar: '🚢', status: 'online', phone: '+244 912 333 444' }
      );
    }

    return list;
  })();

  // Filter conversations based on top search bar
  const filteredConversations = allConversations.filter(convo => {
    const q = searchQuery.toLowerCase();
    return convo.name.toLowerCase().includes(q) || convo.role.toLowerCase().includes(q);
  });

  // Helper properties for selected contact
  const activeContact = allConversations.find(c => c.id === activeChannelId) || {
    id: activeChannelId,
    name: activeChannelId.startsWith('general-')
      ? (clients?.find(c => c.id === activeChannelId.replace('general-', ''))?.name || 'Cliente Geral')
      : `Pedido #${activeChannelId}`,
    role: 'Acompanhamento de Carga',
    avatar: activeChannelId.startsWith('general-') ? '👤' : '📦',
    status: 'online',
    phone: 'Logística Portuária'
  };

  // Helper for computing last message of a particular channel
  const getLastMessageInChannel = (chanId: string) => {
    const targetChanId = (currentUserRole === 'client' && chanId === 'general' && clientId)
      ? `general-${clientId}`
      : chanId;
    const list = getConversationMessages(targetChanId);
    if (list.length === 0) return null;
    return list[list.length - 1];
  };

  // Helper for counting unread messages sent by peer
  const getUnreadInChannel = (chanId: string) => {
    const targetChanId = (currentUserRole === 'client' && chanId === 'general' && clientId)
      ? `general-${clientId}`
      : chanId;
    const list = messages.filter(m => m.orderId === targetChanId && !m.read && m.sender !== (currentUserRole === 'client' ? 'client' : 'admin'));
    return list.length;
  };

  return (
    <div className={`flex bg-slate-100 dark:bg-slate-950 border-0 sm:border border-slate-200 rounded-none sm:rounded-3xl overflow-hidden shadow-none sm:shadow-xl w-full min-w-0 max-w-full relative ${
      order 
        ? 'h-[50vh] min-h-[350px] max-h-[500px]' 
        : 'h-[78vh] md:h-[75vh] min-h-[450px] md:min-h-[580px] max-h-[720px]'
    }`} id={`chat-hub-container-full`}>
      
      {/* ==================== PANEL 1: CONVERSATION LIST (Always visible on desktop, visible on mobile if no activeChannelId) ==================== */}
      <div className={`w-full md:w-80 lg:w-96 shrink-0 border-r border-slate-200 flex flex-col h-full bg-slate-50 ${
        activeChannelId ? 'hidden md:flex' : 'flex'
      }`} id="chat-list-sidebar-panel">
        
        {/* Sidebar Header */}
        <div className="p-4 bg-slate-900 text-white flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <span className="font-display font-black tracking-tight text-sm uppercase flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              Canais de Comunicação
            </span>
            {currentUserRole === 'client' && onBack && (
              <button 
                onClick={onBack}
                className="text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-amber-400 transition-colors cursor-pointer"
                id="sidebar-back-home"
              >
                ← Voltar ao Menu
              </button>
            )}
          </div>
          
          {/* Campo de pesquisa (Required) */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar contacto ou carga..."
              className="w-full pl-9 pr-3 py-2 bg-white/10 focus:bg-white/15 rounded-xl text-xs placeholder-slate-400 text-white focus:outline-none focus:ring-1 focus:ring-amber-405 font-medium transition-all"
              id="chat-conversations-search"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Scrollable Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-150 p-2 sm:p-4 bg-slate-50" id="chat-conversations-scroller">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Nenhuma conversa correspondente encontrada.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredConversations.map((convo) => {
                const lastMsg = getLastMessageInChannel(convo.id);
                const unread = getUnreadInChannel(convo.id);
                const isActive = convo.id === activeChannelId;
                
                return (
                  <button
                    key={convo.id}
                    onClick={() => handleSelectChannel(convo.id)}
                    className={`w-full text-left p-4 flex items-start gap-4 transition-all rounded-2xl cursor-pointer border ${
                      isActive 
                        ? 'bg-amber-500/10 text-slate-950 font-bold border-amber-500 shadow-sm' 
                        : 'bg-white hover:bg-slate-100 border-slate-150 text-slate-750 hover:shadow-sm'
                    }`}
                    id={`convo-row-${convo.id}`}
                  >
                    {/* Contact Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl shadow-sm border border-white/20">
                        {convo.avatar}
                      </div>
                      {convo.status === 'online' && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>

                    {/* Contact content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-black truncate text-slate-900 leading-snug">{convo.name}</p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {lastMsg ? formatTime(lastMsg.timestamp) : ''}
                        </span>
                      </div>
                      <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-0.5">{convo.role}</p>
                      <p className="text-xs text-slate-550 truncate mt-1.5 leading-normal font-medium">
                        {lastMsg ? lastMsg.text : 'Sem mensagens anteriores.'}
                      </p>
                    </div>

                    {/* Indicators (Unread Badge) */}
                    {unread > 0 && (
                      <span className="shrink-0 bg-green-600 text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ml-1 self-center animate-pulse">
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ==================== PANEL 2: CONVERSATION DETAILS (Always visible on desktop with placeholder, visible on mobile if activeChannelId) ==================== */}
      <div className={`flex-1 min-w-0 max-w-full flex flex-col h-full bg-white ${
        !activeChannelId ? 'hidden md:flex items-center justify-center text-slate-400 p-8 text-center' : 'flex'
      }`} id="chat-messages-viewer-panel">
        
        {activeChannelId ? (
          <>
            {/* 1) ACTIVE CHAT HEADER WITH STATUS INDICATOR */}
            <div className="bg-slate-50 text-slate-900 p-2.5 sm:p-3.5 flex items-center justify-between gap-2.5 sm:gap-3 border-b border-slate-200 shrink-0 w-full min-w-0" id="active-chat-header-container">
              <div className="flex items-center gap-3 min-w-0">
                
                {/* BACK TO LIST BUTTON (Value is unset to let mobile switch screens, hidden on desktop since split is active) */}
                <button
                  onClick={() => handleSelectChannel('')}
                  className="p-2 px-3 bg-slate-150 hover:bg-slate-200 text-slate-850 rounded-xl flex items-center gap-1 shrink-0 cursor-pointer shadow-xs border border-slate-200 text-xs font-bold transition-all md:hidden animate-fade-in"
                  id="chat-header-mobile-back-btn"
                  title="Voltar para a Lista de Conversas"
                >
                  <ArrowLeft className="w-5 h-5 shrink-0" />
                  <span>Voltar</span>
                </button>

                {/* Avatar Icon */}
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white text-lg flex items-center justify-center border shrink-0">
                  {activeContact.avatar}
                </div>

                {/* Contact Names & state info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-xs sm:text-sm text-slate-900 truncate leading-none">
                      {activeContact.name}
                    </span>
                    {activeContact.status === 'online' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500" title="Online"></span>
                    )}
                  </div>
                  
                  {/* Role and status indicator bar */}
                  <div className="text-[10px] text-slate-550 font-semibold tracking-wide flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-1">
                    <span>{activeContact.role}</span>
                    <span className="opacity-40">•</span>
                    <span className="text-[9px] text-green-600 font-bold uppercase">{getStatusDetails(chatStatus)?.label}</span>
                    {activeContact.phone && activeContact.phone !== 'Em Trânsito' && activeContact.phone !== 'Logística Portuária' && activeContact.phone !== 'N/A' && (
                      <>
                        <span className="opacity-40">•</span>
                        <a 
                          href={activeContact.phone.includes('942') && activeContact.phone.includes('043')
                            ? 'https://wa.me/244942043293' 
                            : `https://wa.me/${activeContact.phone.replace(/[^0-9]/g, '')}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 font-black flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100 cursor-pointer hover:underline"
                          title="Contactar diretamente no WhatsApp"
                        >
                          🟢 WhatsApp: {activeContact.phone}
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Toolbar on the Header */}
              <div className="flex items-center gap-2 shrink-0">
                
                {/* 2) VIP PRIORITÁRIO BOTÃO (Only shown to client on suport/general channel) */}
                {currentUserRole === 'client' && (activeChannelId === 'general' || activeChannelId.startsWith('MED')) && (
                  <button
                    onClick={handleTriggerPriority}
                    type="button"
                    className="p-1 px-3 bg-red-100 hover:bg-red-200 active:scale-95 text-red-700 font-black rounded-full text-[9px] uppercase tracking-wider flex items-center gap-1 transition-all shadow-xs cursor-pointer border border-red-200"
                    id="trigger-priority-btn"
                    title="Acionar Suporte Prioritário AGT"
                  >
                    <Shield className="w-2.5 h-2.5" />
                    <span>VIP</span>
                  </button>
                )}

                {/* 3) ADMIN STATUS SELECTOR DROPDOWN (Only visible to admin role) */}
                {currentUserRole === 'admin' && (
                  <div className="relative group inline-block">
                    <button
                      type="button"
                      className="p-1.5 text-xs bg-slate-105 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center gap-1 transition-colors"
                      id="admin-chat-status-trigger"
                    >
                      <span className="text-[10px]">{getStatusDetails(chatStatus)?.label}</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    
                    {/* Hover Dropdown Option List */}
                    <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg shadow-black/10 z-50 hidden group-hover:block transition-all">
                      <div className="p-1.5 space-y-1">
                        {(['online', 'absent', 'serving', 'out_of_hours'] as ChatStatusType[]).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleUpdateStatus(st)}
                            className="w-full text-left p-2 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center justify-between text-slate-700"
                          >
                            <span>{getStatusDetails(st)?.label}</span>
                            <span className={`w-2 h-2 rounded-full ${getStatusDetails(st)?.color.split(' ')[0]}`}></span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* MESSAGE HISTORY LIST VIEWPORT AREA */}
            <div className="flex-1 overflow-y-auto bg-slate-50/55 p-4 space-y-4" id="chat-messages-container-scroller">
              {currentChannelMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 text-slate-400 text-xs">
                  <Clock className="w-8 h-8 text-slate-350 mx-auto mb-2 animate-spin-slow" />
                  Sem comunicações trocadas neste canal comercial.
                </div>
              ) : (
                currentChannelMessages.map((msg, idx) => {
                  const isMe = msg.sender === currentUserRole;
                  const hasAttachment = !!msg.attachmentUrl || !!msg.attachmentType;
                  
                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex gap-3 max-w-[85%] sm:max-w-[70%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                      id={`chat-message-row-${msg.id || idx}`}
                    >
                      {/* Avatar icon */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 shadow-sm ${
                        msg.sender === 'admin' ? 'bg-slate-900 text-amber-400' : 'bg-sky-600 text-white'
                      }`}>
                        {msg.sender === 'admin' ? <ShieldCheck className="w-4 h-4 text-amber-400" /> : <User className="w-4 h-4 text-white" />}
                      </div>

                      {/* Bubble frame column */}
                      <div className="space-y-1">
                        <div className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed transition-all shadow-xs break-words overflow-visible ${
                          isMe 
                            ? 'bg-sky-600 text-white rounded-tr-none border border-sky-600' 
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                        }`}>
                          
                          {/* Rich Standard Text */}
                          <div className="whitespace-pre-wrap font-medium break-words overflow-visible">{msg.text}</div>

                          {/* 3) SPECIALIZED ATTACHMENT RENDERING */}
                          {hasAttachment && (
                            <div className="mt-3 pt-3 border-t border-black/10 dark:border-slate-100/10 space-y-2">
                              
                              {/* PHOTO ATTACHMENT */}
                              {msg.attachmentType === 'photo' && (
                                <div className="rounded-xl overflow-hidden border border-black/15 bg-slate-900 group relative">
                                  <img 
                                    src={msg.attachmentUrl} 
                                    className="w-full max-h-52 object-contain hover:scale-105 transition-transform" 
                                    alt="Carga Anexa" 
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-[9px] text-white px-2 py-0.5 rounded-lg">
                                    Ficheiro: {msg.attachmentName}
                                  </div>
                                </div>
                              )}

                              {/* GEOLOCATION ATTACHMENT */}
                              {msg.attachmentType === 'location' && (
                                <div className={`p-3 rounded-xl border flex flex-col gap-2 ${isMe ? 'bg-white/10 text-white border-white/10' : 'bg-slate-50 text-slate-800 border-slate-200'}`}>
                                  <div className="flex items-start gap-2">
                                    <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                    <div>
                                      <p className="font-bold text-xs uppercase tracking-wider">Localização de Carga</p>
                                      <p className="text-[10px] opacity-90 leading-tight">{msg.locationCoords?.address}</p>
                                      <span className="text-[9px] opacity-70 font-mono">Coords: {msg.locationCoords?.lat.toFixed(4)}, {msg.locationCoords?.lng.toFixed(4)}</span>
                                    </div>
                                  </div>
                                  <a 
                                    href={`https://maps.google.com/?q=${msg.locationCoords?.lat},${msg.locationCoords?.lng}`}
                                    target="_blank" 
                                    rel="noreferrer"
                                    referrerPolicy="no-referrer"
                                    className={`w-full py-1.5 rounded-lg text-[10px] font-bold text-center block ${isMe ? 'bg-white text-slate-950 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                                  >
                                    Ver no Google Maps Real ↗
                                  </a>
                                </div>
                              )}

                              {/* GENERIC DOCUMENT ATTACHMENT */}
                              {msg.attachmentType === 'document' && (
                                <div className={`flex items-center justify-between p-3 rounded-xl border ${isMe ? 'bg-white/10 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                                  <div className="flex items-center gap-2 overflow-hidden mr-2">
                                    <FileText className="w-5 h-5 text-amber-500 shrink-0" />
                                    <div className="overflow-hidden">
                                      <p className="text-xs font-bold truncate leading-none">{msg.attachmentName}</p>
                                      <span className="text-[8px] opacity-75 font-mono uppercase block mt-1">Ficheiro Documento PDF</span>
                                    </div>
                                  </div>
                                  <button className="p-1.5 bg-black/5 hover:bg-black/10 rounded-lg text-slate-700 shrink-0" onClick={() => triggerAlert('Ficheiro Baixado 📥', 'O ficheiro associado de Cabinda foi baixado com absoluto sucesso!', 'success')}>
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              )}

                              {/* PREMIUM INVOICE ATTACHMENT */}
                              {msg.attachmentType === 'invoice' && (
                                <div className="bg-slate-950 text-white p-4 rounded-xl border border-amber-400/30 space-y-3 shadow-inner">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[8px] uppercase font-bold tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">Fatura Aduaneira</span>
                                    <span className="text-[10px] font-mono text-slate-300">{msg.attachmentName}</span>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs font-extrabold text-slate-100">DESPACHO LOCAL LUANDA E FREIGHT ADUANEIRO</p>
                                    <span className="text-[9px] text-slate-400 block">Mediador Cabinda Lda • AGT Angola</span>
                                  </div>
                                  <div className="flex items-center justify-between bg-white/5 p-2 rounded-lg text-xs">
                                    <span className="font-semibold text-slate-300">Total Faturado</span>
                                    <span className="font-mono font-extrabold text-amber-400">AOA 42.500</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                                    <button 
                                      className="py-1 bg-amber-400 hover:bg-amber-550 text-slate-950 font-bold rounded-lg text-[9px] uppercase tracking-wide cursor-pointer flex items-center justify-center gap-1"
                                      onClick={() => triggerAlert('Impressão Iniciada 🖨️', 'A simular impressão imediata da faturização do despacho...', 'info')}
                                    >
                                      <Printer className="w-3 h-3" /> Imprimir
                                    </button>
                                    <button 
                                      className="py-1 bg-white/10 hover:bg-white/15 text-white font-bold rounded-lg text-[9px] uppercase tracking-wide cursor-pointer flex items-center justify-center gap-1"
                                      onClick={() => triggerAlert('Exportação PDF 📄', 'Fatura autorizada e exportada para PDF com sucesso.', 'success')}
                                    >
                                      <Download className="w-3 h-3" /> PDF
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* PREMIUM RECIBO */}
                              {msg.attachmentType === 'receipt' && (
                                <div className="bg-emerald-950 text-white p-4 rounded-xl border border-emerald-400/30 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[8px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">Recibo de Quitação Oficial</span>
                                    <span className="text-[10px] font-mono text-slate-350">{msg.attachmentName}</span>
                                  </div>
                                  <p className="text-xs font-bold leading-relaxed text-slate-150">Recebemos do cliente o montante indicado de forma eletrónica, liquidando as taxas do porto.</p>
                                  <div className="flex items-center justify-between bg-white/5 p-2 rounded-lg text-xs font-mono font-extrabold text-emerald-300">
                                    <span>ESTADO</span>
                                    <span>PAGO E CONFIRMADO</span>
                                  </div>
                                  <button 
                                    className="w-full py-1 bg-white/10 hover:bg-white/15 text-emerald-300 font-bold rounded-lg text-[9px] uppercase tracking-wider"
                                    onClick={() => triggerAlert('Recibo Descarregado 💳', 'Ficheiro de recibo local descarregado com sucesso.', 'success')}
                                  >
                                    Ver Comprovativo
                                  </button>
                                </div>
                              )}

                              {/* GAIA CARRIER GUIDE */}
                              {msg.attachmentType === 'transport_guide' && (
                                <div className="bg-sky-950 text-white p-4 rounded-xl border border-sky-400/30 space-y-3">
                                  <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                                    <span className="text-[8px] uppercase font-bold text-sky-400 block">Guia de Cabotagem Marítima</span>
                                    <span className="text-[9px] font-mono text-slate-300">Porto Luanda ➔ Cabinda</span>
                                  </div>
                                  <p className="text-xs font-bold text-slate-100">Guia Rodoviária Marítima Nº {Math.floor(10000 + Math.random() * 90000)}</p>
                                  <div className="text-[9px] space-y-0.5 text-slate-400 bg-sky-900/30 p-2 rounded-lg">
                                    <p>🚢 <strong>Embarcação:</strong> Navio Cabindense Graneleiro</p>
                                    <p>⚖️ <strong>Peso Estimado:</strong> 18.5 Kilogramas</p>
                                    <p>📦 <strong>Volumes:</strong> 1 Lote Amarrado</p>
                                  </div>
                                  <button 
                                    className="w-full py-1 bg-sky-400 text-slate-950 font-bold rounded-lg text-[10px]"
                                    onClick={() => triggerAlert('Guia de Cabotagem 🚢', 'A simular download da guia militar/marítima Oficial do Porto de Luanda.', 'info')}
                                  >
                                    Descarregar Guia de Transporte
                                  </button>
                                </div>
                              )}

                              {/* EXTRAS */}
                              {msg.attachmentType === 'dispatch_proof' && (
                                <div className="bg-purple-950 text-white p-4 rounded-xl border border-purple-400/30 space-y-2">
                                  <span className="text-[8px] uppercase font-bold text-purple-400 tracking-wider">Comprovativo de Despacho</span>
                                  <h5 className="text-xs font-bold leading-tight">Certidão Geral de Desembaraço Comercial - AGT</h5>
                                  <button 
                                    className="w-full py-1.5 bg-white/10 hover:bg-white/15 text-purple-300 rounded-lg text-[10px] font-bold mt-1"
                                    onClick={() => triggerAlert('Certidão AGT 💜', 'Certidão de desembaraço de alfândegas aduaneiras baixada com sucesso.', 'success')}
                                  >
                                    Visualizar Certidão AGT
                                  </button>
                                </div>
                              )}

                            </div>
                          )}
                        </div>
                        
                        {/* Time Stamp and checks */}
                        <p className={`text-[9px] text-slate-400 mt-0.5 px-1 flex items-center gap-1.5 ${isMe ? 'justify-end' : ''}`}>
                          <span>{formatTime(msg.timestamp)}</span>
                          {isMe && (
                            <span className="font-semibold text-[10px]">
                              {msg.isPriority ? (
                                <span className="text-emerald-600 font-extrabold font-mono" title="Lido por Despachante">✓✓ Lido</span>
                              ) : msg.text.length % 3 === 0 ? (
                                <span className="text-slate-400 font-extrabold font-mono" title="Enviado">✓ Enviado</span>
                              ) : msg.text.length % 3 === 1 ? (
                                <span className="text-sky-500 font-extrabold font-mono" title="Entregue">✓✓ Entregue</span>
                              ) : (
                                <span className="text-emerald-600 font-extrabold font-mono" title="Lido">✓✓ Lido</span>
                              )}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* QUICK ACTION SWIFT COMMUNICATOR CHIPS */}
            <div className="px-3 py-2 bg-slate-55 border-t border-slate-150 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-2 shrink-0 animate-fade-in w-full max-w-full min-w-0" id="chat-suggestion-chips-container" style={{ WebkitOverflowScrolling: 'touch' }}>
              {quickReplies.map((reply, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setInputText(reply);
                    notifyUser(`Selecionado: "${reply}"`);
                  }}
                  className="flex-shrink-0 text-[10px] sm:text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold px-3.5 py-1.5 rounded-full border border-slate-200 transition-colors cursor-pointer shadow-xs inline-block"
                  id={`quick-resp-${i}`}
                >
                  💬 {reply}
                </button>
              ))}
            </div>

            {/* PRIMARY BOTTOM USER INPUT COMPOSER COMPONENT */}
            <form onSubmit={handleSendText} className="p-2 sm:p-3 border-t border-slate-150 bg-white flex items-center gap-1.5 sm:gap-2 shrink-0 w-full max-w-full min-w-0 overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  setShowAttachmentsMenu(!showAttachmentsMenu);
                  notifyUser('Anexar faturas ou imagens.');
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-150 relative cursor-pointer"
                title="Inserir comprovativos ou fotos"
                id="chat-clip-trigger-btn"
              >
                <Paperclip className="w-4 h-4 text-slate-600" />
              </button>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (inputText.trim()) {
                      executeSend(inputText.trim());
                    }
                  }
                }}
                rows={Math.min(3, Math.max(1, inputText.split('\n').length))}
                placeholder="Escreva a sua mensagem..."
                className="flex-1 min-w-0 px-3 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 max-h-24 bg-slate-50/50 scrollbar-thin font-medium leading-relaxed text-slate-800"
                id="chat-messaging-input"
              />

              <button
                type="submit"
                className="w-10 h-10 rounded-xl bg-amber-400 hover:bg-amber-505 text-slate-950 hover:bg-amber-500 active:scale-95 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-md border border-amber-305"
                id="chat-send-icon-btn"
                title="Enviar Mensagem"
              >
                <Send className="w-4.5 h-4.5 ml-0.5" />
              </button>
            </form>
          </>
        ) : (
          /* ==================== PANEL 3: NO CHAT SELECTED WATERMARK PLACEHOLDER ==================== */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/30 animate-fade-in" id="chat-no-active-convers-placeholder">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4 shadow-inner border border-slate-100">
              <MessageSquare className="w-8 h-8 text-slate-450" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-800 tracking-tight font-display mb-1.5">Mesa de Conversação de Clientes</h4>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-semibold">
              Selecione uma conta de cliente ou um canal de coordenação de mercadorias ao lado para conversar, enviar documentos aduaneiros ou rastrear as rotas em tempo real.
            </p>
          </div>
        )}
      </div>

      {/* ==================== SCREEN OVERLAYS & SLIDERS (POPUP REPLACEMENTS) ==================== */}

      {/* 5) ACTIVE LIVE CAMERA PREVIEW FINDER POPUP */}
      {cameraActive && (
        <div className="absolute inset-0 bg-slate-950/95 z-55 flex flex-col justify-between p-6 text-white animate-fade-in" id="camera-overlay-simulated">
          <div className="flex justify-between items-center">
            <span className="font-bold flex items-center gap-2 text-sm text-red-500">
              <Camera className="w-4 h-4 animate-pulse" />
              CÂMARA EM TEMPO REAL (FOTO CARGA)
            </span>
            <button 
              onClick={() => { setCameraActive(false); setCameraPreviewImage(null); }}
              className="p-1 px-3 bg-white/20 rounded-full text-xs font-bold"
            >
              Fechar Ecrã
            </button>
          </div>

          <div className="flex-1 my-4 flex items-center justify-center relative border border-white/10 rounded-2xl bg-black">
            {cameraCountdown !== null ? (
              <span className="text-6xl font-extrabold text-amber-400 animate-ping">{cameraCountdown}</span>
            ) : cameraPreviewImage ? (
              <img src={cameraPreviewImage} className="w-full h-full object-contain rounded-2xl" alt="Preview" referrerPolicy="no-referrer" />
            ) : (
              <div className="text-center space-y-2 p-6 select-none">
                <Compass className="w-12 h-12 text-slate-600 mx-auto animate-spin" />
                <p className="text-xs text-slate-400">Visor pronto a capturar o produto fiscal em Luanda de forma instantânea.</p>
              </div>
            )}
            <div className="absolute inset-4 border border-dashed border-white/20 rounded-xl pointer-events-none"></div>
          </div>

          <div className="flex justify-center gap-4">
            {cameraPreviewImage ? (
              <>
                <button 
                  onClick={() => setCameraPreviewImage(null)}
                  className="px-5 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs uppercase"
                >
                  Repetir Foto
                </button>
                <button 
                  onClick={handleSendCameraPhoto}
                  className="px-6 py-2.5 bg-green-500 text-slate-950 font-extrabold rounded-xl text-xs uppercase flex items-center gap-1.5"
                >
                  Confirmar e Enviar para Carga
                </button>
              </>
            ) : (
              <button 
                onClick={handleTriggerSimulatedCameraSnapshot}
                disabled={cameraCountdown !== null}
                className="px-8 py-3 bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-extrabold rounded-full text-xs uppercase shadow-lg flex items-center gap-2 cursor-pointer"
              >
                📸 Disparar Câmara
              </button>
            )}
          </div>
        </div>
      )}

      {/* 6) DYNAMIC LOCATION SELECTION POPUP */}
      {locationPickerActive && (
        <div className="absolute inset-x-0 bottom-0 bg-white z-55 max-h-[85%] overflow-y-auto border-t-2 border-slate-300 rounded-t-3xl shadow-2xl p-5 space-y-4 text-slate-900 animate-slide-up">
          <div className="flex justify-between items-center border-b pb-2">
            <h4 className="font-extrabold text-xs uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
              <MapPin className="text-red-500 w-5 h-5" />
              Selecione Coordenadas em Angola
            </h4>
            <button onClick={() => setLocationPickerActive(false)} className="text-xs font-bold text-slate-400">✕ Cancelar</button>
          </div>

          <p className="text-xs text-slate-500 font-medium">Recomendado enviar a localização para agendamento de recolha ou entrega final em rota de cabotagem.</p>
          
          <div className="space-y-1.5">
            {[
              { label: '📍 Porto de Cabotagem de Luanda (Lote Depósito)', lat: -8.8044, lng: 13.2435 },
              { label: '📍 Aeroporto Nacional 4 de Fevereiro (Terminal TAAG)', lat: -8.8524, lng: 13.2325 },
              { label: '📍 Sede Comercial Maculusso, Luanda (Escritórios)', lat: -8.8252, lng: 13.2355 },
              { label: '📍 Porto Comercial de Cabinda, Armazém C-4', lat: -5.5562, lng: 12.1935 },
              { label: '📍 Cabinda Sede, Mercado Municipal Central', lat: -5.5610, lng: 12.1895 },
              { label: '📍 Bairro Chiuca, Cabinda Zona Residencial', lat: -5.5482, lng: 12.1795 }
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendLocation(p.label.replace('📍 ', ''), p.lat, p.lng)}
                className="w-full text-left p-3 hover:bg-slate-50 rounded-xl border border-slate-150 flex justify-between items-center text-xs cursor-pointer"
              >
                <div className="font-semibold text-slate-800">{p.label}</div>
                <span className="text-[10px] font-mono text-slate-400">{p.lat.toFixed(3)}, {p.lng.toFixed(3)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 7) DYNAMIC ATTACH DOCUMENT DRAWER POPUP */}
      {documentPickerActive && (
        <div className="absolute inset-x-0 bottom-0 bg-white z-55 max-h-[85%] border-t-2 border-slate-300 rounded-t-3xl shadow-2xl p-5 text-slate-900 animate-slide-up">
          <form onSubmit={handleSendCustomDocument} className="space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-extrabold text-xs uppercase tracking-widest text-slate-500">
                Anexar Comprovativo ou Guia de Carga
              </h4>
              <button type="button" onClick={() => setDocumentPickerActive(false)} className="text-xs font-bold text-slate-400">✕ Cancelar</button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Documento</label>
              <select
                value={customDocType}
                onChange={(e) => setCustomDocType(e.target.value as any)}
                className="w-full text-xs p-2.5 border rounded-xl"
              >
                <option value="document">📄 Documento Geral (Comprovativo)</option>
                <option value="invoice">0 Fatura Fiscal Emitida (Factura)</option>
                <option value="receipt">💳 Recibo de Quitação Oficial</option>
                <option value="transport_guide">🚚 Guia de Transporte de Cabotagem</option>
                <option value="dispatch_proof">🛡️ Comprovativo de Despacho AGT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nome/Código do Arquivo</label>
              <input
                type="text"
                value={customDocName}
                onChange={(e) => setCustomDocName(e.target.value)}
                placeholder="Ex e.g. comprovante_bancario_ref_10"
                className="w-full text-xs p-2.5 border rounded-xl"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold cursor-pointer"
            >
              Simular Envio do Ficheiro PDF
            </button>
          </form>
        </div>
      )}

      {/* 8) DYNAMIC ATTACHMENT MENU BOTTOM SHEET */}
      {showAttachmentsMenu && (
        <div className="absolute inset-0 bg-slate-950/40 z-50 flex items-end justify-center animate-fade-in" id="chat-attachment-overlay">
          <div className="bg-white rounded-t-3xl shadow-2xl p-5 w-full border-t border-slate-200 space-y-4 font-semibold animate-slide-up" id="chat-attachment-menu">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-xs uppercase font-extrabold tracking-widest text-slate-500">Documentação & Ficheiros</span>
              <button 
                type="button"
                onClick={() => setShowAttachmentsMenu(false)} 
                className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 text-xs px-2.5 py-1.5 rounded-lg font-bold"
              >
                ✕ Cancelar
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              {/* Camera */}
              <button
                type="button"
                onClick={() => { setCameraActive(true); setShowAttachmentsMenu(false); }}
                className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl active:scale-95 transition-all cursor-pointer border border-slate-100"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-xs text-slate-700 font-bold">Câmara</span>
              </button>

              {/* Gallery */}
              <button
                type="button"
                onClick={() => {
                  const galleryImgs = [
                    { url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60', name: 'HP_Computador_Box.png' },
                    { url: 'https://images.unsplash.com/photo-1597484211616-3615260192b1?w=500&auto=format&fit=crop&q=60', name: 'Gerador_Toyama_5KVA.png' },
                    { url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60', name: 'Eletrobomba_Pedrollo.png' }
                  ];
                  const rand = galleryImgs[Math.floor(Math.random() * galleryImgs.length)];
                  handleSendGalleryPhoto(rand.url, rand.name);
                }}
                className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl active:scale-95 transition-all cursor-pointer border border-slate-100"
              >
                <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 shadow-xs">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <span className="text-xs text-slate-700 font-bold">Galeria</span>
              </button>

              {/* Document Simulator */}
              <button
                type="button"
                onClick={() => { setDocumentPickerActive(true); setShowAttachmentsMenu(false); }}
                className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl active:scale-95 transition-all cursor-pointer border border-slate-100"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-xs text-slate-700 font-bold">Documento</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fallback Local Toast dialog */}
      {localToast && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in text-slate-850">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-100 animate-scale-up text-center">
            <div className={`p-4 border-b border-slate-100 flex items-center justify-center gap-2 ${
              localToast.type === 'success' ? 'bg-emerald-50 text-emerald-800 font-bold' :
              localToast.type === 'warning' ? 'bg-amber-50 text-amber-850 font-bold' :
              'bg-slate-50 text-slate-800'
            }`}>
              <span className="text-xs font-black uppercase tracking-wider">{localToast.title}</span>
            </div>
            <div className="p-5 text-[11px] text-slate-600 font-semibold leading-relaxed whitespace-pre-line text-left">
              {localToast.message}
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setLocalToast(null)}
                className="px-5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Compreendi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
