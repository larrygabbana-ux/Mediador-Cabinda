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
    id: 'criador-fundador',
    category: 'geral',
    keywords: ['criador', 'fundador', 'quem criou', 'quem fez', 'autor', 'joao hilario antonio', 'joão hilário antónio', 'dono', 'idealizador', 'diretor', 'fundacao', 'historia'],
    question: 'Quem é o criador e fundador do Mediador Cabinda?',
    shortAnswer: 'O Mediador Cabinda foi idealizado e criado pelo empreendedor e desenvolvedor angolano João Hilário António.',
    detailedAnswer: `O **Mediador Cabinda** foi fundado e criado por **João Hilário António**, movido pelo princípio inegociável de que *toda empresa e inovação tecnológica nasce da responsabilidade cívica de resolver um problema real e doloroso de um determinado povo*.

Testemunhando de perto os obstáculos enfrentados pelos cidadãos, famílias e empresários de Cabinda — devido à descontinuidade territorial e ao isolamento geográfico do enclave —, **João Hilário António** concebeu esta plataforma digital e rede logística para democratizar o acesso a produtos com preços justos de Luanda, combater burlas, simplificar a fiscalidade da AGT e criar oportunidades de renda para a juventude local através de comissões partilhadas.`,
    suggestedNextQuestions: ['Por que o Mediador Cabinda foi criado?', 'Como funciona a intermediação?', 'Para que serve o aplicativo?'],
    actionLink: {
      label: 'Conhecer Sobre Nós',
      view: 'sobre-nos',
      icon: '🏢'
    }
  },
  {
    id: 'por-que-foi-criado',
    category: 'geral',
    keywords: ['por que foi criado', 'porque foi criado', 'objetivo', 'missao', 'problema que resolve', 'qual o problema', 'povo de cabinda', 'necessidade', 'proposito', 'motivo'],
    question: 'Por que o aplicativo foi criado e qual o problema que ele resolve para o povo de Cabinda?',
    shortAnswer: 'Foi criado para romper o isolamento geográfico de Cabinda, combater a carestia e preços inflacionados, e acabar com burlas de intermediários informais.',
    detailedAnswer: `Toda empresa legítima surge para solucionar uma dor real de uma comunidade. O **Mediador Cabinda** foi criado para erradicar quatro problemas crónicos que afligem o povo do enclave de Cabinda:

1. 🌍 **A Barreira da Descontinuidade Territorial:** Cabinda não tem fronteira terrestre contínua com o resto de Angola, estando separada pelo rio Congo e pelo território estrangeiro da RDC. Fazer compras em Luanda por meios tradicionais exigia viagens caras, vistos de trânsito ou dependência de terceiros.
2. 💸 **Preços Exorbitantes e Escassez Local:** Produtos como materiais de construção, ferramentas industriais, eletrodomésticos, telemóveis e peças de reposição chegam a Cabinda com preços 3 a 5 vezes mais caros no comércio informal local.
3. ⚠️ **Risco de Burlas e Insegurança em Compras Informais:** Milhares de cidadãos de Cabinda já perderam economias transferindo dinheiro para supostos vendedores em Luanda através de redes sociais sem garantias, sem faturas e sem nota fiscal.
4. 📄 **Complexidade Aduaneira e de Cabotagem:** O processo de emissão de Guia de Trânsito da AGT e despacho no Porto de Luanda é burocrático e intimidador para o cidadão comum.

✨ **A Resposta do Mediador Cabinda:** Oferecer uma ponte digital segura, onde qualquer habitante de Cabinda compra em Luanda ao preço real de fábrica ou fornecedor, com desembaraço fiscal legal, frete marítimo e aéreo assegurado, e garantia de reembolso integral de 100%.`,
    suggestedNextQuestions: ['Quem é o criador João Hilário António?', 'Como funciona passo a passo?', 'Quais as taxas e comissões?'],
    actionLink: {
      label: 'Ler Manifesto Completo',
      view: 'sobre-nos',
      icon: '📖'
    }
  },
  {
    id: 'como-funciona',
    category: 'geral',
    keywords: ['como funciona', 'o que e', 'o que faz', 'explicar', 'mediador', 'para que serve', 'cabinda luanda', 'enclave', 'intermediação'],
    question: 'Como funciona o Mediador Cabinda e para que serve?',
    shortAnswer: 'Compramos os seus produtos em Luanda com fatura legal, cuidamos do frete marítimo/aéreo e entregamos em Cabinda com segurança aduaneira.',
    detailedAnswer: `O **Mediador Cabinda Lda** é uma plataforma e serviço operacional de intermediação comercial e logística que serve para:

• **Comprar qualquer produto em Luanda:** De materiais de construção a eletrodomésticos e eletrónica, adquiridos com fatura comercial oficial.
• **Garantir a inspeção de qualidade:** Testamos e conferimos os artigos fisicamente em Luanda antes de embarcar.
• **Tratar da cabotagem e alfândega AGT:** Emitimos Guias de Trânsito homologadas para evitar dupla tributação ou retenção portuária.
• **Entregar com segurança em Cabinda:** No nosso balcão do Porto de Cabinda (Armazém C-4) ou diretamente na sua morada.

**Passo a Passo Simplificado:**
1. Pedido no aplicativo ➔ 2. Cotação transparente em até 2h ➔ 3. Pagamento seguro (MC Express / IBAN) ➔ 4. Compra e inspeção física em Luanda ➔ 5. Cabotagem marítima ou aérea com rastreio ➔ 6. Desembarque e entrega garantida em Cabinda.`,
    suggestedNextQuestions: ['Como fazer um pedido?', 'Quais são os prazos de entrega?', 'Quais as taxas e comissões?'],
    actionLink: {
      label: 'Fazer Novo Pedido',
      view: 'fazer-pedido',
      icon: '🛒'
    }
  },
  {
    id: 'como-fazer-pedido',
    category: 'pedidos',
    keywords: ['fazer pedido', 'comprar', 'encomendar', 'pedir intermediacao', 'solicitar compra', 'novo pedido', 'adquirir'],
    question: 'Como faço um novo pedido ou encomenda no aplicativo?',
    shortAnswer: 'Acesse o menu "Pedir Nova Intermediação", preencha o nome do produto, quantidade, loja ou fornecedor e anexe fotos se tiver.',
    detailedAnswer: `Para realizar um pedido no aplicativo é muito simples e rápido:

1. Toque no menu **"Pedir Nova Intermediação"** (ou escolha um artigo no **"Mercado de Fornecedores"**).
2. Indique o **nome do produto**, quantidade pretendida e, se souber, o nome da loja ou fornecedor em Luanda (ex: Topack, Kero, Martal, lojas do Kikolo, etc.).
3. Pode anexar fotos do artigo ou ficheiros de especificações.
4. Escolha se prefere **levantamento no balcão de Cabinda** ou **entrega ao domicílio**.
5. Clique em **"Criar Cotação / Pedido"**.
6. A nossa equipa analisa em menos de 2 horas úteis e emite o orçamento para a sua aprovação!`,
    suggestedNextQuestions: ['Como pagar a fatura?', 'Quais os métodos de pagamento aceites?', 'Como acompanhar o rastreio?'],
    actionLink: {
      label: 'Ir para Pedir Intermediação',
      view: 'fazer-pedido',
      icon: '📝'
    }
  },
  {
    id: 'prazos-entrega',
    category: 'prazos',
    keywords: ['prazo', 'tempo', 'demora', 'quanto tempo', 'dias', 'quando chega', 'velocidade', 'urgente', 'maritimo', 'aereo'],
    question: 'Quais são os prazos de entrega de Luanda para Cabinda?',
    shortAnswer: 'Frete Marítimo de Cabotagem: 3 a 7 dias úteis. Frete Aéreo TAAG Cargo: 24 a 48 horas úteis.',
    detailedAnswer: `Os prazos de entrega dependem da modalidade de transporte escolhida:

🚢 **Frete Marítimo de Cabotagem (Económico e Cargas Pesadas):**
- Prazo estimado: **3 a 7 dias úteis** após a compra e embarque no Porto de Luanda.
- Ideal para: Materiais de construção, recipientes industriais, eletrodomésticos grandes, móveis e cargas volumosas.

✈️ **Frete Aéreo TAAG Cargo Express (Urgências):**
- Prazo estimado: **24 a 48 horas úteis** após a recepção no armazém de Luanda.
- Ideal para: Telemóveis, computadores, peças sobressalentes urgentes, medicamentos e documentos.

🛠️ **Serviços de Serralharia e Fabricação:**
- Prazo estimado: **2 a 5 dias úteis** consoante a complexidade da obra metálica.`,
    suggestedNextQuestions: ['Como rastrear a minha carga?', 'Quais são as taxas de frete?', 'Onde fica o armazém em Cabinda?'],
    actionLink: {
      label: 'Acompanhar Encomendas',
      view: 'acompanhar-pedido',
      icon: '🚚'
    }
  },
  {
    id: 'formas-pagamento',
    category: 'pagamentos',
    keywords: ['pagamento', 'pagar', 'como pagar', 'multicaixa express', 'iban', 'transferencia', 'dinheiro', 'conta bancaria', 'fatura', 'recibo'],
    question: 'Quais são as formas de pagamento aceites?',
    shortAnswer: 'Aceitamos Multicaixa Express, Transferência Bancária oficial (IBAN AO06) e pagamento presencial no Balcão de Cabinda.',
    detailedAnswer: `Disponibilizamos métodos de pagamento práticos e 100% seguros com emissão automática de fatura pro-forma e recibo fiscal:

📱 **Multicaixa Express (MC Express):**
- Pagamento imediato através de referência ou número de telemóvel associado ao Multicaixa Express.

🏦 **Transferência Bancária / Depósito (IBAN):**
- Transferência direta para a conta corporativa oficial do **Mediador Cabinda Lda** (coordenadas bancárias emitidas na fatura pro-forma sob formato AO06).
- Basta carregar o comprovativo de transferência na aba *"Pagamentos"* para validação imediata.

🏢 **Presencial no Balcão:**
- Pode liquidar por TPA Multicaixa diretamente no nosso Balcão de Atendimento em Cabinda (Armazém C-4, Porto de Cabinda).

*Nota: Todas as transações têm garantia de reembolso e emissão de fatura conforme a legislação fiscal da AGT.*`,
    suggestedNextQuestions: ['Como ver a minha fatura?', 'As faturas têm validação fiscal da AGT?', 'Quais as taxas do Mediador?'],
    actionLink: {
      label: 'Ver Faturas e Pagamentos',
      view: 'pagamentos',
      icon: '💳'
    }
  },
  {
    id: 'taxas-comissoes',
    category: 'taxas',
    keywords: ['taxa', 'comissao', 'quanto custa', 'preco', 'percentagem', 'valor', 'aduana', 'agt', 'imposto', 'frete'],
    question: 'Quais são as taxas cobradas pelo Mediador Cabinda?',
    shortAnswer: 'Comissão de intermediação entre 10% e 15% do valor da mercadoria, além do frete real de transporte e taxa de despacho aduaneiro.',
    detailedAnswer: `A nossa política de preços é 100% transparente, discriminada em cada orçamento:

1. **Preço Base da Mercadoria:** O valor exato cobrado pela loja/fornecedor em Luanda (com comprovativo de fatura).
2. **Taxa de Intermediação Comercial (Comissão):** Varia entre **10% e 15%** consoante a categoria e volume da encomenda (cobre a compra física, fiscalização técnica, embalamento e proteção).
3. **Frete de Transporte:** Calculado pelo peso/volume (kg ou m³) em transporte marítimo de cabotagem ou transporte aéreo.
4. **Taxa de Despacho Aduaneiro / Guia AGT:** Taxa fixa de emissão e desembaraço da Guia de Trânsito para circulação sem entraves fiscais entre províncias.

*Não há custos ocultos. Tudo é discriminado na Fatura Pro-forma antes de você pagar!*`,
    suggestedNextQuestions: ['Como funciona a garantia de reembolso?', 'Como fazer um pedido?', 'Como falar com o suporte?'],
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
    question: 'Como é criado o código de rastreio e como o cliente pode rastrear a mercadoria?',
    shortAnswer: 'O código único MED-XXXX é gerado automaticamente ao criar o pedido. O cliente insere o código no app ou WhatsApp para ver as 9 etapas em tempo real.',
    detailedAnswer: `O sistema de rastreamento do **Mediador Cabinda Lda** funciona de forma 100% automatizada e transparente:

🔖 **1. Como é Criado o Código de Rastreio:**
• Assim que o pedido é submetido pelo cliente ou registado pelo gestor no sistema, é gerado automaticamente um código único e padronizado: **MED-XXXX** (ex: **MED-1001**, **MED-8492**).
• Quando a carga é entregue ao armador marítimo ou aéreo no Porto de Luanda, o gestor associa a **Guia de Trânsito AGT** (ex: **GUI-CB-84920**).

📲 **2. Como o Código é Entregue ao Cliente:**
• **Diretamente no App:** O cliente visualiza o código no ecrã de confirmação e na aba *"Acompanhar Pedidos"*.
• **Por WhatsApp / SMS com 1 Clique:** O gestor tem um botão *"📲 Partilhar Rastreio (WhatsApp)"* que envia uma mensagem oficial padronizada para o WhatsApp do cliente com o código, a transportadora, o estado atual e as instruções.

🔍 **3. Como o Cliente Rastreia a Mercadoria:**
1. **Aba "Acompanhar Pedidos":** Basta digitar ou colar o código **MED-XXXX** ou o número da Guia AGT na barra de pesquisa rápida para ver o lote instantaneamente.
2. **As 9 Etapas em Tempo Real:** 
   1. *Recebido* ➔ 2. *Análise* ➔ 3. *Orçado* ➔ 4. *Pago* ➔ 5. *Comprado em Luanda* ➔ 6. *Em Trânsito (Marítimo/Aéreo)* ➔ 7. *Chegou a Cabinda* ➔ 8. *Pronto Levantamento no Armazém C-4* ➔ 9. *Entregue com Sucesso*.
3. **Assistente Virtual 24/7:** O cliente pode perguntar no chat *"Onde está a minha encomenda MED-1001?"* e o bot responde com a localização e prazo estimado!
4. **Notificações Automáticas:** O cliente recebe alertas sonoros e no telemóvel a cada avanço de etapa.`,
    suggestedNextQuestions: ['Onde fica o balcão de levantamento?', 'Quanto tempo demora a viagem marítima?', 'Quais são as taxas de frete?'],
    actionLink: {
      label: 'Rastrear Encomenda Agora',
      view: 'acompanhar-pedido',
      icon: '📍'
    }
  },
  {
    id: 'servicos-serralharia',
    category: 'servicos',
    keywords: ['servico', 'serralharia', 'oficina', 'ferro', 'portao', 'grade', 'soldadura', 'tanque', 'metalica', 'reparacao', 'corte'],
    question: 'Como solicitar serviços de serralharia e fabricação metálica?',
    shortAnswer: 'Acesse o menu "Solicitar Serviço", selecione a categoria de trabalho metálico/serralharia e envie as medidas pretendidas.',
    detailedAnswer: `O Mediador Cabinda conta com oficinas homologadas parceiras para execução e intermediação de serviços técnicos e industriais:

🛠️ **Serviços Disponíveis:**
- Fabrico de Portões Automáticos e Manuais
- Grades de Proteção e Pantográficas Metálicas
- Estruturas e Coberturas Metálicas para Armazéns
- Fabricação e Soldadura de Tanques e Cisternas
- Corte Industrial, Quinagem e Caldeiraria
- Manutenção e Reparação Técnica

Para solicitar: Toque em **"Solicitar Serviço"**, escolha a especialidade, descreva as medidas e morada de execução. Os técnicos emitem a proposta orçamental em até 12 horas úteis!`,
    suggestedNextQuestions: ['Qual o prazo de execução das obras?', 'Como pagar os serviços?', 'Como funciona a fiscalização do Mediador?'],
    actionLink: {
      label: 'Ver Catálogo de Serviços',
      view: 'solicitar-servico',
      icon: '🛠️'
    }
  },
  {
    id: 'armazens-balcoes',
    category: 'armazens',
    keywords: ['armazem', 'balcao', 'onde fica', 'endereco', 'morada', 'localizacao', 'porto de cabinda', 'luanda', 'recolha', 'levantamento'],
    question: 'Onde ficam localizados os armazéns e balcões de atendimento?',
    shortAnswer: 'Cabinda: Armazém C-4 no Recinto do Porto de Cabinda. Luanda: Parque Logístico Portuário / Viana.',
    detailedAnswer: `Temos pontos estratégicos de receção e distribuição:

🏢 **Balcão de Atendimento e Distribuição (Cabinda):**
- **Localização:** Armazém C-4, Recinto do Porto Comercial de Cabinda, Rua Direita, Província de Cabinda.
- **Serviços:** Levantamento de cargas, emissão de faturas, atendimento presencial e reclamações.

🏭 **Armazém Central de Consolidação (Luanda):**
- **Localização:** Parque Logístico Portuário / Viana, Luanda.
- **Serviços:** Receção de fornecedores, conferência de artigos, paletização, embalamento e embarque aduaneiro.`,
    suggestedNextQuestions: ['Qual o horário de funcionamento?', 'Quais os contactos de WhatsApp?', 'Como solicitar entrega ao domicílio?'],
    actionLink: {
      label: 'Sobre Nós e Localizações',
      view: 'sobre-nos',
      icon: '🏢'
    }
  },
  {
    id: 'horarios-contactos',
    category: 'horarios',
    keywords: ['horario', 'hora', 'fechado', 'aberto', 'contacto', 'telefone', 'whatsapp', 'falar com humano', 'atendimento', 'suporte'],
    question: 'Quais são os horários de funcionamento e contactos de suporte?',
    shortAnswer: 'Atendimento Humano: Seg-Sex das 08h00 às 18h00, Sáb das 08h00 às 13h00. Chatbot IA: 24 horas por dia, 7 dias por semana.',
    detailedAnswer: `Estamos sempre disponíveis para si:

🕒 **Horário de Atendimento Humano / Balcão:**
- **Segunda a Sexta-feira:** 08h00 às 18h00
- **Sábados:** 08h00 às 13h00
- **Domingos e Feriados:** Fechado (Atendimento de emergência via Chatbot IA 24/7)

🤖 **Assistente Virtual Inteligente (IA):**
- **Disponível 24/7:** Responde imediatamente a dúvidas sobre pedidos, pagamentos, rastreio e funcionamento mesmo fora do horário de expediente!

📞 **Canais de Contacto Direto:**
- **WhatsApp de Suporte:** +244 942 043 293 / +244 945 888 777
- **E-mail Central:** suporte@mediadorcabinda.ao
- **Chat no Aplicativo:** Menu *"Mensagens e Suporte"*`,
    suggestedNextQuestions: ['Falar com operador no WhatsApp', 'Como abrir uma reclamação?', 'Como fazer um pedido?'],
    actionLink: {
      label: 'Abrir Chat de Suporte',
      view: 'suporte',
      icon: '💬'
    }
  },
  {
    id: 'garantia-reembolso',
    category: 'garantia',
    keywords: ['garantia', 'reembolso', 'devolucao', 'seguro', 'extravio', 'avaria', 'estragou', 'partiu', 'seguranca', 'confiavel'],
    question: 'Qual é a garantia caso a mercadoria seja avariada ou extraviada?',
    shortAnswer: 'Garantia de 100% de reembolso ou reposição integral do produto em caso de avaria no transporte marítimo ou extravio.',
    detailedAnswer: `No Mediador Cabinda o seu dinheiro e o seu património estão 100% seguros:

🛡️ **Política de Garantia Total:**
- **Seguro de Carga Integrado:** Todas as cargas despachadas via cabotagem marítima ou aérea possuem cobertura contra perdas e avarias.
- **Inspeção Pré-Embarque:** Tiramos fotos e verificamos a integridade do produto antes de sair de Luanda.
- **Reembolso Integral de 100%:** Em caso comprovado de dano estrutural durante a travessia marítima ou extravio nos armazéns, você tem direito a reembolso monetário imediato ou reposição da mercadoria sem qualquer custo adicional.

Para submeter uma ocorrência, acesse o menu **"Reclamações & Reembolso"** no aplicativo.`,
    suggestedNextQuestions: ['Como submeter uma reclamação?', 'Como funciona o desembaraço aduaneiro?', 'Quais os contactos de emergência?'],
    actionLink: {
      label: 'Portal de Reclamações',
      view: 'reclamacoes',
      icon: '🛡️'
    }
  },
  {
    id: 'instalacao-apk',
    category: 'apk',
    keywords: ['apk', 'instalar', 'celular', 'telefone', 'android', 'baixar', 'download', 'aplicativo', 'app', 'github', 'zip'],
    question: 'Como posso instalar o aplicativo no telemóvel Android ou iPhone?',
    shortAnswer: 'Pode instalar diretamente pelo navegador usando "Adicionar ao Ecrã Principal" (PWA) ou gerar o APK Android do projeto.',
    detailedAnswer: `Pode usar e instalar o Mediador Cabinda no seu telemóvel de duas maneiras práticas:

📱 **1. Instalação Instantânea PWA (Recomendada - Não gasta memória):**
- Abra o site no navegador do telemóvel (Google Chrome no Android ou Safari no iPhone).
- Toque nos três pontinhos do navegador ou no botão de partilha.
- Selecione **"Adicionar ao Ecrã Principal"** (ou *"Instalar Aplicativo"*).
- O ícone do Mediador Cabinda aparecerá no ecrã do seu telefone funcionando exatamente como um app nativo, mesmo com internet lenta!

📦 **2. Formato APK para Android:**
- O projeto pode ser compilado em APK através do arquivo de exportação (ZIP / GitHub) utilizando ferramentas como **Capacitor**, **Cordova** ou **Android Studio / Webview**.`,
    suggestedNextQuestions: ['Como funciona o Mediador Cabinda?', 'Como fazer um pedido?', 'Como contactar o suporte?'],
    actionLink: {
      label: 'Ir para Início',
      view: 'inicio',
      icon: '🏠'
    }
  }
];

export const POPULAR_QUESTIONS = [
  'Como funciona o Mediador Cabinda?',
  'Quais são os prazos de entrega para Cabinda?',
  'Como pagar por Multicaixa Express ou IBAN?',
  'Quais são as taxas de comissão e frete?',
  'Como rastrear a minha carga?',
  'Onde fica o armazém em Cabinda?',
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
      text: `Olá! Sou o **Assistente Virtual 24/7 do Mediador Cabinda**! 🤖🇦🇴

Estou aqui a qualquer hora (durante o expediente ou quando estamos encerrados) para esclarecer todas as suas dúvidas sobre:
• Como encomendar produtos de Luanda para Cabinda
• Prazos de entrega marítima e aérea
• Métodos de pagamento (Multicaixa Express e IBAN)
• Rastreamento de cargas (MED-XXXX)
• Taxas de comissão e desembaraço aduaneiro
• Serviços de serralharia e oficinas

Como posso ajudá-lo hoje?`,
      suggestedQuestions: [
        'Como funciona a intermediação?',
        'Quais os prazos de entrega?',
        'Como fazer um pedido agora?',
        'Quais as formas de pagamento?'
      ],
      actionLink: {
        label: 'Fazer Pedido',
        view: 'fazer-pedido',
        icon: '🛒'
      }
    };
  }

  // 2. Check for human operator / WhatsApp requests
  if (/(falar com humano|atendente|operador|pessoa real|falar com alguem|gerente|whatsapp|telefone)/i.test(normalized)) {
    return {
      text: `Com certeza! Se preferir falar diretamente com um dos nossos agentes ou operadores humanos:

📞 **Contacto Telefónico & WhatsApp Oficial:**
• **WhatsApp Geral:** [+244 942 043 293](https://wa.me/244942043293)
• **Despacho Portuário / Urgências:** [+244 945 888 777](https://wa.me/244945888777)

🕒 **Horário de Atendimento Humano:**
• Segunda a Sexta: 08h00 às 18h00
• Sábado: 08h00 às 13h00

*Se estiver fora do horário de atendimento, pode deixar a sua mensagem no WhatsApp ou no chat do aplicativo que responderemos assim que abrirmos!*`,
      suggestedQuestions: [
        'Onde fica o balcão em Cabinda?',
        'Qual o horário de funcionamento?',
        'Como rastrear a minha encomenda?'
      ],
      actionLink: {
        label: 'Abrir Chat de Suporte',
        view: 'suporte',
        icon: '💬'
      }
    };
  }

  // 3. Score all knowledge base items based on keywords matching
  let bestMatch: FAQItem | null = null;
  let highestScore = 0;

  for (const item of KNOWLEDGE_BASE_ITEMS) {
    let score = 0;
    
    // Check keywords
    for (const kw of item.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        score += kw.length * 3;
      }
    }

    // Check words in question
    const qWords = item.question.toLowerCase().split(/\s+/);
    for (const w of qWords) {
      if (w.length > 3 && normalized.includes(w)) {
        score += 4;
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

  // 4. Default fallback with helpful guidance
  return {
    text: `Entendi a sua pergunta sobre **"${userQuery}"**.

O **Mediador Cabinda** é o seu parceiro seguro de compras e logística entre Luanda e Cabinda. Cuidamos da compra fiscal de qualquer mercadoria em Luanda, despachamos via cabotagem marítima oficial ou voo TAAG Cargo e entregamos em Cabinda com garantia total.

Escolha um dos tópicos rápidos abaixo ou toque em **"Falar no WhatsApp"** para atendimento personalizado com a nossa equipa!`,
    suggestedQuestions: [
      'Como funciona o Mediador Cabinda?',
      'Quais são os prazos de entrega?',
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
