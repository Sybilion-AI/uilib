/**
 * Sort items by updated_at (newest first), return up to N latest.
 * Falls back to original order when updated_at is missing.
 */
export declare const getLatestByUpdatedAt: <T extends {
    updated_at?: string;
}>(items: T[], count: number) => T[];
