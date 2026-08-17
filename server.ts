/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), 'server-data.json');

// In-memory synchronized state
let serverState: {
  clients: any[];
  orders: any[];
  messages: any[];
  suppliers: any[];
  supplierProducts: any[];
  supplierServices: any[];
  serviceRequests: any[];
  collaborators: any[];
  collaboratorSales: any[];
  notifications: any[];
  logisticsConfig: any;
  lastUpdated: number;
} = {
  clients: [],
  orders: [],
  messages: [],
  suppliers: [],
  supplierProducts: [],
  supplierServices: [],
  serviceRequests: [],
  collaborators: [],
  collaboratorSales: [],
  notifications: [],
  logisticsConfig: null,
  lastUpdated: Date.now()
};

// Load saved data from disk if exists
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    serverState = { ...serverState, ...parsed, lastUpdated: Date.now() };
    console.log(`[Sync] Loaded persistent database from ${DATA_FILE} (${serverState.orders.length} orders, ${serverState.clients.length} clients)`);
  }
} catch (err) {
  console.warn('[Sync] Failed to read server-data.json, starting with fresh in-memory database:', err);
}

function persistServerState() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(serverState, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Sync] Error saving state to disk:', err);
  }
}

// Lazy initialization for Gemini AI SDK
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

const BASE_SYSTEM_INSTRUCTION = `Você é o Assistente Virtual Oficial e Inteligente 24/7 do Mediador Cabinda Lda (Angola).
Sua missão é atender clientes, parceiros e empresários com o mais alto nível de profissionalismo, maturidade, clareza, cortesia executiva e precisão em português de Angola.

=========================================================================
REGRA PRINCIPAL DA IA - CONFIABILIDADE ABSOLUTA E NÃO INVENTAR DADOS
=========================================================================
1. A IA do Mediador-Cabinda deve responder às perguntas dos clientes com base exclusivamente nas informações oficiais cadastradas no sistema pela administração.
2. A IA NÃO DEVE INVENTAR INFORMAÇÕES. NUNCA adicione fatos, preços, prazos, taxas ou serviços que não foram solicitados ou cadastrados.
3. Responda ESTRITAMENTE ao que o utilizador perguntou. Não adicione opiniões, garantias ou textos não solicitados.
4. Quando uma informação não estiver cadastrada, estiver desatualizada, depender de uma análise específica da carga ou envolver uma decisão da empresa, a IA deve informar claramente ao cliente que precisa consultar a equipa ou um atendente humano.
5. A IA NUNCA DEVE INVENTAR:
   - preços;
   - prazos de entrega;
   - taxas;
   - seguros;
   - valores de indemnização;
   - documentos obrigatórios;
   - responsabilidades legais;
   - condições de transporte;
   - disponibilidade de transporte;
   - códigos de rastreio;
   - moradas ou contactos;
   - regras fiscais ou aduaneiras.

=========================================================================
DIRETRIZES ESPECÍFICAS PARA AS 12 QUESTÕES FUNDAMENTAIS:
=========================================================================

1. Qual é o prazo exato de entrega para a província de destino?
   - O prazo de entrega depende da rota, do tipo de transporte e das condições definidas para a sua carga.
   - Quando o prazo oficial estiver cadastrado no sistema, informe o cliente com base nesse dado.
   - Se o sistema não tiver um prazo oficial para aquela rota específica, responda obrigatoriamente:
     «“O prazo exato para esta rota precisa de ser confirmado pela nossa equipa. Por favor, consulte um atendente humano para obter a previsão correta. Não queremos fornecer uma estimativa que possa estar incorreta.”»
   - A IA não deve inventar um número de dias.

2. Os valores incluem taxas de retirada e entrega ao domicílio ou só de armazém para armazém?
   - Isso depende da tarifa e do serviço contratado.
   - Se o sistema tiver essa informação, a IA deve informar claramente se o preço inclui: retirada no local, transporte, entrega ao domicílio, levantamento no armazém/balcão ou outras taxas.
   - Se não houver informação cadastrada:
     «“A inclusão das taxas de retirada e entrega ao domicílio depende do serviço contratado. Para confirmar o que está incluído no seu valor, consulte a nossa equipa ou um atendente humano.”»
   - A IA não deve presumir que a entrega ao domicílio está incluída.

3. Existe cobrança por peso ou por volume (cubagem)?
   - A forma de cálculo depende da tabela de preços e das regras da transportadora.
   - Quando houver uma regra cadastrada, a IA deve explicar se o cálculo é feito por peso, por volume/cubagem, por quantidade de volumes, ou por uma combinação desses critérios.
   - Se não houver regra cadastrada:
     «“O método de cálculo para esta carga precisa de ser confirmado pela nossa equipa. Um atendente poderá verificar o peso, as dimensões e o tipo de mercadoria para determinar o valor correto.”»
   - A IA não deve calcular um preço sem possuir os dados e a tabela oficial.

4. Há taxas ocultas, como armazenagem se a carga demorar a ser retirada?
   - A IA deve informar somente as taxas oficialmente cadastradas.
   - Se existir uma taxa de armazenagem, deve informar: quando começa a ser cobrada, valor ou método de cálculo e condições aplicáveis.
   - Se não houver informação oficial:
     «“Não tenho informação oficial cadastrada sobre eventual cobrança de armazenagem para este caso. Para evitar fornecer uma informação incorreta, consulte a nossa equipa ou um atendente humano.”»
   - A IA nunca deve afirmar que não existem taxas adicionais sem que essa informação esteja oficialmente cadastrada.

5. A agência oferece seguro de carga contra roubo, perda ou danos?
   - Se houver seguro cadastrado no sistema, a IA deve explicar as condições oficiais da cobertura.
   - Se a informação não estiver cadastrada:
     «“As condições de seguro da carga precisam de ser confirmadas pela nossa equipa. Por favor, consulte um atendente humano antes de efetuar o envio.”»
   - A IA não deve afirmar que todas as cargas estão seguradas sem confirmação oficial.

6. O seguro já está incluso no valor do frete ou precisa ser pago à parte?
   - A IA deve consultar a tarifa e as condições oficiais cadastradas.
   - Se o sistema informar que o seguro está incluído, deve explicar essa condição.
   - Se o seguro for adicional, deve informar o valor ou método de cálculo, quando essa informação estiver cadastrada.
   - Se não houver informação:
     «“Não tenho informação suficiente para confirmar se o seguro está incluído no valor do frete ou se é cobrado separadamente. Consulte a nossa equipa antes de contratar o serviço.”»

7. Qual é o procedimento e prazo para receber o reembolso se a mercadoria chegar danificada?
   - Quando existir uma política oficial cadastrada, a IA pode informar: como apresentar a reclamação, documentos necessários, prazo para comunicar o dano, procedimento de análise, prazo de processamento e condições para eventual indemnização ou reembolso.
   - Se essas informações não estiverem cadastradas:
     «“O procedimento e o prazo para eventual reembolso ou indemnização dependem da política aplicável à carga. Para obter uma resposta correta, consulte um atendente humano.”»
   - A IA nunca deve prometer um valor ou prazo de reembolso.

8. Como funciona o transporte de itens frágeis ou perecíveis?
   - A IA deve informar as regras oficiais cadastradas para produtos frágeis ou perecíveis (se é aceito, requisitos de embalagem, identificação da carga, condições especiais, taxas e limitações).
   - Se não houver informação:
     «“O transporte de produtos frágeis ou perecíveis pode depender de condições específicas. Para confirmar se a sua mercadoria pode ser transportada e quais cuidados são necessários, consulte a nossa equipa.”»
   - A IA não deve garantir que um produto será aceite sem confirmação oficial.

9. É possível rastrear a carga em tempo real durante a viagem?
   - Se o sistema possuir rastreamento, a IA deve informar o cliente sobre: código de rastreio, estado atual, última atualização, localização disponível e data/hora da atualização.
   - A IA deve deixar claro que "rastreamento" só pode ser considerado em tempo real se o sistema realmente fornecer essa informação em tempo real.
   - Se não houver rastreamento em tempo real:
     «“O nosso sistema não possui informação suficiente para confirmar rastreamento em tempo real desta carga. Consulte a nossa equipa para saber como acompanhar o envio.”»
   - A IA nunca deve inventar uma localização ou um estado da carga.

10. Quem é o responsável legal se houver blitz policial ou retenção fiscal na estrada?
    - Esta é uma questão que pode envolver legislação, documentação, transportadora, remetente, destinatário e circunstâncias específicas da carga. A IA não deve dar uma conclusão jurídica própria.
    - Resposta obrigatória:
      «“A responsabilidade em caso de fiscalização, retenção ou intervenção das autoridades depende das circunstâncias da carga, da documentação apresentada e das responsabilidades definidas entre as partes. Para uma orientação correta sobre este caso, consulte a nossa equipa ou um atendente humano.”»
    - Se houver uma política ou orientação jurídica oficial cadastrada pela empresa, a IA pode reproduzir essa informação, deixando claro que se trata da política oficial da empresa.

11. Quais são os documentos necessários que o remetente e o destinatário devem apresentar?
    - A IA deve informar somente os documentos oficialmente definidos para o serviço e tipo de mercadoria.
    - Se os documentos variarem conforme a mercadoria ou rota, ou não estiverem cadastrados:
      «“Os documentos necessários podem variar de acordo com o tipo de carga e o destino. Para confirmar exatamente quais documentos são necessários para o seu envio, consulte a nossa equipa.”»
    - A IA não deve inventar documentos obrigatórios.

12. A empresa emite nota fiscal ou recibo de transporte válido?
    - A IA deve responder apenas com base na configuração oficial da empresa (tipo de documento, momento da emissão, como recebe).
    - Se não houver informação:
      «“Não tenho informação oficial cadastrada para confirmar qual documento de transporte é emitido neste serviço. Consulte um atendente humano para confirmar.”»
    - A IA não deve afirmar que determinado documento possui validade fiscal ou legal sem que essa informação esteja oficialmente confirmada pela empresa.

=========================================================================
REGRA DE ESCALONAMENTO PARA ATENDENTE HUMANO
=========================================================================
Sempre que a IA não possuir informação oficial suficiente, deverá encaminhar o cliente para a equipa com a mensagem:
«“Para lhe dar uma informação correta e evitar fornecer um valor ou condição incorreta, preciso que esta questão seja confirmada pela nossa equipa. Por favor, fale com um atendente humano.”»

A IA deve encaminhar OBRIGATORIAMENTE para um humano nos seguintes 12 casos:
1. O preço não estiver definido no sistema.
2. O prazo da rota não estiver definido.
3. Houver dúvida sobre taxas adicionais.
4. Houver dúvida sobre seguro ou indemnização.
5. A carga estiver danificada, perdida ou extraviada.
6. Existir uma reclamação formal.
7. Houver retenção policial ou fiscal.
8. A questão envolver interpretação jurídica.
9. A mercadoria for especial, perigosa, frágil ou perecível e as regras não estiverem cadastradas.
10. O cliente solicitar uma exceção às regras da empresa.
11. O cliente contestar uma cobrança.
12. O sistema não possuir dados suficientes para responder com segurança.

Contactos oficiais para encaminhamento:
- WhatsApp / Chamadas Unitel: +244 942 043 293
- Chamadas Movicel: +244 998 100 940
- E-mail: equipemediadorcabindacabinda@gmail.com

=========================================================================
PRINCÍPIO FUNDAMENTAL
=========================================================================
É melhor a IA dizer “não tenho informação suficiente, vou encaminhar para a nossa equipa” do que fornecer uma resposta inventada.
A IA do Mediador-Cabinda deve ser útil, mas também deve reconhecer os limites daquilo que pode confirmar.
Nunca inventar. Nunca prometer sem autorização. Nunca apresentar uma estimativa como se fosse um dado oficial.

PILAR ESTRATÉGICO E ESTRUTURA DO MEDIADOR CABINDA:
- Fundador: João Hilário António
- Solução: Ponte comercial e operacional segura entre Luanda e Cabinda (e vice-versa).
- Fluxo em 6 Passos: 1. Solicitação ➔ 2. Orçamento Transparente ➔ 3. Pagamento Seguro ➔ 4. Vistoria & Compra em Luanda ➔ 5. Guia AGT & Embarque (Aéreo/Marítimo) ➔ 6. Desembarque & Entrega em Cabinda.
- Formas de Pagamento: MC Express (942043293) | IBAN (AO06 0006 0000 01307638301 95).
- Ambas as rotas suportadas: Luanda ➔ Cabinda e Cabinda ➔ Luanda.`;

async function startServer() {
  const app = express();

  // CORS middleware for cross-origin multi-device requests (Google Drive webviews, mobile browsers, preview URLs)
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      service: 'Mediador Cabinda API', 
      timestamp: new Date().toISOString(),
      ordersCount: serverState.orders?.length || 0,
      clientsCount: serverState.clients?.length || 0,
      aiConfigured: Boolean(process.env.GEMINI_API_KEY)
    });
  });

  // 1.1 Real-time cross-device Synchronization Endpoints
  // GET full or delta database state
  app.get('/api/sync/state', (req, res) => {
    res.json({
      success: true,
      data: serverState,
      timestamp: Date.now()
    });
  });

  // POST full or partial bulk state
  app.post('/api/sync/bulk', (req, res) => {
    try {
      const payload = req.body || {};
      if (Array.isArray(payload.clients)) {
        const clientMap = new Map(serverState.clients.map(c => [c.id, c]));
        payload.clients.forEach((c: any) => { if (c && c.id) clientMap.set(c.id, { ...clientMap.get(c.id), ...c }); });
        serverState.clients = Array.from(clientMap.values());
      }
      if (Array.isArray(payload.orders)) {
        const orderMap = new Map(serverState.orders.map(o => [o.id, o]));
        payload.orders.forEach((o: any) => { if (o && o.id) orderMap.set(o.id, { ...orderMap.get(o.id), ...o }); });
        serverState.orders = Array.from(orderMap.values());
      }
      if (Array.isArray(payload.messages)) {
        const msgMap = new Map(serverState.messages.map(m => [m.id, m]));
        payload.messages.forEach((m: any) => { if (m && m.id) msgMap.set(m.id, { ...msgMap.get(m.id), ...m }); });
        serverState.messages = Array.from(msgMap.values());
      }
      if (Array.isArray(payload.suppliers) && payload.suppliers.length > 0) {
        serverState.suppliers = payload.suppliers;
      }
      if (Array.isArray(payload.supplierProducts) && payload.supplierProducts.length > 0) {
        serverState.supplierProducts = payload.supplierProducts;
      }
      if (Array.isArray(payload.supplierServices) && payload.supplierServices.length > 0) {
        serverState.supplierServices = payload.supplierServices;
      }
      if (Array.isArray(payload.serviceRequests)) {
        const reqMap = new Map(serverState.serviceRequests.map(r => [r.id, r]));
        payload.serviceRequests.forEach((r: any) => { if (r && r.id) reqMap.set(r.id, { ...reqMap.get(r.id), ...r }); });
        serverState.serviceRequests = Array.from(reqMap.values());
      }
      if (Array.isArray(payload.collaborators) && payload.collaborators.length > 0) {
        serverState.collaborators = payload.collaborators;
      }
      if (Array.isArray(payload.collaboratorSales)) {
        const salesMap = new Map(serverState.collaboratorSales.map(s => [s.id, s]));
        payload.collaboratorSales.forEach((s: any) => { if (s && s.id) salesMap.set(s.id, { ...salesMap.get(s.id), ...s }); });
        serverState.collaboratorSales = Array.from(salesMap.values());
      }
      if (Array.isArray(payload.notifications)) {
        const notifMap = new Map(serverState.notifications.map(n => [n.id, n]));
        payload.notifications.forEach((n: any) => { if (n && n.id) notifMap.set(n.id, { ...notifMap.get(n.id), ...n }); });
        serverState.notifications = Array.from(notifMap.values());
      }
      if (payload.logisticsConfig) {
        serverState.logisticsConfig = payload.logisticsConfig;
      }
      serverState.lastUpdated = Date.now();
      persistServerState();
      return res.json({ success: true, lastUpdated: serverState.lastUpdated, data: serverState });
    } catch (err: any) {
      console.error('[Sync] Bulk sync error:', err);
      return res.status(500).json({ error: 'Falha ao sincronizar dados no servidor.' });
    }
  });

  // POST create or update an order
  app.post('/api/sync/order', (req, res) => {
    try {
      const order = req.body;
      if (!order || !order.id) {
        return res.status(400).json({ error: 'Pedido inválido (ID obrigatório).' });
      }
      const existingIdx = serverState.orders.findIndex(o => o.id === order.id);
      if (existingIdx >= 0) {
        serverState.orders[existingIdx] = { ...serverState.orders[existingIdx], ...order };
      } else {
        serverState.orders.unshift(order);
      }
      serverState.lastUpdated = Date.now();
      persistServerState();
      console.log(`[Sync] Order synced: ${order.id} (${order.productName || 'Sem nome'}) for client ${order.clientName || order.clientId}`);
      return res.json({ success: true, order, lastUpdated: serverState.lastUpdated });
    } catch (err: any) {
      console.error('[Sync] Order sync error:', err);
      return res.status(500).json({ error: 'Falha ao sincronizar pedido.' });
    }
  });

  // POST create or update a client
  app.post('/api/sync/client', (req, res) => {
    try {
      const client = req.body;
      if (!client || !client.id) {
        return res.status(400).json({ error: 'Cliente inválido (ID obrigatório).' });
      }
      const existingIdx = serverState.clients.findIndex(c => c.id === client.id);
      if (existingIdx >= 0) {
        serverState.clients[existingIdx] = { ...serverState.clients[existingIdx], ...client };
      } else {
        serverState.clients.push(client);
      }
      serverState.lastUpdated = Date.now();
      persistServerState();
      console.log(`[Sync] Client synced: ${client.id} - ${client.name} (${client.phone})`);
      return res.json({ success: true, client, lastUpdated: serverState.lastUpdated });
    } catch (err: any) {
      console.error('[Sync] Client sync error:', err);
      return res.status(500).json({ error: 'Falha ao sincronizar cliente.' });
    }
  });

  // POST append or update a message
  app.post('/api/sync/message', (req, res) => {
    try {
      const message = req.body;
      if (!message || !message.id) {
        return res.status(400).json({ error: 'Mensagem inválida (ID obrigatório).' });
      }
      const existingIdx = serverState.messages.findIndex(m => m.id === message.id);
      if (existingIdx >= 0) {
        serverState.messages[existingIdx] = { ...serverState.messages[existingIdx], ...message };
      } else {
        serverState.messages.push(message);
      }
      serverState.lastUpdated = Date.now();
      persistServerState();
      return res.json({ success: true, message, lastUpdated: serverState.lastUpdated });
    } catch (err: any) {
      console.error('[Sync] Message sync error:', err);
      return res.status(500).json({ error: 'Falha ao sincronizar mensagem.' });
    }
  });

  // 2. Chatbot AI Endpoint with Dynamic Knowledge Base Injection
  app.post('/api/bot/chat', async (req, res) => {
    try {
      const { message, history, clientName, clientTier, dynamicLogisticsConfig, dynamicKnowledgeContext, attachments } = req.body;

      if ((!message || typeof message !== 'string') && (!attachments || attachments.length === 0)) {
        return res.status(400).json({ error: 'Mensagem inválida ou ausente.' });
      }

      const client = getGeminiClient();

      if (!client) {
        // Return structured knowledge-base response if Gemini key is not configured
        return res.json({
          source: 'knowledge_base',
          text: '', // Front-end knowledge base will take over
          fallback: true
        });
      }

      // Compose dynamic system instruction with live settings from Gestão
      let dynamicInstruction = BASE_SYSTEM_INSTRUCTION;

      if (dynamicLogisticsConfig && dynamicLogisticsConfig.modes) {
        const air = dynamicLogisticsConfig.modes.aereo;
        const sea = dynamicLogisticsConfig.modes.maritimo;
        const land = dynamicLogisticsConfig.modes.terrestre;

        const airDays = air?.estimatedDays || air?.averageTime || '1 dia';
        const airCost = air?.costPerKg || air?.costEstimate || '2.500 AOA / kg';
        const airDesc = air?.description || air?.recommendation || 'Urgente/eletrónicos';

        const seaDays = sea?.estimatedDays || sea?.averageTime || '2–3 dias';
        const seaCost = sea?.costPerKg || sea?.costEstimate || '450 AOA / kg';
        const seaDesc = sea?.description || sea?.recommendation || 'Grandes volumes/materiais';

        const landDays = land?.estimatedDays || land?.averageTime || '7–8 dias ou mais';
        const landCost = land?.costPerKg || land?.costEstimate || '350 AOA / kg';
        const landDesc = land?.description || land?.recommendation || 'Cargas rodoviárias';

        const fee = dynamicLogisticsConfig.intermediationFeePercentage || dynamicLogisticsConfig.intermediationFeeRate || '10% a 15%';
        const agt = dynamicLogisticsConfig.customsTransitFeeAGT || dynamicLogisticsConfig.customsTaxAGT || '8.000 AOA';
        const pickup = dynamicLogisticsConfig.pickupLocationCabinda || dynamicLogisticsConfig.pickupAddressCabinda || 'Armazém C-4, Porto de Cabinda, Rua Direita';
        const consol = dynamicLogisticsConfig.consolidationWarehouseLuanda || dynamicLogisticsConfig.consolidationAddressLuanda || 'Parque Logístico Portuário / Viana, Luanda';
        const guarantee = dynamicLogisticsConfig.guaranteeAndRefundPolicy || dynamicLogisticsConfig.warrantyAndRefundPolicy || '100% de reembolso integral ou reposição de mercadoria';
        const notice = dynamicLogisticsConfig.operationalNotice || dynamicLogisticsConfig.operationalNote || 'Prazos são estimativas médias sujeitas a condições marítimas, meteorológicas e de trânsito aduaneiro da AGT.';

        dynamicInstruction += `\n\n--- INFORMAÇÕES LOGÍSTICAS ATUAIS ATUALIZADAS PELA GESTÃO (PRIORIDADE MÁXIMA):
• Via aérea: Prazo médio: ${airDays} | Custo: ${airCost} | Indicação: ${airDesc} (Estado: ${air?.status || 'ativo'})
• Via marítima: Prazo médio: ${seaDays} | Custo: ${seaCost} | Indicação: ${seaDesc} (Estado: ${sea?.status || 'ativo'})
• Via terrestre: Prazo médio: ${landDays} | Custo: ${landCost} | Indicação: ${landDesc} (Estado: ${land?.status || 'ativo'})
• Comissão de Intermediação: ${fee}
• Taxa de Guia de Trânsito AGT: ${agt}
• Balcão de Retirada Oficial em Cabinda: ${pickup}
• Armazém de Consolidação em Luanda: ${consol}
• Garantia Oficial: ${guarantee}
• Observação Operacional: ${notice}
---`;
      }

      if (dynamicKnowledgeContext && typeof dynamicKnowledgeContext === 'string') {
        dynamicInstruction += `\n\n--- BASE DE CONHECIMENTO DINÂMICA DA GESTÃO:\n${dynamicKnowledgeContext.slice(0, 4000)}\n---`;
      }

      // Build conversation contents for Gemini 3.6 Flash
      const conversationHistory = Array.isArray(history) 
        ? history.slice(-6).map((msg: any) => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text || '' }]
          }))
        : [];

      const attachmentsNote = Array.isArray(attachments) && attachments.length > 0
        ? `\n[O cliente anexou ${attachments.length} foto(s) da galeria/dispositivo do seu próprio fornecedor ou produto: ${attachments.map((a: any) => a.name || 'foto').join(', ')}]`
        : '';

      const isAdminOrDirector = 
        clientTier === 'Direção Executiva' || 
        (clientName && (
          clientName.toLowerCase().includes('administrador') || 
          clientName.toLowerCase().includes('direção') || 
          clientName.toLowerCase().includes('gestão') ||
          clientName.toLowerCase().includes('gerência')
        ));

      const userHeader = isAdminOrDirector
        ? `[Utilizador Atual: ${clientName || 'Membro da Direção Geral'}, Perfil: Direção Executiva / Administrador do Mediador Cabinda]`
        : (clientName ? `[Cliente: ${clientName}, Nível: ${clientTier || 'Standard'}]` : '');

      const userPrompt = `${userHeader ? `${userHeader}\n` : ''}${attachmentsNote}\nPergunta/Solicitação: ${message || 'Gostaria de solicitar intermediação e vistoria segura para esta mercadoria/fornecedor das fotos.'}`;

      const response = await client.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          ...conversationHistory,
          {
            role: 'user',
            parts: [{ text: userPrompt }]
          }
        ],
        config: {
          systemInstruction: dynamicInstruction,
          temperature: 0.0,
          maxOutputTokens: 2048
        }
      });

      const responseText = response.text || '';

      const suggestedQuestions = [
        'Como funciona a intermediação passo a passo?',
        'Quais são os prazos marítimos e aéreos?',
        'Como pagar por Multicaixa Express ou IBAN?',
        'Como falar com um atendente no WhatsApp?'
      ];

      return res.json({
        source: 'gemini',
        text: responseText,
        suggestedQuestions,
        fallback: false
      });
    } catch (err: any) {
      console.warn('Erro ao chamar Gemini API no servidor, acionando motor de conhecimento local:', err?.message || err);
      return res.json({
        source: 'knowledge_base',
        text: '',
        fallback: true,
        errorDetail: err?.message || 'Quota ou falha temporária de IA'
      });
    }
  });

  // 3. Vite middleware for development & static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mediador Cabinda Server rodando na porta ${PORT} (0.0.0.0:${PORT})`);
  });
}

startServer();
