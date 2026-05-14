import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PrintReport } from '@/components/print-report';

export default async function PrintPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: ev } = await supabase
    .from('evaluations')
    .select('*, branches(name), profiles(full_name, email)')
    .eq('id', params.id)
    .single();

  if (!ev) notFound();

  return (
    <PrintReport
      evaluation={ev}
      branchName={(ev.branches as any)?.name ?? '—'}
      conductorName={(ev.profiles as any)?.full_name ?? (ev.profiles as any)?.email ?? '—'}
      submittedAt={ev.submitted_at ?? ev.created_at}
    />
  );
}
