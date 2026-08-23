-- Standard Supabase grants so anon/authenticated roles can reach the
-- public schema objects created by migrations (RLS still gates rows).

grant usage on schema public to anon, authenticated;

grant all on all tables in schema public to anon, authenticated;
grant all on all functions in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;

alter default privileges in schema public
  grant all on tables to anon, authenticated;

alter default privileges in schema public
  grant all on functions to anon, authenticated;

alter default privileges in schema public
  grant all on sequences to anon, authenticated;
