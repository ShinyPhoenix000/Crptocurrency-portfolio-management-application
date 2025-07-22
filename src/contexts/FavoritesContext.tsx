import React, { createContext, useContext, useEffect, useState } from 'react';

interface FavoritesContextType {
  favorites: Set<string>;
  addFavorite: (coinId: string) => void;
  removeFavorite: (coinId: string) => void;
  isFavorite: (coinId: string) => boolean;
  toggleFavorite: (coinId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('fintrack-favorites');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
      return new Set();
    }
  });

  // Persist to localStorage whenever favorites change
  useEffect(() => {
    try {
      localStorage.setItem('fintrack-favorites', JSON.stringify(Array.from(favorites)));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }, [favorites]);

  const addFavorite = (coinId: string) => {
    setFavorites(prev => new Set([...prev, coinId]));
  };

  const removeFavorite = (coinId: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      newSet.delete(coinId);
      return newSet;
    });
  };

  const isFavorite = (coinId: string) => {
    return favorites.has(coinId);
  };

  const toggleFavorite = (coinId: string) => {
    if (isFavorite(coinId)) {
      removeFavorite(coinId);
    } else {
      addFavorite(coinId);
    }
  };

  return (
    <FavoritesContext.Provider value={{ 
      favorites, 
      addFavorite, 
      removeFavorite, 
      isFavorite, 
      toggleFavorite 
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};