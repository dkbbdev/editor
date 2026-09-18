import type React from 'react'
import type { AnyNodeDefinition, Plugin } from '@pascal-app/core'
import { DkbbCabinetNode } from './node'
import { buildDkbbCabinetGeometry } from './geometry'
import { dkbbCabinetParametrics } from './parametrics'
import { defaultStackFor } from './stack'
import { ARCHETYPES } from './generated/archetypes'
import { PROFILES } from './generated/profiles'

/**
 * dkbb:cabinet — one kind for the whole V24 catalog. Archetype + profile are
 * generated data, dimensions live in millimeters, and the geometry builder
 * reads the profile's board thickness (the parametric gap PYTHA couldn't fill).
 */
const dkbbCabinetDefinition = {
  tool: () => import('./tool'),
  preview: () => import('./preview'),
  toolHints: [
    { key: 'Left click', label: 'Place cabinet' },
    { key: 'Esc', label: 'Cancel' },
  ],
  kind: 'dkbb-cabinet',
  schemaVersion: 1,
  schema: DkbbCabinetNode,
  geometry: buildDkbbCabinetGeometry,
  parametrics: dkbbCabinetParametrics,
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
    const p = PROFILES.find((pp) => pp.id === 'dkbb-profile:DK_STD_E0_LM')!
    return {
      object: 'node' as const,
      parentId: null,
      visible: true,
      metadata: {},
      children: [],
      archetypeId: a.id,
      profileId: p.id,
      widthMm: a.params.width.default,
      depthMm: a.params.depth.default,
      heightMm: a.params.height.default,
      stack: defaultStackFor(a.category, a.runTier),
    }
  },
}

export const dkbbCatalogPlugin: Plugin = {
  id: 'dkbb:cabinet-catalog',
  apiVersion: 1,
  nodes: [dkbbCabinetDefinition as unknown as AnyNodeDefinition],
}

export { DkbbCabinetNode } from './node'
export { ARCHETYPES, ARCHETYPE_IDS, CATEGORIES } from './generated/archetypes'
export { PROFILES, PROFILE_IDS } from './generated/profiles'

type DkbbHostPanel = {
  id: string
  label: string
  icon: { kind: 'iconify'; name: string }
  component: () => Promise<{ default: React.ComponentType }>
  pluginId: string
  description: string
  creator: { name: string; url?: string }
  pluginUrl: string
  defaultInstalled: boolean
}

export const dkbbCatalogHostPanel: DkbbHostPanel = {
  id: 'dkbb:cabinet-catalog:panel',
  label: 'DKBB',
  icon: { kind: 'iconify', name: 'lucide:archive' },
  component: () => import('./panel'),
  pluginId: 'dkbb:cabinet-catalog',
  description: 'V24 cabinet catalog — archetypes with swappable board profiles.',
  creator: { name: 'DKBB', url: 'https://design.dekorproduct.com' },
  pluginUrl: 'https://dkbbhq.synology.me:60080/podcharatee/V24-Library',
  defaultInstalled: true,
}
