import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';

export interface WalletEntry {
  id: string;
  coinId: string;
  coinName: string;
  symbol: string;
  quantity: number;
  buyDate: string;
  buyPrice: number;
  sellDate?: string;
  sellPrice?: number;
}

interface WalletContextType {
  wallet: WalletEntry[];
  addEntry: (entry: Omit<WalletEntry, 'id'>) => void;
  editEntry: (id: string, entry: Partial<WalletEntry>) => void;
  removeEntry: (id: string) => void;
  loading: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Load wallet from Firestore on login
  useEffect(() => {
    if (!user) {
      setWallet([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const fetchWallet = async () => {
      try {
        const ref = doc(db, 'wallets', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setWallet(snap.data().wallet || []);
        } else {
          setWallet([]);
        }
      } catch (err) {
        console.error('Failed to load wallet from Firestore:', err);
        setWallet([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, [user]);

  // Save wallet to Firestore on change
  useEffect(() => {
    if (!user) return;
    if (loading) return;
    const saveWallet = async () => {
      const ref = doc(db, 'wallets', user.uid);
      await setDoc(ref, { wallet }, { merge: true });
    };
    saveWallet();
  }, [wallet, user, loading]);

  const addEntry = (entry: Omit<WalletEntry, 'id'>) => {
    setWallet(prev => [
      { ...entry, id: Date.now().toString() },
      ...prev,
    ]);
  };

  const editEntry = (id: string, entry: Partial<WalletEntry>) => {
    setWallet(prev => prev.map(e => (e.id === id ? { ...e, ...entry } : e)));
  };

  const removeEntry = (id: string) => {
    setWallet(prev => prev.filter(e => e.id !== id));
  };

  return (
    <WalletContext.Provider value={{ wallet, addEntry, editEntry, removeEntry, loading }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}; 