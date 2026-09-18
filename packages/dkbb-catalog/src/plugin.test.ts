import { describe, expect, test } from 'bun:test'
import { dkbbCatalogPlugin } from './index'
import { DkbbCabinetNode } from './node'

describe('dkbb catalog plugin manifest', () => {
  test('manifest shape', () => {
    expect(dkbbCatalogPlugin.id).toBe('dkbb:cabinet-catalog')
    expect(dkbbCatalogPlugin.apiVersion).toBe(1)
    expect(dkbbCatalogPlugin.nodes?.length).toBe(1)
  })

  test('defaults parse through the node schema', () => {
    const def = dkbbCatalogPlugin.nodes![0]
    const raw = def.defaults()
    const node = DkbbCabinetNode.parse(raw)
    expect(node.type).toBe('dkbb-cabinet')
    expect(node.id.startsWith('dkbb-cabinet_')).toBe(true)
    expect(node.widthMm).toBeGreaterThan(0)
  })

  test('schema round-trips V24 TT dims', () => {
    const node = DkbbCabinetNode.parse({
      name: 'TT',
      archetypeId: 'dkbb:0103-generalcab-tt',
      profileId: 'dkbb-profile:DK_STD_E0_LM',
      widthMm: 600,
      depthMm: 576,
      heightMm: 1500,
    })
    expect([node.widthMm, node.depthMm, node.heightMm]).toEqual([600, 576, 1500])
  })
})
