// Marca que llevan TODAS las sesiones de pago creadas por RutaVan (metadata.app).
//
// La cuenta de Stripe se comparte con otras aplicaciones (p. ej. Academia Creativa) y Stripe envía cada
// pago a TODOS los webhooks de la cuenta. Sin esta marca, el webhook de RutaVan trataría pagos ajenos
// como suyos y enviaría un recibo de RutaVan a clientes de otra aplicación.
export const STRIPE_APP_ID = "rutavan";
