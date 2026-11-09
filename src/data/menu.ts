/**
 * CARDÁPIO PROVISÓRIO
 * Itens, descrições e preços abaixo são um modelo realista para demonstração.
 * Troque pelos dados reais do Kenko aqui (ou, depois, pelo painel /admin,
 * que grava ajustes de preço e disponibilidade em `menuOverrides` no Firestore).
 */

export type Kind =
  | 'nigiri' | 'sashimi' | 'uramaki' | 'hot' | 'temaki' | 'combo'
  | 'gyoza' | 'noodle' | 'tempura' | 'skewer' | 'soup' | 'salad'
  | 'edamame' | 'dessert' | 'drink'

export type Tag = 'picante' | 'vegetariano' | 'chef' | 'novo' | 'frito' | 'cru'

export interface Addon { id: string; name: string; price: number }

export interface Category {
  id: string
  name: string
  jp: string
  kanji: string
  blurb: string
  addons?: Addon[]
}

export interface Product {
  id: string
  cat: string
  name: string
  jp?: string
  desc: string
  price: number
  pieces?: string
  kind: Kind
  tint: string
  /** Recorte de foto (ver src/data/photos.json). Se vazio, escolhe pelo tipo. */
  photo?: string
  tags?: Tag[]
  featured?: boolean
}

const rollAddons: Addon[] = [
  { id: 'cream', name: 'Cream cheese extra', price: 4 },
  { id: 'tare', name: 'Molho tarê extra', price: 2 },
  { id: 'pimenta', name: 'Geleia de pimenta', price: 3 },
  { id: 'crocante', name: 'Cebola crocante', price: 3 },
]

export const CATEGORIES: Category[] = [
  { id: 'combinados', name: 'Combinados', jp: 'Kumiawase', kanji: '組合', blurb: 'Barcas montadas pelo sushiman para dividir.' },
  { id: 'niguiris', name: 'Niguiris', jp: 'Nigiri', kanji: '握り', blurb: 'Arroz moldado à mão, peixe cortado na hora.' },
  { id: 'sashimis', name: 'Sashimis', jp: 'Sashimi', kanji: '刺身', blurb: 'Só o peixe. Corte limpo, sem arroz.' },
  { id: 'uramakis', name: 'Uramakis e makis', jp: 'Maki', kanji: '巻', blurb: 'Oito peças por porção, arroz por fora.', addons: rollAddons },
  { id: 'hots', name: 'Hot rolls', jp: 'Age maki', kanji: '揚巻', blurb: 'Empanados e crocantes, servidos quentes.', addons: rollAddons },
  { id: 'temakis', name: 'Temakis', jp: 'Temaki', kanji: '手巻', blurb: 'Cone de alga montado na hora para comer com as mãos.', addons: rollAddons },
  { id: 'quentes', name: 'Pratos quentes', jp: 'Atatakai ryōri', kanji: '温', blurb: 'Wok, grelha e fritura japonesa.' },
  { id: 'entradas', name: 'Entradas', jp: 'Zensai', kanji: '前菜', blurb: 'Para começar a mesa.' },
  { id: 'sobremesas', name: 'Sobremesas', jp: 'Kanmi', kanji: '甘味', blurb: 'Doces para fechar.' },
  { id: 'bebidas', name: 'Bebidas', jp: 'Nomimono', kanji: '飲物', blurb: 'Geladas, japonesas e de casa.' },
]

export const PRODUCTS: Product[] = [
  // Combinados
  { id: 'comb-20', cat: 'combinados', name: 'Combinado Kenko 20', desc: 'Niguiris, uramakis e hot rolls variados do dia.', price: 79.9, pieces: '20 peças', kind: 'combo', tint: 'mix' },
  { id: 'comb-30', cat: 'combinados', name: 'Combinado Kenko 30', desc: 'Niguiris, uramakis, hot rolls e 2 temakis pequenos.', price: 109.9, pieces: '30 peças', kind: 'combo', tint: 'mix' },
  { id: 'comb-40', cat: 'combinados', name: 'Combinado Kenko 40', desc: 'Seleção ampla para quatro pessoas, com sashimi de salmão.', price: 139.9, pieces: '40 peças', kind: 'combo', tint: 'mix' },
  { id: 'barca-60', cat: 'combinados', name: 'Barca Kenko', jp: '特選', desc: 'A barca completa do sushiman: sashimi, niguiri, uramaki e hot roll.', price: 199.9, pieces: '60 peças', kind: 'combo', tint: 'mix', tags: ['chef'], featured: true },
  { id: 'comb-salmao', cat: 'combinados', name: 'Combinado Salmão', desc: 'Tudo com salmão: niguiri, sashimi, uramaki e hot roll.', price: 119.9, pieces: '24 peças', kind: 'combo', tint: 'salmon' },
  { id: 'comb-casal', cat: 'combinados', name: 'Combo Casal', desc: '12 peças, 1 hot roll de 8 e 1 temaki de salmão.', price: 98.9, pieces: '21 peças', kind: 'combo', tint: 'mix' },
  { id: 'comb-veg', cat: 'combinados', name: 'Combinado Vegetariano', desc: 'Makis e uramakis de legumes, abacate e manga.', price: 62.9, pieces: '16 peças', kind: 'combo', tint: 'veg', tags: ['vegetariano'] },

  // Niguiris
  { id: 'ng-salmao', cat: 'niguiris', name: 'Niguiri de salmão', jp: '鮭', desc: 'Fatia de salmão sobre arroz temperado.', price: 14, pieces: '2 unidades', kind: 'nigiri', tint: 'salmon', tags: ['cru'] },
  { id: 'ng-macarico', cat: 'niguiris', name: 'Salmão maçaricado', jp: '炙り', desc: 'Salmão selado no maçarico, com molho tarê e cebolinha.', price: 17, pieces: '2 unidades', kind: 'nigiri', tint: 'torched', tags: ['chef'], featured: true },
  { id: 'ng-atum', cat: 'niguiris', name: 'Niguiri de atum', jp: '鮪', desc: 'Atum fresco, corte espesso.', price: 17, pieces: '2 unidades', kind: 'nigiri', tint: 'tuna', tags: ['cru'] },
  { id: 'ng-camarao', cat: 'niguiris', name: 'Niguiri de camarão', jp: '海老', desc: 'Camarão cozido e aberto sobre o arroz.', price: 15, pieces: '2 unidades', kind: 'nigiri', tint: 'shrimp' },
  { id: 'ng-kani', cat: 'niguiris', name: 'Niguiri de kani', jp: '蟹', desc: 'Kani com cobertura leve de maionese japonesa.', price: 11, pieces: '2 unidades', kind: 'nigiri', tint: 'kani' },
  { id: 'ng-unagi', cat: 'niguiris', name: 'Niguiri de enguia', jp: '鰻', desc: 'Enguia grelhada com molho adocicado e gergelim.', price: 19, pieces: '2 unidades', kind: 'nigiri', tint: 'eel' },
  { id: 'ng-tamago', cat: 'niguiris', name: 'Niguiri de tamago', jp: '玉子', desc: 'Omelete japonesa levemente doce, faixa de alga.', price: 10, pieces: '2 unidades', kind: 'nigiri', tint: 'egg', tags: ['vegetariano'] },

  // Sashimis
  { id: 'sa-salmao', cat: 'sashimis', name: 'Sashimi de salmão', jp: '鮭', desc: 'Fatias de salmão com daikon e wasabi.', price: 46, pieces: '10 fatias', kind: 'sashimi', tint: 'salmon', tags: ['cru'] },
  { id: 'sa-atum', cat: 'sashimis', name: 'Sashimi de atum', jp: '鮪', desc: 'Atum em cortes finos, servido gelado.', price: 52, pieces: '10 fatias', kind: 'sashimi', tint: 'tuna', tags: ['cru'] },
  { id: 'sa-branco', cat: 'sashimis', name: 'Sashimi de peixe branco', jp: '白身', desc: 'Peixe branco do dia, sabor suave.', price: 42, pieces: '10 fatias', kind: 'sashimi', tint: 'white', tags: ['cru'] },
  { id: 'sa-misto', cat: 'sashimis', name: 'Sashimi misto', jp: '盛合', desc: 'Salmão, atum e peixe branco no mesmo prato.', price: 69, pieces: '15 fatias', kind: 'sashimi', tint: 'mix', tags: ['cru', 'chef'], featured: true },
  { id: 'sa-carpaccio', cat: 'sashimis', name: 'Carpaccio de salmão', desc: 'Salmão em lâminas com molho cítrico e gergelim.', price: 44, kind: 'sashimi', tint: 'salmon', tags: ['cru'] },

  // Uramakis
  { id: 'ur-phila', cat: 'uramakis', name: 'Philadelphia', desc: 'Salmão, cream cheese e cebolinha.', price: 34, pieces: '8 peças', kind: 'uramaki', tint: 'salmon' },
  { id: 'ur-skin', cat: 'uramakis', name: 'Skin', desc: 'Pele de salmão crocante, pepino e molho tarê.', price: 28, pieces: '8 peças', kind: 'uramaki', tint: 'skin' },
  { id: 'ur-calif', cat: 'uramakis', name: 'Califórnia', desc: 'Kani, pepino e manga, com gergelim.', price: 29, pieces: '8 peças', kind: 'uramaki', tint: 'kani' },
  { id: 'ur-manga', cat: 'uramakis', name: 'Salmão com manga', desc: 'Salmão, cream cheese e manga fresca.', price: 37, pieces: '8 peças', kind: 'uramaki', tint: 'mango', tags: ['novo'] },
  { id: 'ur-spicy', cat: 'uramakis', name: 'Atum spicy', desc: 'Atum picado com molho de pimenta e tobiko.', price: 39, pieces: '8 peças', kind: 'uramaki', tint: 'tuna', tags: ['picante'] },
  { id: 'ur-ebi', cat: 'uramakis', name: 'Ebiten', jp: '海老天', desc: 'Camarão empanado, cream cheese e cebolinha.', price: 36, pieces: '8 peças', kind: 'uramaki', tint: 'shrimp' },
  { id: 'ur-veg', cat: 'uramakis', name: 'Vegetariano', desc: 'Cenoura, pepino, abacate e gergelim.', price: 27, pieces: '8 peças', kind: 'uramaki', tint: 'veg', tags: ['vegetariano'] },
  { id: 'mk-kappa', cat: 'uramakis', name: 'Kappa maki', jp: '河童', desc: 'Maki fino de pepino.', price: 22, pieces: '8 peças', kind: 'uramaki', tint: 'cucumber', tags: ['vegetariano'] },
  { id: 'mk-salmao', cat: 'uramakis', name: 'Hossomaki de salmão', desc: 'Maki fino de salmão com alga por fora.', price: 25, pieces: '8 peças', kind: 'uramaki', tint: 'salmon' },

  // Hot rolls
  { id: 'ht-phila', cat: 'hots', name: 'Hot Philadelphia', desc: 'Salmão e cream cheese empanados, com tarê.', price: 35, pieces: '8 peças', kind: 'hot', tint: 'salmon', tags: ['frito'] },
  { id: 'ht-camarao', cat: 'hots', name: 'Hot de camarão', desc: 'Camarão, cream cheese e cebolinha, empanado.', price: 40, pieces: '8 peças', kind: 'hot', tint: 'shrimp', tags: ['frito'] },
  { id: 'ht-kani', cat: 'hots', name: 'Hot de kani', desc: 'Kani, cream cheese e cebolinha.', price: 31, pieces: '8 peças', kind: 'hot', tint: 'kani', tags: ['frito'] },
  { id: 'ht-pimenta', cat: 'hots', name: 'Hot com geleia de pimenta', desc: 'Salmão, cream cheese e geleia de pimenta.', price: 39, pieces: '8 peças', kind: 'hot', tint: 'chili', tags: ['frito', 'picante', 'chef'], featured: true },
  { id: 'ht-skin', cat: 'hots', name: 'Hot skin', desc: 'Pele de salmão, cebolinha e cream cheese.', price: 32, pieces: '8 peças', kind: 'hot', tint: 'skin', tags: ['frito'] },
  { id: 'ht-veg', cat: 'hots', name: 'Hot vegetariano', desc: 'Queijo, cenoura, pepino e shitake empanados.', price: 29, pieces: '8 peças', kind: 'hot', tint: 'veg', tags: ['frito', 'vegetariano'] },

  // Temakis
  { id: 'tm-salmao', cat: 'temakis', name: 'Temaki de salmão', desc: 'Salmão cru, arroz e cebolinha.', price: 29, kind: 'temaki', tint: 'salmon' },
  { id: 'tm-grelhado', cat: 'temakis', name: 'Temaki de salmão grelhado', desc: 'Salmão maçaricado com cream cheese.', price: 32, kind: 'temaki', tint: 'torched' },
  { id: 'tm-phila', cat: 'temakis', name: 'Temaki Philadelphia', desc: 'Salmão, cream cheese e cebolinha.', price: 31, kind: 'temaki', tint: 'salmon' },
  { id: 'tm-camarao', cat: 'temakis', name: 'Temaki de camarão', desc: 'Camarão, cream cheese e cebolinha.', price: 34, kind: 'temaki', tint: 'shrimp' },
  { id: 'tm-kenko', cat: 'temakis', name: 'Temaki Kenko', desc: 'Salmão, camarão, cream cheese e cebola crocante.', price: 39, kind: 'temaki', tint: 'mix', tags: ['chef'], featured: true },
  { id: 'tm-kani', cat: 'temakis', name: 'Temaki de kani', desc: 'Kani, manga e pepino.', price: 24, kind: 'temaki', tint: 'kani' },
  { id: 'tm-spicy', cat: 'temakis', name: 'Temaki atum spicy', desc: 'Atum com molho de pimenta e tobiko.', price: 33, kind: 'temaki', tint: 'tuna', tags: ['picante'] },
  { id: 'tm-veg', cat: 'temakis', name: 'Temaki vegetariano', desc: 'Abacate, pepino, cenoura e alface.', price: 22, kind: 'temaki', tint: 'veg', tags: ['vegetariano'] },

  // Quentes
  { id: 'qt-yaki-misto', cat: 'quentes', name: 'Yakisoba misto', jp: '焼きそば', desc: 'Macarrão no wok com carne, frango e legumes.', price: 48, kind: 'noodle', tint: 'yaki', tags: ['chef'] },
  { id: 'qt-yaki-frango', cat: 'quentes', name: 'Yakisoba de frango', desc: 'Frango, repolho, cenoura e brócolis.', price: 38, kind: 'noodle', tint: 'yaki' },
  { id: 'qt-yaki-veg', cat: 'quentes', name: 'Yakisoba vegetariano', desc: 'Legumes da estação e shoyu.', price: 34, kind: 'noodle', tint: 'yaki', tags: ['vegetariano'] },
  { id: 'qt-ramen', cat: 'quentes', name: 'Lámen de porco', jp: 'ラーメン', desc: 'Caldo de porco, macarrão, ovo, cebolinha e nori.', price: 46, kind: 'soup', tint: 'ramen', tags: ['novo'] },
  { id: 'qt-teri-frango', cat: 'quentes', name: 'Teriyaki de frango', desc: 'Frango grelhado com molho teriyaki, arroz e legumes.', price: 45, kind: 'skewer', tint: 'chicken' },
  { id: 'qt-teri-salmao', cat: 'quentes', name: 'Teriyaki de salmão', desc: 'Salmão grelhado, molho teriyaki, arroz e legumes.', price: 59, kind: 'skewer', tint: 'salmon' },
  { id: 'qt-tempura', cat: 'quentes', name: 'Tempurá de camarão', jp: '天ぷら', desc: 'Camarões em massa leve e crocante, molho tentsuyu.', price: 44, pieces: '6 unidades', kind: 'tempura', tint: 'shrimp', tags: ['frito'] },
  { id: 'qt-tempura-leg', cat: 'quentes', name: 'Tempurá de legumes', desc: 'Abóbora, abobrinha, cebola e batata-doce.', price: 33, kind: 'tempura', tint: 'veg', tags: ['frito', 'vegetariano'] },
  { id: 'qt-gyoza', cat: 'quentes', name: 'Gyoza', jp: '餃子', desc: 'Pastéis de carne e legumes, selados na chapa.', price: 28, pieces: '6 unidades', kind: 'gyoza', tint: 'gyoza' },
  { id: 'qt-harumaki', cat: 'quentes', name: 'Harumaki', jp: '春巻', desc: 'Rolinho primavera de legumes com molho agridoce.', price: 25, pieces: '4 unidades', kind: 'gyoza', tint: 'harumaki', tags: ['frito', 'vegetariano'] },
  { id: 'qt-karaage', cat: 'quentes', name: 'Karaage', desc: 'Frango frito à japonesa, marinado em shoyu e gengibre.', price: 36, kind: 'tempura', tint: 'chicken', tags: ['frito'] },
  { id: 'qt-yakitori', cat: 'quentes', name: 'Yakitori', jp: '焼き鳥', desc: 'Espetinhos de frango na grelha com molho tarê.', price: 29, pieces: '3 espetos', kind: 'skewer', tint: 'chicken' },

  // Entradas
  { id: 'en-edamame', cat: 'entradas', name: 'Edamame', jp: '枝豆', desc: 'Vagem de soja cozida com sal grosso.', price: 19, kind: 'edamame', tint: 'green', tags: ['vegetariano'] },
  { id: 'en-missoshiru', cat: 'entradas', name: 'Missoshiru', jp: '味噌汁', desc: 'Sopa de missô com tofu, alga e cebolinha.', price: 12, kind: 'soup', tint: 'miso' },
  { id: 'en-sunomono', cat: 'entradas', name: 'Sunomono', jp: '酢の物', desc: 'Pepino em conserva agridoce com kani.', price: 22, kind: 'salad', tint: 'kani' },
  { id: 'en-kani-salad', cat: 'entradas', name: 'Salada de kani', desc: 'Kani desfiado, manga, pepino e maionese japonesa.', price: 28, kind: 'salad', tint: 'kani' },
  { id: 'en-wakame', cat: 'entradas', name: 'Salada de wakame', desc: 'Alga marinha temperada com gergelim.', price: 24, kind: 'salad', tint: 'green', tags: ['vegetariano'] },
  { id: 'en-tataki', cat: 'entradas', name: 'Tataki de atum', jp: 'たたき', desc: 'Atum selado por fora, cru por dentro, com ponzu.', price: 49, kind: 'sashimi', tint: 'tuna', tags: ['cru'] },

  // Sobremesas
  { id: 'sb-mochi', cat: 'sobremesas', name: 'Mochi', jp: '餅', desc: 'Bolinhos de arroz recheados. Sabores do dia.', price: 21, pieces: '3 unidades', kind: 'dessert', tint: 'mochi' },
  { id: 'sb-harumaki', cat: 'sobremesas', name: 'Harumaki de banana', desc: 'Banana e chocolate, frito e polvilhado com açúcar.', price: 24, pieces: '4 unidades', kind: 'dessert', tint: 'fried', tags: ['frito'] },
  { id: 'sb-matcha', cat: 'sobremesas', name: 'Sorvete de matcha', jp: '抹茶', desc: 'Duas bolas de sorvete de chá verde.', price: 19, kind: 'dessert', tint: 'ice' },
  { id: 'sb-tempura-ice', cat: 'sobremesas', name: 'Sorvete tempurá', desc: 'Sorvete envolto em massa crocante, com calda.', price: 26, kind: 'dessert', tint: 'ice', tags: ['frito'] },

  // Bebidas
  { id: 'bb-refri', cat: 'bebidas', name: 'Refrigerante lata', desc: '350 ml. Sabores disponíveis no dia.', price: 6.5, kind: 'drink', tint: 'cola' },
  { id: 'bb-suco', cat: 'bebidas', name: 'Suco natural', desc: 'Laranja ou limão, 400 ml.', price: 11, kind: 'drink', tint: 'orange' },
  { id: 'bb-agua', cat: 'bebidas', name: 'Água mineral', desc: 'Com ou sem gás, 500 ml.', price: 5, kind: 'drink', tint: 'water' },
  { id: 'bb-cha', cat: 'bebidas', name: 'Chá verde gelado', jp: '緑茶', desc: 'Chá verde japonês, sem açúcar, 400 ml.', price: 9, kind: 'drink', tint: 'tea' },
  { id: 'bb-ramune', cat: 'bebidas', name: 'Ramune', jp: 'ラムネ', desc: 'Refrigerante japonês com bolinha de vidro.', price: 16, kind: 'drink', tint: 'lemon', tags: ['novo'] },
  { id: 'bb-cerveja', cat: 'bebidas', name: 'Cerveja long neck', desc: '355 ml, gelada.', price: 12, kind: 'drink', tint: 'beer' },
  { id: 'bb-cerveja-jp', cat: 'bebidas', name: 'Cerveja japonesa', desc: 'Long neck importada, 355 ml.', price: 24, kind: 'drink', tint: 'beer' },
  { id: 'bb-sake', cat: 'bebidas', name: 'Saquê', jp: '酒', desc: 'Dose de saquê, servido gelado ou morno.', price: 18, kind: 'drink', tint: 'sake' },
  { id: 'bb-sake-cai', cat: 'bebidas', name: 'Caipirinha de saquê', desc: 'Saquê, limão e açúcar. A mistura da casa.', price: 24, kind: 'drink', tint: 'lemon', tags: ['chef'] },
]

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id)
export const categoryById = (id: string) => CATEGORIES.find((c) => c.id === id)!
