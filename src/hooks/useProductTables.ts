import { useState, useEffect } from 'react';
import { 
  ProductNodesTable, 
  ProductsOrderTable, 
  createProductNodesTable, 
  createProductsOrderTable 
} from '../lib/productTables';
import { logger } from '../lib/logger';

export function useProductTables() {
  const [nodesTable, setNodesTable] = useState<ProductNodesTable>({ nodes: [], columns: [] });
  const [orderTable, setOrderTable] = useState<ProductsOrderTable>(createProductsOrderTable());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadTables() {
      try {
        setIsLoading(true);
        const productNodesTable = await createProductNodesTable();
        setNodesTable(productNodesTable);
      } catch (err) {
        logger.error('Erro ao carregar tabelas:', err);
        setError(err instanceof Error ? err : new Error('Erro desconhecido'));
      } finally {
        setIsLoading(false);
      }
    }

    loadTables();
  }, []);

  return {
    nodesTable,
    orderTable,
    setOrderTable,
    isLoading,
    error
  };
}