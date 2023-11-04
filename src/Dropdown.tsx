import React, {FC} from 'react';

interface DropdownProps {
    options: string[];
    onSelect: (selectedOption: string) => void;
}

const Dropdown: FC<DropdownProps> = ({options, onSelect}) => {
    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onSelect(e.target.value);
    };

    return (
        <select
            onChange={handleSelect}
            style={{
                height: '25px',
                width: '80px',
                alignSelf: 'center',
                right: '0',
                position: 'absolute',
                borderRadius: '5px',
                border: 'none',
                fontSize: '11px'
            }}
        >
            {options.map((option, index) =>
                <option key={index} value={option} >{option}</option>
            )}
        </select>
    );
};

export default Dropdown;