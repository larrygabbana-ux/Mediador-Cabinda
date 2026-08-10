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
  'Cabinda': ['Cabinda (Sede)', 'Cacongo', 'Buco-Zau', 'Belize'],
  'Luanda': ['Luanda', 'Cazenga', 'Viana', 'Belas', 'Cacuaco', 'Talatona', 'Kilamba Kiaxi', 'Icolo e Bengo', 'Quiçama'],
  'Benguela': ['Benguela', 'Lobito', 'Catumbela', 'Baía Farta', 'Bocoio'],
  'Huambo': ['Huambo', 'Caála', 'Bailundo', 'Ekunha'],
  'Huíla': ['Lubango', 'Chibia', 'Cacula', 'Humpata']
};

// Clean default data - each client & administrator creates their own account
export const DEFAULT_CLIENTS: Client[] = [];

export const CARRIER_COMPANIES: CarrierCompany[] = [
  { id: 'carr-1', name: 'AngoExpress Cargo', phone: '+244 922 100 200', baseRatePerKg: 1200, expectedDays: 3, mode: 'maritimo' },
  { id: 'carr-2', name: 'Cabinda Cargas & Logística', phone: '+244 933 454 454', baseRatePerKg: 950, expectedDays: 5, mode: 'maritimo' },
  { id: 'carr-3', name: 'TransAngola Marítima (Cabotagem Secil)', phone: '+244 911 500 500', baseRatePerKg: 450, expectedDays: 3, mode: 'maritimo' },
  { id: 'carr-4', name: 'Flota Aérea TAAG Cargo Express', phone: '+244 924 900 900', baseRatePerKg: 2500, expectedDays: 1, mode: 'aereo' },
  { id: 'carr-5', name: 'Corredor Rodoviário Angola-Cabinda', phone: '+244 931 700 800', baseRatePerKg: 350, expectedDays: 8, mode: 'terrestre' }
];

export const DEFAULT_ORDERS: Order[] = [];

export const DEFAULT_MESSAGES: Message[] = [];

export const DEFAULT_SUPPLIERS: Supplier[] = [
  {
    id: 'supp-1',
    name: 'Mundo Digital Angola Lda',
    city: 'Luanda',
    category: 'Eletrónicos & Informática',
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
    name: 'Serralharia Industrial Cabinda Lda',
    city: 'Cabinda',
    category: 'Construção & Ferramentas',
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
  },
  {
    id: 'supp-3',
    name: 'Grupo Robert Hudson Angola',
    city: 'Luanda',
    category: 'Energia Solar & Geradores',
    rating: 4.9,
    reviewsCount: 25,
    plan: 'diamante',
    logoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&auto=format&fit=crop&q=60',
    description: 'Líder em bombagem hidráulica, geradores elétricos, motorizadas e insumos mecânicos.',
    nif: '5401928374',
    contactPerson: 'Dr. Gaspar de Oliveira (Direção Comercial)',
    whatsapp: '+244 924 111 222',
    phoneHidden: '+244 924 111 222',
    emailHidden: 'vendas@roberthudson.co.ao',
    addressHidden: 'Estrada do Lar do Patriota, Km 4, Luanda',
    createdAt: '2026-01-20T11:45:00Z'
  },
  {
    id: 'supp-4',
    name: 'EletroCabinda Fornecimentos',
    city: 'Cabinda',
    category: 'Energia Solar & Geradores',
    rating: 4.2,
    reviewsCount: 8,
    plan: 'prata',
    logoUrl: 'https://images.unsplash.com/photo-1498084393753-b411b2d26b34?w=100&auto=format&fit=crop&q=60',
    description: 'Loja local especialista em equipamentos de cablagem, automação residencial e quadros elétricos.',
    nif: '5019827364',
    contactPerson: 'Sr. António Bumba',
    whatsapp: '+244 912 700 800',
    phoneHidden: '+244 912 700 800',
    emailHidden: 'balcao@eletrocabinda.com',
    addressHidden: 'Rua do Comércio, Edifício Progresso, Cabinda',
    createdAt: '2026-03-01T09:20:00Z'
  },
  {
    id: 'supp-5',
    name: 'AutoPeças Luanda Express',
    city: 'Luanda',
    category: 'Auto & Peças Sobressalentes',
    rating: 4.7,
    reviewsCount: 19,
    plan: 'ouro',
    logoUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=100&auto=format&fit=crop&q=60',
    description: 'Importador direto de pneus, baterias Varta/Bosch e filtros automotivos homologados.',
    nif: '5420918231',
    contactPerson: 'Sr. Carlos Simão',
    whatsapp: '+244 925 444 333',
    phoneHidden: '+244 925 444 333',
    emailHidden: 'vendas@autopecasluanda.ao',
    addressHidden: 'Viana, Estrada de Catete Km 12, Luanda',
    createdAt: '2026-03-10T14:00:00Z'
  },
  {
    id: 'supp-6',
    name: 'Distribuidora Central Cabinda',
    city: 'Cabinda',
    category: 'Eletrodomésticos & Casa',
    rating: 4.6,
    reviewsCount: 11,
    plan: 'prata',
    logoUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=100&auto=format&fit=crop&q=60',
    description: 'Comércio grossista de ar condicionado, arcas congeladoras, frigoríficos e pequenos eletrodomésticos.',
    nif: '5003921840',
    contactPerson: 'Dona Maria Luvualu',
    whatsapp: '+244 938 123 456',
    phoneHidden: '+244 938 123 456',
    emailHidden: 'geral@centralcabinda.ao',
    addressHidden: 'Av. Duque de Chiava, Armazém 8, Cabinda',
    createdAt: '2026-03-15T09:00:00Z'
  },
  {
    id: 'supp-7',
    name: 'Boutique Elegance & Cabelos Luanda',
    city: 'Luanda',
    category: 'Feminino & Mulheres',
    rating: 4.9,
    reviewsCount: 48,
    plan: 'diamante',
    logoUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&auto=format&fit=crop&q=60',
    description: 'Importação direta de perucas frontais de cabelo 100% humano, vestidos elegantes de gala e cosméticos.',
    nif: '5429182301',
    contactPerson: 'Dra. Tatiana Van-Dúnem',
    whatsapp: '+244 923 888 999',
    phoneHidden: '+244 923 888 999',
    emailHidden: 'vendas@eleganceluanda.ao',
    addressHidden: 'Talatona, Shopping Avenida, Loja 18, Luanda',
    createdAt: '2026-03-20T10:00:00Z'
  },
  {
    id: 'supp-8',
    name: 'Maison Homem & Alfaiataria de Luanda',
    city: 'Luanda',
    category: 'Masculino & Homens',
    rating: 4.8,
    reviewsCount: 35,
    plan: 'ouro',
    logoUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=100&auto=format&fit=crop&q=60',
    description: 'Fatos executivos masculinos, camisas de algodão egípcio, sapatos em pele e acessórios de alta classe.',
    nif: '5418293012',
    contactPerson: 'Sr. Mário Castelo Branco',
    whatsapp: '+244 944 555 666',
    phoneHidden: '+244 944 555 666',
    emailHidden: 'alfaiataria@maisonhomem.ao',
    addressHidden: 'Miramar, Rua dos Embaixadores, Nº 12, Luanda',
    createdAt: '2026-03-22T11:00:00Z'
  },
  {
    id: 'supp-9',
    name: 'Cooperativa Agrícola do Maiombe & Cabinda',
    city: 'Cabinda',
    category: 'Alimentos & Do Campo',
    rating: 4.9,
    reviewsCount: 62,
    plan: 'ouro',
    logoUrl: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=100&auto=format&fit=crop&q=60',
    description: 'Produção e colheita direta de mandioca fresca, bombó seco, fuba fina e óleo de palma puro da floresta do Maiombe.',
    nif: '5004819203',
    contactPerson: 'Eng. Agrónomo André Buco',
    whatsapp: '+244 931 222 333',
    phoneHidden: '+244 931 222 333',
    emailHidden: 'campo@maiombecabinda.ao',
    addressHidden: 'Buco-Zau / Armazém de Distribuição Porto de Cabinda',
    createdAt: '2026-03-25T08:30:00Z'
  },
  {
    id: 'supp-10',
    name: 'Fazenda & Agropecuária da Huíla Lda',
    city: 'Huíla',
    category: 'Animais & Pecuária',
    rating: 5.0,
    reviewsCount: 41,
    plan: 'diamante',
    logoUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=100&auto=format&fit=crop&q=60',
    description: 'Criação e venda de gado bovino Nelore/Brahman, vacas leiteiras, cabritos de raça Bôer e suínos com atestado sanitário veterinário.',
    nif: '5409182736',
    contactPerson: 'Dr. Fernando Hossi (Médico Veterinário & Gestor)',
    whatsapp: '+244 928 333 444',
    phoneHidden: '+244 928 333 444',
    emailHidden: 'pecuaria@agrohuila.ao',
    addressHidden: 'Lubango, Fazenda Vale da Chela, Huíla (Com ponto de trânsito em Luanda & Cabinda)',
    createdAt: '2026-03-28T07:00:00Z'
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
  {
    id: 'sprod-3',
    productCode: 'PRD-1003',
    supplierId: 'supp-3',
    name: 'Gerador Elétrico Insonorizado Toyama 6.5 KVA Diesel Trifásico/Monofásico',
    category: 'energia',
    subCategory: 'geradores-gasoleo',
    price: 890000,
    originalPrice: 980000,
    availability: 'imediata',
    stock: 3,
    rating: 5.0,
    salesCount: 19,
    tags: ['Mais Vendido', 'Frete Marítimo Otimizado'],
    condition: 'novo',
    warranty: 'Garantia de 24 Meses ou 1000 horas',
    description: 'Gerador a diesel cabinado super silencioso (68 dB a 7m), arranque elétrico com chave e painel ATS compatível para ligação automática em caso de corte da rede pública.',
    photoUrl: 'https://images.unsplash.com/photo-1620712447308-cfbcb829c3c6?w=800&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1620712447308-cfbcb829c3c6?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: [
      { key: 'Potência Nominal', value: '6.0 kVA / Máxima 6.5 kVA' },
      { key: 'Combustível', value: 'Gasóleo (Diesel) com tanque de 16 Litros' },
      { key: 'Autonomia Média', value: '11 horas a 75% de carga' },
      { key: 'Nível de Ruído', value: '68 dB (Cabinagem acústica industrial)' }
    ],
    published: true,
    sponsored: true,
    location: 'Luanda',
    availableFromDate: 'A partir de amanhã',
    createdAt: '2026-06-12T09:00:00Z'
  },
  {
    id: 'sprod-4',
    productCode: 'PRD-1004',
    supplierId: 'supp-4',
    name: 'Cabo Elétrico de Cobre Flexível 16mm² (Rolo de 100m)',
    category: 'energia',
    subCategory: 'cabos-protecao',
    price: 245000,
    originalPrice: 270000,
    availability: 'imediata',
    stock: 45,
    rating: 4.7,
    salesCount: 82,
    tags: ['Stock em Cabinda', 'Entrega Rápida'],
    condition: 'novo',
    warranty: 'Conforme Norma Europeia / Angolana',
    description: 'Cabo de cobre puro com isolamento anti-chama em PVC 750V/1000V. Ideal para quadros principais e derivações de potência.',
    photoUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: [
      { key: 'Secção', value: '16 mm² flexível' },
      { key: 'Comprimento', value: 'Rolo de 100 metros' },
      { key: 'Condutor', value: '100% Cobre Eletrolítico' }
    ],
    published: true,
    sponsored: false,
    location: 'Cabinda',
    availableFromDate: 'Imediata (Hoje)',
    createdAt: '2026-06-13T10:00:00Z'
  },
  {
    id: 'sprod-5',
    productCode: 'PRD-1005',
    supplierId: 'supp-4',
    name: 'Painel Solar Fotovoltaico Monocristalino Tier-1 550W Jinko Solar',
    category: 'energia',
    subCategory: 'paineis-solares',
    price: 125000,
    originalPrice: 145000,
    availability: 'imediata',
    stock: 28,
    rating: 4.9,
    salesCount: 112,
    tags: ['Top Vendas Solar', 'Alta Eficiência 21.8%'],
    condition: 'novo',
    warranty: '25 Anos de Garantia de Rendimento Linear',
    description: 'Módulo solar fotovoltaico de 144 células Half-Cell com tecnologia multi-busbar. Resistente à corrosão de névoa salina e humidade tropical de Cabinda.',
    photoUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1558449028-b53a39d100fc?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: [
      { key: 'Potência Máxima (Pmax)', value: '550 Watts' },
      { key: 'Eficiência do Módulo', value: '21.8%' },
      { key: 'Tensão Máxima (Vmp)', value: '41.95 V' },
      { key: 'Corrente Máxima (Imp)', value: '13.12 A' }
    ],
    published: true,
    sponsored: true,
    location: 'Luanda',
    availableFromDate: 'Imediata (Hoje)',
    createdAt: '2026-06-14T11:00:00Z'
  },
  {
    id: 'sprod-6',
    productCode: 'PRD-1006',
    supplierId: 'supp-6',
    name: 'Ar Condicionado Split Inverter Midea 12.000 BTU R410A com Wi-Fi',
    category: 'eletronicos',
    subCategory: 'climatizacao-ac',
    price: 320000,
    originalPrice: 360000,
    availability: 'imediata',
    stock: 14,
    rating: 4.8,
    salesCount: 46,
    tags: ['Económico A++', 'Controlo por App'],
    condition: 'novo',
    warranty: 'Garantia de 3 Anos no Compressor',
    description: 'Ar condicionado Split mural de alta poupança energética com gás ecológico R410A. Filtro triplo anti-bactérias e modo silencioso nocturno.',
    photoUrl: 'https://images.unsplash.com/photo-1614633833026-0820552978b6?w=800&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1614633833026-0820552978b6?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: [
      { key: 'Capacidade de Frio', value: '12.000 BTU/h (3.5 kW)' },
      { key: 'Tecnologia', value: 'Full DC Inverter Poupança 60%' },
      { key: 'Gás Refrigerante', value: 'R410A Ecológico' },
      { key: 'Inclui', value: 'Unidade Interior, Exterior, Comando e Tubos de Cobre 3m' }
    ],
    published: true,
    sponsored: true,
    location: 'Luanda',
    availableFromDate: 'Imediata (Hoje)',
    createdAt: '2026-06-15T08:00:00Z'
  },
  {
    id: 'sprod-9',
    productCode: 'PRD-1009',
    supplierId: 'supp-7',
    name: 'Peruca Frontal Lace 13x4 26" Cabelo 100% Humano Brasileiro Liso Sedoso',
    category: 'feminino',
    subCategory: 'perucas-cabelos',
    price: 145000,
    originalPrice: 175000,
    availability: 'imediata',
    stock: 12,
    rating: 5.0,
    salesCount: 89,
    tags: ['Cabelo 100% Humano', 'HD Lace Transparente', 'Destaque Beleza'],
    condition: 'novo',
    warranty: 'Garantia de Qualidade & Não Embaraça',
    description: 'Peruca frontal de renda suíça HD transparente 13x4 com densidade 180%, cabelo virgem brasileiro macio, aceita descoloração e prancha até 220°C. Acabamento natural pré-depilado.',
    photoUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: [
      { key: 'Material', value: '100% Cabelo Humano Natural Grau 12A' },
      { key: 'Comprimento', value: '26 Polegadas (~65 cm)' },
      { key: 'Tipo de Renda', value: 'Frontal HD Lace 13x4 Invisível' },
      { key: 'Densidade', value: '180% Ultra Cheia' },
      { key: 'Origem de Envio', value: 'Boutique Elegance Talatona, Luanda ➔ Envio Rápido Cabinda' }
    ],
    published: true,
    sponsored: true,
    location: 'Luanda',
    availableFromDate: 'Imediata (Hoje)',
    createdAt: '2026-06-16T11:00:00Z'
  },
  {
    id: 'sprod-10',
    productCode: 'PRD-1010',
    supplierId: 'supp-7',
    name: 'Peruca Bob Curto 12" Cabelo Humano Natural Ondulado / Cacheado',
    category: 'feminino',
    subCategory: 'perucas-cabelos',
    price: 89000,
    originalPrice: 105000,
    availability: 'imediata',
    stock: 9,
    rating: 4.9,
    salesCount: 42,
    tags: ['Pronta a Usar', 'Cachos Definidos'],
    condition: 'novo',
    warranty: 'Garantia de Autenticidade Humana',
    description: 'Corte Bob elegante e moderno de 12 polegadas, cabelo 100% humano natural com fecho T-Part Lace respirável. Confortável e leve para o dia a dia.',
    photoUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: [
      { key: 'Estilo', value: 'Bob Cut Ondulado Natural' },
      { key: 'Comprimento', value: '12 Polegadas (~30 cm)' },
      { key: 'Touca', value: 'Ajustável com Pentes Internos' }
    ],
    published: true,
    sponsored: false,
    location: 'Luanda',
    availableFromDate: 'Imediata (Hoje)',
    createdAt: '2026-06-16T14:00:00Z'
  },
  {
    id: 'sprod-11',
    productCode: 'PRD-1011',
    supplierId: 'supp-7',
    name: 'Vestido de Gala Longo em Cetim com Racha & Detalhes Samakaka',
    category: 'feminino',
    subCategory: 'roupas-vestidos',
    price: 36000,
    originalPrice: 45000,
    availability: 'imediata',
    stock: 18,
    rating: 4.8,
    salesCount: 53,
    tags: ['Elegância Festa', 'Tecido Nobre'],
    condition: 'novo',
    warranty: 'Garantia de Acabamento Perfeito',
    description: 'Vestido feminino de alta costura, corte sereia em cetim com racha lateral elegante e detalhes sofisticados inspirados no padrão tradicional angolano. Ideal para casamentos e banquetes.',
    photoUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: [
      { key: 'Tecido', value: 'Cetim Duchese & Seda Sintética Premium' },
      { key: 'Tamanhos Disponíveis', value: 'S, M, L, XL (Tabela Angolana)' },
      { key: 'Cores', value: 'Bordeaux, Dourado, Verde Esmeralda, Preto' }
    ],
    published: true,
    sponsored: true,
    location: 'Luanda',
    availableFromDate: 'Imediata (Hoje)',
    createdAt: '2026-06-17T09:00:00Z'
  },
  {
    id: 'sprod-12',
    productCode: 'PRD-1012',
    supplierId: 'supp-7',
    name: 'Bolsa de Ombro Feminina em Pele Genuína Luxo com Alça Dourada',
    category: 'feminino',
    subCategory: 'malas-carteiras',
    price: 32000,
    originalPrice: 39000,
    availability: 'imediata',
    stock: 14,
    rating: 4.9,
    salesCount: 65,
    tags: ['Couro Genuíno', 'Fecho Magnético'],
    condition: 'novo',
    warranty: 'Garantia de 12 Meses',
    description: 'Bolsa transversal de luxo com divisórias internas acolchoadas, fecho magnético banhado a ouro e acabamento em couro de primeira qualidade.',
    photoUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: [
      { key: 'Material', value: '100% Pele Legítima Tratada' },
      { key: 'Dimensões', value: '28 cm x 18 cm x 9 cm' },
      { key: 'Acabamento', value: 'Ferragens em Aço Dourado Anti-oxidação' }
    ],
    published: true,
    sponsored: false,
    location: 'Luanda',
    availableFromDate: 'Imediata (Hoje)',
    createdAt: '2026-06-17T11:30:00Z'
  },
  {
    id: 'sprod-13',
    productCode: 'PRD-1013',
    supplierId: 'supp-8',
    name: 'Fato Executivo Slim Fit 2 Peças Italiano Azul Marinho (Casaco + Calça)',
    category: 'masculino',
    subCategory: 'fatos-blazers',
    price: 85000,
    originalPrice: 110000,
    availability: 'imediata',
    stock: 16,
    rating: 5.0,
    salesCount: 48,
    tags: ['Corte Italiano', '100% Lã Tropical', 'Top Executivo'],
    condition: 'novo',
    warranty: 'Garantia de Corte e Tecido Anti-Vincos',
    description: 'Fato completo de homem com forro acetinado, corte moderno Slim Fit elegante, calças com ajuste de cintura e bolsos funcionais. Perfeito para reuniões de negócios e cerimónias formais.',
    photoUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: [
      { key: 'Composição', value: 'Lã Tropical Super 120s e Microfibra' },
      { key: 'Corte', value: 'Slim Fit Italiano com 2 Botões' },
      { key: 'Tamanhos', value: '46 ao 58 (Ajuste gratuito disponível)' },
      { key: 'Origem', value: 'Maison Homem Miramar, Luanda' }
    ],
    published: true,
    sponsored: true,
    location: 'Luanda',
    availableFromDate: 'Imediata (Hoje)',
    createdAt: '2026-06-18T08:00:00Z'
  },
  {
    id: 'sprod-14',
    productCode: 'PRD-1014',
    supplierId: 'supp-8',
    name: 'Camisa Social Masculina 100% Algodão Egípcio Manga Comprida Branca / Azul',
    category: 'masculino',
    subCategory: 'roupas-camisas',
    price: 22000,
    originalPrice: 28000,
    availability: 'imediata',
    stock: 35,
    rating: 4.8,
    salesCount: 110,
    tags: ['Algodão Egípcio', 'Fácil Engomar'],
    condition: 'novo',
    warranty: 'Garantia de Toque Suave e Durabilidade',
    description: 'Camisa social de tecido nobre com colarinho semi-italiano reforçado, punhos duplos ajustáveis e costuras francesas de alta precisão.',
    photoUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: [
      { key: 'Tecido', value: '100% Algodão Egípcio Penteado Fio 80' },
      { key: 'Colarinho', value: 'Semi-italiano com barbelas' },
      { key: 'Tamanhos', value: '38, 39, 40, 41, 42, 43, 44' }
    ],
    published: true,
    sponsored: false,
    location: 'Luanda',
    availableFromDate: 'Imediata (Hoje)',
    createdAt: '2026-06-18T10:00:00Z'
  },
  {
    id: 'sprod-15',
    productCode: 'PRD-1015',
    supplierId: 'supp-8',
    name: 'Sapatos Clássicos Masculinos Oxford em Pele Genuína Castanho Nobre',
    category: 'masculino',
    subCategory: 'calcado-masculino',
    price: 48000,
    originalPrice: 60000,
    availability: 'imediata',
    stock: 22,
    rating: 4.9,
    salesCount: 39,
    tags: ['Pele Legítima', 'Sola Costurada'],
    condition: 'novo',
    warranty: 'Garantia de 24 Meses',
    description: 'Sapato social modelo Oxford confeccionado à mão em couro legítimo vegetal, sola antiderrapante com vira costurada Goodyear welted e palmilha ortopédica em pele.',
    photoUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: [
      { key: 'Cabedal', value: 'Couro Bovino 100% Genuíno' },
      { key: 'Numeração', value: '39 ao 45' },
      { key: 'Construção', value: 'Goodyear Welted Costurado' }
    ],
    published: true,
    sponsored: false,
    location: 'Luanda',
    availableFromDate: 'Imediata (Hoje)',
    createdAt: '2026-06-18T14:00:00Z'
  },
  {
    id: 'sprod-16',
    productCode: 'PRD-1016',
    supplierId: 'supp-9',
    name: 'Saco de Bombó Seco de Primeira Qualidade de Cabinda (Saco 50 kg)',
    category: 'alimentos',
    subCategory: 'bombo-seco',
    price: 28000,
    originalPrice: 32000,
    availability: 'imediata',
    stock: 60,
    rating: 5.0,
    salesCount: 145,
    tags: ['Produção de Cabinda', '100% Natural', 'Saco 50kg'],
    condition: 'novo',
    warranty: 'Qualidade Garantida e Isento de Humidade',
    description: 'Bombó seco tradicional de mandioca selecionada da região de Buco-Zau e Cacongo, seco ao sol natural, branco e crocante, ideal para fuba fina e confeção de pratos típicos.',
    photoUrl: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: [
      { key: 'Peso Líquido', value: '50 kg por Saco Selado' },
      { key: 'Origem', value: 'Floresta e Campos de Buco-Zau, Província de Cabinda' },
      { key: 'Tipo', value: 'Bombó de Mandioca Doce Naturalmente Fermentado e Seco' },
      { key: 'Conservação', value: 'Armazenamento em local seco (Validade 12 meses)' }
    ],
    published: true,
    sponsored: true,
    location: 'Cabinda',
    availableFromDate: 'Imediata (Hoje)',
    createdAt: '2026-06-19T07:30:00Z'
  },
  {
    id: 'sprod-17',
    productCode: 'PRD-1017',
    supplierId: 'supp-9',
    name: 'Mandioca Fresca Selecionada do Campo de Cabinda (Saco de 40 kg)',
    category: 'alimentos',
    subCategory: 'produtos-frescos',
    price: 18500,
    originalPrice: 22000,
    availability: 'imediata',
    stock: 40,
    rating: 4.9,
    salesCount: 98,
    tags: ['Colhido Hoje', 'Frescura do Campo'],
    condition: 'novo',
    warranty: 'Garantia de Frescura do Produtor',
    description: 'Raízes de mandioca fresca de primeira apanha nos campos de Cabinda, polpa branca e macia para cozer, fritar ou preparar fuba fresca.',
    photoUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: [
      { key: 'Peso', value: 'Saco de 40 kg' },
      { key: 'Origem', value: 'Cooperativa Agrícola do Maiombe, Cabinda' },
      { key: 'Estado', value: 'Fresco da Lavra / Pronto a Consumir' }
    ],
    published: true,
    sponsored: false,
    location: 'Cabinda',
    availableFromDate: 'Imediata (Hoje)',
    createdAt: '2026-06-19T08:00:00Z'
  },
  {
    id: 'sprod-18',
    productCode: 'PRD-1018',
    supplierId: 'supp-9',
    name: 'Bidão de Óleo de Palma Puro da Floresta do Maiombe (20 Litros)',
    category: 'alimentos',
    subCategory: 'oleo-palma-maiombe',
    price: 26000,
    originalPrice: 30000,
    availability: 'imediata',
    stock: 50,
    rating: 5.0,
    salesCount: 178,
    tags: ['100% Puro Maiombe', 'Sem Aditivos', 'Aroma Tradicional'],
    condition: 'novo',
    warranty: 'Óleo de Palma Genuíno de Cabinda',
    description: 'Azeite de palma virgem extraído artesanalmente dos dendezeiros silvestres da lendária Floresta do Maiombe. Cor avermelhada viva, sabor intenso autêntico para moambas e caldeiradas.',
    photoUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: [
      { key: 'Volume', value: 'Bidão Alimentar Selado de 20 Litros' },
      { key: 'Origem', value: 'Floresta do Maiombe, Cabinda' },
      { key: 'Pureza', value: '100% Não Refinado / Extração Natural' }
    ],
    published: true,
    sponsored: true,
    location: 'Cabinda',
    availableFromDate: 'Imediata (Hoje)',
    createdAt: '2026-06-19T09:30:00Z'
  },
  {
    id: 'sprod-19',
    productCode: 'PRD-1019',
    supplierId: 'supp-10',
    name: 'Feijão Manteiga Selecionado do Planalto da Huíla / Huambo (Saco 50 kg)',
    category: 'alimentos',
    subCategory: 'feijao-cereais',
    price: 55000,
    originalPrice: 65000,
    availability: 'imediata',
    stock: 30,
    rating: 4.9,
    salesCount: 76,
    tags: ['Grão Grande', 'Cozimento Rápido'],
    condition: 'novo',
    warranty: 'Feijão Novo e Calibrado',
    description: 'Feijão manteiga de produção nacional dos planaltos do sul de Angola, grão uniforme, limpo e de cozimento rápido e macio.',
    photoUrl: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=800&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: [
      { key: 'Peso Líquido', value: 'Saco de 50 kg' },
      { key: 'Origem', value: 'Fazenda Vale da Chela, Lubango, Huíla' },
      { key: 'Safra', value: 'Colheita Recente 2026' }
    ],
    published: true,
    sponsored: false,
    location: 'Huíla',
    availableFromDate: 'A partir de amanhã',
    createdAt: '2026-06-19T11:00:00Z'
  },
  {
    id: 'sprod-20',
    productCode: 'PRD-1020',
    supplierId: 'supp-10',
    name: 'Boi Nelore Reprodutor & Corte (Peso Vivo ~420 kg, 3 Anos, Vacinado)',
    category: 'animais',
    subCategory: 'bois-gado-bovino',
    price: 750000,
    originalPrice: 850000,
    availability: 'imediata',
    stock: 8,
    rating: 5.0,
    salesCount: 14,
    tags: ['Gado Vacinado', 'Guia Sanitária Oficial', 'Transporte Intermediado'],
    condition: 'novo',
    warranty: 'Certificado Sanitário do Serviço Veterinário de Angola',
    description: 'Gado bovino de raça Nelore / Brahman criado a pasto natural na região da Huíla. Excelente conformação muscular, 100% saudável, vacinação contra febre aftosa e carbúnculo em dia. Intermediação de transporte seguro em navio de cabotagem até ao Porto de Cabinda.',
    photoUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: [
      { key: 'Raça', value: 'Nelore / Brahman Puro (Bovino)' },
      { key: 'Peso Vivo Médio', value: '~420 kg (Pesado na balança da fazenda)' },
      { key: 'Idade', value: '32 a 36 Meses (Dente de leite / 2 dentes)' },
      { key: 'Localização de Origem', value: 'Fazenda Vale da Chela, Lubango, Huíla' },
      { key: 'Documentação', value: 'Guia de Trânsito Veterinário (GTV) & Ficha de Vacinas' },
      { key: 'Logística de Entrega', value: 'Transporte marítimo Luanda/Lobito ➔ Cabinda com tratador a bordo' }
    ],
    published: true,
    sponsored: true,
    location: 'Huíla',
    availableFromDate: 'Imediata (Hoje)',
    createdAt: '2026-06-20T08:00:00Z'
  },
  {
    id: 'sprod-21',
    productCode: 'PRD-1021',
    supplierId: 'supp-10',
    name: 'Cabrito Reprodutor Raça Bôer Macho (~35 kg, Excelente Porte)',
    category: 'animais',
    subCategory: 'cabritos-caprinos',
    price: 85000,
    originalPrice: 98000,
    availability: 'imediata',
    stock: 15,
    rating: 4.9,
    salesCount: 32,
    tags: ['Raça Bôer Pura', 'Alta Fertilidade'],
    condition: 'novo',
    warranty: 'Atestado Veterinário de Aptidão Reprodutiva',
    description: 'Caprino macho jovem de raça Bôer pura, musculatura forte, adaptado ao clima tropical de Angola. Ideal para melhoramento genético do rebanho em Cabinda ou consumo de carne nobre.',
    photoUrl: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?w=800&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1524024973431-2ad916746881?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: [
      { key: 'Raça', value: 'Caprino Bôer Sul-Africano / Angolano' },
      { key: 'Peso', value: 'Aproximadamente 35 kg' },
      { key: 'Idade', value: '14 Meses' },
      { key: 'Local de Venda', value: 'Piquete de Trânsito Agro-Huíla (Ponto de Embarque Luanda / Huíla)' }
    ],
    published: true,
    sponsored: true,
    location: 'Huíla',
    availableFromDate: 'Imediata (Hoje)',
    createdAt: '2026-06-20T09:30:00Z'
  },
  {
    id: 'sprod-22',
    productCode: 'PRD-1022',
    supplierId: 'supp-10',
    name: 'Lote de 20 Galinhas Caipiras / Poedeiras Vivas de Campo',
    category: 'animais',
    subCategory: 'galinhas-aves',
    price: 65000,
    originalPrice: 75000,
    availability: 'imediata',
    stock: 25,
    rating: 4.8,
    salesCount: 88,
    tags: ['Aves Vivas', 'Ovos e Carne', 'Lote Económico'],
    condition: 'novo',
    warranty: 'Vacinadas contra Newcastle e Gumboro',
    description: 'Lote com 20 aves vivas saudáveis criadas ao ar livre. Prontas para postura de ovos caseiros de gema amarela ou engorda.',
    photoUrl: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: [
      { key: 'Quantidade no Lote', value: '20 Aves Vivas em Grade Especial' },
      { key: 'Peso Médio por Ave', value: '1.8 kg a 2.2 kg' },
      { key: 'Origem', value: 'Quinta Avícola Agro-Huíla / Luanda' }
    ],
    published: true,
    sponsored: false,
    location: 'Luanda',
    availableFromDate: 'Imediata (Hoje)',
    createdAt: '2026-06-20T11:00:00Z'
  },
  {
    id: 'sprod-23',
    productCode: 'PRD-1023',
    supplierId: 'supp-10',
    name: 'Porco de Engorda / Leitão Raça Large White (~70 kg)',
    category: 'animais',
    subCategory: 'porcos-suinos',
    price: 120000,
    originalPrice: 140000,
    availability: 'imediata',
    stock: 10,
    rating: 4.9,
    salesCount: 21,
    tags: ['Suíno Saudável', 'Carne de Qualidade'],
    condition: 'novo',
    warranty: 'Atestado Veterinário',
    description: 'Suíno jovem criado com ração balanceada e milho nacional, excelente rendimento de carcaça para eventos, restaurantes ou talhos em Cabinda.',
    photoUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: [
      { key: 'Raça', value: 'Large White / Landrace' },
      { key: 'Peso Vivo', value: '~70 kg' },
      { key: 'Local de Venda', value: 'Fazenda de Suinicultura Viana / Huíla' }
    ],
    published: true,
    sponsored: false,
    location: 'Luanda',
    availableFromDate: 'Imediata (Hoje)',
    createdAt: '2026-06-20T14:00:00Z'
  },
  {
    id: 'sprod-24',
    productCode: 'PRD-1024',
    supplierId: 'supp-6',
    name: 'Smart TV 55" 4K UHD Samsung Crystal com HDR10+ & Som Dolby Digital',
    category: 'eletronicos',
    subCategory: 'smart-tvs-som',
    price: 420000,
    originalPrice: 480000,
    availability: 'imediata',
    stock: 11,
    rating: 5.0,
    salesCount: 35,
    tags: ['4K Crystal UHD', 'Garantia Oficial', 'Wi-Fi & Bluetooth'],
    condition: 'novo',
    warranty: 'Garantia de 24 Meses Samsung Angola',
    description: 'Televisor inteligente de 55 polegadas com resolução 4K real, processador Crystal 4K, sistema Tizen com Netflix, YouTube, Prime Video e comando solar sem pilhas.',
    photoUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: [
      { key: 'Ecrã', value: '55" (139 cm) 4K UHD 3840 x 2160' },
      { key: 'Conectividade', value: '3x HDMI, 2x USB, Wi-Fi 5, Bluetooth 5.2' },
      { key: 'Origem', value: 'Armazém de Eletrodomésticos Luanda / Cabinda' }
    ],
    published: true,
    sponsored: true,
    location: 'Luanda',
    availableFromDate: 'Imediata (Hoje)',
    createdAt: '2026-06-21T09:00:00Z'
  },
  {
    id: 'sprod-25',
    productCode: 'PRD-1025',
    supplierId: 'supp-6',
    name: 'Arca Congeladora Horizontal Midea 200L com Cesto Duplo & Modo Turbo',
    category: 'eletronicos',
    subCategory: 'frigorificos-arcas',
    price: 270000,
    originalPrice: 310000,
    availability: 'imediata',
    stock: 8,
    rating: 4.9,
    salesCount: 51,
    tags: ['Congelamento Rápido', 'Baixo Consumo A+'],
    condition: 'novo',
    warranty: 'Garantia de 2 Anos',
    description: 'Arca congeladora tropicalizada com isolamento de alta densidade que mantém os alimentos congelados até 30 horas em caso de corte de energia.',
    photoUrl: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: [
      { key: 'Capacidade', value: '200 Litros Úteis' },
      { key: 'Função', value: 'Dupla Função (Frigorífico ou Congelador)' },
      { key: 'Gás', value: 'R600a Ecológico' }
    ],
    published: true,
    sponsored: false,
    location: 'Cabinda',
    availableFromDate: 'Imediata (Hoje)',
    createdAt: '2026-06-21T11:00:00Z'
  },
  {
    id: 'sprod-7',
    productCode: 'PRD-1007',
    supplierId: 'supp-5',
    name: 'Pneu Bridgestone Dueler A/T 265/65 R17 Todo-o-Terreno (Hilux / Prado)',
    category: 'auto',
    subCategory: 'pneus-jantes',
    price: 165000,
    originalPrice: 190000,
    availability: 'imediata',
    stock: 20,
    rating: 4.9,
    salesCount: 57,
    tags: ['Original Bridgestone', '4x4 Todo-o-Terreno'],
    condition: 'novo',
    warranty: 'Garantia de Fabrico de 5 Anos',
    description: 'Pneu premium All-Terrain com borracha reforçada para resistir a pisos de asfalto e picadas de terra. Excelente aderência sob chuva tropical.',
    photoUrl: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=800&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: [
      { key: 'Medida', value: '265/65 R17' },
      { key: 'Índice de Carga & Velocidade', value: '112S (1120 kg / 180 km/h)' },
      { key: 'Aplicação Principal', value: 'Toyota Hilux, Land Cruiser Prado, Ford Ranger, Mitsubishi L200' }
    ],
    published: true,
    sponsored: false,
    location: 'Luanda',
    availableFromDate: 'Imediata (Hoje)',
    createdAt: '2026-06-15T10:00:00Z'
  },
  {
    id: 'sprod-8',
    productCode: 'PRD-1008',
    supplierId: 'supp-2',
    name: 'Bomba de Água Submersível Pedrollo 1.5 HP 4" para Furo e Poço',
    category: 'construcao',
    subCategory: 'bombas-agua',
    price: 285000,
    originalPrice: 315000,
    availability: 'imediata',
    stock: 7,
    rating: 4.8,
    salesCount: 29,
    tags: ['Alta Pressão', 'Corpo Inox'],
    condition: 'novo',
    warranty: 'Garantia de 12 Meses Pedrollo Itália',
    description: 'Eletrobomba submersível em aço inoxidável AISI 304 com quadro de arranque e condensador incluídos. Elevação até 90 metros.',
    photoUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: [
      { key: 'Potência', value: '1.5 HP (1.1 kW) 220V Monofásica' },
      { key: 'Caudal Máximo', value: '100 Litros por Minuto' },
      { key: 'Altura Manométrica', value: 'Até 92 metros' }
    ],
    published: true,
    sponsored: false,
    location: 'Cabinda',
    availableFromDate: 'Imediata (Hoje)',
    createdAt: '2026-06-16T09:00:00Z'
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

export const DEFAULT_SUPPLIER_SERVICES: SupplierService[] = [
  {
    id: 'srv-1',
    supplierId: 'supp-3',
    supplierName: 'Grupo Robert Hudson Angola',
    name: 'Despacho Aduaneiro Expresso (Porto de Luanda)',
    price: 150000,
    category: 'Despacho Aduaneiro',
    description: 'Serviço completo de levantamento, desembaraço aduaneiro e preparação de documentação legal para trânsito de mercadoria Luanda-Cabinda.',
    photoUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=500&auto=format&fit=crop&q=60',
    location: 'Luanda',
    published: true,
    createdAt: '2026-06-14T09:00:00Z'
  },
  {
    id: 'srv-2',
    supplierId: 'supp-4',
    supplierName: 'EletroCabinda Fornecimentos',
    name: 'Montagem e Eletrificação de Armazéns Comerciais',
    price: 450000,
    category: 'Transporte de Carga',
    description: 'Serviço profissional de cabeamento estruturado, montagem de quadros elétricos certificados e luminárias para instalações industriais e armazéns em Cabinda.',
    photoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=60',
    location: 'Cabinda',
    published: true,
    createdAt: '2026-06-15T11:00:00Z'
  },
  {
    id: 'srv-3',
    supplierId: 'supp-1',
    supplierName: 'Mundo Digital Angola Lda',
    name: 'Paletização Segura e Embalamento a Vácuo',
    price: 35000,
    category: 'Embalamento e Paletização',
    description: 'Embalamento de alta proteção para materiais eletrónicos, servidores, computadores e equipamentos sensíveis antes do envio aéreo ou marítimo.',
    photoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=60',
    location: 'Luanda',
    published: true,
    createdAt: '2026-06-16T14:30:00Z'
  },
  {
    id: 'srv-4',
    supplierId: 'supp-3',
    supplierName: 'Grupo Robert Hudson Angola',
    name: 'Inspeção e Certificação de Geradores a Diesel',
    price: 85000,
    category: 'Inspeção de Mercadoria',
    description: 'Análise técnica de motores de geradores, com emissão de relatório completo de conformidade antes de ser embarcado na balsa para Cabinda.',
    photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60',
    location: 'Ambos',
    published: true,
    createdAt: '2026-06-17T10:00:00Z'
  }
];

export const DEFAULT_SERVICE_REQUESTS: ServiceRequest[] = [];

// Master Administrator Credentials (Long, complex, high-entropy master access key)
export const MASTER_ADMIN_CREDENTIALS = {
  username: 'admin',
  email: 'direcao@mediadorcabinda.ao',
  name: 'Direção Geral - Mediador Cabinda Lda',
  // Ultra-secure master passphrase
  passphrase: 'MC#Admin@Cabinda-Luanda_2026!MasterShield$998877',
  pin: '998877'
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

  // Enforce clean slate for accounts if resetting or first time
  const rawClients = localStorage.getItem(STORAGE_KEYS.CLIENTS);
  if (!rawClients) {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(DEFAULT_CLIENTS));
  } else {
    try {
      const parsedClients: Client[] = JSON.parse(rawClients);
      // Clean legacy mock demo clients if present
      const sanitized = parsedClients.filter(c => c.id !== 'cli-1' && c.id !== 'cli-2');
      if (sanitized.length !== parsedClients.length) {
        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(sanitized));
      }
    } catch {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify([]));
    }
  }

  const rawOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
  if (!rawOrders) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_ORDERS));
  } else {
    try {
      const parsedOrders: Order[] = JSON.parse(rawOrders);
      const sanitizedOrders = parsedOrders.filter(o => o.clientId !== 'cli-1' && o.clientId !== 'cli-2');
      if (sanitizedOrders.length !== parsedOrders.length) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(sanitizedOrders));
      }
    } catch {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
    }
  }

  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(DEFAULT_MESSAGES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_CLIENT_ID) || localStorage.getItem(STORAGE_KEYS.CURRENT_CLIENT_ID) === 'cli-1') {
    localStorage.setItem(STORAGE_KEYS.CURRENT_CLIENT_ID, '');
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(DEFAULT_SUPPLIERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUPPLIER_PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.SUPPLIER_PRODUCTS, JSON.stringify(DEFAULT_SUPPLIER_PRODUCTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUPPLIER_SERVICES)) {
    localStorage.setItem(STORAGE_KEYS.SUPPLIER_SERVICES, JSON.stringify(DEFAULT_SUPPLIER_SERVICES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SERVICE_REQUESTS)) {
    localStorage.setItem(STORAGE_KEYS.SERVICE_REQUESTS, JSON.stringify(DEFAULT_SERVICE_REQUESTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUPPLIER_MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.SUPPLIER_MESSAGES, JSON.stringify(DEFAULT_SUPPLIER_MESSAGES));
  }
}

export function getMasterAdminAccount(): AdminMasterAccount | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEYS.MASTER_ADMIN);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
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
    return raw ? JSON.parse(raw) : DEFAULT_ORDERS;
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


