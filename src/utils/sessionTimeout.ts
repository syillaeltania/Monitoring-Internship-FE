export type SessionExpiryReason = 'idle' | 'max' | 'missing';

export interface SessionMetadata {
  startedAt: number;
  lastActivityAt: number;
}

export const IDLE_SESSION_TIMEOUT_MS = 60 * 60 * 1000;
export const MAX_SESSION_TIMEOUT_MS = 8 * 60 * 60 * 1000;
export const SESSION_METADATA_KEY = 'monitoring-internship-session';

export const createSessionMetadata = (now = Date.now()): SessionMetadata => ({
  startedAt: now,
  lastActivityAt: now,
});

export const touchSessionMetadata = (metadata: SessionMetadata, now = Date.now()): SessionMetadata => ({
  ...metadata,
  lastActivityAt: now,
});

const isValidTimestamp = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0;

export const getSessionExpiryReason = (metadata: SessionMetadata | null, now = Date.now()): SessionExpiryReason | null => {
  if (!metadata || !isValidTimestamp(metadata.startedAt) || !isValidTimestamp(metadata.lastActivityAt)) return 'missing';
  if (now - metadata.startedAt >= MAX_SESSION_TIMEOUT_MS) return 'max';
  if (now - metadata.lastActivityAt >= IDLE_SESSION_TIMEOUT_MS) return 'idle';
  return null;
};

export const parseSessionMetadata = (value: string | null): SessionMetadata | null => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<SessionMetadata>;
    const { startedAt, lastActivityAt } = parsed;
    if (!isValidTimestamp(startedAt) || !isValidTimestamp(lastActivityAt)) return null;
    return {
      startedAt,
      lastActivityAt,
    };
  } catch {
    return null;
  }
};

export const stringifySessionMetadata = (metadata: SessionMetadata) => JSON.stringify(metadata);
