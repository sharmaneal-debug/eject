import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const KIT_DIR = path.join(process.cwd(), "content", "kit");

export type KitMeta = {
  slug: string;
  title: string;
  description: string;
  order: number;
  icon: string;
  estimatedMinutes?: number;
};

export type KitPage = KitMeta & { content: string };

export function listKitPages(): KitMeta[] {
  if (!fs.existsSync(KIT_DIR)) return [];
  return fs
    .readdirSync(KIT_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(KIT_DIR, file), "utf8");
      const { data } = matter(raw);
      return {
        slug: (data.slug as string) || file.replace(/\.md$/, ""),
        title: data.title || "Untitled",
        description: data.description || "",
        order: typeof data.order === "number" ? data.order : 99,
        icon: data.icon || "01",
        estimatedMinutes: data.estimatedMinutes,
      };
    })
    .sort((a, b) => a.order - b.order);
}

export function getKitPage(slug: string): KitPage | null {
  if (!fs.existsSync(KIT_DIR)) return null;
  const filePath = path.join(KIT_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: data.title || slug,
    description: data.description || "",
    order: typeof data.order === "number" ? data.order : 99,
    icon: data.icon || "01",
    estimatedMinutes: data.estimatedMinutes,
    content,
  };
}

export function kitSlugs(): string[] {
  return listKitPages().map((p) => p.slug);
}
