create extension if not exists pgcrypto; -- for gen_random_uuid()

create table if not exists products (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text not null default '',
  price_usdc    numeric not null,       -- raw 6-decimal integer, stored exactly
  image_url     text,
  inventory     integer not null default 0,
  variants      jsonb,                  -- [{ name, options }] — display-only, see backend README
  created_at    timestamptz not null default now()
);

create table if not exists orders (
  id                bytea primary key,          -- bytes32 orderId
  items             jsonb not null,              -- [{ productId, quantity, selectedVariants }]
  amount            numeric not null,             -- raw 6-decimal integer
  status            text not null default 'pending'
                      check (status in ('pending','paid','underpaid','overpaid','cancelled')),
  buyer_address     text,
  tx_hash           text unique,
  block_number      bigint,
  email             text,
  shipping_address  jsonb,
  created_at        timestamptz not null default now(),
  paid_at           timestamptz
);

create index if not exists orders_status_created_idx on orders (status, created_at);
create index if not exists orders_buyer_idx on orders (buyer_address);
