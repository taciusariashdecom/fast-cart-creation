import { supabase } from './supabase';
import { logger } from './logger';

export interface ProductNode {
  title: string;
  id_products_all: string[];
  id_persiana_principal: string[];
  id_persiana_secundaria: string[] | null;
  alturaMaxima: { value: string };
  alturaMinima: { value: string };
  larguraMaxima: { value: string };
  larguraMinima: { value: string };
  movementControl: string | null;
  product_type: string;
}

export interface ProductNodesTable {
  nodes: ProductNode[];
  columns: string[];
}

export interface ProductOrderRow {
  title: string;
  id_products_all: string[];
  id_persiana_principal: string[];
  id_persiana_secundaria: string[] | null;
  alturaMaxima: { value: string };
  alturaMinima: { value: string };
  larguraMaxima: { value: string };
  larguraMinima: { value: string };
  movementControl: string | null;
  product_type: string;
  selectedWidth: number;
  selectedHeight: number;
  selectedCordSide: 'left' | 'right';
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ProductsOrderTable {
  rows: ProductOrderRow[];
  columns: string[];
}

export async function createProductNodesTable(): Promise<ProductNodesTable> {
  try {
    logger.startGroup('🔄 Criando tabela de nodes de produtos');

    // Buscar o registro mais recente
    const { data: shopifyData, error } = await supabase
      .from('shopify_products')
      .select('products')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      logger.error('Erro ao buscar dados do Supabase:', error);
      throw error;
    }

    if (!shopifyData?.products?.edges) {
      logger.warn('Estrutura de dados inválida ou vazia');
      return { nodes: [], columns: [] };
    }

    // Extrair os nodes
    const nodes: ProductNode[] = shopifyData.products.edges
      .map(edge => edge?.node)
      .filter((node): node is ProductNode => {
        if (!node) return false;

        const isValid = 
          typeof node === 'object' &&
          'title' in node &&
          'alturaMaxima' in node &&
          'alturaMinima' in node &&
          'larguraMaxima' in node &&
          'larguraMinima' in node;

        if (!isValid) {
          logger.warn('Node inválido encontrado:', node);
        }

        return isValid;
      });

    // Definir as colunas baseadas nas propriedades do primeiro node
    const columns = nodes.length > 0 ? Object.keys(nodes[0]) : [];

    logger.info(`✅ Tabela criada com ${nodes.length} nodes e ${columns.length} colunas`);
    logger.info('Colunas:', columns);

    return { nodes, columns };
  } catch (error) {
    logger.error('Erro ao criar tabela de nodes:', error);
    return { nodes: [], columns: [] };
  } finally {
    logger.endGroup();
  }
}

export function createProductsOrderTable(): ProductsOrderTable {
  return {
    rows: [],
    columns: [
      'title',
      'id_products_all',
      'id_persiana_principal',
      'id_persiana_secundaria',
      'alturaMaxima',
      'alturaMinima',
      'larguraMaxima',
      'larguraMinima',
      'movementControl',
      'product_type',
      'selectedWidth',
      'selectedHeight',
      'selectedCordSide',
      'quantity',
      'unitPrice',
      'subtotal'
    ]
  };
}

export function addProductToOrderTable(
  orderTable: ProductsOrderTable,
  node: ProductNode,
  width: number,
  height: number,
  cordSide: 'left' | 'right',
  quantity: number = 1
): ProductsOrderTable {
  const newRow: ProductOrderRow = {
    ...node,
    selectedWidth: width,
    selectedHeight: height,
    selectedCordSide: cordSide,
    quantity,
    unitPrice: 0, // Será atualizado posteriormente
    subtotal: 0 // Será atualizado posteriormente
  };

  return {
    ...orderTable,
    rows: [...orderTable.rows, newRow]
  };
}

export function updateProductInOrderTable(
  orderTable: ProductsOrderTable,
  index: number,
  updates: Partial<ProductOrderRow>
): ProductsOrderTable {
  const updatedRows = [...orderTable.rows];
  updatedRows[index] = { ...updatedRows[index], ...updates };

  return {
    ...orderTable,
    rows: updatedRows
  };
}

export function removeProductFromOrderTable(
  orderTable: ProductsOrderTable,
  index: number
): ProductsOrderTable {
  return {
    ...orderTable,
    rows: orderTable.rows.filter((_, i) => i !== index)
  };
}