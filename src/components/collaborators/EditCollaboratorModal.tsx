import React, { useState, useEffect } from 'react';
import { Collaborator } from '../../types';
import { X, Check, User, Percent } from 'lucide-react';

interface EditCollaboratorModalProps {
  collaborator: Collaborator | null;
  onClose: () => void;
  onSave: (updatedCollaborator: Collaborator) => void;
}

export const EditCollaboratorModal: React.FC<EditCollaboratorModalProps> = ({
  collaborator,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Collaborator | null>(collaborator);

  useEffect(() => {
    setFormData(collaborator);
  }, [collaborator]);

  if (!collaborator || !formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 px-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center font-black">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Editar Perfil do Colaborador</h3>
              <p className="text-xs text-blue-200 font-medium">{collaborator.name}</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-800 text-xs font-sans">
          
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Nome Completo *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-250 rounded-xl font-bold text-slate-800 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Telemóvel (AO) *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-250 rounded-xl font-medium text-slate-800 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Email Comercial</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-250 rounded-xl font-medium text-slate-800 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Cargo / Função</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-250 rounded-xl font-bold text-slate-800 focus:outline-hidden"
            >
              <option value="Consultor de Negócios / Afiliado">Consultor de Negócios / Afiliado</option>
              <option value="Agente Independente">Agente Independente</option>
              <option value="Promotor Comercial & Redes">Promotor Comercial & Redes</option>
              <option value="Captador de Clientes">Captador de Clientes</option>
              <option value="Parceiro de Logística">Parceiro de Logística</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Percentagem Padrão de Referência (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={formData.defaultCommissionPercentage}
                onChange={(e) => setFormData({ ...formData, defaultCommissionPercentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                className="w-full p-2.5 pl-9 bg-slate-50 border border-slate-250 rounded-xl font-mono font-black text-slate-800 focus:outline-hidden"
              />
              <div className="absolute left-3 top-3 text-slate-400">
                <Percent className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Nota: Ao lançar cada negócio, o administrador pode alterar ou definir a percentagem livremente em função do bem.
            </p>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 text-amber-400 hover:bg-slate-800 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Atualizar Colaborador
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
