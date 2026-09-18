import { z } from 'zod'
import { BaseNode, nodeType, objectId } from '@pascal-app/core'
import { ARCHETYPE_IDS } from './generated/archetypes'
import { PROFILE_IDS } from './generated/profiles'

/**
 * One front division of the cabinet, stacked bottom-to-top. Heights are in
 * millimetres; the last compartment absorbs the remainder, so `stack`
 * entries only need explicit heights where the split matters.
 */
export const DkbbCompartment = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('door'),
    heightMm: z.number().int().min(100).max(2600).optional(),
    doorType: z.enum(['single-left', 'single-right', 'double']).optional(),
  }),
  z.object({
    type: z.literal('drawer'),
    heightMm: z.number().int().min(100).max(2600).optional(),
    drawerCount: z.number().int().min(1).max(6).optional(),
  }),
  z.object({
    type: z.literal('shelf'),
    heightMm: z.number().int().min(100).max(2600).optional(),
    shelfCount: z.number().int().min(0).max(8).optional(),
  }),
])

/**
 * dkbb:cabinet — a V24 catalog cabinet. One kind for the whole library:
 * archetype + profile are data, dimensions live in millimeters (the DKBB
 * unit of record) converted to metres only when rendering, and `stack`
 * describes the front division (doors / drawers / shelves).
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
  stack: z.array(DkbbCompartment).max(8).default([]),
})

export type DkbbCabinetNode = z.infer<typeof DkbbCabinetNode>
export type DkbbCompartment = z.infer<typeof DkbbCompartment>
