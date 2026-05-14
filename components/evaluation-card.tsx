'use client';
import { useState } from 'react';
import { EVALUATION_QUESTIONS } from '@/lib/questions';
import { RadialGauge } from '@/components/radial-gauge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, MessageSquare, Calendar, User, Building2, Printer } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface EvaluationCardProps {
  evaluation: Record<string, unknown>;
  conductorName?: string;
  branchName?: string;
}

export function EvaluationCard({ evaluation, conductorName, branchName }: EvaluationCardProps) {
  const [expanded, setExpanded] = useState(false);

  const yesCount = EVALUATION_QUESTIONS.filter(({ key }) => evaluation[key] === true).length;
  const total = EVALUATION_QUESTIONS.length;

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-0 pt-5 px-5">
        {/* Meta row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-4">
          {branchName && (
            <span className="flex items-center gap-1.5 rtl-text">
              <Building2 className="w-3.5 h-3.5" />
              {branchName}
            </span>
          )}
          {conductorName && (
            <span className="flex items-center gap-1.5 rtl-text">
              <User className="w-3.5 h-3.5" />
              {conductorName}
            </span>
          )}
          <span className="flex items-center gap-1.5 rtl-text">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(evaluation.submitted_at as string || evaluation.created_at as string)}
          </span>
        </div>

        {/* Gauge + quick stats */}
        <div className="flex items-center justify-between gap-4 pb-4">
          <RadialGauge yesCount={yesCount} total={total} />

          <div className="flex-1 grid grid-cols-2 gap-2">
            {EVALUATION_QUESTIONS.map(({ key }, i) => {
              const val = evaluation[key];
              return (
                <div
                  key={key}
                  className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium rtl-text ${
                    val === true  ? 'bg-green-50 text-green-700' :
                    val === false ? 'bg-red-50 text-red-700' :
                    'bg-muted text-muted-foreground'
                  }`}
                >
                  {val === true  ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> :
                   val === false ? <XCircle className="w-3.5 h-3.5 flex-shrink-0" /> :
                   <span className="w-3.5 h-3.5 flex-shrink-0 rounded-full border border-current" />}
                  پ {i + 1}
                </div>
              );
            })}
          </div>
        </div>
      </CardHeader>

      {/* Print button */}
      <div className="px-5 pb-0 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
          onClick={() => window.open(`/print/${evaluation.id}`, '_blank')}
        >
          <Printer className="w-3.5 h-3.5" />
          <span className="rtl-text">چاپکردنی ڕاپۆرت</span>
        </Button>
      </div>

      {/* Expand / Collapse */}
      <div className="px-5 pb-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center gap-2 text-muted-foreground text-xs"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? (
            <><ChevronUp className="w-4 h-4" /><span className="rtl-text">داخستنەوە</span></>
          ) : (
            <><ChevronDown className="w-4 h-4" /><span className="rtl-text">وردەکاریەکان</span></>
          )}
        </Button>
      </div>

      {expanded && (
        <CardContent className="pt-0 px-5 pb-5 space-y-3 border-t mt-2">
          {EVALUATION_QUESTIONS.map(({ key, commentKey, text }) => {
            const val = evaluation[key];
            const comment = evaluation[commentKey] as string;

            return (
              <div key={key} className="space-y-1">
                <div className="flex items-start gap-2">
                  <span className={`flex-shrink-0 mt-0.5 ${val === true ? 'text-green-600' : val === false ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {val === true  ? <CheckCircle2 className="w-4 h-4" /> :
                     val === false ? <XCircle className="w-4 h-4" /> :
                     <span className="w-4 h-4 block rounded-full border-2 border-muted-foreground/40" />}
                  </span>
                  <p className="text-sm rtl-text flex-1">{text}</p>
                  {val !== null && (
                    <Badge
                      variant={val === true ? 'success' : 'destructive'}
                      className="flex-shrink-0 rtl-text"
                    >
                      {val ? 'بەڵێ' : 'نەخێر'}
                    </Badge>
                  )}
                </div>

                {comment && (
                  <div className="flex items-start gap-1.5 pl-6 text-xs text-muted-foreground">
                    <MessageSquare className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <span className="rtl-text">{comment}</span>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      )}
    </Card>
  );
}
