-- log_activity: atomic transaction for a single activity submission.
-- Writes activity, updates streak_days, recalculates XP+level, updates profile.
create or replace function public.log_activity(
  p_user_id          uuid,
  p_type             text,
  p_duration_minutes int,
  p_photo_url        text
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_profile        profiles%rowtype;
  v_today          date    := current_date;
  v_yesterday      date    := current_date - interval '1 day';
  v_prev_minutes   int     := 0;
  v_new_minutes    int;
  v_yesterday_min  int     := 0;
  v_new_streak     int;
  v_base_mins      int;
  v_bonus_mins     int;
  v_multiplier     numeric;
  v_earned_xp      int;
  v_new_xp         int;
  v_new_level      int;
  v_xp_threshold   int;
begin
  if auth.uid() != p_user_id then
    raise exception 'Unauthorized';
  end if;

  select * into v_profile from profiles where id = p_user_id for update;
  if not found then
    raise exception 'Profile not found';
  end if;

  -- Today's minutes before this activity
  select coalesce(minutes_logged, 0) into v_prev_minutes
  from streak_days where user_id = p_user_id and date = v_today;

  v_new_minutes := v_prev_minutes + p_duration_minutes;

  insert into streak_days (user_id, date, minutes_logged)
  values (p_user_id, v_today, v_new_minutes)
  on conflict (user_id, date) do update set minutes_logged = excluded.minutes_logged;

  -- Recalculate streak only when crossing the 30-min threshold for the first time today
  v_new_streak := v_profile.current_streak;
  if v_new_minutes >= 30 and v_prev_minutes < 30 then
    select coalesce(minutes_logged, 0) into v_yesterday_min
    from streak_days where user_id = p_user_id and date = v_yesterday;

    if v_yesterday_min >= 30 then
      v_new_streak := v_profile.current_streak + 1;
    else
      v_new_streak := 1;
    end if;
  end if;

  -- XP: 1/min for first 30, streak-multiplied for each bonus minute
  v_base_mins  := least(p_duration_minutes, 30);
  v_bonus_mins := greatest(0, p_duration_minutes - 30);
  v_multiplier := 1.0 + 0.05 * v_profile.current_streak;
  v_earned_xp  := v_base_mins + round(v_bonus_mins * v_multiplier)::int;

  -- Level-up loop
  v_new_xp    := v_profile.xp + v_earned_xp;
  v_new_level := v_profile.level;
  loop
    v_xp_threshold := 160 + v_new_level * 80
      + round(power(v_new_level::numeric, 1.7) * 14)::int;
    exit when v_new_xp < v_xp_threshold;
    v_new_xp    := v_new_xp - v_xp_threshold;
    v_new_level := v_new_level + 1;
  end loop;

  insert into activities (user_id, type, duration_minutes, photo_url)
  values (p_user_id, p_type, p_duration_minutes, p_photo_url);

  update profiles set
    xp             = v_new_xp,
    level          = v_new_level,
    current_streak = v_new_streak,
    best_streak    = greatest(v_new_streak, best_streak),
    total_minutes  = total_minutes + p_duration_minutes,
    updated_at     = now()
  where id = p_user_id;

  return jsonb_build_object(
    'earned_xp',  v_earned_xp,
    'new_level',  v_new_level,
    'new_streak', v_new_streak
  );
end;
$$;
