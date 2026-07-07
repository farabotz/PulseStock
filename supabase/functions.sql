-- Dashboard RPC functions for PulseStock

-- Aggregate KPIs
create or replace function public.get_dashboard_kpis()
returns table (
  total_inventory_value numeric,
  low_stock_alerts bigint,
  total_warehouses bigint,
  monthly_movements bigint
)
language sql
as $$
  select
    coalesce(sum(p.price * il.quantity), 0) as total_inventory_value,
    (select count(*)::bigint from public.inventory_levels il2
     join public.products p2 on il2.product_id = p2.id
     where il2.quantity < p2.critical_stock_threshold) as low_stock_alerts,
    (select count(*)::bigint from public.warehouses) as total_warehouses,
    (select count(*)::bigint from public.stock_transfers
     where created_at >= now() - interval '30 days') as monthly_movements
  from public.inventory_levels il
  join public.products p on il.product_id = p.id;
$$;

-- Stock movement history over last 30 days
create or replace function public.get_stock_movement_history()
returns table (
  date text,
  count bigint,
  total bigint
)
language sql
as $$
  select
    to_char(created_at, 'YYYY-MM-DD') as date,
    count(*)::bigint as count,
    coalesce(sum(quantity), 0)::bigint as total
  from public.stock_transfers
  where created_at >= now() - interval '30 days'
  group by to_char(created_at, 'YYYY-MM-DD')
  order by date;
$$;

-- Inventory value grouped by category
create or replace function public.get_inventory_by_category()
returns table (
  category text,
  value numeric
)
language sql
as $$
  select
    c.name as category,
    coalesce(sum(p.price * il.quantity), 0) as value
  from public.inventory_levels il
  join public.products p on il.product_id = p.id
  join public.categories c on p.category_id = c.id
  group by c.name;
$$;

-- Security: functions run with invoker rights by default; expose for authenticated/service_role
grant execute on function public.get_dashboard_kpis() to authenticated, service_role;
grant execute on function public.get_stock_movement_history() to authenticated, service_role;
grant execute on function public.get_inventory_by_category() to authenticated, service_role;
