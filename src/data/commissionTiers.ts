export interface CommissionTier {
  id: string;
  minPrice: number;
  maxPrice: number | null; // null means unbounded (above minPrice)
  percentage: number;
  label: string;
  description: string;
}

export const DEFAULT_COMMISSION_TIERS: CommissionTier[] = [
  {
    id: 'tier-1',
    minPrice: 0,
    maxPrice: 250000,
    percentage: 8,
    label: 'Até 250 Mil Kz',
    description: 'Bens de Pequeno Porte (ex: Vestuário, Acessórios, Cosméticos, Utilidades)'
  },
  {
    id: 'tier-2',
    minPrice: 250000,
    maxPrice: 1000000,
    percentage: 10,
    label: '250 Mil a 1 M Kz',
    description: 'Bens de Médio Porte (ex: Smartphones, Laptops, TV 55", Eletrodomésticos)'
  },
  {
    id: 'tier-3',
    minPrice: 1000000,
    maxPrice: 3000000,
    percentage: 12,
    label: '1 M a 3 M Kz',
    description: 'Bens de Valor Intermédio (ex: Kits Solares, Geradores a Gasolina, Motociclos)'
  },
  {
    id: 'tier-4',
    minPrice: 3000000,
    maxPrice: 8000000,
    percentage: 15,
    label: '3 M a 8 M Kz',
    description: 'Maquinaria Pesada, Geradores Industriais, Cargas de Contentor'
  },
  {
    id: 'tier-5',
    minPrice: 8000000,
    maxPrice: null,
    percentage: 18,
    label: 'Acima de 8 M Kz',
    description: 'Viaturas, Imóveis, Terrenos & Grandes Projetos Industriais'
  }
];

export function getTierForPrice(price: number, tiers: CommissionTier[]): CommissionTier {
  const sortedTiers = [...tiers].sort((a, b) => a.minPrice - b.minPrice);
  for (const tier of sortedTiers) {
    if (price >= tier.minPrice && (tier.maxPrice === null || price < tier.maxPrice)) {
      return tier;
    }
  }
  return sortedTiers[sortedTiers.length - 1] || DEFAULT_COMMISSION_TIERS[0];
}

export function getCommissionRateForPrice(price: number, tiers: CommissionTier[]): number {
  const tier = getTierForPrice(price, tiers);
  return tier ? tier.percentage : 12;
}

export function loadSavedCommissionTiers(): CommissionTier[] {
  try {
    const saved = localStorage.getItem('mediador_cabinda_commission_tiers');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading saved commission tiers:', e);
  }
  return DEFAULT_COMMISSION_TIERS;
}

export function saveCommissionTiers(tiers: CommissionTier[]): void {
  try {
    localStorage.setItem('mediador_cabinda_commission_tiers', JSON.stringify(tiers));
  } catch (e) {
    console.error('Error saving commission tiers:', e);
  }
}
