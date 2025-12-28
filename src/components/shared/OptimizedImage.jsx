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
  const isSvg =
    typeof src === "string" ? src.toLowerCase().endsWith(".svg") : false;
  if (isSvg) {
    return <img src={src} alt={alt} className={className} />;
  }
  if (fill) {
    return (
      <Image
        src={src}
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
      src={src}
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
