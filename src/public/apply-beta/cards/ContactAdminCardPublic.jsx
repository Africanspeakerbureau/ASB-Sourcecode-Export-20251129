import React from "react";
import { Grid, Text, TextArea } from "./components.jsx";

export default function ContactAdminCardPublic({ form, setField }) {
  return (
    <Grid>
      <Text form={form} setField={setField} id="website" label="Website" />
      <Text form={form} setField={setField} id="linkedin" label="LinkedIn Profile" />
      <Text form={form} setField={setField} id="twitter" label="Twitter/X Profile" />
      <TextArea form={form} setField={setField} id="references" label="References" />
      <Text form={form} setField={setField} id="paName" label="PA Name" />
      <Text form={form} setField={setField} id="paEmail" label="PA Email" />
      <Text form={form} setField={setField} id="paPhone" label="PA Phone" />
      <TextArea form={form} setField={setField} id="bankingDetails" label="Banking Details" />
      <TextArea form={form} setField={setField} id="specialRequirements" label="Special Requirements" />
      <TextArea form={form} setField={setField} id="additionalInfo" label="Additional Info" />
    </Grid>
  );
}
