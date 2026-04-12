import React, { useContext } from 'react';
import { CheckCircle } from 'lucide-react';
import { useBillingConfig } from './BillingConfigContext';
import CompanyForm from '../../components/billing/CompanyForm';
import PrintingForm from '../../components/billing/PrintingForm';

/**
 * Página Principal de Configuración de Facturación
 * Contiene ambos formularios y vista previa de datos
 */
const BillingConfigPage = () => {
  const { companyData, printingData } = useBillingConfig();

  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{
        background: 'var(--color-bg-light)',
        color: 'var(--color-text-light)'
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="title font-extrabold">
            Configuración de Facturación
          </h1>
          <p className="paragraph mt-2 text-sm max-w-xl mx-auto opacity-80">
            Complete los datos una vez. Se usarán automáticamente en todas las facturas.
          </p>
        </div>

        {/* Formularios */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CompanyForm />
          <PrintingForm />
        </div>

        {/* Vista Previa de Datos */}
        <div
          className="mt-8 rounded-xl shadow p-5 border-l-4"
          style={{
            backgroundColor: 'var(--color-bg-light)',
            borderLeftColor: 'var(--color-accent-light)',
            borderColor: 'var(--color-accent-light)'
          }}
        >
          <h3 className="subtitle font-bold mb-3 flex items-center gap-2">
            <CheckCircle size={18} style={{ color: 'var(--color-accent-light)' }} />
            Datos Listos para Facturación
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: 'var(--color-primary-light)' }}
            >
              <p className="paragraph font-semibold mb-1">Empresa:</p>
              <p className="paragraph">{companyData.name}</p>
              <p className="paragraph">RIF: {companyData.rif}</p>
            </div>
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: 'var(--color-primary-light)' }}
            >
              <p className="paragraph font-semibold mb-1">Imprenta:</p>
              <p className="paragraph">{printingData.printerName}</p>
              <p className="paragraph">
                Rango: {printingData.rangeStart} - {printingData.rangeEnd}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingConfigPage;