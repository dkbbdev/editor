import { describe, expect, test } from 'bun:test'
import { Box3 } from 'three'
import { DkbbCabinetNode } from './node'
import { buildDkbbCabinetGeometry } from './geometry'
import { resolveStackHeightsMm, usableFrontHeightMm, defaultStackFor } from './stack'

describe('dkbb-cabinet geometry', () => {
  test('builds a TT-sized group with slot-tagged meshes', () => {
    const node = DkbbCabinetNode.parse({
      archetypeId: 'dkbb:0103-generalcab-tt',
      profileId: 'dkbb-profile:DK_STD_E0_LM',
      widthMm: 600,
      depthMm: 576,
      heightMm: 1500,
      stack: [
        { type: 'drawer', heightMm: 150, drawerCount: 1 },
        { type: 'door', doorType: 'double' },
      ],
    })
    const group = buildDkbbCabinetGeometry(node)
    expect(group.name).toBe('dkbb-cabinet-geometry')
    const slots = group.children.map((c) => c.userData.slotId)
    // 2 sides + 2 spans + back + shelves(0) + 2 doors + 1 drawer + plinth
    expect(slots.filter((s) => s === 'carcass').length).toBe(5)
    expect(slots.filter((s) => s === 'front').length).toBe(3)
    expect(slots.includes('plinth')).toBe(true)
    group.updateMatrixWorld(true)
    const box = new Box3().setFromObject(group)
    const h = box.max.y - box.min.y
    expect(h).toBeGreaterThan(1.4)
    expect(h).toBeLessThan(1.7)
  })

  test('side panels use the profile board thickness and hug the width', () => {
    const node = DkbbCabinetNode.parse({
      archetypeId: 'dkbb:0103-generalcab-tt',
      profileId: 'dkbb-profile:DK_STD_E0_LM',
      widthMm: 600,
      depthMm: 576,
      heightMm: 720,
    })
    const group = buildDkbbCabinetGeometry(node)
    const sides = group.children.filter(
      (c) => c.userData.slotId === 'carcass',
    ) as unknown as { geometry: { type: string; parameters: { width: number } }; position: { x: number } }[]
    expect(sides.length).toBeGreaterThan(0)
    // The thinnest carcass box must be the 18 mm side panel (0.018 m).
    const widths = sides.map((c) => c.geometry.parameters.width)
    expect(Math.min(...widths)).toBeCloseTo(0.018, 3)
    // Side panels are pushed to the cabinet edges.
    const xs = sides.map((c) => Math.abs(c.position.x))
    expect(Math.max(...xs)).toBeCloseTo(0.3 - 0.009, 3)
  })

  test('drawer count drives one front mesh per drawer', () => {
    const one = DkbbCabinetNode.parse({
      archetypeId: 'dkbb:0103-generalcab-tt',
      profileId: 'dkbb-profile:DK_STD_E0_LM',
      widthMm: 600,
      depthMm: 576,
      heightMm: 900,
      stack: [{ type: 'drawer', drawerCount: 1 }],
    })
    const three = DkbbCabinetNode.parse({
      archetypeId: 'dkbb:0103-generalcab-tt',
      profileId: 'dkbb-profile:DK_STD_E0_LM',
      widthMm: 600,
      depthMm: 576,
      heightMm: 900,
      stack: [{ type: 'drawer', drawerCount: 3 }],
    })
    const g1 = buildDkbbCabinetGeometry(one)
    const g3 = buildDkbbCabinetGeometry(three)
    const fronts1 = g1.children.filter((c) => c.userData.slotId === 'front')
    const fronts3 = g3.children.filter((c) => c.userData.slotId === 'front')
    expect(fronts1.length).toBe(1)
    expect(fronts3.length).toBe(3)
  })
})

describe('stack resolution', () => {
  test('flexible entries share the remainder; explicit heights win', () => {
    const node = DkbbCabinetNode.parse({
      archetypeId: 'dkbb:0103-generalcab-tt',
      profileId: 'dkbb-profile:DK_STD_E0_LM',
      widthMm: 600,
      depthMm: 576,
      heightMm: 2120,
      stack: [
        { type: 'drawer', heightMm: 150, drawerCount: 1 },
        { type: 'door', doorType: 'double' },
      ],
    })
    const total = usableFrontHeightMm(node)
    expect(total).toBe(2120 - 100 - 36)
    const heights = resolveStackHeightsMm(node)
    expect(heights[0]).toBe(150)
    expect(heights.reduce((s, h) => s + h, 0)).toBe(total)
    expect(heights[1]).toBe(total - 150)
  })

  test('default stacks per run tier', () => {
    const tall = defaultStackFor('kitchencab', 'tall')
    expect(tall[0]!.type).toBe('drawer')
    expect(tall[1]!.type).toBe('door')
    const wall = defaultStackFor('kitchencab', 'wall')
    expect(wall).toHaveLength(1)
    expect(wall[0]!.type).toBe('door')
    const base = defaultStackFor('kitchencab', 'base')
    expect(base[0]!.type).toBe('drawer')
  })
})
