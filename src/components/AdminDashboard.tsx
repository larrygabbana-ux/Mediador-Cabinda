/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Client, 
  Order, 
  Message, 
  Notification, 
  OrderStatus, 
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
  KnowledgeAuditLog,
  LogisticsModeConfig
} from '../types';
import { CARRIER_COMPANIES, MASTER_ADMIN_CREDENTIALS, wipeAllStoredData } from '../data/mockData';
import { 
  BarChart, 
  Users, 
  Package, 
  FileCheck, 
  Scale, 
  TrendingUp, 
  Plus, 
  Phone, 
  Clipboard, 
  MapPin, 
  Check, 
  CheckCircle,
  CheckCircle2,
  FileText, 
  Truck, 
  CornerDownRight, 
  ChevronRight, 
  MessageSquare, 
  AlertTriangle, 
  RefreshCw,
  Printer,
  Search,
  Send,
  X,
  Award,
  Handshake,
  Coins,
  UserPlus,
  Percent,
  Bot,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Clock,
  Settings as SettingsIcon,
  HelpCircle,
  Zap,
  Shield,
  ShieldCheck,
  Edit3,
  Layers,
  Tag,
  Ship,
  Plane,
  Globe,
  History,
  BookOpen,
  PlusCircle,
  Trash,
  Eye,
  ArrowRight
} from 'lucide-react';
import SharedChat from './SharedChat';
import { downloadOrderInvoice, downloadCollaboratorSaleInvoice } from '../utils/invoiceDownloader';
import { 
  getStoredLogisticsConfig, 
  saveStoredLogisticsConfig,
  getStoredKnowledgeBase, 
  getStoredAuditLogs, 
  addAuditLogEntry, 
  solveBotQueryLocally,
  DEFAULT_LOGISTICS_CONFIG,
  INITIAL_DYNAMIC_KNOWLEDGE_BASE
} from '../utils/aiBotKnowledge';
import { MARKETPLACE_CATEGORIES, getCategoryById, getSubCategoryName } from '../data/marketplaceTaxonomy';

interface AdminDashboardProps {
  clients: Client[];
  orders: Order[];
  onUpdateOrder: (updatedOrder: Order) => void;
  messages: Message[];
  onSendMessage: (orderId: string, text: string, attachment?: any, isPriority?: boolean, senderOverride?: 'client' | 'admin') => void;
  onMarkChannelAsRead: (channelId: string) => void;
  notifications: Notification[];
  onAddNotification: (newNotif: Notification) => void;
  carriersList: CarrierCompany[];
  onAddCarrier: (newCarrier: CarrierCompany) => void;

  // Supplier props
  suppliers: Supplier[];
  onUpdateSupplier: (updatedSupplier: Supplier) => void;
  onCreateSupplier: (newSupplier: Supplier) => void;
  supplierProducts: SupplierProduct[];
  onUpdateSupplierProduct: (updatedProduct: SupplierProduct) => void;
  onCreateSupplierProduct: (newProduct: SupplierProduct) => void;
  supplierMessages: SupplierMessage[];
  onSendSupplierMessage: (msg: SupplierMessage) => void;

  // Colab Props
  collaborators: Collaborator[];
  onUpdateCollaborators: (newColabs: Collaborator[]) => void;
  collaboratorSales: CollaboratorSale[];
  onUpdateCollaboratorSales: (newSales: CollaboratorSale[]) => void;

  // Service props
  supplierServices: SupplierService[];
  onUpdateSupplierService: (updatedService: SupplierService) => void;
  onCreateSupplierService: (newService: SupplierService) => void;
  serviceRequests: ServiceRequest[];
  onCreateServiceRequest: (newRequest: ServiceRequest) => void;
  onUpdateServiceRequest: (updatedRequest: ServiceRequest) => void;

  // Logistics & AI Knowledge Base Dynamic Props
  logisticsConfig?: GeneralLogisticsSettings;
  onUpdateLogisticsConfig?: (newConfig: GeneralLogisticsSettings, notes?: string) => void;
  knowledgeBase?: DynamicKnowledgeItem[];
  onUpdateKnowledgeItem?: (updatedItem: DynamicKnowledgeItem) => void;
  onCreateKnowledgeItem?: (newItem: DynamicKnowledgeItem) => void;
  onDeleteKnowledgeItem?: (itemId: string) => void;
  auditLogs?: KnowledgeAuditLog[];
  onResetKnowledgeBaseToDefaults?: () => void;

  // Action overrides
  onChangeRole?: (role: 'client' | 'admin') => void;
  onChangeView?: (view: 'inicio' | 'fazer-pedido' | 'acompanhar-pedido' | 'cadastro' | 'entrar' | 'minha-conta' | 'historico' | 'pagamentos' | 'notificacoes' | 'suporte' | 'reclamacoes' | 'configuracoes' | 'sobre-nos' | 'termos-uso' | 'mercado-fornecedores' | 'mensagens' | 'parceria' | 'guia-ajuda') => void;
}

export default function AdminDashboard({
  clients,
  orders,
  onUpdateOrder,
  messages,
  onSendMessage,
  onMarkChannelAsRead,
  notifications,
  onAddNotification,
  carriersList,
  onAddCarrier,
  suppliers,
  onUpdateSupplier,
  onCreateSupplier,
  supplierProducts,
  onUpdateSupplierProduct,
  onCreateSupplierProduct,
  supplierMessages,
  onSendSupplierMessage,
  collaborators,
  onUpdateCollaborators,
  collaboratorSales,
  onUpdateCollaboratorSales,
  supplierServices,
  onUpdateSupplierService,
  onCreateSupplierService,
  serviceRequests,
  onCreateServiceRequest,
  onUpdateServiceRequest,
  logisticsConfig,
  onUpdateLogisticsConfig,
  knowledgeBase,
  onUpdateKnowledgeItem,
  onCreateKnowledgeItem,
  onDeleteKnowledgeItem,
  auditLogs,
  onResetKnowledgeBaseToDefaults,
  onChangeRole,
  onChangeView
}: AdminDashboardProps) {
  
  // Navigation states
  const [activeTab, setActiveTab] = useState<'metrics' | 'orders' | 'clients' | 'carriers' | 'complaints' | 'chat' | 'suppliers' | 'collaborators' | 'chatbot'>('metrics');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(orders[0]?.id || null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [orderFilter, setOrderFilter] = useState<OrderStatus | 'TODOS'>('TODOS');
  const [selectedColabId, setSelectedColabId] = useState<string | null>(null);

  // Dynamic Logistics & Knowledge Base Live State
  const activeLogistics = logisticsConfig || getStoredLogisticsConfig();
  const [localLogistics, setLocalLogistics] = useState<GeneralLogisticsSettings>(() => {
    const base = logisticsConfig || getStoredLogisticsConfig();
    return {
      ...base,
      pickupLocationCabinda: base.pickupLocationCabinda || base.pickupAddressCabinda || '',
      pickupAddressCabinda: base.pickupAddressCabinda || base.pickupLocationCabinda || '',
      consolidationWarehouseLuanda: base.consolidationWarehouseLuanda || base.consolidationAddressLuanda || '',
      consolidationAddressLuanda: base.consolidationAddressLuanda || base.consolidationWarehouseLuanda || '',
      intermediationFeePercentage: base.intermediationFeePercentage || base.intermediationFeeRate || '',
      intermediationFeeRate: base.intermediationFeeRate || base.intermediationFeePercentage || '',
      customsTransitFeeAGT: base.customsTransitFeeAGT || base.customsTaxAGT || '',
      customsTaxAGT: base.customsTaxAGT || base.customsTransitFeeAGT || '',
      guaranteeAndRefundPolicy: base.guaranteeAndRefundPolicy || base.warrantyAndRefundPolicy || '',
      warrantyAndRefundPolicy: base.warrantyAndRefundPolicy || base.guaranteeAndRefundPolicy || '',
      operationalNotice: base.operationalNotice || base.operationalNote || '',
      operationalNote: base.operationalNote || base.operationalNotice || '',
      modes: {
        aereo: {
          ...base.modes.aereo,
          estimatedDays: base.modes.aereo.estimatedDays || base.modes.aereo.averageTime || '',
          averageTime: base.modes.aereo.averageTime || base.modes.aereo.estimatedDays || '',
          costPerKg: base.modes.aereo.costPerKg || base.modes.aereo.costEstimate || '',
          costEstimate: base.modes.aereo.costEstimate || base.modes.aereo.costPerKg || '',
          recommendedFor: base.modes.aereo.recommendedFor || base.modes.aereo.recommendation || '',
          recommendation: base.modes.aereo.recommendation || base.modes.aereo.recommendedFor || ''
        },
        maritimo: {
          ...base.modes.maritimo,
          estimatedDays: base.modes.maritimo.estimatedDays || base.modes.maritimo.averageTime || '',
          averageTime: base.modes.maritimo.averageTime || base.modes.maritimo.estimatedDays || '',
          costPerKg: base.modes.maritimo.costPerKg || base.modes.maritimo.costEstimate || '',
          costEstimate: base.modes.maritimo.costEstimate || base.modes.maritimo.costPerKg || '',
          recommendedFor: base.modes.maritimo.recommendedFor || base.modes.maritimo.recommendation || '',
          recommendation: base.modes.maritimo.recommendation || base.modes.maritimo.recommendedFor || ''
        },
        terrestre: {
          ...base.modes.terrestre,
          estimatedDays: base.modes.terrestre.estimatedDays || base.modes.terrestre.averageTime || '',
          averageTime: base.modes.terrestre.averageTime || base.modes.terrestre.estimatedDays || '',
          costPerKg: base.modes.terrestre.costPerKg || base.modes.terrestre.costEstimate || '',
          costEstimate: base.modes.terrestre.costEstimate || base.modes.terrestre.costPerKg || '',
          recommendedFor: base.modes.terrestre.recommendedFor || base.modes.terrestre.recommendation || '',
          recommendation: base.modes.terrestre.recommendation || base.modes.terrestre.recommendedFor || ''
        }
      }
    };
  });
  
  useEffect(() => {
    const base = logisticsConfig || getStoredLogisticsConfig();
    setLocalLogistics({
      ...base,
      pickupLocationCabinda: base.pickupLocationCabinda || base.pickupAddressCabinda || '',
      pickupAddressCabinda: base.pickupAddressCabinda || base.pickupLocationCabinda || '',
      consolidationWarehouseLuanda: base.consolidationWarehouseLuanda || base.consolidationAddressLuanda || '',
      consolidationAddressLuanda: base.consolidationAddressLuanda || base.consolidationWarehouseLuanda || '',
      intermediationFeePercentage: base.intermediationFeePercentage || base.intermediationFeeRate || '',
      intermediationFeeRate: base.intermediationFeeRate || base.intermediationFeePercentage || '',
      customsTransitFeeAGT: base.customsTransitFeeAGT || base.customsTaxAGT || '',
      customsTaxAGT: base.customsTaxAGT || base.customsTransitFeeAGT || '',
      guaranteeAndRefundPolicy: base.guaranteeAndRefundPolicy || base.warrantyAndRefundPolicy || '',
      warrantyAndRefundPolicy: base.warrantyAndRefundPolicy || base.guaranteeAndRefundPolicy || '',
      operationalNotice: base.operationalNotice || base.operationalNote || '',
      operationalNote: base.operationalNote || base.operationalNotice || '',
      modes: {
        aereo: {
          ...base.modes.aereo,
          estimatedDays: base.modes.aereo.estimatedDays || base.modes.aereo.averageTime || '',
          averageTime: base.modes.aereo.averageTime || base.modes.aereo.estimatedDays || '',
          costPerKg: base.modes.aereo.costPerKg || base.modes.aereo.costEstimate || '',
          costEstimate: base.modes.aereo.costEstimate || base.modes.aereo.costPerKg || '',
          recommendedFor: base.modes.aereo.recommendedFor || base.modes.aereo.recommendation || '',
          recommendation: base.modes.aereo.recommendation || base.modes.aereo.recommendedFor || ''
        },
        maritimo: {
          ...base.modes.maritimo,
          estimatedDays: base.modes.maritimo.estimatedDays || base.modes.maritimo.averageTime || '',
          averageTime: base.modes.maritimo.averageTime || base.modes.maritimo.estimatedDays || '',
          costPerKg: base.modes.maritimo.costPerKg || base.modes.maritimo.costEstimate || '',
          costEstimate: base.modes.maritimo.costEstimate || base.modes.maritimo.costPerKg || '',
          recommendedFor: base.modes.maritimo.recommendedFor || base.modes.maritimo.recommendation || '',
          recommendation: base.modes.maritimo.recommendation || base.modes.maritimo.recommendedFor || ''
        },
        terrestre: {
          ...base.modes.terrestre,
          estimatedDays: base.modes.terrestre.estimatedDays || base.modes.terrestre.averageTime || '',
          averageTime: base.modes.terrestre.averageTime || base.modes.terrestre.estimatedDays || '',
          costPerKg: base.modes.terrestre.costPerKg || base.modes.terrestre.costEstimate || '',
          costEstimate: base.modes.terrestre.costEstimate || base.modes.terrestre.costPerKg || '',
          recommendedFor: base.modes.terrestre.recommendedFor || base.modes.terrestre.recommendation || '',
          recommendation: base.modes.terrestre.recommendation || base.modes.terrestre.recommendedFor || ''
        }
      }
    });
  }, [logisticsConfig]);

  const activeKnowledge = knowledgeBase || getStoredKnowledgeBase();
  const activeAuditLogs = auditLogs || getStoredAuditLogs();

  const [botSubTab, setBotSubTab] = useState<'logistica' | 'knowledge' | 'audit' | 'settings_sim'>('logistica');
  const [logisticsNotes, setLogisticsNotes] = useState('');
  const [logisticsSaveFeedback, setLogisticsSaveFeedback] = useState(false);
  const [adminAuthorName, setAdminAuthorName] = useState('João Hilário António (Administrador Geral)');

  // Knowledge Item creation & edit state
  const [selectedKnowledgeCategory, setSelectedKnowledgeCategory] = useState<string>('TODAS');
  const [editingKnowledgeItem, setEditingKnowledgeItem] = useState<DynamicKnowledgeItem | null>(null);
  const [isCreatingKnowledgeItem, setIsCreatingKnowledgeItem] = useState(false);
  const [knowledgeForm, setKnowledgeForm] = useState<Partial<DynamicKnowledgeItem>>({
    category: 'Logística',
    question: '',
    shortAnswer: '',
    detailedAnswer: '',
    keywords: [],
    suggestedNextQuestions: [],
    isActive: true
  });
  const [keywordsInput, setKeywordsInput] = useState('');
  const [nextQuestionsInput, setNextQuestionsInput] = useState('');
  const [knowledgeFeedback, setKnowledgeFeedback] = useState<string | null>(null);

  // Real-time AI Simulator State
  const [simQuery, setSimQuery] = useState('');
  const [simResult, setSimResult] = useState<{
    text: string;
    suggestedQuestions?: string[];
    actionLink?: { label: string; view: string };
    source?: string;
  } | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  // 24/7 AI Bot Settings State for Management
  const [adminBotSettings, setAdminBotSettings] = useState<BotSettings>(() => {
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
  const [botKnowledgeSearch, setBotKnowledgeSearch] = useState('');
  const [botSaveFeedback, setBotSaveFeedback] = useState(false);

  const handleSaveBotSettings = (updated: BotSettings) => {
    setAdminBotSettings(updated);
    localStorage.setItem('mediador_cabinda_bot_settings', JSON.stringify(updated));
    setBotSaveFeedback(true);
    setTimeout(() => setBotSaveFeedback(false), 3000);
  };

  // Handler for Saving Logistics Configuration
  const handleSaveLogisticsConfig = () => {
    const pickupCabinda = localLogistics.pickupLocationCabinda || localLogistics.pickupAddressCabinda || 'Armazém C-4, Recinto Portuário de Cabinda, Rua Direita';
    const consolLuanda = localLogistics.consolidationWarehouseLuanda || localLogistics.consolidationAddressLuanda || 'Parque Logístico Portuário / Viana, Luanda';
    const feeRate = localLogistics.intermediationFeePercentage || localLogistics.intermediationFeeRate || '10% a 15%';
    const customsTax = localLogistics.customsTransitFeeAGT || localLogistics.customsTaxAGT || '8.000 AOA';
    const warranty = localLogistics.guaranteeAndRefundPolicy || localLogistics.warrantyAndRefundPolicy || 'Reembolso total de 100% ou reposição imediata';
    const note = localLogistics.operationalNotice || localLogistics.operationalNote || '';

    const aereoTime = localLogistics.modes.aereo.estimatedDays || localLogistics.modes.aereo.averageTime || '1 dia';
    const aereoCost = localLogistics.modes.aereo.costPerKg || localLogistics.modes.aereo.costEstimate || '2.500 AOA / kg';
    const aereoRec = localLogistics.modes.aereo.recommendedFor || localLogistics.modes.aereo.recommendation || 'Cargas expressas e urgentes';

    const maritimoTime = localLogistics.modes.maritimo.estimatedDays || localLogistics.modes.maritimo.averageTime || '2–3 dias';
    const maritimoCost = localLogistics.modes.maritimo.costPerKg || localLogistics.modes.maritimo.costEstimate || '450 AOA / kg';
    const maritimoRec = localLogistics.modes.maritimo.recommendedFor || localLogistics.modes.maritimo.recommendation || 'Cargas gerais e pesadas';

    const terrestreTime = localLogistics.modes.terrestre.estimatedDays || localLogistics.modes.terrestre.averageTime || '7–8 dias';
    const terrestreCost = localLogistics.modes.terrestre.costPerKg || localLogistics.modes.terrestre.costEstimate || '350 AOA / kg';
    const terrestreRec = localLogistics.modes.terrestre.recommendedFor || localLogistics.modes.terrestre.recommendation || 'Cargas volumosas e materiais';

    const updated: GeneralLogisticsSettings = {
      ...localLogistics,
      pickupAddressCabinda: pickupCabinda,
      pickupLocationCabinda: pickupCabinda,
      consolidationAddressLuanda: consolLuanda,
      consolidationWarehouseLuanda: consolLuanda,
      intermediationFeeRate: feeRate,
      intermediationFeePercentage: feeRate,
      customsTaxAGT: customsTax,
      customsTransitFeeAGT: customsTax,
      warrantyAndRefundPolicy: warranty,
      guaranteeAndRefundPolicy: warranty,
      operationalNote: note,
      operationalNotice: note,
      modes: {
        aereo: {
          ...localLogistics.modes.aereo,
          averageTime: aereoTime,
          estimatedDays: aereoTime,
          costEstimate: aereoCost,
          costPerKg: aereoCost,
          recommendation: aereoRec,
          recommendedFor: aereoRec,
          status: localLogistics.modes.aereo.status || 'ativo'
        },
        maritimo: {
          ...localLogistics.modes.maritimo,
          averageTime: maritimoTime,
          estimatedDays: maritimoTime,
          costEstimate: maritimoCost,
          costPerKg: maritimoCost,
          recommendation: maritimoRec,
          recommendedFor: maritimoRec,
          status: localLogistics.modes.maritimo.status || 'ativo'
        },
        terrestre: {
          ...localLogistics.modes.terrestre,
          averageTime: terrestreTime,
          estimatedDays: terrestreTime,
          costEstimate: terrestreCost,
          costPerKg: terrestreCost,
          recommendation: terrestreRec,
          recommendedFor: terrestreRec,
          status: localLogistics.modes.terrestre.status || 'ativo'
        }
      },
      lastUpdated: new Date().toISOString(),
      updatedBy: adminAuthorName
    };

    saveStoredLogisticsConfig(updated);

    if (onUpdateLogisticsConfig) {
      onUpdateLogisticsConfig(updated, logisticsNotes || 'Atualização de modais e prazos operacionais');
    } else {
      addAuditLogEntry({
        adminName: adminAuthorName,
        adminRole: 'Super Administrador',
        actionType: 'logistica_update',
        section: 'Configurações de Logística',
        fieldName: 'Modais de Transporte e Prazos',
        previousValue: `Aéreo: ${activeLogistics.modes.aereo.averageTime || activeLogistics.modes.aereo.estimatedDays || ''}, Marítimo: ${activeLogistics.modes.maritimo.averageTime || activeLogistics.modes.maritimo.estimatedDays || ''}, Terrestre: ${activeLogistics.modes.terrestre.averageTime || activeLogistics.modes.terrestre.estimatedDays || ''}`,
        newValue: `Aéreo: ${updated.modes.aereo.averageTime}, Marítimo: ${updated.modes.maritimo.averageTime}, Terrestre: ${updated.modes.terrestre.averageTime}`,
        notes: logisticsNotes || 'Atualização de modais e prazos operacionais'
      });
    }
    setLogisticsSaveFeedback(true);
    speak("Configurações de logística gravadas com sucesso. A IA responderá imediatamente com os novos prazos.");
    setTimeout(() => setLogisticsSaveFeedback(false), 4000);
  };

  // Handler for Saving / Updating Knowledge Item
  const handleSaveKnowledgeItem = () => {
    if (!knowledgeForm.question?.trim() || !knowledgeForm.detailedAnswer?.trim()) {
      alert('Por favor preencha a Pergunta e a Resposta Detalhada da IA.');
      return;
    }

    const keywords = keywordsInput
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);

    const suggestedNextQuestions = nextQuestionsInput
      .split(';')
      .map(q => q.trim())
      .filter(Boolean);

    if (editingKnowledgeItem) {
      const updated: DynamicKnowledgeItem = {
        ...editingKnowledgeItem,
        category: (knowledgeForm.category as any) || 'Geral',
        question: knowledgeForm.question.trim(),
        shortAnswer: knowledgeForm.shortAnswer?.trim() || knowledgeForm.detailedAnswer.trim().slice(0, 120),
        detailedAnswer: knowledgeForm.detailedAnswer.trim(),
        keywords: keywords.length > 0 ? keywords : editingKnowledgeItem.keywords,
        suggestedNextQuestions: suggestedNextQuestions.length > 0 ? suggestedNextQuestions : editingKnowledgeItem.suggestedNextQuestions,
        isActive: knowledgeForm.isActive ?? true,
        lastUpdated: new Date().toISOString(),
        updatedBy: adminAuthorName
      };
      if (onUpdateKnowledgeItem) {
        onUpdateKnowledgeItem(updated);
      }
      setEditingKnowledgeItem(null);
      setKnowledgeFeedback('Tópico de conhecimento atualizado com sucesso!');
    } else {
      const newItem: DynamicKnowledgeItem = {
        id: `k-${Date.now()}`,
        category: (knowledgeForm.category as any) || 'Geral',
        question: knowledgeForm.question.trim(),
        shortAnswer: knowledgeForm.shortAnswer?.trim() || knowledgeForm.detailedAnswer.trim().slice(0, 120),
        detailedAnswer: knowledgeForm.detailedAnswer.trim(),
        keywords: keywords.length > 0 ? keywords : [knowledgeForm.question.toLowerCase().trim()],
        suggestedNextQuestions: suggestedNextQuestions.length > 0 ? suggestedNextQuestions : ['Como funciona o Mediador Cabinda?', 'Quais os prazos de entrega?'],
        isActive: true,
        lastUpdated: new Date().toISOString(),
        updatedBy: adminAuthorName
      };
      if (onCreateKnowledgeItem) {
        onCreateKnowledgeItem(newItem);
      }
      setIsCreatingKnowledgeItem(false);
      setKnowledgeFeedback('Novo tópico de conhecimento adicionado com sucesso!');
    }
    setTimeout(() => setKnowledgeFeedback(null), 3500);
  };

  // Handler for Real-Time IA Testing Simulation
  const handleExecuteSimTest = (customQ?: string) => {
    const query = (customQ || simQuery).trim();
    if (!query) return;
    setSimLoading(true);
    setTimeout(() => {
      const result = solveBotQueryLocally(query, activeKnowledge, localLogistics);
      setSimResult({
        text: result.text,
        suggestedQuestions: result.suggestedQuestions,
        actionLink: result.actionLink,
        source: 'Motor Dinâmico IA (Sincronizado)'
      });
      setSimLoading(false);
    }, 120);
  };

  // Collaborator and Sales Form State
  const [newColabForm, setNewColabForm] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'Promotor / Afiliado',
    defaultCommissionPercentage: 12
  });

  const [calcSaleAmount, setCalcSaleAmount] = useState<number>(550000);
  const [calcCommissionPrice, setCalcCommissionPrice] = useState<number>(85000);
  const [calcPercentage, setCalcPercentage] = useState<number>(15);
  const [calcMonthlyGoal, setCalcMonthlyGoal] = useState<number>(150000);

  const [newColabSaleForm, setNewColabSaleForm] = useState({
    collaboratorId: '',
    clientName: '',
    saleDescription: '',
    saleAmount: 220000, // in AOA
    commissionPrice: 35000, // total commission generated
    collaboratorPercentage: 12
  });

  const [isCalculationDynamic, setIsCalculationDynamic] = useState<boolean>(true);

  // Helper helper to get dynamic commission suggestions based on sale value
  const getDynamicCommissionRate = (saleAmount: number): number => {
    if (saleAmount < 300000) return 8;       // Até 300 Mil Kz: 8%
    if (saleAmount < 1000000) return 12;     // 300 Mil até 1 M Kz: 12%
    if (saleAmount < 3000000) return 15;     // 1 M até 3 M Kz: 15%
    return 18;                              // Acima de 3 M Kz: 18%
  };
  
  // Form input builders
  const [rawPrice, setRawPrice] = useState<number>(150000);
  const [shippingCost, setShippingCost] = useState<number>(10000);
  const [dispatchFee, setDispatchFee] = useState<number>(8000);
  const [commissionRate, setCommissionRate] = useState<number>(0.12); // 12% default
  
  // Carrier dispatch details
  const [carrierId, setCarrierId] = useState<string>('carr-1');
  const [guideNumber, setGuideNumber] = useState<string>('');
  const [shippingDate, setShippingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [deliveryEstimate, setDeliveryEstimate] = useState<string>('');

  // Add new Carrier form
  const [newCarrier, setNewCarrier] = useState({ name: '', phone: '', baseRatePerKg: 1000, expectedDays: 4 });

  // Upload simulation
  const [uploadedReceiptName, setUploadedReceiptName] = useState<string>('');

  // Suppliers CRM Management States
  const [adminSelectedSupplierId, setAdminSelectedSupplierId] = useState<string | null>(suppliers[0]?.id || null);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState<boolean>(false);
  const [adminNewSupplierForm, setAdminNewSupplierForm] = useState({
    name: '',
    city: 'Luanda',
    category: 'Eletrónicos e Tecnologia',
    nif: '',
    contactPerson: '',
    phoneHidden: '',
    whatsapp: '',
    emailHidden: '',
    addressHidden: '',
    plan: 'ouro' as 'gratuito' | 'prata' | 'ouro' | 'diamante',
    description: '',
    logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=60'
  });

  const [adminNewProductForm, setAdminNewProductForm] = useState({
    name: '',
    productCode: '',
    supplierId: suppliers[0]?.id || '',
    category: 'feminino',
    subCategory: 'perucas-cabelos',
    price: 65000,
    originalPrice: 78000,
    availability: 'imediata' as 'imediata' | 'sob-pedido' | 'esgotado',
    stock: 15,
    description: '',
    photoUrl: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=500&auto=format&fit=crop&q=60',
    photos: ['https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=500&auto=format&fit=crop&q=60'] as string[],
    location: 'Luanda' as 'Luanda' | 'Cabinda' | string,
    availableFromDate: 'Imediata (Hoje)',
    warranty: '12 Meses de Garantia',
    condition: 'novo' as 'novo' | 'seminovo' | 'recondicionado',
    brand: '',
    model: '',
    featured: false
  });
  const [showAddProductForm, setShowAddProductForm] = useState(true);
  const [showStockGallery, setShowStockGallery] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<SupplierProduct | null>(null);

  // Security Master & System Wipe Modal State
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [copiedPassKey, setCopiedPassKey] = useState(false);

  // Service tab and form states
  const [supplierSubTab, setSupplierSubTab] = useState<'products' | 'services' | 'requests'>('products');
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [adminNewServiceForm, setAdminNewServiceForm] = useState({
    name: '',
    price: 75000,
    category: 'Despacho Aduaneiro' as 'Despacho Aduaneiro' | 'Transporte de Carga' | 'Compra Assistida' | 'Embalamento e Paletização' | 'Inspeção de Mercadoria' | 'Outros',
    description: '',
    photoUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=500&auto=format&fit=crop&q=60',
    location: 'Luanda' as 'Luanda' | 'Cabinda' | 'Ambos'
  });

  const SYSTEM_STOCK_GALLERY = [
    {
      category: "👗 Feminino & Mulheres",
      images: [
        { name: "Peruca Lace Front 13x4 Cabelo Humano 30'", url: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=500&auto=format&fit=crop&q=60" },
        { name: "Peruca Bob Lisa Cabelo Virgem 12'", url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60" },
        { name: "Vestido Africano Samakaka de Gala", url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop&q=60" },
        { name: "Bolsa de Mão Feminina em Couro", url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=60" },
        { name: "Sandálias de Salto Alto Luxo", url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&auto=format&fit=crop&q=60" },
        { name: "Kit Maquilhagem & Cosméticos", url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop&q=60" }
      ]
    },
    {
      category: "👔 Masculino & Homens",
      images: [
        { name: "Fato Executivo Slim Fit 3 Peças", url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&auto=format&fit=crop&q=60" },
        { name: "Camisa Formal Algodão Puro", url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop&q=60" },
        { name: "Sapato Clássico Oxford Couro", url: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=500&auto=format&fit=crop&q=60" },
        { name: "Relógio Cronógrafo Masculino", url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&auto=format&fit=crop&q=60" },
        { name: "Perfume Amadeirado Masculino", url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500&auto=format&fit=crop&q=60" }
      ]
    },
    {
      category: "💻 Computadores & Eletrónicos",
      images: [
        { name: "Computador Portátil Profissional i5/i7", url: "https://images.unsplash.com/photo-1496181130204-7552cc14ac1a?w=500&auto=format&fit=crop&q=60" },
        { name: "Smart TV 55' 4K Ultra HD", url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&auto=format&fit=crop&q=60" },
        { name: "Smartphone Flagship 256GB", url: "https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=500&auto=format&fit=crop&q=60" },
        { name: "Frigorífico Combinado No-Frost", url: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=500&auto=format&fit=crop&q=60" },
        { name: "Ar Condicionado Inverter Split", url: "https://images.unsplash.com/photo-1614633833026-0620455a02cf?w=500&auto=format&fit=crop&q=60" }
      ]
    },
    {
      category: "🌾 Alimentos & Produtos do Campo",
      images: [
        { name: "Saco de Bombó Seco de Cabinda 50kg", url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60" },
        { name: "Mandioca Fresca & Batata Doce", url: "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=500&auto=format&fit=crop&q=60" },
        { name: "Óleo de Palma Puro do Maiombe", url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60" },
        { name: "Feijão Manteiga Nacional", url: "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=500&auto=format&fit=crop&q=60" }
      ]
    },
    {
      category: "🐂 Animais & Pecuária",
      images: [
        { name: "Boi Touro Reprodutor Nelore 450kg", url: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=500&auto=format&fit=crop&q=60" },
        { name: "Vacas Leiteiras Girolando", url: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=500&auto=format&fit=crop&q=60" },
        { name: "Cabritos & Caprinos Raça Bôer", url: "https://images.unsplash.com/photo-1524024973431-2ad916746881?w=500&auto=format&fit=crop&q=60" }
      ]
    },
    {
      category: "⚡ Sistemas Solares & Geradores",
      images: [
        { name: "Painel Solar Monocristalino Premium", url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&auto=format&fit=crop&q=60" },
        { name: "Bateria de Lítio e Controlador", url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&auto=format&fit=crop&q=60" },
        { name: "Gerador Silencioso a Gasóleo", url: "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=500&auto=format&fit=crop&q=60" }
      ]
    },
    {
      category: "⚙️ Bombas de Água & Construção",
      images: [
        { name: "Bomba Periférica de Água Pedrollo", url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60" },
        { name: "Maleta de Ferramentas e Chaves", url: "https://images.unsplash.com/photo-1534224039826-c7a0eda0e6b3?w=500&auto=format&fit=crop&q=60" },
        { name: "Tintas & Impermeabilização", url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&auto=format&fit=crop&q=60" }
      ]
    },
    {
      category: "🚗 Auto & Peças Sobressalentes",
      images: [
        { name: "Pneus Novos Todo-o-Terreno 4x4", url: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=500&auto=format&fit=crop&q=60" },
        { name: "Bateria Automóvel 12V Alta Capacidade", url: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&auto=format&fit=crop&q=60" },
        { name: "Óleo de Motor Sintético e Filtros", url: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=500&auto=format&fit=crop&q=60" }
      ]
    }
  ];
  const [selectedSupplierChatId, setSelectedSupplierChatId] = useState<string | null>(suppliers[0]?.id || null);
  const [adminSupplierChatInput, setAdminSupplierChatInput] = useState('');

  // Product Search by Code (SKU) / Name across all suppliers & SKU image preview
  const [adminProductCodeSearch, setAdminProductCodeSearch] = useState('');
  const [adminInspectedProduct, setAdminInspectedProduct] = useState<SupplierProduct | null>(null);
  const [adminImagePreviewUrl, setAdminImagePreviewUrl] = useState<{ url: string; title: string } | null>(null);

  // Product Code Helper
  const getProductCode = (prod: SupplierProduct) => {
    if (prod.productCode) return prod.productCode;
    if (prod.id && prod.id.startsWith('sprod-')) {
      const num = parseInt(prod.id.replace('sprod-', ''), 10);
      return `PRD-${1000 + (isNaN(num) ? 1 : num)}`;
    }
    if (prod.id && prod.id.startsWith('PRD-')) return prod.id;
    return `PRD-${(prod.id || '1001').slice(-4).toUpperCase()}`;
  };

  // Clients Tab state selectors (Requirement 1 & 2 & 3)
  const [clientSearchQuery, setClientSearchQuery] = useState<string>('');
  const [selectedDetailsClientId, setSelectedDetailsClientId] = useState<string | null>(null);
  const [directNotificationText, setDirectNotificationText] = useState<string>('');

  // Premium Custom Alerta & SMS state variables
  const [alertSuccessChannel, setAlertSuccessChannel] = useState<string | null>(null);
  const [alertSuccessMessage, setAlertSuccessMessage] = useState<string | null>(null);
  const [alertChannel, setAlertChannel] = useState<'sistema' | 'sms' | 'whatsapp' | 'email'>('sistema');
  const [showTemplatesSelector, setShowTemplatesSelector] = useState<boolean>(false);
  const [customDialog, setCustomDialog] = useState<{
    title: string;
    message: string;
    type: 'success' | 'info' | 'warning';
    primaryAction?: {
      label: string;
      onClick: () => void;
    };
    secondaryActionLabel?: string;
  } | null>(null);
  const [trackingModalOrder, setTrackingModalOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!adminSelectedSupplierId && suppliers.length > 0) {
      setAdminSelectedSupplierId(suppliers[0].id);
    }
  }, [suppliers, adminSelectedSupplierId]);

  const trackingSteps = [
    { status: 'RECEBIDO', title: '1. Pedido Registado', desc: 'Sua solicitação de intermediação entre Cabinda e Luanda foi salva.' },
    { status: 'ANALISE', title: '2. Em Análisando', desc: 'Nossa equipa localiza fisicamente o produto em Luanda de forma fiscal.' },
    { status: 'ORCADO', title: '3. Orçamento Pronto', desc: 'O valor total foi calculado. Aguardamos sua aprovação para efetuar a compra.' },
    { status: 'PAGO', title: '4. Pagamento Confirmado', desc: 'Confirmamos o pagamento. Nossos compradores estão se deslocando ao fornecedor.' },
    { status: 'COMPRADO', title: '5. Mercadoria Adquirida', desc: 'Produto comprado e faturado fisicamente. Sendo preparado para embalagem.' },
    { status: 'TRANSPORTE', title: '6. Lote em Trânsito', desc: 'Produto entregue ao despachante marítimo ou aéreo parceiro.' },
    { status: 'CABINDA', title: '7. Chegou a Cabinda', desc: 'A carga deu entrada física no Porto de Cabinda e segue para descarga.' },
    { status: 'LEVANTAMENTO', title: '8. Disponível p/ Balcão', desc: 'Mercadoria desalfandegada no balcão de Cabinda. Pronto para entrega.' },
    { status: 'ENTREGUE', title: '9. Entrega Concluída', desc: 'Mercadoria entregue ou levantada com sucesso no balcão.' }
  ] as const;

  const getCurrentStatusIndex = (status: OrderStatus): number => {
    return trackingSteps.findIndex(step => step.status === status);
  };

  const showModalAlert = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setCustomDialog({ title, message, type });
  };

  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColabForm.name || !newColabForm.phone) {
      showModalAlert('Campos em falta', 'Por favor, preencha pelo menos o nome e o telemóvel do novo colaborador.', 'warning');
      return;
    }
    const colId = `colab-${Date.now()}`;
    const col: Collaborator = {
      id: colId,
      name: newColabForm.name,
      phone: newColabForm.phone,
      email: newColabForm.email || `${newColabForm.name.toLowerCase().replace(/\s+/g, '.')}@mediadorcabinda.com`,
      role: newColabForm.role,
      defaultCommissionPercentage: Number(newColabForm.defaultCommissionPercentage) || 12,
      totalSalesBrought: 0,
      totalEarnedCommissions: 0,
      joinedAt: new Date().toISOString()
    };
    
    onUpdateCollaborators([...collaborators, col]);
    setNewColabForm({
      name: '',
      phone: '',
      email: '',
      role: 'Consultor de Negócios / Afiliado',
      defaultCommissionPercentage: 12
    });
    
    showModalAlert('Colaborador Cadastrado', `O colaborador ${col.name} foi adicionado com sucesso à equipa comercial com percentagem de comissão padrão de ${col.defaultCommissionPercentage}%.`, 'success');
  };

  const handleAddColabSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColabSaleForm.collaboratorId || !newColabSaleForm.clientName || !newColabSaleForm.saleDescription) {
      showModalAlert('Campos em falta', 'Por favor, selecione um colaborador e preencha todos os dados da venda.', 'warning');
      return;
    }
    
    const col = collaborators.find(c => c.id === newColabSaleForm.collaboratorId);
    if (!col) return;
    
    const calculatedCommission = Math.floor(Number(newColabSaleForm.commissionPrice) * (Number(newColabSaleForm.collaboratorPercentage) / 100));
    
    const saleId = `sale-${Date.now()}`;
    const newSale: CollaboratorSale = {
      id: saleId,
      collaboratorId: col.id,
      collaboratorName: col.name,
      clientName: newColabSaleForm.clientName,
      saleDescription: newColabSaleForm.saleDescription,
      saleAmount: Number(newColabSaleForm.saleAmount) || 0,
      commissionPrice: Number(newColabSaleForm.commissionPrice) || 0,
      collaboratorPercentage: Number(newColabSaleForm.collaboratorPercentage) || col.defaultCommissionPercentage,
      calculatedCommission: calculatedCommission,
      status: 'pendente' as 'pago' | 'pendente',
      createdAt: new Date().toISOString()
    };
    
    const updatedSales = [newSale, ...collaboratorSales];
    const updatedColabs = collaborators.map(c => {
      if (c.id === col.id) {
        return {
          ...c,
          totalSalesBrought: c.totalSalesBrought + 1
        };
      }
      return c;
    });

    onUpdateCollaboratorSales(updatedSales);
    onUpdateCollaborators(updatedColabs);
    
    setNewColabSaleForm({
      collaboratorId: '',
      clientName: '',
      saleDescription: '',
      saleAmount: 220000,
      commissionPrice: 35000,
      collaboratorPercentage: 12
    });
    
    showModalAlert('Venda Registada para Organização', `A venda promovida por ${col.name} para o cliente "${newSale.clientName}" foi registada. A comissão de ${newSale.collaboratorPercentage}% representará um ganho de ${formatCurrency(calculatedCommission)} para ele após a liquidação oficial.`, 'success');
  };

  const handleToggleSaleStatus = (saleId: string) => {
    let updatedColabs = [...collaborators];
    const updatedSales = collaboratorSales.map(s => {
      if (s.id === saleId) {
        const newStatus: 'pago' | 'pendente' = s.status === 'pendente' ? 'pago' : 'pendente';
        const diff = newStatus === 'pago' ? s.calculatedCommission : -s.calculatedCommission;
        
        updatedColabs = updatedColabs.map(c => {
          if (c.id === s.collaboratorId) {
            return {
              ...c,
              totalEarnedCommissions: Math.max(0, c.totalEarnedCommissions + diff)
            };
          }
          return c;
        });
        
        return { ...s, status: newStatus };
      }
      return s;
    });
    
    onUpdateCollaboratorSales(updatedSales);
    onUpdateCollaborators(updatedColabs);
    speak("Estado de liquidação da comissão alterado.");
  };

  const handleDeleteColabSale = (saleId: string) => {
    const sale = collaboratorSales.find(s => s.id === saleId);
    if (!sale) return;
    
    const updatedSales = collaboratorSales.filter(s => s.id !== saleId);
    const updatedColabs = collaborators.map(c => {
      if (c.id === sale.collaboratorId) {
        return {
          ...c,
          totalSalesBrought: Math.max(0, c.totalSalesBrought - 1),
          totalEarnedCommissions: Math.max(0, c.totalEarnedCommissions - (sale.status === 'pago' ? sale.calculatedCommission : 0))
        };
      }
      return c;
    });
    
    onUpdateCollaboratorSales(updatedSales);
    onUpdateCollaborators(updatedColabs);
    showModalAlert('Venda Removida', 'A venda do colaborador foi removida e as comissões pendentes foram recalculadas.', 'warning');
  };

  const activeOrder = orders.find(o => o.id === selectedOrderId);

  // FINANCIAL FORMULAS & ANALYTICS
  const ordersTotalValue = orders.reduce((acc, ord) => acc + (ord.budgetRawPrice || 0), 0);
  const ordersTotalShipping = orders.reduce((acc, ord) => acc + (ord.budgetShipping || 0), 0);
  const totalCommissionProfit = orders.reduce((acc, ord) => acc + (ord.commissionAmount || 0), 0);
  
  const totalRevenueCollected = orders.reduce((acc, ord) => {
    return acc + (ord.paid ? (ord.totalAmount || 0) : 0);
  }, 0);

  const pendingOrdersCount = orders.filter(o => o.status === 'RECEBIDO' || o.status === 'ANALISE').length;
  const transitOrdersCount = orders.filter(o => o.status === 'TRANSPORTE').length;
  const activeComplaints = orders.filter(o => o.complaint && !o.complaintResolved);

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return 'AOA 0,00';
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0 }).format(val);
  };

  const speak = (txt: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(txt);
        utterance.lang = 'pt-AO';
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Speech synthesis failed:", err);
      }
    }
  };

  const handleCreateQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;

    const commissionAmount = Math.round(rawPrice * commissionRate);
    const totalAmount = rawPrice + shippingCost + dispatchFee + commissionAmount;

    const updated: Order = {
      ...activeOrder,
      budgetRawPrice: rawPrice,
      budgetShipping: shippingCost,
      dispatchFee: dispatchFee,
      commissionRate: commissionRate,
      commissionAmount: commissionAmount,
      totalAmount: totalAmount,
      status: 'ORCADO'
    };

    onUpdateOrder(updated);

    // Notify client
    onAddNotification({
      id: `notif-${Date.now()}`,
      clientId: activeOrder.clientId,
      orderId: activeOrder.id,
      title: 'Orçamento Comercial Disponível',
      message: `A sua encomenda de "${activeOrder.productName}" foi orçada pelo Mediador Cabinda. Total: ${formatCurrency(totalAmount)}.`,
      read: false,
      createdAt: new Date().toISOString()
    });

    showModalAlert(
      'Orçamento Enviado',
      `O orçamento de intermediação de compra para a encomenda "${activeOrder.productName}" foi submetido com sucesso!\n\nTotal Geral: ${formatCurrency(totalAmount)}\n\nO cliente receberá uma notificação instantânea e o painel de faturas já se encontra disponível no ecrã dele.`
    );
  };

  const handleRegisterPurchase = () => {
    if (!activeOrder) return;
    
    const docName = uploadedReceiptName.trim() || `Fatura_Fornecedor_${activeOrder.id}_${Math.floor(1000 + Math.random() * 9000)}.pdf`;

    const updated: Order = {
      ...activeOrder,
      status: 'COMPRADO',
      checkoutProofUrl: docName
    };

    onUpdateOrder(updated);

    // Notify client
    onAddNotification({
      id: `notif-${Date.now()}`,
      clientId: activeOrder.clientId,
      orderId: activeOrder.id,
      title: 'Mercadoria Adquirida em Luanda',
      message: `Temos o comprovativo de compra da sua encomenda de "${activeOrder.productName}". Pronto para despacho!`,
      read: false,
      createdAt: new Date().toISOString()
    });

    setUploadedReceiptName('');
  };

  const handleGenerateAutoGuide = () => {
    const autoCode = `GUI-CB-${Math.floor(100000 + Math.random() * 900000)}`;
    setGuideNumber(autoCode);
    showModalAlert('Guia de Carga Gerada', `Número de Guia Oficial da AGT gerado com sucesso: ${autoCode}`, 'info');
  };

  const handleShareTrackingMessage = (order: Order) => {
    const trackingStepsTitles: Record<OrderStatus, string> = {
      'RECEBIDO': '1. Pedido Registado no Sistema',
      'ANALISE': '2. Em Análise Técnica & Cotação',
      'ORCADO': '3. Orçamento Pronto para Aprovação',
      'PAGO': '4. Pagamento Validado (Ordem de Compra Emitida)',
      'COMPRADO': '5. Mercadoria Comprada em Luanda & Inspecionada',
      'TRANSPORTE': '6. Carga em Trânsito (Cabotagem Marítima / Aérea)',
      'CABINDA': '7. Carga Desembarcada no Porto de Cabinda',
      'LEVANTAMENTO': '8. Disponível para Levantamento no Armazém C-4',
      'ENTREGUE': '9. Encomenda Entregue com Sucesso!'
    };

    const statusLabel = trackingStepsTitles[order.status] || order.status;
    const guideTxt = order.shippingGuideNumber ? order.shippingGuideNumber : 'A ser emitida no despacho aduaneiro';
    const carrierTxt = order.shippingCarrier || 'Cabinda Cargas / Cabotagem Fluvial-Marítima';
    const estimateTxt = order.estimateDeliveryDate || '3 a 5 dias úteis';

    const message = `📦 *MEDIADOR CABINDA LDA - CÓDIGO DE RASTREIO OFICIAL*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Cliente:* ${order.clientName}
🛍️ *Mercadoria:* ${order.productName} (Qtd: ${order.quantity})
🔖 *Código de Rastreio:* *${order.id}*
📄 *Guia de Trânsito AGT:* ${guideTxt}
🚢 *Transportadora:* ${carrierTxt}
📍 *Estado Atual:* *${statusLabel}*
📅 *Previsão de Chegada:* ${estimateTxt}
🏢 *Local de Levantamento:* Armazém C-4, Recinto do Porto de Cabinda
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 *Como Rastrear a Carga em Tempo Real:*
1. Abra o aplicativo Mediador Cabinda
2. No campo "Acompanhar Pedidos", insira o código: *${order.id}*
3. Acompanhe as 9 etapas em tempo real e a posição do barco no mapa!
💬 Dúvidas 24/7? Pergunte ao nosso Mano Mediador IA no app.

_Mediador Cabinda Lda — A sua ponte comercial segura entre Luanda e Cabinda._`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(message);
    }

    const cleanPhone = (order.clientPhone || '').replace(/\D/g, '');
    if (cleanPhone) {
      const whatsappUrl = `https://wa.me/${cleanPhone.startsWith('244') ? cleanPhone : '244' + cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      showModalAlert(
        'Mensagem de Rastreio Gerada',
        `O código de rastreio ${order.id} e a mensagem formatada foram copiados para a sua área de transferência e o WhatsApp foi aberto para o cliente ${order.clientName} (${order.clientPhone})!`,
        'success'
      );
    } else {
      showModalAlert(
        'Mensagem de Rastreio Copiada',
        `A mensagem com o código de rastreio ${order.id} foi copiada para a área de transferência! Pode colá-la no WhatsApp, SMS ou e-mail do cliente.\n\n${message}`,
        'success'
      );
    }
  };

  const handleDispatchCargo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;

    const selectedCarrier = carriersList.find(c => c.id === carrierId);

    const updated: Order = {
      ...activeOrder,
      shippingCarrier: selectedCarrier?.name || 'Cabinda Cargas',
      shippingGuideNumber: guideNumber || `GUI-CB-${Math.floor(10000 + Math.random() * 90000)}`,
      shippingDate: shippingDate,
      estimateDeliveryDate: deliveryEstimate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      status: 'TRANSPORTE'
    };

    onUpdateOrder(updated);

    // Notify client
    onAddNotification({
      id: `notif-${Date.now()}`,
      clientId: activeOrder.clientId,
      orderId: activeOrder.id,
      title: 'Carga Expedida para Cabinda',
      message: `A mercadoria de "${activeOrder.productName}" está a caminho por via integrada na transportadora ${selectedCarrier?.name}.`,
      read: false,
      createdAt: new Date().toISOString()
    });

    setGuideNumber('');
  };

  const advanceOrderStatus = (targetStatus: OrderStatus) => {
    if (!activeOrder) return;

    // Award loyalty reward points inside completion of order
    let earnedPoints = activeOrder.pointsEarned || 0;
    if (targetStatus === 'ENTREGUE') {
      earnedPoints = Math.round((activeOrder.totalAmount || 0) / 1000);
    }

    const updated: Order = {
      ...activeOrder,
      status: targetStatus,
      pointsEarned: earnedPoints
    };

    onUpdateOrder(updated);

    // Notify client
    const statusTitles: Record<string, string> = {
      'CABINDA': 'Carga Chegou a Cabinda',
      'LEVANTAMENTO': 'Pronta Para Levantamento',
      'ENTREGUE': 'Encomenda Entregue'
    };

    const statusMsgs: Record<string, string> = {
      'CABINDA': `A sua mercadoria já se encontra descarregada no posto comercial de Cabinda.`,
      'LEVANTAMENTO': `Por favor, dirija-se ao nosso escritório central ou aguarde o estafeta ao domicílio.`,
      'ENTREGUE': `Obrigado por utilizar os serviços do Mediador Cabinda! Esperamos obter a sua avaliação.`
    };

    onAddNotification({
      id: `notif-${Date.now()}`,
      clientId: activeOrder.clientId,
      orderId: activeOrder.id,
      title: statusTitles[targetStatus] || 'Atualização de Rastreio',
      message: statusMsgs[targetStatus] || `O estado do seu pedido mudou para ${targetStatus}`,
      read: false,
      createdAt: new Date().toISOString()
    });
  };

  const handleResolveComplaint = (orderId: string) => {
    const target = orders.find(o => o.id === orderId);
    if (!target) return;

    const updated: Order = {
      ...target,
      complaintResolved: true
    };
    onUpdateOrder(updated);
    showModalAlert(
      'Incidente Resolvido',
      `A reclamação comercial associada ao pedido de ID "${orderId}" foi marcada como resolvida judicialmente de forma bem-sucedida, reestabelecendo o fluxo logístico normal!`,
      'success'
    );
  };

  const handleAddCarrier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCarrier.name || !newCarrier.phone) return;

    const added: CarrierCompany = {
      id: `carr-${Date.now()}`,
      ...newCarrier
    };

    onAddCarrier(added);
    setNewCarrier({ name: '', phone: '', baseRatePerKg: 1000, expectedDays: 4 });
  };

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'TODOS') return true;
    return o.status === orderFilter;
  });

  return (
    <div className="space-y-6 pb-28" id="admin-dashboard-root">
      {/* Top Banner Administration Warning / Demo indicator */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 text-amber-700 p-2.5 rounded-xl">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Canal de Administração Oficial</h3>
            <p className="text-xs text-slate-500">Módulo completo para gerir intermediações, cadastrar guias, orçar produtos e analisar lucros.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onChangeRole && (
            <button
              onClick={() => {
                onChangeRole('client');
                speak("Alternando para o Modo de Pré-visualização da Área do Cliente.");
              }}
              className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 hover:from-slate-900 hover:to-slate-850 text-amber-400 border border-amber-400/50 text-xs font-black py-2.5 px-4 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md uppercase tracking-wider active:scale-95"
              id="admin-switch-to-client-view-btn"
              title="Aceder à área do cliente em modo de pré-visualização de administrador"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Visualizar Área do Cliente</span>
            </button>
          )}

          <button
            onClick={() => {
              setActiveTab('suppliers');
              if (!adminSelectedSupplierId && suppliers.length > 0) {
                setAdminSelectedSupplierId(suppliers[0].id);
              }
              setShowAddProductForm(true);
              speak("Abrindo o formulário de cadastro de novos produtos no catálogo do parceiro.");
            }}
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black py-2.5 px-4 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs uppercase tracking-wider"
          >
            <span>➕ Adicionar Produto ao Catálogo</span>
          </button>

          <button
            onClick={() => {
              const affiliateShare = totalCommissionProfit * 0.30;
              const operationalFund = totalCommissionProfit * 0.20;
              const companyReserve = totalCommissionProfit * 0.50;
              
              const report = `📊 RELATÓRIO OPERACIONAL & FINANCEIRO DE MEDIAÇÃO\n` +
                `--------------------------------------------------\n` +
                `• Volume de Intermediações: ${orders.length} lotes listados\n` +
                `• Total de Receitas Cobradas (Liquidadas): ${formatCurrency(totalRevenueCollected)}\n` +
                `• Comissão Bruta do Mediador (Acumulada): ${formatCurrency(totalCommissionProfit)}\n` +
                `• Custo de Frete Marítimo Acumulado: ${formatCurrency(ordersTotalShipping)}\n` +
                `• Conflitos / Reclamações Pendentes: ${activeComplaints.length} incidentes\n\n` +
                `📋 DISTRIBUIÇÃO ESTRATÉGICA DAS COMISSÕES (Rateio 3% / 2% / 5%):\n` +
                `--------------------------------------------------\n` +
                `👥 Fundo de Afiliados (3%): ${formatCurrency(affiliateShare)}\n` +
                `   (Garante o pagamento automático dos captadores por negócio realizado)\n` +
                `⚓ Fundo Operacional de Despacho (2%): ${formatCurrency(operationalFund)}\n` +
                `   (Reserva para despesas aduaneiras e logísticas extras em Luanda)\n` +
                `🏢 Conta Master da Empresa (5%): ${formatCurrency(companyReserve)}\n` +
                `   (Destinado ao pagamento de salários dos funcionários fixos, como os representatives locais em Luanda e Cabinda, e reinvestimento)\n\n` +
                `* Nota do Gestor: Na medida em que o volume de clientes fidelizar, a despesa fixa será totalmente sustentada pelo Fundo Master de 5%, garantindo salários fixos e previsibilidade orçamental.`;
              showModalAlert('Balanço Comercial Extraído', report, 'info');
            }}
            className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold py-2.5 px-4 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Emitir Balanço Comercial
          </button>

          <button
            onClick={() => {
              setShowSecurityModal(true);
              speak("Abrindo painel de segurança master e gestão de dados do sistema.");
            }}
            className="bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800 text-xs font-black py-2.5 px-4 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
            id="admin-security-and-wipe-btn"
            title="Credenciais de Administrador & Reinício de Banco de Dados"
          >
            <ShieldCheck className="w-4 h-4 text-red-400" />
            <span>Chave Master & Dados</span>
          </button>
        </div>
      </div>

      {/* 🔍 LOCALIZADOR GLOBAL DE ARTIGO POR CÓDIGO (PRD-XXXX) & EMPRESA VENDEDORA */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-400/40 rounded-3xl p-4 sm:p-5 text-white shadow-xl space-y-4" id="admin-global-product-finder">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-lg font-black shadow-md shrink-0">
              🔍
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-black tracking-wide text-white uppercase flex items-center gap-1.5">
                  Localizador de Produto por Código & Empresa Vendedora
                </h3>
                <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                  PRD-XXXX
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                Digite ou selecione o código do artigo para visualizar a fotografia ampliada e obter todos os dados de contacto da empresa (Telefone, WhatsApp, E-mail, NIF e Armazém) para solicitar o produto.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {adminProductCodeSearch && (
              <button
                type="button"
                onClick={() => setAdminProductCodeSearch('')}
                className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                ✕ Limpar Pesquisa
              </button>
            )}
          </div>
        </div>

        {/* Input Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="🔎 Insira o código do produto (ex: PRD-1001, PRD-1002, PRD-1003) ou nome do artigo / empresa..."
            value={adminProductCodeSearch}
            onChange={(e) => setAdminProductCodeSearch(e.target.value)}
            className="w-full bg-slate-850 text-white placeholder:text-slate-400 border-2 border-slate-700 focus:border-amber-400 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold focus:outline-none transition-all shadow-inner"
          />
        </div>

        {/* Quick Clickable Product Code Chips */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span>⚡ Códigos Rápidos Cadastrados no Sistema:</span>
            <span className="text-amber-400">{supplierProducts.length} artigos catalogados</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {supplierProducts.map((p) => {
              const code = getProductCode(p);
              const isSelected = adminProductCodeSearch.toUpperCase() === code.toUpperCase();
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setAdminProductCodeSearch(code);
                    setAdminInspectedProduct(p);
                  }}
                  className={`text-[10.5px] px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300 shadow-md scale-102'
                      : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700'
                  }`}
                  title={`${code}: ${p.name}`}
                >
                  <span className="font-mono text-amber-300 font-black">{code}</span>
                  <span className="truncate max-w-[130px] font-medium text-slate-300">{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Real-time Match Results & Full Intermediation Sheet */}
        {adminProductCodeSearch.trim().length > 0 && (() => {
          const q = adminProductCodeSearch.toLowerCase().trim();
          const matched = supplierProducts.filter(p => {
            const pCode = getProductCode(p).toLowerCase();
            const pName = p.name.toLowerCase();
            const pDesc = (p.description || '').toLowerCase();
            const pLoc = (p.location || '').toLowerCase();
            const sup = suppliers.find(s => s.id === p.supplierId);
            const sName = (sup?.name || '').toLowerCase();
            return pCode.includes(q) || pName.includes(q) || pDesc.includes(q) || pLoc.includes(q) || sName.includes(q);
          });

          if (matched.length === 0) {
            return (
              <div className="bg-slate-850/80 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 space-y-2 animate-fade-in">
                <p className="text-sm font-bold text-slate-300">
                  Nenhum produto encontrado com o código ou termo "{adminProductCodeSearch}"
                </p>
                <p className="text-xs text-slate-500">
                  Verifique se o código está correto (ex: PRD-1001, PRD-1002) ou cadastre o artigo na aba <strong>"Parceiros"</strong>.
                </p>
              </div>
            );
          }

          return (
            <div className="space-y-4 pt-1 animate-fade-in">
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <span>📦</span> {matched.length} {matched.length === 1 ? 'Artigo Encontrado' : 'Artigos Encontrados'} para "{adminProductCodeSearch}"
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Clique na foto para ampliar ou use os botões rápidos para contactar o vendedor
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {matched.map((prod) => {
                  const code = getProductCode(prod);
                  const sup = suppliers.find(s => s.id === prod.supplierId);
                  const linkedOrders = orders.filter(o => 
                    (o.productCode && o.productCode.toUpperCase() === code.toUpperCase()) ||
                    o.productName.toLowerCase().includes(prod.name.toLowerCase()) ||
                    (o.notes && o.notes.includes(code))
                  );

                  const sellerPhone = sup?.phoneHidden || sup?.whatsapp || '+244 923 000 000';
                  const cleanPhone = sellerPhone.replace(/\D/g, '');
                  const whatsappMsg = `Olá ${sup?.name || 'Parceiro'}! Somos da Direção de Intermediação do Mediador Cabinda Lda. Temos um cliente em Cabinda interessado no artigo [CÓDIGO: ${code}] (${prod.name}). Solicitamos confirmação de stock imediato e envio de dados para faturação e levantamento da mercadoria. Obrigado!`;

                  return (
                    <div key={prod.id} className="bg-slate-850 border-2 border-slate-700/80 hover:border-amber-400/70 rounded-2xl p-4 sm:p-5 text-slate-200 space-y-4 shadow-lg transition-all">
                      
                      {/* Top Row: Image + Product Core Info + Action Buttons */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                        
                        {/* High-res Image Preview */}
                        <div className="md:col-span-3 flex flex-col items-center">
                          <div 
                            onClick={() => setAdminImagePreviewUrl({ url: prod.photoUrl, title: `${code} - ${prod.name}` })}
                            className="relative group cursor-pointer w-full aspect-square max-w-[180px] rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-700 hover:border-amber-400 transition-all shadow-md"
                            title="Clique para ver a foto do artigo em ecrã inteiro"
                          >
                            <img 
                              src={prod.photoUrl} 
                              alt={prod.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                              referrerPolicy="no-referrer" 
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-xs text-white font-bold gap-1">
                              <span className="text-base">🔍</span>
                              <span>Ver Foto em Alta Resolução</span>
                            </div>
                            <div className="absolute top-2 left-2 bg-slate-950/80 text-amber-400 text-[9px] font-black px-2 py-0.5 rounded-md font-mono border border-white/10">
                              {code}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAdminImagePreviewUrl({ url: prod.photoUrl, title: `${code} - ${prod.name}` })}
                            className="mt-2 text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            🔍 Ver Foto Ampliada
                          </button>
                        </div>

                        {/* Product Technical Details */}
                        <div className="md:col-span-9 space-y-3">
                          
                          {/* Title & Badges */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-750 pb-2.5">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-black text-slate-950 bg-amber-400 px-2.5 py-0.5 rounded-lg shadow-xs">
                                  🏷️ {code}
                                </span>
                                <span className={`text-[9.5px] px-2 py-0.5 rounded-md font-extrabold uppercase ${
                                  prod.availability === 'imediata' ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700' :
                                  prod.availability === 'sob-pedido' ? 'bg-amber-900/80 text-amber-300 border border-amber-700' :
                                  'bg-red-900/80 text-red-300 border border-red-700'
                                }`}>
                                  {prod.availability === 'imediata' ? '✓ Stock Imediato' : prod.availability === 'sob-pedido' ? '⏳ Sob Pedido' : '✕ Esgotado'}
                                </span>
                                <span className="text-[10px] text-slate-300 font-bold bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                                  Stock: {prod.stock} unidades
                                </span>
                                <span className="text-[10px] text-slate-300 font-bold bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                                  📍 Armazém: {prod.location || 'Luanda'}
                                </span>
                              </div>
                              <h4 className="text-base font-black text-white">{prod.name}</h4>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Preço de Compra Fornecedor</span>
                              <span className="text-lg font-mono font-black text-amber-300">
                                {prod.price.toLocaleString('pt-AO')} AOA
                              </span>
                            </div>
                          </div>

                          {/* Description */}
                          {prod.description && (
                            <p className="text-xs text-slate-300 leading-relaxed font-medium bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                              {prod.description}
                            </p>
                          )}

                          {/* SELLER / SUPPLIER COMPLETE IDENTITY CARD (What user explicitly asked for) */}
                          <div className="bg-slate-900 border-2 border-amber-400/30 rounded-2xl p-3.5 sm:p-4 space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <p className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                <span>🏢</span> DADOS COMPLETOS DA EMPRESA QUE ESTÁ A VENDER
                              </p>
                              {sup && (
                                <span className={`text-[8.5px] px-2 py-0.5 rounded-md uppercase font-black tracking-wide ${
                                  sup.plan === 'diamante' ? 'bg-amber-500 text-white' :
                                  sup.plan === 'ouro' ? 'bg-amber-400 text-slate-950' :
                                  sup.plan === 'prata' ? 'bg-slate-400 text-white' :
                                  'bg-slate-800 text-slate-400'
                                }`}>
                                  Plano {sup.plan}
                                </span>
                              )}
                            </div>

                            {sup ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                                {/* Nome da Empresa */}
                                <div className="space-y-0.5">
                                  <span className="text-[9.5px] font-bold text-slate-400 uppercase">Nome da Empresa:</span>
                                  <p className="font-extrabold text-white text-sm">{sup.name}</p>
                                  <p className="text-[10px] text-slate-400">{sup.category} • {sup.city}</p>
                                </div>

                                {/* NIF */}
                                <div className="space-y-0.5">
                                  <span className="text-[9.5px] font-bold text-slate-400 uppercase">NIF / Registo Comercial:</span>
                                  <div className="flex items-center gap-1.5">
                                    <p className="font-mono font-bold text-amber-300 text-xs">{sup.nif || '5401928374'}</p>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard?.writeText(sup.nif || '5401928374');
                                        showModalAlert('NIF Copiado! 📋', `O NIF ${sup.nif || '5401928374'} da empresa ${sup.name} foi copiado com sucesso.`, 'info');
                                      }}
                                      className="text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700 cursor-pointer"
                                      title="Copiar NIF"
                                    >
                                      Copiar
                                    </button>
                                  </div>
                                  <p className="text-[10px] text-slate-400">Responsável: {sup.contactPerson || 'Gestor Comercial'}</p>
                                </div>

                                {/* Telefone & WhatsApp */}
                                <div className="space-y-0.5">
                                  <span className="text-[9.5px] font-bold text-slate-400 uppercase">Telefone / WhatsApp Comercial:</span>
                                  <p className="font-mono font-bold text-emerald-400 text-xs">{sellerPhone}</p>
                                  <p className="text-[9.5px] text-slate-500">🔒 Confidencial Gestão</p>
                                </div>

                                {/* Email */}
                                <div className="space-y-0.5 sm:col-span-2 lg:col-span-1">
                                  <span className="text-[9.5px] font-bold text-slate-400 uppercase">E-mail Comercial:</span>
                                  <p className="font-mono text-slate-200 text-[11px] truncate">{sup.emailHidden || 'contacto@empresa.ao'}</p>
                                  <a
                                    href={`mailto:${sup.emailHidden || 'contacto@empresa.ao'}?subject=${encodeURIComponent(`Intermediação de Compra - Artigo ${code} (${prod.name})`)}`}
                                    className="text-[9.5px] text-sky-400 hover:underline inline-block mt-0.5"
                                  >
                                    ✉️ Enviar E-mail ao Fornecedor
                                  </a>
                                </div>

                                {/* Endereço Físico do Armazém */}
                                <div className="space-y-0.5 sm:col-span-2">
                                  <span className="text-[9.5px] font-bold text-slate-400 uppercase">Endereço do Armazém / Loja:</span>
                                  <p className="text-slate-200 text-xs font-semibold flex items-start gap-1">
                                    <span>📍</span>
                                    <span>{sup.addressHidden || 'Armazém Central, Luanda, Angola'}</span>
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic">
                                Fornecedor não especificado para este produto.
                              </p>
                            )}

                            {/* FAST INTERMEDIATION ACTION BUTTONS */}
                            <div className="border-t border-slate-800 pt-3 flex flex-wrap items-center justify-between gap-2.5">
                              <div className="flex flex-wrap items-center gap-2">
                                {/* Direct WhatsApp Button */}
                                <a
                                  href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md active:scale-97 cursor-pointer"
                                  title="Abrir conversa no WhatsApp com o vendedor com mensagem de encomenda pré-formatada"
                                >
                                  <span>💬</span>
                                  <span>Solicitar Vendedor no WhatsApp</span>
                                </a>

                                {/* Direct Phone Call */}
                                <a
                                  href={`tel:${cleanPhone}`}
                                  className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                                >
                                  <span>📞</span>
                                  <span>Ligar ({sellerPhone})</span>
                                </a>

                                {/* Copy Full Sheet */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const fullText = `FICHA DE INTERMEDIAÇÃO • MEDIADOR CABINDA LDA.\n` +
                                      `-------------------------------------------\n` +
                                      `CÓDIGO ARTIGO: ${code}\n` +
                                      `PRODUTO: ${prod.name}\n` +
                                      `PREÇO BASE: ${prod.price.toLocaleString('pt-AO')} AOA\n` +
                                      `STOCK: ${prod.stock} un. (${prod.availability})\n` +
                                      `ARMAZÉM: ${prod.location || 'Luanda'}\n\n` +
                                      `EMPRESA VENDEDORA:\n` +
                                      `Nome: ${sup?.name || 'N/A'}\n` +
                                      `NIF: ${sup?.nif || 'N/A'}\n` +
                                      `Responsável: ${sup?.contactPerson || 'N/A'}\n` +
                                      `Telefone / WhatsApp: ${sellerPhone}\n` +
                                      `E-mail: ${sup?.emailHidden || 'N/A'}\n` +
                                      `Endereço: ${sup?.addressHidden || 'N/A'}`;
                                    navigator.clipboard?.writeText(fullText);
                                    showModalAlert('Ficha Completa Copiada! 📋', 'Todos os dados do artigo e da empresa vendedora foram copiados para a sua área de transferência.', 'success');
                                  }}
                                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <span>📋</span>
                                  <span>Copiar Ficha Completa</span>
                                </button>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveTab('suppliers');
                                    if (sup) setAdminSelectedSupplierId(sup.id);
                                  }}
                                  className="px-3 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Ver no Módulo Parceiros ➔</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Linked Customer Orders for this Product */}
                          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <span>📋</span> Encomendas & Clientes de Cabinda que solicitaram este código ({linkedOrders.length})
                              </span>
                            </div>

                            {linkedOrders.length === 0 ? (
                              <p className="text-[11px] text-slate-500 italic">
                                Nenhuma encomenda vinculada a este código de artigo até ao momento.
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                {linkedOrders.map(ord => (
                                  <div key={ord.id} className="bg-slate-800/90 border border-slate-700 p-2.5 rounded-lg text-xs space-y-1.5 flex flex-col justify-between">
                                    <div className="flex items-center justify-between">
                                      <span className="font-mono text-[10px] font-bold text-amber-400">{ord.id}</span>
                                      <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 font-bold uppercase">{ord.status}</span>
                                    </div>
                                    <div className="text-left text-[11px]">
                                      <p className="text-white font-semibold">{ord.clientName}</p>
                                      <p className="text-slate-400 text-[10px]">📞 {ord.clientPhone} • Qtd: {ord.quantity}</p>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-slate-700/60 pt-1.5 mt-1">
                                      <span className="font-mono font-bold text-[10px] text-emerald-400">
                                        {formatCurrency(ord.totalAmount || (ord.budgetRawPrice || prod.price) * ord.quantity)}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveTab('orders');
                                          setSelectedOrderId(ord.id);
                                        }}
                                        className="px-2 py-0.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded text-[9.5px] font-black cursor-pointer"
                                      >
                                        Abrir Ordem ➔
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>

      {/* ADMIN NAVIGATION TABS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 bg-white p-1.5 border border-slate-150 rounded-2xl gap-1.5 shadow-sm" id="admin-nav-tabs">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex items-center justify-center gap-2 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
            activeTab === 'metrics' ? 'bg-slate-900 text-amber-400 font-bold shadow-xs' : 'text-slate-500 hover:bg-slate-50'
          }`}
          id="adm-tab-metrics"
        >
          <BarChart className="w-4 h-4 shrink-0" />
          <span className="truncate">Métricas</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center justify-center gap-2 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
            activeTab === 'orders' ? 'bg-slate-900 text-amber-400 font-bold shadow-xs' : 'text-slate-500 hover:bg-slate-50'
          }`}
          id="adm-tab-orders"
        >
          <Package className="w-4 h-4 shrink-0" />
          <span className="truncate">Encomendas</span>
          {pendingOrdersCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {pendingOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('clients')}
          className={`flex items-center justify-center gap-2 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
            activeTab === 'clients' ? 'bg-slate-900 text-amber-400 font-bold shadow-xs' : 'text-slate-500 hover:bg-slate-50'
          }`}
          id="adm-tab-clients"
        >
          <Users className="w-4 h-4 shrink-0" />
          <span className="truncate">Clientes</span>
        </button>

        <button
          onClick={() => setActiveTab('carriers')}
          className={`flex items-center justify-center gap-2 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
            activeTab === 'carriers' ? 'bg-slate-900 text-amber-400 font-bold shadow-xs' : 'text-slate-500 hover:bg-slate-50'
          }`}
          id="adm-tab-carriers"
        >
          <Truck className="w-4 h-4 shrink-0" />
          <span className="truncate">Armadores</span>
        </button>

        <button
          onClick={() => setActiveTab('complaints')}
          className={`flex items-center justify-center gap-2 py-2.5 text-xs font-extrabold rounded-xl transition-all relative cursor-pointer ${
            activeTab === 'complaints' ? 'bg-slate-900 text-amber-400 font-bold shadow-xs' : 'text-slate-500 hover:bg-slate-50'
          }`}
          id="adm-tab-complaints"
        >
          <Scale className="w-4 h-4 shrink-0" />
          <span className="truncate">Contencioso</span>
          {activeComplaints.length > 0 && (
            <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
              {activeComplaints.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center justify-center gap-2 py-2.5 text-xs font-extrabold rounded-xl transition-all relative cursor-pointer ${
            activeTab === 'chat' ? 'bg-slate-900 text-amber-400 font-bold shadow-xs' : 'text-slate-500 hover:bg-slate-50'
          }`}
          id="adm-tab-chat"
        >
          <MessageSquare className="w-4 h-4 shrink-0" />
          <span className="truncate">Mensagens Clientes</span>
          {messages.filter(m => m.sender === 'client' && !m.read).length > 0 && (
            <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
              {messages.filter(m => m.sender === 'client' && !m.read).length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`flex items-center justify-center gap-2 py-2.5 text-xs font-extrabold rounded-xl transition-all relative cursor-pointer ${
            activeTab === 'suppliers' ? 'bg-slate-900 text-amber-400 font-bold shadow-xs' : 'text-slate-500 hover:bg-slate-50'
          }`}
          id="adm-tab-suppliers"
        >
          <Award className="w-4 h-4 shrink-0 text-amber-500" />
          <span className="truncate flex items-center gap-1">Parceiros (Prod. e Serviços 🛠️)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('collaborators');
            speak("Painel de colaboradores e comissionários ativo.");
          }}
          className={`flex items-center justify-center gap-2 py-2.5 text-xs font-extrabold rounded-xl transition-all relative cursor-pointer ${
            activeTab === 'collaborators' ? 'bg-slate-900 text-amber-400 font-bold shadow-xs' : 'text-slate-500 hover:bg-slate-50'
          }`}
          id="adm-tab-collaborators"
        >
          <Handshake className="w-4 h-4 shrink-0 text-amber-500" />
          <span className="truncate">Colaboradores</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('chatbot');
            speak("Painel de controlo do Assistente Virtual IA 24 horas ativo.");
          }}
          className={`flex items-center justify-center gap-2 py-2.5 text-xs font-extrabold rounded-xl transition-all relative cursor-pointer ${
            activeTab === 'chatbot' ? 'bg-slate-900 text-amber-400 font-bold shadow-xs' : 'text-slate-500 hover:bg-slate-50'
          }`}
          id="adm-tab-chatbot"
        >
          <Bot className="w-4 h-4 shrink-0 text-amber-500" />
          <span className="truncate">Assistente IA</span>
          <span className="bg-emerald-500 text-white text-[9px] px-1 py-0.2 rounded-full font-bold">24h</span>
        </button>
      </div>

      {/* METRICS & GRAPHICS TAB */}
      {activeTab === 'metrics' && (
        <div className="space-y-6" id="adm-metrics-panel">
          
          {/* Welcome and Quick Guidance Alert */}
          <div className="bg-slate-900 border border-slate-800 text-white p-5 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden shadow-md">
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl"></div>
            <div className="relative z-10 space-y-1 text-left">
              <span className="text-[8px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-widest inline-block leading-none">
                Guia de Gestão Comercial
              </span>
              <h3 className="text-sm font-display font-black tracking-tight leading-none text-white">
                Como publicar Produtos ou Serviços homologados de Parceiros?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-2xl font-medium">
                Os serviços de serralharia civil, reparação metálica, frete cooperado ou produtos homologados são publicados sob a licença de nossos parceiros registados. Aceda ao separador <strong className="text-amber-400">Parceiros (Prod. e Serviços 🛠️)</strong> no menu lateral, selecione o parceiro homologado e publique o item de forma integrada.
              </p>
            </div>
            <div className="flex gap-2 relative z-10">
              <button
                onClick={() => {
                  setActiveTab('suppliers');
                  setSupplierSubTab('products');
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
              >
                📦 Publicar Produtos
              </button>
              <button
                onClick={() => {
                  setActiveTab('suppliers');
                  setSupplierSubTab('services');
                }}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
              >
                🛠️ Publicar Serviços
              </button>
            </div>
          </div>

          {/* Key Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-150 p-5 rounded-2xl shadow-xs">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Volume Total Orçado</p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{formatCurrency(ordersTotalValue)}</p>
              <div className="text-[10px] text-emerald-600 mt-2 flex items-center gap-1 font-medium">
                <TrendingUp className="w-3 h-3" />
                Negócio Intermediado
              </div>
            </div>

            <div className="bg-white border border-slate-150 p-5 rounded-2xl shadow-xs">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Comissões Acumuladas</p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{formatCurrency(totalCommissionProfit)}</p>
              <div className="text-[10px] text-sky-600 mt-2 flex items-center gap-1 font-medium">
                <TrendingUp className="w-3 h-3" />
                Rentabilidade Líquida 10%-15%
              </div>
            </div>

            <div className="bg-white border border-slate-150 p-5 rounded-2xl shadow-xs">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Líquido de Frete Cooperado</p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{formatCurrency(ordersTotalShipping)}</p>
              <div className="text-[10px] text-slate-500 mt-2 font-medium">
                Repassado às transportadoras
              </div>
            </div>

            <div className="bg-white border border-slate-150 p-5 rounded-2xl shadow-xs">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Fatura Bruta Recebida</p>
              <p className="text-xl font-extrabold text-slate-900 mt-1 text-emerald-700">{formatCurrency(totalRevenueCollected)}</p>
              <div className="text-[10px] text-amber-600 mt-2 flex items-center gap-1 font-medium">
                Pagamentos Liquidados
              </div>
            </div>
          </div>

          {/* Interactive SVG Profit Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Custom SVG Bar Chart: Profit per Order */}
            <div className="bg-white border border-slate-150 rounded-2xl p-6">
              <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Visualização de Lucros - Comissões por ID
              </h4>
              <div className="mt-4 flex justify-between h-48 items-end gap-3 px-2 border-b border-l border-slate-150 pb-2 relative">
                {orders.map((ord, i) => {
                  const comm = ord.commissionAmount || 0;
                  const maxCommValue = Math.max(...orders.map(o => o.commissionAmount || 5000), 20000);
                  const barHeightPct = comm > 0 ? (comm / maxCommValue) * 80 : 5; // offset margins
                  
                  return (
                    <div key={ord.id} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                      {/* Tooltip */}
                      <span className="hidden group-hover:block absolute top-0 bg-slate-900 text-white text-[10px] p-2 rounded-lg -translate-y-8 shadow-md z-40 whitespace-nowrap">
                        {ord.productName.substring(0, 20)}... <br/> Profit: <strong>{formatCurrency(comm)}</strong>
                      </span>
                      
                      {/* Interactive Bar */}
                      <div 
                        style={{ height: `${barHeightPct}%` }}
                        className="w-full bg-slate-900 group-hover:bg-sky-600 rounded-t-xs transition-all relative flex justify-center"
                      >
                        <span className="text-[9px] text-slate-500 absolute -top-5 font-mono font-bold">
                          {comm > 0 ? `${comm / 1000}k` : '0'}
                        </span>
                      </div>
                      
                      <span className="text-[10px] font-mono text-slate-600 mt-2 uppercase font-medium">{ord.id}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400 mt-3 text-center italic">Arraste com o ponteiro do rato sobre as barras para ver a fatura no fornecedor.</p>
            </div>

            {/* Business model layout info */}
            <div className="bg-white border border-slate-150 rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Clipboard className="w-4 h-4 text-sky-600" />
                Modelo de Negócio Cooperado Angola
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                O <strong>Mediador Cabinda</strong> ganha receitas diretas nas comissões de intermediação logística (10% a 15% sobre o custo original de fornecedores de Luanda), taxas operacionais de manuseio e seguros de trânsito fluvial ou aéreo de mercadorias pesadas.
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Comissão Média</span>
                  <p className="font-bold text-slate-800">12.5% ao Pedido</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Sinistralidade Legal</span>
                  <p className="font-bold text-slate-800">0% Extravios</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Fidelização Clientes</span>
                  <p className="font-bold text-slate-800">Bronze/Prata/Ouro</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Taxa Despacho Base</span>
                  <p className="font-bold text-slate-800">AOA 8,000 Fixo</p>
                </div>
              </div>
            </div>

          </div>

          {/* Quick Active Shipments tracking list */}
          <div className="bg-white border border-slate-150 rounded-2xl p-6">
            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-sky-600" />
              Mercadorias em Trânsito para Cabinda ({transitOrdersCount})
            </h4>
            
            {orders.filter(o => o.status === 'TRANSPORTE').length === 0 ? (
              <p className="text-xs text-slate-400">Nenhum lote marítimo/aéreo em trânsito neste momento.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold">
                    <tr>
                      <th className="p-3">Ref</th>
                      <th className="p-3">Cliente</th>
                      <th className="p-3">Produto</th>
                      <th className="p-3">Armador / Transportadora</th>
                      <th className="p-3">Nº de Guia</th>
                      <th className="p-3">Previsão Chegada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.filter(o => o.status === 'TRANSPORTE').map(ord => (
                      <tr key={ord.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono font-bold text-slate-900">{ord.id}</td>
                        <td className="p-3 font-semibold">{ord.clientName}</td>
                        <td className="p-3">{ord.productName}</td>
                        <td className="p-3">{ord.shippingCarrier}</td>
                        <td className="p-3 font-mono text-slate-800 font-bold">{ord.shippingGuideNumber}</td>
                        <td className="p-3 text-amber-600 font-bold">{ord.estimateDeliveryDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* MANAGE ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="adm-orders-panel">
          
          {/* Filtering sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filtro de Estado</h3>
              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                {filteredOrders.length}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              {(['TODOS', 'RECEBIDO', 'ANALISE', 'ORCADO', 'PAGO', 'COMPRADO', 'TRANSPORTE', 'CABINDA', 'LEVANTAMENTO', 'ENTREGUE'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderFilter(st)}
                  className={`w-full text-left px-3.5 py-2 rounded-xl text-xs flex justify-between items-center transition-all cursor-pointer font-medium ${
                    orderFilter === st 
                      ? 'bg-slate-900 text-amber-400 font-bold shadow-sm' 
                      : 'bg-white border border-slate-150 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span>{st === 'TODOS' ? 'Todos os Pedidos' : st}</span>
                  <span className="text-[10px] opacity-70">
                    ({orders.filter(o => st === 'TODOS' ? true : o.status === st).length})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed order form controls */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Horizontal inline picker of orders inside selected filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {filteredOrders.map(ord => (
                <button
                  key={ord.id}
                  onClick={() => {
                    setSelectedOrderId(ord.id);
                    // Preset forms
                    setRawPrice(ord.budgetRawPrice || 120000);
                    setShippingCost(ord.budgetShipping || 10000);
                    setDispatchFee(ord.dispatchFee || 8000);
                    setCommissionRate(ord.commissionRate || 0.12);
                  }}
                  className={`px-4 py-2 border rounded-xl text-xs shrink-0 cursor-pointer font-mono font-bold transition-all ${
                    selectedOrderId === ord.id 
                      ? 'bg-sky-600 text-white border-sky-400 ring-4 ring-sky-100' 
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {ord.id} ({ord.status})
                </button>
              ))}
            </div>

            {activeOrder ? (
              <div className="bg-white border border-slate-150 rounded-2xl shadow-xs overflow-hidden" id="adm-control-pad">
                
                {/* Header overview client request info */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 flex-wrap">
                      <span>Gestão Operativa - {activeOrder.id}</span>
                      <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-bold uppercase">
                        {activeOrder.status}
                      </span>
                      {activeOrder.productCode && (
                        <span className="text-[10px] font-mono font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md shadow-2xs">
                          🏷️ {activeOrder.productCode}
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 font-medium">Cliente: <strong>{activeOrder.clientName}</strong> ({activeOrder.clientPhone})</p>
                    
                    {/* Product & Catalog Reference with Image */}
                    {(() => {
                      const matchedProd = supplierProducts.find(p => 
                        (activeOrder.productCode && getProductCode(p).toUpperCase() === activeOrder.productCode.toUpperCase()) ||
                        p.name.toLowerCase().includes(activeOrder.productName.toLowerCase()) ||
                        activeOrder.productName.toLowerCase().includes(p.name.toLowerCase())
                      );

                      return (
                        <div className="mt-2 flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200">
                          {matchedProd && matchedProd.photoUrl ? (
                            <div 
                              onClick={() => setAdminImagePreviewUrl({ url: matchedProd.photoUrl, title: `${getProductCode(matchedProd)} - ${matchedProd.name}` })}
                              className="relative group cursor-pointer w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200"
                              title="Clique para ver a foto do produto em tamanho real"
                            >
                              <img 
                                src={matchedProd.photoUrl} 
                                alt={matchedProd.name} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                                referrerPolicy="no-referrer" 
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[8px] text-white font-bold">
                                🔍 Ver
                              </div>
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 text-base shrink-0">
                              📦
                            </div>
                          )}
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-slate-850 truncate">{activeOrder.productName}</p>
                              {matchedProd && (
                                <span className="text-[9px] font-mono font-black bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded border border-amber-200">
                                  {getProductCode(matchedProd)}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500">
                              Quantidade: <strong>{activeOrder.quantity} un.</strong> {matchedProd ? `• Preço Catálogo: ${matchedProd.price.toLocaleString('pt-AO')} AOA` : ''}
                            </p>
                          </div>
                          {matchedProd && (
                            <button
                              type="button"
                              onClick={() => {
                                setSupplierSubTab('products');
                                setActiveTab('suppliers');
                                setAdminProductCodeSearch(getProductCode(matchedProd));
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[9px] font-bold uppercase transition-colors shrink-0"
                            >
                              Ver no Catálogo ➔
                            </button>
                          )}
                        </div>
                      );
                    })()}

                    {activeOrder.notes && (
                      <p className="mt-2 text-[11px] p-2 bg-white rounded-lg border border-slate-150 text-slate-500 italic">
                        "Obs: {activeOrder.notes}"
                      </p>
                    )}

                    {activeOrder.productPhotos && activeOrder.productPhotos.length > 0 && (
                      <div className="mt-3 border-t border-slate-100 pt-3 space-y-2" id="admin-attached-photos-preview">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Fotos e Anexos Recebidos ({activeOrder.productPhotos.length})</p>
                        <div className="flex flex-wrap gap-2">
                          {activeOrder.productPhotos.map((photo, i) => (
                            <div key={i} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 h-10 w-28 relative flex items-center justify-between text-[10px] font-mono p-1 shadow-2xs">
                              {photo.type === 'document' ? (
                                <span className="truncate w-full text-center text-teal-700 font-bold" title={photo.name}>📄 {photo.name}</span>
                              ) : (
                                <>
                                  <img src={photo.url} className="w-8 h-8 object-cover rounded" alt="Visual" referrerPolicy="no-referrer" />
                                  <span className="truncate flex-1 text-center font-bold text-slate-700" title={photo.name}>{photo.type === 'camera' ? 'Câmara' : 'Galeria'}</span>
                                </>
                              )}
                              <button 
                                type="button"
                                onClick={() => {
                                  if (photo.type === 'document') {
                                    showModalAlert('Visualizador de Documentos', `Abrindo arquivo de importação em separado:\n\n• Nome: ${photo.name}\n• URL: ${photo.url}\n\nO ficheiro está anexado à operação aduaneira principal de ${activeOrder.clientName}.`, 'info');
                                  } else {
                                    showModalAlert('Visualização em Escala Real', `• Ficheiro de Imagem: ${photo.name}\n• Fonte: ${photo.type === 'camera' ? 'Dispositivo Móvel (Câmara ao Vivo)' : 'Upload de Galeria Local'}\n• URL do Servidor: ${photo.url}\n\nLigação segura restabelecida pelo Mediador.`, 'info');
                                  }
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right text-xs">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Data Entrada</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{new Date(activeOrder.createdAt).toLocaleString('pt-AO')}</p>
                    <div className="mt-3 flex flex-col gap-1.5 justify-end">
                      <button
                        type="button"
                        onClick={() => handleShareTrackingMessage(activeOrder)}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0 shadow-xs"
                        title="Partilhar código e link de rastreio formatado por WhatsApp ou copiar"
                      >
                        📲 Partilhar Rastreio (WhatsApp)
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowInvoiceModal(true)}
                        className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 hover:text-sky-800 rounded-lg text-[10px] font-black uppercase tracking-wide border border-sky-200 transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0"
                      >
                        📄 Fatura Digital
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const activeClient = clients.find(c => c.phone === activeOrder.clientPhone || c.name === activeOrder.clientName);
                          const clientTier = activeClient?.tier || 'Standard';
                          downloadOrderInvoice(activeOrder, clientTier);
                        }}
                        className="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0"
                      >
                        📥 Descarregar Fatura
                      </button>
                    </div>
                  </div>
                </div>

                {/* STEP-BY-STEP PROGRESS PIPELINE (1-9 NUMERICAL TRACKER) */}
                <div className="p-5 border-b border-slate-150 bg-slate-55/10" id="ord-step-by-step-pipeline">
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-sans tracking-wider">Passo-a-Passo da Evolução de Transporte</span>
                    <span className="text-[10px] font-bold text-sky-750 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">
                      Etapa {getCurrentStatusIndex(activeOrder.status) + 1} de 9: <span className="uppercase font-extrabold">{trackingSteps[getCurrentStatusIndex(activeOrder.status)]?.title.split('. ')[1] || 'Registado'}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2 shrink-0 scrollbar-none" style={{ minWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
                    {trackingSteps.map((step, idx) => {
                      const curIdx = getCurrentStatusIndex(activeOrder.status);
                      const isDone = idx < curIdx;
                      const isCurrent = idx === curIdx;
                      
                      return (
                        <div key={idx} className="flex-1 min-w-[65px] flex flex-col items-center relative group">
                          {/* Connector Line */}
                          {idx < 8 && (
                            <div className={`absolute left-[calc(50%+14px)] right-[-50%] top-3.5 h-[2px] z-0 ${
                              idx < curIdx ? 'bg-emerald-500' : 'bg-slate-200'
                            }`} />
                          )}
                          
                          {/* Bubble */}
                          <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 z-10 text-[10px] font-extrabold transition-all relative ${
                            isDone 
                              ? 'bg-emerald-500 border-emerald-500 text-white' 
                              : isCurrent 
                                ? 'bg-amber-400 border-amber-500 text-slate-950 ring-4 ring-amber-10 ring-offset-0 scale-105' 
                                : 'bg-white border-slate-200 text-slate-400'
                          }`} title={`${step.title}: ${step.desc}`}>
                            {isDone ? '✓' : idx + 1}
                          </div>
                          
                          {/* Step Label */}
                          <span className={`text-[8px] font-extrabold text-center mt-1.5 uppercase transition-colors tracking-tighter ${
                            isCurrent ? 'text-amber-550 font-black' : isDone ? 'text-slate-700' : 'text-slate-400'
                          }`}>
                            {step.title.split('. ')[1]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* DYNAMIC ACTION MODALS DEPEDING ON STATUS */}
                <div className="p-6 space-y-6">
                  
                  {/* STEP 1 & 2: CONVERT TO QUOTATION BUDGET */}
                  {(activeOrder.status === 'RECEBIDO' || activeOrder.status === 'ANALISE') && (
                    <div className="space-y-4">
                      <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                        <div>
                          <span className="font-bold">Formular Orçamento para Autorização</span>
                          <p className="mt-0.5">Certifique a viabilidade do produto no fornecedor antes de expedir o orçamento oficial. A comissão varia entre 10% e 15% conforme peso, tamanho e risco.</p>
                        </div>
                      </div>

                      <form onSubmit={handleCreateQuotation} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Preço Real do Artigo no Fornecedor (Luanda)</label>
                          <input
                            type="number"
                            value={rawPrice}
                            onChange={(e) => setRawPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                            required
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Custo Estimado de Frete Logístico (AOA)</label>
                          <input
                            type="number"
                            value={shippingCost}
                            onChange={(e) => setShippingCost(Math.max(0, parseFloat(e.target.value) || 0))}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                            required
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Custos Operacionais & Despacho Alandegário</label>
                          <input
                            type="number"
                            value={dispatchFee}
                            onChange={(e) => setDispatchFee(Math.max(0, parseFloat(e.target.value) || 0))}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                            required
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Taxa de Comissão Mediador ({commissionRate * 100}%)</label>
                          <select
                            value={commissionRate}
                            onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                          >
                            <option value={0.10}>10% (Promoção / Mínimo)</option>
                            <option value={0.12}>12% (Taxa Padrão Robusta)</option>
                            <option value={0.15}>15% (Carga Frágil / Alta comissão)</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2 p-3.5 bg-slate-100 rounded-xl space-y-2.5">
                          <div className="border-b pb-1.5 flex items-center justify-between">
                            <p className="font-bold text-slate-800 text-xs">Cálculo Resumido do Lote:</p>
                            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-sm font-semibold">Regras de Rateio Logístico</span>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3 text-[11px] text-slate-600">
                            <p>Fornecedor: <strong className="text-slate-900 block mt-0.5">{formatCurrency(rawPrice)}</strong></p>
                            <p>Comissão ({commissionRate * 100}%): <strong className="text-amber-700 block mt-0.5">{formatCurrency(rawPrice * commissionRate)}</strong></p>
                            <p>Total Cliente: <strong className="text-slate-950 block mt-0.5 text-xs">{formatCurrency(rawPrice + shippingCost + dispatchFee + (rawPrice * commissionRate))}</strong></p>
                          </div>

                          <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/60 space-y-1.5">
                            <p className="text-[9.5px] uppercase font-bold text-slate-500 tracking-wider">Rateio Interno da Comissão ({commissionRate * 100}%):</p>
                            <div className="grid grid-cols-3 gap-2 text-[10px] font-medium text-slate-600">
                              <div className="p-1.5 bg-slate-50 rounded-md">
                                <span className="text-slate-400 block text-[8px] uppercase font-bold">Afiliado (3%)</span>
                                <strong className="text-slate-850 font-mono">{(rawPrice * 0.03).toLocaleString('pt-AO')} Kz</strong>
                              </div>
                              <div className="p-1.5 bg-slate-50 rounded-md">
                                <span className="text-slate-400 block text-[8px] uppercase font-bold">Operações / Despacho (2%)</span>
                                <strong className="text-slate-850 font-mono">{(rawPrice * 0.02).toLocaleString('pt-AO')} Kz</strong>
                              </div>
                              <div className="p-1.5 bg-slate-50 rounded-md">
                                <span className="text-slate-400 block text-[8px] uppercase font-bold">Empresa (Restante)</span>
                                <strong className="text-slate-850 font-mono">{(rawPrice * (commissionRate - 0.05)).toLocaleString('pt-AO')} Kz</strong>
                              </div>
                            </div>
                            <p className="text-[8.5px] text-slate-400 leading-normal">
                              * Dos {commissionRate * 100}% cobrados, 3% são reservados garantidamente ao afiliador, 2% complementam despesas logísticas sobressalentes e o restante {(commissionRate - 0.05) * 100}% acumula na conta empresa para salários fixos dos representantes locais.
                            </p>
                          </div>
                        </div>

                        <div className="sm:col-span-2 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => advanceOrderStatus('ANALISE')}
                            className="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-bold"
                          >
                            Marcar 'Em Análise'
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 text-xs bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold shadow-sm"
                            id="submit-quotation-adm"
                          >
                            Emitir Orçamento Oficial ao Cliente
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* STEP 3: WAITING PAYMENT */}
                  {activeOrder.status === 'ORCADO' && (
                    <div className="p-4 border border-dashed border-slate-250 bg-slate-50/50 rounded-2xl text-center space-y-3">
                      <FileCheck className="w-8 h-8 text-slate-400 mx-auto" />
                      <h5 className="text-xs font-bold text-slate-700">Aguardando Liquidação do Cliente</h5>
                      <p className="text-[11px] text-slate-500 max-w-md mx-auto">O orçamento de {formatCurrency(activeOrder.totalAmount)} foi enviado. O cliente deve introduzir a transferência bancária ou dados do Multicaixa Express no respectivo painel para autorizarmos a compra em Luanda.</p>
                      
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            const updated: Order = {
                              ...activeOrder,
                              paid: true,
                              paymentMethod: 'transferencia',
                              paymentReference: 'ADMIN_MANUAL_FORCE',
                              status: 'PAGO'
                            };
                            onUpdateOrder(updated);
                            showModalAlert(
                              'Liquidação Manual Concluída',
                              `O pagamento de ${formatCurrency(activeOrder.totalAmount)} para o lote "${activeOrder.productName}" foi validado em tesouraria e reconciliado manualmente pelo Diretor Financeiro com absoluta conformidade!`,
                              'success'
                            );
                          }}
                          className="bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-lg hover:bg-sky-600 transition-colors font-bold cursor-pointer"
                        >
                          Aprovar Pagamento Manualmente (Ação do Gestor)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: CONFIRM PURCHASE & UPLOAD RECEIPT */}
                  {activeOrder.status === 'PAGO' && (
                    <div className="space-y-4">
                      <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl text-xs text-sky-800">
                        <h5 className="font-bold flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-sky-600" />
                          Pagamento Liquidado! Proceda à Compra Física
                        </h5>
                        <p className="mt-0.5">O cliente pagou a intermediação. Dirija-se ou contate o fornecedor <strong>{activeOrder.supplierName}</strong> ({activeOrder.supplierPhone}) localizado em <strong>{activeOrder.supplierLocation}</strong> para adquirir o artigo.</p>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Fatura do Fornecedor / Comprovativo Digital</label>
                          <input
                            type="text"
                            value={uploadedReceiptName}
                            onChange={(e) => setUploadedReceiptName(e.target.value)}
                            placeholder="Nome do Comprovativo (Ex: Fatura_Recibo_MundoDigital_992.pdf)"
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                          />
                        </div>

                        <div className="border border-dashed border-slate-200 p-4 rounded-xl text-center text-slate-400">
                          <FileText className="w-8 h-8 text-slate-350 mx-auto mb-1" />
                          <span className="text-[11px] text-slate-600">Simule upload arrastando a fatura digital obtida no retalhista</span>
                        </div>

                        <button
                          onClick={handleRegisterPurchase}
                          className="w-full bg-slate-900 border border-slate-800 text-white font-bold py-2 px-4 rounded-lg text-xs"
                        >
                          Concluir Compra da Mercadoria & Enviar Fatura
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 5: DELIVER TO TRANSPORT CARRIER PARTNER */}
                  {activeOrder.status === 'COMPRADO' && (
                    <div className="space-y-4">
                      <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-xs text-slate-700">
                        <h5 className="font-bold flex items-center gap-1.5">
                          <Truck className="w-4 h-4 text-sky-600" />
                          Despechar Lote para Transportação
                        </h5>
                        <p className="mt-0.5">Entregue o produto ao armador marítimo ou aéreo parceiro. Registre a guia oficial para o rastreio automático do cliente.</p>
                      </div>

                      <form onSubmit={handleDispatchCargo} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1 font-semibold">Parceiro de Logística Integrado</label>
                          <select
                            value={carrierId}
                            onChange={(e) => setCarrierId(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                          >
                            {carriersList.map(c => (
                              <option key={c.id} value={c.id}>{c.name} (Taxa Base Kg: {formatCurrency(c.baseRatePerKg)})</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block font-bold text-slate-700 font-semibold">Número da Guia de Carga (Guia Oficial)</label>
                            <button
                              type="button"
                              onClick={handleGenerateAutoGuide}
                              className="text-[9.5px] bg-sky-50 text-sky-700 hover:bg-sky-100 font-black px-2 py-0.5 rounded-md border border-sky-200 cursor-pointer transition-colors"
                            >
                              ⚡ Gerar Guia AGT
                            </button>
                          </div>
                          <input
                            type="text"
                            value={guideNumber}
                            onChange={(e) => setGuideNumber(e.target.value)}
                            placeholder="Ex: GUI-CB-992144"
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden font-mono"
                            required
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1 font-semibold">Data de Expedição</label>
                          <input
                            type="date"
                            value={shippingDate}
                            onChange={(e) => setShippingDate(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                            required
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1 font-semibold">Previsão de Entrega em Cabinda</label>
                          <input
                            type="date"
                            value={deliveryEstimate}
                            onChange={(e) => setDeliveryEstimate(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          className="sm:col-span-2 w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all"
                        >
                          Entregar Lote e Ativar Rastreio em Trânsito
                        </button>
                      </form>
                    </div>
                  )}

                  {/* STEP 6+: ADVANCE DELIVERY MILESTONES */}
                  {(activeOrder.status === 'TRANSPORTE' || activeOrder.status === 'CABINDA' || activeOrder.status === 'LEVANTAMENTO') && (
                    <div className="space-y-4">
                      <div className="p-4 bg-teal-50 border border-teal-100 rounded-xl text-xs text-teal-800">
                        <h5 className="font-bold">Controle Logístico do Trajeto</h5>
                        <p className="mt-0.5">Avance a mercadoria conforme reporte das transportadoras parceiras descarregando no Porto de Cabinda.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => advanceOrderStatus('CABINDA')}
                          disabled={activeOrder.status !== 'TRANSPORTE'}
                          className="p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4 text-green-650" />
                          Chegou a Cabinda
                        </button>
                        <button
                          type="button"
                          onClick={() => advanceOrderStatus('LEVANTAMENTO')}
                          disabled={activeOrder.status !== 'CABINDA'}
                          className="p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4 text-green-650" />
                          Pronto Levantamento
                        </button>
                        <button
                          type="button"
                          onClick={() => advanceOrderStatus('ENTREGUE')}
                          disabled={activeOrder.status !== 'LEVANTAMENTO'}
                          className="p-3 bg-slate-900 hover:bg-sky-600 text-white text-xs font-bold rounded-xl disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer"
                          id="btn-deliver-manual"
                        >
                          <FileCheck className="w-4 h-4" />
                          Confirmar Entregue
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ACTIVE COMPLETED ORDER VIEW */}
                  {activeOrder.status === 'ENTREGUE' && (
                    <div className="p-5 border border-emerald-100 bg-emerald-50/50 rounded-2xl text-xs text-slate-700 space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                        <FileCheck className="w-5 h-5" />
                        Compra e Intermediação Conclúida!
                      </div>
                      <p>O produto foi entregue em Cabinda. Os pontos de fidelidade associados foram atribuídos ao cliente.</p>
                      
                      {activeOrder.rating && (
                        <div className="p-3 bg-white border border-emerald-100 rounded-xl space-y-1 mt-2">
                          <div className="flex gap-1">
                            {Array.from({ length: activeOrder.rating }).map((_, i) => (
                              <svg key={i} className="w-4 h-4 text-amber-500 fill-amber-500" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <p className="font-semibold text-slate-800">Avaliação do Cliente: "{activeOrder.feedback}"</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Persisted messaging channel */}
                  <div className="border-t border-slate-100 pt-6">
                    <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Chat com {activeOrder.clientName}</h5>
                     <SharedChat
                      order={activeOrder}
                      currentUserRole="admin"
                      messages={messages}
                      clientId={activeOrder.clientId}
                      clients={clients}
                      orders={orders}
                      onSendMessage={(text, attach, isPri, sendr, chanId) => onSendMessage(chanId || activeOrder.id, text, attach, isPri, sendr)}
                      onMarkChannelAsRead={onMarkChannelAsRead}
                    />
                  </div>

                </div>

              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-16 text-center text-slate-400">
                <Package className="w-12 h-12 mx-auto text-slate-350 mb-3" />
                <h4 className="text-sm font-bold text-slate-700">Nenhum Pedido Filtrado</h4>
                <p className="text-xs text-slate-500">Selecione outro estado ou alterne os filtros acima.</p>
              </div>
            )}

          </div>

        </div>
      )}

      {/* CLIENTS MANAGER TAB - SECTOR ENHANCEMENT */}
      {activeTab === 'clients' && (() => {
        // Compute search matches dynamically
        const filteredClients = clients.filter(c => {
          const q = clientSearchQuery.toLowerCase().trim();
          if (!q) return true;
          return (
            c.name.toLowerCase().includes(q) ||
            c.id.toLowerCase().includes(q) ||
            c.nif.toLowerCase().includes(q) ||
            c.phone.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            (c.municipality && c.municipality.toLowerCase().includes(q)) ||
            (c.province && c.province.toLowerCase().includes(q))
          );
        });

        const selectedClient = clients.find(c => c.id === selectedDetailsClientId);
        const clientParticularOrders = selectedClient ? orders.filter(o => o.clientId === selectedClient.id) : [];

        return (
          <div className="space-y-6" id="adm-clients-panel">
            {/* Top Toolbar with Elegant Search input */}
            <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Gerenciamento de Clientes Ativos</h4>
                  <p className="text-xs text-slate-500 mt-1">Clique num cliente para inspecionar histórico de pedidos, abrir chats e registrar notificações.</p>
                </div>
                <div className="relative w-full md:w-85 shrink-0">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Pesquisar por Nome, NIF, Telemóvel ou Localidade..."
                    value={clientSearchQuery}
                    onChange={(e) => setClientSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all placeholder:text-slate-400"
                  />
                  {clientSearchQuery && (
                    <button
                      onClick={() => setClientSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Clients Table Panel */}
              <div className={`bg-white border border-slate-150 rounded-2xl p-6 shadow-xs ${selectedDetailsClientId ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Lista de Registos ({filteredClients.length})</h5>
                  {selectedDetailsClientId && (
                    <button 
                      onClick={() => setSelectedDetailsClientId(null)}
                      className="text-xs text-amber-600 hover:underline font-bold"
                    >
                      Ver em ecrã inteiro
                    </button>
                  )}
                </div>

                {filteredClients.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    <Users className="w-10 h-10 text-slate-350 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-bold">Nenhum cliente corresponde à pesquisa.</p>
                    <button 
                      onClick={() => setClientSearchQuery('')}
                      className="text-xs text-sky-600 font-bold decoration-amber-400 hover:underline mt-2 cursor-pointer"
                    >
                      Limpar filtro de pesquisa
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-6 px-6">
                    <table className="w-full text-left text-xs text-slate-600 min-w-[750px]">
                      <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold">
                        <tr>
                          <th className="p-3">Ref ID</th>
                          <th className="p-3">Nome Completo</th>
                          <th className="p-3">Telemóvel</th>
                          <th className="p-3">Província / Município</th>
                          <th className="p-3 text-right">Pontos</th>
                          <th className="p-3">Categoria</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredClients.map(c => {
                          const isSelected = selectedDetailsClientId === c.id;
                          return (
                            <tr 
                              key={c.id} 
                              onClick={() => {
                                const nextState = isSelected ? null : c.id;
                                setSelectedDetailsClientId(nextState);
                                if (nextState) {
                                  setTimeout(() => {
                                    document.getElementById('adm-client-detail-sidebar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  }, 150);
                                }
                              }}
                              className={`cursor-pointer transition-all ${
                                isSelected 
                                  ? 'bg-amber-50/40 font-semibold ring-2 ring-amber-200/20' 
                                  : 'hover:bg-slate-50/70'
                              }`}
                            >
                              <td className="p-3 font-mono font-bold text-slate-900">{c.id}</td>
                              <td className="p-3 font-bold text-slate-850">
                                <span className={isSelected ? 'text-amber-800' : ''}>{c.name}</span>
                              </td>
                              <td className="p-3 font-mono font-medium text-slate-550">{c.phone}</td>
                              <td className="p-3">{c.municipality}, {c.province}</td>
                              <td className="p-3 font-mono text-amber-600 font-semibold text-right">{c.points} pts</td>
                              <td className="p-3">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  c.tier === 'Ouro' ? 'bg-amber-100 text-amber-700 border border-amber-200' : c.tier === 'Prata' ? 'bg-slate-200 text-slate-805' : 'bg-orange-100 text-orange-700'
                                }`}>
                                  {c.tier}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Sidebar Action Drawer Panel (Requirement 1 & 2) */}
              {selectedClient && (
                <div className="lg:col-span-5 bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in" id="adm-client-detail-sidebar">
                  {/* Detailed Panel Header */}
                  <div className="flex items-start justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-900 text-amber-400 font-black flex items-center justify-center text-sm shadow-xs border border-slate-800 shrink-0">
                        {selectedClient.name.split(' ').map(n=>n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-tight">{selectedClient.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          NIF/ID: <span className="font-mono text-slate-650 font-bold">{selectedClient.nif || 'Não cadastrado'}</span>
                          <span>•</span>
                          Ref: <span className="font-mono text-slate-650 font-bold">{selectedClient.id}</span>
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedDetailsClientId(null)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Customer Information Sheet */}
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Informações Cadastrais</h5>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase leading-none">Telemóvel</span>
                        <span className="font-bold text-slate-800 block font-mono">{selectedClient.phone}</span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase leading-none">E-mail de Acesso</span>
                        <span className="font-semibold text-slate-705 block truncate" title={selectedClient.email}>{selectedClient.email}</span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1 col-span-2">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase leading-none">Local de Entrega / Morada</span>
                        <span className="font-medium text-slate-800">{selectedClient.municipality}, {selectedClient.province} — Angola</span>
                      </div>
                      
                      {/* Fidelity Balance Widget */}
                      <div className="p-3.5 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-center justify-between col-span-2">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-amber-600 shrink-0" />
                          <div>
                            <span className="block text-[9px] text-amber-800 font-bold uppercase leading-none">Fidelidade Mediador</span>
                            <span className="text-xs font-black text-slate-900 font-mono inline-block mt-1">{selectedClient.points} pontos de frete</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-lg shadow-xs">
                          {selectedClient.tier}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Complete Historical Activity Log matching user request */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Histórico de Cargas ({clientParticularOrders.length})</h5>
                      <span className="text-[10px] font-bold text-slate-405">Origem: Luanda {"->"} Cabinda</span>
                    </div>

                    {clientParticularOrders.length === 0 ? (
                      <div className="p-6 text-center bg-slate-50/50 border border-dashed rounded-xl text-xs text-slate-400 space-y-1">
                        <p className="font-bold text-slate-600">Sem pedidos no registo.</p>
                        <p className="text-[10px]">O cliente ainda não criou ordens de intermediação de compra.</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {clientParticularOrders.map(ord => {
                          const labelStyles = 
                            ord.status === 'RECEBIDO' ? 'bg-indigo-100 text-indigo-700' :
                            ord.status === 'ANALISE' ? 'bg-amber-100 text-amber-700' :
                            ord.status === 'ORCADO' ? 'bg-cyan-100 text-cyan-700' :
                            ord.status === 'PAGO' ? 'bg-green-100 text-green-700' :
                            ord.status === 'TRANSPORTE' ? 'bg-sky-100 text-sky-700' :
                            ord.status === 'COMPRADO' ? 'bg-blue-105 text-blue-700' :
                            ord.status === 'CABINDA' ? 'bg-teal-100 text-teal-700' :
                            ord.status === 'LEVANTAMENTO' ? 'bg-purple-100 text-purple-700' :
                            'bg-emerald-150 text-emerald-800';

                          return (
                            <button
                              key={ord.id}
                              onClick={() => {
                                setSelectedOrderId(ord.id);
                                setTrackingModalOrder(ord);
                                speak(`Visualizando evolução detalhada da carga ${ord.id} em forma de números.`);
                              }}
                              className="w-full p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 hover:border-slate-300 rounded-xl flex items-center justify-between text-left transition-all group cursor-pointer"
                            >
                              <div className="space-y-1 pr-2 truncate">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">{ord.id}</span>
                                  <span className="text-[10px] font-bold text-slate-855 truncate block">{ord.productName}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5 flex-wrap">
                                  <span>{ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('pt-AO') : 'Recente'}</span>
                                  <span>•</span>
                                  <span className="text-sky-600 font-extrabold flex items-center gap-0.5 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100 uppercase text-[9px]">
                                    Etapa {getCurrentStatusIndex(ord.status) + 1} de 9
                                  </span>
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1.5 shrink-0 text-right">
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${labelStyles}`}>
                                  {ord.status}
                                </span>
                                <span className="font-mono text-[11px] font-bold text-slate-650">
                                  {formatCurrency(ord.totalAmount || ord.budgetRawPrice || 0)}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Action desk: Opening direct chat channels */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Atendimento Comercial</h5>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const activeClientOrders = clientParticularOrders;
                          if (activeClientOrders.length > 0) {
                            setSelectedOrderId(activeClientOrders[0].id);
                            setTrackingModalOrder(activeClientOrders[0]);
                            speak(`Rastreando o processo de evolução da transportação em nove passos.`);
                          } else {
                            showModalAlert("Sem Carga Ativa", "Este cliente não possui nenhuma mercadoria em trânsito no momento.", "warning");
                          }
                        }}
                        className="flex items-center justify-center gap-1.5 p-2.5 bg-amber-400 hover:bg-amber-550 text-slate-950 font-black rounded-xl text-xs cursor-pointer transition-colors shadow-xs"
                      >
                        <Truck className="w-3.5 h-3.5 text-slate-950" />
                        <span>Acompanhar Entrega</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const activeClientOrders = clientParticularOrders;
                          if (activeClientOrders.length > 0) {
                            setSelectedOrderId(activeClientOrders[0].id);
                            setActiveTab('orders');
                            speak(`Abrindo chat de despacho para a carga do cliente`);
                          } else {
                            setActiveTab('chat');
                            speak(`Abrindo painel geral de conversação de suporte com ${selectedClient.name}`);
                          }
                        }}
                        className="flex items-center justify-center gap-1.5 p-2.5 bg-slate-905 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors shadow-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                        <span>Abrir Chat de Carga</span>
                      </button>
                    </div>

                    {/* Direct Quick-Push Alert Widget with Premium SMS Options and Zero Overflow Clipping */}
                    <div className="pt-2 border-t border-slate-150" id="direct-quick-alert-widget">
                      <div className="p-4 bg-amber-500/[0.04] border border-amber-400/20 rounded-2xl space-y-3.5">
                        
                        {/* Title and Badge */}
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500">
                            Disparar Alerta / SMS de Escala Urgencial
                          </label>
                          <span className="text-[9px] bg-amber-105 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                            Direct Link
                          </span>
                        </div>

                        {/* Interactive Channel Tabs - Replaces native clipped dialog choices */}
                        <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl" id="alert-channel-selector-tabs">
                          {(['sistema', 'sms', 'whatsapp', 'email'] as const).map((ch) => (
                            <button
                              key={ch}
                              type="button"
                              onClick={() => {
                                setAlertChannel(ch);
                                speak(`Selecionou canal de disparo por ${ch === 'sistema' ? 'notificação do painel' : ch}`);
                              }}
                              className={`py-1 text-[9px] uppercase font-bold rounded-lg transition-all text-center cursor-pointer ${
                                alertChannel === ch
                                  ? 'bg-white text-slate-950 shadow-xs ring-1 ring-slate-200'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              {ch === 'sistema' ? '🔔 Painel' : ch === 'sms' ? '💬 SMS' : ch === 'whatsapp' ? '🟢 Zap' : '✉️ Mail'}
                            </button>
                          ))}
                        </div>

                        {/* Expandable Template Selector - EXPANDS INLINE - 100% immune to clipping inside containers! */}
                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={() => {
                              setShowTemplatesSelector(!showTemplatesSelector);
                              speak("Mostrando modelos prontos de notificação");
                            }}
                            className="w-full text-left bg-white border border-slate-200 hover:bg-slate-50 py-1.5 px-3 rounded-xl flex items-center justify-between text-xs cursor-pointer"
                            id="btn-toggle-sms-templates"
                          >
                            <span className="text-slate-600 font-bold flex items-center gap-1.5 text-[11px]">
                              📋 {showTemplatesSelector ? 'Recolher Modelos' : 'Ver Modelos de Alerta / SMS'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {showTemplatesSelector ? '▲' : '▼'}
                            </span>
                          </button>

                          {/* Smooth Inline Expansion */}
                          {showTemplatesSelector && (
                            <div className="p-2 bg-white border border-slate-150 rounded-xl space-y-1.5 max-h-48 overflow-y-auto animate-fade-in" id="sms-templates-list">
                              {[
                                { title: '📦 Carga Pronta em Luanda', text: `Prezado(a) ${selectedClient.name}, a sua mercadoria de Cabotagem com destino a Cabinda foi vistoriada e está pronta no Porto de Luanda.` },
                                { title: '⚡ Orçamento Concluído', text: `Aviso Urgente: Seu orçamento de intermediação está pronto para aprovação. Por favor, consulte seu painel com brevidade.` },
                                { title: '🚢 Cabotagem em Trânsito', text: `Sua carga foi devidamente embarcada com o despachante selecionado e já se encontra em trânsito marítimo.` },
                                { title: '🚪 Disponível para Retirada', text: `Prezado(a) ${selectedClient.name}, a sua mercadoria está descarregada no Porto de Cabinda e pode ser levantada no armazém.` },
                                { title: '⚠️ Comprovativo em Falta', text: `Urgente: Detectamos falta de comprovativo de pagamento. Favor anexar no portal para que a AGT libere os volumes.` }
                              ].map((tmpl, tIdx) => (
                                <button
                                  key={tIdx}
                                  type="button"
                                  onClick={() => {
                                    setDirectNotificationText(tmpl.text);
                                    setShowTemplatesSelector(false);
                                    speak("Modelo carregado");
                                  }}
                                  className="w-full text-left p-2 hover:bg-slate-50 rounded-lg text-xs border border-slate-100 flex flex-col gap-0.5 justify-start transition-all cursor-pointer"
                                >
                                  <span className="font-extrabold text-slate-800 text-[10px]">{tmpl.title}</span>
                                  <span className="text-[10px] text-slate-500 truncate block w-full">{tmpl.text}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Input Action Form */}
                        <div className="flex gap-2 relative">
                          <input
                            type="text"
                            placeholder={
                              alertChannel === 'sms' ? "Escreva o texto do SMS de Alerta Urgente..." :
                              alertChannel === 'whatsapp' ? "Mensagem para WhatsApp Oficial..." :
                              alertChannel === 'email' ? "Assunto/Mensagem de E-mail de Notificação..." :
                              "Ex: Seu lote de mercadorias já se encontra no Porto..."
                            }
                            value={directNotificationText}
                            onChange={(e) => setDirectNotificationText(e.target.value)}
                            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder:text-slate-400 text-slate-800"
                            id="direct-quick-alert-input"
                          />
                          <button
                            type="button"
                            disabled={!directNotificationText.trim()}
                            onClick={() => {
                              if (!directNotificationText.trim()) return;
                              
                              // Trigger state/prop notifications inside UI
                              onAddNotification({
                                id: `notif-${Date.now()}`,
                                clientId: selectedClient.id,
                                orderId: 'general',
                                title: alertChannel === 'sms' ? '⚠️ Alerta SMS Urgente' : alertChannel === 'whatsapp' ? '🟢 Envio por WhatsApp' : alertChannel === 'email' ? '✉️ Notificação por Correio' : '🔔 Notificação Geral do Diretor',
                                message: directNotificationText.trim(),
                                read: false,
                                createdAt: new Date().toISOString()
                              });

                              speak(`Alerta enviado com sucesso por ${alertChannel === 'sistema' ? 'notificação interna' : alertChannel}`);
                              
                              // Show premium inline success panel (immune to iframe boundaries!)
                              setAlertSuccessChannel(alertChannel);
                              setAlertSuccessMessage(directNotificationText.trim());
                              setDirectNotificationText('');

                              // Auto-clear success message after 6 seconds
                              setTimeout(() => {
                                setAlertSuccessChannel(null);
                                setAlertSuccessMessage(null);
                              }, 6000);
                            }}
                            className="p-2.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-40 text-slate-950 rounded-xl cursor-pointer transition-colors shrink-0"
                            title="Enviar alerta"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* INLINE REPLACEMENT FOR CLIPPER NATIVE BOXES (100% Responsive success feed) */}
                        {alertSuccessChannel && (
                          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl space-y-1 text-xs font-semibold animate-scale-up" id="alert-inline-success-box">
                            <div className="flex items-center gap-1.5 font-bold">
                              <span>✅</span>
                              <span className="uppercase text-[9px] tracking-widest text-emerald-600 font-extrabold">Disparado com Sucesso</span>
                            </div>
                            <p className="text-[10px] text-slate-600 font-medium">
                              O Alerta Urgente foi transmitido para <strong className="text-slate-800">{selectedClient.name}</strong> através do canal <strong className="text-slate-800 uppercase">{alertSuccessChannel === 'sistema' ? 'Notificação do Painel Client' : alertSuccessChannel}</strong>.
                            </p>
                            <p className="text-[9px] italic text-slate-400 font-mono truncate">"{alertSuccessMessage}"</p>
                          </div>
                        )}

                        {/* Extra helper info about what happens */}
                        <div className="text-[9px] text-slate-400 font-semibold flex items-center justify-between pt-1 border-t border-slate-100">
                          <span>Destinatário: <strong className="text-slate-600 font-mono">{selectedClient.phone || '+244 923...'}</strong></span>
                          <span>Escudo de Encriptação SSL</span>
                        </div>

                      </div>
                    </div>

                  </div>

                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* PARTNER CARRIERS ROTAS TAB */}
      {activeTab === 'carriers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="adm-carriers-panel">
          
          <div className="lg:col-span-8 bg-white border border-slate-150 rounded-2xl p-6 shadow-xs">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Armadores & Transportadoras Marítimas/Aéreas Integradas</h4>
            <div className="space-y-4">
              {carriersList.map(c => (
                <div key={c.id} className="p-4 border border-slate-150 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between hover:border-slate-350 transition-colors gap-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-sky-50 text-sky-600 p-2.5 rounded-xl shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">{c.name}</h5>
                      <p className="text-[10px] text-slate-400">Telefone: {c.phone} | Trânsito Médio: <strong>{c.expectedDays} dias</strong></p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right border-t sm:border-0 pt-2 sm:pt-0 border-slate-100 flex justify-between sm:block">
                    <p className="text-[10px] text-slate-400 capitalize">Tarifa Base por Quilograma</p>
                    <p className="text-xs font-bold text-slate-800 font-mono">{formatCurrency(c.baseRatePerKg)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-white border border-slate-150 rounded-2xl p-6 shadow-xs">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Cadastrar Transportadora</h4>
            <form onSubmit={handleAddCarrier} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome Fantasia Comercial *</label>
                <input
                  type="text"
                  value={newCarrier.name}
                  onChange={(e) => setNewCarrier({ ...newCarrier, name: e.target.value })}
                  placeholder="Ex: Cabinda Marítimo Express"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 font-semibold">Telemóvel Logística *</label>
                <input
                  type="text"
                  value={newCarrier.phone}
                  onChange={(e) => setNewCarrier({ ...newCarrier, phone: e.target.value })}
                  placeholder="Ex: +244 933 111 000"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 font-semibold">Preço Estimado por Kg (AOA) *</label>
                <input
                  type="number"
                  value={newCarrier.baseRatePerKg === 0 ? '' : newCarrier.baseRatePerKg}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewCarrier({ ...newCarrier, baseRatePerKg: val === '' ? 0 : parseFloat(val) || 0 });
                  }}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 font-semibold">Estimativa Tránsito (Dias)</label>
                <input
                  type="number"
                  value={newCarrier.expectedDays === 0 ? '' : newCarrier.expectedDays}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewCarrier({ ...newCarrier, expectedDays: val === '' ? 0 : parseInt(val, 10) || 0 });
                  }}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-lg hover:bg-sky-600 transition-all font-semibold"
              >
                Cadastrar Novo Parceiro
              </button>
            </form>
          </div>

        </div>
      )}

      {/* DISPUTES / COMPLAINTS TAB */}
      {activeTab === 'complaints' && (
        <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-xs" id="adm-complaints-panel">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Mural de Reclamações de Clientes</h4>
          
          {orders.filter(o => o.complaint).length === 0 ? (
            <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
              <CheckCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">Sem incidentes fiscais ou logísticos registados</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Os clientes não enviaram incidentes de compras de momento.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.filter(o => o.complaint).map(ord => (
                <div key={ord.id} className="p-4 border border-rose-100 bg-rose-50/25 rounded-xl text-xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-rose-50 p-2.5 rounded-lg border border-rose-100 gap-2">
                    <div>
                      <p className="font-bold text-rose-800 font-mono">Pedido: {ord.id}</p>
                      <p className="text-slate-500 font-medium">Cliente: {ord.clientName} ({ord.clientPhone})</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] self-start sm:self-auto ${
                      ord.complaintResolved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}>
                      {ord.complaintResolved ? 'Resolvida' : 'Pendente'}
                    </span>
                  </div>

                  <p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-100 italic">"Reclamação: {ord.complaint}"</p>

                  {!ord.complaintResolved && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleResolveComplaint(ord.id)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Marcar como Resolvida (Incidente Fechado)
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CHAT GERAL / ATENDIMENTO TAB */}
      {activeTab === 'chat' && (
        <div className="bg-white border border-slate-150 rounded-2xl p-3 sm:p-6 shadow-xs space-y-3 sm:space-y-4 animate-fade-in" id="adm-chat-panel">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-display">Central de Mensagens dos Clientes</h4>
              <p className="text-xs text-slate-500 mt-0.5">Gerencie os canais de conversa com cada cliente, visualize mídias de carga, e envie faturas ou recibos alfandegários direto.</p>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Online • Canal de Apoio</span>
            </div>
          </div>

          <div className="w-full">
            <SharedChat
              order={null}
              currentUserRole="admin"
              messages={messages}
              clients={clients}
              orders={orders}
              onSendMessage={(text, attach, isPri, sendr, chanId) => {
                onSendMessage(chanId || 'general', text, attach, isPri, sendr);
              }}
              onMarkChannelAsRead={onMarkChannelAsRead}
            />
          </div>
        </div>
      )}

      {/* 7) FORNECEDORES CRM TAB */}
      {activeTab === 'suppliers' && (
        <div className="space-y-6 animate-fade-in" id="adm-suppliers-panel">
          
          {/* Top disclaimer */}
          <div className="bg-amber-50 border border-amber-250 p-4 rounded-2xl flex items-start gap-3 text-slate-800">
            <Award className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-850 leading-relaxed font-semibold">
              <p className="font-bold uppercase tracking-wider text-[11px] mb-1">Painel Central de Homologação Portuária e Promoção Comercial</p>
              <p>Seguindo as regras de segurança do <strong>Mediador Cabinda</strong>, os dados de contacto direto dos parceiros não são exibidos aos clientes finais para garantir a intermediação obrigatória e evitar burlas. Como os fornecedores não publicam itens diretamente, você pode cadastrar e aprovar os anúncios e catálogos para eles abaixo.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Supplier Base Directory */}
            <div className="lg:col-span-4 bg-white border border-slate-150 rounded-2xl p-4 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Parceiros Registados ({suppliers.length})
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddSupplierModal(true)}
                  className="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-[10.5px] rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1 active:scale-95"
                >
                  <span>➕</span>
                  <span>Nova Empresa</span>
                </button>
              </div>
              
              <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                {suppliers.map((sup) => {
                  const isCur = adminSelectedSupplierId === sup.id;
                  const plansBadge = {
                    diamante: 'bg-amber-500 text-white font-black',
                    ouro: 'bg-amber-400 text-slate-950 font-bold',
                    prata: 'bg-slate-400 text-white font-bold',
                    gratuito: 'bg-slate-100 text-slate-500'
                  }[sup.plan];

                  return (
                    <button
                      key={sup.id}
                      onClick={() => {
                        setAdminSelectedSupplierId(sup.id);
                        setSelectedSupplierChatId(sup.id);
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isCur ? 'border-amber-400 bg-amber-50/10 shadow-xs' : 'border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span className="text-xl shrink-0">🤝</span>
                        <div className="overflow-hidden">
                          <p className="font-bold text-xs text-slate-800 truncate">{sup.name}</p>
                          <p className="text-[10px] text-slate-500 font-semibold">{sup.city} • {sup.category}</p>
                          {sup.nif && (
                            <p className="text-[9px] text-slate-400 font-mono">NIF: {sup.nif}</p>
                          )}
                        </div>
                      </div>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-sm uppercase tracking-wide shrink-0 font-bold ${plansBadge}`}>
                        {sup.plan}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Edit Plan & Status of current supplier */}
              {adminSelectedSupplierId && (() => {
                const curSup = suppliers.find(s => s.id === adminSelectedSupplierId);
                if (!curSup) return null;
                return (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mt-4 space-y-3">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">MUDAR PLANO DE DESTAQUE</p>
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-slate-700">Plano Atual: <span className="uppercase text-amber-600 font-black">{curSup.plan}</span></p>
                      <p className="text-[9px] text-slate-500 font-medium font-semibold">Os planos influenciam a priorização no mercado público.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 font-semibold">
                      {(['gratuito', 'prata', 'ouro', 'diamante'] as const).map((tier) => (
                        <button
                          key={tier}
                          onClick={() => {
                            const updated = { ...curSup, plan: tier };
                            onUpdateSupplier(updated);
                            showModalAlert("Plano Atualizado", `O plano corporativo de ${curSup.name} foi atualizado para ${tier.toUpperCase()} com total sucesso.`, "success");
                          }}
                          className={`py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wide cursor-pointer transition-colors ${
                            curSup.plan === tier ? 'bg-amber-400 text-slate-950 font-black' : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {tier}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Right: Supplier Catalogue & Product Manager */}
            <div className="lg:col-span-8 space-y-6">
              {adminSelectedSupplierId && (() => {
                const curSup = suppliers.find(s => s.id === adminSelectedSupplierId);
                if (!curSup) return null;

                const curProducts = supplierProducts.filter(p => p.supplierId === curSup.id);

                return (
                  <div className="space-y-6">
                    
                    {/* Catalog management header */}
                    <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-sm space-y-4">
                      
                      {/* Catalog management header */}
                      <div className="flex items-center justify-between border-b pb-3 border-slate-100 flex-wrap gap-2">
                        <div>
                          <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">MÓDULO DE PARCEIRO: {curSup.name}</h4>
                          <p className="text-[11px] text-slate-500 font-semibold mt-1">Gerencie produtos homologados, serviços de logística e solicitações.</p>
                        </div>

                        {supplierSubTab === 'products' && (
                          <button
                            onClick={() => setShowAddProductForm(!showAddProductForm)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>➕</span> {showAddProductForm ? "Esconder Formulário" : "Publicar Produto"}
                          </button>
                        )}

                        {supplierSubTab === 'services' && (
                          <button
                            onClick={() => setShowAddServiceForm(!showAddServiceForm)}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>➕</span> {showAddServiceForm ? "Esconder Formulário" : "Publicar Serviço"}
                          </button>
                        )}
                      </div>

                      {/* SUB-TABS SELECTOR */}
                      <div className="flex border-b border-slate-100 pb-1 gap-4">
                        <button
                          onClick={() => setSupplierSubTab('products')}
                          className={`pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                            supplierSubTab === 'products'
                              ? 'border-amber-500 text-slate-950 font-black'
                              : 'border-transparent text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          📦 Produtos Homologados ({curProducts.length})
                        </button>
                        <button
                          onClick={() => setSupplierSubTab('services')}
                          className={`pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                            supplierSubTab === 'services'
                              ? 'border-amber-500 text-slate-950 font-black'
                              : 'border-transparent text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          🛠️ Serviços Publicados ({supplierServices.filter(s => s.supplierId === curSup.id).length})
                        </button>
                        <button
                          onClick={() => setSupplierSubTab('requests')}
                          className={`pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                            supplierSubTab === 'requests'
                              ? 'border-amber-500 text-slate-950 font-black'
                              : 'border-transparent text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          📥 Solicitações ({serviceRequests.filter(r => r.supplierId === curSup.id).length})
                        </button>
                      </div>

                      {supplierSubTab === 'products' && (
                        <div className="space-y-4 animate-fade-in">

                          {/* Search by Product Code / Identity SKU Bar */}
                          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-sm space-y-3">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                              <div>
                                <span className="text-[8.5px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  Localizador de Artigo por Código
                                </span>
                                <h5 className="text-xs font-bold text-white mt-1 flex items-center gap-1.5">
                                  🔎 Pesquisa de Artigos Homologados & Pedidos Vinculados
                                </h5>
                                <p className="text-[11px] text-slate-300 font-medium">
                                  Pesquise pelo código gerado (ex: <span className="font-mono text-amber-300 font-bold">PRD-1001</span>), nome do artigo ou fornecedor para ver a foto, stock e solicitações de clientes.
                                </p>
                              </div>
                              {adminProductCodeSearch && (
                                <button
                                  type="button"
                                  onClick={() => setAdminProductCodeSearch('')}
                                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer"
                                >
                                  Limpar Pesquisa ✕
                                </button>
                              )}
                            </div>

                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Insira o código do artigo (ex: PRD-1001, PRD-1002) ou nome do produto..."
                                value={adminProductCodeSearch}
                                onChange={(e) => setAdminProductCodeSearch(e.target.value)}
                                className="w-full bg-slate-800 text-white placeholder:text-slate-400 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none transition-all"
                              />
                            </div>

                            {/* Matching Products Search Results Dropdown / Panel */}
                            {adminProductCodeSearch.trim().length > 0 && (() => {
                              const q = adminProductCodeSearch.toLowerCase().trim();
                              const matched = supplierProducts.filter(p => {
                                const pCode = getProductCode(p).toLowerCase();
                                const pName = p.name.toLowerCase();
                                const pDesc = (p.description || '').toLowerCase();
                                const pLoc = (p.location || '').toLowerCase();
                                return pCode.includes(q) || pName.includes(q) || pDesc.includes(q) || pLoc.includes(q);
                              });

                              return (
                                <div className="mt-3 bg-slate-850 border border-slate-700/80 rounded-xl p-3.5 space-y-3 animate-fade-in">
                                  <div className="flex items-center justify-between text-xs border-b border-slate-700 pb-2">
                                    <span className="font-bold text-amber-400">
                                      📦 Resultados Encontrados ({matched.length})
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      Filtro: "{adminProductCodeSearch}"
                                    </span>
                                  </div>

                                  {matched.length === 0 ? (
                                    <p className="text-xs text-slate-400 py-3 text-center italic">
                                      Nenhum artigo encontrado com o código ou nome "{adminProductCodeSearch}". Verifique o código digitado.
                                    </p>
                                  ) : (
                                    <div className="space-y-3">
                                      {matched.map(prod => {
                                        const code = getProductCode(prod);
                                        const linkedOrders = orders.filter(o => 
                                          (o.productCode && o.productCode.toUpperCase() === code.toUpperCase()) ||
                                          o.productName.toLowerCase().includes(prod.name.toLowerCase()) ||
                                          (o.notes && o.notes.includes(code))
                                        );
                                        const prodSup = suppliers.find(s => s.id === prod.supplierId);

                                        return (
                                          <div key={prod.id} className="bg-slate-900 border border-slate-750 p-3.5 rounded-xl text-slate-200 space-y-3">
                                            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                                              <div className="flex gap-3 items-center">
                                                {/* Clickable Image Thumbnail */}
                                                <div 
                                                  onClick={() => setAdminImagePreviewUrl({ url: prod.photoUrl, title: `${code} - ${prod.name}` })}
                                                  className="relative group cursor-pointer w-16 h-16 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0"
                                                  title="Clique para ver imagem em ecrã inteiro"
                                                >
                                                  <img 
                                                    src={prod.photoUrl} 
                                                    alt={prod.name} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                                    referrerPolicy="no-referrer" 
                                                  />
                                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[10px] text-white font-bold">
                                                    🔍 Ver
                                                  </div>
                                                </div>

                                                <div className="text-left space-y-0.5">
                                                  <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-mono text-[10px] font-black text-slate-950 bg-amber-400 px-2 py-0.5 rounded-md">
                                                      🏷️ {code}
                                                    </span>
                                                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                                      prod.availability === 'imediata' ? 'bg-emerald-900 text-emerald-300' :
                                                      prod.availability === 'sob-pedido' ? 'bg-amber-900 text-amber-300' :
                                                      'bg-red-900 text-red-300'
                                                    }`}>
                                                      {prod.availability}
                                                    </span>
                                                    <span className="text-[9px] text-slate-400">Stock: {prod.stock} un.</span>
                                                  </div>
                                                  <h6 className="font-bold text-xs text-white">{prod.name}</h6>
                                                  <p className="text-[11px] font-mono font-black text-amber-300">
                                                    {prod.price.toLocaleString('pt-AO')} AOA
                                                  </p>
                                                  <p className="text-[10px] text-slate-400">
                                                    📍 {prod.location || 'Luanda'} {prodSup ? `• Parceiro: ${prodSup.name}` : ''}
                                                  </p>
                                                </div>
                                              </div>

                                              <div className="flex gap-2 w-full sm:w-auto justify-end">
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    navigator.clipboard?.writeText(code);
                                                    showModalAlert('Código Copiado! 📋', `O código de identidade ${code} foi copiado para a sua área de transferência.`, 'info');
                                                  }}
                                                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg border border-slate-700 cursor-pointer"
                                                >
                                                  Copiar Código 📋
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => setAdminImagePreviewUrl({ url: prod.photoUrl, title: `${code} - ${prod.name}` })}
                                                  className="px-2.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 text-[10px] font-black rounded-lg cursor-pointer"
                                                >
                                                  Ver Foto 🖼️
                                                </button>
                                              </div>
                                            </div>

                                            {/* Full Supplier Identity Section within search card */}
                                            {prodSup && (
                                              <div className="bg-slate-950/80 border border-amber-400/30 rounded-xl p-3 space-y-2 text-left">
                                                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                                                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                                                    <span>🏢</span> EMPRESA FORNECEDORA: {prodSup.name}
                                                  </span>
                                                  <span className="text-[8.5px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded uppercase">
                                                    {prodSup.plan}
                                                  </span>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10.5px]">
                                                  <div>
                                                    <span className="text-[9px] text-slate-400 uppercase block">NIF / Responsável:</span>
                                                    <span className="font-mono text-slate-200 font-bold">{prodSup.nif || '5401928374'}</span>
                                                    <p className="text-slate-300 text-[10px]">{prodSup.contactPerson || 'Gestor Comercial'}</p>
                                                  </div>

                                                  <div>
                                                    <span className="text-[9px] text-slate-400 uppercase block">Telefone / WhatsApp:</span>
                                                    <span className="font-mono text-emerald-400 font-bold">{prodSup.phoneHidden || prodSup.whatsapp}</span>
                                                    <p className="text-[9px] text-slate-500">{prodSup.emailHidden || 'comercial@empresa.ao'}</p>
                                                  </div>

                                                  <div>
                                                    <span className="text-[9px] text-slate-400 uppercase block">Endereço Armazém:</span>
                                                    <span className="text-slate-200 text-[10px] font-semibold line-clamp-2">{prodSup.addressHidden || 'Luanda, Angola'}</span>
                                                  </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-800/80">
                                                  <button
                                                    type="button"
                                                    onClick={() => setAdminInspectedProduct(prod)}
                                                    className="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg text-[9.5px] font-black flex items-center gap-1 cursor-pointer"
                                                  >
                                                    📄 Ver Ficha Completa
                                                  </button>

                                                  <a
                                                    href={`https://wa.me/${(prodSup.whatsapp || prodSup.phoneHidden || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${prodSup.name}! Somos do Mediador Cabinda. Temos cliente interessado no artigo [${code}] (${prod.name}). Solicitamos confirmação de stock e envio de dados para levantamento.`)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[9.5px] font-bold flex items-center gap-1 cursor-pointer"
                                                  >
                                                    💬 WhatsApp Vendedor
                                                  </a>

                                                  <a
                                                    href={`tel:${(prodSup.phoneHidden || prodSup.whatsapp || '').replace(/\D/g, '')}`}
                                                    className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-[9.5px] font-bold flex items-center gap-1 cursor-pointer"
                                                  >
                                                    📞 Ligar ({prodSup.phoneHidden})
                                                  </a>
                                                </div>
                                              </div>
                                            )}

                                            {/* Linked Orders / Purchase Requests for this Product */}
                                            <div className="border-t border-slate-800 pt-2.5 space-y-1.5">
                                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                                <span>📋</span> Pedidos e Compras Diretas Registadas ({linkedOrders.length})
                                              </p>
                                              {linkedOrders.length === 0 ? (
                                                <p className="text-[11px] text-slate-500 italic pl-1">
                                                  Nenhum pedido de compra ou orçamento vinculado até ao momento.
                                                </p>
                                              ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                                  {linkedOrders.map(ord => (
                                                    <div key={ord.id} className="bg-slate-800/80 border border-slate-700 p-2.5 rounded-lg text-xs space-y-1.5 flex flex-col justify-between">
                                                      <div className="flex items-center justify-between">
                                                        <span className="font-mono text-[10px] font-bold text-amber-400">{ord.id}</span>
                                                        <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 font-bold uppercase">{ord.status}</span>
                                                      </div>
                                                      <div className="text-left text-[11px]">
                                                        <p className="text-white font-semibold">{ord.clientName}</p>
                                                        <p className="text-slate-400 text-[10px]">📞 {ord.clientPhone} • Qtd: {ord.quantity}</p>
                                                      </div>
                                                      <div className="flex items-center justify-between border-t border-slate-700/60 pt-1.5 mt-1">
                                                        <span className="font-mono font-bold text-[10px] text-emerald-400">
                                                          {formatCurrency(ord.totalAmount || (ord.budgetRawPrice || prod.price) * ord.quantity)}
                                                        </span>
                                                        <div className="flex gap-1">
                                                          <a
                                                            href={`https://wa.me/${ord.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${ord.clientName}! Vimos o seu pedido ${ord.id} referente ao artigo ${code} (${prod.name}) no Mediador Cabinda. Estamos ao seu dispor!`)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[9px] font-bold"
                                                          >
                                                            WhatsApp 💬
                                                          </a>
                                                          <button
                                                            type="button"
                                                            onClick={() => {
                                                              setActiveTab('orders');
                                                              setSelectedOrderId(ord.id);
                                                            }}
                                                            className="px-2 py-0.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded text-[9px] font-black cursor-pointer"
                                                          >
                                                            Abrir ➔
                                                          </button>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>

                          {/* Add Product Form */}
                      {showAddProductForm && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 animate-slide-up">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">CADASTRAR E PUBLICAR PRODUTO HOMOLOGADO</p>
                            <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200">
                              Novo Código: PRD-{1000 + supplierProducts.length + 1}
                            </span>
                          </div>

                          {/* Auto assigned code preview banner */}
                          <div className="bg-amber-500/10 border border-amber-300/80 p-3 rounded-xl flex items-center justify-between">
                            <div className="text-left">
                              <p className="text-[11px] font-bold text-amber-950 flex items-center gap-1.5">
                                <span>🏷️</span> Código de Identidade Atribuído Automaticamente
                              </p>
                              <p className="text-[10px] text-amber-800">
                                Este código exclusivo será usado para identificar a mercadoria e permitir pesquisa direta por imagem e dados na gestão.
                              </p>
                            </div>
                            <span className="font-mono text-xs font-black text-amber-950 bg-amber-200 px-3 py-1 rounded-lg border border-amber-300 shadow-2xs">
                              PRD-{1000 + supplierProducts.length + 1}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-800">
                            <div className="sm:col-span-2">
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Nome do Artigo *</label>
                              <input
                                type="text"
                                placeholder="Ex. HP Laptop Elitebook 840 G8 14' Core i7"
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden focus:border-amber-400"
                                value={adminNewProductForm.name}
                                onChange={(e) => setAdminNewProductForm({...adminNewProductForm, name: e.target.value})}
                              />
                            </div>

                            {/* Category & SubCategory Interactive Visual Selection & Dropdowns */}
                            <div className="sm:col-span-2 space-y-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <label className="block text-[11px] font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                                    <Layers className="w-3.5 h-3.5 text-amber-500" />
                                    1. Escolha a Categoria Principal *
                                  </label>
                                  <span className="text-[10px] text-slate-400 font-semibold">
                                    Sincronizado com a barra horizontal do Cliente
                                  </span>
                                </div>

                                {/* Category Visual Buttons Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2.5">
                                  {MARKETPLACE_CATEGORIES.map((cat) => {
                                    const isSelected = adminNewProductForm.category === cat.id;
                                    return (
                                      <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => {
                                          const catObj = getCategoryById(cat.id);
                                          const firstSub = catObj?.subCategories[0]?.id || '';
                                          setAdminNewProductForm({
                                            ...adminNewProductForm,
                                            category: cat.id,
                                            subCategory: firstSub
                                          });
                                        }}
                                        className={`p-2 rounded-xl text-left transition-all cursor-pointer flex flex-col gap-1 border ${
                                          isSelected
                                            ? 'bg-amber-400 border-amber-500 text-slate-950 shadow-xs ring-2 ring-amber-400/50'
                                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between w-full">
                                          <span className="text-base">{cat.icon}</span>
                                          {isSelected && (
                                            <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse" />
                                          )}
                                        </div>
                                        <span className={`text-[10px] font-black leading-tight ${isSelected ? 'text-slate-950' : 'text-slate-800'}`}>
                                          {cat.name}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Dropdown alternative */}
                                <select
                                  aria-label="Categoria do Marketplace"
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold focus:outline-hidden text-slate-800"
                                  value={adminNewProductForm.category}
                                  onChange={(e) => {
                                    const newCatId = e.target.value;
                                    const catObj = getCategoryById(newCatId);
                                    const firstSub = catObj?.subCategories[0]?.id || '';
                                    setAdminNewProductForm({
                                      ...adminNewProductForm,
                                      category: newCatId,
                                      subCategory: firstSub
                                    });
                                  }}
                                >
                                  {MARKETPLACE_CATEGORIES.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                      {cat.icon} {cat.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* SubCategory Selection */}
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <label className="block text-[11px] font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                                    2. Escolha a Subcategoria Específica *
                                  </label>
                                  <span className="text-[10px] text-slate-400 font-semibold">
                                    (Ex: Perucas, Vestidos, Bombó, etc.)
                                  </span>
                                </div>

                                {/* SubCategory Interactive Chips */}
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                  {getCategoryById(adminNewProductForm.category)?.subCategories.map((sub) => {
                                    const isSubSelected = adminNewProductForm.subCategory === sub.id;
                                    return (
                                      <button
                                        key={sub.id}
                                        type="button"
                                        onClick={() => setAdminNewProductForm({...adminNewProductForm, subCategory: sub.id})}
                                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                                          isSubSelected
                                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-500/30'
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                                        }`}
                                      >
                                        <span>{sub.name}</span>
                                        {isSubSelected && <Check className="w-3 h-3 text-white" />}
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Dropdown alternative */}
                                <select
                                  aria-label="Subcategoria Específica"
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold focus:outline-hidden text-slate-800"
                                  value={adminNewProductForm.subCategory}
                                  onChange={(e) => setAdminNewProductForm({...adminNewProductForm, subCategory: e.target.value})}
                                >
                                  {getCategoryById(adminNewProductForm.category)?.subCategories.map((sub) => (
                                    <option key={sub.id} value={sub.id}>
                                      {sub.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Smart Real-Time Auto-Routing Notification Banner */}
                              <div className="bg-linear-to-r from-amber-50 to-emerald-50 border border-amber-200/80 p-3 rounded-xl flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 shrink-0 font-black text-sm shadow-xs">
                                    ⚡
                                  </div>
                                  <div>
                                    <p className="text-[11px] font-black text-slate-900 flex items-center gap-1.5">
                                      <span>Classificação Automática Ativa:</span>
                                      <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200 font-bold">
                                        {getCategoryById(adminNewProductForm.category)?.icon} {getCategoryById(adminNewProductForm.category)?.name}
                                      </span>
                                      <span>➔</span>
                                      <span className="text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 font-bold">
                                        {getSubCategoryName(adminNewProductForm.category, adminNewProductForm.subCategory)}
                                      </span>
                                    </p>
                                    <p className="text-[10px] text-slate-600 mt-0.5">
                                      Ao publicar, este artigo será automaticamente indexado e visível na barra horizontal do cliente nesta categoria e subcategoria.
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Quick Auto-Fill Suggestions based on Category / Subcategory */}
                              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-amber-500" />
                                  Sugestões Rápidas de Nomes (Clique para preencher):
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {adminNewProductForm.category === 'feminino' && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => setAdminNewProductForm({
                                          ...adminNewProductForm,
                                          name: "Peruca Frontal 13x4 100% Cabelo Humano Brasileiro 30'",
                                          price: 65000,
                                          originalPrice: 78000,
                                          description: "Peruca lace frontal 13x4 em cabelo humano virgem de alta densidade (180%), sem químicos, com nós descoloridos e textura natural.",
                                          photoUrl: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=500&auto=format&fit=crop&q=60"
                                        })}
                                        className="text-[9px] bg-white hover:bg-amber-50 border border-slate-250 hover:border-amber-400 text-slate-700 hover:text-amber-950 font-bold px-2 py-1 rounded-md transition-colors cursor-pointer"
                                      >
                                        + Peruca Frontal 13x4 30'
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setAdminNewProductForm({
                                          ...adminNewProductForm,
                                          name: "Peruca Bob Curta Lisa HD Lace 12' Cabelo Virgem",
                                          price: 45000,
                                          originalPrice: 52000,
                                          description: "Peruca curta corte Bob liso brilhante, lace transparente HD e fixação segura com pentes internos.",
                                          photoUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60"
                                        })}
                                        className="text-[9px] bg-white hover:bg-amber-50 border border-slate-250 hover:border-amber-400 text-slate-700 hover:text-amber-950 font-bold px-2 py-1 rounded-md transition-colors cursor-pointer"
                                      >
                                        + Peruca Bob Curta 12'
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setAdminNewProductForm({
                                          ...adminNewProductForm,
                                          name: "Vestido Africano Samakaka Elegante Festa",
                                          price: 35000,
                                          originalPrice: 42000,
                                          description: "Vestido longo em tecido Samakaka autêntico, corte acinturado e acabamento de alta alfaiataria.",
                                          photoUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop&q=60"
                                        })}
                                        className="text-[9px] bg-white hover:bg-amber-50 border border-slate-250 hover:border-amber-400 text-slate-700 hover:text-amber-950 font-bold px-2 py-1 rounded-md transition-colors cursor-pointer"
                                      >
                                        + Vestido Samakaka Festa
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setAdminNewProductForm({
                                          ...adminNewProductForm,
                                          name: "Bolsa de Mão Feminina Couro Genuíno Estruturada",
                                          price: 28000,
                                          originalPrice: 34000,
                                          description: "Bolsa executiva em pele genuína com detalhes dourados e compartimentos espaçosos.",
                                          photoUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=60"
                                        })}
                                        className="text-[9px] bg-white hover:bg-amber-50 border border-slate-250 hover:border-amber-400 text-slate-700 hover:text-amber-950 font-bold px-2 py-1 rounded-md transition-colors cursor-pointer"
                                      >
                                        + Bolsa Feminina Couro
                                      </button>
                                    </>
                                  )}

                                  {adminNewProductForm.category === 'masculino' && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => setAdminNewProductForm({
                                          ...adminNewProductForm,
                                          name: "Fato Executivo Slim Fit 3 Peças Italiano",
                                          price: 85000,
                                          originalPrice: 95000,
                                          description: "Fato completo de 3 peças (blazer, colete e calça), corte moderno slim fit em tecido nobre.",
                                          photoUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&auto=format&fit=crop&q=60"
                                        })}
                                        className="text-[9px] bg-white hover:bg-amber-50 border border-slate-250 hover:border-amber-400 text-slate-700 hover:text-amber-950 font-bold px-2 py-1 rounded-md transition-colors cursor-pointer"
                                      >
                                        + Fato Executivo 3 Peças
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setAdminNewProductForm({
                                          ...adminNewProductForm,
                                          name: "Sapato Oxford Masculino Couro Genuíno",
                                          price: 38000,
                                          originalPrice: 45000,
                                          description: "Calçado clássico Oxford em cabedal de alta durabilidade com sola cosida.",
                                          photoUrl: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=500&auto=format&fit=crop&q=60"
                                        })}
                                        className="text-[9px] bg-white hover:bg-amber-50 border border-slate-250 hover:border-amber-400 text-slate-700 hover:text-amber-950 font-bold px-2 py-1 rounded-md transition-colors cursor-pointer"
                                      >
                                        + Sapato Oxford Couro
                                      </button>
                                    </>
                                  )}

                                  {adminNewProductForm.category === 'alimentos' && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => setAdminNewProductForm({
                                          ...adminNewProductForm,
                                          name: "Saco de Bombó Seco de Cabinda Selecionado 50kg",
                                          price: 24000,
                                          originalPrice: 28000,
                                          description: "Bombó seco tradicional de primeira colheita das lavras de Cabinda, seco ao sol natural e sem impurezas.",
                                          photoUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60"
                                        })}
                                        className="text-[9px] bg-white hover:bg-amber-50 border border-slate-250 hover:border-amber-400 text-slate-700 hover:text-amber-950 font-bold px-2 py-1 rounded-md transition-colors cursor-pointer"
                                      >
                                        + Saco de Bombó Seco 50kg
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setAdminNewProductForm({
                                          ...adminNewProductForm,
                                          name: "Óleo de Palma Puro do Maiombe 5 Litros",
                                          price: 9500,
                                          originalPrice: 11000,
                                          description: "Óleo de palma virgem extraído artesanalmente nas matas do Maiombe, 100% puro e aromático.",
                                          photoUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60"
                                        })}
                                        className="text-[9px] bg-white hover:bg-amber-50 border border-slate-250 hover:border-amber-400 text-slate-700 hover:text-amber-950 font-bold px-2 py-1 rounded-md transition-colors cursor-pointer"
                                      >
                                        + Óleo de Palma Maiombe 5L
                                      </button>
                                    </>
                                  )}

                                  {adminNewProductForm.category === 'animais' && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => setAdminNewProductForm({
                                          ...adminNewProductForm,
                                          name: "Boi Touro Reprodutor Nelore Registado 450kg",
                                          price: 650000,
                                          originalPrice: 720000,
                                          description: "Touro reprodutor Nelore puro de origem, vacinado e desparasitado com histórico zootécnico comprovado.",
                                          photoUrl: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=500&auto=format&fit=crop&q=60"
                                        })}
                                        className="text-[9px] bg-white hover:bg-amber-50 border border-slate-250 hover:border-amber-400 text-slate-700 hover:text-amber-950 font-bold px-2 py-1 rounded-md transition-colors cursor-pointer"
                                      >
                                        + Touro Nelore 450kg
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setAdminNewProductForm({
                                          ...adminNewProductForm,
                                          name: "Cabritos & Caprinos Raça Bôer Macho/Fêmea",
                                          price: 65000,
                                          originalPrice: 75000,
                                          description: "Caprinos jovens de raça Bôer de rápido ganho de peso, criados a pasto natural.",
                                          photoUrl: "https://images.unsplash.com/photo-1524024973431-2ad916746881?w=500&auto=format&fit=crop&q=60"
                                        })}
                                        className="text-[9px] bg-white hover:bg-amber-50 border border-slate-250 hover:border-amber-400 text-slate-700 hover:text-amber-950 font-bold px-2 py-1 rounded-md transition-colors cursor-pointer"
                                      >
                                        + Cabritos Raça Bôer
                                      </button>
                                    </>
                                  )}

                                  {adminNewProductForm.category === 'eletronicos' && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => setAdminNewProductForm({
                                          ...adminNewProductForm,
                                          name: "Laptop HP EliteBook 840 G8 14' Core i7 16GB 512GB SSD",
                                          price: 340000,
                                          originalPrice: 380000,
                                          description: "Computador portátil profissional ultrafino em alumínio, teclado retroiluminado e bateria com até 10h de autonomia.",
                                          photoUrl: "https://images.unsplash.com/photo-1496181130204-7552cc14ac1a?w=500&auto=format&fit=crop&q=60"
                                        })}
                                        className="text-[9px] bg-white hover:bg-amber-50 border border-slate-250 hover:border-amber-400 text-slate-700 hover:text-amber-950 font-bold px-2 py-1 rounded-md transition-colors cursor-pointer"
                                      >
                                        + Laptop HP Core i7
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setAdminNewProductForm({
                                          ...adminNewProductForm,
                                          name: "Smart TV 55' 4K UHD HDR com Wi-Fi Integrado",
                                          price: 215000,
                                          originalPrice: 245000,
                                          description: "Televisor inteligente com comandos de voz, Bluetooth, Netflix e YouTube com qualidade de imagem cristalina.",
                                          photoUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&auto=format&fit=crop&q=60"
                                        })}
                                        className="text-[9px] bg-white hover:bg-amber-50 border border-slate-250 hover:border-amber-400 text-slate-700 hover:text-amber-950 font-bold px-2 py-1 rounded-md transition-colors cursor-pointer"
                                      >
                                        + Smart TV 55' 4K
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Preço de Venda (AOA) *</label>
                              <input
                                type="number"
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold focus:outline-hidden focus:border-amber-400 text-slate-800"
                                value={adminNewProductForm.price === 0 ? '' : adminNewProductForm.price}
                                onChange={(e) => setAdminNewProductForm({...adminNewProductForm, price: Number(e.target.value)})}
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Preço Original / Anterior (AOA) (Para exibir desconto)</label>
                              <input
                                type="number"
                                placeholder="Ex. 42000"
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold focus:outline-hidden focus:border-amber-400 text-slate-800"
                                value={adminNewProductForm.originalPrice || ''}
                                onChange={(e) => setAdminNewProductForm({...adminNewProductForm, originalPrice: Number(e.target.value)})}
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Estado Disponibilidade</label>
                              <select
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold focus:outline-hidden outline-hidden text-slate-800"
                                value={adminNewProductForm.availability}
                                onChange={(e) => setAdminNewProductForm({...adminNewProductForm, availability: e.target.value as any})}
                              >
                                <option value="imediata">Em Stock Imediato</option>
                                <option value="sob-pedido">Sob Pedido Exclusivo</option>
                                <option value="esgotado">Esgotado de Momento</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Quantidade de Stock</label>
                              <input
                                type="number"
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold focus:outline-hidden focus:border-amber-400 text-slate-800"
                                value={adminNewProductForm.stock === 0 ? '' : adminNewProductForm.stock}
                                onChange={(e) => setAdminNewProductForm({...adminNewProductForm, stock: Number(e.target.value)})}
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Condição do Artigo</label>
                              <select
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold focus:outline-hidden text-slate-800"
                                value={adminNewProductForm.condition || 'novo'}
                                onChange={(e) => setAdminNewProductForm({...adminNewProductForm, condition: e.target.value as any})}
                              >
                                <option value="novo">Novo / Selado na Caixa ✨</option>
                                <option value="seminovo">Semi-novo / Impecável 👍</option>
                                <option value="recondicionado">Recondicionado Certificado 🔧</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Garantia / Suporte</label>
                              <input
                                type="text"
                                placeholder="Ex. 12 Meses de Garantia Oficial"
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden focus:border-amber-400 text-slate-800"
                                value={adminNewProductForm.warranty || ''}
                                onChange={(e) => setAdminNewProductForm({...adminNewProductForm, warranty: e.target.value})}
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Localização Física (Empresa)</label>
                              <select
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold focus:outline-hidden outline-hidden text-slate-800"
                                value={adminNewProductForm.location}
                                onChange={(e) => setAdminNewProductForm({...adminNewProductForm, location: e.target.value as any})}
                              >
                                <option value="Luanda">Luanda 📍</option>
                                <option value="Cabinda">Cabinda 📍</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Quando estará disponível? (Data/Prazo)</label>
                              <input
                                type="text"
                                placeholder="Ex. Imediata (Hoje), Em 3 dias, 12 de Julho..."
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden focus:border-amber-400 text-slate-800"
                                value={adminNewProductForm.availableFromDate}
                                onChange={(e) => setAdminNewProductForm({...adminNewProductForm, availableFromDate: e.target.value})}
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Descrição Detalhada do Artigo</label>
                              <textarea
                                placeholder="Insira detalhes técnicos, especificações, dimensões, voltas, etc..."
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden focus:border-amber-400 h-16 text-slate-800"
                                value={adminNewProductForm.description}
                                onChange={(e) => setAdminNewProductForm({...adminNewProductForm, description: e.target.value})}
                              />
                            </div>

                            {/* Multi-Photo Manager Section */}
                            <div className="sm:col-span-2 space-y-3 bg-slate-100/70 p-3.5 rounded-2xl border border-slate-250">
                              <div className="flex items-center justify-between">
                                <div>
                                  <label className="block text-xs font-black text-slate-800">📸 Galeria de Fotos do Artigo (Até 8 Fotos)</label>
                                  <p className="text-[10px] text-slate-500 font-medium">A primeira foto é a capa principal. Pode adicionar até 8 fotos por artigo.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                                    {(adminNewProductForm.photos || [adminNewProductForm.photoUrl]).filter(Boolean).length}/8 Fotos
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setShowStockGallery(!showStockGallery)}
                                    className="text-[10px] bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs active:scale-95"
                                  >
                                    📂 {showStockGallery ? "Fechar Banco" : "Banco de Imagens"}
                                  </button>
                                </div>
                              </div>

                              {/* Gallery Thumbnails List */}
                              {((adminNewProductForm.photos && adminNewProductForm.photos.length > 0) ? adminNewProductForm.photos : [adminNewProductForm.photoUrl]).filter(Boolean).length > 0 && (
                                <div className="space-y-1.5">
                                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Fotos cadastradas para este artigo:</span>
                                  <div className="flex flex-wrap gap-2.5">
                                    {((adminNewProductForm.photos && adminNewProductForm.photos.length > 0) ? adminNewProductForm.photos : [adminNewProductForm.photoUrl]).filter(Boolean).map((photo, idx) => {
                                      const isMain = idx === 0 || photo === adminNewProductForm.photoUrl;
                                      return (
                                        <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border-2 bg-white shadow-xs transition-all flex items-center justify-center">
                                          <img src={photo} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                          
                                          {isMain && (
                                            <div className="absolute top-1 left-1 bg-amber-400 text-slate-950 font-black text-[7.5px] px-1 py-0.5 rounded shadow">
                                              Capa
                                            </div>
                                          )}

                                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity p-1">
                                            {!isMain && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const currentPhotos = (adminNewProductForm.photos || [adminNewProductForm.photoUrl]).filter(Boolean);
                                                  const reordered = [photo, ...currentPhotos.filter(p => p !== photo)];
                                                  setAdminNewProductForm({
                                                    ...adminNewProductForm,
                                                    photoUrl: photo,
                                                    photos: reordered
                                                  });
                                                }}
                                                className="text-[7.5px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded cursor-pointer hover:bg-amber-300"
                                              >
                                                Tornar Capa
                                              </button>
                                            )}
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const currentPhotos = (adminNewProductForm.photos || [adminNewProductForm.photoUrl]).filter(Boolean);
                                                const filtered = currentPhotos.filter((_, i) => i !== idx);
                                                const nextMain = filtered[0] || '';
                                                setAdminNewProductForm({
                                                  ...adminNewProductForm,
                                                  photoUrl: nextMain,
                                                  photos: filtered
                                                });
                                              }}
                                              className="text-[8px] bg-red-500 text-white font-bold px-1.5 py-0.5 rounded cursor-pointer hover:bg-red-600"
                                            >
                                              Remover ✕
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {showStockGallery && (
                                <div className="bg-slate-100 border border-slate-250 p-3.5 rounded-2xl space-y-3 animate-fade-in text-slate-850">
                                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">🗂️ Galeria de Fotos de Artigos do Sistema</p>
                                  <p className="text-[9px] text-slate-450 -mt-1.5 font-medium">Clique para adicionar uma imagem à galeria do produto (máx 8 fotos).</p>
                                  
                                  <div className="space-y-3 max-h-56 overflow-y-auto scrollbar-thin">
                                    {SYSTEM_STOCK_GALLERY.map((cat, ci) => (
                                      <div key={ci} className="space-y-1.5">
                                        <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{cat.category}</h5>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                          {cat.images.map((img, imgi) => {
                                            const currentPhotos = (adminNewProductForm.photos || [adminNewProductForm.photoUrl]).filter(Boolean);
                                            const isSelected = currentPhotos.includes(img.url);
                                            return (
                                              <div 
                                                key={imgi}
                                                onClick={() => {
                                                  if (isSelected) return;
                                                  if (currentPhotos.length >= 8) {
                                                    showModalAlert("Limite Atingido", "Pode adicionar no máximo 8 fotos por artigo.", "warning");
                                                    return;
                                                  }
                                                  const updated = [...currentPhotos, img.url];
                                                  setAdminNewProductForm({
                                                    ...adminNewProductForm,
                                                    photoUrl: updated[0],
                                                    photos: updated
                                                  });
                                                }}
                                                className={`relative aspect-video rounded-lg overflow-hidden border cursor-pointer transition-all hover:scale-103 active:scale-97 bg-white ${
                                                  isSelected ? 'ring-2 ring-amber-500 border-transparent shadow-md' : 'border-slate-200'
                                                }`}
                                                title={img.name}
                                              >
                                                <img 
                                                  src={img.url} 
                                                  alt={img.name} 
                                                  className="w-full h-full object-cover"
                                                  referrerPolicy="no-referrer"
                                                />
                                                <div className="absolute inset-x-0 bottom-0 bg-slate-950/70 p-1 text-[7.5px] font-bold text-white text-center truncate">
                                                  {img.name}
                                                </div>
                                                {isSelected && (
                                                  <div className="absolute top-1 right-1 bg-amber-500 text-slate-950 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black shadow-xs">
                                                    ✓
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                {/* Upload Box */}
                                <div className="border-2 border-dashed border-slate-300 hover:border-amber-400 bg-white rounded-2xl p-4 transition-all flex flex-col items-center justify-center text-center relative group min-h-[110px] cursor-pointer">
                                  <input 
                                    type="file" 
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => {
                                      const files: File[] = e.target.files ? Array.from(e.target.files) : [];
                                      if (files.length === 0) return;
                                      
                                      files.forEach((file: File) => {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          const base64Str = reader.result as string;
                                          const img = new Image();
                                          img.src = base64Str;
                                          img.onload = () => {
                                            const canvas = document.createElement('canvas');
                                            const MAX_WIDTH = 500;
                                            const MAX_HEIGHT = 500;
                                            let width = img.width;
                                            let height = img.height;
                                            if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                                              if (width > height) {
                                                height = Math.round((height * MAX_WIDTH) / width);
                                                width = MAX_WIDTH;
                                              } else {
                                                width = Math.round((width * MAX_HEIGHT) / height);
                                                height = MAX_HEIGHT;
                                              }
                                            }
                                            canvas.width = width;
                                            canvas.height = height;
                                            const ctx = canvas.getContext('2d');
                                            const finalBase64 = ctx ? (ctx.drawImage(img, 0, 0, width, height), canvas.toDataURL('image/jpeg', 0.75)) : base64Str;
                                            
                                            setAdminNewProductForm(prev => {
                                              const current = (prev.photos || [prev.photoUrl]).filter(Boolean);
                                              if (current.length >= 8) return prev;
                                              const nextList = [...current, finalBase64];
                                              return {
                                                ...prev,
                                                photoUrl: nextList[0],
                                                photos: nextList
                                              };
                                            });
                                          };
                                        };
                                        reader.readAsDataURL(file);
                                      });
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                  />
                                  <div className="space-y-1 pointer-events-none">
                                    <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto text-base">
                                      📸
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-700">Adicionar Foto do Telemóvel / PC</p>
                                    <p className="text-[9px] text-slate-450">Selecione uma ou mais fotos para anexar</p>
                                  </div>
                                </div>

                                {/* Manual URL Box */}
                                <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col justify-center space-y-2">
                                  <label className="block text-[9.5px] font-bold text-slate-500">Ou adicionar Link URL de Foto:</label>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      placeholder="https://exemplo.com/foto.jpg"
                                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-[10px] font-medium focus:outline-hidden text-slate-800"
                                      id="admin-add-photo-url-input"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          const val = (e.currentTarget as HTMLInputElement).value.trim();
                                          if (val) {
                                            const current = (adminNewProductForm.photos || [adminNewProductForm.photoUrl]).filter(Boolean);
                                            if (current.length >= 8) {
                                              showModalAlert("Limite Atingido", "Pode adicionar no máximo 8 fotos por artigo.", "warning");
                                              return;
                                            }
                                            const updated = [...current, val];
                                            setAdminNewProductForm({
                                              ...adminNewProductForm,
                                              photoUrl: updated[0],
                                              photos: updated
                                            });
                                            (e.currentTarget as HTMLInputElement).value = '';
                                          }
                                        }
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const inputEl = document.getElementById('admin-add-photo-url-input') as HTMLInputElement;
                                        const val = inputEl?.value.trim();
                                        if (val) {
                                          const current = (adminNewProductForm.photos || [adminNewProductForm.photoUrl]).filter(Boolean);
                                          if (current.length >= 8) {
                                            showModalAlert("Limite Atingido", "Pode adicionar no máximo 8 fotos por artigo.", "warning");
                                            return;
                                          }
                                          const updated = [...current, val];
                                          setAdminNewProductForm({
                                            ...adminNewProductForm,
                                            photoUrl: updated[0],
                                            photos: updated
                                          });
                                          inputEl.value = '';
                                        }
                                      }}
                                      className="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-[10px] cursor-pointer"
                                    >
                                      Adicionar
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (!adminNewProductForm.name.trim()) {
                                  showModalAlert("Nome Requerido ⚠️", "Por favor insira o nome do artigo corporativo para prosseguir com a publicação!", "warning");
                                  return;
                                }

                                const generatedCode = `PRD-${1000 + supplierProducts.length + 1}`;
                                const photosList = (adminNewProductForm.photos && adminNewProductForm.photos.length > 0)
                                  ? adminNewProductForm.photos.filter(Boolean)
                                  : [adminNewProductForm.photoUrl].filter(Boolean);

                                const newProd: SupplierProduct = {
                                  id: `sup_prod-${Date.now()}`,
                                  productCode: generatedCode,
                                  supplierId: curSup.id,
                                  category: adminNewProductForm.category,
                                  subCategory: adminNewProductForm.subCategory,
                                  name: adminNewProductForm.name,
                                  description: adminNewProductForm.description,
                                  price: adminNewProductForm.price,
                                  originalPrice: adminNewProductForm.originalPrice || undefined,
                                  photoUrl: photosList[0] || adminNewProductForm.photoUrl,
                                  photos: photosList.length > 0 ? photosList : [adminNewProductForm.photoUrl],
                                  availability: adminNewProductForm.availability,
                                  stock: adminNewProductForm.stock,
                                  published: true,
                                  sponsored: false,
                                  featured: adminNewProductForm.featured || false,
                                  location: adminNewProductForm.location,
                                  availableFromDate: adminNewProductForm.availableFromDate || 'Imediata (Hoje)',
                                  warranty: adminNewProductForm.warranty || '12 Meses de Garantia Oficial',
                                  condition: adminNewProductForm.condition || 'novo',
                                  rating: 4.8,
                                  reviewsCount: 1,
                                  createdAt: new Date().toISOString()
                                };

                                onCreateSupplierProduct(newProd);

                                // reset
                                setAdminNewProductForm({
                                  name: '',
                                  productCode: '',
                                  supplierId: curSup.id,
                                  category: 'eletronicos',
                                  subCategory: 'computadores',
                                  price: 35000,
                                  originalPrice: 42000,
                                  availability: 'imediata',
                                  stock: 12,
                                  description: '',
                                  photoUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60',
                                  photos: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60'],
                                  location: 'Luanda',
                                  availableFromDate: 'Imediata (Hoje)',
                                  warranty: '12 Meses de Garantia',
                                  condition: 'novo',
                                  brand: '',
                                  model: '',
                                  featured: false
                                });
                                setShowAddProductForm(false);

                                setCustomDialog({
                                  title: "Artigo Homologado Publicado! 🚀",
                                  message: `O artigo corporativo "${newProd.name}" foi cadastrado com o Código de Identidade "${generatedCode}" e publicado no marketplace de Cabinda.\n\nDeseja alternar agora mesmo para o Marketplace para ver o produto e confirmar a exibição?`,
                                  type: "success",
                                  primaryAction: {
                                    label: "Sim, Ir Ver no Marketplace ➔",
                                    onClick: () => {
                                      if (onChangeRole) onChangeRole('client');
                                      if (onChangeView) onChangeView('mercado-fornecedores');
                                    }
                                  },
                                  secondaryActionLabel: "Permanecer na Gestão"
                                });
                              }}
                              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-black cursor-pointer shadow-xs transition-colors"
                            >
                              Finalizar Publicação de Artigo
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Product listing grid (Collapsed behind details/summary for zero clutter - Requirement) */}
                      <details className="group border border-slate-150 rounded-2xl bg-slate-50/50 p-4 transition-all" id="admin-product-disclosure" open>
                        <summary className="list-none flex items-center justify-between cursor-pointer font-black text-xs text-slate-500 uppercase tracking-widest select-none">
                          <span className="flex items-center gap-1.5 hover:text-slate-800 transition-colors">
                            📦 Artigos Cadastrados nesta Empresa ({curProducts.length})
                          </span>
                          <span className="text-sm text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        
                        <div className="space-y-3 pt-4 mt-4 border-t border-slate-200">
                          {curProducts.length === 0 ? (
                            <p className="text-xs text-slate-400 py-4 italic text-center">Nenhum produto cadastrado para este fornecedor. Use o formulário acima para cadastrar o primeiro.</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {curProducts.map(prod => {
                                const code = getProductCode(prod);
                                return (
                                  <div key={prod.id} className="bg-white p-3.5 rounded-2xl border border-slate-150 flex flex-col justify-between gap-3 text-slate-800 shadow-2xs">
                                    <div className="flex gap-3">
                                      {/* Clickable Image to preview full size */}
                                      <div 
                                        onClick={() => setAdminImagePreviewUrl({ url: prod.photoUrl, title: `${code} - ${prod.name}` })}
                                        className="relative group cursor-pointer w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200"
                                        title="Clique para ver imagem ampliada"
                                      >
                                        <img src={prod.photoUrl} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[10px] text-white font-bold">
                                          🔍 Ver
                                        </div>
                                      </div>

                                      <div className="space-y-1 overflow-hidden text-left flex-1">
                                        <div className="flex items-center justify-between gap-1">
                                          <span className="font-mono text-[9px] font-black text-slate-950 bg-amber-400 px-2 py-0.5 rounded-md">
                                            🏷️ {code}
                                          </span>
                                          <span className="text-[9px] text-slate-400 font-bold">Qtd: {prod.stock}</span>
                                        </div>
                                        <h5 className="font-bold text-xs text-slate-850 truncate">{prod.name}</h5>
                                        <p className="text-[11px] text-slate-800 font-mono font-black tracking-tight">{prod.price.toLocaleString('pt-AO')} AOA</p>

                                        <div className="flex items-center gap-1 my-1 flex-wrap">
                                          <span className="text-[8px] bg-amber-50 text-amber-900 font-bold px-1.5 py-0.5 rounded-md border border-amber-200">
                                            {getCategoryById(prod.category)?.icon || '📦'} {getCategoryById(prod.category)?.name || prod.category || 'Geral'}
                                          </span>
                                          <span className="text-[8px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md border border-emerald-200">
                                            {getSubCategoryName(prod.category, prod.subCategory) || prod.subCategory || 'Geral'}
                                          </span>
                                        </div>
                                        
                                        <div className="text-[9.5px] text-slate-500 font-semibold flex flex-col gap-0.5 my-1">
                                          <span>📍 Local: <strong>{prod.location || 'Luanda'}</strong></span>
                                          <span>📅 Disp.: <strong>{prod.availableFromDate || 'Imediata (Hoje)'}</strong></span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-1">
                                          <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-bold uppercase truncate ${
                                            prod.availability === 'imediata' ? 'bg-emerald-100 text-emerald-800' :
                                            prod.availability === 'sob-pedido' ? 'bg-amber-100 text-amber-800' :
                                            'bg-red-100 text-red-800'
                                          }`}>
                                            {prod.availability}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Quick controllers */}
                                    <div className="flex gap-1.5 border-t border-slate-200/60 pt-2 flex-wrap items-center justify-between font-semibold">
                                      <div className="flex gap-1 flex-wrap">
                                        {/* Edit Product */}
                                        <button
                                          type="button"
                                          onClick={() => setEditingProduct(prod)}
                                          className="px-2 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg text-[9px] font-black uppercase cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95"
                                        >
                                          <Edit3 className="w-2.5 h-2.5" />
                                          Editar ✏️
                                        </button>

                                        {/* Toggle state */}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const nextAvail = prod.availability === 'imediata' ? 'esgotado' : 'imediata';
                                            onUpdateSupplierProduct({ ...prod, availability: nextAvail, stock: nextAvail === 'esgotado' ? 0 : 10 });
                                          }}
                                          className="px-2 py-1 bg-white hover:bg-slate-200 border border-slate-250 text-slate-705 rounded-lg text-[9px] font-bold uppercase cursor-pointer"
                                        >
                                          Stock 🔄
                                        </button>
                                        
                                        {/* Publish / Unpublish */}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            onUpdateSupplierProduct({ ...prod, published: !prod.published });
                                          }}
                                          className={`px-2 py-1 border rounded-lg text-[9px] font-extrabold uppercase cursor-pointer ${
                                            prod.published 
                                              ? 'bg-emerald-50 text-emerald-800 border-emerald-250' 
                                              : 'bg-slate-200 text-slate-650 border-slate-350'
                                          }`}
                                        >
                                          {prod.published ? "Visível ✅" : "Oculto 🚫"}
                                        </button>

                                        {/* Filter / Search by this code */}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setAdminProductCodeSearch(code);
                                            window.scrollTo({ top: 400, behavior: 'smooth' });
                                          }}
                                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[9px] font-bold uppercase cursor-pointer"
                                        >
                                          Ver Pedidos 📋
                                        </button>
                                      </div>

                                      {/* Delete/Remove product option if needed */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (confirm("Deseja realmente eliminar permanentemente este anúncio de produto do catálogo público?")) {
                                            onUpdateSupplierProduct({ ...prod, published: false }); // hidden is safe
                                            showModalAlert("Produto Retirado", `O artigo ${prod.name} foi desativado do ecossistema público com sucesso.`, "warning");
                                          }
                                        }}
                                        className="text-[9px] text-red-650 hover:underline font-bold cursor-pointer"
                                      >
                                        Remover
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </details>
                    </div>
                  )}

                  {/* TAB CONTENT: SERVICES */}
                  {supplierSubTab === 'services' && (
                    <div className="space-y-4 animate-fade-in text-slate-800">
                      {/* Add Service Form */}
                      {showAddServiceForm && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 animate-slide-up text-slate-800">
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider text-left">CADASTRAR E PUBLICAR SERVIÇO DE LOGÍSTICA</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="text-left">
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Nome do Serviço</label>
                              <input
                                type="text"
                                placeholder="Ex. Despacho Aduaneiro Expresso"
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden focus:border-amber-400 text-slate-850"
                                value={adminNewServiceForm.name}
                                onChange={(e) => setAdminNewServiceForm({...adminNewServiceForm, name: e.target.value})}
                              />
                            </div>
                            <div className="text-left">
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Preço Estimado / Base (AOA)</label>
                              <input
                                type="number"
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold focus:outline-hidden focus:border-amber-400 text-slate-850"
                                value={adminNewServiceForm.price}
                                onChange={(e) => setAdminNewServiceForm({...adminNewServiceForm, price: Number(e.target.value)})}
                              />
                            </div>
                            <div className="text-left">
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Categoria do Serviço</label>
                              <select
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold focus:outline-hidden text-slate-850"
                                value={adminNewServiceForm.category}
                                onChange={(e) => setAdminNewServiceForm({...adminNewServiceForm, category: e.target.value as any})}
                              >
                                <option value="Despacho Aduaneiro">Despacho Aduaneiro</option>
                                <option value="Transporte de Carga">Transporte de Carga</option>
                                <option value="Compra Assistida">Compra Assistida</option>
                                <option value="Embalamento e Paletização">Embalamento e Paletização</option>
                                <option value="Inspeção de Mercadoria">Inspeção de Mercadoria</option>
                                <option value="Outros">Outros</option>
                              </select>
                            </div>
                            <div className="text-left">
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Local de Atendimento</label>
                              <select
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold focus:outline-hidden text-slate-850"
                                value={adminNewServiceForm.location}
                                onChange={(e) => setAdminNewServiceForm({...adminNewServiceForm, location: e.target.value as any})}
                              >
                                <option value="Luanda">Luanda 📍</option>
                                <option value="Cabinda">Cabinda 📍</option>
                                <option value="Ambos">Ambos / Conexão 📍</option>
                              </select>
                            </div>
                            <div className="sm:col-span-2 text-left">
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Descrição Curta</label>
                              <textarea
                                rows={2}
                                placeholder="Descreva o que está incluído no serviço..."
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-hidden focus:border-amber-400 text-slate-850"
                                value={adminNewServiceForm.description}
                                onChange={(e) => setAdminNewServiceForm({...adminNewServiceForm, description: e.target.value})}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (!adminNewServiceForm.name) {
                                  showModalAlert('Campos requeridos', 'Por favor, indique o nome do serviço.', 'warning');
                                  return;
                                }
                                const newS: SupplierService = {
                                  id: 'srv-' + Date.now(),
                                  supplierId: curSup.id,
                                  supplierName: curSup.name,
                                  name: adminNewServiceForm.name,
                                  price: adminNewServiceForm.price,
                                  category: adminNewServiceForm.category,
                                  description: adminNewServiceForm.description,
                                  location: adminNewServiceForm.location,
                                  photoUrl: adminNewServiceForm.photoUrl,
                                  published: true,
                                  createdAt: new Date().toISOString()
                                };
                                onCreateSupplierService(newS);
                                setAdminNewServiceForm({
                                  name: '',
                                  price: 75000,
                                  category: 'Despacho Aduaneiro',
                                  description: '',
                                  photoUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=500&auto=format&fit=crop&q=60',
                                  location: 'Luanda'
                                });
                                setShowAddServiceForm(false);
                                speak('Serviço cadastrado e publicado com sucesso!');
                                showModalAlert('Serviço Publicado', `O serviço "${newS.name}" foi registado com sucesso para este parceiro.`, 'success');
                              }}
                              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs cursor-pointer transition-colors"
                            >
                              Publicar Serviço Ativo
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Services listing details box */}
                      <details className="group border border-slate-150 rounded-2xl bg-slate-50/50 p-4 transition-all" open>
                        <summary className="list-none flex items-center justify-between cursor-pointer font-black text-xs text-slate-500 uppercase tracking-widest select-none">
                          <span className="flex items-center gap-1.5 hover:text-slate-800 transition-colors">
                            🛠️ Serviços Ativos e Publicados ({supplierServices.filter(s => s.supplierId === curSup.id).length})
                          </span>
                          <span className="text-sm text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                        </summary>

                        <div className="space-y-3 pt-4 mt-4 border-t border-slate-200">
                          {supplierServices.filter(s => s.supplierId === curSup.id).length === 0 ? (
                            <p className="text-xs text-slate-400 py-4 italic text-center">Nenhum serviço publicado para este parceiro comercial. Use o botão acima para publicar o primeiro.</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {supplierServices.filter(s => s.supplierId === curSup.id).map(srv => (
                                <div key={srv.id} className="bg-white p-3 rounded-2xl border border-slate-150 flex flex-col justify-between gap-3 text-slate-800 shadow-2xs">
                                  <div className="flex gap-3 text-left">
                                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0 font-bold border">
                                      🛠️
                                    </div>
                                    <div className="space-y-1 overflow-hidden">
                                      <h5 className="font-bold text-xs text-slate-850 truncate">{srv.name}</h5>
                                      <p className="text-[10px] text-slate-650 font-mono font-bold tracking-tight">{srv.price.toLocaleString('pt-AO')} AOA (Estimado)</p>
                                      <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">{srv.description}</p>
                                      <div className="text-[9.5px] text-slate-500 font-semibold flex flex-col gap-0.5 my-1">
                                        <span>📍 Atendimento: <strong>{srv.location || 'Luanda'}</strong></span>
                                        <span>🏷️ Categoria: <strong>{srv.category}</strong></span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex gap-1.5 border-t border-slate-200/60 pt-2 flex-wrap items-center justify-between font-semibold">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onUpdateSupplierService({ ...srv, published: !srv.published });
                                        speak('Estado do serviço atualizado!');
                                      }}
                                      className={`px-2 py-1 border rounded-lg text-[9px] font-extrabold uppercase cursor-pointer ${
                                        srv.published 
                                          ? 'bg-emerald-50 text-emerald-800 border-emerald-250' 
                                          : 'bg-slate-200 text-slate-650 border-slate-350'
                                      }`}
                                    >
                                      {srv.published ? "Ativo ✅" : "Pausado 🚫"}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm("Deseja realmente eliminar permanentemente este serviço?")) {
                                          onUpdateSupplierService({ ...srv, published: false });
                                          speak('Serviço ocultado.');
                                        }
                                      }}
                                      className="text-[9px] text-red-650 hover:underline font-bold cursor-pointer"
                                    >
                                      Remover
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </details>
                    </div>
                  )}

                  {/* TAB CONTENT: SERVICE REQUESTS */}
                  {supplierSubTab === 'requests' && (
                    <div className="space-y-4 animate-fade-in text-slate-800">
                      <div className="border border-slate-150 rounded-2xl bg-slate-50/50 p-4">
                        <h5 className="font-black text-xs text-slate-500 uppercase tracking-widest mb-3 text-left">
                          📥 Pedidos de Serviço Solicitados por Clientes ({serviceRequests.filter(r => r.supplierId === curSup.id).length})
                        </h5>

                        <div className="space-y-3">
                          {serviceRequests.filter(r => r.supplierId === curSup.id).length === 0 ? (
                            <p className="text-xs text-slate-400 py-8 italic text-center">Nenhuma solicitação de serviço recebida de clientes para este fornecedor.</p>
                          ) : (
                            serviceRequests.filter(r => r.supplierId === curSup.id).map(req => {
                              const statusColors = {
                                pendente: 'bg-amber-100 text-amber-800',
                                em_analise: 'bg-blue-100 text-blue-800',
                                aprovado: 'bg-emerald-100 text-emerald-800',
                                cancelado: 'bg-red-100 text-red-800',
                                concluido: 'bg-slate-100 text-slate-800'
                              }[req.status];

                              return (
                                <div key={req.id} className="bg-white p-4 rounded-xl border border-slate-150 space-y-3 text-left">
                                  <div className="flex justify-between items-start flex-wrap gap-2">
                                    <div>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{req.id} • {new Date(req.createdAt).toLocaleDateString('pt-AO')}</p>
                                      <h6 className="font-extrabold text-xs text-slate-850">{req.serviceName}</h6>
                                      <p className="text-xs text-slate-600 font-medium mt-1">Cliente: <strong className="text-slate-800">{req.clientName}</strong> ({req.clientPhone})</p>
                                    </div>
                                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${statusColors}`}>
                                      {req.status.replace('_', ' ')}
                                    </span>
                                  </div>

                                  {(req.description || req.notes) && (
                                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs text-slate-705 text-left">
                                      <span className="font-bold block text-slate-500 uppercase text-[9px] tracking-wider mb-1">Requisitos do Serviço:</span>
                                      <p className="italic font-semibold text-slate-700 leading-relaxed">"{req.description || req.notes}"</p>
                                    </div>
                                  )}

                                  {req.location && (
                                    <div className="text-[10px] text-slate-500 font-semibold text-left">
                                      📍 <strong>Morada de Execução:</strong> {req.location}
                                    </div>
                                  )}

                                  <div className="flex items-center gap-2 flex-wrap text-xs text-left">
                                    <span className="font-semibold text-slate-500">Custo Estimado:</span>
                                    <input
                                      type="number"
                                      className="w-32 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-850 focus:outline-hidden focus:border-amber-400"
                                      value={req.estimatedCost || ''}
                                      onChange={(e) => {
                                        onUpdateServiceRequest({ ...req, estimatedCost: Number(e.target.value) });
                                      }}
                                      placeholder="AOA"
                                    />
                                    <span className="text-[10px] text-slate-400 font-semibold">(Ajustável em tempo real)</span>
                                  </div>

                                  <div className="space-y-1 text-left">
                                    <span className="font-bold text-slate-500 uppercase text-[9px] tracking-wider">Resposta / Proposta Comercial (Visível ao Cliente):</span>
                                    <textarea
                                      rows={2}
                                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-amber-400"
                                      value={req.notes || ''}
                                      onChange={(e) => {
                                        onUpdateServiceRequest({ ...req, notes: e.target.value });
                                      }}
                                      placeholder="Ex: Proposta técnica aprovada. Iremos iniciar o fabrico metálico em 24h..."
                                    />
                                  </div>

                                  <div className="flex gap-2 pt-2 border-t border-slate-100 flex-wrap">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onUpdateServiceRequest({ ...req, status: 'em_analise' });
                                        speak('Pedido colocado em análise.');
                                      }}
                                      className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-[10px] font-bold cursor-pointer hover:bg-blue-100 transition-colors"
                                    >
                                      Analisar 🔍
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onUpdateServiceRequest({ ...req, status: 'aprovado' });
                                        speak('Pedido de serviço aprovado!');
                                      }}
                                      className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold cursor-pointer hover:bg-emerald-100 transition-colors"
                                    >
                                      Aprovar e Enviar Orçamento ✅
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onUpdateServiceRequest({ ...req, status: 'concluido' });
                                        speak('Serviço concluído com sucesso!');
                                      }}
                                      className="px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-[10px] font-bold cursor-pointer hover:bg-slate-200 transition-colors"
                                    >
                                      Concluir 🏆
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onUpdateServiceRequest({ ...req, status: 'cancelado' });
                                        speak('Serviço cancelado.');
                                      }}
                                      className="px-2.5 py-1 bg-red-50 text-red-800 border border-red-200 rounded-lg text-[10px] font-bold cursor-pointer hover:bg-red-100 transition-colors"
                                    >
                                      Rejeitar ❌
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                    {/* Chat com Fornecedor Direct Box */}
                    <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs space-y-4">
                      <div className="text-left">
                        <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">MESA PRIVADA COM PARCEIRO: {curSup.name}</h4>
                        <p className="text-[11px] text-slate-500 font-semibold mt-1">Use este canal para negociar preços de contentores, obter orçamentos em massa ou despachar guias oficiais de transição fiscal.</p>
                      </div>

                      {/* Supplier messages area */}
                      <div className="border border-slate-150 rounded-2xl bg-slate-50/50 p-4 h-64 overflow-y-auto space-y-3">
                        {supplierMessages.filter(m => m.supplierId === curSup.id).map(msg => {
                          const isFromMe = msg.sender === 'mediador';
                          return (
                            <div key={msg.id} className={`max-w-[80%] p-2.5 rounded-xl text-xs space-y-1 ${
                              isFromMe ? 'ml-auto bg-slate-900 border border-slate-800 text-white text-left' : 'mr-auto bg-white border border-slate-200 text-slate-800 text-left'
                            }`}>
                              <p className="font-semibold leading-relaxed whitespace-pre-line">{msg.text}</p>
                              <span className="block text-[8px] text-slate-400 text-right">{new Date(msg.timestamp).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          );
                        })}

                        {supplierMessages.filter(m => m.supplierId === curSup.id).length === 0 && (
                          <p className="text-center text-xs text-slate-400 py-16 italic font-medium">Sem mensagens históricas comerciais com este fornecedor.</p>
                        )}
                      </div>

                      {/* Chat form composer */}
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!adminSupplierChatInput.trim()) return;

                        const sMsg: SupplierMessage = {
                          id: `supmsg-${Date.now()}`,
                          supplierId: curSup.id,
                          sender: 'mediador',
                          text: adminSupplierChatInput.trim(),
                          timestamp: new Date().toISOString(),
                          read: true
                        };

                        onSendSupplierMessage(sMsg);
                        setAdminSupplierChatInput('');

                        // simulated response from supplier partner
                        setTimeout(() => {
                          const reactions = [
                            "Ok senhor diretor. O stock já está separado no galpão de Luanda aguardando a balsa de cabotagem.",
                            "Confirmamos a recepção do pedido para o Mediador. Consigo fazer um desconto de 5% se for compra de contentor inteiro.",
                            "Temos disponibilidade sim. Amanhã cedo despachamos os novos preços e fotos."
                          ];
                          const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];

                          const repMsg: SupplierMessage = {
                            id: `supmsg-${Date.now() + 1}`,
                            supplierId: curSup.id,
                            sender: 'fornecedor',
                            text: randomReaction,
                            timestamp: new Date().toISOString(),
                            read: false
                          };
                          onSendSupplierMessage(repMsg);
                        }, 1200);

                      }} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={adminSupplierChatInput}
                          onChange={(e) => setAdminSupplierChatInput(e.target.value)}
                          placeholder="Digite aqui para o canal comercial exclusivo do parceiro de Luanda..."
                          className="flex-1 bg-slate-50 border border-slate-200 p-2 text-xs rounded-xl focus:outline-hidden text-slate-800 font-semibold"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                        >
                          <span>Enviar</span> <Send className="w-3 h-3 text-slate-950" />
                        </button>
                      </form>
                    </div>

                  </div>
                );
              })()}

              {!adminSelectedSupplierId && (
                <div className="bg-white border border-slate-150 rounded-2xl p-16 text-center select-none text-slate-400">
                  <span className="text-4xl animate-bounce block">🤝</span>
                  <p className="font-extrabold text-xs uppercase tracking-wider mt-2">Escolha um parceiro de fornecedor para gerir</p>
                  <p className="text-[11px] text-slate-400 mt-1">Gerencie produtos de stock, mude planos de anúncios diamante ou negocie faturas de cabotagem.</p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {activeTab === 'collaborators' && (
        <div className="space-y-6 animate-scale-up" id="adm-collaborators-panel">
          
          {/* Key KPI Cards Grid for Commissions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-150 p-5 rounded-2xl shadow-xs text-left">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Total Colaboradores</p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{collaborators.length} Afiliados</p>
              <div className="text-[10px] text-emerald-600 mt-2 flex items-center gap-1 font-medium">
                <Users className="w-3.5 h-3.5 text-emerald-500" />
                Vendedores Ativos na Organização
              </div>
            </div>

            <div className="bg-white border border-slate-150 p-5 rounded-2xl shadow-xs text-left">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Volume Comercial Trazido</p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">
                {formatCurrency(collaboratorSales.reduce((acc, s) => acc + s.saleAmount, 0))}
              </p>
              <div className="text-[10px] text-sky-600 mt-2 flex items-center gap-1 font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-sky-500" />
                Total de Negócios Externos
              </div>
            </div>

            <div className="bg-white border border-slate-150 p-5 rounded-2xl shadow-xs text-left">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Comissões Liquidadas (Pagas)</p>
              <p className="text-xl font-extrabold text-emerald-700 mt-1">
                {formatCurrency(collaboratorSales.filter(s => s.status === 'pago').reduce((acc, s) => acc + s.calculatedCommission, 0))}
              </p>
              <div className="text-[10px] text-emerald-600 mt-2 flex items-center gap-1 font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                Pagas aos Captadores / Promotores
              </div>
            </div>

            <div className="bg-white border border-slate-150 p-5 rounded-2xl shadow-xs text-left">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Comissões Pendentes</p>
              <p className="text-xl font-extrabold text-amber-600 mt-1">
                {formatCurrency(collaboratorSales.filter(s => s.status === 'pendente').reduce((acc, s) => acc + s.calculatedCommission, 0))}
              </p>
              <div className="text-[10px] text-amber-500 mt-2 flex items-center gap-1 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                A aguardar liquidação de venda
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Form A: Cadastrar Novo Colaborador */}
            <div className="bg-white border border-slate-150 p-5 rounded-3xl space-y-4 shadow-xs text-left">
              <div className="flex items-center gap-2 border-b pb-3.5">
                <div className="bg-blue-50 text-blue-700 p-2 rounded-xl">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Cadastrar Novo Colaborador</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Registe promotores, agentes e consultores da rede Mediador</p>
                </div>
              </div>

              <form onSubmit={handleAddCollaborator} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      value={newColabForm.name}
                      onChange={(e) => setNewColabForm({ ...newColabForm, name: e.target.value })}
                      placeholder="Ex: Pedro Domingos Santos"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Telemóvel (AO) *</label>
                    <input
                      type="text"
                      required
                      value={newColabForm.phone}
                      onChange={(e) => setNewColabForm({ ...newColabForm, phone: e.target.value })}
                      placeholder="Ex: +244 923 111 222"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Email Comercial (Opcional)</label>
                    <input
                      type="email"
                      value={newColabForm.email}
                      onChange={(e) => setNewColabForm({ ...newColabForm, email: e.target.value })}
                      placeholder="Ex: pedro.santos@parceiro.com"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Cargo / Função</label>
                    <select
                      value={newColabForm.role}
                      onChange={(e) => setNewColabForm({ ...newColabForm, role: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-slate-700 font-semibold"
                    >
                      <option value="Consultor de Negócios / Afiliado">Consultor de Negócios / Afiliado</option>
                      <option value="Agente Independente">Agente Independente</option>
                      <option value="Promotor Comercial & Redes">Promotor Comercial & Redes</option>
                      <option value="Captador de Clientes">Captador de Clientes</option>
                      <option value="Parceiro de Logística">Parceiro de Logística</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Percentagem Padrão de Comissão do Captador (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newColabForm.defaultCommissionPercentage === 0 ? '' : newColabForm.defaultCommissionPercentage}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setNewColabForm({ ...newColabForm, defaultCommissionPercentage: 0 });
                        } else {
                          const parsed = parseInt(val, 10);
                          setNewColabForm({ ...newColabForm, defaultCommissionPercentage: isNaN(parsed) ? 0 : Math.min(100, Math.max(0, parsed)) });
                        }
                      }}
                      className="w-full p-2.5 pl-9 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-slate-700 font-black"
                    />
                    <div className="absolute left-3 top-3.5 text-slate-400">
                      <Percent className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1">Este valor servirá como padrão ao registar vendas associadas a este colaborador.</p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 text-amber-400 hover:bg-slate-800 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-98 flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Adicionar Colaborador à Rede 👥</span>
                </button>
              </form>
            </div>

            {/* Form B: Registar Nova Venda com Comissão */}
            <div className="bg-white border border-slate-150 p-5 rounded-3xl space-y-4 shadow-xs text-left">
              <div className="flex items-center gap-2 border-b pb-3.5">
                <div className="bg-amber-100 text-amber-800 p-2 rounded-xl">
                  <Coins className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Registar Venda & Comissão</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Lance o valor comercial, a comissão base e a percentagem acordada</p>
                </div>
              </div>

              <form onSubmit={handleAddColabSale} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Colaborador Indicado *</label>
                    <select
                      required
                      value={newColabSaleForm.collaboratorId}
                      onChange={(e) => {
                        const targetCol = collaborators.find(c => c.id === e.target.value);
                        setNewColabSaleForm({ 
                          ...newColabSaleForm, 
                          collaboratorId: e.target.value,
                          collaboratorPercentage: targetCol ? targetCol.defaultCommissionPercentage : newColabSaleForm.collaboratorPercentage 
                        });
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-slate-700 font-semibold"
                    >
                      <option value="">-- Selecione o Colaborador --</option>
                      {collaborators.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Cliente Angariado *</label>
                    <input
                      type="text"
                      required
                      value={newColabSaleForm.clientName}
                      onChange={(e) => setNewColabSaleForm({ ...newColabSaleForm, clientName: e.target.value })}
                      placeholder="Nome do cliente trazido"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Descrição do Negócio / Venda *</label>
                  <input
                    type="text"
                    required
                    value={newColabSaleForm.saleDescription}
                    onChange={(e) => setNewColabSaleForm({ ...newColabSaleForm, saleDescription: e.target.value })}
                    placeholder="Ex: Compra de Contentor Logístico em Luanda"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-slate-700"
                  />
                </div>

                {/* Dynamic/Fixed calculation selector */}
                <div className="space-y-2.5">
                  <div className="bg-slate-50 border p-3 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                    <div>
                      <span className="text-[10px] uppercase font-black text-slate-500 block">📊 Método de Comissão do Captador</span>
                      <p className="text-[9.5px] text-slate-400">Determinar se a percentagem varia em função do preço do negócio.</p>
                    </div>
                    <div className="flex bg-slate-200 p-0.5 rounded-lg shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCalculationDynamic(true);
                          setNewColabSaleForm(prev => ({
                            ...prev,
                            collaboratorPercentage: getDynamicCommissionRate(prev.saleAmount)
                          }));
                        }}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          isCalculationDynamic 
                          ? 'bg-amber-400 text-slate-950 shadow-xs' 
                          : 'text-slate-600 hover:text-slate-950 font-semibold'
                        }`}
                      >
                        🔀 Escalonável
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCalculationDynamic(false);
                        }}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          !isCalculationDynamic 
                          ? 'bg-slate-800 text-white shadow-xs' 
                          : 'text-slate-600 hover:text-slate-950 font-semibold'
                        }`}
                      >
                        📌 Padrão Fixo
                      </button>
                    </div>
                  </div>

                  {isCalculationDynamic && (
                    <div className="bg-amber-50/75 border border-amber-100 p-3.5 rounded-2xl text-[9.5px] text-slate-700 leading-normal font-semibold">
                      <span className="text-amber-700 font-extrabold uppercase block mb-1">💡 Tabela de Escalonamento Dinâmico Activa:</span>
                      <div className="grid grid-cols-2 gap-2 text-slate-600 font-medium">
                        <div>• Vendas &lt; 300 Mil Kz: <span className="font-extrabold text-amber-600">8%</span></div>
                        <div>• Vendas 300 Mil ~ 1M Kz: <span className="font-extrabold text-amber-600">12%</span></div>
                        <div>• Vendas 1M ~ 3M Kz: <span className="font-extrabold text-amber-600">15%</span></div>
                        <div>• Vendas &gt; 3M Kz: <span className="font-extrabold text-amber-600">18%</span></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Preço da Venda (Kz)</label>
                    <input
                      type="number"
                      step="1000"
                      min="1000"
                      value={newColabSaleForm.saleAmount}
                      onChange={(e) => {
                        const val = Math.max(1000, parseInt(e.target.value) || 0);
                        const dynamicPercent = isCalculationDynamic ? getDynamicCommissionRate(val) : newColabSaleForm.collaboratorPercentage;
                        setNewColabSaleForm({
                          ...newColabSaleForm,
                          saleAmount: val,
                          collaboratorPercentage: dynamicPercent
                        });
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-slate-700 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Preço de Comissão (Kz) *</label>
                    <input
                      type="number"
                      step="500"
                      min="100"
                      value={newColabSaleForm.commissionPrice}
                      onChange={(e) => setNewColabSaleForm({ ...newColabSaleForm, commissionPrice: Math.max(100, parseInt(e.target.value) || 0) })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-slate-700 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Percentagem (%) *</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newColabSaleForm.collaboratorPercentage === 0 ? '' : newColabSaleForm.collaboratorPercentage}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setNewColabSaleForm({ ...newColabSaleForm, collaboratorPercentage: 0 });
                        } else {
                          const parsed = parseInt(val, 10);
                          setNewColabSaleForm({ ...newColabSaleForm, collaboratorPercentage: isNaN(parsed) ? 0 : Math.min(100, Math.max(0, parsed)) });
                        }
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden font-black text-slate-750"
                    />
                  </div>
                </div>

                {/* Realtime calculations preview block */}
                {(() => {
                  const commVal = Math.floor(newColabSaleForm.commissionPrice * (newColabSaleForm.collaboratorPercentage / 100));
                  return (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-slate-800">
                      <div>
                        <p className="text-[9px] uppercase font-bold text-slate-400">Ganhos do Colaborador (Cálculo em Tempo Real):</p>
                        <p className="text-[10px] text-slate-500 leading-normal">Fórmula: {formatCurrency(newColabSaleForm.commissionPrice)} comissão geral × {newColabSaleForm.collaboratorPercentage}%</p>
                      </div>
                      <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200">
                        + {formatCurrency(commVal)}
                      </span>
                    </div>
                  );
                })()}

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 text-amber-400 hover:bg-slate-800 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-98 flex items-center justify-center gap-2 shadow-xs"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Registar Negócio e Deduzir Comissão 💰</span>
                </button>
              </form>
            </div>
          </div>

          {/* Table A: Lista de Vendedores/Colaboradores */}
          <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-xs text-left space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
              <div>
                <h4 className="text-sm font-black text-slate-800">Quadro de Colaboradores de Captura</h4>
                <p className="text-xs text-slate-400">Relação de parceiros e promotores ativos no ecossistema e faturamento creditado</p>
              </div>
              <span className="bg-slate-100 text-slate-600 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                {collaborators.length} Funcionários de Parcerias
              </span>
            </div>

            <div className="overflow-x-auto border rounded-2xl">
              <table className="w-full text-xs text-left divide-y">
                <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase tracking-widest font-black">
                  <tr>
                    <th className="p-3.5">Nome / ID</th>
                    <th className="p-3.5">Cargo / Atividade</th>
                    <th className="p-3.5">Contactos</th>
                    <th className="p-3.5 text-center">Fatia Comercial Padrão</th>
                    <th className="p-3.5 text-center">Vendas Concluídas</th>
                    <th className="p-3.5 text-right">Comissões Pagas</th>
                    <th className="p-3.5">Data de Registo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-705">
                  {collaborators.map(c => (
                    <tr 
                      key={c.id} 
                      onClick={() => {
                        setSelectedColabId(c.id === selectedColabId ? null : c.id);
                        speak(`Selecionado colaborador ${c.name}`);
                      }}
                      className={`transition-all duration-200 cursor-pointer ${
                        c.id === selectedColabId 
                          ? 'bg-amber-50/80 font-semibold border-l-4 border-l-amber-400' 
                          : 'hover:bg-slate-50/60'
                      }`}
                    >
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-950 text-amber-400 font-extrabold flex items-center justify-center shrink-0 uppercase text-[10px]">
                            {c.name.substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-800">{c.name}</p>
                            <span className="font-mono text-[9px] text-slate-400">{c.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700">
                        {c.role}
                      </td>
                      <td className="p-3.5 space-y-0.5">
                        <p className="font-bold text-slate-800">{c.phone}</p>
                        <p className="text-[10.5px] text-slate-455 font-medium">{c.email}</p>
                      </td>
                      <td className="p-3.5 font-mono text-center font-black text-slate-900 text-emerald-700">
                        {c.defaultCommissionPercentage}%
                      </td>
                      <td className="p-3.5 text-center font-bold">
                        <span className="bg-slate-100 text-slate-700 font-black px-2 py-0.5 rounded-sm">
                          {c.totalSalesBrought} vendas
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-extrabold text-slate-800 text-emerald-800">
                        {formatCurrency(c.totalEarnedCommissions)}
                      </td>
                      <td className="p-3.5 text-slate-404 text-[10.5px]">
                        {new Date(c.joinedAt).toLocaleDateString('pt-AO')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PAINEL DETALHADO DO COLABORADOR SELECIONADO & CALCULADORA AUTOMÁTICA */}
          {(() => {
            if (!selectedColabId) return null;
            const colab = collaborators.find(c => c.id === selectedColabId);
            if (!colab) return null;

            // Filter sales for this collaborator
            const colabSales = collaboratorSales.filter(s => s.collaboratorId === selectedColabId);
            const totalSalesVolume = colabSales.reduce((acc, s) => acc + (s.saleAmount || 0), 0);
            const totalCommissionEarnedPaid = colabSales.filter(s => s.status === 'pago').reduce((acc, s) => acc + (s.calculatedCommission || 0), 0);
            const totalCommissionPending = colabSales.filter(s => s.status === 'pendente').reduce((acc, s) => acc + (s.calculatedCommission || 0), 0);
            const totalCommissionExpected = totalCommissionEarnedPaid + totalCommissionPending;

            // Interactive prospect calculations
            const liveProspectivePayout = Math.floor(calcCommissionPrice * (calcPercentage / 100));

            return (
              <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 shadow-xl text-left space-y-6 animate-fade-in">
                {/* Header info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xl shrink-0 border-2 border-slate-800 shadow-sm">
                      {colab.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-black text-amber-400">{colab.name}</h4>
                        <span className="bg-slate-800 text-amber-300 text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest">{colab.role}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 font-medium font-sans">Controlo Consolidado de Parcerias Angolanas de Cabinda</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-300 mt-2 font-mono">
                        <span className="flex items-center gap-1">📞 Tel: {colab.phone}</span>
                        <span className="flex items-center gap-1">✉️ Email: {colab.email}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedColabId(null)}
                    className="self-end md:self-center px-4 py-2 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-755 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Fechar Detalhes ✕
                  </button>
                </div>

                {/* 3 Columns Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Histórico de Registo</p>
                    <p className="text-xs font-semibold text-slate-200 mt-2">Membro desde</p>
                    <p className="text-sm font-black text-amber-400 font-mono mt-0.5">
                      {new Date(colab.joinedAt).toLocaleDateString('pt-AO', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <div className="text-[10px] text-slate-500 mt-2 font-mono">Permissão: Acesso Autenticado</div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Faturação Trazida</p>
                    <p className="text-xl font-extrabold text-white font-mono mt-2">{formatCurrency(totalSalesVolume)}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Giro de capital em nome da empresa</p>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Comissões Pagas</p>
                    <p className="text-xl font-extrabold text-emerald-400 font-mono mt-2">{formatCurrency(totalCommissionEarnedPaid)}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{colabSales.filter(s => s.status === 'pago').length} acordos liquidados com sucesso</p>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-red-400 tracking-wider">Comissões Pendentes (Owed)</p>
                    <p className="text-xl font-extrabold text-red-400 font-mono mt-2">{formatCurrency(totalCommissionPending)}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Soma a pagar na próxima liquidação</p>
                  </div>
                </div>

                {/* Content Layout: Sales log lists + Automated calculator */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-xs font-sans">
                  
                  {/* Sales History Log List (5 Cols) */}
                  <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4">
                    <div className="border-b border-slate-800 pb-2">
                      <h5 className="font-extrabold text-xs text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                        📂 Histórico de Vendas & Comissionamentos
                      </h5>
                      <p className="text-[10px] text-slate-500 mt-0.5">Vendas trazidas pelo parceiro para a organização</p>
                    </div>

                    {colabSales.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 text-xs font-medium">
                        Este colaborador ainda não possui transações registadas no sistema.
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                        {colabSales.map(s => (
                          <div key={s.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5 hover:border-slate-700 transition-colors">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-mono text-slate-400 font-bold">{s.id}</span>
                              <span className={`text-[8.5px] px-2 py-0.5 rounded-sm font-black uppercase tracking-wider ${
                                s.status === 'pago' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-900' : 'bg-red-950/80 text-red-400 border border-red-900'
                              }`}>
                                {s.status === 'pago' ? 'PAGO' : 'PENDENTE'}
                              </span>
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-200">Cliente: {s.clientName}</p>
                              <p className="text-[10.5px] text-slate-400 italic line-clamp-1">{s.saleDescription}</p>
                            </div>
                            <div className="grid grid-cols-3 gap-1 border-t border-slate-900 pt-2 text-[10px] font-mono">
                              <div>
                                <span className="block text-[8px] text-slate-500 uppercase font-black">Valor Venda</span>
                                <span className="text-slate-300 font-bold block">{formatCurrency(s.saleAmount)}</span>
                              </div>
                              <div>
                                <span className="block text-[8px] text-slate-500 uppercase font-black">Comissão Bruta</span>
                                <span className="text-slate-300 font-bold block">{formatCurrency(s.commissionPrice)}</span>
                              </div>
                              <div>
                                <span className="block text-[8px] text-amber-400 uppercase font-black">Ganho ({s.collaboratorPercentage}%)</span>
                                <span className="text-amber-400 font-bold block">{formatCurrency(s.calculatedCommission)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Calculator Engine (7 Cols) */}
                  <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-5">
                    <div className="border-b border-slate-800 pb-2.5 flex items-center justify-between">
                      <div>
                        <h5 className="font-extrabold text-xs text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                          🧮 Máquina de Cálculo Automático de Comissões
                        </h5>
                        <p className="text-[10px] text-slate-500 mt-0.5">Sumarizador automático em tempo real para tomada de decisão</p>
                      </div>
                      <span className="bg-slate-800 text-slate-300 text-[10px] px-2.5 py-1 rounded-md font-mono font-bold border border-slate-700">
                        Sincronizada 🔄
                      </span>
                    </div>

                    {/* Meta progress tracker */}
                    <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-300">Meta de Comissão Acumulada Mensal</span>
                        <span className="font-mono font-black text-amber-400">{formatCurrency(totalCommissionExpected)} / {formatCurrency(calcMonthlyGoal)}</span>
                      </div>
                      
                      {/* Bar */}
                      <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.floor((totalCommissionExpected / calcMonthlyGoal) * 100))}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center text-[10px] text-slate-500 pt-0.5 font-mono">
                        <span>Progresso: {Math.floor((totalCommissionExpected / calcMonthlyGoal) * 100)}% da meta</span>
                        <div className="flex items-center gap-1">
                          <span>Ajustar Meta:</span>
                          <input 
                            type="range"
                            min="50000"
                            max="1000000"
                            step="20000"
                            value={calcMonthlyGoal}
                            onChange={(e) => setCalcMonthlyGoal(Number(e.target.value))}
                            className="w-20 accent-amber-500 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Interactive Prospecting simulation */}
                    <div className="space-y-3">
                      <h6 className="font-bold text-[11px] text-slate-300 uppercase tracking-wide">
                        🔮 Simulador Prospetivo em Tempo Real (O que acontece se trouxer este cliente?)
                      </h6>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Preço do Negócio (Kz)</label>
                          <input 
                            type="number" 
                            step="10000"
                            value={calcSaleAmount}
                            onChange={(e) => setCalcSaleAmount(Math.max(1000, Number(e.target.value)))}
                            className="bg-slate-950 border border-slate-850 text-slate-100 font-mono font-bold text-xs p-2 rounded-lg w-full focus:outline-hidden"
                          />
                          <span className="text-[9px] text-slate-500 block">Investimento estimado do cliente</span>
                        </div>

                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Preço da Comissão Comercial Cabinda</label>
                          <input 
                            type="number" 
                            step="5000"
                            value={calcCommissionPrice}
                            onChange={(e) => setCalcCommissionPrice(Math.max(1000, Number(e.target.value)))}
                            className="bg-slate-950 border border-slate-850 text-slate-100 font-mono font-bold text-xs p-2 rounded-lg w-full focus:outline-hidden"
                          />
                          <span className="text-[9px] text-slate-500 block">Comissão bruta gerada para a nossa agência</span>
                        </div>

                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Fração de Comissionamento (%)</label>
                          <input 
                            type="number" 
                            min="0"
                            max="100"
                            value={calcPercentage === 0 ? '' : calcPercentage}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '') {
                                setCalcPercentage(0);
                              } else {
                                const parsed = parseInt(val, 10);
                                setCalcPercentage(isNaN(parsed) ? 0 : Math.min(100, Math.max(0, parsed)));
                              }
                            }}
                            className="bg-slate-950 border border-slate-850 text-slate-100 font-mono font-bold text-xs p-2 rounded-lg w-full focus:outline-hidden text-amber-400"
                          />
                          <span className="text-[9px] text-slate-500 block">Percentual acordado com {colab.name}</span>
                        </div>
                      </div>

                      {/* Live outcome block */}
                      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-left">
                          <h6 className="text-xs font-black text-amber-400 uppercase tracking-wider">Acordo Prospetivo Resultante</h6>
                          <p className="text-[10.5px] text-slate-400 mt-1">Este negócio distribuirá um rendimento imediato de {calcPercentage}% para o colaborador.</p>
                        </div>
                        <div className="text-right">
                          <span className="block text-[9px] text-slate-500 uppercase font-black">Ganho Prospetivo para Ele</span>
                          <span className="text-lg font-black font-mono text-emerald-400">{formatCurrency(liveProspectivePayout)}</span>
                        </div>
                      </div>

                      {/* Interactive Button to insert this prospects right into a fresh collaboratorSale */}
                      <button
                        onClick={() => {
                          const calculatedCommission = Math.floor(calcCommissionPrice * (calcPercentage / 100));
                          const saleId = `sale-${Date.now()}`;
                          const prospSale: CollaboratorSale = {
                            id: saleId,
                            collaboratorId: colab.id,
                            collaboratorName: colab.name,
                            clientName: 'Cliente Simulado Prospetivo',
                            saleDescription: `Simulação de Venda Autorizada (${formatCurrency(calcSaleAmount)})`,
                            saleAmount: calcSaleAmount,
                            commissionPrice: calcCommissionPrice,
                            collaboratorPercentage: calcPercentage,
                            calculatedCommission: calculatedCommission,
                            status: 'pendente' as 'pago' | 'pendente',
                            createdAt: new Date().toISOString()
                          };

                          const updatedSales = [prospSale, ...collaboratorSales];
                          const updatedColabs = collaborators.map(c => {
                            if (c.id === colab.id) {
                              return {
                                ...c,
                                totalSalesBrought: c.totalSalesBrought + 1
                              };
                            }
                            return c;
                          });

                          onUpdateCollaboratorSales(updatedSales);
                          onUpdateCollaborators(updatedColabs);
                          showModalAlert('Venda Prospetiva Sincronizada', `Uma nova venda prospetiva de ${formatCurrency(calcSaleAmount)} foi consolidada no historial do parceiro! A comissão de ${formatCurrency(calculatedCommission)} subiu na calculadora do sistema automaticamente.`, 'success');
                          speak("Venda prospetiva adicionada com calculadora inteligente.");
                        }}
                        className="w-full py-2.5 bg-amber-400 text-slate-900 font-extrabold text-[10px] uppercase tracking-wider rounded-xl hover:bg-amber-300 transition-all active:scale-98 cursor-pointer text-center"
                      >
                        ⚡ Sincronizar e Injetar este Negócio Estimado no Historial Comercial do Colaborador
                      </button>
                    </div>

                  </div>

                </div>

              </div>
            );
          })()}

          {/* Table B: Historial de Vendas & Comissões */}
          <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-xs text-left space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
              <div>
                <h4 className="text-sm font-black text-slate-800">Historial das Vendas de Intermediação e Comissionados</h4>
                <p className="text-xs text-slate-400">Verifique os montantes comerciais registados, porcentagens e estados de liquidação</p>
              </div>
              <div className="flex gap-2">
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-3 py-1 rounded-full font-bold">
                  {collaboratorSales.filter(s => s.status === 'pago').length} Pagos
                </span>
                <span className="bg-amber-100 text-amber-800 text-[10px] px-3 py-1 rounded-full font-bold">
                  {collaboratorSales.filter(s => s.status === 'pendente').length} Pendentes
                </span>
              </div>
            </div>

            <div className="overflow-x-auto border rounded-2xl">
              <table className="w-full text-xs text-left divide-y animate-fade-in">
                <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase tracking-widest font-black">
                  <tr>
                    <th className="p-3.5">Código / Data</th>
                    <th className="p-3.5">Vendedor / Captador</th>
                    <th className="p-3.5">Cliente / Negócio Ocorrido</th>
                    <th className="p-3.5 text-right">Valor Venda</th>
                    <th className="p-3.5 text-right">Comissões Base</th>
                    <th className="p-3.5 text-center">Fração %</th>
                    <th className="p-3.5 text-right">Ganho Retido</th>
                    <th className="p-3.5 text-center">Estado Financeiro</th>
                    <th className="p-3.5 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-705">
                  {collaboratorSales.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 font-mono">
                        <p className="font-bold text-slate-700">{s.id}</p>
                        <span className="text-[10px] text-slate-400">{new Date(s.createdAt).toLocaleDateString('pt-AO')}</span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-800">
                        {s.collaboratorName}
                      </td>
                      <td className="p-3.5 space-y-0.5 max-w-[200px]">
                        <p className="font-bold text-slate-900 leading-tight">Cliente: {s.clientName}</p>
                        <p className="text-[10.5px] text-slate-500 font-medium truncate">{s.saleDescription}</p>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-slate-600">
                        {formatCurrency(s.saleAmount)}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-slate-700">
                        {formatCurrency(s.commissionPrice)}
                      </td>
                      <td className="p-3.5 text-center font-mono font-black text-slate-700">
                        {s.collaboratorPercentage}%
                      </td>
                      <td className="p-3.5 text-right font-mono font-extrabold text-emerald-800">
                        {formatCurrency(s.calculatedCommission)}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSaleStatus(s.id)}
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1 hover:ring-2 hover:ring-slate-200 ${
                            s.status === 'pago' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}
                          title="Clique para alternar estado de liquidação"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'pago' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                          {s.status === 'pago' ? 'LIQUIDADO ✓' : 'PENDENTE ⏱'}
                        </button>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => downloadCollaboratorSaleInvoice(s)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-lg cursor-pointer transition-all w-8 h-8 flex items-center justify-center"
                            title="Descarregar Recibo de Comissão Oficial (Fatura)"
                          >
                            📥
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                              if (confirm(`Deseja mesmo remover o registo de venda de ${s.clientName}?`)) {
                                handleDeleteColabSale(s.id);
                              }
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg cursor-pointer transition-all w-8 h-8 font-black flex items-center justify-center"
                            title="Excluir registo"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* CHATBOT 24/7 IA & LOGISTICS CONFIGURATION MANAGEMENT TAB */}
      {activeTab === 'chatbot' && (
        <div className="space-y-6 animate-fade-in" id="adm-chatbot-section">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 rounded-3xl text-white border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black font-display tracking-tight text-white flex items-center gap-2">
                      Gestão de Logística & IA 24/7
                      <span className="text-[10px] bg-emerald-500 text-white font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Base Dinâmica Ativa
                      </span>
                    </h2>
                    <p className="text-xs text-slate-300 font-medium">
                      Configure modais, prazos oficiais, base de conhecimento e parâmetros do Assistente IA 24/7 em tempo real
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="bg-slate-800/80 border border-slate-700/80 px-3.5 py-2 rounded-2xl flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Sincronização IA</span>
                    <span className="text-xs font-black text-amber-300">Tempo Real (0s delay)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex flex-wrap gap-2 pt-5 border-t border-slate-800/80 mt-5 relative z-10">
              <button
                type="button"
                onClick={() => { setBotSubTab('logistica'); speak("Painel de configurações de logística aberto."); }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                  botSubTab === 'logistica'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Configurações de Logística (Prazos & Modais)</span>
              </button>

              <button
                type="button"
                onClick={() => { setBotSubTab('knowledge'); speak("Base de conhecimento dinâmica aberta."); }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                  botSubTab === 'knowledge'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Base de Conhecimento Dinâmica ({activeKnowledge.length} Tópicos)</span>
              </button>

              <button
                type="button"
                onClick={() => { setBotSubTab('audit'); speak("Histórico de auditoria e logs aberto."); }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                  botSubTab === 'audit'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Histórico de Auditoria ({activeAuditLogs.length} Registos)</span>
              </button>

              <button
                type="button"
                onClick={() => { setBotSubTab('settings_sim'); speak("Parâmetros do bot e simulador abertos."); }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                  botSubTab === 'settings_sim'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Simulador em Tempo Real & Regras</span>
              </button>
            </div>
          </div>

          {/* Feedbacks */}
          {logisticsSaveFeedback && (
            <div className="bg-emerald-500 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <div>
                  <h4 className="font-black text-sm">Configurações de Logística Salvas com Sucesso!</h4>
                  <p className="text-xs text-emerald-100 font-medium">
                    A IA do Mediador Cabinda e todos os canais de atendimento já estão a responder automaticamente com os novos prazos e dados configurados.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono bg-white/20 px-3 py-1 rounded-xl">Auditado ✓</span>
            </div>
          )}

          {knowledgeFeedback && (
            <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 shrink-0 text-amber-300" />
                <div>
                  <h4 className="font-black text-sm">{knowledgeFeedback}</h4>
                  <p className="text-xs text-blue-100 font-medium">
                    A base de dados de FAQ e o cérebro da IA foram atualizados sem necessidade de alterar código.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 1: LOGÍSTICA (Prazos, Modais, Taxas, Armazéns) */}
          {botSubTab === 'logistica' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Context Box */}
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-amber-950">
                <Truck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-extrabold text-amber-900">
                    Sincronização Direta com o Assistente IA 24/7
                  </p>
                  <p className="text-amber-800 leading-relaxed">
                    Qualquer alteração efetuada nos prazos abaixo (ex: alterar Marítimo de 2–3 dias para 3–4 dias) é injetada automaticamente no contexto da IA. Quando os clientes perguntarem no chat sobre prazos de entrega marítimos ou aéreos, a IA responderá instantaneamente com os novos valores configurados aqui, sempre tratando os prazos como estimativas médias.
                  </p>
                </div>
              </div>

              {/* 3 Modals Transport Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* 1. Via Aérea */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                        <Plane className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-slate-900">Via Aérea (Luanda → Cabinda)</h3>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Cargas Expressas & Urgentes</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Prazo Médio Estimado
                      </label>
                      <input
                        type="text"
                        value={localLogistics.modes.aereo.estimatedDays || localLogistics.modes.aereo.averageTime || ''}
                        onChange={(e) => setLocalLogistics({
                          ...localLogistics,
                          modes: {
                            ...localLogistics.modes,
                            aereo: {
                              ...localLogistics.modes.aereo,
                              estimatedDays: e.target.value,
                              averageTime: e.target.value
                            }
                          }
                        })}
                        placeholder="Ex: 1 dia (24 a 48 horas)"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Custo Estimado por Quilo
                      </label>
                      <input
                        type="text"
                        value={localLogistics.modes.aereo.costPerKg || localLogistics.modes.aereo.costEstimate || ''}
                        onChange={(e) => setLocalLogistics({
                          ...localLogistics,
                          modes: {
                            ...localLogistics.modes,
                            aereo: {
                              ...localLogistics.modes.aereo,
                              costPerKg: e.target.value,
                              costEstimate: e.target.value
                            }
                          }
                        })}
                        placeholder="Ex: 2.500 AOA / kg"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Descrição Operacional
                      </label>
                      <textarea
                        rows={2}
                        value={localLogistics.modes.aereo.description || ''}
                        onChange={(e) => setLocalLogistics({
                          ...localLogistics,
                          modes: {
                            ...localLogistics.modes,
                            aereo: { ...localLogistics.modes.aereo, description: e.target.value }
                          }
                        })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Recomendado Para
                      </label>
                      <input
                        type="text"
                        value={localLogistics.modes.aereo.recommendedFor || localLogistics.modes.aereo.recommendation || ''}
                        onChange={(e) => setLocalLogistics({
                          ...localLogistics,
                          modes: {
                            ...localLogistics.modes,
                            aereo: {
                              ...localLogistics.modes.aereo,
                              recommendedFor: e.target.value,
                              recommendation: e.target.value
                            }
                          }
                        })}
                        placeholder="Ex: Eletrónicos, medicamentos, encomendas urgentes"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Estado do Modal
                      </label>
                      <select
                        value={localLogistics.modes.aereo.status}
                        onChange={(e) => setLocalLogistics({
                          ...localLogistics,
                          modes: {
                            ...localLogistics.modes,
                            aereo: { ...localLogistics.modes.aereo, status: e.target.value as any }
                          }
                        })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden"
                      >
                        <option value="ativo">🟢 Ativo (Operacional Normal)</option>
                        <option value="condicionado">🟡 Condicionado (Meteorologia/Voo)</option>
                        <option value="pausado">🔴 Pausado Temporariamente</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Via Marítima */}
                <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm space-y-4 relative overflow-hidden ring-2 ring-amber-400/20">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                        <Ship className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-slate-900">Via Marítima (Navios / Cabotagem)</h3>
                        <span className="text-[10px] text-emerald-600 font-bold uppercase">Mais Económico & Popular</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Prazo Médio Estimado
                      </label>
                      <input
                        type="text"
                        value={localLogistics.modes.maritimo.estimatedDays || localLogistics.modes.maritimo.averageTime || ''}
                        onChange={(e) => setLocalLogistics({
                          ...localLogistics,
                          modes: {
                            ...localLogistics.modes,
                            maritimo: {
                              ...localLogistics.modes.maritimo,
                              estimatedDays: e.target.value,
                              averageTime: e.target.value
                            }
                          }
                        })}
                        placeholder="Ex: 2–3 dias (ou 3–4 dias)"
                        className="w-full p-2.5 bg-slate-50 border border-amber-300 rounded-xl text-xs font-black text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Custo Estimado por Quilo
                      </label>
                      <input
                        type="text"
                        value={localLogistics.modes.maritimo.costPerKg || localLogistics.modes.maritimo.costEstimate || ''}
                        onChange={(e) => setLocalLogistics({
                          ...localLogistics,
                          modes: {
                            ...localLogistics.modes,
                            maritimo: {
                              ...localLogistics.modes.maritimo,
                              costPerKg: e.target.value,
                              costEstimate: e.target.value
                            }
                          }
                        })}
                        placeholder="Ex: 450 AOA / kg"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Descrição Operacional
                      </label>
                      <textarea
                        rows={2}
                        value={localLogistics.modes.maritimo.description || ''}
                        onChange={(e) => setLocalLogistics({
                          ...localLogistics,
                          modes: {
                            ...localLogistics.modes,
                            maritimo: { ...localLogistics.modes.maritimo, description: e.target.value }
                          }
                        })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Recomendado Para
                      </label>
                      <input
                        type="text"
                        value={localLogistics.modes.maritimo.recommendedFor || localLogistics.modes.maritimo.recommendation || ''}
                        onChange={(e) => setLocalLogistics({
                          ...localLogistics,
                          modes: {
                            ...localLogistics.modes,
                            maritimo: {
                              ...localLogistics.modes.maritimo,
                              recommendedFor: e.target.value,
                              recommendation: e.target.value
                            }
                          }
                        })}
                        placeholder="Ex: Cargas gerais, alimentos, móveis, materiais pesados"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Estado do Modal
                      </label>
                      <select
                        value={localLogistics.modes.maritimo.status}
                        onChange={(e) => setLocalLogistics({
                          ...localLogistics,
                          modes: {
                            ...localLogistics.modes,
                            maritimo: { ...localLogistics.modes.maritimo, status: e.target.value as any }
                          }
                        })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden"
                      >
                        <option value="ativo">🟢 Ativo (Operacional Normal)</option>
                        <option value="condicionado">🟡 Condicionado (Aguarda acostagem)</option>
                        <option value="pausado">🔴 Pausado Temporariamente</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. Via Terrestre */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-slate-900">Via Terrestre (Transfronteiriça)</h3>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Cargas Volumosas e Industriais</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Prazo Médio Estimado
                      </label>
                      <input
                        type="text"
                        value={localLogistics.modes.terrestre.estimatedDays || localLogistics.modes.terrestre.averageTime || ''}
                        onChange={(e) => setLocalLogistics({
                          ...localLogistics,
                          modes: {
                            ...localLogistics.modes,
                            terrestre: {
                              ...localLogistics.modes.terrestre,
                              estimatedDays: e.target.value,
                              averageTime: e.target.value
                            }
                          }
                        })}
                        placeholder="Ex: 7–8 dias ou mais"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Custo Estimado por Quilo
                      </label>
                      <input
                        type="text"
                        value={localLogistics.modes.terrestre.costPerKg || localLogistics.modes.terrestre.costEstimate || ''}
                        onChange={(e) => setLocalLogistics({
                          ...localLogistics,
                          modes: {
                            ...localLogistics.modes,
                            terrestre: {
                              ...localLogistics.modes.terrestre,
                              costPerKg: e.target.value,
                              costEstimate: e.target.value
                            }
                          }
                        })}
                        placeholder="Ex: 350 AOA / kg"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Descrição Operacional
                      </label>
                      <textarea
                        rows={2}
                        value={localLogistics.modes.terrestre.description || ''}
                        onChange={(e) => setLocalLogistics({
                          ...localLogistics,
                          modes: {
                            ...localLogistics.modes,
                            terrestre: { ...localLogistics.modes.terrestre, description: e.target.value }
                          }
                        })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Recomendado Para
                      </label>
                      <input
                        type="text"
                        value={localLogistics.modes.terrestre.recommendedFor || localLogistics.modes.terrestre.recommendation || ''}
                        onChange={(e) => setLocalLogistics({
                          ...localLogistics,
                          modes: {
                            ...localLogistics.modes,
                            terrestre: {
                              ...localLogistics.modes.terrestre,
                              recommendedFor: e.target.value,
                              recommendation: e.target.value
                            }
                          }
                        })}
                        placeholder="Ex: Grandes frotas, viaturas, materiais de construção"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Estado do Modal
                      </label>
                      <select
                        value={localLogistics.modes.terrestre.status}
                        onChange={(e) => setLocalLogistics({
                          ...localLogistics,
                          modes: {
                            ...localLogistics.modes,
                            terrestre: { ...localLogistics.modes.terrestre, status: e.target.value as any }
                          }
                        })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden"
                      >
                        <option value="ativo">🟢 Ativo (Operacional Normal)</option>
                        <option value="condicionado">🟡 Condicionado (Trânsito Aduaneiro RDC)</option>
                        <option value="pausado">🔴 Pausado Temporariamente</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>

              {/* General Logistics, Warehouses, Fees & Policies */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-amber-500" />
                    <h3 className="font-black text-sm text-slate-900 font-display">
                      Armazéns Oficiais, Taxas & Políticas de Garantia
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Última Atualização: {new Date(localLogistics.lastUpdated).toLocaleString('pt-PT')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Balcão de Retirada Oficial em Cabinda
                    </label>
                    <input
                      type="text"
                      value={localLogistics.pickupLocationCabinda || localLogistics.pickupAddressCabinda || ''}
                      onChange={(e) => setLocalLogistics({
                        ...localLogistics,
                        pickupLocationCabinda: e.target.value,
                        pickupAddressCabinda: e.target.value
                      })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Armazém de Consolidação em Luanda
                    </label>
                    <input
                      type="text"
                      value={localLogistics.consolidationWarehouseLuanda || localLogistics.consolidationAddressLuanda || ''}
                      onChange={(e) => setLocalLogistics({
                        ...localLogistics,
                        consolidationWarehouseLuanda: e.target.value,
                        consolidationAddressLuanda: e.target.value
                      })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Comissão de Intermediação Oficial
                    </label>
                    <input
                      type="text"
                      value={localLogistics.intermediationFeePercentage || localLogistics.intermediationFeeRate || ''}
                      onChange={(e) => setLocalLogistics({
                        ...localLogistics,
                        intermediationFeePercentage: e.target.value,
                        intermediationFeeRate: e.target.value
                      })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Taxa de Guia de Trânsito AGT Oficial
                    </label>
                    <input
                      type="text"
                      value={localLogistics.customsTransitFeeAGT || localLogistics.customsTaxAGT || ''}
                      onChange={(e) => setLocalLogistics({
                        ...localLogistics,
                        customsTransitFeeAGT: e.target.value,
                        customsTaxAGT: e.target.value
                      })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Garantia Operacional & Reembolso Total
                    </label>
                    <input
                      type="text"
                      value={localLogistics.guaranteeAndRefundPolicy || localLogistics.warrantyAndRefundPolicy || ''}
                      onChange={(e) => setLocalLogistics({
                        ...localLogistics,
                        guaranteeAndRefundPolicy: e.target.value,
                        warrantyAndRefundPolicy: e.target.value
                      })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Observação Operacional de Prazos (Injetada no Atendente IA)
                    </label>
                    <textarea
                      rows={2}
                      value={localLogistics.operationalNotice || localLogistics.operationalNote || ''}
                      onChange={(e) => setLocalLogistics({
                        ...localLogistics,
                        operationalNotice: e.target.value,
                        operationalNote: e.target.value
                      })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden leading-relaxed"
                    />
                  </div>
                </div>

                {/* Audit Attribution Fields */}
                <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Responsável pela Modificação
                    </label>
                    <input
                      type="text"
                      value={adminAuthorName}
                      onChange={(e) => setAdminAuthorName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Motivo / Justificativa da Alteração (Audit Log)
                    </label>
                    <input
                      type="text"
                      value={logisticsNotes}
                      onChange={(e) => setLogisticsNotes(e.target.value)}
                      placeholder="Ex: Ajuste no cronograma de navios de cabotagem para esta semana"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveLogisticsConfig}
                    className="w-full py-3.5 bg-slate-950 hover:bg-slate-900 text-amber-400 hover:text-amber-300 font-extrabold text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <CheckCircle2 className="w-5 h-5 text-amber-400" />
                    <span>Salvar Configurações de Logística & Sincronizar IA</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* SUB-TAB 2: BASE DE CONHECIMENTO DINÂMICA (FAQ & Documentação) */}
          {botSubTab === 'knowledge' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Top Controls */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-amber-500" />
                    <div>
                      <h3 className="font-black text-sm text-slate-900 font-display">
                        Base de Conhecimento Dinâmica do Mediador Cabinda
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Adicione, edite ou pause perguntas e respostas que alimentam o motor de inteligência artificial
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingKnowledgeItem(null);
                        setKnowledgeForm({
                          category: 'Logística',
                          question: '',
                          shortAnswer: '',
                          detailedAnswer: '',
                          keywords: [],
                          suggestedNextQuestions: [],
                          isActive: true
                        });
                        setKeywordsInput('');
                        setNextQuestionsInput('');
                        setIsCreatingKnowledgeItem(true);
                      }}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Novo Tópico de Conhecimento</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Deseja restaurar a base de conhecimento oficial padrão do Mediador Cabinda?')) {
                          if (onResetKnowledgeBaseToDefaults) {
                            onResetKnowledgeBaseToDefaults();
                          } else {
                            localStorage.setItem('mediador_cabinda_knowledge_base', JSON.stringify(INITIAL_DYNAMIC_KNOWLEDGE_BASE));
                          }
                          speak("Base de conhecimento padrão restaurada.");
                          setKnowledgeFeedback("Base de conhecimento oficial restaurada com sucesso!");
                        }
                      }}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      title="Restaurar valores padrão oficiais"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Search & Category Filter */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
                  <div className="sm:col-span-8 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={botKnowledgeSearch}
                      onChange={(e) => setBotKnowledgeSearch(e.target.value)}
                      placeholder="Pesquisar por pergunta, resposta ou palavras-chave (ex: prazos, AGT, IBAN, devoluções)..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <select
                      value={selectedKnowledgeCategory}
                      onChange={(e) => setSelectedKnowledgeCategory(e.target.value)}
                      className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden"
                    >
                      <option value="TODAS">📂 Todas as Categorias ({activeKnowledge.length})</option>
                      <option value="Logística">🚚 Logística</option>
                      <option value="Prazos">⏱️ Prazos de Entrega</option>
                      <option value="Custos">💰 Custos & Taxas</option>
                      <option value="Documentação">📄 Documentação & AGT</option>
                      <option value="Rastreamento">📦 Rastreamento</option>
                      <option value="Pagamentos">💳 Pagamentos & IBAN</option>
                      <option value="Garantia">🛡️ Garantia & Reembolso</option>
                      <option value="Categorias">🏷️ Categorias de Produtos</option>
                      <option value="Regras">⚖️ Regras & Segurança</option>
                      <option value="Geral">🏢 Geral & Institucional</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal / Panel for Creating / Editing Knowledge Item */}
              {(isCreatingKnowledgeItem || editingKnowledgeItem) && (
                <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4 animate-scale-up">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Edit3 className="w-5 h-5 text-amber-400" />
                      <h4 className="font-black text-sm text-white font-display">
                        {editingKnowledgeItem ? 'Editar Tópico de Conhecimento IA' : 'Adicionar Novo Tópico à IA'}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingKnowledgeItem(false);
                        setEditingKnowledgeItem(null);
                      }}
                      className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-900">
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Pergunta Oficial do Cliente
                      </label>
                      <input
                        type="text"
                        value={knowledgeForm.question || ''}
                        onChange={(e) => setKnowledgeForm({ ...knowledgeForm, question: e.target.value })}
                        placeholder="Ex: Quais são os prazos de entrega marítimos e aéreos para Cabinda?"
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:bg-slate-850 focus:border-amber-400 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Categoria Temática
                      </label>
                      <select
                        value={knowledgeForm.category || 'Logística'}
                        onChange={(e) => setKnowledgeForm({ ...knowledgeForm, category: e.target.value as any })}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-hidden"
                      >
                        <option value="Logística">🚚 Logística</option>
                        <option value="Prazos">⏱️ Prazos</option>
                        <option value="Custos">💰 Custos & Taxas</option>
                        <option value="Documentação">📄 Documentação</option>
                        <option value="Rastreamento">📦 Rastreamento</option>
                        <option value="Pagamentos">💳 Pagamentos</option>
                        <option value="Garantia">🛡️ Garantia</option>
                        <option value="Categorias">🏷️ Categorias</option>
                        <option value="Regras">⚖️ Regras</option>
                        <option value="Geral">🏢 Geral</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Palavras-chave para Busca (Separadas por vírgula)
                      </label>
                      <input
                        type="text"
                        value={keywordsInput}
                        onChange={(e) => setKeywordsInput(e.target.value)}
                        placeholder="Ex: prazo, quanto tempo, entrega, marítimo, dias"
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Resposta Detalhada Oficial da IA (Exaustiva e Transparente)
                      </label>
                      <textarea
                        rows={5}
                        value={knowledgeForm.detailedAnswer || ''}
                        onChange={(e) => setKnowledgeForm({ ...knowledgeForm, detailedAnswer: e.target.value })}
                        placeholder="Escreva a resposta completa oficial do Mediador Cabinda que a IA deverá fornecer..."
                        className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-hidden leading-relaxed font-sans"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Perguntas de Seguimento Sugeridas (Separadas por ponto e vírgula ;)
                      </label>
                      <input
                        type="text"
                        value={nextQuestionsInput}
                        onChange={(e) => setNextQuestionsInput(e.target.value)}
                        placeholder="Ex: Como fazer um novo pedido?; Quais são as formas de pagamento?; Onde retirar em Cabinda?"
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingKnowledgeItem(false);
                        setEditingKnowledgeItem(null);
                      }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveKnowledgeItem}
                      className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer"
                    >
                      {editingKnowledgeItem ? 'Guardar Alterações do Tópico' : 'Adicionar à Base da IA'}
                    </button>
                  </div>
                </div>
              )}

              {/* Knowledge Base Items Grid */}
              <div className="space-y-3">
                {activeKnowledge
                  .filter(item => {
                    const matchCategory = selectedKnowledgeCategory === 'TODAS' || item.category === selectedKnowledgeCategory;
                    const search = botKnowledgeSearch.toLowerCase().trim();
                    const matchSearch = !search || 
                      item.question.toLowerCase().includes(search) || 
                      item.detailedAnswer.toLowerCase().includes(search) ||
                      item.keywords.some(k => k.toLowerCase().includes(search));
                    return matchCategory && matchSearch;
                  })
                  .map((item) => (
                    <div key={item.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 transition-all hover:border-amber-300">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] bg-slate-100 text-slate-700 font-black px-2 py-0.5 rounded-md uppercase">
                              {item.category}
                            </span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                              item.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                            }`}>
                              {item.isActive ? 'Ativo na IA' : 'Pausado'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Atualizado por: {item.updatedBy || 'Administrador'}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-sm text-slate-900">
                            {item.question}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingKnowledgeItem(item);
                              setKnowledgeForm({
                                category: item.category,
                                question: item.question,
                                shortAnswer: item.shortAnswer,
                                detailedAnswer: item.detailedAnswer,
                                keywords: item.keywords,
                                suggestedNextQuestions: item.suggestedNextQuestions,
                                isActive: item.isActive
                              });
                              setKeywordsInput(item.keywords.join(', '));
                              setNextQuestionsInput(item.suggestedNextQuestions.join('; '));
                              setIsCreatingKnowledgeItem(false);
                            }}
                            className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer transition-colors"
                            title="Editar Tópico"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const updated = { ...item, isActive: !item.isActive, lastUpdated: new Date().toISOString(), updatedBy: adminAuthorName };
                              if (onUpdateKnowledgeItem) onUpdateKnowledgeItem(updated);
                            }}
                            className={`p-2 rounded-lg cursor-pointer transition-colors ${
                              item.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'
                            }`}
                            title={item.isActive ? 'Desativar este tópico' : 'Ativar este tópico'}
                          >
                            {item.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Deseja mesmo remover o tópico "${item.question}" da base de conhecimento da IA?`)) {
                                if (onDeleteKnowledgeItem) onDeleteKnowledgeItem(item.id);
                              }
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                            title="Eliminar Tópico"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Detailed Answer */}
                      <div className="bg-slate-50 p-3.5 rounded-xl text-xs text-slate-700 space-y-2 whitespace-pre-wrap leading-relaxed border border-slate-150 font-sans">
                        <p>{item.detailedAnswer}</p>
                      </div>

                      {/* Keywords & Next Questions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] text-slate-500">
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="font-bold text-slate-400 uppercase">Tags:</span>
                          {item.keywords.map((kw, kwIdx) => (
                            <span key={kwIdx} className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-medium">
                              #{kw}
                            </span>
                          ))}
                        </div>

                        {item.suggestedNextQuestions && item.suggestedNextQuestions.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="font-bold text-slate-400 uppercase">Perguntas Rápidas:</span>
                            {item.suggestedNextQuestions.slice(0, 2).map((q, qIdx) => (
                              <span key={qIdx} className="bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded font-bold">
                                {q}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>

            </div>
          )}

          {/* SUB-TAB 3: HISTÓRICO DE AUDITORIA (Audit Logs) */}
          {botSubTab === 'audit' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-purple-600" />
                    <div>
                      <h3 className="font-black text-sm text-slate-900 font-display">
                        Registo de Auditoria & Modificações da IA
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Rastreabilidade completa de todas as alterações feitas em prazos, regras e base de dados
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
                    {activeAuditLogs.length} Registos
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-wider bg-slate-50/50">
                        <th className="p-3">Data e Hora</th>
                        <th className="p-3">Administrador</th>
                        <th className="p-3">Seção / Campo</th>
                        <th className="p-3">Valor Anterior</th>
                        <th className="p-3">Novo Valor</th>
                        <th className="p-3">Notas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeAuditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString('pt-PT')}
                          </td>
                          <td className="p-3">
                            <span className="font-black text-slate-900 block">{log.adminName}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{log.adminRole}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-slate-800 block">{log.section}</span>
                            <span className="text-[10.5px] text-slate-500">{log.fieldName}</span>
                          </td>
                          <td className="p-3 max-w-xs truncate">
                            <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-[11px] font-mono line-through block truncate">
                              {log.previousValue || 'N/A'}
                            </span>
                          </td>
                          <td className="p-3 max-w-xs truncate">
                            <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-mono font-bold block truncate">
                              {log.newValue}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500 italic max-w-xs">
                            {log.notes || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 4: PARÂMETROS GERAIS & SIMULADOR EM TEMPO REAL */}
          {botSubTab === 'settings_sim' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
              
              {/* Left Column: Bot Settings Form */}
              <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-3xl border border-slate-150 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                  <div className="flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5 text-amber-500" />
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 font-display">
                      Parâmetros e Regras do Atendente
                    </h3>
                  </div>
                  {botSaveFeedback && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2.5 py-1 rounded-lg animate-pulse">
                      ✓ Guardado com Sucesso!
                    </span>
                  )}
                </div>

                {/* Bot Enabled Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-150">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 block">Ativar Assistente Virtual IA 24/7</span>
                    <span className="text-[10.5px] text-slate-500 font-medium">Disponibiliza o botão e modal 24/7 para todos os clientes</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSaveBotSettings({ ...adminBotSettings, enabled: !adminBotSettings.enabled })}
                    className={`p-1 rounded-full cursor-pointer transition-colors ${adminBotSettings.enabled ? 'text-emerald-600' : 'text-slate-400'}`}
                  >
                    {adminBotSettings.enabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                  </button>
                </div>

                {/* Auto Reply in Shared Chat Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-150">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 block">Respostas no Chat Geral</span>
                    <span className="text-[10.5px] text-slate-500 font-medium">O bot responde instantaneamente no chat geral de encomendas</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSaveBotSettings({ ...adminBotSettings, autoReplyInSharedChat: !adminBotSettings.autoReplyInSharedChat })}
                    className={`p-1 rounded-full cursor-pointer transition-colors ${adminBotSettings.autoReplyInSharedChat ? 'text-emerald-600' : 'text-slate-400'}`}
                  >
                    {adminBotSettings.autoReplyInSharedChat ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                  </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Nome do Assistente Virtual
                    </label>
                    <input
                      type="text"
                      value={adminBotSettings.botName}
                      onChange={(e) => setAdminBotSettings({ ...adminBotSettings, botName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Início Expediente Presencial
                      </label>
                      <input
                        type="time"
                        value={adminBotSettings.businessHoursStart}
                        onChange={(e) => setAdminBotSettings({ ...adminBotSettings, businessHoursStart: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Fim Expediente Presencial
                      </label>
                      <input
                        type="time"
                        value={adminBotSettings.businessHoursEnd}
                        onChange={(e) => setAdminBotSettings({ ...adminBotSettings, businessHoursEnd: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Número WhatsApp para Escalamento Humano
                    </label>
                    <input
                      type="text"
                      value={adminBotSettings.whatsAppNumber}
                      onChange={(e) => setAdminBotSettings({ ...adminBotSettings, whatsAppNumber: e.target.value })}
                      placeholder="+244942043293"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Mensagem Padrão de Boas-Vindas
                    </label>
                    <textarea
                      rows={3}
                      value={adminBotSettings.welcomeMessage}
                      onChange={(e) => setAdminBotSettings({ ...adminBotSettings, welcomeMessage: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Mensagem Fora de Horário / Período Noturno
                    </label>
                    <textarea
                      rows={2}
                      value={adminBotSettings.offHoursMessage}
                      onChange={(e) => setAdminBotSettings({ ...adminBotSettings, offHoursMessage: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden leading-relaxed"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleSaveBotSettings(adminBotSettings);
                        speak("Configurações do Assistente Virtual IA gravadas com sucesso.");
                      }}
                      className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-amber-400 hover:text-amber-300 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Guardar Alterações do Bot</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Real-Time Interactive AI Simulator */}
              <div className="lg:col-span-6 bg-slate-900 text-white p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Bot className="w-5 h-5 text-amber-400" />
                      <div>
                        <h3 className="font-black text-sm text-white font-display">
                          Simulador Interativo da IA em Tempo Real
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium">
                          Teste as respostas com os novos prazos e tópicos configurados
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                      Live Solver
                    </span>
                  </div>

                  {/* Simulator Quick Topics */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Testes Rápidos de Perguntas Frequentes:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Quanto tempo demora o transporte de uma carga refrigerada de Luanda para Cabinda?',
                        'Vocês fazem transporte de produtos congelados?',
                        'Quais são os prazos de entrega marítimos e aéreos?',
                        'Quanto tempo demora por via marítima?',
                        'Como pagar por Multicaixa Express ou IBAN?',
                        'Quais são as taxas de intermediação e AGT?',
                        'Como funciona a intermediação em 6 passos?',
                        'Onde retirar as mercadorias em Cabinda?'
                      ].map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSimQuery(q);
                            handleExecuteSimTest(q);
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-200 text-[10.5px] font-semibold rounded-lg border border-slate-700 cursor-pointer transition-all text-left"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Simulator Query Input */}
                  <div className="space-y-2 pt-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={simQuery}
                        onChange={(e) => setSimQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleExecuteSimTest();
                        }}
                        placeholder="Digite qualquer pergunta de cliente para testar a IA..."
                        className="w-full pl-3.5 pr-24 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:bg-slate-850 focus:border-amber-400 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => handleExecuteSimTest()}
                        disabled={simLoading}
                        className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] rounded-lg shadow cursor-pointer transition-all disabled:opacity-50"
                      >
                        {simLoading ? 'A gerar...' : 'Testar IA'}
                      </button>
                    </div>
                  </div>

                  {/* Simulator Result Card */}
                  {simResult ? (
                    <div className="bg-slate-850 p-4 rounded-2xl border border-slate-750 space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between border-b border-slate-750 pb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          Resposta Gerada Pela IA:
                        </span>
                        <span className="text-[9px] bg-slate-700 text-slate-300 font-mono px-2 py-0.5 rounded">
                          {simResult.source}
                        </span>
                      </div>

                      <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[220px] overflow-y-auto pr-1">
                        {simResult.text}
                      </div>

                      {simResult.suggestedQuestions && simResult.suggestedQuestions.length > 0 && (
                        <div className="pt-2 border-t border-slate-750 space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">
                            Perguntas Sugeridas:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {simResult.suggestedQuestions.map((sq, sqIdx) => (
                              <button
                                key={sqIdx}
                                type="button"
                                onClick={() => {
                                  setSimQuery(sq);
                                  handleExecuteSimTest(sq);
                                }}
                                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-lg cursor-pointer"
                              >
                                {sq}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-850/50 p-8 rounded-2xl border border-dashed border-slate-750 text-center text-slate-400 text-xs">
                      <Bot className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      <p>Clique num dos testes rápidos ou escreva uma pergunta acima para verificar a resposta imediata da IA.</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 text-[10.5px] text-slate-400 text-center">
                  Mediador Cabinda Lda — Assistente Oficial 24/7 Desenvolvido para o Enclave de Cabinda
                </div>
              </div>

            </div>
          )}

        </div>
      )}
      {trackingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in" id="logistics-9step-modal">
          <div className="bg-white rounded-[26px] shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up" id="9step-modal-card">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-amber-400 text-slate-950 p-2 rounded-xl">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base font-display">Logística Passo-a-Passo</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Guia de Transporte:</span>
                    <span className="font-mono text-[10px] font-bold text-amber-300 bg-white/10 px-1.5 py-0.2 rounded">
                      {trackingModalOrder.id}
                    </span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setTrackingModalOrder(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Quick Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 border border-slate-150 rounded-2xl text-xs">
                <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-200 pb-3 md:pb-0 md:pr-4">
                  <span className="text-[9px] uppercase font-bold text-slate-400">Mercadoria e Fornecedor</span>
                  <p className="font-extrabold text-slate-900 text-sm">{trackingModalOrder.productName}</p>
                  <p className="font-semibold text-slate-600">Fornecedor: {trackingModalOrder.supplierName || 'Luanda Standard'}</p>
                  <p className="font-semibold text-slate-600">Quantidade: <span className="font-bold text-slate-800">{trackingModalOrder.quantity} Lts/Unids</span></p>
                </div>
                <div className="space-y-1.5 md:pl-4">
                  <span className="text-[9px] uppercase font-bold text-slate-400">Dados do Destinatário & Despachante</span>
                  <p className="font-extrabold text-slate-900">Cliente: {trackingModalOrder.clientName}</p>
                  <p className="font-semibold text-slate-600">Contacto: {trackingModalOrder.clientPhone}</p>
                  <p className="font-semibold text-slate-600">Modo de Levantamento: <span className="font-bold text-amber-600 capitalize">{trackingModalOrder.deliveryOption === 'domicilio' ? 'Entrega ao Domicílio' : 'Levantamento no Balcão'}</span></p>
                </div>
              </div>

              {/* 9 Steps Visual Timeline Header */}
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Evolução do Processo de Transportação</h4>
                <span className="text-[10px] font-bold text-sky-600 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
                  Etapa {getCurrentStatusIndex(trackingModalOrder.status) + 1} de 9 Ativa
                </span>
              </div>

              {/* Steps Vertical Timeline List */}
              <div className="relative pl-1">
                {/* Vertical connecting bar */}
                <div className="absolute left-6 top-5 bottom-5 w-0.5 bg-slate-100" id="step-connector-pipeline"></div>
                
                <div className="space-y-4 relative">
                  {trackingSteps.map((step, idx) => {
                    const currentIdx = getCurrentStatusIndex(trackingModalOrder.status);
                    const isDone = idx < currentIdx;
                    const isCurrent = idx === currentIdx;
                    const isPending = idx > currentIdx;

                    let stepIconColor = '';
                    let stepCircleBg = '';
                    let stepBorderColor = '';
                    let titleStyle = '';

                    if (isDone) {
                      stepCircleBg = 'bg-emerald-600 border-emerald-500 text-white shadow-xs';
                      stepBorderColor = 'border-emerald-200';
                      titleStyle = 'text-slate-900 font-bold';
                    } else if (isCurrent) {
                      stepCircleBg = 'bg-amber-400 border-amber-500 text-slate-950 font-black ring-4 ring-amber-100 animate-pulse';
                      stepBorderColor = 'border-amber-300 bg-amber-500/[0.02]';
                      titleStyle = 'text-amber-800 font-extrabold scale-[1.02] transform origin-left';
                    } else {
                      stepCircleBg = 'bg-white border-slate-200 text-slate-350';
                      stepBorderColor = 'border-slate-100';
                      titleStyle = 'text-slate-400 font-normal';
                    }

                    return (
                      <div 
                        key={idx} 
                        className={`flex gap-4 items-start p-3 border rounded-2xl transition-all ${stepBorderColor} ${isCurrent ? 'shadow-xs' : ''}`}
                      >
                        {/* Number Indicator Badge (1 to 9) */}
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 z-10 text-xs font-bold ${stepCircleBg}`}>
                          {isDone ? '✓' : idx + 1}
                        </div>
                        
                        <div className="space-y-0.5 pt-0.5 flex-1 min-w-0">
                          <h5 className={`text-xs ${titleStyle} flex items-center justify-between gap-2`}>
                            <span>{step.title}</span>
                            {isCurrent && (
                              <span className="text-[8px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-black tracking-widest uppercase shrink-0">
                                Atual
                              </span>
                            )}
                          </h5>
                          <p className="text-[10px] text-slate-400 leading-relaxed truncate hover:text-clip hover:whitespace-normal">
                            {step.desc}
                          </p>
                          
                          {/* Rich metadata addition to specific steps */}
                          {isCurrent && idx === 5 && (
                            <div className="mt-2 p-2 bg-slate-50 border border-slate-150 rounded-xl space-y-1 text-[10px] text-slate-500">
                              <p>🚢 <strong className="text-slate-600">Em Trânsito:</strong> A mercadoria foi despachada via maritíma por: <strong className="text-slate-700">{trackingModalOrder.shippingCarrier || 'Despachante Parceiro'}</strong></p>
                              {trackingModalOrder.shippingGuideNumber && <p>📦 <strong>Guia Oficial:</strong> {trackingModalOrder.shippingGuideNumber}</p>}
                              {trackingModalOrder.estimateDeliveryDate && <p>📅 <strong>Estimativa:</strong> {new Date(trackingModalOrder.estimateDeliveryDate).toLocaleDateString('pt-AO')}</p>}
                            </div>
                          )}

                          {isCurrent && idx === 6 && (
                            <div className="mt-2 p-2 bg-sky-50/50 border border-sky-100 rounded-xl text-[10px] text-slate-500">
                              <p>🏢 <strong className="text-sky-700">Entrada Física:</strong> A mercadoria deu entrada oficial no Porto de Cabinda e está a ser triada para faturamento alfandegário.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Carrier details badge */}
              {trackingModalOrder.shippingCarrier && (
                <div className="p-3 bg-indigo-50/30 border border-indigo-100 rounded-2xl flex items-center justify-between text-xs text-indigo-800">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🚢</span>
                    <div>
                      <p className="font-extrabold font-display">Portadora Regional Cabinda</p>
                      <p className="text-[10px] text-indigo-600 font-semibold">{trackingModalOrder.shippingCarrier} — Guia: {trackingModalOrder.shippingGuideNumber || 'Pendente'}</p>
                    </div>
                  </div>
                  {trackingModalOrder.estimateDeliveryDate && (
                    <div className="text-right">
                      <p className="text-[9px] uppercase font-bold text-slate-400">Previsão Entrega</p>
                      <p className="font-extrabold text-slate-800">{new Date(trackingModalOrder.estimateDeliveryDate).toLocaleDateString('pt-AO')}</p>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
              <p className="text-[10px] text-slate-400 text-center sm:text-left">
                * Os marcos logísticos são auditados juridicamente pela AGT de Angola.
              </p>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    const ordId = trackingModalOrder.id;
                    setTrackingModalOrder(null);
                    setSelectedOrderId(ordId);
                    setActiveTab('orders');
                    speak(`Abrindo painel operacional da carga para despachar.`);
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ir para Gestão & Chat</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setTrackingModalOrder(null)}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Fechar Rastreio
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* PERFECTLY CENTERED, DYNAMIC AND RESPONSIVE CODE MODAL DIALOG OVERLAY */}
      {customDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in" id="custom-alert-modal">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-250 overflow-hidden animate-scale-up">
            <div className={`p-4 flex items-center gap-3 border-b ${
              customDialog.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
              customDialog.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' :
              'bg-slate-100 text-slate-800 border-slate-200'
            }`}>
              <span className="text-lg">
                {customDialog.type === 'success' ? '✅' : customDialog.type === 'warning' ? '⚠️' : 'ℹ️'}
              </span>
              <h4 className="font-extrabold text-xs uppercase tracking-wider font-display">{customDialog.title}</h4>
            </div>
            
            <div className="p-5 text-xs text-slate-600 font-semibold leading-relaxed whitespace-pre-line text-left">
              {customDialog.message}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              {customDialog.primaryAction ? (
                <>
                  <button
                    type="button"
                    onClick={() => setCustomDialog(null)}
                    className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    {customDialog.secondaryActionLabel || "Fechar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const action = customDialog.primaryAction?.onClick;
                      setCustomDialog(null);
                      if (action) action();
                    }}
                    className="px-4 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <span>{customDialog.primaryAction.label}</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setCustomDialog(null)}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Compreendi
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin High-Resolution Product Image Lightbox Modal */}
      {adminImagePreviewUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in"
          onClick={() => setAdminImagePreviewUrl(null)}
        >
          <div 
            className="relative bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-sm">🖼️</span>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                  {adminImagePreviewUrl.title || "Visualização da Imagem do Artigo"}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setAdminImagePreviewUrl(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Image */}
            <div className="p-4 sm:p-6 flex items-center justify-center bg-slate-950/40 overflow-auto flex-1 min-h-[250px] max-h-[65vh]">
              <img 
                src={adminImagePreviewUrl.url} 
                alt={adminImagePreviewUrl.title || "Foto do Artigo"} 
                className="max-h-[60vh] w-auto max-w-full object-contain rounded-xl shadow-lg border border-slate-800"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-2">
              <p className="text-[10px] text-slate-400">
                Identificador de Produto Homologado • Mediador Cabinda
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAdminImagePreviewUrl(null)}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INVOICE MODAL IN ADMINDASHBOARD */}
      {showInvoiceModal && activeOrder && (
        <div className="fixed inset-0 bg-slate-950/90 z-55 flex items-center justify-center p-4 overflow-y-auto" id="adm-invoice-modal">
          <div id="printable-invoice-wrapper" className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl text-slate-800 leading-normal font-sans animate-scale-up relative my-8">
             {/* Close Trigger */}
             <button 
               type="button" 
               onClick={() => setShowInvoiceModal(false)}
               className="hide-on-print absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-700 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer font-bold font-sans text-xs"
             >
               ✕
             </button>

             {/* Document Header */}
             <div className="border-b border-dashed border-slate-200 pb-5 space-y-3">
               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                 <div className="flex items-center gap-3">
                   <div className="bg-amber-400 text-slate-950 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex flex-col items-center">
                     <span>MEDIADOR</span>
                     <span className="text-[7px] text-slate-800 font-bold">CABINDA</span>
                   </div>
                   <div className="text-left">
                     <h3 className="font-extrabold text-[12px] text-slate-900 tracking-tight">MEDIADOR CABINDA LDA.</h3>
                     <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Intermediação Aduaneira & Cabotagem de Carga</p>
                   </div>
                 </div>

                 <div className="text-left sm:text-right font-mono text-[9px] text-slate-500 space-y-0.5">
                   <p className="text-slate-900 font-bold">DOCUMENTO AUXILIAR DE TRANSITÁRIO</p>
                   <p><strong>Nº Guia:</strong> GUIA-AO-CB-2026-{activeOrder.id.replace('MED-', '')}</p>
                   <p><strong>Nº Contribuinte (NIF):</strong> 5401129930</p>
                   <p><strong>Data de Emissão:</strong> {new Date(activeOrder.createdAt).toLocaleDateString('pt-AO')}</p>
                 </div>
               </div>

               <div className="bg-amber-400/10 border border-amber-300 p-3 rounded-xl text-[9px] text-amber-900 text-left font-medium leading-relaxed">
                 Este documento serve como <strong>Fatura Comercial Pró-Forma</strong> e <strong>Guia de Cabotagem Marítima / Aérea</strong> oficial, homologada sob os regulamentos fiscais da AGT, atestando a isenção de dupla tributação interterritorial e alfandegária de trânsito de mercadorias destinadas à província de Cabinda.
               </div>
             </div>

             {/* Logistics section */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-left">
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                 <p className="text-[7px] font-black uppercase text-slate-400 tracking-wider">Origem em Luanda</p>
                 <p className="font-extrabold text-slate-800">{activeOrder.supplierName || 'Polo Geral Mediador'}</p>
                 <p className="text-[10px] text-slate-500"><strong>Contacto:</strong> {activeOrder.supplierPhone || '+244 912 000 111'}</p>
                 <p className="text-[10px] text-slate-500"><strong>Despacho:</strong> Porto de Luanda, Terminal de Cabotagem Sogester</p>
               </div>

               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                 <p className="text-[7px] font-black uppercase text-slate-400 tracking-wider">Destino em Cabinda</p>
                 <p className="font-extrabold text-slate-800">{activeOrder.clientName}</p>
                 <p className="text-[10px] text-slate-500"><strong>Telemóvel:</strong> {activeOrder.clientPhone}</p>
                 <p className="text-[10px] text-slate-500"><strong>Entrega:</strong> {activeOrder.deliveryOption === 'domicilio' ? activeOrder.deliveryAddress : 'Polo Geral Mediador (Rua da Amizade, Cabinda Central)'}</p>
                 <p className="text-[10px] text-slate-500"><strong>Vetor Reservado:</strong> {activeOrder.shippingCarrier || 'Carga Convencional'}</p>
               </div>
             </div>

             {/* Financial Table breakdown */}
             <div className="space-y-3">
               <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest text-left">Declaração de Valoração & Custo Aduaneiro</p>
               <div className="border border-slate-150 rounded-2xl overflow-hidden">
                 <table className="w-full text-xs text-left">
                   <thead>
                     <tr className="bg-slate-50 border-b border-slate-100 text-[8px] font-black text-slate-500 uppercase tracking-wider">
                       <th className="p-3">Artigo Solicitado</th>
                       <th className="p-3 text-center">Qt.</th>
                       <th className="p-3 text-right">Compra Unit. (Kz)</th>
                       <th className="p-3 text-right">Subtotal (Kz)</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 text-slate-705">
                     <tr>
                       <td className="p-3 font-bold text-slate-900">{activeOrder.productName}</td>
                       <td className="p-3 text-center font-semibold">{activeOrder.quantity}x</td>
                       <td className="p-3 text-right font-mono text-[11px]">{(activeOrder.budgetRawPrice || 0).toLocaleString('pt-AO')} Kz</td>
                       <td className="p-3 text-right font-mono text-[11px]">{(activeOrder.budgetRawPrice || 0).toLocaleString('pt-AO')} Kz</td>
                     </tr>
                     <tr className="text-slate-500 text-[11px]">
                       <td className="p-2.5 pl-3">Frete Marítimo / Aéreo para Cabinda</td>
                       <td className="p-2.5 text-center">-</td>
                       <td className="p-2.5 text-right font-mono">-</td>
                       <td className="p-2.5 text-right font-mono">{(activeOrder.budgetShipping || 0).toLocaleString('pt-AO')} Kz</td>
                     </tr>
                     <tr className="text-slate-500 text-[11px]">
                       <td className="p-2.5 pl-3">Tarifa Aduaneira Faturada (Desembaraço AGT)</td>
                       <td className="p-2.5 text-center">-</td>
                       <td className="p-2.5 text-right font-mono">-</td>
                       <td className="p-2.5 text-right font-mono">{(activeOrder.dispatchFee || 0).toLocaleString('pt-AO')} Kz</td>
                     </tr>
                     <tr className="text-slate-500 text-[11px]">
                       <td className="p-2.5 pl-3 font-sans">Comissão Operacional de Intermediação ({activeOrder.commissionRate !== undefined ? Math.round(activeOrder.commissionRate * 100) : 12}%)</td>
                       <td className="p-2.5 text-center">-</td>
                       <td className="p-2.5 text-right font-mono">-</td>
                       <td className="p-2.5 text-right font-mono">{(activeOrder.commissionAmount || 0).toLocaleString('pt-AO')} Kz</td>
                     </tr>
                     <tr className="text-slate-400 text-[9px] bg-slate-50/50">
                       <td className="p-1.5 pl-6 italic" colSpan={3}>
                         • Rateio Interno: 3% Captador Afiliado ({Math.round((activeOrder.budgetRawPrice || 0) * 0.03).toLocaleString('pt-AO')} Kz) | 2% Reserva Despacho ({Math.round((activeOrder.budgetRawPrice || 0) * 0.02).toLocaleString('pt-AO')} Kz) | 5% Retenção Sede ({Math.round((activeOrder.budgetRawPrice || 0) * 0.05).toLocaleString('pt-AO')} Kz)
                       </td>
                       <td className="p-1.5 text-right font-mono text-slate-500 text-[9px] font-bold">Rateio 3/2/5</td>
                     </tr>
                     <tr className="bg-amber-400/5 font-black text-slate-950 border-t">
                       <td className="p-3" colSpan={2}>LIQUIDAÇÃO FINAL GLOBAL (AOA)</td>
                       <td className="p-3 text-right" colSpan={2}>
                         <span className="font-mono text-xs text-amber-700">{(activeOrder.totalAmount || 0).toLocaleString('pt-AO')} Kz</span>
                       </td>
                     </tr>
                   </tbody>
                 </table>
               </div>
             </div>

             {/* Barcode & Security stamp section */}
             <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-dashed border-slate-200 pt-5">
               {/* Barcode representation */}
               <div className="flex flex-col items-start gap-1 p-2 bg-slate-50 border rounded-xl select-none">
                 <div className="flex items-end gap-[1.5px] h-8 shrink-0 pr-1">
                   {[1,3,1,1,2,1,2,3,1,3,1,1,2,4,1,2,1,3,1,2,3,1,1,2,1,1,3,1].map((bar, barIdx) => (
                     <div key={barIdx} className="bg-slate-900" style={{ width: `${bar}px`, height: '100%' }}></div>
                   ))}
                 </div>
                 <span className="font-mono text-[6px] text-slate-500 tracking-wider">GUIA-{activeOrder.id}*2026-AGT-CABINDA-VALIDA*</span>
               </div>

               {/* QR Code and verified badge */}
               <div className="flex items-center gap-2">
                 <div className="bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg text-emerald-800 text-[8px] flex items-center gap-1 font-bold">
                   <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                   AUTENTICAÇÃO FISCAL AGT
                 </div>

                 <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-lg flex flex-wrap p-1 gap-px relative overflow-hidden select-none">
                   {Array.from({ length: 36 }).map((_, qrIdx) => {
                     const isFilled = (qrIdx * 9 + 4) % 3 === 0 || qrIdx < 6 || qrIdx > 29;
                     return (
                       <div key={qrIdx} className={`w-[4.5px] h-[4.5px] ${isFilled ? 'bg-slate-950' : 'bg-transparent'}`}></div>
                     );
                   })}
                 </div>
               </div>
             </div>

             {/* Bottom Action Bar */}
             <div className="hide-on-print flex flex-wrap gap-2.5 justify-end border-t pt-5">
               <button 
                 type="button" 
                 onClick={() => {
                   const activeClient = clients.find(c => c.phone === activeOrder.clientPhone || c.name === activeOrder.clientName);
                   const clientTier = activeClient?.tier || 'Standard';
                   downloadOrderInvoice(activeOrder, clientTier);
                 }}
                 className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-extrabold transition-all cursor-pointer font-sans"
               >
                 📥 Descarregar Fatura (HTML)
               </button>
               <button 
                 type="button" 
                 onClick={() => {
                   window.print();
                 }}
                 className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer font-sans"
               >
                 🖨️ Imprimir / Guardar PDF
               </button>
               <button 
                 type="button" 
                 onClick={() => {
                   setShowInvoiceModal(false);
                 }}
                 className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer font-sans"
               >
                 Fechar Fatura
               </button>
             </div>
          </div>
        </div>
      )}

      {/* 🏢 MODAL DE CADASTRO DE NOVA EMPRESA / VENDEDOR PARCEIRO */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 z-55 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 overflow-hidden shadow-2xl animate-scale-up my-6 text-slate-800">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-lg font-black shrink-0">
                  🏢
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
                    Cadastrar Nova Empresa / Vendedor Parceiro
                  </h3>
                  <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                    Registe a empresa vendedora com todos os dados de contacto comercial, NIF e endereço para publicar os seus artigos.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSupplierModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Form Body */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-[11px] text-amber-900 leading-relaxed font-semibold">
                🔒 <strong>Regra de Sigilo Mediador:</strong> O telefone, e-mail e endereço da empresa ficam confidenciais e exclusivos para a gestão. O cliente final apenas visualiza a mercadoria e negocia através da nossa intermediação segura.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-slate-800">
                {/* Nome da Empresa */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-[10.5px] font-bold text-slate-600 uppercase">
                    Nome da Empresa / Razão Social *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Mundo Digital Angola Lda, Sotecma Equipamentos..."
                    className="w-full bg-slate-50 border border-slate-300 focus:border-amber-400 focus:bg-white rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none transition-all"
                    value={adminNewSupplierForm.name}
                    onChange={(e) => setAdminNewSupplierForm({ ...adminNewSupplierForm, name: e.target.value })}
                  />
                </div>

                {/* NIF */}
                <div className="space-y-1">
                  <label className="block text-[10.5px] font-bold text-slate-600 uppercase">
                    NIF / Registo Comercial *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 5417089230"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-amber-400 focus:bg-white rounded-xl p-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none transition-all"
                    value={adminNewSupplierForm.nif}
                    onChange={(e) => setAdminNewSupplierForm({ ...adminNewSupplierForm, nif: e.target.value })}
                  />
                </div>

                {/* Responsável Comercial */}
                <div className="space-y-1">
                  <label className="block text-[10.5px] font-bold text-slate-600 uppercase">
                    Nome do Responsável / Gestor de Contas *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Eng. Domingos Afonso, Sr. Silva..."
                    className="w-full bg-slate-50 border border-slate-300 focus:border-amber-400 focus:bg-white rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none transition-all"
                    value={adminNewSupplierForm.contactPerson}
                    onChange={(e) => setAdminNewSupplierForm({ ...adminNewSupplierForm, contactPerson: e.target.value })}
                  />
                </div>

                {/* Telefone / WhatsApp */}
                <div className="space-y-1">
                  <label className="block text-[10.5px] font-bold text-slate-600 uppercase">
                    Telefone Principal / WhatsApp Comercial *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: +244 945 777 888"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-amber-400 focus:bg-white rounded-xl p-2.5 text-xs font-mono font-bold text-emerald-700 focus:outline-none transition-all"
                    value={adminNewSupplierForm.phoneHidden}
                    onChange={(e) => setAdminNewSupplierForm({ 
                      ...adminNewSupplierForm, 
                      phoneHidden: e.target.value,
                      whatsapp: adminNewSupplierForm.whatsapp || e.target.value
                    })}
                  />
                </div>

                {/* WhatsApp Específico */}
                <div className="space-y-1">
                  <label className="block text-[10.5px] font-bold text-slate-600 uppercase">
                    WhatsApp para Solicitação de Compras
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: +244 945 777 888"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-amber-400 focus:bg-white rounded-xl p-2.5 text-xs font-mono font-bold text-emerald-700 focus:outline-none transition-all"
                    value={adminNewSupplierForm.whatsapp}
                    onChange={(e) => setAdminNewSupplierForm({ ...adminNewSupplierForm, whatsapp: e.target.value })}
                  />
                </div>

                {/* E-mail Comercial */}
                <div className="space-y-1">
                  <label className="block text-[10.5px] font-bold text-slate-600 uppercase">
                    E-mail Comercial Oficial
                  </label>
                  <input
                    type="email"
                    placeholder="Ex: comercial@empresa.ao"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-amber-400 focus:bg-white rounded-xl p-2.5 text-xs font-medium text-slate-900 focus:outline-none transition-all"
                    value={adminNewSupplierForm.emailHidden}
                    onChange={(e) => setAdminNewSupplierForm({ ...adminNewSupplierForm, emailHidden: e.target.value })}
                  />
                </div>

                {/* Província / Cidade */}
                <div className="space-y-1">
                  <label className="block text-[10.5px] font-bold text-slate-600 uppercase">
                    Província / Município do Polo
                  </label>
                  <select
                    className="w-full bg-slate-50 border border-slate-300 focus:border-amber-400 focus:bg-white rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none transition-all"
                    value={adminNewSupplierForm.city}
                    onChange={(e) => setAdminNewSupplierForm({ ...adminNewSupplierForm, city: e.target.value })}
                  >
                    <option value="Luanda">Luanda (Polo Principal de Fornecimento)</option>
                    <option value="Cabinda">Cabinda (Polo Local)</option>
                    <option value="Benguela">Benguela (Polo Logístico)</option>
                    <option value="Huambo">Huambo</option>
                    <option value="Lubango">Lubango</option>
                  </select>
                </div>

                {/* Ramo / Categoria */}
                <div className="space-y-1">
                  <label className="block text-[10.5px] font-bold text-slate-600 uppercase">
                    Ramo / Categoria de Atuação
                  </label>
                  <select
                    className="w-full bg-slate-50 border border-slate-300 focus:border-amber-400 focus:bg-white rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none transition-all"
                    value={adminNewSupplierForm.category}
                    onChange={(e) => setAdminNewSupplierForm({ ...adminNewSupplierForm, category: e.target.value })}
                  >
                    <option value="Eletrónicos e Tecnologia">Eletrónicos e Tecnologia</option>
                    <option value="Construção e Ferramentas">Construção e Ferramentas</option>
                    <option value="Energia e Geradores">Energia e Geradores</option>
                    <option value="Material Elétrico">Material Elétrico</option>
                    <option value="Automóvel e Peças">Automóvel e Peças</option>
                    <option value="Alimentação e Bebidas">Alimentação e Bebidas</option>
                    <option value="Comércio Geral e Importação">Comércio Geral e Importação</option>
                  </select>
                </div>

                {/* Plano de Parceria */}
                <div className="space-y-1">
                  <label className="block text-[10.5px] font-bold text-slate-600 uppercase">
                    Plano de Destaque Homologado
                  </label>
                  <select
                    className="w-full bg-slate-50 border border-slate-300 focus:border-amber-400 focus:bg-white rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none transition-all"
                    value={adminNewSupplierForm.plan}
                    onChange={(e) => setAdminNewSupplierForm({ ...adminNewSupplierForm, plan: e.target.value as any })}
                  >
                    <option value="diamante">💎 DIAMANTE (Prioridade Máxima)</option>
                    <option value="ouro">🥇 OURO (Recomendado)</option>
                    <option value="prata">🥈 PRATA</option>
                    <option value="gratuito">⚪ GRATUITO / BÁSICO</option>
                  </select>
                </div>

                {/* Endereço Físico do Armazém */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-[10.5px] font-bold text-slate-600 uppercase">
                    Endereço Físico Completo do Armazém / Loja para Levantamento *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Maculusso, Rua Amílcar Cabral, Nº 44, Luanda, Angola"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-amber-400 focus:bg-white rounded-xl p-2.5 text-xs font-medium text-slate-900 focus:outline-none transition-all"
                    value={adminNewSupplierForm.addressHidden}
                    onChange={(e) => setAdminNewSupplierForm({ ...adminNewSupplierForm, addressHidden: e.target.value })}
                  />
                </div>

                {/* Descrição da Empresa */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-[10.5px] font-bold text-slate-600 uppercase">
                    Breve Descrição Institucional / Termos de Venda
                  </label>
                  <textarea
                    placeholder="Ex: Empresa distribuidora oficial de informática com emissão de fatura pró-forma e garantia de 12 meses..."
                    className="w-full bg-slate-50 border border-slate-300 focus:border-amber-400 focus:bg-white rounded-xl p-2.5 text-xs font-medium text-slate-900 focus:outline-none transition-all h-20"
                    value={adminNewSupplierForm.description}
                    onChange={(e) => setAdminNewSupplierForm({ ...adminNewSupplierForm, description: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowAddSupplierModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!adminNewSupplierForm.name.trim()) {
                    showModalAlert("Nome Requerido ⚠️", "Por favor introduza o nome da empresa ou razão social.", "warning");
                    return;
                  }

                  const newSupId = `supp-${Date.now()}`;
                  const newSupplier: Supplier = {
                    id: newSupId,
                    name: adminNewSupplierForm.name.trim(),
                    city: adminNewSupplierForm.city.trim() || 'Luanda',
                    category: adminNewSupplierForm.category.trim() || 'Comércio Geral',
                    nif: adminNewSupplierForm.nif.trim() || '5401928374',
                    contactPerson: adminNewSupplierForm.contactPerson.trim() || 'Responsável Comercial',
                    phoneHidden: adminNewSupplierForm.phoneHidden.trim() || '+244 945 777 888',
                    whatsapp: adminNewSupplierForm.whatsapp.trim() || adminNewSupplierForm.phoneHidden.trim() || '+244 945 777 888',
                    emailHidden: adminNewSupplierForm.emailHidden.trim() || 'comercial@empresa.ao',
                    addressHidden: adminNewSupplierForm.addressHidden.trim() || 'Luanda, Angola',
                    plan: adminNewSupplierForm.plan || 'ouro',
                    rating: 5.0,
                    reviewsCount: 1,
                    description: adminNewSupplierForm.description.trim() || 'Empresa parceira homologada para fornecimento e expedição de artigos.',
                    logoUrl: adminNewSupplierForm.logoUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=60',
                    createdAt: new Date().toISOString()
                  };

                  onCreateSupplier(newSupplier);
                  setAdminSelectedSupplierId(newSupId);
                  setSelectedSupplierChatId(newSupId);
                  setShowAddSupplierModal(false);

                  // reset
                  setAdminNewSupplierForm({
                    name: '',
                    city: 'Luanda',
                    category: 'Eletrónicos e Tecnologia',
                    nif: '',
                    contactPerson: '',
                    phoneHidden: '',
                    whatsapp: '',
                    emailHidden: '',
                    addressHidden: '',
                    plan: 'ouro',
                    description: '',
                    logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=60'
                  });

                  setCustomDialog({
                    title: "Empresa Cadastrada com Sucesso! 🏢",
                    message: `A empresa "${newSupplier.name}" foi registada com NIF ${newSupplier.nif}, telefone ${newSupplier.phoneHidden} e endereço do armazém.\n\nPode agora publicar artigos homologados vinculados a esta empresa!`,
                    type: "success"
                  });
                }}
                className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <span>💾</span>
                <span>Salvar e Registar Empresa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📄 MODAL DE FICHA COMPLETA DO ARTIGO & EMPRESA VENDEDORA */}
      {adminInspectedProduct && (() => {
        const prod = adminInspectedProduct;
        const code = getProductCode(prod);
        const sup = suppliers.find(s => s.id === prod.supplierId);
        const sellerPhone = sup?.phoneHidden || sup?.whatsapp || '+244 923 000 000';
        const cleanPhone = sellerPhone.replace(/\D/g, '');
        const whatsappMsg = `Olá ${sup?.name || 'Parceiro'}! Somos da Direção de Intermediação do Mediador Cabinda Lda. Temos um cliente em Cabinda interessado no artigo [CÓDIGO: ${code}] (${prod.name}). Solicitamos confirmação de stock imediato e envio de dados para faturação e levantamento da mercadoria. Obrigado!`;

        return (
          <div 
            className="fixed inset-0 z-55 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in"
            onClick={() => setAdminInspectedProduct(null)}
          >
            <div 
              className="bg-slate-900 border-2 border-amber-400/50 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl text-slate-200 animate-scale-up my-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-slate-950 p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-lg font-black shrink-0">
                    🏷️
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-slate-950 bg-amber-400 px-2 py-0.5 rounded-md">
                        {code}
                      </span>
                      <h3 className="text-sm sm:text-base font-black text-white">
                        Ficha de Intermediação do Artigo & Vendedor
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Identificador Oficial de Produto Homologado • Mediador Cabinda Lda.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAdminInspectedProduct(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  
                  {/* Photo with zoom */}
                  <div className="md:col-span-5 flex flex-col items-center">
                    <div 
                      onClick={() => setAdminImagePreviewUrl({ url: prod.photoUrl, title: `${code} - ${prod.name}` })}
                      className="relative group cursor-pointer w-full aspect-square rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-700 hover:border-amber-400 transition-all shadow-lg"
                    >
                      <img 
                        src={prod.photoUrl} 
                        alt={prod.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                        referrerPolicy="no-referrer" 
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-xs text-white font-bold gap-1">
                        <span className="text-base">🔍</span>
                        <span>Ampliar Fotografia</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAdminImagePreviewUrl({ url: prod.photoUrl, title: `${code} - ${prod.name}` })}
                      className="mt-2 text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      🔍 Ver Foto em Ecrã Inteiro
                    </button>
                  </div>

                  {/* Technical & Price Info */}
                  <div className="md:col-span-7 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black text-slate-950 bg-amber-400 px-2 py-0.5 rounded-md">
                        {code}
                      </span>
                      <span className={`text-[9.5px] px-2 py-0.5 rounded-md font-bold uppercase ${
                        prod.availability === 'imediata' ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700' :
                        prod.availability === 'sob-pedido' ? 'bg-amber-900/80 text-amber-300 border border-amber-700' :
                        'bg-red-900/80 text-red-300 border border-red-700'
                      }`}>
                        {prod.availability === 'imediata' ? '✓ Em Stock Imediato' : prod.availability === 'sob-pedido' ? '⏳ Sob Pedido' : '✕ Esgotado'}
                      </span>
                      <span className="text-[10px] text-slate-300 font-bold bg-slate-800 px-2 py-0.5 rounded-md">
                        Stock: {prod.stock} un.
                      </span>
                      <span className="text-[10px] text-slate-300 font-bold bg-slate-800 px-2 py-0.5 rounded-md">
                        📍 {prod.location || 'Luanda'}
                      </span>
                    </div>

                    <h4 className="text-lg font-black text-white">{prod.name}</h4>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-bold uppercase">Preço Fornecedor:</span>
                      <span className="text-xl font-mono font-black text-amber-300">
                        {prod.price.toLocaleString('pt-AO')} AOA
                      </span>
                    </div>

                    {prod.description && (
                      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-medium">
                        {prod.description}
                      </div>
                    )}
                  </div>
                </div>

                {/* Seller Company Complete Data */}
                <div className="bg-slate-950 border-2 border-amber-400/40 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <h5 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🏢</span> DADOS COMPLETOS DA EMPRESA QUE ESTÁ A VENDER
                    </h5>
                    {sup && (
                      <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-md uppercase">
                        Plano {sup.plan}
                      </span>
                    )}
                  </div>

                  {sup ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Nome da Empresa:</span>
                        <p className="font-extrabold text-white text-sm">{sup.name}</p>
                        <p className="text-[10px] text-slate-400">{sup.category} • {sup.city}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">NIF / Identificação Fiscal:</span>
                        <p className="font-mono font-bold text-amber-300 text-xs">{sup.nif || '5401928374'}</p>
                        <p className="text-[10px] text-slate-400">Responsável: {sup.contactPerson || 'Gestor Comercial'}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Telefone Principal / WhatsApp:</span>
                        <p className="font-mono font-bold text-emerald-400 text-xs">{sellerPhone}</p>
                        <p className="text-[9px] text-slate-500">🔒 Confidencial Gestão Mediador</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">E-mail Comercial:</span>
                        <p className="font-mono text-slate-200 text-xs truncate">{sup.emailHidden || 'contacto@empresa.ao'}</p>
                        <a
                          href={`mailto:${sup.emailHidden || 'contacto@empresa.ao'}?subject=${encodeURIComponent(`Intermediação - Artigo ${code} (${prod.name})`)}`}
                          className="text-[10px] text-sky-400 hover:underline"
                        >
                          ✉️ Enviar E-mail ao Fornecedor
                        </a>
                      </div>

                      <div className="sm:col-span-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Endereço Físico do Armazém / Loja:</span>
                        <p className="text-slate-200 text-xs font-semibold flex items-start gap-1">
                          <span>📍</span>
                          <span>{sup.addressHidden || 'Armazém Central, Luanda, Angola'}</span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Fornecedor não associado.</p>
                  )}

                  {/* Fast Action Buttons */}
                  <div className="border-t border-slate-800 pt-3.5 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md active:scale-97 cursor-pointer"
                      >
                        <span>💬</span>
                        <span>Solicitar Vendedor no WhatsApp</span>
                      </a>

                      <a
                        href={`tel:${cleanPhone}`}
                        className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <span>📞</span>
                        <span>Ligar ({sellerPhone})</span>
                      </a>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const fullText = `FICHA DE INTERMEDIAÇÃO • MEDIADOR CABINDA LDA.\n` +
                          `-------------------------------------------\n` +
                          `CÓDIGO ARTIGO: ${code}\n` +
                          `PRODUTO: ${prod.name}\n` +
                          `PREÇO BASE: ${prod.price.toLocaleString('pt-AO')} AOA\n` +
                          `STOCK: ${prod.stock} un. (${prod.availability})\n` +
                          `ARMAZÉM: ${prod.location || 'Luanda'}\n\n` +
                          `EMPRESA VENDEDORA:\n` +
                          `Nome: ${sup?.name || 'N/A'}\n` +
                          `NIF: ${sup?.nif || 'N/A'}\n` +
                          `Responsável: ${sup?.contactPerson || 'N/A'}\n` +
                          `Telefone / WhatsApp: ${sellerPhone}\n` +
                          `E-mail: ${sup?.emailHidden || 'N/A'}\n` +
                          `Endereço: ${sup?.addressHidden || 'N/A'}`;
                        navigator.clipboard?.writeText(fullText);
                        showModalAlert('Ficha Completa Copiada! 📋', 'Todos os dados do artigo e da empresa vendedora foram copiados para a sua área de transferência.', 'success');
                      }}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>📋</span>
                      <span>Copiar Ficha Completa</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdminInspectedProduct(null)}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl cursor-pointer transition-all"
                >
                  Fechar Ficha
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL: CHAVE MASTER DE SEGURANÇA & GESTÃO DE REINICIALIZAÇÃO TOTAL */}
      {/* ========================================================================= */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in" id="master-security-modal">
          <div className="bg-slate-900 border-2 border-red-500/50 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl text-white space-y-0">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 p-6 border-b border-red-900/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-2xl shadow-inner">
                  🛡️
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                    Credenciais Master & Gestão de Dados
                  </h3>
                  <p className="text-xs text-red-300">
                    Acesso exclusivo à Direção Geral • Mediador Cabinda Lda.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSecurityModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer transition-all"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Credentials Box */}
              <div className="bg-slate-950 border border-amber-400/30 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                      Suas Credenciais de Administrador
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-400/10 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-md">
                    Criptografia Ativa
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Identificador / Utilizador:
                    </label>
                    <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 font-mono text-slate-200">
                      <span>admin <span className="text-slate-500 font-sans text-[11px]">(ou direcao@mediadorcabinda.ao)</span></span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText('admin');
                          showModalAlert('Copiado!', 'Identificador "admin" copiado.', 'success');
                        }}
                        className="text-[11px] text-amber-400 hover:underline cursor-pointer font-bold font-sans"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Palavra-passe Master Ultra Segura (Longa e Inviolável):
                    </label>
                    <div className="bg-slate-900 p-3 rounded-xl border border-amber-400/40 space-y-2">
                      <div className="font-mono text-amber-300 break-all select-all font-bold text-xs bg-black/40 p-2.5 rounded-lg border border-white/5">
                        {MASTER_ADMIN_CREDENTIALS.passphrase}
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-400">
                          {MASTER_ADMIN_CREDENTIALS.passphrase.length} caracteres • Alta Entropia & Símbolos
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(MASTER_ADMIN_CREDENTIALS.passphrase);
                            setCopiedPassKey(true);
                            setTimeout(() => setCopiedPassKey(false), 3000);
                            speak("Senha mestre copiada com sucesso.");
                          }}
                          className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                        >
                          {copiedPassKey ? '✅ Copiada!' : '📋 Copiar Senha Mestre'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-950/30 border border-amber-500/20 rounded-xl text-[11px] text-amber-200 leading-relaxed">
                    💡 <strong>Como aceder:</strong> No portal de login, introduza <strong>admin</strong> no campo de identificador e cole a senha master acima no campo de palavra-passe. O sistema reconhecerá imediatamente o privilégio de Direção Geral.
                  </div>
                </div>
              </div>

              {/* Data Wipe & Fresh Start Box */}
              <div className="bg-red-950/40 border border-red-500/40 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-red-400 border-b border-red-500/20 pb-3">
                  <AlertTriangle className="w-5 h-5" />
                  <h4 className="text-xs font-black uppercase tracking-wider">
                    Reiniciar Sistema & Apagar Todas as Contas Criadas
                  </h4>
                </div>

                <p className="text-xs text-red-200 leading-relaxed">
                  Esta ação <strong>eliminará permanentemente todas as contas de clientes antigas, encomendas de teste e registos de sessão anteriores</strong>, restaurando a aplicação para o estado 100% limpo e novo, mantendo apenas a sua conta de Administrador.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400">
                    Ação irreversível de higienização de dados.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("⚠️ ATENÇÃO: Tem a certeza que deseja APAGAR todas as contas e encomendas para reiniciar o sistema do zero? Esta ação é definitiva.")) {
                        wipeAllStoredData();
                        speak("Todos os dados de contas e encomendas foram apagados. O sistema foi reiniciado com sucesso.");
                        alert("✅ Sucesso! Todos os dados de clientes foram eliminados. A página será recarregada.");
                        window.location.reload();
                      }
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>🗑️</span>
                    <span>Apagar Tudo e Reiniciar Sistema</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowSecurityModal(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-all"
              >
                Fechar Painel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
