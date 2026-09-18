import type { DkbbCabinetNode, DkbbCompartment } from './node'

/**
 * Millimetric heights for each stack entry. Explicit `heightMm` wins;
 * entries without one share the remainder equally (rounded to whole mm,
 * last entry absorbs the rounding debt).
 */
export function resolveStackHeightsMm(node: DkbbCabinetNode): number[] {
  const total = usableFrontHeightMm(node)
  const stack = node.stack ?? []
  if (stack.length === 0) return []
  const explicit = stack.filter((c) => c.heightMm != null)
  const explicitSum = explicit.reduce((s, c) => s + (c.heightMm ?? 0), 0)
  const flexible = stack.length - explicit.length
  if (flexible <= 0) {
    // All explicit: last entry absorbs any drift.
    const heights = stack.map((c) => c.heightMm ?? 0)
    const drift = total - heights.reduce((s, h) => s + h, 0)
    heights[heights.length - 1] = (heights[heights.length - 1] ?? 0) + drift
    return heights
  }
  const share = Math.floor((total - explicitSum) / flexible)
  let debt = total - explicitSum - share * flexible
  return stack.map((c) => {
    if (c.heightMm != null) return c.heightMm
    const h = share + (debt > 0 ? 1 : 0)
    if (debt > 0) debt -= 1
    return h
  })
}

/**
 * Front height available to the stack: cabinet height minus plinth and
 * board top/bottom panels.
 */
export function usableFrontHeightMm(node: DkbbCabinetNode): number {
  const plinth = 100
  const t = 18
  return Math.max(0, node.heightMm - plinth - 2 * t)
}

/**
 * Default stack for an archetype category + run tier. Kitchen-culture
 * defaults: tall units get doors, base units get drawer+door, wall units
 * get a single door.
 */
export function defaultStackFor(archetypeCategory: string, runTier: string): DkbbCompartment[] {
  if (runTier === 'tall') {
    return [
      { type: 'drawer', heightMm: 150, drawerCount: 1 },
      { type: 'door', doorType: 'double' },
    ]
  }
  if (runTier === 'wall') {
    return [{ type: 'door' }]
  }
  // base tier (and everything else below tall)
  if (archetypeCategory === 'kitchencab') {
    return [
      { type: 'drawer', heightMm: 150, drawerCount: 1 },
      { type: 'door', doorType: 'double' },
    ]
  }
  return [{ type: 'door' }]
}
