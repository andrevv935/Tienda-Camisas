import React, { createContext, useState, useContext } from 'react';

const BillingConfigContext = createContext();

export const useBillingConfig = () => {
  const context = useContext(BillingConfigContext);
  if (!context) {
    throw new Error('useBillingConfig debe usarse dentro de BillingConfigProvider');
  }
  return context;
};

export const BillingConfigProvider = ({ children }) => {
  // Datos de la Empresa (Encabezado de factura)
  const [companyData, setCompanyData] = useState({
    name: 'FREEDOM',
    rif: 'J-12345678-9',
    address: 'Direccion fiscal no especificada',
  });

  // Datos de Imprenta (Pie de página SENIAT)
  const [printingData, setPrintingData] = useState({
    printerName: 'Imprenta Fiscal XYZ, C.A.',
    printerRif: 'J-00000000-0',
    seniatAuth: 'SNAT/2026/0000',
    rangeStart: '0000001',
    rangeEnd: '0005000',
    elaborationDate: new Date().toISOString().split('T')[0],
  });

  const updateCompanyData = (data) => 
    setCompanyData(prev => ({ ...prev, ...data }));

  const updatePrintingData = (data) => 
    setPrintingData(prev => ({ ...prev, ...data }));

  const value = {
    companyData,
    printingData,
    updateCompanyData,
    updatePrintingData,
  };

  return (
    <BillingConfigContext.Provider value={value}>
      {children}
    </BillingConfigContext.Provider>
  );
};

export default BillingConfigContext;