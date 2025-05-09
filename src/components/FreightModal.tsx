import React, { useState } from 'react';
import { X } from 'lucide-react';

interface FreightModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  initialValue: string;
}

const FreightModal: React.FC<FreightModalProps> = ({ show, onClose, onSave, initialValue }) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^\d.,]/g, '');
    setValue(newValue);
  };

  const formatValue = (value: string): string => {
    if (!value) return '0.00';
    
    // Remove all non-numeric characters except decimal separator
    const cleanValue = value.replace(/[^\d.,]/g, '').replace(',', '.');
    
    // Convert to number and format with 2 decimal places
    const numValue = parseFloat(cleanValue);
    return isNaN(numValue) ? '0.00' : numValue.toFixed(2);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Frete Aproximado</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor do frete (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                R$
              </span>
              <input
                type="text"
                className="w-full pl-8 pr-3 py-2 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={value}
                onChange={handleChange}
                placeholder="0,00"
              />
            </div>
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
              onSave(formatValue(value));
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

export default FreightModal;