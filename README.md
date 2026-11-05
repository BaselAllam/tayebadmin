# Travel Hub Admin

i have a travel agency website for my travel agency & wants to build a cms & dashboard for it as below 

- dashboard screen that shows all packages performance & pending bookings & stats for packages, bookings & more 
- user module:
    - view all users
    - edit users
    - create users 
    * user fields ( email, phone, firstName, lastName, gender, role, user_status )
- site cores module ( as a tabs for ( contact us requests, faqs, destinations, gallery)):
    - view for each tab 
    - edit for each tab
    - create for each tab  
    * contact us fields ( full_name, user_email, user_phone, subject, message, created_at, status )
    * gallery fields ( img, is_archived )
    * faqs fields ( faq_title, faq_title_de, faq_description, faq_description_de, is_archived )
    * destinations fields ( destination_name, destination_name_de, destination_description, destination_description_de, img, is_archived )
- packages module this module must be separated to 3 pages ( packages, tour package type,  ToursPackagesBookings):
    i mean in side menu when press on packages expand it with all these pages & each page must include create, view, update for each data
    > Tour Packages Type fields ( type_title, type_title_de, type_img, is_archived )
    > Tour Packages Bookings fields ( package, user ( forgien key with users ), number_of_adults, number_of_childrens, submitted_at, booking_status, paid_amount, remaining_amount )
    > Package fields ( destination ( drop down from destinations ), package_type ( drop down from package type ), package_title, package_description, package_duration, price_currency, package_price, package_img, is_active )
        & for create or update open a page for the package data & below data ( the new page to be switch body content not actually navigation ),
        for create or update must be a section in the page for:
            - ToursPackagesHighlights & its fields is ( highlights_title )
            - ToursPackagesItinerary & its fields is ( itinerary_title,  itinerary_description )
            - ToursPackagesBenefits & its fields is ( benefit_title, is_included )
- User Profile screen 
    - user can edit his data
    - user can view his data 


- make sure all project is very responsive 
- make sure all project is translated to en & ar 

- Please build this project as a simple, fully functional Single Page Application (SPA).

​Do NOT use skeleton loaders, complex component structures, or unnecessary multi-page routings.

​Keep all core logic and components organized, readable, and easy to edit directly.

​Structure the app to easily support Language Context / i18n for multi-language switching later.

​Build standard, complete UI sections directly without placeholder layouts."

Refactor the routing setup to use standard `react-router-dom`:
1. Remove all `@tanstack/react-router` imports, files, and dependencies completely.
2. Define all application routes inside `src/App.tsx` using `<BrowserRouter>`, `<Routes>`, and `<Route>`.
3. Update all navigation components (`Header`, `Footer`, links, and buttons) to use `Link` and `useNavigate` from `react-router-dom`.
4. Do not auto-generate TanStack route files in the `src/routes/` directory going forward.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d9daab51-9b25-46c4-a382-7f4241e6bd5e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
