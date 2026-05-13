-- Roles enum
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'user');

-- user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- user_roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Owners can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Owners can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'owner'));

-- Tighten ice_cream_vans policies
DROP POLICY IF EXISTS "Authenticated users can create vans" ON public.ice_cream_vans;
DROP POLICY IF EXISTS "Authenticated users can update vans" ON public.ice_cream_vans;
DROP POLICY IF EXISTS "Authenticated users can delete vans" ON public.ice_cream_vans;
DROP POLICY IF EXISTS "Authenticated users can view all vans" ON public.ice_cream_vans;

CREATE POLICY "Owners and admins can view all vans"
  ON public.ice_cream_vans FOR SELECT
  USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners and admins can insert vans"
  ON public.ice_cream_vans FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners and admins can update vans"
  ON public.ice_cream_vans FOR UPDATE
  USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners and admins can delete vans"
  ON public.ice_cream_vans FOR DELETE
  USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

-- Tighten van_schedules policies
DROP POLICY IF EXISTS "Authenticated users can create schedules" ON public.van_schedules;
DROP POLICY IF EXISTS "Authenticated users can update schedules" ON public.van_schedules;
DROP POLICY IF EXISTS "Authenticated users can delete schedules" ON public.van_schedules;
DROP POLICY IF EXISTS "Authenticated users can view all schedules" ON public.van_schedules;

CREATE POLICY "Owners and admins can view all schedules"
  ON public.van_schedules FOR SELECT
  USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners and admins can insert schedules"
  ON public.van_schedules FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners and admins can update schedules"
  ON public.van_schedules FOR UPDATE
  USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners and admins can delete schedules"
  ON public.van_schedules FOR DELETE
  USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

-- Profiles: allow owners to view all
CREATE POLICY "Owners can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'owner'));

-- Add lat/lng to van_schedules
ALTER TABLE public.van_schedules
  ADD COLUMN IF NOT EXISTS latitude numeric,
  ADD COLUMN IF NOT EXISTS longitude numeric;