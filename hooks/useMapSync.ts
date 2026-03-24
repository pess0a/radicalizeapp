'use client'

import { useMap } from '@vis.gl/react-google-maps'
import { useEffect } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { useMapStore } from '@/store/mapStore'

export function useMapSync() {
  const map = useMap()
  const setPins = useMapStore((s) => s.setPins)
  const setBounds = useMapStore((s) => s.setBounds)

  const fetchPins = useDebouncedCallback(async () => {
    const bounds = map?.getBounds()
    if (!bounds) return

    const sw = bounds.getSouthWest()
    const ne = bounds.getNorthEast()

    const newBounds = {
      swLat: sw.lat(),
      swLng: sw.lng(),
      neLat: ne.lat(),
      neLng: ne.lng(),
    }

    setBounds(newBounds)

    const params = new URLSearchParams({
      swLat: String(newBounds.swLat),
      swLng: String(newBounds.swLng),
      neLat: String(newBounds.neLat),
      neLng: String(newBounds.neLng),
    })

    const res = await fetch(`/api/maps/activities?${params}`)
    if (!res.ok) return

    const pins = await res.json()
    setPins(pins)
  }, 400)

  useEffect(() => {
    if (!map) return
    const listener = map.addListener('bounds_changed', fetchPins)
    return () => {
      google.maps.event.removeListener(listener)
    }
  }, [map, fetchPins])
}
