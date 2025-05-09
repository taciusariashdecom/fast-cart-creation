import React from 'react';
import { Customer, BlindQuotationItem, WebhookOrderDraftResponse } from '../../types';
import { ExternalLink } from 'lucide-react';

interface OrderSummaryProps {
  items: BlindQuotationItem[];
  total: number;
  freightCost: string;
  totalWithFreight: number;
  selectedCustomer: Customer | null;
  selectedSeller: string;
  sellerOptions: { label: string; value: string }[];
  notes: string;
  webhookResponse?: WebhookOrderDraftResponse | null;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  total,
  freightCost,
  totalWithFreight,
  selectedCustomer,
  selectedSeller,
  sellerOptions,
  notes,
  webhookResponse
}) => {
  const selectedSellerName = sellerOptions.find(s => s.value === selectedSeller)?.label || 'Não selecionado';

  const getDraftOrderId = (fullId: string) => {
    return fullId.replace('gid://shopify/DraftOrder/', '');
  };

  const getShopifyAdminUrl = (draftOrderId: string) => {
    return `https://admin.shopify.com/store/testefacilpersianas/draft_orders/${getDraftOrderId(draftOrderId)}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };


  // Extrai firstName e lastName do nome do cliente
  let firstName = '';
  let lastName = '';
  if (selectedCustomer && selectedCustomer.name) {
    const nameParts = selectedCustomer.name.trim().split(' ');
    if (nameParts.length === 1) {
      firstName = nameParts[0];
      lastName = nameParts[0];
    } else {
      firstName = nameParts.slice(0, -1).join(' ');
      lastName = nameParts[nameParts.length - 1];
    }
  }

  const webhookPayload = {
    customer: {
      email: selectedCustomer?.email || '',
      firstName,
      lastName,
      address: {
        cep: selectedCustomer?.zipCode || ''
      }
    },
    cart: {
      items: items.filter(item => item.hasProduct && item.selectedVariant).map(item => ({
        nomePersiana: item.name,
        id_selected_product: item.product_ids?.[0] || '',
        id_all_products: item.product_ids || [],
        largura: item.width.toFixed(1).replace('.', ','),
        altura: item.height.toFixed(1).replace('.', ','),
        larguraMm: Math.round(item.width * 10),
        alturaMm: Math.round(item.height * 10),
        ladoCordinha: item.cordSide === 'left' ? 'esquerda' : 'direita',
        quantidade: item.quantity,
        variant_info: item.selectedVariant && {
          id: item.selectedVariant.id,
          sku: item.selectedVariant.sku,
          price: item.selectedVariant.price.toString(),
          timeToShip: item.selectedVariant.timeToShip ? { value: item.selectedVariant.timeToShip.toString() } : null,
          totalPackageLenght: { value: item.selectedVariant.totalPackageLength.toString() },
          packageWidth: { value: item.selectedVariant.packageWidth.toString() },
          packageHeight: { value: item.selectedVariant.packageHeight.toString() },
          'sku-base': item.selectedVariant.skuBase,
          length: item.selectedVariant.length.toString(),
          height: item.selectedVariant.height.toString(),
          id_variant: item.selectedVariant.id
        },
        precoUnitario: item.unitPrice,
        subtotal: item.subtotal,
        observacao: ''
      })),
      seller_name: selectedSellerName,
      cart_type: 'new'
    },
    cart_total_input: total.toFixed(2),
    cart_total_input_with_freight: totalWithFreight.toFixed(2),
    freight_estimated_cost: webhookResponse?.provider_shipping_cost.toFixed(2) || freightCost,
    order_notes: notes,
    delivery_estimate_date: webhookResponse?.delivery_estimate_date || null
  };


  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Resumo do Pedido</h2>
      {/* Exibe firstName e lastName acima do resumo */}
      <div className="mb-2">
        <span className="text-xs text-gray-400 mr-4">First Name: {firstName}</span>
        <span className="text-xs text-gray-400">Last Name: {lastName}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6">
        <p className="text-gray-700">Total de Itens: <span className="font-medium">{items.length}</span></p>
        <p className="text-gray-700">Valor Total: <span className="font-medium">R$ {total.toFixed(2)}</span></p>
        
        <p className="text-gray-700">
          Frete: <span className="font-medium">R$ {webhookResponse?.provider_shipping_cost.toFixed(2) || freightCost}</span>
        </p>
        <p className="text-gray-700">
          Total com Frete: <span className="font-medium">R$ {totalWithFreight.toFixed(2)}</span>
        </p>
        
        <p className="text-gray-700">Cliente: <span className="font-medium">{selectedCustomer?.name || 'Não selecionado'}</span></p>
        <p className="text-gray-700">Vendedor: <span className="font-medium">{selectedSellerName}</span></p>
      </div>

      <div className="mb-6">
        <p className="text-gray-700">
          Notas: <span className="italic">{notes || 'Nenhuma nota adicionada'}</span>
        </p>
      </div>
      
      {webhookResponse && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-700">
                Data Estimada de Entrega:
                <span className="block font-medium text-gray-900">
                  {formatDate(webhookResponse.delivery_estimate_date)}
                </span>
              </p>
            </div>
            
            <div>
              <p className="text-gray-700">
                LINK DO CARRINHO:
                <a 
                  href={getShopifyAdminUrl(webhookResponse.draftOrder_id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium mt-1"
                >
                  Abrir no Shopify <ExternalLink size={16} />
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900 mb-3">PAYLOAD POST PARA WEBHOOK</h3>
      <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
          {JSON.stringify(webhookPayload, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default OrderSummary;