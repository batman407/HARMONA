import { ModelCapability } from './types';
import availableModelsData from './available-models.json';

// Detect any real GLB models located in /public/models/ or /src/assets/models/
const publicGlbModules = import.meta.glob('/public/models/*.glb', { eager: false });
const assetsGlbModules = import.meta.glob('/src/assets/models/*.glb', { eager: false });

/**
 * Returns list of instrument IDs that have an authentic GLB model file present.
 */
export const getAvailableModelIds = (): string[] => {
  const ids = new Set<string>((availableModelsData as { models: string[] }).models || []);

  for (const path of Object.keys(publicGlbModules)) {
    const match = path.match(/\/([^/]+)\.glb$/i);
    if (match && match[1]) ids.add(match[1]);
  }

  for (const path of Object.keys(assetsGlbModules)) {
    const match = path.match(/\/([^/]+)\.glb$/i);
    if (match && match[1]) ids.add(match[1]);
  }

  return Array.from(ids);
};

/**
 * Retrieves the model capability metadata for a given instrument.
 */
export const getModelCapability = (instrumentId: string, partsCount: number = 0): ModelCapability => {
  const availableIds = getAvailableModelIds();
  const hasModel = availableIds.includes(instrumentId);
  const isPhotoreal = hasModel;
  const hasParts = hasModel && partsCount > 1;

  return {
    hasModel,
    isPhotoreal,
    hasParts,
    supportsDisassemble: hasParts,
    supportsXray: hasModel,
    supportsActivate: true,
    modelUrl: hasModel ? `/models/${instrumentId}.glb` : undefined,
    statusMessage: hasModel
      ? hasParts
        ? 'Photoreal Multi-Part Model Active'
        : 'Photoreal Single-Mesh Sculpt (Anatomy disassembly not yet available)'
      : '3D Photoreal Model in Production (Coming Soon)',
  };
};
