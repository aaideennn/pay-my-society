-- Create user profiles table with role management
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  flat_number TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'secretary', 'treasurer', 'member')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create societies table
CREATE TABLE public.societies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  registration_number TEXT,
  created_by UUID REFERENCES public.profiles(user_id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create society members junction table
CREATE TABLE public.society_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID REFERENCES public.societies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'secretary', 'treasurer', 'member')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(society_id, user_id)
);

-- Create bills table
CREATE TABLE public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID REFERENCES public.societies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  payment_date TIMESTAMP WITH TIME ZONE,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  created_by UUID REFERENCES public.profiles(user_id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID REFERENCES public.societies(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  receipt_url TEXT,
  created_by UUID REFERENCES public.profiles(user_id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notices table
CREATE TABLE public.notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID REFERENCES public.societies(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_by UUID REFERENCES public.profiles(user_id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.society_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role in society
CREATE OR REPLACE FUNCTION public.get_user_society_role(society_id_param UUID, user_id_param UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.society_members 
  WHERE society_id = society_id_param AND user_id = user_id_param AND status = 'active';
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create security definer function to check if user is admin/secretary/treasurer
CREATE OR REPLACE FUNCTION public.is_society_admin(society_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.society_members 
    WHERE society_id = society_id_param 
    AND user_id = user_id_param 
    AND role IN ('admin', 'secretary', 'treasurer')
    AND status = 'active'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for societies
CREATE POLICY "Society members can view their societies" ON public.societies
FOR SELECT USING (
  EXISTS(
    SELECT 1 FROM public.society_members sm 
    WHERE sm.society_id = societies.id 
    AND sm.user_id = auth.uid()
    AND sm.status = 'active'
  )
);

CREATE POLICY "Society admins can create societies" ON public.societies
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Society admins can update societies" ON public.societies
FOR UPDATE USING (
  public.is_society_admin(id, auth.uid())
);

-- RLS Policies for society_members
CREATE POLICY "Society members can view membership info" ON public.society_members
FOR SELECT USING (
  user_id = auth.uid() OR 
  public.is_society_admin(society_id, auth.uid())
);

CREATE POLICY "Society admins can manage members" ON public.society_members
FOR ALL USING (public.is_society_admin(society_id, auth.uid()));

-- RLS Policies for bills
CREATE POLICY "Users can view their own bills" ON public.bills
FOR SELECT USING (
  user_id = auth.uid() OR 
  public.is_society_admin(society_id, auth.uid())
);

CREATE POLICY "Society admins can manage bills" ON public.bills
FOR ALL USING (public.is_society_admin(society_id, auth.uid()));

-- RLS Policies for expenses
CREATE POLICY "Society members can view expenses" ON public.expenses
FOR SELECT USING (
  EXISTS(
    SELECT 1 FROM public.society_members sm 
    WHERE sm.society_id = expenses.society_id 
    AND sm.user_id = auth.uid()
    AND sm.status = 'active'
  )
);

CREATE POLICY "Society admins can manage expenses" ON public.expenses
FOR INSERT WITH CHECK (public.is_society_admin(society_id, auth.uid()));

CREATE POLICY "Society admins can update expenses" ON public.expenses
FOR UPDATE USING (public.is_society_admin(society_id, auth.uid()));

CREATE POLICY "Society admins can delete expenses" ON public.expenses
FOR DELETE USING (public.is_society_admin(society_id, auth.uid()));

-- RLS Policies for notices
CREATE POLICY "Society members can view notices" ON public.notices
FOR SELECT USING (
  EXISTS(
    SELECT 1 FROM public.society_members sm 
    WHERE sm.society_id = notices.society_id 
    AND sm.user_id = auth.uid()
    AND sm.status = 'active'
  )
);

CREATE POLICY "Society admins can manage notices" ON public.notices
FOR ALL USING (public.is_society_admin(society_id, auth.uid()));

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    'member',
    'active'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_societies_updated_at BEFORE UPDATE ON public.societies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON public.bills FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_notices_updated_at BEFORE UPDATE ON public.notices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_society_members_society_id ON public.society_members(society_id);
CREATE INDEX idx_society_members_user_id ON public.society_members(user_id);
CREATE INDEX idx_bills_user_id ON public.bills(user_id);
CREATE INDEX idx_bills_society_id ON public.bills(society_id);
CREATE INDEX idx_bills_status ON public.bills(status);
CREATE INDEX idx_expenses_society_id ON public.expenses(society_id);
CREATE INDEX idx_notices_society_id ON public.notices(society_id);