import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

/* ------------------------------------------------------------------ types */

export type Gender = "male" | "female" | "other";
export type Role = "admin" | "staff" | "client";
export type UserStatus = "active" | "inactive" | "blocked";

export type User = {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  role: Role;
  user_status: UserStatus;
};

export type ContactStatus = "new" | "in_progress" | "resolved";

export type ContactRequest = {
  id: string;
  full_name: string;
  user_email: string;
  user_phone: string;
  subject: string;
  message: string;
  created_at: string;
  status: ContactStatus;
};

export type GalleryItem = { id: string; img: string; is_archived: boolean };

export type Faq = {
  id: string;
  faq_title: string;
  faq_title_de: string;
  faq_description: string;
  faq_description_de: string;
  is_archived: boolean;
};

export type Destination = {
  id: string;
  destination_name: string;
  destination_name_de: string;
  destination_description: string;
  destination_description_de: string;
  img: string;
  is_archived: boolean;
};

export type PackageType = {
  id: string;
  type_title: string;
  type_title_de: string;
  type_img: string;
  is_archived: boolean;
  is_holy: boolean;
};

export type Highlight = { id: string; highlights_title: string };
export type Itinerary = { id: string; itinerary_title: string; itinerary_description: string };
export type Benefit = { id: string; benefit_title: string; is_included: boolean };

export type TourPackage = {
  id: string;
  destination_id: string;
  package_type_id: string;
  package_title: string;
  package_description: string;
  package_duration: string;
  price_currency: string;
  package_price: number;
  package_img: string;
  is_active: boolean;
  highlights: Highlight[];
  itinerary: Itinerary[];
  benefits: Benefit[];
};

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type Booking = {
  id: string;
  package_id: string;
  user_id: string;
  number_of_adults: number;
  number_of_childrens: number;
  submitted_at: string;
  booking_status: BookingStatus;
  paid_amount: number;
  remaining_amount: number;
};

/* ------------------------------------------------------------- demo data */

export const uid = () => Math.random().toString(36).slice(2, 10);

const seedUsers: User[] = [
  { id: "u1", email: "dokan@wandertravel.com", phone: "+20 100 123 4567", firstName: "Dokan", lastName: "Allam", gender: "male", role: "admin", user_status: "active" },
  { id: "u2", email: "sara.hassan@wandertravel.com", phone: "+20 111 999 2211", firstName: "Sara", lastName: "Hassan", gender: "female", role: "staff", user_status: "active" },
  { id: "u3", email: "omar.fathy@gmail.com", phone: "+20 122 448 7710", firstName: "Omar", lastName: "Fathy", gender: "male", role: "staff", user_status: "active" },
  { id: "u4", email: "lina.k@gmail.com", phone: "+971 50 221 8890", firstName: "Lina", lastName: "Kamal", gender: "female", role: "staff", user_status: "inactive" },
  { id: "u5", email: "editor@wandertravel.com", phone: "+20 155 660 1122", firstName: "Youssef", lastName: "Nabil", gender: "male", role: "staff", user_status: "active" },
];

const seedDestinations: Destination[] = [
  { id: "d1", destination_name: "Hurghada", destination_name_de: "الغردقة", destination_description: "Red Sea reefs, sun and diving.", destination_description_de: "شعاب البحر الأحمر والشمس والغطس.", img: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80", is_archived: false },
  { id: "d2", destination_name: "Luxor & Aswan", destination_name_de: "الأقصر وأسوان", destination_description: "Temples, tombs and Nile cruises.", destination_description_de: "معابد ومقابر ورحلات نيلية.", img: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&q=80", is_archived: false },
  { id: "d3", destination_name: "Dubai", destination_name_de: "دبي", destination_description: "Skylines, desert safaris and malls.", destination_description_de: "ناطحات سحاب وسفاري صحراوي.", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80", is_archived: false },
  { id: "d4", destination_name: "Istanbul", destination_name_de: "إستنبول", destination_description: "Bosphorus, bazaars and history.", destination_description_de: "البوسفور والأسواق والتاريخ.", img: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&q=80", is_archived: true },
];

const seedTypes: PackageType[] = [
  { id: "t1", type_title: "Beach & Resort", type_title_de: "شواطئ ومنتجعات", type_img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", is_archived: false, is_holy: false },
  { id: "t2", type_title: "Cultural Tours", type_title_de: "رحلات ثقافية", type_img: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800&q=80", is_archived: false, is_holy: false },
  { id: "t3", type_title: "Honeymoon", type_title_de: "شهر العسل", type_img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", is_archived: false, is_holy: false },
  { id: "t4", type_title: "Adventure", type_title_de: "مغامرات", type_img: "https://images.unsplash.com/photo-1533692328991-08159ff19fca?w=800&q=80", is_archived: true, is_holy: false },
];

const seedPackages: TourPackage[] = [
  {
    id: "p1", destination_id: "d1", package_type_id: "t1",
    package_title: "Hurghada Diving Escape", package_description: "5 nights all-inclusive resort stay with two guided dives.",
    package_duration: "6 days / 5 nights", price_currency: "USD", package_price: 780,
    package_img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80", is_active: true,
    highlights: [{ id: uid(), highlights_title: "Two guided reef dives" }, { id: uid(), highlights_title: "All-inclusive beach resort" }],
    itinerary: [
      { id: uid(), itinerary_title: "Day 1 — Arrival", itinerary_description: "Airport transfer and resort check-in." },
      { id: uid(), itinerary_title: "Day 2 — Reef diving", itinerary_description: "Full-day boat trip with lunch on board." },
    ],
    benefits: [{ id: uid(), benefit_title: "Airport transfers", is_included: true }, { id: uid(), benefit_title: "International flights", is_included: false }],
  },
  {
    id: "p2", destination_id: "d2", package_type_id: "t2",
    package_title: "Nile Heritage Cruise", package_description: "Luxor to Aswan cruise with Egyptologist guide.",
    package_duration: "5 days / 4 nights", price_currency: "USD", package_price: 1150,
    package_img: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=1200&q=80", is_active: true,
    highlights: [{ id: uid(), highlights_title: "Valley of the Kings" }, { id: uid(), highlights_title: "Abu Simbel add-on" }],
    itinerary: [{ id: uid(), itinerary_title: "Day 1 — Luxor", itinerary_description: "Karnak and Luxor temples." }],
    benefits: [{ id: uid(), benefit_title: "Full board on cruise", is_included: true }],
  },
  {
    id: "p3", destination_id: "d3", package_type_id: "t3",
    package_title: "Dubai Honeymoon Deluxe", package_description: "Luxury stay with desert safari and dinner cruise.",
    package_duration: "4 days / 3 nights", price_currency: "AED", package_price: 6400,
    package_img: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200&q=80", is_active: true,
    highlights: [{ id: uid(), highlights_title: "Private desert safari" }],
    itinerary: [{ id: uid(), itinerary_title: "Day 1 — Arrival", itinerary_description: "Private transfer and hotel check-in." }],
    benefits: [{ id: uid(), benefit_title: "Daily breakfast", is_included: true }],
  },
  {
    id: "p4", destination_id: "d4", package_type_id: "t4",
    package_title: "Istanbul City Break", package_description: "Old city walking tours and Bosphorus cruise.",
    package_duration: "4 days / 3 nights", price_currency: "EUR", package_price: 520,
    package_img: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80", is_active: false,
    highlights: [], itinerary: [], benefits: [],
  },
];

const seedBookings: Booking[] = [
  { id: "b1", package_id: "p1", user_id: "u3", number_of_adults: 2, number_of_childrens: 1, submitted_at: "2026-08-02", booking_status: "pending", paid_amount: 400, remaining_amount: 1560 },
  { id: "b2", package_id: "p2", user_id: "u4", number_of_adults: 2, number_of_childrens: 0, submitted_at: "2026-07-28", booking_status: "confirmed", paid_amount: 2300, remaining_amount: 0 },
  { id: "b3", package_id: "p3", user_id: "u3", number_of_adults: 2, number_of_childrens: 0, submitted_at: "2026-08-09", booking_status: "pending", paid_amount: 1000, remaining_amount: 11800 },
  { id: "b4", package_id: "p1", user_id: "u4", number_of_adults: 1, number_of_childrens: 0, submitted_at: "2026-06-14", booking_status: "completed", paid_amount: 780, remaining_amount: 0 },
  { id: "b5", package_id: "p2", user_id: "u3", number_of_adults: 3, number_of_childrens: 2, submitted_at: "2026-08-12", booking_status: "cancelled", paid_amount: 0, remaining_amount: 0 },
  { id: "b6", package_id: "p3", user_id: "u4", number_of_adults: 2, number_of_childrens: 2, submitted_at: "2026-08-15", booking_status: "pending", paid_amount: 2000, remaining_amount: 10800 },
];

const seedContacts: ContactRequest[] = [
  { id: "c1", full_name: "Mahmoud Adel", user_email: "mahmoud@example.com", user_phone: "+20 100 555 1122", subject: "Family package to Hurghada", message: "Looking for a 5-night family package in September.", created_at: "2026-08-14", status: "new" },
  { id: "c2", full_name: "Nour El Din", user_email: "nour@example.com", user_phone: "+20 128 774 9900", subject: "Nile cruise availability", message: "Do you have availability for two adults in October?", created_at: "2026-08-10", status: "in_progress" },
  { id: "c3", full_name: "Aya Samir", user_email: "aya@example.com", user_phone: "+966 55 220 1188", subject: "Honeymoon in Dubai", message: "Please send prices for the deluxe honeymoon package.", created_at: "2026-08-04", status: "resolved" },
];

const seedFaqs: Faq[] = [
  { id: "f1", faq_title: "How do I pay for a package?", faq_title_de: "كيف أدفع قيمة الباكدج؟", faq_description: "You can pay a deposit online and settle the rest at our office.", faq_description_de: "يمكنك دفع مقدم عبر الإنترنت واستكمال المبلغ في المكتب.", is_archived: false },
  { id: "f2", faq_title: "Can I cancel my booking?", faq_title_de: "هل يمكنني إلغاء الحجز؟", faq_description: "Free cancellation up to 14 days before departure.", faq_description_de: "إلغاء مجاني حتى ١٤ يوماً قبل السفر.", is_archived: false },
  { id: "f3", faq_title: "Do you arrange visas?", faq_title_de: "هل توفرون خدمة التأشيرات؟", faq_description: "Yes, visa assistance is available for most destinations.", faq_description_de: "نعم، نوفر المساعدة في التأشيرات لمعظم الوجهات.", is_archived: true },
];

const seedGallery: GalleryItem[] = [
  { id: "g1", img: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80", is_archived: false },
  { id: "g2", img: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&q=80", is_archived: false },
  { id: "g3", img: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80", is_archived: false },
  { id: "g4", img: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800&q=80", is_archived: true },
];

/* ----------------------------------------------------------- collections */

type Collections = {
  users: User[];
  contacts: ContactRequest[];
  faqs: Faq[];
  destinations: Destination[];
  gallery: GalleryItem[];
  packageTypes: PackageType[];
  packages: TourPackage[];
  bookings: Booking[];
};

type CollectionKey = keyof Collections;

type Store = Collections & {
  currentUserId: string;
  create: <K extends CollectionKey>(key: K, item: Omit<Collections[K][number], "id">) => void;
  update: <K extends CollectionKey>(key: K, id: string, patch: Partial<Collections[K][number]>) => void;
  remove: (key: CollectionKey, id: string) => void;
};

const DataContext = createContext<Store | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Collections>({
    users: seedUsers,
    contacts: seedContacts,
    faqs: seedFaqs,
    destinations: seedDestinations,
    gallery: seedGallery,
    packageTypes: seedTypes,
    packages: seedPackages,
    bookings: seedBookings,
  });

  const value = useMemo<Store>(
    () => ({
      ...data,
      currentUserId: "u1",
      create: (key, item) =>
        setData((prev) => ({ ...prev, [key]: [{ ...(item as object), id: uid() }, ...prev[key]] as never })),
      update: (key, id, patch) =>
        setData((prev) => ({
          ...prev,
          [key]: prev[key].map((row) => (row.id === id ? { ...row, ...patch } : row)) as never,
        })),
      remove: (key, id) =>
        setData((prev) => ({ ...prev, [key]: prev[key].filter((row) => row.id !== id) as never })),
    }),
    [data],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}

export const fullName = (u?: User) => (u ? `${u.firstName} ${u.lastName}` : "—");
export const money = (amount: number, currency = "USD") =>
  `${currency} ${amount.toLocaleString("en-US")}`;
