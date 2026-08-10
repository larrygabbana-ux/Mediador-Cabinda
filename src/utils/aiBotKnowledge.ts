/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BotMessage, DynamicKnowledgeItem, GeneralLogisticsSettings, KnowledgeAuditLog } from '../types';

export const DEFAULT_LOGISTICS_CONFIG: GeneralLogisticsSettings = {
  modes: {
    aereo: {
      id: 'aereo',
      name: 'Via Aérea (TAAG Cargo Express)',
      averageTime: '1 dia',
      costEstimate: '2.500 AOA / kg',
      description: 'Frete aéreo express para cargas leves, encomendas urgentes, telemóveis, computadores e documentos.',
      recommendation: 'Ideal para artigos eletrónicos, produtos frágeis e cargas de alta urgência com entrega acelerada.',
      status: 'ativo'
    },
    maritimo: {
      id: 'maritimo',
      name: 'Via Marítima (Cabotagem Portuária)',
      averageTime: '2–3 dias',
      costEstimate: '450 AOA / kg',
      description: 'Cabotagem marítima regular do Porto de Luanda ao Porto de Cabinda com navios cargueiros homologados.',
      recommendation: 'Solução mais económica para grandes volumes, materiais de construção pesados, contentores e mobiliário.',
      status: 'ativo'
    },
    terrestre: {
      id: 'terrestre',
      name: 'Via Terrestre (Corredor Rodoviário Regional)',
      averageTime: '7–8 dias ou mais',
      costEstimate: '350 AOA / kg',
      description: 'Transporte rodoviário condicionado ao trânsito fronteiriço pelo corredor regional através da RDC.',
      recommendation: 'Cargas de grande porte com maior tolerância de prazo e necessidades específicas de transporte rodoviário.',
      status: 'ativo'
    }
  },
  intermediationFeeRate: '10% a 15% do valor comercial da mercadoria',
  customsTaxAGT: '8.000 AOA (Taxa fixa de emissão da Guia de Trânsito AGT)',
  pickupAddressCabinda: 'Armazém C-4, Recinto Portuário de Cabinda, Rua Direita, Província de Cabinda',
  consolidationAddressLuanda: 'Parque Logístico Portuário / Viana, Luanda',
  deliveryOptions: 'Levantamento no Balcão de Cabinda (Armazém C-4) ou Entrega ao Domicílio',
  requiredDocuments: [
    'Guia de Trânsito AGT (emitida para circulação fiscal legal)',
    'Fatura Comercial com NIF de Luanda (comprovativo fiscal de compra)',
    'Comprovativo de Pagamento (Multicaixa Express ou IBAN corporativo)',
    'Documento de Identificação do Destinatário (BI / Passaporte / Alvará)'
  ],
  warrantyAndRefundPolicy: '100% de garantia de reembolso integral do valor ou reposição imediata da mercadoria em caso de avaria estrutural comprovada ou extravio durante o transporte.',
  operationalNote: 'Todos os prazos informados são previsões médias estimadas, sujeitas a variações decorrentes de condições marítimas/meteorológicas, escalas de navios e trâmites alfandegários da AGT.',
  lastUpdated: new Date().toISOString(),
  updatedBy: 'João Hilário António (Administrador Geral)'
};

export const INITIAL_DYNAMIC_KNOWLEDGE_BASE: DynamicKnowledgeItem[] = [
  {
    id: 'como-funciona',
    category: 'geral',
    question: 'Como funciona o Mediador Cabinda e quais são os 6 passos do processo?',
    keywords: [
      'como funciona',
      'como funciona o mediador',
      'como funciona o mediador cabinda',
      'como funciona o app',
      'como e o processo',
      'quais sao os passos',
      'passo a passo',
      'explicar',
      'o que e',
      'o que faz',
      'para que serve',
      'cabinda luanda',
      'intermediação',
      'intermedicao',
      'processo operacional',
      'etapas'
    ],
    shortAnswer: 'Compramos os seus produtos em Luanda com fatura legal, cuidamos do frete marítimo/aéreo e entregamos em Cabinda com segurança aduaneira e garantia total.',
    detailedAnswer: `O **Mediador Cabinda Lda** é a primeira plataforma digital e rede de intermediação comercial e logística estruturada para conectar os cidadãos, famílias e empresas da Província de Cabinda diretamente aos fornecedores, fabricantes e distribuidores de Luanda, garantindo preços reais de fábrica, legalidade fiscal e transporte seguro.

Abaixo apresentamos o **Processo Operacional Completo em 6 Etapas**:

1️⃣ **Passo 1: Solicitação ou Escolha do Produto**
O cliente acede ao aplicativo e escolhe produtos no *Mercado de Fornecedores Homologados* ou submete um pedido personalizado em *"Pedir Intermediação"*, indicando os artigos, quantidades, especificações e lojas pretendidas em Luanda (ex: materiais de construção, eletrodomésticos, telemóveis, geradores, peças industriais, etc.).

2️⃣ **Passo 2: Análise Técnica e Emissão de Orçamento Transparente**
Em menos de 2 horas úteis, a nossa equipa operacional em Luanda contacta os fornecedores, obtém a cotação a preço real de custo e emite a *Fatura Pro-forma*, discriminando:
• **Preço Real da Mercadoria:** Exatamente o valor faturado pela loja em Luanda.
• **Frete de Transporte:** Marítimo de cabotagem ou aéreo express.
• **Taxa de Despacho Aduaneiro AGT:** Taxa fixa de 8.000 Kz para emissão da Guia de Trânsito fiscal.
• **Taxa de Intermediação Comercial:** 10% a 15% (sem quaisquer custos ocultos).

3️⃣ **Passo 3: Pagamento Seguro e Validação Fiscal**
O cliente efetua o pagamento com total comodidade via *Multicaixa Express (MC Express - 942043293)* ou *Transferência Bancária (IBAN AO06 0006 0000 01307638301 95)*. O sistema emite imediatamente o comprovativo de liquidação com chancela fiscal.

4️⃣ **Passo 4: Aquisição Física e Rigorosa Inspeção em Luanda**
A equipa do Mediador desloca-se presencialmente ao fornecedor em Luanda, realiza a compra oficial com fatura comercial com NIF, inspeciona a integridade física de cada artigo, fotografa o lote para o cliente e realiza o embalamento industrial reforçado e paletização para proteção marítima.

5️⃣ **Passo 5: Desembaraço Aduaneiro e Embarque (Marítimo ou Aéreo)**
Procedemos à emissão da Guia de Trânsito AGT e desembaraço portuário. A carga é embarcada no navio de cabotagem no Porto de Luanda ou no voo regular TAAG Cargo. É gerado o código único de rastreio **MED-XXXX** para acompanhar todas as etapas em tempo real no app.

6️⃣ **Passo 6: Desembarque, Notificação e Entrega Segura em Cabinda**
Ao atracar em Cabinda, a mercadoria é rececionada no nosso Balcão Oficial no **Armazém C-4 do Porto de Cabinda** (Rua Direita) para levantamento imediato pelo cliente, ou entregue diretamente ao domicílio. Todas as encomendas possuem **100% de Garantia de Reembolso** contra eventuais avarias ou extravios.`,
    suggestedNextQuestions: [
      'Quais são os prazos de entrega marítimos, aéreos e terrestres?',
      'Como fazer um novo pedido no app?',
      'Quais são as taxas e comissões cobradas?',
      'Como pagar por Multicaixa Express ou IBAN?'
    ],
    actionLink: {
      label: 'Fazer Novo Pedido',
      view: 'fazer-pedido',
      icon: '🛒'
    },
    isActive: true,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'Sistema Oficial'
  },
  {
    id: 'prazos-entrega',
    category: 'prazos',
    question: 'Quais são os prazos médios de entrega e modalidades de transporte?',
    keywords: [
      'prazo',
      'tempo',
      'demora',
      'quanto tempo',
      'dias',
      'quando chega',
      'velocidade',
      'urgente',
      'maritimo',
      'marítimo',
      'aereo',
      'aéreo',
      'terrestre',
      'frete',
      'previsao'
    ],
    shortAnswer: 'Via Aérea: 1 dia (média). Via Marítima: 2–3 dias (média). Via Terrestre: 7–8 dias ou mais (média). Prazos são estimativas operacionais.',
    detailedAnswer: `Os prazos de entrega dependem da modalidade de transporte selecionada e são calculados como **previsões médias estimadas**:

✈️ **1. Via Aérea (TAAG Cargo Express):**
• **Prazo Médio:** **1 dia** (ou 24 a 48 horas úteis após a consolidação em Luanda).
• **Recomendado para:** Telemóveis, computadores, encomendas urgentes, medicamentos autorizados e documentos.

🚢 **2. Via Marítima (Cabotagem Portuária):**
• **Prazo Médio:** **2–3 dias** (após o embarque no navio no Porto de Luanda).
• **Recomendado para:** Materiais de construção (cimento, varão de ferro, tintas), eletrodomésticos pesados, mobiliário e contentores.

🚚 **3. Via Terrestre (Corredor Rodoviário Regional):**
• **Prazo Médio:** **7–8 dias ou mais**, condicionado aos trâmites de trânsito fronteiriço regional.
• **Recomendado para:** Cargas volumosas com maior tolerância de prazo.

⚠️ *Nota Importante de Logística:* Todos os prazos são estimativas médias e podem sofrer variações conforme condições meteorológicas marinhas, trâmites de despacho aduaneiro da AGT e escalas operacionais.`,
    suggestedNextQuestions: [
      'Como rastrear a minha encomenda com o código MED?',
      'Quais são os custos e taxas de cada modalidade?',
      'Onde fica o armazém no Porto de Cabinda para retirada?'
    ],
    actionLink: {
      label: 'Acompanhar Encomendas',
      view: 'acompanhar-pedido',
      icon: '🚚'
    },
    isActive: true,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'Sistema Oficial'
  },
  {
    id: 'modalidades-transporte',
    category: 'logistica',
    question: 'Quais são as modalidades de transporte disponíveis para envio?',
    keywords: [
      'modalidade',
      'modalidades',
      'meios de transporte',
      'como enviam',
      'navio',
      'aviao',
      'barco',
      'caminhao',
      'camiao',
      'cabotagem',
      'rodoviario',
      'aereo'
    ],
    shortAnswer: 'Disponibilizamos três modalidades: Via Aérea (rápida), Via Marítima (económica para cargas pesadas) e Via Terrestre (rodoviária).',
    detailedAnswer: `O Mediador Cabinda oferece 3 modalidades estruturadas de transporte entre Luanda e Cabinda:

1. ✈️ **Via Aérea (TAAG Cargo Express):**
   - Agilidade máxima, com trânsito médio de 1 dia.
   - Indicada para peças leves, urgências médicas, eletrónicos e documentação.

2. 🚢 **Via Marítima (Cabotagem de Carga):**
   - A modalidade mais popular e económica para mercadorias pesadas e de grande volume.
   - Previsão média de 2 a 3 dias úteis de viagem marítima.
   - Ideal para materiais de construção civil, caixas industriais, geradores e eletrodomésticos.

3. 🚚 **Via Terrestre (Corredor Rodoviário Regional):**
   - Indicada para percursos terrestres e ligação rodoviária regional.
   - Previsão média de 7 a 8 dias ou mais.

Ao submeter a cotação no aplicativo, pode escolher a modalidade de sua preferência ou solicitar a nossa recomendação técnica.`,
    suggestedNextQuestions: [
      'Quais são os custos de frete por modalidade?',
      'Como funciona o seguro e a garantia de 100%?',
      'Como criar uma nova cotação agora?'
    ],
    actionLink: {
      label: 'Pedir Intermediação',
      view: 'fazer-pedido',
      icon: '📝'
    },
    isActive: true,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'Sistema Oficial'
  },
  {
    id: 'rotas-bidirecionais',
    category: 'logistica',
    question: 'O Mediador Cabinda realiza transporte nos dois sentidos: Luanda ➔ Cabinda e Cabinda ➔ Luanda?',
    keywords: [
      'cabinda para luanda',
      'luanda para cabinda',
      'ambos os sentidos',
      'dois sentidos',
      'ida e volta',
      'levar para luanda',
      'enviar para luanda',
      'mandar para luanda',
      'cliente em luanda',
      'clientes em luanda',
      'comprar de cabinda',
      'produtos de cabinda',
      'rota reversa',
      'encomenda para luanda',
      'transporte cabinda luanda',
      'direcao de transporte'
    ],
    shortAnswer: 'Sim! Operamos em ambos os sentidos: Luanda ➔ Cabinda (compras em Luanda entregues em Cabinda) e Cabinda ➔ Luanda (encomendas e produtos de Cabinda entregues em Luanda).',
    detailedAnswer: `Sim, com certeza! O **Mediador Cabinda Lda** atende clientes, produtores e empresas em **ambos os sentidos operacionais**:

🔄 **1. Rota Luanda ➔ Cabinda (Sentido Principal de Abastecimento):**
• **Para quem é:** Clientes e empresas residentes em Cabinda (Sede, Cacongo, Buco-Zau, Belize) que desejam adquirir produtos nos mercados e lojas de Luanda (São Paulo, Kikolo, Viana, Talatona, etc.).
• **Ponto de Consolidação em Luanda:** Parque Logístico Portuário / Viana.
• **Ponto de Retirada em Cabinda:** Armazém C-4, Zona Portuária de Cabinda (Rua Direita), ou entrega ao domicílio.
• **Modalidades:** Marítimo de Cabotagem (2–3 dias), Aéreo TAAG Cargo (1 dia) e Terrestre (7–8 dias).

🔄 **2. Rota Cabinda ➔ Luanda (Expedição e Encomendas para a Capital):**
• **Para quem é:** Clientes que estão em Luanda e compram mercadorias, produtos típicos, madeira, artesanato, peixe seco ou materiais em Cabinda, ou produtores de Cabinda que enviam cargas para Luanda.
• **Ponto de Recepção em Cabinda:** Balcão de Recepção e Triagem do Armazém C-4, Porto de Cabinda.
• **Ponto de Levantamento em Luanda:** Nosso Parque Logístico de Consolidação em Viana/Luanda ou entrega em toda a província de Luanda (Viana, Belas, Talatona, Kilamba, Cacuaco, Cazenga).
• **Modalidades:** TAAG Cargo Aéreo, Cabotagem Marítima Secil e Linhas Terrestres.
• **Despacho Fiscal:** Emissão de Guia de Trânsito AGT para circulação legal sem risco de apreensão fiscal.`,
    suggestedNextQuestions: [
      'Quais são os prazos de entrega marítimos e aéreos?',
      'Como solicitar um envio de Cabinda para Luanda no app?',
      'Onde fica o armazém no Porto de Cabinda?',
      'Como são calculadas as taxas e comissões?'
    ],
    actionLink: {
      label: 'Fazer Pedido de Intermediação',
      view: 'fazer-pedido',
      icon: '🔄'
    },
    isActive: true,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'Sistema Oficial'
  },
  {
    id: 'custos-taxas-tarifas',
    category: 'custos',
    question: 'Como são calculados os custos, tarifas, comissões e taxas aduaneiras?',
    keywords: [
      'custo',
      'custos',
      'taxa',
      'taxas',
      'tarifa',
      'tarifas',
      'comissao',
      'comissão',
      'quanto custa',
      'preco',
      'preço',
      'despacho',
      'aduana',
      'agt',
      'imposto',
      'frete'
    ],
    shortAnswer: 'Preço real de custo da loja + comissão de intermediação (10% a 15%) + frete proporcional + taxa fixa AGT (8.000 Kz).',
    detailedAnswer: `A política de custos do Mediador Cabinda rege-se pela transparência total e ausência de taxas ocultas:

1. 🏷️ **Valor Real da Mercadoria:** Exatamente o preço de compra praticado pelo fornecedor em Luanda (apresentamos a fatura fiscal original com NIF).
2. 💼 **Comissão de Intermediação Comercial:** Entre **10% e 15%** sobre o valor da compra (cobre a compra presencial, verificação de qualidade, conferência de medidas e suporte dedicado).
3. 🚢 **Frete de Transporte:** Calculado proporcionalmente ao peso e cubagem da mercadoria (kg ou m³) na modalidade marítima, aérea ou terrestre escolhida.
4. 📄 **Taxa de Despacho Aduaneiro AGT:** Taxa fixa de **8.000 AOA** para a emissão da Guia de Trânsito AGT, garantindo circulação legal e evitando apreensões fiscais.

Todos os custos são formalizados e discriminados na Fatura Pro-forma antes do cliente efetuar qualquer pagamento.`,
    suggestedNextQuestions: [
      'Quais as formas de pagamento disponíveis?',
      'Como pagar por Multicaixa Express (942043293) ou IBAN?',
      'Como funciona a garantia de 100% de reembolso?'
    ],
    actionLink: {
      label: 'Ver Minhas Faturas',
      view: 'pagamentos',
      icon: '💳'
    },
    isActive: true,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'Sistema Oficial'
  },
  {
    id: 'retirada-entrega-armazens',
    category: 'logistica',
    question: 'Onde posso retirar a mercadoria em Cabinda e como funciona a entrega?',
    keywords: [
      'retirada',
      'retirar',
      'levantar',
      'levantamento',
      'onde buscar',
      'onde fica',
      'armazem',
      'armazém',
      'balcao',
      'balcão',
      'entrega',
      'domicilio',
      'domicílio',
      'porto de cabinda',
      'endereco',
      'morada'
    ],
    shortAnswer: 'Retirada gratuita no Balcão Oficial no Armazém C-4 (Porto de Cabinda, Rua Direita) ou entrega direta ao domicílio.',
    detailedAnswer: `O cliente pode escolher entre duas modalidades de entrega ao chegar a Cabinda:

🏢 **1. Levantamento Gratuito no Balcão Central:**
• **Localização:** Armazém C-4, Recinto do Porto Comercial de Cabinda, Rua Direita, Cabinda.
• Ao atracar o navio e ser concluído o desembaraço, o cliente recebe notificação no app e pode levantar a mercadoria com apresentação do código **MED-XXXX** e documento de identificação.

🏠 **2. Entrega ao Domicílio / Estaleiro:**
• Entregamos diretamente na sua residência, loja, empresa ou estaleiro de obras na cidade de Cabinda e arredores.
• A equipa de estiva e transporte terrestre garante o descarregamento seguro no destino.

🏭 **Armazém de Consolidação em Luanda:**
• Parque Logístico Portuário / Viana, Luanda (ponto de receção de fornecedores e embalamento).`,
    suggestedNextQuestions: [
      'Qual o horário de atendimento presencial?',
      'Como rastrear a chegada no Porto de Cabinda?',
      'Quais os documentos exigidos para levantar a carga?'
    ],
    actionLink: {
      label: 'Ver Localizações',
      view: 'sobre-nos',
      icon: '🏢'
    },
    isActive: true,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'Sistema Oficial'
  },
  {
    id: 'documentacao-necessaria',
    category: 'documentacao',
    question: 'Quais são os documentos necessários para a compra, envio e retirada de mercadorias?',
    keywords: [
      'documento',
      'documentos',
      'documentacao',
      'documentação',
      'guia agt',
      'guia de transito',
      'fatura',
      'nif',
      'bi',
      'alvara',
      'comprovativo',
      'alfandega'
    ],
    shortAnswer: 'Fatura comercial com NIF, Guia de Trânsito AGT (emitida pelo Mediador), Comprovativo de Pagamento e BI para retirada.',
    detailedAnswer: `Para garantir total legalidade fiscal perante a AGT e segurança jurídica na operação, são utilizados os seguintes documentos:

1. 📄 **Fatura Comercial com NIF:** Emitida pelo fornecedor de Luanda em nome do Mediador Cabinda / Cliente final.
2. 🏛️ **Guia de Trânsito AGT:** Documento oficial aduaneiro emitido pela nossa equipa de despacho para permitir o trânsito da mercadoria entre Luanda e Cabinda sem risco de apreensão fiscal.
3. 💳 **Comprovativo de Liquidação:** Recibo do pagamento efetuado por Multicaixa Express (942043293) ou Transferência Bancária IBAN corporativo.
4. 🪪 **Documento de Identificação para Levantamento:** Bilhete de Identidade (BI), Passaporte ou Alvará Comercial do destinatário no ato de recolha no Armazém C-4.`,
    suggestedNextQuestions: [
      'Como funciona o desembaraço aduaneiro na AGT?',
      'Como funciona o código de rastreio MED?',
      'Quais são as taxas de despacho aduaneiro?'
    ],
    actionLink: {
      label: 'Consultar Documentos',
      view: 'guia-ajuda',
      icon: '📄'
    },
    isActive: true,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'Sistema Oficial'
  },
  {
    id: 'garantia-seguro-reembolso',
    category: 'garantia',
    question: 'Como funciona o seguro de carga e a política de garantia e reembolso de 100%?',
    keywords: [
      'garantia',
      'seguro',
      'reembolso',
      'devolucao',
      'devolução',
      'avaria',
      'extravio',
      'estragou',
      'quebrou',
      'partiu',
      'seguranca',
      'risco',
      'protecao'
    ],
    shortAnswer: '100% de reembolso integral ou reposição imediata da mercadoria em caso comprovado de avaria durante a viagem ou extravio.',
    detailedAnswer: `No Mediador Cabinda todas as mercadorias contam com proteção jurídica e financeira integral:

🛡️ **1. Seguro de Transporte Integrado:**
Todas as cargas despachadas via cabotagem marítima ou aérea possuem cobertura contra danos materiais, avarias marítimas e sinistros.

🔍 **2. Inspeção e Registo Fotográfico Prévio:**
Em Luanda, a nossa equipa confere e fotografa cada artigo antes do embalamento reforçado e entrega no porto/aeroporto.

💰 **3. Política de 100% de Reembolso Integral:**
Em caso comprovado de dano estrutural sofrido durante o trânsito ou extravio de mercadoria, o Mediador Cabinda compromete-se a:
• **Reposição Imediata** do artigo por outro idêntico; OU
• **Reembolso Integral (100%)** do valor monetário pago pelo cliente, sem burocracias desnecessárias.

Para comunicar qualquer ocorrência, aceda à aba *"Reclamações"* no aplicativo ou contacte o suporte oficial.`,
    suggestedNextQuestions: [
      'Como submeter uma reclamação no aplicativo?',
      'Como entrar em contacto com o suporte no WhatsApp?',
      'Como funciona o rastreio da carga?'
    ],
    actionLink: {
      label: 'Portal de Reclamações',
      view: 'reclamacoes',
      icon: '🛡️'
    },
    isActive: true,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'Sistema Oficial'
  },
  {
    id: 'formas-pagamento-oficiais',
    category: 'pagamentos',
    question: 'Quais são as formas de pagamento oficiais, números e IBAN corporativo?',
    keywords: [
      'pagamento',
      'pagar',
      'como pagar',
      'multicaixa express',
      'mc express',
      'iban',
      'conta bancaria',
      'transferencia',
      'transferência',
      'banco',
      'tpa',
      'recibo',
      '942043293',
      '0006'
    ],
    shortAnswer: 'Multicaixa Express: 942043293 | IBAN Corporativo: AO06 0006 0000 01307638301 95 | TPA no Balcão de Cabinda.',
    detailedAnswer: `Disponibilizamos métodos de pagamento oficiais, auditáveis e 100% protegidos:

📱 **1. Multicaixa Express (MC Express):**
• **Número Oficial de Pagamento:** **942 043 293** (+244 942 043 293).
• Permite liquidação imediata pelo telemóvel com confirmação automática no sistema.

🏦 **2. Transferência Bancária / Depósito (IBAN Corporativo Oficial):**
• **IBAN Oficial:** **AO06 0006 0000 01307638301 95** (0006 0000 01307638301 95).
• **Beneficiário:** Mediador Cabinda Lda.
• O comprovativo pode ser anexado no app para conciliação em menos de 30 minutos.

💳 **3. Pagamento Presencial (TPA Multicaixa):**
• No Balcão Central em Cabinda (Armazém C-4, Porto de Cabinda, Rua Direita).

*Todas as operações emitem Fatura Pro-forma e Recibo com validade fiscal.*`,
    suggestedNextQuestions: [
      'Como anexar o comprovativo de pagamento no app?',
      'Quais são as taxas de intermediação e despacho?',
      'Quais são os prazos de entrega?'
    ],
    actionLink: {
      label: 'Efetuar Pagamento',
      view: 'pagamentos',
      icon: '💳'
    },
    isActive: true,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'Sistema Oficial'
  },
  {
    id: 'rastreamento-codigo-med',
    category: 'rastreamento',
    question: 'Como funciona o rastreamento de cargas e o código MED-XXXX?',
    keywords: [
      'rastreamento',
      'rastreio',
      'rastrear',
      'codigo med',
      'código med',
      'onde esta',
      'onde está',
      'status',
      'etapas',
      'acompanhar',
      'localizar'
    ],
    shortAnswer: 'Insira o código MED-XXXX no menu "Acompanhar Pedido" ou pergunte neste chat para ver o progresso nas 9 etapas.',
    detailedAnswer: `O sistema de rastreabilidade do **Mediador Cabinda** garante total transparência sobre o percurso da sua encomenda:

🔖 **1. Código Único MED-XXXX:**
Gerado automaticamente no momento da criação do pedido (ex: **MED-1001**, **MED-8492**).

📊 **2. As 9 Etapas de Rastreamento:**
1. *Recebido* ➔ 2. *Análise Técnica* ➔ 3. *Orçado* ➔ 4. *Pago* ➔ 5. *Comprado em Luanda* ➔ 6. *Em Trânsito Marítimo/Aéreo* ➔ 7. *Atracado em Cabinda* ➔ 8. *Pronto no Armazém C-4* ➔ 9. *Entregue ao Cliente*.

🔍 **3. Como Consultar:**
• No menu **"Acompanhar Pedidos"**, digite o seu código **MED-XXXX**.
• Ou pergunte diretamente ao Assistente IA neste chat: *"Qual o estado da encomenda MED-1001?"*.`,
    suggestedNextQuestions: [
      'Onde fica o armazém para retirada em Cabinda?',
      'Quais são os prazos médios de entrega?',
      'Como falar com um atendente humano?'
    ],
    actionLink: {
      label: 'Rastrear Encomenda',
      view: 'acompanhar-pedido',
      icon: '🚚'
    },
    isActive: true,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'Sistema Oficial'
  },
  {
    id: 'categorias-de-produtos',
    category: 'categorias',
    question: 'Quais categorias de produtos e serviços podem ser encomendadas pelo Mediador?',
    keywords: [
      'categorias',
      'produtos',
      'o que posso comprar',
      'materiais de construcao',
      'eletronicos',
      'serralharia',
      'pecas',
      'geradores',
      'tintas',
      'cimento',
      'ferro'
    ],
    shortAnswer: 'Materiais de construção civil, eletrónicos e informática, ferramentas, eletrodomésticos, geradores, peças mecânicas e serviços de serralharia.',
    detailedAnswer: `Intermediamos a compra e transporte de uma ampla variedade de artigos homologados:

🏗️ **1. Materiais de Construção Civil:**
Cimento, varão de ferro, tubos PVC/galvanizados, tintas, azulejos, coberturas metálicas e blocos.

⚡ **2. Eletrónica, Informática & Telecomunicações:**
Telemóveis (smartphones), computadores portáteis, servidores, cablagens, painéis solares e inversores.

❄️ **3. Eletrodomésticos & Climatização:**
Aparelhos de ar condicionado, arcas frigoríficas, geleiras, fogões industriais e televisores.

⚙️ **4. Equipamentos Industriais & Peças:**
Geradores de energia, motobombas, ferramentas de precisão, pneus e peças sobressalentes para viaturas.

🛠️ **5. Serviços Técnicos e Oficinas de Serralharia:**
Fabrico sob medida de portões automáticos, grades de proteção, janelas e tanques de combustível/água.`,
    suggestedNextQuestions: [
      'Como encomendar materiais de construção de Luanda?',
      'Como solicitar serviços de serralharia em Cabinda?',
      'Quais são os prazos de frete marítimo?'
    ],
    actionLink: {
      label: 'Explorar Catálogo',
      view: 'fornecedores',
      icon: '📦'
    },
    isActive: true,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'Sistema Oficial'
  },
  {
    id: 'regras-envio-proibicoes',
    category: 'regras',
    question: 'Quais são as regras de envio, restrições e artigos proibidos?',
    keywords: [
      'regras',
      'proibido',
      'restricoes',
      'restrições',
      'o que nao pode',
      'perigoso',
      'drogas',
      'armas',
      'inflamavel',
      'seguranca de voo'
    ],
    shortAnswer: 'Proibidos: substâncias ilícitas, armas não autorizadas e inflamáveis perigosos sem autorização prévia.',
    detailedAnswer: `Para garantir a segurança pública e o cumprimento rigoroso das leis aduaneiras de Angola:

🚫 **Artigos Estritamente Proibidos:**
• Armas de fogo, munições ou explosivos sem licença governamental expressa.
• Estupefacientes e substâncias ilícitas.
• Mercadorias contrafeitas ou de proveniência duvidosa sem fatura fiscal original.
• Produtos químicos altamente corrosivos ou inflamáveis não homologados para cabotagem.

✅ **Artigos que Exigem Embalamento Especial:**
• Vidros e louças sanitárias (necessitam de engradamento de madeira).
• Eletrodomésticos sensíveis (paletização reforçada e plástico bolha).
• Artigos líquidos (vedação hermética contra fugas em alto mar).`,
    suggestedNextQuestions: [
      'Como funciona o embalamento e paletização em Luanda?',
      'Quais são as taxas de despacho aduaneiro AGT?',
      'Como falar com a equipa de apoio?'
    ],
    actionLink: {
      label: 'Pedir Intermediação',
      view: 'fazer-pedido',
      icon: '📝'
    },
    isActive: true,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'Sistema Oficial'
  },
  {
    id: 'criador-fundador-historia',
    category: 'geral',
    question: 'Quem é o fundador e criador do Mediador Cabinda e qual a sua história?',
    keywords: [
      'criador',
      'fundador',
      'quem criou',
      'quem fez',
      'autor',
      'joao hilario antonio',
      'joão hilário antónio',
      'dono',
      'idealizador',
      'diretor',
      'fundacao',
      'historia',
      'biografia'
    ],
    shortAnswer: 'Idealizado e fundado por João Hilário António para romper o isolamento geográfico de Cabinda com transparência e inovação.',
    detailedAnswer: `O **Mediador Cabinda Lda** foi fundado e desenvolvido por **João Hilário António**, empreendedor e profissional angolano guiado pela máxima de que *toda a inovação de sucesso nasce da obrigação moral de resolver um problema real, doloroso e concreto de um povo*.

Ao constatar as severas dificuldades estruturais enfrentadas pelas famílias e empresas de Cabinda — decorrentes da descontinuidade territorial com o restante de Angola —, **João Hilário António** concebeu esta plataforma digital e rede logística para democratizar o comércio, erradicar burlas informais, garantir conformidade fiscal com a AGT e impulsionar a economia local com geração de emprego para a juventude cabindense.`,
    suggestedNextQuestions: [
      'Por que o Mediador Cabinda foi criado?',
      'Como funciona o processo de intermediação em 6 etapas?',
      'Como solicitar um pedido agora?'
    ],
    actionLink: {
      label: 'Conhecer Sobre Nós',
      view: 'sobre-nos',
      icon: '🏢'
    },
    isActive: true,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'Sistema Oficial'
  },
  {
    id: 'horarios-contactos-whatsapp',
    category: 'geral',
    question: 'Quais são os contactos, telefones, WhatsApp e horários de atendimento humano?',
    keywords: [
      'contacto',
      'contactos',
      'telefone',
      'whatsapp',
      'falar com humano',
      'atendente',
      'operador',
      'pessoa real',
      'suporte',
      'unitel',
      'movicel',
      'horario',
      'horário',
      'ligar'
    ],
    shortAnswer: 'Unitel & WhatsApp: +244 942 043 293 | Movicel: +244 998 100 940 | E-mail: equipemediadorcabindacabinda@gmail.com | IA ativa 24/7.',
    detailedAnswer: `Dispomos de múltiplos canais oficiais de comunicação para atendimento executivo:

📞 **Linhas Telefónicas & Chamadas Normais:**
• **Rede Unitel:** [+244 942 043 293](tel:+244942043293) (942043293)
• **Rede Movicel:** [+244 998 100 940](tel:+244998100940) (998100940)
• **WhatsApp Oficial:** [+244 942 043 293](https://wa.me/244942043293)

📧 **Correio Eletrónico Institucional:**
• [equipemediadorcabindacabinda@gmail.com](mailto:equipemediadorcabindacabinda@gmail.com)

🏢 **Balcão Central:** Armazém C-4, Recinto Portuário de Cabinda, Rua Direita, Cabinda.

🕒 **Horário de Atendimento Humano:**
• Segunda a Sexta: 08h00 às 18h00 | Sábados: 08h00 às 13h00.
• **Assistente IA:** Operacional 24 horas por dia, 7 dias por semana (24/7).`,
    suggestedNextQuestions: [
      'Como pagar por Multicaixa Express ou IBAN?',
      'Como funciona o Mediador Cabinda em 6 passos?',
      'Quais são os prazos de entrega?'
    ],
    actionLink: {
      label: 'Abrir Chat de Suporte',
      view: 'suporte',
      icon: '💬'
    },
    isActive: true,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'Sistema Oficial'
  }
];

export const INITIAL_AUDIT_LOGS: KnowledgeAuditLog[] = [
  {
    id: 'audit-init-1',
    timestamp: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    adminName: 'João Hilário António (Administrador Geral)',
    adminRole: 'Super Administrador',
    actionType: 'logistica_update',
    section: 'Configurações de Logística - Via Marítima',
    fieldName: 'Prazo Médio de Cabotagem',
    previousValue: '3 a 7 dias',
    newValue: '2–3 dias',
    notes: 'Ajuste operacional de cabotagem expresso no Porto de Luanda.'
  },
  {
    id: 'audit-init-2',
    timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    adminName: 'João Hilário António (Administrador Geral)',
    adminRole: 'Super Administrador',
    actionType: 'knowledge_item_update',
    section: 'Base de Conhecimento - Prazos de Entrega',
    fieldName: 'detailedAnswer',
    previousValue: 'Prazos antigos genéricos',
    newValue: 'Prazos discriminados com Via Aérea (1 dia), Via Marítima (2-3 dias) e Via Terrestre (7-8 dias).',
    notes: 'Atualização oficial para sincronização da IA 24/7.'
  }
];

// Helper functions for persistent storage
export function getStoredLogisticsConfig(): GeneralLogisticsSettings {
  try {
    const raw = localStorage.getItem('mediador_cabinda_logistics_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const parsedModes = parsed.modes || {};
        const aereoRaw = parsedModes.aereo || {};
        const maritimoRaw = parsedModes.maritimo || {};
        const terrestreRaw = parsedModes.terrestre || {};

        const aereo = {
          ...DEFAULT_LOGISTICS_CONFIG.modes.aereo,
          ...aereoRaw,
          averageTime: aereoRaw.averageTime || aereoRaw.estimatedDays || DEFAULT_LOGISTICS_CONFIG.modes.aereo.averageTime,
          estimatedDays: aereoRaw.estimatedDays || aereoRaw.averageTime || DEFAULT_LOGISTICS_CONFIG.modes.aereo.averageTime,
          costEstimate: aereoRaw.costEstimate || aereoRaw.costPerKg || DEFAULT_LOGISTICS_CONFIG.modes.aereo.costEstimate,
          costPerKg: aereoRaw.costPerKg || aereoRaw.costEstimate || DEFAULT_LOGISTICS_CONFIG.modes.aereo.costEstimate,
          recommendation: aereoRaw.recommendation || aereoRaw.recommendedFor || DEFAULT_LOGISTICS_CONFIG.modes.aereo.recommendation,
          recommendedFor: aereoRaw.recommendedFor || aereoRaw.recommendation || DEFAULT_LOGISTICS_CONFIG.modes.aereo.recommendation,
          status: aereoRaw.status || DEFAULT_LOGISTICS_CONFIG.modes.aereo.status
        };

        const maritimo = {
          ...DEFAULT_LOGISTICS_CONFIG.modes.maritimo,
          ...maritimoRaw,
          averageTime: maritimoRaw.averageTime || maritimoRaw.estimatedDays || DEFAULT_LOGISTICS_CONFIG.modes.maritimo.averageTime,
          estimatedDays: maritimoRaw.estimatedDays || maritimoRaw.averageTime || DEFAULT_LOGISTICS_CONFIG.modes.maritimo.averageTime,
          costEstimate: maritimoRaw.costEstimate || maritimoRaw.costPerKg || DEFAULT_LOGISTICS_CONFIG.modes.maritimo.costEstimate,
          costPerKg: maritimoRaw.costPerKg || maritimoRaw.costEstimate || DEFAULT_LOGISTICS_CONFIG.modes.maritimo.costEstimate,
          recommendation: maritimoRaw.recommendation || maritimoRaw.recommendedFor || DEFAULT_LOGISTICS_CONFIG.modes.maritimo.recommendation,
          recommendedFor: maritimoRaw.recommendedFor || maritimoRaw.recommendation || DEFAULT_LOGISTICS_CONFIG.modes.maritimo.recommendation,
          status: maritimoRaw.status || DEFAULT_LOGISTICS_CONFIG.modes.maritimo.status
        };

        const terrestre = {
          ...DEFAULT_LOGISTICS_CONFIG.modes.terrestre,
          ...terrestreRaw,
          averageTime: terrestreRaw.averageTime || terrestreRaw.estimatedDays || DEFAULT_LOGISTICS_CONFIG.modes.terrestre.averageTime,
          estimatedDays: terrestreRaw.estimatedDays || terrestreRaw.averageTime || DEFAULT_LOGISTICS_CONFIG.modes.terrestre.averageTime,
          costEstimate: terrestreRaw.costEstimate || terrestreRaw.costPerKg || DEFAULT_LOGISTICS_CONFIG.modes.terrestre.costEstimate,
          costPerKg: terrestreRaw.costPerKg || terrestreRaw.costEstimate || DEFAULT_LOGISTICS_CONFIG.modes.terrestre.costEstimate,
          recommendation: terrestreRaw.recommendation || terrestreRaw.recommendedFor || DEFAULT_LOGISTICS_CONFIG.modes.terrestre.recommendation,
          recommendedFor: terrestreRaw.recommendedFor || terrestreRaw.recommendation || DEFAULT_LOGISTICS_CONFIG.modes.terrestre.recommendation,
          status: terrestreRaw.status || DEFAULT_LOGISTICS_CONFIG.modes.terrestre.status
        };

        const pickupCabinda = parsed.pickupAddressCabinda || parsed.pickupLocationCabinda || DEFAULT_LOGISTICS_CONFIG.pickupAddressCabinda;
        const consolLuanda = parsed.consolidationAddressLuanda || parsed.consolidationWarehouseLuanda || DEFAULT_LOGISTICS_CONFIG.consolidationAddressLuanda;
        const feeRate = parsed.intermediationFeeRate || parsed.intermediationFeePercentage || DEFAULT_LOGISTICS_CONFIG.intermediationFeeRate;
        const customsTax = parsed.customsTaxAGT || parsed.customsTransitFeeAGT || DEFAULT_LOGISTICS_CONFIG.customsTaxAGT;
        const warranty = parsed.warrantyAndRefundPolicy || parsed.guaranteeAndRefundPolicy || DEFAULT_LOGISTICS_CONFIG.warrantyAndRefundPolicy;
        const note = parsed.operationalNote || parsed.operationalNotice || DEFAULT_LOGISTICS_CONFIG.operationalNote;

        return {
          ...DEFAULT_LOGISTICS_CONFIG,
          ...parsed,
          modes: { aereo, maritimo, terrestre },
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
          deliveryOptions: parsed.deliveryOptions || DEFAULT_LOGISTICS_CONFIG.deliveryOptions,
          requiredDocuments: Array.isArray(parsed.requiredDocuments) ? parsed.requiredDocuments : DEFAULT_LOGISTICS_CONFIG.requiredDocuments,
          lastUpdated: parsed.lastUpdated || new Date().toISOString(),
          updatedBy: parsed.updatedBy || DEFAULT_LOGISTICS_CONFIG.updatedBy
        };
      }
    }
  } catch {}
  return DEFAULT_LOGISTICS_CONFIG;
}

export function saveStoredLogisticsConfig(config: GeneralLogisticsSettings): void {
  try {
    const pickupCabinda = config.pickupAddressCabinda || config.pickupLocationCabinda || DEFAULT_LOGISTICS_CONFIG.pickupAddressCabinda;
    const consolLuanda = config.consolidationAddressLuanda || config.consolidationWarehouseLuanda || DEFAULT_LOGISTICS_CONFIG.consolidationAddressLuanda;
    const feeRate = config.intermediationFeeRate || config.intermediationFeePercentage || DEFAULT_LOGISTICS_CONFIG.intermediationFeeRate;
    const customsTax = config.customsTaxAGT || config.customsTransitFeeAGT || DEFAULT_LOGISTICS_CONFIG.customsTaxAGT;
    const warranty = config.warrantyAndRefundPolicy || config.guaranteeAndRefundPolicy || DEFAULT_LOGISTICS_CONFIG.warrantyAndRefundPolicy;
    const note = config.operationalNote || config.operationalNotice || DEFAULT_LOGISTICS_CONFIG.operationalNote;

    const normalized: GeneralLogisticsSettings = {
      ...config,
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
          ...config.modes.aereo,
          averageTime: config.modes.aereo.averageTime || config.modes.aereo.estimatedDays || '1 dia',
          estimatedDays: config.modes.aereo.averageTime || config.modes.aereo.estimatedDays || '1 dia',
          costEstimate: config.modes.aereo.costEstimate || config.modes.aereo.costPerKg || '2.500 AOA / kg',
          costPerKg: config.modes.aereo.costEstimate || config.modes.aereo.costPerKg || '2.500 AOA / kg',
          recommendation: config.modes.aereo.recommendation || config.modes.aereo.recommendedFor || 'Cargas expressas e urgentes',
          recommendedFor: config.modes.aereo.recommendation || config.modes.aereo.recommendedFor || 'Cargas expressas e urgentes'
        },
        maritimo: {
          ...config.modes.maritimo,
          averageTime: config.modes.maritimo.averageTime || config.modes.maritimo.estimatedDays || '2–3 dias',
          estimatedDays: config.modes.maritimo.averageTime || config.modes.maritimo.estimatedDays || '2–3 dias',
          costEstimate: config.modes.maritimo.costEstimate || config.modes.maritimo.costPerKg || '450 AOA / kg',
          costPerKg: config.modes.maritimo.costEstimate || config.modes.maritimo.costPerKg || '450 AOA / kg',
          recommendation: config.modes.maritimo.recommendation || config.modes.maritimo.recommendedFor || 'Cargas gerais e pesadas',
          recommendedFor: config.modes.maritimo.recommendation || config.modes.maritimo.recommendedFor || 'Cargas gerais e pesadas'
        },
        terrestre: {
          ...config.modes.terrestre,
          averageTime: config.modes.terrestre.averageTime || config.modes.terrestre.estimatedDays || '7–8 dias',
          estimatedDays: config.modes.terrestre.averageTime || config.modes.terrestre.estimatedDays || '7–8 dias',
          costEstimate: config.modes.terrestre.costEstimate || config.modes.terrestre.costPerKg || '350 AOA / kg',
          costPerKg: config.modes.terrestre.costEstimate || config.modes.terrestre.costPerKg || '350 AOA / kg',
          recommendation: config.modes.terrestre.recommendation || config.modes.terrestre.recommendedFor || 'Cargas volumosas e materiais',
          recommendedFor: config.modes.terrestre.recommendation || config.modes.terrestre.recommendedFor || 'Cargas volumosas e materiais'
        }
      }
    };
    localStorage.setItem('mediador_cabinda_logistics_config', JSON.stringify(normalized));
  } catch {}
}

export function getStoredKnowledgeBase(): DynamicKnowledgeItem[] {
  try {
    const raw = localStorage.getItem('mediador_cabinda_knowledge_base');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return INITIAL_DYNAMIC_KNOWLEDGE_BASE;
}

export function saveStoredKnowledgeBase(items: DynamicKnowledgeItem[]): void {
  try {
    localStorage.setItem('mediador_cabinda_knowledge_base', JSON.stringify(items));
  } catch {}
}

export function getStoredAuditLogs(): KnowledgeAuditLog[] {
  try {
    const raw = localStorage.getItem('mediador_cabinda_knowledge_audit_logs');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {}
  return INITIAL_AUDIT_LOGS;
}

export function addAuditLogEntry(entry: Omit<KnowledgeAuditLog, 'id' | 'timestamp'>): void {
  try {
    const current = getStoredAuditLogs();
    const newLog: KnowledgeAuditLog = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    const updated = [newLog, ...current].slice(0, 100); // keep last 100 entries
    localStorage.setItem('mediador_cabinda_knowledge_audit_logs', JSON.stringify(updated));
  } catch {}
}

/**
 * Builds dynamic textual context for Gemini or Local IA
 */
export function buildLogisticsAIContext(
  logistics: GeneralLogisticsSettings,
  knowledgeBase: DynamicKnowledgeItem[]
): string {
  const airMode = logistics.modes.aereo;
  const seaMode = logistics.modes.maritimo;
  const landMode = logistics.modes.terrestre;

  const activeKnowledge = knowledgeBase.filter(k => k.isActive);

  // Check if any registered item officially specifies refrigerated / cold chain services
  const hasRefrigeratedServiceRegistered = activeKnowledge.some(k => 
    k.keywords.some(kw => /refrigerad|congelad|cadeia de frio|reefer|camara frigorifica|câmara frigorífica/i.test(kw)) ||
    /contentor frigor[íi]fico|cadeia de frio|transporte refrigerado pr[óo]prio|armaz[eé]m frigor[íi]fico/i.test(k.detailedAnswer)
  );

  return `
--- INFORMAÇÕES OFICIAIS E ATUALIZADAS PELA GESTÃO DO MEDIADOR CABINDA ---
(Atenção: Estas informações foram cadastradas pela Gestão e têm prioridade absoluta sobre qualquer dado anterior).

1. CONFIGURAÇÕES ATUAIS DE LOGÍSTICA & PRAZOS DE TRANSPORTE:
• Via aérea:
  - Nome Oficial: ${airMode.name}
  - Prazo Médio: ${airMode.averageTime || airMode.estimatedDays || '2 dias'}
  - Estimativa de Custo: ${airMode.costEstimate || airMode.costPerKg || 'Sob consulta'}
  - Descrição: ${airMode.description}
  - Indicação: ${airMode.recommendation || airMode.recommendedFor}
  - Status: ${airMode.status}

• Via marítima:
  - Nome Oficial: ${seaMode.name}
  - Prazo Médio: ${seaMode.averageTime || seaMode.estimatedDays || '6 a 8 dias'}
  - Estimativa de Custo: ${seaMode.costEstimate || seaMode.costPerKg || 'Sob consulta'}
  - Descrição: ${seaMode.description}
  - Indicação: ${seaMode.recommendation || seaMode.recommendedFor}
  - Status: ${seaMode.status}

• Via terrestre:
  - Nome Oficial: ${landMode.name}
  - Prazo Médio: ${landMode.averageTime || landMode.estimatedDays || '15 a 20 dias'}
  - Estimativa de Custo: ${landMode.costEstimate || landMode.costPerKg || 'Sob consulta'}
  - Descrição: ${landMode.description}
  - Indicação: ${landMode.recommendation || landMode.recommendedFor}
  - Status: ${landMode.status}

2. TARIFAS, TAXAS E COMISSÕES:
• Comissão de Intermediação Comercial: ${logistics.intermediationFeeRate || logistics.intermediationFeePercentage || '10% a 15%'}
• Taxa de Despacho Aduaneiro AGT: ${logistics.customsTaxAGT || logistics.customsTransitFeeAGT || '8.000 AOA'}
• Pagamento Seguro: Multicaixa Express (942043293) ou IBAN Corporativo AO06 0006 0000 01307638301 95

3. RETIRADA, ENTREGA E ARMAZÉNS:
• Balcão Central de Retirada (Cabinda): ${logistics.pickupAddressCabinda || logistics.pickupLocationCabinda}
• Armazém de Consolidação (Luanda): ${logistics.consolidationAddressLuanda || logistics.consolidationWarehouseLuanda}
• Opções de Entrega: ${logistics.deliveryOptions}

4. DOCUMENTOS NECESSÁRIOS:
${logistics.requiredDocuments.map(d => `• ${d}`).join('\n')}

5. POLÍTICA DE GARANTIA E REEMBOLSO:
• ${logistics.warrantyAndRefundPolicy || logistics.guaranteeAndRefundPolicy}

6. OBSERVAÇÃO OPERACIONAL SOBRE PRAZOS:
• ${logistics.operationalNote || logistics.operationalNotice}
*(Importante: Prazos devem ser sempre apresentados ao cliente como PREVISÕES MÉDIAS ESTIMADAS).*

7. REGRA CRÍTICA PARA CARGAS REFRIGERADAS, CONGELADAS, PERECÍVEIS E TEMPERATURA CONTROLADA:
${hasRefrigeratedServiceRegistered 
  ? `• Serviços térmicos especiais oficialmente registrados na Base de Conhecimento.`
  : `• IMPORTANTE: Não há serviço de transporte refrigerado próprio, contentores frigoríficos (reefer), porões climatizados, cadeia de frio ou armazenamento refrigerado cadastrado oficialmente. NUNCA invente esses serviços.
• Ao responder perguntas sobre prazo de carga refrigerada/perecível (ex.: "Quanto tempo demora o transporte de uma carga refrigerada de Luanda para Cabinda?"):
  - Forneça os prazos médios atualmente configurados na Gestão: Via Aérea (${airMode.averageTime || airMode.estimatedDays || '2 dias'}), Via Marítima (${seaMode.averageTime || seaMode.estimatedDays || '6 a 8 dias'}), Via Terrestre (${landMode.averageTime || landMode.estimatedDays || '15 a 20 dias'}).
  - Deixe claro que são prazos médios normais das modalidades e NÃO uma garantia de condições de conservação de temperatura.
  - Explique obrigatoriamente: "Os prazos acima correspondem às estimativas médias das modalidades de transporte atualmente configuradas. Para uma carga refrigerada ou perecível, é necessário confirmar previamente a disponibilidade de condições adequadas de conservação durante o transporte."
  - Solicite detalhes da mercadoria (tipo de produto, quantidade, peso aproximado, se é refrigerado ou congelado e urgência) e encaminhe para a equipa no WhatsApp (+244 942 043 293).
• Ao responder perguntas sobre se fazem transporte de produtos congelados (ex.: "Vocês fazem transporte de produtos congelados?"):
  - NUNCA responda simplesmente "sim". Informe que a disponibilidade de condições adequadas de conservação precisa de ser confirmada previamente com a equipa operacional.`}

8. TÓPICOS ATIVOS DA BASE DE CONHECIMENTO DA GESTÃO:
${activeKnowledge.map(k => `[${k.category.toUpperCase()}] P: ${k.question}\nR: ${k.detailedAnswer}`).join('\n\n')}
---
`;
}

/**
 * Intelligent dynamic intent solver for 24/7 client assistant.
 * Utilizes the live dynamic logistics configuration and dynamic knowledge base updated by Gestão.
 * Strictly adheres to Rules:
 * - Rule 4: Automatically reflects Gestão changes.
 * - Rule 6: Prioritizes current dynamic info.
 * - Rule 7: Never invents unknown info.
 * - Rule 8: Treats transit times as estimates.
 * - Rule 9: Contextual queries asking origin, destination, and modality when ambiguous.
 * - Refrigerated/Perishable Rule: Distinguishes modality transit times from conservation conditions, does not invent cold chain assets, and uses prudent disclaimers.
 */
export function solveBotQueryLocally(
  userQuery: string,
  customKnowledgeBase?: DynamicKnowledgeItem[],
  customLogistics?: GeneralLogisticsSettings
): {
  text: string;
  suggestedQuestions: string[];
  actionLink?: { label: string; view: string; icon?: string };
} {
  const logistics = customLogistics || getStoredLogisticsConfig();
  const knowledgeBase = (customKnowledgeBase || getStoredKnowledgeBase()).filter(k => k.isActive);

  const normalized = userQuery.toLowerCase().trim();
  const airTime = logistics.modes.aereo.averageTime || logistics.modes.aereo.estimatedDays || '2 dias';
  const seaTime = logistics.modes.maritimo.averageTime || logistics.modes.maritimo.estimatedDays || '6 a 8 dias';
  const landTime = logistics.modes.terrestre.averageTime || logistics.modes.terrestre.estimatedDays || '15 a 20 dias';

  // 1. Simple Greetings
  if (/^(ol[aá]|oi|bom dia|boa tarde|boa noite|cumprimentos|sauda[cç][oõ]es|alo|alô|hello|hi)\b/i.test(normalized)) {
    return {
      text: `Olá! Sou o **Assistente Virtual Oficial 24/7 do Mediador Cabinda Lda**. 🤖🇦🇴

Estou ao seu dispor a qualquer hora para responder a todas as dúvidas sobre:
• **Prazos médios de entrega atualizados:**
  - ✈️ **Via Aérea:** ${airTime} (previsão média)
  - 🚢 **Via Marítima:** ${seaTime} (previsão média)
  - 🚚 **Via Terrestre:** ${landTime} (previsão média)
• **Como funciona a intermediação de compras em 6 passos**
• **Custos, comissões (${logistics.intermediationFeeRate}) e taxa AGT (${logistics.customsTaxAGT})**
• **Pagamentos seguros por Multicaixa Express (942043293) ou IBAN**
• **Retirada no Armazém C-4 no Porto de Cabinda ou Entrega ao Domicílio**
• **Garantia de 100% de reembolso contra avarias ou extravios**

Como posso ajudá-lo hoje?`,
      suggestedQuestions: [
        'Quanto tempo demora a entrega?',
        'Como funciona a intermediação em 6 passos?',
        'Como pagar por Multicaixa Express ou IBAN?',
        'Onde fica o armazém no Porto de Cabinda?'
      ],
      actionLink: {
        label: 'Fazer Novo Pedido',
        view: 'fazer-pedido',
        icon: '🛒'
      }
    };
  }

  // 2. Human Operator / WhatsApp Escalation Request
  if (/(falar com humano|atendente|operador|pessoa real|falar com alguem|gerente|whatsapp|telefone|suporte humano|ligar|chamada|unitel|movicel)/i.test(normalized)) {
    return {
      text: `Com certeza! Se deseja falar diretamente com a nossa equipa executiva ou operadores humanos:

📞 **Linhas Telefónicas & Chamadas Normais:**
• **Rede Unitel:** [+244 942 043 293](tel:+244942043293) (942043293)
• **Rede Movicel:** [+244 998 100 940](tel:+244998100940) (998100940)
• **WhatsApp Oficial:** [+244 942 043 293](https://wa.me/244942043293)

📧 **E-mail Institucional:**
• [equipemediadorcabindacabinda@gmail.com](mailto:equipemediadorcabindacabinda@gmail.com)

🏢 **Balcão Central de Atendimento:**
• ${logistics.pickupAddressCabinda}

🕒 **Horário de Atendimento Presencial:**
• Segunda a Sexta: 08h00 às 18h00 | Sábados: 08h00 às 13h00
• *O nosso assistente IA continua disponível 24 horas por dia.*`,
      suggestedQuestions: [
        'Como pagar por Multicaixa Express ou IBAN?',
        'Onde fica o armazém de retirada em Cabinda?',
        'Como funciona a intermediação em 6 passos?'
      ],
      actionLink: {
        label: 'Abrir Chat de Suporte',
        view: 'suporte',
        icon: '💬'
      }
    };
  }

  // =========================================================================
  // 3. CARGAS REFRIGERADAS, CONGELADAS, PERECÍVEIS E TEMPERATURA CONTROLADA
  // =========================================================================
  const isRefrigeratedOrPerishableKeyword = /(refrigerad|congelad|perec[ií]ve|temperatura controlada|cadeia de frio|termossens[ií]ve|reefer|c[aâ]mara frigor[íi]fica|alimento perec|fresco|carnes frescas|peixe fresco|iogurte|latic[ií]nio|medicamento refrigerad|vacina|conserva[cç][aã]o t[eé]rmica|conserva[cç][aã]o de temperatura)/i.test(normalized);

  const isTimeOrDurationQuery = /(prazo|tempo|demora|quanto tempo|quanto demora|quando chega|dias|duracao|dura[cç][aã]o|velocidade|previsao|previs[aã]o)/i.test(normalized);

  // 3a. Pergunta sobre prazo/tempo de carga refrigerada, congelada ou perecível
  // Exemplo: "Quanto tempo demora o transporte de uma carga refrigerada de Luanda para Cabinda?"
  if (isRefrigeratedOrPerishableKeyword && isTimeOrDurationQuery) {
    return {
      text: `Para o transporte entre Luanda e Cabinda, as estimativas médias oficiais das modalidades de transporte atualmente configuradas na Gestão são:

• ✈️ **Via Aérea:** Previsão média atualmente configurada de **${airTime}**
• 🚢 **Via Marítima:** Previsão média atualmente configurada de **${seaTime}**
• 🚚 **Via Terrestre:** Previsão média atualmente configurada de **${landTime}**

⚠️ **Esclarecimento Importante sobre Cargas Refrigeradas e Perecíveis:**
“Os prazos acima correspondem às estimativas médias das modalidades de transporte atualmente configuradas. Para uma carga refrigerada ou perecível, é necessário confirmar previamente a disponibilidade de condições adequadas de conservação durante o transporte.”

Estes prazos correspondem às estimativas médias normais das modalidades de transporte e **não constituem uma garantia** de que a mercadoria refrigerada poderá ser transportada nessas condições sem validação operacional prévia de conservação térmica.

Para que a nossa equipa possa avaliar a viabilidade técnica e operacional, por favor indique:
1. 📦 **Tipo de produto** (ex.: alimentos, carnes, peixes, laticínios, medicamentos ou fármacos);
2. ⚖️ **Quantidade e peso aproximado (kg)**;
3. ❄️ **Condição térmica exigida** (se é refrigerado, congelado ou sensível à temperatura);
4. ⏱️ **Necessidade de urgência**.

Se desejar uma confirmação operacional direta, pode falar com a nossa equipa através do **WhatsApp Oficial (+244 942 043 293)**.`,
      suggestedQuestions: [
        'Falar com a equipa no WhatsApp (+244 942 043 293)',
        'Vocês fazem transporte de produtos congelados?',
        'Quais são os custos e taxas de frete?',
        'Como funciona a intermediação em 6 passos?'
      ],
      actionLink: {
        label: 'Falar com a Equipa no WhatsApp',
        view: 'suporte',
        icon: '💬'
      }
    };
  }

  // 3b. Pergunta sobre disponibilidade de transporte de produtos congelados, refrigerados ou perecíveis
  // Exemplo: "Vocês fazem transporte de produtos congelados?"
  if (isRefrigeratedOrPerishableKeyword) {
    // Check if Gestão has officially registered a custom refrigerated service item in the Knowledge Base
    const officiallyRegisteredItem = knowledgeBase.find(k => 
      k.isActive && 
      (k.keywords.some(kw => /congelad|refrigerad|reefer|cadeia de frio/i.test(kw)) ||
       /transporte refrigerado pr[óo]prio|contentor frigor[íi]fico/i.test(k.detailedAnswer))
    );

    if (officiallyRegisteredItem) {
      return {
        text: officiallyRegisteredItem.detailedAnswer,
        suggestedQuestions: officiallyRegisteredItem.suggestedNextQuestions || [
          'Quais são os prazos de entrega marítimos e aéreos?',
          'Falar com operador no WhatsApp'
        ],
        actionLink: officiallyRegisteredItem.actionLink || {
          label: 'Falar com Atendimento',
          view: 'suporte',
          icon: '💬'
        }
      };
    }

    // Prudent response when no dedicated refrigerated transport is officially registered
    return {
      text: `O transporte de produtos congelados, refrigerados ou altamente perecíveis requer condições específicas de conservação e controlo de temperatura durante o percurso.

Neste momento, a disponibilidade de condições adequadas de conservação e transporte para produtos congelados ou perecíveis **precisa de ser confirmada previamente com a nossa equipa operacional** antes de qualquer confirmação de serviço.

Para podermos verificar a viabilidade com os nossos transportadores e parceiros homologados, por favor informe:
• 🥩 **Tipo de produto** (ex.: alimentos congelados, peixe/carne, laticínios, gelo, medicamentos);
• ⚖️ **Quantidade e peso aproximado (kg)**;
• 🌡️ **Condição térmica necessária** (se é refrigerado ou congelado);
• ⏱️ **Necessidade de urgência ou data pretendida para envio**.

A nossa equipa analisará o caso junto das opções operacionais disponíveis.

Pode contactar diretamente a nossa equipa através do **WhatsApp Oficial (+244 942 043 293)** ou pelo telefone **942 043 293** para validação imediata.`,
      suggestedQuestions: [
        'Falar com a equipa no WhatsApp (+244 942 043 293)',
        'Quanto tempo demora o transporte de uma carga refrigerada de Luanda para Cabinda?',
        'Quais são os prazos médios de entrega?',
        'Como funciona a intermediação em 6 passos?'
      ],
      actionLink: {
        label: 'Confirmar com a Equipa Operacional',
        view: 'suporte',
        icon: '💬'
      }
    };
  }

  // 4. Bidirectional Route Check: "Cabinda para Luanda", "Luanda para Cabinda", "clientes em Luanda", etc.
  if (/(cabinda para luanda|luanda para cabinda|ambos os sentidos|dois sentidos|enviar para luanda|levar para luanda|comprar de cabinda|cliente em luanda|clientes em luanda|produtos de cabinda)/i.test(normalized)) {
    return {
      text: `O **Mediador Cabinda Lda** atende e transporta mercadorias em **ambos os sentidos** comerciais:

🔄 **1. Rota Luanda ➔ Cabinda (Compras & Abastecimento na Capital):**
• **Origem:** Mercados de Luanda (São Paulo, Kikolo, Viana, Talatona, etc.)
• **Consolidação:** ${logistics.consolidationAddressLuanda}
• **Destino:** Balcão Oficial do Armazém C-4 no Porto de Cabinda ou Entrega ao Domicílio
• **Previsões de Trânsito:** ✈️ Aéreo: **${airTime}** | 🚢 Marítimo: **${seaTime}** | 🚚 Terrestre: **${landTime}**

🔄 **2. Rota Cabinda ➔ Luanda (Expedição de Produtos & Encomendas de Cabinda para Luanda):**
• **Origem:** Lojas, artesãos, produtores locais ou encomendas particulares em Cabinda
• **Ponto de Recepção:** Balcão de Recepção e Triagem do Armazém C-4, Porto de Cabinda
• **Destino em Luanda:** Levantamento no nosso Parque de Consolidação (Viana/Luanda) ou Entrega em qualquer município de Luanda (Viana, Belas, Talatona, Kilamba, Cacuaco, Cazenga)
• **Previsões de Trânsito:** ✈️ Aéreo: **${airTime}** | 🚢 Marítimo: **${seaTime}** | 🚚 Terrestre: **${landTime}**
• **Segurança:** Emissão de Guia de Trânsito oficial AGT e rastreio em tempo real via código MED-XXXX.

Deseja solicitar um orçamento para Luanda ➔ Cabinda ou de Cabinda ➔ Luanda?`,
      suggestedQuestions: [
        'Quanto tempo demora por via marítima?',
        'Quanto tempo demora por via aérea?',
        'Como pagar por Multicaixa Express ou IBAN?',
        'Como fazer um novo pedido no app?'
      ],
      actionLink: {
        label: 'Fazer Pedido Agora',
        view: 'fazer-pedido',
        icon: '🛒'
      }
    };
  }

  // 4. Contextual Query: "Quanto tempo demora?" without specified modality/route (Rule 9)
  const isGenericTimeQuestion = /^(quanto tempo|quanto tempo demora|qual o prazo|quando chega|demora muito|quanto demora|tempo de entrega|tempo de viagem)\??$/i.test(normalized) ||
    (normalized.includes('quanto tempo') && !normalized.includes('marit') && !normalized.includes('aere') && !normalized.includes('aéreo') && !normalized.includes('marít') && !normalized.includes('terre') && !normalized.includes('barco') && !normalized.includes('navio') && !normalized.includes('aviao') && !normalized.includes('cami'));

  if (isGenericTimeQuestion) {
    return {
      text: `Para lhe fornecer uma previsão exata do tempo de entrega, por favor indique:
**Qual é a província de origem, a província de destino e qual modalidade de transporte pretende utilizar: aérea, marítima ou terrestre?**

Atualmente, as nossas previsões médias oficiais configuradas são:
• ✈️ **Via Aérea:** Previsão média de **${airTime}** (ideal para encomendas urgentes e eletrónicos).
• 🚢 **Via Marítima:** Previsão média de **${seaTime}** (mais económica para cargas pesadas e materiais).
• 🚚 **Via Terrestre:** Previsão média de **${landTime}** (transporte rodoviário).

⚠️ *Lembrando que todos os prazos são estimativas médias que podem variar de acordo com as condições da viagem, meteorologia e procedimentos de despacho aduaneiro da AGT.*

Qual destas modalidades gostaria de utilizar?`,
      suggestedQuestions: [
        'Quanto tempo demora por via marítima?',
        'Quanto tempo demora por via aérea?',
        'Quanto tempo demora por via terrestre?',
        'Como funciona a intermediação em 6 passos?'
      ],
      actionLink: {
        label: 'Acompanhar Pedido',
        view: 'acompanhar-pedido',
        icon: '🚚'
      }
    };
  }

  // 4. Specific Transport Modalities (Rule 4, 6 & 8)
  // 4a. Via Marítima
  if (/(maritimo|marítimo|cabotagem|navio|barco|mar|porto de luanda|porto de cabinda)/i.test(normalized) && /(prazo|tempo|demora|dias|quanto|duracao|dura[cç][aã]o|velocidade)/i.test(normalized)) {
    return {
      text: `O prazo médio para transporte por **Via Marítima (Cabotagem Portuária)** é atualmente de **${seaTime}** após o embarque no navio no Porto de Luanda.

⚠️ **Estimativa Operacional:** Esse prazo é uma previsão média e pode variar conforme a rota marítima, condições do mar e operações de atracação e despacho aduaneiro no Porto de Cabinda.

• **Origem ➔ Destino:** Porto de Luanda ➔ Porto de Cabinda (Armazém C-4)
• **Custo Estimado:** ${logistics.modes.maritimo.costEstimate || '450 AOA / kg'}
• **Recomendação:** ${logistics.modes.maritimo.recommendation}
• **Garantia:** ${logistics.warrantyAndRefundPolicy}`,
      suggestedQuestions: [
        'Quanto tempo demora por via aérea?',
        'Quanto tempo demora por via terrestre?',
        'Onde fica o Armazém C-4 para retirada em Cabinda?',
        'Como funciona o seguro de carga?'
      ],
      actionLink: {
        label: 'Acompanhar Encomenda',
        view: 'acompanhar-pedido',
        icon: '🚢'
      }
    };
  }

  // 4b. Via Aérea
  if (/(aereo|aéreo|aviao|avião|taag|cargo express|voo)/i.test(normalized) && /(prazo|tempo|demora|dias|quanto|duracao|dura[cç][aã]o|velocidade|urgente)/i.test(normalized)) {
    return {
      text: `O prazo médio para transporte por **Via Aérea (TAAG Cargo Express)** é atualmente de **${airTime}** após a consolidação e despacho da carga em Luanda.

⚠️ **Estimativa Operacional:** Esse prazo é uma previsão média calculada em dias úteis para voos cargueiros regulares.

• **Origem ➔ Destino:** Luanda ➔ Aeroporto de Cabinda
• **Custo Estimado:** ${logistics.modes.aereo.costEstimate || '2.500 AOA / kg'}
• **Recomendação:** ${logistics.modes.aereo.recommendation}
• **Garantia:** ${logistics.warrantyAndRefundPolicy}`,
      suggestedQuestions: [
        'Quanto tempo demora por via marítima?',
        'Quais produtos podem ser enviados por via aérea?',
        'Como fazer um novo pedido no app?'
      ],
      actionLink: {
        label: 'Fazer Pedido Aéreo',
        view: 'fazer-pedido',
        icon: '✈️'
      }
    };
  }

  // 4c. Via Terrestre
  if (/(terrestre|estrada|rodoviario|rodoviário|camiao|caminhao|caminhão|camião|corredor)/i.test(normalized) && /(prazo|tempo|demora|dias|quanto|duracao|dura[cç][aã]o)/i.test(normalized)) {
    return {
      text: `O transporte por **Via Terrestre (Corredor Rodoviário Regional)** tem uma previsão média de **${landTime}**, podendo variar de acordo com as condições da viagem, passagens fronteiriças regionais e outros fatores logísticos.

• **Custo Estimado:** ${logistics.modes.terrestre.costEstimate || '350 AOA / kg'}
• **Recomendação:** ${logistics.modes.terrestre.recommendation}
• **Garantia:** ${logistics.warrantyAndRefundPolicy}`,
      suggestedQuestions: [
        'Quanto tempo demora por via marítima?',
        'Quanto tempo demora por via aérea?',
        'Quais são os documentos necessários?'
      ],
      actionLink: {
        label: 'Pedir Cotação',
        view: 'fazer-pedido',
        icon: '🚚'
      }
    };
  }

  // 5. Custos, Tarifas e Taxas Dinâmicas
  if (/(taxa|taxas|tarifa|tarifas|comissao|comissão|quanto custa|preco|preço|despacho aduaneiro|guia agt)/i.test(normalized) && !normalized.includes('pagar') && !normalized.includes('iban')) {
    return {
      text: `A estrutura de tarifas e custos oficiais do **Mediador Cabinda Lda** é 100% transparente:

1. 🏷️ **Preço Real de Loja:** Custo exato cobrado pelo fornecedor em Luanda (com fatura original com NIF).
2. 💼 **Comissão de Intermediação:** **${logistics.intermediationFeeRate}** (cobre a compra presencial, vistoria técnica e conferência).
3. 🚢 **Frete de Transporte:** Proporcional ao peso e volume (Via Aérea: ${logistics.modes.aereo.costEstimate || '2.500 AOA/kg'} | Via Marítima: ${logistics.modes.maritimo.costEstimate || '450 AOA/kg'} | Via Terrestre: ${logistics.modes.terrestre.costEstimate || '350 AOA/kg'}).
4. 📄 **Despacho Aduaneiro AGT:** **${logistics.customsTaxAGT}** para emissão legal da Guia de Trânsito.

Todos os valores são formalizados na Fatura Pro-forma antes de qualquer liquidação.`,
      suggestedQuestions: [
        'Como pagar por Multicaixa Express (942043293) ou IBAN?',
        'Quais são os prazos de entrega marítimos e aéreos?',
        'Como funciona a garantia de 100% de reembolso?'
      ],
      actionLink: {
        label: 'Ver Faturas e Orçamentos',
        view: 'pagamentos',
        icon: '💳'
      }
    };
  }

  // 6. Direct Match in Dynamic Knowledge Base
  let bestMatch: DynamicKnowledgeItem | null = null;
  let highestScore = 0;

  for (const item of knowledgeBase) {
    let score = 0;

    // Check keyword exact matches
    for (const kw of item.keywords) {
      const kwLower = kw.toLowerCase();
      if (normalized.includes(kwLower)) {
        score += kwLower.length * 4;
      }
    }

    // Check question words matching
    const qWords = item.question.toLowerCase().split(/\s+/);
    for (const w of qWords) {
      if (w.length > 3 && normalized.includes(w)) {
        score += 6;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && highestScore >= 6) {
    // If the matched item is about prazos, inject live dynamic times to guarantee 100% freshness
    let answerText = bestMatch.detailedAnswer;
    if (bestMatch.id === 'prazos-entrega' || bestMatch.category === 'prazos') {
      answerText = `Os prazos de entrega dependem da modalidade de transporte selecionada e são calculados como **previsões médias estimadas**:

✈️ **1. Via Aérea (${logistics.modes.aereo.name}):**
• **Prazo Médio:** **${airTime}** (estimativa calculada após a consolidação em Luanda).
• **Recomendado para:** ${logistics.modes.aereo.recommendation}

🚢 **2. Via Marítima (${logistics.modes.maritimo.name}):**
• **Prazo Médio:** **${seaTime}** (após o embarque no navio no Porto de Luanda).
• **Recomendado para:** ${logistics.modes.maritimo.recommendation}

🚚 **3. Via Terrestre (${logistics.modes.terrestre.name}):**
• **Prazo Médio:** **${landTime}** (transporte rodoviário).
• **Recomendado para:** ${logistics.modes.terrestre.recommendation}

⚠️ *Nota Importante de Logística:* ${logistics.operationalNote}`;
    }

    return {
      text: answerText,
      suggestedQuestions: bestMatch.suggestedNextQuestions && bestMatch.suggestedNextQuestions.length > 0 
        ? bestMatch.suggestedNextQuestions 
        : [
            'Como funciona a intermediação em 6 passos?',
            'Quais são os prazos de entrega marítimos e aéreos?',
            'Como pagar por Multicaixa Express ou IBAN?'
          ],
      actionLink: bestMatch.actionLink
    };
  }

  // 7. Strictly Rule 7: NÃO INVENTAR INFORMAÇÕES
  // If the IA does not find confirmed info in the knowledge base or system data:
  return {
    text: `Neste momento não tenho uma informação confirmada sobre essa situação na nossa base oficial do Mediador-Cabinda.

Posso encaminhar a sua questão para a nossa equipa para confirmação e resposta personalizada.

Deseja falar diretamente com um dos nossos atendentes humanos através do **WhatsApp Oficial (+244 942 043 293)** ou prefere abrir um pedido no aplicativo?`,
    suggestedQuestions: [
      'Falar com operador humano no WhatsApp',
      'Quais são os prazos de entrega marítimos e aéreos?',
      'Como funciona a intermediação em 6 passos?',
      'Como pagar por Multicaixa Express ou IBAN?'
    ],
    actionLink: {
      label: 'Falar com Suporte Humano',
      view: 'suporte',
      icon: '💬'
    }
  };
}
