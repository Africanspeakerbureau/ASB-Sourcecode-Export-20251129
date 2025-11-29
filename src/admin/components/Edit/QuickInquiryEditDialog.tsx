import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { getRecord, readSingleSelect, airtablePatchRecord } from '../../api/airtable';
import { useToast } from '@/components/Toast';
import './editDialog.css';

type QuickFields = {
  'First Name'?: string;
  'Last Name'?: string;
  'Email'?: string;
  'Message'?: string;
  'Status'?: any;
  'Created Date'?: string;
  'Internal notes'?: string;
  'Client Inquiries'?: any[];
};

export default function QuickInquiryEditDialog({ recordId, onClose }: { recordId: string; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});
  const { push } = useToast();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const r = await getRecord<QuickFields>('Quick Inquiries', recordId);
      const f = r.fields || {};
      setForm({
        firstName: f['First Name'] ?? '',
        lastName: f['Last Name'] ?? '',
        email: f['Email'] ?? '',
        message: f['Message'] ?? '',
        status: readSingleSelect(f['Status']),
        createdDate: f['Created Date'] ?? '',
        notes: f['Internal notes'] ?? '',
        clientInquiry: Array.isArray(f['Client Inquiries']) ? f['Client Inquiries'].join(', ') : ''
      });
      setLoading(false);
    })();
  }, [recordId]);

  async function handleSave(closeAfter = true) {
    try {
      setSaving(true);
      const fields: Record<string, any> = {
        'First Name': form.firstName,
        'Last Name': form.lastName,
        'Email': form.email,
        'Message': form.message,
        'Status': form.status,
        'Created Date': form.createdDate ? new Date(form.createdDate).toISOString().slice(0,10) : '',
        'Internal notes': form.notes,
      };
      if (form.clientInquiry) {
        fields['Client Inquiries'] = form.clientInquiry.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      await airtablePatchRecord('Quick Inquiries', recordId, fields);
      push({ text: 'Saved ✔︎', type: 'success' });
      if (closeAfter) onClose();
    } catch (e: any) {
      push({ text: e?.message || 'Could not save', type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return ReactDOM.createPortal(
    <div className="modal">
      <div className="modal__panel" role="dialog" aria-modal="true">
        <div className="modal__header">
          <h2>Quick Inquiry</h2>
          <button className="icon-btn" aria-label="Close" onClick={onClose}>✕</button>
        </div>
        {loading && <div className="loading-bar">Loading record…</div>}
        <div className="modal__body">
          <div className="grid">
            <div className="field">
              <label className="field__label">First Name</label>
              <input className="input" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
            </div>
            <div className="field">
              <label className="field__label">Last Name</label>
              <input className="input" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
            </div>
            <div className="field">
              <label className="field__label">Email</label>
              <input className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="field" style={{gridColumn:'1 / -1'}}>
              <label className="field__label">Message</label>
              <textarea className="textarea" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
            </div>
            <div className="field">
              <label className="field__label">Status</label>
              <input className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} />
            </div>
            <div className="field">
              <label className="field__label">Created Date</label>
              <input className="input" value={form.createdDate} onChange={e => setForm({ ...form, createdDate: e.target.value })} />
            </div>
            <div className="field" style={{gridColumn:'1 / -1'}}>
              <label className="field__label">Internal notes</label>
              <textarea className="textarea" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="field" style={{gridColumn:'1 / -1'}}>
              <label className="field__label">Client Inquiry</label>
              <input className="input" value={form.clientInquiry} onChange={e => setForm({ ...form, clientInquiry: e.target.value })} />
            </div>
          </div>
        </div>
          <div className="modal__footer">
            <button className="btn" disabled={saving} onClick={onClose}>Close</button>
            <button className="btn" disabled={saving} onClick={() => handleSave(false)}>{saving ? 'Saving…' : 'Save'}</button>
            <button className="btn btn--primary" disabled={saving} onClick={() => handleSave(true)}>{saving ? 'Saving…' : 'Save & Close'}</button>
          </div>
      </div>
    </div>,
    document.body
  );
}
