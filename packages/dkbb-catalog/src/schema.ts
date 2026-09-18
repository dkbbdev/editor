import { z } from 'zod'
import { ARCHETYPES, ARCHETYPE_IDS, CATEGORIES } from './generated/archetypes'
import { PROFILE_IDS, PROFILES } from './generated/profiles'

/**
 * dkbb:cabinet — one kind for the whole V24 catalog. Archetype + profile are
 * data (generated enums), not node kinds: 176 archetypes would swamp the
 * registry, and the whole point of the registry build was that they are the
 * same few boxes with different parameters and materials.
 */
export const DkbbCabinetNode = z.object({
  archetypeId: z.enum(ARCHETYPE_IDS),
  profileId: z.enum(PROFILE_IDS),
  /** Millimeters — the DKBB unit of record. Convert to metres at the scene boundary. */
  widthMm: z.number().int().min(200).max(2400),
  depthMm: z.number().int().min(200).max(800),
  heightMm: z.number().int().min(400).max(3000),
})

export type DkbbCabinetNode = z.infer<typeof DkbbCabinetNode>

export function archetypeById(id: string) {
  return ARCHETYPES.find((a) => a.id === id)
}

export function profileById(id: string) {
  return PROFILES.find((p) => p.id === id)
}

export const DKBB_CATEGORIES = CATEGORIES

/** Defaults for a placement: archetype defaults + profile board thickness. */
export function dkbbDefaults(archetypeId: string, profileId: string) {
  const a = archetypeById(archetypeId)
  const p = profileById(profileId)
  if (!a || !p) throw new Error(`unknown archetype/profile: ${archetypeId}/${profileId}`)
  return {
    archetypeId,
    profileId,
    widthMm: a.params.width.default,
    depthMm: a.params.depth.default,
    heightMm: a.params.height.default,
    boardThicknessMm: p.board.thicknessMm,
  }
}
