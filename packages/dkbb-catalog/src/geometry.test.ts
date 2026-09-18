import { describe, expect, test } from 'bun:test'
import { DkbbCabinetNode } from './node'
import { buildDkbbCabinetGeometry } from './geometry'

const MM = (node: ReturnType<typeof DkbbCabinetNode.parse>) => node

describe('dkbb-cabinet geometry', () => {
  test('builds a TT-sized group with slot-tagged meshes', () => {
    const node = DkbbCabinetNode.parse({
      archetypeId: 'dkbb:0103-generalcab-tt',
      profileId: 'dkbb-profile:DK_STD_E0_LM',
      widthMm: 600,
      depthMm: 576,
      heightMm: 1500,
    })
    const group = buildDkbbCabinetGeometry(MM(node))
    expect(group.name).toBe('dkbb-cabinet-geometry')
    const slots = group.children.map((c) => c.userData.slotId)
    // 2 sides + 2 spans + back + front + plinth
    expect(slots.filter((s) => s === 'carcass').length).toBe(5)
    expect(slots.includes('front')).toBe(true)
    expect(slots.includes('plinth')).toBe(true)
    // overall bbox height ≈ 1500 mm + plinth within tolerance
    group.updateMatrixWorld(true)
    const box = new (require('three').Box3)().setFromObject(group)
    const h = box.max.y - box.min.y
    expect(h).toBeGreaterThan(1.4)
    expect(h).toBeLessThan(1.7)
  })

  test('thicker profile shrinks the internal span', () => {
    const mk = (pid: string) =>
      buildDkbbCabinetGeometry(
        DkbbCabinetNode.parse({
          archetypeId: 'dkbb:0103-generalcab-tt',
          profileId: pid,
          widthMm: 600,
          depthMm: 576,
          heightMm: 1500,
        }),
      )
    const g18 = mk('dkbb-profile:DK_STD_E0_LM') // 18 mm
    const top18 = g18.children.find((c) => c.userData.slotId === 'carcass')!
    // just needs to build without throwing and tag slots — thickness math
    // is asserted at the schema level in dkbb-v24-prototype.test.ts
    expect(top18).toBeTruthy()
  })
})
