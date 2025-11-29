import React from "react";
import { Grid, Text, Select } from "./components.jsx";
import ImageUploadField from "@/public/apply-beta/components/ImageUploadField.jsx";
import { COUNTRIES } from "@/admin/edit/options";

export default function IdentityCardPublic({ form, setField, errors = {} }) {
  return (
    <Grid>
      <Text
        form={form}
        setField={setField}
        id="firstName"
        label="First Name"
        required
        error={errors.firstName}
      />
      <Text
        form={form}
        setField={setField}
        id="lastName"
        label="Last Name"
        required
        error={errors.lastName}
      />
      <Text
        form={form}
        setField={setField}
        id="email"
        label="Email Address"
        type="email"
        required
        error={errors.email}
      />
      <Text
        form={form}
        setField={setField}
        id="phone"
        label="Phone Number"
        inputMode="tel"
        required
        error={errors.phone}
      />
      <Text form={form} setField={setField} id="title" label="Title (Dr/Prof)" />
      <Text form={form} setField={setField} id="professionalTitle" label="Professional Title" />
      <Text form={form} setField={setField} id="company" label="Company/Organization" />
      <Text form={form} setField={setField} id="location" label="Location" />
      <Select form={form} setField={setField} id="country" options={COUNTRIES} label="Country" />
      <ImageUploadField
        label="Profile Image"
        value={form["Profile Image"]}
        onChange={attachment => {
          setField("Profile Image", attachment);
        }}
      />
    </Grid>
  );
}
