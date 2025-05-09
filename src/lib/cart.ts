import { logger } from './logger';
import { Customer, BlindQuotationItem, WebhookOrderDraftResponse } from '../types';
import { supabase } from './supabase';

// Webhook endpoint for cart submission
const WEBHOOK_URL = 'https://n8n.facilpersianas.com.br/webhook/create-order-draft';

/**
 * Submits the cart to the webhook endpoint and processes the response
 * 
 * @param payload - The cart submission payload
 * @returns Promise resolving to the webhook response
 * @throws Error if the submission fails
 */
export async function submitCart(payload: CartSubmissionPayload): Promise<WebhookOrderDraftResponse> {
  try {
    logger.startGroup('🚀 Enviando carrinho');
    
    // Validate payload before sending
    if (!validateCartPayload(payload)) {
      throw new Error('Invalid cart payload');
    }

    logger.info('Enviando requisição para webhook', {
      itemCount: payload.cart.items.length,
      total: payload.cart_total_input
    });

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Process and validate the webhook response
    const processedResponse = processWebhookResponse(data);
    
    logger.info('✅ Carrinho enviado com sucesso:', {
      orderId: processedResponse.draftOrder_id,
      estimatedDate: processedResponse.delivery_estimate_date,
      shippingCost: processedResponse.provider_shipping_cost
    });
    
    return processedResponse;
  } catch (error) {
    logger.error('❌ Erro ao enviar carrinho:', error);
    throw error;
  } finally {
    logger.endGroup();
  }
}

/**
 * Processes and validates the webhook response
 * 
 * @param data - Raw webhook response data
 * @returns Processed WebhookOrderDraftResponse
 * @throws Error if response is invalid
 */
function processWebhookResponse(data: any): WebhookOrderDraftResponse {
  // Se o backend retornar um array, use o primeiro elemento
  if (Array.isArray(data)) {
    data = data[0];
  }
  try {
    // Validate required fields
    if (typeof data.draftOrder_id === 'undefined' || !data.delivery_estimate_date || typeof data.provider_shipping_cost !== 'number') {
      throw new Error('Invalid webhook response format');
    }
    if (data.draftOrder_id === null) {
      logger.warn('draftOrder_id está null no retorno do webhook.');
    }

    // Format the response
    const response: WebhookOrderDraftResponse = {
      draftOrder_id: data.draftOrder_id,
      delivery_estimate_business_days: parseInt(data.delivery_estimate_business_days) || 0,
      provider_shipping_cost: parseFloat(data.provider_shipping_cost) || 0,
      delivery_method_name: data.delivery_method_name || '',
      delivery_estimate_date: data.delivery_estimate_date
    };

    // Validate date format
    const date = new Date(response.delivery_estimate_date);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format in webhook response');
    }

    return response;
  } catch (error) {
    logger.error('Error processing webhook response:', error);
    throw new Error('Failed to process webhook response');
  }
}

/**
 * Validates the cart payload before submission
 * 
 * @param payload - The cart submission payload to validate
 * @returns boolean indicating if the payload is valid
 */
function validateCartPayload(payload: CartSubmissionPayload): boolean {
  try {
    // Basic validation checks
    if (!payload.customer?.email || !payload.cart?.items?.length) {
      return false;
    }

    // Validate each cart item
    for (const item of payload.cart.items) {
      if (!item.nomePersiana || !item.variant_info || item.quantidade < 1) {
        return false;
      }
    }

    return true;
  } catch (error) {
    logger.error('Error validating cart payload:', error);
    return false;
  }
}

/**
 * Represents the structure of a cart submission payload
 */
interface CartSubmissionPayload {
  customer: {
    email: string;
    address: {
      cep: string;
    };
  };
  cart: {
    items: Array<{
      nomePersiana: string;
      id_selected_product: string;
      id_all_products: string[];
      largura: string;
      altura: string;
      larguraMm: number;
      alturaMm: number;
      ladoCordinha: string;
      quantidade: number;
      variant_info: {
        id: string;
        sku: string;
        price: string;
        timeToShip: { value: string } | null;
        totalPackageLenght: { value: string };
        packageWidth: { value: string };
        packageHeight: { value: string };
        'sku-base': string;
        length: string;
        height: string;
        id_variant: string;
      };
      precoUnitario: number;
      subtotal: number;
      observacao: string;
    }>;
    seller_name: string;
    cart_type: string;
  };
  cart_total_input: string;
  cart_total_input_with_freight: string;
  freight_estimated_cost: string;
  order_notes: string;
  delivery_estimate_date: string | null;
}