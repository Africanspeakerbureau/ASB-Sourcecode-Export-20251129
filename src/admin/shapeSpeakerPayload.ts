import { F } from "./fieldMap";
import { toAirtableAttachments } from "@/utils/airtableAttachments";

// Build the Airtable `fields` object from the dialog state
export function buildFields(state: any) {
  const fields: Record<string, any> = {
    // About
    [F.FirstName]: state.firstName || "",
    [F.LastName]: state.lastName || "",
    [F.Title]: state.title || "",
    [F.ProfessionalTitle]: state.professionalTitle || "",
    [F.Company]: state.company || "",
    [F.Location]: state.location || "",
    [F.Country]: state.country || undefined,

    // Background
    [F.Industry]: state.industry || undefined,
    [F.ExpertiseLevel]: state.expertiseLevel || undefined,
    [F.YearsExperience]: state.yearsExperience || undefined,
    [F.NotableAchievements]: state.notableAchievements || "",
    [F.Achievements]: state.achievements || "",
    [F.Education]: state.education || "",

  // Experience
  [F.SpeakingExperience]: state.speakingExperience || undefined,
  [F.NumberEvents]: state.numberEvents || undefined,
  [F.LargestAudience]: state.largestAudience || undefined,
  [F.VirtualExperience]: state.virtualExperience || undefined,
  [F.TargetAudience]: state.targetAudience?.length ? state.targetAudience : undefined,
  [F.DeliveryContext]: state.deliveryContext?.length ? state.deliveryContext : undefined,

  // Content
  [F.ExpertiseAreas]: state.expertiseAreas?.length ? state.expertiseAreas : undefined,
  [F.SpeakingTopics]: state.speakingTopics || "",
  [F.KeyMessages]: state.keyMessages || "",
  [F.ProfessionalBio]: state.professionalBio || "",
  [F.SpeechesDetailed]: state.speechesDetailed || "",

    // Why booking
    [F.DeliveryStyle]: state.deliveryStyle || "",
    [F.WhyListen]: state.whyListen || "",
    [F.WillAddress]: state.willAddress || "",
    [F.WillLearn]: state.willLearn || "",
    [F.TakeHome]: state.takeHome || "",
    [F.BenefitIndividual]: state.benefitIndividual || "",
    [F.BenefitOrg]: state.benefitOrg || "",

    // Media
    [F.Video1]: state.video1 || "",
    [F.Video2]: state.video2 || "",
  [F.Video3]: state.video3 || "",
  [F.SpokenLanguages]: state.spokenLanguages?.length ? state.spokenLanguages : undefined,

  // Logistics
  [F.FeeRangeLocal]: state.feeRangeLocal || undefined,
  [F.FeeRangeContinental]: state.feeRangeContinental || undefined,
  [F.FeeRangeInternational]: state.feeRangeInternational || undefined,
  [F.FeeRangeVirtual]: state.feeRangeVirtual || undefined,
  [F.FeeRangeGeneral]: state.feeRangeGeneral || undefined,
  [F.DisplayFee]: state.displayFee || undefined,
  [F.TravelWillingness]: state.travelWillingness || undefined,
  [F.TravelRequirements]: state.travelRequirements || "",

    // Links & Admin
    [F.Website]: state.website || "",
    [F.LinkedIn]: state.linkedin || "",
    [F.Twitter]: state.twitter || "",
    [F.References]: state.references || "",
    [F.PAName]: state.paName || "",
    [F.PAEmail]: state.paEmail || "",
    [F.PAPhone]: state.paPhone || "",
    [F.Banking]: state.banking || "",
    [F.AdditionalInfo]: state.additionalInfo || "",

    // Internal (writeable parts)
    [F.Status]: state.status?.length ? state.status : undefined,
    [F.Featured]: state.featured || undefined,
    [F.InternalNotes]: state.internalNotes || "",
  };

  // Fallback: some bases use "Twitter" (no "Profile")
  if (!fields[F.Twitter] && state.twitter) fields["Twitter"] = state.twitter;

  // Attachments
  const prof = toAirtableAttachments(state.profileImageUrls);
  const head = toAirtableAttachments(state.headerImageUrls);
  if (typeof prof !== 'undefined') fields[F.ProfileImage] = prof;
  if (typeof head !== 'undefined') fields[F.HeaderImage] = head;

  return fields;
}
