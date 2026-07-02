'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type DataSource = 'live' | 'demo';

interface DataSourceContextType {
  source: DataSource;
  toggleSource: () => void;
  setSource: (source: DataSource) => void;
}

const DataSourceContext = createContext<DataSourceContextType>({
  source: 'demo',
  toggleSource: () => {},
  setSource: () => {},
});

export function DataSourceProvider({ children }: { children: ReactNode }) {
  const [source, setSource] = useState<DataSource>('demo');

  const toggleSource = useCallback(() => {
    setSource(prev => prev === 'demo' ? 'live' : 'demo');
  }, []);

  return (
    <DataSourceContext.Provider value={{ source, toggleSource, setSource }}>
      {children}
    </DataSourceContext.Provider>
  );
}

export function useDataSource() {
  return useContext(DataSourceContext);
}