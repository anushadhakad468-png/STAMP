// Envio HyperIndex GraphQL client
// Set NEXT_PUBLIC_ENVIO_URL in .env.local after deploying the indexer

const ENVIO_URL =
  process.env.NEXT_PUBLIC_ENVIO_URL || 'http://localhost:8080/v1/graphql';

export interface StampRecord {
  id: string;
  stampId: string;
  contentHash: string;
  model: string;
  agent: string;
  creator: string;
  kind: 'ATTESTED' | 'CLAIMED';
  timestamp: number;
  band0: string;
  band1: string;
  band2: string;
  band3: string;
  txHash: string;
  blockNumber: number;
}

async function gql<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const res = await fetch(ENVIO_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Envio HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message ?? 'GraphQL error');
  return json.data as T;
}

// ── Exact stampId match (Tier A — from watermark decode) ─────────────────────
export async function lookupByStampId(
  stampId: string,
): Promise<StampRecord | null> {
  const data = await gql<{ ProvenanceRegistry_Stamped: StampRecord[] }>(`
    query LookupById($id: String!) {
      ProvenanceRegistry_Stamped(
        where: { stampId: { _eq: $id } }
        limit: 1
      ) {
        id stampId contentHash model agent creator kind timestamp
        band0 band1 band2 band3 txHash blockNumber
      }
    }
  `, { id: stampId });
  return data.ProvenanceRegistry_Stamped[0] ?? null;
}

// ── pHash band lookup (Tier B — any matching band = candidate) ────────────────
export async function lookupByBands(
  bands: string[],
): Promise<StampRecord[]> {
  const [b0, b1, b2, b3] = bands;
  const data = await gql<{ ProvenanceRegistry_Stamped: StampRecord[] }>(`
    query LookupByBands($b0: String!, $b1: String!, $b2: String!, $b3: String!) {
      ProvenanceRegistry_Stamped(
        where: {
          _or: [
            { band0: { _eq: $b0 } }
            { band1: { _eq: $b1 } }
            { band2: { _eq: $b2 } }
            { band3: { _eq: $b3 } }
          ]
        }
        limit: 20
        order_by: { timestamp: desc }
      ) {
        id stampId contentHash model agent creator kind timestamp
        band0 band1 band2 band3 txHash blockNumber
      }
    }
  `, { b0, b1, b2, b3 });
  return data.ProvenanceRegistry_Stamped;
}

// ── All stamps by a creator (dashboard) ──────────────────────────────────────
export async function getStampsByCreator(
  creator: string,
): Promise<StampRecord[]> {
  const data = await gql<{ ProvenanceRegistry_Stamped: StampRecord[] }>(`
    query ByCreator($creator: String!) {
      ProvenanceRegistry_Stamped(
        where: { creator: { _ilike: $creator } }
        order_by: { timestamp: desc }
        limit: 50
      ) {
        id stampId contentHash model agent creator kind timestamp
        band0 band1 band2 band3 txHash blockNumber
      }
    }
  `, { creator });
  return data.ProvenanceRegistry_Stamped;
}

// ── Recent stamps feed (homepage) ─────────────────────────────────────────────
export async function getRecentStamps(limit = 12): Promise<StampRecord[]> {
  const data = await gql<{ ProvenanceRegistry_Stamped: StampRecord[] }>(`
    query Recent($limit: Int!) {
      ProvenanceRegistry_Stamped(
        order_by: { timestamp: desc }
        limit: $limit
      ) {
        id stampId contentHash model agent creator kind timestamp
        band0 band1 band2 band3 txHash blockNumber
      }
    }
  `, { limit });
  return data.ProvenanceRegistry_Stamped;
}
