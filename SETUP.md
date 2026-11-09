# Configurar o site do Kenko do zero (GitHub até Firebase)

Siga na ordem. Tempo estimado: 40 a 60 minutos. Tudo cabe no plano gratuito (Spark) do Firebase.

## 0. O que você precisa ter

- Conta no GitHub (o repositório `kenko-piraju` já existe)
- Conta Google, com o projeto `kenko-piraju` já criado no Firebase
- Node.js 20 ou mais novo (https://nodejs.org, versão LTS) e Git (https://git-scm.com)
- Um editor de código, por exemplo o VS Code

Confira no terminal: `node -v` (precisa mostrar v20 ou maior) e `git --version`.

## 1. GitHub: trazer o código para o `main`

O site inteiro está na branch `site-inicial`.

1. Abra https://github.com/landoraag-comm/kenko-piraju
2. Clique em **Compare & pull request** (aparece no topo) ou em **Pull requests > New pull request**
3. Base: `main`. Compare: `site-inicial`. Clique em **Create pull request** e depois em **Merge pull request**
4. Se o repositório ainda não tiver a branch `main`, vá em **Settings > Branches** e defina `site-inicial` como padrão, ou crie o `main` a partir dela. O deploy automático (passo 7) escuta o `main`.

## 2. Rodar no seu computador

```bash
git clone https://github.com/landoraag-comm/kenko-piraju.git
cd kenko-piraju
npm install
npm run dev
```

Abra o endereço que o terminal mostrar (normalmente http://localhost:5173). Sem Firebase configurado o site roda em **modo demonstração**: pedidos, reservas e mesas ficam salvos só no seu navegador. O painel fica em `/admin`.

## 3. Firebase: criar o app web e pegar as chaves

1. Abra https://console.firebase.google.com e entre no projeto `kenko-piraju`
2. Anote o **ID do projeto** (engrenagem > **Configurações do projeto** > aba Geral). Ele pode ser diferente de `kenko-piraju`, por exemplo `kenko-piraju-a1b2c`
3. Na mesma tela, em **Seus apps**, clique no ícone **`</>` (Web)**. Apelido: `kenko-site`. **Não** marque Firebase Hosting aqui. Clique em **Registrar app**
4. Copie os valores do `firebaseConfig` (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId)
5. Na pasta do projeto, crie o arquivo `.env.local` a partir do modelo:

```bash
cp .env.example .env.local
```

Preencha:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_WHATSAPP=5514999999999      # 55 + DDD + número, só dígitos
VITE_INSTAGRAM=kenkopiraju       # sem o @
VITE_PIX_KEY=                    # chave Pix do restaurante (opcional)
```

6. Abra o arquivo `.firebaserc` e troque `kenko-piraju` pelo **ID do projeto** anotado no passo 2, se for diferente

## 4. Firebase: ligar o banco (Firestore)

1. No menu lateral: **Criação > Firestore Database > Criar banco de dados**
2. Local: **southamerica-east1 (São Paulo)**. Modo: **produção** (as regras certas são publicadas no passo 6)
3. Clique em **Ativar**

## 5. Firebase: ligar o login do administrador

1. **Criação > Authentication > Vamos começar**
2. Aba **Sign-in method** > **E-mail/senha** > ative e salve
3. Aba **Users > Adicionar usuário**: coloque o e-mail e uma senha forte do dono. É com ele que você entra em `/admin`
4. Copie o **UID** desse usuário (coluna "UID do usuário")
5. Vá em **Firestore Database > Iniciar coleção**
   - ID da coleção: `admins`
   - ID do documento: cole o **UID** copiado
   - Campo: `ativo`, tipo booleano, valor `true`
6. Quem não tem um documento em `admins/<UID>` não lê pedidos nem altera nada, mesmo logado. Para dar acesso a outra pessoa, crie o usuário dela e repita este passo

## 6. Instalar o Firebase CLI e publicar

```bash
npm install -g firebase-tools
firebase login
firebase use --add        # escolha o projeto do Kenko
firebase deploy --only firestore   # publica as regras de segurança e os índices
npm run deploy                     # gera o site e publica no Hosting
```

O endereço fica `https://<ID-DO-PROJETO>.web.app`. O comando `npm run deploy` usa as chaves do `.env.local` ao gerar o site.

## 7. Deploy automático a cada alteração (GitHub Actions)

> **Desligado.** O workflow agora só roda manualmente. A publicação é feita com `npm run deploy` (passo 6), sem chave de serviço no GitHub. Use este passo só se quiser religar o deploy automático: troque `workflow_dispatch:` por `push: branches: [main]` no arquivo do workflow.

O arquivo `.github/workflows/firebase-hosting.yml` publica o site toda vez que algo entra no `main`.

**7.1 Chave de serviço do Firebase**

1. Console Firebase > engrenagem > **Configurações do projeto > Contas de serviço**
2. **Gerar nova chave privada** e baixe o arquivo JSON (guarde com cuidado, não envie para ninguém e não coloque no repositório)

**7.2 Segredos no GitHub**

1. No repositório: **Settings > Secrets and variables > Actions > New repository secret**
2. Crie estes segredos (o nome precisa ser exatamente igual):

| Nome | Valor |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | o conteúdo inteiro do arquivo JSON baixado |
| `VITE_FIREBASE_API_KEY` | do passo 3 |
| `VITE_FIREBASE_AUTH_DOMAIN` | do passo 3 |
| `VITE_FIREBASE_PROJECT_ID` | do passo 3 |
| `VITE_FIREBASE_STORAGE_BUCKET` | do passo 3 |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | do passo 3 |
| `VITE_FIREBASE_APP_ID` | do passo 3 |
| `VITE_WHATSAPP` | número com 55 e DDD |
| `VITE_INSTAGRAM` | usuário sem @ |

3. Faça um pequeno commit no `main` (ou abra a aba **Actions > Deploy Firebase Hosting > Run workflow**) e acompanhe. Verde significa publicado.

Observação: o deploy automático publica só o site. As regras do Firestore (`firestore.rules`) são publicadas à mão com `firebase deploy --only firestore` sempre que você mudar esse arquivo.

Se a ação reclamar de permissão, rode `firebase init hosting:github` no terminal. Ele cria a chave com os papéis corretos e grava o segredo no GitHub sozinho. Quando perguntar se sobrescreve o workflow existente, responda **não**.

## 8. Colocar os dados reais do Kenko

| O quê | Onde |
|---|---|
| Endereço, horários, taxas de entrega por região, pedido mínimo, horários de reserva | `src/lib/config.ts` |
| Cardápio (categorias, pratos, descrições, preços, adicionais) | `src/data/menu.ts` |
| Planta das mesas (posição, lugares, formato) | `src/data/tables.ts` |
| Fotos | `public/img/` e `src/data/photos.json` (veja abaixo) |
| WhatsApp, Instagram, Pix | `.env.local` e segredos do GitHub |
| Legendas do prato do topo (Salmão, Atum, Rolinhos) | `src/sections/Hero.tsx` |

**Fotos.** As fotos que estão no site hoje são as imagens de referência que você enviou, e a maioria vem do Pinterest, ou seja, tem autoria de terceiros. Antes de divulgar, troque pelas fotos do próprio restaurante (ou de banco de imagens com licença):

1. Coloque o arquivo novo em `public/img/` (de preferência `.webp`, até uns 1600 px de largura)
2. Em `src/data/photos.json`, registre em `sources` (nome, caminho, largura e altura) e, em `crops`, o recorte quadrado (centro `cx`, `cy` e `size`, em pixels da foto)
3. Para um prato ter uma foto específica, coloque `photo: 'nome-do-recorte'` no produto em `src/data/menu.ts`. Sem isso o site escolhe pelo tipo do prato
4. A foto redonda do topo é `public/img/plate.webp`. Troque por outro prato fotografado de cima, recortado em círculo com fundo transparente

Para testar depois de mexer: `npm run dev`. Para publicar: faça commit e push no `main` (deploy automático) ou rode `npm run deploy`.

## 9. Usando o painel `/admin`

Acesse `https://<seu-site>/admin` e entre com o e-mail e a senha do passo 5.

- **Pedidos**: chegam em tempo real, com aviso sonoro. Mude o status (novo, preparando, saiu para entrega, entregue)
- **Reservas**: confirme ou recuse. O cliente recebe o retorno por WhatsApp
- **Mesas**: marque livre, ocupada ou reservada. O mapa do site muda na hora
- **Cardápio**: ajuste preço e marque "esgotado hoje" sem mexer em código
- **Comandas**: espaço reservado para a próxima etapa

## 10. Teste antes de divulgar

1. No site publicado, faça um pedido de teste (entrega, retirada e mesa) e confira se aparece em `/admin`
2. Faça uma reserva de teste e confirme pelo painel
3. Mude o status de uma mesa no `/admin` e veja o mapa do site atualizar
4. Abra no celular e verifique o WhatsApp
5. Apague os pedidos e reservas de teste no Console do Firebase (Firestore > coleções `orders` e `reservations`)

## 11. Domínio próprio (opcional)

1. Firebase Console > **Hosting > Adicionar domínio personalizado**
2. Informe o domínio (por exemplo `kenkopiraju.com.br`) e copie os registros DNS que ele mostrar
3. Cadastre esses registros no site onde você comprou o domínio (Registro.br, GoDaddy etc.). A propagação leva de minutos a algumas horas
4. Depois, em **Authentication > Settings > Domínios autorizados**, adicione o domínio novo

## 12. Segurança (recomendado)

- A `apiKey` do Firebase web é pública por natureza. O que protege os dados são as regras do Firestore, já incluídas e publicadas no passo 6
- Em https://console.cloud.google.com > **APIs e serviços > Credenciais**, abra a chave de navegador do projeto e em **Restrições de aplicativo** escolha **Sites**, informando seu domínio `.web.app` e o domínio próprio
- Use uma senha forte e exclusiva no usuário administrador
- Nunca envie o JSON da chave de serviço por mensagem nem o coloque no repositório. O `.gitignore` já ignora `.env*`

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| Site mostra "Dados de demonstração" | Faltou preencher `VITE_FIREBASE_*` (no `.env.local` ou nos segredos do GitHub) |
| Login do `/admin` funciona mas nada aparece | Falta o documento `admins/<UID>` no Firestore, ou as regras não foram publicadas |
| `permission-denied` ao enviar pedido | Rode `firebase deploy --only firestore` |
| Workflow do GitHub falha em "Build" | Algum segredo `VITE_*` está faltando ou com nome errado |
| Workflow falha em "Deploy" | `FIREBASE_SERVICE_ACCOUNT` incompleto: cole o JSON inteiro. Ou use `firebase init hosting:github` |
| Login diz "domínio não autorizado" | Adicione o domínio em Authentication > Configurações > Domínios autorizados |
