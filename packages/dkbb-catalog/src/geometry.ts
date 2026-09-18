import { BoxGeometry, Group, Mesh, type MeshStandardMaterial } from 'three'
import type { DkbbCabinetNode } from './node'
import { profileById } from './profiles-resolver'

const MM_TO_M = 0.001

/**
 * Pure geometry builder for dkbb-cabinet: carcass box + front slab + plinth,
 * sized from the node's millimetric fields and the profile's board thickness.
 * Slot materials come from the host paint system via userData.slotId tags.
 */
export function buildDkbbCabinetGeometry(node: DkbbCabinetNode, _ctx?: unknown): Group {
  const group = new Group()
  group.name = 'dkbb-cabinet-geometry'

  const profile = profileById(node.profileId)
  const t = (profile?.board.thicknessMm ?? 18) * MM_TO_M
  const w = node.widthMm * MM_TO_M
  const d = node.depthMm * MM_TO_M
  const h = node.heightMm * MM_TO_M

  // Carcass: two side panels, top, bottom — open at the front and back.
  const side = new BoxGeometry(t, h - 2 * t, d)
  for (const x of [-w / 2 + t / 2, w / 2 - t / 2]) {
    const mesh = new Mesh(side, undefined as unknown as MeshStandardMaterial)
    mesh.position.set(x, h / 2, 0)
    mesh.userData.slotId = 'carcass'
    group.add(mesh)
  }
  const span = new BoxGeometry(w - 2 * t, t, d)
  for (const y of [t / 2, h - t / 2]) {
    const mesh = new Mesh(span, undefined as unknown as MeshStandardMaterial)
    mesh.position.set(0, y, 0)
    mesh.userData.slotId = 'carcass'
    group.add(mesh)
  }

  // Back panel (thin).
  const back = new Mesh(
    new BoxGeometry(w - 2 * t, h - 2 * t, 0.003),
    undefined as unknown as MeshStandardMaterial,
  )
  back.position.set(0, h / 2, -d / 2 + 0.0015)
  back.userData.slotId = 'carcass'
  group.add(back)

  // Front slab with the shop-standard 3 mm gap, overlaying the carcass face.
  const gap = 0.003
  const front = new Mesh(
    new BoxGeometry(w - 2 * gap, h - 2 * gap, 0.018),
    undefined as unknown as MeshStandardMaterial,
  )
  front.position.set(0, h / 2, d / 2 - 0.009)
  front.userData.slotId = 'front'
  group.add(front)

  // Plinth recessed 50 mm behind the front face.
  const plinthH = 0.1
  if (h > plinthH + 0.2) {
    const plinth = new Mesh(
      new BoxGeometry(w, plinthH, d - 0.05),
      undefined as unknown as MeshStandardMaterial,
    )
    plinth.position.set(0, plinthH / 2, 0.025)
    plinth.userData.slotId = 'plinth'
    group.add(plinth)
    // Recess the carcass onto the plinth: shift panels up.
    for (const child of group.children) {
      if (child.userData.slotId === 'carcass' || child.userData.slotId === 'front') {
        child.position.y += plinthH
      }
    }
  }

  return group
}
