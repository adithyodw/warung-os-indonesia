insert into public.suppliers (name, city)
values
  ('Supplier Nusantara', 'Jakarta'),
  ('Sembako Jaya', 'Bandung'),
  ('Distribusi Rakyat', 'Surabaya')
on conflict do nothing;

insert into public.supplier_products (supplier_id, name, category, price, min_order_qty, stock_available)
select s.id, p.name, p.category, p.price, p.moq, p.stock
from (
  values
    ('Supplier Nusantara', 'Indomie Goreng', 'Mie Instan', 2800, 20, 2000),
    ('Supplier Nusantara', 'Minyak Goreng 1L', 'Sembako', 17000, 12, 800),
    ('Sembako Jaya', 'Beras 5kg', 'Sembako', 68000, 5, 500),
    ('Distribusi Rakyat', 'Gula 1kg', 'Sembako', 15500, 10, 1000)
) as p(supplier_name, name, category, price, moq, stock)
join public.suppliers s on s.name = p.supplier_name
on conflict do nothing;
