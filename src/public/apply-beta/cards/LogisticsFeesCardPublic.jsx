import React from "react";
import { Grid, Select, TextArea } from "./components.jsx";
import {
  DISPLAY_FEE,
  TRAVEL_WILLINGNESS,
  FEE_RANGE_LOCAL,
  FEE_RANGE_CONTINENTAL,
  FEE_RANGE_INTERNATIONAL,
  FEE_RANGE_VIRTUAL,
  FEE_RANGE_GENERAL,
} from "@/admin/edit/options";

export default function LogisticsFeesCardPublic({ form, setField }) {
  return (
    <Grid>
      <Select
        form={form}
        setField={setField}
        id="feeRangeLocal"
        options={FEE_RANGE_LOCAL}
        label="Fee Range Local"
        hint="Indicative speaker fee. Final pricing depends on scope, travel and schedule."
      />
      <Select
        form={form}
        setField={setField}
        id="feeRangeContinental"
        options={FEE_RANGE_CONTINENTAL}
        label="Fee Range Continental"
        hint="Indicative speaker fee. Final pricing depends on scope, travel and schedule."
      />
      <Select
        form={form}
        setField={setField}
        id="feeRangeInternational"
        options={FEE_RANGE_INTERNATIONAL}
        label="Fee Range International"
        hint="Indicative speaker fee. Final pricing depends on scope, travel and schedule."
      />
      <Select
        form={form}
        setField={setField}
        id="feeRangeVirtual"
        options={FEE_RANGE_VIRTUAL}
        label="Fee Range Virtual"
        hint="Indicative speaker fee. Final pricing depends on scope, travel and schedule."
      />
      <Select
        form={form}
        setField={setField}
        id="feeRangeGeneral"
        options={FEE_RANGE_GENERAL}
        label="Fee Range General"
        hint="Indicative speaker fee. Final pricing depends on scope, travel and schedule."
      />
      <Select form={form} setField={setField} id="displayFee" options={DISPLAY_FEE} label="Display Fee on site?" />
      <Select form={form} setField={setField} id="travelWillingness" options={TRAVEL_WILLINGNESS} label="Travel Willingness" />
      <TextArea form={form} setField={setField} id="travelRequirements" label="Travel Requirements" />
    </Grid>
  );
}
