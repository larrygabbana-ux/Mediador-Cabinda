/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Client, Order, Message, Notification, CarrierCompany, Supplier, SupplierProduct, SupplierMessage, SupplierService, ServiceRequest, AdminMasterAccount } from '../types';

export const PROVINCES_OF_ANGOLA = [
  'Cabinda',
  'Luanda',
  'Benguela',
  'Huambo',
  'Huíla',
  'Namibe',
  'Uíge',
  'Malanje',
  'Cuanza Sul',
  'Cuanza Norte',
  'Zaire',
  'Lunda Norte',
  'Lunda Sul',
  'Moxico',
  'Cuando Cubango',
  'Cunene',
  'Bengo',
  'Bié'
];

export const MUNICIPALITIES: Record<string, string[]> = {
  'Cabinda': ['Cabinda (Sede)', 'Liambo', 'Cacongo', 'Buco-Zau', 'Belize', 'Necuto', 'Miconje', 'Tando Zinze', 'Lândana', 'Massabi'],
  'Luanda': ['Luanda', 'Cazenga', 'Viana', 'Belas', 'Cacuaco', 'Talatona', 'Kilamba Kiaxi', 'Icolo e Bengo', 'Quiçama'],
  'Benguela': ['Benguela', 'Lobito', 'Catumbela', 'Baía Farta', 'Bocoio', 'Ganda', 'Cubal'],
  'Huambo': ['Huambo', 'Caála', 'Bailundo', 'Ekunha', 'Longonjo'],
  'Huíla': ['Lubango', 'Chibia', 'Cacula', 'Humpata', 'Matala'],
  'Uíge': ['Uíge', 'Negage', 'Sanza Pombo', 'Maquela do Zombo'],
  'Zaire': ['Mbanza Kongo', 'Soyo', 'Nzeto', 'Tomboco']
};

// Default clients with João Hilário António as primary account & 1 sample client
export const DEFAULT_CLIENTS: Client[] = [
  {
    id: 'cli-joao-hilario',
    name: 'João Hilário António',
    phone: '+244 942 043 293',
    email: 'hilariogime0@gmail.com',
    address: 'Bairro Cabassango, Município de Liambo, Cabinda, Angola',
    nif: '005432109CA042',
    province: 'Cabinda',
    municipality: 'Liambo',
    points: 500,
    tier: 'Ouro'
  },
  {
    id: 'cli-amostra-2',
    name: 'Empresa Comercial Exemplo Lda (Amostra)',
    phone: '+244 923 000 111',
    email: 'exemplo@empresa.ao',
    address: 'Via AL-15, Talatona, Luanda',
    nif: '5400998877',
    province: 'Luanda',
    municipality: 'Talatona',
    points: 150,
    tier: 'Standard'
  }
];

export const CARRIER_COMPANIES: CarrierCompany[] = [
  { id: 'carr-1', name: 'AngoExpress Cargo', phone: '+244 922 100 200', baseRatePerKg: 1200, expectedDays: 3, mode: 'maritimo' },
  { id: 'carr-2', name: 'Cabinda Cargas & Logística', phone: '+244 933 454 454', baseRatePerKg: 950, expectedDays: 5, mode: 'maritimo' },
  { id: 'carr-3', name: 'TransAngola Marítima (Cabotagem Secil)', phone: '+244 911 500 500', baseRatePerKg: 450, expectedDays: 3, mode: 'maritimo' },
  { id: 'carr-4', name: 'Flota Aérea TAAG Cargo Express', phone: '+244 924 900 900', baseRatePerKg: 2500, expectedDays: 1, mode: 'aereo' },
  { id: 'carr-5', name: 'Corredor Rodoviário Angola-Cabinda', phone: '+244 931 700 800', baseRatePerKg: 350, expectedDays: 8, mode: 'terrestre' }
];

export const DEFAULT_ORDERS: Order[] = [
  {
    id: 'MC-2026-0001',
    clientId: 'cli-joao-hilario',
    clientName: 'João Hilário António',
    clientPhone: '+244 942 043 293',
    clientEmail: 'hilariogime0@gmail.com',
    destinationProvince: 'Cabinda',
    destinationMunicipality: 'Liambo',
    destinationAddress: 'Bairro Cabassango, Município de Liambo, Cabinda',
    routeDirection: 'Luanda-Cabinda',
    originCity: 'Luanda',
    destinationCity: 'Cabinda',
    supplierName: 'Mundo Digital Angola Lda',
    supplierLocation: 'Maculusso, Luanda',
    items: [
      {
        id: 'item-1',
        name: 'Computador Portátil HP ProBook G10 15.6" i5',
        quantity: 1,
        unitPrice: 680000,
        supplierName: 'Mundo Digital Angola Lda'
      }
    ],
    itemsTotal: 680000,
    freightCost: 15000,
    serviceFee: 102000,
    insuranceCost: 5000,
    totalAmount: 802000,
    status: 'TRANSPORTE',
    trackingCode: 'MC-LUACAB-2026-001',
    paymentStatus: 'pago',
    paymentMethod: 'transferencia',
    carrierCompany: 'TransAngola Marítima (Cabotagem Secil)',
    waybillNumber: 'GW-2026-8812',
    containerNumber: 'TCKU-998812-0',
    sealNumber: 'SEAL-MC-042',
    vesselName: 'Balsa Cabotagem Cabinda-1',
    departureDate: '2026-08-10T08:00:00Z',
    estimatedArrival: '2026-08-14T16:00:00Z',
    createdAt: '2026-08-08T10:00:00Z',
    updatedAt: '2026-08-10T08:30:00Z',
    history: [
      {
        status: 'comprado_em_luanda',
        date: '2026-08-08T10:00:00Z',
        location: 'Luanda',
        description: 'Artigo adquirido no fornecedor em Luanda pelo Mediador Cabinda.'
      },
      {
        status: 'embalado_armazem',
        date: '2026-08-09T14:00:00Z',
        location: 'Armazém Luanda Central',
        description: 'Carga inspecionada, embalada com proteção contra humidade e paletizada.'
      },
      {
        status: 'transito_maritimo',
        date: '2026-08-10T08:00:00Z',
        location: 'Porto de Luanda',
        description: 'Carga embarcada no navio com destino ao Porto Comercial de Cabinda.'
      }
    ]
  },
  {
    id: 'MC-2026-0002',
    clientId: 'cli-amostra-2',
    clientName: 'Empresa Comercial Exemplo Lda',
    clientPhone: '+244 923 000 111',
    clientEmail: 'exemplo@empresa.ao',
    destinationProvince: 'Luanda',
    destinationMunicipality: 'Talatona',
    destinationAddress: 'Via AL-15, Talatona, Luanda',
    routeDirection: 'Cabinda-Luanda',
    originCity: 'Cabinda',
    destinationCity: 'Luanda',
    supplierName: 'Serralharia Industrial Cabinda Lda',
    supplierLocation: 'Zona Industrial do Yabi, Cabinda',
    items: [
      {
        id: 'item-2',
        name: 'Portão de Ferro Forjado e Gradeamento de Segurança sob Medida',
        quantity: 1,
        unitPrice: 320000,
        supplierName: 'Serralharia Industrial Cabinda Lda'
      }
    ],
    itemsTotal: 320000,
    freightCost: 12000,
    serviceFee: 48000,
    insuranceCost: 3000,
    totalAmount: 383000,
    status: 'COMPRADO',
    trackingCode: 'MC-CABLUA-2026-002',
    paymentStatus: 'pago',
    paymentMethod: 'multicaixa',
    carrierCompany: 'AngoExpress Cargo',
    waybillNumber: 'GW-2026-9922',
    createdAt: '2026-08-11T09:00:00Z',
    updatedAt: '2026-08-11T11:00:00Z',
    history: [
      {
        status: 'comprado_em_luanda',
        date: '2026-08-11T09:00:00Z',
        location: 'Cabinda',
        description: 'Pedido registado e pagamento confirmado. Em preparação na oficina do fornecedor.'
      }
    ]
  }
];

export const DEFAULT_MESSAGES: Message[] = [];

export const DEFAULT_SUPPLIERS: Supplier[] = [
  {
    id: 'supp-1',
    name: 'Mundo Digital Angola Lda (Amostra)',
    city: 'Luanda',
    category: 'Eletrónicos',
    rating: 4.8,
    reviewsCount: 32,
    plan: 'diamante',
    logoUrl: 'https://images.unsplash.com/photo-1468436139062-f60a71c5c892?w=100&auto=format&fit=crop&q=60',
    description: 'Distribuidor oficial de computadores, impressoras e informática corporativa de alta performance.',
    nif: '5417089230',
    contactPerson: 'Eng. Domingos Afonso (Gestor de Contas)',
    whatsapp: '+244 945 777 888',
    phoneHidden: '+244 945 777 888',
    emailHidden: 'contacto@mundodigital.ao',
    addressHidden: 'Maculusso, Rua Amílcar Cabral, Nº 44, Luanda, Angola',
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'supp-2',
    name: 'Serralharia Industrial Cabinda Lda (Amostra)',
    city: 'Cabinda',
    category: 'Construção',
    rating: 4.5,
    reviewsCount: 14,
    plan: 'ouro',
    logoUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=100&auto=format&fit=crop&q=60',
    description: 'Oficina mestre de metalurgia pesada, fabrico de vigas de ferro e estruturas para armazéns.',
    nif: '5002918841',
    contactPerson: 'Mestre Sebastião Mabiala',
    whatsapp: '+244 933 666 111',
    phoneHidden: '+244 933 666 111',
    emailHidden: 'metalurgica.cabinda@net.ao',
    addressHidden: 'Zona Industrial do Yabi, Lote 14, Cabinda',
    createdAt: '2026-02-15T10:30:00Z'
  }
];

export const DEFAULT_SUPPLIER_PRODUCTS: SupplierProduct[] = [
  {
    id: 'sprod-1',
    productCode: 'PRD-1001',
    supplierId: 'supp-1',
    name: 'Computador Portátil HP ProBook G10 15.6" i5 16GB RAM 512GB SSD',
    category: 'eletronicos',
    subCategory: 'computadores',
    price: 450000,
    originalPrice: 520000,
    availability: 'imediata',
    stock: 8,
    rating: 4.9,
    salesCount: 38,
    tags: ['Super Oferta', 'Frete Aéreo Disponível', 'Garantia 12m'],
    condition: 'novo',
    warranty: 'Garantia Oficial HP de 12 Meses',
    description: 'Processador Intel Core i5 de 13ª geração, 16GB DDR4, 512GB SSD NVMe de alta velocidade. Ecrã IPS Full HD antirreflexo, teclado numérico retroiluminado e bateria com até 9 horas de autonomia.',
    photoUrl: 'https://images.unsplash.com/photo-1496181130204-755241524eab?w=800&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1496181130204-755241524eab?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: [
      { key: 'Processador', value: 'Intel Core i5-1335U (até 4.6 GHz)' },
      { key: 'Memória RAM', value: '16 GB DDR4-3200 MHz' },
      { key: 'Armazenamento', value: '512 GB SSD PCIe NVMe M.2' },
      { key: 'Ecrã', value: '15.6" FHD (1920 x 1080) IPS, antirreflexo' },
      { key: 'Sistema Operativo', value: 'Windows 11 Pro 64-bit Original' },
      { key: 'Origem do Lote', value: 'Armazém Homologado Maculusso, Luanda' }
    ],
    published: true,
    sponsored: true,
    location: 'Luanda',
    availableFromDate: 'Imediata (Hoje)',
    createdAt: '2026-06-10T12:00:00Z'
  },
  {
    id: 'sprod-2',
    productCode: 'PRD-1002',
    supplierId: 'supp-1',
    name: 'Router Industrial MikroTik RB5009 10G SFP+ 8 Portas Gigabit',
    category: 'eletronicos',
    subCategory: 'redes-conexoes',
    price: 180000,
    originalPrice: 210000,
    availability: 'imediata',
    stock: 15,
    rating: 4.8,
    salesCount: 64,
    tags: ['Destaque Corporativo', 'Pronta Entrega'],
    condition: 'novo',
    warranty: 'Garantia de 12 Meses',
    description: 'Roteador profissional compacto com 7 portas Gigabit Ethernet, 1 porta 2.5G e 1 slot SFP+ de 10G. Processador Quad-Core 1.4 GHz e 1GB de RAM DDR4.',
    photoUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: [
      { key: 'Portas', value: '7x 1G, 1x 2.5G, 1x 10G SFP+' },
      { key: 'Processador', value: 'Marvell Armada Quad-Core 1.4 GHz' },
      { key: 'Alimentação', value: 'PoE-in, Jack DC, Bloco Terminal 24V-57V' }
    ],
    published: true,
    sponsored: true,
    location: 'Luanda',
    availableFromDate: 'Imediata (Hoje)',
    createdAt: '2026-06-11T14:30:00Z'
  },
];

export const DEFAULT_SUPPLIER_MESSAGES: SupplierMessage[] = [
  {
    id: 'smsg-1',
    supplierId: 'supp-1',
    sender: 'fornecedor',
    text: 'Prezado Mediador Cabinda, atualizamos a tabela comercial para o HP ProBook. Conseguem divulgar a campanha ativamente no painel?',
    timestamp: '2026-06-14T09:00:00Z',
    read: true
  },
  {
    id: 'smsg-2',
    supplierId: 'supp-1',
    sender: 'mediador',
    text: 'Com certeza! Iremos publicitar o vosso produto com o destaque do seu plano Diamante. Já ativamos no feed dos clientes de Cabinda.',
    timestamp: '2026-06-14T09:30:00Z',
    read: true
  }
];

export const DEFAULT_SUPPLIER_SERVICES: SupplierService[] = [
  {
    id: 'srv-1',
    supplierId: 'supp-1',
    supplierName: 'Mundo Digital & Imobiliária (Amostra)',
    name: 'Terreno Loteado 20x30m no Zango / Viana (Documentado - Amostra)',
    price: 4500000,
    category: 'Venda de Terrenos',
    description: 'Terreno plano de 600m² totalmente legalizado com Direito de Superfície e Croquis de Localização. Excelente acessibilidade à estrada principal.',
    photoUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=60',
    location: 'Luanda',
    executionTime: 'Escritura em 48h',
    published: true,
    createdAt: '2026-06-18T08:00:00Z'
  },
  {
    id: 'srv-2',
    supplierId: 'supp-2',
    supplierName: 'Serralharia & Motors Cabinda Lda (Amostra)',
    name: 'Toyota Hilux 4x4 Cabine Dupla 2.8 Diesel (Amostra)',
    price: 38000000,
    category: 'Venda de Carros',
    description: 'Viatura nova 0km, caixa automática, tração 4x4, interior em pele, pronta entrega com despacho e embarque prioritário para Cabinda.',
    photoUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=60',
    location: 'Cabinda',
    executionTime: 'Entrega Imediata',
    published: true,
    createdAt: '2026-06-22T14:00:00Z'
  }
];

export const DEFAULT_SERVICE_REQUESTS: ServiceRequest[] = [];

// Master Administrator Credentials (Direção Geral - Mediador Cabinda)
export const MASTER_ADMIN_CREDENTIALS = {
  username: 'admin',
  email: 'direcao@mediadorcabinda.ao',
  name: 'Direção Geral - Mediador Cabinda',
  phone: '942043293',
  whatsapp: '942043293',
  address: 'Bairro Cabassango, Município de Liambo, Cabinda',
  province: 'Cabinda',
  municipality: 'Liambo',
  // Ultra-secure, long, high-entropy master password
  passphrase: 'MC#Cabinda2026!DirecaoGeral$MasterKey9942@ProtegidoAO',
  pin: '942043'
};

const STORAGE_KEYS = {
  CLIENTS: 'mediador_cabinda_clients',
  ORDERS: 'mediador_cabinda_orders',
  MESSAGES: 'mediador_cabinda_messages',
  CURRENT_CLIENT_ID: 'mediador_cabinda_curr_client_id',
  SUPPLIERS: 'mediador_cabinda_suppliers',
  SUPPLIER_PRODUCTS: 'mediador_cabinda_supplier_products',
  SUPPLIER_SERVICES: 'mediador_cabinda_supplier_services',
  SERVICE_REQUESTS: 'mediador_cabinda_service_requests',
  SUPPLIER_MESSAGES: 'mediador_cabinda_supplier_messages',
  MASTER_ADMIN: 'mediador_cabinda_master_admin'
};

export function initializeStorage() {
  if (typeof window === 'undefined') return;

  const SCHEMA_VER = 'v2026_08_14_joao_hilario_clean_v11';
  const currentVer = localStorage.getItem('mediador_cabinda_schema_ver');

  // Enforce master admin details for Direção Geral
  const defaultAdmin: AdminMasterAccount = {
    id: 'admin-master',
    name: 'Direção Geral - Mediador Cabinda',
    email: 'direcao@mediadorcabinda.ao',
    phone: '942043293',
    whatsapp: '942043293',
    address: 'Bairro Cabassango, Município de Liambo, Cabinda',
    province: 'Cabinda',
    municipality: 'Liambo',
    role: 'Administrador Master / Direção Geral',
    password: 'MC#Cabinda2026!DirecaoGeral$MasterKey9942@ProtegidoAO',
    pin: '942043',
    createdAt: '2026-01-01T00:00:00Z'
  };

  const rawClients = localStorage.getItem(STORAGE_KEYS.CLIENTS);
  let parsedProductsCount = 0;
  try {
    const rawProds = localStorage.getItem(STORAGE_KEYS.SUPPLIER_PRODUCTS);
    if (rawProds) parsedProductsCount = JSON.parse(rawProds).length;
  } catch {}

  const hasStaleClient = rawClients && (rawClients.includes('Sidónia') || rawClients.includes('Massevo') || rawClients.includes('cli-1') || rawClients.includes('cli-2'));
  const hasStaleProducts = parsedProductsCount > 2;

  if (currentVer !== SCHEMA_VER || hasStaleClient || hasStaleProducts) {
    localStorage.setItem('mediador_cabinda_schema_ver', SCHEMA_VER);
    localStorage.setItem(STORAGE_KEYS.MASTER_ADMIN, JSON.stringify(defaultAdmin));
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(DEFAULT_CLIENTS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_CLIENT_ID, 'cli-joao-hilario');
    localStorage.setItem(STORAGE_KEYS.SUPPLIER_PRODUCTS, JSON.stringify(DEFAULT_SUPPLIER_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.SUPPLIER_SERVICES, JSON.stringify(DEFAULT_SUPPLIER_SERVICES.slice(0, 2)));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_ORDERS.slice(0, 2)));
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SERVICE_REQUESTS, JSON.stringify([]));
    localStorage.setItem('mediador_cabinda_notifications', JSON.stringify([]));
    return;
  }

  const rawMaster = localStorage.getItem(STORAGE_KEYS.MASTER_ADMIN);
  if (!rawMaster) {
    localStorage.setItem(STORAGE_KEYS.MASTER_ADMIN, JSON.stringify(defaultAdmin));
  }
}

export function getMasterAdminAccount(): AdminMasterAccount {
  const defaultAdmin: AdminMasterAccount = {
    id: 'admin-master',
    name: 'Direção Geral - Mediador Cabinda',
    email: 'direcao@mediadorcabinda.ao',
    phone: '942043293',
    whatsapp: '942043293',
    address: 'Bairro Cabassango, Município de Liambo, Cabinda',
    province: 'Cabinda',
    municipality: 'Liambo',
    role: 'Administrador Master / Direção Geral',
    password: 'MC#Cabinda2026!DirecaoGeral$MasterKey9942@ProtegidoAO',
    pin: '942043',
    createdAt: '2026-01-01T00:00:00Z'
  };
  if (typeof window === 'undefined') return defaultAdmin;
  const raw = localStorage.getItem(STORAGE_KEYS.MASTER_ADMIN);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.name) {
        // Guarantee strong password and official email if missing or basic
        if (!parsed.password || parsed.password === 'admin99' || parsed.password === 'admin') {
          parsed.password = 'MC#Cabinda2026!DirecaoGeral$MasterKey9942@ProtegidoAO';
        }
        if (!parsed.email || parsed.email.includes('gmail.com')) {
          parsed.email = 'direcao@mediadorcabinda.ao';
        }
        if (!parsed.pin) {
          parsed.pin = '942043';
        }
        return parsed;
      }
    } catch {}
  }
  localStorage.setItem(STORAGE_KEYS.MASTER_ADMIN, JSON.stringify(defaultAdmin));
  return defaultAdmin;
}

export function saveMasterAdminAccount(account: AdminMasterAccount) {
  safeLocalStorageSetItem(STORAGE_KEYS.MASTER_ADMIN, JSON.stringify(account));
}

export function wipeAllStoredData() {
  if (typeof window === 'undefined') return;
  const keys = [
    'mediador_cabinda_clients',
    'mediador_cabinda_orders',
    'mediador_cabinda_messages',
    'mediador_cabinda_curr_client_id',
    'mediador_cabinda_notifications',
    'mediador_cabinda_service_requests',
    'mediador_cabinda_collaborators',
    'mediador_cabinda_collaborator_sales',
    'mediador_cabinda_is_authorized',
    'mediador_cabinda_saved_access_code',
    'mediador_cabinda_remember_code',
    'mediador_cabinda_master_admin',
    'mediador_cabinda_biometric_credential',
    'mediador_cabinda_bot_settings'
  ];
  keys.forEach(k => {
    try {
      localStorage.removeItem(k);
    } catch {}
  });

  // Reinitialize empty records
  safeLocalStorageSetItem(STORAGE_KEYS.CLIENTS, JSON.stringify([]));
  safeLocalStorageSetItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
  safeLocalStorageSetItem(STORAGE_KEYS.MESSAGES, JSON.stringify([]));
  safeLocalStorageSetItem(STORAGE_KEYS.SERVICE_REQUESTS, JSON.stringify([]));
  safeLocalStorageSetItem(STORAGE_KEYS.CURRENT_CLIENT_ID, '');
}

export function getClients(): Client[] {
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.CLIENTS);
  try {
    return raw ? JSON.parse(raw) : DEFAULT_CLIENTS;
  } catch (e) {
    console.error("Error parsing clients from local storage, resetting:", e);
    return DEFAULT_CLIENTS;
  }
}

export function safeLocalStorageSetItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch (e: any) {
    console.error(`Error saving to localStorage for key ${key}:`, e);
    // If it's a QuotaExceededError, try to clean up base64 images to prevent crashing
    if (e.name === 'QuotaExceededError' || e.code === 22 || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 1014) {
      if (key === STORAGE_KEYS.SUPPLIER_PRODUCTS) {
        try {
          const products: SupplierProduct[] = JSON.parse(value);
          const cleanedProducts = products.map(p => {
            if (p.photoUrl && p.photoUrl.startsWith('data:image/')) {
              return { ...p, photoUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60' };
            }
            return p;
          });
          localStorage.setItem(key, JSON.stringify(cleanedProducts));
          console.warn("Storage quota exceeded! Replaced large base64 photos in products with a lightweight default.");
          return;
        } catch (innerErr) {
          console.error("Failed to recover from quota exceeded in supplier products:", innerErr);
        }
      }
      
      if (key === STORAGE_KEYS.ORDERS) {
        try {
          const orders = JSON.parse(value);
          const cleanedOrders = orders.map((o: any) => {
            if (o.photos && Array.isArray(o.photos)) {
              const cleanedPhotos = o.photos.map((p: any) => {
                if (p.url && p.url.startsWith('data:image/')) {
                  return { ...p, url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60' };
                }
                return p;
              });
              return { ...o, photos: cleanedPhotos };
            }
            return o;
          });
          localStorage.setItem(key, JSON.stringify(cleanedOrders));
          console.warn("Storage quota exceeded! Replaced large base64 photos in orders with a lightweight default.");
          return;
        } catch (innerErr) {
          console.error("Failed to recover from quota exceeded in orders:", innerErr);
        }
      }
    }
  }
}

export function saveClients(clients: Client[]) {
  safeLocalStorageSetItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
}

export function getOrders(): Order[] {
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
  try {
    const list: Order[] = raw ? JSON.parse(raw) : DEFAULT_ORDERS;
    return list.map(o => {
      const isCabindaOrigin = 
        (o.supplierLocation || '').toLowerCase().includes('cabinda') ||
        (o.originLocation || '').toLowerCase().includes('cabinda') ||
        (o.originCity || '').toLowerCase().includes('cabinda');
      
      const routeDirection = o.routeDirection || (isCabindaOrigin ? 'Cabinda-Luanda' : 'Luanda-Cabinda');
      const originCity = o.originCity || (routeDirection === 'Cabinda-Luanda' ? 'Cabinda' : 'Luanda');
      const destinationCity = o.destinationCity || (routeDirection === 'Cabinda-Luanda' ? 'Luanda' : 'Cabinda');

      return {
        ...o,
        routeDirection,
        originCity,
        destinationCity
      };
    });
  } catch (e) {
    console.error("Error parsing orders from local storage, resetting:", e);
    return DEFAULT_ORDERS;
  }
}

export function saveOrders(orders: Order[]) {
  safeLocalStorageSetItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

export function getMessages(): Message[] {
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
  try {
    return raw ? JSON.parse(raw) : DEFAULT_MESSAGES;
  } catch (e) {
    console.error("Error parsing messages from local storage, resetting:", e);
    return DEFAULT_MESSAGES;
  }
}

export function saveMessages(messages: Message[]) {
  safeLocalStorageSetItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
}

export function getCurrentClientId(): string {
  initializeStorage();
  const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_CLIENT_ID);
  if (stored && stored !== 'cli-1') return stored;
  const clients = getClients();
  return clients.length > 0 ? clients[0].id : '';
}

export function saveCurrentClientId(clientId: string) {
  safeLocalStorageSetItem(STORAGE_KEYS.CURRENT_CLIENT_ID, clientId);
}

export function getSuppliers(): Supplier[] {
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
  try {
    return raw ? JSON.parse(raw) : DEFAULT_SUPPLIERS;
  } catch (e) {
    console.error("Error parsing suppliers from local storage, resetting:", e);
    return DEFAULT_SUPPLIERS;
  }
}

export function saveSuppliers(suppliers: Supplier[]) {
  safeLocalStorageSetItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
}

export function getSupplierProducts(): SupplierProduct[] {
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.SUPPLIER_PRODUCTS);
  try {
    const list: SupplierProduct[] = raw ? JSON.parse(raw) : DEFAULT_SUPPLIER_PRODUCTS;
    // Ensure all products have category, subCategory, photos, and ratings
    return list.map(item => {
      const defMatch = DEFAULT_SUPPLIER_PRODUCTS.find(d => d.id === item.id);
      return {
        ...item,
        category: item.category || defMatch?.category || 'eletronicos',
        subCategory: item.subCategory || defMatch?.subCategory || 'computadores',
        photos: item.photos && item.photos.length > 0 ? item.photos : (defMatch?.photos || [item.photoUrl]),
        rating: item.rating || defMatch?.rating || 4.8,
        salesCount: item.salesCount !== undefined ? item.salesCount : (defMatch?.salesCount || 34),
        originalPrice: item.originalPrice || defMatch?.originalPrice || Math.round(item.price * 1.15),
        specifications: item.specifications || defMatch?.specifications || []
      };
    });
  } catch (e) {
    console.error("Error parsing supplier products from local storage, resetting:", e);
    return DEFAULT_SUPPLIER_PRODUCTS;
  }
}

export function saveSupplierProducts(products: SupplierProduct[]) {
  safeLocalStorageSetItem(STORAGE_KEYS.SUPPLIER_PRODUCTS, JSON.stringify(products));
}

export function getSupplierMessages(): SupplierMessage[] {
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.SUPPLIER_MESSAGES);
  try {
    return raw ? JSON.parse(raw) : DEFAULT_SUPPLIER_MESSAGES;
  } catch (e) {
    console.error("Error parsing supplier messages from local storage, resetting:", e);
    return DEFAULT_SUPPLIER_MESSAGES;
  }
}

export function saveSupplierMessages(messages: SupplierMessage[]) {
  safeLocalStorageSetItem(STORAGE_KEYS.SUPPLIER_MESSAGES, JSON.stringify(messages));
}

export function getSupplierServices(): SupplierService[] {
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.SUPPLIER_SERVICES);
  try {
    return raw ? JSON.parse(raw) : DEFAULT_SUPPLIER_SERVICES;
  } catch (e) {
    console.error("Error parsing supplier services from local storage, resetting:", e);
    return DEFAULT_SUPPLIER_SERVICES;
  }
}

export function saveSupplierServices(services: SupplierService[]) {
  safeLocalStorageSetItem(STORAGE_KEYS.SUPPLIER_SERVICES, JSON.stringify(services));
}

export function getServiceRequests(): ServiceRequest[] {
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.SERVICE_REQUESTS);
  try {
    return raw ? JSON.parse(raw) : DEFAULT_SERVICE_REQUESTS;
  } catch (e) {
    console.error("Error parsing service requests from local storage, resetting:", e);
    return DEFAULT_SERVICE_REQUESTS;
  }
}

export function saveServiceRequests(requests: ServiceRequest[]) {
  safeLocalStorageSetItem(STORAGE_KEYS.SERVICE_REQUESTS, JSON.stringify(requests));
}


