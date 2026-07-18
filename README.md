# ReadIt

ReadIt is a web application for browsing books and authors, writing reviews, rating titles, and managing catalog data through admin panels. It was built as a university web design project using vanilla HTML, CSS, and JavaScript with Firebase Realtime Database as the backend.

## Features

- **Book catalog** — browse, search, and filter books by title and genre
- **Author catalog** — browse, search, and filter authors by name and status
- **Book & author details** — view full metadata, images, and related content
- **User accounts** — register, log in, and manage a personal profile
- **Reviews & ratings** — leave book reviews and rate both books and authors
- **Admin panels** — create, edit, and delete books and authors

## Tech Stack

- HTML5, CSS3, JavaScript (no frameworks)
- Firebase Realtime Database (REST API via `XMLHttpRequest`)
- Google Fonts (Noto Sans, Noto Serif)

## Firebase Setup

1. Create a Firebase project and enable **Realtime Database**.
2. Copy your database URL into `scripts/firebase.js`:

```javascript
var firebaseUrl = "https://YOUR-PROJECT-default-rtdb.REGION.firebasedatabase.app";
```

3. Configure database rules for development (adjust for production):

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

4. Seed the database with collections: `knjige`, `autori`, `recenzije`, `ocene`, `oceneKnjiga`, `korisnici`.

> **Note:** Firebase collection and field names remain in Serbian to match the existing database schema. All application code (files, functions, CSS classes, and UI) is in English.

## Team Split

| Student | Responsibility |
|---------|----------------|
| **Student 1 (Andrej)** | Books page (`index.html`), book details, admin books (`admin-books.html`) |
| **Student 2 (Aleksa)** | Authors page (`authors.html`), author details, admin authors (`admin-authors.html`) |
| **Both** | My Profile (`profile.html`), login & registration modals |

## How to Run Locally

1. Clone the repository.
2. Set your Firebase URL in `scripts/firebase.js`.
3. Serve the project with any static file server, for example:

```bash
npx serve .
```

4. Open `http://localhost:3000` (or the port shown by your server) in a browser.

> Opening HTML files directly via `file://` may block Firebase requests in some browsers — use a local server.

## Project Structure

```
├── index.html                 # Book catalog (home page)
├── pages/
│   ├── authors.html            # Author catalog
│   ├── book-details.html     # Book details
│   ├── author-details.html     # Author details
│   ├── profile.html            # User profile
│   ├── admin-books.html
│   └── admin-authors.html
├── scripts/
│   ├── firebase.js            # Firebase REST helpers
│   ├── helpers.js             # Shared utilities & validation
│   ├── navbar.js              # Navigation & hamburger menu
│   ├── modals.js              # Login & registration modals
│   ├── books.js              # Book catalog & details logic
│   ├── authors.js              # Author catalog & details logic
│   ├── profile.js              # Profile page logic
│   ├── admin-books.js         # Admin books CRUD
│   └── admin-authors.js         # Admin authors CRUD
├── styles/
│   ├── main.css               # Global styles & CSS variables
│   ├── components.css         # Navbar, buttons, forms, modals, tables
│   ├── books.css              # Book catalog & detail styles
│   ├── authors.css            # Author catalog & detail styles
│   ├── profile.css            # Profile page styles
│   ├── navbar.css             # Navbar responsive tweaks
│   └── responsive.css         # Breakpoints
└── images/                    # Logo & static assets
```

## License

Academic project — see course requirements for usage terms.
