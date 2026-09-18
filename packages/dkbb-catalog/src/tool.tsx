'use client'

import { emitter, useScene, type AnyNodeId, type LevelNode } from '@pascal-app/core'
import {
  getFloorStackPreviewPosition,
  isGridSnapActive,
  triggerSFX,
  useAlignmentGuides,
  useEditor,
} from '@pascal-app/editor'
import { useViewer } from '@pascal-app/viewer'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Group } from 'three'
import DkbbCabinetPreview from './preview'
import { dkbbDefaults } from './catalog'
import { DkbbCabinetNode } from './node'

/** Minimal re-implementation of the nodes-package floor-placement contract. */
type FloorPlacementClickTriggerEvent = { clientX?: number; clientY?: number; stopPropagation?: () => void }

function subscribeFloorPlacementClicks(cb: (e: FloorPlacementClickTriggerEvent) => void) {
  const wrapped = ((e: unknown) => cb(e as FloorPlacementClickTriggerEvent)) as never
  emitter.on('grid:click', wrapped)
  emitter.on('node:click', wrapped)
  return () => {
    emitter.off('grid:click', wrapped)
    emitter.off('node:click', wrapped)
  }
}

function stopPlacementCommitPropagation(_e: FloorPlacementClickTriggerEvent) {
  /* host listens on the same event; the host handler ignores events marked
     by the registry tool context, which the emitter path already covers. */
}

type GridMove = { position: [number, number, number] }

/**
 * Placement tool for dkbb-cabinet: ghost follows `grid:move`, commit on the
 * floor placement click. Defaults come from `toolDefaults['dkbb-cabinet']`
 * (set by the catalog panel) merged over the archetype defaults.
 */
const DkbbCabinetTool = () => {
  const activeLevelId = useViewer((state) => state.selection.levelId)
  const cursorRef = useRef<Group>(null)
  const lastCursorRef = useRef<GridMove['position'] | null>(null)
  const [cursorVisible, setCursorVisible] = useState(false)

  const previewNode = useMemo(() => {
    const toolDefaults = (useEditor.getState().toolDefaults?.['dkbb-cabinet'] ?? {}) as Record<string, unknown>
    const base = dkbbDefaults(
      (toolDefaults.archetypeId as string) ?? 'dkbb:0103-generalcab-tt',
      (toolDefaults.profileId as string) ?? 'dkbb-profile:DK_STD_E0_LM',
    )
    return DkbbCabinetNode.parse({
      object: 'node',
      parentId: activeLevelId,
      visible: true,
      metadata: {},
      children: [],
      archetypeId: base.archetypeId,
      profileId: base.profileId,
      widthMm: (toolDefaults.widthMm as number) ?? base.widthMm,
      depthMm: (toolDefaults.depthMm as number) ?? base.depthMm,
      heightMm: (toolDefaults.heightMm as number) ?? base.heightMm,
      stack: (toolDefaults.stack as DkbbCabinetNode['stack']) ?? base.stack,
    })
  }, [activeLevelId])

  useEffect(() => {
    const onGridMove = ({ position }: GridMove) => {
      lastCursorRef.current = position
      setCursorVisible(true)
      const visualPosition = getFloorStackPreviewPosition({
        node: previewNode as never,
        position,
        rotation: previewNode.rotation,
        levelId: activeLevelId,
      })
      cursorRef.current?.position.set(...visualPosition)
    }

    const commitAtCursor = (event: FloorPlacementClickTriggerEvent) => {
      const position = lastCursorRef.current ?? ([0, 0, 0] as GridMove['position'])
      const toolDefaults = (useEditor.getState().toolDefaults?.['dkbb-cabinet'] ?? {}) as Record<string, unknown>
      const node = DkbbCabinetNode.parse({
        ...previewNode,
        ...toolDefaults,
        name: 'DKBB cabinet',
        position,
        rotation: [0, 0, 0],
        parentId: activeLevelId,
      })
      useScene.getState().createNode(node as never, activeLevelId ?? undefined)
      useViewer.getState().setSelection({ selectedIds: [node.id] })
      triggerSFX('sfx:item-place')
      useAlignmentGuides.getState().clear()
      lastCursorRef.current = null
      setCursorVisible(false)
      useEditor.getState().setTool(null)
      stopPlacementCommitPropagation(event)
    }

    emitter.on('grid:move', onGridMove as never)
    const unsubscribePlacementClicks = subscribeFloorPlacementClicks(commitAtCursor)
    return () => {
      emitter.off('grid:move', onGridMove as never)
      unsubscribePlacementClicks()
      useAlignmentGuides.getState().clear()
    }
  }, [previewNode, activeLevelId])

  if (!cursorVisible) return null
  return (
    <group ref={cursorRef}>
      <DkbbCabinetPreview node={previewNode} />
    </group>
  )
}

export default DkbbCabinetTool
