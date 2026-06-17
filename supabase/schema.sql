-- Once: Digital Disposable Camera
-- Run this in your Supabase SQL editor

create table guests (
  id text primary key,
  name text not null,
  joined_at timestamptz not null default now()
);

create table photos (
  id text primary key,
  url text not null,
  guest_id text not null references guests(id),
  guest_name text not null,
  captured_at timestamptz not null default now()
);

create index idx_photos_captured_at on photos(captured_at);
create index idx_photos_guest_id on photos(guest_id);
