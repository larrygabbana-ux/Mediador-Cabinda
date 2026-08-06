/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BotMessage } from '../types';

export interface FAQItem {
  id: string;
  category: 'geral' | 'pedidos' | 'prazos' | 'pagamentos' | 'taxas' | 'rastreio' | 'servicos' | 'armazens' | 'horarios' | 'garantia' | 'apk';
  keywords: string[];
  question: string;
  shortAnswer: string;
  detailedAnswer: string;
  suggestedNextQuestions: string[];
  actionLink?: {
    label: string;
    view: string;
    icon?: string;
  };
}

export const KNOWLEDGE_BASE_ITEMS: FAQItem[] = [
  {
    id: 'como-funciona',
    category: 'geral',
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
    question: 'Como funciona o Mediador Cabinda e quais são os passos do processo?',
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
O cliente efetua o pagamento com total comodidade via *Multicaixa Express (MC Express)* ou *Transferência Bancária (IBAN AO06 corporativo)*. O sistema emite imediatamente o comprovativo de liquidação com chancela fiscal.

4️⃣ **Passo 4: Aquisição Física e Rigorosa Inspeção em Luanda**
A equipa do Mediador desloca-se presencialmente ao fornecedor em Luanda, realiza a compra oficial com fatura comercial com NIF, inspeciona a integridade física de cada artigo, fotografa o lote para o cliente e realiza o embalamento industrial reforçado e paletização para proteção marítima.

5️⃣ **Passo 5: Desembaraço Aduaneiro e Embarque (Marítimo ou Aéreo)**
Procedemos à emissão da Guia de Trânsito AGT e desembaraço portuário. A carga é embarcada no navio de cabotagem no Porto de Luanda ou no voo regular TAAG Cargo. É gerado o código único de rastreio **MED-XXXX** para acompanhar todas as etapas em tempo real no app.

6️⃣ **Passo 6: Desembarque, Notificação e Entrega Segura em Cabinda**
Ao atracar em Cabinda, a mercadoria é rececionada no nosso Balcão Oficial no **Armazém C-4 do Porto de Cabinda** (Rua Direita) para levantamento imediato pelo cliente, ou entregue diretamente ao domicílio. Todas as encomendas possuem **100% de Garantia de Reembolso** contra eventuais avarias ou extravios.`,
    suggestedNextQuestions: [
      'Quais são os prazos de entrega marítimos e aéreos?',
      'Como fazer um novo pedido no app?',
      'Quais são as taxas e comissões cobradas?',
      'Como pagar por Multicaixa Express ou IBAN?'
    ],
    actionLink: {
      label: 'Fazer Novo Pedido',
      view: 'fazer-pedido',
      icon: '🛒'
    }
  },
  {
    id: 'criador-fundador',
    category: 'geral',
    keywords: ['criador', 'fundador', 'quem criou', 'quem fez', 'autor', 'joao hilario antonio', 'joão hilário antónio', 'dono', 'idealizador', 'diretor', 'fundacao', 'historia', 'biografia'],
    question: 'Quem é o criador e fundador do Mediador Cabinda?',
    shortAnswer: 'O Mediador Cabinda foi idealizado e criado pelo empreendedor e desenvolvedor angolano João Hilário António.',
    detailedAnswer: `O **Mediador Cabinda** foi fundado e desenvolvido por **João Hilário António**, empreendedor e profissional angolano guiado pela máxima de que *toda empresa e inovação tecnológica sustentável deve nascer da necessidade imperiosa de resolver um problema real, concreto e doloroso de uma comunidade*.

Ao constatar as severas dificuldades estruturais enfrentadas pelas famílias e empresas de Cabinda — decorrentes da descontinuidade territorial com o restante de Angola —, **João Hilário António** concebeu esta plataforma digital e rede logística para democratizar o comércio, erradicar burlas informais, garantir conformidade fiscal com a AGT e impulsionar a economia local com geração de rendimento para a juventude cabindense.`,
    suggestedNextQuestions: [
      'Por que o Mediador Cabinda foi criado e qual a sua missão?',
      'Como funciona o processo de intermediação em 6 passos?',
      'Como solicitar um pedido agora?'
    ],
    actionLink: {
      label: 'Conhecer Sobre Nós',
      view: 'sobre-nos',
      icon: '🏢'
    }
  },
  {
    id: 'por-que-foi-criado',
    category: 'geral',
    keywords: ['por que foi criado', 'porque foi criado', 'objetivo', 'missao', 'problema que resolve', 'qual o problema', 'povo de cabinda', 'necessidade', 'proposito', 'motivo', 'enclave'],
    question: 'Por que o aplicativo foi criado e qual o problema que ele resolve para o povo de Cabinda?',
    shortAnswer: 'Foi criado para romper o isolamento geográfico de Cabinda, combater a carestia e preços inflacionados, e acabar com burlas de intermediários informais.',
    detailedAnswer: `O **Mediador Cabinda** foi estruturado para erradicar quatro problemas históricos que sobrecarregavam os cidadãos e a economia do enclave:

1. 🌍 **A Barreira da Descontinuidade Territorial:** Cabinda está geograficamente separada do restante território angolano pelo Rio Congo e pela República Democrática do Congo (RDC). Adquirir produtos em Luanda exigia viagens onerosas, trâmites consulares ou dependência arriscada de terceiros.
2. 💸 **Preços Inflacionados e Escassez Local:** Produtos essenciais (materiais de construção, tintas, eletrodomésticos, peças industriais e eletrónica) chegam a Cabinda com sobretaxas de 200% a 400% no mercado informal local.
3. ⚠️ **Vulnerabilidade a Burlas Financeiras:** Sem uma entidade jurídica responsável, muitos cidadãos sofriam prejuízos irrecuperáveis ao transferir valores para vendedores desconhecidos em redes sociais sem garantias ou faturas.
4. 📄 **Burocracia Aduaneira e Portuária:** A emissão de Guias de Trânsito AGT e a logística de cabotagem exigiam conhecimentos técnicos que o cidadão comum não dominava.

✨ **A Missão do Mediador Cabinda:** Oferecer uma ponte comercial formal, transparente e segura, onde qualquer pessoa em Cabinda adquire artigos em Luanda ao preço real de fábrica, com respaldo fiscal da AGT, frete oficial e garantia incondicional de 100% de reembolso.`,
    suggestedNextQuestions: [
      'Como funciona a intermediação em 6 passos?',
      'Quem é o fundador João Hilário António?',
      'Quais são os prazos de entrega?'
    ],
    actionLink: {
      label: 'Ler Manifesto Completo',
      view: 'sobre-nos',
      icon: '📖'
    }
  },
  {
    id: 'como-fazer-pedido',
    category: 'pedidos',
    keywords: ['fazer pedido', 'comprar', 'encomendar', 'pedir intermediacao', 'solicitar compra', 'novo pedido', 'adquirir', 'como peço'],
    question: 'Como faço um novo pedido ou encomenda no aplicativo?',
    shortAnswer: 'Acesse o menu "Pedir Nova Intermediação", preencha o nome do produto, quantidade, loja ou fornecedor e anexe fotos se tiver.',
    detailedAnswer: `Realizar um pedido no aplicativo é simples, ágil e intuitivo:

1. **Aceda ao Menu:** Toque em **"Pedir Nova Intermediação"** na barra lateral ou escolha um produto no **"Mercado de Fornecedores"**.
2. **Especifique o Artigo:** Indique a descrição detalhada do produto, a quantidade necessária e a loja pretendida em Luanda (ex: Topack, Martal, Kero, lojas do Kikolo, etc.).
3. **Anexe Fotos/Ficheiros (Opcional):** Pode anexar imagens, medidas ou fichas técnicas para assegurar a precisão do artigo.
4. **Defina a Modalidade de Entrega:** Escolha entre **Levantamento no Balcão de Cabinda (Armazém C-4)** ou **Entrega ao Domicílio**.
5. **Submeta o Pedido:** Clique em **"Criar Cotação / Pedido"**.
6. **Receba o Orçamento em até 2 Horas:** A nossa equipa emite a Fatura Pro-forma com custos detalhados para a sua aprovação.`,
    suggestedNextQuestions: [
      'Quais as formas de pagamento disponíveis?',
      'Quais são os prazos de entrega marítimos e aéreos?',
      'Como acompanhar o código de rastreio MED-XXXX?'
    ],
    actionLink: {
      label: 'Ir para Pedir Intermediação',
      view: 'fazer-pedido',
      icon: '📝'
    }
  },
  {
    id: 'prazos-entrega',
    category: 'prazos',
    keywords: ['prazo', 'tempo', 'demora', 'quanto tempo', 'dias', 'quando chega', 'velocidade', 'urgente', 'maritimo', 'aereo', 'frete'],
    question: 'Quais são os prazos de entrega de Luanda para Cabinda?',
    shortAnswer: 'Frete Marítimo de Cabotagem: 3 a 7 dias úteis. Frete Aéreo TAAG Cargo: 24 a 48 horas úteis.',
    detailedAnswer: `Os prazos de trânsito variam consoante a modalidade de transporte selecionada:

🚢 **1. Frete Marítimo de Cabotagem (Económico & Grande Volume):**
• **Prazo Médio:** **3 a 7 dias úteis** após embarque no Porto de Luanda.
• **Recomendado para:** Cargas pesadas, materiais de construção (cimento, varão de ferro, tintas, tubos), eletrodomésticos volumosos, tanques, estruturas e mobiliário.

✈️ **2. Frete Aéreo TAAG Cargo Express (Máxima Rapidez):**
• **Prazo Médio:** **24 a 48 horas úteis** após a consolidação em Luanda.
• **Recomendado para:** Telemóveis, computadores, peças sobressalentes urgentes, medicamentos autorizados e documentos confidenciais.

🛠️ **3. Serviços de Serralharia e Oficinas Industriais:**
• **Prazo de Execução:** **2 a 5 dias úteis**, variando conforme a envergadura técnica do projeto.`,
    suggestedNextQuestions: [
      'Como rastrear a minha encomenda com o código MED?',
      'Quais são as taxas de frete e intermediação?',
      'Onde fica o armazém no Porto de Cabinda?'
    ],
    actionLink: {
      label: 'Acompanhar Encomendas',
      view: 'acompanhar-pedido',
      icon: '🚚'
    }
  },
  {
    id: 'formas-pagamento',
    category: 'pagamentos',
    keywords: ['pagamento', 'pagar', 'como pagar', 'multicaixa express', 'iban', 'transferencia', 'dinheiro', 'conta bancaria', 'fatura', 'recibo', 'tpa', 'coordenadas bancarias'],
    question: 'Quais são as formas de pagamento aceites e como comprovar?',
    shortAnswer: 'Aceitamos Multicaixa Express (942043293), Transferência Bancária IBAN (AO06 0006 0000 01307638301 95) e pagamento presencial no Balcão de Cabinda.',
    detailedAnswer: `Disponibilizamos métodos de liquidação 100% auditáveis e seguros, todos com emissão automática de Fatura Pro-forma e Recibo Fiscal oficial:

📱 **1. Multicaixa Express (MC Express):**
• **Número Oficial de Pagamento MC Express:** **942 043 293** (+244 942 043 293).
• Liquidação instantânea via app Multicaixa Express ou referência bancária gerada pelo sistema.

🏦 **2. Transferência Bancária / Depósito (IBAN Corporativo Oficial):**
• **IBAN Oficial:** **AO06 0006 0000 01307638301 95** (0006 0000 01307638301 95).
• **Beneficiário:** Mediador Cabinda Lda.
• O comprovativo é submetido diretamente no menu *"Pagamentos"* para conciliação imediata em menos de 30 minutos.

🏢 **3. Presencial no Balcão (TPA Multicaixa):**
• Pagamento por cartão no nosso Balcão Oficial em Cabinda (Armazém C-4, Porto Comercial de Cabinda, Rua Direita).

*Garantia Fiscal: Todas as operações são acompanhadas de fatura em conformidade com as normas da Administração Geral Tributária (AGT).*`,
    suggestedNextQuestions: [
      'Como visualizar e descarregar as minhas faturas?',
      'Quais são as taxas de intermediação e comissão?',
      'Como funciona a garantia de 100% de reembolso?'
    ],
    actionLink: {
      label: 'Ver Faturas e Pagamentos',
      view: 'pagamentos',
      icon: '💳'
    }
  },
  {
    id: 'taxas-comissoes',
    category: 'taxas',
    keywords: ['taxa', 'comissao', 'quanto custa', 'preco', 'percentagem', 'valor', 'aduana', 'agt', 'imposto', 'frete', 'custo'],
    question: 'Quais são as taxas cobradas pelo Mediador Cabinda?',
    shortAnswer: 'Comissão de intermediação entre 10% e 15% do valor da mercadoria, além do frete real de transporte e taxa de despacho aduaneiro.',
    detailedAnswer: `A política tarifária do Mediador Cabinda rege-se pela transparência absoluta, sem custos ocultos:

1. **Preço de Custo da Mercadoria:** O valor rigoroso cobrado pela loja/fábrica em Luanda, com cópia da fatura original.
2. **Comissão de Intermediação Comercial:** Taxa entre **10% e 15%** calculada sobre o valor dos artigos (cobre a compra presencial, vistoria técnica, negociação e gestão operacional).
3. **Frete de Transporte:** Calculado proporcionalmente ao peso e cubagem (kg ou m³) em transporte marítimo de cabotagem ou aéreo.
4. **Taxa de Despacho Aduaneiro / Guia AGT:** Taxa fixa de 8.000 Kz para emissão da Guia de Trânsito oficial da AGT, assegurando circulação legal sem retenções portuárias.

*Todos os valores são formalizados na Fatura Pro-forma antes de qualquer pagamento.*`,
    suggestedNextQuestions: [
      'Como funciona a garantia de reembolso?',
      'Como fazer um pedido no app?',
      'Quais são os prazos de entrega?'
    ],
    actionLink: {
      label: 'Consultar Guia de Ajuda',
      view: 'guia-ajuda',
      icon: '📖'
    }
  },
  {
    id: 'rastreio-acompanhamento',
    category: 'rastreio',
    keywords: ['rastreio', 'rastrear', 'acompanhar', 'onde esta', 'estado', 'status', 'codigo med', 'posicao', 'localizacao', 'contentor', 'criar codigo', 'gerar codigo', 'codigo de rastreio'],
    question: 'Como funciona o código de rastreio MED-XXXX e como acompanhar a carga?',
    shortAnswer: 'O código único MED-XXXX é gerado automaticamente ao criar o pedido. O cliente insere o código no app ou WhatsApp para ver as 9 etapas em tempo real.',
    detailedAnswer: `O sistema de rastreabilidade do **Mediador Cabinda Lda** disponibiliza controlo rigoroso e em tempo real sobre a sua encomenda:

🔖 **1. Atribuição do Código MED-XXXX:**
• Ao submeter o pedido, o sistema gera automaticamente um código alfanumérico único (ex: **MED-1001**, **MED-8492**).
• No embarque, é associada a respectiva **Guia de Trânsito AGT** (ex: **GUI-CB-84920**).

📲 **2. Consulta em Tempo Real no App:**
• No menu **"Acompanhar Pedidos"**, basta inserir o código **MED-XXXX** na barra de pesquisa para visualizar o lote, fotos de inspeção e transportadora.

📊 **3. As 9 Etapas Transparentes:**
1. *Recebido* ➔ 2. *Análise Técnica* ➔ 3. *Orçado* ➔ 4. *Pago* ➔ 5. *Comprado em Luanda* ➔ 6. *Em Trânsito Marítimo/Aéreo* ➔ 7. *Atracado em Cabinda* ➔ 8. *Pronto para Levantamento (Armazém C-4)* ➔ 9. *Entregue ao Cliente*.

🤖 **4. Consulta Automática no Assistente IA:**
• Pode perguntar diretamente neste chat: *"Qual o estado da encomenda MED-1001?"* e o assistente informará o posicionamento atual e a estimativa de entrega.`,
    suggestedNextQuestions: [
      'Onde fica o balcão de levantamento em Cabinda?',
      'Quanto tempo demora a viagem marítima de cabotagem?',
      'Como falar com o suporte no WhatsApp?'
    ],
    actionLink: {
      label: 'Rastrear Encomenda Agora',
      view: 'acompanhar-pedido',
      icon: '📍'
    }
  },
  {
    id: 'servicos-serralharia',
    category: 'servicos',
    keywords: ['servico', 'serralharia', 'oficina', 'ferro', 'portao', 'grade', 'soldadura', 'tanque', 'metalica', 'reparacao', 'corte', 'serralheiro'],
    question: 'Como solicitar serviços de serralharia e fabricação metálica em Cabinda?',
    shortAnswer: 'Acesse o menu "Solicitar Serviço", selecione a categoria de trabalho metálico/serralharia e envie as medidas pretendidas.',
    detailedAnswer: `O Mediador Cabinda dispõe de uma divisão técnica especializada e oficinas parceiras homologadas para trabalhos metalúrgicos e de serralharia civil:

🛠️ **Especialidades Técnicas Disponíveis:**
• **Portões:** Fabrico de portões de correr, basculantes e automáticos.
• **Segurança:** Grades de proteção pantográficas, janelas e vedações de alta resistência.
• **Estruturas:** Coberturas metálicas para armazéns, pavilhões e alpendres.
• **Reservatórios:** Fabricação e soldadura de tanques de água e combustíveis.
• **Corte Industrial:** Quinagem, corte plasma e caldeiraria pesada.

Para solicitar: Aceda ao menu **"Solicitar Serviço"**, escolha a especialidade técnica, indique as dimensões aproximadas e localização da obra. A nossa equipa emite a proposta técnica em até 12 horas úteis.`,
    suggestedNextQuestions: [
      'Qual o prazo de execução para portões e grades?',
      'Como funciona a garantia das obras metálicas?',
      'Como solicitar um orçamento personalizado?'
    ],
    actionLink: {
      label: 'Ver Catálogo de Serviços',
      view: 'solicitar-servico',
      icon: '🛠️'
    }
  },
  {
    id: 'armazens-balcoes',
    category: 'armazens',
    keywords: ['armazem', 'balcao', 'onde fica', 'endereco', 'morada', 'localizacao', 'porto de cabinda', 'luanda', 'recolha', 'levantamento', 'onde buscar'],
    question: 'Onde ficam localizados os armazéns e balcões oficiais de atendimento?',
    shortAnswer: 'Cabinda: Armazém C-4 no Recinto do Porto de Cabinda. Luanda: Parque Logístico Portuário / Viana.',
    detailedAnswer: `A infraestrutura do Mediador Cabinda está estrategicamente posicionada nos dois eixos da operação:

🏢 **Balcão Central de Atendimento e Distribuição (Cabinda):**
• **Localização:** Armazém C-4, Recinto do Porto Comercial de Cabinda, Rua Direita, Província de Cabinda.
• **Serviços:** Levantamento de mercadorias, conferência física, atendimento executivo, liquidações TPA e apoio ao cliente.

🏭 **Armazém Central de Consolidação e Vistoria (Luanda):**
• **Localização:** Parque Logístico Portuário / Viana, Luanda.
• **Serviços:** Receção de fornecedores, inspeção técnica, embalamento reforçado, paletização e despacho aduaneiro junto da AGT.`,
    suggestedNextQuestions: [
      'Quais os horários de funcionamento do balcão?',
      'Como solicitar entrega ao domicílio em Cabinda?',
      'Quais os contactos de WhatsApp oficiais?'
    ],
    actionLink: {
      label: 'Sobre Nós e Localizações',
      view: 'sobre-nos',
      icon: '🏢'
    }
  },
  {
    id: 'horarios-contactos',
    category: 'horarios',
    keywords: ['horario', 'hora', 'fechado', 'aberto', 'contacto', 'telefone', 'whatsapp', 'falar com humano', 'atendimento', 'suporte', 'email', 'unitel', 'movicel', 'express', 'iban', 'ligar', 'chamada'],
    question: 'Quais são os horários de funcionamento, contactos e linhas telefónicas oficiais?',
    shortAnswer: 'Unitel & Express: 942043293 | Movicel: 998100940 | E-mail: equipemediadorcabindacabinda@gmail.com | Direção Base: Cabinda.',
    detailedAnswer: `Dispomos de múltiplos canais oficiais de comunicação para atendimento executivo e suporte contínuo:

🏢 **Direção Base & Operação:**
• **Direção Base:** Província de Cabinda (Armazém C-4, Recinto Portuário de Cabinda, Rua Direita).
• **Armazém de Consolidação:** Luanda (Parque Logístico Portuário / Viana).
• **Âmbito:** *Mediando atualmente com excelência entre Cabinda e Luanda e, em breve, em expansão para as demais províncias de Angola.*

📞 **Linhas Telefónicas & Chamadas Normais:**
• **Rede Unitel:** [+244 942 043 293](tel:+244942043293) (942043293)
• **Rede Movicel:** [+244 998 100 940](tel:+244998100940) (998100940)
• **WhatsApp Geral:** [+244 942 043 293](https://wa.me/244942043293)

💳 **Canais Oficiais de Pagamento:**
• **Multicaixa Express (MC Express):** **942 043 293** (942043293)
• **IBAN Corporativo:** **AO06 0006 0000 01307638301 95** (0006 0000 01307638301 95)

📧 **Correio Eletrónico Institucional:**
• **E-mail Oficial:** [equipemediadorcabindacabinda@gmail.com](mailto:equipemediadorcabindacabinda@gmail.com)

🕒 **Horários de Atendimento Humano:**
• **Segunda a Sexta-feira:** 08h00 às 18h00
• **Sábados:** 08h00 às 13h00
• **Domingos e Feriados:** Atendimento contínuo 24/7 via Assistente Virtual Inteligente.`,
    suggestedNextQuestions: [
      'Como falar com um atendente no WhatsApp?',
      'Como pagar por Multicaixa Express ou IBAN?',
      'Como funciona o Mediador Cabinda em 6 passos?'
    ],
    actionLink: {
      label: 'Abrir Chat de Suporte',
      view: 'suporte',
      icon: '💬'
    }
  },
  {
    id: 'garantia-reembolso',
    category: 'garantia',
    keywords: ['garantia', 'reembolso', 'devolucao', 'seguro', 'extravio', 'avaria', 'estragou', 'partiu', 'seguranca', 'confiavel', 'risco'],
    question: 'Qual é a garantia caso a mercadoria seja avariada ou extraviada?',
    shortAnswer: 'Garantia de 100% de reembolso ou reposição integral do produto em caso de avaria no transporte marítimo ou extravio.',
    detailedAnswer: `No Mediador Cabinda o seu património goza de proteção jurídica e financeira total:

🛡️ **Política Institucional de Garantia Total:**
• **Seguro de Transporte Integrado:** Todas as cargas despachadas via cabotagem marítima ou aérea possuem cobertura contra perdas, sinistros ou avarias.
• **Vistoria Pré-Embarque:** Cada artigo é inspecionado e fotografado em Luanda antes de entrar no recinto portuário.
• **Reembolso Integral de 100%:** Em caso comprovado de dano estrutural durante a viagem marítima ou extravio sob a nossa custódia, o cliente tem direito a reembolso monetário imediato ou reposição da mercadoria sem qualquer custo adicional.

Para submeter qualquer ocorrência, utilize o menu **"Reclamações & Reembolso"** no aplicativo.`,
    suggestedNextQuestions: [
      'Como submeter uma ocorrência no portal de reclamações?',
      'Como funciona o desembaraço aduaneiro na AGT?',
      'Quais são os prazos de entrega?'
    ],
    actionLink: {
      label: 'Portal de Reclamações',
      view: 'reclamacoes',
      icon: '🛡️'
    }
  },
  {
    id: 'instalacao-apk',
    category: 'apk',
    keywords: ['apk', 'instalar', 'celular', 'telefone', 'android', 'baixar', 'download', 'aplicativo', 'app', 'github', 'zip', 'iphone'],
    question: 'Como instalar o aplicativo Mediador Cabinda no telemóvel Android ou iPhone?',
    shortAnswer: 'Pode instalar diretamente pelo navegador usando "Adicionar ao Ecrã Principal" (PWA) ou gerar o APK Android do projeto.',
    detailedAnswer: `Pode instalar e aceder ao Mediador Cabinda no seu telemóvel de forma prática:

📱 **1. Instalação Instantânea PWA (Recomendada - Não consome memória):**
• Aceda ao site através do navegador do telemóvel (Google Chrome no Android ou Safari no iPhone).
• Toque no menu de opções do navegador (três pontinhos ou ícone de partilha).
• Selecione **"Adicionar ao Ecrã Principal"** (ou *"Instalar Aplicação"*).
• O ícone oficial do Mediador Cabinda será criado no seu telemóvel, funcionando como app nativo com carregamento ultrarrápido.

📦 **2. Formato APK para Android:**
• O projeto pode ser compilado em ficheiro APK (.apk) através do pacote de exportação utilizando ferramentas como **Capacitor**, **Cordova** ou **Android Studio Webview**.`,
    suggestedNextQuestions: [
      'Como funciona o Mediador Cabinda?',
      'Como fazer um pedido agora?',
      'Como falar com o suporte oficial?'
    ],
    actionLink: {
      label: 'Ir para Início',
      view: 'inicio',
      icon: '🏠'
    }
  }
];

export const POPULAR_QUESTIONS = [
  'Como funciona o Mediador Cabinda em 6 passos?',
  'Quais são os prazos de entrega de Luanda para Cabinda?',
  'Como pagar por Multicaixa Express ou IBAN?',
  'Quais são as taxas de comissão e frete?',
  'Como rastrear a minha encomenda com o código MED?',
  'Onde fica o armazém oficial em Cabinda?',
  'Como solicitar serviços de serralharia?',
  'Qual o horário de funcionamento e contactos?'
];

/**
 * Intelligent local intent solver for immediate 0ms responses,
 * works 100% offline, on mobile APKs, and without requiring any API keys.
 */
export function solveBotQueryLocally(userQuery: string): {
  text: string;
  suggestedQuestions: string[];
  actionLink?: { label: string; view: string; icon?: string };
} {
  const normalized = userQuery.toLowerCase().trim();

  // 1. Check for simple greetings
  if (/^(ol[aá]|oi|bom dia|boa tarde|boa noite|cumprimentos|sauda[cç][oõ]es|alo|alô|hello|hi)\b/.test(normalized)) {
    return {
      text: `Olá! Sou o **Assistente Virtual Inteligente 24/7 do Mediador Cabinda Lda**. 🤖🇦🇴

Estou ao seu dispor para fornecer todas as informações oficiais sobre a nossa operação:
• **Como funciona a intermediação de compras entre Luanda e Cabinda (6 etapas)**
• **Prazos de entrega marítimos (cabotagem) e aéreos (TAAG Cargo)**
• **Métodos de pagamento seguros (Multicaixa Express e IBAN corporativo)**
• **Rastreamento de encomendas e código MED-XXXX**
• **Taxas transparentes de despacho aduaneiro AGT e comissões**
• **Serviços de serralharia e oficinas industriais**

Em que posso ser útil hoje?`,
      suggestedQuestions: [
        'Como funciona o Mediador Cabinda em 6 passos?',
        'Quais são os prazos de entrega?',
        'Como fazer um pedido agora?',
        'Quais as formas de pagamento disponíveis?'
      ],
      actionLink: {
        label: 'Fazer Pedido',
        view: 'fazer-pedido',
        icon: '🛒'
      }
    };
  }

  // 2. Direct intent match for "como funciona" or "como e que funciona" or "explicar passos"
  if (/(como funciona|como e que funciona|explicar o mediador|como opera|qual e o processo|quais sao os passos|passo a passo|como trabalha|explicar como funciona)/i.test(normalized)) {
    const item = KNOWLEDGE_BASE_ITEMS.find(i => i.id === 'como-funciona')!;
    return {
      text: item.detailedAnswer,
      suggestedQuestions: item.suggestedNextQuestions,
      actionLink: item.actionLink
    };
  }

  // 3. Check for human operator / WhatsApp requests
  if (/(falar com humano|atendente|operador|pessoa real|falar com alguem|gerente|whatsapp|telefone|suporte humano|ligar|chamada|unitel|movicel)/i.test(normalized)) {
    return {
      text: `Com certeza! Se deseja falar diretamente com a nossa equipa executiva ou operadores humanos:

📞 **Linhas Telefónicas & Chamadas Normais:**
• **Rede Unitel:** [+244 942 043 293](tel:+244942043293) (942043293)
• **Rede Movicel:** [+244 998 100 940](tel:+244998100940) (998100940)
• **WhatsApp Oficial:** [+244 942 043 293](https://wa.me/244942043293)

📧 **E-mail Institucional:**
• [equipemediadorcabindacabinda@gmail.com](mailto:equipemediadorcabindacabinda@gmail.com)

🏢 **Direção Base:**
• Armazém C-4, Recinto Portuário de Cabinda, Rua Direita, Cabinda.

🕒 **Horário de Atendimento Humano:**
• Segunda a Sexta: 08h00 às 18h00
• Sábado: 08h00 às 13h00

*Caso esteja fora do horário presencial, deixe a sua mensagem no WhatsApp ou no chat do app para retorno prioritário.*`,
      suggestedQuestions: [
        'Como pagar por Multicaixa Express (942043293) ou IBAN?',
        'Onde fica o balcão no Porto de Cabinda?',
        'Como funciona o Mediador Cabinda em 6 passos?'
      ],
      actionLink: {
        label: 'Abrir Chat de Suporte',
        view: 'suporte',
        icon: '💬'
      }
    };
  }

  // 4. Score all knowledge base items based on keywords matching
  let bestMatch: FAQItem | null = null;
  let highestScore = 0;

  for (const item of KNOWLEDGE_BASE_ITEMS) {
    let score = 0;
    
    // Check keywords
    for (const kw of item.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        score += kw.length * 4;
      }
    }

    // Check words in question
    const qWords = item.question.toLowerCase().split(/\s+/);
    for (const w of qWords) {
      if (w.length > 3 && normalized.includes(w)) {
        score += 5;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && highestScore >= 5) {
    return {
      text: bestMatch.detailedAnswer,
      suggestedQuestions: bestMatch.suggestedNextQuestions,
      actionLink: bestMatch.actionLink
    };
  }

  // 5. Default fallback with comprehensive executive guidance
  return {
    text: `Agradecemos a sua consulta sobre **"${userQuery}"**.

O **Mediador Cabinda Lda** é a ponte comercial e logística que liga com total segurança o enclave de Cabinda aos melhores fornecedores e fábricas de Luanda. Cuidamos da aquisição presencial com fatura legal, desembaraço da Guia de Trânsito AGT, transporte marítimo de cabotagem ou frete aéreo regular e entrega segura no Porto de Cabinda com garantia incondicional de 100% de reembolso.

Selecione um dos tópicos rápidos abaixo ou toque em **"Falar no WhatsApp"** para atendimento personalizado com a nossa equipa!`,
    suggestedQuestions: [
      'Como funciona o Mediador Cabinda em 6 passos?',
      'Quais são os prazos de entrega marítimos e aéreos?',
      'Como pagar por Multicaixa Express ou IBAN?',
      'Falar com operador humano no WhatsApp'
    ],
    actionLink: {
      label: 'Consultar Guia de Ajuda',
      view: 'guia-ajuda',
      icon: '💡'
    }
  };
}
