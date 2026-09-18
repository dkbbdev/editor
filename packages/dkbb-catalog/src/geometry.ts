import { BoxGeometry, Group, Mesh, type MeshStandardMaterial } from 'three'
import type { DkbbCabinetNode } from './node'
import { profileById } from './profiles-resolver'
import { resolveStackHeightsMm } from './stack'

const MM_TO_M = 0.001

/**
 * Pure geometry builder for dkbb-cabinet: carcass box + stack-driven front
 * (doors / drawer banks / shelf recesses) + plinth, sized from the node's
 * millimetric fields and the profile's board thickness. Slot materials
 * come from the host paint system via userData.slotId tags.
 */
export function buildDkbbCabinetGeometry(node: DkbbCabinetNode, _ctx?: unknown): Group {
  const group = new Group()
  group.name = 'dkbb-cabinet-geometry'

  const profile = profileById(node.profileId)
  const t = (profile?.board.thicknessMm ?? 18) * MM_TO_M
  const w = node.widthMm * MM_TO_M
  const d = node.depthMm * MM_TO_M
  const h = node.heightMm * MM_TO_M

  const plinthH = 0.1
  const carcassH = h - plinthH

  // Carcass: two side panels, top, bottom — open at the front and back.
  const side = new BoxGeometry(t, carcassH - 2 * t, d)
  for (const x of [-w / 2 + t / 2, w / 2 - t / 2]) {
    const mesh = new Mesh(side, undefined as unknown as MeshStandardMaterial)
    mesh.position.set(x, plinthH + carcassH / 2, 0)
    mesh.userData.slotId = 'carcass'
    group.add(mesh)
  }
  const span = new BoxGeometry(w - 2 * t, t, d)
  for (const y of [plinthH + t / 2, plinthH + carcassH - t / 2]) {
    const mesh = new Mesh(span, undefined as unknown as MeshStandardMaterial)
    mesh.position.set(0, y, 0)
    mesh.userData.slotId = 'carcass'
    group.add(mesh)
  }

  // Back panel (thin).
  const back = new Mesh(
    new BoxGeometry(w - 2 * t, carcassH - 2 * t, 0.003),
    undefined as unknown as MeshStandardMaterial,
  )
  back.position.set(0, plinthH + carcassH / 2, -d / 2 + 0.0015)
  back.userData.slotId = 'carcass'
  group.add(back)

  // Stack-driven front: one division per compartment, stacked bottom-to-top
  // above the plinth. The 3 mm shop-standard gap runs between divisions.
  const heights = resolveStackHeightsMm(node)
  const gap = 0.003
  let yMm = 100 // plinth
  const stack = node.stack ?? []
  for (let i = 0; i < stack.length; i++) {
    const c = stack[i]!
    const hMm = heights[i] ?? 0
    const y0 = yMm + gap * 500
    const hPanel = hMm - gap * 1000
    if (hPanel <= 0) continue
    addFrontDivision(group, c, w, d, y0, hPanel, t)
    yMm += hMm
  }

  // Plinth recessed 50 mm behind the front face.
  if (h > plinthH + 0.2) {
    const plinth = new Mesh(
      new BoxGeometry(w, plinthH, d - 0.05),
      undefined as unknown as MeshStandardMaterial,
    )
    plinth.position.set(0, plinthH / 2, 0.025)
    plinth.userData.slotId = 'plinth'
    group.add(plinth)
  }

  return group
}

function addFrontDivision(
  group: Group,
  c: DkbbCabinetNode['stack'][number],
  w: number,
  d: number,
  y0Mm: number,
  hMm: number,
  t: number,
) {
  const y = y0Mm * MM_TO_M
  const hPanel = hMm * MM_TO_M
  const frontZ = d / 2 - 0.009
  if (c.type === 'door') {
    const cols = c.doorType === 'double' ? 2 : 1
    const panelW = (w - (cols + 1) * 0.003) / cols
    for (let col = 0; col < cols; col++) {
      const x = -w / 2 + 0.003 + panelW / 2 + col * (panelW + 0.003)
      const mesh = new Mesh(
        new BoxGeometry(panelW, hPanel, 0.018),
        undefined as unknown as MeshStandardMaterial,
      )
      mesh.position.set(x, y + hPanel / 2, frontZ)
      mesh.userData.slotId = 'front'
      group.add(mesh)
    }
  } else if (c.type === 'drawer') {
    const count = c.drawerCount ?? 1
    const rowH = (hPanel - (count - 1) * 0.003) / count
    for (let row = 0; row < count; row++) {
      const mesh = new Mesh(
        new BoxGeometry(w - 2 * 0.003, rowH, 0.018),
        undefined as unknown as MeshStandardMaterial,
      )
      mesh.position.set(0, y + row * (rowH + 0.003) + rowH / 2, frontZ)
      mesh.userData.slotId = 'front'
      group.add(mesh)
    }
  } else if (c.type === 'shelf') {
    // Shelves are interior boards; render recessed horizontal boards.
    const count = c.shelfCount ?? 2
    for (let s = 1; s <= count; s++) {
      const mesh = new Mesh(
        new BoxGeometry(w - 2 * t, t, d - 2 * t),
        undefined as unknown as MeshStandardMaterial,
      )
      mesh.position.set(0, y + (hPanel * s) / (count + 1), 0)
      mesh.userData.slotId = 'carcass'
      group.add(mesh)
    }
  }
}
