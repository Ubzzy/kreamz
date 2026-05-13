-- Auth trigger: create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_ice_cream_vans_updated_at ON public.ice_cream_vans;
CREATE TRIGGER update_ice_cream_vans_updated_at
  BEFORE UPDATE ON public.ice_cream_vans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_van_schedules_updated_at ON public.van_schedules;
CREATE TRIGGER update_van_schedules_updated_at
  BEFORE UPDATE ON public.van_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();