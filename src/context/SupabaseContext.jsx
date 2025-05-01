/**
 * Supabase context provider for managing Supabase client instance
 * Provides access to Supabase client throughout the application
 */
import { createContext, useContext } from 'react'
import { supabase } from '../lib/supabaseClient'

const SupabaseContext = createContext()

export const SupabaseProvider = ({ children }) => {
  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  )
}

/**
 * Custom hook to access Supabase client
 * @returns {Object} Supabase client instance
 * @throws {Error} If used outside of SupabaseProvider
 */
export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
} 