import React, { useState } from 'react';
import { SupplierProduct, Supplier } from '../../types';
import { Star, ShieldCheck, MapPin, Eye, Zap, Truck, Tag } from 'lucide-react';
import { getCategoryById } from '../../data/marketplaceTaxonomy';

interface ProductCardProps {
  key?: string;
  product: SupplierProduct;
  supplier?: Supplier;
  onSelectProduct: (product: SupplierProduct) => void;
  onQuickBuy: (product: SupplierProduct) => void;
}

export default function ProductCard({
  product,
  supplier,
  onSelectProduct,
  onQuickBuy
}: ProductCardProps) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const photos = product.photos && product.photos.length > 0 ? product.photos : [product.photoUrl];
  const currentPhoto = photos[activePhotoIdx] || product.photoUrl;

  const code = product.productCode || `PRD-${(product.id || '1001').slice(-4).toUpperCase()}`;
  const isEsgotado = product.availability === 'esgotado';
  const isSobPedido = product.availability === 'sob-pedido';
  const categoryInfo = product.category ? getCategoryById(product.category) : undefined;

  // Calculate discount percentage if originalPrice exists
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div
      id={`product-card-${product.id}`}
      className="group bg-white border border-slate-200 hover:border-amber-400 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col justify-between shadow-2xs hover:shadow-md relative"
    >
      {/* Top Image Container */}
      <div className="relative aspect-4/3 sm:aspect-square bg-slate-50 overflow-hidden cursor-pointer" onClick={() => onSelectProduct(product)}>
        <img
          src={currentPhoto}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {discountPercent && (
            <span className="bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wider">
              -{discountPercent}%
            </span>
          )}
          {product.sponsored && (
            <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wider">
              Destaque
            </span>
          )}
        </div>

        {/* Location Badge */}
        <div className="absolute top-2 right-2 z-10">
          <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[9.5px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
            <MapPin className="w-2.5 h-2.5 text-amber-400" />
            {product.location || 'Luanda'}
          </span>
        </div>

        {/* Multi-photo indicator dots on hover */}
        {photos.length > 1 && (
          <div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-900/70 backdrop-blur-xs px-2 py-1 rounded-full flex items-center gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            {photos.slice(0, 5).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActivePhotoIdx(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                  activePhotoIdx === idx ? 'bg-amber-400 scale-125' : 'bg-white/60 hover:bg-white'
                }`}
                title={`Foto ${idx + 1}`}
              />
            ))}
            {photos.length > 5 && (
              <span className="text-[8px] text-white/80 font-mono ml-0.5">+{photos.length - 5}</span>
            )}
          </div>
        )}

        {/* SKU code tag in bottom left */}
        <div className="absolute bottom-2 left-2 z-10">
          <span className="bg-slate-900/85 backdrop-blur-xs text-amber-300 font-mono font-black text-[9px] px-1.5 py-0.5 rounded border border-slate-700/50">
            {code}
          </span>
        </div>
      </div>

      {/* Product Content Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Category & Rating Bar */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold gap-1">
            <span className="truncate hover:text-slate-800 transition-colors">
              {categoryInfo ? `${categoryInfo.icon} ${categoryInfo.name}` : 'Mercado Homologado'}
            </span>
            <div className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating || 4.8}</span>
              {product.salesCount !== undefined && (
                <span className="text-slate-400 font-normal text-[9px]">({product.salesCount})</span>
              )}
            </div>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onSelectProduct(product)}
            className="text-xs font-bold text-slate-850 line-clamp-2 hover:text-amber-600 transition-colors cursor-pointer leading-snug"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Supplier Info */}
          <div className="flex items-center gap-1 text-[10px] text-slate-500 truncate">
            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="truncate">{supplier?.name || 'Parceiro Verificado Mediador'}</span>
          </div>
        </div>

        {/* Price & Availability Section */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="font-mono text-sm sm:text-base font-black text-slate-900 tracking-tight">
                {product.price.toLocaleString('pt-AO')} Kz
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="font-mono text-[10px] text-slate-400 line-through">
                  {product.originalPrice.toLocaleString('pt-AO')} Kz
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-1 text-[10px]">
              <span className={`font-bold ${
                isEsgotado ? 'text-rose-600' : isSobPedido ? 'text-sky-700' : 'text-emerald-700'
              }`}>
                {isEsgotado ? '• Esgotado' : isSobPedido ? '• Sob Pedido' : '• Stock Disponível'}
              </span>
              <span className="text-slate-400 flex items-center gap-0.5">
                <Truck className="w-2.5 h-2.5 text-amber-500" />
                Despacho Seguro
              </span>
            </div>
          </div>

          {/* Action Buttons: Ver Detalhes & Compra Rápida */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => onSelectProduct(product)}
              className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <Eye className="w-3 h-3 text-slate-600" />
              <span>Detalhes</span>
            </button>

            <button
              type="button"
              onClick={() => onQuickBuy(product)}
              className="px-2 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 text-[11px] font-black rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs active:scale-97"
            >
              <Zap className="w-3 h-3 fill-slate-950" />
              <span>Intermediar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
