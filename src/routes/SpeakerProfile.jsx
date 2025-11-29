import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requireSpeakerAuth } from '@/auth/requireSpeakerAuth';
import { findSpeakerByEmail, updateSpeakerRecord } from '@/lib/airtableClient';
import { SELECTS, MULTI_FIELDS } from '@/constants/speakerEnums';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { toAirtableAttachments } from '@/utils/airtableAttachments';

// ---- helpers for select coercion ----
const toSingle = (val) => (val ? String(val) : '');
const toMulti = (arr) => Array.isArray(arr) ? arr.map(String) : [];

const ensureAllowed = (field, val) => {
  const opts = SELECTS[field];
  if (!opts) return val;
  if (Array.isArray(val)) return val.filter(v => opts.includes(v));
  return opts.includes(val) ? val : undefined;
};

const fromSingle = (val) => (val ? String(val) : undefined);               // Airtable singleSelect accepts a string

export default function SpeakerProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [recordId, setRecordId] = useState(null);
  const [email, setEmail] = useState('');
  const [activeTab, setActiveTab] = useState('Identity');
  const [err, setErr] = useState('');
  const [notice, setNotice] = useState('');

  // ---- form state (only external tabs) ----
  const [form, setForm] = useState({
    // Identity
    'First Name': '', 'Last Name': '', 'Email': '', 'Phone': '',
    'Professional Title': '', 'Company': '', 'Location': '', 'Country': '',
    // Background
    'Professional Bio': '', 'Education': '', 'Achievements': '',
    // Experience
    'Years Experience': '', 'Speaking Experience': '', 'Number of Events': '',
    'Largest Audience': '', 'Virtual Experience': '',
    'Expertise Level': '',
    // Expertise & Content
    'Industry': '', 'Expertise Areas': [], 'Speaking Topics': '', 'Key Messages': '',
    // Why booking
    'Speakers Delivery Style': '', 'Why the audience should listen to these topics': '',
    'What the speeches will address': '', 'What participants will learn': '',
    'What the audience will take home': '', 'Benefits for the individual': '',
    'Benefits for the organisation': '',
    // Media & Languages
    'Video Link 1': '', 'Video Link 2': '', 'Video Link 3': '',
    'Spoken Languages': [],
    // Logistics & Fees
    'Fee Range General': '', 'Fee Range Local': '', 'Fee Range Continental': '',
    'Fee Range International': '', 'Fee Range Virtual': '',
    'Travel Willingness': '', 'Travel Requirements': '',
    // Contact & Admin
    'Website': '', 'LinkedIn': '', 'Twitter': '',
    'References': '', 'Banking Details': '',
    'PA Name': '', 'PA Email': '', 'PA Phone': '',
    'Special Requirements': '', 'Additional Info': '',
  });

  const [profileImage, setProfileImage] = useState();
  const [headerImage, setHeaderImage] = useState();
  const [existingProfileImage, setExistingProfileImage] = useState(null);
  const [existingHeaderImage, setExistingHeaderImage] = useState(null);

  const tabs = useMemo(() => ([
    { key: 'Identity', fields: ['First Name','Last Name','Email','Phone','Professional Title','Company','Location','Country','Profile Image']},
    { key: 'Background', fields: ['Professional Bio','Education','Achievements']},
    { key: 'Experience', fields: ['Years Experience','Speaking Experience','Number of Events','Largest Audience','Virtual Experience','Expertise Level']},
    { key: 'Expertise & Content', fields: ['Industry','Expertise Areas','Speaking Topics','Key Messages']},
    { key: 'Why booking', fields: ['Speakers Delivery Style','Why the audience should listen to these topics','What the speeches will address','What participants will learn','What the audience will take home','Benefits for the individual','Benefits for the organisation']},
    { key: 'Media & Languages', fields: ['Header Image','Video Link 1','Video Link 2','Video Link 3','Spoken Languages']},
    { key: 'Logistics & Fees', fields: ['Fee Range General','Fee Range Local','Fee Range Continental','Fee Range International','Fee Range Virtual','Travel Willingness','Travel Requirements']},
    { key: 'Contact & Admin', fields: ['Website','LinkedIn','Twitter','References','Banking Details','PA Name','PA Email','PA Phone','Special Requirements','Additional Info']},
  ]), []);

  const fullName =
    form['First Name'] && form['Last Name']
      ? `${form['First Name']} ${form['Last Name']}`
      : null;

  useEffect(() => {
    document.title = fullName
      ? `Edit ${fullName}'s Profile — ASB`
      : 'Edit My Profile — ASB';
  }, [fullName]);

  // ---- load current user + their record ----
  useEffect(() => {
    (async () => {
      try {
        const session = await requireSpeakerAuth();
        if (!session) return;
        const email = session.user.email;
        setEmail(email);

        const recs = await findSpeakerByEmail(email);
        if (recs.length === 0) {
          setErr('We couldn\'t find a profile for this email. Please use the email on file or contact support.');
          setLoading(false);
          return;
        }
        if (recs.length > 1) {
          setErr("This PA email is linked to multiple profiles. Please sign in with the speaker's main email, or contact support.");
          setLoading(false);
          return;
        }
        const rec = recs[0];
        setRecordId(rec.id);

        const f = rec.fields || {};
        setForm((prev) => ({
          ...prev,
          'First Name': toSingle(f['First Name']),
          'Last Name': toSingle(f['Last Name']),
          'Email': toSingle(f['Email']),
          'Phone': toSingle(f['Phone']),
          'Professional Title': toSingle(f['Professional Title']),
          'Company': toSingle(f['Company'] || f['Company/Organization']),
          'Location': toSingle(f['Location']),
          'Country': toSingle(f['Country']),
          'Professional Bio': toSingle(f['Professional Bio']),
          'Education': toSingle(f['Education']),
          'Achievements': toSingle(f['Achievements']),
          'Years Experience': toSingle(f['Years Experience']),
          'Speaking Experience': toSingle(f['Speaking Experience']),
          'Number of Events': toSingle(f['Number of Events']),
          'Largest Audience': toSingle(f['Largest Audience']),
          'Virtual Experience': toSingle(f['Virtual Experience']),
          'Expertise Level': toSingle(f['Expertise Level']),
          'Industry': toSingle(f['Industry']),
          'Expertise Areas': toMulti(f['Expertise Areas']),
          'Speaking Topics': toSingle(f['Speaking Topics']),
          'Key Messages': toSingle(f['Key Messages']),
          'Speakers Delivery Style': toSingle(f['Speakers Delivery Style']),
          'Why the audience should listen to these topics': toSingle(f['Why the audience should listen to these topics']),
          'What the speeches will address': toSingle(f['What the speeches will address']),
          'What participants will learn': toSingle(f['What participants will learn']),
          'What the audience will take home': toSingle(f['What the audience will take home']),
          'Benefits for the individual': toSingle(f['Benefits for the individual']),
          'Benefits for the organisation': toSingle(f['Benefits for the organisation']),
          'Video Link 1': toSingle(f['Video Link 1']),
          'Video Link 2': toSingle(f['Video Link 2']),
          'Video Link 3': toSingle(f['Video Link 3']),
          'Spoken Languages': toMulti(f['Spoken Languages']),
          'Fee Range General': toSingle(f['Fee Range General']),
          'Fee Range Local': toSingle(f['Fee Range Local']),
          'Fee Range Continental': toSingle(f['Fee Range Continental']),
          'Fee Range International': toSingle(f['Fee Range International']),
          'Fee Range Virtual': toSingle(f['Fee Range Virtual']),
          'Travel Willingness': toSingle(f['Travel Willingness']),
          'Travel Requirements': toSingle(f['Travel Requirements']),
          'Website': toSingle(f['Website']),
          'LinkedIn': toSingle(f['LinkedIn']),
          'Twitter': toSingle(f['Twitter'] || f['Twitter/X Profile']),
          'References': toSingle(f['References']),
          'Banking Details': toSingle(f['Banking Details']),
          'PA Name': toSingle(f['PA Name']),
          'PA Email': toSingle(f['PA Email']),
          'PA Phone': toSingle(f['PA Phone']),
          'Special Requirements': toSingle(f['Special Requirements']),
          'Additional Info': toSingle(f['Additional Info']),
        }));
        setExistingProfileImage(Array.isArray(f['Profile Image']) ? f['Profile Image'][0] : null);
        setExistingHeaderImage(Array.isArray(f['Header Image']) ? f['Header Image'][0] : null);
        setLoading(false);
      } catch (e) {
        setErr(e.message || 'Failed to load profile'); setLoading(false);
      }
    })();
  }, []);

  const handleChange = (field, value) => setForm((x) => ({ ...x, [field]: value }));

  async function handlePickAndUpload(setter) {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
          alert('Max file size is 5MB');
          return;
        }
        try {
          const uploaded = await uploadToCloudinary(file);
          setter(uploaded);
          alert('Image uploaded');
        } catch (e) {
          console.error(e);
          alert('Upload failed');
        }
      };
      input.click();
    } catch (e) {
      console.error(e);
      alert('Could not open file picker');
    }
  }

  function removeImage(setter) {
    setter(null);
  }

  const handleSave = async (closeAfter = false) => {
    if (!recordId) return;
    setSaving(true); setErr('');
    try {
      const payload = {
        'First Name': fromSingle(form['First Name']),
        'Last Name': fromSingle(form['Last Name']),
        // Email is key – keep read-only
        'Phone': fromSingle(form['Phone']),
        'Professional Title': fromSingle(form['Professional Title']),
        'Company': fromSingle(form['Company']),
        'Location': fromSingle(form['Location']),
        'Country': ensureAllowed('Country', form['Country']),

        'Professional Bio': fromSingle(form['Professional Bio']),
        'Education': fromSingle(form['Education']),
        'Achievements': fromSingle(form['Achievements']),

        'Years Experience': ensureAllowed('Years Experience', form['Years Experience']),
        'Speaking Experience': ensureAllowed('Speaking Experience', form['Speaking Experience']),
        'Number of Events': ensureAllowed('Number of Events', form['Number of Events']),
        'Largest Audience': ensureAllowed('Largest Audience', form['Largest Audience']),
        'Virtual Experience': ensureAllowed('Virtual Experience', form['Virtual Experience']),
        'Expertise Level': ensureAllowed('Expertise Level', form['Expertise Level']),

        'Industry': ensureAllowed('Industry', form['Industry']),
        'Expertise Areas': ensureAllowed('Expertise Areas', form['Expertise Areas']),
        'Speaking Topics': fromSingle(form['Speaking Topics']),
        'Key Messages': fromSingle(form['Key Messages']),

        'Speakers Delivery Style': fromSingle(form['Speakers Delivery Style']),
        'Why the audience should listen to these topics': fromSingle(form['Why the audience should listen to these topics']),
        'What the speeches will address': fromSingle(form['What the speeches will address']),
        'What participants will learn': fromSingle(form['What participants will learn']),
        'What the audience will take home': fromSingle(form['What the audience will take home']),
        'Benefits for the individual': fromSingle(form['Benefits for the individual']),
        'Benefits for the organisation': fromSingle(form['Benefits for the organisation']),

        'Video Link 1': fromSingle(form['Video Link 1']),
        'Video Link 2': fromSingle(form['Video Link 2']),
        'Video Link 3': fromSingle(form['Video Link 3']),
        'Spoken Languages': ensureAllowed('Spoken Languages', form['Spoken Languages']),

        'Fee Range General': ensureAllowed('Fee Range General', form['Fee Range General']),
        'Fee Range Local': ensureAllowed('Fee Range Local', form['Fee Range Local']),
        'Fee Range Continental': ensureAllowed('Fee Range Continental', form['Fee Range Continental']),
        'Fee Range International': ensureAllowed('Fee Range International', form['Fee Range International']),
        'Fee Range Virtual': ensureAllowed('Fee Range Virtual', form['Fee Range Virtual']),
        'Travel Willingness': ensureAllowed('Travel Willingness', form['Travel Willingness']),
        'Travel Requirements': fromSingle(form['Travel Requirements']),

        'Website': fromSingle(form['Website']),
        'LinkedIn': fromSingle(form['LinkedIn']),
        'Twitter': fromSingle(form['Twitter']),
        'References': fromSingle(form['References']),
        'Banking Details': fromSingle(form['Banking Details']),
        'PA Name': fromSingle(form['PA Name']),
        'PA Email': fromSingle(form['PA Email']),
        'PA Phone': fromSingle(form['PA Phone']),
        'Special Requirements': fromSingle(form['Special Requirements']),
        'Additional Info': fromSingle(form['Additional Info']),
      };

      const profAtt = toAirtableAttachments(profileImage);
      if (typeof profAtt !== 'undefined') payload['Profile Image'] = profAtt;
      const headAtt = toAirtableAttachments(headerImage);
      if (typeof headAtt !== 'undefined') payload['Header Image'] = headAtt;

      await updateSpeakerRecord(recordId, payload);
      setNotice('✅ Profile updated.');
      if (closeAfter) navigate('/speaker-dashboard', { replace: true, state: { notice: 'Profile updated.' } });
    } catch (e) {
      setErr(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // ---- simple UI (mirrors your tabs; style can be swapped for your Modal) ----
  if (loading) return <PageWrap><h1>Loading your profile…</h1></PageWrap>;
  return (
    <PageWrap>
      <h1>{fullName ? `Edit ${fullName}'s profile` : 'Edit My Profile'}</h1>
      <p>Signed in as <strong>{email}</strong></p>
      {err && <p style={{color:'crimson'}}>{err}</p>}
      {notice && <p style={{color:'#065f46', background:'#ecfdf5', border:'1px solid #a7f3d0', padding:'8px 12px', borderRadius:8}}>{notice}</p>}

      <div style={{display:'flex', gap:8, flexWrap:'wrap', margin:'16px 0'}}>
        {tabs.map(t => (
          <button key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding:'8px 12px', borderRadius:999, border:'1px solid #ddd',
              background: activeTab===t.key ? 'black' : 'white',
              color: activeTab===t.key ? 'white' : 'black'
            }}>
            {t.key}
          </button>
        ))}
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, alignItems:'start'}}>
        {tabs.find(t => t.key===activeTab).fields.map((field) => {
          if (field === 'Profile Image') {
            return (
              <AttachmentField
                key={field}
                label="Profile Image"
                attachment={profileImage === undefined ? existingProfileImage : profileImage}
                onPick={() => handlePickAndUpload(setProfileImage)}
                onRemove={() => removeImage(setProfileImage)}
                imgStyle={{ width:96, height:96, objectFit:'cover', borderRadius:12 }}
                help="JPG/PNG, max 5MB"
              />
            );
          }
          if (field === 'Header Image') {
            return (
              <AttachmentField
                key={field}
                label="Header Image"
                attachment={headerImage === undefined ? existingHeaderImage : headerImage}
                onPick={() => handlePickAndUpload(setHeaderImage)}
                onRemove={() => removeImage(setHeaderImage)}
                imgStyle={{ width:240, height:120, objectFit:'cover', borderRadius:12 }}
                help="Wide aspect recommended; JPG/PNG, max 5MB"
              />
            );
          }
          return (
            <Field
              key={field}
              label={field}
              value={form[field]}
              onChange={(v)=>handleChange(field, v)}
            />
          );
        })}
      </div>

      <div style={{marginTop:24, display:'flex', gap:12}}>
        <button disabled={saving} onClick={() => handleSave(false)}>Save</button>
        <button disabled={saving} onClick={() => handleSave(true)} style={{background:'black', color:'white'}}>Save & Close</button>
        <button onClick={() => navigate('/speaker-dashboard')}>Cancel</button>
      </div>
    </PageWrap>
  );
}

function PageWrap({children}) {
  return <div style={{padding:24, maxWidth:1100, margin:'0 auto'}}>{children}</div>;
}

function AttachmentField({ label, attachment, onPick, onRemove, imgStyle, help }) {
  const frame = { border:'1px solid #e5e7eb', borderRadius:12, padding:12, background:'#fff', gridColumn:'1 / -1' };
  const labelCss = { fontWeight:600, marginBottom:6, display:'block' };
  return (
    <div style={frame}>
      <span style={labelCss}>{label}</span>
      {attachment?.url ? (
        <div style={{display:'flex', gap:12, alignItems:'center'}}>
          <img src={attachment.url} alt={label} style={imgStyle} />
          <div style={{display:'flex', gap:8}}>
            <button type="button" onClick={onPick}>Replace</button>
            <button type="button" onClick={onRemove}>Remove</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={onPick}>Upload</button>
      )}
      <div style={{fontSize:12, color:'#666'}}>{help}</div>
    </div>
  );
}

// Minimal field renderer; swap with your existing Input components later
function Field({label, value, onChange}) {
  const isLong = [
    'Professional Bio','Education','Achievements','Speaking Topics','Key Messages',
    'Speakers Delivery Style','Why the audience should listen to these topics',
    'What the speeches will address','What participants will learn',
    'What the audience will take home','Benefits for the individual',
    'Benefits for the organisation','Travel Requirements','References',
    'Banking Details','Special Requirements','Additional Info'
  ].includes(label);

  const isMulti = MULTI_FIELDS.has(label);
  const hasSelect = !!SELECTS[label];
  const frame = { border:'1px solid #e5e7eb', borderRadius:12, padding:12, background:'#fff' };
  const labelCss = { fontWeight:600, marginBottom:6, display:'block' };

  if (isMulti && hasSelect) {
    return (
      <div style={frame}>
        <span style={labelCss}>{label}</span>
        <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
          {SELECTS[label].map(opt => {
            const checked = Array.isArray(value) && value.includes(opt);
            return (
              <label key={opt} style={{display:'inline-flex',alignItems:'center', gap:6,
                padding:'6px 10px', border:'1px solid #e5e7eb', borderRadius:999}}>
                <input
                  type="checkbox"
                  checked={!!checked}
                  onChange={(e)=>{
                    const next = new Set(Array.isArray(value) ? value : []);
                    if (e.target.checked) next.add(opt); else next.delete(opt);
                    onChange(Array.from(next));
                  }}
                />
                {opt}
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  if (hasSelect && !isMulti) {
    const opts = SELECTS[label];
    const v = (value && opts.includes(value)) ? value : '';
    return (
      <div style={frame}>
        <span style={labelCss}>{label}</span>
        <select
          value={v}
          onChange={(e)=>onChange(e.target.value)}
          style={{width:'100%', height:38, border:'1px solid #e5e7eb', borderRadius:8, padding:'0 10px'}}
        >
          <option value="">— Select —</option>
          {opts.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        {value && !opts.includes(value) && (
          <div style={{fontSize:12, color:'#a00', marginTop:6}}>
            Current value “{String(value)}” is not in allowed options; pick a value above to save.
          </div>
        )}
      </div>
    );
  }

  if (isLong) {
    return (
      <div style={{gridColumn:'1 / -1', ...frame}}>
        <span style={labelCss}>{label}</span>
        <textarea rows={6} value={value || ''} onChange={(e)=>onChange(e.target.value)}
          style={{width:'100%', border:'1px solid #e5e7eb', borderRadius:8, padding:10}} />
      </div>
    );
  }

  const type = label.toLowerCase().includes('email') ? 'email'
             : label.toLowerCase().includes('url') || ['Website','LinkedIn','Twitter','Video Link 1','Video Link 2','Video Link 3'].includes(label) ? 'url'
             : label.toLowerCase().includes('phone') ? 'tel'
             : 'text';

  return (
    <div style={frame}>
      <span style={labelCss}>{label}</span>
      <input
        type={type}
        value={value || ''}
        onChange={(e)=>onChange(e.target.value)}
        disabled={label==='Email'}
        style={{width:'100%', height:38, border:'1px solid #e5e7eb', borderRadius:8, padding:'0 10px'}}
      />
    </div>
  );
}
