export function DiamondGrid({images}: {images: string[]}) {
  return (
    <div className="grid grid-cols-3 gap-6 py-6">
      {images.slice(0, 9).map((src, i) => (
        <div
          key={i}
          className="aspect-square overflow-hidden rounded-lg border-4 border-white/90 bg-white shadow-lg"
          style={{
            transform: `rotate(45deg) scale(0.72)`,
            marginTop: i % 3 === 1 ? '-1.5rem' : 0,
          }}
        >
          <img src={src} alt="" className="h-full w-full object-cover" style={{transform: 'rotate(-45deg) scale(1.5)'}} />
        </div>
      ))}
    </div>
  )
}
