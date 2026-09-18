'use client'

import { useScene, type AnyNodeId } from '@pascal-app/core'
import { ActionButton, PanelSection, PanelWrapper, SegmentedControl } from '@pascal-app/editor'
import { useViewer } from '@pascal-app/viewer'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { useCallback } from 'react'
import type { DkbbCabinetNode, DkbbCompartment } from './node'
import { resolveStackHeightsMm, usableFrontHeightMm } from './stack'

const COMPARTMENT_TYPES = ['door', 'drawer', 'shelf'] as const

/**
 * Stack editor for dkbb:cabinet — the minimal modular-cabinet gesture:
 * list the front divisions bottom-to-top, swap each division's type,
 * reorder, remove, and add. Heights auto-resolve (explicit heights win,
 * flexible entries share the remainder).
 */
export default function DkbbStackPanel() {
  const selectedId = useViewer((s) => s.selection.selectedIds[0])
  const node = useScene((s) =>
    selectedId
      ? (s.nodes[selectedId as AnyNodeId] as unknown as DkbbCabinetNode | undefined)
      : undefined,
  )
  if (!node || (node as { type?: string }).type !== 'dkbb-cabinet') return null

  const stack = node.stack ?? []
  const heights = resolveStackHeightsMm(node)

  const update = useCallback(
    (next: DkbbCompartment[]) => {
      const scene = useScene.getState()
      const id = selectedId as AnyNodeId
      scene.updateNode(id, { stack: next } as never)
    },
    [selectedId],
  )

  const setEntry = (index: number, patch: Partial<DkbbCompartment>) => {
    const next = stack.map((c, i) => (i === index ? ({ ...c, ...patch } as DkbbCompartment) : c))
    update(next)
  }

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta
    if (target < 0 || target >= stack.length) return
    const next = [...stack]
    const [entry] = next.splice(index, 1)
    next.splice(target, 0, entry!)
    update(next)
  }

  const remove = (index: number) => {
    update(stack.filter((_, i) => i !== index))
  }

  const add = (type: DkbbCompartment['type']) => {
    const base: DkbbCompartment =
      type === 'door'
        ? { type: 'door', doorType: 'single-left' }
        : type === 'drawer'
          ? { type: 'drawer', drawerCount: 1 }
          : { type: 'shelf', shelfCount: 2 }
    // New entries are flexible (no explicit height): they share the remainder.
    update([...stack, base])
  }

  const total = usableFrontHeightMm(node)

  return (
    <PanelWrapper title="Front stack">
      <PanelSection title="Front stack">
        <div className="flex flex-col gap-2">
          {stack.length === 0 ? (
            <p className="text-muted-foreground text-xs">
              No divisions — the front is one plain slab. Add one below.
            </p>
          ) : (
            stack.map((c, i) => (
              <div key={i} className="border-border bg-card rounded-md border p-2">
                <div className="flex items-center justify-between gap-2">
                  <SegmentedControl
                    value={c.type}
                    options={COMPARTMENT_TYPES.map((t) => ({ value: t, label: t }))}
                    onChange={(v) => setEntry(i, typeSwap(c, v as DkbbCompartment['type']))}
                  />
                  <span className="text-muted-foreground font-mono text-xs">
                    {Math.round(heights[i] ?? 0)} mm
                  </span>
                  <div className="flex items-center gap-1">
                    <ActionButton icon={<ArrowUp size={13} />} label="Move up" onClick={() => move(i, -1)} />
                    <ActionButton icon={<ArrowDown size={13} />} label="Move down" onClick={() => move(i, 1)} />
                    <ActionButton icon={<Trash2 size={13} />} label="Remove" onClick={() => remove(i)} />
                  </div>
                </div>
                {c.type === 'door' && (
                  <SegmentedControl
                    className="mt-2"
                    value={c.doorType ?? 'single-left'}
                    options={[
                      { value: 'single-left', label: 'L' },
                      { value: 'single-right', label: 'R' },
                      { value: 'double', label: '2×' },
                    ]}
                    onChange={(v) => setEntry(i, { doorType: v as 'single-left' | 'single-right' | 'double' })}
                  />
                )}
                {c.type === 'drawer' && (
                  <SegmentedControl
                    className="mt-2"
                    value={String(c.drawerCount ?? 1)}
                    options={[1, 2, 3, 4].map((n) => ({ value: String(n), label: String(n) }))}
                    onChange={(v) => setEntry(i, { drawerCount: Number(v) })}
                  />
                )}
                {c.type === 'shelf' && (
                  <SegmentedControl
                    className="mt-2"
                    value={String(c.shelfCount ?? 2)}
                    options={[0, 1, 2, 3, 4].map((n) => ({ value: String(n), label: String(n) }))}
                    onChange={(v) => setEntry(i, { shelfCount: Number(v) })}
                  />
                )}
              </div>
            ))
          )}
          <div className="flex items-center gap-1">
            <ActionButton icon={<Plus size={13} />} label="Add door" onClick={() => add('door')} />
            <ActionButton icon={<Plus size={13} />} label="Add drawer" onClick={() => add('drawer')} />
            <ActionButton icon={<Plus size={13} />} label="Add shelf" onClick={() => add('shelf')} />
          </div>
          <p className="text-muted-foreground font-mono text-[10px]">
            usable front {total} mm · {stack.length} division{stack.length === 1 ? '' : 's'}
          </p>
        </div>
      </PanelSection>
    </PanelWrapper>
  )
}

/** Swap a compartment's type, carrying over nothing but the height. */
function typeSwap(c: DkbbCompartment, type: DkbbCompartment['type']): DkbbCompartment {
  const heightMm = c.heightMm
  if (type === 'door') return { type: 'door', heightMm, doorType: 'single-left' }
  if (type === 'drawer') return { type: 'drawer', heightMm, drawerCount: 1 }
  return { type: 'shelf', heightMm, shelfCount: 2 }
}
