import React, { useState } from 'react';
import { X } from 'lucide-react';

interface NotesModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (notes: string) => void;
  initialNotes: string;
}

const NotesModal: React.FC<NotesModalProps> = ({ show, onClose, onSave, initialNotes }) => {
  const [notes, setNotes] = useState(initialNotes);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Notas do Pedido</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adicione suas notas
            </label>
            <textarea
              className="w-full h-40 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Digite suas observações aqui..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onSave(notes);
              onClose();
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesModal;