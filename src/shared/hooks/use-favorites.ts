'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'gs_favorite_gymnasts'

/**
 * Favorites hook based on gymnast NAME (not inscription ID).
 * This way, a gymnast stays favorited across all competitions forever.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    // Migrate old inscription-based favorites are ignored
    // New system uses gymnast names
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setFavorites(JSON.parse(stored))
      } catch (e) {
        setFavorites([])
      }
    }
  }, [])

  const toggleFavorite = (gymnastName: string) => {
    setFavorites(prev => {
      const normalized = gymnastName.trim()
      const next = prev.includes(normalized)
        ? prev.filter(name => name !== normalized)
        : [...prev, normalized]
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const isFavorite = (gymnastName: string) => favorites.includes(gymnastName.trim())

  return { favorites, toggleFavorite, isFavorite }
}
