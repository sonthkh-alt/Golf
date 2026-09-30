-- Golf Academy — cơ sở dữ liệu (chạy lại nhiều lần không sao)
-- Supabase Dashboard → SQL Editor → New query → dán toàn bộ → Run.
--
-- Mô hình:
--   • Mỗi người dùng = một tài khoản Supabase Auth (tự tạo ẩn danh khi mở app; thêm email để dùng đa thiết bị).
--   • golf_user_data: toàn bộ dữ liệu app của người đó (hồ sơ, nhật ký, tiến độ…) — chỉ chính chủ đọc/ghi.
--   • golf_entitlements: quyền Pro — người dùng chỉ ĐỌC; chỉ máy chủ (webhook thanh toán) hoặc quản trị viên GHI.

-- ===================== Dữ liệu người dùng =====================
create table if not exists public.golf_user_data (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  rev        integer not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.golf_user_data enable row level security;
revoke all on table public.golf_user_data from anon, authenticated;

create or replace function public.golf_pull_me()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('rev', d.rev, 'data', d.data)
  from public.golf_user_data d where d.user_id = auth.uid();
$$;

-- Ghi có kiểm tra phiên bản: trả rev mới, hoặc -1 nếu thiết bị khác vừa ghi (app sẽ kéo về, gộp, ghi lại)
create or replace function public.golf_push_me(p_data jsonb, p_rev integer)
returns integer language plpgsql security definer set search_path = public as $$
declare r integer; uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not signed in'; end if;
  if pg_column_size(p_data) > 8 * 1024 * 1024 then raise exception 'payload too large'; end if;
  insert into public.golf_user_data as d (user_id, data, rev) values (uid, p_data, 1)
  on conflict (user_id) do update set data = excluded.data, rev = d.rev + 1, updated_at = now()
    where d.rev = p_rev
  returning d.rev into r;
  return coalesce(r, -1);
end $$;

-- ===================== Quyền Pro =====================
create table if not exists public.golf_entitlements (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  plan       text not null default 'pro',
  pro_until  timestamptz,
  source     text,            -- 'lemonsqueezy' | 'stripe' | 'bank' | 'manual'
  ref        text,            -- mã đơn / ghi chú
  updated_at timestamptz not null default now()
);
alter table public.golf_entitlements enable row level security;
revoke all on table public.golf_entitlements from anon, authenticated;

create or replace function public.golf_me()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(
    (select jsonb_build_object('plan', e.plan, 'pro_until', e.pro_until, 'source', e.source)
       from public.golf_entitlements e where e.user_id = auth.uid()),
    '{}'::jsonb);
$$;

-- Quản trị: cấp / gia hạn Pro theo email (chạy trong SQL Editor)
--   select public.golf_grant_pro('ban@email.com', 30, 'CK Vietcombank 01/10');
create or replace function public.golf_grant_pro(p_email text, p_days integer, p_note text default 'manual')
returns timestamptz language plpgsql security definer set search_path = public, auth as $$
declare uid uuid; until timestamptz;
begin
  select id into uid from auth.users where lower(email) = lower(p_email) limit 1;
  if uid is null then raise exception 'Không có người dùng với email %', p_email; end if;
  insert into public.golf_entitlements as e (user_id, plan, pro_until, source, ref)
  values (uid, 'pro', now() + make_interval(days => p_days), 'manual', p_note)
  on conflict (user_id) do update
    set pro_until = greatest(coalesce(e.pro_until, now()), now()) + make_interval(days => p_days),
        source = 'manual', ref = p_note, updated_at = now()
  returning pro_until into until;
  return until;
end $$;

-- Quản trị: cấp Pro theo MÃ KHÁCH HÀNG (8 ký tự đầu của user id, hiện ở trang Pro — dùng làm nội dung chuyển khoản)
--   select public.golf_grant_pro_code('1A2B3C4D', 365, 'CK năm');
create or replace function public.golf_grant_pro_code(p_code text, p_days integer, p_note text default 'bank')
returns timestamptz language plpgsql security definer set search_path = public, auth as $$
declare uid uuid; n integer; until timestamptz;
begin
  select count(*) into n from auth.users where replace(id::text,'-','') like lower(p_code) || '%';
  if n = 0 then raise exception 'Không tìm thấy mã %', p_code; end if;
  if n > 1 then raise exception 'Mã % trùng nhiều tài khoản — dùng golf_grant_pro theo email', p_code; end if;
  select id into uid from auth.users where replace(id::text,'-','') like lower(p_code) || '%';
  insert into public.golf_entitlements as e (user_id, plan, pro_until, source, ref)
  values (uid, 'pro', now() + make_interval(days => p_days), 'bank', p_note)
  on conflict (user_id) do update
    set pro_until = greatest(coalesce(e.pro_until, now()), now()) + make_interval(days => p_days),
        source = 'bank', ref = p_note, updated_at = now()
  returning pro_until into until;
  return until;
end $$;

-- Quyền gọi hàm
revoke all on function public.golf_pull_me() from public, anon;
revoke all on function public.golf_push_me(jsonb, integer) from public, anon;
revoke all on function public.golf_me() from public, anon;
revoke all on function public.golf_grant_pro(text, integer, text) from public, anon, authenticated;
revoke all on function public.golf_grant_pro_code(text, integer, text) from public, anon, authenticated;
grant execute on function public.golf_pull_me() to authenticated;
grant execute on function public.golf_push_me(jsonb, integer) to authenticated;
grant execute on function public.golf_me() to authenticated;

-- ===================== (Cũ) kho dùng chung theo mã — giữ để không mất dữ liệu cũ =====================
create table if not exists public.golf_sync (
  code       text primary key check (char_length(code) between 20 and 64),
  data       jsonb not null default '{}'::jsonb,
  rev        integer not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.golf_sync enable row level security;
revoke all on table public.golf_sync from anon, authenticated;
-- Kho dùng chung cũ không còn được app dùng: gỡ hai hàm truy cập để không ai đọc được nữa.
drop function if exists public.golf_pull(text);
drop function if exists public.golf_push(text, jsonb, integer);
