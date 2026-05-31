import Image from "next/image";

export function AppLogo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/15 bg-white shadow-[0_0_34px_rgba(248,250,252,0.12),0_0_58px_rgba(6,182,212,0.08)] ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/detox-logo.png"
        alt="Detox AI logo"
        width={size}
        height={size}
        className="h-full w-full object-cover"
        priority={size > 64}
      />
    </span>
  );
}
