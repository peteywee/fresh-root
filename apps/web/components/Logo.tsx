// [P1][OBSERVABILITY][LOGGING] Logo
// Tags: P1, OBSERVABILITY, LOGGING
import Image from "next/image";

export default function Logo({ className = "" }: { className?: string }) {
  // Use next/image with explicit sizes to reduce LCP and bandwidth.
  return (
    <Image
      className={className}
      src="/logo.svg" // place a tiny monochrome svg in public/logo.svg (under 2KB)
      alt="Fresh Schedules"
      width={24}
      height={24}
      priority
      sizes="24px"
    />
  );
}
