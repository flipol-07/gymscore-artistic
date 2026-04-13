'use client'

import { useState, useEffect } from 'react'

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('gs_favorites')
    if (stored) {
      try {
        setFavorites(JSON.parse(stored))
      } catch (e) {
        setFavorites([])
      }
    }
  }, [])

  const toggleFavorite = (gymnastId: string) => {
    setFavorites(prev => {
      const next = prev.includes(gymnastId)
        ? prev.filter(id => id !== gymnastId)
        : [...prev, gymnastId]
      
      localStorage.setItem('gs_favorites', JSON.stringify(next))
      return next
    })
  }

  const isFavorite = (gymnastId: string) => favorites.includes(gymnastId)

  return { favorites, toggleFavorite, isFavorite }
}
