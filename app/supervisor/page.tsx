import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { EvaluationCard } from '@/components/evaluation-card';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList, Users, CheckCheck, TrendingUp } from 'lucide-react';
import { EVALUATION_QUESTIONS } from '@/lib/questions';
import { LogoutButton } from '@/components/logout-button';
import { RefreshButton } from '@/components/refresh-button';

export const revalidate = 0;

export default async function SupervisorPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single();
  if (profile?.role !== 'supervisor') redirect('/conductor');

  // Fetch all submitted evaluations with related data
  const { data: evaluations } = await supabase
    .from('evaluations')
    .select(`
      *,
      branches(name),
      profiles(full_name, email)
    `)
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: false });

  const evals = evaluations ?? [];

  // Summary stats
  const totalEvals = evals.length;
  const uniqueConductors = new Set(evals.map((e) => e.conductor_id)).size;

  let totalYes = 0;
  let totalAnswers = 0;
  evals.forEach((ev) => {
    EVALUATION_QUESTIONS.forEach(({ key }) => {
      if (ev[key] !== null && ev[key] !== undefined) {
        totalAnswers++;
        if (ev[key] === true) totalYes++;
      }
    });
  });
  const overallPct = totalAnswers > 0 ? Math.round((totalYes / totalAnswers) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold rtl-text">داشبۆردی سەرپەرشتیار</h1>
              <p className="text-xs text-muted-foreground rtl-text">{profile?.full_name ?? user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <RefreshButton />
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={<ClipboardList className="w-5 h-5 text-blue-600" />}
            bg="bg-blue-50"
            value={totalEvals}
            label="کۆی جەردەکان"
          />
          <StatCard
            icon={<Users className="w-5 h-5 text-purple-600" />}
            bg="bg-purple-50"
            value={uniqueConductors}
            label="ژمێریار"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-green-600" />}
            bg="bg-green-50"
            value={`${overallPct}%`}
            label="ئەنجامی گشتی"
          />
        </div>

        {/* Section header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold rtl-text">جەردەکان</h2>
          <Badge variant="secondary" className="rtl-text">{totalEvals} جەرد</Badge>
        </div>

        {/* Evaluations list */}
        {evals.length === 0 ? (
          <div className="text-center py-20">
            <CheckCheck className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground rtl-text">هیچ جەردێک پێشکەشنەکراوە هێشتا</p>
          </div>
        ) : (
          <div className="space-y-4">
            {evals.map((ev) => (
              <EvaluationCard
                key={ev.id}
                evaluation={ev}
                conductorName={(ev.profiles as any)?.full_name ?? (ev.profiles as any)?.email}
                branchName={(ev.branches as any)?.name}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, bg, value, label }: {
  icon: React.ReactNode;
  bg: string;
  value: number | string;
  label: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 py-5 px-3 text-center">
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-xs text-muted-foreground rtl-text leading-tight">{label}</span>
      </CardContent>
    </Card>
  );
}
