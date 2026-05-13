# Plan: Finish Kreams build

Three things to fix in one coordinated pass.

## 1. Owner role system (security fix)

Right now any signed-up user can edit vans/schedules. We'll add proper role-based access.

**Database migration**
- Create `app_role` enum: `owner`, `admin`, `user`
- Create `user_roles` table (`user_id`, `role`, unique pair)
- Create `public.has_role(_user_id uuid, _role app_role)` security-definer function
- Enable RLS on `user_roles` (only owners can manage roles; users can read their own)
- Replace permissive `auth.uid() IS NOT NULL` policies on `ice_cream_vans` and `van_schedules` with `has_role(auth.uid(), 'owner') OR has_role(auth.uid(), 'admin')` for INSERT/UPDATE/DELETE
- Keep public `SELECT WHERE active = true` policies intact (customers must see vans)
- Fix `profiles`: add INSERT policy so the `handle_new_user` trigger keeps working, plus `Owners can view all profiles`

**Bootstrapping the first owner**
- After you sign up, I'll run a one-line insert assigning the `owner` role to your account (via the data tool)

**Frontend**
- Add `useUserRole()` hook
- `Dashboard.tsx`: redirect non-owners with a clear message
- `Navigation.tsx`: only show "Dashboard" link for owners/admins

## 2. Google Maps integration

**Database migration**
- Add `latitude numeric` and `longitude numeric` (nullable) to `van_schedules`

**Secret**
- Request `GOOGLE_MAPS_API_KEY` (you'll need Maps JavaScript API + Places API enabled in Google Cloud Console). Stored as a runtime secret; an edge function `get-maps-key` returns it to the client so it's not hard-coded.

**Frontend**
- Install `@react-google-maps/api`
- `LocationPicker` component in `ScheduleManagement` — Places autocomplete (biased to Zambia) that fills location text + lat/lng automatically
- `VanLocationsMap` component on the public page — markers for today's active schedules with info windows (van name, time, "Get directions" link)
- List/Map toggle on `VanLocations`; schedules without coordinates still show in list view

## 3. Audit & fix existing flows

- Verify the `on_auth_user_created` trigger is actually wired to `auth.users` (the `handle_new_user` function exists but the triggers list shows none — this is likely why "functionality is broken"). Add the trigger.
- Add the `update_updated_at_column` triggers on all three tables (also missing per the schema dump)
- Confirm the recent "Failed to fetch" auth errors were the transient backend outage (backend is healthy now) — no code change needed
- Run the security linter after migrations and fix anything flagged

## Order of operations

1. Migration A: add `on_auth_user_created` + `updated_at` triggers (fixes signup)
2. Migration B: roles system + tightened RLS
3. You sign up → I assign owner role
4. Migration C: lat/lng columns
5. Add `GOOGLE_MAPS_API_KEY` secret + edge function
6. Frontend: role hook, gated dashboard, navigation, map components, location picker
7. Lint + smoke test

## Technical notes

- `has_role` uses `SECURITY DEFINER` + `SET search_path = public` to avoid RLS recursion
- Edge function for the maps key keeps the key out of the bundle while still allowing client-side Maps SDK usage (Google requires the key in the browser; restrict it by HTTP referrer in Google Cloud Console for real protection)
- No changes to `src/integrations/supabase/{client,types}.ts` — types regenerate automatically after migrations

Approve and I'll start with migration A.