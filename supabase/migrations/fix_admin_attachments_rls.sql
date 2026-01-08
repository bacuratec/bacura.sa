-- Add Admin RLS policies for attachments table
-- This allows admins to update attachment status when accepting/rejecting receipts

-- Admin can update attachments
create policy if not exists "admin update attachments" 
on public.attachments 
for update 
using (public.is_admin()) 
with check (public.is_admin());

-- Admin can insert attachments
create policy if not exists "admin insert attachments" 
on public.attachments 
for insert 
with check (public.is_admin());

-- Admin can delete attachments
create policy if not exists "admin delete attachments" 
on public.attachments 
for delete 
using (public.is_admin());
