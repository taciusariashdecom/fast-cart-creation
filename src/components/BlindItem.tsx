import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { BlindQuotationItem } from '../types';
import Dropdown from './ui/Dropdown';
import { generateDimensionOptions, getMovementControlOptions } from '../lib/products';
import { logger } from '../lib/logger';
import { useProductTables } from '../hooks/useProductTables';

interface BlindItemProps {
  item: BlindQuotationItem;
  onUpdate: (id: string, updates: Partial<BlindQuotationItem>) => void;
  onDelete: (id: string) => void;
}

const BlindItem: React.FC<BlindItemProps> = ({ item, onUpdate, onDelete }) => {
  const { nodesTable, isLoading } = useProductTables();
  const selectedNode = nodesTable.nodes.find(node => node.title === item.name);

  useEffect(() => {
    const subtotal = item.unitPrice * item.quantity;
    if (item.subtotal !== subtotal) {
      onUpdate(item.id, { subtotal });
    }
  }, [item.unitPrice, item.quantity, item.id]);

  const handleProductSelect = (productTitle: string) => {
    logger.startGroup('🔄 Fluxo de Seleção de Produto');
    logger.info('1. Início da seleção:', { productTitle });

    const node = nodesTable.nodes.find(n => n.title === productTitle);
    
    if (node) {
      logger.info('2. Produto encontrado:', {
        title: node.title,
        dimensions: {
          width: `${node.larguraMinima.value} - ${node.larguraMaxima.value}`,
          height: `${node.alturaMinima.value} - ${node.alturaMaxima.value}`
        }
      });

      const minWidth = parseInt(node.larguraMinima.value) / 10;
      const minHeight = parseInt(node.alturaMinima.value) / 10;

      onUpdate(item.id, {
        name: node.title,
        product_ids: node.id_products_all,
        hasProduct: true,
        width: minWidth,
        height: minHeight,
        cordSide: 'left',
        subtotal: 0
      });

      logger.info('3. Estado atualizado com sucesso', {
        width: minWidth,
        height: minHeight,
        cordSide: 'left'
      });
    } else {
      logger.warn('❌ Produto não encontrado:', productTitle);
    }

    logger.endGroup();
  };

  const widthOptions = selectedNode ? 
    generateDimensionOptions(
      parseInt(selectedNode.larguraMinima.value) / 10,
      parseInt(selectedNode.larguraMaxima.value) / 10
    ) : [];

  const heightOptions = selectedNode ?
    generateDimensionOptions(
      parseInt(selectedNode.alturaMinima.value) / 10,
      parseInt(selectedNode.alturaMaxima.value) / 10
    ) : [];

  const cordSideOptions = selectedNode ? 
    getMovementControlOptions(selectedNode.movementControl) : [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-[40%,8.57%,8.57%,8.57%,8.57%,8.57%,8.57%,8.57%] gap-4 p-4 border-b last:border-b-0 items-center">
        <div className="animate-pulse bg-gray-200 h-10 rounded-lg"></div>
        <div className="animate-pulse bg-gray-200 h-10 rounded-lg"></div>
        <div className="animate-pulse bg-gray-200 h-10 rounded-lg"></div>
        <div className="animate-pulse bg-gray-200 h-10 rounded-lg"></div>
        <div className="animate-pulse bg-gray-200 h-10 rounded-lg"></div>
        <div className="animate-pulse bg-gray-200 h-10 rounded-lg"></div>
        <div className="animate-pulse bg-gray-200 h-10 rounded-lg"></div>
        <div className="animate-pulse bg-gray-200 h-10 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[40%,8.57%,8.57%,8.57%,8.57%,8.57%,8.57%,8.57%] gap-4 p-4 border-b last:border-b-0 items-center text-[13px]">
      <div>
        <Dropdown
          value={item.name}
          onChange={handleProductSelect}
          options={nodesTable.nodes.map(node => ({ 
            label: node.title, 
            value: node.title 
          }))}
          placeholder="Selecione uma persiana"
          showSearch={true}
        />
      </div>
      
      <div>
        <Dropdown
          value={item.width === 0 ? '' : String(item.width)}
          onChange={(value) => {
            logger.info('4. Atualizando largura:', {
              previous: item.width,
              new: Number(value)
            });
            onUpdate(item.id, { width: Number(value) });
          }}
          options={item.width === 0 ? [] : widthOptions}
          placeholder={item.width === 0 ? '—' : 'Largura'}
          showSearch={true}
          className={!selectedNode ? 'opacity-50 pointer-events-none' : ''}
          disabled={item.width === 0}
        />
      </div>

      <div>
        <Dropdown
          value={item.height === 0 ? '' : String(item.height)}
          onChange={(value) => {
            logger.info('5. Atualizando altura:', {
              previous: item.height,
              new: Number(value)
            });
            onUpdate(item.id, { height: Number(value) });
          }}
          options={item.height === 0 ? [] : heightOptions}
          placeholder={item.height === 0 ? '—' : 'Altura'}
          showSearch={true}
          className={!selectedNode ? 'opacity-50 pointer-events-none' : ''}
          disabled={item.height === 0}
        />
      </div>

      <div>
        <Dropdown
          value={item.cordSide}
          onChange={(value) => {
            logger.info('6. Atualizando lado da cordinha:', {
              previous: item.cordSide,
              new: value
            });
            onUpdate(item.id, { cordSide: value as 'left' | 'right' });
          }}
          options={cordSideOptions}
          placeholder="Lado"
          className={!selectedNode ? 'opacity-50 pointer-events-none' : ''}
        />
      </div>

      <div className="text-gray-900 font-medium">
        {item.unitPrice ? `R$ ${item.unitPrice.toFixed(2)}` : '—'}
      </div>

      <div className="flex items-center justify-center gap-2">
        <button 
          className="p-1 text-gray-400 hover:text-gray-600"
          onClick={() => {
            const newQuantity = Math.max(1, item.quantity - 1);
            logger.info('7. Diminuindo quantidade:', {
              previous: item.quantity,
              new: newQuantity
            });
            onUpdate(item.id, { quantity: newQuantity });
          }}
        >
          —
        </button>
        <span className="w-8 text-center">{item.quantity}</span>
        <button 
          className="p-1 text-gray-400 hover:text-gray-600"
          onClick={() => {
            const newQuantity = item.quantity + 1;
            logger.info('8. Aumentando quantidade:', {
              previous: item.quantity,
              new: newQuantity
            });
            onUpdate(item.id, { quantity: newQuantity });
          }}
        >
          +
        </button>
      </div>

      <div className="text-gray-900 font-medium">
        {item.subtotal ? `R$ ${item.subtotal.toFixed(2)}` : '—'}
      </div>

      <div className="flex justify-center">
        <button 
          className="p-1 text-red-400 hover:text-red-600"
          onClick={() => {
            logger.info('9. Removendo item:', { id: item.id });
            onDelete(item.id);
          }}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default BlindItem;