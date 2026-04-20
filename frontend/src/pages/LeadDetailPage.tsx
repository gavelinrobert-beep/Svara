import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Layout } from '../components/Layout';
import { StatusBadge } from '../components/StatusBadge';
import { formatDateTime, formatPriceRange } from '../lib/format';
import { Lead, LeadStatus, Message, STATUS_LABELS } from '../lib/types';

const SENDER_LABELS: Record<string, string> = {
  AI: 'AI (Svara)',
  CUSTOMER: 'Kund',
  BUSINESS: 'Handläggare',
};

const SENDER_COLORS: Record<string, string> = {
  AI: 'bg-blue-50 border-blue-200',
  CUSTOMER: 'bg-gray-50 border-gray-200',
  BUSINESS: 'bg-green-50 border-green-200',
};

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const { data: lead, isLoading } = useQuery<Lead>({
    queryKey: ['lead', id],
    queryFn: async () => {
      const res = await api.get(`/leads/${id}`);
      return res.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: LeadStatus) => {
      await api.patch(`/leads/${id}`, { status });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lead', id] }),
  });

  const addMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      await api.post(`/leads/${id}/messages`, { content });
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
    },
  });

  const editMessageMutation = useMutation({
    mutationFn: async ({ messageId, content }: { messageId: string; content: string }) => {
      await api.post(`/leads/${id}/messages`, { content, editedFromMessageId: messageId });
    },
    onSuccess: () => {
      setEditingMessageId(null);
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
    },
  });

  const generateDraftMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/leads/${id}/ai-draft`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lead', id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/leads/${id}`);
    },
    onSuccess: () => navigate('/dashboard'),
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-12 text-gray-500">Laddar förfrågan...</div>
      </Layout>
    );
  }

  if (!lead) {
    return (
      <Layout>
        <div className="text-center py-12 text-gray-500">Förfrågan hittades inte.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          ← Tillbaka
        </button>
        <button
          onClick={() => {
            if (confirm('Vill du radera denna förfrågan? Åtgärden kan inte ångras.')) {
              deleteMutation.mutate();
            }
          }}
          className="text-sm text-red-500 hover:text-red-700"
        >
          Radera förfrågan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Kundinformation</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Namn</dt>
                <dd className="font-medium">{lead.name}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Telefon</dt>
                <dd>{lead.phoneE164}</dd>
              </div>
              <div>
                <dt className="text-gray-500">E-post</dt>
                <dd>{lead.email}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Ort</dt>
                <dd>{lead.city}, {lead.postalCode}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Inkommit</dt>
                <dd>{formatDateTime(lead.createdAt)}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Jobb & Status</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Kategori</dt>
                <dd>{lead.category?.nameSv || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Prisuppskattning</dt>
                <dd className="font-medium">
                  {formatPriceRange(lead.priceEstimateMin, lead.priceEstimateMax)}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 mb-1">Status</dt>
                <dd>
                  <select
                    value={lead.status}
                    onChange={(e) => updateStatusMutation.mutate(e.target.value as LeadStatus)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </dd>
              </div>
            </dl>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Beskrivning</h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{lead.description}</p>
          </div>

          {/* Images */}
          {lead.images && lead.images.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Bilder</h2>
              <div className="grid grid-cols-2 gap-2">
                {lead.images.map((img) => (
                  <a key={img.id} href={img.url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={img.url}
                      alt="Jobbild"
                      className="w-full h-24 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Conversation */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Konversation</h2>
              <div className="flex items-center gap-3">
                <StatusBadge status={lead.status as LeadStatus} />
                <button
                  onClick={() => generateDraftMutation.mutate()}
                  disabled={generateDraftMutation.isPending}
                  className="text-xs text-accent-600 hover:text-accent-800 border border-accent-300 px-3 py-1 rounded-lg"
                >
                  {generateDraftMutation.isPending ? 'Genererar...' : '✨ Nytt AI-utkast'}
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
              {lead.messages?.map((msg: Message) => (
                <div key={msg.id} className={`rounded-lg border p-4 ${SENDER_COLORS[msg.sender] || 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">
                      {SENDER_LABELS[msg.sender] || msg.sender}
                      {msg.edited && <span className="ml-2 text-gray-400 font-normal">(redigerad)</span>}
                    </span>
                    <span className="text-xs text-gray-400">{formatDateTime(msg.sentAt)}</span>
                  </div>

                  {editingMessageId === msg.id ? (
                    <div>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={6}
                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => editMessageMutation.mutate({ messageId: msg.id, content: editContent })}
                          className="text-xs bg-accent-600 text-white px-3 py-1.5 rounded-lg hover:bg-accent-700"
                        >
                          Spara & skicka
                        </button>
                        <button
                          onClick={() => setEditingMessageId(null)}
                          className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5"
                        >
                          Avbryt
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.content}</p>
                      {msg.sender === 'AI' && (
                        <button
                          onClick={() => {
                            setEditingMessageId(msg.id);
                            setEditContent(msg.content);
                          }}
                          className="text-xs text-accent-600 hover:text-accent-800 mt-2"
                        >
                          Redigera svar
                        </button>
                      )}
                      {msg.edited && msg.originalContent && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">Visa original</summary>
                          <p className="text-xs text-gray-500 mt-1 whitespace-pre-wrap">{msg.originalContent}</p>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {(!lead.messages || lead.messages.length === 0) && (
                <p className="text-center text-gray-500 text-sm py-8">Inga meddelanden ännu.</p>
              )}
            </div>

            {/* New message form */}
            <div className="border-t border-gray-200 p-5">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={3}
                placeholder="Skriv ett meddelande till kunden..."
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => addMessageMutation.mutate(newMessage)}
                  disabled={!newMessage.trim() || addMessageMutation.isPending}
                  className="bg-accent-600 hover:bg-accent-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
                >
                  {addMessageMutation.isPending ? 'Skickar...' : 'Skicka'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
