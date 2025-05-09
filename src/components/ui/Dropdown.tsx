import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

// [Refactored] Constants extracted for Dropdown component
const DEFAULT_PLACEHOLDER = 'Selecione...'; // default placeholder text
const DEFAULT_WIDTH_CLASS = 'w-full'; // default width class
const DROPDOWN_TOGGLE_CLASSES = 'block px-3 py-2 bg-white rounded-lg min-h-[40px] min-w-[90px] text-gray-900 cursor-pointer outline-none whitespace-nowrap'; // toggle button classes
const DROPDOWN_MENU_BASE_CLASSES = 'absolute z-10 min-w-[100px] w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-y-auto'; // menu base classes
const DROPDOWN_MENU_MAX_HEIGHT_CLASS = 'max-h-[560px]'; // show up to 14 items
const MENU_MAX_HEIGHT_PX = 560; // [Refactored] menu max height in px

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  className?: string;
  showSearch?: boolean;
  width?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = DEFAULT_PLACEHOLDER, // [Refactored]
  className = '',
  showSearch = false,
  width = DEFAULT_WIDTH_CLASS // [Refactored]
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [menuPosition, setMenuPosition] = useState<'down' | 'up'>('down');

  useEffect(() => {
    if (!isOpen || !dropdownRef.current) return;
    const rect = dropdownRef.current.getBoundingClientRect();
    const menuHeight = MENU_MAX_HEIGHT_PX; // [Refactored]
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
      setMenuPosition('up');
    } else {
      setMenuPosition('down');
    }
    // Foca no campo de busca ao abrir
    if (isOpen && showSearch && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  }, [isOpen, showSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(option => option.value === value);

  return (
    <div ref={dropdownRef} className={`relative ${width} ${className}`}>
      {isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className={`flex items-center justify-between w-full px-3 py-2 text-left bg-white rounded-lg border-2 border-indigo-500`}
        >
          <span className={`block truncate ${!selectedOption ? 'text-gray-500' : 'text-gray-900'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            size={20}
            className={`transition-transform duration-200 transform rotate-180 text-indigo-500`}
          />
        </button>
      ) : (
        <span
          tabIndex={0}
          onClick={() => setIsOpen(true)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setIsOpen(true); }}
          className={DROPDOWN_TOGGLE_CLASSES} // [Refactored]
          style={{border: 'none', boxShadow: 'none'}}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
      )}

      {isOpen && (
        <div
          className={`${DROPDOWN_MENU_BASE_CLASSES} ${DROPDOWN_MENU_MAX_HEIGHT_CLASS}`} // [Refactored]
          style={menuPosition === 'up' ? { bottom: '100%', marginBottom: 8 } : { top: '100%', marginTop: 8 }}
        >
          {showSearch && (
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          )}
          <div className="max-h-60 overflow-auto">
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 rounded-lg flex items-center whitespace-nowrap ${
                  option.value === value ? 'bg-indigo-50 text-indigo-600' : 'text-gray-900'
                }`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
              >
                <span className="whitespace-nowrap">{option.label}</span>
                {option.value === value && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                    ●
                  </span>
                )}
              </div>
            ))}
            {filteredOptions.length === 0 && (
              <div className="px-3 py-2 text-gray-500 text-center">Nenhum resultado encontrado</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;