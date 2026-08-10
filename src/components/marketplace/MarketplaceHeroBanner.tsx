import React from 'react';
import { ShieldCheck, Truck, Clock, Sparkles, ArrowRight, Anchor, Cpu, SunMedium } from 'lucide-react';

interface MarketplaceHeroBannerProps {
  onQuickCategory: (catId: string) => void;
  onOpenOrderModal: () => void;
  onOpenCalculator: () => void;
}

export default function MarketplaceHeroBanner({
  onQuickCategory,
  onOpenOrderModal,
  onOpenCalculator
}: MarketplaceHeroBannerProps) {
  return (
    <div className="space-y-3">
      {/* Vitrine Banner Container */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-7 text-white shadow-lg overflow-hidden relative">
        {/* Background Subtle Accent Grids & Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Main Headline & Fast Actions */}
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Vitrine Oficial • Luanda ➔ Cabinda</span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              O Maior Mercado de Fornecedores Verificados para Cabinda.
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Compre artigos de informática, energia solar, climatização, peças auto e grossistas em Luanda com <strong>inspeção física no armazém</strong>, emissão de guia de cabotagem e despacho seguro até ao Porto ou sua casa em Cabinda.
            </p>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={onOpenOrderModal}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
              >
                <span>Fazer Pedido sob Medida</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={onOpenCalculator}
                className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-800 text-amber-300 border border-amber-400/30 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Simulador de Frete Aéreo & Marítimo</span>
              </button>
            </div>
          </div>

          {/* Quick Highlight Cards (Right side 4 cols) */}
          <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-2.5">
            {/* Quick Tag 1 */}
            <div
              onClick={() => onQuickCategory('energia')}
              className="bg-slate-850/80 hover:bg-slate-800 border border-slate-750 p-3 rounded-2xl transition-all cursor-pointer group flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <SunMedium className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-white group-hover:text-amber-300 truncate">Energia Solar & Geradores</h4>
                <p className="text-[10px] text-slate-400">Painéis Tier-1 & Grupos Diesel</p>
              </div>
            </div>

            {/* Quick Tag 2 */}
            <div
              onClick={() => onQuickCategory('eletronicos')}
              className="bg-slate-850/80 hover:bg-slate-800 border border-slate-750 p-3 rounded-2xl transition-all cursor-pointer group flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-sky-400/20 text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-white group-hover:text-sky-300 truncate">Informática & Laptops</h4>
                <p className="text-[10px] text-slate-400">HP, Dell, Mikrotik & Redes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Pillars of Confidence Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        <div className="bg-white border border-slate-200 p-3 rounded-2xl flex items-center gap-3 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Inspecção Física 100%</h4>
            <p className="text-[10px] text-slate-500">Testamos os artigos no fornecedor em Luanda antes de pagar.</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3 rounded-2xl flex items-center gap-3 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Anchor className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Guia de Cabotagem Legal</h4>
            <p className="text-[10px] text-slate-500">Documentação aduaneira e seguro de trânsito marítimo e aéreo.</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3 rounded-2xl flex items-center gap-3 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Entrega Rápida em Cabinda</h4>
            <p className="text-[10px] text-slate-500">Levantamento no Balcão do Porto ou entrega direta no seu bairro.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
