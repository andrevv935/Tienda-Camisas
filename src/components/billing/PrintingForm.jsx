import React, { useState, useRef } from 'react';
import { Save, Printer, Building, CheckCircle, Copy, Calendar } from 'lucide-react';
import { useBillingConfig } from '../../layouts/billing/BillingConfigContext';
import OptimizedInput from './OptimizedInput';

/**
 * Formulario de Datos de Imprenta
 * Optimizado con principios GOMS-KLM:
 * - Botón copiar RIF (Reduce K operators)
 * - Botón "Hoy" para fecha (Evita Date-Picker: 6.81s → 0.1s)
 * - Formato numérico automático para rangos
 */
const PrintingForm = () => {
  const { companyData, printingData, updatePrintingData } = useBillingConfig();
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

  const totalFields = 7;

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Optimización: Formato automático para RIF (mayúsculas)
    if (name === 'printerRif') {
      formattedValue = value.toUpperCase();
    }

    // Optimización: Formato numérico para rangos (Reduce K operators)
    if (name === 'rangeStart' || name === 'rangeEnd') {
      formattedValue = value.replace(/[^0-9]/g, '').slice(0, 7);
    }

    updatePrintingData({ [name]: formattedValue });
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter' && index < totalFields - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Optimización: Copiar RIF de empresa (Reduce K operators si son similares)
  const copyCompanyRif = () => {
    updatePrintingData({ printerRif: companyData.rif });
    inputRefs.current[1]?.focus();
  };

  // Optimización: Establecer fecha actual (Evita Date-Picker: 6.81s)
  const setTodayDate = () => {
    updatePrintingData({ elaborationDate: new Date().toISOString().split('T')[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="rounded-xl shadow-lg p-6 border hover:shadow-xl transition-shadow duration-300" style={cardStyle}>
      {/* Header del Formulario */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: 'var(--color-accent-light)' }}>
        <div className="p-2.5 rounded-lg" style={iconBadgeStyle}>
          <Printer size={22} />
        </div>
        <div>
          <h2 className="subtitle font-bold">
            Datos de Imprenta
          </h2>
          <p className="paragraph text-xs opacity-70">Pie de página SENIAT</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Fila 1: Nombre y RIF Imprenta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
          <OptimizedInput
            label="Nombre Imprenta"
            name="printerName"
            value={printingData.printerName}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, 0)}
            inputRef={(el) => (inputRefs.current[0] = el)}
            required
            icon={Printer}
          />

          <div className="space-y-1 min-w-0">
            <label 
              htmlFor="printerRif"
              className="paragraph flex items-center gap-2 text-sm font-semibold"
            >
              <Building size={14} className="opacity-70" />
              RIF Imprenta <span style={{ color: 'var(--color-accent-light)' }}>*</span>
            </label>
            <div className="flex w-full min-w-0 items-stretch gap-2">
              <input
                id="printerRif"
                ref={(el) => (inputRefs.current[1] = el)}
                type="text"
                name="printerRif"
                value={printingData.printerRif}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, 1)}
                className="paragraph flex-1 min-w-0 px-3 py-2.5 border rounded-lg focus:ring-2 transition-all outline-none text-sm uppercase"
                style={{
                  borderColor: 'var(--color-accent-light)',
                  backgroundColor: 'var(--color-bg-light)',
                  color: 'var(--color-text-light)'
                }}
                placeholder="J-00000000-0"
                required
              />
              <button
                type="button"
                onClick={copyCompanyRif}
                className="shrink-0 px-3 py-2.5 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-text-light)'
                }}
                title="Copiar RIF de empresa"
              >
                <Copy size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Fila 2: Providencia SENIAT */}
        <OptimizedInput
          label="Providencia SENIAT"
          name="seniatAuth"
          value={printingData.seniatAuth}
          onChange={handleChange}
          onKeyDown={(e) => handleKeyDown(e, 2)}
          inputRef={(el) => (inputRefs.current[2] = el)}
          placeholder="SNAT/2026/0000"
          required
          icon={Building}
        />

        {/* Fila 3: Rangos de Control */}
        <div className="grid grid-cols-2 gap-4">
          <OptimizedInput
            label="Desde"
            name="rangeStart"
            value={printingData.rangeStart}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, 3)}
            inputRef={(el) => (inputRefs.current[3] = el)}
            placeholder="0000001"
            required
            maxLength={7}
            helpText="7 dígitos"
          />
          <OptimizedInput
            label="Hasta"
            name="rangeEnd"
            value={printingData.rangeEnd}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, 4)}
            inputRef={(el) => (inputRefs.current[4] = el)}
            placeholder="0005000"
            required
            maxLength={7}
            helpText="7 dígitos"
          />
        </div>

        {/* Fila 4: Fecha de Elaboración */}
        <div className="space-y-1">
          <label 
            htmlFor="elaborationDate"
            className="paragraph flex items-center gap-2 text-sm font-semibold"
          >
            <Calendar size={14} className="opacity-70" />
            Fecha Elaboración <span style={{ color: 'var(--color-accent-light)' }}>*</span>
          </label>
          <div className="flex gap-2">
            <input
              id="elaborationDate"
              ref={(el) => (inputRefs.current[5] = el)}
              type="date"
              name="elaborationDate"
              value={printingData.elaborationDate}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, 5)}
              className="paragraph flex-1 px-3 py-2.5 border rounded-lg focus:ring-2 transition-all outline-none text-sm"
              style={{
                borderColor: 'var(--color-accent-light)',
                backgroundColor: 'var(--color-bg-light)',
                color: 'var(--color-text-light)'
              }}
              required
            />
            <button
              type="button"
              onClick={setTodayDate}
              className="paragraph px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
              style={{
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-text-light)'
              }}
            >
              Hoy
            </button>
          </div>
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

export default PrintingForm;