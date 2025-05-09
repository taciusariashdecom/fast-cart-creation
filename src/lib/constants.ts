/**
 * Application Constants
 * 
 * Central location for all application constants to improve maintainability
 * and make it easier for LLMs to understand the system configuration.
 */

// API Endpoints
export const ENDPOINTS = {
  WEBHOOK: {
    CREATE_ORDER: 'https://n8n.facilpersianas.com.br/webhook/create-order-draft',
    VARIANTS_DATA: 'https://n8n.facilpersianas.com.br/webhook/retrieve-variants-data-on-shopify'
  },
  SHOPIFY: {
    ADMIN_URL: 'https://admin.shopify.com/store/testefacilpersianas/draft_orders'
  }
} as const;

// Default Values
export const DEFAULTS = {
  BLIND_ITEM: {
    id: '1',
    name: '',
    width: 0,
    height: 0,
    cordSide: 'left',
    quantity: 1,
    unitPrice: 0,
    subtotal: 0,
    hasProduct: false
  },
  FREIGHT_COST: '0.00'
} as const;

// Seller Options
export const SELLER_OPTIONS = [
  { label: 'BRUNA T.', value: 'bruna' },
  { label: 'ALINE B.', value: 'aline' },
  { label: 'JAISSA R.', value: 'jaissa' },
  { label: 'OUTROS', value: 'outros' }
] as const;

// Storage Keys
export const STORAGE_KEYS = {
  PRODUCTS: 'blindQuotation_products'
} as const;

// Timeouts
export const TIMEOUTS = {
  CART_BUTTON_ACTIVE: 5000 // 5 seconds
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: {
    date: 'dd/MM/yyyy',
    dateTime: 'dd/MM/yyyy HH:mm'
  },
  LOCALE: 'pt-BR'
} as const;