/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Client, Order, Message, Notification, CarrierCompany, Supplier, SupplierProduct, SupplierMessage, Collaborator, CollaboratorSale } from './types';
import { 
  getClients, 
  getOrders, 
  getMessages, 
  getCurrentClientId, 
  saveClients, 
  saveOrders, 
  saveMessages, 
  saveCurrentClientId, 
  initializeStorage,
  CARRIER_COMPANIES,
  getSuppliers,
  saveSuppliers,
  getSupplierProducts,
  saveSupplierProducts,
  getSupplierMessages,
  saveSupplierMessages
} from './data/mockData';
import ClientDashboard from './components/ClientDashboard';
import AdminDashboard from './components/AdminDashboard';
import { 
  Building, 
  ShieldCheck, 
  User, 
  Bell, 
  RotateCcw, 
  Info, 
  CheckCircle,
  Truck,
  Menu,
  X,
  Volume2,
  VolumeX,
  PlusCircle,
  ShoppingBag,
  List,
  Search,
  HelpCircle,
  Settings,
  CreditCard,
  FileText,
  AlertTriangle,
  Smartphone,
  Tablet,
  Monitor,
  Mic,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

export default function App() {
  const [role, setRole] = useState<'client' | 'admin'>('client');
  const [clients, setClients] = useState<Client[]>([]);
  const [activeClientId, setActiveClientId] = useState<string>('cli-1');
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [carriersList, setCarriersList] = useState<CarrierCompany[]>([]);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Suppliers state
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierProducts, setSupplierProducts] = useState<SupplierProduct[]>([]);
  const [supplierMessages, setSupplierMessages] = useState<SupplierMessage[]>([]);

  // Collaborators & sales state (synchronised across panels)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [collaboratorSales, setCollaboratorSales] = useState<CollaboratorSale[]>([]);

  // Modular routing active views for client
  const [currentView, setCurrentView] = useState<'inicio' | 'fazer-pedido' | 'acompanhar-pedido' | 'cadastro' | 'entrar' | 'minha-conta' | 'historico' | 'pagamentos' | 'notificacoes' | 'suporte' | 'reclamacoes' | 'configuracoes' | 'sobre-nos' | 'termos-uso' | 'mercado-fornecedores' | 'mensagens' | 'parceria'>('inicio');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [supportExpanded, setSupportExpanded] = useState(false);

  // Accessibility Controls
  const [fontSize, setFontSize] = useState<'normal' | 'grande' | 'extra-grande'>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [textToSpeech, setTextToSpeech] = useState(false);
  const [voiceQueryActive, setVoiceQueryActive] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState<string>('');

  // Device view simulation
  const [simulatedDevice, setSimulatedDevice] = useState<'desktop' | 'tablet' | 'smartphone'>('desktop');

  // States to allow opening and reading notifications with general reply capability
  const [selectedNotificationForModal, setSelectedNotificationForModal] = useState<Notification | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Search state for Home View
  const [homeSearchQuery, setHomeSearchQuery] = useState('');

  // Initialize and load storage
  useEffect(() => {
    initializeStorage();
    setClients(getClients());
    setActiveClientId(getCurrentClientId());
    setOrders(getOrders());
    setMessages(getMessages());
    setSuppliers(getSuppliers());
    setSupplierProducts(getSupplierProducts());
    setSupplierMessages(getSupplierMessages());

    // Initialize mock notifications
    const storedNotifs = localStorage.getItem('mediador_cabinda_notifications');
    if (storedNotifs) {
      setNotifications(JSON.parse(storedNotifs));
    } else {
      const initialNotifs: Notification[] = [
        {
          id: 'not-1',
          clientId: 'cli-1',
          orderId: 'MED-1001',
          title: 'Pedido Registado',
          message: 'A sua eletrobomba Pedrollo foi registada e seguiu para análise comercial.',
          read: true,
          createdAt: '2026-06-10T14:35:00Z'
        },
        {
          id: 'not-2',
          clientId: 'cli-2',
          orderId: 'MED-1002',
          title: 'Orçamento Pronto',
          message: 'O orçamento do computador HP está disponível para aprovação de pagamento.',
          read: false,
          createdAt: '2026-06-12T10:10:00Z'
        }
      ];
      setNotifications(initialNotifs);
      localStorage.setItem('mediador_cabinda_notifications', JSON.stringify(initialNotifs));
    }

    // Initialize list of carrier companies (empresas de despacho)
    const storedCarriers = localStorage.getItem('mediador_cabinda_carriers');
    if (storedCarriers) {
      setCarriersList(JSON.parse(storedCarriers));
    } else {
      setCarriersList(CARRIER_COMPANIES);
      localStorage.setItem('mediador_cabinda_carriers', JSON.stringify(CARRIER_COMPANIES));
    }

    // Initialize collaborators
    const storedColabs = localStorage.getItem('mediador_cabinda_collaborators');
    if (storedColabs) {
      setCollaborators(JSON.parse(storedColabs));
    } else {
      const initialColabs: Collaborator[] = [
        {
          id: 'colab-1',
          name: 'Manuel Mateus Bento',
          phone: '+244 923 456 789',
          email: 'manuel.bento@mediadorcabinda.com',
          role: 'Consultor de Negócios / Afiliado Cabinda',
          defaultCommissionPercentage: 15,
          totalSalesBrought: 3,
          totalEarnedCommissions: 42000,
          joinedAt: '2026-03-10T14:30:22.000Z'
        },
        {
          id: 'colab-2',
          name: 'Clara de Sousa Nzita',
          phone: '+244 934 888 221',
          email: 'clara.nzita@mediadorcabinda.com',
          role: 'Agente Independente - Fronteira Luanda',
          defaultCommissionPercentage: 12,
          totalSalesBrought: 2,
          totalEarnedCommissions: 28800,
          joinedAt: '2026-04-18T10:15:00.000Z'
        },
        {
          id: 'colab-3',
          name: 'João Baptista Mavungo',
          phone: '+244 912 777 444',
          email: 'joao.mavungo@mediadorcabinda.com',
          role: 'Promotor Comercial & Redes Sociais',
          defaultCommissionPercentage: 10,
          totalSalesBrought: 1,
          totalEarnedCommissions: 15000,
          joinedAt: '2026-05-02T16:45:10.000Z'
        }
      ];
      setCollaborators(initialColabs);
      localStorage.setItem('mediador_cabinda_collaborators', JSON.stringify(initialColabs));
    }

    // Initialize collaborator sales
    const storedColabSales = localStorage.getItem('mediador_cabinda_collaborator_sales');
    if (storedColabSales) {
      setCollaboratorSales(JSON.parse(storedColabSales));
    } else {
      const initialSales: CollaboratorSale[] = [
        {
          id: 'sale-1',
          collaboratorId: 'colab-1',
          collaboratorName: 'Manuel Mateus Bento',
          clientName: 'Domingos Chimpaco',
          saleDescription: 'Intermediação de Material Elétrico para Gerador',
          saleAmount: 450000,
          commissionPrice: 120000,
          collaboratorPercentage: 15,
          calculatedCommission: 18000,
          status: 'pago',
          createdAt: '2026-05-20T11:22:00.000Z'
        },
        {
          id: 'sale-2',
          collaboratorId: 'colab-1',
          collaboratorName: 'Manuel Mateus Bento',
          clientName: 'Sofia Baka',
          saleDescription: 'Lote de 5 Computadores Lenovo Refurbished',
          saleAmount: 800000,
          commissionPrice: 160000,
          collaboratorPercentage: 15,
          calculatedCommission: 24000,
          status: 'pendente',
          createdAt: '2026-06-02T09:12:44.000Z'
        },
        {
          id: 'sale-3',
          collaboratorId: 'colab-2',
          collaboratorName: 'Clara de Sousa Nzita',
          clientName: 'Henrique Barros',
          saleDescription: 'Compra e Transporte de Peças Auto e Reboques',
          saleAmount: 1200000,
          commissionPrice: 240000,
          collaboratorPercentage: 12,
          calculatedCommission: 28800,
          status: 'pago',
          createdAt: '2026-06-12T15:30:10.000Z'
        },
        {
          id: 'sale-4',
          collaboratorId: 'colab-3',
          collaboratorName: 'João Baptista Mavungo',
          clientName: 'Amélia Gime',
          saleDescription: 'Contentor Pequeno Equipamento Industrial',
          saleAmount: 1500000,
          commissionPrice: 150000,
          collaboratorPercentage: 10,
          calculatedCommission: 15000,
          status: 'pendente',
          createdAt: '2026-06-18T14:22:50.005Z'
        }
      ];
      setCollaboratorSales(initialSales);
      localStorage.setItem('mediador_cabinda_collaborator_sales', JSON.stringify(initialSales));
    }
  }, []);

  // Text-To-Speech reader triggering
  const speakText = (text: string) => {
    if (!textToSpeech) return;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const synthMsg = new SpeechSynthesisUtterance(text);
        synthMsg.lang = 'pt-AO'; // Angolan / Portuguese speech synth
        window.speechSynthesis.speak(synthMsg);
      } catch (err) {
        console.warn("Speech synthesis error or blocked:", err);
      }
    }
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    const updatedOrders = orders.map(ord => ord.id === updatedOrder.id ? updatedOrder : ord);
    setOrders(updatedOrders);
    saveOrders(updatedOrders);
  };

  const handleUpdateCollaborators = (newColabs: Collaborator[]) => {
    setCollaborators(newColabs);
    localStorage.setItem('mediador_cabinda_collaborators', JSON.stringify(newColabs));
  };

  const handleUpdateCollaboratorSales = (newSales: CollaboratorSale[]) => {
    setCollaboratorSales(newSales);
    localStorage.setItem('mediador_cabinda_collaborator_sales', JSON.stringify(newSales));
  };

  const handleAddCarrier = (newCarrier: CarrierCompany) => {
    const updated = [...carriersList, newCarrier];
    setCarriersList(updated);
    localStorage.setItem('mediador_cabinda_carriers', JSON.stringify(updated));
    speakText(`Nova empresa de despacho cadastrada: ${newCarrier.name}`);
  };

  const handleAddOrder = (newOrder: Order) => {
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    saveOrders(updatedOrders);

    // Prompt automatic initial notification
    const addedNotif: Notification = {
      id: `notif-${Date.now()}`,
      clientId: newOrder.clientId,
      orderId: newOrder.id,
      title: 'Pedido Recebido com Sucesso',
      message: `A sua solicitação de "${newOrder.productName}" foi registada. Aguarde o orçamento.`,
      read: false,
      createdAt: new Date().toISOString()
    };
    const updatedNotifs = [addedNotif, ...notifications];
    setNotifications(updatedNotifs);
    localStorage.setItem('mediador_cabinda_notifications', JSON.stringify(updatedNotifs));
    speakText("Seu pedido foi recebido com sucesso no sistema. Aguarde a cotação comercial.");
  };

  const handleAddClient = (newClient: Client) => {
    const updatedClients = [...clients, newClient];
    setClients(updatedClients);
    saveClients(updatedClients);
    setActiveClientId(newClient.id);
    saveCurrentClientId(newClient.id);
    speakText("Cadastro concluído com sucesso. Sua conta está agora ativa.");
  };

  const handleSetClient = (clientId: string) => {
    setActiveClientId(clientId);
    saveCurrentClientId(clientId);
    speakText(`Sessão do cliente alterada com sucesso.`);
  };

  const handleSendMessage = (
    orderId: string,
    text: string,
    attachment?: {
      url: string;
      type: 'photo' | 'document' | 'location' | 'invoice' | 'receipt' | 'transport_guide' | 'dispatch_proof';
      name: string;
      coords?: { lat: number; lng: number; address: string };
    },
    isPriority?: boolean,
    senderOverride?: 'client' | 'admin'
  ) => {
    const activeSender = senderOverride || role;
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      orderId,
      sender: activeSender,
      text,
      timestamp: new Date().toISOString(),
      read: false,
      attachmentUrl: attachment?.url,
      attachmentType: attachment?.type,
      attachmentName: attachment?.name,
      locationCoords: attachment?.coords,
      isPriority
    };

    setMessages((prev) => {
      const next = [...prev, newMsg];
      saveMessages(next);
      return next;
    });

    // Handle real-time notification alerts
    if (activeSender === 'client') {
      let clientName = 'Cliente';
      let cleanClientId = 'general';
      if (orderId.startsWith('general-')) {
        cleanClientId = orderId.replace('general-', '');
      } else {
        const foundOrder = orders.find(o => o.id === orderId);
        if (foundOrder) {
          cleanClientId = foundOrder.clientId;
          clientName = foundOrder.clientName;
        }
      }

      const foundClient = clients.find(c => c.id === cleanClientId);
      if (foundClient) {
        clientName = foundClient.name;
      }

      const adminNotif: Notification = {
        id: `not-msg-${Date.now()}`,
        clientId: cleanClientId,
        orderId: orderId.startsWith('general-') ? 'Geral' : orderId,
        title: `Mensagem de ${clientName}`,
        message: text.length > 55 ? `${text.substring(0, 52)}...` : text,
        read: false,
        createdAt: new Date().toISOString()
      };

      setNotifications((prev) => {
        const next = [adminNotif, ...prev];
        localStorage.setItem('mediador_cabinda_notifications', JSON.stringify(next));
        return next;
      });

      speakText(`Nova mensagem de ${clientName}: ${text}`);
    } else if (activeSender === 'admin') {
      let targetClientId = 'cli-1';
      if (orderId.startsWith('general-')) {
        targetClientId = orderId.replace('general-', '');
      } else {
        const foundOrder = orders.find(o => o.id === orderId);
        if (foundOrder) {
          targetClientId = foundOrder.clientId;
        }
      }

      const clientNotif: Notification = {
        id: `not-msg-client-${Date.now()}`,
        clientId: targetClientId,
        orderId: orderId.startsWith('general-') ? 'Geral' : orderId,
        title: `Resposta da Direção`,
        message: text.length > 55 ? `${text.substring(0, 52)}...` : text,
        read: false,
        createdAt: new Date().toISOString()
      };

      setNotifications((prev) => {
        const next = [clientNotif, ...prev];
        localStorage.setItem('mediador_cabinda_notifications', JSON.stringify(next));
        return next;
      });

      speakText(`Recebeu resposta da Direção: ${text}`);
    }
  };

  const handleMarkChannelAsRead = React.useCallback((channelId: string) => {
    setMessages((prev) => {
      let updated = false;
      const next = prev.map(m => {
        if (m.orderId === channelId && !m.read && m.sender !== role) {
          updated = true;
          return { ...m, read: true };
        }
        return m;
      });
      if (updated) {
        saveMessages(next);
        return next;
      }
      return prev;
    });
  }, [role]);

  const handleAddNotification = (newNotif: Notification) => {
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    localStorage.setItem('mediador_cabinda_notifications', JSON.stringify(updatedNotifs));
  };

  const handleMarkNotificationRead = (id: string) => {
    const updatedNotifs = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updatedNotifs);
    localStorage.setItem('mediador_cabinda_notifications', JSON.stringify(updatedNotifs));
  };

  const handleUpdateSupplier = (updated: Supplier) => {
    const next = suppliers.map(s => s.id === updated.id ? updated : s);
    setSuppliers(next);
    saveSuppliers(next);
  };

  const handleCreateSupplier = (newS: Supplier) => {
    const next = [...suppliers, newS];
    setSuppliers(next);
    saveSuppliers(next);
  };

  const handleUpdateSupplierProduct = (updated: SupplierProduct) => {
    const next = supplierProducts.map(p => p.id === updated.id ? updated : p);
    setSupplierProducts(next);
    saveSupplierProducts(next);
  };

  const handleCreateSupplierProduct = (newP: SupplierProduct) => {
    const next = [...supplierProducts, newP];
    setSupplierProducts(next);
    saveSupplierProducts(next);
  };

  const handleSendSupplierMessage = (msg: SupplierMessage) => {
    const next = [...supplierMessages, msg];
    setSupplierMessages(next);
    saveSupplierMessages(next);
  };

  const handleResetSimulator = () => {
    if (confirm('Deseja repor todos os dados do simulador para o estado original?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Simulated Speech Recognition Command logic
  const triggerVoiceCommandSimulation = (commandText: string) => {
    setVoiceMessage(`Entendido: "${commandText}"`);
    let recognized = true;
    const lower = commandText.toLowerCase();

    if (lower.includes('inicio') || lower.includes('página inicial') || lower.includes('home')) {
      setCurrentView('inicio');
    } else if (lower.includes('pedido') || lower.includes('comprar') || lower.includes('fazer pedido')) {
      setCurrentView('fazer-pedido');
    } else if (lower.includes('acompanhar') || lower.includes('rastreio') || lower.includes('rastrear')) {
      setCurrentView('acompanhar-pedido');
    } else if (lower.includes('cadastro') || lower.includes('registrar')) {
      setCurrentView('cadastro');
    } else if (lower.includes('conta') || lower.includes('meu perfil')) {
      setCurrentView('minha-conta');
    } else if (lower.includes('suporte') || lower.includes('ajuda') || lower.includes('chat')) {
      setCurrentView('suporte');
    } else if (lower.includes('contraste') || lower.includes('acessibilidade')) {
      setHighContrast(!highContrast);
    } else if (lower.includes('grande') || lower.includes('aumentar')) {
      setFontSize('grande');
    } else if (lower.includes('normal') || lower.includes('diminuir')) {
      setFontSize('normal');
    } else if (lower.includes('voz') || lower.includes('leitura')) {
      setTextToSpeech(!textToSpeech);
    } else {
      recognized = false;
      setVoiceMessage(`Comando "${commandText}" não reconhecido. Tente "Início", "Fazer Pedido", "Suporte" ou "Contraste".`);
    }

    if (recognized) {
      speakText(`A executar comando de voz: ${commandText}`);
      setTimeout(() => setVoiceMessage(''), 3000);
    }
  };

  // Real Speech Recognition interface backup
  const handleMicrophoneClick = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-AO';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      
      setVoiceQueryActive(true);
      setVoiceMessage('A escutar... Fale agora.');
      speakText('A escutar comandos.');

      recognition.onresult = (event: any) => {
        const speechToText = event.results[0][0].transcript;
        triggerVoiceCommandSimulation(speechToText);
      };

      recognition.onerror = () => {
        setVoiceMessage('Erro de captação. Use o simulador em texto abaixo.');
        setTimeout(() => setVoiceMessage(''), 4000);
        setVoiceQueryActive(false);
      };

      recognition.onend = () => {
        setVoiceQueryActive(false);
      };

      recognition.start();
    } else {
      // Fallback popup if browser blocks speech recognition
      setVoiceQueryActive(true);
      setVoiceMessage('Reconhecimento de voz real bloqueado/não nativo. Escolha um comando em baixo para simular!');
    }
  };

  if (clients.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 font-sans">
        <div className="text-center p-8 bg-white border border-slate-200 rounded-xl shadow-md">
          <p className="text-sm font-semibold text-slate-700">Carregando Mediador Cabinda...</p>
        </div>
      </div>
    );
  }

  const unreadNotifs = notifications.filter(n => n.clientId === activeClientId && !n.read);

  // Sidebar Links
  const sidebarItems = [
    { id: 'inicio', label: 'Início', icon: Truck },
    { id: 'fazer-pedido', label: 'Fazer Pedido', icon: PlusCircle },
    { id: 'acompanhar-pedido', label: 'Acompanhar Pedido', icon: ShoppingBag },
    { id: 'cadastro', label: 'Cadastro', icon: User },
    { id: 'entrar', label: 'Entrar / Trocar Conta', icon: Building },
    { id: 'minha-conta', label: 'Minha Conta', icon: User },
    { id: 'historico', label: 'Histórico de Compras', icon: List },
    { id: 'pagamentos', label: 'Pagamentos', icon: CreditCard },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'suporte', label: 'Suporte', icon: HelpCircle },
    { id: 'reclamacoes', label: 'Reclamações', icon: AlertTriangle },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
    { id: 'sobre-nos', label: 'Sobre Nós', icon: Info },
    { id: 'termos-uso', label: 'Termos de Uso', icon: FileText }
  ];

  return (
    <div className={`min-h-screen flex flex-col bg-slate-100 text-slate-900 selection:bg-slate-900 selection:text-amber-400 font-sans 
      ${fontSize === 'grande' ? 'font-size-grande' : fontSize === 'extra-grande' ? 'font-size-extra-grande' : ''} 
      ${highContrast ? 'high-contrast-active' : ''}`} id="app-root">
      
      {/* PERSISTENT CONSOLIDATED 2-LEVEL HEADER */}
      <header className="bg-slate-950 text-white sticky top-0 z-50 shadow-md border-b border-white/5" id="app-main-header">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-row items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          
          {/* Logo and title combined on a single line */}
          <div className="flex items-center gap-3 shrink-0">
            {role === 'client' && (
              <button 
                onClick={() => {
                  setSidebarOpen(!sidebarOpen);
                  speakText(sidebarOpen ? "Menu fechado" : "Menu aberto contendo opções de navegação");
                }}
                className="p-2 bg-white/10 hover:bg-white/15 active:bg-white/20 text-white rounded-xl cursor-pointer transition-colors"
                title="Abrir Menu (☰)"
                id="sidebar-toggle-btn"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="bg-amber-400 text-slate-950 p-1.5 rounded-xl font-bold flex items-center justify-center shadow-xs shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white font-display select-none">Mediador Cabinda</span>
            </div>
          </div>

          {/* RIGHT ACTION CONTROLS: CONSOLIDATED NOTIFICATIONS + RETURN TO CLIENT FOR ADMIN */}
          <div className="flex items-center gap-2 shrink-0">
            {role === 'client' && (
              <div className="sm:relative">
                {/* Integrated Profile Avatar holding Notification Badge */}
                <button
                  onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
                  className="bg-transparent p-0 rounded-full hover:scale-102 active:scale-98 transition-all relative cursor-pointer flex items-center gap-1.5 focus:outline-2 focus:outline-blue-500"
                  id="notifications-profile-btn"
                  title="Notificações e Perfil"
                >
                  <div className="w-9 h-9 rounded-full bg-amber-400 text-slate-950 border-2 border-slate-950 flex items-center justify-center font-extrabold text-xs shrink-0 shadow-sm relative overflow-hidden">
                    {clients.find(c => c.id === activeClientId)?.name.substring(0, 2).toUpperCase() || 'MC'}
                  </div>
                  {unreadNotifs.length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-600 text-white font-mono text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-bounce shadow-md border border-slate-950">
                      {unreadNotifs.length}
                    </span>
                  )}
                </button>

                {/* Notifications & Profile dropdown */}
                {showNotificationsMenu && (
                  <div className="absolute left-4 right-4 mx-auto max-w-sm sm:max-w-none sm:left-auto sm:right-0 mt-2 sm:w-80 bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-xl z-50 p-4 space-y-3 origin-top" id="notifications-dropdown">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="text-left">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Conta Ativa</p>
                        <h4 className="text-xs font-black text-slate-800">{clients.find(c => c.id === activeClientId)?.name}</h4>
                      </div>
                      <button 
                        onClick={() => {
                          notifications.forEach(n => handleMarkNotificationRead(n.id));
                          setShowNotificationsMenu(false);
                          speakText("Todas as notificações marcadas como lidas.");
                        }}
                        className="text-[10px] text-amber-600 font-bold hover:underline cursor-pointer"
                      >
                        Ler Tudo
                      </button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
                      {notifications.filter(n => n.clientId === activeClientId).length === 0 ? (
                        <p className="text-xs text-slate-450 text-center py-4 font-semibold">Sem notificações recebidas</p>
                      ) : (
                        notifications
                          .filter(n => n.clientId === activeClientId)
                          .map(notif => (
                            <div 
                              key={notif.id} 
                              onClick={() => {
                                handleMarkNotificationRead(notif.id);
                                setSelectedNotificationForModal(notif);
                                setShowNotificationModal(true);
                                setShowNotificationsMenu(false); // Close dropdown menu
                                speakText(`${notif.title}. Clique para responder.`);
                              }}
                              className={`p-2.5 rounded-xl border text-left cursor-pointer transition-colors ${
                                notif.read 
                                  ? 'bg-slate-50 border-slate-100 text-slate-600' 
                                  : 'bg-amber-50/55 border-amber-200 text-slate-900'
                              }`}
                            >
                              <p className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                                {!notif.read && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0"></span>}
                                {notif.title}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* If Admin view, show simple exit button */}
            {role === 'admin' && (
              <button
                onClick={() => {
                  setRole('client');
                  speakText("Vista do cliente ativada.");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-black text-[11px] rounded-xl transition-all cursor-pointer shadow-sm border border-amber-500"
                title="Voltar para a vista do cliente"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sair da Gestão</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* SIDEBAR OVERLAY SLIDE-OUT PANEL */}
      {role === 'client' && sidebarOpen && (
        <div className="fixed inset-0 z-50 flex overflow-hidden" id="app-drawer-sidebar shadow-xl">
          {/* Backdrop */}
          <div 
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-350"
          ></div>

          {/* Drawer content */}
          <div className="relative w-full max-w-sm bg-white text-slate-900 flex flex-col h-full shadow-2xl z-10 border-r border-slate-200">
            {/* Header Drawer */}
            <div className="p-4 bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-6 h-6 text-amber-400" />
                <span className="font-display font-bold tracking-tight text-lg">Menu Cabinda</span>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Quick Profile info */}
            <div className="p-4 border-b bg-slate-55 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-sm shrink-0">
                {clients.find(c => c.id === activeClientId)?.name.substring(0, 2).toUpperCase() || 'MC'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cliente Ativo</p>
                <p className="text-xs font-bold text-slate-800 truncate">{clients.find(c => c.id === activeClientId)?.name || 'Carregando'}</p>
              </div>
            </div>

            {/* Navigator items (Requirement 2 Sidebar separation) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* Primary Fast CTA: Fazer Pedido */}
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-2">Ação Principal</p>
                <button
                  onClick={() => {
                    setCurrentView('fazer-pedido');
                    setSidebarOpen(false);
                    speakText("Abrir formulário de Fazer Pedido.");
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-left text-xs font-black transition-all border border-amber-500 hover:scale-[1.01] active:scale-[0.99] shadow-sm cursor-pointer ${
                    currentView === 'fazer-pedido'
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-amber-350 text-slate-950 hover:bg-amber-400'
                  }`}
                  id="sidebar-cta-fazer-pedido"
                >
                  <div className="flex items-center gap-2.5">
                    <PlusCircle className="w-5 h-5 shrink-0 text-slate-950" />
                    <span>FAZER PEDIDO NOVO</span>
                  </div>
                  <span className="text-[10px] bg-slate-950 text-amber-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">CTA</span>
                </button>
              </div>

              {/* General Navigation */}
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1">Navegação</p>
                
                {/* Inicio */}
                <button
                  onClick={() => {
                    setCurrentView('inicio');
                    setSidebarOpen(false);
                    speakText("Ir para página principal");
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                    currentView === 'inicio'
                      ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                  }`}
                >
                  <Truck className="w-4.5 h-4.5 shrink-0" />
                  <span>Página Inicial</span>
                </button>

                {/* Mercado de Fornecedores */}
                <button
                  onClick={() => {
                    setCurrentView('mercado-fornecedores');
                    setSidebarOpen(false);
                    speakText("Abrir mercado de fornecedores homologados");
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                    currentView === 'mercado-fornecedores'
                      ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                  }`}
                  id="nav-mercado-fornecedores"
                >
                  <Building className="w-4.5 h-4.5 shrink-0 text-amber-500" />
                  <span>Mercado de Fornecedores</span>
                  <span className="ml-auto text-[8px] bg-red-500 text-white font-black px-1 py-0.5 rounded-sm uppercase tracking-wider animate-pulse">NOVO</span>
                </button>

                {/* Acompanhar Pedido */}
                <button
                  onClick={() => {
                    setCurrentView('acompanhar-pedido');
                    setSidebarOpen(false);
                    speakText("Ver estado das mercadorias");
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                    currentView === 'acompanhar-pedido'
                      ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                  }`}
                >
                  <ShoppingBag className="w-4.5 h-4.5 shrink-0" />
                  <span>Acompanhar Entrega</span>
                </button>

                {/* Histórico */}
                <button
                  onClick={() => {
                    setCurrentView('historico');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                    currentView === 'historico'
                      ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                  }`}
                >
                  <List className="w-4.5 h-4.5 shrink-0" />
                  <span>Histórico de Compras</span>
                </button>

                {/* Mensagens */}
                <button
                  onClick={() => {
                    localStorage.removeItem('mediador_active_channel');
                    setCurrentView('mensagens');
                    setSidebarOpen(false);
                    speakText("Ir para Central de Mensagens.");
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                    currentView === 'mensagens'
                      ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                  }`}
                  id="nav-mensagens-btn"
                >
                  <MessageSquare className="w-4.5 h-4.5 shrink-0 text-sky-600" />
                  <span>Mensagens</span>
                  {(() => {
                    const myOrderIds = orders.filter(o => o.clientId === activeClientId).map(o => o.id);
                    const count = messages.filter(m => 
                      !m.read && 
                      m.sender === 'admin' && 
                      (m.orderId === `general-${activeClientId}` || myOrderIds.includes(m.orderId))
                    ).length;
                    return count > 0 ? (
                      <span className="ml-auto bg-green-600 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                        {count}
                      </span>
                    ) : null;
                  })()}
                </button>

                {/* Notificações */}
                <button
                  onClick={() => {
                    setCurrentView('notificacoes');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                    currentView === 'notificacoes'
                      ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                  }`}
                >
                  <Bell className="w-4.5 h-4.5 shrink-0" />
                  <span>Notificações</span>
                  {notifications.filter(n => n.clientId === activeClientId && !n.read).length > 0 && (
                    <span className="ml-auto bg-red-650 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                      {notifications.filter(n => n.clientId === activeClientId && !n.read).length}
                    </span>
                  )}
                </button>

                {/* Minha Conta */}
                <button
                  onClick={() => {
                    setCurrentView('minha-conta');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                    currentView === 'minha-conta'
                      ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                  }`}
                >
                  <User className="w-4.5 h-4.5 shrink-0" />
                  <span>Minha Conta</span>
                </button>
              </div>

              {/* Account Management Settings */}
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1">Gestão de Conta</p>
                
                {/* Cadastro */}
                <button
                  onClick={() => {
                    setCurrentView('cadastro');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                    currentView === 'cadastro'
                      ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                  }`}
                >
                  <User className="w-4.5 h-4.5 shrink-0" />
                  <span>Criar Novo Cadastro</span>
                </button>

                {/* Entrar */}
                <button
                  onClick={() => {
                    setCurrentView('entrar');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                    currentView === 'entrar'
                      ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                  }`}
                >
                  <Building className="w-4.5 h-4.5 shrink-0" />
                  <span>Trocar Utilizador</span>
                </button>

                {/* Pagamentos */}
                <button
                  onClick={() => {
                    setCurrentView('pagamentos');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                    currentView === 'pagamentos'
                      ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                  }`}
                >
                  <CreditCard className="w-4.5 h-4.5 shrink-0" />
                  <span>Finanças & Faturas</span>
                </button>

                {/* Configurações */}
                <button
                  onClick={() => {
                    setCurrentView('configuracoes');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                    currentView === 'configuracoes'
                      ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                  }`}
                >
                  <Settings className="w-4.5 h-4.5 shrink-0" />
                  <span>Preferências</span>
                </button>
              </div>

              {/* COLLAPSIBLE SUPPORT SECTION */}
              <div className="border border-slate-100 rounded-2xl bg-slate-50 overflow-hidden">
                <button
                  onClick={() => {
                    setSupportExpanded(!supportExpanded);
                    speakText(supportExpanded ? "Secção suporte fechada" : "Secção suporte aberta");
                  }}
                  type="button"
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-100 font-black text-xs text-slate-705 hover:bg-slate-150 transition-all cursor-pointer"
                  id="collapsible-support-header"
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-500" />
                    <span>SUPORTE & INSTITUCIONAL</span>
                  </div>
                  <span className="text-[10px] transition-transform duration-200" style={{ transform: supportExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    ▼
                  </span>
                </button>

                {supportExpanded && (
                  <div className="p-3 space-y-2 border-t border-slate-100 animate-slide-down bg-white">
                    <button
                      onClick={() => { setCurrentView('mensagens'); setSidebarOpen(false); }}
                      className="w-full text-left pl-6 py-1.5 text-xs text-slate-600 font-extrabold hover:text-slate-900 block cursor-pointer"
                    >
                      • Central de Mensagens (Chat)
                    </button>
                    <button
                      onClick={() => { setCurrentView('reclamacoes'); setSidebarOpen(false); }}
                      className="w-full text-left pl-6 py-1.5 text-xs text-slate-600 font-extrabold hover:text-slate-900 block cursor-pointer"
                    >
                      • Livro de Reclamações
                    </button>
                    <button
                      onClick={() => { setCurrentView('sobre-nos'); setSidebarOpen(false); }}
                      className="w-full text-left pl-6 py-1.5 text-xs text-slate-600 font-extrabold hover:text-slate-900 block cursor-pointer"
                    >
                      • Quem Somos
                    </button>
                    <button
                      onClick={() => { setCurrentView('termos-uso'); setSidebarOpen(false); }}
                      className="w-full text-left pl-6 py-1.5 text-xs text-slate-600 font-extrabold hover:text-slate-900 block cursor-pointer"
                    >
                      • Termos de Licenciamento
                    </button>

                    {/* Official Contactos info inside the Support toggle (Requirement 2) */}
                    <div className="mt-3 pt-3 border-t border-slate-100 pl-2 text-[10px] text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <p className="font-extrabold uppercase tracking-wider text-slate-700 text-[9px]">📍 Contactos Oficiais</p>
                      <p><strong>Cabinda:</strong> Porto Comercial, Pavilhão C-4</p>
                      <p><strong>Luanda:</strong> Maculusso, Rua da Missão nº 12</p>
                      <p><strong>📞 Linha Fone:</strong> +244 945 000 111</p>
                    </div>
                  </div>
                )}
              </div>

              {/* ACESSIBILIDADE E DESIGN INCLUSIVO */}
              <div className="border border-slate-200 rounded-2xl bg-slate-50 overflow-hidden">
                <div className="bg-slate-100 px-4 py-2.5 text-[10px] font-black text-slate-700 tracking-wider flex items-center gap-1.5">
                  <span>♿</span> ACESSIBILIDADE & DESIGN
                </div>
                <div className="p-3 space-y-3 bg-white">
                  
                  {/* Voz Automática */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">Leitura de Ecrã (Voz):</span>
                    <button
                      onClick={() => {
                        setTextToSpeech(!textToSpeech);
                        speakText(textToSpeech ? "Leitura de ecrã desativada." : "Leitura automática de ecrã ativada.");
                      }}
                      className={`px-2 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        textToSpeech 
                          ? 'bg-amber-400 border-amber-500 text-slate-950' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                      }`}
                    >
                      {textToSpeech ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                      <span>{textToSpeech ? "Voz Ativa" : "Voz Inativa"}</span>
                    </button>
                  </div>

                  {/* Alto Contraste */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="font-semibold text-slate-600">Alto Contraste:</span>
                    <button
                      onClick={() => {
                        setHighContrast(!highContrast);
                        speakText(highContrast ? "Contraste padrão redefinido" : "Alto contraste ativado para melhor legibilidade.");
                      }}
                      className={`px-2 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                        highContrast 
                          ? 'bg-yellow-400 border-yellow-500 text-black shadow-xs' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                      }`}
                    >
                      🌓 {highContrast ? 'Ativado' : 'Desativado'}
                    </button>
                  </div>

                  {/* Tamanho da Letra */}
                  <div className="flex flex-col gap-1 pt-2 border-t border-slate-100 text-xs">
                    <span className="font-semibold text-slate-600">Tamanho da Letra:</span>
                    <select
                      value={fontSize}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setFontSize(val);
                        speakText(`Tamanho da letra ajustado para ${val === 'normal' ? 'normal' : val === 'grande' ? 'grande' : 'muito grande'}.`);
                      }}
                      className="w-full bg-slate-50 text-slate-800 text-[11px] font-bold rounded-lg border border-slate-200 px-2 py-1.5 outline-hidden"
                    >
                      <option value="normal">Letras Normais</option>
                      <option value="grande">Letras Grandes</option>
                      <option value="extra-grande">Letras Muito Grandes</option>
                    </select>
                  </div>

                  {/* Comando de Voz Inteligente */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="font-semibold text-slate-600">Comando de Voz:</span>
                    <button
                      onClick={() => {
                        setSidebarOpen(false);
                        handleMicrophoneClick();
                      }}
                      className={`px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        voiceQueryActive ? 'animate-pulse bg-red-600 hover:bg-red-700' : ''
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>Falar Comando</span>
                    </button>
                  </div>

                </div>
              </div>

              {/* ÁREA DE TESTE & PROGRAMADOR (PARA HOMOLOGAÇÃO DO APK) */}
              <div className="border border-red-200 rounded-2xl bg-red-50/40 overflow-hidden">
                <div className="bg-red-50 px-4 py-2 text-[10px] font-black text-red-800 tracking-wider flex items-center gap-1">
                  <span>🛠️</span> ADMINISTRAÇÃO & TESTES
                </div>
                <div className="p-3 space-y-3 bg-white">
                  
                  {/* Alternador de Vista (Role Toggle) */}
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Mudar Vista do Aplicativo</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => {
                          setRole('client');
                          speakText("Vista do cliente ativada.");
                          setSidebarOpen(false);
                        }}
                        className={`px-2 py-1.5 rounded-xl text-[10px] font-bold transition-all text-center cursor-pointer ${
                          role === 'client'
                            ? 'bg-amber-400 text-slate-950 shadow-xs border border-amber-500 font-black'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 font-semibold'
                        }`}
                      >
                        Vista Cliente
                      </button>
                      <button
                        onClick={() => {
                          setRole('admin');
                          speakText("Painel de gestão administrativa ativado.");
                          setSidebarOpen(false);
                        }}
                        className={`px-2 py-1.5 rounded-xl text-[10px] font-bold transition-all text-center cursor-pointer ${
                          role === 'admin'
                            ? 'bg-amber-400 text-slate-950 shadow-xs border border-amber-500 font-black'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 font-semibold'
                        }`}
                      >
                        Painel Gestão
                      </button>
                    </div>
                  </div>

                  {/* Reiniciar Simulador */}
                  <div className="space-y-1 pt-1.5 border-t border-slate-100">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex justify-between">
                      <span>Memória Local</span>
                      <span className="text-red-500">Limpeza total</span>
                    </p>
                    <button
                      onClick={() => {
                        handleResetSimulator();
                        setSidebarOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-600/10 hover:bg-red-600/15 text-red-600 rounded-xl text-[10px] font-bold transition-all border border-red-200 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reiniciar Simulador (Seta)</span>
                    </button>
                  </div>

                  {/* Termos e Alertas */}
                  <div className="pt-1.5 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowTermsModal(true);
                        setSidebarOpen(false);
                        speakText("Abrindo informações aduaneiras e termos de uso.");
                      }}
                      className="w-full flex items-center justify-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                    >
                      <span>⚠️ Ver Termos e Avisos</span>
                    </button>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* SPEECH AND VOICE COMMAND SIMULATOR OVERLAY PANEL */}
      {voiceQueryActive && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full bg-slate-950 text-white p-4 rounded-3xl shadow-2xl border border-white/10" id="voice-recognition-box">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
            <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Mic className="w-4 h-4 animate-ping" />
              Serralheiro de Voz Inteligente
            </h4>
            <button onClick={() => { setVoiceQueryActive(false); setVoiceMessage(''); }} className="text-xs text-slate-400 hover:text-white">✕ Fechar</button>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">{voiceMessage || 'Esperando comando por voz em português de Angola...'}</p>
          
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block">Simular comandos via Clique:</p>
            <div className="grid grid-cols-2 gap-1.5">
              <button 
                onClick={() => triggerVoiceCommandSimulation('ir para inicio')}
                className="p-1 px-2 text-left bg-white/5 hover:bg-white/10 rounded-lg text-[10px] truncate"
              >
                👉 "Ir para Início"
              </button>
              <button 
                onClick={() => triggerVoiceCommandSimulation('fazer pedido')}
                className="p-1 px-2 text-left bg-white/5 hover:bg-white/10 rounded-lg text-[10px] truncate"
              >
                👉 "Fazer Pedido"
              </button>
              <button 
                onClick={() => triggerVoiceCommandSimulation('rastrear pedido')}
                className="p-1 px-2 text-left bg-white/5 hover:bg-white/10 rounded-lg text-[10px] truncate"
              >
                👉 "Acompanhar"
              </button>
              <button 
                onClick={() => triggerVoiceCommandSimulation('ligar suporte')}
                className="p-1 px-2 text-left bg-white/5 hover:bg-white/10 rounded-lg text-[10px] truncate"
              >
                👉 "Ligar Suporte"
              </button>
              <button 
                onClick={() => triggerVoiceCommandSimulation('mudar contraste')}
                className="p-1 px-2 text-left bg-white/5 hover:bg-white/10 rounded-lg text-[10px] truncate"
              >
                👉 "Mudar Contraste"
              </button>
              <button 
                onClick={() => triggerVoiceCommandSimulation('letras grande')}
                className="p-1 px-2 text-left bg-white/5 hover:bg-white/10 rounded-lg text-[10px] truncate"
              >
                👉 "Aumentar Letras"
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CORE FRAME FOR RESPONSIVE PREVIEW CHANGER */}
      <div className="flex-1 w-full bg-slate-100 flex items-center justify-center p-3 sm:p-5">
        
        <div className={`w-full transition-all duration-350 bg-slate-100 flex flex-col h-full
          ${simulatedDevice === 'smartphone' 
            ? 'max-w-[390px] h-[844px] overflow-y-auto border-[10px] border-slate-900 rounded-[44px] shadow-2xl relative bg-white my-4 scrollbar-thin' 
            : simulatedDevice === 'tablet'
              ? 'max-w-[768px] h-[1024px] overflow-y-auto border-[8px] border-slate-800 rounded-[32px] shadow-2xl relative bg-white my-4 scrollbar-thin'
              : 'max-w-7xl mx-auto h-auto'
          }`}
          id="simulated-device-container"
        >
          {/* MOCK PHONE/TABLET TOP NOTCH BAR ENVIRONMENT */}
          {(simulatedDevice === 'smartphone' || simulatedDevice === 'tablet') && (
            <div className="bg-slate-900 text-white text-[10px] px-6 py-1.5 flex justify-between items-center select-none sticky top-0 z-40 shrink-0">
              <span className="font-bold">09:06 🕒</span>
              <div className="w-16 h-3.5 bg-black rounded-full shrink-0 mx-2 flex items-center justify-center">
                <span className="text-[7p] text-slate-600 block">•••</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <span>3G/4G</span>
                <span>📶</span>
                <span>🔋 98%</span>
              </div>
            </div>
          )}

          {/* MAIN PAGE CONTAINER */}
          <main className={`flex-1 p-3 sm:p-5 lg:p-7 ${simulatedDevice !== 'desktop' ? 'h-full overflow-y-auto pb-10' : ''}`}>
            
            {role === 'client' ? (
              <ClientDashboard
                clients={clients}
                activeClientId={activeClientId}
                onSetClient={handleSetClient}
                onAddClient={handleAddClient}
                orders={orders}
                onAddOrder={handleAddOrder}
                onUpdateOrder={handleUpdateOrder}
                messages={messages}
                onSendMessage={handleSendMessage}
                onMarkChannelAsRead={handleMarkChannelAsRead}
                notifications={notifications}
                onMarkNotificationRead={handleMarkNotificationRead}
                currentView={currentView}
                setCurrentView={setCurrentView}
                fontSize={fontSize}
                setFontSize={setFontSize}
                highContrast={highContrast}
                setHighContrast={setHighContrast}
                textToSpeech={textToSpeech}
                setTextToSpeech={setTextToSpeech}
                homeSearchQuery={homeSearchQuery}
                setHomeSearchQuery={setHomeSearchQuery}
                carriersList={carriersList}
                suppliers={suppliers}
                onUpdateSupplier={handleUpdateSupplier}
                supplierProducts={supplierProducts}
                onUpdateSupplierProduct={handleUpdateSupplierProduct}
                onCreateSupplierProduct={handleCreateSupplierProduct}
                supplierMessages={supplierMessages}
                onSendSupplierMessage={handleSendSupplierMessage}
                collaborators={collaborators}
                onUpdateCollaborators={handleUpdateCollaborators}
                collaboratorSales={collaboratorSales}
                onUpdateCollaboratorSales={handleUpdateCollaboratorSales}
              />
            ) : (
              <AdminDashboard
                clients={clients}
                orders={orders}
                onUpdateOrder={handleUpdateOrder}
                messages={messages}
                onSendMessage={handleSendMessage}
                onMarkChannelAsRead={handleMarkChannelAsRead}
                notifications={notifications}
                onAddNotification={handleAddNotification}
                carriersList={carriersList}
                onAddCarrier={handleAddCarrier}
                suppliers={suppliers}
                onUpdateSupplier={handleUpdateSupplier}
                onCreateSupplier={handleCreateSupplier}
                supplierProducts={supplierProducts}
                onUpdateSupplierProduct={handleUpdateSupplierProduct}
                onCreateSupplierProduct={handleCreateSupplierProduct}
                supplierMessages={supplierMessages}
                onSendSupplierMessage={handleSendSupplierMessage}
                collaborators={collaborators}
                onUpdateCollaborators={handleUpdateCollaborators}
                collaboratorSales={collaboratorSales}
                onUpdateCollaboratorSales={handleUpdateCollaboratorSales}
              />
            )}
          </main>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 Mediador Cabinda Lda. Registada sob as Leis Aduaneiras de Angola.</p>
          <div className="flex gap-4">
            <button onClick={() => { setCurrentView('termos-uso'); speakText("Abrindo Termos de Uso"); }} className="hover:text-slate-600 cursor-pointer text-xs font-semibold">Termos de Uso</button>
            <span className="text-slate-200">|</span>
            <button onClick={() => { setCurrentView('sobre-nos'); speakText("Abrindo Sobre nós"); }} className="hover:text-slate-600 cursor-pointer text-xs font-semibold">Políticas de Intermediação</button>
            <span className="text-slate-200">|</span>
            <button onClick={() => { setCurrentView('suporte'); speakText("Abrindo Suporte"); }} className="hover:text-slate-600 cursor-pointer text-xs font-semibold">Suporte Central Angola</button>
          </div>
        </div>
      </footer>

      {/* Terms of Service & Simulation Info Modal Dialog (Header Alarm Modal - Requirement 1) */}
      {showTermsModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs" id="terms-modal-overlay">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-scale-up" id="terms-modal-card">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <h3 className="text-sm font-black uppercase tracking-wider text-amber-300">Termos & Aviso Aduaneiro</h3>
              </div>
              <button 
                onClick={() => {
                  setShowTermsModal(false);
                  speakText("Modal fechada.");
                }} 
                className="p-1 px-2.5 rounded-lg text-xs bg-white/10 hover:bg-white/20 text-white font-bold cursor-pointer transition-all"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs text-slate-700 leading-relaxed overflow-y-auto max-h-[400px]">
              <p className="font-bold text-slate-900 border-b pb-2 text-sm">💡 Políticas de Intermediação Comercial e Fiscal:</p>
              <p>
                O <strong>Mediador Cabinda</strong> opera como canal oficial de intermediação comercial e fiscal. Os preços consultados contemplam a aquisição na praça de Luanda, embalamento, despacho de exportação e frete marítimo de cabotagem ou transporte aéreo (TAAG) porto/aeroporto para a Província de Cabinda.
              </p>
              <p>
                <strong>Impostos & Desalfandegamento:</strong> O valor dos orçamentos calculados já incorpora a taxa aduaneira vigente de Angola (até 15% sobre a fatura original do fornecedor) e os emolumentos portuários regulamentares na Administração Geral Tributária (AGT).
              </p>
              <p>
                <strong>Regulamentação:</strong> Ao utilizar o simulador do Mediador Cabinda Lda., o utilizador confirma possuir residência ou atividade económica válida na província e aceita a submissão de NIF regularizado eletronicamente.
              </p>
            </div>
            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button 
                onClick={() => {
                  setShowTermsModal(false);
                  speakText("Acordo aceito.");
                }} 
                className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-all active:scale-95 shadow-sm"
              >
                Compreendi e Aceito
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL NOTIFICATION DETAILS AND REPLY MODAL */}
      {showNotificationModal && selectedNotificationForModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in" id="global-notification-detail-modal">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden text-slate-800">
            <div className="p-4 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-900">
                <span>🔔</span>
                <h4 className="font-extrabold text-xs uppercase tracking-wider font-display font-black">Aviso do Mediador</h4>
              </div>
              <button 
                onClick={() => {
                  setShowNotificationModal(false);
                  setSelectedNotificationForModal(null);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <h3 className="font-black text-sm text-slate-900 leading-snug">{selectedNotificationForModal.title}</h3>
                <p className="text-[10px] text-slate-400 font-medium font-mono">Enviado: {new Date(selectedNotificationForModal.createdAt).toLocaleString('pt-AO')}</p>
              </div>
              
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-semibold leading-relaxed text-slate-755 whitespace-pre-line">
                {selectedNotificationForModal.message}
              </div>

              {selectedNotificationForModal.orderId && (
                <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 flex items-center justify-between gap-2 text-[11px]">
                  <span className="font-extrabold text-sky-900">Esta notificação refere-se ao Pedido #{selectedNotificationForModal.orderId}</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowNotificationModal(false);
                  setSelectedNotificationForModal(null);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNotificationModal(false);
                  setSelectedNotificationForModal(null);
                  localStorage.setItem('mediador_active_channel', 'general');
                  setCurrentView('mensagens');
                  speakText("Chat de Atendimento Directo Aberto. Pode escrever a sua resposta ao Diretor Geral.");
                }}
                className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>💬</span> Responder ao Diretor Geral
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
