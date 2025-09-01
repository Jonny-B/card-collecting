import React from 'react'

export default function Binder() {
  const pages = Array.from({ length: 40 }, (_, i) => i + 1)
  return (
    <div>
      <h2 className="h5">Binder Planner</h2>
      <div className="row row-cols-4 row-cols-md-5 g-2">
        {pages.map(p => (
          <div key={p} className="col">
            <div className="border rounded text-center py-3">Page {p}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
