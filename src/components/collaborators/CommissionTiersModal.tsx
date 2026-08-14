import React, { useState } from 'react';
import { CommissionTier, DEFAULT_COMMISSION_TIERS, getTierForPrice } from '../../data/commissionTiers';
import { X, Plus, Trash2, RotateCcw, Check, Sparkles, Sliders, ShieldCheck } from 'lucide-react';

interface CommissionTiersModalProps {
  isOpen: boolean;
  onClose: () => void;
  tiers: CommissionTier[];
  onSaveTiers: (newTiers: CommissionTier[]) => void;
  onResetTiers: () => void;
  formatCurrency: (val: number) => string;
}

export const CommissionTiersModal: React.FC<CommissionTiersModalProps> = ({
  isOpen,
  onClose,
  tiers,
  onSaveTiers,
  onResetTiers,
  formatCurrency
}) => {
  const [localTiers, setLocalTiers] = useState<CommissionTier[]>(tiers);
  const [testPrice, setTestPrice] = useState<number>(650000);

  // Keep in sync when modal opens
  React.useEffect(() => {
    setLocalTiers(tiers);
  }, [tiers, isOpen]);

  if (!isOpen) return null;

  const handleTierChange = (index: number, field: keyof CommissionTier, value: any) => {
    const updated = [...localTiers];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setLocalTiers(updated);
  };

  const handleAddTier = () => {
    const lastTier = localTiers[localTiers.length - 1];
    const newMin = lastTier ? (lastTier.maxPrice || lastTier.minPrice + 1000000) : 0;
    const newTier: CommissionTier = {
      id: `tier-${Date.now()}`,
      minPrice: newMin,
      maxPrice: null,
      percentage: 15,
      label: `Acima de ${(newMin / 1000).toLocaleString('pt-AO')} Mil Kz`,
      description: 'Nova faixa personalizada definida pelo Administrador'
    };
    setLocalTiers([...localTiers, newTier]);
  };

  const handleRemoveTier = (index: number) => {
    if (localTiers.length <= 1) return;
    const updated = localTiers.filter((_, i) => i !== index);
    setLocalTiers(updated);
  };

  const handleSave = () => {
    onSaveTiers(localTiers);
    onClose();
  };

  const activeTestTier = getTierForPrice(testPrice, localTiers);
  const testEstimatedComm = Math.floor(testPrice * 0.12);
  const testColabPayout = Math.floor(testEstimatedComm * (activeTestTier.percentage / 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 px-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Configurar Tabela de Percentagens por Preço do Bem</h3>
              <p className="text-xs text-amber-300 font-medium">Defina você mesmo a percentagem que o colaborador receberá em função do valor da mercadoria</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-xs font-sans">
          
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-slate-700 text-xs leading-relaxed">
              <p className="font-extrabold text-amber-950">Autonomia Total do Administrador</p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Aqui você estabelece as faixas de preço de cada bem solicitado pelo cliente e a fatia de comissão percentual que cabe ao promotor/captador. Pode alterar valores mínimos, máximos e a percentagem livremente.
              </p>
            </div>
          </div>

          {/* Tiers List */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">
                Faixas Atuais de Preço & Percentagens (%)
              </h4>
              <button
                type="button"
                onClick={handleAddTier}
                className="text-[11px] font-bold text-slate-900 bg-amber-300 hover:bg-amber-400 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Nova Faixa
              </button>
            </div>

            <div className="space-y-3">
              {localTiers.map((tier, idx) => (
                <div 
                  key={tier.id || idx}
                  className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3 hover:border-amber-300 transition-colors"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    
                    {/* Label & Description */}
                    <div className="sm:col-span-4 space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nome / Descrição da Faixa</label>
                      <input
                        type="text"
                        value={tier.label}
                        onChange={(e) => handleTierChange(idx, 'label', e.target.value)}
                        placeholder="Ex: Bens de Médio Porte"
                        className="w-full bg-white border border-slate-250 p-2 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden"
                      />
                      <input
                        type="text"
                        value={tier.description}
                        onChange={(e) => handleTierChange(idx, 'description', e.target.value)}
                        placeholder="Ex: TV, Frigorífico, Computador"
                        className="w-full bg-white border border-slate-250 p-1.5 rounded-lg text-[10.5px] text-slate-500 focus:outline-hidden"
                      />
                    </div>

                    {/* Min Price */}
                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Preço Mínimo (Kz)</label>
                      <input
                        type="number"
                        step="10000"
                        min="0"
                        value={tier.minPrice}
                        onChange={(e) => handleTierChange(idx, 'minPrice', Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-white border border-slate-250 p-2 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-hidden"
                      />
                      <span className="text-[9.5px] text-slate-400 block">{formatCurrency(tier.minPrice)}</span>
                    </div>

                    {/* Max Price */}
                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Preço Máximo (Kz)
                      </label>
                      <input
                        type="number"
                        step="10000"
                        min="0"
                        placeholder="Sem limite (Vazio)"
                        value={tier.maxPrice === null || tier.maxPrice === undefined ? '' : tier.maxPrice}
                        onChange={(e) => {
                          const val = e.target.value === '' ? null : Math.max(0, parseInt(e.target.value) || 0);
                          handleTierChange(idx, 'maxPrice', val);
                        }}
                        className="w-full bg-white border border-slate-250 p-2 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-hidden"
                      />
                      <span className="text-[9.5px] text-slate-400 block">
                        {tier.maxPrice ? formatCurrency(tier.maxPrice) : 'Sem teto máximo (Ilimitado)'}
                      </span>
                    </div>

                    {/* Percentage */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block text-center">Fatia (%)</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={tier.percentage}
                          onChange={(e) => handleTierChange(idx, 'percentage', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                          className="w-full bg-amber-50 border border-amber-300 p-2 rounded-xl text-xs font-mono font-black text-amber-900 text-center focus:outline-hidden"
                        />
                        {localTiers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTier(idx)}
                            className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            title="Remover esta faixa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Simulator Test Box */}
          <div className="bg-slate-900 border border-slate-800 text-white p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                Simulador Rápido de Teste da Tabela
              </span>
              <span className="text-[10.5px] text-slate-400">Verifique a percentagem em tempo real</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div>
                <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Preço do Bem do Cliente (Kz)</label>
                <input
                  type="number"
                  step="50000"
                  min="1000"
                  value={testPrice}
                  onChange={(e) => setTestPrice(Math.max(1000, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-xs font-mono font-bold text-amber-300 focus:outline-hidden"
                />
              </div>

              <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Faixa Identificada:</span>
                <p className="text-xs font-black text-white truncate mt-0.5">{activeTestTier.label}</p>
                <span className="text-[10px] text-amber-400 font-mono font-bold">{activeTestTier.percentage}% de Comissão</span>
              </div>

              <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Ganho Estimado Colaborador:</span>
                <p className="text-xs font-black text-emerald-400 font-mono mt-0.5">
                  {formatCurrency(testColabPayout)}
                </p>
                <span className="text-[9px] text-slate-400">({activeTestTier.percentage}% de {formatCurrency(testEstimatedComm)})</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onResetTiers}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar Valores Padrão
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 bg-slate-900 text-amber-400 hover:bg-slate-800 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Salvar Tabela de Percentagens
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
