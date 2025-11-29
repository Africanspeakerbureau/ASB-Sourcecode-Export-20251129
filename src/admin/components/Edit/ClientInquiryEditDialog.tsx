import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { airtablePatchRecord, getRecord } from "../../api/airtable";
import "./editDialog.css";

type Props = {
  recordId: string;
  onClose: () => void;
};

// ===== Airtable-select options (must match Airtable exactly) =====
const COMPANY_SIZE_OPTS = [
  "1 - 10 employees",
  "11 - 50 employees",
  "51 - 250 employees",
  "251 - 500 employees",
  "501 - 1000 employees",
  "1000 + employees",
];

const INDUSTRY_OPTS = [
  "Technology",
  "Finance & Banking",
  "Healthcare & Medical",
  "Education",
  "Government & Public Policy",
  "Non Profit and NGO",
  "Energy and Mining",
  "Agriculture & Food",
  "Manufacturing",
  "Telecommunications",
  "Transport & Logistics",
  "Real Estate & Construction",
  "Media & Entertainment",
  "Tourism & Hospitality",
  "Retail and Consumer Goods",
  "Legal Services",
  "Consulting",
  "Research and Development",
  "Arts and Cultures",
  "IT & AI",
  "Others",
];

const AUDIENCE_SIZE_OPTS = [
  "Less than 50",
  "50-100",
  "100-500",
  "500-1000",
  "More than 1000",
];

const PRESENTATION_FORMAT_OPTS = ["In-Person", "Virtual", "Hybrid"];

const BUDGET_RANGE_OPTS = [
  "Less than $1 000 / R20 000",
  "$1 000-$2 500 / R20 000 - R50 000",
  "$2 500-$5 000 / R50000 - R100 000",
  "$5 000 - $10 000 / R100 000 - R200 000",
  "More than $10 000 / R200 000",
];

const STATUS_OPTS = [
  "New",
  "Contacted",
  "Proposal Sent",
  "Booked",
  "Completed",
  "Follow up Required",
];

// Only allow fields that exist in Airtable for this table
const ALLOWED_FIELDS = new Set<string>([
  "First Name",
  "Last Name",
  "Email",
  "Phone",
  "Company Name",
  "Job Title",
  "Company Size",
  "Industry",
  "Company Website",
  "Event Name",
  "Event Date",
  "Event Location",
  "Audience Size",
  "Speaking Topic",
  "Budget Range",
  "Presentation Format",
  "Additional Requirements",
  "Status",
  "Internal Notes",
]);

function diffPayload(next: Record<string, any>, original: Record<string, any>) {
  const fields: Record<string, any> = {};
  for (const [k, v] of Object.entries(next || {})) {
    if (!ALLOWED_FIELDS.has(k)) continue;
    const prev = original?.[k];
    const same = JSON.stringify(v ?? null) === JSON.stringify(prev ?? null);
    if (!same && v !== undefined) fields[k] = v;
  }
  return { fields };
}

export default function ClientInquiryEditDialog({ recordId, onClose }: Props) {
  const [record, setRecord] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const r = await getRecord<any>("Client Inquiries", recordId);
      setRecord(r);
      setForm({ ...(r?.fields || {}) });
      setLoading(false);
    })();
  }, [recordId]);

  const bind = (name: string) => ({
    value: form?.[name] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [name]: e.target.value })),
    name,
  });

  async function handleSave(closeAfter = false) {
    if (!record) return;
    try {
      setSaving(true);
      const payload = diffPayload(form, record.fields || {});
      if (Object.keys(payload.fields).length === 0) {
        if (closeAfter) onClose();
        return;
      }
      await airtablePatchRecord("Client Inquiries", record.id, payload.fields);
      if (closeAfter) onClose();
    } finally {
      setSaving(false);
    }
  }

  if (!record && !loading) return null;

  return ReactDOM.createPortal(
    <div className="modal">
      <div className="modal__panel" role="dialog" aria-modal="true">
        <div className="modal__header">
          <h2>Client Inquiry</h2>
          <button className="icon-btn" aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal__body">
          <div className="grid">
            {/* Row 1 */}
            <label className="field">
              <div className="field__label">First Name</div>
              <input className="input" {...bind("First Name")} />
            </label>
            <label className="field">
              <div className="field__label">Last Name</div>
              <input className="input" {...bind("Last Name")} />
            </label>

            {/* Row 2 */}
            <label className="field">
              <div className="field__label">Email</div>
              <input className="input" type="email" {...bind("Email")} />
            </label>
            <label className="field">
              <div className="field__label">Phone</div>
              <input className="input" {...bind("Phone")} />
            </label>

            {/* Row 3 */}
            <label className="field">
              <div className="field__label">Company Name</div>
              <input className="input" {...bind("Company Name")} />
            </label>
            <label className="field">
              <div className="field__label">Job Title</div>
              <input className="input" {...bind("Job Title")} />
            </label>

            {/* Row 4: Company Size (select) + Industry (select) */}
            <label className="field">
              <div className="field__label">Company Size</div>
              <select className="select" {...bind("Company Size")}>
                <option value="">— Select company size —</option>
                {COMPANY_SIZE_OPTS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <div className="field__label">Industry</div>
              <select className="select" {...bind("Industry")}>
                <option value="">— Select industry —</option>
                {INDUSTRY_OPTS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>

            {/* Row 5 */}
            <label className="field">
              <div className="field__label">Company Website</div>
              <input className="input" {...bind("Company Website")} />
            </label>

            {/* Row 6 */}
            <label className="field">
              <div className="field__label">Event Name</div>
              <input className="input" {...bind("Event Name")} />
            </label>
            <label className="field">
              <div className="field__label">Event Date</div>
              <input className="input" type="date" {...bind("Event Date")} />
            </label>

            {/* Row 7 */}
            <label className="field">
              <div className="field__label">Event Location</div>
              <input className="input" {...bind("Event Location")} />
            </label>
            <label className="field">
              <div className="field__label">Audience Size</div>
              <select className="select" {...bind("Audience Size")}>
                <option value="">— Select audience size —</option>
                {AUDIENCE_SIZE_OPTS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>

            {/* Row 8 */}
            <label className="field" style={{ gridColumn: "1 / -1" }}>
              <div className="field__label">Speaking Topic</div>
              <textarea className="textarea" rows={4} {...bind("Speaking Topic")} />
            </label>

            {/* Row 9: Budget Range (select) + Presentation Format (select) */}
            <label className="field">
              <div className="field__label">Budget Range</div>
              <select className="select" {...bind("Budget Range")}>
                <option value="">— Select budget range —</option>
                {BUDGET_RANGE_OPTS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <div className="field__label">Presentation Format</div>
              <select className="select" {...bind("Presentation Format")}>
                <option value="">— Select format —</option>
                {PRESENTATION_FORMAT_OPTS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>

            {/* Row 10 */}
            <label className="field" style={{ gridColumn: "1 / -1" }}>
              <div className="field__label">Additional Requirements</div>
              <textarea className="textarea" rows={4} {...bind("Additional Requirements")} />
            </label>

            {/* Row 11: Status (single select) */}
            <label className="field">
              <div className="field__label">Status</div>
              <select className="select" {...bind("Status")}>
                <option value="">— Select status —</option>
                {STATUS_OPTS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>

            {/* Row 12: Internal Notes */}
            <label className="field" style={{ gridColumn: "1 / -1" }}>
              <div className="field__label">Internal Notes</div>
              <textarea className="textarea" rows={4} {...bind("Internal Notes")} />
            </label>
          </div>
        </div>

        <div className="modal__footer">
          <button className="btn" disabled={saving} onClick={onClose}>
            Close
          </button>
          <button className="btn" disabled={saving} onClick={() => handleSave(false)}>
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            className="btn btn--primary"
            disabled={saving}
            onClick={() => handleSave(true)}
          >
            {saving ? "Saving…" : "Save & Close"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
