import React, { useState, useEffect } from 'react';
import { CollaboratorSale, Collaborator } from '../../types';
import { CommissionTier, getCommissionRateForPrice } from '../../data/commissionTiers';
import { X, Check, Coins, Sliders, AlertCircle, Percent } from 'lucide-react';

interface EditCollaboratorSaleModalProps {
  sale: CollaboratorSale | null;
  collaborators: Collaborator[];
  tiers: CommissionTier[];
  onClose: () => void;
  onSave: (updatedSale: CollaboratorSale) => void;
  formatCurrency: (val: number) => string;
}

export const EditCollaboratorSaleModal: React.FC<EditCollaboratorSaleModalProps> = ({
  sale,
  collaborators,
  tiers,
  onClose,
  onSave,
  formatCurrency
}) => {
  const [formData, setFormData] = useState<CollaboratorSale | null>(sale);
  const [calculationMode, setCalculationMode] = useState<'manual' | 'tier'>('manual');

  useEffect(() => {
    setFormData(sale);
  }, [sale]);

  if (!sale || !formData) return null;

  const currentTierRate = getCommissionRateForPrice(formData.saleAmount, tiers);
  const calculatedGain = Math.floor((formData.commissionPrice || 0) * ((formData.collaboratorPercentage || 0) / 100));

  const handleApplyTier = () => {
    setFormData({
      ...formData,
      collaboratorPercentage: currentTierRate
    });
  };

  const handlePresetPercentage = (pct: number) => {
    setFormData({
      ...formData,
      collaboratorPercentage: pct
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    onSave({
      ...formData,
      calculatedCommission: calculatedGain
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 px-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Ajustar Negócio & Percentagem do Colaborador</h3>
              <p className="text-xs text-amber-300 font-medium">Defina a percentagem exata para o bem que o cliente necessita</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs font-sans">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Colaborador / Promotor</label>
              <select
                value={formData.collaboratorId}
                onChange={(e) => {
                  const targetCol = collaborators.find(c => c.id === e.target.value);
                  setFormData({
                    ...formData,
                    collaboratorId: e.target.value,
                    collaboratorName: targetCol ? targetCol.name : formData.collaboratorName
                  });
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-250 rounded-xl font-bold text-slate-800 focus:outline-hidden"
              >
                {collaborators.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Nome do Cliente Angariado</label>
              <input
                type="text"
                required
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-250 rounded-xl font-semibold text-slate-800 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Bem / Mercadoria Necessária pelo Cliente *</label>
            <input
              type="text"
              required
              value={formData.saleDescription}
              onChange={(e) => setFormData({ ...formData, saleDescription: e.target.value })}
              placeholder="Ex: Gerador 7.5kVA Diesel, 100 Sacos de Cimento, Peruca 30' Bob"
              className="w-full p-2.5 bg-slate-50 border border-slate-250 rounded-xl font-semibold text-slate-800 focus:outline-hidden"
            />
          </div>

          {/* Pricing Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Preço do Bem / Valor Comercial (Kz) *
              </label>
              <input
                type="number"
                step="1000"
                min="1000"
                required
                value={formData.saleAmount}
                onChange={(e) => {
                  const val = Math.max(1000, parseInt(e.target.value) || 0);
                  const suggestedComm = Math.floor(val * 0.12);
                  setFormData({
                    ...formData,
                    saleAmount: val,
                    commissionPrice: formData.commissionPrice || suggestedComm
                  });
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-250 rounded-xl font-mono font-bold text-slate-800 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                Valor total: {formatCurrency(formData.saleAmount)}
              </span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Comissão de Intermediação Base (Kz) *
              </label>
              <input
                type="number"
                step="500"
                min="100"
                required
                value={formData.commissionPrice}
                onChange={(e) => setFormData({ ...formData, commissionPrice: Math.max(100, parseInt(e.target.value) || 0) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-250 rounded-xl font-mono font-bold text-slate-800 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                Base calculada: {formatCurrency(formData.commissionPrice)}
              </span>
            </div>
          </div>

          {/* Percentage Definition Control */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-amber-600" />
                  Definição da Percentagem do Colaborador
                </span>
                <p className="text-[10.5px] text-slate-500">Defina livremente em função do valor e tipo de bem</p>
              </div>
              <button
                type="button"
                onClick={handleApplyTier}
                className="text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                Aplicar Tabela ({currentTierRate}%) ⚡
              </button>
            </div>

            {/* Quick preset percentage chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[5, 8, 10, 12, 15, 18, 20, 25, 30].map(pct => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handlePresetPercentage(pct)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    formData.collaboratorPercentage === pct
                      ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-250'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>

            {/* Percentage Input with Range Slider */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-2">
              <div className="sm:col-span-8">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.collaboratorPercentage}
                  onChange={(e) => setFormData({ ...formData, collaboratorPercentage: parseInt(e.target.value) || 0 })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
              <div className="sm:col-span-4 flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.collaboratorPercentage}
                  onChange={(e) => setFormData({ ...formData, collaboratorPercentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                  className="w-full p-2 bg-white border border-amber-300 rounded-xl font-mono font-black text-amber-900 text-center text-xs focus:outline-hidden"
                />
                <span className="text-xs font-bold text-slate-500">%</span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Estado da Comissão</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'pendente' })}
                className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  formData.status === 'pendente'
                    ? 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-300/40 font-black'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                Pendente (A Pagar)
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'pago' })}
                className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  formData.status === 'pago'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-300/40 font-black'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Liquidado / Pago ✓
              </button>
            </div>
          </div>

          {/* Live Outcome Box */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[9.5px] uppercase font-bold text-emerald-800">Ganho Calculado do Colaborador:</span>
              <p className="text-[10px] text-emerald-700 mt-0.5">
                {formData.collaboratorPercentage}% sobre {formatCurrency(formData.commissionPrice)}
              </p>
            </div>
            <span className="font-mono text-sm font-black text-emerald-900 bg-white px-3.5 py-2 rounded-xl border border-emerald-200 shadow-xs">
              + {formatCurrency(calculatedGain)}
            </span>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 text-amber-400 hover:bg-slate-800 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Guardar Alterações
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
