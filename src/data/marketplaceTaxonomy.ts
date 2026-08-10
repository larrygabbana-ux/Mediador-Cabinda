import { MarketplaceCategory } from '../types';

export const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  {
    id: 'feminino',
    name: 'Feminino & Mulheres',
    slug: 'feminino',
    icon: '👗',
    subCategories: [
      { id: 'perucas-cabelos', name: 'Perucas & Cabelos Humanos / Frontais', slug: 'perucas-cabelos' },
      { id: 'roupas-vestidos', name: 'Vestidos & Roupas de Mulher', slug: 'roupas-vestidos' },
      { id: 'malas-carteiras', name: 'Malas, Bolsas & Carteiras', slug: 'malas-carteiras' },
      { id: 'calcado-feminino', name: 'Sapatos de Salto & Sandálias', slug: 'calcado-feminino' },
      { id: 'maquilhagem-beleza', name: 'Maquilhagem, Cosméticos & Cuidados', slug: 'maquilhagem-beleza' },
      { id: 'tecidos-samakaka', name: 'Tecidos Africanos & Samakaka', slug: 'tecidos-samakaka' }
    ]
  },
  {
    id: 'masculino',
    name: 'Masculino & Homens',
    slug: 'masculino',
    icon: '👔',
    subCategories: [
      { id: 'roupas-camisas', name: 'Camisas, Polos & T-Shirts', slug: 'roupas-camisas' },
      { id: 'fatos-blazers', name: 'Fatos Executivos & Blazers', slug: 'fatos-blazers' },
      { id: 'calcas-jeans', name: 'Calças de Fato & Jeans', slug: 'calcas-jeans' },
      { id: 'calcado-masculino', name: 'Sapatos Clássicos & Ténis', slug: 'calcado-masculino' },
      { id: 'relogios-acessorios', name: 'Relógios, Cintos & Carteiras', slug: 'relogios-acessorios' },
      { id: 'perfumes-homem', name: 'Perfumes & Higiene Masculina', slug: 'perfumes-homem' }
    ]
  },
  {
    id: 'eletronicos',
    name: 'Eletrónicos & Eletrodomésticos',
    slug: 'eletronicos',
    icon: '💻',
    subCategories: [
      { id: 'smartphones-tablets', name: 'Smartphones, iPhones & Tablets', slug: 'smartphones-tablets' },
      { id: 'computadores-laptops', name: 'Computadores & Portáteis', slug: 'computadores-laptops' },
      { id: 'smart-tvs-som', name: 'Smart TVs & Equipamento de Som', slug: 'smart-tvs-som' },
      { id: 'frigorificos-arcas', name: 'Frigoríficos & Arcas Congeladoras', slug: 'frigorificos-arcas' },
      { id: 'climatizacao-ac', name: 'Ar Condicionado & Ventilação', slug: 'climatizacao-ac' },
      { id: 'pequenos-eletro', name: 'Pequenos Eletrodomésticos (Fogões, Micro-ondas)', slug: 'pequenos-eletro' }
    ]
  },
  {
    id: 'alimentos',
    name: 'Alimentos & Do Campo',
    slug: 'alimentos',
    icon: '🌾',
    subCategories: [
      { id: 'produtos-frescos', name: 'Mandioca, Batata Doce & Banana Pão', slug: 'produtos-frescos' },
      { id: 'bombo-seco', name: 'Bombó Seco de Cabinda & Uíge', slug: 'bombo-seco' },
      { id: 'fubas-farinhas', name: 'Fuba de Bombó & Fuba de Milho', slug: 'fubas-farinhas' },
      { id: 'feijao-cereais', name: 'Feijão Manteiga, Macunde & Grãos', slug: 'feijao-cereais' },
      { id: 'peixe-seco-salgado', name: 'Peixe Seco & Cacusso da Namíbe', slug: 'peixe-seco-salgado' },
      { id: 'oleo-palma-maiombe', name: 'Óleo de Palma Puro do Maiombe', slug: 'oleo-palma-maiombe' },
      { id: 'fardos-mercearia', name: 'Fardos de Arroz, Açúcar & Óleo Vegetal', slug: 'fardos-mercearia' }
    ]
  },
  {
    id: 'animais',
    name: 'Animais & Pecuária',
    slug: 'animais',
    icon: '🐂',
    subCategories: [
      { id: 'bois-gado-bovino', name: 'Bois, Touros & Gado Bovino (Corte/Reprodução)', slug: 'bois-gado-bovino' },
      { id: 'vacas-leiteiras', name: 'Vacas Leiteiras & Novilhas', slug: 'vacas-leiteiras' },
      { id: 'cabritos-caprinos', name: 'Cabritos & Caprinos Raça Bôer', slug: 'cabritos-caprinos' },
      { id: 'porcos-suinos', name: 'Porcos & Leitões de Engorda', slug: 'porcos-suinos' },
      { id: 'galinhas-aves', name: 'Galinhas Caipiras, Poedeiras & Frangos', slug: 'galinhas-aves' },
      { id: 'ovinos-carneiros', name: 'Carneiros & Ovinos', slug: 'ovinos-carneiros' }
    ]
  },
  {
    id: 'energia',
    name: 'Energia Solar & Geradores',
    slug: 'energia',
    icon: '⚡',
    subCategories: [
      { id: 'paineis-solares', name: 'Painéis Solares Monocristalinos', slug: 'paineis-solares' },
      { id: 'inversores-baterias', name: 'Inversores Híbridos & Baterias Lítio', slug: 'inversores-baterias' },
      { id: 'geradores-gasoleo', name: 'Geradores a Gasóleo & Gasolina', slug: 'geradores-gasoleo' },
      { id: 'cabos-protecao', name: 'Cabos Elétricos & Disjuntores', slug: 'cabos-protecao' }
    ]
  },
  {
    id: 'construcao',
    name: 'Construção & Ferramentas',
    slug: 'construcao',
    icon: '🏗️',
    subCategories: [
      { id: 'bombas-agua', name: 'Bombas de Água & Eletrobombas', slug: 'bombas-agua' },
      { id: 'ferramentas-eletricas', name: 'Ferramentas Elétricas & Manuais', slug: 'ferramentas-eletricas' },
      { id: 'tintas-impermeabilizacao', name: 'Tintas & Impermeabilização', slug: 'tintas-impermeabilizacao' },
      { id: 'metalurgia-estruturas', name: 'Metalurgia & Vigas de Ferro', slug: 'metalurgia-estruturas' }
    ]
  },
  {
    id: 'auto',
    name: 'Auto & Peças Sobressalentes',
    slug: 'auto',
    icon: '🚗',
    subCategories: [
      { id: 'pneus-jantes', name: 'Pneus Novos 4x4 & Jantes', slug: 'pneus-jantes' },
      { id: 'baterias-auto', name: 'Baterias de Arranque Automóvel', slug: 'baterias-auto' },
      { id: 'lubrificantes-filtros', name: 'Óleos de Motor & Filtros', slug: 'lubrificantes-filtros' }
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

