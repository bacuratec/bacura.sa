"use client";

import Image from "next/image";
import { useState, useMemo } from "react";

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes,
  priority = false,
  quality = 75,
  className = "",
  fallbackSrc = "",
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const defaultBucket = process.env.NEXT_PUBLIC_SUPABASE_IMAGES_BUCKET || "attachments";
  const [failed, setFailed] = useState(false);
  const resolvedSrc = useMemo(() => {
    let val = typeof src === "string" ? src : (src?.src || "");
    if (val && !/^https?:\/\//i.test(val)) {
      if (supabaseUrl && /^(public\/)?attachments\//i.test(val)) {
        const cleaned = val.replace(/^public\//, "");
        val = `${supabaseUrl}/storage/v1/object/public/${cleaned}`;
      } else if (supabaseUrl && /^storage\/v1\/object\//i.test(val)) {
        val = `${supabaseUrl}/${val}`;
      } else if (supabaseUrl && defaultBucket && /^services\//i.test(val)) {
        val = `${supabaseUrl}/storage/v1/object/public/${defaultBucket}/${val}`;
      }
    }
    return val;
  }, [src, supabaseUrl, defaultBucket]);
  const finalSrc = failed ? (typeof fallbackSrc === "string" ? fallbackSrc : (fallbackSrc?.src || "")) : resolvedSrc;
  const isSvg = typeof finalSrc === "string" ? finalSrc.toLowerCase().endsWith(".svg") : false;
  if (!finalSrc) {
    const fb = typeof fallbackSrc === "string" ? fallbackSrc : (fallbackSrc?.src || "");
    if (fb) {
      return <img src={fb} alt={alt} className={className} loading="lazy" decoding="async" />;
    }
    return <img src="" alt={alt} className={className} loading="lazy" decoding="async" />;
  }
  if (isSvg) {
    return <img src={finalSrc} alt={alt} className={className} loading="lazy" decoding="async" onError={() => setFailed(true)} />;
  }
  if (fill) {
    return (
      <Image
        src={finalSrc}
        alt={alt}
        fill
        sizes={sizes || "100vw"}
        priority={priority}
        quality={quality}
        className={className}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <Image
      src={finalSrc}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      quality={quality}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
