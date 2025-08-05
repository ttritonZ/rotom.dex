-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.Ability (
  ability_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  ability_name character varying NOT NULL,
  ability_description text,
  ability_generation integer,
  CONSTRAINT Ability_pkey PRIMARY KEY (ability_id)
);
CREATE TABLE public.Area (
  area_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  area_name character varying NOT NULL,
  city integer,
  region integer,
  CONSTRAINT Area_pkey PRIMARY KEY (area_id),
  CONSTRAINT Area_city_fkey FOREIGN KEY (city) REFERENCES public.City(city_id),
  CONSTRAINT Area_region_fkey FOREIGN KEY (region) REFERENCES public.Region(region_id)
);
CREATE TABLE public.Battle (
  battle_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  user1 integer,
  user2 integer,
  battle_time timestamp with time zone DEFAULT now(),
  winner integer,
  loser integer,
  is_random boolean,
  status character varying,
  battle_code uuid,
  CONSTRAINT Battle_pkey PRIMARY KEY (battle_id),
  CONSTRAINT Battle_winner_fkey FOREIGN KEY (winner) REFERENCES public.User(user_id),
  CONSTRAINT Battle_user2_fkey FOREIGN KEY (user2) REFERENCES public.User(user_id),
  CONSTRAINT Battle_user1_fkey FOREIGN KEY (user1) REFERENCES public.User(user_id),
  CONSTRAINT Battle_loser_fkey FOREIGN KEY (loser) REFERENCES public.User(user_id)
);
CREATE TABLE public.Battle_Log (
  log_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  battle_id integer NOT NULL,
  log_message text NOT NULL,
  log_timestamp timestamp with time zone DEFAULT now(),
  log_type character varying DEFAULT 'info',
  user_id integer,
  CONSTRAINT Battle_Log_pkey PRIMARY KEY (log_id),
  CONSTRAINT Battle_Log_battle_id_fkey FOREIGN KEY (battle_id) REFERENCES public.Battle(battle_id),
  CONSTRAINT Battle_Log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.User(user_id)
);
CREATE TABLE public.Battle_Pokemons (
  battle_id integer,
  pokemon_used integer,
  battle_pokemon_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at time without time zone DEFAULT now(),
  CONSTRAINT Battle_Pokemons_pkey PRIMARY KEY (battle_pokemon_id),
  CONSTRAINT Battle_Pokemons_pokemon_used_fkey FOREIGN KEY (pokemon_used) REFERENCES public.User_Pokemons(user_pokemon_id),
  CONSTRAINT Battle_Pokemons_battle_id_fkey FOREIGN KEY (battle_id) REFERENCES public.Battle(battle_id)
);
CREATE TABLE public.Battle_Turn (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  battle_id integer,
  attacker_id integer,
  defender_id integer,
  attacker_pokemon integer,
  defender_pokemon integer,
  move_id integer,
  damage numeric,
  CONSTRAINT Battle_Turn_pkey PRIMARY KEY (id),
  CONSTRAINT Battle_Turn_battle_id_fkey FOREIGN KEY (battle_id) REFERENCES public.Battle(battle_id),
  CONSTRAINT Battle_Turn_attacker_id_fkey FOREIGN KEY (attacker_id) REFERENCES public.User(user_id),
  CONSTRAINT Battle_Turn_defender_id_fkey FOREIGN KEY (defender_id) REFERENCES public.User(user_id),
  CONSTRAINT Battle_Turn_attacker_pokemon_fkey FOREIGN KEY (attacker_pokemon) REFERENCES public.User_Pokemons(user_pokemon_id),
  CONSTRAINT Battle_Turn_defender_pokemon_fkey FOREIGN KEY (defender_pokemon) REFERENCES public.User_Pokemons(user_pokemon_id),
  CONSTRAINT Battle_Turn_move_id_fkey FOREIGN KEY (move_id) REFERENCES public.Move(move_id)
);
CREATE TABLE public.Character (
  character_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  character_name character varying NOT NULL,
  character_region integer,
  trainer_class ARRAY NOT NULL,
  character_image character varying,
  character_description text,
  preferred_type integer,
  CONSTRAINT Character_pkey PRIMARY KEY (character_id),
  CONSTRAINT Character_character_region_fkey FOREIGN KEY (character_region) REFERENCES public.Region(region_id),
  CONSTRAINT Character_preferred_type_fkey FOREIGN KEY (preferred_type) REFERENCES public.Type(type_id)
);
CREATE TABLE public.Character_Pokemons (
  character_id integer,
  pokemon_id character varying,
  CONSTRAINT Character_Pokemons_pokemon_id_fkey FOREIGN KEY (pokemon_id) REFERENCES public.Pokemon(sp_id),
  CONSTRAINT Character_Pokemons_character_id_fkey FOREIGN KEY (character_id) REFERENCES public.Character(character_id)
);
CREATE TABLE public.City (
  city_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  city_name character varying NOT NULL,
  region integer,
  CONSTRAINT City_pkey PRIMARY KEY (city_id),
  CONSTRAINT City_region_fkey FOREIGN KEY (region) REFERENCES public.Region(region_id)
);
CREATE TABLE public.Comment (
  comment_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  comment_time timestamp without time zone DEFAULT now(),
  comment_text text NOT NULL,
  commentor integer NOT NULL,
  reply_to integer,
  CONSTRAINT Comment_pkey PRIMARY KEY (comment_id),
  CONSTRAINT comment_commentor_fkey FOREIGN KEY (commentor) REFERENCES public.User(user_id),
  CONSTRAINT comment_reply_to_fkey FOREIGN KEY (reply_to) REFERENCES public.Comment(comment_id)
);
CREATE TABLE public.Evolution (
  sp_id character varying,
  evolves_to character varying,
  method character varying,
  level integer,
  item_held integer,
  CONSTRAINT Evolution_item_held_fkey FOREIGN KEY (item_held) REFERENCES public.Item(item_id),
  CONSTRAINT Evolution_evolves_to_fkey FOREIGN KEY (evolves_to) REFERENCES public.Pokemon(sp_id),
  CONSTRAINT Evolution_sp_id_fkey FOREIGN KEY (sp_id) REFERENCES public.Pokemon(sp_id)
);
CREATE TABLE public.Favorite_Pokemons (
  pokemon_id character varying NOT NULL,
  user_id integer NOT NULL,
  CONSTRAINT Favorite_Pokemons_pokemon_id_fkey FOREIGN KEY (pokemon_id) REFERENCES public.Pokemon(sp_id),
  CONSTRAINT Favorite_Pokemons_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.User(user_id)
);
CREATE TABLE public.Forum (
  forum_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  forum_manager integer NOT NULL,
  forum_name character varying NOT NULL,
  forum_description text,
  CONSTRAINT Forum_pkey PRIMARY KEY (forum_id),
  CONSTRAINT forum_forum_manager_fkey FOREIGN KEY (forum_manager) REFERENCES public.User(user_id)
);
CREATE TABLE public.Forum_Comment (
  forum_id integer,
  comment_id integer,
  CONSTRAINT forum_comment_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.Comment(comment_id),
  CONSTRAINT forum_comment_forum_id_fkey FOREIGN KEY (forum_id) REFERENCES public.Forum(forum_id)
);
CREATE TABLE public.Gigantamax (
  sp_id character varying,
  gmax_sp_id character varying,
  gmax_move integer,
  CONSTRAINT Gigantamax_gmax_sp_id_fkey FOREIGN KEY (gmax_sp_id) REFERENCES public.Pokemon(sp_id),
  CONSTRAINT Gigantamax_gmax_move_fkey FOREIGN KEY (gmax_move) REFERENCES public.Move(move_id),
  CONSTRAINT Gigantamax_sp_id_fkey FOREIGN KEY (sp_id) REFERENCES public.Pokemon(sp_id)
);
CREATE TABLE public.Gym (
  gym_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  gym_name character varying NOT NULL UNIQUE,
  city integer NOT NULL,
  gym_badge integer,
  CONSTRAINT Gym_pkey PRIMARY KEY (gym_id),
  CONSTRAINT Gym_gym_badge_fkey FOREIGN KEY (gym_badge) REFERENCES public.Item(item_id),
  CONSTRAINT Gym_city_fkey FOREIGN KEY (city) REFERENCES public.City(city_id)
);
CREATE TABLE public.Gym_Leader (
  gym_id integer NOT NULL,
  gym_leader integer NOT NULL,
  CONSTRAINT Gym_Leader_gym_leader_fkey FOREIGN KEY (gym_leader) REFERENCES public.Character(character_id),
  CONSTRAINT Gym_Leader_gym_id_fkey FOREIGN KEY (gym_id) REFERENCES public.Gym(gym_id)
);
CREATE TABLE public.Item (
  item_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  item_name character varying NOT NULL,
  item_description text,
  item_price integer,
  item_category character varying,
  CONSTRAINT Item_pkey PRIMARY KEY (item_id)
);
CREATE TABLE public.MegaEvolution (
  sp_id character varying,
  mega_sp_id character varying,
  mega_stone integer,
  CONSTRAINT MegaEvolution_mega_stone_fkey FOREIGN KEY (mega_stone) REFERENCES public.Item(item_id),
  CONSTRAINT MegaEvolution_mega_sp_id_fkey FOREIGN KEY (mega_sp_id) REFERENCES public.Pokemon(sp_id),
  CONSTRAINT MegaEvolution_sp_id_fkey FOREIGN KEY (sp_id) REFERENCES public.Pokemon(sp_id)
);
CREATE TABLE public.Move (
  move_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  type_id integer,
  category character varying,
  pp integer,
  power integer,
  accuracy integer,
  move_name character varying NOT NULL,
  move_description text,
  generation integer,
  CONSTRAINT Move_pkey PRIMARY KEY (move_id),
  CONSTRAINT Move_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.Type(type_id)
);
CREATE TABLE public.Pokemon (
  sp_id character varying NOT NULL,
  n_dex integer NOT NULL,
  pokemon_name character varying NOT NULL,
  generation integer NOT NULL,
  region integer NOT NULL,
  category character varying NOT NULL,
  height numeric,
  weight numeric,
  catch_rate integer,
  base_experience integer,
  hp integer,
  attack integer,
  defence integer,
  sp_attack integer,
  sp_defence integer,
  speed integer,
  description text,
  pokedex_entry ARRAY,
  is_mega boolean NOT NULL,
  is_gigantamax boolean NOT NULL,
  is_legendary boolean NOT NULL,
  is_mythical boolean NOT NULL,
  is_fossil boolean NOT NULL,
  is_regional_variant boolean NOT NULL,
  is_forme_change boolean NOT NULL,
  forme_name character varying,
  is_paradox boolean NOT NULL,
  is_ancient boolean,
  is_future boolean,
  is_default boolean NOT NULL,
  price integer,
  type_1 integer NOT NULL,
  type_2 integer,
  ability_1 integer NOT NULL,
  ability_2 integer,
  ability_hidden integer,
  pokemon_base_name character varying NOT NULL,
  total integer,
  is_ultrabeast boolean,
  CONSTRAINT Pokemon_pkey PRIMARY KEY (sp_id),
  CONSTRAINT Pokemon_type_1_fkey FOREIGN KEY (type_1) REFERENCES public.Type(type_id),
  CONSTRAINT Pokemon_type_2_fkey FOREIGN KEY (type_2) REFERENCES public.Type(type_id),
  CONSTRAINT Pokemon_ability_1_fkey FOREIGN KEY (ability_1) REFERENCES public.Ability(ability_id),
  CONSTRAINT Pokemon_ability_2_fkey FOREIGN KEY (ability_2) REFERENCES public.Ability(ability_id),
  CONSTRAINT Pokemon_ability_hidden_fkey FOREIGN KEY (ability_hidden) REFERENCES public.Ability(ability_id),
  CONSTRAINT Pokemon_region_fkey FOREIGN KEY (region) REFERENCES public.Region(region_id)
);
CREATE TABLE public.Pokemon_Move (
  sp_id character varying NOT NULL,
  move_id integer NOT NULL,
  level integer,
  CONSTRAINT Pokemon_Move_sp_id_fkey FOREIGN KEY (sp_id) REFERENCES public.Pokemon(sp_id),
  CONSTRAINT Pokemon_Move_move_id_fkey FOREIGN KEY (move_id) REFERENCES public.Move(move_id)
);
CREATE TABLE public.Region (
  region_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  region_name character varying NOT NULL UNIQUE,
  region_map character varying,
  CONSTRAINT Region_pkey PRIMARY KEY (region_id)
);
CREATE TABLE public.Team (
  team_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  team_name character varying NOT NULL,
  team_image character varying,
  team_description text,
  team_region integer,
  CONSTRAINT Team_pkey PRIMARY KEY (team_id),
  CONSTRAINT Team_team_region_fkey FOREIGN KEY (team_region) REFERENCES public.Region(region_id)
);
CREATE TABLE public.Team_Members (
  team_id integer,
  team_member integer,
  position character varying,
  CONSTRAINT Team_Members_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.Team(team_id),
  CONSTRAINT Team_Members_team_member_fkey FOREIGN KEY (team_member) REFERENCES public.Character(character_id)
);
CREATE TABLE public.Type (
  type_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  type_name character varying NOT NULL UNIQUE,
  type_color character varying,
  CONSTRAINT Type_pkey PRIMARY KEY (type_id)
);
CREATE TABLE public.Type_Efficiency (
  defending_type integer,
  eff_value numeric,
  attacking_type integer,
  CONSTRAINT Type_Efficiency_defending_type_fkey FOREIGN KEY (defending_type) REFERENCES public.Type(type_id),
  CONSTRAINT Type_Efficiency_attacking_type_fkey FOREIGN KEY (attacking_type) REFERENCES public.Type(type_id)
);
CREATE TABLE public.User (
  user_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  password character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  username character varying NOT NULL UNIQUE,
  first_name character varying NOT NULL,
  last_name character varying,
  country character varying,
  reg_date time without time zone NOT NULL,
  profile_image character varying,
  profile_description text,
  money_amount integer,
  is_admin boolean NOT NULL,
  is_active boolean,
  last_login time without time zone,
  CONSTRAINT User_pkey PRIMARY KEY (user_id)
);
CREATE TABLE public.User_Items (
  user_id integer,
  item_id integer,
  quantity integer,
  CONSTRAINT User_Items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.User(user_id),
  CONSTRAINT User_Items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.Item(item_id)
);
CREATE TABLE public.User_Pokemons (
  user_pokemon_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id integer,
  sp_id character varying,
  nickname character varying,
  level integer DEFAULT 1,
  exp integer,
  CONSTRAINT User_Pokemons_pkey PRIMARY KEY (user_pokemon_id),
  CONSTRAINT User_Pokemons_sp_id_fkey FOREIGN KEY (sp_id) REFERENCES public.Pokemon(sp_id),
  CONSTRAINT User_Pokemons_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.User(user_id)
);
CREATE TABLE public.Z_move (
  z_move_id integer,
  z_crystal_id integer,
  CONSTRAINT Z_move_z_crystal_id_fkey FOREIGN KEY (z_crystal_id) REFERENCES public.Item(item_id),
  CONSTRAINT Z_move_z_move_id_fkey FOREIGN KEY (z_move_id) REFERENCES public.Move(move_id)
);