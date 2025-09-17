'use client'
import { useState } from 'react'
let showToastFn: (msg:string)=>void
export function ToastContainer(){
  const [msg,setMsg]=useState('')
  if(!showToastFn) showToastFn = setMsg
  return msg ? (
    <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded shadow">{msg}</div>
  ) : null
}
export function showToast(msg:string){
  if(showToastFn) showToastFn(msg)
  setTimeout(()=> showToastFn && showToastFn(''), 2000)
}
