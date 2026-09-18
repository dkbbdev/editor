'use client'

import { useViewer } from '@pascal-app/viewer'
import { useEffect, useMemo } from 'react'
import type { Material } from 'three'
import { buildDkbbCabinetGeometry } from './geometry'
import type { DkbbCabinetNode } from './node'

/**
 * Translucent ghost of a dkbb cabinet during placement. Mirrors the shelf
 * preview contract: clone materials for translucency (never mutate shared
 * caches), disable raycast so the cursor ray passes through to the grid.
 */
const DkbbCabinetPreview = ({ node }: { node: DkbbCabinetNode }) => {
  const built = useMemo(() => buildDkbbCabinetGeometry(node), [node])

  useEffect(() => {
    const cloned: Material[] = []
    built.traverse((obj) => {
      obj.raycast = () => {}
      const mesh = obj as unknown as { material?: Material }
      if (!mesh.material) return
      const clone = mesh.material.clone()
      clone.transparent = true
      clone.opacity = 0.45
      mesh.material = clone
      cloned.push(clone)
    })
    return () => cloned.forEach((m) => m.dispose())
  }, [built])

  return <primitive object={built} />
}

export default DkbbCabinetPreview
