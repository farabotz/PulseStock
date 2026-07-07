-- Add missing unique constraints required for upsert seeding
alter table public.categories add constraint categories_name_unique unique (name);
alter table public.warehouses add constraint warehouses_name_unique unique (name);
