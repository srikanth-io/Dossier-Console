/** Dialing codes for the phone-number field. The default market (India)
 *  leads the list so the select can default to +91. */

export type CountryCode = {
  code: string
  country: string
}

export const DEFAULT_COUNTRY_CODE = "+91"

export const countryCodes: CountryCode[] = [
  { code: "+91", country: "India" },
  { code: "+1", country: "United States / Canada" },
  { code: "+44", country: "United Kingdom" },
  { code: "+61", country: "Australia" },
  { code: "+65", country: "Singapore" },
  { code: "+60", country: "Malaysia" },
  { code: "+971", country: "United Arab Emirates" },
  { code: "+49", country: "Germany" },
  { code: "+33", country: "France" },
  { code: "+81", country: "Japan" },
  { code: "+86", country: "China" },
  { code: "+55", country: "Brazil" },
  { code: "+27", country: "South Africa" },
]
