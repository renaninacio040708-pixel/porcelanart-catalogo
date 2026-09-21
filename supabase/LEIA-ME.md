# Painel do vendedor PorcelanArt — como ligar (uma vez só)

O painel fica em **/painel** (ex.: `https://porcelanart-catalogo.vercel.app/painel`).
Os dados (kits, peças, fotos) e o login ficam no **Supabase** (grátis, sem cartão).

## 1. Criar o projeto
1. Entre em https://supabase.com com o Google/GitHub → **New project**.
2. Nome: `porcelanart`. Crie uma senha do banco (guarde) e escolha a região **South America (São Paulo)**. Aguarde ~2 min.

## 2. Criar as tabelas e as regras de segurança
1. No menu esquerdo: **SQL Editor** → **New query**.
2. Abra o arquivo `supabase/schema.sql`, copie tudo e cole.
3. **Troque `EMAIL_DA_MAE@exemplo.com`** pelo e-mail que a sua mãe vai usar para entrar.
4. Clique em **Run**. Deve aparecer "Success".

## 3. Definir o e-mail e a senha do painel  ← é aqui
1. Menu esquerdo: **Authentication** → **Users** → **Add user** → **Create new user**.
2. Preencha o **mesmo e-mail** do passo 2 e uma **senha**. Marque **Auto Confirm User**. Crie.
3. (Recomendado) **Authentication → Sign In / Providers → Email**: desligue **Allow new users to sign up**, para ninguém mais criar conta.
4. Para trocar a senha depois: **Authentication → Users → ⋯ → Send password recovery** ou defina uma nova pelo mesmo menu.

> Só o e-mail cadastrado na tabela `admins` (passo 2) consegue editar. Qualquer outra conta é bloqueada pelo banco.

## 4. Conectar o site ao Supabase
1. **Project Settings → API**. Copie:
   - **Project URL** (`https://xxxx.supabase.co`)
   - **anon public** key (chave *pública* — pode ir no código; **nunca** use a `service_role`).
2. Cole esses dois valores no arquivo `src/config.ts` (ou nas variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` da Vercel) e publique.

## 5. Primeiro uso
1. Abra `/painel`, entre com o e-mail e a senha.
2. Em **Visão geral** clique **Importar catálogo atual** — os 22 produtos do site vêm para o painel.
3. Em **Peças para montar kit** cadastre xícaras, pires, pratos, bandejas… com o **preço base** (o site mostra “a partir de”).
