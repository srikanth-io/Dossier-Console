-- Notepad pages can be standalone notes or folders that contain child pages.
alter table public.notepad_pages
  add column if not exists kind text not null default 'note';
