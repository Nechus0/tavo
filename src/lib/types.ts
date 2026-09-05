export type Severity = 'safety' | 'conviction' | 'taste';
export type Visibility = 'named' | 'aggregated' | 'host_only';
export type Domain = 'diet' | 'accommodation' | 'cohabitation' | 'activity' | 'other';

export type Preference = {
  id: string; user_id: string; domain: Domain; label: string;
  severity: Severity; contact_sensitive: boolean; visibility: Visibility; note: string | null;
};
export type EventRow = {
  id: string; host_id: string; title: string; type: 'meal' | 'gathering' | 'trip';
  starts_at: string | null; location: string | null; invite_code: string;
};
export type Requirement = {
  domain: Domain; label: string; severity: Severity; people: number; names: string[];
};
export type Track = { id: string; event_id: string; name: string; description: string | null; sort_order: number };
