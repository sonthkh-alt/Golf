-- Đồng bộ đám mây cho Giáo án 300 Yard
-- Chạy một lần trong Supabase: Dashboard → SQL Editor → New query → dán toàn bộ → Run.
--
-- Thiết kế: mỗi người dùng có một MÃ ĐỒNG BỘ ngẫu nhiên (120 bit) do ứng dụng tạo.
-- Bảng khóa hoàn toàn với khách (RLS bật, không có policy, thu hồi quyền);
-- chỉ hai hàm dưới đây được gọi bằng anon key, và chỉ đọc/ghi đúng dòng của mã được đưa vào.
-- Ai có mã thì xem được dữ liệu của mã đó — giữ mã như mật khẩu.

create table if not exists public.golf_sync (
  code       text primary key check (char_length(code) between 20 and 64),
  data       jsonb not null default '{}'::jsonb,
  rev        integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.golf_sync enable row level security;
revoke all on table public.golf_sync from anon, authenticated;

-- Đọc: trả về {rev, data} hoặc null nếu mã chưa có dữ liệu
create or replace function public.golf_pull(p_code text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object('rev', s.rev, 'data', s.data)
  from public.golf_sync s
  where s.code = p_code;
$$;

-- Ghi có kiểm tra phiên bản: chỉ ghi khi rev trên máy chủ vẫn bằng p_rev.
-- Trả về rev mới, hoặc -1 nếu máy khác vừa ghi trước (ứng dụng sẽ kéo về, gộp, ghi lại).
create or replace function public.golf_push(p_code text, p_data jsonb, p_rev integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare r integer;
begin
  if p_code is null or char_length(p_code) < 20 then
    raise exception 'invalid code';
  end if;
  if pg_column_size(p_data) > 8 * 1024 * 1024 then
    raise exception 'payload too large';
  end if;
  insert into public.golf_sync as s (code, data, rev)
  values (p_code, p_data, 1)
  on conflict (code) do update
    set data = excluded.data, rev = s.rev + 1, updated_at = now()
    where s.rev = p_rev
  returning s.rev into r;
  return coalesce(r, -1);
end;
$$;

revoke all on function public.golf_pull(text) from public;
revoke all on function public.golf_push(text, jsonb, integer) from public;
grant execute on function public.golf_pull(text) to anon, authenticated;
grant execute on function public.golf_push(text, jsonb, integer) to anon, authenticated;
