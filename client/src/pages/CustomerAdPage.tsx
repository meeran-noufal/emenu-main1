import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Megaphone, Star, X } from 'lucide-react'
import { readAd } from '@/pages/AdsPage'

export default function CustomerAdPage() {
  const { slug = 'demo' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isReopen = Boolean((location.state as { reopen?: boolean } | null)?.reopen)
  const [ad] = useState(() => readAd())
  const [seconds, setSeconds] = useState(6)
  const hasActiveAd = Boolean(ad?.enabled)

  useEffect(() => {
    if (!hasActiveAd || isReopen) return
    const started = Date.now()
    const interval = window.setInterval(() => {
      const remaining = Math.max(0, 6 - Math.floor((Date.now() - started) / 1000))
      setSeconds(remaining)
      if (remaining === 0) navigate(`/menu/${slug}`, { replace: true })
    }, 200)
    return () => window.clearInterval(interval)
  }, [hasActiveAd, isReopen, navigate, slug])

  if (!hasActiveAd) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-5 text-white">
        <section className="w-full max-w-md rounded-3xl bg-white p-8 text-center text-slate-900 shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-700"><Megaphone size={30}/></div>
          <h1 className="mt-5 text-2xl font-extrabold">No active advertisement</h1>
          <p className="mt-2 text-slate-600">There is no offer available right now. You can continue to the restaurant menu.</p>
          <button onClick={() => navigate(`/menu/${slug}`)} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 font-bold text-white">Continue to menu <ArrowRight size={18}/></button>
          <button onClick={() => navigate(-1)} className="mt-3 block w-full rounded-xl border px-6 py-3 font-semibold">Go back</button>
        </section>
      </main>
    )
  }

  return <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-4 text-white">
    <button onClick={() => navigate(`/menu/${slug}`)} aria-label="Close advertisement and continue to menu" className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full bg-white/15 px-4 py-3 font-semibold backdrop-blur hover:bg-white/25">
      <X size={18}/> Close
    </button>
    <section className="w-full max-w-xl overflow-hidden rounded-3xl bg-white text-slate-900 shadow-2xl">
      {ad?.title === 'Google Review' && ad.reviewQrImage ? <div className="flex min-h-64 items-center justify-center bg-white p-6 sm:min-h-80"><img src={ad.reviewQrImage} alt="Google Review QR code - scan to leave a review" className="max-h-80 w-auto max-w-full object-contain"/></div> : ad?.image ? <img src={ad.image} alt={ad.title} className="h-64 w-full object-cover sm:h-80"/> : <div className="flex h-64 items-center justify-center bg-gradient-to-br from-teal-700 to-emerald-400 text-white sm:h-80"><Star size={64}/></div>}
      <div className="p-7 sm:p-9">
        <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-orange-600">{ad?.title === 'Google Review' ? 'We value your feedback' : 'Special promotion'}</p>
        <h1 className="mt-3 break-words text-3xl font-black sm:text-4xl">{ad?.title === 'Google Review' ? (ad.restaurantName || 'Google Review') : ad?.title}</h1>
        {ad?.title === 'Google Review' ? <p className="mt-3 break-words text-lg leading-relaxed text-slate-600">Enjoyed your visit to {ad.restaurantName || 'our restaurant'}? We’d love to hear from you! Scan the QR code below to share your experience on Google.</p> : <p className="mt-3 break-words text-lg leading-relaxed text-slate-600">{ad?.description}</p>}
        {ad?.title === 'Google Review'
          ? <div className="mt-6 flex flex-col items-center gap-4">{ad.reviewQrImage && <img src={ad.reviewQrImage} alt="Scan to review this restaurant on Google" className="max-h-64 w-auto rounded-xl border border-slate-200 object-contain"/>}{ad.reviewUrl && <a href={ad.reviewUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 font-bold text-white">Write a Google Review <ArrowRight size={18}/></a>}</div>
          : <p className="mt-6 text-4xl font-black text-teal-800">₹{ad?.price}</p>}
        <div className="mt-7 flex items-center justify-between gap-3 border-t pt-5">
          {!isReopen && <span className="text-sm text-slate-500">Menu opens in {seconds}s</span>}
          <button onClick={() => navigate(`/menu/${slug}`)} className="rounded-xl bg-slate-900 px-5 py-3 font-bold text-white">Continue to menu <ArrowRight className="ml-1 inline" size={17}/></button>
        </div>
      </div>
    </section>
  </main>
}
