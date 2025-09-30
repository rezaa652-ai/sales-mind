"use client";
import React from "react";

export function useToasts() {
  const [toasts, set] = React.useState<Array<{id:number; text:string; kind:'ok'|'err'}>>([]);
  const push = (text:string, kind:'ok'|'err'='ok')=>{
    const id = Date.now() + Math.random();
    set(t=>[...t,{id,text,kind}]);
    setTimeout(()=>set(t=>t.filter(x=>x.id!==id)), 3000);
  };
  return { toasts, push };
}

export default function ToasterLite({ toasts }:{ toasts: Array<{id:number; text:string; kind:'ok'|'err'}> }) {
  return (
    <div className="fixed top-2 right-2 space-y-2 z-50">
      {toasts.map(t=>(
        <div key={t.id} className={`px-3 py-2 rounded shadow text-sm ${t.kind==='ok'?'bg-green-600 text-white':'bg-red-600 text-white'}`}>
          {t.text}
        </div>
      ))}
    </div>
  );
}
