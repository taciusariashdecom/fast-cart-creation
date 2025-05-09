/**
 * API Types
 * 
 * Type definitions for API requests and responses.
 * Organized for easy understanding by LLMs.
 */

export interface WebhookOrderDraftResponse {
  draftOrder_id: string;
  delivery_estimate_business_days: number;
  provider_shipping_cost: number;
  delivery_method_name: string;
  delivery_estimate_date: string;
}

export interface CartSubmissionPayload {
  customer: {
    email: string;
    address: {
      cep: string;
    };
  };
  cart: {
    items: CartItem[];
    seller_name: string;
    cart_type: string;
  };
  cart_total_input: string;
  cart_total_input_with_freight: string;
  freight_estimated_cost: string;
  order_notes: string;
  delivery_estimate_date: string | null;
}

export interface CartItem {
  nomePersiana: string;
  id_selected_product: string;
  id_all_products: string[];
  largura: string;
  altura: string;
  larguraMm: number;
  alturaMm: number;
  ladoCordinha: string;
  quantidade: number;
  variant_info: VariantInfo;
  precoUnitario: number;
  subtotal: number;
  observacao: string;
}

export interface VariantInfo {
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
}