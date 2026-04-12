import React, { useState, useRef, useContext } from 'react';
import { Save, Building, CheckCircle } from 'lucide-react';
import { useBillingConfig } from '../../layouts/billing/BillingConfigContext';
import OptimizedInput from './OptimizedInput';

/**
 * Formulario de Datos de la Empresa
 * Optimizado con principios GOMS-KLM:
 * - Auto-focus en primer campo (Reduce P operator)
 * - Navegación con Enter (Reduce P y H operators)
 * - Formato automático para RIF (Reduce K operators)
 */
const CompanyForm = () => {
  const { companyData, updateCompanyData } = useBillingConfig();
  const [saved, setSaved] = useState(false);
  const inputRefs = useRef([]);

  const cardStyle = {
    backgroundColor: 'var(--color-bg-light)',
    borderColor: 'var(--color-accent-light)',
    color: 'var(--color-text-light)'
  };

  const iconBadgeStyle = {
    backgroundColor: 'var(--color-secondary-light)',
    color: 'var(--color-text-light)'
  };

  // Total de campos para navegación
  const totalFields = 3;

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Optimización: Formato automático para RIF (mayúsculas)
    const formattedValue = name === 'rif' ? value.toUpperCase() : value;
    updateCompanyData({ [name]: formattedValue });
  };

  const handleKeyDown = (e, index) => {
    // Navegación con Enter entre campos (Reduce P operator - 1.1s)
    if (e.key === 'Enter' && index < totalFields - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
    // Guardar con Ctrl+Enter
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la llamada a tu API real
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="rounded-xl shadow-lg p-6 border hover:shadow-xl transition-shadow duration-300" style={cardStyle}>
      {/* Header del Formulario */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: 'var(--color-accent-light)' }}>
        <div className="p-2.5 rounded-lg" style={iconBadgeStyle}>
          <Building size={22} />
        </div>
        <div>
          <h2 className="subtitle font-bold">
            Datos de la Empresa
          </h2>
          <p className="paragraph text-xs opacity-70">Encabezado de factura</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo 1: Nombre Comercial */}
        <OptimizedInput
          label="Nombre Comercial"
          name="name"
          value={companyData.name}
          onChange={handleChange}
          onKeyDown={(e) => handleKeyDown(e, 0)}
          inputRef={(el) => (inputRefs.current[0] = el)}
          placeholder="Ej. FREEDOM"
          required
          icon={Building}
        />

        {/* Campo 2: RIF */}
        <OptimizedInput
          label="RIF"
          name="rif"
          value={companyData.rif}
          onChange={handleChange}
          onKeyDown={(e) => handleKeyDown(e, 1)}
          inputRef={(el) => (inputRefs.current[1] = el)}
          placeholder="J-12345678-9"
          required
          maxLength={12}
          helpText="Formato: J-12345678-9"
        />

        {/* Campo 3: Dirección Fiscal */}
        <div className="space-y-1">
          <label 
            htmlFor="address"
            className="paragraph flex items-center gap-2 text-sm font-semibold"
          >
            <Building size={14} className="opacity-70" />
            Dirección Fiscal <span style={{ color: 'var(--color-accent-light)' }}>*</span>
          </label>
          <textarea
            id="address"
            ref={(el) => (inputRefs.current[2] = el)}
            name="address"
            value={companyData.address}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            rows={2}
            className="paragraph w-full px-3 py-2.5 border rounded-lg focus:ring-2 transition-all outline-none text-sm resize-none"
            style={{
              borderColor: 'var(--color-accent-light)',
              backgroundColor: 'var(--color-bg-light)',
              color: 'var(--color-text-light)'
            }}
            placeholder="Dirección completa..."
            required
          />
          <p className="paragraph text-xs opacity-70">Ctrl+Enter para guardar</p>
        </div>

        {/* Botón de Guardar */}
        <button
          type="submit"
          className="paragraph w-full flex items-center justify-center gap-2 font-semibold py-2.5 rounded-lg transition-all hover:shadow-md"
          style={{
            backgroundColor: saved ? 'var(--color-secondary-light)' : 'var(--color-accent-light)',
            color: 'var(--color-text-light)'
          }}
        >
          {saved ? <CheckCircle size={18} /> : <Save size={18} />}
          {saved ? '✓ Guardado' : 'Guardar (Enter)'}
        </button>
      </form>
    </div>
  );
};

export default CompanyForm;