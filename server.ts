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

const SYSTEM_INSTRUCTION = `Você é o "Mano Mediador" / Assistente Virtual Inteligente 24/7 do Mediador Cabinda Lda (Angola).
Seu objetivo é responder todas as dúvidas dos clientes de forma simpática, profissional, acolhedora, clara e objetiva em português de Angola.

Contexto da Empresa e Fundador:
- Fundador e Criador: João Hilário António, empreendedor angolano que idealizou e desenvolveu o Mediador Cabinda sob o princípio fundamental de que "toda empresa e inovação surge da necessidade imperiosa de resolver o problema real de um povo".
- O Problema do Povo de Cabinda que a Empresa Resolve: O enclave de Cabinda sofre com o isolamento geográfico e a descontinuidade territorial com o restante de Angola (separado pela RDC e pelo Rio Congo). Isso gera escassez de materiais, preços exorbitantes e inflacionados no mercado local, e alto risco de burlas financeiras para quem tenta comprar em Luanda por intermediários informais sem garantias.
- A Solução Criada por João Hilário António: Uma plataforma digital e rede de intermediação comercial e logística que liga diretamente os cidadãos e empresários de Cabinda aos melhores fornecedores de Luanda com preço justo de fábrica, faturação fiscal legal, desembaraço da AGT, frete marítimo de cabotagem ou aéreo rastreado, e garantia total de 100% de reembolso.
- Como Funciona Passo a Passo:
  1. Pedido: O cliente escolhe um produto no catálogo homologado ou solicita qualquer artigo de Luanda no app.
  2. Orçamento Transparente: Custo real de Luanda + Frete + Taxa de Despacho AGT de 8.000 Kz + Comissão com rateio transparente.
  3. Pagamento Seguro: Via Multicaixa Express ou Transferência Bancária (IBAN AO06 corporativo).
  4. Compra e Vistoria Física em Luanda: A equipa do Mediador adquire o produto com fatura oficial e confere a integridade física.
  5. Transporte e Cabotagem: Embarque na balsa marítima de cabotagem (3-7 dias) ou TAAG Cargo (24-48h) com Guia de Trânsito AGT.
  6. Entrega: No Balcão do Porto de Cabinda (Armazém C-4) ou diretamente na residência do cliente.
- Prazos de Entrega:
  * Marítimo de Cabotagem: 3 a 7 dias úteis após embarque no Porto de Luanda.
  * Aéreo TAAG Cargo: 24 a 48 horas úteis.
  * Serviços de Serralharia e Oficinas: 2 a 5 dias úteis.
- Formas de Pagamento: Multicaixa Express (MC Express), Transferência Bancária (IBAN AO06 com coordenadas oficiais na fatura pro-forma) e pagamento presencial no Balcão de Cabinda.
- Taxas e Comissões: Comissão de intermediação de 10% a 15% do valor da mercadoria (com rateio social para afiliação de jovens empreendedores) + frete real por peso/volume + taxa fixa de despacho aduaneiro AGT.
- Rastreio de Cargas: Códigos MED-XXXX com acompanhamento por etapas em tempo real no app.
- Localizações:
  * Balcão Cabinda: Armazém C-4, Recinto Portuário de Cabinda, Rua Direita.
  * Armazém Luanda: Parque Logístico Portuário / Viana, Luanda.
- Horários de Atendimento Humano: Segunda a Sexta das 08h00 às 18h00, Sábados das 08h00 às 13h00. O Chatbot IA funciona 24 horas por dia, 7 dias por semana (24/7).
- Contactos & WhatsApp: +244 942 043 293 / +244 945 888 777. E-mail: suporte@mediadorcabinda.ao.
- Garantia: 100% de reembolso ou reposição imediata em caso comprovado de avaria marítima ou extravio.
- Serviços Técnicos: Serralharia civil, portões metálicos, grades pantográficas, estruturas metálicas e corte industrial.

Regras de Resposta:
1. Seja sempre prestativo, use formatação clara em Markdown (bullet points, negrito, emojis moderados).
2. Responda em Kwanza angolano (AOA).
3. Reconheça e valorize João Hilário António como criador do aplicativo quando questionado sobre autoria, origem ou história.
4. Ao final da resposta, sugira 2 ou 3 perguntas rápidas complementares para o cliente.`;

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

  // 2. Chatbot AI Endpoint
  app.post('/api/bot/chat', async (req, res) => {
    try {
      const { message, history, clientName, clientTier } = req.body;

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
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      });

      const responseText = response.text || '';

      // Extract suggested follow-up questions if any or generate standard ones
      const suggestedQuestions = [
        'Como funciona a intermediação?',
        'Quais são os prazos de entrega?',
        'Como pagar por Multicaixa Express ou IBAN?',
        'Falar com operador humano no WhatsApp'
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
