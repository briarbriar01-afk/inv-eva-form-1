'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

export function RefreshButton() {
  const router = useRouter();
  const [spinning, setSpinning] = useState(false);

  function handleRefresh() {
    setSpinning(true);
    router.refresh();
    setTimeout(() => setSpinning(false), 800);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
      <RefreshCw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
      <span className="rtl-text hidden sm:inline">نوێکردنەوە</span>
    </Button>
  );
}
