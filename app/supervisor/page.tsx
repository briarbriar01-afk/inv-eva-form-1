import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { KanbanCard } from '@/components/kanban-card';
import { ClipboardList, Users, TrendingUp, CheckCheck } from 'lucide-react';
import { EVALUATION_QUESTIONS } from '@/lib/questions';
import { LogoutButton } from '@/components/logout-button';
import { RefreshButton } from '@/components/refresh-button';
import { formatDate } from '@/lib/utils';

export const revalidate = 0;

type Ev = Record<string, unknown>;

function getScore(ev: Ev) {
  const yes = EVALUATION_QUESTIONS.filter(({ key }) => ev[key] === true).length;
  return Math.round((yes / EVALUATION_QUESTIONS.length) * 100);
}

function getOrganName(ev: Ev) {
  return (ev.organ_name as string) || (ev.branches as any)?.name || '—';
}

function getConductorName(ev: Ev) {
  return (ev.conductor_name as string) || (ev.profiles as any)?.full_name || (ev.profiles as any)?.email || '—';
}

function getDate(ev: Ev) {
  const raw = (ev.evaluation_date as string) || (ev.submitted_at as string) || (ev.created_at as string);
  try { return formatDate(raw); } catch { return raw ?? '—'; }
}

export default async function SupervisorPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'supervisor') redirect('/conductor');

  const { data: evaluations } = await supabase
    .from('evaluations')
    .select('*, branches(name), profiles(full_name, email)')
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: false });

  const evals = evaluations ?? [];

  const excellent = evals.filter((ev) => getScore(ev) >= 85);
  const good      = evals.filter((ev) => getScore(ev) >= 60 && getScore(ev) < 85);
  const poor      = evals.filter((ev) => getScore(ev) < 60);

  const totalEvals       = evals.length;
  const uniqueConductors = new Set(evals.map((e) => e.conductor_id)).size;

  let totalYes = 0, totalAnswers = 0;
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
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
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

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">

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

        {/* Kanban board */}
        {evals.length === 0 ? (
          <div className="text-center py-20">
            <CheckCheck className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground rtl-text">هیچ جەردێک پێشکەشنەکراوە هێشتا</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

            <KanbanColumn title="زۆر باش" count={excellent.length} headerBg="#16a34a" countBg="#dcfce7" countColor="#15803d">
              {excellent.map((ev) => (
                <KanbanCard
                  key={ev.id as string}
                  evaluation={ev}
                  organName={getOrganName(ev)}
                  conductorName={getConductorName(ev)}
                  date={getDate(ev)}
                />
              ))}
            </KanbanColumn>

            <KanbanColumn title="باش" count={good.length} headerBg="#d97706" countBg="#fef3c7" countColor="#b45309">
              {good.map((ev) => (
                <KanbanCard
                  key={ev.id as string}
                  evaluation={ev}
                  organName={getOrganName(ev)}
                  conductorName={getConductorName(ev)}
                  date={getDate(ev)}
                />
              ))}
            </KanbanColumn>

            <KanbanColumn title="پێویستی بە باشترکردن" count={poor.length} headerBg="#dc2626" countBg="#fee2e2" countColor="#b91c1c">
              {poor.map((ev) => (
                <KanbanCard
                  key={ev.id as string}
                  evaluation={ev}
                  organName={getOrganName(ev)}
                  conductorName={getConductorName(ev)}
                  date={getDate(ev)}
                />
              ))}
            </KanbanColumn>

          </div>
        )}
      </main>
    </div>
  );
}

function KanbanColumn({
  title, count, headerBg, countBg, countColor, children,
}: {
  title: string;
  count: number;
  headerBg: string;
  countBg: string;
  countColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: headerBg }}>
        <span className="font-bold text-white rtl-text text-sm">{title}</span>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: countBg, color: countColor }}
        >
          {count}
        </span>
      </div>
      <div className="p-3 space-y-3 min-h-24">
        {count === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-8 rtl-text">هیچ جەردێک نییە</p>
        ) : (
          children
        )}
      </div>
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
    <div className="bg-white rounded-xl border shadow-sm p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground rtl-text">{label}</div>
      </div>
    </div>
  );
}
