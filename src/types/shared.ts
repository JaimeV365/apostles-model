export interface InputFieldProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    type?: 'text' | 'number' | 'email' | 'date';  // Added email and date
    min?: string;
    max?: string;
    label?: string;
    dropdownOptions?: string[];
    onDropdownSelect?: (value: string) => void;
    forceCloseDropdown?: boolean;
  }