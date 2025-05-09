import React from 'react';
import { WebhookOrderDraftResponse } from '../../types';
import { ExternalLink } from 'lucide-react';

interface WebhookDraftResponseProps {
  response: WebhookOrderDraftResponse | null;
}

const WebhookDraftResponse: React.FC<WebhookDraftResponseProps> = ({ response }) => {
  if (!response) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">RETORNO WEBHOOK ORDER DRAFT</h3>
        <p className="text-gray-500 italic">Nenhum retorno disponível</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  const getDraftOrderId = (fullId: string) => {
    return fullId.replace('gid://shopify/DraftOrder/', '');
  };

  const getShopifyAdminUrl = (draftOrderId: string) => {
    return `https://admin.shopify.com/store/testefacilpersianas/draft_orders/${getDraftOrderId(draftOrderId)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">RETORNO WEBHOOK ORDER DRAFT</h3>
      
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Informações do Pedido</h4>
          <div className="space-y-2">
            <div>
              <span className="text-sm text-gray-500">ID do Rascunho:</span>
              <div className="flex items-center gap-2">
                <p className="text-gray-900">{getDraftOrderId(response.draftOrder_id)}</p>
                <a
                  href={getShopifyAdminUrl(response.draftOrder_id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800"
                  title="Abrir no Shopify Admin"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-500">Método de Entrega:</span>
              <p className="text-gray-900 font-medium">{response.delivery_method_name}</p>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Informações de Entrega</h4>
          <div className="space-y-2">
            <div>
              <span className="text-sm text-gray-500">Prazo de Entrega:</span>
              <p className="text-gray-900">
                {response.delivery_estimate_business_days} {response.delivery_estimate_business_days === 1 ? 'dia útil' : 'dias úteis'}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Data Estimada:</span>
              <p className="text-gray-900 font-medium">{formatDate(response.delivery_estimate_date)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Custo do Frete:</span>
              <p className="text-gray-900 font-medium text-lg">
                R$ {response.provider_shipping_cost.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="font-medium text-gray-700 mb-2">JSON Completo da Resposta</h4>
        <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default WebhookDraftResponse;