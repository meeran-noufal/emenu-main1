import { useState, type ChangeEvent, type FormEvent } from 'react'
import { ImagePlus, Trash2, QrCode, Link2, Store } from 'lucide-react'

export type Ad = { title:string; description:string; price:string; image:string; enabled:boolean; reviewUrl:string; reviewQrImage:string; reviewMode:'link'|'qr'; restaurantName:string }
const KEY='emenu-today-ad-v1'
const empty:Ad={title:'Today Special',description:'',price:'',image:'',enabled:true,reviewUrl:'',reviewQrImage:'',reviewMode:'link',restaurantName:''}
export function readAd():Ad|null { try { const v=localStorage.getItem(KEY); return v?{...empty,...JSON.parse(v)}:null } catch { return null } }

export default function AdsPage(){
 const [ad,setAd]=useState<Ad>(()=>({...empty,...(readAd()??{})}))
 const [message,setMessage]=useState('')
 const update=(k:keyof Ad,v:string|boolean)=>{setAd(a=>({...a,[k]:v}));setMessage('')}
 function readImage(e:ChangeEvent<HTMLInputElement>,key:'image'|'reviewQrImage'){const f=e.target.files?.[0];if(!f)return;if(!f.type.startsWith('image/')){setMessage('Please choose an image file.');return}if(f.size>2*1024*1024){setMessage('Image must be under 2 MB.');return}const reader=new FileReader();reader.onload=()=>update(key,String(reader.result));reader.readAsDataURL(f)}
 async function scanReviewQr(e:ChangeEvent<HTMLInputElement>){
  const file=e.target.files?.[0]; if(!file)return
  if(file.size>5*1024*1024){setMessage('QR image must be under 5 MB.');return}
  if(!file.type.startsWith('image/')){setMessage('Please choose a QR image file.');return}
  const reader=new FileReader()
  reader.onload=async()=>{
   const imageData=String(reader.result)
   setAd(a=>({...a,reviewQrImage:imageData,reviewMode:'qr'}))
   try{
    const bitmap=await createImageBitmap(file)
    const Detector=(window as unknown as {BarcodeDetector?:new (o:{formats:string[]})=>{detect:(source:ImageBitmap)=>Promise<Array<{rawValue:string}>>}}).BarcodeDetector
    if(!Detector){setMessage('QR image uploaded and will appear in the customer ad. Paste the Google Review link too if you want the Write a Google Review button to open directly.');return}
    const detector=new Detector({formats:['qr_code']})
    const codes=await detector.detect(bitmap)
    if(!codes.length){setMessage('QR image uploaded. No link could be read from it; customers can scan the displayed QR with their phone.');return}
    const value=codes[0].rawValue
    if(/^https?:\\/\\//i.test(value)){
     setAd(a=>({...a,reviewUrl:value,reviewQrImage:imageData,reviewMode:'qr'}))
     setMessage('Google Review QR uploaded and link detected successfully.')
    }else setMessage('QR image uploaded, but it does not contain a web link.')
   }catch{setMessage('QR image uploaded. Customers can scan the displayed QR with their phone. Add the review URL manually for the button.')}
  }
  reader.readAsDataURL(file)
 }
 function save(e:FormEvent){e.preventDefault();try{localStorage.setItem(KEY,JSON.stringify(ad));setMessage('Ad saved in this browser. Customer preview: /customer-ad/demo')}catch{setMessage('Storage full. Choose a smaller image.')}}
 const isReview=ad.title==='Google Review'
 return <main className="min-h-screen bg-slate-100 p-4 text-slate-900 sm:p-6 lg:p-8"><div className="mx-auto max-w-6xl">
  <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold uppercase tracking-widest text-teal-700">eMenu</p><h1 className="text-2xl font-extrabold sm:text-3xl">Ads Manager</h1><p className="mt-1 text-sm text-slate-600 sm:text-base">Create customer-facing offers and Google Review ads.</p></div><a className="w-fit rounded-xl border bg-white px-4 py-3 font-semibold" href="/customer-ad/demo">Customer ad preview ↗</a></header>
  <div className="grid gap-5 lg:grid-cols-2">
   <form onSubmit={save} className="min-w-0 space-y-4 rounded-2xl bg-white p-4 shadow-sm sm:p-6">
    <label className="block font-semibold">Ad type<select className="mt-2 w-full rounded-xl border p-3" value={ad.title} onChange={e=>update('title',e.target.value)}><option>Today Special</option><option>Today Combo Offer</option><option>Google Review</option></select></label>
    {isReview&&<><label className="block font-semibold"><Store className="mr-2 inline" size={18}/>Cafe / Restaurant name<input className="mt-2 w-full rounded-xl border p-3" value={ad.restaurantName} onChange={e=>update('restaurantName',e.target.value)} placeholder="e.g. Aifa Cafe"/></label>
     <div className="rounded-xl border p-3 sm:p-4"><p className="font-bold">Google Review destination</p><div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={()=>update('reviewMode','link')} className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-semibold ${ad.reviewMode==='link'?'border-teal-700 bg-teal-50 text-teal-800':''}`}><Link2 size={17}/> Paste link</button><button type="button" onClick={()=>update('reviewMode','qr')} className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-semibold ${ad.reviewMode==='qr'?'border-teal-700 bg-teal-50 text-teal-800':''}`}><QrCode size={17}/> Scan QR image</button></div>
      {ad.reviewMode==='link'?<label className="mt-3 block text-sm font-semibold">Google Review URL<input required type="url" className="mt-2 w-full rounded-xl border p-3 font-normal" value={ad.reviewUrl} onChange={e=>update('reviewUrl',e.target.value)} placeholder="https://g.page/r/.../review"/></label>:<label className="mt-3 flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed p-5 text-center"><QrCode size={34}/><b className="mt-2">Upload Google Review QR image</b><span className="mt-1 text-xs text-slate-500">PNG/JPG, max 5 MB. QR link will be scanned.</span><input required={!ad.reviewUrl} className="mt-3 max-w-full text-sm" type="file" accept="image/*" onChange={scanReviewQr}/></label>}
      {ad.reviewUrl&&<p className="mt-3 break-all rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">Scanned / saved link: {ad.reviewUrl}</p>}
     </div></>}
    {!isReview&&<label className="block font-semibold">Description<textarea required rows={3} className="mt-2 w-full rounded-xl border p-3" value={ad.description} onChange={e=>update('description',e.target.value)} placeholder="Chicken burger + fries + drink"/></label>}
    {!isReview&&<label className="block font-semibold">Offer price (₹)<input required type="number" min="0" className="mt-2 w-full rounded-xl border p-3" value={ad.price} onChange={e=>update('price',e.target.value)} placeholder="199"/></label>}
    {!isReview&&<label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed p-5 text-center"><ImagePlus size={32}/><b className="mt-2">Upload ad image</b><span className="text-sm text-slate-500">PNG/JPG/WebP, max 2 MB</span><input className="mt-3 max-w-full text-sm" type="file" accept="image/*" onChange={e=>readImage(e,'image')}/></label>}
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ad.enabled} onChange={e=>update('enabled',e.target.checked)}/> Enable this advertisement</label>
    <div className="flex flex-wrap gap-3"><button className="rounded-xl bg-teal-700 px-5 py-3 font-bold text-white">Save ad</button><button type="button" className="flex items-center gap-2 rounded-xl border px-4 py-3" onClick={()=>{localStorage.removeItem(KEY);setAd(empty);setMessage('Ad removed.')}}><Trash2 size={17}/>Remove</button></div>
    {message&&<p role="status" className="break-words rounded-lg bg-teal-50 p-3 text-sm text-teal-900">{message}</p>}
    <p className="text-xs leading-5 text-amber-800">Prototype: saved in this browser only. Cross-device QR customer ads require server/database integration. QR image scanning works in browsers that support BarcodeDetector (for example, current Chrome).</p>
   </form>
   <section className="h-fit min-w-0 overflow-hidden rounded-2xl bg-white shadow-sm"><h2 className="p-5 text-lg font-bold">Customer ad preview</h2>{isReview&&ad.reviewQrImage&&ad.reviewMode==='qr'?<img src={ad.reviewQrImage} alt="Google Review QR preview" className="mx-auto max-h-80 w-auto object-contain"/>:ad.image?<img src={ad.image} alt="Ad preview" className="max-h-80 w-full object-cover"/>:<div className="flex h-56 items-center justify-center bg-teal-50 text-teal-800"><ImagePlus size={44}/></div>}<div className="p-5 sm:p-6"><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800">{isReview?'GOOGLE REVIEW':'TODAY’S OFFER'}</span><h3 className="mt-3 break-words text-2xl font-extrabold">{isReview?(ad.restaurantName||'Your Restaurant'):ad.title}</h3>{isReview?<><p className="mt-2 text-slate-600">Thank you for visiting {ad.restaurantName||'our restaurant'}! Scan the QR code or tap below to share your experience.</p><a href={ad.reviewUrl||'#'} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-xl bg-teal-700 px-5 py-3 font-bold text-white">Write a Google Review ↗</a></>:<><p className="mt-2 whitespace-pre-wrap break-words text-slate-600">{ad.description||'Ad description'}</p><p className="mt-4 text-3xl font-extrabold text-teal-800">₹{ad.price||'—'}</p></>}</div></section>
  </div>
 </div></main>
}
