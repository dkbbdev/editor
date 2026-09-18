'use client'

import { useMemo, useState } from 'react'
import { useEditor } from '@pascal-app/editor'
import { ARCHETYPES, CATEGORIES } from './generated/archetypes'
import { PROFILES } from './generated/profiles'
import { dkbbDefaults } from './catalog'

/**
 * DKBB Catalog host panel: pick a V24 archetype + board profile, then arm the
 * dkbb-cabinet placement tool. Sizes shown in millimeters, the DKBB unit.
 */
export default function DkbbCatalogPanel() {
  const [category, setCategory] = useState<string>(CATEGORIES[0] ?? 'kitchencab')
  const [profileId, setProfileId] = useState('dkbb-profile:DK_STD_E0_LM')
  const [query, setQuery] = useState('')

  const profile = PROFILES.find((p) => p.id === profileId) ?? PROFILES[0]!
  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ARCHETYPES.filter(
      (a) =>
        a.category === category &&
        (q === '' || a.label.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)),
    )
  }, [category, query])

  const place = (archetypeId: string) => {
    const d = dkbbDefaults(archetypeId, profileId)
    const editor = useEditor.getState()
    editor.setToolDefaults('dkbb-cabinet', {
      archetypeId,
      profileId,
      widthMm: d.widthMm,
      depthMm: d.depthMm,
      heightMm: d.heightMm,
    })
    editor.setTool('dkbb-cabinet')
    editor.setMode('build')
  }

  return (
    <div className="flex h-full flex-col gap-3 p-3 text-sm">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">Board profile</label>
        <select
          className="rounded border bg-background px-2 py-1.5"
          value={profileId}
          onChange={(e) => setProfileId(e.target.value)}
        >
          {PROFILES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label} · {p.board.core} {p.board.thicknessMm}mm
            </option>
          ))}
        </select>
        <p className="text-[11px] text-muted-foreground">
          Front {profile.frontSystem} · board {profile.board.thicknessMm} mm
        </p>
      </div>

      <div className="flex flex-wrap gap-1">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded px-2 py-1 text-xs ${c === category ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          >
            {c}
          </button>
        ))}
      </div>

      <input
        className="rounded border bg-background px-2 py-1.5"
        placeholder="ค้นหา archetype (เช่น TT, U, Hood)…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-1">
          {list.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => place(a.id)}
              className="flex items-center justify-between rounded border px-2 py-1.5 text-left hover:bg-accent"
            >
              <span className="truncate">
                {a.label}
                <span className="ml-1 text-[10px] text-muted-foreground">{a.runTier}</span>
              </span>
              <span className="ml-2 shrink-0 text-[11px] text-muted-foreground">
                {a.params.width.default}×{a.params.depth.default}×{a.params.height.default}
              </span>
            </button>
          ))}
          {list.length === 0 ? <p className="p-2 text-xs text-muted-foreground">ไม่พบรายการ</p> : null}
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground">
        {list.length} archetypes · มม. · V24 registry
      </p>
    </div>
  )
}
