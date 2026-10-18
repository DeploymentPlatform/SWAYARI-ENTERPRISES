import { OrderSubmissionPayload } from './types.js';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateOrderSubmission(payload: unknown): { isValid: boolean; errors: ValidationError[]; data?: OrderSubmissionPayload } {
  const errors: ValidationError[] = [];
  if (!payload || typeof payload !== 'object') {
    return { isValid: false, errors: [{ field: 'root', message: 'Invalid payload structure' }] };
  }

  const p = payload as Record<string, any>;

  if (!p.idempotencyKey || typeof p.idempotencyKey !== 'string' || p.idempotencyKey.trim().length < 8) {
    errors.push({ field: 'idempotencyKey', message: 'Valid idempotency token is required' });
  }

  if (!p.customerName || typeof p.customerName !== 'string' || p.customerName.trim().length < 2) {
    errors.push({ field: 'customerName', message: 'Please enter your full name' });
  }

  const phoneDigits = String(p.customerPhone || '').replace(/\D/g, '');
  if (!phoneDigits || phoneDigits.length < 10) {
    errors.push({ field: 'customerPhone', message: 'Please enter a valid 10-digit mobile number' });
  }

  if (!p.deliveryAddress || typeof p.deliveryAddress !== 'string' || p.deliveryAddress.trim().length < 5) {
    errors.push({ field: 'deliveryAddress', message: 'Please enter a street or building address' });
  }

  if (!p.deliveryCity || typeof p.deliveryCity !== 'string' || p.deliveryCity.trim().length < 2) {
    errors.push({ field: 'deliveryCity', message: 'City is required' });
  }

  if (!p.deliveryState || typeof p.deliveryState !== 'string' || p.deliveryState.trim().length < 2) {
    errors.push({ field: 'deliveryState', message: 'State is required' });
  }

  const pincodeDigits = String(p.deliveryPincode || '').replace(/\D/g, '');
  if (!pincodeDigits || pincodeDigits.length !== 6) {
    errors.push({ field: 'deliveryPincode', message: 'Please enter a 6-digit Indian PIN code' });
  }

  if (!Array.isArray(p.items) || p.items.length === 0) {
    errors.push({ field: 'items', message: 'Cart must contain at least one product' });
  } else {
    p.items.forEach((item, index) => {
      if (!item.productId || typeof item.productId !== 'string') {
        errors.push({ field: `items[${index}].productId`, message: 'Invalid product ID' });
      }
      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty < 1) {
        errors.push({ field: `items[${index}].quantity`, message: 'Quantity must be at least 1' });
      }
    });
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    data: {
      idempotencyKey: String(p.idempotencyKey).trim(),
      customerName: String(p.customerName).trim(),
      customerPhone: phoneDigits.slice(-10),
      deliveryAddress: String(p.deliveryAddress).trim(),
      deliveryCity: String(p.deliveryCity).trim(),
      deliveryState: String(p.deliveryState).trim(),
      deliveryPincode: pincodeDigits,
      customerNotes: p.customerNotes ? String(p.customerNotes).trim() : undefined,
      items: p.items.map((it: any) => ({
        productId: String(it.productId).trim(),
        productSku: it.productSku ? String(it.productSku).trim() : undefined,
        productName: it.productName ? String(it.productName).trim() : undefined,
        selectedVariant: it.selectedVariant ? String(it.selectedVariant).trim() : null,
        quantity: Math.max(1, parseInt(String(it.quantity), 10) || 1),
        customisationNote: it.customisationNote ? String(it.customisationNote).trim() : undefined
      }))
    }
  };
}
