/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Client, Order, Message, Notification, OrderStatus, CarrierCompany, Supplier, SupplierProduct, SupplierMessage, Collaborator, CollaboratorSale } from '../types';
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
  Menu
} from 'lucide-react';
import SharedChat from './SharedChat';

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
  currentView: 'inicio' | 'fazer-pedido' | 'acompanhar-pedido' | 'cadastro' | 'entrar' | 'minha-conta' | 'historico' | 'pagamentos' | 'notificacoes' | 'suporte' | 'reclamacoes' | 'configuracoes' | 'sobre-nos' | 'termos-uso' | 'mercado-fornecedores' | 'mensagens' | 'parceria';
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
  onUpdateCollaboratorSales
}: ClientDashboardProps) {
  
  // Tab/Tracker States
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    orders.find(o => o.clientId === activeClientId)?.id || null
  );
  const [orderDetailTab, setOrderDetailTab] = useState<'tracker' | 'budget' | 'chat'>('tracker');

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

  // Suppliers Marketplace Filtering & Integration States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SupplierProduct | null>(null);
  const [supplierSearchText, setSupplierSearchText] = useState('');
  const [supplierSelectedCategory, setSupplierSelectedCategory] = useState('all');
  const [supplierSelectedCity, setSupplierSelectedCity] = useState('all');
  const [prefilledMarketProduct, setPrefilledMarketProduct] = useState<{
    name: string;
    price: number;
    supplierName: string;
    supplierId: string;
    photoUrl: string;
  } | null>(null);

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
      setNewOrderForm({
        productName: prefilledMarketProduct.name,
        quantity: 1,
        supplierName: prefilledMarketProduct.supplierName,
        supplierPhone: '[OCULTO - INTERMEDIAÇÃO OBRIGATÓRIA]',
        supplierLocation: suppliers.find(s => s.id === prefilledMarketProduct.supplierId)?.city || 'Luanda',
        notes: `Adquirido através do Mercado de Fornecedores Homologados. ID Fornecedor: ${prefilledMarketProduct.supplierId}. Preço Base: ${prefilledMarketProduct.price.toLocaleString('pt-AO')} AOA.`,
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

  const trackingSteps: { status: OrderStatus; title: string; desc: string }[] = [
    { status: 'RECEBIDO', title: '1. Pedido Inicial Registado', desc: 'Sua solicitação de intermediação entre Cabinda e Luanda foi salva.' },
    { status: 'ANALISE', title: '2. Análise de Fornecedores', desc: 'Nossa equipa localiza fisicamente o produto em Luanda de forma fiscal.' },
    { status: 'ORCADO', title: '3. Orçamento Pronto', desc: 'Preço da compra, freight marítimo/aéreo e despacho aduaneiro calculados.' },
    { status: 'PAGO', title: '4. Pagamento Processado', desc: 'O montante foi depositado ou pago por Multicaixa e com fatura.' },
    { status: 'COMPRADO', title: '5. Compra em Luanda', desc: 'A equipa do Mediador comprou o artigo e recolheu a Fatura Oficial.' },
    { status: 'TRANSPORTE', title: '6. Expedição de Cargas', desc: 'Carga despachada via aérea/marítima de Luanda com a Guia de Carga.' },
    { status: 'CABINDA', title: '7. Recebido no Polo Cabinda', desc: 'Produto descarregado em perfeitas condições nos depósitos de Cabinda.' },
    { status: 'LEVANTAMENTO', title: '8. Pronto para Recolha', desc: 'Aguardando o seu levantamento ou em rota de entrega ao domicílio cadastrada.' },
    { status: 'ENTREGUE', title: '9. Encomenda Entregue', desc: 'Artigo recebido, avaliado e concluído com sucesso total.' }
  ];

  const getCurrentStatusIndex = (status: OrderStatus) => {
    return trackingSteps.findIndex(step => step.status === status);
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
    <div className={isChatActiveView ? "" : "space-y-6"} id="client-view-layout">
      
      {/* 🟢 TOP PERSISTENT STICKY HEADER WITH HAMBURGER MENU */}
      {!isChatActiveView && (
        <header className="sticky top-0 bg-white border-b border-slate-150 z-40 px-4 py-3.5 flex items-center justify-between shadow-xs rounded-2xl shrink-0" id="client-sticky-nav-header">
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
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider px-3 py-1.5 font-sans">Sobre & Furtos</p>
                {[
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
              <h2 className="text-lg font-display font-black tracking-tight leading-none text-slate-950">Vitrina de Produtos Luanda</h2>
              <p className="text-[10px] text-slate-900 font-medium leading-relaxed max-w-xl">
                Nós compramos por si física e fiscalmente em Luanda, elaboramos a guia aduaneira e entregamos em Cabinda com segurança máxima anticheat.
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative" id="product-feed-catalog-search">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={homeSearchQuery}
                onChange={(e) => setHomeSearchQuery(e.target.value)}
                placeholder="Pesquise por informática, geradores, cabos de cobre..."
                className="w-full pl-11 pr-12 py-3 bg-white border border-slate-205 rounded-2xl shadow-xs text-xs font-semibold focus:outline-hidden focus:border-amber-400 focus:ring-0 text-slate-800 transition-colors"
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
          </div>

          {/* Products Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[9px] uppercase font-bold text-slate-400 font-sans tracking-wider">Catálogo Público</span>
              <span className="text-[10px] text-slate-500 font-bold font-mono">
                {supplierProducts.filter(p => p.published && (!homeSearchQuery.trim() || p.name.toLowerCase().includes(homeSearchQuery.toLowerCase()))).length} itens
              </span>
            </div>

            {supplierProducts.filter(p => p.published && (!homeSearchQuery.trim() || p.name.toLowerCase().includes(homeSearchQuery.toLowerCase()))).length === 0 ? (
              <div className="text-center py-12 bg-white border border-slate-150 rounded-3xl p-6">
                <span className="text-2xl block mb-2">🔍</span>
                <p className="text-xs font-bold text-slate-800">Sem correspondências.</p>
                <p className="text-[10px] text-slate-405 mt-1">Insira outra termo de procura.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4" id="products-catalog-continuous-feed">
                {supplierProducts
                  .filter(p => p.published && (!homeSearchQuery.trim() || p.name.toLowerCase().includes(homeSearchQuery.toLowerCase()) || (p.description || '').toLowerCase().includes(homeSearchQuery.toLowerCase())))
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
                        <div className="p-3 flex-1 flex flex-col justify-between space-y-1 text-xs">
                          <div>
                            <h4 className="font-extrabold text-[11px] text-slate-900 group-hover:text-amber-550 transition-colors line-clamp-2 leading-tight">
                              {prod.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-medium truncate mt-1">
                              Empresa: <span className="font-semibold text-slate-650">{prodSupplier?.name || 'Parceiro'}</span>
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <div>
                              <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider block">Preço</span>
                              <span className="font-mono text-xs font-black text-slate-900">
                                {prod.price.toLocaleString('pt-AO')} Kz
                              </span>
                            </div>

                            <div className="w-6 h-6 bg-slate-50 group-hover:bg-amber-100 rounded-lg flex items-center justify-center transition-all">
                              <ChevronRight className="w-3 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                            </div>
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
        <div className="max-w-2xl mx-auto bg-white border border-slate-150 rounded-3xl p-6 shadow-sm animate-fade-in" id="fazer-pedido-screen">
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
                  value={newOrderForm.quantity}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
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
                <label className="block text-xs font-bold text-slate-705 mb-1.5">Fornecedor Sugerido Luanda (Se souber)</label>
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
                          min="1000"
                          value={calcRawPrice}
                          onChange={(e) => setCalcRawPrice(Math.max(1000, parseInt(e.target.value) || 0))}
                          className="w-full text-xs p-2.5 border bg-white rounded-lg focus:outline-hidden"
                        />
                        <span className="text-[9px] text-slate-400 mt-1 block">Preço base de loja</span>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Peso da Carga (Kg)</label>
                        <input
                          type="number"
                          min="1"
                          max="2000"
                          value={calcWeight}
                          onChange={(e) => setCalcWeight(Math.max(1, parseInt(e.target.value) || 1))}
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
                    <div className="absolute left-0 right-0 mt-2 p-3 bg-white border border-slate-205 rounded-2xl shadow-xl z-50 grid grid-cols-2 gap-2 animate-scale-up" id="product-photo-options-dropdown">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Orders checklist sidebar */}
            <div className="lg:col-span-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">Selecione uma Carga</h3>
              
              {clientOrders.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-8 text-center text-slate-400">
                  <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-750">Não possui encomendas</p>
                  <button 
                    onClick={() => setCurrentView('fazer-pedido')} 
                    className="mt-3 bg-amber-400 text-slate-950 font-bold px-4 py-1.5 rounded-xl text-xs"
                  >
                    Fazer Meu Primeiro Pedido
                  </button>
                </div>
              ) : (
                clientOrders.map((ord) => {
                  const statusDetails = getStatusLabelAndColor(ord.status);
                  const isSelected = selectedOrderId === ord.id;
                  return (
                    <button
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
                        <span className="text-xs font-mono font-bold text-slate-700">{ord.id}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(ord.createdAt).toLocaleDateString('pt-AO')}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-800 truncate">{ord.productName}</h4>
                      
                      <div className="flex justify-between items-center mt-1 pt-2 border-t border-slate-50">
                        <span className="text-[10px] font-semibold text-slate-700">Qtd: {ord.quantity}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full border font-extrabold ${statusDetails?.color}`}>
                          {statusDetails?.label}
                        </span>
                      </div>
                    </button>
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
                      <div className="flex items-center gap-3">
                        <h3 className="text-sm font-mono font-bold text-slate-800">{activeOrder.id}</h3>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${getStatusLabelAndColor(activeOrder.status)?.color}`}>
                          {getStatusLabelAndColor(activeOrder.status)?.label}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{activeOrder.productName}</h4>
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
                          {trackingSteps.map((step, idx) => {
                            const curIdx = getCurrentStatusIndex(activeOrder.status);
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
                                <p className="text-slate-500 font-semibold text-[11px]">Introduza o nº de telemóvel associado à sua conta Multicaixa Express:</p>
                                <input 
                                  type="text" 
                                  value={mcExpressPhone}
                                  onChange={(e) => setMcExpressPhone(e.target.value)}
                                  placeholder="923 000 000" 
                                  className="w-full p-2 border bg-white rounded-lg font-mono text-xs" 
                                />
                              </div>
                            ) : paymentMethod === 'transferencia' ? (
                              <div className="space-y-1">
                                <p className="text-slate-500 text-[11px]">Transfira o total para a conta oficial do Mediador Cabinda Lda:</p>
                                <p className="font-mono text-xs bg-white p-2 rounded-lg border"><strong>IBAN BAI Angola:</strong> AO06 0040 0000 7711 9289 1014 9</p>
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
        <div className="max-w-2xl mx-auto bg-white border border-slate-150 rounded-3xl p-6 shadow-sm animate-fade-in" id="cadastro-form-screen">
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
        <div className="max-w-xl mx-auto bg-white border border-slate-150 rounded-3xl p-6 shadow-sm animate-fade-in" id="entrar-profile-screen">
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
        <div className="max-w-2xl mx-auto bg-white border border-slate-150 rounded-3xl p-6 shadow-sm animate-fade-in" id="minha-conta-screen">
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
        <div className="max-w-2xl mx-auto bg-white border border-slate-150 rounded-3xl p-6 shadow-sm animate-fade-in" id="purchases-history-screen">
          <div className="border-b pb-3 mb-5">
            <h3 className="text-base font-bold text-slate-900">Histórico de Compras & Comprovativos</h3>
            <p className="text-xs text-slate-500 font-medium">Consulte suas faturas pagas e mercadorias já entregues ao seu balcão ou residência em Cabinda.</p>
          </div>

          <div className="space-y-3 text-xs">
            {clientOrders.length === 0 ? (
              <p className="text-center text-slate-400 py-8">Não há transações concluídas registadas na sua conta.</p>
            ) : (
              clientOrders.map((ord) => {
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
              })
            )}
          </div>
        </div>
      )}

      {/* 8) PAGAMENTOS (BUDGETS REQUIRING PAYMENTS) */}
      {currentView === 'pagamentos' && (
        <div className="max-w-xl mx-auto bg-white border border-slate-150 rounded-3xl p-6 shadow-sm animate-fade-in" id="pagamentos-screen">
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
                    className="w-full py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold rounded-xl"
                  >
                    Pagar Agora por MC Express ou IBAN
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 9) NOTIFICAÇÕES (GENERAL HUB LIST) */}
      {currentView === 'notificacoes' && (
        <div className="max-w-xl mx-auto bg-white border border-slate-150 rounded-3xl p-6 shadow-sm animate-fade-in" id="notificacoes-screen">
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
        <div className="w-full bg-slate-50 border border-slate-150 rounded-3xl p-0 shadow-lg animate-fade-in text-xs overflow-hidden" id="suporte-screen">
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
        <div className="max-w-2xl mx-auto bg-white border border-slate-150 rounded-3xl p-6 shadow-sm animate-fade-in" id="reclamacoes-screen">
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
        <div className="max-w-xl mx-auto bg-white border border-slate-150 rounded-3xl p-6 shadow-sm animate-fade-in" id="configuracoes-screen">
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

      {/* 13) SOBRE NÓS (LOGISTICS & HISTORY INFO) */}
      {currentView === 'sobre-nos' && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-150 rounded-3xl p-6 shadow-sm animate-fade-in" id="sobre-nos-screen">
          <div className="flex items-center gap-3 border-b pb-3 mb-5">
            <Info className="w-6 h-6 text-slate-700" />
            <div>
              <h3 className="text-lg font-bold font-display text-slate-900">Sobre o Mediador Cabinda</h3>
              <p className="text-xs text-slate-500">Ponte logística exclusiva Cabinda - Luanda sem interrupções geográficas.</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-600 leading-relaxed font-semibold">
            <p>
              O <strong>Mediador Cabinda Lda</strong> é uma firma angolana constituída para solucionar o maior desafio comercial da província de Cabinda: o seu enclave geográfico. Devido à separação da província do resto do território angolano pelo rio Congo e pelo território da RDC, o tráfego terrestre de mercadorias é frequentemente demorado e burocrático.
            </p>
            <p>
              Nós oferecemos a solução perfeita: <strong>intermediação fiscal</strong>. Você escolhe o que deseja comprar em Luanda - seja uma máquina pesada, ar condicionado, ou telemóveis - nossa equipa adquire o bem de forma fiscal, carrega na balsa marítima oficial ou voo TAAG Cargo, e entrega-lhe diretamente ao balcão de Cabinda.
            </p>
            <div className="bg-amber-100/40 p-4 rounded-2xl flex items-center gap-4 text-slate-800">
              <Truck className="w-8 h-8 text-amber-500 shrink-0" />
              <div>
                <p className="font-bold">Emissão de Guias de Trânsito Seguras</p>
                <p className="text-[11px] text-slate-500 font-medium">Todas as nossas rotas marítimas cumprem as regulação aduaneiras de Angola, garantindo que a sua carga chegue sem riscos de extravio ou impostos abusivos.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 14) TERMOS DE USO (COMPLIANCE INFRASTRUCTURE) */}
      {currentView === 'termos-uso' && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-150 rounded-3xl p-6 shadow-sm animate-fade-in" id="termos-uso-screen">
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
                (p) => p.supplierId === sup.id && p.published
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

                                    // Switch views and store prefilled details so FazerPedido reads them!
                                    setPrefilledMarketProduct({
                                      name: prefilledName,
                                      price: prefilledPrice,
                                      supplierName: prefilledSupplier,
                                      supplierId: prefilledSupplierId,
                                      photoUrl: prefilledPhoto
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

      {/* 🔮 INTER-COMMERCE PRODUCT DETAIL MODAL OVERLAY */}
      {selectedProduct && (() => {
        const sup = suppliers.find(s => s.id === selectedProduct.supplierId);
        const isEsgotado = selectedProduct.availability === 'esgotado' || selectedProduct.stock === 0;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-fade-in" id="product-detail-modal-overlay">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-150 overflow-hidden animate-scale-up text-slate-800 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-amber-500 text-lg">🛍️</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Detalhes do Artigo</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-150 rounded-lg transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable details */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none">
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

                  {selectedProduct.sponsored && (
                    <span className="absolute top-3 left-3 bg-amber-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                      Destaque Homologado
                    </span>
                  )}
                </div>

                {/* Main details */}
                <div className="space-y-2">
                  <h3 className="text-base font-black text-slate-900 tracking-tight font-sans leading-snug">
                    {selectedProduct.name}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] font-bold text-slate-500">
                    <span className="flex items-center gap-1">📍 Origem: Luanda</span>
                    <span>•</span>
                    <span>Empresa de Stock: {sup?.name || 'Distribuidor Parceiro'}</span>
                    <span>•</span>
                    <span className={`px-2 py-0.5 rounded-full font-black ${
                      isEsgotado ? 'bg-red-50 text-red-650' : selectedProduct.availability === 'sob-pedido' ? 'bg-blue-50 text-blue-750' : 'bg-emerald-50 text-emerald-800'
                    }`}>
                      {isEsgotado ? 'Esgotado' : selectedProduct.availability === 'sob-pedido' ? 'Sob Pedido' : 'Disponível em Stock'}
                    </span>
                  </div>
                </div>

                {/* Price block */}
                <div className="p-4 bg-amber-50/10 rounded-2xl border border-amber-50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Preço de Compra Intermediado</span>
                    <span className="font-mono text-lg font-black text-slate-900 tracking-tight block">
                      {selectedProduct.price.toLocaleString('pt-AO')} Kz
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold text-amber-850 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
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
                      <p>🛡️ Garantia: <span className="text-slate-800">Intermediação Mediador</span></p>
                      <p>⚓ Tipo de Frete: <span className="text-slate-800">Aéreo ou Marítimo</span></p>
                    </div>
                  </div>
                </div>

                {/* Protection warning */}
                <div className="bg-sky-50 border border-sky-100 p-4 rounded-2xl text-[10px] text-sky-800 flex items-start gap-2 leading-relaxed font-bold">
                  <span>⚓</span>
                  <p>Por motivos de faturamento legal e proteção contra burlas comerciais, a compra é integralmente mediada pela equipa do <strong>Mediador Cabinda</strong>. Nós compramos e fazemos a entrega.</p>
                </div>
              </div>

              {/* CTAs */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all h-11 shrink-0 cursor-pointer"
                >
                  Voltar ao Catálogo
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    const inquiryMsg = `Olá Mediador Cabinda! Gostaria de intermediar a aquisição do artigo "${selectedProduct.name}" anunciado pelo parceiro de Luanda. Podem verificar a viabilidade aduaneira e emissão de guia de transporte? Preço Base: ${selectedProduct.price.toLocaleString('pt-AO')} AOA.`;
                    
                    localStorage.setItem('mediador_prefilled_product_message', inquiryMsg);
                    localStorage.setItem('mediador_active_channel', 'general');
                    
                    setSelectedProduct(null);
                    setCurrentView('mensagens');
                    speak(`Iniciando chat operacional de intermediação para ${selectedProduct.name}`);
                  }}
                  className="flex-1 px-5 py-2 bg-amber-400 hover:bg-amber-500 active:scale-98 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 h-11 cursor-pointer shadow-xs font-display uppercase tracking-wider"
                >
                  <span>💬</span> Consultar Vendedor (Mediador)
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* PERFECTLY CENTERED, DYNAMIC AND RESPONSIVE CLIENT MODAL DIALOG OVERLAY */}
      {customDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in" id="custom-client-modal">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-250 overflow-hidden animate-scale-up text-slate-800">
            <div className={`p-4 flex items-center gap-3 border-b ${
              customDialog.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
              customDialog.type === 'warning' ? 'bg-amber-55 text-amber-80 * border-amber-200' :
              'bg-slate-100 text-slate-800 border-slate-200'
            }`}>
              <span className="text-lg">
                {customDialog.type === 'success' ? '✅' : customDialog.type === 'warning' ? '⚠️' : 'ℹ️'}
              </span>
              <h4 className="font-extrabold text-xs uppercase tracking-wider font-display">{customDialog.title}</h4>
            </div>
            
            <div className="p-5 text-xs text-slate-605 font-semibold leading-relaxed whitespace-pre-line">
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
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl text-slate-800 leading-normal font-sans animate-scale-up relative my-8">
             {/* Close Trigger */}
             <button 
               type="button" 
               onClick={() => setShowCabotageSlip(false)}
               className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-700 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer font-bold font-sans text-xs"
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
                 <p className="text-[7px] font-black uppercase text-slate-400 tracking-wider">Origem das Cargas (Luanda)</p>
                 <p className="font-extrabold text-slate-800">Polo Fornecedor Geral</p>
                 <p className="text-[10px] text-slate-500"><strong>Fornecedor:</strong> {activeOrder.supplierName || 'Parceiro Local'}</p>
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
             <div className="flex gap-2.5 justify-end border-t pt-5">
               <button 
                 type="button" 
                 onClick={() => {
                   window.print();
                 }}
                 className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer font-sans"
               >
                 🖨️ Descarregar PDF / Imprimir
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
                          <div key={s.id} className="p-3 bg-slate-50 border border-slate-205 rounded-xl space-y-1.5 font-sans">
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
                            <div className="flex justify-between border-t border-slate-200/60 pt-2 text-[10px] font-mono font-bold">
                              <div>
                                <span className="block text-[7.5px] text-slate-400 uppercase">Seu Ganho ({s.collaboratorPercentage}%)</span>
                                <span className="text-amber-600 font-extrabold">{formatCurrency(s.calculatedCommission)}</span>
                              </div>
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
