-- GABARIT MOBILE · arrivée sur place
-- À exécuter dans le SQL Editor du projet Supabase, après les migrations du
-- projet web (0001_init.sql et 0002_policies.sql).
--
-- L'app mobile ajoute un geste que le site n'a pas : scanner le QR code collé
-- sur la machine pour déclarer son arrivée. La trace est écrite ici, et toutes
-- les vérifications (réservation valide, bon créneau, bonne distance) sont
-- faites côté serveur : le téléphone ne fait qu'envoyer un code et une position.

create table if not exists check_ins (
  id         uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings (id) on delete cascade,
  user_id    uuid not null references profiles (id) on delete cascade,
  machine_id uuid not null references machines (id) on delete cascade,
  distance_m double precision,
  created_at timestamptz not null default now(),
  unique (booking_id)
);

create index if not exists check_ins_user_idx on check_ins (user_id, created_at desc);

alter table check_ins enable row level security;

create policy "arrivées lisibles par leur auteur"
  on check_ins for select
  using (user_id = auth.uid() or is_admin());

create policy "arrivées gérées par l'admin"
  on check_ins for all
  using (is_admin()) with check (is_admin());

-- Distance à vol d'oiseau, en mètres (formule de haversine).
create or replace function distance_meters(
  lat1 double precision, lon1 double precision,
  lat2 double precision, lon2 double precision
)
returns double precision
language sql
immutable
as $$
  select 6371000 * 2 * asin(sqrt(
      sin(radians(lat2 - lat1) / 2) ^ 2
    + cos(radians(lat1)) * cos(radians(lat2)) * sin(radians(lon2 - lon1) / 2) ^ 2
  ));
$$;

-- Tolérances de l'arrivée. Écrites une fois ici pour rester lisibles.
-- On accepte un scan 30 min avant le début du créneau, et jusqu'à sa fin.
-- 300 m couvre l'imprécision du GPS en intérieur sans laisser valider de chez soi.
create or replace function check_in_with_code(
  p_machine_slug text,
  p_latitude     double precision default null,
  p_longitude    double precision default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user     uuid := auth.uid();
  v_machine  machines;
  v_workshop workshops;
  v_booking  bookings;
  v_distance double precision;
begin
  if v_user is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select * into v_machine from machines where slug = p_machine_slug;

  if v_machine is null then
    raise exception 'UNKNOWN_CODE';
  end if;

  select * into v_workshop from workshops where id = v_machine.workshop_id;

  -- La réservation en cours du membre sur cette machine, s'il y en a une.
  select * into v_booking
  from bookings
  where user_id = v_user
    and machine_id = v_machine.id
    and status = 'confirmed'
    and now() between starts_at - interval '30 minutes' and ends_at
  order by starts_at
  limit 1;

  if v_booking is null then
    raise exception 'NO_BOOKING';
  end if;

  if exists (select 1 from check_ins where booking_id = v_booking.id) then
    raise exception 'ALREADY_CHECKED_IN';
  end if;

  -- La position est facultative : si le membre a refusé le GPS, l'arrivée reste
  -- possible et la distance est simplement inconnue.
  if p_latitude is not null and v_workshop.latitude is not null then
    v_distance := distance_meters(p_latitude, p_longitude, v_workshop.latitude, v_workshop.longitude);

    if v_distance > 300 then
      raise exception 'TOO_FAR';
    end if;
  end if;

  insert into check_ins (booking_id, user_id, machine_id, distance_m)
  values (v_booking.id, v_user, v_machine.id, v_distance);

  return json_build_object(
    'booking_id',  v_booking.id,
    'machine_name', v_machine.name,
    'workshop_name', v_workshop.name,
    'starts_at',   v_booking.starts_at,
    'ends_at',     v_booking.ends_at,
    'distance_m',  v_distance
  );
end;
$$;

-- Historique des arrivées d'un membre, avec le nom de la machine.
create or replace function my_check_ins()
returns table (
  id           uuid,
  created_at   timestamptz,
  distance_m   double precision,
  machine_name text,
  machine_slug text,
  workshop_name text
)
language sql
security definer
set search_path = public
stable
as $$
  select c.id, c.created_at, c.distance_m, m.name, m.slug, w.name
  from check_ins c
  join machines m on m.id = c.machine_id
  join workshops w on w.id = m.workshop_id
  where c.user_id = auth.uid()
  order by c.created_at desc
  limit 20;
$$;
