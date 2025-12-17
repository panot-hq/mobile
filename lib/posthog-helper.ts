export enum EVENT_TYPES {
  // contacts
  START_MANUAL_NEW_CONTACT = "START_MANUAL_NEW_CONTACT",
  CANCEL_MANUAL_NEW_CONTACT = "CANCEL_MANUAL_NEW_CONTACT",
  MANUAL_NEW_CONTACT_SUCCESS = "MANUAL_NEW_CONTACT_SUCCESS",

  START_RECORDING_NEW_CONTACT = "START_RECORDING_NEW_CONTACT",
  EDIT_TEXT_RECORDING_NEW_CONTACT = "EDIT_TEXT_RECORDING_NEW_CONTACT",
  CANCEL_RECORDING_NEW_CONTACT = "CANCEL_RECORDING_NEW_CONTACT",
  RECORDING_NEW_CONTACT_SUCCESS = "RECORDING_NEW_CONTACT_SUCCESS",

  START_IMPORTING_NEW_CONTACT = "START_IMPORTING_NEW_CONTACT",
  IMPORTING_NEW_CONTACT_SUCCESS = "IMPORTING_NEW_CONTACT_SUCCESS",

  START_MANUAL_EDIT_CONTACT = "START_MANUAL_EDIT_CONTACT",
  CANCEL_MANUAL_EDIT_CONTACT = "CANCEL_MANUAL_EDIT_CONTACT",
  MANUAL_EDIT_CONTACT_SUCCESS = "MANUAL_EDIT_CONTACT_SUCCESS",
  DELETE_MANUAL_CONTACT = "DELETE_MANUAL_CONTACT",

  VIEW_CONTACT = "VIEW_CONTACT",

  // interactions
  START_INTERACTION_RECORDING = "START_INTERACTION_RECORDING",
  CANCEL_INTERACTION_RECORDING = "CANCEL_INTERACTION_RECORDING",
  EDIT_TEXT_RECORDING_INTERACTION = "EDIT_TEXT_RECORDING_INTERACTION",
  INTERACTION_RECORDING_SUCCESS = "INTERACTION_RECORDING_SUCCESS",

  ASSIGN_UNASSIGNED_INTERACTION = "ASSIGN_UNASSIGNED_INTERACTION",
  SELECT_CONTACT_TO_ASSIGN_INTERACTION = "SELECT_CONTACT_TO_ASSIGN_INTERACTION",
  ASSIGN_INTERACTION_SUCCESS = "ASSIGN_INTERACTION_SUCCESS",

  VIEW_INTERACTION = "VIEW_INTERACTION",
  DELETE_INTERACTION = "DELETE_INTERACTION",
  MANUAL_PROCESS_INTERACTION = "MANUAL_PROCESS_INTERACTION",
}

export default function capture_event(
  event_name: string,
  posthog?: any,
  properties: Record<string, any> = {}
) {
  if (!posthog) return;

  posthog.capture(event_name, {
    $geoip_accuracy_radius: false,
    $geoip_city_name: false,
    $geoip_continent_code: false,
    $geoip_continent_name: false,
    $geoip_country_code: false,
    $geoip_country_name: false,
    $geoip_disable: true,
    $geoip_latitude: false,
    $geoip_longitude: false,
    $geoip_postal_code: false,
    $geoip_subdivision_1_code: false,
    $geoip_subdivision_1_name: false,
    $geoip_subdivision_2_code: false,
    $geoip_subdivision_2_name: false,
    $geoip_time_zone: false,
    $ip: "",
    $locale: false,
    $timezone: false,
    ...properties,
  });
}
