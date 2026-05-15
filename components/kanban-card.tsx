'use client';
import { useState } from 'react';
import { EVALUATION_QUESTIONS } from '@/lib/questions';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, Printer, MessageSquare, Building2, User, Calendar } from 'lucide-react';

interface KanbanCardProps {
  evaluation: Record<string, unknown>;
  organName: string;
  conductorName: string;
  date: string;
}

export function KanbanCard({ evaluation, organName, conductorName, date }: KanbanCardProps) {
  const [expanded, setExpanded] = useState(false);

  const yesCount = EVALUATION_QUESTIONS.filter(({ key }) => evaluation[key] === true).length;
  const pct = Math.round((yesCount / EVALUATION_QUESTIONS.length) * 100);

  const scoreColor = pct >= 85 ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626';
  const scoreBg   = pct >= 85 ? '#f0fdf4' : pct >= 60 ? '#fffbeb' : '#fef2f2';

  const printUrl = `/print/${evaluation.id}?organ=${encodeURIComponent(organName)}&conductor=${encodeURIComponent(conductorName)}&date=${encodeURIComponent(date)}`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="p-4 space-y-3">

        {/* Score badge + question dots */}
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold"
            style={{ background: scoreBg, color: scoreColor }}
          >
            <span>{pct}%</span>
            <span className="text-xs opacity-80 rtl-text">{yesCount}/{EVALUATION_QUESTIONS.length} بەڵێ</span>
          </div>

          {/* Mini question indicators */}
          <div className="flex gap-1">
            {EVALUATION_QUESTIONS.map(({ key }) => (
              <div
                key={key as string}
                className="w-2 h-2 rounded-full"
                style={{
                  background: evaluation[key] === true ? '#16a34a' :
                              evaluation[key] === false ? '#ef4444' : '#e2e8f0',
                }}
              />
            ))}
          </div>
        </div>

        {/* Organ name */}
        <div>
          <div className="flex items-center gap-1.5 rtl-text font-semibold text-slate-800 text-sm">
            <Building2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            {organName}
          </div>
          <div className="flex items-center gap-1.5 rtl-text text-xs text-muted-foreground mt-1">
            <User className="w-3 h-3 flex-shrink-0" />
            {conductorName}
          </div>
          <div className="flex items-center gap-1.5 rtl-text text-xs text-muted-foreground mt-0.5">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            {date}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
            onClick={() => window.open(printUrl, '_blank')}
          >
            <Printer className="w-3 h-3" />
            <span className="rtl-text">چاپ</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 gap-1.5 text-xs text-slate-600"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            <span className="rtl-text">وردەکاری</span>
          </Button>
        </div>
      </div>

      {/* Expanded question details */}
      {expanded && (
        <div className="border-t px-4 pb-4 pt-3 space-y-2.5 bg-slate-50/60">
          {EVALUATION_QUESTIONS.map(({ key, commentKey, text }) => {
            const val     = evaluation[key];
            const comment = evaluation[commentKey] as string;
            return (
              <div key={key as string} className="space-y-0.5">
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5">
                    {val === true  ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> :
                     val === false ? <XCircle      className="w-3.5 h-3.5 text-red-500"   /> :
                     <span className="w-3.5 h-3.5 block rounded-full border-2 border-slate-300 mt-0.5" />}
                  </span>
                  <p className="text-xs rtl-text flex-1 leading-relaxed text-slate-700">{text}</p>
                </div>
                {comment && (
                  <div className="flex items-start gap-1 pr-5 text-xs text-muted-foreground">
                    <MessageSquare className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <span className="rtl-text">{comment}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
