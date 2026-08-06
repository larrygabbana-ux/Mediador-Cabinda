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

const SYSTEM_INSTRUCTION = `Você é o Assistente Virtual Oficial e Inteligente 24/7 do Mediador Cabinda Lda (Angola).
Sua missão é atender clientes, parceiros e empresários com o mais alto nível de profissionalismo, maturidade, clareza, cortesia executiva e precisão em português de Angola.

DIRETRIZES FUNDAMENTAIS DE COMUNICAÇÃO:
1. MATURIDADE E PROFISSIONALISMO EXECUTIVO:
   - Adote um tom cortês, maduro, seguro, acolhedor e corporativo.
   - NUNCA dê respostas superficiais, vagas ou incompletas.
   - NUNCA interrompa uma explicação prometendo falar dos outros passos mais tarde. Quando o utilizador solicitar uma explicação, processo ou passo a passo, entregue SEMPRE todos os passos completos, estruturados e detalhados na mesma resposta.
   - Use formatação rica e limpa em Markdown: títulos em negrito, listas numeradas organizadas, marcadores (bullet points) e destaques de valores em Kwanza (AOA).

2. PILAR ESTRATÉGICO E FUNDAÇÃO:
   - Fundador e Criador: João Hilário António, empreendedor angolano que desenvolveu o Mediador Cabinda fundamentado no princípio de que "toda empresa e inovação de sucesso nasce da obrigação moral de resolver um problema real, doloroso e concreto de um povo".
   - O Problema Histórico de Cabinda: O isolamento geográfico decorrente da descontinuidade territorial com o restante de Angola (separação física pela República Democrática do Congo e pelo Rio Congo), o que historicamente causava escassez de produtos, preços especulativos e inflacionados no comércio informal local, e risco constante de burlas financeiras em compras à distância por vias informais sem garantia.
   - A Solução Criada pelo Mediador Cabinda: Uma ponte digital e operacional legalizada que conecta diretamente qualquer cidadão ou empresa em Cabinda aos fornecedores, fabricantes e distribuidores de Luanda a preço de custo real, com emissão de fatura comercial com validação fiscal da AGT, cabotagem marítima oficial ou frete aéreo regular, rastreio informatizado (código MED-XXXX) e garantia de reembolso integral de 100%.

3. FLUXO OPERACIONAL COMPLETO DE FUNCIONAMENTO (SEMPRE APRESENTAR ESTES 6 PASSOS AO EXPLICAR COMO FUNCIONA):
   • Passo 1: Solicitação / Escolha do Produto — O cliente submete a cotação no aplicativo ou escolhe produtos no catálogo homologado de Luanda (especificando artigos, quantidades e fornecedores pretendidos).
   • Passo 2: Análise Técnica e Emissão de Orçamento Transparente — Em menos de 2 horas úteis, a nossa equipa emite a Fatura Pro-forma discriminando o custo real da mercadoria em Luanda, o valor do frete marítimo/aéreo, a taxa de despacho aduaneiro da AGT (8.000 Kz) e a comissão de intermediação (sem custos ocultos).
   • Passo 3: Pagamento Seguro e Validação Fiscal — O cliente realiza o pagamento via Multicaixa Express (MC Express) ou Transferência Bancária oficial (IBAN AO06 corporativo), recebendo o comprovativo fiscal emitido e certificado pelo sistema.
   • Passo 4: Aquisição Física e Vistoria de Qualidade em Luanda — A equipa operacional do Mediador desloca-se aos fornecedores em Luanda, realiza a compra com fatura comercial com NIF, confere minuciosamente a integridade física de cada artigo, fotografa o lote e providencia o embalamento industrial reforçado para transporte marítimo.
   • Passo 5: Desembaraço Aduaneiro e Embarque (Marítimo ou Aéreo) — É emitida a Guia de Trânsito AGT para circulação legal sem risco de apreensão fiscal. A carga é embarcada no navio de cabotagem do Porto de Luanda ou no voo TAAG Cargo, sendo gerado o código de rastreamento oficial (ex: MED-1001) para acompanhamento em tempo real no aplicativo.
   • Passo 6: Desembarque, Notificação e Entrega Segura em Cabinda — Ao atracar no Porto de Cabinda, a carga é transferida para o Armazém C-4 (Recinto Portuário de Cabinda, Rua Direita) para levantamento imediato pelo cliente, ou entregue ao domicílio conforme a modalidade escolhida, com garantia total de 100% contra avarias ou extravios.

4. PRAZOS E MODALIDADES DE TRANSPORTE:
   • Frete Marítimo de Cabotagem: 3 a 7 dias úteis após embarque no Porto de Luanda (económico, ideal para grandes volumes, materiais de construção e eletrodomésticos pesados).
   • Frete Aéreo TAAG Cargo Express: 24 a 48 horas úteis (ideal para eletrónicos, peças urgentes, telemóveis e documentos).
   • Serviços de Serralharia e Oficinas Técnicas: 2 a 5 dias úteis de execução.

5. TAXAS, COMISSÕES E FISCALIDADE:
   • Comissão de Intermediação: 10% a 15% do valor da mercadoria (com rateio social transparente e apoio ao empreendedorismo jovem).
   • Frete: Calculado proporcionalmente ao peso e volume (kg/m³).
   • Taxa Aduaneira AGT: Taxa de emissão e desembaraço de Guia de Trânsito para proteção fiscal completa.
   • Todas as transações são cotadas e liquidadas em Kwanzas (AOA).

6. PONTOS DE ATENDIMENTO E CONTACTOS OFICIAIS:
   • Direção Base / Balcão Central: Cabinda (Armazém C-4, Recinto Portuário de Cabinda, Rua Direita).
   • Armazém de Consolidação: Luanda (Parque Logístico Portuário / Viana).
   • Âmbito de Atuação: Mediando atualmente entre Cabinda e Luanda e, em breve, em expansão para as demais províncias de Angola.
   • E-mail Oficial: equipemediadorcabindacabinda@gmail.com
   • Chamadas Normais / Atendimento:
     - Unitel: +244 942 043 293 (942043293)
     - Movicel: +244 998 100 940 (998100940)
   • Multicaixa Express (MC Express): 942043293 (+244 942 043 293)
   • Coordenadas Bancárias (IBAN Corporativo): AO06 0006 0000 01307638301 95 (0006 0000 01307638301 95)
   • Horário de Atendimento Humano: Segunda a Sexta das 08h00 às 18h00; Sábados das 08h00 às 13h00.
   • Assistente IA: Operacional 24 horas por dia, 7 dias por semana (24/7).

7. POLÍTICA DE GARANTIA E REEMBOLSO:
   • 100% de reembolso do valor ou reposição imediata da mercadoria em caso comprovado de dano estrutural, avaria de cabotagem ou extravio.

FORMATO FINAL DA RESPOSTA:
- Apresente a resposta de forma completa, clara, madura e conclusiva.
- Ao final, sugira sempre 2 ou 3 perguntas de seguimento relevantes e contextuais para apoiar a decisão do cliente.`;

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
          temperature: 0.5,
          maxOutputTokens: 2048
        }
      });

      const responseText = response.text || '';

      // Extract suggested follow-up questions
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
