# BUILD SUMMARY — v3

This version adds a persistent multi-year accounting model.

### Core
- Member registration and phone login
- Ten families
- Member payment history
- Public family standing
- Admin dashboard
- Admin year selector
- Member year selector
- Historical transactions
- Year initialization
- Supabase/PostgreSQL
- Flutterwave Standard checkout
- RWF payment validation
- Server-side secret handling
- Responsive UI

### Key rule
No annual reset deletes data. A new year is simply another value in `payments.year`.
