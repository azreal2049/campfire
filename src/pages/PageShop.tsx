import { ArrowLeft, ShoppingBag, Sparkles, Palette, Headphones, Zap, User } from 'lucide-react'
import { useCampfireStore } from '../store/useCampfireStore'

const products = [
  { id: 'theme-dark', name: 'Dark Canvas', category: 'Themes', price: 'Free', icon: Palette, description: 'Default obsidian liquid-glass theme' },
  { id: 'theme-amber', name: 'Amber Ember', category: 'Themes', price: '4.99', icon: Palette, description: 'Warm amber accents with soft glow' },
  { id: 'theme-neon', name: 'Neon Aurora', category: 'Themes', price: '7.99', icon: Palette, description: 'Vibrant aurora gradients & glow' },
  { id: 'sound-rain', name: 'Balanced Rain', category: 'Ambient Soundpacks', price: '2.99', icon: Headphones, description: 'Looping rain ambience' },
  { id: 'sound-brown', name: 'Brown Noise', category: 'Ambient Soundpacks', price: '2.99', icon: Headphones, description: 'Deep brown noise generator' },
  { id: 'sound-crackle', name: 'Campfire Crackle', category: 'Ambient Soundpacks', price: '1.99', icon: Headphones, description: 'Looping campfire crackle' },
  { id: 'ai-basic', name: 'AI Agent Basic', category: 'AI Templates', price: 'Free', icon: Zap, description: 'Local fallback AI prompts' },
  { id: 'ai-pro', name: 'AI Agent Pro', category: 'AI Templates', price: '9.99', icon: Sparkles, description: 'Advanced reasoning templates' },
  { id: 'badge-early', name: 'Early Adopter Badge', category: 'Profile Badges', price: 'Free', icon: User, description: 'Limited edition badge' },
  { id: 'badge-founder', name: 'Founder Badge', category: 'Profile Badges', price: '14.99', icon: User, description: 'Exclusive founder status' },
]

export function PageShop() {
  const setActivePage = useCampfireStore((state) => state.setActivePage)

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
              onClick={() => setActivePage('page-home')}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="text-2xl font-semibold tracking-tight">Campfire Shop</h1>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-zinc-400">
            <ShoppingBag className="h-3.5 w-3.5" />
            Cart (0)
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const Icon = product.icon
            return (
              <div
                key={product.id}
                className="group rounded-xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-white/20 hover:bg-white/[0.04]"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.02]">
                    <Icon className="h-5 w-5 text-zinc-400" />
                  </div>
                  <span className="text-xs font-medium text-zinc-500">{product.price === 'Free' ? 'Free' : `$${product.price}`}</span>
                </div>
                <h3 className="text-sm font-medium text-white">{product.name}</h3>
                <p className="mt-0.5 text-[10px] uppercase tracking-wider text-zinc-500">{product.category}</p>
                <p className="mt-2 text-xs leading-5 text-zinc-500">{product.description}</p>
                <button className="mt-4 w-full rounded-lg border border-white/10 bg-white/[0.02] py-2 text-xs font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white">
                  {product.price === 'Free' ? 'Get Free' : 'Buy Now'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}