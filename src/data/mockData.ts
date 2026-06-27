/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Client, Order, Message, Notification, CarrierCompany, Supplier, SupplierProduct, SupplierMessage } from '../types';

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
  'Cabinda': ['Cabinda (Sede)', 'Cacongo', 'Buco-Zau', 'Belize'],
  'Luanda': ['Luanda', 'Cazenga', 'Viana', 'Belas', 'Cacuaco', 'Talatona', 'Kilamba Kiaxi', 'Icolo e Bengo', 'Quiçama'],
  'Benguela': ['Benguela', 'Lobito', 'Catumbela', 'Baía Farta', 'Bocoio'],
  'Huambo': ['Huambo', 'Caála', 'Bailundo', 'Ekunha'],
  'Huíla': ['Lubango', 'Chibia', 'Cacula', 'Humpata']
};

export const DEFAULT_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    name: 'Bartolomeu Nolasco',
    phone: '+244 923 456 789',
    email: 'bartolomeu.nolasco@gmail.com',
    address: 'Bairro Gika, Zona Verde, Casa 42',
    nif: '005432190LA045',
    province: 'Cabinda',
    municipality: 'Cabinda (Sede)',
    points: 1250,
    tier: 'Prata'
  },
  {
    id: 'cli-2',
    name: 'Avelina de Sousa Chimpa',
    phone: '+244 931 888 222',
    email: 'avelina.chimpa@outlook.ao',
    address: 'Bairro Chimoio, Rua da Independência',
    nif: '009876543CB012',
    province: 'Cabinda',
    municipality: 'Buco-Zau',
    points: 400,
    tier: 'Bronze'
  },
  {
    id: 'cli-3',
    name: 'Manuel Domingos Buco',
    phone: '+244 912 333 444',
    email: 'manuel.buco@outlook.com',
    address: 'Bairro Cabodo, Rua Principal S/N',
    nif: '006789123CB088',
    province: 'Cabinda',
    municipality: 'Cabinda (Sede)',
    points: 3800,
    tier: 'Ouro'
  }
];

export const CARRIER_COMPANIES: CarrierCompany[] = [
  { id: 'carr-1', name: 'AngoExpress Cargo', phone: '+244 922 100 200', baseRatePerKg: 1200, expectedDays: 3 },
  { id: 'carr-2', name: 'Cabinda Cargas & Logística', phone: '+244 933 454 454', baseRatePerKg: 950, expectedDays: 5 },
  { id: 'carr-3', name: 'TransAngola Marítima', phone: '+244 911 500 500', baseRatePerKg: 600, expectedDays: 8 },
  { id: 'carr-4', name: 'Flota Aérea TAAG Cargo', phone: '+244 924 900 900', baseRatePerKg: 2500, expectedDays: 1 }
];

export const DEFAULT_ORDERS: Order[] = [
  {
    id: 'MED-1001',
    clientId: 'cli-1',
    clientName: 'Bartolomeu Nolasco',
    clientPhone: '+244 923 456 789',
    productName: 'Eletrobomba Submersível de Água 2HP Pedrollo',
    quantity: 1,
    supplierName: 'Comercial Luanda S.A. (Robert Hudson)',
    supplierPhone: '+244 924 111 222',
    supplierLocation: 'Luanda, Morro Bento',
    productPhotoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    notes: 'Preciso da bomba com voltagem monofásica para poço artesiano residencial em Cabinda.',
    budgetRawPrice: 180000,
    budgetShipping: 15000,
    dispatchFee: 10000,
    commissionRate: 0.12,
    commissionAmount: 21600,
    totalAmount: 226600,
    paid: true,
    paymentMethod: 'multicaixa',
    paymentReference: 'Ref: MCQ-882190-2026',
    checkoutProofUrl: 'Comprovativo_Compra_MED1001.pdf',
    deliveryOption: 'domicilio',
    deliveryAddress: 'Bairro Gika, Zona Verde, Casa 42, Cabinda, Angola',
    shippingCarrier: 'Cabinda Cargas & Logística',
    shippingGuideNumber: 'GUI-CB-88514',
    shippingDate: '2026-06-11',
    estimateDeliveryDate: '2026-06-16',
    status: 'TRANSPORTE',
    pointsEarned: 180,
    createdAt: '2026-06-10T14:30:00Z'
  },
  {
    id: 'MED-1002',
    clientId: 'cli-2',
    clientName: 'Avelina de Sousa Chimpa',
    clientPhone: '+244 931 888 222',
    productName: 'Computador Portátil HP 15" Intel i5 16GB RAM',
    quantity: 1,
    supplierName: 'Mundo Digital Angola',
    supplierPhone: '+244 945 777 888',
    supplierLocation: 'Luanda, Maculusso, Rua Amílcar Cabral',
    productPhotoUrl: 'https://images.unsplash.com/photo-1496181130204-755241524eab?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    notes: 'Por favor, verificar se vem acompanhado com mochila e rato original.',
    budgetRawPrice: 420000,
    budgetShipping: 12000,
    dispatchFee: 8000,
    commissionRate: 0.10,
    commissionAmount: 42000,
    totalAmount: 482000,
    paid: false,
    deliveryOption: 'escritorio',
    status: 'ORCADO',
    pointsEarned: 420,
    createdAt: '2026-06-12T09:15:00Z'
  },
  {
    id: 'MED-1003',
    clientId: 'cli-3',
    clientName: 'Manuel Domingos Buco',
    clientPhone: '+244 912 333 444',
    productName: 'Placas de Contraplacado Marítimo 18mm (Madeira)',
    quantity: 15,
    supplierName: 'Serração & Carpintaria Luanda Lda.',
    supplierPhone: '+244 923 711 922',
    supplierLocation: 'Cacuaco, Zona Industrial',
    productPhotoUrl: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    notes: 'Encomenda pesada e volumosa para o estaleiro. Orçar transporte marítimo por contentor se possível.',
    status: 'RECEBIDO',
    paid: false,
    deliveryOption: 'escritorio',
    pointsEarned: 750,
    createdAt: '2026-06-13T07:44:00Z'
  },
  {
    id: 'MED-0999',
    clientId: 'cli-3',
    clientName: 'Manuel Domingos Buco',
    clientPhone: '+244 912 333 444',
    productName: 'Pneus Michelin LTX Force 265/65R17',
    quantity: 4,
    supplierName: 'AutoLuanda Pneus e Jantes',
    supplierPhone: '+244 912 882 119',
    supplierLocation: 'Luanda, Largo da Samba S/N',
    productPhotoUrl: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    notes: 'Pneus para carrinha Toyota Hilux.',
    budgetRawPrice: 320000,
    budgetShipping: 40000,
    dispatchFee: 15000,
    commissionRate: 0.12,
    commissionAmount: 38400,
    totalAmount: 413400,
    paid: true,
    paymentMethod: 'transferencia',
    paymentReference: 'D/C BAI - MANUEL BUCO',
    checkoutProofUrl: 'Recibo_FAT_AutoLuanda_4429.pdf',
    deliveryOption: 'escritorio',
    shippingCarrier: 'AngoExpress Cargo',
    shippingGuideNumber: 'GUI-AE-92144',
    shippingDate: '2026-06-03',
    estimateDeliveryDate: '2026-06-06',
    status: 'ENTREGUE',
    rating: 5,
    feedback: 'O serviço de intermediação funcionou perfeitamente. Pneus entregues na nossa garagem em perfeitas condições sem termos de gastar passagens para Luanda.',
    pointsEarned: 320,
    createdAt: '2026-06-02T11:00:00Z'
  }
];

export const DEFAULT_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    orderId: 'MED-1001',
    sender: 'admin',
    text: 'Olá Bartolomeu, estamos a analisar a disponibilidade do fornecedor Pedrollo. Entraremos em contacto brevemente com o orçamento oficial.',
    timestamp: '2026-06-10T15:00:00Z',
    read: true
  },
  {
    id: 'msg-2',
    orderId: 'MED-1001',
    sender: 'client',
    text: 'Obrigado pela vossa rapidez. Se conseguirem confirmar que vem com garantia de 1 ano, seria ótimo.',
    timestamp: '2026-06-10T15:12:00Z',
    read: true
  },
  {
    id: 'msg-3',
    orderId: 'MED-1001',
    sender: 'admin',
    text: 'Confirmado com o fornecedor. Garantia incluída. Já procedemos ao envio por via marítima pela Cabinda Cargas! A sua guia de transporte está registada na ficha do seu pedido.',
    timestamp: '2026-06-11T16:45:00Z',
    read: true
  },
  {
    id: 'msg-4',
    orderId: 'MED-1002',
    sender: 'admin',
    text: 'Prezada Avelina, o computador HP i5 foi orçado. O fornecedor Mundo Digital tem stock e a comissão promocional foi definida para 10%. Aguardamos o seu pagamento por transferência ou Multicaixa Express.',
    timestamp: '2026-06-12T10:10:00Z',
    read: true
  }
];

export const DEFAULT_SUPPLIERS: Supplier[] = [
  {
    id: 'supp-1',
    name: 'Mundo Digital Angola Lda',
    city: 'Luanda',
    category: 'Eletrónicos e Tecnologia',
    rating: 4.8,
    reviewsCount: 32,
    plan: 'diamante',
    logoUrl: 'https://images.unsplash.com/photo-1468436139062-f60a71c5c892?w=100&auto=format&fit=crop&q=60',
    description: 'Distribuidor oficial de computadores, impressoras e informática corporativa de alta performance.',
    phoneHidden: '+244 945 777 888',
    emailHidden: 'contacto@mundodigital.ao',
    addressHidden: 'Maculusso, Rua Amílcar Cabral, Luanda, Angola',
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'supp-2',
    name: 'Serralharia Industrial Cabinda Lda',
    city: 'Cabinda',
    category: 'Construção e Metalurgia',
    rating: 4.5,
    reviewsCount: 14,
    plan: 'ouro',
    logoUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=100&auto=format&fit=crop&q=60',
    description: 'Oficina mestre de metalurgia pesada, fabrico de vigas de ferro e estruturas para armazéns.',
    phoneHidden: '+244 933 666 111',
    emailHidden: 'metalurgica.cabinda@net.ao',
    addressHidden: 'Zona Industrial do Yabi, Lote 14, Cabinda',
    createdAt: '2026-02-15T10:30:00Z'
  },
  {
    id: 'supp-3',
    name: 'Grupo Robert Hudson Angola',
    city: 'Luanda',
    category: 'Máquinas e Equipamentos',
    rating: 4.9,
    reviewsCount: 25,
    plan: 'prata',
    logoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&auto=format&fit=crop&q=60',
    description: 'Líder em bombagem hidráulica, geradores elétricos, motorizadas e insumos mecânicos.',
    phoneHidden: '+244 924 111 222',
    emailHidden: 'vendas@roberthudson.co.ao',
    addressHidden: 'Estrada do Lar do Patriota, Km 4, Luanda',
    createdAt: '2026-01-20T11:45:00Z'
  },
  {
    id: 'supp-4',
    name: 'EletroCabinda Fornecimentos',
    city: 'Cabinda',
    category: 'Material Elétrico',
    rating: 4.2,
    reviewsCount: 8,
    plan: 'gratuito',
    logoUrl: 'https://images.unsplash.com/photo-1498084393753-b411b2d26b34?w=100&auto=format&fit=crop&q=60',
    description: 'Loja local especialista em equipamentos de cablagem, automação residencial e quadros elétricos.',
    phoneHidden: '+244 912 700 800',
    emailHidden: 'balcao@eletrocabinda.com',
    addressHidden: 'Rua do Comércio, Edifício Progresso, Cabinda',
    createdAt: '2026-03-01T09:20:00Z'
  }
];

export const DEFAULT_SUPPLIER_PRODUCTS: SupplierProduct[] = [
  {
    id: 'sprod-1',
    supplierId: 'supp-1',
    name: 'Computador Portátil HP ProBook G10 15.6" i5 16GB RAM',
    price: 450000,
    availability: 'imediata',
    stock: 8,
    description: 'Processador de última geração, excelente para produtividade administrativa e gestão comercial.',
    photoUrl: 'https://images.unsplash.com/photo-1496181130204-755241524eab?w=500&auto=format&fit=crop&q=60',
    published: true,
    sponsored: true,
    createdAt: '2026-06-10T12:00:00Z'
  },
  {
    id: 'sprod-2',
    supplierId: 'supp-1',
    name: 'Router Industrial MikroTik RB5009 10G SFP+',
    price: 180000,
    availability: 'imediata',
    stock: 15,
    description: 'Roteador profissional para redes corporativas estáveis. Suporta balanceamento de carga de múltiplos links.',
    photoUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=60',
    published: true,
    sponsored: true,
    createdAt: '2026-06-11T14:30:00Z'
  },
  {
    id: 'sprod-3',
    supplierId: 'supp-3',
    name: 'Gerador Elétrico Insonorizado Toyama 5.5 KVA Bivolt',
    price: 890000,
    availability: 'imediata',
    stock: 3,
    description: 'Gerador a diesel silencioso, ideal para residências e pequenos negócios fazerem face a falhas de energia.',
    photoUrl: 'https://images.unsplash.com/photo-1620712447308-cfbcb829c3c6?w=500&auto=format&fit=crop&q=60',
    published: true,
    sponsored: true,
    createdAt: '2026-06-12T09:00:00Z'
  },
  {
    id: 'sprod-4',
    supplierId: 'supp-4',
    name: 'Cabo Elétrico de Cobre de Flexível 16mm² (Rolo de 100m)',
    price: 245000,
    availability: 'imediata',
    stock: 45,
    description: 'Cabo elétrico de alta qualidade para fiação de potência residencial de acordo com normas nacionais.',
    photoUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=60',
    published: true,
    sponsored: false,
    createdAt: '2026-06-13T10:00:00Z'
  },
  {
    id: 'sprod-5',
    supplierId: 'supp-4',
    name: 'Painel Solar Fotovoltaico Monocristalino 550W',
    price: 125000,
    availability: 'sob-pedido',
    stock: 0,
    description: 'Células monocristalinas de alta eficiência, com grande resistência a intempéries marinhas de Cabinda.',
    photoUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&auto=format&fit=crop&q=60',
    published: true,
    sponsored: false,
    createdAt: '2026-06-14T11:00:00Z'
  }
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

const STORAGE_KEYS = {
  CLIENTS: 'mediador_cabinda_clients',
  ORDERS: 'mediador_cabinda_orders',
  MESSAGES: 'mediador_cabinda_messages',
  CURRENT_CLIENT_ID: 'mediador_cabinda_curr_client_id',
  SUPPLIERS: 'mediador_cabinda_suppliers',
  SUPPLIER_PRODUCTS: 'mediador_cabinda_supplier_products',
  SUPPLIER_MESSAGES: 'mediador_cabinda_supplier_messages'
};

export function initializeStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.CLIENTS)) {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(DEFAULT_CLIENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_ORDERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(DEFAULT_MESSAGES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_CLIENT_ID)) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_CLIENT_ID, 'cli-1'); // Default active client in simulator
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(DEFAULT_SUPPLIERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUPPLIER_PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.SUPPLIER_PRODUCTS, JSON.stringify(DEFAULT_SUPPLIER_PRODUCTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUPPLIER_MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.SUPPLIER_MESSAGES, JSON.stringify(DEFAULT_SUPPLIER_MESSAGES));
  }
}

export function getClients(): Client[] {
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.CLIENTS);
  return raw ? JSON.parse(raw) : DEFAULT_CLIENTS;
}

export function saveClients(clients: Client[]) {
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
}

export function getOrders(): Order[] {
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
  return raw ? JSON.parse(raw) : DEFAULT_ORDERS;
}

export function saveOrders(orders: Order[]) {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

export function getMessages(): Message[] {
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
  return raw ? JSON.parse(raw) : DEFAULT_MESSAGES;
}

export function saveMessages(messages: Message[]) {
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
}

export function getCurrentClientId(): string {
  initializeStorage();
  return localStorage.getItem(STORAGE_KEYS.CURRENT_CLIENT_ID) || 'cli-1';
}

export function saveCurrentClientId(clientId: string) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_CLIENT_ID, clientId);
}

export function getSuppliers(): Supplier[] {
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
  return raw ? JSON.parse(raw) : DEFAULT_SUPPLIERS;
}

export function saveSuppliers(suppliers: Supplier[]) {
  localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
}

export function getSupplierProducts(): SupplierProduct[] {
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.SUPPLIER_PRODUCTS);
  return raw ? JSON.parse(raw) : DEFAULT_SUPPLIER_PRODUCTS;
}

export function saveSupplierProducts(products: SupplierProduct[]) {
  localStorage.setItem(STORAGE_KEYS.SUPPLIER_PRODUCTS, JSON.stringify(products));
}

export function getSupplierMessages(): SupplierMessage[] {
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.SUPPLIER_MESSAGES);
  return raw ? JSON.parse(raw) : DEFAULT_SUPPLIER_MESSAGES;
}

export function saveSupplierMessages(messages: SupplierMessage[]) {
  localStorage.setItem(STORAGE_KEYS.SUPPLIER_MESSAGES, JSON.stringify(messages));
}

