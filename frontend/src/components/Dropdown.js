import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

const Dropdown = ({ items, selectedItem, onSelect, onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);
  // const [selectedItem, setSelectedItem] = useState(null);

  const handleItemClick = (item) => {
    // setSelectedItem(item.name);
    onSelect(item);
    setIsOpen(false);
    if (onToggle) onToggle(false);
  };

  const handleToggle = (e) => {
    const open = e.target.open;
    setIsOpen(open);
    if (onToggle) onToggle(open);
  };

  return (
    <details
      className="dropdown w-full font-pretendard"
      onToggle={handleToggle}
      open={isOpen}
    >
      <summary className="btn m-1 w-full flex justify-between items-center">
        <span className="font-normal">{selectedItem?.name || '폴더 선택'}</span>
        {isOpen ? (
          <ChevronUpIcon className="w-4 h-4 ml-2" />
        ) : (
          <ChevronDownIcon className="w-4 h-4 ml-2" />
        )}
      </summary>
      <ul className="menu dropdown-content bg-base-100 rounded-box w-full p-2 shadow">
        <div className="max-h-[118px] overflow-y-auto flex flex-col">
          {items?.map((item) => (
            <li key={item?._id}>
              <button type="button" onClick={() => handleItemClick(item)}>
                {item?.name}
              </button>
            </li>
          ))}
        </div>
      </ul>
    </details>
  );
};

export default Dropdown;
