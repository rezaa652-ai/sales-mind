'use client';
import Image from 'next/image';
import { siteImageUrl } from '@/lib/siteImages';

type Props = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

/**
 * Mobile + Desktop: 100% width (full width)
 */
export default function SiteImage({ src, alt, className = '', priority }: Props) {
  const url = siteImageUrl(src);
  return (
    <div className={`w-full mx-auto rounded-2xl ${className}`}>
      <Image
        src={url || '/placeholder.svg'}
        alt={alt}
        width={1600}
        height={900}
        priority={priority}
        style={{ width: '100%', height: 'auto' }}
        className="object-contain rounded-2xl"
        sizes="100vw"
      />
    </div>
  );
}
