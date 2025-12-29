"use client";

import Image from "next/image";

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
}) {
  const resolvedSrc =
    typeof src === "string" ? src : (src?.src || "");
  const isSvg =
    typeof resolvedSrc === "string" ? resolvedSrc.toLowerCase().endsWith(".svg") : false;
  if (isSvg) {
    return <img src={resolvedSrc} alt={alt} className={className} loading="lazy" decoding="async" />;
  }
  if (fill) {
    return (
      <Image
        src={resolvedSrc}
        alt={alt}
        fill
        sizes={sizes || "100vw"}
        priority={priority}
        quality={quality}
        className={className}
      />
    );
  }
  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      quality={quality}
      className={className}
    />
  );
}
