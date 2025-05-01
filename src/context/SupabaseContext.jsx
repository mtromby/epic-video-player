import { createContext, useContext, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const SupabaseContext = createContext()

export const SupabaseProvider = ({ children }) => {
  useEffect(() => {
    console.log('SupabaseProvider mounted');
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('Supabase Anon Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
  }, []);

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
} 