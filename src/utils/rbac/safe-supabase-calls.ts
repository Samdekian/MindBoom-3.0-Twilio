
import { supabase } from '@/integrations/supabase/client';

/**
 * Safe wrapper for Supabase RPC calls with error handling
 */
export async function safeRpcCall<T = any>(
  functionName: string,
  params?: Record<string, any>
): Promise<{ data: T | null; error: any }> {
  try {
    const { data, error } = await supabase.rpc(functionName, params);
    
    if (error) {
      console.error(`RPC call ${functionName} failed:`, error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (exception) {
    console.error(`RPC call ${functionName} exception:`, exception);
    return { 
      data: null, 
      error: { 
        message: exception instanceof Error ? exception.message : 'RPC call failed',
        code: 'EXCEPTION'
      }
    };
  }
}

/**
 * Safe wrapper for Supabase table fetch operations
 */
export async function safeTableFetch<T = any>(
  tableName: string,
  query: any
): Promise<{ data: T[] | null; error: any }> {
  try {
    const { data, error } = await query;
    
    if (error) {
      console.error(`Table fetch ${tableName} failed:`, error);
      return { data: null, error };
    }
    
    return { data: data || [], error: null };
  } catch (exception) {
    console.error(`Table fetch ${tableName} exception:`, exception);
    return { 
      data: null, 
      error: { 
        message: exception instanceof Error ? exception.message : 'Table fetch failed',
        code: 'EXCEPTION'
      }
    };
  }
}

/**
 * Safe wrapper for Supabase single record fetch
 */
export async function safeSingleFetch<T = any>(
  tableName: string,
  query: any
): Promise<{ data: T | null; error: any }> {
  try {
    const { data, error } = await query;
    
    if (error) {
      console.error(`Single fetch ${tableName} failed:`, error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (exception) {
    console.error(`Single fetch ${tableName} exception:`, exception);
    return { 
      data: null, 
      error: { 
        message: exception instanceof Error ? exception.message : 'Single fetch failed',
        code: 'EXCEPTION'
      }
    };
  }
}

/**
 * Safe wrapper for Supabase insert operations
 */
export async function safeInsert<T = any>(
  tableName: string,
  data: any,
  query: any
): Promise<{ data: T | null; error: any }> {
  try {
    const { data: result, error } = await query;
    
    if (error) {
      console.error(`Insert ${tableName} failed:`, error);
      return { data: null, error };
    }
    
    return { data: result, error: null };
  } catch (exception) {
    console.error(`Insert ${tableName} exception:`, exception);
    return { 
      data: null, 
      error: { 
        message: exception instanceof Error ? exception.message : 'Insert failed',
        code: 'EXCEPTION'
      }
    };
  }
}

/**
 * Safe wrapper for Supabase update operations
 */
export async function safeUpdate<T = any>(
  tableName: string,
  updateData: any,
  query: any
): Promise<{ data: T | null; error: any }> {
  try {
    const { data: result, error } = await query;
    
    if (error) {
      console.error(`Update ${tableName} failed:`, error);
      return { data: null, error };
    }
    
    return { data: result, error: null };
  } catch (exception) {
    console.error(`Update ${tableName} exception:`, exception);
    return { 
      data: null, 
      error: { 
        message: exception instanceof Error ? exception.message : 'Update failed',
        code: 'EXCEPTION'
      }
    };
  }
}

/**
 * Safe wrapper for Supabase delete operations
 */
export async function safeDelete<T = any>(
  tableName: string,
  query: any
): Promise<{ data: T | null; error: any }> {
  try {
    const { data: result, error } = await query;
    
    if (error) {
      console.error(`Delete ${tableName} failed:`, error);
      return { data: null, error };
    }
    
    return { data: result, error: null };
  } catch (exception) {
    console.error(`Delete ${tableName} exception:`, exception);
    return { 
      data: null, 
      error: { 
        message: exception instanceof Error ? exception.message : 'Delete failed',
        code: 'EXCEPTION'
      }
    };
  }
}
