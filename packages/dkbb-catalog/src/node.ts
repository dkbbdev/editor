import { z } from 'zod'
import { BaseNode, nodeType, objectId } from '@pascal-app/core'
import { ARCHETYPE_IDS } from './generated/archetypes'
import { PROFILE_IDS } from './generated/profiles'

/**
 * dkbb:cabinet — a V24 catalog cabinet. One kind for the whole library:
 * archetype + profile are data, and dimensions live in millimeters (the
 * DKBB unit of record) converted to metres only when rendering.
 */
export const DkbbCabinetNode = BaseNode.extend({
  id: objectId('dkbb-cabinet'),
  type: nodeType('dkbb-cabinet'),
  position: z.tuple([z.number(), z.number(), z.number()]).default([0, 0, 0]),
  rotation: z.tuple([z.number(), z.number(), z.number()]).default([0, 0, 0]),
  archetypeId: z.enum(ARCHETYPE_IDS),
  profileId: z.enum(PROFILE_IDS),
  widthMm: z.number().int().min(200).max(2400),
  depthMm: z.number().int().min(200).max(800),
  heightMm: z.number().int().min(400).max(3000),
}).describe('DKBB V24 catalog cabinet (millimetric)')

export type DkbbCabinetNode = z.infer<typeof DkbbCabinetNode>
