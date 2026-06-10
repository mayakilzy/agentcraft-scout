/**
 * AgentCraft Scout — API Layer
 * كل calls للـ Backend في مكان واحد
 * BASE_URL قابل للتغيير عبر .env
 */

const BASE_URL = import.meta.env.VITE_SCOUT_API_URL || 'https://api.agentcraft.info';

// ─── Types ────────────────────────────────────────────────

export interface Stats {
  total_companies:   number;
  active_campaigns:  number;
  have_website:      number;
  scheduled_jobs:    number;
  avg_quality_score: number;
}

export interface Campaign {
  id:          number;
  name:        string;
  arm:         string;
  province:    string;
  category:    string;
  status:      string;
  total_found: number;
  avg_score:   number;
  created_at:  string;
}

export interface Company {
  id:             number;
  campaign_id:    number | null;
  name:           string;
  province:       string;
  city:           string;
  category:       string;
  address:        string;
  phone:          string | null;
  website:        string | null;
  email:          string | null;
  rating:         number;
  reviews_count:  number;
  quality_score:  number;
  priority_score: number;
  has_website:    boolean;
  has_phone:      boolean;
  has_email:      boolean;
  is_osb_zone:    boolean;
  contact_status: string;
  arm:            string;
  created_at:     string;
}

export interface ScoutSearchParams {
  province:      string;
  category:      string;
  keywords?:     string;
  language?:     string;
  limit?:        number;
  depth?:        string;
  campaign_name?: string;
  arm?:          string;
}

export interface StreamEvent {
  type:    'start' | 'company' | 'done' | 'error';
  data?:   Company;
  stats?:  { found: number; with_website: number; high_quality: number };
  campaign_id?: number;
  total?:  number;
  with_website?: number;
  high_quality?: number;
  message?: string;
  query?:  string;
}

// ─── API Functions ────────────────────────────────────────

/**
 * جلب إحصائيات الـ Dashboard
 */
export async function fetchStats(): Promise<Stats> {
  const res = await fetch(`${BASE_URL}/scout/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

/**
 * جلب الحملات الأخيرة
 */
export async function fetchCampaigns(params?: {
  arm?: string; status?: string; page?: number; limit?: number;
}): Promise<{ total: number; campaigns: Campaign[] }> {
  const q = new URLSearchParams();
  if (params?.arm)    q.set('arm', params.arm);
  if (params?.status) q.set('status', params.status);
  if (params?.page)   q.set('page', String(params.page));
  if (params?.limit)  q.set('limit', String(params.limit));
  const res = await fetch(`${BASE_URL}/scout/campaigns?${q}`);
  if (!res.ok) throw new Error('Failed to fetch campaigns');
  return res.json();
}

/**
 * جلب الشركات مع فلاتر
 */
export async function fetchCompanies(params?: {
  campaign_id?: number; province?: string; category?: string;
  quality_min?: number; has_website?: boolean; has_phone?: boolean;
  has_email?: boolean; arm?: string; page?: number; limit?: number;
  sort_by?: string;
}): Promise<{ total: number; companies: Company[] }> {
  const q = new URLSearchParams();
  if (params?.campaign_id !== undefined) q.set('campaign_id', String(params.campaign_id));
  if (params?.province)    q.set('province', params.province);
  if (params?.category)    q.set('category', params.category);
  if (params?.quality_min !== undefined) q.set('quality_min', String(params.quality_min));
  if (params?.has_website !== undefined) q.set('has_website', String(params.has_website));
  if (params?.has_phone   !== undefined) q.set('has_phone', String(params.has_phone));
  if (params?.has_email   !== undefined) q.set('has_email', String(params.has_email));
  if (params?.arm)    q.set('arm', params.arm);
  if (params?.page)   q.set('page', String(params.page));
  if (params?.limit)  q.set('limit', String(params.limit));
  if (params?.sort_by) q.set('sort_by', params.sort_by);
  const res = await fetch(`${BASE_URL}/scout/companies?${q}`);
  if (!res.ok) throw new Error('Failed to fetch companies');
  return res.json();
}

/**
 * بدء مهمة كشط — يُعيد EventSource للـ streaming
 */
export function startScoutStream(
  params: ScoutSearchParams,
  onEvent: (event: StreamEvent) => void,
  onError?: (err: Error) => void
): () => void {
  let aborted = false;

  (async () => {
    try {
      const res = await fetch(`${BASE_URL}/scout/search`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(params),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Scout search failed: ${res.status}`);
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let   buffer  = '';

      while (!aborted) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event: StreamEvent = JSON.parse(line.slice(6));
              onEvent(event);
            } catch {
              // تجاهل سطر غير صالح
            }
          }
        }
      }
    } catch (err) {
      if (!aborted) {
        onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    }
  })();

  // إرجاع دالة إلغاء
  return () => { aborted = true; };
}

/**
 * جلب قائمة الأولويات (Analytics)
 */
export async function fetchPriorityList(limit = 50) {
  const res = await fetch(`${BASE_URL}/scout/analytics/priority?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch priority list');
  return res.json();
}

/**
 * جلب الإحصاءات التحليلية
 */
export async function fetchInsights() {
  const res = await fetch(`${BASE_URL}/scout/analytics/insights`);
  if (!res.ok) throw new Error('Failed to fetch insights');
  return res.json();
}

/**
 * جلب البقع البيضاء
 */
export async function fetchWhiteSpots() {
  const res = await fetch(`${BASE_URL}/scout/analytics/white-spots`);
  if (!res.ok) throw new Error('Failed to fetch white spots');
  return res.json();
}

/**
 * تحديث حالة شركة
 */
export async function updateCompanyStatus(id: number, status: string) {
  const res = await fetch(`${BASE_URL}/scout/companies/${id}/status`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

/**
 * حذف حملة
 */
export async function deleteCampaign(id: number) {
  const res = await fetch(`${BASE_URL}/scout/campaigns/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete campaign');
  return res.json();
}

/**
 * جلب الصفقات
 */
export async function fetchDeals() {
  const res = await fetch(`${BASE_URL}/scout/deals`);
  if (!res.ok) throw new Error('Failed to fetch deals');
  return res.json();
}

/**
 * تحديث صفقة
 */
export async function updateDeal(id: number, data: {
  stage?: string; value?: number; notes?: string; next_action?: string;
}) {
  const res = await fetch(`${BASE_URL}/scout/deals/${id}`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update deal');
  return res.json();
}

/**
 * جلب المهام المجدولة
 */
export async function fetchJobs() {
  const res = await fetch(`${BASE_URL}/scout/jobs`);
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
}

/**
 * فحص صحة الـ API
 */
export async function checkHealth() {
  const res = await fetch(`${BASE_URL}/scout/health`);
  if (!res.ok) throw new Error('API unhealthy');
  return res.json();
}

export async function fetchMarketIntelligence(params?: { category?: string; lang?: string }) {
  const q = new URLSearchParams();
  if (params?.category) q.set('category', params.category);
  if (params?.lang)     q.set('lang', params.lang);
  const res = await fetch(`${BASE_URL}/scout/analytics/market-intelligence?${q}`);
  if (!res.ok) throw new Error('Failed to fetch market intelligence');
  return res.json();
}

export async function fetchSeasonalIntelligence(lang = 'en') {
  const res = await fetch(`${BASE_URL}/scout/analytics/seasonal?lang=${lang}`);
  if (!res.ok) throw new Error('Failed to fetch seasonal intelligence');
  return res.json();
}

export async function generateOutreachMessage(params: { company_id: number; template: string; language: string }) {
  const res = await fetch(`${BASE_URL}/scout/outreach/generate`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to generate message');
  return res.json();
}

export async function sendOutreachEmail(params: { company_id: number; to_email: string; subject: string; message: string; template: string }) {
  const res = await fetch(`${BASE_URL}/scout/outreach/send`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to send email');
  return res.json();
}
