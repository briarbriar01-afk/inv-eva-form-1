'use client';
import { EVALUATION_QUESTIONS } from '@/lib/questions';
import { Printer } from 'lucide-react';

interface PrintReportProps {
  evaluation: Record<string, unknown>;
  branchName: string;
  conductorName: string;
  submittedAt: string;
}

/* ── SVG Arc Gauge ──────────────────────────── */
function ArcGauge({ pct }: { pct: number }) {
  const cx = 90, cy = 90, r = 68, stroke = 13;
  const span = 270;
  const startDeg = 135;

  function pt(deg: number) {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  const s = pt(startDeg);
  const bgE = pt(startDeg + span);
  const fgE = pt(startDeg + (pct / 100) * span);
  const fgLarge = (pct / 100) * span > 180 ? 1 : 0;

  const color = pct >= 85 ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626';
  const bgPath = `M${s.x},${s.y} A${r},${r} 0 1,1 ${bgE.x},${bgE.y}`;
  const fgPath = pct === 0 ? '' : `M${s.x},${s.y} A${r},${r} 0 ${fgLarge},1 ${fgE.x},${fgE.y}`;

  return (
    <svg width="180" height="180" viewBox="0 0 180 180">
      <path d={bgPath} fill="none" stroke="#e2e8f0" strokeWidth={stroke} strokeLinecap="round" />
      {fgPath && <path d={fgPath} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" />}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="30" fontWeight="bold" fill={color} fontFamily="Segoe UI, Arial">{pct}%</text>
      <text x={cx} y={cy + 16} textAnchor="middle" fontSize="11" fill="#64748b" fontFamily="Segoe UI, Arial">ئەنجامی گشتی</text>
    </svg>
  );
}

/* ── Bar chart row ─────────────────────────── */
function ScoreBar({ yes, total }: { yes: number; total: number }) {
  const no = total - yes;
  const pct = Math.round((yes / total) * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, direction: 'rtl' }}>
      <div style={{ flex: 1, height: 14, borderRadius: 8, background: '#e2e8f0', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: `${pct}%`, background: pct >= 85 ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626', borderRadius: 8, transition: 'width 0.3s' }} />
      </div>
      <span style={{ minWidth: 60, fontSize: 12, color: '#475569', fontFamily: 'Segoe UI, Arial', textAlign: 'right', direction: 'rtl' }}>
        {yes} بەڵێ / {no} نەخێر
      </span>
    </div>
  );
}

/* ── Main component ────────────────────────── */
export function PrintReport({ evaluation, branchName, conductorName, submittedAt }: PrintReportProps) {
  const date = new Date(submittedAt).toLocaleDateString('ar-IQ', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const yesCount = EVALUATION_QUESTIONS.filter(({ key }) => evaluation[key] === true).length;
  const noCount  = EVALUATION_QUESTIONS.length - yesCount;
  const pct      = Math.round((yesCount / EVALUATION_QUESTIONS.length) * 100);
  const color    = pct >= 85 ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626';
  const label    = pct >= 85 ? 'زۆر باش' : pct >= 60 ? 'باش' : 'پێویستی بە باشترکردن هەیە';

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: '24px 0' }}>

      {/* Print / Back buttons — hidden when printing */}
      <div className="no-print" style={{ maxWidth: 794, margin: '0 auto 16px', display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '0 16px' }}>
        <button
          onClick={() => window.history.back()}
          style={{ padding: '8px 18px', border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 14, fontFamily: 'Segoe UI, Arial' }}
        >
          ← گەڕانەوە
        </button>
        <button
          onClick={() => window.print()}
          style={{ padding: '8px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontFamily: 'Segoe UI, Arial', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Printer size={16} /> چاپکردن
        </button>
      </div>

      {/* ── A4 Page ── */}
      <div style={{
        width: 794, minHeight: 1123, margin: '0 auto', background: '#ffffff',
        boxShadow: '0 4px 32px rgba(0,0,0,0.12)', borderRadius: 4,
        overflow: 'hidden', fontFamily: 'Segoe UI, Arial, sans-serif',
        direction: 'rtl',
      }}>

        {/* Header band */}
        <div style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 60%, #3b82f6 100%)', padding: '28px 40px', color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 0.5 }}>تایبەتنامەی جەردی کەل و پەل</div>
              <div style={{ fontSize: 13, marginTop: 6, opacity: 0.85 }}>Inventory Evaluation Report</div>
            </div>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
              📋
            </div>
          </div>
        </div>

        {/* Info strip */}
        <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '16px 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <InfoCell label="ناوی ئۆرگان" value={branchName} />
            <InfoCell label="ناوی ژمێریار" value={conductorName} />
            <InfoCell label="بەروارەکە" value={date} />
          </div>
        </div>

        {/* Score section */}
        <div style={{ padding: '28px 40px', display: 'flex', alignItems: 'center', gap: 32, borderBottom: '1px solid #e2e8f0' }}>
          {/* Gauge */}
          <div style={{ flexShrink: 0, textAlign: 'center' }}>
            <ArcGauge pct={pct} />
            <div style={{ marginTop: 4, fontSize: 13, fontWeight: 700, color, background: `${color}18`, display: 'inline-block', padding: '3px 14px', borderRadius: 20 }}>
              {label}
            </div>
          </div>

          {/* Stats */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#1e293b' }}>ئەنجامی کلیلی</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <StatBox value={yesCount} label="وەڵامی بەڵێ" color="#16a34a" bg="#f0fdf4" />
              <StatBox value={noCount}  label="وەڵامی نەخێر" color="#dc2626" bg="#fef2f2" />
            </div>

            <ScoreBar yes={yesCount} total={EVALUATION_QUESTIONS.length} />
          </div>
        </div>

        {/* Questions */}
        <div style={{ padding: '24px 40px' }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#1e293b', borderRight: '4px solid #2563eb', paddingRight: 10 }}>
            پرسیارەکانی جەرد
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {EVALUATION_QUESTIONS.map(({ key, commentKey, text }, i) => {
              const val     = evaluation[key];
              const comment = evaluation[commentKey] as string;
              const isYes   = val === true;
              const isNo    = val === false;

              return (
                <div key={key} style={{
                  border: `1px solid ${isYes ? '#bbf7d0' : isNo ? '#fecaca' : '#e2e8f0'}`,
                  borderRadius: 10,
                  background: isYes ? '#f0fdf4' : isNo ? '#fef2f2' : '#f8fafc',
                  padding: '10px 14px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1 }}>
                      <span style={{
                        flexShrink: 0, width: 26, height: 26, borderRadius: '50%',
                        background: '#2563eb', color: '#fff', fontSize: 11,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                      }}>{i + 1}</span>
                      <span style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.6, paddingTop: 4 }}>{text}</span>
                    </div>
                    <div style={{
                      flexShrink: 0, padding: '3px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                      background: isYes ? '#16a34a' : isNo ? '#dc2626' : '#94a3b8',
                      color: '#fff', minWidth: 60, textAlign: 'center',
                    }}>
                      {isYes ? '✓ بەڵێ' : isNo ? '✗ نەخێر' : '—'}
                    </div>
                  </div>
                  {comment && (
                    <div style={{ marginTop: 6, marginRight: 36, fontSize: 12, color: '#64748b', borderRight: '2px solid #cbd5e1', paddingRight: 8 }}>
                      💬 {comment}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Signature section */}
        <div style={{ margin: '8px 40px 0', padding: '20px 24px', background: '#f8fafc', borderRadius: 12, border: '1px dashed #cbd5e1' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <SigLine label="واژووی ژمێریار" />
            <SigLine label="واژووی بەرپرسی دارایی" />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 40px 24px', textAlign: 'center', color: '#94a3b8', fontSize: 11, marginTop: 8 }}>
          سیستەمی جەردی کەل و پەل — {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}

/* ── Small helpers ── */
function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{value}</div>
    </div>
  );
}

function StatBox({ value, label, color, bg }: { value: number; label: string; color: string; bg: string }) {
  return (
    <div style={{ background: bg, border: `1px solid ${color}30`, borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function SigLine({ label }: { label: string }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 20 }}>{label}</div>
      <div style={{ borderBottom: '1px solid #94a3b8', width: '100%' }} />
    </div>
  );
}
