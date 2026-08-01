export interface BuiltInPet {
  id: string;
  displayName: string;
  description: string;
  spriteVersionNumber: 1 | 2;
  manifestPath: string;
}

interface BuiltInPetIndex {
  pets: BuiltInPet[];
}

const isBuiltInPet = (value: unknown): value is BuiltInPet => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;

  const pet = value as Record<string, unknown>;
  return (
    typeof pet.id === "string" &&
    typeof pet.displayName === "string" &&
    typeof pet.description === "string" &&
    (pet.spriteVersionNumber === 1 || pet.spriteVersionNumber === 2) &&
    typeof pet.manifestPath === "string"
  );
};

export const loadBuiltInPetIndex = async (): Promise<BuiltInPetIndex> => {
  const response = await fetch(new URL("./pets/index.json", window.location.href));
  if (!response.ok) {
    throw new Error(`Unable to load built-in pets (${response.status}).`);
  }

  const value: unknown = await response.json();
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    !("pets" in value) ||
    !Array.isArray(value.pets) ||
    !value.pets.every(isBuiltInPet)
  ) {
    throw new Error("The built-in pet index is invalid.");
  }

  return { pets: value.pets };
};
