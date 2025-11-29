import React from "react";
import { Grid, Select, TextArea } from "./components.jsx";
import { INDUSTRIES, EXPERTISE_LEVEL, YEARS_EXPERIENCE } from "@/admin/edit/options";

export default function BackgroundCardPublic({ form, setField }) {
  return (
    <Grid>
      <Select form={form} setField={setField} id="industry" options={INDUSTRIES} label="Industry" />
      <Select form={form} setField={setField} id="expertiseLevel" options={EXPERTISE_LEVEL} label="Expertise Level" />
      <Select form={form} setField={setField} id="yearsExperience" options={YEARS_EXPERIENCE} label="Years Experience" />
      <TextArea form={form} setField={setField} id="notableAchievements" label="Notable Achievements" />
      <TextArea form={form} setField={setField} id="achievements" label="Achievements" />
      <TextArea form={form} setField={setField} id="education" label="Education" />
    </Grid>
  );
}
