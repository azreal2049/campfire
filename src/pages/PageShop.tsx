import { useState } from 'react'
import { Check, Coins, Sparkles, Store } from 'lucide-react'
import { useCampfireStore } from '../store/useCampfireStore'
import type { ShopItemKind } from '../bridge/rustBridge'

const categories: Array<{ id: ShopItemKind | 'all'; label: string }> = [
  { id: 'all', label: 'Everything' },
  { id: 'theme', label: 'Glass themes' },
  { id: 'soundscape', label: 'Soundscapes' },
  { id: 'agent', label: 'Agent presets' },
]

export function PageShop() {
  const [category, setCategory] = useState<ShopItemKind | 'all'>('all')
  const sparkBalance = useCampfireStore((state) => state.sparkBalance)
  const shopItems = useCampfireStore((state) => state.shopItems)
  const activeGlassTheme = useCampfireStore((state) => state.activeGlassTheme)
  const activeSoundscapePack = useCampfireStore((state) => state.activeSoundscapePack)
  const activeAgentPreset = useCampfireStore((state) => state.activeAgentPreset)
  const purchaseShopItem = useCampfireStore((state) => state.purchaseShopItem)
  const equipShopItem = useCampfireStore((state) => state.equipShopItem)

  const visibleItems = shopItems.filter((item) => category === 'all' || item.kind === category)
  const activeForKind = (kind: ShopItemKind) => {
    if (kind === 'theme') return activeGlassTheme
    if (kind === 'soundscape') return activeSoundscapePack
    return activeAgentPreset
  }

  return (
    <div className="min-h-[calc(100vh-48px)] bg-[#080808] px-6 py-10 text-[#F4F4F6] sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-end justify-between gap-5 border-b border-white/[0.08] pb-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
              <Store className="h-4 w-4" /> Campfire Shop
            </div>
            <h1 className="mt-2 text-2xl font-semibold">Equip your workspace</h1>
            <p className="mt-1 text-[13px] text-zinc-500">Unlock themes, soundscape packs, and focused agent presets with Ember Sparks.</p>
          </div>
          <div className="flex items-center gap-2 border border-amber-400/20 bg-amber-400/[0.06] px-4 py-2 text-[13px] text-amber-200">
            <Coins className="h-4 w-4" /> {sparkBalance} Ember Sparks
          </div>
        </header>

        <nav aria-label="Shop categories" className="my-6 flex flex-wrap gap-2">
          {categories.map((item) => (
            <button key={item.id} type="button" onClick={() => setCategory(item.id)} className={`border px-3 py-1.5 text-[12px] transition-colors ${category === item.id ? 'border-white/30 bg-white/[0.1] text-white' : 'border-white/[0.08] text-zinc-500 hover:text-zinc-200'}`}>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((item) => {
            const equipped = item.owned && activeForKind(item.kind) === item.id
            return (
              <article key={item.id} className="flex min-h-52 flex-col border border-white/[0.09] bg-[#0C0C0C] p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-9 w-9 place-items-center border border-white/[0.08] bg-white/[0.03]">
                    <Sparkles className="h-4 w-4 text-zinc-300" />
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-600">{item.kind}</span>
                </div>
                <h2 className="mt-4 text-[14px] font-medium">{item.name}</h2>
                <p className="mt-1.5 flex-1 text-[12px] leading-relaxed text-zinc-500">{item.description}</p>
                {item.owned ? (
                  <button type="button" onClick={() => equipShopItem(item.id)} disabled={equipped} className="mt-5 flex items-center justify-center gap-2 border border-white/[0.12] px-3 py-2 text-[12px] text-white transition-colors hover:bg-white/[0.06] disabled:cursor-default disabled:text-zinc-500">
                    {equipped ? <><Check className="h-3.5 w-3.5" /> Equipped</> : 'Apply'}
                  </button>
                ) : (
                  <button type="button" onClick={() => purchaseShopItem(item.id)} className="mt-5 flex items-center justify-center gap-2 border border-white/20 bg-white px-3 py-2 text-[12px] font-medium text-black transition-colors hover:bg-zinc-200">
                    <Coins className="h-3.5 w-3.5" /> Unlock · {item.price} Sparks
                  </button>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
