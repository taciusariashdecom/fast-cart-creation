import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

export function useShopifyProducts(shouldFetch: boolean) {
  const [products, setProducts] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      if (!shouldFetch) return;

      try {
        setIsLoading(true);
        const { data, error: supabaseError } = await supabase
          .from('shopify_products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (supabaseError) throw supabaseError;
        setProducts(data);
      } catch (err) {
        logger.error('Error fetching Shopify products:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [shouldFetch]);

  return { products, isLoading, error };
}