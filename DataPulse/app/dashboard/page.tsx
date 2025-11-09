import React from 'react';
import { DataProvider } from '../../components/providers/DataProvider';
import DashboardClient from './DashboardClient';

export default function Page() {
  return (
    <DataProvider>
      <DashboardClient />
    </DataProvider>
  );
}
