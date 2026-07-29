export type SelectedWork = {
  id: string;
  title: string;
  year: string;
  medium: string;
  dimensions: string;
  price: string;
  description: string;
  image: string;
};

const WORK_FILES = [
  "66167303-E476-4EFE-A6D9-8FAF5ACE0E59.jpg",
  "FE1F45EA-6B8C-4775-B956-06A7A3D7479A.jpg",
  "IMG_0109.jpg",
  "IMG_0125.jpg",
  "IMG_0847.jpg",
  "IMG_0868.jpg",
  "IMG_1011.jpg",
  "IMG_1050.jpg",
  "IMG_1913.jpg",
  "IMG_2584.JPG",
  "IMG_5206.jpg",
  "IMG_5211.jpg",
  "IMG_5236.jpg",
  "IMG_5245.jpg",
  "IMG_5251.jpg",
  "IMG_5959.jpg",
  "IMG_5969.jpg",
  "IMG_5983.jpg",
  "IMG_7987.jpg",
  "IMG_7990.jpg",
  "IMG_8009.jpg",
  "IMG_8011.jpg",
  "IMG_8024.jpg",
  "IMG_8026.jpg",
  "IMG_8032.jpg",
  "IMG_8042.jpg",
  "IMG_8055.jpg",
  "IMG_9368.jpg",
  "IMG_9369.jpg",
  "IMG_9395.jpg",
  "IMG_9403.jpg",
  "IMG_9413.jpg",
  "IMG_9420.jpg",
  "IMG_9429.jpg",
];

const slugFromFile = (file: string) =>
  file
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const titleFromFile = (file: string, index: number) => {
  const imgCode = file.match(/IMG_(\d+)/i)?.[1];
  if (imgCode) return `Untitled (${imgCode})`;
  return `Untitled Study ${index + 1}`;
};

export const SELECTED_WORKS: SelectedWork[] = WORK_FILES.map((file, index) => ({
  id: slugFromFile(file),
  title: titleFromFile(file, index),
  year: "2026",
  medium: "Interior Artwork",
  dimensions: "Available on request",
  price: "Price on request",
  description:
    "Part of the Interior Artworks collection by Oma Achebe. For details on provenance, dimensions, and pricing, please inquire directly.",
  image: `/images/selected-works/${file}`,
}));

export const SELECTED_WORKS_BY_ID: Record<string, SelectedWork> =
  Object.fromEntries(SELECTED_WORKS.map((work) => [work.id, work]));
