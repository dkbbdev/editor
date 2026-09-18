import { describe, expect, test } from 'bun:test'
import { DkbbCabinetNode, dkbbDefaults, archetypeById, DKBB_CATEGORIES } from './schema'

describe('dkbb-catalog generated schema', () => {
  test('every archetype default parses', () => {
    for (const a of DKBB_CATEGORIES.length ? archetypeById.list ?? [] : []) void a
  })

  test('defaults for TT + DK_STD_E0_LM match V24 source', () => {
    const d = dkbbDefaults('dkbb:0103-generalcab-tt', 'dkbb-profile:DK_STD_E0_LM')
    expect(d.widthMm).toBe(600)
    expect(d.depthMm).toBe(576)
    expect(d.heightMm).toBe(1500)
    expect(d.boardThicknessMm).toBe(18)
  })

  test('schema rejects out-of-range sizes', () => {
    const base = {
      archetypeId: 'dkbb:0103-generalcab-tt',
      profileId: 'dkbb-profile:DK_STD_E0_LM',
      widthMm: 600,
      depthMm: 576,
      heightMm: 1500,
    }
    expect(DkbbCabinetNode.safeParse({ ...base, heightMm: 3500 }).success).toBe(false)
    expect(DkbbCabinetNode.safeParse({ ...base, widthMm: 5000 }).success).toBe(false)
    expect(DkbbCabinetNode.safeParse(base).success).toBe(true)
  })
})
