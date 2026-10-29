delete from public.request_activity;
delete from public.site_feedback;
delete from public.song_requests;
delete from public.active_visitors;
delete from public.analytics_events;
-- Original app hides request ids 1, 30001, 240001, 270001; start new ids above them.
alter table public.song_requests alter column id restart with 300001;