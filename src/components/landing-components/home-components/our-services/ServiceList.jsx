"use client";

import React, { useContext, useMemo, useState } from "react";
import { motion } from "framer-motion"; // ✅ استيراد Framer Motion
import ServiceCard from "./ServiceCard";
import s1 from "../../../../assets/icons/s1.svg";
import s2 from "../../../../assets/icons/s2.svg";
import s3 from "../../../../assets/icons/s3.svg";
import { LanguageContext } from "@/context/LanguageContext";
import { AppLink } from "../../../../utils/routing";

const ServiceList = ({ data }) => {
  const icons = [s1, s2, s3];
  const { lang } = useContext(LanguageContext);
  const [query, setQuery] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState("none");

  const normalized = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((item) => {
      const title =
        (lang === "ar" ? item.titleAr : item.titleEn) ||
        (lang === "ar" ? item.name_ar : item.name_en) ||
        "خدمة";
      const description =
        (lang === "ar" ? item.descriptionAr : item.descriptionEn) ||
        (lang === "ar" ? item.description_ar : item.description_en) ||
        item.description ||
        "";
      const price = item.price ?? item.base_price ?? null;
      return {
        id: item.id,
        title,
        description,
        price,
        imageUrl: item.image_url || item.imageUrl || null,
        isActive: item.is_active,
        raw: item,
      };
    });
  }, [data, lang]);

  const filteredSorted = useMemo(() => {
    let list = normalized;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (s) =>
          String(s.title).toLowerCase().includes(q) ||
          String(s.description).toLowerCase().includes(q)
      );
    }
    if (availableOnly) {
      list = list.filter((s) => s.isActive !== false);
    }
    if (sortBy === "priceAsc") {
      list = [...list].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    } else if (sortBy === "priceDesc") {
      list = [...list].sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    }
    return list;
  }, [normalized, query, availableOnly, sortBy]);

  return (
    <div>
      <div className="container">
        <div className="card mb-4">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
            <div className="flex-1">
              <input
                type="text"
                className="input input-search rounded-xl pl-10"
                placeholder="ابحث عن خدمة..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                />
                المتاحة فقط
              </label>
              <select
                className="input"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="none">بدون ترتيب</option>
                <option value="priceAsc">السعر: من الأقل للأعلى</option>
                <option value="priceDesc">السعر: من الأعلى للأقل</option>
              </select>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            عدد النتائج: {filteredSorted.length}
          </div>
        </div>
        <div className="servicesList grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSorted.length > 0 &&
            filteredSorted.map((item, index) => (
              <motion.div
                key={item.id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
              >
                <ServiceCard
                  index={index + 1}
                  icon={icons[index % icons.length] || s1}
                  imageUrl={item.imageUrl}
                  title={item.title}
                  description={item.description}
                  price={item.price}
                  isActive={item.isActive}
                />
              </motion.div>
            ))}
          {filteredSorted.length === 0 && (
            <div className="col-span-full text-center text-sm text-gray-500 py-10">
              لا توجد خدمات متاحة حالياً
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceList;
