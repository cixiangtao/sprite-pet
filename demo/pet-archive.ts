import { zipSync } from "fflate";

/** Source files embedded in one downloadable pet package. */
export interface PetArchiveFiles {
  manifest: Uint8Array;
  spritesheet: Uint8Array;
  notice: Uint8Array;
}

/** Creates a portable ZIP without recompressing the already-compressed WebP atlas. */
export const createPetArchive = ({ manifest, spritesheet, notice }: PetArchiveFiles) =>
  zipSync(
    {
      "pet.json": manifest,
      "spritesheet.webp": spritesheet,
      "NOTICE.md": notice,
    },
    { level: 0 },
  );
