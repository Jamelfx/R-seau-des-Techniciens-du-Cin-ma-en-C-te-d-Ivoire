-- Script pour creer les comptes administrateurs RETECHCI
-- A executer apres avoir cree les utilisateurs dans Supabase Auth

-- Note: Vous devez d'abord creer les utilisateurs dans Supabase Auth Dashboard:
-- 1. Allez dans Authentication > Users > Add user
-- 2. Creez les comptes avec les emails ci-dessous
-- 3. Puis executez ce script pour lier les comptes aux roles

-- Mise a jour des roles pour les administrateurs existants
-- Remplacez les emails par les vrais emails de vos administrateurs

-- Exemple de structure pour les membres administrateurs:
-- UPDATE members SET role = 'director' WHERE email = 'directeur@retechci.org';
-- UPDATE members SET role = 'president' WHERE email = 'president@retechci.org';
-- UPDATE members SET role = 'treasurer' WHERE email = 'tresorier@retechci.org';
-- UPDATE members SET role = 'cms_admin' WHERE email = 'cms@retechci.org';

-- Si les membres n'existent pas encore, inserez-les:
-- Note: Vous devez d'abord creer l'utilisateur dans Supabase Auth

/*
INSERT INTO members (
  first_name, 
  last_name, 
  email, 
  phone,
  profession,
  role, 
  status,
  category,
  member_id,
  created_at
) VALUES 
  ('Directeur', 'RETECHCI', 'directeur@votredomaine.com', '+225 XX XX XX XX', 'Directeur Executif', 'director', 'active', 'senior', 'CI-ADMIN-001', NOW()),
  ('President', 'RETECHCI', 'president@votredomaine.com', '+225 XX XX XX XX', 'President du CA', 'president', 'active', 'senior', 'CI-ADMIN-002', NOW()),
  ('Tresorier', 'RETECHCI', 'tresorier@votredomaine.com', '+225 XX XX XX XX', 'Tresoriere', 'treasurer', 'active', 'senior', 'CI-ADMIN-003', NOW())
ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role;
*/

-- Politique RLS pour permettre aux admins d'acceder a toutes les donnees
-- (Ces politiques existent deja probablement)

-- Verifier les roles disponibles dans le type ENUM
-- SELECT enum_range(NULL::member_role);
