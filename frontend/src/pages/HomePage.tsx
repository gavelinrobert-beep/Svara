import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

interface FormData {
  name: string;
  phone: string;
  email: string;
  description: string;
  postalCode: string;
  city: string;
  consent: boolean;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  description?: string;
  postalCode?: string;
  city?: string;
  consent?: string;
}

export function HomePage() {
  const [form, setForm] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    description: '',
    postalCode: '',
    city: '',
    consent: false,
  });
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = 'Namn är obligatoriskt';
    if (!form.phone.trim()) {
      newErrors.phone = 'Telefonnummer är obligatoriskt';
    } else if (!/^(\+46|0046|0)\d{8,10}$/.test(form.phone.replace(/[\s\-]/g, ''))) {
      newErrors.phone = 'Ange ett giltigt svenskt mobilnummer, t.ex. 070-123 45 67';
    }
    if (!form.email.trim()) {
      newErrors.email = 'E-post är obligatorisk';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Ogiltig e-postadress';
    }
    if (!form.description.trim()) newErrors.description = 'Beskrivning är obligatorisk';
    if (!form.postalCode.trim()) {
      newErrors.postalCode = 'Postnummer är obligatoriskt';
    } else if (!/^\d{3}\s?\d{2}$/.test(form.postalCode.trim())) {
      newErrors.postalCode = 'Ange ett giltigt postnummer (5 siffror), t.ex. 123 45';
    }
    if (!form.city.trim()) newErrors.city = 'Ort är obligatorisk';
    if (!form.consent) newErrors.consent = 'Du måste godkänna integritetspolicyn';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('phone', form.phone);
      formData.append('email', form.email);
      formData.append('description', form.description);
      formData.append('postalCode', form.postalCode);
      formData.append('city', form.city);
      formData.append('consent', 'true');
      files.forEach((file) => formData.append('images', file));

      await api.post('/leads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { errors?: Array<{ msg: string }> } } };
      const apiErrors = error.response?.data?.errors;
      if (apiErrors) {
        setServerError(apiErrors.map((e) => e.msg).join(', '));
      } else {
        setServerError('Något gick fel. Försök igen.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Tack för din förfrågan!</h2>
          <p className="text-gray-600">
            Vi har tagit emot din förfrågan och återkommer inom kort med ett svar. Kolla din e-post.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-5 flex justify-between items-center">
          <span className="text-xl font-semibold text-accent-700">Svara</span>
          <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700">
            Logga in
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Begär en offert</h1>
          <p className="text-gray-600">
            Beskriv ditt jobb nedan. Vi svarar vanligtvis inom 1–2 minuter.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Namn <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="Anna Svensson"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefonnummer <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="070-123 45 67"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-post <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="anna@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Beskrivning av jobbet <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 ${errors.description ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="Beskriv vad som behöver göras, t.ex. byt kakel i badrum, ca 8 kvm..."
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postnummer <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 ${errors.postalCode ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="123 45"
                maxLength={6}
              />
              {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ort <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 ${errors.city ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Stockholm"
              />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bilder (valfritt)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent-50 file:text-accent-700 hover:file:bg-accent-100"
            />
            {files.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">{files.length} fil(er) valda</p>
            )}
          </div>

          {/* GDPR Consent */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="consent"
              checked={form.consent}
              onChange={(e) => setForm({ ...form, consent: e.target.checked })}
              className="mt-0.5 w-4 h-4 accent-accent-600"
            />
            <label htmlFor="consent" className="text-sm text-gray-700">
              Jag godkänner att mina uppgifter hanteras enligt{' '}
              <Link to="/integritetspolicy" className="text-accent-600 underline" target="_blank">
                integritetspolicyn
              </Link>
              . <span className="text-red-500">*</span>
            </label>
          </div>
          {errors.consent && <p className="text-red-500 text-xs -mt-4">{errors.consent}</p>}

          {serverError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-600 hover:bg-accent-700 disabled:opacity-50 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            {loading ? 'Skickar...' : 'Skicka förfrågan'}
          </button>
        </form>
      </div>
    </div>
  );
}
