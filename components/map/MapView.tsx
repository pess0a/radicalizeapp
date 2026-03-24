'use client'

import { Map } from '@vis.gl/react-google-maps'
import { useMapStore } from '@/store/mapStore'
import { useMapSync } from '@/hooks/useMapSync'
import { ActivityMarker } from './ActivityMarker'

// Brazil center
const DEFAULT_CENTER = { lat: -14.235, lng: -51.925 }
const DEFAULT_ZOOM = 5

function MapContent() {
  useMapSync()
  const pins = useMapStore((s) => s.pins)

  return (
    <>
      {pins.map((pin) => (
        <ActivityMarker key={pin.id} pin={pin} />
      ))}
    </>
  )
}

export function MapView() {
  return (
    <Map
      mapId="radicalize-map"
      defaultCenter={DEFAULT_CENTER}
      defaultZoom={DEFAULT_ZOOM}
      gestureHandling="greedy"
      disableDefaultUI={false}
      className="w-full h-full"
      style={{ width: '100%', height: '100%' }}
    >
      <MapContent />
    </Map>
  )
}
