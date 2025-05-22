import { supabase } from './supabase';
import { logger } from './logger';
import { 
  ProcessedProduct, 
  ShopifyProduct, 
  WebhookResponse, 
  ProcessedVariant, 
  BlindQuotationItem,
  ShopifyVariant
} from '../types';

export function mmToCm(mm: number | string): number {
  const value = typeof mm === 'string' ? parseFloat(mm) : mm;
  return Number((value / 10).toFixed(1));
}

export function cmToMm(cm: number): number {
  return Math.round(cm * 10);
}

function getProductIds(node: ShopifyProduct): string[] {
  try {
    if (node.id_products_all?.length) {
      return node.id_products_all.map(id => id.replace('gid://shopify/Product/', ''));
    }

    const ids: string[] = [];
    
    if (node.id_persiana_principal?.[0]) {
      ids.push(node.id_persiana_principal[0].replace('gid://shopify/Product/', ''));
    }

    node.id_persiana_secundaria?.forEach(id => {
      if (id) {
        ids.push(id.replace('gid://shopify/Product/', ''));
      }
    });

    return ids;
  } catch (error) {
    logger.error('Erro ao processar IDs:', error);
    return [];
  }
}

export function generateDimensionOptions(min: number, max: number): { label: string; value: string }[] {
  return Array.from(
    { length: Math.floor((max - min) * 2) + 1 },
    (_, i) => {
      const value = min + (i * 0.5);
      return {
        label: `${value.toFixed(1)} cm`,
        value: value.toString()
      };
    }
  );
}

export function getMovementControlOptions(movementControl: string | null): { label: string; value: string }[] {
  if (!movementControl) {
    return [
      { label: 'Esquerda', value: 'left' },
      { label: 'Direita', value: 'right' }
    ];
  }
  
  return movementControl.split(',').map(value => ({
    label: value.trim(),
    value: value.trim().toLowerCase()
  }));
}

function processVariant(variant: ShopifyVariant): ProcessedVariant {
  try {
    logger.info('🔍 Processando variante bruta:', {
      id: variant.id,
      sku: variant.sku,
      dimensions: `${variant.length}x${variant.height}`,
      price: variant.price
    });

    const processed: ProcessedVariant = {
      id: variant.id,
      sku: variant.sku,
      price: parseFloat(variant.price),
      timeToShip: parseInt(variant.timeToShip?.value || '0'),
      totalPackageLength: parseInt(variant.totalPackageLenght?.value || '0'),
      packageWidth: parseInt(variant.packageWidth?.value || '0'),
      packageHeight: parseInt(variant.packageHeight?.value || '0'),
      skuBase: variant['sku-base'],
      length: parseInt(variant.length),
      height: parseInt(variant.height)
    };

    logger.info('✅ Variante processada com sucesso:', {
      id: processed.id,
      sku: processed.sku,
      dimensions: `${processed.length}x${processed.height}mm`,
      price: processed.price,
      shipping: {
        length: processed.totalPackageLength,
        width: processed.packageWidth,
        height: processed.packageHeight
      }
    });

    return processed;
  } catch (error) {
    logger.error('❌ Erro ao processar variante:', {
      error,
      variant: JSON.stringify(variant)
    });
    return {
      id: '',
      sku: '',
      price: 0,
      timeToShip: 0,
      totalPackageLength: 0,
      packageWidth: 0,
      packageHeight: 0,
      skuBase: '',
      length: 0,
      height: 0
    };
  }
}

function findMatchingVariant(variants: ProcessedVariant[], targetWidth: number, targetHeight: number): ProcessedVariant | null {
  try {
    logger.startGroup('🎯 Buscando variante correspondente');
    logger.info('Dimensões alvo:', {
      width: `${targetWidth}cm (${cmToMm(targetWidth)}mm)`,
      height: `${targetHeight}cm (${cmToMm(targetHeight)}mm)`
    });

    const targetWidthMm = cmToMm(targetWidth);
    const targetHeightMm = cmToMm(targetHeight);

    logger.info('Total de variantes disponíveis:', variants.length);
    logger.info('Lista de variantes:', variants.map(v => ({
      sku: v.sku,
      dimensions: `${v.length}x${v.height}mm`,
      price: v.price
    })));

    const validVariants = variants.filter(variant => {
      const isValid = variant.length >= targetWidthMm && variant.height >= targetHeightMm;
      logger.info(`Verificando variante ${variant.sku}:`, {
        variantDimensions: `${variant.length}x${variant.height}mm`,
        targetDimensions: `${targetWidthMm}x${targetHeightMm}mm`,
        isValid,
        checks: {
          width: `${variant.length} >= ${targetWidthMm}`,
          height: `${variant.height} >= ${targetHeightMm}`
        }
      });
      return isValid;
    });

    logger.info('Variantes válidas encontradas:', validVariants.length);

    if (!validVariants.length) {
      logger.warn('❌ Nenhuma variante encontrada com dimensões suficientes');
      logger.endGroup();
      return null;
    }

    const sortedVariants = validVariants.sort((a, b) => a.length - b.length || a.height - b.height);
    
    logger.info('Variantes ordenadas:', sortedVariants.map(v => ({
      sku: v.sku,
      dimensions: `${v.length}x${v.height}mm`,
      price: v.price
    })));

    const selectedVariant = sortedVariants[0];
    
    logger.info('✅ Variante selecionada:', {
      sku: selectedVariant.sku,
      dimensions: `${selectedVariant.length}x${selectedVariant.height}mm`,
      price: selectedVariant.price,
      shipping: {
        length: selectedVariant.totalPackageLength,
        width: selectedVariant.packageWidth,
        height: selectedVariant.packageHeight
      }
    });

    logger.endGroup();
    return selectedVariant;

  } catch (error) {
    logger.error('❌ Erro ao buscar variante:', error);
    logger.endGroup();
    return null;
  }
}

export async function updatePrices(activeItems: BlindQuotationItem[]): Promise<BlindQuotationItem[]> {
  try {
    logger.startGroup('🔄 Iniciando atualização de preços');
    
    logger.info('📋 Detalhes dos itens ativos:', activeItems.map(item => ({
      id: item.id,
      name: item.name,
      dimensions: `${item.width}x${item.height}`,
      productIds: item.product_ids,
      hasProduct: item.hasProduct
    })));
    
    const uniqueIds = Array.from(new Set(
      activeItems.flatMap(item => item.product_ids || [])
    ));
    
    logger.info('🔑 IDs únicos para consulta:', uniqueIds);
    logger.info('📊 Total de IDs únicos:', uniqueIds.length);

    if (!uniqueIds.length) {
      logger.warn('⚠️ Nenhum produto ativo para atualizar');
      return activeItems;
    }

    const webhookUrl = 'https://n8n.facilpersianas.com.br/webhook/retrieve-variants-data-on-shopify';
    const requestBody = { ids: uniqueIds };

    logger.info('🌐 Preparando requisição webhook:', {
      url: webhookUrl,
      method: 'POST',
      body: requestBody
    });

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    logger.info('📦 Dados recebidos do webhook:', {
      type: typeof data,
      isArray: Array.isArray(data),
      length: Array.isArray(data) ? data.length : 'N/A'
    });

    if (!Array.isArray(data)) {
      throw new Error('Formato de resposta inválido do webhook');
    }

    const updatedItems = await Promise.all(activeItems.map(async (item) => {
      logger.startGroup(`📝 Processando item ${item.id}`);
      
      try {
        if (!item.hasProduct || !item.name) {
          logger.info('⏭️ Item ignorado - sem produto ou nome');
          return item;
        }

        logger.info('🔍 Buscando produto correspondente:', {
          itemId: item.id,
          name: item.name,
          dimensions: `${item.width}x${item.height}`
        });

        const matchingProduct = data.find(product => 
          product.node.title === item.name
        );

        if (!matchingProduct) {
          logger.warn('⚠️ Produto não encontrado na resposta do webhook');
          return item;
        }

        logger.info('✅ Produto encontrado:', {
          title: matchingProduct.node.title,
          variants: matchingProduct.node.variants?.edges?.length || 0
        });

        const variants = matchingProduct.node.variants.edges.map(edge => 
          processVariant(edge.node)
        );
        
        logger.info('📊 Variantes processadas:', variants.map(v => ({
          sku: v.sku,
          dimensions: `${v.length}x${v.height}`,
          price: v.price
        })));

        const matchingVariant = findMatchingVariant(variants, item.width, item.height);

        if (matchingVariant) {
          logger.info('✅ Variante correspondente encontrada:', {
            sku: matchingVariant.sku,
            price: matchingVariant.price,
            dimensions: `${matchingVariant.length}x${matchingVariant.height}`
          });

          return {
            ...item,
            selectedVariant: matchingVariant,
            variantOptions: variants,
            unitPrice: matchingVariant.price,
            subtotal: matchingVariant.price * item.quantity,
            timeToShip: matchingVariant.timeToShip,
            shippingDimensions: {
              length: matchingVariant.totalPackageLength,
              width: matchingVariant.packageWidth,
              height: matchingVariant.packageHeight
            }
          };
        }

        logger.warn('⚠️ Nenhuma variante correspondente encontrada');
        return item;

      } catch (error) {
        logger.error('❌ Erro ao processar item:', error);
        return item;
      } finally {
        logger.endGroup();
      }
    }));

    logger.info('✅ Processamento concluído:', {
      totalItems: updatedItems.length,
      updatedItems: updatedItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.unitPrice,
        variant: item.selectedVariant?.sku
      }))
    });

    return updatedItems;

  } catch (error) {
    logger.error('❌ Erro ao atualizar preços:', error);
    throw error;
  } finally {
    logger.endGroup();
  }
}

export async function fetchProducts(): Promise<ProcessedProduct[]> {
  logger.startGroup('🔄 Processando Produtos do N8N Webhook');

  try {
    const webhookUrl = 'https://n8n.facilpersianas.com.br/webhook/get-products';
    logger.info('🌐 Buscando produtos do N8N Webhook:', webhookUrl);

    const response = await fetch(webhookUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      logger.warn('⚠️ A resposta do Webhook não é um array. Retornando array vazio.');
      return [];
    }
    
    logger.info('✅ Produtos recebidos com sucesso do N8N Webhook.', data);
    return data as ProcessedProduct[];

  } catch (error) {
    logger.error('❌ Erro ao buscar produtos do N8N Webhook:', error);
    return [];
  } finally {
    logger.endGroup();
  }
}