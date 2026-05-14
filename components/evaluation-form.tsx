'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { EVALUATION_QUESTIONS } from '@/lib/questions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, MessageSquarePlus, Loader2, CheckCheck } from 'lucide-react';

type Answers  = Record<string, boolean | null>;
type Comments = Record<string, string>;

interface EvaluationFormProps {
  conductorId: string;
  existingDraft?: Record<string, unknown>;
}

function buildInitialAnswers(draft?: Record<string, unknown>): Answers {
  const a: Answers = {};
  EVALUATION_QUESTIONS.forEach(({ key }) => {
    a[key] = draft ? (draft[key] as boolean | null) ?? null : null;
  });
  return a;
}

function buildInitialComments(draft?: Record<string, unknown>): Comments {
  const c: Comments = {};
  EVALUATION_QUESTIONS.forEach(({ commentKey }) => {
    c[commentKey] = draft ? (draft[commentKey] as string) ?? '' : '';
  });
  return c;
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function EvaluationForm({ conductorId, existingDraft }: EvaluationFormProps) {
  const supabase = createClient();

  const [organName,      setOrganName]      = useState((existingDraft?.organ_name      as string) ?? '');
  const [conductorName,  setConductorName]  = useState((existingDraft?.conductor_name  as string) ?? '');
  const [evalDate,       setEvalDate]       = useState((existingDraft?.evaluation_date as string) ?? todayISO());
  const [answers,        setAnswers]        = useState<Answers>(buildInitialAnswers(existingDraft));
  const [comments,       setComments]       = useState<Comments>(buildInitialComments(existingDraft));
  const [showComment,    setShowComment]    = useState<Record<string, boolean>>({});
  const [loading,        setLoading]        = useState(false);
  const [submitted,      setSubmitted]      = useState(false);
  const [error,          setError]          = useState('');

  const yesCount      = Object.values(answers).filter(Boolean).length;
  const answeredCount = Object.values(answers).filter((v) => v !== null).length;

  function setAnswer(key: string, value: boolean) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }
  function setComment(key: string, value: string) {
    setComments((prev) => ({ ...prev, [key]: value }));
  }
  function toggleComment(key: string) {
    setShowComment((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSubmit() {
    if (!organName.trim())     { setError('تکایە ناوی ئۆرگانەکە بنووسە');     return; }
    if (!conductorName.trim()) { setError('تکایە ناوی ژمێریارەکە بنووسە');    return; }
    if (!evalDate)             { setError('تکایە بەروارەکە دیاری بکە');        return; }
    if (answeredCount < EVALUATION_QUESTIONS.length) {
      setError('تکایە هەموو پرسیارەکان وەڵامی بدەوە');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      conductor_id:    conductorId,
      organ_name:      organName.trim(),
      conductor_name:  conductorName.trim(),
      evaluation_date: evalDate,
      status:          'submitted',
      submitted_at:    new Date().toISOString(),
      ...answers,
      ...comments,
    };

    let dbError;
    if (existingDraft?.id) {
      ({ error: dbError } = await supabase
        .from('evaluations')
        .update(payload)
        .eq('id', existingDraft.id as string));
    } else {
      ({ error: dbError } = await supabase.from('evaluations').insert(payload));
    }

    setLoading(false);
    if (dbError) {
      setError('هەڵەیەک ڕوویدا، دووبارە هەوڵ بدەوە');
      console.error(dbError);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <CheckCheck className="w-16 h-16 text-green-600" />
        <h2 className="text-xl font-bold rtl-text">جەردەکە بەسەرکەوتووی پێشکەشکرا!</h2>
        <p className="text-muted-foreground rtl-text">سوپاس، جەردەکەت تۆمارکرا.</p>
        <Badge variant="success" className="text-base px-4 py-1">
          {yesCount}/{EVALUATION_QUESTIONS.length} بەڵێ
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Info card: organ + conductor + date */}
      <Card>
        <CardContent className="pt-5 pb-5 space-y-4">
          {/* Organ name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold rtl-text">ناوی ئۆرگان <span className="text-red-500">*</span></label>
            <Input
              dir="rtl"
              placeholder="ناوی ئۆرگانەکە بنووسە..."
              value={organName}
              onChange={(e) => setOrganName(e.target.value)}
              className="rtl-text text-right"
            />
          </div>

          {/* Conductor name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold rtl-text">ناوی ژمێریار <span className="text-red-500">*</span></label>
            <Input
              dir="rtl"
              placeholder="ناوی خۆت بنووسە..."
              value={conductorName}
              onChange={(e) => setConductorName(e.target.value)}
              className="rtl-text text-right"
            />
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold rtl-text">بەروارەکە <span className="text-red-500">*</span></label>
            <Input
              type="date"
              value={evalDate}
              onChange={(e) => setEvalDate(e.target.value)}
              dir="ltr"
              className="text-left"
            />
          </div>
        </CardContent>
      </Card>

      {/* Progress pill */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm text-muted-foreground rtl-text">{answeredCount}/{EVALUATION_QUESTIONS.length} وەڵامدراوە</span>
        <Badge variant={answeredCount === EVALUATION_QUESTIONS.length ? 'success' : 'secondary'}>
          {yesCount} بەڵێ
        </Badge>
      </div>

      {/* Question cards */}
      {EVALUATION_QUESTIONS.map((q, index) => {
        const answer        = answers[q.key];
        const commentVisible = showComment[q.commentKey] || !!comments[q.commentKey];

        return (
          <Card
            key={q.key}
            className={`transition-all border-2 ${
              answer === true  ? 'border-green-200 bg-green-50/30' :
              answer === false ? 'border-red-200 bg-red-50/30' :
              'border-border'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                  {index + 1}
                </span>
                <CardTitle className="text-sm font-medium leading-relaxed rtl-text flex-1">
                  {q.text}
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant={answer === false ? 'danger' : 'outline'}
                  size="sm"
                  className="gap-1.5 min-w-[80px]"
                  onClick={() => setAnswer(q.key, false)}
                >
                  <XCircle className="w-4 h-4" />
                  <span className="rtl-text">نەخێر</span>
                </Button>
                <Button
                  type="button"
                  variant={answer === true ? 'success' : 'outline'}
                  size="sm"
                  className="gap-1.5 min-w-[80px]"
                  onClick={() => setAnswer(q.key, true)}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="rtl-text">بەڵێ</span>
                </Button>
              </div>

              {!commentVisible && (
                <button
                  type="button"
                  onClick={() => toggleComment(q.commentKey)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors rtl-text"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  تێبینی زیاد بکە
                </button>
              )}

              {commentVisible && (
                <Textarea
                  placeholder="تێبینی..."
                  value={comments[q.commentKey]}
                  onChange={(e) => setComment(q.commentKey, e.target.value)}
                  className="text-sm rtl-text resize-none"
                  rows={2}
                  dir="rtl"
                />
              )}
            </CardContent>
          </Card>
        );
      })}

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700 rtl-text">
          {error}
        </div>
      )}

      <Button onClick={handleSubmit} disabled={loading} size="lg" className="w-full h-12 text-base">
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" /> چاوەڕێ بکە...</>
          : <><CheckCheck className="w-5 h-5" /><span className="rtl-text">پێشکەشکردنی جەرد</span></>
        }
      </Button>
    </div>
  );
}
