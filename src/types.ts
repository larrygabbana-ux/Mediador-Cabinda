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
  productName: string;
  quantity: number;
  supplierName: string;
  supplierPhone: string;
  supplierLocation: string;
  productPhotoUrl?: string;
  productPhotos?: { url: string; type: 'camera' | 'gallery' | 'document'; name: string }[];
  notes?: string;
  
  // Budget values
  budgetRawPrice?: number; // Base product price in AOA
  budgetShipping?: number; // Cargo / Freight in AOA
  dispatchFee?: number; // Custom clearing fee in AOA
  commissionRate?: number; // 0.10 to 0.15 (10% to 15%)
  commissionAmount?: number;
  totalAmount?: number;
  paid: boolean;
  paymentMethod?: 'transferencia' | 'multicaixa' | 'referencia';
  paymentReference?: string;
  checkoutProofUrl?: string; // Comprovativo de compra
  deliveryOption: 'escritorio' | 'domicilio';
  deliveryAddress?: string;

  // Carriage details
  shippingCarrier?: string;
  shippingGuideNumber?: string;
  shippingDate?: string;
  estimateDeliveryDate?: string;

  status: OrderStatus;
  rating?: number; // Service evaluation (1-5)
  feedback?: string; // Service evaluation notes
  complaint?: string; // Reclamações
  complaintResolved?: boolean;
  pointsEarned: number;
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
  phoneHidden: string; // Protected (only Mediator accesses, hidden from client)
  emailHidden: string;   // Protected
  addressHidden: string; // Protected
  createdAt: string;
}

export interface SupplierProduct {
  id: string;
  supplierId: string;
  name: string;
  price: number; // in AOA
  availability: 'imediata' | 'sob-pedido' | 'esgotado';
  stock: number;
  description?: string;
  photoUrl: string;
  published: boolean; // Approved/published by mediator
  sponsored: boolean; // Highlighted
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

