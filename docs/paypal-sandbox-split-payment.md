# Integracion de PayPal Sandbox con pagos divididos (Split Payment)

Este proyecto usa una pasarela real de PayPal en modo desarrollo (Sandbox) para permitir una compra con multiples transacciones.

## 1. Que se implemento

Archivo principal de integracion:
- src/components/payments/PayPalSplitCheckout.jsx

Uso en facturacion:
- src/layouts/user/billingPage.jsx

Libreria usada:
- @paypal/react-paypal-js

## 2. Flujo funcional

1. El usuario llega a facturacion con su carrito.
2. Se calcula el total final (subtotal - descuento + IVA).
3. En el bloque "PayPal Sandbox Split Payment" el usuario crea 2 o mas transacciones.
4. Para cada transaccion define un monto en USD.
5. Cada transaccion se paga con un boton real de PayPal Sandbox (createOrder + capture).
6. La compra solo se puede confirmar si:
- hay al menos 2 transacciones pagadas,
- la suma de transacciones coincide con el total.

## 3. Configuracion recomendada

Puedes usar client id rapido de pruebas (sb), pero para aprender el flujo real usa tu app Sandbox propia:

1. Ir a https://developer.paypal.com/
2. Crear una app en Sandbox.
3. Copiar el Client ID.
4. Crear archivo .env con:

```env
VITE_PAYPAL_CLIENT_ID=TU_CLIENT_ID_SANDBOX
```

5. Reiniciar el frontend (`npm run dev`).

## 4. Estructura tecnica

### A. Carga del SDK

Se usa `PayPalScriptProvider` con opciones:
- client-id
- currency=USD
- intent=capture
- components=buttons

### B. Creacion de orden

Por cada fila de pago:
- `createOrder` crea una orden con el monto exacto de esa fila.
- `onApprove` ejecuta `actions.order.capture()` y marca la fila como pagada.

### C. Validaciones de negocio

Antes de confirmar la compra:
- minimo 2 transacciones pagadas,
- total pagado == total factura (tolerancia de centavos).

## 5. Por que esto si es "pasarela real"

Aunque el entorno es Sandbox, los eventos de pago son reales de PayPal:
- creacion de orden,
- aprobacion del comprador,
- captura de pago,
- ids de captura y datos del payer.

La unica diferencia es que usa cuentas de prueba sin mover dinero real.

## 6. Recomendaciones para produccion

1. Mover createOrder/capture al backend.
2. Verificar montos en servidor, nunca confiar solo en frontend.
3. Guardar transacciones y estados de orden en DB.
4. Firmar webhooks de PayPal para reconciliacion.
5. Idempotencia para evitar doble cobro en reintentos.

## 7. Escalar a multiples pasarelas

Si luego quieres combinar PayPal + Stripe:
1. Define una interfaz de pago comun (createIntent, confirm, capture).
2. Implementa un adaptador por gateway.
3. Mantiene la misma logica de split payment, cambiando el proveedor por fila.

