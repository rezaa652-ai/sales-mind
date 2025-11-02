'use client'
import Image from 'next/image'
import { siteImageUrl } from '@/lib/siteImages'

type Props = {
  src: string            // path inside "site" bucket, e.g. "hero.jpg" or "features/one.png"
  alt: string
  className?: string
  priority?: boolean
}

/**
 * Responsive <Image/> that:
 * - fills its container width
 * - uses sizes hint so Next.js serves the right size for mobile/desktop
 */
export default function SiteImage({ src, alt, className, priority }: Props) {
  const url = siteImageUrl(src)
  return (
    <div className={className}>
      <Image
        src={url || '/placeholder.svg'}
        alt={alt}
        width={1600}
        height={900}
        priority={priority}
        style={{ width: '100%', height: 'auto' }}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  )
}
