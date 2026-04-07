-- =====================================================
-- MIGRATION: corrigir criação de profiles sem copiar auth.users
-- =====================================================

-- 1. remover qualquer inserção massiva antiga (se existir)
-- (não executa nada, apenas documentação de intenção)

-- 2. garantir que a tabela profiles_coral existe

CREATE TABLE IF NOT EXISTS public.profiles_coral (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'comercial' CHECK (role = 'comercial'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. função para atualizar updated_at

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_coral_updated_at ON public.profiles_coral;

CREATE TRIGGER profiles_coral_updated_at
BEFORE UPDATE ON public.profiles_coral
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 4. trigger para criar profile automaticamente quando um usuário novo for criado

CREATE OR REPLACE FUNCTION public.handle_new_user_coral()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles_coral (id, email, role)
  VALUES (NEW.id, NEW.email, 'comercial')
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_coral ON auth.users;

CREATE TRIGGER on_auth_user_created_coral
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_coral();

-- 5. habilitar RLS

ALTER TABLE public.profiles_coral ENABLE ROW LEVEL SECURITY;

-- usuário vê apenas o próprio perfil

DROP POLICY IF EXISTS "profiles_coral_select_own" ON public.profiles_coral;

CREATE POLICY "profiles_coral_select_own"
ON public.profiles_coral
FOR SELECT
USING (auth.uid() = id);

-- service role pode acessar tudo

DROP POLICY IF EXISTS "profiles_coral_service_access" ON public.profiles_coral;

CREATE POLICY "profiles_coral_service_access"
ON public.profiles_coral
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- INSERIR PERFIL PARA O USUÁRIO COMERCIAL DO CORAL
-- =====================================================

INSERT INTO public.profiles_coral (id, email, role)
SELECT id, email, 'comercial'
FROM auth.users
WHERE email = 'comercialcoral@royalhub.com.br'
ON CONFLICT (id) DO NOTHING;