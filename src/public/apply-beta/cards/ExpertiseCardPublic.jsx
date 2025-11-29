import React from "react";
import { Grid, Chips, TextArea, Field } from "./components.jsx";
import { EXPERTISE_AREAS } from "@/admin/edit/options";

export default function ExpertiseCardPublic({ form, setField }) {
  return (
    <Grid>
      <Chips
        form={form}
        setField={setField}
        id="expertiseAreas"
        options={EXPERTISE_AREAS}
        label="Area of Expertise"
      />

      {/* Key Message: compact textarea, half width */}
      <TextArea form={form} setField={setField} id="keyMessage" label="Key Message" rows={4} />

      {/* Speaking Topics: full width, one per line */}
      <Field label="Speaking Topics (one per line)" className="field--full">
        <textarea
          className="textarea"
          rows={8}
          value={
            form.speakingTopicsText ??
            (Array.isArray(form.speakingTopics)
              ? form.speakingTopics.join("\n")
              : form.speakingTopics || "")
          }
          onChange={e => setField("speakingTopicsText", e.target.value)}
          style={{ resize: "vertical" }}
        />
      </Field>

      <TextArea
        form={form}
        setField={setField}
        id="speechesDetailed"
        label="Speeches Detailed"
        rows={8}
        hint="Optionally paste detailed descriptions or outlines for your talks (multiple talks welcome)."
      />

      {/* Professional Bio: full width */}
      <Field
        label="Professional Bio"
        className="field--full"
        hint="Tip: use new lines for paragraphs or bullets."
      >
        <textarea
          className="textarea"
          rows={12}
          value={form.professionalBio || form.bio || ""}
          onChange={e => {
            setField("professionalBio", e.target.value);
            setField("bio", e.target.value);
          }}
          style={{ resize: "vertical" }}
        />
      </Field>
    </Grid>
  );
}
