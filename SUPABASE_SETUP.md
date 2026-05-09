# Configuración de Supabase

## 1. Crear proyecto

1. Ir a [supabase.com](https://supabase.com) y crear una cuenta
2. Crear un nuevo proyecto (anotá la contraseña de la DB)
3. Esperar a que el proyecto se inicialice (~2 min)

## 2. Obtener credenciales

En el panel de Supabase → **Settings → API**:
- Copiá la **Project URL** → `VITE_SUPABASE_URL`
- Copiá la **anon public** key → `VITE_SUPABASE_ANON_KEY`

Creá el archivo `.env.local` en la raíz del proyecto:
```
VITE_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 3. Crear las tablas en la base de datos

En el panel de Supabase → **SQL Editor** → **New query**, ejecutar este SQL completo:

```sql
-- ─────────────────────────────────────────
-- Tabla de perfiles de usuario
-- ─────────────────────────────────────────
CREATE TABLE public.profiles (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email      TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'usuario'
               CHECK (role IN ('admin', 'usuario')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_own_profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- ─────────────────────────────────────────
-- Tabla de emails autorizados
-- ─────────────────────────────────────────
CREATE TABLE public.authorized_emails (
  email      TEXT PRIMARY KEY,
  role       TEXT NOT NULL DEFAULT 'usuario'
               CHECK (role IN ('admin', 'usuario')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.authorized_emails ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede consultar (necesario para validar antes del login)
CREATE POLICY "public_read" ON public.authorized_emails
  FOR SELECT USING (true);

-- Solo admins pueden escribir
CREATE POLICY "admin_insert" ON public.authorized_emails
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "admin_delete" ON public.authorized_emails
  FOR DELETE USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "admin_update" ON public.authorized_emails
  FOR UPDATE USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- ─────────────────────────────────────────
-- Trigger: crear perfil automáticamente al primer login
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  SELECT NEW.id, NEW.email, COALESCE(ae.role, 'usuario')
  FROM   public.authorized_emails ae
  WHERE  ae.email = NEW.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────
-- Usuario administrador inicial
-- ─────────────────────────────────────────
INSERT INTO public.authorized_emails (email, role)
VALUES ('nrios@iurd.com.ar', 'admin');
```

## 4. Configurar el email de autenticación (OTP)

En Supabase → **Authentication → Email Templates**:
- Podés personalizar el asunto y cuerpo del email con el código OTP

En **Authentication → Settings**:
- **OTP expiry**: recomendado 600 segundos (10 min) ← viene por defecto
- **Confirm email**: OFF (usamos OTP, no link)

> Para producción: en **Authentication → SMTP Settings** configurá tu propio servidor de email (Gmail, SendGrid, Resend, etc.) para que los correos lleguen desde tu dominio.

## 5. Levantar el proyecto

```bash
npm install
npm run dev
```

Ir a `http://localhost:5173`, ingresar con `nrios@iurd.com.ar` y usar el código que llega al email.
