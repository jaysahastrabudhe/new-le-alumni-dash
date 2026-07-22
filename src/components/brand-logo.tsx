import { cn } from '@/lib/utils'

type BrandLogoProps = {
  className?: string
  showNetworkLabel?: boolean
}

export function BrandLogo({ className, showNetworkLabel = true }: BrandLogoProps) {
  return (
    <span className="flex min-w-0 flex-col">
      <img
        src="/lets-enterprise-logo-white.png"
        alt="Let's Enterprise"
        className={cn('h-auto w-[150px] sm:w-[166px]', className)}
      />
      {showNetworkLabel && (
        <span className="mt-0.5 pl-0.5 text-[8px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Alumni Network
        </span>
      )}
    </span>
  )
}
