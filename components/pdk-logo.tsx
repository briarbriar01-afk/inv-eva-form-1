interface PdkLogoProps {
  className?: string;
}

export function PdkLogo({ className = 'h-9 w-9' }: PdkLogoProps) {
  return <img src="/pdk-logo.svg" alt="PDK" className={className} />;
}
