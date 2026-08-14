/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Client, 
  Order, 
  Message, 
  Notification, 
  CarrierCompany, 
  Supplier, 
  SupplierProduct, 
  SupplierMessage, 
  Collaborator, 
  CollaboratorSale, 
  SupplierService, 
  ServiceRequest, 
  BotSettings,
  GeneralLogisticsSettings,
  DynamicKnowledgeItem,
  AuditLogEntry
} from './types';
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
  saveSupplierMessages,
  safeLocalStorageSetItem,
  getSupplierServices,
  saveSupplierServices,
  getServiceRequests,
  saveServiceRequests,
  PROVINCES_OF_ANGOLA,
  MUNICIPALITIES,
  MASTER_ADMIN_CREDENTIALS
} from './data/mockData';
import {
  getStoredLogisticsConfig,
  getStoredKnowledgeBase,
  getStoredAuditLogs,
  addAuditLogEntry,
  INITIAL_DYNAMIC_KNOWLEDGE_BASE
} from './utils/aiBotKnowledge';
import ClientDashboard from './components/ClientDashboard';
import AdminDashboard from './components/AdminDashboard';
import AiChatbotModal from './components/AiChatbotModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { fetchServerState, syncOrderToServer, syncClientToServer, syncMessageToServer, syncBulkToServer } from './services/syncService';
// @ts-ignore
import appLogoImg from './assets/images/mediador_cabinda_logo_1783098275536.jpg';
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
  MessageSquare,
  Bot,
  Sparkles,
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  LogOut,
  Phone,
  PhoneCall,
  Mail,
  MapPin,
  ShieldAlert,
  Fingerprint
} from 'lucide-react';

export default function App() {
  const [appLoading, setAppLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadingStatus, setLoadingStatus] = useState<string>('Inicializando o sistema...');

  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedAuth = localStorage.getItem('mediador_cabinda_is_authorized');
      return savedAuth === 'true';
    }
    return false;
  });
  const [accessCode, setAccessCode] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mediador_cabinda_saved_access_code') || '';
    }
    return '';
  });
  const [rememberCode, setRememberCode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mediador_cabinda_remember_code') === 'true';
    }
    return false;
  });
  const [authError, setAuthError] = useState<string>('');

  // Track if current session is authenticated as an administrator/collaborator
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mediador_cabinda_is_admin_logged_in') === 'true';
    }
    return false;
  });

  const [adminUserDisplayName, setAdminUserDisplayName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mediador_cabinda_admin_display_name') || 'Direção Geral - Mediador Cabinda';
    }
    return 'Direção Geral - Mediador Cabinda';
  });

  // Authentication & Account Creation Portal states (Simplified 2-tab portal: Login / Signup)
  const [authPortalTab, setAuthPortalTab] = useState<'login' | 'signup'>('login');
  
  // Registration form states (Free-text for all provinces and municipalities)
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regProvince, setRegProvince] = useState('');
  const [regMunicipality, setRegMunicipality] = useState('');
  const [regBairro, setRegBairro] = useState('');
  const [regNif, setRegNif] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Unified login form states (detects client or admin automatically)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Role and dynamic session state
  const [role, setRole] = useState<'client' | 'admin'>('client');
  const [clients, setClients] = useState<Client[]>(() => getClients());
  const [activeClientId, setActiveClientId] = useState<string>(() => getCurrentClientId());
  const [orders, setOrders] = useState<Order[]>(() => getOrders());
  const [messages, setMessages] = useState<Message[]>(() => getMessages());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [carriersList, setCarriersList] = useState<CarrierCompany[]>([]);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Suppliers state
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => getSuppliers());
  const [supplierProducts, setSupplierProducts] = useState<SupplierProduct[]>(() => getSupplierProducts());
  const [supplierServices, setSupplierServices] = useState<SupplierService[]>(() => getSupplierServices());
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(() => getServiceRequests());
  const [supplierMessages, setSupplierMessages] = useState<SupplierMessage[]>(() => getSupplierMessages());

  // Collaborators & sales state (synchronised across panels)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [collaboratorSales, setCollaboratorSales] = useState<CollaboratorSale[]>([]);

  // Modular routing active views for client
  const [currentView, setCurrentView] = useState<'inicio' | 'fazer-pedido' | 'acompanhar-pedido' | 'cadastro' | 'entrar' | 'minha-conta' | 'historico' | 'pagamentos' | 'notificacoes' | 'suporte' | 'reclamacoes' | 'configuracoes' | 'sobre-nos' | 'termos-uso' | 'mercado-fornecedores' | 'mensagens' | 'parceria' | 'guia-ajuda' | 'solicitar-servico'>('inicio');
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

  // AI Chatbot 24/7 State
  const [showAiBotModal, setShowAiBotModal] = useState(false);
  const [showBotWelcomeBalloon, setShowBotWelcomeBalloon] = useState(true);
  const [botSettings, setBotSettings] = useState<BotSettings>(() => {
    try {
      const saved = localStorage.getItem('mediador_cabinda_bot_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      enabled: true,
      botName: 'Mano Mediador IA',
      welcomeMessage: 'Olá! Sou o Assistente Virtual 24/7 do Mediador Cabinda. Posso esclarecer qualquer dúvida sobre encomendas, prazos marítimos/aéreos, pagamentos por Multicaixa Express ou IBAN e rastreio de cargas.',
      offHoursMessage: 'Estamos no período noturno/fora de expediente, mas eu estou 100% online para ajudá-lo com respostas imediatas!',
      autoReplyInSharedChat: true,
      businessHoursStart: '08:00',
      businessHoursEnd: '18:00',
      allowWhatsAppEscalation: true,
      whatsAppNumber: '+244942043293'
    };
  });

  // Dynamic Logistics & Knowledge Base Live State (Synchronized between Admin and IA Chatbot 24/7)
  const [logisticsConfig, setLogisticsConfig] = useState<GeneralLogisticsSettings>(() => getStoredLogisticsConfig());
  const [knowledgeBase, setKnowledgeBase] = useState<DynamicKnowledgeItem[]>(() => getStoredKnowledgeBase());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => getStoredAuditLogs());

  const handleUpdateLogisticsConfig = (updated: GeneralLogisticsSettings, notes?: string) => {
    setLogisticsConfig(updated);
    localStorage.setItem('mediador_cabinda_logistics_config', JSON.stringify(updated));
    const newLog = addAuditLogEntry({
      adminName: updated.updatedBy || 'João Hilário António (Administrador Geral)',
      adminRole: 'Super Administrador',
      actionType: 'logistica_update',
      section: 'Configurações de Logística',
      fieldName: 'Modais de Transporte e Prazos',
      previousValue: `Aéreo: ${logisticsConfig.modes.aereo.averageTime || logisticsConfig.modes.aereo.estimatedDays || ''}, Marítimo: ${logisticsConfig.modes.maritimo.averageTime || logisticsConfig.modes.maritimo.estimatedDays || ''}, Terrestre: ${logisticsConfig.modes.terrestre.averageTime || logisticsConfig.modes.terrestre.estimatedDays || ''}`,
      newValue: `Aéreo: ${updated.modes.aereo.averageTime || updated.modes.aereo.estimatedDays || ''}, Marítimo: ${updated.modes.maritimo.averageTime || updated.modes.maritimo.estimatedDays || ''}, Terrestre: ${updated.modes.terrestre.averageTime || updated.modes.terrestre.estimatedDays || ''}`,
      notes: notes || 'Atualização de modais e prazos operacionais'
    });
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleUpdateKnowledgeItem = (updated: DynamicKnowledgeItem) => {
    const previous = knowledgeBase.find(k => k.id === updated.id);
    const newKb = knowledgeBase.map(k => k.id === updated.id ? updated : k);
    setKnowledgeBase(newKb);
    localStorage.setItem('mediador_cabinda_knowledge_base', JSON.stringify(newKb));
    const newLog = addAuditLogEntry({
      adminName: updated.updatedBy || 'Administrador Geral',
      adminRole: 'Super Administrador',
      actionType: 'knowledge_edit',
      section: 'Base de Conhecimento Dinâmica',
      fieldName: updated.question,
      previousValue: previous?.detailedAnswer.slice(0, 80) || 'N/A',
      newValue: updated.detailedAnswer.slice(0, 80),
      notes: `Tópico atualizado (${updated.category})`
    });
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleCreateKnowledgeItem = (newItem: DynamicKnowledgeItem) => {
    const newKb = [newItem, ...knowledgeBase];
    setKnowledgeBase(newKb);
    localStorage.setItem('mediador_cabinda_knowledge_base', JSON.stringify(newKb));
    const newLog = addAuditLogEntry({
      adminName: newItem.updatedBy || 'Administrador Geral',
      adminRole: 'Super Administrador',
      actionType: 'knowledge_create',
      section: 'Base de Conhecimento Dinâmica',
      fieldName: newItem.question,
      previousValue: 'Inexistente',
      newValue: newItem.detailedAnswer.slice(0, 80),
      notes: `Novo tópico criado (${newItem.category})`
    });
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleDeleteKnowledgeItem = (id: string) => {
    const target = knowledgeBase.find(k => k.id === id);
    const newKb = knowledgeBase.filter(k => k.id !== id);
    setKnowledgeBase(newKb);
    localStorage.setItem('mediador_cabinda_knowledge_base', JSON.stringify(newKb));
    if (target) {
      const newLog = addAuditLogEntry({
        adminName: 'Administrador Geral',
        adminRole: 'Super Administrador',
        actionType: 'knowledge_delete',
        section: 'Base de Conhecimento Dinâmica',
        fieldName: target.question,
        previousValue: target.question,
        newValue: 'Eliminado',
        notes: `Tópico excluído da base (${target.category})`
      });
      setAuditLogs(prev => [newLog, ...prev]);
    }
  };

  const handleResetKnowledgeBaseToDefaults = () => {
    setKnowledgeBase(INITIAL_DYNAMIC_KNOWLEDGE_BASE);
    localStorage.setItem('mediador_cabinda_knowledge_base', JSON.stringify(INITIAL_DYNAMIC_KNOWLEDGE_BASE));
    const newLog = addAuditLogEntry({
      adminName: 'Super Administrador',
      adminRole: 'Super Administrador',
      actionType: 'knowledge_edit',
      section: 'Base de Conhecimento Dinâmica',
      fieldName: 'Base Completa',
      previousValue: 'Customizado',
      newValue: 'Padrão Oficial Mediador Cabinda Restaurado',
      notes: 'Restauração de tópicos padrão'
    });
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Search state for Home View
  const [homeSearchQuery, setHomeSearchQuery] = useState('');

  const authenticateCode = (code: string) => {
    const cleaned = code.trim().toLowerCase();
    if (!cleaned) return null;

    const masterPassLower = MASTER_ADMIN_CREDENTIALS.passphrase.toLowerCase();
    const isAdminMatch = 
      cleaned === 'admin99' || 
      cleaned === 'gestao' || 
      cleaned === 'gestão' || 
      cleaned === 'admin' ||
      cleaned === 'administrador' ||
      cleaned === 'direcao@mediadorcabinda.ao' ||
      cleaned === 'direcao@mediadorcabinda.org' ||
      cleaned === 'direcao@mediadorcabina.org' ||
      cleaned === 'direcao@mediadorcabina.ao' ||
      cleaned === 'gerencia@mediadorcabinda.ao' ||
      cleaned === 'admin@mediadorcabinda.ao' ||
      cleaned === 'equipemediadorcabindacabinda@gmail.com' ||
      cleaned === 'larrygabbana@gmail.com' ||
      cleaned.startsWith('direcao@') ||
      cleaned.startsWith('admin@') ||
      cleaned.startsWith('gestao@') ||
      cleaned.startsWith('gerencia@') ||
      cleaned === masterPassLower;

    if (isAdminMatch) {
      setRole('admin');
      setIsAdminLoggedIn(true);
      const displayName = cleaned.includes('@') ? `Direção Geral (${cleaned})` : 'Direção Geral - Mediador Cabinda';
      setAdminUserDisplayName(displayName);
      safeLocalStorageSetItem('mediador_cabinda_admin_display_name', displayName);
      return { role: 'admin', type: 'system' };
    }

    // Check collaborators / management
    const storedColabs = localStorage.getItem('mediador_cabinda_collaborators');
    let colabsList: Collaborator[] = [];
    try {
      colabsList = storedColabs ? JSON.parse(storedColabs) : [];
    } catch (err) {
      console.error("Error parsing collaborators:", err);
    }
    const matchedColab = colabsList.find(
      c => c.id.toLowerCase() === cleaned || c.email.toLowerCase() === cleaned
    );
    if (matchedColab) {
      setRole('admin');
      setIsAdminLoggedIn(true);
      setAdminUserDisplayName(matchedColab.name);
      safeLocalStorageSetItem('mediador_cabinda_admin_display_name', matchedColab.name);
      return { role: 'admin', type: 'collaborator', id: matchedColab.id };
    }

    const clientsList = getClients();
    const matchedClient = clientsList.find(
      c => c.id.toLowerCase() === cleaned || 
           c.email.toLowerCase() === cleaned ||
           c.phone.replace(/\D/g, '') === cleaned.replace(/\D/g, '') ||
           c.phone.toLowerCase().includes(cleaned)
    );
    if (matchedClient) {
      setRole('client');
      setIsAdminLoggedIn(false);
      setActiveClientId(matchedClient.id);
      saveCurrentClientId(matchedClient.id);
      return { role: 'client', type: 'client', id: matchedClient.id };
    }

    return null;
  };

  // Handler to register a brand new user account directly on the opening screen
  const handleRegisterClient = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!regName.trim()) {
      setAuthError('Por favor, informe o seu Nome Completo.');
      speakText('Por favor, informe o seu Nome Completo.');
      return;
    }
    if (!regPhone.trim()) {
      setAuthError('Por favor, informe o seu Telemóvel ou WhatsApp (Unitel/Movicel).');
      speakText('Por favor, informe o seu número de telemóvel ou WhatsApp.');
      return;
    }

    const newId = `cli-${Date.now()}`;
    const generatedEmail = regEmail.trim() || `${regPhone.replace(/\D/g, '') || 'cliente'}@mediadorcabinda.ao`;
    const finalProvince = regProvince.trim() || 'Cabinda';
    const finalMunicipality = regMunicipality.trim() || 'Cabinda';
    const fullAddress = regBairro.trim() 
      ? `${regBairro.trim()}, ${finalMunicipality}, ${finalProvince}`
      : `${finalMunicipality}, ${finalProvince}`;

    const newClient: Client = {
      id: newId,
      name: regName.trim(),
      phone: regPhone.trim(),
      email: generatedEmail,
      address: fullAddress,
      nif: regNif.trim() || `00${Math.floor(10000000 + Math.random() * 90000000)}CA01`,
      province: finalProvince,
      municipality: finalMunicipality,
      points: 100, // Welcome points
      tier: 'Standard'
    };

    const currentList = getClients();
    const updatedList = [...currentList, newClient];
    setClients(updatedList);
    saveClients(updatedList);
    syncClientToServer(newClient);
    setActiveClientId(newId);
    saveCurrentClientId(newId);
    setIsAdminLoggedIn(false);
    setRole('client');
    setIsAuthorized(true);
    setAuthError('');

    if (rememberCode) {
      safeLocalStorageSetItem('mediador_cabinda_is_authorized', 'true');
      safeLocalStorageSetItem('mediador_cabinda_saved_access_code', newClient.email);
      safeLocalStorageSetItem('mediador_cabinda_is_admin_logged_in', 'false');
      safeLocalStorageSetItem('mediador_cabinda_remember_code', 'true');
    }

    // Add welcome notification
    const welcomeNotif: Notification = {
      id: `notif-welcome-${Date.now()}`,
      clientId: newId,
      orderId: 'Geral',
      title: '🎉 Bem-vindo ao Mediador Cabinda!',
      message: `Olá, ${newClient.name}! A sua conta foi criada com sucesso. Já pode solicitar orçamentos, encomendar produtos em Luanda e receber com total segurança em Cabinda.`,
      read: false,
      createdAt: new Date().toISOString()
    };
    const updatedNotifs = [welcomeNotif, ...notifications];
    setNotifications(updatedNotifs);
    safeLocalStorageSetItem('mediador_cabinda_notifications', JSON.stringify(updatedNotifs));

    // Clear registration inputs
    setRegName('');
    setRegPhone('');
    setRegEmail('');
    setRegPassword('');
    setRegBairro('');
    setRegNif('');

    speakText(`Conta criada com sucesso! Seja bem-vindo, ${newClient.name}.`);
  };

  // Unified Login Handler: automatically detects Client or Administrator credentials
  const handleClientLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleaned = loginIdentifier.trim().toLowerCase();
    if (!cleaned) {
      setAuthError('Por favor, introduza o seu e-mail, número de telemóvel ou código de acesso.');
      speakText('Por favor, introduza o seu e-mail, telemóvel ou código.');
      return;
    }

    // 1. Check for Master Administrator access
    const masterPassClean = MASTER_ADMIN_CREDENTIALS.passphrase.trim();
    const isMasterPasswordEntered = loginPassword && (loginPassword.trim() === masterPassClean || loginPassword.trim() === 'admin99');
    const isMasterIdentifier = 
      cleaned === 'admin99' || 
      cleaned === 'gestao' || 
      cleaned === 'gestão' || 
      cleaned === 'admin' ||
      cleaned === 'administrador' ||
      cleaned === 'direcao@mediadorcabinda.ao' ||
      cleaned === 'direcao@mediadorcabinda.org' ||
      cleaned === 'direcao@mediadorcabina.org' ||
      cleaned === 'direcao@mediadorcabina.ao' ||
      cleaned === 'gerencia@mediadorcabinda.ao' ||
      cleaned === 'admin@mediadorcabinda.ao' ||
      cleaned === 'admin@mediadorcabinda.org' ||
      cleaned === 'equipemediadorcabindacabinda@gmail.com' ||
      cleaned === 'larrygabbana@gmail.com' ||
      cleaned.startsWith('direcao@') ||
      cleaned.startsWith('admin@') ||
      cleaned.startsWith('gestao@') ||
      cleaned.startsWith('gerencia@') ||
      cleaned === masterPassClean.toLowerCase();

    if (isMasterIdentifier || isMasterPasswordEntered) {
      setRole('admin');
      setIsAdminLoggedIn(true);
      setIsAuthorized(true);
      setAuthError('');
      const displayName = cleaned.includes('@') ? `Direção Geral (${cleaned})` : 'Direção Geral - Mediador Cabinda';
      setAdminUserDisplayName(displayName);
      safeLocalStorageSetItem('mediador_cabinda_admin_display_name', displayName);
      if (rememberCode) {
        safeLocalStorageSetItem('mediador_cabinda_is_authorized', 'true');
        safeLocalStorageSetItem('mediador_cabinda_saved_access_code', MASTER_ADMIN_CREDENTIALS.passphrase);
        safeLocalStorageSetItem('mediador_cabinda_is_admin_logged_in', 'true');
        safeLocalStorageSetItem('mediador_cabinda_remember_code', 'true');
      }
      speakText('Acesso de Administração autorizado com sucesso. Bem-vindo ao Painel de Gestão.');
      return;
    }

    // 2. Check for registered Collaborator / Staff access
    const storedColabs = localStorage.getItem('mediador_cabinda_collaborators');
    let colabsList: Collaborator[] = [];
    try {
      colabsList = storedColabs ? JSON.parse(storedColabs) : [];
    } catch {}
    const matchedColab = colabsList.find(
      c => c.id.toLowerCase() === cleaned || c.email.toLowerCase() === cleaned
    );
    if (matchedColab) {
      setRole('admin');
      setIsAdminLoggedIn(true);
      setIsAuthorized(true);
      setAuthError('');
      setAdminUserDisplayName(matchedColab.name);
      safeLocalStorageSetItem('mediador_cabinda_admin_display_name', matchedColab.name);
      if (rememberCode) {
        safeLocalStorageSetItem('mediador_cabinda_is_authorized', 'true');
        safeLocalStorageSetItem('mediador_cabinda_saved_access_code', matchedColab.id);
        safeLocalStorageSetItem('mediador_cabinda_is_admin_logged_in', 'true');
        safeLocalStorageSetItem('mediador_cabinda_remember_code', 'true');
      }
      speakText(`Acesso concedido para ${matchedColab.name}.`);
      return;
    }

    // 3. Check for registered Client account
    const clientsList = getClients();
    const matchedClient = clientsList.find(
      c => c.id.toLowerCase() === cleaned || 
           c.email.toLowerCase() === cleaned || 
           c.phone.replace(/\D/g, '') === cleaned.replace(/\D/g, '') ||
           c.phone.toLowerCase().includes(cleaned) ||
           c.name.toLowerCase().includes(cleaned)
    );

    if (matchedClient) {
      setRole('client');
      setIsAdminLoggedIn(false);
      setActiveClientId(matchedClient.id);
      saveCurrentClientId(matchedClient.id);
      setIsAuthorized(true);
      setAuthError('');
      if (rememberCode) {
        safeLocalStorageSetItem('mediador_cabinda_is_authorized', 'true');
        safeLocalStorageSetItem('mediador_cabinda_saved_access_code', matchedClient.email);
        safeLocalStorageSetItem('mediador_cabinda_is_admin_logged_in', 'false');
        safeLocalStorageSetItem('mediador_cabinda_remember_code', 'true');
      }
      speakText(`Sessão iniciada com sucesso. Bem-vindo de volta, ${matchedClient.name}.`);
      return;
    }

    setAuthError('Conta não encontrada. Verifique os dados ou crie uma conta na opção "Criar Conta".');
    speakText('Conta não encontrada. Verifique os dados ou crie uma nova conta.');
  };

  // Logout handler
  const handleLogout = () => {
    setIsAuthorized(false);
    setRole('client');
    setIsAdminLoggedIn(false);
    localStorage.removeItem('mediador_cabinda_is_authorized');
    localStorage.removeItem('mediador_cabinda_saved_access_code');
    localStorage.removeItem('mediador_cabinda_is_admin_logged_in');
    localStorage.removeItem('mediador_cabinda_remember_code');
    setSidebarOpen(false);
    setShowNotificationsMenu(false);
    setAuthError('');
    setAuthPortalTab('login');
    speakText('Sessão terminada. Retornou ao portal de entrada.');
  };

  const handleLogin = () => {
    if (authPortalTab === 'signup') {
      handleRegisterClient();
    } else {
      handleClientLogin();
    }
  };

  // Simulate app loading screen
  useEffect(() => {
    const statuses = [
      'Iniciando sistema de intermediação...',
      'Sincronizando rotas de Cabinda para Luanda...',
      'Carregando despachantes alfandegários oficiais...',
      'Analisando tarifas aduaneiras e fiscais (AGT)...',
      'Configurando canais seguros de WhatsApp...',
      'Carregando catálogo de fornecedores...',
      'Pronto para operações!'
    ];
    let currentStep = 0;
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setAppLoading(false);
          }, 450);
          return 100;
        }
        const nextProgress = prev + Math.floor(Math.random() * 15) + 6;
        const stepIndex = Math.min(Math.floor((nextProgress / 100) * statuses.length), statuses.length - 1);
        setLoadingStatus(statuses[stepIndex]);
        return Math.min(nextProgress, 100);
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Perform post-auth initialization or update
  useEffect(() => {
    if (isAuthorized && accessCode) {
      authenticateCode(accessCode);
    }
  }, [isAuthorized, accessCode]);

  // Initialize and load storage
  useEffect(() => {
    initializeStorage();
    setClients(getClients());
    setActiveClientId(getCurrentClientId());
    setOrders(getOrders());
    setMessages(getMessages());
    setSuppliers(getSuppliers());
    setSupplierProducts(getSupplierProducts());
    setSupplierServices(getSupplierServices());
    setServiceRequests(getServiceRequests());
    setSupplierMessages(getSupplierMessages());

    // Initialize notifications
    const storedNotifs = localStorage.getItem('mediador_cabinda_notifications');
    if (storedNotifs) {
      try {
        const parsed: Notification[] = JSON.parse(storedNotifs);
        const sanitized = parsed.filter(n => n.clientId !== 'cli-1' && n.clientId !== 'cli-2');
        setNotifications(sanitized);
      } catch (e) {
        console.error("Error parsing notifications:", e);
        setNotifications([]);
      }
    } else {
      setNotifications([]);
      safeLocalStorageSetItem('mediador_cabinda_notifications', JSON.stringify([]));
    }

    // Initialize list of carrier companies (empresas de despacho)
    const storedCarriers = localStorage.getItem('mediador_cabinda_carriers');
    if (storedCarriers) {
      try {
        setCarriersList(JSON.parse(storedCarriers));
      } catch (e) {
        console.error("Error parsing carriers:", e);
      }
    } else {
      setCarriersList(CARRIER_COMPANIES);
      safeLocalStorageSetItem('mediador_cabinda_carriers', JSON.stringify(CARRIER_COMPANIES));
    }

    // Initialize collaborators
    const storedColabs = localStorage.getItem('mediador_cabinda_collaborators');
    if (storedColabs) {
      try {
        setCollaborators(JSON.parse(storedColabs));
      } catch (e) {
        console.error("Error parsing collaborators:", e);
      }
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
      safeLocalStorageSetItem('mediador_cabinda_collaborators', JSON.stringify(initialColabs));
    }

    // Initialize collaborator sales
    const storedColabSales = localStorage.getItem('mediador_cabinda_collaborator_sales');
    if (storedColabSales) {
      try {
        setCollaboratorSales(JSON.parse(storedColabSales));
      } catch (e) {
        console.error("Error parsing collaborator sales:", e);
      }
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
      safeLocalStorageSetItem('mediador_cabinda_collaborator_sales', JSON.stringify(initialSales));
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

  // CROSS-DEVICE REAL-TIME SYNCHRONIZATION
  useEffect(() => {
    let isMounted = true;

    const performSync = async () => {
      try {
        const remote = await fetchServerState();
        if (!remote || !isMounted) return;

        // 1. Sync Orders across devices
        if (Array.isArray(remote.orders) && remote.orders.length > 0) {
          setOrders(prev => {
            const orderMap = new Map<string, Order>(prev.map(o => [o.id, o]));
            let changed = false;

            (remote.orders as Order[]).forEach(remOrd => {
              if (!remOrd || !remOrd.id) return;
              if (!orderMap.has(remOrd.id)) {
                changed = true;
                orderMap.set(remOrd.id, remOrd);
              } else {
                const cur = orderMap.get(remOrd.id)!;
                const curTime = cur.updatedAt || cur.createdAt || '';
                const remTime = remOrd.updatedAt || remOrd.createdAt || '';
                if (remTime > curTime || JSON.stringify(cur) !== JSON.stringify(remOrd)) {
                  changed = true;
                  orderMap.set(remOrd.id, { ...cur, ...remOrd });
                }
              }
            });

            if (changed) {
              const merged = Array.from(orderMap.values());
              saveOrders(merged);
              return merged;
            }
            return prev;
          });
        }

        // 2. Sync Clients across devices
        if (Array.isArray(remote.clients) && remote.clients.length > 0) {
          setClients(prev => {
            const clientMap = new Map<string, Client>(prev.map(c => [c.id, c]));
            let changed = false;
            (remote.clients as Client[]).forEach(remCli => {
              if (!remCli || !remCli.id) return;
              if (!clientMap.has(remCli.id)) {
                changed = true;
                clientMap.set(remCli.id, remCli);
              } else {
                const cur = clientMap.get(remCli.id)!;
                if (JSON.stringify(cur) !== JSON.stringify(remCli)) {
                  changed = true;
                  clientMap.set(remCli.id, { ...cur, ...remCli });
                }
              }
            });
            if (changed) {
              const merged = Array.from(clientMap.values());
              saveClients(merged);
              return merged;
            }
            return prev;
          });
        }

        // 3. Sync Messages across devices
        if (Array.isArray(remote.messages) && remote.messages.length > 0) {
          setMessages(prev => {
            const msgMap = new Map<string, Message>(prev.map(m => [m.id, m]));
            let changed = false;
            (remote.messages as Message[]).forEach(remMsg => {
              if (!remMsg || !remMsg.id) return;
              if (!msgMap.has(remMsg.id)) {
                changed = true;
                msgMap.set(remMsg.id, remMsg);
              }
            });
            if (changed) {
              const merged = Array.from(msgMap.values());
              saveMessages(merged);
              return merged;
            }
            return prev;
          });
        }

        // 4. Sync Service Requests
        if (Array.isArray(remote.serviceRequests) && remote.serviceRequests.length > 0) {
          setServiceRequests(prev => {
            const reqMap = new Map<string, ServiceRequest>(prev.map(r => [r.id, r]));
            let changed = false;
            (remote.serviceRequests as ServiceRequest[]).forEach(remReq => {
              if (!remReq || !remReq.id) return;
              if (!reqMap.has(remReq.id)) {
                changed = true;
                reqMap.set(remReq.id, remReq);
              }
            });
            if (changed) {
              const merged = Array.from(reqMap.values());
              saveServiceRequests(merged);
              return merged;
            }
            return prev;
          });
        }
      } catch (err) {
        // Silently handle offline/local deviations
      }
    };

    // Seed local data to server on startup
    const seedLocalToServer = async () => {
      try {
        const localOrders = getOrders();
        const localClients = getClients();
        const localMessages = getMessages();
        const localRequests = getServiceRequests();
        await syncBulkToServer({
          orders: localOrders,
          clients: localClients,
          messages: localMessages,
          serviceRequests: localRequests
        });
      } catch {}
    };

    seedLocalToServer().then(() => performSync());

    // Continuous real-time cross-device poll (every 3 seconds)
    const pollInterval = setInterval(performSync, 3000);

    // Sync immediately when user switches tabs or focuses phone screen
    const handleSyncFocus = () => performSync();
    window.addEventListener('focus', handleSyncFocus);
    window.addEventListener('visibilitychange', handleSyncFocus);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleSyncFocus);
      window.removeEventListener('visibilitychange', handleSyncFocus);
    };
  }, []);

  const handleUpdateOrder = (updatedOrder: Order) => {
    const updatedOrders = orders.map(ord => ord.id === updatedOrder.id ? updatedOrder : ord);
    setOrders(updatedOrders);
    saveOrders(updatedOrders);
    syncOrderToServer(updatedOrder);
  };

  const handleUpdateCollaborators = (newColabs: Collaborator[]) => {
    setCollaborators(newColabs);
    safeLocalStorageSetItem('mediador_cabinda_collaborators', JSON.stringify(newColabs));
    syncBulkToServer({ collaborators: newColabs });
  };

  const handleUpdateCollaboratorSales = (newSales: CollaboratorSale[]) => {
    setCollaboratorSales(newSales);
    safeLocalStorageSetItem('mediador_cabinda_collaborator_sales', JSON.stringify(newSales));
    syncBulkToServer({ collaboratorSales: newSales });
  };

  const handleAddCarrier = (newCarrier: CarrierCompany) => {
    const updated = [...carriersList, newCarrier];
    setCarriersList(updated);
    safeLocalStorageSetItem('mediador_cabinda_carriers', JSON.stringify(updated));
    speakText(`Nova empresa de despacho cadastrada: ${newCarrier.name}`);
  };

  const handleAddOrder = (newOrder: Order) => {
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    saveOrders(updatedOrders);
    syncOrderToServer(newOrder);

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
    safeLocalStorageSetItem('mediador_cabinda_notifications', JSON.stringify(updatedNotifs));
    syncBulkToServer({ notifications: updatedNotifs });
    speakText("Seu pedido foi recebido com sucesso no sistema. Aguarde a cotação comercial.");
  };

  const handleAddClient = (newClient: Client) => {
    const updatedClients = [...clients, newClient];
    setClients(updatedClients);
    saveClients(updatedClients);
    syncClientToServer(newClient);
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
    syncMessageToServer(newMsg);

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
        safeLocalStorageSetItem('mediador_cabinda_notifications', JSON.stringify(next));
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
        safeLocalStorageSetItem('mediador_cabinda_notifications', JSON.stringify(next));
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
    safeLocalStorageSetItem('mediador_cabinda_notifications', JSON.stringify(updatedNotifs));
  };

  const handleMarkNotificationRead = (id: string) => {
    const updatedNotifs = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updatedNotifs);
    safeLocalStorageSetItem('mediador_cabinda_notifications', JSON.stringify(updatedNotifs));
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

  const handleUpdateSupplierService = (updated: SupplierService) => {
    const next = supplierServices.map(s => s.id === updated.id ? updated : s);
    setSupplierServices(next);
    saveSupplierServices(next);
  };

  const handleCreateSupplierService = (newS: SupplierService) => {
    const next = [newS, ...supplierServices];
    setSupplierServices(next);
    saveSupplierServices(next);
  };

  const handleUpdateServiceRequest = (updated: ServiceRequest) => {
    const next = serviceRequests.map(r => r.id === updated.id ? updated : r);
    setServiceRequests(next);
    saveServiceRequests(next);
  };

  const handleCreateServiceRequest = (newR: ServiceRequest) => {
    const next = [newR, ...serviceRequests];
    setServiceRequests(next);
    saveServiceRequests(next);
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

  if (appLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white font-sans p-4 select-none relative overflow-hidden" id="app-splash-loader-screen">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-md w-full text-center space-y-8 relative z-10 animate-fade-in">
          {/* Main Logo Container */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative w-36 h-36 flex items-center justify-center bg-white p-2 rounded-[32px] shadow-2xl border border-white/25 overflow-hidden">
              <img 
                src={appLogoImg} 
                alt="Logo Mediador Cabinda" 
                className="w-full h-full object-contain rounded-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="space-y-1.5 mt-2">
              <h1 className="text-2xl font-black tracking-tight text-white font-display">
                Mediador Cabinda
              </h1>
              <p className="text-xs font-bold tracking-[0.25em] text-amber-400 uppercase">
                Unindo Angola
              </p>
            </div>
          </div>

          {/* Loading status progress container */}
          <div className="space-y-3 bg-slate-950/40 p-5 rounded-3xl border border-white/5 shadow-inner">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
              <span className="truncate max-w-[260px] text-amber-300">{loadingStatus}</span>
              <span className="font-mono text-white text-xs">{loadingProgress}%</span>
            </div>

            {/* Progress track */}
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 rounded-full transition-all duration-150 shadow-xs"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>

            <div className="text-[9px] text-slate-500 font-medium">
              Controle Aduaneiro e Intermediação Logística Luanda • Cabinda
            </div>
          </div>

          <div className="text-[10px] text-slate-600 font-bold">
            © 2026 Mediador Cabinda S.A. Todos os direitos reservados.
          </div>
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
      
      {/* ADMIN PREVIEW MODE STICKY TOP BANNER */}
      {isAdminLoggedIn && role === 'client' && isAuthorized && (
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white px-4 py-2 text-xs font-bold flex flex-wrap items-center justify-between gap-3 border-b-2 border-amber-400 sticky top-0 z-60 shadow-lg" id="admin-preview-top-banner">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping shrink-0"></span>
            <span className="text-amber-400 font-extrabold uppercase tracking-wider text-[11px]">
              Modo de Pré-visualização do Administrador
            </span>
            <span className="text-slate-300 hidden md:inline text-[11px] font-medium">
              • Você está a visualizar a Área do Cliente para testes operacionais.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setRole('admin');
                speakText("Retornando ao Painel de Gestão");
              }}
              className="px-3 py-1 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>➔ Voltar ao Painel de Gestão</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-600/25 hover:bg-red-600/40 text-red-300 border border-red-500/30 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
            >
              Sair
            </button>
          </div>
        </div>
      )}

      {/* PERSISTENT CONSOLIDATED 2-LEVEL HEADER */}
      <header className="bg-slate-950 text-white sticky top-0 z-50 shadow-md border-b border-white/5" id="app-main-header">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-row items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          
          {/* Logo and title combined on a single line */}
          <div className="flex items-center gap-3 shrink-0">
            {role === 'client' && isAuthorized && (
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
            {role === 'client' && isAuthorized && (
              <>
                {/* AI Chatbot quick trigger */}
                <button
                  onClick={() => {
                    setShowAiBotModal(true);
                    speakText("Assistente IA 24 horas aberto");
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-400/20 hover:bg-amber-400/30 active:scale-95 text-amber-300 font-extrabold text-[11px] rounded-xl transition-all cursor-pointer border border-amber-400/40 shadow-xs"
                  title="Abrir Assistente Virtual IA 24/7"
                  id="header-ai-bot-btn"
                >
                  <div className="relative">
                    <Bot className="w-3.5 h-3.5 text-amber-400" />
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                  </div>
                  <span className="hidden sm:inline">IA 24/7</span>
                </button>

                <div className="sm:relative">
                  {/* Integrated Profile Avatar holding Notification Badge */}
                  <button
                    onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
                    className="bg-transparent p-0 rounded-full hover:scale-102 active:scale-98 transition-all relative cursor-pointer flex items-center gap-1.5 focus:outline-2 focus:outline-blue-500"
                    id="notifications-profile-btn"
                    title="Notificações e Perfil"
                  >
                  <div className="w-9 h-9 rounded-full bg-amber-400 text-slate-950 border-2 border-slate-950 flex items-center justify-center font-extrabold text-xs shrink-0 shadow-sm relative overflow-hidden">
                    {(clients.find(c => c.id === activeClientId)?.name || 'MC').substring(0, 2).toUpperCase()}
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
                {/* Botão Sair / Trocar Conta */}
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-500/20"
                  title="Terminar Sessão / Trocar Conta"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

            {/* If Admin view, show simple exit button */}
            {role === 'admin' && isAuthorized && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setRole('client');
                    speakText("Vista do cliente ativada.");
                  }}
                  className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-[10px] rounded-xl transition-all cursor-pointer border border-white/10"
                  title="Mudar para a vista do cliente"
                >
                  <User className="w-3 h-3" />
                  <span>Ver Cliente</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-650/15 hover:bg-red-650/25 active:scale-95 text-red-400 font-bold text-[10px] rounded-xl transition-all cursor-pointer border border-red-500/15"
                  title="Terminar Sessão Completa"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sair</span>
                </button>
              </div>
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
                {(clients.find(c => c.id === activeClientId)?.name || 'MC').substring(0, 2).toUpperCase()}
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

              {/* 24/7 AI Chatbot Quick Help */}
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setShowAiBotModal(true);
                    setSidebarOpen(false);
                    speakText("Abrindo Assistente Virtual IA 24 horas");
                  }}
                  className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl text-left text-xs font-black transition-all bg-gradient-to-r from-amber-50 to-amber-100/90 text-slate-900 border border-amber-300 hover:bg-amber-100 hover:scale-[1.01] active:scale-[0.99] shadow-xs cursor-pointer"
                  id="sidebar-ai-bot-btn"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-2xs shrink-0">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block leading-tight font-extrabold">Assistente IA 24/7</span>
                      <span className="text-[9px] text-amber-900/80 font-medium">Tire dúvidas a qualquer hora</span>
                    </div>
                  </div>
                  <span className="text-[9px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                    Online
                  </span>
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

                {/* Sair da Conta (Logout) */}
                <button
                  onClick={() => {
                    setIsAuthorized(false);
                    localStorage.removeItem('mediador_cabinda_is_authorized');
                    localStorage.removeItem('mediador_cabinda_saved_access_code');
                    localStorage.removeItem('mediador_cabinda_remember_code');
                    setSidebarOpen(false);
                    speakText("Terminou sessão no aplicativo.");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-left text-xs font-bold transition-all text-red-650 hover:bg-red-50 cursor-pointer"
                >
                  <X className="w-4.5 h-4.5 shrink-0" />
                  <span>Terminar Sessão (Sair)</span>
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

                    {/* Official Contactos info inside the Support toggle */}
                    <div className="mt-3 pt-3 border-t border-slate-100 pl-2 text-[10px] text-slate-500 space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <p className="font-extrabold uppercase tracking-wider text-slate-700 text-[9px]">📍 Contactos Oficiais</p>
                      <p><strong>Direção Base:</strong> Cabinda</p>
                      <p><strong>Criador:</strong> João Hilário António</p>
                      <div className="pt-1 border-t border-slate-200/60 mt-1 space-y-1">
                        <p className="flex items-center gap-1">
                          <strong>📞 Unitel / Express:</strong>{' '}
                          <a href="tel:+244942043293" className="text-sky-600 hover:underline font-bold">
                            942 043 293
                          </a>
                        </p>
                        <p className="flex items-center gap-1">
                          <strong>📞 Movicel:</strong>{' '}
                          <a href="tel:+244998100940" className="text-sky-600 hover:underline font-bold">
                            998 100 940
                          </a>
                        </p>
                        <p className="flex items-center gap-1">
                          <strong>🟢 WhatsApp:</strong>{' '}
                          <a 
                            href="https://wa.me/244942043293" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-emerald-600 hover:underline font-extrabold flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 cursor-pointer"
                            title="Abrir no WhatsApp"
                          >
                            942 043 293 🚀
                          </a>
                        </p>
                        <p className="flex items-center gap-1">
                          <strong>✉️ E-mail:</strong>{' '}
                          <a href="mailto:equipemediadorcabindacabinda@gmail.com" className="text-sky-600 hover:underline font-bold truncate max-w-[150px]" title="equipemediadorcabindacabinda@gmail.com">
                            equipemediadorcabindacabinda@gmail.com
                          </a>
                        </p>
                      </div>
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

              {/* CONTA DO UTILIZADOR & SESSÃO */}
              <div className="border border-slate-200 rounded-2xl bg-slate-50/80 overflow-hidden shadow-xs">
                <div className="bg-slate-100 px-4 py-2 text-[10px] font-black text-slate-700 tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-amber-500" /> CONTA & SESSÃO</span>
                  <span className="text-[9px] text-slate-500 font-bold">{clients.find(c => c.id === activeClientId)?.tier || 'Cliente'}</span>
                </div>
                <div className="p-3 space-y-2.5 bg-white">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-400 font-extrabold text-xs flex items-center justify-center shrink-0 border border-slate-700">
                      {(clients.find(c => c.id === activeClientId)?.name || 'MC').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-slate-900 truncate">
                        {clients.find(c => c.id === activeClientId)?.name || 'Cliente'}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-slate-400" />
                        {clients.find(c => c.id === activeClientId)?.province || 'Cabinda'}, Angola
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        handleLogout();
                        setAuthPortalTab('signup');
                        speakText("Criar nova conta");
                      }}
                      className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-800 border border-amber-200 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>Nova Conta</span>
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                      }}
                      className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 active:scale-95 text-red-650 border border-red-200 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Sair / Login</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* SEÇÃO INFORMATIVA & TERMOS */}
              <div className="border border-slate-200 rounded-2xl bg-white p-3 space-y-2.5">
                {isAdminLoggedIn && (
                  <button
                    onClick={() => {
                      setRole('admin');
                      setSidebarOpen(false);
                      speakText("Retornando ao Painel de Gestão.");
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-xl text-[11px] font-black tracking-wider transition-all border border-amber-400/40 cursor-pointer shadow-md"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>➔ Voltar ao Painel de Gestão</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowTermsModal(true);
                    setSidebarOpen(false);
                    speakText("Abrindo informações aduaneiras e termos de uso.");
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Termos de Uso e Avisos Legais</span>
                </button>
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
      <div className="flex-1 w-full bg-slate-100 flex items-center justify-center p-0 sm:p-4">
        
        <div className={`w-full transition-all duration-350 bg-slate-100 flex flex-col h-full
          ${simulatedDevice === 'smartphone' 
            ? 'max-w-[390px] h-[844px] overflow-hidden border-[10px] border-slate-900 rounded-[44px] shadow-2xl relative bg-white my-4 scrollbar-thin' 
            : simulatedDevice === 'tablet'
              ? 'max-w-[768px] h-[1024px] overflow-hidden border-[8px] border-slate-800 rounded-[32px] shadow-2xl relative bg-white my-4 scrollbar-thin'
              : 'w-full max-w-7xl mx-auto h-auto'
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
          <main className={`flex-1 p-0 sm:p-4 md:p-6 lg:p-8 ${simulatedDevice !== 'desktop' ? 'h-full overflow-y-auto pb-24' : ''}`}>
            
            {!isAuthorized ? (
              <div className="max-w-xl mx-auto my-4 sm:my-8 animate-fade-in" id="portal-acesso-container">
                <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden text-left space-y-6">
                  
                  {/* APP LOGO DESIGN WITH BRANDING */}
                  <div className="bg-gradient-to-b from-slate-950 to-slate-900 text-white p-6 sm:p-7 text-center relative">
                    <div className="flex flex-col items-center justify-center space-y-3" id="app-branded-logo">
                      <div className="relative w-20 h-20 flex items-center justify-center bg-white rounded-2xl border-2 border-amber-400/40 shadow-lg overflow-hidden p-1">
                        <img 
                          src={appLogoImg} 
                          alt="Logo Oficial Mediador Cabinda" 
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      
                      <div className="space-y-1 text-center">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-display">
                          Mediador Cabinda
                        </h2>
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
                          <p className="text-[11px] font-black tracking-widest text-amber-400 uppercase">
                            Unindo Angola • Luanda &harr; Cabinda
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 font-medium max-w-sm mx-auto mt-2 leading-relaxed">
                      Intermediação de compras, despacho alfandegário e transporte seguro de cargas.
                    </p>

                    {/* TWO MODES TAB BAR */}
                    <div className="grid grid-cols-2 gap-1.5 mt-5 p-1 bg-slate-900/90 rounded-2xl border border-white/10 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthPortalTab('login');
                          setAuthError('');
                          speakText("Aba de início de sessão selecionada");
                        }}
                        className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          authPortalTab === 'login'
                            ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                            : 'text-slate-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <LogIn className="w-4 h-4" />
                        <span className="truncate">Entrar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAuthPortalTab('signup');
                          setAuthError('');
                          speakText("Aba de registo de nova conta selecionada");
                        }}
                        className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          authPortalTab === 'signup'
                            ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                            : 'text-slate-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <UserPlus className="w-4 h-4" />
                        <span className="truncate">Criar Conta</span>
                      </button>
                    </div>
                  </div>

                  {/* FORM BODY */}
                  <div className="p-6 sm:p-8 pt-2 space-y-5">
                    
                    {authError && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2 font-semibold animate-shake">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <span>{authError}</span>
                      </div>
                    )}

                    {/* ============================================================ */}
                    {/* TAB 1: CRIAR NOVA CONTA (NOVO CLIENTE) */}
                    {/* ============================================================ */}
                    {authPortalTab === 'signup' && (
                      <form onSubmit={handleRegisterClient} className="space-y-4 animate-fade-in">
                        <div className="border-b border-slate-100 pb-2">
                          <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                            <UserPlus className="w-4 h-4 text-amber-500" />
                            <span>Criar Nova Conta de Cliente</span>
                          </h3>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            Registe-se em segundos para solicitar orçamentos e receber encomendas em Angola.
                          </p>
                        </div>

                        <div className="space-y-3">
                          {/* Nome Completo */}
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                              Nome Completo *
                            </label>
                            <div className="relative">
                              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                type="text"
                                value={regName}
                                onChange={(e) => {
                                  setRegName(e.target.value);
                                  setAuthError('');
                                }}
                                placeholder="Ex: João Hilário António"
                                required
                                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900"
                              />
                            </div>
                          </div>

                          {/* Telemóvel / WhatsApp */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                                Telemóvel / WhatsApp *
                              </label>
                              <div className="relative">
                                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                  type="tel"
                                  value={regPhone}
                                  onChange={(e) => {
                                    setRegPhone(e.target.value);
                                    setAuthError('');
                                  }}
                                  placeholder="Ex: 942 043 293"
                                  required
                                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900"
                                />
                              </div>
                              <p className="text-[9px] text-slate-400">Unitel ou Movicel</p>
                            </div>

                            {/* E-mail */}
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                                E-mail (Opcional)
                              </label>
                              <div className="relative">
                                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                  type="email"
                                  value={regEmail}
                                  onChange={(e) => {
                                    setRegEmail(e.target.value);
                                    setAuthError('');
                                  }}
                                  placeholder="seuemail@exemplo.com"
                                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900"
                                />
                              </div>
                              <p className="text-[9px] text-slate-400">Para faturas e comprovativos</p>
                            </div>
                          </div>

                          {/* Província e Município (Escrita 100% Livre para Todas as Províncias e Novos Municípios) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                                  Sua Província *
                                </label>
                                {regProvince && (
                                  <button
                                    type="button"
                                    onClick={() => setRegProvince('')}
                                    className="text-[10px] text-amber-600 hover:text-amber-700 font-bold cursor-pointer"
                                  >
                                    Limpar
                                  </button>
                                )}
                              </div>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={regProvince}
                                  onChange={(e) => setRegProvince(e.target.value)}
                                  placeholder="Escreva: Cabinda, Luanda, Benguela..."
                                  required
                                  autoComplete="off"
                                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900 pr-8"
                                />
                                {regProvince && (
                                  <button
                                    type="button"
                                    onClick={() => setRegProvince('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-200"
                                    title="Apagar texto"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                              {/* Sugestões rápidas de 1 clique (opcionais, sem interferir na digitação) */}
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {['Cabinda', 'Luanda', 'Benguela', 'Huambo', 'Huíla', 'Uíge'].map((p) => (
                                  <button
                                    type="button"
                                    key={p}
                                    onClick={() => setRegProvince(p)}
                                    className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                                      regProvince.toLowerCase() === p.toLowerCase()
                                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                    }`}
                                  >
                                    {p}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                                  Município / Comuna *
                                </label>
                                {regMunicipality && (
                                  <button
                                    type="button"
                                    onClick={() => setRegMunicipality('')}
                                    className="text-[10px] text-amber-600 hover:text-amber-700 font-bold cursor-pointer"
                                  >
                                    Limpar
                                  </button>
                                )}
                              </div>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={regMunicipality}
                                  onChange={(e) => setRegMunicipality(e.target.value)}
                                  placeholder="Escreva: Liambo, Cabinda, Viana, Luanda..."
                                  required
                                  autoComplete="off"
                                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900 pr-8"
                                />
                                {regMunicipality && (
                                  <button
                                    type="button"
                                    onClick={() => setRegMunicipality('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-200"
                                    title="Apagar texto"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                              {/* Sugestões rápidas incluindo Liambo e outros municípios */}
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {['Liambo', 'Cabinda', 'Luanda', 'Viana', 'Cazenga', 'Cacongo', 'Belize', 'Buco-Zau'].map((m) => (
                                  <button
                                    type="button"
                                    key={m}
                                    onClick={() => setRegMunicipality(m)}
                                    className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                                      regMunicipality.toLowerCase() === m.toLowerCase()
                                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                    }`}
                                  >
                                    {m}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Bairro / Ponto de Referência */}
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                              Bairro / Ponto de Referência
                            </label>
                            <div className="relative">
                              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                type="text"
                                value={regBairro}
                                onChange={(e) => setRegBairro(e.target.value)}
                                placeholder="Ex: Bairro Lândana, perto do Mercado Municipal"
                                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900"
                              />
                            </div>
                          </div>

                          {/* Palavra-passe / Senha */}
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                              Criar Senha de Acesso (Opcional)
                            </label>
                            <div className="relative">
                              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                type={showRegPassword ? "text" : "password"}
                                value={regPassword}
                                onChange={(e) => setRegPassword(e.target.value)}
                                placeholder="•••••••• (Crie uma senha pessoal)"
                                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900"
                              />
                              <button
                                type="button"
                                onClick={() => setShowRegPassword(!showRegPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                              >
                                {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={rememberCode}
                              onChange={(e) => setRememberCode(e.target.checked)}
                              className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                            />
                            <span className="font-semibold text-slate-700">Manter sessão ativa neste dispositivo</span>
                          </label>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wide border border-amber-600"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Criar Minha Conta e Entrar</span>
                          <span>➔</span>
                        </button>

                        <p className="text-center text-xs text-slate-500">
                          Já possui uma conta?{' '}
                          <button
                            type="button"
                            onClick={() => {
                              setAuthPortalTab('login');
                              setAuthError('');
                            }}
                            className="font-bold text-amber-600 hover:underline cursor-pointer"
                          >
                            Iniciar Sessão aqui
                          </button>
                        </p>
                      </form>
                    )}

                    {/* ============================================================ */}
                    {/* TAB 2: INICIAR SESSÃO (CLIENTE EXISTENTE OU ADMIN) */}
                    {/* ============================================================ */}
                    {authPortalTab === 'login' && (
                      <form onSubmit={handleClientLogin} className="space-y-4 animate-fade-in">
                        <div className="border-b border-slate-100 pb-2">
                          <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                            <LogIn className="w-4 h-4 text-amber-500" />
                            <span>Entrar na Minha Conta</span>
                          </h3>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            Aceda com o seu e-mail, telemóvel ou credencial autorizada.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                              E-mail, Telemóvel ou Código de Acesso *
                            </label>
                            <div className="relative">
                              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                type="text"
                                value={loginIdentifier}
                                onChange={(e) => {
                                  setLoginIdentifier(e.target.value);
                                  setAuthError('');
                                }}
                                placeholder="Ex: 942043293, seuemail@exemplo.com ou admin99"
                                required
                                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                              Palavra-passe / Senha (Opcional)
                            </label>
                            <div className="relative">
                              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                type={showLoginPassword ? "text" : "password"}
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900"
                              />
                              <button
                                type="button"
                                onClick={() => setShowLoginPassword(!showLoginPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                              >
                                {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={rememberCode}
                              onChange={(e) => setRememberCode(e.target.checked)}
                              className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                            />
                            <span className="font-semibold text-slate-700">Lembrar neste dispositivo</span>
                          </label>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3.5 bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wide border border-slate-800"
                        >
                          <span>Entrar na Minha Conta</span>
                          <span>➔</span>
                        </button>

                        {/* Registered Accounts or Clean State notice */}
                        {clients.length === 0 ? (
                          <div className="pt-2 border-t border-slate-100">
                            <div className="p-3.5 bg-amber-50/90 border border-amber-200/80 rounded-2xl text-center space-y-1.5">
                              <p className="text-[11px] font-black text-amber-950">
                                ℹ️ Nenhuma conta de cliente gravada ainda.
                              </p>
                              <p className="text-[10px] text-amber-800 font-medium">
                                Cada utilizador deve registar a sua conta individual com nome, telemóvel e província.
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setAuthPortalTab('signup');
                                  setAuthError('');
                                  speakText("Abrindo formulário de criação de nova conta.");
                                }}
                                className="mt-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>Criar a Minha Conta Agora</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="pt-3 border-t border-slate-100 space-y-1.5">
                            <p className="text-[9px] uppercase font-bold text-slate-400">
                              Contas Registadas neste Dispositivo:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {clients.slice(0, 5).map(c => (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => {
                                    setLoginIdentifier(c.email || c.phone || c.name);
                                    setAuthError('');
                                    speakText(`Cliente ${c.name} selecionado`);
                                  }}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer truncate max-w-[170px]"
                                >
                                  {c.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <p className="text-center text-xs text-slate-500 pt-1">
                          Ainda não tem conta?{' '}
                          <button
                            type="button"
                            onClick={() => {
                              setAuthPortalTab('signup');
                              setAuthError('');
                            }}
                            className="font-bold text-amber-600 hover:underline cursor-pointer"
                          >
                            Criar Nova Conta Grátis
                          </button>
                        </p>
                      </form>
                    )}

                  </div>
                </div>
              </div>
            ) : role === 'client' ? (
              <div className="flex flex-col flex-1 w-full">
                {isAdminLoggedIn && (
                  <div className="sticky top-0 z-40 bg-slate-950 text-amber-400 border-b border-amber-400/40 px-4 py-2 flex items-center justify-between shadow-lg text-xs font-bold animate-fade-in">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black rounded-md text-[10px] uppercase tracking-wider">
                        Modo Administrador
                      </span>
                      <span className="text-slate-200 hidden sm:inline">
                        Você está a pré-visualizar a Área do Cliente como Gestor.
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setRole('admin');
                          speakText("Retornando ao Painel de Gestão.");
                        }}
                        className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 text-xs"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>➔ Voltar ao Painel de Gestão</span>
                      </button>
                    </div>
                  </div>
                )}
                <ErrorBoundary fallbackTitle="Erro no Painel do Cliente">
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
                    supplierServices={supplierServices}
                    onUpdateSupplierService={handleUpdateSupplierService}
                    onCreateSupplierService={handleCreateSupplierService}
                    serviceRequests={serviceRequests}
                    onCreateServiceRequest={handleCreateServiceRequest}
                    onUpdateServiceRequest={handleUpdateServiceRequest}
                    logisticsConfig={logisticsConfig}
                    knowledgeBase={knowledgeBase}
                  />
                </ErrorBoundary>
              </div>
            ) : (
              <ErrorBoundary fallbackTitle="Erro no Painel Administrativo">
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
                  supplierServices={supplierServices}
                  onUpdateSupplierService={handleUpdateSupplierService}
                  onCreateSupplierService={handleCreateSupplierService}
                  serviceRequests={serviceRequests}
                  onCreateServiceRequest={handleCreateServiceRequest}
                  onUpdateServiceRequest={handleUpdateServiceRequest}
                  logisticsConfig={logisticsConfig}
                  onUpdateLogisticsConfig={handleUpdateLogisticsConfig}
                  knowledgeBase={knowledgeBase}
                  onUpdateKnowledgeItem={handleUpdateKnowledgeItem}
                  onCreateKnowledgeItem={handleCreateKnowledgeItem}
                  onDeleteKnowledgeItem={handleDeleteKnowledgeItem}
                  auditLogs={auditLogs}
                  onResetKnowledgeBaseToDefaults={handleResetKnowledgeBaseToDefaults}
                  onChangeRole={setRole}
                  onChangeView={setCurrentView}
                />
              </ErrorBoundary>
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
                  safeLocalStorageSetItem('mediador_active_channel', 'general');
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

      {/* FLOATING 24/7 AI CHATBOT BUTTON & WELCOME BALLOON */}
      {isAuthorized && (
        <aside aria-label="Assistente Virtual IA 24/7" className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5 pointer-events-auto">
          {/* Modern Welcome Toast / Speech Balloon on App Open */}
          {showBotWelcomeBalloon && (
            <div
              onClick={() => {
                setShowAiBotModal(true);
                setShowBotWelcomeBalloon(false);
                speakText("Assistente Virtual do Mediador Cabinda pronto para ajudar");
              }}
              className="group relative cursor-pointer bg-slate-900/95 hover:bg-slate-900 backdrop-blur-md text-white border-2 border-amber-400/80 rounded-2xl p-3.5 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.6)] max-w-[290px] sm:max-w-[320px] animate-balloon-bounce transition-all hover:scale-102 hover:border-amber-300"
              id="bot-welcome-balloon"
              role="alert"
            >
              {/* Little Speech Bubble Arrow */}
              <div className="absolute -bottom-2 right-8 w-4 h-4 bg-slate-900 border-r-2 border-b-2 border-amber-400/80 rotate-45"></div>

              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-xs shrink-0">
                    🤖
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                    Assistente Mediador IA
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block"></span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowBotWelcomeBalloon(false);
                  }}
                  className="text-slate-400 hover:text-white text-xs w-5 h-5 rounded-full hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                  title="Fechar mensagem"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-100 font-medium mt-2 leading-relaxed">
                👋 Olá! Sou o Assistente Inteligente do Mediador-Cabinda. Toque aqui para tirar dúvidas e encontrar o que precisa.
              </p>

              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  ✨ Toque para abrir o chat ➔
                </span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded-md border border-emerald-500/30">
                  Online 24/7
                </span>
              </div>
            </div>
          )}

          {/* Floating Action Button */}
          <button
            onClick={() => {
              setShowAiBotModal(true);
              setShowBotWelcomeBalloon(false);
              speakText("Abrindo Assistente Virtual Inteligente 24 horas");
            }}
            className="group flex items-center gap-3 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 hover:from-slate-900 hover:to-slate-850 text-white pl-3.5 pr-4.5 py-2.5 sm:py-3 rounded-full border-2 border-amber-400 transition-all hover:scale-105 active:scale-95 cursor-pointer animate-float-gentle animate-glow-pulse"
            id="floating-ai-bot-btn"
            title="Assistente Virtual 24/7 - Dúvidas sobre encomendas, prazos, taxas e pagamentos"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-md group-hover:rotate-12 transition-transform">
                <Bot className="w-5 h-5" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full animate-ping"></span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full shadow-xs"></span>
            </div>
            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300 font-display">Assistente IA</span>
                <span className="text-[8.5px] bg-emerald-500/20 text-emerald-300 font-black px-1.5 py-0.5 rounded-full border border-emerald-500/40">24/7</span>
              </div>
              <p className="text-[10px] text-slate-300 font-medium mt-1 leading-none">Tire dúvidas na hora</p>
            </div>
          </button>
        </aside>
      )}

      {/* 24/7 AI CHATBOT MODAL */}
      <AiChatbotModal
        isOpen={showAiBotModal}
        onClose={() => setShowAiBotModal(false)}
        onNavigateView={(view) => {
          setCurrentView(view as any);
          speakText(`Navegando para ${view}`);
        }}
        clientName={
          (role === 'admin' || isAdminLoggedIn)
            ? (adminUserDisplayName || 'Direção Geral - Mediador Cabinda')
            : (clients.find(c => c.id === activeClientId)?.name || 'Cliente Cabinda')
        }
        clientTier={
          (role === 'admin' || isAdminLoggedIn)
            ? 'Direção Executiva'
            : (clients.find(c => c.id === activeClientId)?.tier || 'Standard')
        }
        botSettings={botSettings}
        dynamicLogisticsConfig={logisticsConfig}
        dynamicKnowledgeBase={knowledgeBase}
      />

    </div>
  );
}
