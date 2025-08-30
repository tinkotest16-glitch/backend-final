
import { DatabaseStorage } from './db-storage';
import { SupabaseStorage } from './supabase-storage';

// Use memory storage for reliable operation - trading pairs are hardcoded
export const storage = new DatabaseStorage();

// Export both storage classes for flexibility  
export { DatabaseStorage, SupabaseStorage };
