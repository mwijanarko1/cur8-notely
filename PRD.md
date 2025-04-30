SecureNotes Take-Home Assignment

1. Project Overview

Build a small note-taking app with user authentication.

* Backend: Node + Express (TypeScript)
* Frontend: React (TypeScript)

Candidates should choose their own folder structures, naming conventions, routing, state management approach, styling, and testing tools—then document why.

---

2. Requirements

a) Backend

1. User Authentication
  * Define a way to log in a single, hard-coded user
    * (e.g. { username: "intern", password: "letmein" }).
  * Issue some form of token/session that expires in ~15 minutes.
2. Notes Management
  * Allow an authenticated user to list their notes and add new ones.
  * A note should include at least an identifier, text, and timestamp.
3. Access Control
  * Reject any note-related requests from unauthenticated clients.
4. Validation & Error Handling
  * Validate incoming data (e.g. missing fields).
  * Use appropriate HTTP status codes (4xx for client errors, 5xx for server errors).
5. Automated Tests
  * Write at least one test around authentication (success/failure) and one around notes functionality.
6. README
  * Instructions to install, start, and run tests.

b) Frontend

1. Authentication Flow
  * Provide a login interface; store and use whatever token/session the backend issues.
2. Notes Interface
  * Display the user’s notes.
  * Provide a way to add a new note, with feedback on success or failure.
3. Routing & Protection
  * Prevent unauthenticated users from accessing the notes view.
4. README
  * Instructions to install, start, and run tests.
  * A brief note on trade-offs or production-grade improvements you’d make with more time.

---

3. Deliverables

* One Git repository containing your project and steps on how to run it - please email this to mahmoud@islamicfinanceguru.com by the deadline
* README files at each root detailing setup & tests
* All source code, automated tests, and documentation
* Please ensure you maintain full comprehension of your codebase and are able to extend it as needed

