# Kenko | Culinária japonesa em Piraju, SP

Site de apresentação da marca + cardápio digital com delivery, retirada, pedido na mesa, mapa de mesas livres e painel `/admin`.

**Stack:** Vite, React 19, TypeScript, Tailwind CSS v4, [anime.js v4](https://animejs.com) (animações e scroll), Firebase (Hosting, Firestore, Auth).
Componentes ao estilo shadcn/ui (`cn`, variantes, lucide-react) e efeitos inspirados em Aceternity UI / 21st.dev / Uiverse (spotlight que segue o cursor, marquee, cards com tilt, dock de navegação, botões animados), escritos à mão para ficar leves.

> Passo a passo completo de configuração (GitHub, Firebase, deploy, domínio): veja **[SETUP.md](SETUP.md)**.

## Rodar

```bash
npm install
cp .env.example .env.local   # opcional: sem Firebase o site roda em modo demonstração
npm run dev
```

## O que já funciona

- **Hero** com o niguiri em vista explodida que se abre ao rolar (anime.js `onScroll`), abertura com ensō e cortina (noren).
- **Cardápio** (70 itens em 10 categorias): busca, filtros (picante, vegetariano, escolha do sushiman, novo), modal do prato com adicionais, animação do item voando para a sacola.
- **Sacola e checkout** em 3 etapas: entrega (por região, com taxa e pedido mínimo), retirada ou mesa; Pix, cartão ou dinheiro com troco; resumo e envio ao restaurante (Firestore) + botão de WhatsApp.
- **Mesas livres**: mapa do salão (balcão, salão, tatame, varanda) ao vivo; o cliente pede a reserva e a casa confirma.
- **`/admin`**: pedidos em kanban com aviso sonoro, reservas, controle de mesas, preço/disponibilidade do cardápio. "Comandas" está reservado (ver abaixo).
- **Modo demonstração**: sem variáveis do Firebase, tudo grava em `localStorage` e sincroniza entre abas (abra o site e o `/admin` lado a lado para testar).

## O que é provisório (AJUSTAR antes de divulgar)

| Onde | O que |
| --- | --- |
| `src/data/menu.ts` | **Cardápio, descrições e preços são um modelo.** Troque pelos itens reais do Kenko. |
| `src/lib/config.ts` | Endereço, horários, taxas de entrega por região, pedido mínimo, horários de reserva |
| `.env.local` | `VITE_WHATSAPP` (55 + DDD + número), `VITE_INSTAGRAM`, `VITE_PIX_KEY` (opcional) |
| `src/data/tables.ts` | Mapa de mesas: quantidade, lugares e posições |
| `src/components/art/DishArt.tsx` | Os pratos são ilustrações vetoriais. Quando houver fotos, basta usar `<img>` no card e no modal |
| Textos de `About.tsx` | Texto institucional de partida |

## Firebase

O projeto Firebase precisa de um **app da Web** (Console > Configurações do projeto > Seus apps) para gerar as chaves do `.env.local`.

1. Ative **Firestore** e **Authentication > E-mail/senha**.
2. Crie o usuário administrador em Authentication e, no Firestore, um documento `admins/<UID do usuário>` (pode estar vazio). Só quem tem esse documento acessa pedidos, reservas e mesas no `/admin`.
3. Publique as regras: `firebase deploy --only firestore`.
4. `.firebaserc` aponta para o projeto `kenko-piraju`. Se o ID do projeto for outro, ajuste.

### Deploy

- Manual: `npm run deploy` (precisa de `firebase login`).
- Automático: `.github/workflows/firebase-hosting.yml` publica a cada push na `main`. Em *Settings > Secrets and variables > Actions* do repositório, crie `FIREBASE_SERVICE_ACCOUNT` (JSON de uma conta de serviço com permissão de Firebase Hosting Admin) e os `VITE_*` do `.env.example`.

### Coleções do Firestore

| Coleção | Quem escreve | Conteúdo |
| --- | --- | --- |
| `orders` | cliente (só criar), admin | pedido, itens, endereço, pagamento, status (`novo`, `preparo`, `pronto`, `entregue`, `cancelado`) |
| `reservations` | cliente (só criar), admin | pedido de reserva (`pendente`, `confirmada`, `recusada`) |
| `tables` | admin | status da mesa (`livre`, `ocupada`, `reservada`), leitura pública |
| `menuOverrides` | admin | preço e disponibilidade por produto, leitura pública |
| `tabs` | admin | **reservada para comandas** (próxima etapa) |

## Próximas etapas

1. **Comandas e PDV**: abrir comanda por mesa, lançar itens, enviar à cozinha, fechar conta e liberar a mesa no mapa.
2. **Pix com confirmação automática** (Cloud Function + PSP).
3. **Cadastro de produtos completo** no painel (hoje: preço e disponibilidade; a lista base vem de `menu.ts`).
4. **Fotos reais** dos pratos e do salão.

## Estrutura

```
src/
  components/      arte SVG (DishArt, ExplodedNigiri), modal do prato, sacola/checkout
  sections/        Hero, Marquee, About, Menu, Tables, Visit, Footer, Nav, Preloader
  pages/Admin.tsx  painel /admin (carregado sob demanda)
  lib/             config, store (Firestore + demonstração), cart, utilidades
  data/            menu.ts, tables.ts
scripts/subset-fonts.mjs   gera src/fonts-jp.css só com os kanji usados
```

Ao adicionar kanji ou kana novos no código, rode `npm run fonts`.
