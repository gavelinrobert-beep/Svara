import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Layout } from '../components/Layout';
import { StatusBadge } from '../components/StatusBadge';
import { formatDate } from '../lib/format';
import { LeadsResponse, LeadStatus } from '../lib/types';

const STATUSES: { value: string; label: string }[] = [
  { value: '', label: 'Alla' },
  { value: 'NY', label: 'Ny' },
  { value: 'PAGAENDE', label: 'Pågående' },
  { value: 'VUNNEN', label: 'Vunnen' },
  { value: 'FORLORAD', label: 'Förlorad' },
];

export function DashboardPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<LeadsResponse>({
    queryKey: ['leads', statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      params.set('page', String(page));
      params.set('limit', '20');
      const res = await api.get(`/leads?${params}`);
      return res.data;
    },
  });

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Inkorg</h1>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => { setStatusFilter(s.value); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              statusFilter === s.value
                ? 'bg-accent-600 text-white border-accent-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-accent-400'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Laddar förfrågningar...</div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {!data?.leads?.length ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-2">Inga förfrågningar ännu</p>
                <p className="text-sm">Förfrågningar via formuläret visas här.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Namn</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Ort</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Kategori</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Skapad</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Senaste meddelande</th>
                  </tr>
                </thead>
                <tbody>
                  {data.leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link to={`/dashboard/leads/${lead.id}`} className="font-medium text-accent-700 hover:underline">
                          {lead.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{lead.city}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {lead.category?.nameSv || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={lead.status as LeadStatus} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(lead.createdAt)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                        {lead.messages?.[0]?.content?.slice(0, 60) || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {data && data.total > 20 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Föregående
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Sida {page} av {Math.ceil(data.total / 20)}
              </span>
              <button
                disabled={page >= Math.ceil(data.total / 20)}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Nästa
              </button>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
