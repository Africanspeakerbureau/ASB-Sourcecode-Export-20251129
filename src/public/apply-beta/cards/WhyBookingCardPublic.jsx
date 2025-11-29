import React from "react";
import { Grid, TextArea } from "./components.jsx";

export default function WhyBookingCardPublic({ form, setField }) {
  return (
    <Grid>
      <TextArea form={form} setField={setField} id="speakersDeliveryStyle" label="Speaker’s Delivery Style" />
      <TextArea form={form} setField={setField} id="whyAudience" label="Why the audience should listen to these topics" />
      <TextArea form={form} setField={setField} id="whatAddress" label="What the speeches will address" />
      <TextArea form={form} setField={setField} id="whatLearn" label="What participants will learn" />
      <TextArea form={form} setField={setField} id="whatTakeHome" label="What the audience will take home" />
      <TextArea form={form} setField={setField} id="benefitsIndividual" label="Benefits for the individual" />
      <TextArea form={form} setField={setField} id="benefitsOrganisation" label="Benefits for the organisation" />
    </Grid>
  );
}
