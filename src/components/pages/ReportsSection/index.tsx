import React from 'react';
import { Customer, BlindQuotationItem, WebhookOrderDraftResponse } from '../../types';
import OrderSummary from './OrderSummary';
import FrontendItemsTable from './FrontendItemsTable';
import ShopifyProductsTable from './ShopifyProductsTable';
import ShopifyVariantsTable from './ShopifyVariantsTable';
import WebhookDraftResponse from './WebhookDraftResponse';

interface ReportsSectionProps {
  items: BlindQuotationItem[];
  total: number;
  freightCost: string;
  totalWithFreight: number;
  selectedCustomer: Customer | null;
  selectedSeller: string;
  sellerOptions: { label: string; value: string }[];
  notes: string;
  shopifyProducts: any;
  lastWebhookPayload: WebhookOrderDraftResponse | null;
}

const ReportsSection: React.FC<ReportsSectionProps> = ({
  items,
  total,
  freightCost,
  totalWithFreight,
  selectedCustomer,
  selectedSeller,
  sellerOptions,
  notes,
  shopifyProducts,
  lastWebhookPayload
}) => {
  return (
    <div className="mt-12 space-y-8">
      <WebhookDraftResponse response={lastWebhookPayload} />
      <OrderSummary
        items={items}
        total={total}
        freightCost={freightCost}
        totalWithFreight={totalWithFreight}
        selectedCustomer={selectedCustomer}
        selectedSeller={selectedSeller}
        sellerOptions={sellerOptions}
        notes={notes}
        webhookResponse={lastWebhookPayload}
      />
      <FrontendItemsTable
        items={items}
        onUpdateItemNote={(id, note) => {
          if (typeof id === 'string') {
            const idx = items.findIndex(i => i.id === id);
            if (idx !== -1) {
              items[idx] = { ...items[idx], note };
            }
          }
        }}
      />
      {shopifyProducts && <ShopifyProductsTable products={shopifyProducts} />}
      {lastWebhookPayload && <ShopifyVariantsTable lastPayload={lastWebhookPayload} />}
    </div>
  );
};

export default ReportsSection;