import { useEffect, useState } from 'react'
import { Megaphone, X } from 'lucide-react'
import { readAd } from '@/pages/AdsPage'

export default function PublicMenuPage() {
  const [ad] = useState(() => readAd())
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!ad?.enabled) return
    setOpen(true)
    const timer = window.setTimeout(() => setOpen(false), 10000)
    return () => window.clearTimeout(timer)
  }, [ad])
  return <main className="min-h-screen bg-slate-50 p-5 text-slate-900">
    <header className="mx-auto flex max-w-3xl items-center justify-between rounded-2xl bg-white p-5 shadow">
      <div><p className="font-bold text-teal-700">eMenu</p><h1 className="text-2xl font-extrabold">Restaurant Menu</h1><p className="text-sm text-slate-500">QR menu preview</p></div>
      <a href="/ads" className="text-sm text-teal-700 underline">Ads Manager</a>
    </header>
    <section className="mx-auto mt-6 max-w-3xl rounded-2xl bg-white p-6 shadow"><h2 className="text-xl font-bold">Menu items</h2><p className="mt-2 text-slate-600">Preview route only. Real menu data integration is still needed.</p></section>
    {ad?.enabled && !open && <button aria-label="Show today's offer" onClick={() => setOpen(true)} className="fixed right-5 top-5 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-teal-700 text-white shadow-lg"><Megaphone /></button>}
    {ad?.enabled && open && <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4"><section role="dialog" aria-modal="true" className="relative max-h-[90vh] w-full max-w-md overflow-auto rounded-2xl bg-white shadow-2xl">
      <button aria-label="Close offer" onClick={() => setOpen(false)} className="absolute right-3 top-3 z-10 rounded-full bg-black/70 p-2 text-white"><X /></button>
      {ad.image && <img src={ad.image} alt={ad.title} className="h-56 w-full object-cover" />}
      <div className="p-6"><p className="font-bold uppercase text-orange-700">Today's offer</p><h2 className="mt-2 text-2xl font-extrabold">{ad.title}</h2><p className="mt-2 text-slate-600">{ad.description}</p><p className="mt-4 text-3xl font-extrabold text-teal-800">₹{ad.price}</p><p className="mt-3 text-xs text-slate-400">Automatically closes after 10 seconds.</p></div>
    </section></div>}
  </main>
}