/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type OrderStatus =
  | 'RECEBIDO'
  | 'ANALISE'
  | 'ORCADO'
  | 'PAGO'
  | 'COMPRADO'
  | 'TRANSPORTE'
  | 'CABINDA'
  | 'LEVANTAMENTO'
  | 'ENTREGUE';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  nif: string;
  province: string;
  municipality: string;
  points: number; // For frequent client program
  tier: 'Standard' | 'Bronze' | 'Prata' | 'Ouro';
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  productId?: string; // Associated supplier product ID
  productCode?: string; // Product SKU / Identity code e.g. PRD-1001
  productName?: string;
  quantity?: number;
  supplierName?: string;
  supplierPhone?: string;
  supplierLocation?: string;
  productPhotoUrl?: string;
  productPhotos?: { url: string; type: 'camera' | 'gallery' | 'document'; name: string }[];
  notes?: string;
  items?: { id: string; name: string; quantity: number; unitPrice: number; supplierName?: string }[];
  itemsTotal?: number;
  freightCost?: number;
  serviceFee?: number;
  insuranceCost?: number;
  trackingCode?: string;
  paymentStatus?: string;
  carrierCompany?: string;
  waybillNumber?: string;
  containerNumber?: string;
  sealNumber?: string;
  vesselName?: string;
  departureDate?: string;
  estimatedArrival?: string;
  updatedAt?: string;
  history?: { status: string; date: string; location: string; description: string }[];
  
  // Budget values
  budgetRawPrice?: number; // Base product price in AOA
  budgetShipping?: number; // Cargo / Freight in AOA
  dispatchFee?: number; // Custom clearing fee in AOA
  commissionRate?: number; // 0.10 to 0.15 (10% to 15%)
  commissionAmount?: number;
  totalAmount?: number;
  paid?: boolean;
  paymentMethod?: 'transferencia' | 'multicaixa' | 'referencia';
  paymentReference?: string;
  checkoutProofUrl?: string; // Comprovativo de compra
  deliveryOption?: 'escritorio' | 'domicilio';
  deliveryAddress?: string;
  destinationProvince?: string;
  destinationMunicipality?: string;
  destinationAddress?: string;

  // Carriage details
  routeDirection?: 'Luanda-Cabinda' | 'Cabinda-Luanda';
  originCity?: string;
  destinationCity?: string;
  originLocation?: string;
  destinationLocation?: string;
  city?: string;
  transportMode?: 'maritimo' | 'aereo' | 'terrestre';
  shippingCarrier?: string;
  shippingGuideNumber?: string;
  shippingDate?: string;
  estimateDeliveryDate?: string;

  status: OrderStatus;
  rating?: number; // Service evaluation (1-5)
  feedback?: string; // Service evaluation notes
  complaint?: string; // Reclamações
  complaintResolved?: boolean;
  pointsEarned?: number;
  createdAt: string;
}

export interface Message {
  id: string;
  orderId: string;
  sender: 'client' | 'admin';
  text: string;
  timestamp: string;
  read: boolean;
  attachmentUrl?: string;
  attachmentType?: 'photo' | 'document' | 'location' | 'invoice' | 'receipt' | 'transport_guide' | 'dispatch_proof';
  attachmentName?: string;
  locationCoords?: { lat: number; lng: number; address: string };
  isPriority?: boolean;
}

export interface Notification {
  id: string;
  clientId: string;
  orderId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface CarrierCompany {
  id: string;
  name: string;
  phone: string;
  baseRatePerKg: number;
  expectedDays: number;
  mode?: 'maritimo' | 'aereo' | 'terrestre';
}

export interface Supplier {
  id: string;
  name: string;
  city: string;
  category: string;
  rating: number;
  reviewsCount: number;
  plan: 'gratuito' | 'prata' | 'ouro' | 'diamante';
  logoUrl?: string;
  description?: string;
  nif?: string;
  contactPerson?: string;
  whatsapp?: string;
  phoneHidden: string; // Protected (only Mediator accesses, hidden from client)
  emailHidden: string;   // Protected
  addressHidden: string; // Protected
  createdAt: string;
}

export interface MarketplaceSubCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface MarketplaceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  subCategories: MarketplaceSubCategory[];
}

export interface SupplierProduct {
  id: string;
  productCode?: string; // Product SKU / Identity code e.g. PRD-1001
  supplierId: string;
  name: string;
  category?: string;
  subCategory?: string;
  price: number; // in AOA
  originalPrice?: number; // crossed out price if discount
  availability: 'imediata' | 'sob-pedido' | 'esgotado';
  stock: number;
  description?: string;
  photoUrl: string;
  photos?: string[]; // Up to 8 photo URLs for full gallery
  published: boolean; // Approved/published by mediator
  sponsored: boolean; // Highlighted
  location?: 'Luanda' | 'Cabinda' | 'Huíla' | 'Benguela' | 'Huambo' | string; // Physical warehouse / source location
  availableFromDate?: string; // Estimated date/info on when supplier makes it available
  rating?: number; // e.g. 4.8
  reviewsCount?: number; // e.g. 14 avaliações
  salesCount?: number; // e.g. 85 vendas
  tags?: string[]; // e.g. ['Mais Vendido', 'Super Oferta', 'Frete Reduzido']
  condition?: 'novo' | 'recondicionado' | 'usado' | 'seminovo';
  warranty?: string; // e.g. 'Garantia de 12 Meses'
  brand?: string;
  model?: string;
  featured?: boolean;
  specifications?: { key: string; value: string }[];
  createdAt: string;
}

export interface SupplierMessage {
  id: string;
  supplierId: string;
  sender: 'mediador' | 'fornecedor';
  text: string;
  timestamp: string;
  read: boolean;
  attachmentUrl?: string;
  attachmentType?: 'photo' | 'document';
  attachmentName?: string;
}

export interface Collaborator {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  defaultCommissionPercentage: number; // e.g., 10 for 10%
  totalSalesBrought: number;
  totalEarnedCommissions: number;
  joinedAt: string;
}

export interface CollaboratorSale {
  id: string;
  collaboratorId: string;
  collaboratorName: string;
  clientName: string;
  saleDescription: string;
  saleAmount: number; // Valor comercial da venda
  commissionPrice: number; // O preço total da comissão gerada (ou base)
  collaboratorPercentage: number; // A percentagem que o colaborador vai receber (e.g. 15%)
  calculatedCommission: number; // Valor final recebido pelo colaborador: commissionPrice * (collaboratorPercentage / 100)
  status: 'pendente' | 'pago';
  createdAt: string;
}

export interface SupplierService {
  id: string;
  supplierId: string;
  supplierName: string;
  name: string;
  price: number; // base / estimated price in AOA
  category: 'Venda de Terrenos' | 'Venda de Casas' | 'Venda de Carros' | 'Serralharia & Metalurgia' | 'Despacho Aduaneiro' | 'Transporte de Carga' | 'Compra Assistida' | 'Embalamento e Paletização' | 'Inspeção de Mercadoria' | 'Outros' | string;
  description: string;
  photoUrl?: string;
  location?: 'Luanda' | 'Cabinda' | 'Ambos';
  executionTime?: string;
  published: boolean;
  createdAt: string;
}

export interface ServiceRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  serviceName: string;
  supplierId: string;
  supplierName: string;
  category: string;
  description?: string;
  location?: string;
  notes?: string;
  status: 'pendente' | 'em_analise' | 'aprovado' | 'cancelado' | 'concluido';
  estimatedCost?: number;
  createdAt: string;
}

export interface BotMessageAttachment {
  url: string;
  name?: string;
  type?: 'gallery' | 'camera' | 'document' | 'supplier_proforma';
  size?: string;
}

export interface BotMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
  source?: 'gemini' | 'knowledge_base';
  suggestedQuestions?: string[];
  actionLink?: {
    label: string;
    view: string;
    icon?: string;
  };
  attachments?: BotMessageAttachment[];
  photoUrl?: string; // Main photo shortcut
  isSupplierIntermediation?: boolean;
  supplierDetails?: {
    supplierName?: string;
    supplierPhone?: string;
    supplierLocation?: string;
    productName?: string;
  };
}

export interface BotSettings {
  enabled: boolean;
  botName: string;
  welcomeMessage: string;
  offHoursMessage: string;
  autoReplyInSharedChat: boolean;
  businessHoursStart: string; // "08:00"
  businessHoursEnd: string; // "18:00"
  allowWhatsAppEscalation: boolean;
  whatsAppNumber: string; // "+244942043293"
}

export interface AdminMasterAccount {
  id?: string;
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  address?: string;
  province?: string;
  municipality?: string;
  role?: string;
  passwordHash?: string;
  password?: string;
  pin?: string; // 6-digit numeric PIN
  biometricEnrolled?: boolean;
  biometricCredentialId?: string;
  biometricDeviceName?: string;
  whatsappEnabled?: boolean;
  emailEnabled?: boolean;
  callEnabled?: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface LogisticsModeConfig {
  id: 'aereo' | 'maritimo' | 'terrestre' | string;
  name: string; // e.g. "Via Aérea (TAAG Cargo Express)"
  averageTime: string; // e.g. "1 dia" or "2–3 dias" or "7–8 dias ou mais"
  costEstimate: string; // e.g. "2.500 AOA / kg"
  description: string;
  recommendation: string;
  status: 'ativo' | 'condicionado' | 'pausado';
  estimatedDays?: string;
  costPerKg?: string;
  recommendedFor?: string;
}

export interface GeneralLogisticsSettings {
  modes: {
    aereo: LogisticsModeConfig;
    maritimo: LogisticsModeConfig;
    terrestre: LogisticsModeConfig;
  };
  intermediationFeeRate: string; // "10% a 15%"
  customsTaxAGT: string; // "8.000 AOA (Taxa fixa Guia de Trânsito AGT)"
  pickupAddressCabinda: string; // "Armazém C-4, Recinto Portuário de Cabinda, Rua Direita"
  consolidationAddressLuanda: string; // "Parque Logístico Portuário / Viana, Luanda"
  deliveryOptions: string; // "Levantamento no Balcão de Cabinda (Armazém C-4) ou Entrega ao Domicílio"
  requiredDocuments: string[];
  warrantyAndRefundPolicy: string;
  operationalNote: string;
  lastUpdated: string;
  updatedBy: string;
  intermediationFeePercentage?: string;
  customsTransitFeeAGT?: string;
  pickupLocationCabinda?: string;
  consolidationWarehouseLuanda?: string;
  guaranteeAndRefundPolicy?: string;
  operationalNotice?: string;
}

export interface DynamicKnowledgeItem {
  id: string;
  category: 'logistica' | 'prazos' | 'custos' | 'documentacao' | 'rastreamento' | 'pagamentos' | 'garantia' | 'categorias' | 'regras' | 'geral' | string;
  question: string;
  keywords: string[];
  shortAnswer: string;
  detailedAnswer: string;
  suggestedNextQuestions: string[];
  actionLink?: {
    label: string;
    view: string;
    icon?: string;
  };
  isActive: boolean;
  lastUpdated: string;
  updatedBy?: string;
}

export interface KnowledgeAuditLog {
  id: string;
  timestamp: string;
  adminName: string;
  adminRole?: string;
  actionType: 'logistica_update' | 'knowledge_item_create' | 'knowledge_item_update' | 'knowledge_item_delete' | 'knowledge_create' | 'knowledge_edit' | 'knowledge_delete' | 'bot_settings_update' | 'reset_defaults' | string;
  section: string;
  fieldName?: string;
  previousValue: string;
  newValue: string;
  notes?: string;
}

export type AuditLogEntry = KnowledgeAuditLog;



