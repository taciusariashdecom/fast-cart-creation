import React, { useState, ChangeEvent, KeyboardEvent } from 'react';
import { BlindQuotationItem } from '../../../../types/models';
import { useProductTables } from '../../../hooks/useProductTables';

// Props tipadas explicitamente
interface FrontendItemsTableProps {
  items: BlindQuotationItem[];
  onUpdateItemNote?: (id: string, note: string) => void;
}

/**
 * Tabela de Itens do Frontend
 * Renderiza uma tabela de itens com opção de editar notas por item.
 * Otimizado para LLMs: funções separadas, nomes padronizados, JSX limpo.
 */
const FrontendItemsTable: React.FC<FrontendItemsTableProps> = ({ items, onUpdateItemNote }) => {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>('');
  const { nodesTable } = useProductTables();

  // Busca detalhes do produto pelo nome (pode ser expandido conforme necessário)
  const getProductDetails = (itemName: string) => nodesTable.nodes.find(node => node.title === itemName);

  // Renderiza a célula de nota, editável ou não
  function renderNoteCell(item: BlindQuotationItem) {
    const isEditing = editingNoteId === item.id;
    if (isEditing) {
      return (
        <td>
          <input
            type="text"
            value={noteDraft}
            autoFocus
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNoteDraft(e.target.value)}
            onBlur={() => {
              onUpdateItemNote?.(item.id, noteDraft);
              setEditingNoteId(null);
            }}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                onUpdateItemNote?.(item.id, noteDraft);
                setEditingNoteId(null);
              } else if (e.key === 'Escape') {
                setEditingNoteId(null);
              }
            }}
            className="w-36 h-6 text-xs p-1 border border-gray-200 rounded bg-white"
            placeholder="Nota do item (opcional)"
          />
        </td>
      );
    }
    return (
      <td>
        <button
          onClick={() => {
            setEditingNoteId(item.id);
            setNoteDraft((item as any).note || '');
          }}
          className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 border border-indigo-300 rounded shadow-sm font-semibold bg-indigo-50"
        >
          + <span className="ml-1">Nota</span>
          {(item as any).note && <span className="ml-2 text-gray-600">{(item as any).note}</span>}
        </button>
      </td>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Tabela de Itens do Frontend</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3">Nome</th>
              <th className="px-6 py-3">Largura (cm)</th>
              <th className="px-6 py-3">Altura (cm)</th>
              <th className="px-6 py-3">Lado Cordinha</th>
              <th className="px-6 py-3">Quantidade</th>
              <th className="px-6 py-3">Preço Unit.</th>
              <th className="px-6 py-3">Subtotal</th>
              <th className="px-6 py-3">Nota</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map(item => (
              <tr key={item.id}>
                <td className="px-6 py-4">{item.id}</td>
                <td className="px-6 py-4">{item.name || '—'}</td>
                <td className="px-6 py-4">{item.width ?? '—'}</td>
                <td className="px-6 py-4">{item.height ?? '—'}</td>
                <td className="px-6 py-4">{item.cordSide ?? '—'}</td>
                <td className="px-6 py-4">{item.quantity ?? '—'}</td>
                <td className="px-6 py-4">{item.unitPrice ? `R$ ${item.unitPrice.toFixed(2)}` : '—'}</td>
                <td className="px-6 py-4">{item.subtotal ? `R$ ${item.subtotal.toFixed(2)}` : '—'}</td>
                {renderNoteCell(item)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FrontendItemsTable;