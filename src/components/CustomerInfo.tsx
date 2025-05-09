/**
 * CustomerInfo Component
 * 
 * Displays customer information in a structured format with:
 * - Add/Edit functionality
 * - Responsive grid layout
 * - Clear visual hierarchy
 */

import React from 'react';
import { Customer } from '../types';
import { UserPlus2, Pencil } from 'lucide-react';

interface CustomerInfoProps {
  customer: Customer | null;
  onEditClick: () => void;
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({ customer, onEditClick }) => {
  // Show add customer button if no customer exists or has no info
  if (!customer || !hasCustomerInfo(customer)) {
    return (
      <button
        onClick={onEditClick}
        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        aria-label="Adicionar Cliente"
      >
        <UserPlus2 size={20} />
        <span>Adicionar Cliente</span>
      </button>
    );
  }

  // Extrai firstName e lastName do nome do cliente
  let firstName = '';
  let lastName = '';
  if (customer && customer.name) {
    const nameParts = customer.name.trim().split(' ');
    if (nameParts.length === 1) {
      firstName = nameParts[0];
      lastName = nameParts[0];
    } else {
      firstName = nameParts.slice(0, -1).join(' ');
      lastName = nameParts[nameParts.length - 1];
    }
  }

  // Display customer information in a grid layout
  return (
    <div className="flex flex-col">
      <button
        onClick={onEditClick}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
        aria-label="Editar Cliente"
      >
        <Pencil size={18} />
        <span>Cliente</span>
      </button>

      <div className="grid grid-cols-4 gap-4 bg-white p-4 rounded-lg shadow-sm">
        {/* Customer Name */}
        <div>
          <div className="text-sm text-gray-500">Nome:</div>
          <div className="text-gray-900 truncate" title={customer.name || '—'}>
            {customer.name || '—'}
          </div>
          <div className="text-xs text-gray-400 mt-1">First Name: {firstName}</div>
          <div className="text-xs text-gray-400">Last Name: {lastName}</div>
        </div>

        {/* Customer Email */}
        <div>
          <div className="text-sm text-gray-500">Email:</div>
          <div className="text-gray-900 truncate" title={customer.email || '—'}>
            {customer.email || '—'}
          </div>
        </div>

        {/* Customer Phone */}
        <div>
          <div className="text-sm text-gray-500">Telefone:</div>
          <div className="text-gray-900 truncate" title={customer.phone || '—'}>
            {customer.phone || '—'}
          </div>
        </div>

        {/* Customer Postal Code */}
        <div>
          <div className="text-sm text-gray-500">CEP:</div>
          <div className="text-gray-900 truncate" title={customer.zipCode || '—'}>
            {customer.zipCode || '—'}
          </div>
        </div>

        {/* Customer Address */}
        <div>
          <div className="text-sm text-gray-500">Endereço:</div>
          <div className="text-gray-900 truncate" title={customer.address || '—'}>
            {customer.address || '—'}
          </div>
        </div>

        {/* Customer City */}
        <div>
          <div className="text-sm text-gray-500">Cidade:</div>
          <div className="text-gray-900 truncate" title={customer.city || '—'}>
            {customer.city || '—'}
          </div>
        </div>

        {/* Customer State */}
        <div>
          <div className="text-sm text-gray-500">Estado:</div>
          <div className="text-gray-900 truncate" title={customer.state || '—'}>
            {customer.state || '—'}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Checks if the customer object has any valid information
 * @param customer - The customer object to check
 * @returns boolean indicating if the customer has any information
 */
function hasCustomerInfo(customer: Customer): boolean {
  return Object.values(customer).some(value => value && value.trim() !== '');
}

export default CustomerInfo;