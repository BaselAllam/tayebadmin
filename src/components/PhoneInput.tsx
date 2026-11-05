import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const countryCodes = [
  { code: "+93", country: "AF", flag: "🇦🇫", name: "Afghanistan" },
  { code: "+358-18", country: "AX", flag: "🇦🇽", name: "Åland Islands" },
  { code: "+355", country: "AL", flag: "🇦🇱", name: "Albania" },
  { code: "+213", country: "DZ", flag: "🇩🇿", name: "Algeria" },
  { code: "+1-684", country: "AS", flag: "🇦🇸", name: "American Samoa" },
  { code: "+376", country: "AD", flag: "🇦🇩", name: "Andorra" },
  { code: "+244", country: "AO", flag: "🇦🇴", name: "Angola" },
  { code: "+1-264", country: "AI", flag: "🇦🇮", name: "Anguilla" },
  { code: "+672", country: "AQ", flag: "🇦🇶", name: "Antarctica" },
  { code: "+1-268", country: "AG", flag: "🇦🇬", name: "Antigua and Barbuda" },
  { code: "+54", country: "AR", flag: "🇦🇷", name: "Argentina" },
  { code: "+374", country: "AM", flag: "🇦🇲", name: "Armenia" },
  { code: "+297", country: "AW", flag: "🇦🇼", name: "Aruba" },
  { code: "+61", country: "AU", flag: "🇦🇺", name: "Australia" },
  { code: "+43", country: "AT", flag: "🇦🇹", name: "Austria" },
  { code: "+994", country: "AZ", flag: "🇦🇿", name: "Azerbaijan" },
  { code: "+1-242", country: "BS", flag: "🇧🇸", name: "Bahamas" },
  { code: "+973", country: "BH", flag: "🇧🇭", name: "Bahrain" },
  { code: "+880", country: "BD", flag: "🇧🇩", name: "Bangladesh" },
  { code: "+1-246", country: "BB", flag: "🇧🇧", name: "Barbados" },
  { code: "+375", country: "BY", flag: "🇧🇾", name: "Belarus" },
  { code: "+32", country: "BE", flag: "🇧🇪", name: "Belgium" },
  { code: "+501", country: "BZ", flag: "🇧🇿", name: "Belize" },
  { code: "+229", country: "BJ", flag: "🇧🇯", name: "Benin" },
  { code: "+1-441", country: "BM", flag: "🇧🇲", name: "Bermuda" },
  { code: "+975", country: "BT", flag: "🇧🇹", name: "Bhutan" },
  { code: "+591", country: "BO", flag: "🇧🇴", name: "Bolivia" },
  { code: "+599", country: "BQ", flag: "🇧🇶", name: "Bonaire, Sint Eustatius and Saba" },
  { code: "+387", country: "BA", flag: "🇧🇦", name: "Bosnia and Herzegovina" },
  { code: "+267", country: "BW", flag: "🇧🇼", name: "Botswana" },
  { code: "+55", country: "BR", flag: "🇧🇷", name: "Brazil" },
  { code: "+246", country: "IO", flag: "🇮🇴", name: "British Indian Ocean Territory" },
  { code: "+1-284", country: "VG", flag: "🇻🇬", name: "British Virgin Islands" },
  { code: "+673", country: "BN", flag: "🇧🇳", name: "Brunei" },
  { code: "+359", country: "BG", flag: "🇧🇬", name: "Bulgaria" },
  { code: "+226", country: "BF", flag: "🇧🇫", name: "Burkina Faso" },
  { code: "+257", country: "BI", flag: "🇧🇮", name: "Burundi" },
  { code: "+238", country: "CV", flag: "🇨🇻", name: "Cabo Verde" },
  { code: "+855", country: "KH", flag: "🇰🇭", name: "Cambodia" },
  { code: "+237", country: "CM", flag: "🇨🇲", name: "Cameroon" },
  { code: "+1", country: "CA", flag: "🇨🇦", name: "Canada" },
  { code: "+1-345", country: "KY", flag: "🇰🇾", name: "Cayman Islands" },
  { code: "+236", country: "CF", flag: "🇨🇫", name: "Central African Republic" },
  { code: "+235", country: "TD", flag: "🇹🇩", name: "Chad" },
  { code: "+56", country: "CL", flag: "🇨🇱", name: "Chile" },
  { code: "+86", country: "CN", flag: "🇨🇳", name: "China" },
  { code: "+61", country: "CX", flag: "🇨🇽", name: "Christmas Island" },
  { code: "+61", country: "CC", flag: "🇨🇨", name: "Cocos (Keeling) Islands" },
  { code: "+57", country: "CO", flag: "🇨🇴", name: "Colombia" },
  { code: "+269", country: "KM", flag: "🇰🇲", name: "Comoros" },
  { code: "+242", country: "CG", flag: "🇨🇬", name: "Congo (Republic)" },
  { code: "+243", country: "CD", flag: "🇨🇩", name: "Congo (DRC)" },
  { code: "+682", country: "CK", flag: "🇨🇰", name: "Cook Islands" },
  { code: "+506", country: "CR", flag: "🇨🇷", name: "Costa Rica" },
  { code: "+225", country: "CI", flag: "🇨🇮", name: "Côte d'Ivoire" },
  { code: "+385", country: "HR", flag: "🇭🇷", name: "Croatia" },
  { code: "+53", country: "CU", flag: "🇨🇺", name: "Cuba" },
  { code: "+599", country: "CW", flag: "🇨🇼", name: "Curaçao" },
  { code: "+357", country: "CY", flag: "🇨🇾", name: "Cyprus" },
  { code: "+420", country: "CZ", flag: "🇨🇿", name: "Czech Republic" },
  { code: "+45", country: "DK", flag: "🇩🇰", name: "Denmark" },
  { code: "+253", country: "DJ", flag: "🇩🇯", name: "Djibouti" },
  { code: "+1-767", country: "DM", flag: "🇩🇲", name: "Dominica" },
  { code: "+1-809", country: "DO", flag: "🇩🇴", name: "Dominican Republic" },
  { code: "+593", country: "EC", flag: "🇪🇨", name: "Ecuador" },
  { code: "+20", country: "EG", flag: "🇪🇬", name: "Egypt" },
  { code: "+503", country: "SV", flag: "🇸🇻", name: "El Salvador" },
  { code: "+240", country: "GQ", flag: "🇬🇶", name: "Equatorial Guinea" },
  { code: "+291", country: "ER", flag: "🇪🇷", name: "Eritrea" },
  { code: "+372", country: "EE", flag: "🇪🇪", name: "Estonia" },
  { code: "+268", country: "SZ", flag: "🇸🇿", name: "Eswatini" },
  { code: "+251", country: "ET", flag: "🇪🇹", name: "Ethiopia" },
  { code: "+500", country: "FK", flag: "🇫🇰", name: "Falkland Islands" },
  { code: "+298", country: "FO", flag: "🇫🇴", name: "Faroe Islands" },
  { code: "+679", country: "FJ", flag: "🇫🇯", name: "Fiji" },
  { code: "+358", country: "FI", flag: "🇫🇮", name: "Finland" },
  { code: "+33", country: "FR", flag: "🇫🇷", name: "France" },
  { code: "+594", country: "GF", flag: "🇬🇫", name: "French Guiana" },
  { code: "+689", country: "PF", flag: "🇵🇫", name: "French Polynesia" },
  { code: "+241", country: "GA", flag: "🇬🇦", name: "Gabon" },
  { code: "+220", country: "GM", flag: "🇬🇲", name: "Gambia" },
  { code: "+995", country: "GE", flag: "🇬🇪", name: "Georgia" },
  { code: "+49", country: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "+233", country: "GH", flag: "🇬🇭", name: "Ghana" },
  { code: "+350", country: "GI", flag: "🇬🇮", name: "Gibraltar" },
  { code: "+30", country: "GR", flag: "🇬🇷", name: "Greece" },
  { code: "+299", country: "GL", flag: "🇬🇱", name: "Greenland" },
  { code: "+1-473", country: "GD", flag: "🇬🇩", name: "Grenada" },
  { code: "+590", country: "GP", flag: "🇬🇵", name: "Guadeloupe" },
  { code: "+1-671", country: "GU", flag: "🇬🇺", name: "Guam" },
  { code: "+502", country: "GT", flag: "🇬🇹", name: "Guatemala" },
  { code: "+44-1481", country: "GG", flag: "🇬🇬", name: "Guernsey" },
  { code: "+224", country: "GN", flag: "🇬🇳", name: "Guinea" },
  { code: "+245", country: "GW", flag: "🇬🇼", name: "Guinea-Bissau" },
  { code: "+592", country: "GY", flag: "🇬🇾", name: "Guyana" },
  { code: "+509", country: "HT", flag: "🇭🇹", name: "Haiti" },
  { code: "+504", country: "HN", flag: "🇭🇳", name: "Honduras" },
  { code: "+852", country: "HK", flag: "🇭🇰", name: "Hong Kong" },
  { code: "+36", country: "HU", flag: "🇭🇺", name: "Hungary" },
  { code: "+354", country: "IS", flag: "🇮🇸", name: "Iceland" },
  { code: "+91", country: "IN", flag: "🇮🇳", name: "India" },
  { code: "+62", country: "ID", flag: "🇮🇩", name: "Indonesia" },
  { code: "+98", country: "IR", flag: "🇮🇷", name: "Iran" },
  { code: "+964", country: "IQ", flag: "🇮🇶", name: "Iraq" },
  { code: "+353", country: "IE", flag: "🇮🇪", name: "Ireland" },
  { code: "+44-1624", country: "IM", flag: "🇮🇲", name: "Isle of Man" },
  { code: "+972", country: "IL", flag: "🇮🇱", name: "Israel" },
  { code: "+39", country: "IT", flag: "🇮🇹", name: "Italy" },
  { code: "+1-876", country: "JM", flag: "🇯🇲", name: "Jamaica" },
  { code: "+81", country: "JP", flag: "🇯🇵", name: "Japan" },
  { code: "+44-1534", country: "JE", flag: "🇯🇪", name: "Jersey" },
  { code: "+962", country: "JO", flag: "🇯🇴", name: "Jordan" },
  { code: "+7", country: "KZ", flag: "🇰🇿", name: "Kazakhstan" },
  { code: "+254", country: "KE", flag: "🇰🇪", name: "Kenya" },
  { code: "+686", country: "KI", flag: "🇰🇮", name: "Kiribati" },
  { code: "+383", country: "XK", flag: "🇽🇰", name: "Kosovo" },
  { code: "+965", country: "KW", flag: "🇰🇼", name: "Kuwait" },
  { code: "+996", country: "KG", flag: "🇰🇬", name: "Kyrgyzstan" },
  { code: "+856", country: "LA", flag: "🇱🇦", name: "Laos" },
  { code: "+371", country: "LV", flag: "🇱🇻", name: "Latvia" },
  { code: "+961", country: "LB", flag: "🇱🇧", name: "Lebanon" },
  { code: "+266", country: "LS", flag: "🇱🇸", name: "Lesotho" },
  { code: "+231", country: "LR", flag: "🇱🇷", name: "Liberia" },
  { code: "+218", country: "LY", flag: "🇱🇾", name: "Libya" },
  { code: "+423", country: "LI", flag: "🇱🇮", name: "Liechtenstein" },
  { code: "+370", country: "LT", flag: "🇱🇹", name: "Lithuania" },
  { code: "+352", country: "LU", flag: "🇱🇺", name: "Luxembourg" },
  { code: "+853", country: "MO", flag: "🇲🇴", name: "Macau" },
  { code: "+389", country: "MK", flag: "🇲🇰", name: "North Macedonia" },
  { code: "+261", country: "MG", flag: "🇲🇬", name: "Madagascar" },
  { code: "+265", country: "MW", flag: "🇲🇼", name: "Malawi" },
  { code: "+60", country: "MY", flag: "🇲🇾", name: "Malaysia" },
  { code: "+960", country: "MV", flag: "🇲🇻", name: "Maldives" },
  { code: "+223", country: "ML", flag: "🇲🇱", name: "Mali" },
  { code: "+356", country: "MT", flag: "🇲🇹", name: "Malta" },
  { code: "+692", country: "MH", flag: "🇲🇭", name: "Marshall Islands" },
  { code: "+596", country: "MQ", flag: "🇲🇶", name: "Martinique" },
  { code: "+222", country: "MR", flag: "🇲🇷", name: "Mauritania" },
  { code: "+230", country: "MU", flag: "🇲🇺", name: "Mauritius" },
  { code: "+262", country: "YT", flag: "🇾🇹", name: "Mayotte" },
  { code: "+52", country: "MX", flag: "🇲🇽", name: "Mexico" },
  { code: "+691", country: "FM", flag: "🇫🇲", name: "Micronesia" },
  { code: "+373", country: "MD", flag: "🇲🇩", name: "Moldova" },
  { code: "+377", country: "MC", flag: "🇲🇨", name: "Monaco" },
  { code: "+976", country: "MN", flag: "🇲🇳", name: "Mongolia" },
  { code: "+382", country: "ME", flag: "🇲🇪", name: "Montenegro" },
  { code: "+1-664", country: "MS", flag: "🇲🇸", name: "Montserrat" },
  { code: "+212", country: "MA", flag: "🇲🇦", name: "Morocco" },
  { code: "+258", country: "MZ", flag: "🇲🇿", name: "Mozambique" },
  { code: "+95", country: "MM", flag: "🇲🇲", name: "Myanmar" },
  { code: "+264", country: "NA", flag: "🇳🇦", name: "Namibia" },
  { code: "+674", country: "NR", flag: "🇳🇷", name: "Nauru" },
  { code: "+977", country: "NP", flag: "🇳🇵", name: "Nepal" },
  { code: "+31", country: "NL", flag: "🇳🇱", name: "Netherlands" },
  { code: "+687", country: "NC", flag: "🇳🇨", name: "New Caledonia" },
  { code: "+64", country: "NZ", flag: "🇳🇿", name: "New Zealand" },
  { code: "+505", country: "NI", flag: "🇳🇮", name: "Nicaragua" },
  { code: "+227", country: "NE", flag: "🇳🇪", name: "Niger" },
  { code: "+234", country: "NG", flag: "🇳🇬", name: "Nigeria" },
  { code: "+683", country: "NU", flag: "🇳🇺", name: "Niue" },
  { code: "+672", country: "NF", flag: "🇳🇫", name: "Norfolk Island" },
  { code: "+850", country: "KP", flag: "🇰🇵", name: "North Korea" },
  { code: "+1-670", country: "MP", flag: "🇲🇵", name: "Northern Mariana Islands" },
  { code: "+47", country: "NO", flag: "🇳🇴", name: "Norway" },
  { code: "+968", country: "OM", flag: "🇴🇲", name: "Oman" },
  { code: "+92", country: "PK", flag: "🇵🇰", name: "Pakistan" },
  { code: "+680", country: "PW", flag: "🇵🇼", name: "Palau" },
  { code: "+970", country: "PS", flag: "🇵🇸", name: "Palestine" },
  { code: "+507", country: "PA", flag: "🇵🇦", name: "Panama" },
  { code: "+675", country: "PG", flag: "🇵🇬", name: "Papua New Guinea" },
  { code: "+595", country: "PY", flag: "🇵🇾", name: "Paraguay" },
  { code: "+51", country: "PE", flag: "🇵🇪", name: "Peru" },
  { code: "+63", country: "PH", flag: "🇵🇭", name: "Philippines" },
  { code: "+64", country: "PN", flag: "🇵🇳", name: "Pitcairn Islands" },
  { code: "+48", country: "PL", flag: "🇵🇱", name: "Poland" },
  { code: "+351", country: "PT", flag: "🇵🇹", name: "Portugal" },
  { code: "+1-787", country: "PR", flag: "🇵🇷", name: "Puerto Rico" },
  { code: "+974", country: "QA", flag: "🇶🇦", name: "Qatar" },
  { code: "+262", country: "RE", flag: "🇷🇪", name: "Réunion" },
  { code: "+40", country: "RO", flag: "🇷🇴", name: "Romania" },
  { code: "+7", country: "RU", flag: "🇷🇺", name: "Russia" },
  { code: "+250", country: "RW", flag: "🇷🇼", name: "Rwanda" },
  { code: "+590", country: "BL", flag: "🇧🇱", name: "Saint Barthélemy" },
  { code: "+290", country: "SH", flag: "🇸🇭", name: "Saint Helena" },
  { code: "+1-869", country: "KN", flag: "🇰🇳", name: "Saint Kitts and Nevis" },
  { code: "+1-758", country: "LC", flag: "🇱🇨", name: "Saint Lucia" },
  { code: "+590", country: "MF", flag: "🇲🇫", name: "Saint Martin" },
  { code: "+508", country: "PM", flag: "🇵🇲", name: "Saint Pierre and Miquelon" },
  { code: "+1-784", country: "VC", flag: "🇻🇨", name: "Saint Vincent and the Grenadines" },
  { code: "+685", country: "WS", flag: "🇼🇸", name: "Samoa" },
  { code: "+378", country: "SM", flag: "🇸🇲", name: "San Marino" },
  { code: "+239", country: "ST", flag: "🇸🇹", name: "São Tomé and Príncipe" },
  { code: "+966", country: "SA", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+221", country: "SN", flag: "🇸🇳", name: "Senegal" },
  { code: "+381", country: "RS", flag: "🇷🇸", name: "Serbia" },
  { code: "+248", country: "SC", flag: "🇸🇨", name: "Seychelles" },
  { code: "+232", country: "SL", flag: "🇸🇱", name: "Sierra Leone" },
  { code: "+65", country: "SG", flag: "🇸🇬", name: "Singapore" },
  { code: "+1-721", country: "SX", flag: "🇸🇽", name: "Sint Maarten" },
  { code: "+421", country: "SK", flag: "🇸🇰", name: "Slovakia" },
  { code: "+386", country: "SI", flag: "🇸🇮", name: "Slovenia" },
  { code: "+677", country: "SB", flag: "🇸🇧", name: "Solomon Islands" },
  { code: "+252", country: "SO", flag: "🇸🇴", name: "Somalia" },
  { code: "+27", country: "ZA", flag: "🇿🇦", name: "South Africa" },
  { code: "+500", country: "GS", flag: "🇬🇸", name: "South Georgia and the South Sandwich Islands" },
  { code: "+82", country: "KR", flag: "🇰🇷", name: "South Korea" },
  { code: "+211", country: "SS", flag: "🇸🇸", name: "South Sudan" },
  { code: "+34", country: "ES", flag: "🇪🇸", name: "Spain" },
  { code: "+94", country: "LK", flag: "🇱🇰", name: "Sri Lanka" },
  { code: "+249", country: "SD", flag: "🇸🇩", name: "Sudan" },
  { code: "+597", country: "SR", flag: "🇸🇷", name: "Suriname" },
  { code: "+47", country: "SJ", flag: "🇸🇯", name: "Svalbard and Jan Mayen" },
  { code: "+46", country: "SE", flag: "🇸🇪", name: "Sweden" },
  { code: "+41", country: "CH", flag: "🇨🇭", name: "Switzerland" },
  { code: "+963", country: "SY", flag: "🇸🇾", name: "Syria" },
  { code: "+886", country: "TW", flag: "🇹🇼", name: "Taiwan" },
  { code: "+992", country: "TJ", flag: "🇹🇯", name: "Tajikistan" },
  { code: "+255", country: "TZ", flag: "🇹🇿", name: "Tanzania" },
  { code: "+66", country: "TH", flag: "🇹🇭", name: "Thailand" },
  { code: "+670", country: "TL", flag: "🇹🇱", name: "Timor-Leste" },
  { code: "+228", country: "TG", flag: "🇹🇬", name: "Togo" },
  { code: "+690", country: "TK", flag: "🇹🇰", name: "Tokelau" },
  { code: "+676", country: "TO", flag: "🇹🇴", name: "Tonga" },
  { code: "+1-868", country: "TT", flag: "🇹🇹", name: "Trinidad and Tobago" },
  { code: "+216", country: "TN", flag: "🇹🇳", name: "Tunisia" },
  { code: "+90", country: "TR", flag: "🇹🇷", name: "Turkey" },
  { code: "+993", country: "TM", flag: "🇹🇲", name: "Turkmenistan" },
  { code: "+1-649", country: "TC", flag: "🇹🇨", name: "Turks and Caicos Islands" },
  { code: "+688", country: "TV", flag: "🇹🇻", name: "Tuvalu" },
  { code: "+256", country: "UG", flag: "🇺🇬", name: "Uganda" },
  { code: "+380", country: "UA", flag: "🇺🇦", name: "Ukraine" },
  { code: "+971", country: "AE", flag: "🇦🇪", name: "United Arab Emirates" },
  { code: "+44", country: "GB", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+1", country: "US", flag: "🇺🇸", name: "United States" },
  { code: "+598", country: "UY", flag: "🇺🇾", name: "Uruguay" },
  { code: "+1-340", country: "VI", flag: "🇻🇮", name: "U.S. Virgin Islands" },
  { code: "+998", country: "UZ", flag: "🇺🇿", name: "Uzbekistan" },
  { code: "+678", country: "VU", flag: "🇻🇺", name: "Vanuatu" },
  { code: "+379", country: "VA", flag: "🇻🇦", name: "Vatican City" },
  { code: "+58", country: "VE", flag: "🇻🇪", name: "Venezuela" },
  { code: "+84", country: "VN", flag: "🇻🇳", name: "Vietnam" },
  { code: "+681", country: "WF", flag: "🇼🇫", name: "Wallis and Futuna" },
  { code: "+212", country: "EH", flag: "🇪🇭", name: "Western Sahara" },
  { code: "+967", country: "YE", flag: "🇾🇪", name: "Yemen" },
  { code: "+260", country: "ZM", flag: "🇿🇲", name: "Zambia" },
  { code: "+263", country: "ZW", flag: "🇿🇼", name: "Zimbabwe" },
];

const sortedCodesByLength = [...countryCodes].sort((a, b) => b.code.length - a.code.length);

const CountryOptionsList = React.memo(function CountryOptionsList({
  countries,
  showFlag,
}: {
  countries: typeof countryCodes;
  showFlag: boolean;
}) {
  if (countries.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        No countries found
      </div>
    );
  }

  return (
    <>
      {countries.map((country) => (
        <SelectItem
          key={country.country}
          value={country.country}
          className="cursor-pointer"
        >
          {showFlag ? (
            <span className="flex items-center gap-2">
              <span className="text-lg">{country.flag}</span>
              <span className="flex-1">{country.name}</span>
              <span className="text-gray-500 text-sm">{country.code}</span>
            </span>
          ) : (
            `${country.name} (${country.code})`
          )}
        </SelectItem>
      ))}
    </>
  );
});

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  showFlag?: boolean;
  defaultCountry?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = "Phone number",
  className = "",
  required = false,
  showFlag = true,
  defaultCountry = "EG",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  
  const getInitialValues = useCallback((value: string) => {
    if (!value) {
      const fallback = countryCodes.find(c => c.country === defaultCountry) || countryCodes[0];
      return { iso: fallback.country, number: "" };
    }

    const match = sortedCodesByLength.find(c => value.startsWith(c.code));

    if (match) {
      return {
        iso: match.country,
        number: value.slice(match.code.length),
      };
    }

    const fallback = countryCodes.find(c => c.country === defaultCountry) || countryCodes[0];
    return { iso: fallback.country, number: value };
  }, [defaultCountry]);

  const { iso: initialIso, number: initialNumber } = useMemo(
    () => getInitialValues(value),
    []
  );
  const [countryIso, setCountryIso] = useState(initialIso);
  const [phoneNumber, setPhoneNumber] = useState(initialNumber);
  
  const lastEmitted = useRef(value);

  useEffect(() => {
    if (value === lastEmitted.current) return;
    const { iso, number } = getInitialValues(value);
    setCountryIso(iso);
    setPhoneNumber(number);
    lastEmitted.current = value;
  }, [value, getInitialValues]);

  const currentCountry = useMemo(
    () =>
      countryCodes.find(c => c.country === countryIso) ||
      countryCodes.find(c => c.country === defaultCountry) ||
      countryCodes[0],
    [countryIso, defaultCountry]
  );

  const handleCountryChange = useCallback((newIso: string) => {
    const country = countryCodes.find(c => c.country === newIso);
    if (!country) return;
    setCountryIso(newIso);
    const next = `${country.code}${phoneNumber}`;
    lastEmitted.current = next;
    onChange(next);
    setSearchQuery("");
    setIsOpen(false);
  }, [phoneNumber, onChange]);

  const handlePhoneNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value.replace(/\D/g, '');
    setPhoneNumber(newNumber);
    const next = `${currentCountry.code}${newNumber}`;
    lastEmitted.current = next;
    onChange(next);
  }, [currentCountry, onChange]);
  
  const filteredCountries = useMemo(() => {
    if (!searchQuery) return countryCodes;
    const query = searchQuery.toLowerCase();
    return countryCodes.filter(country =>
      country.name.toLowerCase().includes(query) ||
      country.country.toLowerCase().includes(query) ||
      country.code.includes(query)
    );
  }, [searchQuery]);

  return (
    <div className={`flex gap-2 ${className}`}>
      <Select
        value={countryIso}
        onValueChange={handleCountryChange}
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) setSearchQuery("");
        }}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue>
            {showFlag ? (
              <span className="flex items-center gap-2">
                <span className="text-lg">{currentCountry.flag}</span>
                <span className="text-sm">{currentCountry.code}</span>
              </span>
            ) : (
              currentCountry.code
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="w-[320px]">
          <div className="sticky top-0 bg-white dark:bg-gray-950 p-2 border-b z-10">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filteredCountries.length > 0) {
                    handleCountryChange(filteredCountries[0].country);
                  }
                  e.stopPropagation();
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            <CountryOptionsList countries={filteredCountries} showFlag={showFlag} />
          </div>
        </SelectContent>
      </Select>
      <Input
        type="tel"
        placeholder={placeholder}
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        className="flex-1"
        required={required}
      />
    </div>
  );
};

export default PhoneInput;