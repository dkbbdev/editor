// Prototype: place a V24 archetype (TT tall cabinet) through the real Pascal
// schema. Run: bun test dkbb-v24-prototype.test.ts (from packages/nodes or root).
import { describe, expect, test } from 'bun:test'
import { CabinetModuleNode } from '@pascal-app/core'

// From registry/archetypes.json — dkbb:0103-generalcab-tt (GeneralCab TT)
// V24 units mm -> schema units m (÷1000) at the placement boundary.
const TT_MM = { width: 600, depth: 576, height: 1500 }
const m = (mm: number) => mm / 1000

// From registry/board-profiles.json — DK_STD_E0_LM
const PROFILE = {
  boardMm: 18,
  frontGapMm: 3,
  materials: {
    carcass: 'dkbb:LM-IN',
    front: 'dkbb:LM-OUT',
    plinth: 'dkbb:Plint',
  },
}

describe('V24 archetype → CabinetModuleNode', () => {
  test('TT parses with V24 dimensions', () => {
    const mod = CabinetModuleNode.parse({
      name: 'TT · DK_STD_E0_LM · 600',
      cabinetType: 'tall',
      moduleKind: 'standard',
      width: m(TT_MM.width),
      depth: m(TT_MM.depth),
      carcassHeight: m(TT_MM.height),
      boardThickness: m(PROFILE.boardMm),
      frontGap: m(PROFILE.frontGapMm),
      slots: PROFILE.materials,
    })
    expect(mod.width).toBeCloseTo(0.6, 5)
    expect(mod.depth).toBeCloseTo(0.576, 5)
    expect(mod.carcassHeight).toBeCloseTo(1.5, 5)
    expect(mod.type).toBe('cabinet-module')
    expect(mod.slots?.carcass).toBe('dkbb:LM-IN')
    // typed id prefix from objectId('cabinet-module')
    expect(mod.id.startsWith('cabinet-module_')).toBe(true)
  })

  test('board thickness swap re-derives internal width (the PYTHA gap)', () => {
    const build = (boardMm: number) =>
      CabinetModuleNode.parse({
        name: 'TT parametric',
        cabinetType: 'tall',
        width: m(TT_MM.width),
        depth: m(TT_MM.depth),
        carcassHeight: m(TT_MM.height),
        boardThickness: m(boardMm),
      })
    const b18 = build(18)
    const b25 = build(25)
    // internal span shrinks as boards get thicker — 600 - 2*18 vs 600 - 2*25
    expect(b18.width - 2 * b18.boardThickness).toBeCloseTo(m(600 - 36), 5)
    expect(b25.width - 2 * b25.boardThickness).toBeCloseTo(m(600 - 50), 5)
    expect(b25.boardThickness).toBeGreaterThan(b18.boardThickness)
  })

  test('schema bounds accept every V24 cabinet bbox (regression)', () => {
    // V24 evidence: real cabinet archetypes span 700 mm (drawer base) to
    // 3000 mm (wardrobe/tall tower). 200 mm boxes are hardware, not cabinets.
    const extremes = [
      { w: 2400, d: 800, h: 3000 },
      { w: 300, d: 300, h: 700 },
    ]
    for (const e of extremes) {
      const mod = CabinetModuleNode.parse({
        cabinetType: 'tall',
        width: m(e.w),
        depth: m(e.d),
        carcassHeight: m(e.h),
      })
      expect(mod.width).toBeGreaterThan(0)
    }
  })
})
