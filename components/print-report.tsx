'use client';
import { EVALUATION_QUESTIONS } from '@/lib/questions';
import { Printer, Download } from 'lucide-react';

interface PrintReportProps {
  evaluation: Record<string, unknown>;
  branchName: string;
  conductorName: string;
  submittedAt: string;
}

/* ── SVG Arc Gauge ───────────────────────────── */
function ArcGauge({ pct }: { pct: number }) {
  const cx = 80, cy = 80, r = 60, sw = 11;
  const span = 270;
  const startDeg = 135;

  function pt(deg: number) {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  const s   = pt(startDeg);
  const bgE = pt(startDeg + span);
  const fgE = pt(startDeg + (pct / 100) * span);
  const fgLarge = (pct / 100) * span > 180 ? 1 : 0;

  const color  = pct >= 85 ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626';
  const bgPath = `M${s.x},${s.y} A${r},${r} 0 1,1 ${bgE.x},${bgE.y}`;
  const fgPath = `M${s.x},${s.y} A${r},${r} 0 ${fgLarge},1 ${fgE.x},${fgE.y}`;

  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      <path d={bgPath} fill="none" stroke="#e2e8f0" strokeWidth={sw} strokeLinecap="round" />
      {pct > 0 && <path d={fgPath} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="26" fontWeight="bold" fill={color} fontFamily="Segoe UI,Arial">{pct}%</text>
      <text x={cx} y={cy + 16} textAnchor="middle" fontSize="10" fill="#64748b" fontFamily="Segoe UI,Arial">ئەنجامی گشتی</text>
    </svg>
  );
}

/* ── Main ────────────────────────────────────── */
export function PrintReport({ evaluation, branchName, conductorName, submittedAt }: PrintReportProps) {
  const organName    = (evaluation.organ_name     as string) || branchName    || '—';
  const displayConductor = (evaluation.conductor_name as string) || conductorName || '—';
  const rawDate      = (evaluation.evaluation_date as string) || submittedAt;
  const date = new Date(rawDate).toLocaleDateString('ar-IQ', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const yesCount = EVALUATION_QUESTIONS.filter(({ key }) => evaluation[key] === true).length;
  const noCount  = EVALUATION_QUESTIONS.length - yesCount;
  const pct      = Math.round((yesCount / EVALUATION_QUESTIONS.length) * 100);
  const color    = pct >= 85 ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626';
  const label    = pct >= 85 ? 'زۆر باش' : pct >= 60 ? 'باش' : 'پێویستی بە باشترکردن هەیە';

  return (
    <>
      {/* Print-specific page styles */}
      <style>{`
        @media print {
          body { margin: 0 !important; padding: 0 !important; background: white !important; }
          .no-print { display: none !important; }
          .a4-wrap { box-shadow: none !important; border-radius: 0 !important; width: 100% !important; }
          @page { size: A4 portrait; margin: 8mm; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: '20px 0', fontFamily: 'Segoe UI, Arial, sans-serif' }}>

        {/* Toolbar — hidden on print */}
        <div className="no-print" style={{ maxWidth: 750, margin: '0 auto 14px', display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '0 16px' }}>
          <button
            onClick={() => window.history.back()}
            style={{ padding: '7px 16px', border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13 }}
          >
            ← گەڕانەوە
          </button>
          <button
            onClick={() => window.print()}
            style={{ padding: '7px 18px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Printer size={14} /> چاپکردن
          </button>
          <button
            onClick={() => {
              const orig = document.title;
              document.title = `جەرد - ${organName} - ${date}`;
              window.print();
              document.title = orig;
            }}
            style={{ padding: '7px 18px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Download size={14} /> پاشەکەوتکردن PDF
          </button>
        </div>

        {/* A4 page */}
        <div className="a4-wrap" style={{
          width: 750, margin: '0 auto', background: '#fff',
          boxShadow: '0 4px 24px rgba(0,0,0,0.10)', borderRadius: 6,
          overflow: 'hidden', direction: 'rtl',
        }}>

          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)', padding: '22px 32px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>هەڵسەنگاندنی پرۆسەی جەرد</div>
              <div style={{ fontSize: 11, marginTop: 5, opacity: 0.75, letterSpacing: 0.3 }}>سیستەمی جەردی کەل و پەل</div>
            </div>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📋</div>
          </div>

          {/* Info strip */}
          <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '14px 32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <InfoCell label="ناوی ئۆرگان"  value={organName} />
              <InfoCell label="ناوی ژمێریار" value={displayConductor} />
              <InfoCell label="بەروارەکە"    value={date} />
            </div>
          </div>

          {/* Score section */}
          <div style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', gap: 28, borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ flexShrink: 0, textAlign: 'center' }}>
              <ArcGauge pct={pct} />
              <div style={{ marginTop: 4, fontSize: 12, fontWeight: 700, color, background: `${color}15`, display: 'inline-block', padding: '3px 12px', borderRadius: 20 }}>
                {label}
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#1e293b', borderRight: '3px solid #2563eb', paddingRight: 8 }}>
                ئەنجامی هەڵسەنگاندن
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <StatBox value={yesCount} label="وەڵامی بەڵێ"   color="#16a34a" bg="#f0fdf4" />
                <StatBox value={noCount}  label="وەڵامی نەخێر" color="#dc2626" bg="#fef2f2" />
              </div>
              {/* Progress bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, height: 10, borderRadius: 6, background: '#e2e8f0', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 6 }} />
                </div>
                <span style={{ fontSize: 11, color: '#64748b', minWidth: 40 }}>{pct}%</span>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div style={{ padding: '18px 32px 22px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#1e293b', borderRight: '3px solid #2563eb', paddingRight: 8 }}>
              پرسیارەکانی جەرد
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {EVALUATION_QUESTIONS.map(({ key, commentKey, text }, i) => {
                const val     = evaluation[key];
                const comment = evaluation[commentKey] as string;
                const isYes   = val === true;
                const isNo    = val === false;

                return (
                  <div key={key} style={{
                    border: `1px solid ${isYes ? '#bbf7d0' : isNo ? '#fecaca' : '#e2e8f0'}`,
                    borderRadius: 8,
                    background: isYes ? '#f0fdf4' : isNo ? '#fef2f2' : '#f8fafc',
                    padding: '8px 12px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flex: 1 }}>
                        <span style={{
                          flexShrink: 0, width: 22, height: 22, borderRadius: '50%',
                          background: '#1e40af', color: '#fff', fontSize: 10,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                        }}>{i + 1}</span>
                        <span style={{ fontSize: 12, color: '#1e293b', lineHeight: 1.6, paddingTop: 2 }}>{text}</span>
                      </div>
                      <div style={{
                        flexShrink: 0, padding: '2px 12px', borderRadius: 16, fontSize: 11, fontWeight: 700,
                        background: isYes ? '#16a34a' : isNo ? '#dc2626' : '#94a3b8',
                        color: '#fff', minWidth: 54, textAlign: 'center',
                      }}>
                        {isYes ? '✓ بەڵێ' : isNo ? '✗ نەخێر' : '—'}
                      </div>
                    </div>
                    {comment && (
                      <div style={{ marginTop: 4, marginRight: 30, fontSize: 11, color: '#64748b', borderRight: '2px solid #cbd5e1', paddingRight: 6 }}>
                        💬 {comment}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '10px 32px 18px', textAlign: 'center', color: '#94a3b8', fontSize: 10, borderTop: '1px solid #f1f5f9' }}>
            سیستەمی جەردی کەل و پەل — {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 9, color: '#94a3b8', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{value}</div>
    </div>
  );
}

function StatBox({ value, label, color, bg }: { value: number; label: string; color: string; bg: string }) {
  return (
    <div style={{ background: bg, border: `1px solid ${color}30`, borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
      <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{label}</div>
    </div>
  );
}
