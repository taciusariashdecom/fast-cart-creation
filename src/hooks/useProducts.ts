import { useState, useEffect } from 'react';
import { ProcessedProduct } from '../types';
import { fetchProducts } from '../lib/products';
import { logger } from '../lib/logger';

const STORAGE_KEY = 'blindQuotation_products';

export function useProducts() {
  const [products, setProducts] = useState<ProcessedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Try to get products from session storage first
        const cached = sessionStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsedCache = JSON.parse(cached);
          if (Array.isArray(parsedCache)) {
            logger.info('🗄️ Produtos carregados do cache');
            setProducts(parsedCache);
            setIsLoading(false);
            return;
          }
        }

        // If not in cache or invalid cache, fetch from Supabase
        const fetchedProducts = await fetchProducts();
        
        // Ensure we have an array before saving to cache
        if (Array.isArray(fetchedProducts)) {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fetchedProducts));
          setProducts(fetchedProducts);
          logger.info('💾 Produtos salvos no cache');
        } else {
          logger.warn('Produtos retornados não são um array válido');
          setProducts([]);
        }

      } catch (error) {
        logger.error('Erro ao carregar produtos:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  return { products, isLoading };
}