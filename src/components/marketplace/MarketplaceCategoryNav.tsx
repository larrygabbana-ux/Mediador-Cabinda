import React, { useState } from 'react';
import { MARKETPLACE_CATEGORIES } from '../../data/marketplaceTaxonomy';
import { SupplierProduct } from '../../types';
import { Layers, ChevronRight, Check } from 'lucide-react';

interface MarketplaceCategoryNavProps {
  selectedCategory: string;
  selectedSubCategory: string;
  onSelectCategory: (categoryId: string) => void;
  onSelectSubCategory: (subCategoryId: string) => void;
  products: SupplierProduct[];
  variant?: 'horizontal' | 'sidebar' | 'auto';
}

export default function MarketplaceCategoryNav({
  selectedCategory,
  selectedSubCategory,
  onSelectCategory,
  onSelectSubCategory,
  products,
  variant = 'auto'
}: MarketplaceCategoryNavProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Count products per category
  const getProductCount = (categoryId: string) => {
    return products.filter(p => p.published && p.category === categoryId).length;
  };

  const getSubCategoryCount = (categoryId: string, subCategoryId: string) => {
    return products.filter(p => p.published && p.category === categoryId && p.subCategory === subCategoryId).length;
  };

  const activeCategoryObj = MARKETPLACE_CATEGORIES.find(c => c.id === selectedCategory);

  const renderHorizontalNav = () => (
    <div className="w-full space-y-2">
      {/* Main Categories Horizontal Scroll Bar */}
      <div className="overflow-x-auto pb-1 -mx-1 px-1 flex items-center gap-1.5 no-scrollbar scroll-smooth">
        <button
          type="button"
          onClick={() => {
            onSelectCategory('');
            onSelectSubCategory('');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            !selectedCategory
              ? 'bg-slate-900 text-amber-400 shadow-xs ring-2 ring-slate-900/10'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Todas Categorias</span>
          <span className="text-[10px] opacity-75 font-mono">({products.filter(p => p.published).length})</span>
        </button>

        {MARKETPLACE_CATEGORIES.map((cat) => {
          const count = getProductCount(cat.id);
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                if (isSelected) {
                  onSelectCategory('');
                  onSelectSubCategory('');
                } else {
                  onSelectCategory(cat.id);
                  onSelectSubCategory('');
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs ring-2 ring-amber-300'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <span className="text-sm">{cat.icon}</span>
              <span>{cat.name}</span>
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isSelected ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Subcategory Horizontal Chips when Category is selected */}
      {selectedCategory && activeCategoryObj && (
        <div className="overflow-x-auto pb-1 flex items-center gap-1.5 no-scrollbar bg-slate-50 border border-slate-200/80 p-2 rounded-2xl animate-fade-in">
          <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider px-1.5 shrink-0 flex items-center gap-1">
            <span>{activeCategoryObj.icon}</span>
            <span>{activeCategoryObj.name}:</span>
          </span>

          <button
            type="button"
            onClick={() => onSelectSubCategory('')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
              !selectedSubCategory
                ? 'bg-amber-400 text-slate-950 font-black shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Tudo ({getProductCount(selectedCategory)})
          </button>

          {activeCategoryObj.subCategories.map((sub) => {
            const isSubSelected = selectedSubCategory === sub.id;
            const subCount = getSubCategoryCount(selectedCategory, sub.id);
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => onSelectSubCategory(isSubSelected ? '' : sub.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                  isSubSelected
                    ? 'bg-amber-400 text-slate-950 font-black shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{sub.name}</span>
                {subCount > 0 && (
                  <span className={`text-[9.5px] font-mono font-bold px-1 rounded-full ${
                    isSubSelected ? 'bg-slate-950 text-white' : 'text-slate-500 bg-slate-100'
                  }`}>
                    {subCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  if (variant === 'horizontal') {
    return renderHorizontalNav();
  }

  return (
    <div className="w-full">
      {/* Mobile/Tablet Horizontal Scrollable Category Bar */}
      <div className={variant === 'auto' ? 'lg:hidden' : ''}>
        {renderHorizontalNav()}
      </div>

      {/* Desktop Vertical Menu (Aliexpress style) */}
      {variant === 'auto' && (
        <div className="hidden lg:block bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden relative">
          <div className="p-3.5 bg-slate-900 text-amber-400 font-black text-xs uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Departamentos
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {products.filter(p => p.published).length} Artigos
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {/* All button */}
            <button
              type="button"
              onClick={() => {
                onSelectCategory('');
                onSelectSubCategory('');
              }}
              className={`w-full px-3.5 py-2.5 text-xs text-left font-bold flex items-center justify-between transition-colors cursor-pointer ${
                !selectedCategory
                  ? 'bg-amber-50 text-amber-950 font-black border-l-4 border-amber-500'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>🌟</span>
                <span>Todos os Produtos Homologados</span>
              </span>
              {!selectedCategory && <Check className="w-3.5 h-3.5 text-amber-600" />}
            </button>

            {/* Category List */}
            {MARKETPLACE_CATEGORIES.map((cat) => {
              const count = getProductCount(cat.id);
              const isSelected = selectedCategory === cat.id;
              const isHovered = hoveredCategory === cat.id;

              return (
                <div
                  key={cat.id}
                  onMouseEnter={() => setHoveredCategory(cat.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className="relative"
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        onSelectCategory('');
                        onSelectSubCategory('');
                      } else {
                        onSelectCategory(cat.id);
                        onSelectSubCategory('');
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 text-xs text-left font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50 text-amber-950 font-black border-l-4 border-amber-500'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="text-sm">{cat.icon}</span>
                      <span className="truncate">{cat.name}</span>
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {count > 0 && (
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-bold">
                          {count}
                        </span>
                      )}
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isHovered || isSelected ? 'text-amber-600 translate-x-0.5' : 'text-slate-300'}`} />
                    </div>
                  </button>

                  {/* Flyout Subcategories Panel on Hover/Active */}
                  {isHovered && (
                    <div
                      className="absolute left-full top-0 w-64 bg-white border border-slate-200 shadow-xl rounded-xl p-3 z-30 space-y-1.5 animate-scale-up"
                      style={{ minHeight: '100%' }}
                    >
                      <div className="text-[10px] font-black uppercase text-amber-700 tracking-wider pb-1 border-b border-slate-100 flex items-center justify-between">
                        <span>{cat.name}</span>
                        <span>Subcategorias</span>
                      </div>

                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectCategory(cat.id);
                            onSelectSubCategory('');
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between ${
                            isSelected && !selectedSubCategory
                              ? 'bg-amber-100 text-amber-950 font-black'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>Ver Toda a Categoria</span>
                          <span className="text-[10px] font-mono text-slate-500 font-bold">{count}</span>
                        </button>

                        {cat.subCategories.map((sub) => {
                          const subCount = getSubCategoryCount(cat.id, sub.id);
                          const isSubActive = selectedCategory === cat.id && selectedSubCategory === sub.id;
                          return (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => {
                                onSelectCategory(cat.id);
                                onSelectSubCategory(sub.id);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between ${
                                isSubActive
                                  ? 'bg-amber-100 text-amber-950 font-black'
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <span className="truncate">{sub.name}</span>
                              {subCount > 0 && (
                                <span className="text-[10px] font-mono text-slate-500 font-bold ml-2">
                                  {subCount}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
