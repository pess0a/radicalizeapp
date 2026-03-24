'use client'

import { AdvancedMarker, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps'
import { useState } from 'react'
import { useMapStore } from '@/store/mapStore'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { PinData } from '@/types'

interface ActivityMarkerProps {
  pin: PinData
}

export function ActivityMarker({ pin }: ActivityMarkerProps) {
  const [markerRef, marker] = useAdvancedMarkerRef()
  const [open, setOpen] = useState(false)
  const hoveredId = useMapStore((s) => s.hoveredActivityId)
  const setHovered = useMapStore((s) => s.setHovered)
  const isHovered = hoveredId === pin.id

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: pin.latitude, lng: pin.longitude }}
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHovered(pin.id)}
        onMouseLeave={() => setHovered(null)}
      >
        <div
          className={cn(
            'px-2 py-1 rounded-full text-xs font-bold shadow-md border-2 border-white transition-all',
            isHovered
              ? 'bg-blue-600 text-white scale-110'
              : 'bg-white text-gray-900'
          )}
        >
          R$ {pin.price.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
        </div>
      </AdvancedMarker>

      {open && marker && (
        <InfoWindow
          anchor={marker}
          onCloseClick={() => setOpen(false)}
          maxWidth={220}
        >
          <Link
            href={`/atividades/${pin.slug}`}
            className="block hover:opacity-90"
          >
            {pin.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pin.imageUrl}
                alt={pin.name}
                className="w-full h-28 object-cover rounded-md mb-2"
              />
            )}
            <p className="font-semibold text-sm text-gray-900">{pin.name}</p>
            <p className="text-blue-600 font-bold text-sm mt-1">
              R$ {pin.price.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </p>
          </Link>
        </InfoWindow>
      )}
    </>
  )
}
