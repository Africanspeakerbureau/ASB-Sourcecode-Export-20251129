import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import fieldOptions from '@/FieldOptions.js';

const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID || import.meta.env.AIRTABLE_BASE_ID;
const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY || import.meta.env.AIRTABLE_API_KEY;

const PREFILL_ENABLED = true;

function getSearchFromHashAware(): string {
  if (window.location.search) return window.location.search;
  const h = window.location.hash || '';
  const i = h.indexOf('?');
  return i >= 0 ? h.substring(i) : '';
}

function getQueryParam(name: string): string | null {
  const qs = getSearchFromHashAware();
  const sp = new URLSearchParams(qs);
  const v = sp.get(name);
  return v ? decodeURIComponent(v) : null;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

type FormState = {
  preferredSpeakers: string;
};

export default function BookASpeaker() {
  const initialSpeaker = PREFILL_ENABLED ? getQueryParam('speaker') || '' : '';
  const [form, setForm] = useState<FormState>({
    preferredSpeakers: initialSpeaker,
  });
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    const formElement = e.currentTarget as HTMLFormElement;
    const formData = new FormData(formElement);
    const companySize = (formData.get('companySize') as string) || '';
    const industry = (formData.get('industry') as string) || '';
    const website = (formData.get('website') as string) || '';
    const audienceSize = (formData.get('audienceSize') as string) || '';
    const focusArea = (formData.get('focusArea') as string) || '';
    const formatType = (formData.get('formatType') as string) || '';
    const budget = (formData.get('budget') as string) || '';
    const presentationFormat = (formData.get('presentationFormat') as string) || '';
    const requirements = (formData.get('requirements') as string) || '';

    const optionalValue = (value: string) => (value ? value : undefined);

    const payload: Record<string, string | undefined> = {
      'First Name': (formData.get('firstName') as string) || '',
      'Last Name': (formData.get('lastName') as string) || '',
      'Email': (formData.get('email') as string) || '',
      'Phone': (formData.get('phone') as string) || '',
      'Company Name': (formData.get('companyName') as string) || '',
      'Job Title': (formData.get('jobTitle') as string) || '',
      'Company Size': optionalValue(companySize),
      'Industry': optionalValue(industry),
      'Company Website': website,
      'Event Name': (formData.get('eventName') as string) || '',
      'Event Date': (formData.get('eventDate') as string) || '',
      'Event Location': (formData.get('eventLocation') as string) || '',
      'Audience Size': optionalValue(audienceSize),
      'Speaking Topic': (formData.get('topic') as string) || '',
      'Preferred Speakers': form.preferredSpeakers,
      'Focus Area': optionalValue(focusArea),
      'Format': optionalValue(formatType),
      'Budget Range': optionalValue(budget),
      'Presentation Format': optionalValue(presentationFormat),
      'Additional Requirements': requirements,
      'Status': 'New',
    };

    try {
      const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Client%20Inquiries`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields: payload }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Airtable error ${response.status}`);
      }

      formElement.reset();
      setStatus('success');
      setForm({ preferredSpeakers: initialSpeaker });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
      setStatus('error');
    }
  };

  return (
    <main className="bg-white">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Book a Speaker</h1>
          <p className="text-lg text-gray-600">
            Connect with Africa&apos;s most compelling voices for your next event.
          </p>
        </div>

        <Card>
          <CardContent className="p-8">
            {status === 'success' ? (
              <div className="rounded-xl bg-green-50 text-green-800 p-4 border border-green-200">
                <p className="font-medium">Thank you — we’ve received your booking request.</p>
                <p>We’ll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">First Name *</label>
                      <Input name="firstName" placeholder="Your first name" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Name *</label>
                      <Input name="lastName" placeholder="Your last name" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address *</label>
                      <Input name="email" type="email" placeholder="your.email@example.com" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number *</label>
                      <Input name="phone" placeholder="+1 (555) 123-4567" required />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Company Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Company Name *</label>
                      <Input name="companyName" placeholder="Your company name" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Job Title *</label>
                      <Input name="jobTitle" placeholder="Your job title" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Company Size</label>
                      <select name="companySize" className="w-full p-2 border border-gray-300 rounded-md">
                        <option value="">Select company size</option>
                        {fieldOptions['Client Inquiries']['Company Size'].map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Industry</label>
                      <select name="industry" className="w-full p-2 border border-gray-300 rounded-md">
                        <option value="">Select industry</option>
                        {fieldOptions['Client Inquiries']['Industry'].map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Company Website</label>
                      <Input name="website" placeholder="https://yourcompany.com" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Event Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Event Name *</label>
                      <Input name="eventName" placeholder="Name of your event" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Event Date *</label>
                      <Input name="eventDate" type="date" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Event Location *</label>
                      <Input name="eventLocation" placeholder="City, Country" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Audience Size</label>
                      <select name="audienceSize" className="w-full p-2 border border-gray-300 rounded-md">
                        <option value="">Select audience size</option>
                        {fieldOptions['Client Inquiries']['Audience Size'].map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Speaking Topic/Theme *</label>
                    <Textarea name="topic" placeholder="Describe the topic or theme you'd like the speaker to address" required />
                  </div>
                  <div>
                    <label htmlFor="preferredSpeakers" className="block text-sm font-medium mb-2">Preferred Speakers</label>
                    <Input
                      id="preferredSpeakers"
                      name="Preferred Speakers"
                      type="text"
                      value={form.preferredSpeakers}
                      onChange={(e) => setForm((prev) => ({ ...prev, preferredSpeakers: e.target.value }))}
                      placeholder="Preferred speaker names"
                    />
                  </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Focus Area</label>
                        <select name="focusArea" className="w-full p-2 border border-gray-300 rounded-md">
                          <option value="">Select focus area</option>
                          {fieldOptions['Client Inquiries']['Focus Area'].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Format</label>
                        <select name="formatType" className="w-full p-2 border border-gray-300 rounded-md">
                          <option value="">Select format</option>
                          {fieldOptions['Client Inquiries']['Format'].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Budget Range (USD)</label>
                        <select name="budget" className="w-full p-2 border border-gray-300 rounded-md">
                          <option value="">Select budget range</option>
                          {fieldOptions['Client Inquiries']['Budget Range'].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Presentation Format</label>
                        <select name="presentationFormat" className="w-full p-2 border border-gray-300 rounded-md">
                          <option value="">Select format</option>
                          {fieldOptions['Client Inquiries']['Presentation Format'].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Additional Requirements</label>
                    <Textarea name="requirements" placeholder="Any specific requirements, preferences, or additional information" />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Submitting...' : 'Submit Booking Request'}
                </Button>
                {status === 'error' && (
                  <p className="mt-3 text-sm text-red-600">{error}</p>
                )}
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
