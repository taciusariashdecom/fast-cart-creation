import React from 'react';

interface ShopifyVariantsTableProps {
  lastPayload: any;
}

const ShopifyVariantsTable: React.FC<ShopifyVariantsTableProps> = ({ lastPayload }) => {
  if (!lastPayload) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Tabela de Variantes do Shopify</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variants JSON</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                <pre className="whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(lastPayload, null, 2)}
                </pre>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShopifyVariantsTable;