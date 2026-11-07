import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Megaphone } from 'lucide-react'

export default function PublicMenuPage() {
  const navigate = useNavigate()
  const { slug = 'demo' } = useParams()
  useEffect(() => {
    const seenKey = `emenu-ad-seen-${slug}`
    if (sessionStorage.getItem(seenKey) !== 'yes') {
      sessionStorage.setItem(seenKey, 'yes')
      navigate(`/customer-ad/${slug}`, { replace: true })
    }
  }, [navigate, slug])
  return <main className="min-h-screen bg-slate-50 p-5 text-slate-900">
    <header className="mx-auto flex max-w-3xl items-center justify-between rounded-2xl bg-white p-5 shadow">
      <div><p className="font-bold text-teal-700">eMenu</p><h1 className="text-2xl font-extrabold">Restaurant Menu</h1><p className="text-sm text-slate-500">Customer menu preview</p></div>
    </header>
    <section className="mx-auto mt-6 max-w-3xl rounded-2xl bg-white p-6 shadow">
      <h2 className="text-xl font-bold">Menu items</h2>
      <p className="mt-2 text-slate-600">Customer menu preview. Connect this route to the restaurant's live menu data for production QR use.</p>
    </section>
    <button aria-label="View advertisements" onClick={() => navigate(`/customer-ad/${slug}`, { state: { reopen: true } })} className="fixed left-4 top-4 z-30 flex items-center gap-2 rounded-full bg-teal-700 px-4 py-3 text-sm font-bold text-white shadow-lg">
      <Megaphone size={18}/> Ads
    </button>
  </main>
}