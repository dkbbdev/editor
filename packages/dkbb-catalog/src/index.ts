import type { Plugin } from '@pascal-app/core'
import { DkbbCabinetNode } from './node'
import { ARCHETYPES } from './generated/archetypes'
import { PROFILES } from './generated/profiles'

/**
 * The DKBB cabinet catalog plugin. v1 ships one node kind whose defaults are
 * seeded from the generated V24 registry; geometry reuses the host's box
 * builder via the placement path (next milestone: custom builder with board
 * thickness from the profile).
 */
export const dkbbCatalogPlugin: Plugin = {
  id: 'dkbb:cabinet-catalog',
  apiVersion: 1,
  nodes: [
    {
      kind: 'dkbb-cabinet',
      schemaVersion: 1,
      schema: DkbbCabinetNode,
      category: 'furnish',
      capabilities: {
        movable: { axes: ['x', 'z'], gridSnap: true },
        rotatable: {
          axes: ['y'],
          snapAngles: [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2],
        },
        deletable: true,
        duplicable: true,
        groupable: true,
      },
      defaults: () => {
        const a = ARCHETYPES[0]!
        const p = PROFILES.find(
          (pp) => pp.id === 'dkbb-profile:DK_STD_E0_LM',
        )!
        return {
          object: 'node' as const,
          parentId: null,
          visible: true,
          metadata: {},
          children: [],
          archetypeId: a.id,
          profileId: (p ?? PROFILES[0]).id,
          widthMm: a.params.width.default,
          depthMm: a.params.depth.default,
          heightMm: a.params.height.default,
        }
      },
    },
  ],
}

export { DkbbCabinetNode } from './node'
export { ARCHETYPES, ARCHETYPE_IDS, CATEGORIES } from './generated/archetypes'
export { PROFILES, PROFILE_IDS } from './generated/profiles'
