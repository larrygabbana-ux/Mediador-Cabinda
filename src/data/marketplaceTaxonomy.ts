import { MarketplaceCategory } from '../types';

export const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  {
    id: 'feminino',
    name: 'Feminino',
    slug: 'feminino',
    icon: '👗',
    subCategories: [
      { id: 'perucas-cabelos', name: 'Perucas & Cabelos', slug: 'perucas-cabelos' },
      { id: 'roupas-vestidos', name: 'Vestidos & Roupas', slug: 'roupas-vestidos' },
      { id: 'malas-carteiras', name: 'Malas & Bolsas', slug: 'malas-carteiras' },
      { id: 'calcado-feminino', name: 'Sapatos & Sandálias', slug: 'calcado-feminino' },
      { id: 'maquilhagem-beleza', name: 'Maquilhagem & Cosméticos', slug: 'maquilhagem-beleza' },
      { id: 'tecidos-samakaka', name: 'Tecidos & Samakaka', slug: 'tecidos-samakaka' }
    ]
  },
  {
    id: 'masculino',
    name: 'Masculino',
    slug: 'masculino',
    icon: '👔',
    subCategories: [
      { id: 'roupas-camisas', name: 'Camisas & T-Shirts', slug: 'roupas-camisas' },
      { id: 'fatos-blazers', name: 'Fatos & Blazers', slug: 'fatos-blazers' },
      { id: 'calcas-jeans', name: 'Calças & Jeans', slug: 'calcas-jeans' },
      { id: 'calcado-masculino', name: 'Sapatos & Ténis', slug: 'calcado-masculino' },
      { id: 'relogios-acessorios', name: 'Relógios & Acessórios', slug: 'relogios-acessorios' },
      { id: 'perfumes-homem', name: 'Perfumes & Higiene', slug: 'perfumes-homem' }
    ]
  },
  {
    id: 'eletronicos',
    name: 'Eletrónicos',
    slug: 'eletronicos',
    icon: '💻',
    subCategories: [
      { id: 'smartphones-tablets', name: 'Smartphones & Tablets', slug: 'smartphones-tablets' },
      { id: 'computadores-laptops', name: 'Computadores & Portáteis', slug: 'computadores-laptops' },
      { id: 'smart-tvs-som', name: 'Smart TVs & Som', slug: 'smart-tvs-som' },
      { id: 'frigorificos-arcas', name: 'Frigoríficos & Arcas', slug: 'frigorificos-arcas' },
      { id: 'climatizacao-ac', name: 'Ar Condicionado', slug: 'climatizacao-ac' },
      { id: 'pequenos-eletro', name: 'Eletrodomésticos', slug: 'pequenos-eletro' }
    ]
  },
  {
    id: 'alimentos',
    name: 'Alimentos',
    slug: 'alimentos',
    icon: '🌾',
    subCategories: [
      { id: 'xikuanga-fumba-kitaboa', name: 'Produtos de Cabinda (Xikuanga, Fumba, Kitáboa)', slug: 'xikuanga-fumba-kitaboa' },
      { id: 'produtos-frescos', name: 'Tubérculos & Frescos', slug: 'produtos-frescos' },
      { id: 'bombo-seco', name: 'Bombó Seco & Farinhas', slug: 'bombo-seco' },
      { id: 'feijao-cereais', name: 'Feijão & Grãos', slug: 'feijao-cereais' },
      { id: 'peixe-seco-salgado', name: 'Peixe Seco & Marisco', slug: 'peixe-seco-salgado' },
      { id: 'oleo-palma-maiombe', name: 'Óleo de Palma do Maiombe', slug: 'oleo-palma-maiombe' },
      { id: 'fardos-mercearia', name: 'Mercearia & Fardos', slug: 'fardos-mercearia' }
    ]
  },
  {
    id: 'animais',
    name: 'Animais',
    slug: 'animais',
    icon: '🐂',
    subCategories: [
      { id: 'bois-gado-bovino', name: 'Bovinos (Bois & Touros)', slug: 'bois-gado-bovino' },
      { id: 'vacas-leiteiras', name: 'Vacas Leiteiras', slug: 'vacas-leiteiras' },
      { id: 'cabritos-caprinos', name: 'Cabritos & Caprinos', slug: 'cabritos-caprinos' },
      { id: 'porcos-suinos', name: 'Suínos (Porcos & Leitões)', slug: 'porcos-suinos' },
      { id: 'galinhas-aves', name: 'Aves & Galinhas', slug: 'galinhas-aves' },
      { id: 'ovinos-carneiros', name: 'Ovinos & Carneiros', slug: 'ovinos-carneiros' }
    ]
  },
  {
    id: 'energia',
    name: 'Energia',
    slug: 'energia',
    icon: '⚡',
    subCategories: [
      { id: 'paineis-solares', name: 'Painéis Solares', slug: 'paineis-solares' },
      { id: 'inversores-baterias', name: 'Inversores & Baterias', slug: 'inversores-baterias' },
      { id: 'geradores-gasoleo', name: 'Geradores', slug: 'geradores-gasoleo' },
      { id: 'cabos-protecao', name: 'Cabos & Proteção Elétrica', slug: 'cabos-protecao' }
    ]
  },
  {
    id: 'construcao',
    name: 'Construção',
    slug: 'construcao',
    icon: '🏗️',
    subCategories: [
      { id: 'bombas-agua', name: 'Bombas de Água', slug: 'bombas-agua' },
      { id: 'ferramentas-eletricas', name: 'Ferramentas', slug: 'ferramentas-eletricas' },
      { id: 'tintas-impermeabilizacao', name: 'Tintas & Impermeabilização', slug: 'tintas-impermeabilizacao' },
      { id: 'metalurgia-estruturas', name: 'Metalurgia & Estruturas', slug: 'metalurgia-estruturas' }
    ]
  },
  {
    id: 'auto',
    name: 'Auto & Peças',
    slug: 'auto',
    icon: '🚗',
    subCategories: [
      { id: 'pneus-jantes', name: 'Pneus & Jantes', slug: 'pneus-jantes' },
      { id: 'baterias-auto', name: 'Baterias Automóvel', slug: 'baterias-auto' },
      { id: 'lubrificantes-filtros', name: 'Óleos & Filtros', slug: 'lubrificantes-filtros' }
    ]
  },
  {
    id: 'diversos',
    name: 'Diversos',
    slug: 'diversos',
    icon: '📦',
    subCategories: [
      { id: 'casa-decoracao', name: 'Casa & Decoração', slug: 'casa-decoracao' },
      { id: 'utilidades-gerais', name: 'Utilidades & Gerais', slug: 'utilidades-gerais' },
      { id: 'brinquedos-infantil', name: 'Brinquedos & Infantil', slug: 'brinquedos-infantil' },
      { id: 'papelaria-escritorio', name: 'Papelaria & Escritório', slug: 'papelaria-escritorio' },
      { id: 'artesanato-cultura', name: 'Artesanato & Cultura', slug: 'artesanato-cultura' },
      { id: 'outros-artigos', name: 'Outros Artigos', slug: 'outros-artigos' }
    ]
  }
];

export function getCategoryById(idOrSlug: string): MarketplaceCategory | undefined {
  if (!idOrSlug) return undefined;
  return MARKETPLACE_CATEGORIES.find(
    c => c.id === idOrSlug || c.slug === idOrSlug || c.id.toLowerCase() === idOrSlug.toLowerCase()
  );
}

export function getSubCategoryName(categoryId: string, subCategoryId: string): string {
  const cat = getCategoryById(categoryId);
  if (!cat) return subCategoryId;
  const sub = cat.subCategories.find(s => s.id === subCategoryId || s.slug === subCategoryId);
  return sub ? sub.name : subCategoryId;
}

