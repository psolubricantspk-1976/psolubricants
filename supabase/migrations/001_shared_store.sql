-- Run once in the Supabase SQL editor. No service-role key belongs in the website.
begin;

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admin_users enable row level security;
-- No client can read or change the admin allowlist.
revoke all on public.admin_users from anon, authenticated;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.admin_users where user_id = auth.uid());
$$;

create table public.customer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null default '',
  phone text not null default '',
  address text not null default '',
  city text not null default '',
  created_at timestamptz not null default now()
);
alter table public.customer_profiles enable row level security;
create policy profiles_read on public.customer_profiles for select to authenticated
using (id = (select auth.uid()) or (select public.is_admin()));
create policy profiles_update on public.customer_profiles for update to authenticated
using (id = (select auth.uid())) with check (id = (select auth.uid()));
revoke all on public.customer_profiles from anon, authenticated;
grant select on public.customer_profiles to authenticated;
grant update (name, phone, address, city) on public.customer_profiles to authenticated;

create function public.sync_customer_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.email is not null and new.email <> '' then
    insert into public.customer_profiles (id, name, email)
    values (new.id, left(coalesce(new.raw_user_meta_data->>'name', ''), 120), new.email)
    on conflict (id) do update set email = excluded.email,
      name = case when excluded.name <> '' then excluded.name else public.customer_profiles.name end;
  end if;
  return new;
end;
$$;
create trigger auth_profile_sync after insert or update on auth.users
for each row execute function public.sync_customer_profile();
insert into public.customer_profiles (id, name, email)
select id, left(coalesce(raw_user_meta_data->>'name', ''), 120), email
from auth.users where email is not null and email <> '' on conflict do nothing;

-- Authoritative prices: customer submissions cannot choose their own totals.
create table public.catalog (
  id text primary key, name text not null, grade text not null,
  price numeric(12,2) not null check (price > 0)
);
insert into public.catalog values
  ('carient', 'Carient Ultra Synthetic', 'SAE 5W-40 · API SN', 9800),
  ('blaze', 'Blaze 4T Racing', 'SAE 20W-50 · API SL / JASO MA2', 1450),
  ('deo', 'DEO Heavy Duty', 'SAE 15W-40 · API CI-4', 18500),
  ('gear', 'Gear & Grease Pro', 'SAE 85W-140 · GL-5 / EP-2', 3200);
create table public.delivery_zones (id text primary key, fee numeric(12,2) not null check (fee >= 0));
insert into public.delivery_zones values
  ('local',0), ('spunjab',900), ('sindh',800), ('north',1000), ('balochistan',1200);
alter table public.catalog enable row level security;
alter table public.delivery_zones enable row level security;
create policy catalog_read on public.catalog for select using (true);
create policy zones_read on public.delivery_zones for select using (true);
revoke all on public.catalog, public.delivery_zones from anon, authenticated;
grant select on public.catalog, public.delivery_zones to anon, authenticated;

create table public.orders (
  id text primary key,
  owner_id uuid not null references auth.users(id),
  request_id uuid not null,
  tracking text not null,
  created_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending','accepted','processing','in-transit','out-for-delivery','delivered','declined')),
  details jsonb not null
);
create index orders_owner_date on public.orders(owner_id, created_at desc);
create index orders_request on public.orders(owner_id, request_id);
create index orders_tracking on public.orders(tracking);
alter table public.orders enable row level security;
create policy orders_read on public.orders for select to authenticated
using (owner_id = (select auth.uid()) or (select public.is_admin()));
revoke all on public.orders from anon, authenticated;
grant select on public.orders to authenticated;

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  request_id uuid not null,
  customer_name text not null,
  customer_phone text not null default '',
  customer_email text not null default '',
  message text not null,
  created_at timestamptz not null default now(),
  status text not null default 'new' check(status in ('new','read','replied')),
  archived boolean not null default false,
  unique(owner_id, request_id)
);
create index conversations_owner_date on public.conversations(owner_id, created_at desc);
alter table public.conversations enable row level security;
create policy conversations_read on public.conversations for select to authenticated
using (owner_id = (select auth.uid()) or (select public.is_admin()));
revoke all on public.conversations from anon, authenticated;
grant select on public.conversations to authenticated;

create table public.chat_entries (
  id uuid primary key,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id),
  sender text not null check (sender in ('customer','admin')),
  text text not null check (char_length(text) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index chat_conversation_date on public.chat_entries(conversation_id, created_at);
create index chat_sender_date on public.chat_entries(sender_id, created_at);
alter table public.chat_entries enable row level security;
create policy chat_read on public.chat_entries for select to authenticated using (
  exists(select 1 from public.conversations c where c.id = conversation_id
    and (c.owner_id = (select auth.uid()) or (select public.is_admin())))
);
revoke all on public.chat_entries from anon, authenticated;
grant select on public.chat_entries to authenticated;

-- A checkout is a transaction: either all cart lines are saved or none are.
-- Reusing a request ID returns the existing result, even after a network timeout.
create function public.create_checkout(p_request_id uuid, p_items jsonb, p_customer jsonb)
returns setof public.orders language plpgsql security definer set search_path = '' as $$
declare
  u uuid := auth.uid(); item jsonb; product public.catalog; fee numeric; line_fee numeric;
  i integer := 0; n integer; quantity integer; code text;
  customer_name text := trim(coalesce(p_customer->>'customer',''));
  phone text := regexp_replace(coalesce(p_customer->>'phone',''), '[^0-9]', '', 'g');
  method text := coalesce(p_customer->>'method','');
begin
  if u is null then raise exception 'Please connect before placing an order.'; end if;
  if p_request_id is null then raise exception 'Missing request ID.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(u::text,0));
  if exists(select 1 from public.orders where owner_id=u and request_id=p_request_id) then
    return query select * from public.orders where owner_id=u and request_id=p_request_id order by id;
    return;
  end if;
  if (select count(distinct request_id) from public.orders where owner_id=u and created_at > now()-interval '1 hour') >= 10 then
    raise exception 'Too many orders. Please wait or contact us.';
  end if;
  if jsonb_typeof(p_items) is distinct from 'array' then raise exception 'Invalid cart.'; end if;
  n := jsonb_array_length(p_items);
  if n < 1 or n > 20 then raise exception 'Cart must contain 1 to 20 items.'; end if;
  if char_length(customer_name) not between 2 and 120 or char_length(phone) not between 10 and 14
     or char_length(trim(coalesce(p_customer->>'address',''))) not between 8 and 500
     or char_length(trim(coalesce(p_customer->>'city',''))) not between 1 and 120
     or char_length(coalesce(p_customer->>'email','')) > 254
     or char_length(coalesce(p_customer->>'notes','')) > 2000
     or char_length(coalesce(p_customer->>'transactionId','')) > 200 then
    raise exception 'Please check your name, phone, delivery address and other details.';
  end if;
  if coalesce(p_customer->>'email','') <> '' and (p_customer->>'email') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'Please enter a valid email address.';
  end if;
  if method not in ('cod','easypaisa','jazzcash') then raise exception 'Invalid payment method.'; end if;
  if method <> 'cod' and trim(coalesce(p_customer->>'transactionId','')) = '' then
    raise exception 'A payment transaction ID is required.';
  end if;
  select z.fee into fee from public.delivery_zones z where z.id=p_customer->>'zone';
  if fee is null then raise exception 'Invalid delivery zone.'; end if;
  code := upper(replace(gen_random_uuid()::text,'-',''));
  for item in select value from jsonb_array_elements(p_items) loop
    select * into product from public.catalog where id=item->>'productId';
    if not found then raise exception 'Product is no longer available.'; end if;
    if coalesce(item->>'qty','') !~ '^[0-9]{1,3}$' then raise exception 'Invalid quantity.'; end if;
    quantity := (item->>'qty')::integer;
    if quantity not between 1 and 100 then raise exception 'Quantity must be between 1 and 100.'; end if;
    i := i+1;
    line_fee := case when i=n then fee - trunc(fee/n,2)*(n-1) else trunc(fee/n,2) end;
    insert into public.orders(id, owner_id, request_id, tracking, details) values (
      'PSO-' || extract(year from now())::text || '-' || upper(left(replace(gen_random_uuid()::text,'-',''),16)),
      u, p_request_id, code,
      jsonb_build_object('productId', product.id, 'productName', product.name, 'grade', product.grade,
        'qty',quantity,'unitPrice',product.price,'deliveryFee',line_fee,'total',product.price*quantity+line_fee,
        'customer',customer_name,'phone',phone,'email',trim(coalesce(p_customer->>'email','')),
        'address',trim(p_customer->>'address'),'city',trim(p_customer->>'city'),'zone',p_customer->>'zone',
        'method',method,'transactionId',trim(coalesce(p_customer->>'transactionId','')),
        'notes',trim(coalesce(p_customer->>'notes','')),'accountLabel','','accountNumber','')
    );
  end loop;
  return query select * from public.orders where owner_id=u and request_id=p_request_id order by id;
end;
$$;

create function public.set_order_status(p_id text, p_status text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Admin access required.'; end if;
  update public.orders set status=p_status where id=p_id;
  if not found then raise exception 'Order not found.'; end if;
end;
$$;

-- Cross-device lookup requires a COMPLETE unguessable code and the buyer's phone.
-- Never returns addresses, emails, payment references, notes or phone numbers.
create function public.track_order(p_code text, p_phone text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('id',id,'tracking',tracking,'date',created_at,'status',status,
    'productName',details->>'productName','qty',details->'qty','total',details->'total','city',details->>'city')), '[]'::jsonb)
  from public.orders
  where (tracking=upper(regexp_replace(p_code,'[^a-zA-Z0-9]','','g'))
    or replace(id,'-','')=upper(regexp_replace(p_code,'[^a-zA-Z0-9]','','g')))
  and details->>'phone'=regexp_replace(p_phone,'[^0-9]','','g')
  and char_length(regexp_replace(p_code,'[^a-zA-Z0-9]','','g')) >= 20
  and char_length(regexp_replace(p_phone,'[^0-9]','','g')) between 10 and 14;
$$;

create function public.start_conversation(p_request_id uuid, p_input jsonb) returns public.conversations
language plpgsql security definer set search_path = '' as $$
declare u uuid := auth.uid(); result public.conversations; body text := trim(coalesce(p_input->>'message',''));
begin
  if u is null then raise exception 'Please connect before sending a message.'; end if;
  if p_request_id is null then raise exception 'Missing request ID.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(u::text,0));
  select * into result from public.conversations where owner_id=u and request_id=p_request_id;
  if found then return result; end if;
  if (select count(*) from public.conversations where owner_id=u and created_at>now()-interval '1 hour') >= 5 then
    raise exception 'Too many conversations. Please reply in your existing chat.';
  end if;
  if char_length(trim(coalesce(p_input->>'customerName',''))) not between 2 and 120
    or char_length(body) not between 1 and 4000
    or char_length(coalesce(p_input->>'customerPhone','')) > 30
    or char_length(coalesce(p_input->>'customerEmail','')) > 254 then
    raise exception 'Please check your name and message (maximum 4000 characters).';
  end if;
  insert into public.conversations(owner_id,request_id,customer_name,customer_phone,customer_email,message)
    values(u,p_request_id,trim(p_input->>'customerName'),trim(coalesce(p_input->>'customerPhone','')),
      trim(coalesce(p_input->>'customerEmail','')),body) returning * into result;
  insert into public.chat_entries(id,conversation_id,sender_id,sender,text)
    values(gen_random_uuid(),result.id,u,'customer',body);
  return result;
end;
$$;

create function public.send_reply(p_conversation uuid, p_entry_id uuid, p_text text) returns void
language plpgsql security definer set search_path = '' as $$
declare u uuid := auth.uid(); c public.conversations; admin boolean := public.is_admin();
begin
  if u is null then raise exception 'Please sign in again.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(u::text,0));
  select * into c from public.conversations where id=p_conversation for update;
  if not found or c.archived or (c.owner_id <> u and not admin) then raise exception 'Conversation unavailable.'; end if;
  if exists(select 1 from public.chat_entries where id=p_entry_id and sender_id=u and conversation_id=p_conversation) then return; end if;
  if char_length(trim(coalesce(p_text,''))) not between 1 and 4000 then raise exception 'Message must contain 1 to 4000 characters.'; end if;
  if (select count(*) from public.chat_entries where sender_id=u and created_at>now()-interval '1 minute') >= 30 then
    raise exception 'Please wait a minute before sending more messages.';
  end if;
  insert into public.chat_entries(id,conversation_id,sender_id,sender,text)
    values(p_entry_id,p_conversation,u,case when admin then 'admin' else 'customer' end,trim(p_text));
  update public.conversations set status=case when admin then 'replied' else 'new' end where id=p_conversation;
end;
$$;

create function public.manage_conversation(p_id uuid, p_action text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Admin access required.'; end if;
  if p_action = 'read' then
    update public.conversations set status='read' where id=p_id and status='new';
  elsif p_action = 'archive' then
    update public.conversations set archived=true where id=p_id;
  else raise exception 'Invalid action.';
  end if;
end;
$$;

-- Functions default to PUBLIC execution in PostgreSQL: explicitly lock them down.
revoke all on function public.is_admin() from public, anon;
revoke all on function public.sync_customer_profile() from public, anon, authenticated;
revoke all on function public.create_checkout(uuid,jsonb,jsonb) from public, anon;
revoke all on function public.set_order_status(text,text) from public, anon;
revoke all on function public.track_order(text,text) from public;
revoke all on function public.start_conversation(uuid,jsonb) from public, anon;
revoke all on function public.send_reply(uuid,uuid,text) from public, anon;
revoke all on function public.manage_conversation(uuid,text) from public, anon;
grant execute on function public.is_admin(), public.create_checkout(uuid,jsonb,jsonb),
  public.set_order_status(text,text), public.start_conversation(uuid,jsonb),
  public.send_reply(uuid,uuid,text), public.manage_conversation(uuid,text) to authenticated;
grant execute on function public.track_order(text,text) to anon, authenticated;

-- Realtime delivers only rows the connected user is allowed to SELECT under RLS.
do $$
declare t text;
begin
  if exists(select 1 from pg_publication where pubname='supabase_realtime') then
    foreach t in array array['orders','conversations','chat_entries','customer_profiles'] loop
      if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename=t) then
        execute format('alter publication supabase_realtime add table public.%I',t);
      end if;
    end loop;
  end if;
end;
$$;
commit;
