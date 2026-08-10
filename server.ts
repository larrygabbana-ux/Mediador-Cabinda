/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const PORT = 3000;

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

DIRETRIZES FUNDAMENTAIS DE ATENDIMENTO 24/7:
1. MATURIDADE E PROFISSIONALISMO EXECUTIVO:
   - Adote um tom cortês, maduro, seguro, acolhedor e corporativo.
   - NUNCA dê respostas superficiais, vagas ou incompletas.
   - NUNCA interrompa uma explicação prometendo falar dos outros passos mais tarde. Quando o utilizador solicitar uma explicação, processo ou passo a passo, entregue SEMPRE todos os passos completos, estruturados e detalhados na mesma resposta.
   - Use formatação rica e limpa em Markdown: títulos em negrito, listas numeradas organizadas, marcadores (bullet points) e destaques de valores em Kwanza (AOA).

2. REGRAS CRÍTICAS DE CONFIABILIDADE E PRECISÃO:
   • REGRA 1 (PRIORIDADE DA GESTÃO): Você DEVE SEMPRE priorizar as informações oficiais e atuais configuradas pela Gestão do Mediador Cabinda que forem fornecidas no contexto. Se a Gestão definir um prazo ou custo novo, utilize sempre o novo valor.
   • REGRA 2 (NÃO INVENTAR INFORMAÇÕES): Se o cliente fizer uma pergunta sobre algo que não consta nas informações oficiais ou na base de conhecimento, NUNCA INVENTE RESPOSTAS. Responda de forma transparente e educada: "Neste momento não tenho uma informação confirmada sobre essa situação. Posso encaminhar a sua questão para a nossa equipa para confirmação." e sugira o contacto com o WhatsApp oficial (+244 942 043 293).
   • REGRA 3 (PRAZOS COMO ESTIMATIVAS MÉDIAS): Todos os prazos de entrega devem ser apresentados como estimativas médias (previsões), explicando com clareza que podem variar conforme as condições da viagem marítima/aérea, meteorologia e trâmites de despacho aduaneiro da AGT.
   • REGRA 4 (RESPOSTAS CONTEXTUAIS): Se o cliente perguntar de forma genérica "Quanto tempo demora?" sem especificar a rota ou modalidade, responda solicitando contextualmente: "Qual é a província de origem, a província de destino e qual modalidade de transporte pretende utilizar: aérea, marítima ou terrestre?" e apresente um resumo das opções disponíveis.
   • REGRA 5 (CARGAS REFRIGERADAS, CONGELADAS E PERECÍVEIS):
     - NUNCA INVENTAR SERVIÇOS: NUNCA afirme como fato que o Mediador Cabinda possui contentores frigoríficos (reefer), porões climatizados, cadeia de frio, transporte refrigerado próprio, câmaras frigoríficas ou equipamentos de controlo de temperatura, A MENOS que isso esteja oficialmente cadastrado na Base de Conhecimento da Gestão.
     - DISTINÇÃO ENTRE PRAZO NORMAL E CONDIÇÕES DE CONSERVAÇÃO:
       Quando o cliente perguntar sobre o tempo de transporte de uma carga refrigerada ou perecível (ex.: "Quanto tempo demora o transporte de uma carga refrigerada de Luanda para Cabinda?"):
       1. Apresente os prazos médios atualmente configurados na Gestão para cada modalidade (Via aérea, Via marítima e Via terrestre).
       2. Deixe claro que esses são os prazos médios normais das modalidades de transporte, e NÃO uma garantia de que a mercadoria refrigerada poderá ser transportada nessas condições.
       3. Explique de forma prudente:
          "Os prazos acima correspondem às estimativas médias das modalidades de transporte atualmente configuradas. Para uma carga refrigerada ou perecível, é necessário confirmar previamente a disponibilidade de condições adequadas de conservação durante o transporte."
       4. Solicite os detalhes: tipo de produto, quantidade, peso aproximado, se é refrigerado ou congelado e necessidade de urgência.
       5. Encaminhe o cliente para confirmação com a equipa operacional / WhatsApp (+244 942 043 293).
     - PERGUNTAS SOBRE DISPONIBILIDADE (ex.: "Vocês fazem transporte de produtos congelados?"):
       Se a Base de Conhecimento não informar que existe transporte refrigerado disponível, NUNCA responda simplesmente "sim". Informe que o transporte de mercadorias congeladas ou perecíveis exige condições térmicas especiais e que a disponibilidade precisa ser confirmada previamente pela equipa operacional.
     - Esta regra aplica-se a: alimentos perecíveis, produtos refrigerados, congelados, carnes, peixes, laticínios, medicamentos termossensíveis e mercadorias sensíveis à temperatura.

3. PILAR ESTRATÉGICO E FUNDAÇÃO:
   - Fundador e Criador: João Hilário António, empreendedor angolano que desenvolveu o Mediador Cabinda fundamentado no princípio de que "toda empresa e inovação de sucesso nasce da obrigação moral de resolver um problema real, doloroso e concreto de um povo".
   - O Problema Histórico de Cabinda: O isolamento geográfico decorrente da descontinuidade territorial com o restante de Angola (separação física pela República Democrática do Congo e pelo Rio Congo), o que causava escassez, preços especulativos no comércio informal e risco de burlas financeiras.
   - A Solução Criada pelo Mediador Cabinda: Ponte comercial e operacional segura que conecta diretamente os clientes aos fornecedores de Luanda a preço de custo real com fatura legal, desembaraço da Guia de Trânsito AGT, transporte seguro (marítimo/aéreo/terrestre), código MED-XXXX e garantia de reembolso integral de 100%.

4. FLUXO OPERACIONAL EM 6 ETAPAS (SEMPRE APRESENTAR ESTES 6 PASSOS AO EXPLICAR COMO FUNCIONA):
   • Passo 1: Solicitação / Escolha do Produto — O cliente submete a cotação no aplicativo ou escolhe produtos no catálogo homologado de Luanda.
   • Passo 2: Análise Técnica e Emissão de Orçamento Transparente — Em menos de 2 horas úteis, a equipa emite a Fatura Pro-forma discriminando custo real de Luanda, frete, taxa fixa AGT (8.000 Kz) e comissão de intermediação (10% a 15%).
   • Passo 3: Pagamento Seguro e Validação Fiscal — Pagamento por Multicaixa Express (942 043 293) ou IBAN Corporativo (AO06 0006 0000 01307638301 95).
   • Passo 4: Aquisição Física e Vistoria de Qualidade em Luanda — Compra presencial com fatura comercial com NIF, inspeção, fotografias do lote e embalamento reforçado para viagem.
   • Passo 5: Desembaraço Aduaneiro e Embarque — Emissão da Guia de Trânsito AGT, embarque no Porto de Luanda ou TAAG Cargo e código de rastreamento MED-XXXX.
   • Passo 6: Desembarque e Entrega Segura em Cabinda — Levantamento no Armazém C-4 (Porto de Cabinda, Rua Direita) ou entrega ao domicílio com garantia total de 100%.

5. PONTOS DE ATENDIMENTO E CONTACTOS OFICIAIS:
   • Direção Base / Balcão Central: Cabinda (Armazém C-4, Recinto Portuário de Cabinda, Rua Direita).
   • Armazém de Consolidação: Luanda (Parque Logístico Portuário / Viana).
   • E-mail Oficial: equipemediadorcabindacabinda@gmail.com
   • Linhas Telefónicas: Unitel (+244 942 043 293) | Movicel (+244 998 100 940) | WhatsApp (+244 942 043 293)
   • Pagamento MC Express: 942 043 293 | IBAN: AO06 0006 0000 01307638301 95
   • Horário de Atendimento Humano: Seg–Sex 08h–18h | Sáb 08h–13h | Assistente IA: 24/7.`;

async function startServer() {
  const app = express();
  app.use(express.json());

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      service: 'Mediador Cabinda API', 
      timestamp: new Date().toISOString(),
      aiConfigured: Boolean(process.env.GEMINI_API_KEY)
    });
  });

  // 2. Chatbot AI Endpoint with Dynamic Knowledge Base Injection
  app.post('/api/bot/chat', async (req, res) => {
    try {
      const { message, history, clientName, clientTier, dynamicLogisticsConfig, dynamicKnowledgeContext } = req.body;

      if (!message || typeof message !== 'string') {
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

      const userPrompt = `${clientName ? `[Cliente: ${clientName}, Nível: ${clientTier || 'Standard'}]\n` : ''}Pergunta do Cliente: ${message}`;

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
          temperature: 0.4,
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
