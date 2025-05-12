import React, { useState, useEffect } from 'react';
import { UserPlus2, Pencil, Plus, Trash2, RotateCcw, ShoppingCart, FileText, Truck, Calendar } from 'lucide-react';
import CustomerModal from './components/CustomerModal';
import NotesModal from './components/NotesModal';
import FreightModal from './components/FreightModal';
import EstimatedDateModal from './components/EstimatedDateModal';
import BlindItem from './components/BlindItem';
import Dropdown from './components/ui/Dropdown';
import ReportsSection from './components/pages/ReportsSection';
import CustomerInfo from './components/CustomerInfo';
import { Customer, BlindQuotationItem } from './types';
import { updatePrices } from './lib/products';
import { submitCart } from './lib/cart';
import { logger } from './lib/logger';
import { useShopifyProducts } from './hooks/useShopifyProducts';
import { useLastWebhookPayload } from './hooks/useLastWebhookPayload';

const DEFAULT_BLIND_ITEM: BlindQuotationItem = {
  id: '1',
  name: '',
  width: 0,
  height: 0,
  cordSide: 'left',
  quantity: 1,
  unitPrice: 0,
  subtotal: 0,
  hasProduct: false
};

const SELLER_OPTIONS = [
  { label: 'BRUNA T.', value: 'bruna' },
  { label: 'ALINE B.', value: 'aline' },
  { label: 'JAISSA R.', value: 'jaissa' },
  { label: 'OUTROS', value: 'outros' },
];

function App() {
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showFreightModal, setShowFreightModal] = useState(false);
  const [showEstimatedDateModal, setShowEstimatedDateModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedSeller, setSelectedSeller] = useState('');
  const [items, setItems] = useState<BlindQuotationItem[]>([
  { ...DEFAULT_BLIND_ITEM, id: '1' },
  { ...DEFAULT_BLIND_ITEM, id: '2' },
  { ...DEFAULT_BLIND_ITEM, id: '3' }
]);
  const [notes, setNotes] = useState('');
  const [freightCost, setFreightCost] = useState('0.00');
  const [estimatedDate, setEstimatedDate] = useState('');
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);
  const [isSubmittingCart, setIsSubmittingCart] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [enviarCarrinhoActive, setEnviarCarrinhoActive] = useState(false);

  const { products: shopifyProducts } = useShopifyProducts(showReports);
  const { lastPayload, updatePayload } = useLastWebhookPayload();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (enviarCarrinhoActive) {
      timeoutId = setTimeout(() => {
        setEnviarCarrinhoActive(false);
      }, 5000);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [enviarCarrinhoActive]);

  const total = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const totalWithFreight = total + parseFloat(freightCost);

  const handleAddBlind = () => {
    setItems(prev => [...prev, {
      ...DEFAULT_BLIND_ITEM,
      id: String(Date.now())
    }]);
  };

  const handleUpdateBlind = (id: string, updates: Partial<BlindQuotationItem>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const handleDeleteBlind = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClearData = () => {
    console.log('Limpando dados...');
    if (confirm('Tem certeza que deseja limpar todos os dados?')) {
      setItems([{ ...DEFAULT_BLIND_ITEM }]);
      setSelectedCustomer(null);
      setSelectedSeller('');
      setNotes('');
      setFreightCost('0.00');
      setEstimatedDate('');
      setShowCustomerModal(false);
      setShowNotesModal(false);
      setShowFreightModal(false);
      setShowEstimatedDateModal(false);
      setShowReports(false);
      setEnviarCarrinhoActive(false);
    }
  };

  const handleUpdatePrices = async () => {
    try {
      setIsUpdatingPrices(true);
      const activeItems = items.filter(item => item.hasProduct);
      
      if (activeItems.length === 0) {
        alert('Não há produtos selecionados para atualizar.');
        return false;
      }

      const updatedItems = await updatePrices(activeItems);
      setItems(prev => {
        const itemMap = new Map(updatedItems.map(item => [item.id, item]));
        return prev.map(item => itemMap.get(item.id) || item);
      });
      
      setEnviarCarrinhoActive(true);
      return true;
    } catch (error) {
      logger.error('Erro ao atualizar preços:', error);
      alert('Erro ao atualizar preços. Por favor, tente novamente.');
      return false;
    } finally {
      setIsUpdatingPrices(false);
    }
  };

  const handleSubmitCart = async () => {
    try {
      setIsSubmittingCart(true);

      if (!selectedCustomer) {
        alert('Por favor, selecione um cliente antes de enviar o carrinho.');
        return;
      }

      if (!selectedSeller) {
        alert('Por favor, selecione um vendedor antes de enviar o carrinho.');
        return;
      }

      const seller = SELLER_OPTIONS.find(s => s.value === selectedSeller);
      if (!seller) {
        alert('Vendedor selecionado é inválido.');
        return;
      }

      const [firstName = '', lastName = ''] = (selectedCustomer.name || '').split(' ');
      const webhookPayload = {
        customer: {
          email: selectedCustomer.email || '',
          firstName,
          lastName,
          address: {
            cep: selectedCustomer.zipCode || ''
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
          seller_name: seller.label,
          cart_type: 'new'
        },
        cart_total_input: total.toFixed(2),
        cart_total_input_with_freight: totalWithFreight.toFixed(2),
        freight_estimated_cost: freightCost,
        order_notes: notes,
        delivery_estimate_date: estimatedDate || null
      };

      console.log('[DEBUG] Payload enviado ao webhook:', webhookPayload);
      const response = await submitCart(webhookPayload);
      
      if (response.provider_shipping_cost) {
        setFreightCost(response.provider_shipping_cost.toFixed(2));
      }
      
      if (response.delivery_estimate_date) {
        setEstimatedDate(response.delivery_estimate_date.split('T')[0]);
      }
      
      updatePayload(response);
      alert('Carrinho enviado com sucesso!');

    } catch (error) {
      logger.error('Erro ao enviar carrinho:', error);
      alert('Erro ao enviar carrinho. Por favor, tente novamente.');
    } finally {
      setIsSubmittingCart(false);
      setEnviarCarrinhoActive(false);
    }
  };

  const renderHeader = () => (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Orçamento de Persianas</h1>
      <p className="text-gray-600 mb-6">Configure suas persianas preenchendo os dados abaixo</p>
    </>
  );

  const renderTopActions = () => (
    <div className="flex justify-between mb-8">
      <div className="flex-1 mr-4">
        <CustomerInfo 
          customer={selectedCustomer}
          onEditClick={() => setShowCustomerModal(true)}
        />
      </div>

      <div className="relative">
        <Dropdown
          value={selectedSeller}
          onChange={setSelectedSeller}
          options={SELLER_OPTIONS}
          placeholder="Selecione um vendedor"
          width="w-64"
        />
      </div>
    </div>
  );

  const renderTableHeader = () => (
    <div className="grid grid-cols-[40%,8.57%,8.57%,8.57%,8.57%,8.57%,8.57%,8.57%] gap-4 p-4 border-b text-sm font-medium text-gray-700">
      <div>Nome da Persiana</div>
      <div>Largura</div>
      <div>Altura</div>
      <div>Cordinha</div>
      <div>Preço Unit.</div>
      <div className="text-center">Qtd</div>
      <div>Subtotal</div>
      <div className="text-center"></div>
    </div>
  );

  const renderNotes = () => (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowNotesModal(true)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <Pencil size={18} />
          Notas do pedido:
        </button>
        <span className={`${notes ? 'text-gray-900' : 'text-gray-400 italic'}`}>
          {notes || 'Nenhuma nota adicionada'}
        </span>
      </div>
      <div className="text-right">
        <div className="flex items-center justify-end gap-4 mb-2">
          <button
            onClick={() => setShowFreightModal(true)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <Truck size={18} />
            Frete aproximado:
          </button>
          <span className={`${freightCost !== '0.00' ? 'text-gray-900' : 'text-gray-400'}`}>
            R$ {freightCost}
          </span>
        </div>
        <p className="text-2xl font-bold mb-2">TOTAL: R$ {totalWithFreight.toFixed(2)}</p>
        <div className="flex items-center justify-end gap-4">
          <button
            onClick={() => setShowEstimatedDateModal(true)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <Calendar size={18} />
            Data estimada:
          </button>
          <span className={`${estimatedDate ? 'text-gray-900' : 'text-gray-400'}`}>
            {estimatedDate ? new Date(estimatedDate).toLocaleDateString('pt-BR') : '—'}
          </span>
        </div>
      </div>
    </div>
  );

  const renderBottomActions = () => (
    <div className="flex justify-between">
      <div className="flex gap-4">
        <button
          onClick={handleAddBlind}
          className="flex items-center gap-2 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50"
        >
          <Plus size={20} />
          Adicionar Persiana
        </button>
        <button
          onClick={() => setShowReports(!showReports)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-600 text-gray-600 rounded-lg hover:bg-gray-50"
        >
          <FileText size={20} />
          {showReports ? 'Ocultar Relatório' : 'Exibir Relatório'}
        </button>
      </div>
      <div className="flex gap-4">
        <button 
          className={`flex items-center gap-2 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 ${
            isUpdatingPrices ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={handleUpdatePrices}
          disabled={isUpdatingPrices || isSubmittingCart}
        >
          <RotateCcw size={20} className={isUpdatingPrices ? 'animate-spin' : ''} />
          {isUpdatingPrices ? 'Atualizando...' : 'Atualizar Preços'}
        </button>
        <button 
          className={`flex items-center gap-2 px-4 py-2 ${
            enviarCarrinhoActive 
              ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          } rounded-lg transition-colors ${
            isSubmittingCart ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={handleSubmitCart}
          disabled={!enviarCarrinhoActive || isSubmittingCart}
        >
          <ShoppingCart size={20} className={isSubmittingCart ? 'animate-spin' : ''} />
          {isSubmittingCart ? 'Enviando...' : 'Enviar ao Carrinho'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {renderHeader()}
        {renderTopActions()}
        
        <div className="bg-white rounded-lg shadow mb-6">
          {renderTableHeader()}
          {items.map((item) => (
            <BlindItem 
              key={item.id}
              item={item}
              onUpdate={handleUpdateBlind}
              onDelete={handleDeleteBlind}
            />
          ))}
        </div>

        {renderNotes()}
        {renderBottomActions()}

        {showReports && (
          <ReportsSection
            items={items}
            total={total}
            freightCost={freightCost}
            totalWithFreight={totalWithFreight}
            selectedCustomer={selectedCustomer}
            selectedSeller={selectedSeller}
            sellerOptions={SELLER_OPTIONS}
            notes={notes}
            shopifyProducts={shopifyProducts}
            lastWebhookPayload={lastPayload}
          />
        )}
      </div>

      <CustomerModal 
        show={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSave={(customer) => {
          setSelectedCustomer(customer);
          setShowCustomerModal(false);
        }}
      />

      <NotesModal
        show={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        onSave={setNotes}
        initialNotes={notes}
      />

      <FreightModal
        show={showFreightModal}
        onClose={() => setShowFreightModal(false)}
        onSave={setFreightCost}
        initialValue={freightCost}
      />

      <EstimatedDateModal
        show={showEstimatedDateModal}
        onClose={() => setShowEstimatedDateModal(false)}
        onSave={setEstimatedDate}
        initialDate={estimatedDate}
      />
    </div>
  );
}

export default App;