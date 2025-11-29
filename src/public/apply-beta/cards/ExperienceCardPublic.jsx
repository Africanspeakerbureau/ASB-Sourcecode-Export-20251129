import React from "react";
import { Grid, Select, Chips } from "./components.jsx";
import {
  SPEAKING_EXPERIENCE,
  NUMBER_OF_EVENTS,
  LARGEST_AUDIENCE,
  VIRTUAL_EXPERIENCE,
  TARGET_AUDIENCE,
  DELIVERY_CONTEXT,
} from "@/admin/edit/options";

export default function ExperienceCardPublic({ form, setField }) {
  return (
    <Grid>
      <Select form={form} setField={setField} id="speakingExperience" options={SPEAKING_EXPERIENCE} label="Speaking Experience" />
      <Select form={form} setField={setField} id="numberOfEvents" options={NUMBER_OF_EVENTS} label="Number of Events" />
      <Select form={form} setField={setField} id="largestAudience" options={LARGEST_AUDIENCE} label="Largest Audience" />
      <Select form={form} setField={setField} id="virtualExperience" options={VIRTUAL_EXPERIENCE} label="Virtual Experience" />
      <Chips
        form={form}
        setField={setField}
        id="targetAudience"
        options={TARGET_AUDIENCE}
        label="Target Audience"
        hint="Who is this content best suited for? Choose all that apply."
      />
      <Chips
        form={form}
        setField={setField}
        id="deliveryContext"
        options={DELIVERY_CONTEXT}
        label="Delivery Context"
        hint="Typical settings where you deliver this content."
      />
    </Grid>
  );
}
