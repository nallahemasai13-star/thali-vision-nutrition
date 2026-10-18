CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  calorie_goal integer CHECK (calorie_goal IS NULL OR calorie_goal BETWEEN 500 AND 10000),
  protein_goal integer CHECK (protein_goal IS NULL OR protein_goal BETWEEN 1 AND 500),
  carbs_goal integer CHECK (carbs_goal IS NULL OR carbs_goal BETWEEN 1 AND 1500),
  fat_goal integer CHECK (fat_goal IS NULL OR fat_goal BETWEEN 1 AND 500),
  max_serving_g integer NOT NULL DEFAULT 1500 CHECK (max_serving_g BETWEEN 50 AND 5000),
  confidence_threshold numeric NOT NULL DEFAULT 0.6 CHECK (confidence_threshold BETWEEN 0.1 AND 0.99),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.nutrition_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  reference text NOT NULL,
  url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.foods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  region text NOT NULL DEFAULT 'South India',
  description text,
  is_prepared_dish boolean NOT NULL DEFAULT true,
  training_images_available boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.nutrition_facts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id uuid NOT NULL UNIQUE REFERENCES public.foods(id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES public.nutrition_sources(id),
  basis text NOT NULL DEFAULT 'per_100g',
  source_food_match text NOT NULL,
  data_type text NOT NULL DEFAULT 'recipe_estimate' CHECK (data_type IN ('recipe_estimate','analysed','generic_ingredient')),
  verified boolean NOT NULL DEFAULT false,
  last_verified_at date,
  calories_kcal numeric, protein_g numeric, carbs_g numeric, fat_g numeric, fiber_g numeric,
  sugar_g numeric, saturated_fat_g numeric,
  sodium_mg numeric, potassium_mg numeric, calcium_mg numeric, iron_mg numeric,
  magnesium_mg numeric, zinc_mg numeric, vitamin_c_mg numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.model_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL UNIQUE,
  kind text NOT NULL CHECK (kind IN ('general_vision_llm','trained_classifier')),
  description text NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  evaluation_summary jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.food_model_support (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id uuid NOT NULL REFERENCES public.foods(id) ON DELETE CASCADE,
  model_version_id uuid NOT NULL REFERENCES public.model_versions(id) ON DELETE CASCADE,
  in_label_set boolean NOT NULL DEFAULT false,
  evaluated boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'experimental' CHECK (status IN ('supported','experimental','unsupported')),
  UNIQUE (food_id, model_version_id)
);
GRANT SELECT ON public.nutrition_sources, public.foods, public.nutrition_facts, public.model_versions, public.food_model_support TO anon, authenticated;
GRANT ALL ON public.nutrition_sources, public.foods, public.nutrition_facts, public.model_versions, public.food_model_support TO service_role;
ALTER TABLE public.nutrition_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_model_support ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON public.nutrition_sources FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read" ON public.foods FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read" ON public.nutrition_facts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read" ON public.model_versions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read" ON public.food_model_support FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.meal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  food_id uuid NOT NULL REFERENCES public.foods(id),
  food_name text NOT NULL,
  input_method text NOT NULL CHECK (input_method IN ('image_analysis','manual')),
  predicted_class text,
  corrected_class text,
  confidence numeric CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 1),
  model_version text,
  image_ref text,
  serving_g numeric NOT NULL CHECK (serving_g > 0 AND serving_g <= 5000),
  nutrition_snapshot jsonb NOT NULL,
  nutrition_source text,
  eaten_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX meal_entries_user_eaten_idx ON public.meal_entries (user_id, eaten_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meal_entries TO authenticated;
GRANT ALL ON public.meal_entries TO service_role;
ALTER TABLE public.meal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own meals select" ON public.meal_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own meals insert" ON public.meal_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own meals update" ON public.meal_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own meals delete" ON public.meal_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Seed: catalog + reference nutrition (recipe estimates, NOT lab-verified)
INSERT INTO public.nutrition_sources (name, reference, url, notes) VALUES
('IFCT 2017 / NIN recipe approximation', 'Longvah T. et al., Indian Food Composition Tables 2017, ICMR-National Institute of Nutrition, Hyderabad; dish values approximated from standard home recipes', 'https://www.nin.res.in/ebooks/IFCT2017.pdf', 'Seed catalog values. Approximate per-100g estimates for typical home recipes; pending item-by-item verification. Oil, ghee and coconut content vary widely.');

INSERT INTO public.foods (slug, name, category, description) VALUES
('idli','Idli','Breakfast','Steamed fermented rice and urad dal cake'),
('plain_dosa','Plain dosa','Breakfast','Thin fermented rice-lentil crepe'),
('masala_dosa','Masala dosa','Breakfast','Dosa filled with spiced potato'),
('medu_vada','Medu vada','Breakfast','Deep-fried urad dal fritter'),
('ven_pongal','Ven pongal','Breakfast','Rice and moong dal with pepper, cumin, ghee'),
('upma','Upma','Breakfast','Semolina cooked with vegetables and tempering'),
('appam','Appam','Breakfast','Lacy fermented rice pancake'),
('puttu','Puttu','Breakfast','Steamed rice flour and coconut'),
('lemon_rice','Lemon rice','Rice','Rice tempered with lemon, peanuts, turmeric'),
('curd_rice','Curd rice','Rice','Rice mixed with yogurt and tempering'),
('tamarind_rice','Tamarind rice','Rice','Puliyodarai — rice with tamarind paste'),
('cooked_rice','Cooked rice','Rice','Plain boiled white rice'),
('sambar','Sambar','Curry','Lentil and vegetable stew with tamarind'),
('rasam','Rasam','Curry','Thin tamarind-tomato pepper soup'),
('dal','Dal','Curry','Cooked lentils'),
('chapati','Chapati','Bread','Whole-wheat flatbread'),
('poori','Poori','Bread','Deep-fried wheat bread'),
('vegetable_biryani','Vegetable biryani','Rice','Spiced rice with vegetables'),
('poriyal','Poriyal','Side','Dry stir-fried vegetables with coconut'),
('kootu','Kootu','Side','Vegetables cooked with lentils and coconut'),
('coconut_chutney','Coconut chutney','Accompaniment','Ground coconut with chilli and tempering');

INSERT INTO public.nutrition_facts (food_id, source_id, source_food_match, calories_kcal, protein_g, carbs_g, fat_g, fiber_g)
SELECT f.id, s.id, v.match, v.kcal, v.p, v.c, v.fat, v.fib
FROM (VALUES
 ('idli','Idli (rice:urad 2:1, steamed)',132,3.9,27.6,0.4,1.4),
 ('plain_dosa','Dosa, plain (with ~1 tsp oil)',168,3.9,29,3.7,1.1),
 ('masala_dosa','Masala dosa with potato filling',191,3.8,27,7.3,1.8),
 ('medu_vada','Vada, urad dal, deep fried',290,9.5,30,15,4),
 ('ven_pongal','Pongal, savoury, with ghee',160,4.3,22,6,1.3),
 ('upma','Upma, semolina with vegetables',150,3.5,22,5,1.5),
 ('appam','Appam, rice and coconut',140,2.5,25,3,0.8),
 ('puttu','Puttu, rice flour and coconut',170,3.5,36,1.2,2),
 ('lemon_rice','Lemon rice with peanuts',175,3,30,5,1),
 ('curd_rice','Curd rice',120,3.2,18,3.8,0.4),
 ('tamarind_rice','Tamarind rice (puliyodarai)',190,3,32,6,1.2),
 ('cooked_rice','Rice, raw milled, cooked',130,2.7,28,0.3,0.4),
 ('sambar','Sambar, toor dal with vegetables',65,3,9,2,2.2),
 ('rasam','Rasam, tomato-tamarind',35,1,5,1.2,0.6),
 ('dal','Dal, toor, cooked',116,7,17,2,4),
 ('chapati','Chapati, whole wheat, with little oil',264,8.7,45,5.5,6),
 ('poori','Poori, wheat, deep fried',340,6.5,42,16,3),
 ('vegetable_biryani','Vegetable biryani',155,3.5,24,5,1.8),
 ('poriyal','Vegetable poriyal (beans/cabbage) with coconut',90,2.5,9,5,3.5),
 ('kootu','Kootu, vegetables with moong dal',85,3.8,10,3.2,3),
 ('coconut_chutney','Coconut chutney',200,2.5,9,18,4.5)
) AS v(slug, match, kcal, p, c, fat, fib)
JOIN public.foods f ON f.slug = v.slug
CROSS JOIN public.nutrition_sources s;

INSERT INTO public.model_versions (version, kind, description, is_active) VALUES
('vision-llm-catalog-v1', 'general_vision_llm', 'General-purpose vision AI (openai/gpt-6-astra) constrained to choose only from the catalog labels. Not a custom-trained classifier; confidence is the model''s self-reported estimate, not a calibrated probability. No evaluation has been run.', true);

INSERT INTO public.food_model_support (food_id, model_version_id, in_label_set, evaluated, status)
SELECT f.id, m.id, true, false, 'experimental' FROM public.foods f CROSS JOIN public.model_versions m;