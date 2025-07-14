

import {useContext} from 'react';
import {DataContextProvider} from '@/app/context_providers/data_context/DataProvider';
import { PageOptions } from '@/lib/types/types_new';

const ButtonLink: React.FC<{
  local_href: PageOptions;
  children: React.ReactNode;
  className?: string;
}> = ({ local_href, children, className }) => {
  const context = useContext(DataContextProvider);
  if (!context) {
    throw new Error("DataContextProvider must be used within a DataContextProvider");
  }
  const { dispatch } = context;

  const buttonClasses = 'bg-primary-500 text-surface-50 w-full px-2 py-1 rounded hover:bg-primary-800 transition-all disabled:text-surface-50 disabled:bg-surface-950 dark:disabled:bg-surface-300 dark:disabled:text-surface-800';

  return (
    <button
      onClick={() => dispatch({ type: "SET_PAGE", payload: local_href })}
      className={`${buttonClasses} ${className}`}
    >
      {children}
    </button>
  );
};

export default ButtonLink;