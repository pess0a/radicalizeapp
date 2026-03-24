'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ActivityGalleryProps {
  images: { url: string; alt: string | null }[]
  name: string
}

export function ActivityGallery({ images, name }: ActivityGalleryProps) {
  const [current, setCurrent] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-[16/9] bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 text-6xl">
        🏄
      </div>
    )
  }

  return (
    <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100 group">
      <Image
        src={images[current].url}
        alt={images[current].alt ?? name}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 66vw"
        priority
      />

      {images.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setCurrent((c) => (c + 1) % images.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow"
          >
            <ChevronRight size={18} />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === current ? 'bg-white w-4' : 'bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
