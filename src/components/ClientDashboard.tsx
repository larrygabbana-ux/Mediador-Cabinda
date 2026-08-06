/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Client, Order, Message, Notification, OrderStatus, CarrierCompany, Supplier, SupplierProduct, SupplierMessage, Collaborator, CollaboratorSale, SupplierService, ServiceRequest } from '../types';
import { PROVINCES_OF_ANGOLA, MUNICIPALITIES } from '../data/mockData';
import { 
  ShoppingBag, 
  PlusCircle, 
  MapPin, 
  Truck, 
  Clock, 
  CheckCircle, 
  MessageSquare, 
  CreditCard,
  FileText, 
  User, 
  AlertCircle, 
  Star, 
  ChevronRight, 
  Phone, 
  DollarSign, 
  Coins, 
  Bell, 
  Camera,
  Image,
  X,
  Search,
  Check,
  Building,
  Home,
  HelpCircle,
  AlertTriangle,
  Settings,
  Shield,
  ArrowRight,
  Sparkles,
  Info,
  Calendar,
  Lock,
  ThumbsUp,
  XCircle,
  Mic,
  Menu,
  Wrench
} from 'lucide-react';
import SharedChat from './SharedChat';
import { downloadOrderInvoice, downloadCollaboratorSaleInvoice } from '../utils/invoiceDownloader';

interface ClientDashboardProps {
  clients: Client[];
  activeClientId: string;
  onSetClient: (id: string) => void;
  onAddClient: (newClient: Client) => void;
  orders: Order[];
  onAddOrder: (newOrder: Order) => void;
  onUpdateOrder: (updatedOrder: Order) => void;
  messages: Message[];
  onSendMessage: (orderId: string, text: string, attachment?: any, isPriority?: boolean, senderOverride?: 'client' | 'admin') => void;
  onMarkChannelAsRead: (channelId: string) => void;
  notifications: Notification[];
  onMarkNotificationRead: (id: string) => void;

  // Sidebar Views
  currentView: 'inicio' | 'fazer-pedido' | 'acompanhar-pedido' | 'cadastro' | 'entrar' | 'minha-conta' | 'historico' | 'pagamentos' | 'notificacoes' | 'suporte' | 'reclamacoes' | 'configuracoes' | 'sobre-nos' | 'termos-uso' | 'mercado-fornecedores' | 'mensagens' | 'parceria' | 'guia-ajuda' | 'solicitar-servico';
  setCurrentView: (view: any) => void;
  fontSize: 'normal' | 'grande' | 'extra-grande';
  setFontSize: (size: 'normal' | 'grande' | 'extra-grande') => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  textToSpeech: boolean;
  setTextToSpeech: (val: boolean) => void;
  homeSearchQuery: string;
  setHomeSearchQuery: (query: string) => void;
  carriersList: CarrierCompany[];

  // Supplier props
  suppliers: Supplier[];
  onUpdateSupplier: (updatedSupplier: Supplier) => void;
  supplierProducts: SupplierProduct[];
  onUpdateSupplierProduct: (updatedProduct: SupplierProduct) => void;
  onCreateSupplierProduct: (newProduct: SupplierProduct) => void;
  supplierMessages: SupplierMessage[];
  onSendSupplierMessage: (msg: SupplierMessage) => void;
  collaborators: Collaborator[];
  onUpdateCollaborators: (newColabs: Collaborator[]) => void;
  collaboratorSales: CollaboratorSale[];
  onUpdateCollaboratorSales: (newSales: CollaboratorSale[]) => void;
  supplierServices: SupplierService[];
  onUpdateSupplierService: (srv: SupplierService) => void;
  onCreateSupplierService: (srv: SupplierService) => void;
  serviceRequests: ServiceRequest[];
  onCreateServiceRequest: (req: ServiceRequest) => void;
  onUpdateServiceRequest: (req: ServiceRequest) => void;
}

export default function ClientDashboard({
  clients,
  activeClientId,
  onSetClient,
  onAddClient,
  orders,
  onAddOrder,
  onUpdateOrder,
  messages,
  onSendMessage,
  onMarkChannelAsRead,
  notifications,
  onMarkNotificationRead,
  currentView,
  setCurrentView,
  fontSize,
  setFontSize,
  highContrast,
  setHighContrast,
  textToSpeech,
  setTextToSpeech,
  homeSearchQuery,
  setHomeSearchQuery,
  carriersList,
  suppliers,
  onUpdateSupplier,
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
  onUpdateServiceRequest
}: ClientDashboardProps) {
  
  // Tab/Tracker States
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    orders.find(o => o.clientId === activeClientId)?.id || null
  );
  const [orderDetailTab, setOrderDetailTab] = useState<'tracker' | 'budget' | 'chat'>('tracker');

  // Service Request States
  const [serviceActiveTab, setServiceActiveTab] = useState<'catalog' | 'my-requests'>('catalog');
  const [selectedServiceToRequest, setSelectedServiceToRequest] = useState<SupplierService | null>(null);
  const [serviceReqDesc, setServiceReqDesc] = useState('');
  const [serviceReqLocation, setServiceReqLocation] = useState('');
  const [serviceReqPhone, setServiceReqPhone] = useState('');

  // Custom visual overlay dialog states to prevent native cut-off clippings
  const [customDialog, setCustomDialog] = useState<{ title: string; message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showModalAlert = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setCustomDialog({ title, message, type });
  };
  
  // Signup/Register Page States
  const [signupForm, setSignupForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    province: 'Cabinda',
    municipality: 'Cabinda (Sede)',
    bairro: '',
    rua: '',
    nif: ''
  });
  const [signupDocPhoto, setSignupDocPhoto] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Home search filter results active list
  const [searchFocused, setSearchFocused] = useState(false);

  // My Account (Minha Conta) state
  const [profileForm, setProfileForm] = useState({
    name: clients.find(c => c.id === activeClientId)?.name || '',
    phone: clients.find(c => c.id === activeClientId)?.phone || '',
    email: clients.find(c => c.id === activeClientId)?.email || '',
    address: clients.find(c => c.id === activeClientId)?.address || '',
    province: clients.find(c => c.id === activeClientId)?.province || 'Cabinda',
    municipality: clients.find(c => c.id === activeClientId)?.municipality || 'Cabinda (Sede)',
    password: '••••••••',
    confirmPassword: '••••••••'
  });
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profileMsg, setProfileMsg] = useState('');

  // Product Photo Upload Simulation States
  const [tempPhotos, setTempPhotos] = useState<{ url: string; type: 'camera' | 'gallery' | 'document'; name: string }[]>([]);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [orderCamActive, setOrderCamActive] = useState(false);
  const [orderCamPreview, setOrderCamPreview] = useState<string | null>(null);
  const [orderCamCountdown, setOrderCamCountdown] = useState<number | null>(null);
  const [showOrderGallery, setShowOrderGallery] = useState(false);
  const [showOrderDocForm, setShowOrderDocForm] = useState(false);
  const [orderDocName, setOrderDocName] = useState('');

  // Cost Estimator / Tax Calculator States
  const [calcActive, setCalcActive] = useState(false);
  const [calcRawPrice, setCalcRawPrice] = useState<number>(180000); // base price in Kwanzas
  const [calcWeight, setCalcWeight] = useState<number>(10); // estimated weight in Kg
  const [calcCategory, setCalcCategory] = useState<'electronics' | 'energy' | 'accessories' | 'furniture'>('electronics');

  // Cabotage Slip Modal State
  const [showCabotageSlip, setShowCabotageSlip] = useState(false);

  // Create Order request states
  const [newOrderForm, setNewOrderForm] = useState({
    productName: '',
    quantity: 1,
    supplierName: '',
    supplierPhone: '',
    supplierLocation: 'Luanda, Maculusso',
    notes: '',
    deliveryOption: 'escritorio' as 'escritorio' | 'domicilio',
    deliveryAddress: '',
    preferredCarrierId: ''
  });

  // Tracking Search by code state
  const [trackingSearchCode, setTrackingSearchCode] = useState('');

  // Suppliers Marketplace Filtering & Integration States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SupplierProduct | null>(null);
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<'all' | 'Luanda' | 'Cabinda'>('all');
  const [supplierSearchText, setSupplierSearchText] = useState('');
  const [supplierSelectedCategory, setSupplierSelectedCategory] = useState('all');
  const [supplierSelectedCity, setSupplierSelectedCity] = useState('all');
  const [prefilledMarketProduct, setPrefilledMarketProduct] = useState<{
    name: string;
    price: number;
    supplierName: string;
    supplierId: string;
    photoUrl: string;
    location?: string;
    availableFromDate?: string;
  } | null>(null);

  // Product Code Getter Helper
  const getProductCode = (prod: SupplierProduct) => {
    if (prod.productCode) return prod.productCode;
    if (prod.id && prod.id.startsWith('sprod-')) {
      const num = parseInt(prod.id.replace('sprod-', ''), 10);
      return `PRD-${1000 + (isNaN(num) ? 1 : num)}`;
    }
    if (prod.id && prod.id.startsWith('PRD-')) return prod.id;
    return `PRD-${(prod.id || '1001').slice(-4).toUpperCase()}`;
  };

  // Direct Buy (Compra Direta Imediata) States
  const [isDirectBuyMode, setIsDirectBuyMode] = useState(false);
  const [directBuyQty, setDirectBuyQty] = useState(1);
  const [directBuyDelivery, setDirectBuyDelivery] = useState<'escritorio' | 'domicilio'>('escritorio');
  const [directBuyAddress, setDirectBuyAddress] = useState('');
  const [directBuyNotes, setDirectBuyNotes] = useState('');
  const [directBuySuccessOrder, setDirectBuySuccessOrder] = useState<Order | null>(null);

  // States for sending intermediate messages to suppliers
  const [selectedSupplierForMessage, setSelectedSupplierForMessage] = useState<Supplier | null>(null);
  const [showSupplierMessageModal, setShowSupplierMessageModal] = useState(false);
  const [supplierMessageText, setSupplierMessageText] = useState('');

  // States to allow opening and reading notifications with general reply capability
  const [selectedNotificationForModal, setSelectedNotificationForModal] = useState<Notification | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Auto-populate Order form when user requests to buy from the partner marketplace
  useEffect(() => {
    if (currentView === 'fazer-pedido' && prefilledMarketProduct) {
      const artLocation = prefilledMarketProduct.location || 'Luanda';
      const artAvailability = prefilledMarketProduct.availableFromDate || 'Imediata';
      setNewOrderForm({
        productName: prefilledMarketProduct.name,
        quantity: 1,
        supplierName: prefilledMarketProduct.supplierName,
        supplierPhone: '[OCULTO - INTERMEDIAÇÃO OBRIGATÓRIA]',
        supplierLocation: artLocation,
        notes: `Adquirido através do Mercado de Fornecedores Homologados. ID Fornecedor: ${prefilledMarketProduct.supplierId}. Localização do Artigo: ${artLocation}. Disponibilidade de Envio: ${artAvailability}. Preço Base: ${prefilledMarketProduct.price.toLocaleString('pt-AO')} AOA.`,
        deliveryOption: 'escritorio',
        deliveryAddress: '',
        preferredCarrierId: ''
      });
      
      // Seed product image as first attachment
      setTempPhotos([
        {
          url: prefilledMarketProduct.photoUrl,
          type: 'gallery',
          name: `foto_${prefilledMarketProduct.supplierId}.jpg`
        }
      ]);
      
      // Reset prefills to clear state
      setPrefilledMarketProduct(null);
    }
  }, [currentView, prefilledMarketProduct, suppliers]);

  // Compute filtered list of suppliers and products
  const filteredSuppliersList = suppliers.filter(sup => {
    const matchesSearch = sup.name.toLowerCase().includes(supplierSearchText.toLowerCase()) ||
      supplierProducts.some(p => p.supplierId === sup.id && p.published && p.name.toLowerCase().includes(supplierSearchText.toLowerCase()));
    
    const matchesCategory = supplierSelectedCategory === 'all' || sup.category === supplierSelectedCategory;
    const matchesCity = supplierSelectedCity === 'all' || sup.city === supplierSelectedCity;
    
    return matchesSearch && matchesCategory && matchesCity;
  }).sort((a, b) => {
    const priority = { diamante: 4, ouro: 3, prata: 2, gratuito: 1 };
    return priority[b.plan] - priority[a.plan];
  });

  // Support / Live Bot FAQ States
  const [faqAnswers, setFaqAnswers] = useState<{ q: string; a: string }[]>([
    {
      q: "Qual o prazo padrão de trânsito Luanda para Cabinda?",
      a: "Temos duas modalidades: Via Aérea (TAAG Cargo) leva em média de 1 a 2 dias úteis de aeroporto para aeroporto. Via Marítima de Cabotagem leva cerca de 6 a 8 dias de porto a porto comercial."
    },
    {
      q: "Onde fica situado o escritório do Mediador em Cabinda?",
      a: "O nosso pavilhão central de depósitos e balcão de apoio localiza-se na Zona Portuária de Cabinda, Armazém C-4. Venha visitar-nos!"
    },
    {
      q: "Como é calculada a taxa de comissão de intermediação?",
      a: "Cobramos uma taxa base de 10% a 15% calculada sobre o valor original faturado pelo fornecedor em Luanda. Clientes Bronze, Prata e Ouro beneficiam de descontos automáticos de fidelidade de até 6%!"
    },
    {
      q: "É possível agendar entrega à porta em Cabinda?",
      a: "Sim! Por uma taxa fixa acessível de 5.000 AOA, entregamos encomendas pesadas ou leves em qualquer bairro de Cabinda (Sede), Cacongo ou Buco-Zau."
    }
  ]);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Pay form states
  const [paymentMethod, setPaymentMethod] = useState<'transferencia' | 'multicaixa' | 'referencia'>('multicaixa');
  const [mcExpressPhone, setMcExpressPhone] = useState('');
  const [includeInsurance, setIncludeInsurance] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Delivery configuration states
  const [deliveryOption, setDeliveryOption] = useState<'escritorio' | 'domicilio'>('escritorio');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Rating & Complaint Form
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState('');
  const [complaint, setComplaint] = useState('');
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);

  // Client-side Partner Simulation States
  const [calcSaleAmount, setCalcSaleAmount] = useState<number>(600000);
  const [calcCommissionPrice, setCalcCommissionPrice] = useState<number>(90000);
  const [calcMonthlyGoal, setCalcMonthlyGoal] = useState<number>(120000);

  // Active Client computed
  const client = clients.find(c => c.id === activeClientId) || clients[0];
  const clientOrders = orders.filter(o => o.clientId === activeClientId);
  const activeOrder = clientOrders.find(o => o.id === selectedOrderId) || clientOrders[0];

  const clientNotifications = notifications.filter(n => n.clientId === activeClientId);
  const unreadNotifications = clientNotifications.filter(n => !n.read);

  // Text reader voice helper
  const speak = (txt: string) => {
    if (!textToSpeech) return;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(txt);
        utterance.lang = 'pt-AO';
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Client speech synthesis failed/unsupported:", err);
      }
    }
  };

  // Pre-calculated freight estimator logic
  const getEstimatedFreight = () => {
    let freight = 8000;
    if (newOrderForm.productName.toLowerCase().includes('laptop') || newOrderForm.productName.toLowerCase().includes('computador')) freight = 12000;
    if (newOrderForm.productName.toLowerCase().includes('bomba') || newOrderForm.productName.toLowerCase().includes('motor')) freight = 15000;
    if (newOrderForm.productName.toLowerCase().includes('pneu')) freight = 25000;
    if (newOrderForm.productName.toLowerCase().includes('contraplacado') || newOrderForm.productName.toLowerCase().includes('madeira')) freight = 40000;
    return freight * newOrderForm.quantity;
  };

  const getCalcDetails = () => {
    const rawPrice = calcRawPrice || 0;
    const weight = calcWeight || 0;
    
    // 1) AGT Customs duty rate based on category
    let dutyRate = 0.05; // 5% default (General / Accessories)
    let categoryLabel = 'Acessórios & Vestuário (5% AGT)';
    if (calcCategory === 'electronics') {
      dutyRate = 0.08; // 8% Electronics
      categoryLabel = 'Eletroportáteis & Tecnologias (8% AGT)';
    } else if (calcCategory === 'energy') {
      dutyRate = 0.12; // 12% Energy / Generators
      categoryLabel = 'Motores & Equipamento industrial (12% AGT)';
    } else if (calcCategory === 'furniture') {
      dutyRate = 0.10; // 10% Furniture / Bulk goods
      categoryLabel = 'Mobiliários & Peças Pesadas (10% AGT)';
    }

    const dutyAmount = Math.floor(rawPrice * dutyRate);

    // 2) Shipping rate per Kg depending on preferred dispatcher
    const selectedCarrierId = newOrderForm.preferredCarrierId || carriersList[0]?.id || '';
    const selectedCarrier = carriersList.find(c => c.id === selectedCarrierId);
    const baseRate = selectedCarrier ? selectedCarrier.baseRatePerKg : 1500;
    const shippingCost = Math.floor(baseRate * weight);

    // 3) Mediator intermediate commission rate (Dynamic based on product base price / sale value)
    let commissionRate = 0.12;
    if (rawPrice < 300000) {
      commissionRate = 0.08;       // < 300K Kz: 8%
    } else if (rawPrice < 1000000) {
      commissionRate = 0.12;       // 300K ~ 1M Kz: 12%
    } else if (rawPrice < 3000000) {
      commissionRate = 0.15;       // 1M ~ 3M Kz: 15%
    } else {
      commissionRate = 0.18;       // >= 3M Kz: 18%
    }
    const commissionAmount = Math.floor(rawPrice * commissionRate);

    // 4) Total amount
    const totalAmount = rawPrice + dutyAmount + shippingCost + commissionAmount;

    return {
      rawPrice,
      weight,
      dutyRate,
      categoryLabel,
      dutyAmount,
      shippingCost,
      commissionRate,
      commissionAmount,
      totalAmount
    };
  };

  // Submission handler for new signups
  const handleClientSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupForm.name || !signupForm.phone || !signupForm.password) {
      showModalAlert("Formulário Incompleto", "Por favor, preencha todos os campos obrigatórios assinalados com asterisco (*).", "warning");
      return;
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      showModalAlert("Inconsistência de Senha", "As senhas de segurança inseridas nos dois campos não coincidem. Digite novamente.", "warning");
      return;
    }

    const newId = `cli-${Date.now()}`;
    const newClient: Client = {
      id: newId,
      name: signupForm.name,
      phone: signupForm.phone,
      email: signupForm.email || `${signupForm.name.toLowerCase().replace(/\s+/g, '')}@mediador.com`,
      address: `${signupForm.rua}, Bairro ${signupForm.bairro}`,
      province: signupForm.province,
      municipality: signupForm.municipality,
      nif: signupForm.nif || `AO-${Math.floor(100000 + Math.random() * 900000)}`,
      points: 200, //Gift initial Standard Welcome loyalty points
      tier: 'Standard'
    };

    onAddClient(newClient);
    setSignupSuccess(true);
    speak("Sua conta no Mediador Cabinda foi criada com sucesso! Redirecionando para a página inicial.");
    
    setTimeout(() => {
      setSignupSuccess(false);
      // reset form
      setSignupForm({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        province: 'Cabinda',
        municipality: 'Cabinda (Sede)',
        bairro: '',
        rua: '',
        nif: ''
      });
      setSignupDocPhoto(null);
      setCurrentView('inicio');
    }, 2500);
  };

  // Update account details handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const clientIdx = clients.findIndex(c => c.id === activeClientId);
    if (clientIdx !== -1) {
      const updatedClient = {
        ...client,
        name: profileForm.name || client.name,
        phone: profileForm.phone || client.phone,
        email: profileForm.email || client.email,
        address: profileForm.address || client.address,
        province: profileForm.province || client.province,
        municipality: profileForm.municipality || client.municipality
      };
      
      clients[clientIdx] = updatedClient;
      setProfileMsg("Os seus dados foram atualizados com sucesso!");
      speak("Perfil e morada atualizados com sucesso.");
      setTimeout(() => setProfileMsg(''), 4000);
    }
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderForm.productName || !newOrderForm.supplierName) return;

    const newId = `MED-${Math.floor(1000 + Math.random() * 9000)}`;
    const selectedCarrierId = newOrderForm.preferredCarrierId || carriersList[0]?.id || '';
    const selectedCarrier = carriersList.find(c => c.id === selectedCarrierId);

    const calc = getCalcDetails();
    const rawPrice = calcActive ? calc.rawPrice : (newOrderForm.quantity * 125000);
    const shippingCost = calcActive ? calc.shippingCost : getEstimatedFreight();
    const dutyFee = calcActive ? calc.dutyAmount : Math.floor(rawPrice * 0.05);
    const commFee = calcActive ? calc.commissionAmount : Math.floor(rawPrice * 0.12);
    const totalCost = calcActive ? calc.totalAmount : (rawPrice + shippingCost + dutyFee + commFee);

    const newOrder: Order = {
      id: newId,
      clientId: client.id,
      clientName: client.name,
      clientPhone: client.phone,
      productName: newOrderForm.productName,
      quantity: newOrderForm.quantity,
      supplierName: newOrderForm.supplierName,
      supplierPhone: newOrderForm.supplierPhone,
      supplierLocation: newOrderForm.supplierLocation,
      notes: newOrderForm.notes,
      productPhotos: tempPhotos,
      productPhotoUrl: tempPhotos[0]?.url || undefined,
      paid: false,
      
      // Dynamic budget estimates sync
      budgetRawPrice: rawPrice,
      budgetShipping: shippingCost,
      dispatchFee: dutyFee,
      commissionRate: calcActive ? calc.dutyRate : 0.12,
      commissionAmount: commFee,
      totalAmount: totalCost,

      deliveryOption: newOrderForm.deliveryOption,
      deliveryAddress: newOrderForm.deliveryAddress,
      shippingCarrier: selectedCarrier ? selectedCarrier.name : undefined,
      status: 'RECEBIDO',
      pointsEarned: Math.floor(shippingCost / 100),
      createdAt: new Date().toISOString()
    };

    onAddOrder(newOrder);
    setSelectedOrderId(newId);
    setOrderDetailTab('tracker');
    
    // Clear Form
    setNewOrderForm({
      productName: '',
      quantity: 1,
      supplierName: '',
      supplierPhone: '',
      supplierLocation: 'Luanda, Maculusso',
      notes: '',
      deliveryOption: 'escritorio',
      deliveryAddress: '',
      preferredCarrierId: ''
    });
    setTempPhotos([]);

    speak(`Seu pedido de ${newOrder.productName} foi cadastrado com preferência de despacho pela ${newOrder.shippingCarrier || 'sua transportadora escolhida'}.`);
    setCurrentView('acompanhar-pedido');
  };

  const handleProcessPayment = () => {
    if (!activeOrder) return;
    setIsPaying(true);

    // Simulate approval duration
    setTimeout(() => {
      let insuranceCost = includeInsurance ? Math.round((activeOrder.budgetRawPrice || 0) * 0.03) : 0;
      const initialTotal = activeOrder.totalAmount || 0;
      const finalTotal = initialTotal + insuranceCost;

      const updated: Order = {
        ...activeOrder,
        paid: true,
        paymentMethod: paymentMethod,
        paymentReference: paymentMethod === 'multicaixa' ? `MC Express (${mcExpressPhone || client.phone})` : `Ref: MCX-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'PAGO',
        totalAmount: finalTotal,
        createdAt: new Date().toISOString()
      };

      onUpdateOrder(updated);
      setIsPaying(false);
      setPaymentCompleted(true);
      speak("Pagamento para compra em Luanda validado! A nossa equipa irá agora adquirir o produto.");

      // Update points on user
      const clientIdx = clients.findIndex(c => c.id === client.id);
      if (clientIdx !== -1) {
        const updatedPoints = client.points + Math.floor(finalTotal / 1000);
        let tier = client.tier;
        if (updatedPoints >= 3000) tier = 'Ouro';
        else if (updatedPoints >= 1000) tier = 'Prata';
        else if (updatedPoints >= 300) tier = 'Bronze';
        
        clients[clientIdx] = { ...client, points: updatedPoints, tier };
      }
    }, 1500);
  };

  const handleUpdateDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;

    const deliverCost = deliveryOption === 'domicilio' ? 5000 : 0;
    const currentTotal = activeOrder.totalAmount || 0;

    const updated: Order = {
      ...activeOrder,
      deliveryOption,
      deliveryAddress: deliveryOption === 'domicilio' ? deliveryAddress : '',
      totalAmount: currentTotal + deliverCost
    };

    onUpdateOrder(updated);
    showModalAlert(
      'Opção de Entrega Registada',
      `As suas preferências de entrega local em Cabinda foram atualizadas com sucesso!\n\nModalidade: ${deliveryOption === 'domicilio' ? 'Entrega ao Domicílio (Taxa Adicional 5.000 AOA)' : 'Levantamento Livre no Armazém Central Cabinda/Porto'}\n\nO Mediador garante a custódia do lote.`,
      'success'
    );
  };

  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;

    const updated: Order = {
      ...activeOrder,
      rating,
      feedback
    };
    onUpdateOrder(updated);
    speak("Obrigado pela sua valiosa avaliação.");
  };

  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder || !complaint.trim()) return;

    const updated: Order = {
      ...activeOrder,
      complaint: complaint.trim(),
      complaintResolved: false
    };
    onUpdateOrder(updated);
    setComplaintSubmitted(true);
    setComplaint('');
    speak("Sua reclamação foi registada no portal de intermediação.");
  };

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return 'AOA 0,00';
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0 }).format(val);
  };

  const getStatusLabelAndColor = (status: OrderStatus) => {
    switch (status) {
      case 'RECEBIDO': return { label: 'Pedido Recebido', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
      case 'ANALISE': return { label: 'Em Análise Técnica', color: 'bg-amber-100 text-amber-700 border-amber-200' };
      case 'ORCADO': return { label: 'Orçamento Emitido', color: 'bg-cyan-100 text-cyan-700 border-cyan-200 font-bold' };
      case 'PAGO': return { label: 'Pagamento Validado', color: 'bg-green-100 text-green-700 border-green-200' };
      case 'COMPRADO': return { label: 'Produto Adquirido', color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'TRANSPORTE': return { label: 'Em Trânsito Cargo', color: 'bg-sky-100 text-sky-700 border-sky-200' };
      case 'CABINDA': return { label: 'Chegou a Cabinda', color: 'bg-teal-100 text-teal-700 border-teal-200' };
      case 'LEVANTAMENTO': return { label: 'Pronto p/ Levantamento', color: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'ENTREGUE': return { label: 'Concluído & Entregue', color: 'bg-emerald-100 text-emerald-800 border-emerald-250 font-bold' };
    }
  };

  const getTrackingSteps = (order: Order | null) => {
    const origin = order?.supplierLocation || 'Luanda';
    const isCabindaOrigin = origin.toLowerCase().includes('cabinda');
    const startProv = isCabindaOrigin ? 'Cabinda' : 'Luanda';
    const endProv = isCabindaOrigin ? 'Luanda' : 'Cabinda';

    return [
      { status: 'RECEBIDO', title: '1. Pedido Inicial Registado', desc: `Sua solicitação de intermediação entre ${startProv} e ${endProv} foi salva.` },
      { status: 'ANALISE', title: '2. Análise de Fornecedores', desc: `Nossa equipa localiza fisicamente o produto em ${startProv} de forma fiscal.` },
      { status: 'ORCADO', title: '3. Orçamento Pronto', desc: 'Preço da compra, freight marítimo/aéreo e despacho aduaneiro calculados.' },
      { status: 'PAGO', title: '4. Pagamento Processado', desc: 'O montante foi depositado ou pago por Multicaixa e com fatura.' },
      { status: 'COMPRADO', title: `5. Compra em ${startProv}`, desc: `A equipa do Mediador comprou o artigo em ${startProv} e recolheu a Fatura Oficial.` },
      { status: 'TRANSPORTE', title: '6. Expedição de Cargas', desc: `Carga despachada via aérea/marítima de ${startProv} com a Guia de Carga.` },
      { status: 'CABINDA', title: `7. Recebido no Polo ${endProv}`, desc: `Produto descarregado em perfeitas condições nos depósitos de ${endProv}.` },
      { status: 'LEVANTAMENTO', title: '8. Pronto para Recolha', desc: 'Aguardando o seu levantamento ou em rota de entrega ao domicílio cadastrada.' },
      { status: 'ENTREGUE', title: '9. Encomenda Entregue', desc: 'Artigo recebido, avaliado e concluído com sucesso total.' }
    ] as const;
  };

  const getCurrentStatusIndex = (status: OrderStatus, order?: Order | null) => {
    const activeOrd = order || (selectedOrderId ? clientOrders.find(o => o.id === selectedOrderId) : null);
    return getTrackingSteps(activeOrd || null).findIndex(step => step.status === status);
  };

  // Search Results computed for Home page
  const filteredHomeOrders = homeSearchQuery.trim() === '' 
    ? [] 
    : clientOrders.filter(o => 
        o.productName.toLowerCase().includes(homeSearchQuery.toLowerCase()) || 
        o.id.toLowerCase().includes(homeSearchQuery.toLowerCase()) ||
        o.supplierName.toLowerCase().includes(homeSearchQuery.toLowerCase())
      );

  const isChatActiveView = currentView === 'suporte' || currentView === 'mensagens';

  return (
    <div className={isChatActiveView ? "pb-28" : "space-y-6 p-3 sm:p-0 pb-28"} id="client-view-layout">
      
      {/* 🟢 TOP PERSISTENT STICKY HEADER WITH HAMBURGER MENU */}
      {!isChatActiveView && (
        <header className="sticky top-0 bg-white border-b border-slate-150 z-40 px-4 py-3.5 flex items-center justify-between shadow-none sm:shadow-xs rounded-none sm:rounded-2xl border-x-0 sm:border-x shrink-0" id="client-sticky-nav-header">
          <div className="flex items-center gap-3">
            {/* Hamburger Menu Trigger */}
            <button
              onClick={() => {
                setSidebarOpen(true);
                speak("Menu lateral de operações aberto. Escolha uma aba de gestão.");
              }}
              type="button"
              className="p-2 hover:bg-slate-50 active:bg-slate-100 rounded-xl transition-all text-slate-800 cursor-pointer flex items-center justify-center border border-slate-150"
              title="Abrir Operações"
              id="hamburger-sidebar-trigger"
            >
              <Menu className="w-5 h-5 text-slate-900" />
            </button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-xs">
                ⚓
              </div>
              <div>
                <h1 className="text-sm font-black text-slate-900 leading-none">Mediador Cabinda</h1>
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mt-0.5">Intermediação de Cargas</span>
              </div>
            </div>
          </div>
          
          {/* Right side shortcut status */}
          <div className="flex items-center gap-2">
            {/* Coins/Points badge */}
            <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-full px-2.5 py-1 text-[10px] text-amber-850 font-black">
              <Coins className="w-3.5 h-3.5 text-amber-550" />
              <span>{client.points} pts</span>
            </div>

            {/* Quick Profile Icon toggle option */}
            <button
              onClick={() => {
                setCurrentView('minha-conta');
                speak("Abrindo detalhes da sua conta cliente.");
              }}
              className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center cursor-pointer hover:border-amber-400 transition-colors"
              title="Meu Perfil"
            >
              {profilePicture ? (
                <img src={profilePicture} className="w-full h-full object-cover" alt="Foto" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-[10px] font-bold text-slate-600">{client.name.substring(0, 2).toUpperCase()}</span>
              )}
            </button>
          </div>
        </header>
      )}

      {/* 🔘 SLIDE-OUT DRAWER / SIDEBAR */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex" id="sidebar-drawer-overlay">
          {/* Backdrop clickoff */}
          <div 
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* Drawer Body container */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col justify-between shadow-2xl animate-fade-in border-r border-slate-150 z-50 overflow-hidden text-slate-800">
            {/* Header / Brand in drawer */}
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🚢</span>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">Menu de Operações</h3>
                  <p className="text-[10px] text-slate-400 font-bold">Gestão & Cabotagem Fiscal</p>
                </div>
              </div>
              
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Menu options list */}
            <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider px-3 py-1.5">Navegação Geral</p>
              
              {[
                { id: 'inicio', label: 'Ver Catálogo Mediador', icon: ShoppingBag, desc: 'Lista de produtos homologados', highlight: currentView === 'inicio' },
                { id: 'fazer-pedido', label: 'Pedir Nova Intermediação', icon: PlusCircle, desc: 'Solicitar compra em Luanda', highlight: currentView === 'fazer-pedido' },
                { id: 'solicitar-servico', label: 'Solicitar Serviço 🛠️', icon: Wrench, desc: 'Pedir serviço de serralharia', highlight: currentView === 'solicitar-servico' },
                { id: 'acompanhar-pedido', label: 'Acompanhar Meus Pedidos', icon: Truck, desc: 'Ver estado de rotas e guias', highlight: currentView === 'acompanhar-pedido' },
                { id: 'mensagens', label: 'Central de Apoio & Chats', icon: MessageSquare, desc: 'Conversar com os mediadores', highlight: currentView === 'mensagens' },
                { id: 'historico', label: 'Histórico de Cargas', icon: Clock, desc: 'Precedentes e faturas pagas', highlight: currentView === 'historico' },
                { id: 'pagamentos', label: 'Minhas Faturas & Finais', icon: CreditCard, desc: 'Liquidar comprovativos', highlight: currentView === 'pagamentos' },
                { id: 'notificacoes', label: 'Alertas e Avisos Fiscais', icon: Bell, desc: 'Notificações da central', highlight: currentView === 'notificacoes' },
                { id: 'reclamacoes', label: 'Portal de Reclamações', icon: AlertTriangle, desc: 'Suporte de carga aduaneira', highlight: currentView === 'reclamacoes' },
                { id: 'parceria', label: 'Área do Parceiro / Afiliado 🤝', icon: Coins, desc: 'Ganhe comissão por clientes', highlight: currentView === 'parceria' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.id === 'mensagens') {
                        localStorage.removeItem('mediador_active_channel');
                      }
                      setCurrentView(item.id as any);
                      setSidebarOpen(false);
                      speak(`A abrir painel: ${item.label}`);
                    }}
                    className={`w-full flex items-center gap-3.5 p-3 rounded-2xl text-left transition-all font-semibold border ${
                      item.highlight 
                        ? 'bg-amber-400 border-amber-500 text-slate-950 font-extrabold shadow-xs'
                        : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0 text-inherit" />
                    <div>
                      <span className="text-xs block leading-tight">{item.label}</span>
                      <span className={`text-[9px] block ${item.highlight ? 'text-slate-800' : 'text-slate-400'} font-medium mt-0.5`}>{item.desc}</span>
                    </div>
                  </button>
                );
              })}
              
              <div className="border-t border-slate-100 my-4 pt-4">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider px-3 py-1.5 font-sans">Sobre & Ajuda</p>
                {[
                  { id: 'guia-ajuda', label: 'Como Funciona & Taxas 💡', icon: HelpCircle, desc: 'Perguntas frequentes e passo-a-passo' },
                  { id: 'minha-conta', label: 'Meu Cadastro / Perfil', icon: User, desc: 'Ver dados de morada e NIF' },
                  { id: 'termos-uso', label: 'Termos e Condições', icon: FileText, desc: 'Salvaguardas alfandegárias' },
                  { id: 'sobre-nos', label: 'Políticas de Intermediação', icon: Info, desc: 'Sobre o Mediador Cabinda' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setCurrentView(item.id as any);
                        setSidebarOpen(false);
                        speak(`A abrir painel: ${item.label}`);
                      }}
                      className={`w-full flex items-center gap-3 p-2 px-3 rounded-xl text-left transition-all text-xs font-semibold hover:bg-slate-50 text-slate-600 hover:text-slate-900`}
                    >
                      <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* User Section in drawer footer */}
            <div className="p-4 bg-slate-900 text-white border-t border-slate-800 flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                  {client.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-[11px] font-extrabold truncate text-white leading-tight">{client.name}</p>
                  <p className="text-[9px] text-slate-405 truncate">{client.phone}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCurrentView('entrar');
                  setSidebarOpen(false);
                  speak("Abrindo selecionador de perfil.");
                }}
                className="text-[9px] bg-slate-800 hover:bg-slate-700 font-extrabold px-2 py-1 rounded-md text-sky-400 uppercase shrink-0 transition-colors cursor-pointer"
              >
                Trocar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1) TELA INICIAL (ALIXPRESS STYLE ONLY PRODUCTS SHOWROOM) */}
      {currentView === 'inicio' && (
        <div className="space-y-6 animate-fade-in" id="dashboard-home-tab">
          
          {/* Banner */}
          <div className="bg-gradient-to-r from-amber-400 to-amber-500 rounded-3xl p-5 text-slate-950 relative overflow-hidden shadow-xs border border-amber-300">
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative z-10 space-y-1">
              <span className="text-[8px] bg-slate-950 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest inline-block leading-none">
                Mercadoria Autêntica
              </span>
              <h2 className="text-lg font-display font-black tracking-tight leading-none text-slate-950">
                {selectedLocationFilter === 'all' 
                  ? 'Vitrina Geral de Produtos (Luanda & Cabinda)' 
                  : `Vitrina de Produtos — Origem ${selectedLocationFilter}`}
              </h2>
              <p className="text-[10px] text-slate-900 font-medium leading-relaxed max-w-xl">
                {selectedLocationFilter === 'Cabinda'
                  ? 'Nós intermediamos a compra física e fiscal de mercadorias localizadas em Cabinda, organizando a guia aduaneira e entregando em Luanda.'
                  : selectedLocationFilter === 'Luanda'
                    ? 'Nós compramos por si física e fiscalmente em Luanda, elaboramos a guia aduaneira e entregamos em Cabinda com segurança total.'
                    : 'A sua ponte comercial completa: compramos e despachamos mercadorias bidirecionalmente entre Luanda e Cabinda com isenção alfandegária.'}
              </p>
            </div>
          </div>

          {/* Search bar & Location Filter Buttons */}
          <div className="space-y-3" id="product-feed-catalog-search">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={homeSearchQuery}
                onChange={(e) => setHomeSearchQuery(e.target.value)}
                placeholder="Pesquise por informática, geradores, cabos de cobre..."
                className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-2xl shadow-xs text-xs font-semibold focus:outline-hidden focus:border-amber-400 focus:ring-0 text-slate-800 transition-colors"
                id="catalog-product-search-input"
              />
              {homeSearchQuery && (
                <button 
                  type="button"
                  onClick={() => setHomeSearchQuery('')}
                  className="absolute right-4 top-3.5 text-[10px] text-slate-400 hover:text-slate-600 font-bold"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Quick Location Tabs */}
            <div className="flex gap-2 items-center overflow-x-auto pb-1 scrollbar-thin">
              <span className="text-[9px] font-bold text-slate-400 uppercase shrink-0">Filtrar Origem:</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedLocationFilter('all');
                  speak("Exibindo todos os produtos de Luanda e Cabinda");
                }}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-full transition-all shrink-0 cursor-pointer ${
                  selectedLocationFilter === 'all' 
                    ? 'bg-amber-400 text-slate-950 border border-amber-400 shadow-xs' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                🌍 Todos ({supplierProducts.filter(p => p.published).length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedLocationFilter('Luanda');
                  speak("Filtrando produtos localizados em Luanda");
                }}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-full transition-all shrink-0 cursor-pointer ${
                  selectedLocationFilter === 'Luanda' 
                    ? 'bg-amber-400 text-slate-950 border border-amber-400 shadow-xs' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                📍 Luanda ({supplierProducts.filter(p => p.published && (p.location || 'Luanda') === 'Luanda').length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedLocationFilter('Cabinda');
                  speak("Filtrando produtos localizados em Cabinda");
                }}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-full transition-all shrink-0 cursor-pointer ${
                  selectedLocationFilter === 'Cabinda' 
                    ? 'bg-amber-400 text-slate-950 border border-amber-400 shadow-xs' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                📍 Cabinda ({supplierProducts.filter(p => p.published && p.location === 'Cabinda').length})
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[9px] uppercase font-bold text-slate-400 font-sans tracking-wider">Catálogo Público</span>
              <span className="text-[10px] text-slate-500 font-bold font-mono">
                {supplierProducts.filter(p => p.published && (selectedLocationFilter === 'all' || (p.location || 'Luanda') === selectedLocationFilter) && (!homeSearchQuery.trim() || p.name.toLowerCase().includes(homeSearchQuery.toLowerCase()))).length} itens
              </span>
            </div>

            {supplierProducts.filter(p => p.published && (selectedLocationFilter === 'all' || (p.location || 'Luanda') === selectedLocationFilter) && (!homeSearchQuery.trim() || p.name.toLowerCase().includes(homeSearchQuery.toLowerCase()))).length === 0 ? (
              <div className="text-center py-12 bg-white border border-slate-150 rounded-3xl p-6">
                <span className="text-2xl block mb-2">🔍</span>
                <p className="text-xs font-bold text-slate-800">Sem correspondências.</p>
                <p className="text-[10px] text-slate-405 mt-1">Insira outro termo de procura.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4" id="products-catalog-continuous-feed">
                {supplierProducts
                  .filter(p => p.published && (selectedLocationFilter === 'all' || (p.location || 'Luanda') === selectedLocationFilter) && (!homeSearchQuery.trim() || p.name.toLowerCase().includes(homeSearchQuery.toLowerCase()) || (p.description || '').toLowerCase().includes(homeSearchQuery.toLowerCase())))
                  .sort((a, b) => (b.sponsored ? 1 : 0) - (a.sponsored ? 1 : 0))
                  .map((prod) => {
                    const isEsgotado = prod.availability === 'esgotado' || prod.stock === 0;
                    const prodSupplier = suppliers.find(s => s.id === prod.supplierId);
                    
                    return (
                      <div 
                        key={prod.id}
                        onClick={() => {
                          setSelectedProduct(prod);
                          speak(`Visualizando ${prod.name}`);
                        }}
                        className="bg-white border border-slate-150 rounded-2xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between group h-full cursor-pointer relative"
                        id={`product-card-${prod.id}`}
                      >
                        {/* Image aspect relative */}
                        <div className="relative aspect-square bg-slate-50 overflow-hidden shrink-0 border-b border-slate-100">
                          {prod.photoUrl ? (
                            <img 
                              src={prod.photoUrl} 
                              alt={prod.name} 
                              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-350"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-xs">
                              Sem Foto
                            </div>
                          )}

                          {prod.sponsored && (
                            <div className="absolute top-2 left-2">
                              <span className="bg-amber-400 text-slate-950 font-black text-[7px] px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                                Destaque
                              </span>
                            </div>
                          )}

                          <div className="absolute top-2 right-2">
                            {isEsgotado ? (
                              <span className="bg-red-500 text-white font-black text-[7px] px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                Esgotado
                              </span>
                            ) : prod.availability === 'sob-pedido' ? (
                              <span className="bg-blue-500 text-white font-black text-[7px] px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                Pedido
                              </span>
                            ) : (
                              <span className="bg-emerald-500 text-white font-black text-[7px] px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse-subtle">
                                Em Stock
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Description Context */}
                        <div className="p-3 flex-1 flex flex-col justify-between space-y-2 text-xs">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <span className="bg-amber-100/90 text-amber-900 text-[8.5px] font-mono font-black px-1.5 py-0.5 rounded-md border border-amber-200/80 shadow-2xs">
                                🏷️ {getProductCode(prod)}
                              </span>
                              <span className="text-[9px] text-slate-400 font-bold truncate">
                                📍 {prod.location || 'Luanda'}
                              </span>
                            </div>
                            <h4 className="font-extrabold text-[11px] text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2 leading-tight">
                              {prod.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-medium truncate mt-1">
                              Empresa: <span className="font-semibold text-slate-650">{prodSupplier?.name || 'Parceiro'}</span>
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                            <div>
                              <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider block">Preço</span>
                              <span className="font-mono text-xs font-black text-slate-900">
                                {prod.price.toLocaleString('pt-AO')} Kz
                              </span>
                            </div>

                            <span className="text-[9px] font-black text-amber-900 bg-amber-200/90 group-hover:bg-amber-400 px-2 py-1 rounded-lg transition-colors flex items-center gap-0.5 shadow-2xs">
                              Opções ⚡
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2) FAZER PEDIDO (SOLICITAR COMPRA) */}
      {currentView === 'fazer-pedido' && (
        <div className="max-w-2xl mx-auto bg-white border-0 sm:border border-slate-150 rounded-none sm:rounded-3xl p-4 sm:p-6 shadow-none sm:shadow-sm animate-fade-in" id="fazer-pedido-screen">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-6">
            <div className="bg-amber-100 text-slate-900 p-2.5 rounded-xl">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-slate-900">Solicitar Nova Compra / Encomenda</h3>
              <p className="text-xs text-slate-500 font-medium">Basta descrever o produto. Localizamos nas maiores lojas físicas fiscais de Luanda.</p>
            </div>
          </div>

          <form onSubmit={handleCreateOrder} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-705 mb-1.5">Qual o Equipamento / Artigo que Deseja? *</label>
                <input
                  type="text"
                  value={newOrderForm.productName}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, productName: e.target.value })}
                  placeholder="Ex: Gerador 5KVA a Gasóleo Toyama ou Computador Portátil Lenovo"
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-705 mb-1.5">Quantidade Necessária *</label>
                <input
                  type="number"
                  min="1"
                  value={newOrderForm.quantity === 0 ? '' : newOrderForm.quantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewOrderForm({ 
                      ...newOrderForm, 
                      quantity: val === '' ? 0 : Math.max(1, parseInt(val, 10) || 1) 
                    });
                  }}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-705 mb-1.5">Previsão Estimada de Trânsito</label>
                <div className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono flex items-center justify-between text-slate-700">
                  <span className="font-bold text-slate-800">{formatCurrency(getEstimatedFreight())}</span>
                  <span className="text-[10px] text-slate-400">Freight Médio Estimado</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-705 mb-1.5">Localização Física do Fornecedor (Origem) *</label>
                <select
                  value={newOrderForm.supplierLocation}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, supplierLocation: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white focus:outline-hidden text-slate-800 font-bold"
                  required
                >
                  <option value="Luanda, Maculusso">Luanda (📍 Enviar para Cabinda)</option>
                  <option value="Cabinda, Centro">Cabinda (📍 Enviar para Luanda)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-705 mb-1.5">Fornecedor Sugerido (Se souber)</label>
                <input
                  type="text"
                  value={newOrderForm.supplierName}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, supplierName: e.target.value })}
                  placeholder="Ex: Robert Hudson Maculusso ou Sem Preferência"
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-705 mb-1.5">Telefone de Contacto do Fornecedor</label>
                <input
                  type="text"
                  value={newOrderForm.supplierPhone}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, supplierPhone: e.target.value })}
                  placeholder="Ex: +244 912 000 111"
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl"
                />
              </div>

              {/* DYNAMIC COST AND TAX CALCULATOR ESTIMATOR (AGT & TRANSPORT) */}
              <div className="sm:col-span-2 border-t border-b border-slate-100 py-3.5 space-y-3" id="provisional-tax-cargo-calc">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                      <span>🧮</span> Estimador Orçamental e Fiscal (AGT)
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium">Calcule de antemão tarifas aduaneiras e lucros de transporte para Cabinda</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCalcActive(!calcActive);
                      speak(calcActive ? "Calculadora avançada desativada." : "Calculadora de taxas aduaneiras e transporte ativada.");
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      calcActive 
                        ? 'bg-amber-400 text-slate-950 font-bold' 
                        : 'bg-slate-100 text-slate-550 border border-slate-200'
                    }`}
                  >
                    {calcActive ? "Ativo ✓" : "Ativar Calculadora"}
                  </button>
                </div>

                {calcActive && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-xs animate-scale-up text-left">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Preço em Luanda (Kz)</label>
                        <input
                          type="number"
                          step="1000"
                          value={calcRawPrice === 0 ? '' : calcRawPrice}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCalcRawPrice(val === '' ? 0 : Math.max(0, parseInt(val) || 0));
                          }}
                          className="w-full text-xs p-2.5 border bg-white rounded-lg focus:outline-hidden"
                        />
                        <span className="text-[9px] text-slate-400 mt-1 block">Preço base de loja</span>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Peso da Carga (Kg)</label>
                        <input
                          type="number"
                          value={calcWeight === 0 ? '' : calcWeight}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCalcWeight(val === '' ? 0 : Math.max(0, parseInt(val) || 0));
                          }}
                          className="w-full text-xs p-2.5 border bg-white rounded-lg focus:outline-hidden"
                        />
                        <span className="text-[9px] text-slate-400 mt-1 block">Utilizado no frete</span>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Categoria (Taxas AGT)</label>
                        <select
                          value={calcCategory}
                          onChange={(e) => setCalcCategory(e.target.value as any)}
                          className="w-full text-xs p-2.5 border bg-white rounded-lg focus:outline-hidden"
                        >
                          <option value="accessories">Vestuário / Geral (5% AGT)</option>
                          <option value="electronics">Eletroportáteis (8% AGT)</option>
                          <option value="energy">Motores / Geradores (12% AGT)</option>
                          <option value="furniture">Mobiliário / Pesados (10% AGT)</option>
                        </select>
                        <span className="text-[9px] text-slate-400 mt-1 block">Regime alfandegário</span>
                      </div>
                    </div>

                    {/* Breakdown bento panel */}
                    {(() => {
                      const breakdown = getCalcDetails();
                      return (
                        <div className="bg-white border rounded-xl p-3.5 space-y-2.5">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-1.5 flex justify-between items-center">
                            <span>Demonstração de Custos Estimados</span>
                            <span className="bg-amber-100 text-amber-800 text-[8px] px-1.5 py-0.5 rounded-sm font-bold capitalize">Preço Estimativo</span>
                          </p>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-800">
                            <div className="p-2.5 bg-slate-50/50 rounded-lg">
                              <span className="text-[8px] text-slate-400 font-bold block uppercase">Base Luanda</span>
                              <span className="font-mono font-bold text-[11px] text-slate-800">{formatCurrency(breakdown.rawPrice)}</span>
                            </div>
                            <div className="p-2.5 bg-slate-50/50 rounded-lg">
                              <span className="text-[8px] text-slate-400 font-bold block uppercase">Pauta AGT</span>
                              <span className="font-mono font-bold text-[11px] text-slate-800">{formatCurrency(breakdown.dutyAmount)}</span>
                            </div>
                            <div className="p-2.5 bg-slate-50/50 rounded-lg">
                              <span className="text-[8px] text-slate-400 font-bold block uppercase">Frete Marítimo</span>
                              <span className="font-mono font-bold text-[11px] text-slate-800">{formatCurrency(breakdown.shippingCost)}</span>
                            </div>
                            <div className="p-2.5 bg-slate-50/50 rounded-lg">
                              <span className="text-[8px] text-slate-400 font-bold block uppercase">Comissão ({Math.round(breakdown.commissionRate * 100)}%)</span>
                              <span className="font-mono font-bold text-[11px] text-slate-800">{formatCurrency(breakdown.commissionAmount)}</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t flex justify-between items-center text-slate-900">
                            <div>
                              <p className="font-extrabold text-[11px] text-slate-905">Total Estimado Chave na Mão</p>
                              <p className="text-[9px] text-emerald-600 font-semibold">Inclui desembaraço e transporte geral até Cabinda</p>
                            </div>
                            <span className="font-mono text-base font-black text-amber-700">{formatCurrency(breakdown.totalAmount)}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* DYNAMIC DISPATCHERS SECTOR - REQUIREMENT 2 */}
              <div className="sm:col-span-2 space-y-2">
                <label className="block text-xs font-bold text-slate-705">Escolha a Empresa de Despacho / Transportadora Marítima ou Aérea de sua preferência *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="client-carrier-selector">
                  {carriersList.map((c) => {
                    const isSelected = (newOrderForm.preferredCarrierId || carriersList[0]?.id) === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setNewOrderForm({ ...newOrderForm, preferredCarrierId: c.id });
                          speak(`Selecionou ${c.name} para despacho.`);
                        }}
                        className={`p-3.5 rounded-2xl text-left transition-all border flex flex-col justify-between cursor-pointer group ${
                          isSelected 
                            ? 'border-amber-400 bg-amber-50/20 ring-2 ring-amber-100' 
                            : 'border-slate-150 hover:border-slate-350 bg-white'
                        }`}
                        id={`carrier-select-card-${c.id}`}
                      >
                        <div className="flex items-center justify-between gap-2 w-full">
                          <div className="flex items-center gap-2">
                            <span className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                              <Truck className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-xs font-bold text-slate-800">{c.name}</span>
                          </div>
                          {isSelected && <span className="bg-amber-500 text-slate-950 font-black text-[10px] w-4 h-4 flex items-center justify-center rounded-full">✓</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2.5 flex justify-between w-full border-t border-slate-50 pt-1.5">
                          <span>Trânsito Médio: <strong>{c.expectedDays} {c.expectedDays === 1 ? 'dia' : 'dias'}</strong></span>
                          <span className="font-mono text-slate-600 font-semibold">{formatCurrency(c.baseRatePerKg)}/Kg</span>
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-705 mb-1.5 font-semibold">Observações, Instruções Especiais ou Voltagem</label>
                <textarea
                  value={newOrderForm.notes}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, notes: e.target.value })}
                  placeholder="Adicione voltagem (Ex: 220V), marca de preferência ou se a carga é volumosa..."
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-hidden"
                  rows={3}
                ></textarea>
              </div>

              <div className="sm:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-750 uppercase tracking-wider">Fotografias e Ficheiros do Produto ({tempPhotos.length} Anexados)</label>
                  {tempPhotos.length > 0 && (
                    <button 
                      type="button" 
                      onClick={() => setTempPhotos([])}
                      className="text-[10px] font-bold text-red-600 hover:underline"
                    >
                      Limpar Todos
                    </button>
                  )}
                </div>

                {/* Attached Micro Gallery Previews */}
                {tempPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-150">
                    {tempPhotos.map((photo, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm aspect-video h-20">
                        {photo.type === 'document' ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-1 bg-teal-950 text-teal-400">
                            <FileText className="w-5 h-5 mb-0.5" />
                            <p className="text-[8px] truncate font-bold w-full text-center px-1">{photo.name}</p>
                          </div>
                        ) : (
                          <img src={photo.url} className="w-full h-full object-cover" alt="Anexo" referrerPolicy="no-referrer" />
                        )}
                        <span className={`absolute top-1 left-1 px-1 py-0.5 text-[7px] font-bold uppercase rounded-md text-white bg-black/60`}>
                          {photo.type === 'camera' ? '📸 Cam' : photo.type === 'gallery' ? '🖼️ Galeria' : '📄 Doc'}
                        </span>
                        
                        {/* Remove attachment trigger */}
                        <button
                          type="button"
                          onClick={() => setTempPhotos(tempPhotos.filter((_, idx) => idx !== i))}
                          className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1 shadow-sm opacity-90 hover:scale-110 hover:opacity-100 transition-all cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl p-4 text-center text-slate-400">
                    <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                    <p className="text-xs text-slate-500 font-medium">Nenhum ficheiro ou fotografia anexada ainda.</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Clique no botão abaixo para mostrar exatamente o produto desejado e evitar erros comerciais.</p>
                  </div>
                )}

                {/* Master Add Attachment Action Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowPhotoOptions(!showPhotoOptions)}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    id="add-photo-master-btn"
                  >
                    <PlusCircle className="w-4 h-4 text-amber-400" />
                    Adicionar Foto do Produto
                  </button>

                  {/* Options Selector Panel */}
                  {showPhotoOptions && (
                    <div className="absolute left-0 right-0 mt-2 p-3 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 grid grid-cols-2 gap-2 animate-scale-up" id="product-photo-options-dropdown">
                      <button
                        type="button"
                        onClick={() => { setOrderCamActive(true); setShowPhotoOptions(false); }}
                        className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-800 transition-all cursor-pointer border border-slate-150"
                      >
                        <Camera className="w-4 h-4 text-slate-600" />
                        <span>📸 Tirar Foto com a Câmara</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setShowOrderGallery(true); setShowPhotoOptions(false); }}
                        className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-800 transition-all cursor-pointer border border-slate-150"
                      >
                        <Image className="w-4 h-4 text-slate-600" />
                        <span>🖼️ Escolher Foto da Galeria</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setShowOrderDocForm(true); setShowPhotoOptions(false); }}
                        className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-800 transition-all cursor-pointer border border-slate-150"
                      >
                        <FileText className="w-4 h-4 text-slate-600" />
                        <span>📄 Anexar Documento</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowPhotoOptions(false)}
                        className="p-3 bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center gap-1.5 text-xs font-black text-red-700 transition-all cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancelar</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* CAMERA SIMULATOR OVERLAY MODAL */}
                {orderCamActive && (
                  <div className="fixed inset-0 bg-slate-950/95 z-55 flex flex-col justify-between p-6 text-white animate-fade-in" id="order-camera-simulator">
                    <div className="flex justify-between items-center pb-2 border-b border-white/10">
                      <span className="font-extrabold text-xs uppercase tracking-wider text-red-500 flex items-center gap-2">
                        <Camera className="animate-pulse" />
                        Tirar Foto do Produto em Alta-Fidelidade
                      </span>
                      <button type="button" onClick={() => { setOrderCamActive(false); setOrderCamPreview(null); }} className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">✕ Sair</button>
                    </div>
                    
                    <div className="flex-1 my-6 flex items-center justify-center bg-black border border-white/5 rounded-2xl relative">
                      {orderCamCountdown !== null ? (
                        <span className="text-7xl font-extrabold text-amber-400 animate-ping">{orderCamCountdown}</span>
                      ) : orderCamPreview ? (
                        <img src={orderCamPreview} className="w-full h-full object-contain rounded-2xl" alt="Preview Visor" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="text-center p-6 space-y-2 select-none">
                          <Camera className="w-12 h-12 text-slate-500 mx-auto animate-bounce" />
                          <p className="text-xs text-slate-400">Direcione para o produto desejado física ou comercialmente.</p>
                        </div>
                      )}
                      <div className="absolute inset-6 border border-dashed border-white/20 rounded-2xl pointer-events-none animate-pulse"></div>
                    </div>

                    <div className="flex justify-center gap-4">
                      {orderCamPreview ? (
                        <>
                          <button type="button" onClick={() => setOrderCamPreview(null)} className="px-5 py-2.5 bg-slate-800 rounded-xl text-xs font-bold uppercase transition-transform active:scale-95">Repetir Captação</button>
                          <button 
                            type="button" 
                            onClick={() => {
                              setTempPhotos([...tempPhotos, { url: orderCamPreview, type: 'camera', name: `produto_camera_${Date.now()}.png` }]);
                              setOrderCamActive(false);
                              setOrderCamPreview(null);
                              speak("Foto com a câmara anexada com sucesso.");
                            }} 
                            className="px-6 py-2.5 bg-green-500 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition-transform active:scale-95"
                          >
                            ✓ Confirmar e Salvar Foto
                          </button>
                        </>
                      ) : (
                        <button 
                          type="button" 
                          onClick={() => {
                            setOrderCamCountdown(3);
                            const interval = setInterval(() => {
                              setOrderCamCountdown((curr) => {
                                if (curr === null || curr <= 1) {
                                  clearInterval(interval);
                                  const list = [
                                    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60',
                                    'https://images.unsplash.com/photo-1597484211616-3615260192b1?w=500&auto=format&fit=crop&q=60',
                                    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60',
                                    'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=500&auto=format&fit=crop&q=60'
                                  ];
                                  setOrderCamPreview(list[Math.floor(Math.random() * list.length)]);
                                  return null;
                                }
                                return curr - 1;
                              });
                            }, 800);
                          }} 
                          className="px-8 py-3 bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-extrabold rounded-full text-xs uppercase shadow-xl cursor-pointer"
                        >
                          📸 Capturar Foto de Visor
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* GALLERY SELECTION OVERLAY */}
                {showOrderGallery && (
                  <div className="fixed inset-0 bg-slate-950/85 z-55 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-900 animate-scale-up">
                      <div className="flex justify-between items-center border-b pb-2">
                        <h4 className="font-extrabold text-xs uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                          <Image className="w-5 h-5 text-sky-500" />
                          Escolher Foto da Galeria Local
                        </h4>
                        <button type="button" onClick={() => setShowOrderGallery(false)} className="text-xs font-bold text-slate-450 hover:text-slate-950">✕ Cancelar</button>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Selecione o produto abaixo para associar automaticamente ao seu pedido comercial:</p>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { name: 'Toyama Gerador Blue', url: 'https://images.unsplash.com/photo-1597484211616-3615260192b1?w=300&auto=format&fit=crop&q=60' },
                          { name: 'Laptop EliteBook Box', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=60' },
                          { name: 'Pedrollo Bomba d\'Agua', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=60' },
                          { name: 'Jogo de Pneus SUV 18', url: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=300&auto=format&fit=crop&q=60' }
                        ].map((itm, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setTempPhotos([...tempPhotos, { url: itm.url, type: 'gallery', name: `${itm.name.toLowerCase().replace(/\s+/g, '_')}.png` }]);
                              setShowOrderGallery(false);
                              speak(`${itm.name} associado à encomenda.`);
                            }}
                            className="p-1.5 border border-slate-200 rounded-xl hover:border-sky-500 bg-slate-50 hover:bg-sky-50/20 text-left transition-all cursor-pointer"
                          >
                            <img src={itm.url} className="w-full h-20 object-cover rounded-lg mb-1" alt={itm.name} referrerPolicy="no-referrer" />
                            <p className="text-[10px] font-bold text-slate-700 truncate text-center">{itm.name}</p>
                          </button>
                        ))}
                      </div>
                      <div className="border-t pt-3">
                        <button
                          type="button"
                          onClick={() => {
                            setTempPhotos([...tempPhotos, { url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&auto=format&fit=crop&q=60', type: 'gallery', name: `dispositivo_usuario_${Date.now()}.png` }]);
                            setShowOrderGallery(false);
                            speak("Ficheiro anexado da galeria.");
                          }}
                          className="w-full py-2.5 bg-slate-900 text-amber-400 font-extrabold rounded-xl text-xs uppercase hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          🖼️ Carregar Imagem Extra de Galeria
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* DOCUMENT FORM ATTACHMENT */}
                {showOrderDocForm && (
                  <div className="fixed inset-0 bg-slate-950/85 z-55 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-slate-900 animate-scale-up">
                      <div className="flex justify-between items-center border-b pb-2">
                        <h4 className="font-extrabold text-xs uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                          <FileText className="w-5 h-5 text-teal-500" />
                          Anexar PDF / Catálogo Técnico
                        </h4>
                        <button type="button" onClick={() => setShowOrderDocForm(false)} className="text-slate-400">✕</button>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo do Documento</label>
                        <input
                          type="text"
                          value={orderDocName}
                          onChange={(e) => setOrderDocName(e.target.value)}
                          placeholder="Ex: fatura_proforma_original.pdf"
                          className="w-full text-xs p-2.5 border rounded-xl"
                        />
                      </div>
                      <div className="flex justify-end gap-2 text-xs pt-2">
                        <button type="button" onClick={() => setShowOrderDocForm(false)} className="px-4 py-2 border rounded-xl hover:bg-slate-50 cursor-pointer">Cancelar</button>
                        <button
                          type="button"
                          onClick={() => {
                            if (orderDocName.trim()) {
                              setTempPhotos([...tempPhotos, { url: '#document_pdf_file', type: 'document', name: orderDocName.trim() }]);
                              setOrderDocName('');
                              setShowOrderDocForm(false);
                              speak("Documento de especificações técnicas anexado à compra.");
                            }
                          }}
                          className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold cursor-pointer"
                        >
                          Anexar Documento
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-105 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setCurrentView('inicio'); speak("Ação cancelada."); }}
                className="px-4 py-2 text-xs border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs px-5 py-2.5 rounded-xl font-bold transition-all cursor-pointer shadow-md"
              >
                Registar Encomenda no Mediador
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3) ACOMPANHAR PEDIDO (ACTIVE ORDER TRACKING ENGINE & CHAT) */}
      {currentView === 'acompanhar-pedido' && (
        <div className="space-y-4 animate-fade-in" id="acompanhar-pedido-screen">
          
          {/* Quick Tracking Code Search Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <span>🔍</span> Rastreio Rápido por Código Oficial
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">
                  Insira o código de encomenda (ex: <strong>MED-1001</strong>) ou o número de Guia AGT (ex: <strong>GUI-CB-84920</strong>) para localizar o lote imediatamente.
                </p>
              </div>
              <span className="text-[9px] bg-amber-50 text-amber-850 font-black px-2.5 py-1 rounded-full border border-amber-200 shrink-0 self-start sm:self-auto">
                ⚡ 9 Etapas em Tempo Real
              </span>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={trackingSearchCode}
                onChange={(e) => {
                  const val = e.target.value;
                  setTrackingSearchCode(val);
                  if (val.trim()) {
                    const match = orders.find(o => 
                      o.id.toLowerCase().includes(val.trim().toLowerCase()) || 
                      (o.shippingGuideNumber && o.shippingGuideNumber.toLowerCase().includes(val.trim().toLowerCase())) ||
                      o.productName.toLowerCase().includes(val.trim().toLowerCase())
                    );
                    if (match) {
                      setSelectedOrderId(match.id);
                    }
                  }
                }}
                placeholder="Insira o código MED-XXXX ou nº de Guia..."
                className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-850 focus:outline-hidden focus:border-amber-400 focus:bg-white transition-colors"
                id="quick-tracking-search-input"
              />
              {trackingSearchCode && (
                <button
                  type="button"
                  onClick={() => setTrackingSearchCode('')}
                  className="absolute right-3 top-2.5 text-[10px] text-slate-400 hover:text-slate-600 font-bold"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Orders checklist sidebar */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Minhas Encomendas</h3>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono font-bold">
                  {clientOrders.length} lotes
                </span>
              </div>
              
              {clientOrders.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-8 text-center text-slate-400">
                  <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-750">Não possui encomendas</p>
                  <button 
                    onClick={() => setCurrentView('fazer-pedido')} 
                    className="mt-3 bg-amber-400 text-slate-950 font-bold px-4 py-1.5 rounded-xl text-xs cursor-pointer"
                  >
                    Fazer Meu Primeiro Pedido
                  </button>
                </div>
              ) : (
                clientOrders
                  .filter(ord => !trackingSearchCode.trim() || 
                    ord.id.toLowerCase().includes(trackingSearchCode.toLowerCase()) || 
                    ord.productName.toLowerCase().includes(trackingSearchCode.toLowerCase()) ||
                    (ord.shippingGuideNumber && ord.shippingGuideNumber.toLowerCase().includes(trackingSearchCode.toLowerCase()))
                  )
                  .map((ord) => {
                    const statusDetails = getStatusLabelAndColor(ord.status);
                    const isSelected = selectedOrderId === ord.id;
                    return (
                      <div
                        key={ord.id}
                        onClick={() => {
                          setSelectedOrderId(ord.id);
                          setOrderDetailTab('tracker');
                          speak(`A carregar progresso da carga ${ord.id}`);
                        }}
                        className={`w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden cursor-pointer flex flex-col gap-2 ${
                          isSelected 
                            ? 'bg-amber-50/40 border-amber-400 ring-2 ring-amber-100' 
                            : 'bg-white border-slate-100 hover:border-slate-300'
                        }`}
                        id={`order-card-item-${ord.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono font-black text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded-md">{ord.id}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                                  navigator.clipboard.writeText(ord.id);
                                }
                                showModalAlert('Código Copiado', `O código de rastreio ${ord.id} foi copiado para a sua área de transferência!`, 'info');
                              }}
                              className="text-[9px] text-slate-400 hover:text-slate-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded cursor-pointer font-bold"
                              title="Copiar Código"
                            >
                              📋
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(ord.createdAt).toLocaleDateString('pt-AO')}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-800 truncate">{ord.productName}</h4>
                        
                        <div className="flex justify-between items-center mt-1 pt-2 border-t border-slate-50 text-[10px]">
                          <span className="font-semibold text-slate-700">Qtd: {ord.quantity}</span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full border font-extrabold ${statusDetails?.color}`}>
                            {statusDetails?.label}
                          </span>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Active order detailed view */}
            <div className="lg:col-span-8">
              {activeOrder ? (
                <div className="bg-white border border-slate-150 rounded-3xl shadow-xs overflow-hidden">
                  
                  {/* Detailed Box Header */}
                  <div className="bg-slate-50 p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 bg-slate-900 text-amber-400 px-2.5 py-1 rounded-lg">
                          <span className="text-[9px] font-sans font-bold uppercase text-slate-400">Código:</span>
                          <h3 className="text-xs font-mono font-black">{activeOrder.id}</h3>
                          <button
                            type="button"
                            onClick={() => {
                              if (typeof navigator !== 'undefined' && navigator.clipboard) {
                                navigator.clipboard.writeText(activeOrder.id);
                              }
                              showModalAlert('Código de Rastreio Copiado', `O código oficial ${activeOrder.id} foi copiado para a sua área de transferência!`, 'info');
                            }}
                            className="text-[9px] text-white hover:text-amber-300 font-bold px-1"
                            title="Copiar Código de Rastreio"
                          >
                            📋
                          </button>
                        </div>

                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${getStatusLabelAndColor(activeOrder.status)?.color}`}>
                          {getStatusLabelAndColor(activeOrder.status)?.label}
                        </span>

                        {activeOrder.shippingGuideNumber && (
                          <span className="text-[9px] font-mono bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded-full font-bold">
                            Guia AGT: {activeOrder.shippingGuideNumber}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1.5">{activeOrder.productName}</h4>
                      <p className="text-[10px] text-slate-500">Fornecedor Luanda: {activeOrder.supplierName}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Custo Total Intermediação</p>
                      <p className="text-base font-extrabold text-slate-900">{formatCurrency(activeOrder.totalAmount || getEstimatedFreight())}</p>
                      <span className="text-[10px] font-bold text-amber-600 block mt-0.5">
                        {activeOrder.paid ? '✅ Pagamento Validado' : '⏳ Aguardando Orçamento'}
                      </span>
                    </div>
                  </div>

                  {/* Sub-tabs within tracker */}
                  <div className="flex border-b border-slate-150 bg-slate-50/50 text-xs">
                    <button
                      onClick={() => setOrderDetailTab('tracker')}
                      className={`flex-1 py-3 text-center border-b-2 font-bold cursor-pointer ${
                        orderDetailTab === 'tracker' ? 'border-amber-400 text-slate-900 bg-white' : 'border-transparent text-slate-500'
                      }`}
                    >
                      1. Progresso Logístico
                    </button>
                    <button
                      onClick={() => {
                        if (activeOrder.status === 'RECEBIDO' || activeOrder.status === 'ANALISE') {
                          showModalAlert(
                            'Orçamento em Preparação',
                            `O orçamento comercial detalhado está atualmente a ser calculado e revisto pelo Mediador Cabinda.\n\nEncontramos-nos a aferir as taxas alfandegárias da AGT e tarifas preferenciais dos despachantes. Notificá-lo-emos assim que estiver concluído.`,
                            'info'
                          );
                          return;
                        }
                        setOrderDetailTab('budget');
                      }}
                      className={`flex-1 py-3 text-center border-b-2 font-bold cursor-pointer ${
                        activeOrder.status === 'RECEBIDO' || activeOrder.status === 'ANALISE' ? 'opacity-40 cursor-not-allowed text-slate-400' : ''
                      } ${
                        orderDetailTab === 'budget' ? 'border-amber-400 text-slate-900 bg-white' : 'border-transparent text-slate-500'
                      }`}
                    >
                      2. Orçamento & Compra
                    </button>
                    <button
                      onClick={() => setOrderDetailTab('chat')}
                      className={`flex-1 py-3 text-center border-b-2 font-bold cursor-pointer ${
                        orderDetailTab === 'chat' ? 'border-amber-400 text-slate-900 bg-white' : 'border-transparent text-slate-500'
                      }`}
                    >
                      3. Chat de Conversa
                    </button>
                  </div>

                  {/* Sub-tab 1: Sequential tracker */}
                  {orderDetailTab === 'tracker' && (
                    <div className="p-6 space-y-6">
                      
                      {/* Interactive Simulation Dashboard for Step-by-Step Evolution */}
                      <div className="p-4 bg-amber-50/25 border border-dashed border-amber-300 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-800 shadow-2xs" id="interactive-step-tracker-simulator">
                        <div className="space-y-1 text-left">
                          <p className="text-[10px] text-amber-850 font-black tracking-widest uppercase flex items-center gap-1">
                            <span>🎮</span> Painel Simulador de Evolução de Cargas
                          </p>
                          <h5 className="font-bold text-xs text-slate-800">
                            Quer simular o passo a passo da intermediação comercial?
                          </h5>
                          <p className="text-[9px] text-slate-500 font-semibold leading-normal">
                            Como cliente ou gestor, você pode avançar o estado logístico desta carga em Luanda para ver todo o fluxo fiscal, faturamento aduaneiro e as conquistas no mapa de rotas em tempo real.
                          </p>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => {
                            const orderList: OrderStatus[] = [
                              'RECEBIDO', 'ANALISE', 'ORCADO', 'PAGO', 
                              'COMPRADO', 'TRANSPORTE', 'CABINDA', 
                              'LEVANTAMENTO', 'ENTREGUE'
                            ];
                            const currIdx = orderList.indexOf(activeOrder.status);
                            let nextStatus: OrderStatus = 'RECEBIDO';
                            if (currIdx !== -1 && currIdx < orderList.length - 1) {
                              nextStatus = orderList[currIdx + 1];
                            } else {
                              nextStatus = 'RECEBIDO'; // Reset cycle
                            }
                            
                            // For certain stages, flag paid
                            const isPaid = ['PAGO', 'COMPRADO', 'TRANSPORTE', 'CABINDA', 'LEVANTAMENTO', 'ENTREGUE'].includes(nextStatus);
                            
                            onUpdateOrder({
                              ...activeOrder,
                              status: nextStatus,
                              paid: isPaid,
                              totalAmount: activeOrder.totalAmount || 185000 // Ensure some simulated pricing
                            });
                            
                            const audioPhrases: Record<OrderStatus, string> = {
                              RECEBIDO: "Pedido reiniciado e registado com sucesso no ecossistema do Mediador Cabinda.",
                              ANALISE: "Registo atualizado para análise de fornecedores em Luanda. Estamos a localizar o produto de forma física e fiscal.",
                              ORCADO: "O orçamento preferencial de frete e alfândega AGT foi gerado com êxito.",
                              PAGO: "Pagamento recebido via Multicaixa e fatura comercial autenticada.",
                              COMPRADO: "Mercadoria física adquirida diretamente em Luanda pela agência do Mediador.",
                              TRANSPORTE: "Artigo embarcado nos contentores de cabotagem aérea e marítima com destino ao porto de Cabinda.",
                              CABINDA: "Cargas descarregadas com total segurança no polo central de entrega em Cabinda.",
                              LEVANTAMENTO: "O seu artigo está pronto para levantamento ao domicílio ou balcão geral.",
                              ENTREGUE: "Intermediação concluída com sucesso absoluto. Obrigado por confiar no Mediador Cabinda!"
                            };
                            
                            speak(audioPhrases[nextStatus]);
                            showModalAlert(
                              "Simulação de Passo", 
                              `Pedido avançou para o estado: "${getStatusLabelAndColor(nextStatus)?.label}". \n\nOs estados, faturas, ordens de embarque e painéis operacionais foram atualizados com sucesso.`, 
                              "success"
                            );
                          }}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 transition-all flex items-center justify-center gap-1.5 shadow-xs active:scale-95 cursor-pointer font-sans"
                        >
                          Simular Próximo Passo 🚀
                        </button>
                      </div>

                      {/* VISUAL INTERACTIVE COASTLINE SHIP ROUTE MAP */}
                      {(() => {
                        const statusSteps: OrderStatus[] = [
                          'RECEBIDO', 'ANALISE', 'ORCADO', 'PAGO', 
                          'COMPRADO', 'TRANSPORTE', 'CABINDA', 
                          'LEVANTAMENTO', 'ENTREGUE'
                        ];
                        const sIdx = statusSteps.indexOf(activeOrder.status);
                        const progressFraction = sIdx === -1 ? 0 : sIdx / (statusSteps.length - 1);
                        
                        // We trace physical points along the Angolan Atlantic coastline to Cabinda
                        // Bottom (Y=240, X=160) - Luanda
                        // Middle curve (Y=130, X=90) - Atlantic transit offshore
                        // Top (Y=30, X=110) - Cabinda exclave
                        const p0 = { x: 160, y: 220 };
                        const p1 = { x: 60, y: 125 };
                        const p2 = { x: 110, y: 30 };
                        const t = progressFraction;
                        const vesselX = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
                        const vesselY = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;

                        const isAirCarrier = activeOrder.shippingCarrier?.toLowerCase().includes('aér') || 
                                              activeOrder.shippingCarrier?.toLowerCase().includes('voo') ||
                                              activeOrder.shippingCarrier?.toLowerCase().includes('air');

                        return (
                          <div className="bg-slate-900 border border-slate-950 rounded-3xl p-5 text-white/90 relative overflow-hidden shadow-sm" id="coastal-transit-map">
                            {/* Water ambient waves simulation backgrounds */}
                            <div className="absolute inset-0 bg-sky-950/10 pointer-events-none bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>

                            <div className="relative z-10 flex flex-col md:flex-row items-stretch gap-5">
                              {/* Visual Map Area */}
                              <div className="flex-1 min-h-[260px] bg-slate-950/80 rounded-2xl border border-slate-800 p-3 relative flex items-center justify-center">
                                <svg className="w-full h-[230px] overflow-visible" viewBox="0 0 280 240">
                                  {/* Map grid coordinate details */}
                                  <text x="10" y="18" className="fill-slate-600 font-mono text-[8px] select-none">05° 32' S (CABINDA)</text>
                                  <text x="10" y="222" className="fill-slate-600 font-mono text-[8px] select-none">08° 50' S (LUANDA)</text>
                                  <text x="210" y="115" className="fill-slate-600 font-mono text-[8px] [writing-mode:vertical-lr] select-none">OCEANO ATLÂNTICO</text>

                                  {/* Landmass shapes (simulated via decorative path representation) */}
                                  <path d="M 190 0 L 280 0 L 280 240 L 210 240 Q 155 200 180 160 Q 200 110 145 90 T 160 30 Q 200 5 190 0 Z" className="fill-slate-900/50 stroke-slate-800/60 stroke-1" />

                                  {/* Coastline Maritime / Flight Cabotage route line */}
                                  <path d={`M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`} fill="none" stroke="#1e3a8a" strokeWidth="2" strokeDasharray="4,4" className="opacity-70" />
                                  
                                  {/* Active transit tracking neon glow line */}
                                  {t > 0 && (
                                    <path 
                                      d={`M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`} 
                                      fill="none" 
                                      stroke="#f59e0b" 
                                      strokeWidth="2.5" 
                                      strokeDasharray="200"
                                      strokeDashoffset={200 * (1 - t)}
                                      className="transition-all duration-1000 ease-out shadow-lg" 
                                    />
                                  )}

                                  {/* Start Node: Luanda */}
                                  <g transform={`translate(${p0.x}, ${p0.y})`}>
                                    <circle r="6" className="fill-blue-500/30 animate-pulse" />
                                    <circle r="3.5" className="fill-blue-500 stroke-slate-950 stroke-2" />
                                    <text x="10" y="3" className="fill-slate-300 font-sans font-black text-[8px] select-none">LUANDA (Hub)</text>
                                  </g>

                                  {/* End Node: Cabinda exclave */}
                                  <g transform={`translate(${p2.x}, ${p2.y})`}>
                                    <circle r="6" className="fill-amber-500/30 animate-pulse" />
                                    <circle r="3.5" className="fill-amber-400 stroke-slate-950 stroke-2" />
                                    <text x="10" y="3" className="fill-amber-400 font-sans font-black text-[8px] select-none tracking-wide">CABINDA (Destino)</text>
                                  </g>

                                  {/* Moving cargo vessel/airplane indicator according to transport status */}
                                  <g transform={`translate(${vesselX}, ${vesselY})`} className="transition-all duration-1000">
                                    <circle r="10" className="fill-amber-400/20 animate-ping animate-duration-1500" />
                                    <circle r="6" className="fill-amber-500 stroke-slate-950 stroke-1.5" />
                                    
                                    <text y="3" textAnchor="middle" className="text-[10px] select-none cursor-default">
                                      {isAirCarrier ? '✈️' : '🚢'}
                                    </text>
                                    
                                    {/* Floating percent label */}
                                    <rect x="-24" y="-18" width="48" height="11" rx="3" className="fill-slate-950/90 stroke-slate-800" />
                                    <text y="-10" textAnchor="middle" fill="#fbbf24" className="font-extrabold font-mono text-[6px]">
                                      {Math.round(t * 100)}% MARÍTIMO
                                    </text>
                                  </g>
                                </svg>
                              </div>

                              {/* Navigation info card */}
                              <div className="w-full md:w-48 flex flex-col justify-between text-left space-y-4">
                                <div className="space-y-1.5">
                                  <span className="bg-amber-400 text-slate-950 font-black text-[8px] px-2 py-0.5 rounded-sm uppercase tracking-wider block w-max">
                                    MONITORIZADOR DE CABOTAGEM
                                  </span>
                                  <h4 className="font-bold text-xs text-white">Canal Luanda — Cabinda</h4>
                                  <p className="text-[10px] text-slate-400 leading-normal font-sans">
                                    O transporte marítimo de cabotagem conecta Luanda ao enclave de Cabinda (380 km), contornando as barreiras rodoviárias e garantindo a legalização fiscal ideal perante a AGT.
                                  </p>
                                </div>

                                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1 font-mono text-[8px]">
                                  <p className="flex justify-between">
                                    <span className="text-slate-500">Operador Cargo:</span>
                                    <span className="text-amber-400 font-bold font-sans truncate max-w-[100px]">{activeOrder.shippingCarrier || "Despachante"}</span>
                                  </p>
                                  <p className="flex justify-between">
                                    <span className="text-slate-500">Vetor Carga:</span>
                                    <span className="text-white font-sans font-semibold">{isAirCarrier ? "Aéreo Rápido" : "Marítimo Seguro"}</span>
                                  </p>
                                  <p className="flex justify-between">
                                    <span className="text-slate-500">Polo Entrega:</span>
                                    <span className="text-emerald-400 font-bold font-sans">B° 1º de Maio, Cabinda</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                       <div className="relative">
                        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-100"></div>
                        <div className="space-y-5 relative">
                          {getTrackingSteps(activeOrder).map((step, idx) => {
                            const curIdx = getCurrentStatusIndex(activeOrder.status, activeOrder);
                            const isDone = idx < curIdx;
                            const isCurrent = idx === curIdx;
                            return (
                              <div key={idx} className="flex gap-4 items-start text-xs">
                                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 z-10 font-bold ${
                                  isDone ? 'bg-sky-600 border-sky-500 text-white' : isCurrent ? 'bg-amber-400 border-amber-500 text-slate-950' : 'bg-white border-slate-200 text-slate-400'
                                }`}>
                                  {isDone ? '✓' : idx + 1}
                                </div>
                                <div className="pt-1 select-none">
                                  <h5 className={`font-bold ${isCurrent ? 'text-amber-600 text-sm' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>{step.title}</h5>
                                  <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Complaint / Rating integration on Complete */}
                      {activeOrder.status === 'ENTREGUE' && (
                        <div className="mt-8 border-t pt-5 space-y-4">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            Avaliação e Reclamação Legal
                          </h4>

                          {activeOrder.rating ? (
                            <div className="p-4 bg-teal-50 border border-teal-150 rounded-2xl text-xs space-y-1">
                              <p className="font-bold text-teal-800">Avaliado!</p>
                              <p>Nota: {activeOrder.rating}/5 Estrelas</p>
                              <p>Comentário: "{activeOrder.feedback}"</p>
                            </div>
                          ) : (
                            <form onSubmit={handleSubmitEvaluation} className="bg-slate-50 p-4 border rounded-2xl space-y-3 text-xs">
                              <p className="font-bold text-slate-700">Avalie a qualidade da intermediação:</p>
                              <div className="flex gap-1.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <button key={s} type="button" onClick={() => setRating(s)}>
                                    <Star className={`w-6 h-6 ${s <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                                  </button>
                                ))}
                              </div>
                              <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Insira o seu comentário sobre a rapidez e estado do produto..."
                                className="w-full text-xs p-2 border bg-white rounded-lg"
                                rows={2}
                              />
                              <button type="submit" className="bg-slate-900 text-white font-bold px-4 py-1.5 rounded-xl">Enviar Avaliação</button>
                            </form>
                          )}
                        </div>
                      )}

                      {/* Attached Product Photos History Lookup */}
                      {activeOrder.productPhotos && activeOrder.productPhotos.length > 0 && (
                        <div className="mt-6 border-t border-slate-100 pt-5 space-y-3" id="client-order-photos-history">
                          <h4 className="text-xs font-bold text-slate-850 uppercase tracking-widest flex items-center gap-1.5">
                            <Image className="w-4 h-4 text-amber-500" />
                            Anexos e Fotos Desta Encomenda ({activeOrder.productPhotos.length})
                          </h4>
                          <p className="text-[11px] text-slate-500">Histórico de especificações visuais guardadas para a conferência logística e fiscal aduaneira:</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {activeOrder.productPhotos.map((p, pIdx) => (
                              <div key={pIdx} className="border border-slate-150 rounded-xl overflow-hidden bg-slate-50 text-xs shadow-xs relative">
                                {p.type === 'document' ? (
                                  <div className="h-24 bg-teal-900/10 text-teal-800 flex flex-col items-center justify-center p-3">
                                    <FileText className="w-7 h-7 text-teal-600 mb-1" />
                                    <span className="font-extrabold text-[9px] truncate w-full text-center">{p.name}</span>
                                  </div>
                                ) : (
                                  <div className="h-24 bg-slate-900 overflow-hidden relative group">
                                    <img src={p.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={p.name} referrerPolicy="no-referrer" />
                                    <span className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[8px] font-bold text-white uppercase">{p.type === 'camera' ? 'Câmara' : 'Galeria'}</span>
                                  </div>
                                )}
                                <div className="p-1 px-2 border-t text-[9px] text-slate-500 flex justify-between items-center bg-white">
                                  <span className="truncate font-medium">{p.name}</span>
                                  <button onClick={() => showModalAlert('Sincronização de Ficheiros', `O documento "${p.name}" foi descarregado a partir do terminal seguro do Mediador Cabinda. Verifique o seu diretório local de descargas.`, 'success')} className="text-sky-600 hover:underline">Baixar</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                  {/* Sub-tab 2: Budget detail & Checkout simulation */}
                  {orderDetailTab === 'budget' && (
                    <div className="p-6 space-y-5">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Orçamento do Despacho & Freight para Cabinda</h4>
                      
                      <div className="p-4 border rounded-2xl bg-slate-50 space-y-3 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Valor Comercial em Luanda</span>
                          <span className="font-mono font-bold text-slate-800">{formatCurrency(activeOrder.budgetRawPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Custo do Trânsito Marítimo/Aéreo</span>
                          <span className="font-mono font-bold text-slate-800">{formatCurrency(activeOrder.budgetShipping)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Taxa Despacho Aduaneiro</span>
                          <span className="font-mono font-bold text-slate-800">{formatCurrency(activeOrder.dispatchFee)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Taxa de Intermediação ({((activeOrder.commissionRate || 0.12) * 100).toFixed(0)}%)</span>
                          <span className="font-mono font-bold text-slate-800">{formatCurrency(activeOrder.commissionAmount)}</span>
                        </div>
                        <div className="border-t pt-3 flex justify-between font-extrabold text-sm text-slate-900">
                          <span>Montante Total do Pedido</span>
                          <span className="font-mono text-amber-700 text-base">{formatCurrency(activeOrder.totalAmount)}</span>
                        </div>
                      </div>

                      {/* Interactive Trigger for the Printable Cabotage Manifesto Document */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowCabotageSlip(true);
                          speak("A abrir Fatura Pró-Forma Corporativa e Guia Oficial de Cabotagem.");
                        }}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-950 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-450" />
                        Ver Guia de Cabotagem & Fatura Pró-Forma Oficial 📄
                      </button>

                      {activeOrder.paid ? (
                        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl text-xs space-y-1">
                          <p className="font-semibold flex items-center gap-1">💸 Pagamento Validado com Sucesso</p>
                          <p><strong>Método:</strong> {activeOrder.paymentMethod === 'multicaixa' ? 'Multicaixa Express' : 'Transferência para o BAI'}</p>
                          <p><strong>Referência:</strong> {activeOrder.paymentReference}</p>
                        </div>
                      ) : (
                        <div className="space-y-4 text-xs">
                          <label className="block font-bold text-slate-700">Forma de Pagamento</label>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button" 
                              onClick={() => setPaymentMethod('multicaixa')}
                              className={`p-3 rounded-xl border text-center font-bold cursor-pointer ${paymentMethod === 'multicaixa' ? 'bg-amber-100 border-amber-400 text-slate-950 font-semibold' : 'bg-white'}`}
                            >
                              MC Express
                            </button>
                            <button
                              type="button" 
                              onClick={() => setPaymentMethod('transferencia')}
                              className={`p-3 rounded-xl border text-center font-bold cursor-pointer ${paymentMethod === 'transferencia' ? 'bg-amber-100 border-amber-400 text-slate-950' : 'bg-white'}`}
                            >
                              Transf. BAI
                            </button>
                            <button
                              type="button" 
                              onClick={() => setPaymentMethod('referencia')}
                              className={`p-3 rounded-xl border text-center font-bold cursor-pointer ${paymentMethod === 'referencia' ? 'bg-amber-100 border-amber-400 text-slate-950 font-semibold' : 'bg-white'}`}
                            >
                              Ref. Pagam.
                            </button>
                          </div>

                          <div className="bg-slate-50 border p-4 rounded-xl">
                            {paymentMethod === 'multicaixa' ? (
                              <div className="space-y-2">
                                <p className="text-slate-500 font-semibold text-[11px]">Introduza o nº de telemóvel associado à sua conta Multicaixa Express (ex: 942043293):</p>
                                <input 
                                  type="text" 
                                  value={mcExpressPhone}
                                  onChange={(e) => setMcExpressPhone(e.target.value)}
                                  placeholder="942 043 293" 
                                  className="w-full p-2 border bg-white rounded-lg font-mono text-xs" 
                                />
                              </div>
                            ) : paymentMethod === 'transferencia' ? (
                              <div className="space-y-1">
                                <p className="text-slate-500 text-[11px]">Transfira o total para a conta oficial do Mediador Cabinda:</p>
                                <p className="font-mono text-xs bg-white p-2.5 rounded-lg border text-slate-800">
                                  <strong>IBAN Oficial:</strong> AO06 0006 0000 01307638301 95
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <p className="text-slate-500 text-[11px]">Pagamento de Serviço por Referência:</p>
                                <p className="font-mono text-xs bg-white p-2 rounded-lg border"><strong>Entidade:</strong> 11299<br/><strong>Referência:</strong> 901 234 455</p>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={handleProcessPayment}
                            disabled={isPaying}
                            className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-slate-955 rounded-xl font-bold transition-all shadow-sm"
                          >
                            {isPaying ? 'Processando...' : 'Aprovar Pagamento Simulado'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-tab 3: Chat with manager */}
                  {orderDetailTab === 'chat' && (
                    <div className="p-2 sm:p-6 space-y-3 sm:space-y-4 max-w-full overflow-hidden">
                      <h4 className="text-xs font-bold text-slate-750 uppercase tracking-wider">Apoio Direto da Carga</h4>
                      <SharedChat
                        order={activeOrder}
                        currentUserRole="client"
                        messages={messages}
                        clientId={activeClientId}
                        clients={clients}
                        orders={orders}
                        onSendMessage={(t, attach, isPri, sendr, chanId) => onSendMessage(chanId || activeOrder?.id || 'general', t, attach, isPri, sendr)}
                        onMarkChannelAsRead={onMarkChannelAsRead}
                        onBack={() => setOrderDetailTab('tracker')}
                      />
                    </div>
                  )}

                </div>
              ) : (
                <div className="bg-white border rounded-3xl p-12 text-center text-slate-400">
                  <ShoppingBag className="w-12 h-12 text-slate-250 mx-auto mb-2" />
                  <p className="text-sm font-semibold">Nenhum pedido ativo selecionado.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 4) CADASTRO (REGISTRATION PAGE) */}
      {currentView === 'cadastro' && (
        <div className="max-w-2xl mx-auto bg-white border-0 sm:border border-slate-150 rounded-none sm:rounded-3xl p-4 sm:p-6 shadow-none sm:shadow-sm animate-fade-in" id="cadastro-form-screen">
          <div className="flex items-center gap-3 border-b pb-3 mb-6">
            <div className="bg-amber-100 text-slate-900 p-2.5 rounded-xl">
              <User className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-slate-900">Registrar Conta no Mediador Cabinda</h3>
              <p className="text-xs text-slate-500 font-medium">Cadastre-se com facilidade para iniciar sua ponte comercial Luanda-Cabinda.</p>
            </div>
          </div>

          {signupSuccess ? (
            <div className="bg-green-50 border border-green-205 text-green-800 p-8 rounded-2xl text-center space-y-2">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
              <h4 className="text-base font-bold">Cadastro Realizado com Sucesso!</h4>
              <p className="text-xs">O seu perfil de cliente Standard foi configurado e logado automaticamente.</p>
            </div>
          ) : (
            <form onSubmit={handleClientSignup} className="space-y-6 text-xs">
              
              {/* Personal Data */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">1. Dados Pessoais</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      placeholder="Bartolomeu Cabinda da Cunha"
                      className="w-full p-2.5 border rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Telemóvel (WhatsApp) *</label>
                    <input
                      type="text"
                      value={signupForm.phone}
                      onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                      placeholder="+244 923 000 000"
                      className="w-full p-2.5 border rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Correio Eletrónico (E-mail)</label>
                    <input
                      type="email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      placeholder="exemplo@gmail.com"
                      className="w-full p-2.5 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">NIF / Bilhete de Identidade (BI)</label>
                    <input
                      type="text"
                      value={signupForm.nif}
                      onChange={(e) => setSignupForm({ ...signupForm, nif: e.target.value })}
                      placeholder="002345090CA088"
                      className="w-full p-2.5 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Senha de Acesso *</label>
                    <input
                      type="password"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full p-2.5 border rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Confirmar Senha *</label>
                    <input
                      type="password"
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full p-2.5 border rounded-xl"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Address details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">2. Endereço Principal de Logística</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Província *</label>
                    <select
                      value={signupForm.province}
                      onChange={(e) => setSignupForm({ ...signupForm, province: e.target.value, municipality: MUNICIPALITIES[e.target.value]?.[0] || '' })}
                      className="w-full p-2.5 border rounded-xl bg-white"
                    >
                      {PROVINCES_OF_ANGOLA.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Município *</label>
                    <select
                      value={signupForm.municipality}
                      onChange={(e) => setSignupForm({ ...signupForm, municipality: e.target.value })}
                      className="w-full p-2.5 border rounded-xl bg-white"
                    >
                      {(MUNICIPALITIES[signupForm.province] || ['Sede']).map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Bairro *</label>
                    <input
                      type="text"
                      value={signupForm.bairro}
                      onChange={(e) => setSignupForm({ ...signupForm, bairro: e.target.value })}
                      placeholder="Ex: Bairro Resistência"
                      className="w-full p-2.5 border rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Rua / Casa nº *</label>
                    <input
                      type="text"
                      value={signupForm.rua}
                      onChange={(e) => setSignupForm({ ...signupForm, rua: e.target.value })}
                      placeholder="Ex: Rua Direita, Vivenda Amarela"
                      className="w-full p-2.5 border rounded-xl"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Documentation uploads */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">3. Documentação Anexa (Opcional inicialmente)</h4>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Introduza a fotografia do seu Bilhete de Identidade para aprovações fiscais imediatas:</label>
                  <div className="border border-dashed border-slate-250 bg-slate-50/50 hover:bg-slate-50 rounded-2xl p-4 text-center text-slate-400 cursor-pointer">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 mb-1.5" />
                    <p className="text-[11px] text-slate-600 font-semibold">Simular fotografia do Bilhete / Cartão NIF</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Formatos suportados: PNG, JPG, PDF</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentView('inicio')}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl font-bold shadow-md"
                >
                  Concluir Cadastro & Criar Conta de Cliente
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* 5) ENTRAR (SWITCH ROLES / PROFILES SWITCHER) */}
      {currentView === 'entrar' && (
        <div className="max-w-xl mx-auto bg-white border-0 sm:border border-slate-150 rounded-none sm:rounded-3xl p-4 sm:p-6 shadow-none sm:shadow-sm animate-fade-in" id="entrar-profile-screen">
          <div className="border-b pb-3 mb-5">
            <h3 className="text-base font-bold text-slate-900">Selecionador de Conta de Cliente (Simulação)</h3>
            <p className="text-xs text-slate-500">Escolha um dos clientes no repositório para simular ordens, points, faturas e rotas.</p>
          </div>

          <div className="space-y-3">
            {clients.map((c) => {
              const isCurrent = c.id === activeClientId;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    onSetClient(c.id);
                    setCurrentView('inicio');
                  }}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between gap-4 transition-all hover:bg-slate-50 relative ${
                    isCurrent ? 'bg-amber-50/40 border-amber-400 ring-2 ring-amber-100' : 'bg-white border-slate-105'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
                      {c.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{c.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{c.email} • {c.phone}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-100/40 px-2 py-0.5 rounded-full">{c.tier}</span>
                </button>
              );
            })}

            <button
              onClick={() => setCurrentView('cadastro')}
              className="w-full py-3 border border-dashed border-slate-200 hover:border-slate-400 rounded-2xl text-center text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Não tem conta? Faça Cadastro de novo cliente aqui
            </button>
          </div>
        </div>
      )}

      {/* 6) MINHA CONTA (PROFILE MODIFICATION) */}
      {currentView === 'minha-conta' && (
        <div className="max-w-2xl mx-auto bg-white border-0 sm:border border-slate-150 rounded-none sm:rounded-3xl p-4 sm:p-6 shadow-none sm:shadow-sm animate-fade-in" id="minha-conta-screen">
          <div className="flex items-center gap-3 border-b pb-3 mb-6">
            <User className="w-6 h-6 text-slate-805" />
            <div>
              <h3 className="text-lg font-bold font-display text-slate-900">Minha Conta & Perfil de Cliente</h3>
              <p className="text-xs text-slate-500">Configure seus dados de entrega, altere senhas e adicione fotografias.</p>
            </div>
          </div>

          {profileMsg && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl font-bold mb-4">{profileMsg}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs">
            
            {/* Left side profile photo upload option */}
            <div className="md:col-span-4 text-center space-y-3">
              <div className="w-24 h-24 rounded-2xl bg-slate-100 border border-slate-300 mx-auto flex items-center justify-center relative overflow-hidden group shadow-sm transition-all hover:bg-slate-150">
                {profilePicture ? (
                  <img src={profilePicture} className="w-full h-full object-cover" alt="Foto" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-12 h-12 text-slate-350" />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-bold cursor-pointer select-none">
                  Alterar Foto
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    const pic = prompt("Link de fotografia fictícia de perfil (URL Unsplash):", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150");
                    if (pic) {
                      setProfilePicture(pic);
                      speak("Imagem de perfil carregada com sucesso.");
                    }
                  }}
                  className="bg-slate-100 hover:bg-slate-150 border text-slate-700 p-1.5 rounded-lg text-[10px] font-bold"
                >
                  Adicionar Foto de Perfil
                </button>
              </div>

              {/* Reward Loyalty Details */}
              <div className="bg-amber-100/40 p-4 rounded-2xl text-center space-y-1.5">
                <Sparkles className="w-5 h-5 text-amber-500 mx-auto" />
                <p className="font-bold text-slate-800 text-[11px]">Nível {client.tier}</p>
                <p className="text-[10px] text-slate-500 font-medium">Você tem {client.points} pontos acumulados de compras fisicamente compradas.</p>
              </div>
            </div>

            {/* Profile fields formulary details */}
            <form onSubmit={handleSaveProfile} className="md:col-span-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-slate-705 mb-1 text-[11px] font-bold">Nome Completo</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-705 mb-1 text-[11px] font-bold">Telemóvel Principal</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-705 mb-1 text-[11px] font-bold">E-mail</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-705 mb-1 text-[11px] font-bold">Endereço / Morada de Cabinda</label>
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
              </div>

              {/* Password simulation cards */}
              <div className="border-t pt-4 space-y-3">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Segurança de Senha</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-705 mb-1 font-semibold">Nova Senha</label>
                    <input
                      type="password"
                      value={profileForm.password}
                      onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                      className="w-full p-2.5 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-705 mb-1 font-semibold">Confirmar Senha</label>
                    <input
                      type="password"
                      value={profileForm.confirmPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                      className="w-full p-2.5 border rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="submit"
                  className="bg-slate-900 text-white font-bold px-4 py-2 rounded-xl"
                >
                  Salvar Alterações do Perfil
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 7) HISTÓRICO DE COMPRAS (COMPLETED INVOICES) */}
      {currentView === 'historico' && (
        <div className="max-w-2xl mx-auto bg-white border-0 sm:border border-slate-150 rounded-none sm:rounded-3xl p-4 sm:p-6 shadow-none sm:shadow-sm animate-fade-in" id="purchases-history-screen">
          <div className="border-b pb-3 mb-5">
            <h3 className="text-base font-bold text-slate-900">Histórico de Compras & Comprovativos</h3>
            <p className="text-xs text-slate-500 font-medium">Consulte suas faturas pagas e mercadorias já entregues ao seu balcão ou residência em Cabinda.</p>
          </div>

          <div className="space-y-3 text-xs">
            {clientOrders.length === 0 ? (
              <p className="text-center text-slate-400 py-8">Não há transações concluídas registadas na sua conta.</p>
            ) : (
              (() => {
                const activeClient = clients.find(c => c.id === activeClientId);
                const clientTier = activeClient?.tier || 'Standard';
                return clientOrders.map((ord) => {
                  const statusDetails = getStatusLabelAndColor(ord.status);
                  return (
                    <div key={ord.id} className="p-4 border rounded-2xl bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-700">{ord.id}</span>
                          <span className="text-[10px] text-slate-400">{new Date(ord.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-bold text-slate-900">{ord.productName}</h4>
                        <p className="text-slate-500">Carga Qtd: {ord.quantity} • Fornecedor: {ord.supplierName}</p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrderId(ord.id);
                              setShowCabotageSlip(true);
                            }}
                            className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                          >
                            📄 Ver Fatura / Imprimir
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadOrderInvoice(ord, clientTier)}
                            className="px-2 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                          >
                            📥 Descarregar Fatura
                          </button>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <p className="font-mono font-bold text-slate-900">{formatCurrency(ord.totalAmount)}</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold ${statusDetails?.color}`}>
                          {statusDetails?.label}
                        </span>
                        {ord.checkoutProofUrl && (
                          <button
                            onClick={() => showModalAlert(
                              'Comprovativo de Compra Fiscal',
                              `Visualização de recibo da compra comercial efetuada pelo Mediador:\n\n• Produto Adquirido: ${ord.productName}\n• Quantidade Operada: ${ord.quantity} unidades\n• Fornecedor: ${ord.supplierName}\n• Total Cobrado: ${formatCurrency(ord.totalAmount)}\n• Código da Guia AGT: BD-${ord.id.substring(4, 8).toUpperCase()}\n\nA compra física foi autenticada em Luanda no depósito principal.`,
                              'info'
                            )}
                            className="text-[10px] text-sky-600 hover:underline font-bold block ml-auto mt-1 cursor-pointer"
                          >
                            Ver Comprovativo Fiscal
                          </button>
                        )}
                      </div>
                    </div>
                  );
                });
              })()
            )}
          </div>
        </div>
      )}

      {/* 8) PAGAMENTOS (BUDGETS REQUIRING PAYMENTS) */}
      {currentView === 'pagamentos' && (
        <div className="max-w-xl mx-auto bg-white border-0 sm:border border-slate-150 rounded-none sm:rounded-3xl p-4 sm:p-6 shadow-none sm:shadow-sm animate-fade-in" id="pagamentos-screen">
          <div className="border-b pb-3 mb-5">
            <h3 className="text-base font-bold text-slate-900">Pagamento de Cargas e Faturas Comerciais</h3>
            <p className="text-xs text-slate-500 font-medium font-medium">Consulte e aprove orçamentos pendentes de aprovação comercial para mercadorias em Luanda.</p>
          </div>

          <div className="space-y-4 text-xs">
            {clientOrders.filter(o => !o.paid && o.status === 'ORCADO').length === 0 ? (
              <div className="bg-slate-50 p-6 rounded-2xl text-center text-slate-500 space-y-1">
                <p className="font-bold text-slate-700 animate-pulse-slow">Sem faturas pendentes de liquidação!</p>
                <p className="text-[11px]">Se tiver novos pedidos que queira orçar, por favor aguarde que a equipa de Luanda finalize o orçamento comercial.</p>
              </div>
            ) : (
              clientOrders.filter(o => !o.paid && o.status === 'ORCADO').map((ord) => (
                <div key={ord.id} className="p-4 border border-amber-300 bg-amber-50/20 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-extrabold text-slate-800">{ord.id}</span>
                    <span className="font-bold text-amber-600 block">Pendente de Pagamento</span>
                  </div>
                  <p className="font-bold text-slate-900">{ord.productName}</p>
                  <p className="text-slate-500">Fornecedor Luanda: {ord.supplierName}</p>
                  
                  <div className="p-3 bg-white border rounded-xl space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span>Mercadoria e Frete:</span>
                      <span className="font-semibold">{formatCurrency(ord.totalAmount)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedOrderId(ord.id);
                      setOrderDetailTab('budget');
                      setCurrentView('acompanhar-pedido');
                      speak("Carregando seletor de pagamento.");
                    }}
                    className="w-full py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold rounded-xl cursor-pointer"
                  >
                    Pagar Agora por MC Express ou IBAN
                  </button>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrderId(ord.id);
                        setShowCabotageSlip(true);
                      }}
                      className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-center cursor-pointer text-[10px] transition-all"
                    >
                      📄 Ver Fatura Pro-forma
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const activeClient = clients.find(c => c.id === activeClientId);
                        const clientTier = activeClient?.tier || 'Standard';
                        downloadOrderInvoice(ord, clientTier);
                      }}
                      className="py-1.5 bg-white border border-amber-300 hover:bg-amber-50 text-amber-800 font-extrabold rounded-lg text-center cursor-pointer text-[10px] transition-all"
                    >
                      📥 Descarregar Fatura
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 9) NOTIFICAÇÕES (GENERAL HUB LIST) */}
      {currentView === 'notificacoes' && (
        <div className="max-w-xl mx-auto bg-white border-0 sm:border border-slate-150 rounded-none sm:rounded-3xl p-4 sm:p-6 shadow-none sm:shadow-sm animate-fade-in" id="notificacoes-screen">
          <div className="flex items-center justify-between border-b pb-3 mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Histórico de Alertas e Aviso do Mediador</h3>
              <p className="text-xs text-slate-500">Iremos enviar notificações instantâneas de cada porto de escala da mercadoria.</p>
            </div>
            <button 
              onClick={() => {
                notifications.forEach(n => onMarkNotificationRead(n.id));
                speak("Tudo marcado como lido.");
              }}
              className="text-xs text-sky-600 font-bold hover:underline"
            >
              Marcar lidas
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            {clientNotifications.length === 0 ? (
              <p className="text-center text-slate-400 py-8">Não há avisos recebidos no momento.</p>
            ) : (
              clientNotifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => {
                    onMarkNotificationRead(notif.id);
                    setSelectedNotificationForModal(notif);
                    setShowNotificationModal(true);
                    speak(`${notif.title}. Clique para ler e responder.`);
                  }}
                  className={`p-3.5 border rounded-2xl text-left cursor-pointer transition-colors ${
                    notif.read ? 'bg-slate-50 border-slate-100 text-slate-600' : 'bg-amber-50/40 border-amber-200 text-slate-900 font-bold shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      {!notif.read && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0"></span>}
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-slate-400">{new Date(notif.createdAt).toLocaleTimeString('pt-AO')}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{notif.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 10) MENSAGENS E SUPORTE (CHAT DIRECT IN 100% AVAILABLE SIZE) */}
      {(currentView === 'suporte' || currentView === 'mensagens') && (
        <div className="w-full bg-slate-50 border-0 sm:border border-slate-150 rounded-none sm:rounded-3xl p-0 shadow-none sm:shadow-lg animate-fade-in text-xs overflow-hidden" id="suporte-screen">
          <SharedChat
            order={null}
            currentUserRole="client"
            messages={messages}
            clientId={activeClientId}
            clients={clients}
            orders={orders}
            onSendMessage={(t, attach, isPri, sendr, chanId) => {
              const targetChan = chanId === 'general' ? `general-${activeClientId}` : (chanId || 'general');
              onSendMessage(targetChan, t, attach, isPri, sendr);
            }}
            onMarkChannelAsRead={onMarkChannelAsRead}
            onBack={() => setCurrentView('inicio')}
          />
        </div>
      )}

      {/* 11) RECLAMAÇÕES (SUBMIT AND CHECK COMPLAINTS) */}
      {currentView === 'reclamacoes' && (
        <div className="max-w-2xl mx-auto bg-white border-0 sm:border border-slate-150 rounded-none sm:rounded-3xl p-4 sm:p-6 shadow-none sm:shadow-sm animate-fade-in" id="reclamacoes-screen">
          <div className="flex items-center gap-3 border-b pb-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-red-650" />
            <div>
              <h3 className="text-lg font-bold font-display text-slate-900">Portal de Reclamações & Pedido de Reembolso</h3>
              <p className="text-xs text-slate-500 font-medium">Prezamos pela transparência de carga. Registe conflitos aduaneiros ou atrasos graves.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs animate-fade-in">
            <div className="md:col-span-4 space-y-3.5">
              <div className="p-4 bg-red-50 border border-red-105 rounded-2xl space-y-1.5">
                <Shield className="w-5 h-5 text-red-600" />
                <h4 className="font-bold text-red-850">Garantia Logística</h4>
                <p className="text-[10px] text-slate-600 leading-snug">Se o seu produto sofrer avaria marítima ou extravio nos armazéns, nós intermediamos reembolso integral de 100%.</p>
              </div>
            </div>

            <div className="md:col-span-8 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Submeter Reclamação Formal</h4>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                showModalAlert(
                  'Reclamação Registada',
                  `A sua insatisfação operacional ou incidente logístico foi catalogado de forma oficial com o ID INC-${Math.floor(1000 + Math.random() * 9000)}!\n\nO Mediador do Canal procederá à auditoria documental e tracking de rotas junto ao fornecedor e despachante no prazo máximo de 24 horas úteis.`,
                  'warning'
                );
              }} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Selecione o Lote / Encomenda em causa *</label>
                  <select className="w-full p-2.5 bg-white border rounded-xl font-mono">
                    {clientOrders.map(o => (
                      <option key={o.id} value={o.id}>{o.id} - {o.productName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Motivo Formal da Reclamação *</label>
                  <input type="text" placeholder="Ex: Produto com arranhões ou Atraso superior a 10 dias" className="w-full p-2.5 border rounded-xl bg-white" required />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Descrito Detalhado do Conflito</label>
                  <textarea placeholder="Insira o máximo de informações sobre a mercadoria e fornecedor Luanda..." className="w-full p-2.5 border rounded-xl bg-white" rows={3}></textarea>
                </div>
                <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-4 py-2 rounded-xl">Registar Reclamação Oficial</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 12) CONFIGURAÇÕES (ACCESSIBILITY DASHBOARD & CACHE RESETS) */}
      {currentView === 'configuracoes' && (
        <div className="max-w-xl mx-auto bg-white border-0 sm:border border-slate-150 rounded-none sm:rounded-3xl p-4 sm:p-6 shadow-none sm:shadow-sm animate-fade-in" id="configuracoes-screen">
          <div className="border-b pb-3 mb-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <Settings className="w-5 h-5 text-slate-700" />
              Configurações de Acessibilidade & Simulador
            </h3>
            <p className="text-xs text-slate-500">Adapte o visual e configure ajudantes para uma melhor usabilidade.</p>
          </div>

          <div className="space-y-6 text-xs">
            
            {/* Visual Adjustments Box */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-2xl">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest border-b pb-1">Facilidades Visuais (Para Idosos ou Dificuldade de Leitura)</h4>
              
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">Leitor de Voz por Clique (Text-To-Speech)</p>
                    <p className="text-[10px] text-slate-400">Audio-narração instantânea em português de Angola de títulos ou status ao clicar.</p>
                  </div>
                  <button
                    onClick={() => {
                      setTextToSpeech(!textToSpeech);
                      speak(textToSpeech ? "Voz desativada" : "Opção de ajuda auditiva por voz ativada");
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold border ${textToSpeech ? 'bg-amber-400 border-amber-500 text-slate-950' : 'bg-white'}`}
                  >
                    {textToSpeech ? '🔊 Ligado' : '🔇 Desligado'}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">Cores em Alto Contraste</p>
                    <p className="text-[10px] text-slate-400">Visual adaptado para facilitar contraste em ecrã inteiro de alta score WCAG.</p>
                  </div>
                  <button
                    onClick={() => setHighContrast(!highContrast)}
                    className={`px-3 py-1.5 rounded-lg font-bold border ${highContrast ? 'bg-amber-400 border-amber-500 text-slate-950' : 'bg-white'}`}
                  >
                    {highContrast ? '🌓 Ativado' : '🔘 Desativado'}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">Tamanho da Letra do Aplicativo</p>
                    <p className="text-[10px] text-slate-400">Ampliar letras de todos os botões e formulários do Mediador.</p>
                  </div>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value as any)}
                    className="p-1 px-2 border bg-white rounded-lg font-medium"
                  >
                    <option value="normal">Normal</option>
                    <option value="grande">Letra Grande (+25%)</option>
                    <option value="extra-grande">Letra Extra Grande (+50%)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Cache simulator resets */}
            <div className="bg-red-50/50 p-4 border border-red-105 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-650" />
                Limpeza Geral Fictícia
              </h4>
              <p className="text-[10px] text-slate-500 leading-snug">Se desejar reinstalar os clientes e pedidos padrão do simula para reiniciar os seus testes, clique abaixo:</p>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Deseja deitar fora as cotações criadas e repor o simulador original?')) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="bg-red-500 hover:bg-red-600 text-white font-extrabold px-4 py-1.5 rounded-lg"
              >
                Apagar Dados e Reiniciar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 13) SOBRE NÓS (INSTITUTIONAL PRESENTATION & FOUNDER MANIFESTO) */}
      {currentView === 'sobre-nos' && (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in text-slate-800 text-left" id="sobre-nos-screen">
          
          {/* Hero Banner with Founder Signature & Mission */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-slate-800">
            <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest inline-flex items-center gap-1.5 shadow-sm font-display">
                  🇦🇴 Apresentação Institucional Oficial
                </span>
                <span className="bg-slate-800/90 text-amber-350 border border-slate-700 text-[10px] font-bold px-3 py-1 rounded-full">
                  Criado por João Hilário António
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight text-white leading-tight">
                  Mediador Cabinda: A Ponte Logística e Comercial que Quebrou o Isolamento do Enclave
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-3xl font-medium leading-relaxed">
                  Uma iniciativa de engenharia tecnológica, logística e responsabilidade cívica concebida para aproximar Luanda e Cabinda, garantindo preços justos de fábrica, segurança contra burlas e dignidade económica para as famílias e empresários cabindenses.
                </p>
              </div>

              {/* Founder Taglet */}
              <div className="pt-2 flex items-center gap-3 border-t border-slate-800/80">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-md">
                  JH
                </div>
                <div>
                  <h4 className="text-xs font-black text-white font-display">João Hilário António</h4>
                  <p className="text-[10px] text-amber-400 font-medium">Fundador, Idealizador & Desenvolvedor do Mediador Cabinda</p>
                </div>
              </div>
            </div>
          </div>

          {/* NOTA INTRODUTÓRIA */}
          <div className="bg-white border border-slate-150 rounded-3xl p-6 sm:p-7 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <span className="text-xl">📜</span>
              <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-900 uppercase tracking-wide">
                1. Nota Introdutória: O Chamado da Inovação
              </h3>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-700 font-medium leading-relaxed text-justify">
              Seja muito bem-vindo ao <strong>Mediador Cabinda</strong>. Esta plataforma não nasceu como uma simples experiência comercial, mas sim como a resposta prática, organizada e resoluta a um clamor histórico. Em Angola, nenhuma província carrega consigo uma particularidade territorial tão desafiadora quanto Cabinda. Diante de distâncias marítimas, fronteiras internacionais e barreiras de acesso aos grandes centros abastecedores de Luanda, o povo cabindense merecia uma ferramenta à altura dos seus anseios: moderna, transparente, acessível pelo telemóvel e respaldada por uma operação humana e logística séria.
            </p>
          </div>

          {/* O PRINCÍPIO FUNDACIONAL & O PROBLEMA DO POVO DE CABINDA */}
          <div className="bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 border border-amber-200/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-amber-200/60 pb-3">
              <span className="text-xl">🎯</span>
              <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-900 uppercase tracking-wide">
                2. A Razão de Existir: Toda a Empresa Surge para Resolver o Problema de um Povo
              </h3>
            </div>

            <blockquote className="p-4 bg-white/90 border-l-4 border-amber-400 rounded-2xl shadow-2xs italic text-xs sm:text-[12.5px] text-slate-800 font-semibold leading-relaxed">
              "Toda a empresa com propósito duradouro surge da necessidade premente de solucionar a dor, o sofrimento ou as limitações que afetam a vida quotidiana de um povo. O Mediador Cabinda nasceu do compromisso de nunca aceitar que a descontinuidade geográfica seja sinónimo de atraso, carestia ou exclusão económica para os nossos irmãos de Cabinda."
              <span className="block mt-2 font-bold font-sans not-italic text-[11px] text-amber-900">— João Hilário António, Criador do Mediador Cabinda</span>
            </blockquote>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
                <span>⚠️</span> O Diagnóstico Real: Os Quatro Grandes Problemas que o Aplicativo Resolve
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                
                <div className="p-4 bg-white rounded-2xl border border-slate-150 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">1</span>
                    <h5 className="font-bold text-slate-900">Isolamento & Descontinuidade Territorial</h5>
                  </div>
                  <p className="text-[11.5px] text-slate-600 font-medium leading-relaxed">
                    Cabinda é um enclave separado fisicamente do restante território angolano pelo rio Congo e pela fronteira estrangeira da República Democrática do Congo (RDC). O trânsito rodoviário informal exige vistos, taxas de fronteira imprevisíveis e longos períodos de espera.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-150 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">2</span>
                    <h5 className="font-bold text-slate-900">Preços Abusivos & Escassez Crónica</h5>
                  </div>
                  <p className="text-[11.5px] text-slate-600 font-medium leading-relaxed">
                    Devido à dificuldade de abastecimento, materiais de construção (cimento, varões, tintas), maquinarias, peças industriais, eletrodomésticos e tecnologia chegam ao comércio informal de Cabinda com margens inflacionadas de 200% a 500% sobre o preço real de Luanda.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-150 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">3</span>
                    <h5 className="font-bold text-slate-900">Burlas & Insegurança em Compras Informais</h5>
                  </div>
                  <p className="text-[11.5px] text-slate-600 font-medium leading-relaxed">
                    Inúmeros cidadãos e empresas de Cabinda perdiam somas expressivas transferindo dinheiro para conhecidos ou supostos vendedores de redes sociais em Luanda, sem faturas, sem garantia de inspeção física e sem qualquer responsabilização em caso de extravio.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-150 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">4</span>
                    <h5 className="font-bold text-slate-900">Burocracia Portuária & Tributação AGT</h5>
                  </div>
                  <p className="text-[11.5px] text-slate-600 font-medium leading-relaxed">
                    O desembaraço de mercadorias no Porto de Luanda e a emissão da Guia de Trânsito para cabotagem nacional exigem conhecimento aduaneiro específico para evitar multas, retenções portuárias ou a cobrança indevida de dupla tributação fiscal.
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* NOTA PROLONGADA E EXPLÍCITA: O QUE É O MEDIADOR CABINDA */}
          <div className="bg-white border border-slate-150 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <span className="text-xl">🏢</span>
              <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-900 uppercase tracking-wide">
                3. Nota Prolongada e Explícita: O que é o Mediador Cabinda?
              </h3>
            </div>

            <div className="space-y-3 text-xs sm:text-[12.5px] text-slate-700 font-medium leading-relaxed text-justify">
              <p>
                O <strong>Mediador Cabinda Lda</strong> é uma infraestrutura integrada de comércio eletrónico, intermediação fiscal e engenharia logística de cabotagem interprovincial. Mais do que um aplicativo móvel, somos o braço direito do cliente em Luanda e o seu garante de entrega segura em Cabinda.
              </p>
              <p>
                A nossa plataforma funciona como um <strong>procurador mercantil e logístico institucional</strong>. Quando um cidadão, oficina, hospital, construtora ou comerciante em Cabinda necessita de um bem — seja um compressor industrial, barras de aço para construção, computadores para um escritório, ou geradores de energia —, ele não precisa de viajar para Luanda nem se sujeitar a intermediários obscuros.
              </p>
              <p>
                A equipa do Mediador Cabinda realiza a compra direta no distribuidor oficial ou fábrica em Luanda, recolhe a fatura em nome do cliente, fiscaliza a conformidade técnica, acondiciona e paletiza no nosso armazém de estiva, emite os documentos fiscais junto da AGT (Administração Geral Tributária) e despacha via navio de cabotagem regular ou avião TAAG Cargo, entregando com nota fiscal e garantia no coração de Cabinda.
              </p>
            </div>

            {/* Visual Flow Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-center space-y-1">
                <span className="text-lg">🛒</span>
                <h5 className="font-bold text-slate-900 text-xs">Compra Pelo Preço Real</h5>
                <p className="text-[10.5px] text-slate-500 font-medium">Acesso aos preços de fábrica e atacado de Luanda, sem especulação.</p>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-center space-y-1">
                <span className="text-lg">🚢</span>
                <h5 className="font-bold text-slate-900 text-xs">Cabotagem & Frete Legal</h5>
                <p className="text-[10.5px] text-slate-500 font-medium">Rotas marítimas e aéreas homologadas com Guia de Trânsito AGT.</p>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-center space-y-1">
                <span className="text-lg">🛡️</span>
                <h5 className="font-bold text-slate-900 text-xs">Garantia Total de 100%</h5>
                <p className="text-[10.5px] text-slate-500 font-medium">Reembolso integral ou reposição em caso de avaria ou extravio.</p>
              </div>
            </div>
          </div>

          {/* EXPLICAÇÃO DETALHADA PASSO A PASSO: PARA QUE SERVE E COMO FUNCIONA */}
          <div className="bg-white border border-slate-150 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <span className="text-xl">⚙️</span>
              <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-900 uppercase tracking-wide">
                4. Explicação Detalhada Passo a Passo: Como Opera o Aplicativo
              </h3>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              O fluxo de trabalho do Mediador Cabinda foi desenhado com rigor militar e transparência absoluta, assegurando que o cliente saiba exatamente onde está cada Kwanza e cada encomenda em todas as fases:
            </p>

            <div className="space-y-4">
              
              {/* Step 1 */}
              <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-150">
                <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                  01
                </span>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-xs text-slate-900">Solicitação do Pedido ou Escolha no Mercado Homologado</h4>
                  <p className="text-[11.5px] text-slate-600 font-medium leading-relaxed">
                    O cliente acede ao aplicativo no telemóvel e escolhe um produto já catalogado pelos nossos parceiros de Luanda ou preenche o formulário <strong>"Pedir Nova Intermediação"</strong>, descrevendo o artigo que pretende (com fotos, marca e especificações técnicas).
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-150">
                <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                  02
                </span>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-xs text-slate-900">Emissão de Orçamento Pro-forma Matemático & Transparente</h4>
                  <p className="text-[11.5px] text-slate-600 font-medium leading-relaxed">
                    A nossa mesa em Luanda valida o preço real no fornecedor e gera uma Fatura Pro-forma discriminando detalhadamente: o Custo de Compra, o Frete Marítimo/Aéreo, a Taxa Fixa de Despacho (8.000 Kz) e a Comissão de Intermediação (com rateio social de 3% para jovens afiliados, 2% de reserva e 5% de sustentação).
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-150">
                <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                  03
                </span>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-xs text-slate-900">Pagamento Blindado por Multicaixa Express ou IBAN Oficial</h4>
                  <p className="text-[11.5px] text-slate-600 font-medium leading-relaxed">
                    O cliente aprova o orçamento e realiza o pagamento seguro através de <strong>Multicaixa Express (MC Express)</strong> ou transferência para o nosso <strong>IBAN corporativo (AO06)</strong>. O comprovativo é anexado no app e validado pela contabilidade.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-150">
                <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                  04
                </span>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-xs text-slate-900">Compra Física, Vistoria Técnica & Embalamento de Proteção</h4>
                  <p className="text-[11.5px] text-slate-600 font-medium leading-relaxed">
                    Os nossos agentes em Luanda recolhem o produto diretamente na loja com fatura fiscal, conferem números de série e integridade física, e realizam a paletização e acondicionamento com plástico-bolha e caixas reforçadas no depósito central.
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-150">
                <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                  05
                </span>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-xs text-slate-900">Desembaraço AGT & Cabotagem Marítima / Aérea</h4>
                  <p className="text-[11.5px] text-slate-600 font-medium leading-relaxed">
                    Emitimos a Guia de Trânsito AGT para isenção de dupla tributação e embarcamos a carga nos navios de cabotagem regular no Porto de Luanda (prazo de 3 a 7 dias úteis) ou em voos cargueiros TAAG Cargo (24 a 48 horas úteis).
                  </p>
                </div>
              </div>

              {/* Step 6 */}
              <div className="flex items-start gap-3.5 p-3.5 bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                <span className="text-amber-400">06</span>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-xs text-slate-900">Rastreio em Tempo Real por Notificação (Código MED-XXXX)</h4>
                  <p className="text-[11.5px] text-slate-600 font-medium leading-relaxed">
                    O cliente acompanha cada porto e escala em tempo real na linha do tempo do aplicativo, recebendo alertas a cada movimentação e assistência 24/7 do nosso robô inteligente e dos operadores humanos.
                  </p>
                </div>
              </div>

              {/* Step 7 */}
              <div className="flex items-start gap-3.5 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="w-8 h-8 rounded-xl bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                  ✓
                </span>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-xs text-emerald-900">Desembarque no Porto de Cabinda & Entrega Concluída</h4>
                  <p className="text-[11.5px] text-emerald-800 font-medium leading-relaxed">
                    Assim que o navio atraca, a carga é descarregada no <strong>Armazém C-4 do Porto de Cabinda</strong>. O cliente pode fazer o levantamento imediato ou solicitar a nossa equipa de estafetas para entrega à porta de casa ou no seu estaleiro.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* IMPACTO SOCIAL & JUVENTUDE EMPREENDEDORA */}
          <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-slate-800 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <span className="text-xl">🤝</span>
              <h3 className="font-display font-extrabold text-sm sm:text-base text-amber-400 uppercase tracking-wide">
                5. Impacto Comunitário: Renda para a Juventude Cabindense
              </h3>
            </div>
            
            <p className="text-xs sm:text-[12.5px] text-slate-300 font-medium leading-relaxed">
              O modelo idealizado por <strong>João Hilário António</strong> não visa apenas a eficiência logística, mas também a capacitação económica local. Através do <strong>Programa Jovens Empreendedores de Cabinda</strong>, qualquer jovem ou parceiro comunitário pode registar-se gratuitamente no aplicativo, receber o seu código de afiliação e ganhar uma comissão direta de <strong>15%</strong> sobre cada intermediação gerada para empresas ou comerciantes locais. Transformamos a logística num motor de criação de emprego e renda digna.
            </p>
          </div>

          {/* DADOS DE CONTATO E ARMAZÉNS */}
          <div className="bg-white border border-slate-150 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
            <h4 className="font-display font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <span>📍</span> Localizações Físicas & Contactos Oficiais
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-2">
                <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">🏢 Direção Base & Balcão Cabinda</span>
                <p className="font-bold text-slate-900">Armazém C-4, Recinto do Porto Comercial</p>
                <p className="text-slate-500 text-[11px]">Rua Direita, Província de Cabinda, Angola</p>
                <p className="text-amber-800 font-mono text-[11px] font-bold">Atendimento: Seg-Sex 08h-18h | Sáb 08h-13h</p>
                <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                  <p>👤 <strong>Criador:</strong> João Hilário António</p>
                  <p>📍 <strong>Direção Base:</strong> Cabinda</p>
                  <p className="text-[10px] text-amber-700 font-bold">🚀 Mediando entre Cabinda e Luanda e em breve para as demais províncias de Angola...</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-2">
                <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">📞 Linhas Telefónicas & Pagamentos</span>
                <div className="space-y-1 text-[11px] text-slate-700">
                  <p>📱 <strong>Unitel:</strong> <a href="tel:+244942043293" className="text-sky-600 hover:underline font-bold">942 043 293</a></p>
                  <p>📱 <strong>Movicel:</strong> <a href="tel:+244998100940" className="text-sky-600 hover:underline font-bold">998 100 940</a></p>
                  <p>💳 <strong>Multicaixa Express:</strong> <span className="font-mono font-bold text-slate-900">942 043 293</span></p>
                  <p>✉️ <strong>E-mail:</strong> <a href="mailto:equipemediadorcabindacabinda@gmail.com" className="text-sky-600 hover:underline font-bold">equipemediadorcabindacabinda@gmail.com</a></p>
                  <p className="font-mono text-[10px] bg-white p-1.5 rounded-lg border border-slate-200 mt-1">
                    <strong>IBAN:</strong> AO06 0006 0000 01307638301 95
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 13.5) GUIA DE AJUDA & TAXAS (STEP-BY-STEP EXPLANATION) */}
      {currentView === 'guia-ajuda' && (
        <div className="max-w-3xl mx-auto bg-white border-0 sm:border border-slate-150 rounded-none sm:rounded-3xl p-4 sm:p-6 shadow-none sm:shadow-sm animate-fade-in" id="guia-ajuda-screen">
          <div className="flex items-center gap-3 border-b pb-4 mb-6">
            <div className="bg-amber-100 text-amber-800 p-2.5 rounded-2xl">
              <HelpCircle className="w-6 h-6 text-amber-600 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-slate-900">Como Funciona o Mediador Cabinda?</h3>
              <p className="text-xs text-slate-500 font-medium">Saiba como funcionam os trâmites logísticos, a nossa comissão e a taxa de despacho aduaneiro.</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* INTRO SPEECH CHIP */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs font-semibold text-slate-700 leading-relaxed flex items-start gap-3">
              <span className="text-xl shrink-0 mt-0.5">💡</span>
              <p>
                Este guia interativo foi concebido para dar total transparência a você, cliente ou afiliado de Cabinda. Entenda cada etapa do processo e saiba com precisão onde o seu investimento é aplicado para garantir uma entrega 100% segura e livre de transtornos fiscais com a AGT.
              </p>
            </div>

            {/* SECTIONS */}
            <div className="space-y-4">
              {/* SECTION 1: PASSO A PASSO */}
              <div className="bg-white border border-slate-150 rounded-2xl p-5 space-y-4 shadow-2xs">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span className="bg-slate-900 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono">1</span>
                  PASSO A PASSO DA SUA INTERMEDIAÇÃO
                </h4>
                
                <div className="relative pl-4 border-l-2 border-dashed border-amber-300 ml-2.5 space-y-5">
                  <div className="relative">
                    <span className="absolute -left-[23px] top-0.5 w-4.5 h-4.5 bg-amber-400 text-slate-950 font-bold text-[9px] rounded-full flex items-center justify-center shadow-xs">1</span>
                    <h5 className="text-xs font-bold text-slate-900">Registar ou Escolher o Produto</h5>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                      Navegue pelo nosso catálogo de produtos homologados ou use a aba <strong>"Pedir Nova Intermediação"</strong> para descrever qualquer equipamento que queira comprar das principais lojas em Luanda.
                    </p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[23px] top-0.5 w-4.5 h-4.5 bg-slate-900 text-white font-bold text-[9px] rounded-full flex items-center justify-center">2</span>
                    <h5 className="text-xs font-bold text-slate-900">Análise e Emissão de Orçamento</h5>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                      O mediador em Luanda valida o preço de aquisição real no fornecedor e gera uma fatura pro-forma no sistema com as três taxas transparentes: Custo de Aquisição, Frete Marítimo/Aéreo e a Taxa de Despacho Base de 8.000 Kz.
                    </p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[23px] top-0.5 w-4.5 h-4.5 bg-slate-900 text-white font-bold text-[9px] rounded-full flex items-center justify-center">3</span>
                    <h5 className="text-xs font-bold text-slate-900">Pagamento Seguro pelo Aplicativo</h5>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                      Você consulta e aprova o orçamento na aba <strong>"Minhas Faturas & Finais"</strong>. O pagamento é feito via transferência bancária oficial para o nosso IBAN seguro ou Multicaixa Express. Carrega o comprovativo diretamente para validação rápida!
                    </p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[23px] top-0.5 w-4.5 h-4.5 bg-slate-900 text-white font-bold text-[9px] rounded-full flex items-center justify-center">4</span>
                    <h5 className="text-xs font-bold text-slate-900">Cabotagem e Trânsito Fiscal Seguro</h5>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                      A nossa central emite a Guia de Trânsito oficial, carrega o lote na balsa marítima de cabotagem oficial de Luanda para o porto comercial de Cabinda (ou avião TAAG para envios urgentes). Acompanha tudo em tempo real via rastreador no app!
                    </p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[23px] top-0.5 w-4.5 h-4.5 bg-emerald-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center shadow-xs">✓</span>
                    <h5 className="text-xs font-bold text-slate-900">Levantamento ou Entrega ao Domicílio</h5>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                      Assim que a balsa desembarcar em Cabinda e passar no porto, você recebe um alerta para levantar no nosso balcão central de Cabinda, ou solicitar entrega imediata na sua residência ou estabelecimento em toda a província.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 2: PORQUE OS 8.000 KZ? */}
              <div className="bg-white border border-slate-150 rounded-2xl p-5 space-y-4 shadow-2xs">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span className="bg-amber-100 text-amber-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">AOA</span>
                  PORQUE A TAXA DE DESPACHO BASE DE AOA 8.000 É FIXA?
                </h4>
                
                <div className="space-y-3 text-xs text-slate-600 font-semibold leading-relaxed">
                  <p>
                    Muitos clientes perguntam por que cobramos uma <strong>Taxa de Despacho Base Fixa de 8.000 Kz</strong> em cada lote de intermediação. A razão é estritamente logística e operacional:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-slate-500 text-[11px] font-medium">
                    <li>
                      <strong className="text-slate-800">Custo Elevado de Operações em Luanda:</strong> Luanda é uma metrópole com distâncias imensas e trânsito caótico. A circulação para recolha de faturas físicas, carregamento no fornecedor, portagens obrigatórias e deslocação aos armazéns de estiva exige combustível e tempo de transporte que são extremamente caros.
                    </li>
                    <li>
                      <strong className="text-slate-800">Manuseamento Físico e Armazenamento Temporário:</strong> O valor de 8.000 Kz cobre o processo de triagem física, embalagem para trânsito marítimo e armazenamento seguro provisório no nosso depósito em Luanda antes de embarcar.
                    </li>
                    <li>
                      <strong className="text-slate-800">Despachante Portuário em Cabinda:</strong> Ao chegar ao porto comercial de Cabinda, há despesas fixas para desembarque e processamento aduaneiro no porto de Cabinda para liberação célere de mercadorias.
                    </li>
                  </ul>
                  <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                    <strong>Resumo Técnico:</strong> Esta taxa de 8.000 Kz é o menor valor operacional possível para cobrir estas despesas logísticas inevitáveis por lote de carga, garantindo que a sua operação corra de forma sustentável, célere e transparente do início ao fim.
                  </div>
                </div>
              </div>

              {/* SECTION 3: RATEIO TRANSPARENTE DA COMISSÃO */}
              <div className="bg-slate-950 text-white rounded-2xl p-5 space-y-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <h4 className="text-sm font-black text-amber-400 flex items-center gap-2">
                  <span className="bg-amber-400 text-slate-950 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono">3</span>
                  RATEIO TRANSPARENTE DA COMISSÃO (3% / 2% / 5%)
                </h4>
                
                <p className="text-[11px] text-slate-300 font-semibold leading-relaxed">
                  Para além da taxa de despacho de 8.000 Kz e do frete, cobramos o mínimo de <strong>10% de comissão de intermediação</strong> sobre o valor do produto em Luanda. Eis como esse valor de comissão é dividido para sustentar a rede:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">👥 Afiliado</span>
                      <span className="text-xs font-mono font-bold bg-amber-400/20 text-amber-400 px-1.5 py-0.5 rounded-sm">3%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal font-medium">
                      O parceiro local de Cabinda que indicou e trouxe o cliente para o aplicativo recebe uma percentagem garantida de <strong>3%</strong> do valor total como prémio de filiação de forma direta!
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider">⚓ Despacho Extra</span>
                      <span className="text-xs font-mono font-bold bg-blue-400/20 text-blue-400 px-1.5 py-0.5 rounded-sm">2%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal font-medium">
                      Deduzimos <strong>2%</strong> do valor da comissão e colocamos diretamente no fundo de operações. Isto cobre imprevistos onde os 8.000 Kz de despacho fixo não são suficientes para suprir flutuações e taxas portuárias.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">🏢 Empresa Master</span>
                      <span className="text-xs font-mono font-bold bg-emerald-400/20 text-emerald-400 px-1.5 py-0.5 rounded-sm">5%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal font-medium">
                      A nossa agência retém <strong>5%</strong> na Conta Master. Este valor acumula de forma bruta para reinvestimento de transporte e para garantir o pagamento pontual dos salários fixos dos nossos funcionários dedicados e dos nossos dois representantes estratégicos de Luanda.
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-slate-400 leading-relaxed italic border-t border-slate-800/60 font-medium">
                  * Nota de Compromisso: No início de actividade, o salário operacional poderá variar em função das vendas, mas com a fidelização gradual e o aumento de rotas, as despesas fixas passam a ser totalmente cobertas por este rateio, garantindo previsibilidade e estabilidade contínua!
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 14) TERMOS DE USO (COMPLIANCE INFRASTRUCTURE) */}
      {currentView === 'termos-uso' && (
        <div className="max-w-2xl mx-auto bg-white border-0 sm:border border-slate-150 rounded-none sm:rounded-3xl p-4 sm:p-6 shadow-none sm:shadow-sm animate-fade-in" id="termos-uso-screen">
          <div className="border-b pb-3 mb-5">
            <h3 className="text-base font-bold text-slate-900">Termos Legais e Logísticos de Intermediação</h3>
            <p className="text-xs text-slate-500">Última atualização: Junho de 2026</p>
          </div>

          <div className="space-y-4 text-xs text-slate-600 leading-relaxed max-h-96 overflow-y-auto pr-3">
            <h4 className="font-bold text-slate-800 uppercase text-[11px]">1. Objeto de Serviço</h4>
            <p>O Mediador Cabinda Lda opera apenas como intermediário fiscal de compras e despachante logístico. Nós não fabricamos nem oferecemos garantias diretas do fabricante dos produtos adquiridos em Luanda.</p>
            
            <h4 className="font-bold text-slate-800 uppercase text-[11px]">2. Responsabilidades de Pagamento</h4>
            <p>Nenhuma compra comercial no fornecedor de Luanda será iniciada antes da validação integral do pagamento efetuado por Multicaixa Express, transferência bancária oficial para o nosso IBAN, ou introdução de Referência válida no balcão.</p>

            <h4 className="font-bold text-slate-800 uppercase text-[11px]">3. Seguro Opcional</h4>
            <p>A taxa de seguro opcional (+3%) cobre 100% do valor faturado da mercadoria contra extravios por balsa ou incidentes graves de rotas aéreas e manuseio no porto comercial de Cabinda.</p>

            <h4 className="font-bold text-slate-800 uppercase text-[11px]">4. Prazo Aduaneiro</h4>
            <p>Eventuais atrasos decorrentes de greves nos portos ou mau tempo na travessia marítima do rio Congo são geridos em regime de força maior, informando os clientes prontamente via Chat do Aplicativo.</p>
          </div>
        </div>
      )}

      {/* 14.2) SOLICITAR SERVIÇOS (CLIENT SERVICE REQUEST INTERFACE) */}
      {currentView === 'solicitar-servico' && (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in" id="solicitar-servico-screen">
          {/* Header Banner */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-md border border-slate-800">
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-40 h-40 bg-amber-500/15 rounded-full blur-2xl"></div>
            <div className="relative z-10 space-y-1">
              <span className="text-[8px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-widest inline-block leading-none">
                Serralharia & Metalurgia
              </span>
              <h2 className="text-lg font-display font-black tracking-tight leading-none text-white">
                Solicitar Serviços Especializados
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-2xl font-medium">
                Contrate serviços de serralharia civil, reparação metálica e estruturas sob medida de fornecedores homologados em Luanda e Cabinda. A sua encomenda e o orçamento são fiscalizados e intermediados pelo Mediador Cabinda.
              </p>
            </div>
          </div>

          {/* Tab buttons */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => {
                setServiceActiveTab('catalog');
                setSelectedServiceToRequest(null);
                speak("A abrir catálogo de serviços disponíveis.");
              }}
              className={`pb-3 px-6 text-xs font-bold border-b-2 transition-all ${
                serviceActiveTab === 'catalog'
                  ? 'border-amber-500 text-slate-900 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              🛠️ Catálogo de Serviços
            </button>
            <button
              onClick={() => {
                setServiceActiveTab('my-requests');
                setSelectedServiceToRequest(null);
                speak("A abrir histórico de seus pedidos de serviços.");
              }}
              className={`pb-3 px-6 text-xs font-bold border-b-2 transition-all ${
                serviceActiveTab === 'my-requests'
                  ? 'border-amber-500 text-slate-900 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              📋 Meus Serviços Solicitados ({serviceRequests.filter(r => r.clientId === activeClientId).length})
            </button>
          </div>

          {serviceActiveTab === 'catalog' ? (
            <div className="space-y-6">
              {!selectedServiceToRequest ? (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {supplierServices && supplierServices.length > 0 ? (
                      supplierServices.map((srv) => (
                        <div
                          key={srv.id}
                          className="bg-white border border-slate-200 hover:border-amber-400 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between group"
                        >
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="bg-amber-100 text-amber-900 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                                  {srv.category}
                                </span>
                                <h3 className="font-display font-bold text-slate-900 text-sm mt-1.5 leading-snug">
                                  {srv.name}
                                </h3>
                              </div>
                              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                                📍 {srv.location || 'Luanda'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 leading-normal font-semibold">
                              {srv.description}
                            </p>
                            <div className="pt-2 border-t border-slate-50 flex justify-between items-center text-[10px] text-slate-400 font-semibold font-mono">
                              <span>Prazo Estimado:</span>
                              <span className="text-slate-800 font-bold">{srv.executionTime}</span>
                            </div>
                          </div>

                          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <div>
                              <span className="text-[8px] text-slate-400 font-bold uppercase block">Preço de Referência</span>
                              <span className="font-mono text-xs font-black text-slate-900">
                                {srv.price.toLocaleString('pt-AO')} AOA
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                setSelectedServiceToRequest(srv);
                                setServiceReqDesc('');
                                setServiceReqLocation(client?.address || '');
                                setServiceReqPhone(client?.phone || '');
                                speak(`Selecionou ${srv.name}. Introduza os seus requisitos particulares.`);
                              }}
                              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-xs"
                            >
                              Contratar Serviço
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-1 md:col-span-2 text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
                        <span className="text-2xl block mb-2">🛠️</span>
                        <p className="text-xs text-slate-500 font-bold uppercase">Nenhum serviço disponível no catálogo.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <button
                      onClick={() => setSelectedServiceToRequest(null)}
                      className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      ← Voltar
                    </button>
                    <div>
                      <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest">A CONTRATAR SERVIÇO</h3>
                      <h4 className="text-sm font-bold text-slate-900">{selectedServiceToRequest.name}</h4>
                    </div>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!serviceReqDesc.trim()) {
                        showModalAlert('Campos Requeridos', 'Por favor, descreva os requisitos específicos do trabalho metálico.', 'warning');
                        return;
                      }

                      const newReq: ServiceRequest = {
                        id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
                        clientId: activeClientId,
                        clientName: client?.name || 'Cliente',
                        clientPhone: serviceReqPhone || client?.phone || '',
                        serviceId: selectedServiceToRequest.id,
                        serviceName: selectedServiceToRequest.name,
                        supplierId: selectedServiceToRequest.supplierId,
                        supplierName: selectedServiceToRequest.supplierName,
                        category: selectedServiceToRequest.category,
                        description: serviceReqDesc.trim(),
                        location: serviceReqLocation.trim(),
                        estimatedCost: selectedServiceToRequest.price,
                        status: 'pendente',
                        notes: '',
                        createdAt: new Date().toISOString()
                      };

                      onCreateServiceRequest(newReq);
                      setSelectedServiceToRequest(null);
                      setServiceActiveTab('my-requests');
                      speak("O seu pedido de trabalho aduaneiro ou serralharia civil foi registado. Aguarde contacto do mediador.");
                      showModalAlert(
                        'Solicitação Efetuada',
                        `O seu pedido de serviço "${newReq.serviceName}" foi registado com sucesso sob o código ${newReq.id}!\n\nA equipa técnica do fornecedor "${newReq.supplierName}" juntamente com os fiscais do Mediador Cabinda irão emitir a proposta orçamental em até 12 horas úteis.`,
                        'success'
                      );
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Descreva pormenorizadamente a sua necessidade (Medidas, materiais, etc.) *
                      </label>
                      <textarea
                        value={serviceReqDesc}
                        onChange={(e) => setServiceReqDesc(e.target.value)}
                        placeholder="Ex: Preciso de fabricar uma grade pantográfica metálica para porta exterior com 2.10m x 0.90m, em ferro galvanizado pintado a esmalte cinzento..."
                        className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden"
                        rows={4}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Morada de Execução ou Entrega *</label>
                        <input
                          type="text"
                          value={serviceReqLocation}
                          onChange={(e) => setServiceReqLocation(e.target.value)}
                          placeholder="Ex: Cabinda Centro, Rua Direita nº 45"
                          className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Telemóvel de Contacto Directo *</label>
                        <input
                          type="text"
                          value={serviceReqPhone}
                          onChange={(e) => setServiceReqPhone(e.target.value)}
                          placeholder="Ex: +244 923..."
                          className="w-full p-3 border rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden"
                          required
                        />
                      </div>
                    </div>

                    <div className="bg-amber-50 p-4 border border-amber-100 rounded-2xl space-y-1.5 text-slate-850">
                      <p className="font-bold flex items-center gap-1.5 text-amber-900 text-[11px]">
                        <span>ℹ️</span> Informações Importantes:
                      </p>
                      <p className="text-[10px] leading-relaxed">
                        Este serviço será prestado pela oficina homologada <strong>{selectedServiceToRequest.supplierName}</strong>. 
                        O Mediador fiscaliza os prazos e garante que o seu adiantamento orçamental fica seguro até à aprovação e entrega final do trabalho em Cabinda.
                      </p>
                    </div>

                    <div className="pt-3 flex gap-3">
                      <button
                        type="submit"
                        className="bg-slate-950 hover:bg-slate-900 text-white font-extrabold px-5 py-3 rounded-xl uppercase tracking-wider cursor-pointer"
                      >
                        Enviar Solicitação de Serviço
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedServiceToRequest(null)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold px-5 py-3 rounded-xl uppercase tracking-wider cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {serviceRequests.filter(r => r.clientId === activeClientId).length > 0 ? (
                serviceRequests
                  .filter(r => r.clientId === activeClientId)
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((req) => {
                    const statusConfig = {
                      pendente: { bg: 'bg-yellow-50 border-yellow-200 text-yellow-800', label: '🕒 Aguardando Proposta' },
                      em_analise: { bg: 'bg-blue-50 border-blue-200 text-blue-800', label: '⚙️ Em Análise Técnica' },
                      aprovado: { bg: 'bg-green-50 border-green-200 text-green-800', label: '✅ Orçamento Aprovado' },
                      cancelado: { bg: 'bg-red-50 border-red-200 text-red-800', label: '❌ Cancelado' },
                      concluido: { bg: 'bg-indigo-50 border-indigo-200 text-indigo-800', label: '🎉 Concluído' }
                    }[req.status] || { bg: 'bg-slate-50 border-slate-200 text-slate-800', label: req.status };

                    return (
                      <div
                        key={req.id}
                        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="space-y-1 text-left">
                            <span className="font-mono text-[10px] font-black text-slate-400 block">CÓDIGO: {req.id}</span>
                            <h4 className="font-bold text-slate-900 text-xs">{req.serviceName}</h4>
                            <p className="text-[10px] text-slate-400 font-semibold">Oficina Parceira: <strong className="text-slate-700">{req.supplierName}</strong></p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${statusConfig.bg}`}>
                            {statusConfig.label}
                          </span>
                        </div>

                        <div className="space-y-3.5 text-xs text-slate-700">
                          <div>
                            <span className="block font-bold text-slate-500 uppercase text-[9px] tracking-wider">A Minha Descrição técnica:</span>
                            <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-1 italic leading-relaxed text-slate-600 font-semibold">
                              "{req.description}"
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-450 font-bold">
                            <div>
                              <span>LOCAL DE EXECUÇÃO:</span>
                              <p className="text-slate-800 text-[11px] font-bold mt-0.5">📍 {req.location}</p>
                            </div>
                            <div>
                              <span>CUSTO ESTIMADO DO SERVIÇO:</span>
                              <p className="text-slate-900 font-mono text-xs font-black mt-0.5">{req.estimatedCost.toLocaleString('pt-AO')} AOA</p>
                            </div>
                          </div>

                          {req.notes && (
                            <div className="bg-blue-50 text-blue-900 p-3.5 rounded-2xl border border-blue-100 space-y-1">
                              <span className="text-[9px] font-black uppercase tracking-widest block">💬 RESPOSTA DA OFICINA & FISCAL MEDIADOR:</span>
                              <p className="text-[10.5px] leading-relaxed font-semibold">
                                {req.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 p-6">
                  <span className="text-2xl block mb-2">📋</span>
                  <p className="text-xs text-slate-500 font-bold uppercase">Ainda não solicitou nenhum serviço técnico.</p>
                  <p className="text-[10px] text-slate-400 mt-1">Navegue no separador "Catálogo de Serviços" para requisitar.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 15) MERCADO DE FORNECEDORES (SUPPLIERS MARKETPLACE) */}
      {currentView === 'mercado-fornecedores' && (
        <div className="space-y-6 max-w-6xl mx-auto animate-fade-in" id="mercado-fornecedores-screen">
          
          {/* Header Banner - Intermediation mandatory */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg border border-slate-800">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 space-y-3">
              <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest inline-flex items-center gap-1.5 shadow-sm">
                <Shield className="w-3 h-3 text-slate-950" /> Intermediação Segura Obrigatória
              </span>
              <h2 className="font-display font-black text-xl sm:text-2xl tracking-tight text-white">Mercado de Fornecedores Parceiros</h2>
              <p className="text-xs text-slate-350 max-w-2xl font-medium leading-relaxed">
                Explore produtos homologados de fornecedores de Luanda e Cabinda. Por motivos de segurança operacional e proteção contra fraudes, todos os contactos pessoais permanecem estritamente protegidos. Suas compras e despachos são garantidos pelo <strong>Mediador Cabinda</strong>.
              </p>
              
              <div className="p-3 bg-slate-950/50 rounded-2xl border border-white/5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] text-amber-300">
                <p className="flex items-center gap-1.5 font-bold">
                  <span>🔒</span> Sem Contactos Expostos
                </p>
                <p className="flex items-center gap-1.5 font-bold">
                  <span>⚓</span> Cabotagem Marítima Integrada
                </p>
                <p className="flex items-center gap-1.5 font-bold">
                  <span>📄</span> Faturação e Garantia Legal
                </p>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 gap-4 flex flex-col md:flex-row md:items-center justify-between shadow-xs">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={supplierSearchText}
                placeholder="Pesquisar por fornecedores ou produtos..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-amber-400 focus:bg-white text-slate-800"
                id="supplier-search-input"
                onChange={(e) => setSupplierSearchText(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={supplierSelectedCategory}
                className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
                id="supplier-cat-filter"
                onChange={(e) => setSupplierSelectedCategory(e.target.value)}
              >
                <option value="all">Todas as Categorias</option>
                <option value="Eletrónicos e Tecnologia">Eletrónicos e Tecnologia</option>
                <option value="Construção e Metalurgia">Construção e Metalurgia</option>
                <option value="Máquinas e Equipamentos">Máquinas e Equipamentos</option>
                <option value="Material Elétrico">Material Elétrico</option>
              </select>

              <select
                value={supplierSelectedCity}
                className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
                id="supplier-city-filter"
                onChange={(e) => setSupplierSelectedCity(e.target.value)}
              >
                <option value="all">Todas as Cidades</option>
                <option value="Luanda">Luanda</option>
                <option value="Cabinda">Cabinda</option>
              </select>
            </div>
          </div>

          {/* Suppliers Grid sorted by Sponsor Tier & plan */}
          <div className="space-y-8">
            {filteredSuppliersList.map((sup) => {
              const planConfig = {
                diamante: {
                  border: 'border-2 border-amber-400 bg-amber-50/5',
                  badge: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black',
                  label: '⭐ Patrocinado Diamante',
                  cardStyle: 'shadow-md shadow-amber-100/30'
                },
                ouro: {
                  border: 'border border-amber-300 hover:border-amber-400 bg-amber-50/2',
                  badge: 'bg-amber-450 text-slate-950 font-bold',
                  label: '⭐ Patrocinado Ouro',
                  cardStyle: 'shadow-xs'
                },
                prata: {
                  border: 'border border-slate-250 bg-slate-50/10',
                  badge: 'bg-slate-400 text-white font-bold',
                  label: 'Destaque Prata',
                  cardStyle: 'shadow-xs'
                },
                gratuito: {
                  border: 'border border-slate-200 bg-white',
                  badge: 'bg-slate-100 text-slate-500 font-medium',
                  label: 'Membro Homologado',
                  cardStyle: 'shadow-xs'
                }
              }[sup.plan];

              const productsForThisSupplier = supplierProducts.filter(
                (p) => p.supplierId === sup.id && p.published &&
                  (!supplierSearchText.trim() || p.name.toLowerCase().includes(supplierSearchText.toLowerCase()))
              );

              return (
                <div 
                  key={sup.id}
                  className={`rounded-3xl p-5 sm:p-6 transition-all ${planConfig.border} ${planConfig.cardStyle}`}
                  id={`supplier-group-${sup.id}`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-dashed border-slate-200">
                    <div className="flex items-start sm:items-center gap-4">
                      {sup.logoUrl ? (
                        <img 
                          src={sup.logoUrl} 
                          alt={sup.name} 
                          className="w-14 h-14 rounded-2xl object-cover bg-slate-100 border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-250 flex items-center justify-center text-slate-400 text-lg font-bold">
                          {sup.name.charAt(0)}
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display font-black text-slate-900 text-sm tracking-tight">{sup.name}</h3>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider ${planConfig.badge}`}>
                            {planConfig.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-550 font-semibold">
                          <span className="flex items-center gap-1">📍 {sup.city}</span>
                          <span className="text-slate-300">•</span>
                          <span className="bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded-md text-[10px]">{sup.category}</span>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-0.5 text-amber-500 font-bold">★ {sup.rating} <span className="text-slate-400 font-medium">({sup.reviewsCount})</span></span>
                        </div>
                        {sup.description && (
                          <p className="text-xs text-slate-500 max-w-2xl mt-1 leading-relaxed">{sup.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-start lg:items-end justify-center shrink-0">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">🔒 CONTACTOS EXCLUSIVOS</p>
                      <span className="text-xs px-3 py-1 bg-emerald-50 text-emerald-800 font-extrabold rounded-lg inline-flex items-center gap-1.5 border border-emerald-100 mt-1">
                        ✔️ Mediado pelo Mediador Cabinda
                      </span>
                      <button
                        onClick={() => {
                          setSelectedSupplierForMessage(sup);
                          setShowSupplierMessageModal(true);
                          setSupplierMessageText('');
                          speak(`A abrir canal de mensagem para o fornecedor ${sup.name}`);
                        }}
                        className="mt-2.5 w-full lg:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <span>💬</span> Enviar Mensagem ao Fornecedor
                      </button>
                    </div>
                  </div>

                  {/* Supplier's Products List */}
                  <div className="pt-5 space-y-3">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">CATÁLOGO DE PRODUTOS PARCEIROS</p>
                    {productsForThisSupplier.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 italic">Sem produtos disponíveis para este fornecedor no momento.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {productsForThisSupplier.map((prod) => {
                          const isEsgotado = prod.availability === 'esgotado' || prod.stock === 0;
                          return (
                            <div 
                              key={prod.id} 
                              className="bg-slate-50/50 hover:bg-white transition-all border border-slate-150 p-3 rounded-2xl flex flex-col justify-between group h-full hover:shadow-xs"
                              id={`supplier-product-${prod.id}`}
                            >
                              <div className="space-y-2">
                                {/* image & tag */}
                                <div className="relative aspect-video rounded-xl bg-slate-100 overflow-hidden border border-slate-150">
                                  {prod.photoUrl ? (
                                    <img 
                                      src={prod.photoUrl} 
                                      alt={prod.name} 
                                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-350">
                                      <span>Sem imagem</span>
                                    </div>
                                  )}
                                  
                                  {/* Availability tag */}
                                  <div className="absolute top-2 right-2">
                                    {isEsgotado ? (
                                      <span className="bg-red-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                                        Esgotado
                                      </span>
                                    ) : prod.availability === 'sob-pedido' ? (
                                      <span className="bg-amber-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                                        Sob Pedido
                                      </span>
                                    ) : (
                                      <span className="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm animate-pulse-subtle">
                                        Em Stock
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Title & details */}
                                <div className="space-y-1">
                                  <h4 className="font-bold text-xs text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">{prod.name}</h4>
                                  <p className="text-[10px] text-slate-405 line-clamp-2 leading-relaxed font-semibold">{prod.description || 'Disponível para aquisição de Cabinda por intermediação.'}</p>
                                </div>

                                {/* Location & Availability metadata */}
                                <div className="mt-2 space-y-1 bg-slate-100/50 p-2 rounded-xl text-[9.5px] text-slate-600 font-bold border border-slate-200">
                                  <div className="flex items-center justify-between">
                                    <span>📍 Localização do Artigo:</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[9.5px] ${
                                      prod.location === 'Cabinda' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                                    }`}>
                                      {prod.location || 'Luanda'}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span>📅 Disponível para Envio:</span>
                                    <span className="text-slate-800">
                                      {prod.availableFromDate || 'Imediata'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Price and Action CTA */}
                              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                <div className="space-y-0.5">
                                  <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider block">PREÇO BASE</span>
                                  <span className="font-mono text-xs font-black text-slate-900 tracking-tight">
                                    {prod.price.toLocaleString('pt-AO')} AOA
                                  </span>
                                </div>

                                <button
                                  onClick={() => {
                                    if (isEsgotado) {
                                      showModalAlert(
                                        "Sem Ração / Stock", 
                                        "Este produto encontra-se esgotado de momento. Contacte o suporte para encomendar sob pedido ou encontrar alternativas.", 
                                        "warning"
                                      );
                                      return;
                                    }
                                    
                                    // Trigger quick buy! Auto-populate create order form!
                                    // Let's create an intuitive auto-filling routine inside state:
                                    const prefilledName = prod.name;
                                    const prefilledPrice = prod.price;
                                    const prefilledSupplier = sup.name;
                                    const prefilledSupplierId = sup.id;
                                    const prefilledPhoto = prod.photoUrl;
                                    const prefilledLocation = prod.location;
                                    const prefilledAvailableFromDate = prod.availableFromDate;
                                    
                                    // Switch views and store prefilled details so FazerPedido reads them!
                                    setPrefilledMarketProduct({
                                      name: prefilledName,
                                      price: prefilledPrice,
                                      supplierName: prefilledSupplier,
                                      supplierId: prefilledSupplierId,
                                      photoUrl: prefilledPhoto,
                                      location: prefilledLocation,
                                      availableFromDate: prefilledAvailableFromDate
                                    });
                                    
                                    setCurrentView('fazer-pedido');
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-xs ${
                                    isEsgotado 
                                      ? 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-150'
                                      : 'bg-amber-400 hover:bg-amber-500 text-slate-950 hover:scale-[1.02]'
                                  }`}
                                  id={`buy-from-supplier-${prod.id}`}
                                >
                                  <span>🛒</span> Comprar pelo Mediador
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredSuppliersList.length === 0 && (
              <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                <span className="text-3xl block mb-2">🔍</span>
                <p className="text-xs text-slate-500 font-bold uppercase">Nenhum fornecedor ou produto corresponde aos filtros</p>
                <p className="text-[11px] text-slate-400 mt-1">Experimente limpar a sua pesquisa ou trocar os filtros de categoria e cidade.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NOTIFICATION DETAILS AND REPLY MODAL */}
      {showNotificationModal && selectedNotificationForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in" id="notification-detail-modal">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden text-slate-800">
            <div className="p-4 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-900">
                <span>🔔</span>
                <h4 className="font-extrabold text-xs uppercase tracking-wider font-display">Aviso do Mediador</h4>
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
              
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-semibold leading-relaxed text-slate-750 whitespace-pre-line">
                {selectedNotificationForModal.message}
              </div>

              {selectedNotificationForModal.orderId && (
                <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 flex items-center justify-between gap-2 text-[11px]">
                  <span className="font-extrabold text-sky-900">Esta notificação refere-se ao Pedido #{selectedNotificationForModal.orderId}</span>
                  <button
                    onClick={() => {
                      setSelectedOrderId(selectedNotificationForModal.orderId);
                      setOrderDetailTab('tracker');
                      setCurrentView('acompanhar-pedido');
                      setShowNotificationModal(false);
                      setSelectedNotificationForModal(null);
                      speak("A abrir acompanhamento do pedido");
                    }}
                    className="shrink-0 px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-lg text-[10px] transition-all cursor-pointer"
                  >
                    Ver Pedido
                  </button>
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
                  speak("Chat de Atendimento Directo Aberto. Pode escrever a sua resposta ao Diretor Geral.");
                }}
                className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>💬</span> Responder ao Diretor Geral
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECURE INTERMEDIARY SUPPLIER MESSAGE MODAL */}
      {showSupplierMessageModal && selectedSupplierForMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in" id="supplier-message-modal">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden text-slate-800">
            <div className="p-4 bg-slate-900 border-b border-slate-850 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="text-sm">🏭</span>
                <h4 className="font-extrabold text-xs uppercase tracking-wider font-display">Mensagem ao Fornecedor (Intermediado)</h4>
              </div>
              <button 
                onClick={() => {
                  setShowSupplierMessageModal(false);
                  setSelectedSupplierForMessage(null);
                }}
                className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!supplierMessageText.trim()) return;

              // Post supplier message into global state conforming to SupplierMessage interface
              onSendSupplierMessage({
                id: `sm-${Date.now()}`,
                supplierId: selectedSupplierForMessage.id,
                sender: 'mediador',
                text: `[Mensagem do Cliente] ${supplierMessageText.trim()}`,
                timestamp: new Date().toISOString(),
                read: false
              });

              // Dispatch general message which reaches directly the general support manager desk so that the manager sees it on they sidebar!
              onSendMessage(
                'general', 
                `[Intermediação Fornecedor: ${selectedSupplierForMessage.name}]\n${supplierMessageText.trim()}`,
                undefined,
                false,
                'client'
              );

              showModalAlert(
                "Inquérito Enviado Real",
                `Graças à intermediação segura do Mediador Cabinda, sua mensagem para "${selectedSupplierForMessage.name}" foi registada com sucesso!\n\nO Diretor Geral recebeu de imediato o inquérito e fará o contacto e negociação direta de preços por si. As respostas serão consolidadas no seu canal de Atendimento Direto.`,
                "success"
              );

              speak("Mensagem encaminhada com sucesso ao Diretor Geral.");
              setShowSupplierMessageModal(false);
              setSelectedSupplierForMessage(null);
              setSupplierMessageText('');
            }}>
              <div className="p-5 space-y-4">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-start gap-2.5">
                  <span className="text-xl">🛡️</span>
                  <div className="space-y-1">
                    <p className="font-extrabold text-[10px] text-slate-500 uppercase tracking-wider">Normas de Intermediação de Cabinda</p>
                    <p className="text-[11px] text-slate-550 leading-relaxed font-semibold">
                      Para sua conveniência e garantia, esta comunicação passa pelo **Mediador Cabinda**. O Diretor Geral irá pessoalmente falar com o fornecedor **{selectedSupplierForMessage.name}** para validar stock físico e negociar o transporte marítimo para evitar fraudes ou inflação de preço.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Fornecedor Selecionado</label>
                  <p className="text-xs font-black text-slate-800 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-150 flex items-center gap-1.5">
                    <span>🏭</span> {selectedSupplierForMessage.name} ({selectedSupplierForMessage.city})
                  </p>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-[10px] text-slate-405 font-extrabold uppercase tracking-wider">A sua Mensagem ou Requisito Técnico</label>
                  <textarea
                    required
                    value={supplierMessageText}
                    onChange={(e) => setSupplierMessageText(e.target.value)}
                    placeholder="Escreva aqui o que precisa pedir ao fornecedor (exemplo: preço, disponibilidade do material, especificações técnicas)..."
                    rows={4}
                    className="w-full text-xs font-semibold p-3.5 border border-slate-200 rounded-2xl focus:border-slate-400 focus:ring-1 focus:ring-slate-400 focus:outline-hidden leading-relaxed resize-none text-slate-800"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowSupplierMessageModal(false);
                    setSelectedSupplierForMessage(null);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2 bg-slate-900 hover:bg-slate-855 active:scale-95 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Enviar ao Diretor Geral 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔮 INTER-COMMERCE PRODUCT DETAIL & DIRECT BUY MODAL OVERLAY */}
      {selectedProduct && (() => {
        const sup = suppliers.find(s => s.id === selectedProduct.supplierId);
        const isEsgotado = selectedProduct.availability === 'esgotado' || selectedProduct.stock === 0;
        const prodCode = getProductCode(selectedProduct);
        const itemSubtotal = selectedProduct.price * directBuyQty;
        const freightEst = 12000 * directBuyQty;
        const dispatchEst = 8000;
        const commEst = Math.round(itemSubtotal * 0.12);
        const deliveryFee = directBuyDelivery === 'domicilio' ? 5000 : 0;
        const grandTotalEst = itemSubtotal + freightEst + dispatchEst + commEst + deliveryFee;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in" id="product-detail-modal-overlay">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-150 overflow-hidden animate-scale-up text-slate-800 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-amber-500 text-lg">{isDirectBuyMode ? '⚡' : '🛍️'}</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {isDirectBuyMode ? 'Solicitação de Compra Direta' : 'Detalhes do Artigo Homologado'}
                    </span>
                    <span className="text-xs font-mono font-black text-amber-800 flex items-center gap-1">
                      🏷️ Código: {prodCode}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProduct(null);
                    setIsDirectBuyMode(false);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 rounded-xl transition-all cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable details / Direct Buy Flow */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 scrollbar-none">
                {!isDirectBuyMode ? (
                  <>
                    {/* Photo & Badge */}
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-150 bg-slate-50 shrink-0">
                      {selectedProduct.photoUrl ? (
                        <img 
                          src={selectedProduct.photoUrl} 
                          alt={selectedProduct.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold">
                          Sem Foto Disponível
                        </div>
                      )}

                      {/* Product Identity Watermark Tag */}
                      <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-xs text-white font-mono font-black text-[10px] px-2.5 py-1 rounded-lg border border-white/20 shadow-md flex items-center gap-1.5">
                        <span>🏷️ CÓDIGO:</span>
                        <span className="text-amber-400">{prodCode}</span>
                      </div>

                      {selectedProduct.sponsored && (
                        <span className="absolute top-3 left-3 bg-amber-400 text-slate-950 font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                          Destaque Homologado
                        </span>
                      )}
                    </div>

                    {/* Main details */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-black text-slate-900 tracking-tight font-sans leading-snug">
                          {selectedProduct.name}
                        </h3>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] font-bold text-slate-500">
                        <span className="flex items-center gap-1 text-slate-700">🏷️ SKU: <strong>{prodCode}</strong></span>
                        <span>•</span>
                        <span className="flex items-center gap-1">📍 Origem: <strong>{selectedProduct.location || 'Luanda'}</strong></span>
                        <span>•</span>
                        <span className="flex items-center gap-1">📅 Disp.: <strong>{selectedProduct.availableFromDate || 'Imediata (Hoje)'}</strong></span>
                        <span>•</span>
                        <span>Fornecedor: <strong>{sup?.name || 'Distribuidor Parceiro'}</strong></span>
                        <span>•</span>
                        <span className={`px-2 py-0.5 rounded-full font-black ${
                          isEsgotado ? 'bg-red-50 text-red-650' : selectedProduct.availability === 'sob-pedido' ? 'bg-blue-50 text-blue-750' : 'bg-emerald-50 text-emerald-800'
                        }`}>
                          {isEsgotado ? 'Esgotado' : selectedProduct.availability === 'sob-pedido' ? 'Sob Pedido' : 'Disponível em Stock'}
                        </span>
                      </div>
                    </div>

                    {/* Price block */}
                    <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">Preço de Compra Intermediado</span>
                        <span className="font-mono text-lg font-black text-slate-900 tracking-tight block">
                          {selectedProduct.price.toLocaleString('pt-AO')} Kz
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold text-amber-900 bg-amber-200 px-3 py-1 rounded-full border border-amber-300">
                        Com Despacho & Alfândega
                      </span>
                    </div>

                    {/* Specifications & description */}
                    <div className="space-y-2.5">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Especificações & Qualidade Técnica</h4>
                      <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl text-xs font-semibold leading-relaxed text-slate-600 space-y-1">
                        <p>{selectedProduct.description || 'Produto homologado de alta qualidade técnica e robustez, testado pela equipa alfandegária.'}</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-3 mt-3 border-t border-slate-200/60 text-[10px] font-bold text-slate-500">
                          <p>📋 Estado: <span className="text-slate-800">Novo em Caixa</span></p>
                          <p>📦 Stock Físico: <span className="text-slate-800">{isEsgotado ? 'Sem stock' : `${selectedProduct.stock} unidades`}</span></p>
                          <p>🏷️ Cód. Identidade: <span className="font-mono text-amber-700 font-black">{prodCode}</span></p>
                          <p>🛡️ Garantia: <span className="text-slate-800">Intermediação Mediador</span></p>
                        </div>
                      </div>
                    </div>

                    {/* Protection warning */}
                    <div className="bg-sky-50 border border-sky-100 p-3.5 rounded-2xl text-[10px] text-sky-800 flex items-start gap-2 leading-relaxed font-bold">
                      <span>⚓</span>
                      <p>Por motivos de faturamento legal e proteção contra burlas comerciais, a compra é integralmente mediada pela equipa do <strong>Mediador Cabinda</strong>. Nós compramos e fazemos a entrega.</p>
                    </div>
                  </>
                ) : (
                  /* DIRECT BUY QUICK FORM */
                  <div className="space-y-4 animate-fade-in">
                    {/* Selected product bar */}
                    <div className="bg-amber-500/10 border border-amber-200 p-3 rounded-2xl flex items-center gap-3">
                      <img 
                        src={selectedProduct.photoUrl} 
                        alt={selectedProduct.name} 
                        className="w-14 h-14 rounded-xl object-cover border border-amber-200 bg-white shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="overflow-hidden flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-mono text-[9px] font-black text-amber-900 bg-amber-200 px-1.5 py-0.5 rounded-md">
                            {prodCode}
                          </span>
                          <span className="text-[9px] text-slate-500 font-bold">📍 {selectedProduct.location || 'Luanda'}</span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 truncate">{selectedProduct.name}</h4>
                        <p className="font-mono text-xs font-black text-slate-900 mt-0.5">
                          {selectedProduct.price.toLocaleString('pt-AO')} AOA / unid.
                        </p>
                      </div>
                    </div>

                    {/* Quantity Picker */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Quantidade Pretendida</span>
                        <span className="text-[10px] text-slate-500">Stock disponível: {selectedProduct.stock || 10} unid.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDirectBuyQty(prev => Math.max(1, prev - 1))}
                          className="w-8 h-8 rounded-lg bg-white border border-slate-250 text-slate-800 font-black text-sm flex items-center justify-center hover:bg-slate-100 cursor-pointer shadow-2xs"
                        >
                          -
                        </button>
                        <span className="font-mono font-black text-sm w-6 text-center text-slate-900">
                          {directBuyQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setDirectBuyQty(prev => prev + 1)}
                          className="w-8 h-8 rounded-lg bg-white border border-slate-250 text-slate-800 font-black text-sm flex items-center justify-center hover:bg-slate-100 cursor-pointer shadow-2xs"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Delivery Mode */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                        Modalidade de Entrega em Cabinda
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setDirectBuyDelivery('escritorio')}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            directBuyDelivery === 'escritorio'
                              ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-xs block">🏢 Balcão Porto Cabinda</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">Armazém C-4 (Sem custo extra)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDirectBuyDelivery('domicilio')}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            directBuyDelivery === 'domicilio'
                              ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-xs block">🚚 Entrega ao Domicílio</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">+5.000 AOA em Cabinda</span>
                        </button>
                      </div>

                      {directBuyDelivery === 'domicilio' && (
                        <div className="pt-1">
                          <input
                            type="text"
                            value={directBuyAddress}
                            onChange={e => setDirectBuyAddress(e.target.value)}
                            placeholder="Indique o Bairro, Rua e Ponto de Referência em Cabinda..."
                            className="w-full text-xs p-2.5 bg-white border border-slate-250 rounded-xl focus:border-amber-400 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                        Instruções ou Observações (Opcional)
                      </label>
                      <input
                        type="text"
                        value={directBuyNotes}
                        onChange={e => setDirectBuyNotes(e.target.value)}
                        placeholder="Ex: Por favor confirmar se inclui cabos/acessórios, cor preta..."
                        className="w-full text-xs p-2.5 bg-white border border-slate-250 rounded-xl focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    {/* Estimated Cost Breakdown */}
                    <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-1.5 text-xs font-semibold text-slate-600">
                      <div className="flex justify-between">
                        <span>Valor dos Artigos ({directBuyQty}x):</span>
                        <span className="font-mono text-slate-900 font-bold">{itemSubtotal.toLocaleString('pt-AO')} Kz</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Estimativa de Frete Luanda ➔ Cabinda:</span>
                        <span className="font-mono">{freightEst.toLocaleString('pt-AO')} Kz</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Despacho Aduaneiro & Guia de Cabotagem:</span>
                        <span className="font-mono">{dispatchEst.toLocaleString('pt-AO')} Kz</span>
                      </div>
                      {directBuyDelivery === 'domicilio' && (
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span>Taxa de Entrega ao Domicílio:</span>
                          <span className="font-mono">5.000 Kz</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                        <span className="font-bold text-slate-900">Total Estimado da Operação:</span>
                        <span className="font-mono text-sm font-black text-amber-700">
                          {grandTotalEst.toLocaleString('pt-AO')} Kz
                        </span>
                      </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-[10px] text-emerald-900 font-bold flex items-start gap-2">
                      <span>✓</span>
                      <p>Sem pagamento imediato obrigatório. A nossa equipa entrará em contacto para confirmar o artigo, validar a fatura comercial e emitir a fatura pro-forma oficial.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 3 ACTION BUTTONS (CATALOG / CHAT / DIRECT BUY) */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
                {!isDirectBuyMode ? (
                  <>
                    {/* Opção 1: Voltar ao Catálogo */}
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(null)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all h-11 shrink-0 cursor-pointer"
                    >
                      Voltar ao Catálogo
                    </button>
                    
                    {/* Opção 2: Consultar Vendedor (Chat & IA) com Código e Foto */}
                    <button
                      type="button"
                      onClick={() => {
                        const originLoc = selectedProduct.location || 'Luanda';
                        const inquiryMsg = `Olá Mediador Cabinda! Gostaria de intermediar a aquisição do artigo [CÓDIGO: ${prodCode}] "${selectedProduct.name}" anunciado pelo parceiro de ${originLoc}. Podem verificar a viabilidade aduaneira e emissão de guia de transporte? Preço Base: ${selectedProduct.price.toLocaleString('pt-AO')} AOA.`;
                        
                        localStorage.setItem('mediador_prefilled_product_message', inquiryMsg);
                        localStorage.setItem('mediador_active_channel', 'general');
                        
                        setSelectedProduct(null);
                        setCurrentView('mensagens');
                        speak(`Iniciando chat operacional de intermediação para o artigo código ${prodCode}`);
                      }}
                      className="flex-1 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 h-11 cursor-pointer shadow-xs"
                    >
                      <span>💬</span> Consultar Vendedor
                    </button>

                    {/* Opção 3: Fazer Compra Direta / Solicitar Aquisição Imediata */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsDirectBuyMode(true);
                        speak(`Preparando compra direta para o artigo ${selectedProduct.name}`);
                      }}
                      className="flex-1 px-4 py-2.5 bg-amber-400 hover:bg-amber-500 active:scale-98 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 h-11 cursor-pointer shadow-md font-display uppercase tracking-wider"
                    >
                      <span>⚡</span> Fazer Compra Direta
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsDirectBuyMode(false)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all h-11 shrink-0 cursor-pointer"
                    >
                      ← Voltar aos Detalhes
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const newOrderId = `MED-${Math.floor(1000 + Math.random() * 9000)}`;
                        const newOrder: Order = {
                          id: newOrderId,
                          clientId: activeClientId,
                          clientName: client?.name || 'Cliente Cabinda',
                          clientPhone: client?.phone || '+244 923 000 000',
                          productId: selectedProduct.id,
                          productCode: prodCode,
                          productName: selectedProduct.name,
                          quantity: directBuyQty,
                          supplierName: sup?.name || 'Fornecedor Homologado',
                          supplierPhone: sup?.phoneHidden || '+244 924 111 222',
                          supplierLocation: selectedProduct.location || 'Luanda',
                          productPhotoUrl: selectedProduct.photoUrl,
                          notes: directBuyNotes ? `[Compra Direta SKU: ${prodCode}] ${directBuyNotes}` : `Compra Direta do artigo ${prodCode} - ${selectedProduct.name}`,
                          budgetRawPrice: itemSubtotal,
                          budgetShipping: freightEst,
                          dispatchFee: dispatchEst,
                          commissionRate: 0.12,
                          commissionAmount: commEst,
                          totalAmount: grandTotalEst,
                          paid: false,
                          deliveryOption: directBuyDelivery,
                          deliveryAddress: directBuyDelivery === 'domicilio' ? (directBuyAddress || 'Cabinda') : 'Balcão Armazém C-4, Porto Comercial de Cabinda',
                          status: 'RECEBIDO',
                          pointsEarned: Math.round(itemSubtotal / 1000),
                          createdAt: new Date().toISOString()
                        };

                        onAddOrder(newOrder);
                        speak(`Solicitação de compra direta do artigo ${selectedProduct.name} registada com sucesso!`);
                        setSelectedProduct(null);
                        setIsDirectBuyMode(false);
                        setDirectBuySuccessOrder(newOrder);
                      }}
                      className="flex-1 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 h-11 cursor-pointer shadow-md font-display uppercase tracking-wider"
                    >
                      <span>🚀</span> Confirmar e Enviar Pedido
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 🎉 DIRECT BUY SUCCESS CELEBRATION MODAL */}
      {directBuySuccessOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in" id="direct-buy-success-modal">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-scale-up text-slate-800 flex flex-col">
            {/* Celebration Header */}
            <div className="p-5 bg-linear-to-r from-emerald-600 to-teal-700 text-white text-center relative">
              <span className="text-3xl block mb-1">🎉</span>
              <h3 className="font-extrabold text-base font-display">Solicitação de Compra Recebida!</h3>
              <p className="text-[11px] text-emerald-100 font-medium mt-0.5">
                A nossa equipa em Luanda e Cabinda foi notificada para dar início à validação.
              </p>
            </div>

            {/* Content summary */}
            <div className="p-5 space-y-4">
              {/* Product mini card */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-center gap-3">
                {directBuySuccessOrder.productPhotoUrl && (
                  <img 
                    src={directBuySuccessOrder.productPhotoUrl} 
                    alt={directBuySuccessOrder.productName} 
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 bg-white shrink-0"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="overflow-hidden flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                    <span className="font-mono text-[9px] font-black text-amber-900 bg-amber-200 px-1.5 py-0.5 rounded-md">
                      🏷️ {directBuySuccessOrder.productCode || 'PRD-1001'}
                    </span>
                    <span className="font-mono text-[9px] font-bold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded-md">
                      📦 {directBuySuccessOrder.id}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 truncate">{directBuySuccessOrder.productName}</h4>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                    Qtd: {directBuySuccessOrder.quantity} • Total Estimado: <strong className="text-slate-800 font-mono">{(directBuySuccessOrder.totalAmount || 0).toLocaleString('pt-AO')} Kz</strong>
                  </p>
                </div>
              </div>

              {/* Step info */}
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-[11px] text-amber-900 font-medium space-y-1">
                <p className="font-bold">📋 Próximos Passos:</p>
                <p>1. O Mediador contacta o distribuidor e faz a inspeção do artigo.</p>
                <p>2. Emitimos a fatura pro-forma oficial com comprovativo aduaneiro.</p>
                <p>3. Você acompanha o frete e levanta o artigo com garantia total!</p>
              </div>

              {/* Direct WhatsApp trigger button */}
              <a
                href={`https://wa.me/244942043293?text=${encodeURIComponent(
                  `Olá Mediador Cabinda! Acabei de solicitar a compra direta do artigo [CÓDIGO: ${directBuySuccessOrder.productCode || 'PRD-1001'}] "${directBuySuccessOrder.productName}".\n\nNº do Pedido: ${directBuySuccessOrder.id}\nQuantidade: ${directBuySuccessOrder.quantity}\nCliente: ${client?.name || 'Cliente'} (${client?.phone || '+244 923 000 000'})\n\nPodem verificar a receção e avançar com o despacho?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-md uppercase tracking-wider"
              >
                <span>📱</span> Notificar Equipa no WhatsApp com Código ➔
              </a>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setDirectBuySuccessOrder(null)}
                className="w-full sm:w-auto px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Continuar no Catálogo
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedOrderId(directBuySuccessOrder.id);
                  setDirectBuySuccessOrder(null);
                  setCurrentView('acompanhar-pedido');
                }}
                className="flex-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>🚚</span> Acompanhar Pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PERFECTLY CENTERED, DYNAMIC AND RESPONSIVE CLIENT MODAL DIALOG OVERLAY */}
      {customDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in" id="custom-client-modal">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-250 overflow-hidden animate-scale-up text-slate-800">
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
            
            <div className="p-5 text-xs text-slate-600 font-semibold leading-relaxed whitespace-pre-line">
              {customDialog.message}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setCustomDialog(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Prosseguir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CABOTAGE MANIFESTO & FICTIVE PRÓ-FORMA OFFICIAL SLIP MODAL */}
      {showCabotageSlip && activeOrder && (
        <div className="fixed inset-0 bg-slate-950/90 z-55 flex items-center justify-center p-4 overflow-y-auto" id="cabotage-invoice-modal">
          <div id="printable-invoice-wrapper" className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl text-slate-800 leading-normal font-sans animate-scale-up relative my-8">
             {/* Close Trigger */}
             <button 
               type="button" 
               onClick={() => setShowCabotageSlip(false)}
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

             {/* Grid detail of Sender / Receiver */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-left">
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                 <p className="text-[7px] font-black uppercase text-slate-400 tracking-wider">Origem das Cargas ({activeOrder.supplierLocation?.toLowerCase().includes('cabinda') ? 'Cabinda' : 'Luanda'})</p>
                 <p className="font-extrabold text-slate-800">Polo Fornecedor Geral</p>
                 <p className="text-[10px] text-slate-500"><strong>Fornecedor:</strong> {activeOrder.supplierName || 'Parceiro Local'}</p>
                 <p className="text-[10px] text-slate-500"><strong>Contacto:</strong> {activeOrder.supplierPhone || '+244 912 000 111'}</p>
                 <p className="text-[10px] text-slate-500"><strong>Despacho:</strong> {activeOrder.supplierLocation?.toLowerCase().includes('cabinda') ? 'Porto de Cabinda, Cais de Cabotagem' : 'Porto de Luanda, Terminal de Cabotagem Sogester'}</p>
               </div>

               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                 <p className="text-[7px] font-black uppercase text-slate-400 tracking-wider">Destino em {activeOrder.supplierLocation?.toLowerCase().includes('cabinda') ? 'Luanda' : 'Cabinda'}</p>
                 <p className="font-extrabold text-slate-800">{activeOrder.clientName}</p>
                 <p className="text-[10px] text-slate-500"><strong>Telemóvel:</strong> {activeOrder.clientPhone}</p>
                 <p className="text-[10px] text-slate-500"><strong>Entrega:</strong> {activeOrder.deliveryOption === 'domicilio' ? activeOrder.deliveryAddress : (activeOrder.supplierLocation?.toLowerCase().includes('cabinda') ? 'Polo Geral Mediador (Luanda Central)' : 'Polo Geral Mediador (Rua da Amizade, Cabinda Central)')}</p>
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
                   const activeClient = clients.find(c => c.id === activeClientId);
                   const clientTier = activeClient?.tier || 'Standard';
                   downloadOrderInvoice(activeOrder, clientTier);
                   showModalAlert('Fatura Descarregada', 'A fatura oficial offline foi gerada com sucesso e guardada no seu dispositivo.', 'success');
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
                   setShowCabotageSlip(false);
                   showModalAlert('Fatura Impressa', 'O documento auxiliar de desembaraço comercial foi arquivado no seu histórico de transferências.', 'success');
                 }}
                 className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer font-sans"
               >
                 Fechar Fatura
               </button>
             </div>
          </div>
        </div>
      )}

      {/* 16) ABA DE PARCERIAS E COMISSIONADOS (AFILIADOS JOVENS) */}
      {currentView === 'parceria' && (() => {
        const activeClientObj = clients.find(cl => cl.id === activeClientId);
        const activeEmail = activeClientObj?.email || '';
        const activePhone = activeClientObj?.phone || '';
        const activeName = activeClientObj?.name || '';

        // Match partner record dynamically
        const matchedColab = collaborators.find(col => 
          (activeEmail && col.email === activeEmail) || 
          (activePhone && col.phone === activePhone) || 
          (activeName && col.name.toLowerCase() === activeName.toLowerCase())
        );

        // Fetch referred sales
        const referredSales = matchedColab ? collaboratorSales.filter(s => s.collaboratorId === matchedColab.id) : [];
        const referredSalesVolume = referredSales.reduce((acc, s) => acc + (s.saleAmount || 0), 0);
        const earnedComissionsPaid = referredSales.filter(s => s.status === 'pago').reduce((acc, s) => acc + (s.calculatedCommission || 0), 0);
        const earnedComissionsPending = referredSales.filter(s => s.status === 'pendente').reduce((acc, s) => acc + (s.calculatedCommission || 0), 0);
        const totalCommissionsAll = earnedComissionsPaid + earnedComissionsPending;

        const formatCurrency = (val: number) => {
          return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0 }).format(val);
        };

        const handleRegisterAsPartner = () => {
          if (!activeClientObj) {
            showModalAlert('Sessão em falta', 'Por favor, inicie sessão ou finalize o registo da sua conta primeiro.', 'warning');
            return;
          }
          const colId = `colab-client-${Date.now()}`;
          const newCol: Collaborator = {
            id: colId,
            name: activeClientObj.name,
            phone: activeClientObj.phone || '+244 923 000 000',
            email: activeClientObj.email,
            role: 'Parceiro Jovem Afiliado',
            defaultCommissionPercentage: 15, // Promoted with 15% immediately!
            totalSalesBrought: 0,
            totalEarnedCommissions: 0,
            joinedAt: new Date().toISOString()
          };

          onUpdateCollaborators([...collaborators, newCol]);
          showModalAlert('Registo Concluído! 🎉', `Parabéns ${activeClientObj.name}! Agora é um parceiro oficial do Mediador Cabinda. A sua calculadora automática de comissão (15%) já está habilitada para o seu perfil.`, 'success');
          speak(`Registo como parceiro concluído com sucesso! Bem-vindo à equipa comercial.`);
        };

        return (
          <div className="space-y-6 max-w-6xl mx-auto animate-fade-in text-left text-slate-800" id="parcerias-screen">
            {/* Header section */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg border border-slate-800">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl"></div>
              
              <div className="relative z-10 space-y-3">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest inline-flex items-center gap-1.5 shadow-sm">
                  🤝 Programa Jovens Empreendedores de Cabinda
                </span>
                <h2 className="font-display font-black text-xl sm:text-2xl tracking-tight text-white block">Renda Comercial & Comissionamento Coletivo</h2>
                <p className="text-xs text-slate-300 max-w-2xl font-medium leading-relaxed font-sans text-left">
                  O Mediador Cabinda oferece oportunidades para que jovens angarianos repartam as comissões aduaneiras de intermediação connosco! Ao trazer novos clientes para formalização de importações ou despachos, cada comissão recebida é dividida matematicamente.
                </p>
              </div>
            </div>

            {!matchedColab ? (
              /* REGISTER MODULE */
              <div className="bg-white border text-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs text-center space-y-6 max-w-2xl mx-auto font-sans">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-2xl font-bold font-semibold">
                  💼
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-black text-slate-900">Torne-se Parceiro Comercial do Mediador Cabinda</h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-lg mx-auto">
                    Inscreva-se hoje para ter o seu código de afiliação de comissão! Sempre que indicar um cliente (indústria, comércio e revendedores) e o negócio for registado, o gestor sincronizará a venda no seu perfil e as suas comissões sobem automaticamente.
                  </p>
                </div>

                {/* Benefits List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left text-[11.5px] max-w-md mx-auto bg-slate-50 p-4 rounded-2xl border font-semibold">
                  <div className="flex items-start gap-2 text-slate-700">
                    <span className="text-emerald-500 font-extrabold mr-1">✓</span> 
                    <span>15% da comissão gerada do negócio</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-700">
                    <span className="text-emerald-500 font-extrabold mr-1">✓</span> 
                    <span>Calculadora automática nativa</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-700">
                    <span className="text-emerald-500 font-extrabold mr-1">✓</span> 
                    <span>Monitoramento de pagamentos em tempo real</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-705">
                    <span className="text-emerald-500 font-extrabold mr-1">✓</span> 
                    <span>Apoio logístico aduaneiro contínuo</span>
                  </div>
                </div>

                <div className="space-y-4 pt-3">
                  <button
                    onClick={handleRegisterAsPartner}
                    className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-md transition-all active:scale-98 cursor-pointer font-bold text-center rounded-2xl"
                  >
                    Activar Meu Cadastro de Parceiro Afiliado 🚀
                  </button>
                  <p className="text-[10px] text-slate-400">Registo imediato: Seus dados cadastrais da conta ativa serão vinculados de forma segura.</p>
                </div>
              </div>
            ) : (
              /* PARTNER DASHBOARD WITH AUTOMATED CALCULATOR */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans text-xs">
                
                {/* 1. Partner Profile & Referred Sales logs (5 Cols) */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Profile Card */}
                  <div className="bg-white border rounded-3xl p-5 shadow-xs text-left space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-900 text-amber-400 font-extrabold flex items-center justify-center text-lg shrink-0 font-extrabold">
                        {matchedColab.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm leading-tight">{matchedColab.name}</h4>
                        <span className="text-[9.5px] bg-slate-100 text-slate-600 font-black px-2 py-0.5 rounded-sm uppercase tracking-wider">{matchedColab.role}</span>
                      </div>
                    </div>

                    <div className="border-t pt-3 space-y-2 text-xs font-medium text-slate-700 font-sans">
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[10.5px]">Código Afiliado:</span>
                        <span className="font-mono text-slate-900 font-bold">{matchedColab.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[10.5px]">Fração Padrão:</span>
                        <span className="font-mono text-emerald-600 font-black">{matchedColab.defaultCommissionPercentage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[10.5px]">Data Registo de Parceiro:</span>
                        <span className="font-mono text-slate-900 font-semibold">{new Date(matchedColab.joinedAt).toLocaleDateString('pt-AO')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Referred log listed */}
                  <div className="bg-white border rounded-3xl p-5 shadow-xs text-left space-y-4">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">📋 Histórico de Clientes Angariados</h4>
                      <p className="text-[10px] text-slate-400 mt-1">Negócios validados e partilhados pelo gestor</p>
                    </div>

                    {referredSales.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 font-medium text-xs leading-relaxed">
                        Nenhuma indicação oficial registada ainda. Suas comissões subirão assim que o gestor validar o seu primeiro negócio indicado!
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[250px] overflow-y-auto">
                        {referredSales.map(s => (
                          <div key={s.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 font-sans">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-mono text-slate-400 font-bold">{s.id}</span>
                              <span className={`text-[8.5px] px-1.5 py-0.5 rounded-xs font-black ${
                                s.status === 'pago' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {s.status === 'pago' ? 'LIQUIDADO' : 'PENDENTE'}
                              </span>
                            </div>
                            <div>
                              <p className="text-[11.5px] font-black text-slate-800">Cliente: {s.clientName}</p>
                              <p className="text-[10px] text-slate-505 truncate">{s.saleDescription}</p>
                            </div>
                            <div className="flex justify-between items-end border-t border-slate-200/60 pt-2 text-[10px] font-mono font-bold">
                              <div>
                                <span className="block text-[7.5px] text-slate-400 uppercase">Seu Ganho ({s.collaboratorPercentage}%)</span>
                                <span className="text-amber-600 font-extrabold">{formatCurrency(s.calculatedCommission)}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => downloadCollaboratorSaleInvoice(s)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-lg text-[9px] font-black uppercase tracking-wide border border-slate-200 transition-all cursor-pointer flex items-center gap-1"
                                title="Descarregar Recibo de Comissão"
                              >
                                📥 Recibo
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* 2. Interactive automatic calculator (8 Cols) */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Summary grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-left">
                      <p className="text-[9.5px] font-black uppercase text-amber-700 tracking-wider">Total Acumulado Ativo</p>
                      <p className="text-lg font-black font-mono mt-1 text-slate-900">{formatCurrency(totalCommissionsAll)}</p>
                      <span className="text-[9px] text-slate-400 block mt-0.5">Soma de comissões calculadas</span>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-left">
                      <p className="text-[9.5px] font-black uppercase text-emerald-700 tracking-wider font-extrabold">Total Liquidado (Pago)</p>
                      <p className="text-lg font-black font-mono mt-1 text-emerald-800">{formatCurrency(earnedComissionsPaid)}</p>
                      <span className="text-[9px] text-slate-400 block mt-0.5">Dinheiro transferido para a sua conta</span>
                    </div>

                    <div className="bg-amber-50/50 border border-amber-100 border-dashed rounded-2xl p-4 text-left">
                      <p className="text-[9.5px] font-black uppercase text-slate-600 tracking-wider">Total Pendente (Unpaid)</p>
                      <p className="text-lg font-black font-mono mt-1 text-amber-600 font-extrabold">{formatCurrency(earnedComissionsPending)}</p>
                      <span className="text-[9px] text-slate-404 block mt-0.5">A pagar na próxima liquidação</span>
                    </div>
                  </div>

                  {/* Calculator Widget */}
                  <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl text-left space-y-5">
                    <div>
                      <h4 className="text-sm font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5 h-6">
                        🧮 Máquina de Cálculo de Comissões - Estimador de Metas
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-lg mt-0.5 font-sans">
                        Calcule em tempo real quanto poderá lucrar ao trazer novas importações ou contratos de frete aduaneiro! Ajuste os sliders para ver a sua receita de comissão subir instantaneamente na calculadora automática de metas.
                      </p>
                    </div>

                    {/* Meta progress tracker */}
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-300">Minha Meta Comercial Autogerida</span>
                        <span className="font-mono font-black text-amber-400">{formatCurrency(totalCommissionsAll)} / {formatCurrency(calcMonthlyGoal)}</span>
                      </div>
                      
                      {/* Bar */}
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.floor((totalCommissionsAll / calcMonthlyGoal) * 100))}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 font-mono">
                        <span>Progresso: {Math.floor((totalCommissionsAll / calcMonthlyGoal) * 100)}% concluídos</span>
                        <div className="flex items-center gap-1.5">
                          <span>Ajustar Minha Meta:</span>
                          <input 
                            type="range"
                            min="50000"
                            max="800000"
                            step="10000"
                            value={calcMonthlyGoal}
                            onChange={(e) => setCalcMonthlyGoal(Number(e.target.value))}
                            className="w-20 accent-amber-500 cursor-pointer bg-slate-800"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Interactive Slider prospect */}
                    <div className="space-y-4">
                      <div className="border-t border-slate-800 pt-3">
                        <h5 className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider mb-3">🛠️ Simulador Dinâmico Avançado de Desempenho</h5>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3.5 bg-slate-955 border border-slate-800 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-[9.5px] font-bold text-slate-400 uppercase">Faturação Desejada do Cliente</label>
                            <span className="font-mono text-slate-100 font-extrabold text-xs">{formatCurrency(calcSaleAmount)}</span>
                          </div>
                          <input 
                            type="range"
                            min="100000"
                            max="5000000"
                            step="50000"
                            value={calcSaleAmount}
                            onChange={(e) => setCalcSaleAmount(Number(e.target.value))}
                            className="w-full h-1.5 accent-amber-500 cursor-pointer bg-slate-800 rounded-lg"
                          />
                          <span className="text-[9px] text-slate-500 block leading-tight">Volume financeiro que o novo investidor irá despachar</span>
                        </div>

                        <div className="p-3.5 bg-slate-955 border border-slate-800 rounded-xl space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <label className="text-[9.5px] font-bold text-slate-400 uppercase">Comissão Geradora Estimada (Aduana)</label>
                            <span className="font-mono text-slate-100 font-extrabold">{formatCurrency(calcCommissionPrice)}</span>
                          </div>
                          <input 
                            type="range"
                            min="20000"
                            max="1000000"
                            step="10000"
                            value={calcCommissionPrice}
                            onChange={(e) => setCalcCommissionPrice(Number(e.target.value))}
                            className="w-full h-1.5 accent-amber-500 cursor-pointer bg-slate-800 rounded-lg"
                          />
                          <span className="text-[9px] text-slate-500 block leading-tight">Valor em Kz cobrado a título de honorários comerciais pelo Mediador</span>
                        </div>
                      </div>

                      {/* Display prospective payout with Dynamic Scaling rules based on sales/prices */}
                      {(() => {
                        const dynamicRate = calcSaleAmount < 300000 ? 8 : calcSaleAmount < 1000000 ? 12 : calcSaleAmount < 3000000 ? 15 : 18;
                        const simulatedComission = Math.floor(calcCommissionPrice * (dynamicRate / 100));
                        return (
                          <div className="space-y-3.5">
                            <div className="bg-slate-955 border border-slate-800 p-4 rounded-2xl text-[10.5px] text-slate-300 leading-normal font-sans">
                              <span className="text-amber-400 font-black uppercase text-[10px] block mb-2">🔄 Escalonamento e Variação por Volume de Venda (Captadores)</span>
                              <p className="text-[10.5px] text-slate-400 mb-2 leading-relaxed">
                                A sua percentagem de comissão varia dinamicamente conforme os preços e o volume total da venda do produto a comprar. Com a faturação simulada de <strong className="text-white">{formatCurrency(calcSaleAmount)}</strong>, a sua comissão foi ajustada para <strong className="text-amber-400 text-xs font-black">{dynamicRate}%</strong>.
                              </p>
                              <div className="grid grid-cols-2 gap-2 text-[9.5px] border-t border-slate-800/80 pt-2.5 text-slate-400 font-semibold font-mono">
                                <span className={dynamicRate === 8 ? "text-amber-400 font-extrabold" : ""}>• &lt; 300 Mil Kz: 8% comissão</span>
                                <span className={dynamicRate === 12 ? "text-amber-400 font-extrabold" : ""}>• 300 Mil ~ 1M Kz: 12% comissão</span>
                                <span className={dynamicRate === 15 ? "text-amber-400 font-extrabold" : ""}>• 1M ~ 3M Kz: 15% comissão</span>
                                <span className={dynamicRate === 18 ? "text-amber-400 font-extrabold" : ""}>• &gt; 3M Kz: 18% comissão</span>
                              </div>
                            </div>

                            <div className="p-4 bg-amber-400/10 border border-amber-400/25 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
                              <div className="text-left text-xs">
                                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Metodologia Dinâmica Proposta:</span>
                                <div className="flex items-center gap-1.5 mt-0.5 text-white font-bold">
                                  <span className="text-base font-black text-amber-400">{dynamicRate}%</span>
                                  <span className="text-[10px] text-slate-400 font-medium">calculados sob o honorário aduaneiro</span>
                                </div>
                              </div>

                              {/* Calculated Payout box */}
                              <div className="p-3 bg-amber-400/15 border border-amber-400/30 rounded-xl text-center sm:text-right shrink-0">
                                <span className="text-[9px] text-slate-300 uppercase font-black block font-sans">Seu Ganho Líquido Estimado</span>
                                <span className="text-xl font-black font-mono text-amber-400 tracking-wide mt-1 block">
                                  {formatCurrency(simulatedComission)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                    </div>
                  </div>

                </div>

              </div>
            )}
            
          </div>
        );
      })()}

    </div>
  );
}
