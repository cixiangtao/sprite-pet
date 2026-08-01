import { SPRITE_PET_LAYOUT, loadSpritePetSource } from "../src/index.js";

const rowColors = [
  "#6d5efc",
  "#ff8f70",
  "#ff8f70",
  "#55a676",
  "#f5b944",
  "#d65d6f",
  "#6699cc",
  "#8b72d0",
  "#4e8d79",
  "#6d5efc",
  "#6d5efc",
];

const createPetCell = (row: number, column: number) => {
  const x = column * SPRITE_PET_LAYOUT.cellWidth;
  const y = row * SPRITE_PET_LAYOUT.cellHeight;
  const bob = row < 9 ? (column % 2) * 4 : 0;
  const directionIndex = row < 9 ? 0 : (row - 9) * 8 + column;
  const angle = (directionIndex * Math.PI) / 8;
  const pupilX = row < 9 ? 0 : Math.sin(angle) * 7;
  const pupilY = row < 9 ? 0 : -Math.cos(angle) * 7;
  const color = rowColors[row] ?? "#6d5efc";

  return `<g transform="translate(${x} ${y + bob})">
    <path d="M55 145 C45 102 55 56 96 45 C137 56 147 102 137 145 C127 172 65 172 55 145Z" fill="${color}" />
    <path d="M64 66 L55 28 L86 52 M128 66 L137 28 L106 52" fill="${color}" stroke="#20231f" stroke-width="6" stroke-linejoin="round" />
    <path d="M55 145 C45 102 55 56 96 45 C137 56 147 102 137 145 C127 172 65 172 55 145Z" fill="none" stroke="#20231f" stroke-width="6" />
    <circle cx="78" cy="96" r="14" fill="#fffdf7" stroke="#20231f" stroke-width="4" />
    <circle cx="114" cy="96" r="14" fill="#fffdf7" stroke="#20231f" stroke-width="4" />
    <circle cx="${78 + pupilX}" cy="${96 + pupilY}" r="5" fill="#20231f" />
    <circle cx="${114 + pupilX}" cy="${96 + pupilY}" r="5" fill="#20231f" />
    <path d="M82 124 Q96 ${132 + (column % 2) * 3} 110 124" fill="none" stroke="#20231f" stroke-width="5" stroke-linecap="round" />
  </g>`;
};

/** Generates a tiny geometric v2 fixture so the demo remains useful without shipping artwork. */
export const loadSamplePet = async () => {
  const cells = Array.from({ length: SPRITE_PET_LAYOUT.extendedRows }, (_rowValue, row) =>
    Array.from({ length: SPRITE_PET_LAYOUT.columns }, (_columnValue, column) =>
      createPetCell(row, column),
    ),
  ).flat();
  const width = SPRITE_PET_LAYOUT.columns * SPRITE_PET_LAYOUT.cellWidth;
  const height = SPRITE_PET_LAYOUT.extendedRows * SPRITE_PET_LAYOUT.cellHeight;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${cells.join("")}</svg>`;
  const objectUrl = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));

  try {
    return await loadSpritePetSource(
      {
        id: "sample",
        displayName: "Sample",
        description: "A generated geometric pet used by the demo.",
        spritesheetPath: "sample.svg",
        spriteVersionNumber: 2,
      },
      objectUrl,
    );
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};
