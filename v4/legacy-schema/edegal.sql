
CREATE TABLE public.auth_user (
    id integer NOT NULL,
    password character varying(128) NOT NULL,
    last_login timestamp with time zone,
    is_superuser boolean NOT NULL,
    username character varying(150) NOT NULL,
    first_name character varying(150) NOT NULL,
    last_name character varying(150) NOT NULL,
    email character varying(254) NOT NULL,
    is_staff boolean NOT NULL,
    is_active boolean NOT NULL,
    date_joined timestamp with time zone NOT NULL
);

CREATE SEQUENCE public.auth_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.auth_user_id_seq OWNED BY public.auth_user.id;

CREATE TABLE public.edegal_album (
    id integer NOT NULL,
    slug character varying(255) NOT NULL,
    path character varying(1023) NOT NULL,
    title character varying(1023) NOT NULL,
    description text NOT NULL,
    body text NOT NULL,
    is_public boolean NOT NULL,
    lft integer NOT NULL,
    rght integer NOT NULL,
    tree_id integer NOT NULL,
    level integer NOT NULL,
    cover_picture_id integer,
    parent_id integer,
    terms_and_conditions_id integer,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_by_id integer,
    is_visible boolean NOT NULL,
    redirect_url character varying(1023) NOT NULL,
    date date,
    layout character varying(6) NOT NULL,
    previous_in_series_id integer,
    next_in_series_id integer,
    series_id integer,
    director_id integer,
    photographer_id integer,
    is_downloadable boolean NOT NULL,
    CONSTRAINT edegal_album_level_check CHECK ((level >= 0)),
    CONSTRAINT edegal_album_lft_check CHECK ((lft >= 0)),
    CONSTRAINT edegal_album_rght_check CHECK ((rght >= 0)),
    CONSTRAINT edegal_album_tree_id_check CHECK ((tree_id >= 0))
);

CREATE SEQUENCE public.edegal_album_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.edegal_album_id_seq OWNED BY public.edegal_album.id;

CREATE TABLE public.edegal_media (
    id integer NOT NULL,
    width integer NOT NULL,
    height integer NOT NULL,
    src character varying(1023) NOT NULL,
    picture_id integer NOT NULL,
    spec_id integer,
    format character varying(4) NOT NULL,
    role character varying(9) NOT NULL,
    CONSTRAINT edegal_media_height_check CHECK ((height >= 0)),
    CONSTRAINT edegal_media_width_check CHECK ((width >= 0))
);

CREATE SEQUENCE public.edegal_media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.edegal_media_id_seq OWNED BY public.edegal_media.id;

CREATE TABLE public.edegal_mediaspec (
    id integer NOT NULL,
    max_width integer NOT NULL,
    max_height integer NOT NULL,
    quality integer NOT NULL,
    format character varying(4) NOT NULL,
    role character varying(9) NOT NULL,
    active boolean NOT NULL,
    CONSTRAINT edegal_mediaspec_max_height_check CHECK ((max_height >= 0)),
    CONSTRAINT edegal_mediaspec_max_width_check CHECK ((max_width >= 0)),
    CONSTRAINT edegal_mediaspec_quality_check CHECK ((quality >= 0))
);

CREATE SEQUENCE public.edegal_mediaspec_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.edegal_mediaspec_id_seq OWNED BY public.edegal_mediaspec.id;

CREATE TABLE public.edegal_photographer (
    id integer NOT NULL,
    slug character varying(255) NOT NULL,
    display_name character varying(255) NOT NULL,
    homepage_url character varying(255) NOT NULL,
    twitter_handle character varying(15) NOT NULL,
    instagram_handle character varying(30) NOT NULL,
    facebook_handle character varying(50) NOT NULL,
    default_terms_and_conditions_id integer,
    user_id integer,
    email character varying(254) NOT NULL,
    cover_picture_id integer,
    body text NOT NULL,
    flickr_handle character varying(50) NOT NULL,
    bluesky_handle character varying(64) NOT NULL,
    threads_handle character varying(30) NOT NULL
);

CREATE SEQUENCE public.edegal_photographer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.edegal_photographer_id_seq OWNED BY public.edegal_photographer.id;

CREATE TABLE public.edegal_picture (
    id integer NOT NULL,
    slug character varying(255) NOT NULL,
    "order" integer NOT NULL,
    path character varying(1023) NOT NULL,
    title character varying(1023) NOT NULL,
    description text NOT NULL,
    is_public boolean NOT NULL,
    album_id integer NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_by_id integer,
    taken_at timestamp with time zone
);

CREATE SEQUENCE public.edegal_picture_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.edegal_picture_id_seq OWNED BY public.edegal_picture.id;

CREATE TABLE public.edegal_series (
    id integer NOT NULL,
    title character varying(1023) NOT NULL,
    slug character varying(255) NOT NULL,
    description text NOT NULL,
    body text NOT NULL,
    is_public boolean NOT NULL,
    is_visible boolean NOT NULL,
    path character varying(1023) NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    created_by_id integer
);

CREATE SEQUENCE public.edegal_series_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.edegal_series_id_seq OWNED BY public.edegal_series.id;

CREATE TABLE public.edegal_termsandconditions (
    id integer NOT NULL,
    digest character varying(64) NOT NULL,
    text text NOT NULL,
    is_public boolean NOT NULL,
    url character varying(255) NOT NULL,
    user_id integer
);

CREATE SEQUENCE public.edegal_termsandconditions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.edegal_termsandconditions_id_seq OWNED BY public.edegal_termsandconditions.id;

ALTER TABLE ONLY public.auth_user ALTER COLUMN id SET DEFAULT nextval('public.auth_user_id_seq'::regclass);

ALTER TABLE ONLY public.edegal_album ALTER COLUMN id SET DEFAULT nextval('public.edegal_album_id_seq'::regclass);

ALTER TABLE ONLY public.edegal_media ALTER COLUMN id SET DEFAULT nextval('public.edegal_media_id_seq'::regclass);

ALTER TABLE ONLY public.edegal_mediaspec ALTER COLUMN id SET DEFAULT nextval('public.edegal_mediaspec_id_seq'::regclass);

ALTER TABLE ONLY public.edegal_photographer ALTER COLUMN id SET DEFAULT nextval('public.edegal_photographer_id_seq'::regclass);

ALTER TABLE ONLY public.edegal_picture ALTER COLUMN id SET DEFAULT nextval('public.edegal_picture_id_seq'::regclass);

ALTER TABLE ONLY public.edegal_series ALTER COLUMN id SET DEFAULT nextval('public.edegal_series_id_seq'::regclass);

ALTER TABLE ONLY public.edegal_termsandconditions ALTER COLUMN id SET DEFAULT nextval('public.edegal_termsandconditions_id_seq'::regclass);

ALTER TABLE ONLY public.auth_user
    ADD CONSTRAINT auth_user_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.auth_user
    ADD CONSTRAINT auth_user_username_key UNIQUE (username);

ALTER TABLE ONLY public.edegal_album
    ADD CONSTRAINT edegal_album_parent_id_slug_3e39b2b4_uniq UNIQUE (parent_id, slug);

ALTER TABLE ONLY public.edegal_album
    ADD CONSTRAINT edegal_album_path_key UNIQUE (path);

ALTER TABLE ONLY public.edegal_album
    ADD CONSTRAINT edegal_album_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.edegal_media
    ADD CONSTRAINT edegal_media_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.edegal_media
    ADD CONSTRAINT edegal_media_src_33d82e09_uniq UNIQUE (src);

ALTER TABLE ONLY public.edegal_mediaspec
    ADD CONSTRAINT edegal_mediaspec_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.edegal_photographer
    ADD CONSTRAINT edegal_photographer_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.edegal_photographer
    ADD CONSTRAINT edegal_photographer_user_id_key UNIQUE (user_id);

ALTER TABLE ONLY public.edegal_picture
    ADD CONSTRAINT edegal_picture_album_id_slug_249ecfe7_uniq UNIQUE (album_id, slug);

ALTER TABLE ONLY public.edegal_picture
    ADD CONSTRAINT edegal_picture_path_key UNIQUE (path);

ALTER TABLE ONLY public.edegal_picture
    ADD CONSTRAINT edegal_picture_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.edegal_series
    ADD CONSTRAINT edegal_series_path_key UNIQUE (path);

ALTER TABLE ONLY public.edegal_series
    ADD CONSTRAINT edegal_series_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.edegal_termsandconditions
    ADD CONSTRAINT edegal_termsandconditions_pkey PRIMARY KEY (id);

CREATE INDEX auth_user_username_6821ab7c_like ON public.auth_user USING btree (username varchar_pattern_ops);

CREATE INDEX edegal_album_cover_picture_id_bd017046 ON public.edegal_album USING btree (cover_picture_id);

CREATE INDEX edegal_album_created_by_id_ea625503 ON public.edegal_album USING btree (created_by_id);

CREATE INDEX edegal_album_director_id_3d95e27a ON public.edegal_album USING btree (director_id);

CREATE INDEX edegal_album_next_in_series_id_d1876e20 ON public.edegal_album USING btree (next_in_series_id);

CREATE INDEX edegal_album_parent_id_86248538 ON public.edegal_album USING btree (parent_id);

CREATE INDEX edegal_album_path_8e50f972_like ON public.edegal_album USING btree (path varchar_pattern_ops);

CREATE INDEX edegal_album_photographer_id_be13c0db ON public.edegal_album USING btree (photographer_id);

CREATE INDEX edegal_album_previous_in_series_id_d8e01b10 ON public.edegal_album USING btree (previous_in_series_id);

CREATE INDEX edegal_album_series_id_17acff56 ON public.edegal_album USING btree (series_id);

CREATE INDEX edegal_album_terms_and_conditions_id_94109804 ON public.edegal_album USING btree (terms_and_conditions_id);

CREATE INDEX edegal_album_tree_id_8e3f9984 ON public.edegal_album USING btree (tree_id);

CREATE INDEX edegal_media_picture_id_72692b4c ON public.edegal_media USING btree (picture_id);

CREATE INDEX edegal_media_spec_id_9c3f6449 ON public.edegal_media USING btree (spec_id);

CREATE INDEX edegal_media_src_33d82e09_like ON public.edegal_media USING btree (src varchar_pattern_ops);

CREATE INDEX edegal_photographer_cover_picture_id_913c7146 ON public.edegal_photographer USING btree (cover_picture_id);

CREATE INDEX edegal_photographer_default_terms_and_conditions_id_de368957 ON public.edegal_photographer USING btree (default_terms_and_conditions_id);

CREATE INDEX edegal_photographer_display_name_d6a3aa0a ON public.edegal_photographer USING btree (display_name);

CREATE INDEX edegal_photographer_display_name_d6a3aa0a_like ON public.edegal_photographer USING btree (display_name varchar_pattern_ops);

CREATE INDEX edegal_pict_album_i_145fe8_idx ON public.edegal_picture USING btree (album_id, "order", taken_at, slug);

CREATE INDEX edegal_picture_created_by_id_07ad4eab ON public.edegal_picture USING btree (created_by_id);

CREATE INDEX edegal_picture_path_fc36f3f9_like ON public.edegal_picture USING btree (path varchar_pattern_ops);

CREATE INDEX edegal_series_created_by_id_2c51f34b ON public.edegal_series USING btree (created_by_id);

CREATE INDEX edegal_series_path_f512cc40_like ON public.edegal_series USING btree (path varchar_pattern_ops);

CREATE INDEX edegal_termsandconditions_user_id_e9fe71f1 ON public.edegal_termsandconditions USING btree (user_id);

ALTER TABLE ONLY public.edegal_album
    ADD CONSTRAINT edegal_album_cover_picture_id_bd017046_fk_edegal_picture_id FOREIGN KEY (cover_picture_id) REFERENCES public.edegal_picture(id) DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE ONLY public.edegal_album
    ADD CONSTRAINT edegal_album_created_by_id_ea625503_fk_auth_user_id FOREIGN KEY (created_by_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE ONLY public.edegal_album
    ADD CONSTRAINT edegal_album_director_id_3d95e27a_fk_edegal_photographer_id FOREIGN KEY (director_id) REFERENCES public.edegal_photographer(id) DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE ONLY public.edegal_album
    ADD CONSTRAINT edegal_album_next_in_series_id_d1876e20_fk_edegal_album_id FOREIGN KEY (next_in_series_id) REFERENCES public.edegal_album(id) DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE ONLY public.edegal_album
    ADD CONSTRAINT edegal_album_parent_id_86248538_fk_edegal_album_id FOREIGN KEY (parent_id) REFERENCES public.edegal_album(id) DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE ONLY public.edegal_album
    ADD CONSTRAINT edegal_album_photographer_id_be13c0db_fk_edegal_photographer_id FOREIGN KEY (photographer_id) REFERENCES public.edegal_photographer(id) DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE ONLY public.edegal_album
    ADD CONSTRAINT edegal_album_previous_in_series_id_d8e01b10_fk_edegal_album_id FOREIGN KEY (previous_in_series_id) REFERENCES public.edegal_album(id) DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE ONLY public.edegal_album
    ADD CONSTRAINT edegal_album_series_id_17acff56_fk_edegal_series_id FOREIGN KEY (series_id) REFERENCES public.edegal_series(id) DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE ONLY public.edegal_album
    ADD CONSTRAINT edegal_album_terms_and_conditions_94109804_fk_edegal_te FOREIGN KEY (terms_and_conditions_id) REFERENCES public.edegal_termsandconditions(id) DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE ONLY public.edegal_media
    ADD CONSTRAINT edegal_media_picture_id_72692b4c_fk_edegal_picture_id FOREIGN KEY (picture_id) REFERENCES public.edegal_picture(id) DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE ONLY public.edegal_media
    ADD CONSTRAINT edegal_media_spec_id_9c3f6449_fk_edegal_mediaspec_id FOREIGN KEY (spec_id) REFERENCES public.edegal_mediaspec(id) DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE ONLY public.edegal_photographer
    ADD CONSTRAINT edegal_photographer_cover_picture_id_913c7146_fk_edegal_pi FOREIGN KEY (cover_picture_id) REFERENCES public.edegal_picture(id) DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE ONLY public.edegal_photographer
    ADD CONSTRAINT edegal_photographer_default_terms_and_co_de368957_fk_edegal_te FOREIGN KEY (default_terms_and_conditions_id) REFERENCES public.edegal_termsandconditions(id) DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE ONLY public.edegal_photographer
    ADD CONSTRAINT edegal_photographer_user_id_9528ad58_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE ONLY public.edegal_picture
    ADD CONSTRAINT edegal_picture_album_id_3b645b45_fk_edegal_album_id FOREIGN KEY (album_id) REFERENCES public.edegal_album(id) DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE ONLY public.edegal_picture
    ADD CONSTRAINT edegal_picture_created_by_id_07ad4eab_fk_auth_user_id FOREIGN KEY (created_by_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE ONLY public.edegal_series
    ADD CONSTRAINT edegal_series_created_by_id_2c51f34b_fk_auth_user_id FOREIGN KEY (created_by_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE ONLY public.edegal_termsandconditions
    ADD CONSTRAINT edegal_termsandconditions_user_id_e9fe71f1_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;
