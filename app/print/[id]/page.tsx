import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PrintReport } from '@/components/print-report';

export default async function PrintPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { organ?: string; conductor?: string; date?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: ev } = await supabase
    .from('evaluations')
    .select('*, branches(name), profiles(full_name, email)')
    .eq('id', params.id)
    .single();

  if (!ev) notFound();

  const organFromUrl     = searchParams?.organ     ?? '';
  const conductorFromUrl = searchParams?.conductor ?? '';
  const dateFromUrl      = searchParams?.date      ?? '';

  return (
    <PrintReport
      evaluation={ev}
      branchName={organFromUrl || (ev.branches as any)?.name || '—'}
      conductorName={conductorFromUrl || (ev.profiles as any)?.full_name || (ev.profiles as any)?.email || '—'}
      submittedAt={dateFromUrl || ev.submitted_at || ev.created_at}
    />
  );
}
