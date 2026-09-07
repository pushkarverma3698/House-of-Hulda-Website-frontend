import type { MetadataRoute } from "next";
import { SITE } from "@/lib/schema";
import { getAllPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRouteConfig: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }[] = [
    { path: "", priority: 1.0, changeFrequency: "weekly" },
    { path: "/book", priority: 0.9, changeFrequency: "weekly" },
    { path: "/stay", priority: 0.8, changeFrequency: "weekly" },
    { path: "/cafe", priority: 0.8, changeFrequency: "weekly" },
    { path: "/naggar", priority: 0.8, changeFrequency: "weekly" },
    { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
  ];

  const staticRoutes = staticRouteConfig.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE.url}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const postRoutes = getAllPosts().map((p) => ({
    url: `${SITE.url}/blog/${p.slug}`,
    lastModified: p.date ? new Date(p.date) : now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...postRoutes];
}
