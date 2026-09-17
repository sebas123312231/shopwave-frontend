'use client';

import Image from 'next/image';
import { useState } from 'react';

export function ProductImage({ src, alt, sizes = '(max-width: 768px) 50vw, 25vw', className = '' }: { src: string; alt: string; sizes?: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  return <Image src={failed ? '/product-placeholder.svg' : src} alt={alt} fill sizes={sizes} className={`object-cover ${className}`} onError={() => setFailed(true)} />;
}
