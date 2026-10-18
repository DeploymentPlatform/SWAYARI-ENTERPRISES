import { generateCryptoId } from './auth.js';

export async function logAudit(
  env: Record<string, any>,
  entityType: string,
  entityId: string,
  action: string,
  performedBy: string,
  details: unknown = null
): Promise<void> {
  try {
    const id = 'aud-' + generateCryptoId(16);
    const nowIso = new Date().toISOString();
    const detailsJson = details ? JSON.stringify(details) : null;
    await env.DB.prepare(`
      INSERT INTO audit_logs (id, entity_type, entity_id, action, performed_by, details_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(id, entityType, entityId, action, performedBy, detailsJson, nowIso).run();
  } catch (err: any) {
    console.error('Audit log failure:', err.message);
  }
}
