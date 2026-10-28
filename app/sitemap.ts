import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/opros`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/register`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/zayavka`, changeFrequency: "weekly", priority: 0.8 },
  ];
}
