-- RLS Policies for RETECHCI

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.members 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'director', 'president', 'treasurer')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is director
CREATE OR REPLACE FUNCTION public.is_director()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.members 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'director')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Members policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.members
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can view their own profile" ON public.members
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.members
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all members" ON public.members
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all members" ON public.members
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can insert members" ON public.members
  FOR INSERT WITH CHECK (public.is_admin() OR auth.uid() = id);

-- Member photos policies
CREATE POLICY "Photos viewable by everyone" ON public.member_photos
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own photos" ON public.member_photos
  FOR ALL USING (member_id = auth.uid());

CREATE POLICY "Admins can manage all photos" ON public.member_photos
  FOR ALL USING (public.is_admin());

-- Filmography policies
CREATE POLICY "Filmography viewable by everyone" ON public.filmography
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own filmography" ON public.filmography
  FOR ALL USING (member_id = auth.uid());

CREATE POLICY "Admins can manage all filmography" ON public.filmography
  FOR ALL USING (public.is_admin());

-- Companies policies (public read, admin write)
CREATE POLICY "Companies viewable by everyone" ON public.companies
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage companies" ON public.companies
  FOR ALL USING (public.is_admin());

-- Equipment policies
CREATE POLICY "Equipment viewable by everyone" ON public.equipment
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage equipment" ON public.equipment
  FOR ALL USING (public.is_admin());

-- Costume providers policies
CREATE POLICY "Costume providers viewable by everyone" ON public.costume_providers
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage costume providers" ON public.costume_providers
  FOR ALL USING (public.is_admin());

-- Costumes policies
CREATE POLICY "Costumes viewable by everyone" ON public.costumes
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage costumes" ON public.costumes
  FOR ALL USING (public.is_admin());

-- Locations policies
CREATE POLICY "Locations viewable by everyone" ON public.locations
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage locations" ON public.locations
  FOR ALL USING (public.is_admin());

-- Adhesion requests policies
CREATE POLICY "Anyone can create adhesion request" ON public.adhesion_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view adhesion requests" ON public.adhesion_requests
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Director and President can manage adhesion requests" ON public.adhesion_requests
  FOR UPDATE USING (public.is_director() OR EXISTS (
    SELECT 1 FROM public.members WHERE id = auth.uid() AND role = 'president'
  ));

-- Payments policies
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (member_id = auth.uid());

CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage payments" ON public.payments
  FOR ALL USING (public.is_admin());

-- Expenses policies
CREATE POLICY "Admins can view expenses" ON public.expenses
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Treasurer can manage expenses" ON public.expenses
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.members WHERE id = auth.uid() AND role IN ('admin', 'treasurer')
  ));

-- Meetings policies
CREATE POLICY "Active members can view meetings" ON public.meetings
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.members WHERE id = auth.uid() AND status = 'active'
  ) OR public.is_admin());

CREATE POLICY "President can manage meetings" ON public.meetings
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.members WHERE id = auth.uid() AND role IN ('admin', 'president', 'director')
  ));

-- Attendance policies
CREATE POLICY "Users can view their own attendance" ON public.attendance
  FOR SELECT USING (member_id = auth.uid());

CREATE POLICY "Admins can manage attendance" ON public.attendance
  FOR ALL USING (public.is_admin());

-- Partner benefits policies
CREATE POLICY "Active members can view benefits" ON public.partner_benefits
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.members WHERE id = auth.uid() AND status = 'active'
  ) OR public.is_admin());

CREATE POLICY "Admins can manage benefits" ON public.partner_benefits
  FOR ALL USING (public.is_admin());

-- Benefit usage policies
CREATE POLICY "Users can view their own benefit usage" ON public.benefit_usage
  FOR SELECT USING (member_id = auth.uid());

CREATE POLICY "Admins can manage benefit usage" ON public.benefit_usage
  FOR ALL USING (public.is_admin());

-- Contact requests policies
CREATE POLICY "Anyone can create contact request" ON public.contact_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Director can manage contact requests" ON public.contact_requests
  FOR ALL USING (public.is_director());

-- Articles policies
CREATE POLICY "Published articles viewable by everyone" ON public.articles
  FOR SELECT USING (published = true);

CREATE POLICY "Admins can view all articles" ON public.articles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage articles" ON public.articles
  FOR ALL USING (public.is_admin());

-- SITECH registrations policies
CREATE POLICY "Anyone can register for SITECH" ON public.sitech_registrations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view SITECH registrations" ON public.sitech_registrations
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage SITECH registrations" ON public.sitech_registrations
  FOR ALL USING (public.is_admin());
