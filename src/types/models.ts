/**
 * Model Types
 * 
 * Core business model type definitions.
 * Each type is documented for easy understanding by LLMs.
 */

export interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface BlindQuotationItem {
  id: string;
  name: string;
  width: number;
  height: number;
  cordSide: 'left' | 'right';
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product_ids?: string[];
  hasProduct: boolean;
  selectedVariant?: ProcessedVariant;
  variantOptions?: ProcessedVariant[];
  timeToShip?: number;
  shippingDimensions?: ShippingDimensions;
}

export interface ProcessedVariant {
  id: string;
  sku: string;
  price: number;
  timeToShip: number;
  totalPackageLength: number;
  packageWidth: number;
  packageHeight: number;
  skuBase: string;
  length: number;
  height: number;
}

export interface ShippingDimensions {
  length: number;
  width: number;
  height: number;
}