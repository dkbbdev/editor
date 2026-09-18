import type { ParametricDescriptor } from '@pascal-app/core'
import { ARCHETYPES } from './generated/archetypes'
import { PROFILES } from './generated/profiles'
import type { DkbbCabinetNode } from './node'

const ARCHETYPE_IDS = ARCHETYPES.map((a) => a.id)
const ARCHETYPES_BY_ID = new Map(ARCHETYPES.map((a) => [a.id, a]))

/**
 * Inspector descriptor for dkbb:cabinet. Mirrors the shelf pattern: the
 * auto-derived <ParametricInspector> renders one section per group.
 * Archetype list is generated (176 entries) so it stays an enum; profile
 * list is hand-curated (12 board profiles). Dimension fields stay in the
 * node's millimetric units — the inspector slider shows the raw value with
 * a mm suffix, matching the DKBB shop-drawing convention.
 */
export const dkbbCabinetParametrics: ParametricDescriptor<DkbbCabinetNode> = {
  groups: [
    {
      label: 'V24 Archetype',
      fields: [
        {
          key: 'archetypeId',
          kind: 'enum',
          options: ARCHETYPE_IDS,
        },
      ],
    },
    {
      label: 'Board Profile',
      fields: [
        {
          key: 'profileId',
          kind: 'enum',
          options: PROFILES.map((p) => p.id),
        },
      ],
    },
    {
      label: 'Dimensions (mm)',
      fields: [
        { key: 'widthMm', kind: 'number', unit: 'mm', min: 200, max: 2400, step: 5 },
        { key: 'depthMm', kind: 'number', unit: 'mm', min: 200, max: 800, step: 5 },
        { key: 'heightMm', kind: 'number', unit: 'mm', min: 400, max: 3000, step: 5 },
      ],
    },
    {
      label: 'Position',
      fields: [{ key: 'position', kind: 'vec3' }],
    },
    {
      label: 'Rotation',
      fields: [{ key: 'rotation', kind: 'vec3' }],
    },
  ],
  derive: (next, patch) => {
    // Archetype switch carries its default dimensions — same gesture the
    // placement panel performs, now available post-placement.
    if (patch.archetypeId !== undefined) {
      const a = ARCHETYPES_BY_ID.get(patch.archetypeId)
      if (a) {
        return {
          widthMm: a.params.width.default,
          depthMm: a.params.depth.default,
          heightMm: a.params.height.default,
        }
      }
    }
    return {}
  },
}
