/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order, CollaboratorSale } from '../types';

/**
 * Formata moedas para o padrão de Kwanza (Kz)
 */
export const formatCurrency = (value?: number): string => {
  if (value === undefined || value === null) return '0 Kz';
  return value.toLocaleString('pt-AO') + ' Kz';
};

/**
 * Retorna o desconto correspondente ao nível de fidelidade do cliente
 */
export const getTierDiscountRate = (tier?: string): number => {
  if (!tier) return 0;
  switch (tier.toLowerCase()) {
    case 'bronze': return 0.02; // 2%
    case 'prata': return 0.04;  // 4%
    case 'ouro': return 0.06;   // 6%
    default: return 0;
  }
};

/**
 * Função para baixar a fatura oficial de um pedido de mercadoria (Cliente)
 */
export const downloadOrderInvoice = (order: Order, clientTier: string = 'Standard') => {
  const discountRate = getTierDiscountRate(clientTier);
  const rawPrice = order.budgetRawPrice || 0;
  const shipping = order.budgetShipping || 0;
  const dispatch = order.dispatchFee || 0;
  const commission = order.commissionAmount || 0;
  const quantity = order.quantity || 1;

  const basePriceWithQty = rawPrice * quantity;
  const grossSubtotal = basePriceWithQty + shipping + dispatch + commission;
  const discountAmount = Math.floor(basePriceWithQty * discountRate);
  const totalAmount = order.totalAmount || (grossSubtotal - discountAmount);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Fatura_Oficial_Mediador_${order.id}</title>
      <style>
        body {
          font-family: 'Inter', -apple-system, sans-serif;
          color: #0f172a;
          background: #f8fafc;
          padding: 30px;
          margin: 0;
        }
        .invoice-card {
          max-width: 850px;
          margin: 0 auto;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
          padding: 40px;
          position: relative;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px dashed #e2e8f0;
          padding-bottom: 24px;
          margin-bottom: 24px;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .logo-emblem {
          background: #0f172a;
          border-radius: 16px;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fbbf24;
          font-weight: 900;
          font-size: 11px;
          flex-direction: column;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .logo-emblem span {
          font-size: 7px;
          color: #94a3b8;
          font-weight: 700;
        }
        .brand-text h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 900;
          letter-spacing: -0.5px;
          color: #0f172a;
        }
        .brand-text p {
          margin: 2px 0 0 0;
          font-size: 9px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 800;
          letter-spacing: 0.5px;
        }
        .doc-meta {
          text-align: right;
          font-size: 11px;
          color: #64748b;
          line-height: 1.5;
        }
        .doc-meta h1 {
          color: #0f172a;
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 900;
          letter-spacing: -0.5px;
        }
        .slogan-banner {
          background: #fffbeb;
          border: 1px dashed #f59e0b;
          border-radius: 16px;
          padding: 14px;
          text-align: center;
          font-size: 12px;
          color: #78350f;
          font-weight: 800;
          margin-bottom: 24px;
        }
        .slogan-banner span {
          display: block;
          font-size: 9px;
          color: #d97706;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 3px;
        }
        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        .grid-col {
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 16px;
          padding: 20px;
        }
        .grid-col h3 {
          margin: 0 0 10px 0;
          font-size: 9px;
          text-transform: uppercase;
          color: #94a3b8;
          letter-spacing: 1px;
          font-weight: 900;
        }
        .grid-col p {
          margin: 5px 0;
          font-size: 12px;
          line-height: 1.4;
        }
        .table-section {
          margin-bottom: 30px;
        }
        .table-title {
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          color: #94a3b8;
          letter-spacing: 1px;
          margin-bottom: 12px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
        }
        th {
          background: #f8fafc;
          padding: 14px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
          text-align: left;
        }
        td {
          padding: 14px;
          font-size: 12.5px;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
        }
        .text-right {
          text-align: right;
        }
        .text-center {
          text-align: center;
        }
        .mono {
          font-family: monospace;
          font-weight: bold;
          font-size: 13px;
        }
        .discount-row {
          color: #dc2626;
          font-weight: 700;
        }
        .total-row {
          background: #fef3c7;
          font-weight: 900;
          color: #1e293b;
          font-size: 15px;
          border-top: 2px solid #f59e0b;
        }
        .total-row td {
          padding: 18px 14px;
          color: #0f172a;
        }
        .footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 2px dashed #e2e8f0;
          padding-top: 24px;
          margin-top: 30px;
        }
        .barcode {
          font-family: monospace;
          font-size: 10px;
          color: #64748b;
          line-height: 1.4;
        }
        .barcode-bars {
          letter-spacing: 1.5px;
          font-size: 16px;
          color: #0f172a;
        }
        .stamp {
          background: #ecfdf5;
          border: 1px solid #34d399;
          border-radius: 10px;
          padding: 8px 16px;
          color: #065f46;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn-action-print {
          background: #0f172a;
          color: #ffffff;
          border: none;
          padding: 12px 28px;
          border-radius: 14px;
          font-size: 13px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-block;
          text-decoration: none;
          margin-top: 25px;
        }
        .btn-action-print:hover {
          background: #1e293b;
          transform: translateY(-1px);
        }
        @media print {
          body {
            background: #ffffff;
            padding: 0;
          }
          .invoice-card {
            border: none;
            box-shadow: none;
            padding: 0;
          }
          .btn-action-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-card">
        <div class="header">
          <div class="brand">
            <div class="logo-emblem">
              MEDIADOR
              <span>CABINDA</span>
            </div>
            <div class="brand-text">
              <h2>MEDIADOR CABINDA LDA.</h2>
              <p>Despacho Aduaneiro & Cabotagem de Cargas</p>
            </div>
          </div>
          <div class="doc-meta">
            <h1>FATURA AUXILIAR</h1>
            <p><strong>Nº Fatura/Guia:</strong> FAT-AO-2026-${order.id.replace('MED-', '')}</p>
            <p><strong>NIF Emitente:</strong> 5401129930</p>
            <p><strong>Data de Emissão:</strong> ${new Date(order.createdAt).toLocaleDateString('pt-AO')}</p>
          </div>
        </div>

        <div class="slogan-banner">
          Mediador Cabinda: Unindo Angola
          <span>Conectando de ponta a ponta o território angolano de forma segura e ágil</span>
        </div>

        <div class="grid">
          <div class="grid-col">
            <h3>Remetente / Origem das Cargas</h3>
            <p><strong>Fornecedor Central:</strong> ${order.supplierName || 'Polo Parceiro Geral'}</p>
            <p><strong>Telemóvel:</strong> ${order.supplierPhone || '+244 912 000 111'}</p>
            <p><strong>Polo de Saída:</strong> ${order.supplierLocation?.toLowerCase().includes('cabinda') || order.routeDirection === 'Cabinda-Luanda' ? 'Porto de Cabinda, Cais de Cabotagem' : 'Porto de Luanda, Terminal Especial Sogester'}</p>
            <p><strong>Cidade:</strong> ${order.originCity || (order.routeDirection === 'Cabinda-Luanda' ? 'Cabinda' : 'Luanda')}, Angola</p>
          </div>
          <div class="grid-col">
            <h3>Destinatário / Encomenda</h3>
            <p><strong>Cliente:</strong> ${order.clientName}</p>
            <p><strong>Telemóvel:</strong> ${order.clientPhone}</p>
            <p><strong>Local de Entrega:</strong> ${order.deliveryOption === 'domicilio' ? order.deliveryAddress : 'Polo de Levantamento Geral (' + (order.destinationCity || (order.routeDirection === 'Cabinda-Luanda' ? 'Luanda' : 'Cabinda')) + ' Central)'}</p>
            <p><strong>Status de Pagamento:</strong> ${order.paid ? 'LIQUIDADO (Pago via Multicaixa/IBAN)' : 'PENDENTE DE COBRANÇA'}</p>
          </div>
        </div>

        <div class="table-section">
          <div class="table-title">Detalhamento Geral de Valores & Taxas</div>
          <table>
            <thead>
              <tr>
                <th style="width: 50%;">Descrição do Item / Serviço Aduaneiro</th>
                <th class="text-center">Quantidade</th>
                <th class="text-right">Custo Unitário</th>
                <th class="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>${order.productName}</strong><br>
                  <span style="font-size: 10px; color: #64748b;">Mercadoria adquirida sob solicitação em Luanda</span>
                </td>
                <td class="text-center font-bold">${quantity}x</td>
                <td class="text-right mono">${rawPrice.toLocaleString('pt-AO')} AOA</td>
                <td class="text-right mono">${basePriceWithQty.toLocaleString('pt-AO')} AOA</td>
              </tr>
              <tr>
                <td>
                  <strong>Frete de Cabotagem Interterritorial</strong><br>
                  <span style="font-size: 10px; color: #64748b;">Transporte marítimo/aéreo Luanda &rarr; Cabinda</span>
                </td>
                <td class="text-center">-</td>
                <td class="text-right">-</td>
                <td class="text-right mono">${shipping.toLocaleString('pt-AO')} AOA</td>
              </tr>
              <tr>
                <td>
                  <strong>Tarifa Aduaneira de Trânsito</strong><br>
                  <span style="font-size: 10px; color: #64748b;">Desembaraço e emolumentos regulados pela AGT</span>
                </td>
                <td class="text-center">-</td>
                <td class="text-right">-</td>
                <td class="text-right mono">${dispatch.toLocaleString('pt-AO')} AOA</td>
              </tr>
              <tr>
                <td>
                  <strong>Honorários de Intermediação do Mediador</strong><br>
                  <span style="font-size: 10px; color: #64748b;">Taxa operacional de ${Math.round((order.commissionRate || 0.12) * 100)}%</span>
                </td>
                <td class="text-center">-</td>
                <td class="text-right">-</td>
                <td class="text-right mono">${commission.toLocaleString('pt-AO')} AOA</td>
              </tr>
              <tr class="discount-row">
                <td>
                  <strong>Desconto de Fidelidade Aplicado</strong><br>
                  <span style="font-size: 10px; color: #dc2626;">Fidelização nível ${clientTier} (-${discountRate * 100}%)</span>
                </td>
                <td class="text-center">-</td>
                <td class="text-right">-</td>
                <td class="text-right mono">-${discountAmount.toLocaleString('pt-AO')} AOA</td>
              </tr>
              <tr class="total-row">
                <td colspan="2" style="font-weight: 900; text-transform: uppercase;">Total Líquido da Fatura</td>
                <td colspan="2" class="text-right mono" style="font-size: 16px; color: #9a3412;">${totalAmount.toLocaleString('pt-AO')} AOA</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="footer">
          <div class="barcode">
            <div class="barcode-bars">|||||||||||||||||||||||||||||||||||||</div>
            *GUIA-AO-CB-${order.id}-VALIDA-POR-AGT-COMMERCE*
          </div>
          <div class="stamp">
            🛡️ Certificado Regulamentar AGT Angola
          </div>
        </div>

        <div style="text-align: center;">
          <button class="btn-action-print" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
        </div>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Fatura_Mediador_Cabinda_${order.id}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Função para baixar a fatura de um negócio fechado por colaborador (Comissão de Parceiro)
 */
export const downloadCollaboratorSaleInvoice = (sale: CollaboratorSale) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Comprovativo_Comissao_${sale.id}</title>
      <style>
        body {
          font-family: 'Inter', -apple-system, sans-serif;
          color: #0f172a;
          background: #f8fafc;
          padding: 30px;
          margin: 0;
        }
        .invoice-card {
          max-width: 800px;
          margin: 0 auto;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
          padding: 40px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px dashed #e2e8f0;
          padding-bottom: 24px;
          margin-bottom: 24px;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .logo-emblem {
          background: #0f172a;
          border-radius: 16px;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fbbf24;
          font-weight: 900;
          font-size: 11px;
          flex-direction: column;
        }
        .logo-emblem span {
          font-size: 7px;
          color: #94a3b8;
          font-weight: 700;
        }
        .brand-text h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 900;
          color: #0f172a;
        }
        .brand-text p {
          margin: 2px 0 0 0;
          font-size: 9px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 800;
        }
        .doc-meta {
          text-align: right;
          font-size: 11px;
          color: #64748b;
        }
        .doc-meta h1 {
          color: #0f172a;
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 900;
        }
        .slogan-banner {
          background: #ecfdf5;
          border: 1px dashed #059669;
          border-radius: 16px;
          padding: 14px;
          text-align: center;
          font-size: 12px;
          color: #064e3b;
          font-weight: 800;
          margin-bottom: 24px;
        }
        .slogan-banner span {
          display: block;
          font-size: 9px;
          color: #047857;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          margin-top: 3px;
        }
        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        .grid-col {
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 16px;
          padding: 20px;
        }
        .grid-col h3 {
          margin: 0 0 10px 0;
          font-size: 9px;
          text-transform: uppercase;
          color: #94a3b8;
          letter-spacing: 1px;
          font-weight: 900;
        }
        .grid-col p {
          margin: 5px 0;
          font-size: 12px;
          line-height: 1.4;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 30px;
        }
        th {
          background: #f8fafc;
          padding: 14px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
          text-align: left;
        }
        td {
          padding: 14px;
          font-size: 12.5px;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
        }
        .text-right {
          text-align: right;
        }
        .mono {
          font-family: monospace;
          font-weight: bold;
          font-size: 13px;
        }
        .total-row {
          background: #d1fae5;
          font-weight: 900;
          color: #064e3b;
        }
        .footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 2px dashed #e2e8f0;
          padding-top: 24px;
          margin-top: 30px;
        }
        .barcode {
          font-family: monospace;
          font-size: 10px;
          color: #64748b;
        }
        .stamp {
          background: #eff6ff;
          border: 1px solid #3b82f6;
          border-radius: 10px;
          padding: 8px 16px;
          color: #1e3a8a;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
        }
        .btn-action-print {
          background: #0f172a;
          color: #ffffff;
          border: none;
          padding: 12px 28px;
          border-radius: 14px;
          font-size: 13px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-block;
          text-decoration: none;
          margin-top: 25px;
        }
        .btn-action-print:hover {
          background: #1e293b;
        }
        @media print {
          body {
            background: #ffffff;
            padding: 0;
          }
          .invoice-card {
            border: none;
            box-shadow: none;
            padding: 0;
          }
          .btn-action-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-card">
        <div class="header">
          <div class="brand">
            <div class="logo-emblem">
              MEDIADOR
              <span>CABINDA</span>
            </div>
            <div class="brand-text">
              <h2>MEDIADOR CABINDA LDA.</h2>
              <p>Programa Geral de Comissionados e Afiliados</p>
            </div>
          </div>
          <div class="doc-meta">
            <h1>EXTRATO DE NEGÓCIO</h1>
            <p><strong>Ref. do Recibo:</strong> CLB-SALE-${sale.id}</p>
            <p><strong>NIF Emitente:</strong> 5401129930</p>
            <p><strong>Sincronizado em:</strong> ${new Date(sale.createdAt).toLocaleDateString('pt-AO')}</p>
          </div>
        </div>

        <div class="slogan-banner">
          Mediador Cabinda: Unindo Angola
          <span>Parceria Ativa de Promoção e Angariação de Importações para Cabinda</span>
        </div>

        <div class="grid">
          <div class="grid-col">
            <h3>Vendedor / Captador Comercial</h3>
            <p><strong>Parceiro Promotor:</strong> ${sale.collaboratorName}</p>
            <p><strong>Nível/Afiliação:</strong> Promotor Independente Registado</p>
            <p><strong>Status Operacional:</strong> Parceiro Comercial Integrado</p>
          </div>
          <div class="grid-col">
            <h3>Negócio Finalizado & Cliente</h3>
            <p><strong>Cliente Captado:</strong> ${sale.clientName}</p>
            <p><strong>Descrição do Negócio:</strong> ${sale.saleDescription}</p>
            <p><strong>Estado de Liquidação:</strong> ${sale.status.toUpperCase() === 'PAGO' ? 'LIQUIDADO (Crédito Pago)' : 'PENDENTE DE PROCESSAMENTO'}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Detalhamento da Transação</th>
              <th class="text-right">Montantes Regulados</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Faturação Bruta Total do Negócio</strong><br>
                <span style="font-size: 10px; color: #64748b;">Volume financeiro transacionado pelo cliente final</span>
              </td>
              <td class="text-right mono">${sale.saleAmount.toLocaleString('pt-AO')} AOA</td>
            </tr>
            <tr>
              <td>
                <strong>Honorários de Intermediação Gerados</strong><br>
                <span style="font-size: 10px; color: #64748b;">Valor cobrado a título de assessoria aduaneira</span>
              </td>
              <td class="text-right mono">${sale.commissionPrice.toLocaleString('pt-AO')} AOA</td>
            </tr>
            <tr>
              <td>
                <strong>Fração de Comissionamento Acordada</strong><br>
                <span style="font-size: 10px; color: #64748b;">Percentual padrão de recompensa do captador</span>
              </td>
              <td class="text-right mono font-bold">${sale.collaboratorPercentage}%</td>
            </tr>
            <tr class="total-row">
              <td style="font-weight: 900;">COMISSÃO LÍQUIDA A RECEBER (CRÉDITO)</td>
              <td class="text-right mono" style="font-size: 15px;">${sale.calculatedCommission.toLocaleString('pt-AO')} AOA</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <div class="barcode">
            ||||||||||||||||||||||||||||||||||||<br>
            *PART-SALE-${sale.id}-VALIDATED-FOR-PAYMENT*
          </div>
          <div class="stamp">
            💰 Processamento Financeiro Aprovado
          </div>
        </div>

        <div style="text-align: center;">
          <button class="btn-action-print" onclick="window.print()">🖨️ Imprimir Recibo</button>
        </div>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Recibo_Comissao_Parceiro_${sale.id}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
