'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { DataPoint } from '../../lib/types';

const DataContext = createContext<DataPoint[]>([]);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DataPoint[]>([]);

  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(js => {
      if (js?.data) setData(js.data);
    }).catch(err => {
      console.error('Failed to fetch initial data', err);
    });
  }, []);

  return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}
