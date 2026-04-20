import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Layout } from '../components/Layout';
import { formatDate } from '../lib/format';
import { Lead, LeadStatus } from '../lib/types';

const COLUMNS: { status: LeadStatus; label: string; color: string }[] = [
  { status: 'NY', label: 'Ny', color: 'border-blue-300 bg-blue-50' },
  { status: 'PAGAENDE', label: 'Pågående', color: 'border-yellow-300 bg-yellow-50' },
  { status: 'VUNNEN', label: 'Vunnen', color: 'border-green-300 bg-green-50' },
  { status: 'FORLORAD', label: 'Förlorad', color: 'border-red-300 bg-red-50' },
];

export function PipelinePage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ leads: Lead[] }>({
    queryKey: ['leads-pipeline'],
    queryFn: async () => {
      const res = await api.get('/leads?limit=100');
      return res.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadStatus }) => {
      await api.patch(`/leads/${id}`, { status });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads-pipeline'] }),
  });

  const leads = data?.leads || [];

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Pipeline</h1>
        <p className="text-sm text-gray-500 mt-1">Hantera förfrågningar i olika stadier</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Laddar pipeline...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUMNS.map((col) => {
            const columnLeads = leads.filter((l) => l.status === col.status);
            return (
              <div key={col.status} className={`rounded-xl border-2 ${col.color} p-4`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-800">{col.label}</h2>
                  <span className="text-xs bg-white text-gray-600 px-2 py-0.5 rounded-full border">
                    {columnLeads.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {columnLeads.map((lead) => (
                    <div key={lead.id} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow">
                      <Link
                        to={`/dashboard/leads/${lead.id}`}
                        className="font-medium text-sm text-gray-900 hover:text-accent-700 block mb-1"
                      >
                        {lead.name}
                      </Link>
                      <p className="text-xs text-gray-500 mb-2">
                        {lead.city} · {lead.category?.nameSv || '—'}
                      </p>
                      <p className="text-xs text-gray-400 mb-3">{formatDate(lead.createdAt)}</p>
                      <select
                        value={lead.status}
                        onChange={(e) =>
                          updateStatusMutation.mutate({ id: lead.id, status: e.target.value as LeadStatus })
                        }
                        className="w-full text-xs border border-gray-200 rounded px-2 py-1 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-accent-500"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="NY">Ny</option>
                        <option value="PAGAENDE">Pågående</option>
                        <option value="VUNNEN">Vunnen</option>
                        <option value="FORLORAD">Förlorad</option>
                      </select>
                    </div>
                  ))}
                  {columnLeads.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">Inga förfrågningar</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
