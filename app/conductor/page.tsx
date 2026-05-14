import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { EvaluationForm } from '@/components/evaluation-form';
import { ClipboardList } from 'lucide-react';
import { LogoutButton } from '@/components/logout-button';

export const revalidate = 0;

export default async function ConductorPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, branches(name)')
    .eq('id', user.id)
    .single();

  const { data: branches } = await supabase
    .from('branches')
    .select('id, name')
    .order('name');

  const today = new Date().toISOString().split('T')[0];

  // Check for an existing draft today
  const { data: existingDraft } = await supabase
    .from('evaluations')
    .select('*')
    .eq('conductor_id', user.id)
    .eq('status', 'draft')
    .gte('created_at', `${today}T00:00:00`)
    .lte('created_at', `${today}T23:59:59`)
    .single();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold rtl-text">جەردی کەل و پەل</h1>
              <p className="text-xs text-muted-foreground rtl-text">
                {profile?.full_name ?? user.email}
                {profile?.branches && ` — ${(profile.branches as any).name}`}
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <EvaluationForm
          conductorId={user.id}
          branches={branches ?? []}
          defaultBranchId={profile?.branch_id ?? undefined}
          existingDraft={existingDraft ?? undefined}
        />
      </main>
    </div>
  );
}
