import React, { useState } from 'react';
import { SupplierProduct, Supplier, Order } from '../../types';
import { 
  X, 
  Star, 
  ShieldCheck, 
  MapPin, 
  Truck, 
  Zap, 
  MessageSquare, 
  Calendar, 
  CheckCircle2, 
  ChevronRight, 
  Package, 
  FileText,
  Clock,
  Award,
  Share2,
  Info
} from 'lucide-react';
import { getCategoryById, getSubCategoryName } from '../../data/marketplaceTaxonomy';

interface ProductDetailsModalProps {
  product: SupplierProduct | null;
  suppliers: Supplier[];
  allProducts: SupplierProduct[];
  onClose: () => void;
  onSelectProduct: (product: SupplierProduct) => void;
  onInitiateChat: (product: SupplierProduct, code: string) => void;
  onCreateDirectOrder: (orderData: Partial<Order>) => void;
}

export default function ProductDetailsModal({
  product,
  suppliers,
  allProducts,
  onClose,
  onSelectProduct,
  onInitiateChat,
  onCreateDirectOrder
}: ProductDetailsModalProps) {
  if (!product) return null;

  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [isDirectBuyMode, setIsDirectBuyMode] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [deliveryOption, setDeliveryOption] = useState<'escritorio' | 'domicilio'>('escritorio');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'specs' | 'guarantee' | 'logistics'>('specs');
  const [copiedLink, setCopiedLink] = useState(false);

  const photos = product.photos && product.photos.length > 0 ? product.photos : [product.photoUrl];
  const currentPhoto = photos[selectedPhotoIdx] || product.photoUrl;

  const supplier = suppliers.find(s => s.id === product.supplierId);
  const code = product.productCode || `PRD-${(product.id || '1001').slice(-4).toUpperCase()}`;
  const isEsgotado = product.availability === 'esgotado';
  const isSobPedido = product.availability === 'sob-pedido';

  const category = product.category ? getCategoryById(product.category) : undefined;
  const subCategoryName = product.category && product.subCategory 
    ? getSubCategoryName(product.category, product.subCategory) 
    : undefined;

  // Cost calculations for direct buy
  const itemSubtotal = product.price * quantity;
  const freightEst = Math.min(65000, Math.max(12000, Math.round(itemSubtotal * 0.08)));
  const dispatchEst = Math.min(45000, Math.max(15000, Math.round(itemSubtotal * 0.06)));
  const deliveryExtra = deliveryOption === 'domicilio' ? 5000 : 0;
  const grandTotal = itemSubtotal + freightEst + dispatchEst + deliveryExtra;

  // Similar products in same category
  const relatedProducts = allProducts
    .filter(p => p.id !== product.id && p.published && (p.category === product.category || p.supplierId === product.supplierId))
    .slice(0, 4);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/#produto-${code}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleConfirmDirectBuy = () => {
    const isCabindaOrigin = (product.location || supplier?.city || supplier?.addressHidden || '').toLowerCase().includes('cabinda');
    const routeDirection = isCabindaOrigin ? 'Cabinda-Luanda' : 'Luanda-Cabinda';

    onCreateDirectOrder({
      productId: product.id,
      productCode: code,
      productName: product.name,
      quantity,
      supplierName: supplier?.name || 'Fornecedor Homologado',
      supplierPhone: supplier?.phoneHidden || '+244 924 111 222',
      supplierLocation: product.location || supplier?.city || supplier?.addressHidden || (isCabindaOrigin ? 'Cabinda' : 'Luanda'),
      routeDirection,
      originCity: isCabindaOrigin ? 'Cabinda' : 'Luanda',
      destinationCity: isCabindaOrigin ? 'Luanda' : 'Cabinda',
      productPhotoUrl: product.photoUrl,
      notes: orderNotes ? `[Compra Direta SKU: ${code}] ${orderNotes}` : `Compra Direta de artigo homologado ${code} - ${product.name}`,
      budgetRawPrice: itemSubtotal,
      budgetShipping: freightEst,
      dispatchFee: dispatchEst,
      commissionRate: 0.12,
      commissionAmount: Math.round(itemSubtotal * 0.12),
      totalAmount: grandTotal,
      paid: false,
      deliveryOption,
      deliveryAddress: deliveryOption === 'domicilio' 
        ? (deliveryAddress || (isCabindaOrigin ? 'Luanda' : 'Cabinda')) 
        : (isCabindaOrigin ? 'Balcão / Depósito Central de Luanda' : 'Balcão Armazém C-4, Porto Comercial de Cabinda'),
      status: 'RECEBIDO',
      pointsEarned: Math.round(itemSubtotal / 1000)
    });
    onClose();
  };

  return (
    <div
      id="product-details-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="product-details-modal-container"
        className="bg-white border border-slate-200 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header with Breadcrumbs & Close Button */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 overflow-hidden font-semibold">
            <span className="hover:text-slate-800 cursor-pointer" onClick={onClose}>Início</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {category && (
              <>
                <span className="text-slate-700 font-bold truncate">{category.name}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </>
            )}
            {subCategoryName && (
              <>
                <span className="text-slate-700 truncate hidden sm:inline">{subCategoryName}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:inline" />
              </>
            )}
            <span className="font-mono text-amber-700 font-black bg-amber-100 px-1.5 py-0.5 rounded text-[11px] shrink-0">
              {code}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 font-bold"
              title="Copiar link do produto"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">{copiedLink ? 'Copiado! ✓' : 'Partilhar'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors cursor-pointer font-bold"
              title="Fechar (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {!isDirectBuyMode ? (
            <>
              {/* Top Main Section: Photo Gallery (Left) + Purchase Overview (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Interactive Multi-Photo Gallery (5 cols) */}
                <div className="lg:col-span-6 space-y-3">
                  {/* Main Large Photo Box */}
                  <div className="relative aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs group">
                    <img
                      src={currentPhoto}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />

                    {/* Top Ribbon Tags */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                      {product.sponsored && (
                        <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                          ⭐ Destaque Homologado
                        </span>
                      )}
                      {product.tags?.map((t, idx) => (
                        <span key={idx} className="bg-slate-900/85 backdrop-blur-xs text-white text-[9.5px] font-bold px-2 py-0.5 rounded shadow-xs">
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* SKU watermark in corner */}
                    <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-xs text-white font-mono font-black text-[10px] px-2.5 py-1 rounded-lg border border-white/20">
                      <span>🏷️ {code}</span>
                    </div>

                    {/* Photo counter */}
                    <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                      {selectedPhotoIdx + 1} / {photos.length}
                    </div>
                  </div>

                  {/* Thumbnail Strip (Up to 8 photos) */}
                  {photos.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {photos.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedPhotoIdx(idx)}
                          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer bg-slate-50 ${
                            selectedPhotoIdx === idx
                              ? 'border-amber-500 ring-2 ring-amber-300 shadow-sm scale-102'
                              : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={url}
                            alt={`${product.name} foto ${idx + 1}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Product Details & Fast Action Panel (7 cols) */}
                <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    {/* Header: Title and Badges */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-bold text-slate-800">
                          <MapPin className="w-3.5 h-3.5 text-amber-500" />
                          {product.location || 'Luanda'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {product.availableFromDate || 'Imediata (Hoje)'}
                        </span>
                        <span>•</span>
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{product.rating || 4.8}</span>
                          <span className="text-slate-400 font-normal">({product.salesCount || 25} vendas)</span>
                        </div>
                      </div>

                      <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-snug tracking-tight">
                        {product.name}
                      </h1>
                    </div>

                    {/* Price Card */}
                    <div className="p-4 bg-amber-500/10 border border-amber-300 rounded-2xl flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 block">
                          Preço Base Homologado
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-xl sm:text-2xl font-black text-slate-950">
                            {product.price.toLocaleString('pt-AO')} Kz
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="font-mono text-xs text-slate-400 line-through">
                              {product.originalPrice.toLocaleString('pt-AO')} Kz
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-black text-amber-900 bg-amber-200 px-2.5 py-1 rounded-full border border-amber-300 inline-block">
                          Intermediação Segura
                        </span>
                        <p className="text-[9.5px] text-slate-500 font-semibold mt-0.5">Inclui emissão de guia de transporte</p>
                      </div>
                    </div>

                    {/* Stock & Partner Identification Card */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-600 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          Fornecedor: <strong className="text-slate-900">{supplier?.name || 'Distribuidor Homologado'}</strong>
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-black text-[10px] ${
                          isEsgotado ? 'bg-rose-100 text-rose-800' : isSobPedido ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isEsgotado ? 'Esgotado' : isSobPedido ? 'Sob Pedido' : `Stock: ${product.stock} un.`}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200/80 text-slate-600 font-semibold">
                        <div>📦 Condição: <strong className="text-slate-800 capitalize">{product.condition || 'Novo em Caixa'}</strong></div>
                        <div>🛡️ Garantia: <strong className="text-slate-800">{product.warranty || 'Garantia Mediador'}</strong></div>
                      </div>
                    </div>

                    {/* Short Description */}
                    <p className="text-xs text-slate-600 leading-relaxed font-medium bg-white p-3 rounded-xl border border-slate-150">
                      {product.description || 'Artigo homologado de alta qualidade técnica e robustez, inspecionado pela equipa portuária antes do despacho Luanda ➔ Cabinda.'}
                    </p>

                    {/* Security Notice */}
                    <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl text-[10.5px] text-sky-900 flex items-start gap-2 leading-relaxed font-semibold">
                      <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Garantia de Não-Fraude Mediador Cabinda:</strong> Nós compramos o artigo diretamente no armazém parceiro, conferimos as especificações físicas, emitimos o manifesto de carga e entregamos em Cabinda.
                      </div>
                    </div>
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Button 1: Direct Buy / Intermediation */}
                      <button
                        type="button"
                        onClick={() => setIsDirectBuyMode(true)}
                        className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider active:scale-98"
                      >
                        <Zap className="w-4 h-4 fill-slate-950" />
                        <span>Fazer Compra Direta</span>
                      </button>

                      {/* Button 2: Chat with Seller & Mediator */}
                      <button
                        type="button"
                        onClick={() => onInitiateChat(product, code)}
                        className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Consultar / Negociar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Specifications Tabs */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                {/* Tab selector */}
                <div className="flex border-b border-slate-200 bg-white">
                  <button
                    type="button"
                    onClick={() => setActiveTab('specs')}
                    className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'specs'
                        ? 'border-amber-500 text-slate-950 font-black bg-amber-50/30'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Especificações Técnicas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('logistics')}
                    className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'logistics'
                        ? 'border-amber-500 text-slate-950 font-black bg-amber-50/30'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Prazos & Logística Luanda ➔ Cabinda</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('guarantee')}
                    className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'guarantee'
                        ? 'border-amber-500 text-slate-950 font-black bg-amber-50/30'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Garantia & Vistoria Aduaneira</span>
                  </button>
                </div>

                {/* Tab content */}
                <div className="p-4 bg-white text-xs">
                  {activeTab === 'specs' && (
                    <div className="space-y-3">
                      {product.specifications && product.specifications.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {product.specifications.map((spec, idx) => (
                            <div key={idx} className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between">
                              <span className="text-slate-500 font-semibold">{spec.key}:</span>
                              <strong className="text-slate-900 text-right ml-2">{spec.value}</strong>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between">
                            <span className="text-slate-500 font-semibold">Código SKU:</span>
                            <strong className="text-slate-900 font-mono">{code}</strong>
                          </div>
                          <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between">
                            <span className="text-slate-500 font-semibold">Estado de Conservação:</span>
                            <strong className="text-slate-900">Novo em Caixa Lacrada</strong>
                          </div>
                          <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between">
                            <span className="text-slate-500 font-semibold">Localização de Stock:</span>
                            <strong className="text-slate-900">{product.location || 'Luanda'}</strong>
                          </div>
                          <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between">
                            <span className="text-slate-500 font-semibold">Vistoria Prévia:</span>
                            <strong className="text-emerald-700">100% Inspecionado pelo Mediador</strong>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'logistics' && (
                    <div className="space-y-3 leading-relaxed text-slate-700 font-medium">
                      <p>Disponibilizamos 2 modalidades operacionais para entrega deste artigo em Cabinda:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-sky-900">
                            <span>✈️</span>
                            <span>Via Aérea (TAAG Cargo Express)</span>
                          </div>
                          <p className="text-[11px] text-sky-800">Prazo médio: <strong>1 a 2 dias úteis</strong>. Ideal para eletrónicos leves, computadores e medicamentos.</p>
                        </div>

                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                            <span>🚢</span>
                            <span>Via Marítima (Cabotagem de Carga)</span>
                          </div>
                          <p className="text-[11px] text-emerald-800">Prazo médio: <strong>6 a 8 dias de porto a porto</strong>. Tarifa mais económica para geradores, solares e cargas pesadas.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'guarantee' && (
                    <div className="space-y-2.5 text-slate-700 font-medium leading-relaxed">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <p><strong>Vistoria Física Obrigatória:</strong> A equipa técnica do Mediador em Luanda valida o número de série, condição física e funcionamento antes de efetuar o pagamento ao fornecedor.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <p><strong>Emissão de Guia de Cabotagem Legal:</strong> Todos os volumes acompanham fatura comercial oficial e guia aduaneira para evitar retenções fiscais no Porto de Cabinda.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Related Products Carousel */}
              {relatedProducts.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                    Produtos Relacionados & Destaques Recomendados
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {relatedProducts.map((relProd) => {
                      const relCode = relProd.productCode || `PRD-${relProd.id.slice(-4)}`;
                      return (
                        <div
                          key={relProd.id}
                          onClick={() => onSelectProduct(relProd)}
                          className="bg-slate-50 hover:bg-amber-50/50 border border-slate-200 hover:border-amber-400 p-2.5 rounded-xl transition-all cursor-pointer space-y-1.5 text-left group shadow-2xs"
                        >
                          <div className="aspect-square bg-white rounded-lg overflow-hidden border border-slate-200">
                            <img
                              src={relProd.photoUrl}
                              alt={relProd.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="font-mono text-[9px] font-black text-amber-900 bg-amber-200 px-1.5 py-0.2 rounded">
                            {relCode}
                          </span>
                          <h4 className="text-[11px] font-bold text-slate-900 line-clamp-1 group-hover:text-amber-700">
                            {relProd.name}
                          </h4>
                          <p className="font-mono text-xs font-black text-slate-900">
                            {relProd.price.toLocaleString('pt-AO')} Kz
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* QUICK DIRECT BUY FORM VIEW */
            <div className="space-y-4 animate-fade-in max-w-2xl mx-auto">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Solicitação de Intermediação & Compra Direta
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Preencha os detalhes para a equipa do Mediador Cabinda adquirir o artigo no fornecedor.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDirectBuyMode(false)}
                  className="text-xs font-bold text-amber-700 hover:underline cursor-pointer"
                >
                  ← Voltar aos Detalhes
                </button>
              </div>

              {/* Product mini bar */}
              <div className="bg-amber-50 border border-amber-250 p-3 rounded-2xl flex items-center gap-3">
                <img
                  src={currentPhoto}
                  alt={product.name}
                  className="w-14 h-14 rounded-xl object-cover border border-amber-300 bg-white shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="overflow-hidden flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-mono text-[9px] font-black text-amber-950 bg-amber-200 px-1.5 py-0.5 rounded">
                      {code}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">📍 {product.location || 'Luanda'}</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 truncate">{product.name}</h4>
                  <p className="font-mono text-xs font-black text-slate-900 mt-0.5">
                    {product.price.toLocaleString('pt-AO')} AOA / unidade
                  </p>
                </div>
              </div>

              {/* Quantity selector */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Quantidade Pretendida</span>
                  <span className="text-[10px] text-slate-500">Stock disponível: {product.stock || 10} unidades</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-250 text-slate-800 font-black text-sm flex items-center justify-center hover:bg-slate-100 cursor-pointer shadow-2xs"
                  >
                    -
                  </button>
                  <span className="font-mono font-black text-sm w-6 text-center text-slate-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-250 text-slate-800 font-black text-sm flex items-center justify-center hover:bg-slate-100 cursor-pointer shadow-2xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Delivery mode */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  Modalidade de Levantamento / Entrega em Cabinda
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryOption('escritorio')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      deliveryOption === 'escritorio'
                        ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs block font-bold">🏢 Balcão Porto Comercial</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Armazém C-4 Cabinda (Sem custo extra)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryOption('domicilio')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      deliveryOption === 'domicilio'
                        ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs block font-bold">🚚 Entrega ao Domicílio</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">+5.000 AOA em qualquer bairro</span>
                  </button>
                </div>

                {deliveryOption === 'domicilio' && (
                  <div className="pt-1">
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={e => setDeliveryAddress(e.target.value)}
                      placeholder="Indique o Bairro, Rua e Ponto de Referência em Cabinda..."
                      className="w-full text-xs p-2.5 bg-white border border-slate-250 rounded-xl focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Order notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  Observações ou Requisitos Adicionais (Opcional)
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                  placeholder="Ex: Favor confirmar voltagem, cabo de alimentação incluído, cor..."
                  className="w-full text-xs p-2.5 bg-white border border-slate-250 rounded-xl focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Cost breakdown */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-1.5 text-xs font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span>Valor dos Artigos ({quantity}x):</span>
                  <span className="font-mono text-slate-900 font-bold">{itemSubtotal.toLocaleString('pt-AO')} Kz</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Estimativa de Frete Luanda ➔ Cabinda:</span>
                  <span className="font-mono">{freightEst.toLocaleString('pt-AO')} Kz</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Despacho Aduaneiro & Guia de Cabotagem:</span>
                  <span className="font-mono">{dispatchEst.toLocaleString('pt-AO')} Kz</span>
                </div>
                {deliveryOption === 'domicilio' && (
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Taxa de Entrega ao Domicílio:</span>
                    <span className="font-mono">5.000 Kz</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-900">Total Estimado da Operação:</span>
                  <span className="font-mono text-base font-black text-amber-700">
                    {grandTotal.toLocaleString('pt-AO')} Kz
                  </span>
                </div>
              </div>

              {/* Action Submit */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsDirectBuyMode(false)}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDirectBuy}
                  className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md cursor-pointer uppercase tracking-wider"
                >
                  ✓ Confirmar e Enviar Pedido de Compra
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
