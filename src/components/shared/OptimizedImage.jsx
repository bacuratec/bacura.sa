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
  let resolvedSrc = typeof src === "string" ? src : (src?.src || "");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const defaultBucket = process.env.NEXT_PUBLIC_SUPABASE_IMAGES_BUCKET || "attachments";
  if (resolvedSrc && !/^https?:\/\//i.test(resolvedSrc)) {
    // Path like: "attachments/services/..." or "public/attachments/services/..."
    if (supabaseUrl && /^(public\/)?attachments\//i.test(resolvedSrc)) {
      const cleaned = resolvedSrc.replace(/^public\//, "");
      resolvedSrc = `${supabaseUrl}/storage/v1/object/public/${cleaned}`;
    // Supabase storage-relative path: "storage/v1/object/public/attachments/..."
    } else if (supabaseUrl && /^storage\/v1\/object\//i.test(resolvedSrc)) {
      resolvedSrc = `${supabaseUrl}/${resolvedSrc}`;
    // Bucket-relative path: "services/..." -> assume default bucket
    } else if (supabaseUrl && defaultBucket && /^services\//i.test(resolvedSrc)) {
      resolvedSrc = `${supabaseUrl}/storage/v1/object/public/${defaultBucket}/${resolvedSrc}`;
    }
  }
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
