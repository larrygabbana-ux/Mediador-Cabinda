import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown, ShieldCheck } from 'lucide-react';
import { MARKETPLACE_CATEGORIES } from '../../data/marketplaceTaxonomy';
import { Supplier } from '../../types';

interface MarketplaceSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (catId: string) => void;
  selectedSupplier: string;
  onSupplierChange: (suppId: string) => void;
  selectedLocation: string;
  onLocationChange: (loc: string) => void;
  sortBy: 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'sales';
  onSortByChange: (sort: 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'sales') => void;
  onlyInStock: boolean;
  onToggleOnlyInStock: () => void;
  onlySponsored: boolean;
  onToggleOnlySponsored: () => void;
  suppliers: Supplier[];
  totalResultsCount: number;
}

export default function MarketplaceSearchBar({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedSupplier,
  onSupplierChange,
  selectedLocation,
  onLocationChange,
  sortBy,
  onSortByChange,
  onlyInStock,
  onToggleOnlyInStock,
  onlySponsored,
  onToggleOnlySponsored,
  suppliers,
  totalResultsCount
}: MarketplaceSearchBarProps) {
  const hasActiveFilters = Boolean(
    searchTerm ||
    selectedCategory ||
    selectedSupplier ||
    selectedLocation ||
    onlyInStock ||
    onlySponsored
  );

  const handleClearAll = () => {
    onSearchChange('');
    onCategoryChange('');
    onSupplierChange('');
    onLocationChange('');
    if (onlyInStock) onToggleOnlyInStock();
    if (onlySponsored) onToggleOnlySponsored();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-2xs space-y-3">
      {/* Top Search Input Bar (Aliexpress / Amazon style) */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        {/* Category selector dropdown */}
        <div className="w-full sm:w-auto shrink-0">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full sm:w-48 text-xs font-bold bg-slate-50 border border-slate-250 text-slate-850 py-2.5 px-3 rounded-xl focus:border-amber-400 focus:outline-none cursor-pointer"
          >
            <option value="">Todas Categorias</option>
            {MARKETPLACE_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search input field */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Pesquisar por nome do produto, código SKU (ex: PRD-1001), marca..."
            className="w-full text-xs font-semibold pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-250 rounded-xl focus:border-amber-400 focus:bg-white focus:outline-none transition-colors text-slate-900 placeholder:text-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="w-full sm:w-auto flex items-center gap-1.5 shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as any)}
            className="w-full sm:w-44 text-xs font-bold bg-slate-50 border border-slate-250 text-slate-850 py-2.5 px-3 rounded-xl focus:border-amber-400 focus:outline-none cursor-pointer"
          >
            <option value="relevance">Mais Relevantes</option>
            <option value="price-asc">Preço: Mais Baixo</option>
            <option value="price-desc">Preço: Mais Alto</option>
            <option value="sales">Mais Vendidos</option>
            <option value="rating">Melhor Avaliados</option>
          </select>
        </div>
      </div>

      {/* Filter Chips & Quick Badges Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
        {/* Left Filter Tags */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            Filtros:
          </span>

          {/* Filter: Pronta entrega */}
          <button
            type="button"
            onClick={onToggleOnlyInStock}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              onlyInStock
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ✓ Stock Imediato
          </button>

          {/* Filter: Destaques Homologados */}
          <button
            type="button"
            onClick={onToggleOnlySponsored}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              onlySponsored
                ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ⭐ Destaques
          </button>

          {/* Filter: Location (Luanda / Cabinda) */}
          <button
            type="button"
            onClick={() => onLocationChange(selectedLocation === 'Luanda' ? '' : 'Luanda')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              selectedLocation === 'Luanda'
                ? 'bg-slate-900 text-amber-400 font-black shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            📍 Armazém Luanda
          </button>

          <button
            type="button"
            onClick={() => onLocationChange(selectedLocation === 'Cabinda' ? '' : 'Cabinda')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              selectedLocation === 'Cabinda'
                ? 'bg-slate-900 text-amber-400 font-black shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            📍 Pronta Entrega Cabinda
          </button>

          {/* Filter: Supplier Dropdown */}
          <select
            value={selectedSupplier}
            onChange={(e) => onSupplierChange(e.target.value)}
            className="text-[11px] font-bold bg-slate-100 border-none text-slate-700 py-1 px-2.5 rounded-lg focus:ring-1 focus:ring-amber-400 cursor-pointer"
          >
            <option value="">Todos Fornecedores</option>
            {suppliers.map((supp) => (
              <option key={supp.id} value={supp.id}>
                {supp.name} ({supp.city})
              </option>
            ))}
          </select>
        </div>

        {/* Right Info: Total count & Clear button */}
        <div className="flex items-center gap-2 font-semibold">
          <span className="text-[11px] text-slate-500">
            <strong className="text-slate-900 font-mono">{totalResultsCount}</strong> artigos encontrados
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <X className="w-3 h-3" />
              Limpar filtros
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
