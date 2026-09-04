export type MapLabel = {
  id: string;
  lat: number;
  lng: number;
  text: string;
  primary: boolean;
};

export type PlacedLabel = MapLabel & { x: number; y: number };

type LabelBox = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  priority: number;
};

const CHAR_PX = 6.2;
const PAD_PX = 14;
const LABEL_H = 18;

export const LABEL_OFFSET_X = 12;
export const LABEL_OFFSET_Y = 0;

const OFFSCREEN_MARGIN = 60;

function overlaps(a: LabelBox, b: LabelBox, padding: number): boolean {
  return (
    a.x < b.x + b.w + padding &&
    a.x + a.w + padding > b.x &&
    a.y < b.y + b.h + padding &&
    a.y + a.h + padding > b.y
  );
}

function declutter(boxes: readonly LabelBox[], padding = 2): Set<string> {
  const ordered = [...boxes].sort(
    (a, b) => b.priority - a.priority || (a.id < b.id ? -1 : 1),
  );
  const placed: LabelBox[] = [];
  const kept = new Set<string>();
  for (const box of ordered) {
    if (box.w <= 0 || box.h <= 0) continue;
    if (placed.some(p => overlaps(p, box, padding))) continue;
    placed.push(box);
    kept.add(box.id);
  }
  return kept;
}

export function placeMapLabels(
  labels: readonly MapLabel[],
  project: (lat: number, lng: number) => [number, number] | null,
  width: number,
  height: number,
): PlacedLabel[] {
  const placed: PlacedLabel[] = [];
  const boxes: LabelBox[] = [];
  for (const [i, label] of labels.entries()) {
    const p = project(label.lat, label.lng);
    if (!p) continue;
    const [x, y] = p;
    if (
      x < -OFFSCREEN_MARGIN ||
      x > width + OFFSCREEN_MARGIN ||
      y < -OFFSCREEN_MARGIN ||
      y > height + OFFSCREEN_MARGIN
    ) {
      continue;
    }
    placed.push({ ...label, x, y });
    boxes.push({
      id: label.id,
      x: x + LABEL_OFFSET_X,
      y: y + LABEL_OFFSET_Y - LABEL_H / 2,
      w: PAD_PX + label.text.length * CHAR_PX,
      h: LABEL_H,
      priority: labels.length - i,
    });
  }
  const kept = declutter(boxes);
  return placed.filter(l => kept.has(l.id));
}
