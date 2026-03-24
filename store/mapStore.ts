'use client'

import { create } from 'zustand'
import type { PinData } from '@/types'

interface MapStore {
  pins: PinData[]
  setPins: (pins: PinData[]) => void
  hoveredActivityId: string | null
  setHovered: (id: string | null) => void
  selectedActivityId: string | null
  setSelected: (id: string | null) => void
  bounds: {
    swLat: number
    swLng: number
    neLat: number
    neLng: number
  } | null
  setBounds: (bounds: MapStore['bounds']) => void
}

export const useMapStore = create<MapStore>((set) => ({
  pins: [],
  setPins: (pins) => set({ pins }),
  hoveredActivityId: null,
  setHovered: (id) => set({ hoveredActivityId: id }),
  selectedActivityId: null,
  setSelected: (id) => set({ selectedActivityId: id }),
  bounds: null,
  setBounds: (bounds) => set({ bounds }),
}))
