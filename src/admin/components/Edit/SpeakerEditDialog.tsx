import React from "react";
import ReactDOM from "react-dom";
import {
  INDUSTRIES, YEARS_EXPERIENCE, SPEAKING_EXPERIENCE, NUMBER_OF_EVENTS, LARGEST_AUDIENCE,
  VIRTUAL_EXPERIENCE, EXPERTISE_AREAS, SPOKEN_LANGUAGES, COUNTRIES,
  FEE_RANGE_LOCAL, FEE_RANGE_CONTINENTAL, FEE_RANGE_INTERNATIONAL, FEE_RANGE_VIRTUAL, FEE_RANGE_GENERAL,
  TARGET_AUDIENCE, DELIVERY_CONTEXT, TRAVEL_WILLINGNESS, FEATURED, STATUS, EXPERTISE_LEVEL, DISPLAY_FEE
} from "../../edit/options";
import UploadWidget from "@/components/UploadWidget";
import { useToast } from "@/components/Toast";
import { useAirtableRecord } from "../../hooks/useAirtableRecord";
import { airtablePatchRecord } from "../../api/airtable";
import { basicSlugify } from "@/lib/normalizeSpeaker";
import { listAllSpeakersLite } from "@/lib/airtable";
import { toAirtableAttachments } from "@/utils/airtableAttachments";
import "./editDialog.css";

// Computed/linked fields we never send back to Airtable
const READ_ONLY_FIELDS = new Set<string>([
  "Full Name",
  "Experience Score",
  "Total Events",
  "Potential Revenue",
  "Created Date",
  "Client Inquiries",
]);

// Attachment fields (must be sanitized to Airtable's shape)
const ATTACHMENT_FIELDS = new Set<string>(["Profile Image", "Header Image"]);

function normalizeMultiline(out: any) {
  if (Array.isArray(out)) return out.filter(Boolean).join("\n");
  return String(out ?? "").replace(/\r\n/g, "\n");
}

function isEqualShallow(a: any, b: any) {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}


function buildSpeakerPayload(
  form: Record<string, any>,
  original: { fields?: Record<string, any> } | undefined
) {
  const out: Record<string, any> = {};
  for (const [key, val] of Object.entries(form)) {
    // skip read-only
    if (READ_ONLY_FIELDS.has(key)) continue;
    let nextVal: any = val;
    // Normalize attachments to Airtable shape
    if (ATTACHMENT_FIELDS.has(key)) {
      const norm = toAirtableAttachments(val);
      if (typeof norm === 'undefined') continue;
      const prevNorm = toAirtableAttachments(original?.fields?.[key]);
      if (Array.isArray(prevNorm) && isEqualShallow(norm, prevNorm)) continue;
      out[key] = norm;
      continue;
    }
    // unchanged (non-attachment)?
    const prev = original?.fields?.[key];
    if (isEqualShallow(nextVal, prev)) continue;
    out[key] = nextVal;
  }
  return { fields: out };
}

type Props = {
  recordId: string;
  onClose: () => void;
};

const isAdmin = true; // from your session
const ALL_TABS = [
  "Identity",
  "Background",
  "Experience",
  "Expertise & Content",
  "Why booking",
  "Media & Languages",
  "Logistics & Fees",
  "Contact & Admin",
  "Internal",
] as const;
type TabKey = typeof ALL_TABS[number];
const TABS: TabKey[] = isAdmin ? [...ALL_TABS] : ALL_TABS.filter(t => t !== "Internal");

export default function SpeakerEditDialog({ recordId, onClose }: Props) {
  const { push } = useToast();
  const [saving, setSaving] = React.useState(false);
  const [tab, setTab] = React.useState<TabKey>("Identity");
  const { record, loading } = useAirtableRecord<any>("Speaker Applications", recordId);
  const buf = React.useRef<Record<string, any>>({});
  const hydratedRef = React.useRef(false);
  const [ready, setReady] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [allSlugs, setAllSlugs] = React.useState<string[]>([]);
  const [checkingSlugs, setCheckingSlugs] = React.useState(true);
  const [slugOverrideVal, setSlugOverrideVal] = React.useState('');
  const [legacyFeeRange, setLegacyFeeRange] = React.useState('');

  React.useEffect(() => {
    if (!record?.id) return;
    if (hydratedRef.current) return;
    buf.current = { ...(record.fields || {}) };
    for (const fld of ATTACHMENT_FIELDS) delete buf.current[fld];
    const f = buf.current;
    if (f['Fee Range']) {
      setLegacyFeeRange(String(f['Fee Range']));
      delete buf.current['Fee Range'];
    }
    buf.current.speakingTopicsText = Array.isArray(f["Speaking Topics"])
      ? f["Speaking Topics"].filter(Boolean).join("\n")
      : String(f["Speaking Topics"] ?? "");
    buf.current.keyMessagesText = Array.isArray(f["Key Messages"])
      ? f["Key Messages"].filter(Boolean).join("\n")
      : String(f["Key Messages"] ?? "");
    setSlugOverrideVal(String(f['Slug Override'] || ''));
    hydratedRef.current = true;
    setReady(true);
  }, [record?.id, record]);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setCheckingSlugs(true);
        const rows = await listAllSpeakersLite();
        if (!alive) return;
        setAllSlugs(
          rows.filter(r => r.id !== recordId).map(r => (r.slug || '').toLowerCase())
        );
      } finally {
        if (alive) setCheckingSlugs(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [recordId]);

  const first = buf.current['First Name'] || '';
  const last = buf.current['Last Name'] || '';
  const autoFromName = basicSlugify(`${first} ${last}`);
  const slugFormula = (buf.current['Slug'] || '').toString().trim();
  const currentSlug = (slugOverrideVal || slugFormula || '').trim();
  const candidate = slugOverrideVal.trim().toLowerCase();
  const isBlank = candidate.length === 0;
  const isDup = !!candidate && allSlugs.includes(candidate);

  async function handleSave(closeAfter = false) {
    if (!record) return;
    if (uploading) {
      push({ text: "Upload still in progress…", type: "error" });
      return;
    }
    const override = (buf.current['Slug Override'] || '').trim().toLowerCase();
    if (override && allSlugs.includes(override)) {
      push({ text: 'Slug Override is already in use by another speaker.', type: 'error' });
      return;
    }
    try {
      setSaving(true);
      const data: Record<string, any> = { ...buf.current };
      const { speakingTopicsText, keyMessagesText, ...rest } = data;
      const prepared = {
        ...rest,
        'Speaking Topics': normalizeMultiline(speakingTopicsText ?? rest['Speaking Topics']),
        'Key Messages': normalizeMultiline(keyMessagesText ?? rest['Key Messages']),
        'Profile Image': buf.current['Profile Image'],
        'Header Image': buf.current['Header Image'],
      };
      const payload = buildSpeakerPayload(prepared, record);
      if (Object.keys(payload.fields).length === 0) {
        push({ text: "No changes to save", type: "info" });
        if (closeAfter) onClose();
        return;
      }
      await airtablePatchRecord("Speaker Applications", record.id, payload.fields);
      push({ text: "Saved ✔︎", type: "success" });
      if (closeAfter) onClose();
    } catch (e: any) {
      push({ text: e?.message || "Could not save", type: "error" });
      console.error("[Save error]", e);
    } finally {
      setSaving(false);
    }
  }

  if (!record && !loading) return null;

  return ReactDOM.createPortal(
    <div className="modal">
      <div className="modal__panel" role="dialog" aria-modal="true">
        <div className="modal__header">
          <h2>Edit</h2>
          <button className="icon-btn" aria-label="Close" onClick={onClose}>✕</button>
        </div>
        {loading && <div className="loading-bar">Loading record…</div>}
        {ready && (
          <>
            <div className="tabs">
              {TABS.map(t => (
                <button
                  key={t}
                  className={`tab ${tab === t ? "tab--active" : ""}`}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="modal__body">
              {tab === "Identity" && (
                <Grid>
                  <Text id="First Name" />
                  <Text id="Last Name" />
                  <Text id="Title" label="Title (Dr/Prof)" />
                  <Text id="Professional Title" />
                  <Text id="Company" label="Company/Organization" />
                  <Select id="Country" options={COUNTRIES} />
                  <Text id="Location" />
                  <Text id="Email" type="email" />
                  <Text id="Phone" label="Phone Number" type="tel" />
                  <Upload id="Profile Image" label="Profile Image" hint="JPG/PNG, max 5MB" />
                </Grid>
              )}

              {tab === "Background" && (
                <Grid>
                  <Select id="Industry" options={INDUSTRIES} />
                  <Select id="Expertise Level" options={EXPERTISE_LEVEL} />
                  <Select id="Years Experience" options={YEARS_EXPERIENCE} />
                  <TextArea id="Notable Achievements" />
                  <TextArea id="Achievements" />
                  <TextArea id="Education" />
                </Grid>
              )}

              {tab === "Experience" && (
                <Grid>
                  <Select id="Speaking Experience" options={SPEAKING_EXPERIENCE} />
                  <Select id="Number of Events" options={NUMBER_OF_EVENTS} />
                  <Select id="Largest Audience" options={LARGEST_AUDIENCE} />
                  <Select id="Virtual Experience" options={VIRTUAL_EXPERIENCE} />
                  <Chips id="Target Audience" options={TARGET_AUDIENCE} />
                  <Chips id="Delivery Context" options={DELIVERY_CONTEXT} />
                </Grid>
              )}

              {tab === "Expertise & Content" && (
                <Grid>
                  <Chips id="Expertise Areas" options={EXPERTISE_AREAS} />
                  {/* Speaking Topics: full-width, one per line */}
                  <Field label="Speaking Topics (one per line)" full>
                    <textarea
                      className="textarea"
                      rows={10}
                      defaultValue={buf.current.speakingTopicsText ?? ""}
                      onChange={e => (buf.current.speakingTopicsText = e.target.value)}
                      style={{ resize: "vertical" }}
                    />
                  </Field>
                  <TextArea id="Speeches Detailed" label="Speeches Detailed" rows={8} full />
                  <TextArea id="keyMessagesText" label="Key Messages" rows={8} full />
                  <TextArea id="Professional Bio" label="Professional Bio" rows={12} full />
                </Grid>
              )}

              {tab === "Why booking" && (
                <Grid>
                  <TextArea id="Speakers Delivery Style" label="Speaker’s Delivery Style" />
                  <TextArea id="Why the audience should listen to these topics" />
                  <TextArea id="What the speeches will address" />
                  <TextArea id="What participants will learn" />
                  <TextArea id="What the audience will take home" />
                  <TextArea id="Benefits for the individual" />
                  <TextArea id="Benefits for the organisation" />
                </Grid>
              )}

              {tab === "Media & Languages" && (
                <Grid>
                  <Upload id="Header Image" label="Header Image" hint="Wide aspect recommended; JPG/PNG" />
                  <Text id="Video Link 1" />
                  <Text id="Video Link 2" />
                  <Text id="Video Link 3" />
                  <Chips id="Spoken Languages" options={SPOKEN_LANGUAGES} />
                </Grid>
              )}

              {tab === "Logistics & Fees" && (
                <Grid>
                  {legacyFeeRange && (
                    <div style={{ gridColumn: "1 / -1", color: "#b45309" }}>
                      Legacy 'Fee Range' detected. Please populate the new fee fields.
                    </div>
                  )}
                  <Select id="Fee Range Local" options={FEE_RANGE_LOCAL} />
                  <Select id="Fee Range Continental" options={FEE_RANGE_CONTINENTAL} />
                  <Select id="Fee Range International" options={FEE_RANGE_INTERNATIONAL} />
                  <Select id="Fee Range Virtual" options={FEE_RANGE_VIRTUAL} />
                  <Select id="Fee Range General" options={FEE_RANGE_GENERAL} />
                  <Select id="Display Fee" options={DISPLAY_FEE} label="Display Fee on site?" />
                  <Select id="Travel Willingness" options={TRAVEL_WILLINGNESS} />
                  <TextArea id="Travel Requirements" />
                </Grid>
              )}

              {tab === "Contact & Admin" && (
                <Grid>
                  <Text id="Website" />
                  <Text id="LinkedIn" label="LinkedIn Profile" />
                  <Text id="Twitter" label="Twitter/X Profile" />
                  <TextArea id="References" />
                  <Text id="PA Name" />
                  <Text id="PA Email" />
                  <Text id="PA Phone" />
                  <TextArea id="Banking Details" />
                  <TextArea id="Special Requirements" />
                  <TextArea id="Additional Info" />
                </Grid>
              )}

              {tab === "Internal" && (
                <Grid>
                  <Chips id="Status" options={STATUS} allowMulti />
                  <Select id="Featured" options={FEATURED} />
                  <Readonly id="Full Name" />
                  <Readonly id="Experience Score" />
                  <Readonly id="Total Events" />
                  <Readonly id="Potential Revenue" />
                  <Readonly id="Client Inquiries" />
                  <Field label="Current slug" full>
                    <input className="input" readOnly value={currentSlug || '(none)'} />
                  </Field>
                  <Field label="Slug Override (optional)" full>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        className="input"
                        style={{ flex: 1 }}
                        placeholder={autoFromName}
                        value={slugOverrideVal}
                        onChange={e => {
                          const v = basicSlugify(e.target.value);
                          setSlugOverrideVal(v);
                          buf.current['Slug Override'] = v;
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn--dark"
                        onClick={() => {
                          const v = autoFromName;
                          setSlugOverrideVal(v);
                          buf.current['Slug Override'] = v;
                        }}
                      >
                        Generate
                      </button>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => {
                          setSlugOverrideVal('');
                          buf.current['Slug Override'] = '';
                        }}
                        title="Clear to use the automatic slug"
                      >
                        Clear
                      </button>
                    </div>
                    {checkingSlugs ? (
                      <div className="field__hint">Checking duplicates…</div>
                    ) : isDup ? (
                      <div className="field__hint" style={{ color: '#dc2626' }}>
                        This slug is already used by another speaker.
                      </div>
                    ) : isBlank ? (
                      <div className="field__hint">
                        Leave blank to use the automatic slug: <code>{autoFromName || '(none)'}</code>
                      </div>
                    ) : (
                      <div className="field__hint" style={{ color: '#16a34a' }}>
                        Looks good.
                      </div>
                    )}
                  </Field>
                  <TextArea id="Internal Notes" />
                </Grid>
              )}
            </div>
          </>
        )}

        <div className="modal__footer">
          <button className="btn" disabled={saving || uploading} onClick={onClose}>Close</button>
          <button className="btn" disabled={saving || uploading || isDup} onClick={() => handleSave(false)}>
            {saving ? "Saving…" : "Save"}
          </button>
          <button className="btn btn--primary" disabled={saving || uploading || isDup} onClick={() => handleSave(true)}>
            {saving ? "Saving…" : "Save & Close"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );

  // ————— helpers —————
  function makeId(id: string) {
    return `f-${id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  }

  function Text({ id, label, type = "text" }: { id: string; label?: string; type?: string }) {
    const inputId = makeId(id);
    return (
      <Field id={inputId} label={label ?? id}>
        <input
          id={inputId}
          className="input"
          type={type}
          defaultValue={buf.current[id] ?? ""}
          onChange={e => (buf.current[id] = e.target.value)}
          placeholder={label ?? id}
        />
      </Field>
    );
  }

  function TextArea({ id, label, rows = 4, full = false }: { id: string; label?: string; rows?: number; full?: boolean }) {
    const inputId = makeId(id);
    return (
      <Field id={inputId} label={label ?? id} full={full}>
        <textarea
          id={inputId}
          className="textarea"
          defaultValue={buf.current[id] ?? ""}
          onChange={e => (buf.current[id] = e.target.value)}
          rows={rows}
          style={{ resize: "vertical" }}
        />
      </Field>
    );
  }

  function Select({ id, options, label }: { id: string; options: string[]; label?: string }) {
    const inputId = makeId(id);
    return (
      <Field id={inputId} label={label ?? id}>
        <select
          id={inputId}
          className="select"
          defaultValue={buf.current[id] ?? ""}
          onChange={e => (buf.current[id] = e.target.value)}
        >
          <option value="">— Select —</option>
          {options.map(o => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </Field>
    );
  }

  function Chips({ id, options, allowMulti = true }: { id: string; options: string[]; allowMulti?: boolean }) {
    const [, force] = React.useReducer(x => x + 1, 0);
    const value: string[] = Array.isArray(buf.current[id])
      ? buf.current[id]
      : buf.current[id]
      ? String(buf.current[id]).split(',').map(s => s.trim())
      : [];
    const toggle = (v: string) => {
      if (allowMulti) {
        const next = value.includes(v) ? value.filter(x => x !== v) : [...value, v];
        buf.current[id] = next;
      } else {
        buf.current[id] = value.includes(v) ? '' : v;
      }
      force();
    };
    return (
      <Field label={id}>
        <div className="chips">
          {options.map(v => (
            <button
              type="button"
              key={v}
              className={`chip ${value.includes(v) ? 'chip--on' : ''}`}
              onClick={() => toggle(v)}
            >
              {v}
            </button>
          ))}
        </div>
      </Field>
    );
  }

  function Upload({ id, label, hint }: { id: string; label: string; hint?: string }) {
    const [, force] = React.useReducer(x => x + 1, 0);
    const file = buf.current[id] as any;
    const existing = (record?.fields?.[id] as any)?.[0];
    const preview = file === undefined ? existing : file;
    return (
      <Field label={label} hint={hint}>
        <div className="upload-row">
          <div className="upload-preview">
            {preview ? (
              <img src={preview.url ?? preview} alt="" className="thumb" />
            ) : (
              <div className="empty">No file selected</div>
            )}
          </div>
          <div style={{display:'flex', gap:8}}>
            <UploadWidget
              onUpload={uploaded => {
                buf.current[id] = uploaded;
                force();
              }}
              onUploadingChange={setUploading}
            >
              <button className="btn btn--dark">Upload</button>
            </UploadWidget>
            {preview && (
              <button
                className="btn"
                type="button"
                onClick={() => {
                  buf.current[id] = null;
                  force();
                }}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </Field>
    );
  }

  function Readonly({ id }: { id: string }) {
    const inputId = makeId(id);
    return (
      <Field id={inputId} label={id}>
        <input id={inputId} className="input" readOnly defaultValue={buf.current[id] ?? ''} />
      </Field>
    );
  }
}

// layout atoms
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid">{children}</div>;
}
function Field({ id, label, hint, children, full = false }: { id?: string; label: string; hint?: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className="field" style={full ? { gridColumn: "1 / -1" } : undefined}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {children}
      {hint && <div className="field__hint">{hint}</div>}
    </div>
  );
}
