import React from "react";

export function Grid({ children }) {
  return <div className="grid">{children}</div>;
}

export function Field({
  label,
  hint,
  children,
  required,
  className = "",
  error,
  id,
}) {
  const hintId = hint && id ? `${id}-hint` : undefined;
  const child = hintId ? React.cloneElement(children, { 'aria-describedby': hintId }) : children;
  return (
    <label className={`field ${className}`} data-field={id}>
      <div className="field__label">
        {label}
        {required && <span className="text-red-500">*</span>}
      </div>
      {child}
      {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
      {hint && (
        <div className="field__hint" id={hintId}>
          {hint}
        </div>
      )}
    </label>
  );
}

export function Text({
  form,
  setField,
  id,
  label,
  required,
  type = "text",
  inputMode,
  error,
  hint,
}) {
  return (
    <Field label={label ?? id} required={required} error={error} id={id} hint={hint}>
      <input
        className="input"
        value={form[id] ?? ""}
        onChange={e => setField(id, e.target.value)}
        placeholder={label ?? id}
        required={required}
        type={type}
        inputMode={inputMode}
        aria-invalid={!!error}
      />
    </Field>
  );
}

export function TextArea({ form, setField, id, label, rows = 4, hint }) {
  return (
    <Field label={label ?? id} hint={hint} id={id}>
      <textarea
        className="textarea"
        value={form[id] ?? ""}
        onChange={e => setField(id, e.target.value)}
        rows={rows}
        style={{ resize: "vertical" }}
      />
    </Field>
  );
}

export function Select({ form, setField, id, options, label, hint }) {
  return (
    <Field label={label ?? id} hint={hint} id={id}>
      <select
        className="select"
        value={form[id] ?? ""}
        onChange={e => setField(id, e.target.value)}
      >
        <option value="">— Select —</option>
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </Field>
  );
}

export function Chips({ form, setField, id, options, allowMulti = true, label, hint }) {
  const value = Array.isArray(form[id])
    ? form[id]
    : form[id]
    ? String(form[id]).split(",").map(s => s.trim())
    : [];
  const toggle = v => {
    if (allowMulti) {
      const next = value.includes(v) ? value.filter(x => x !== v) : [...value, v];
      setField(id, next);
    } else {
      setField(id, value.includes(v) ? "" : v);
    }
  };
  return (
    <Field label={label ?? id} hint={hint} id={id}>
      <div className="chips">
        {options.map(v => (
          <button
            type="button"
            key={v}
            className={`chip ${value.includes(v) ? "chip--on" : ""}`}
            onClick={() => toggle(v)}
          >
            {v}
          </button>
        ))}
      </div>
    </Field>
  );
}
