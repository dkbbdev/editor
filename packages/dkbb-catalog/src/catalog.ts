import { ARCHETYPES } from './generated/archetypes'
import { PROFILES } from './generated/profiles'

export function archetypeById(id: string) {
  return ARCHETYPES.find((a) => a.id === id)
}

export function profileById(id: string) {
  return PROFILES.find((p) => p.id === id)
}

/** Defaults for a placement: archetype defaults in millimeters. */
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
