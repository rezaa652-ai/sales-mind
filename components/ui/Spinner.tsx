import React from 'react'
export default function Spinner({ size = 16 }: { size?: number }) {
  const s = `${size}px`
  return <span className="inline-block rounded-full border-2 border-gray-300 border-b-transparent animate-spin" style={{ width: s, height: s }} />
}
