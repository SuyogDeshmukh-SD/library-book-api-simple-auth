# Library Book Issue, Return and Tracking API (Simple Version)

This is a backend-only Express + MongoDB API for learning, assignments, and local demos. **It does not require registration, login, JWT, or Bearer tokens.** Anyone who can reach the API can create/update/delete books and manage members/loans, so do not deploy this open version publicly.

## Setup

1. Install Node.js and MongoDB.
2. Extract this ZIP and open the project folder in VS Code.
3. Copy `.env.example` to `.env` (or use the default local MongoDB URI).
4. Run:

```bash
npm install
npm run dev
```

API runs at `http://localhost:5000`.

## Book APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/books` | List books |
| GET | `/api/books?search=harry` | Search by title, author, or ISBN |
| GET | `/api/books?category=fiction` | Filter by category |
| GET | `/api/books/:id` | Get one book |
| POST | `/api/books` | Create book |
| PATCH | `/api/books/:id` | Update book |
| DELETE | `/api/books/:id` | Soft-delete a book |

Create book JSON:

```json
{
  "title": "Atomic Habits",
  "author": "James Clear",
  "isbn": "9780735211292",
  "category": "Self-help",
  "totalCopies": 5,
  "publishedYear": 2018,
  "description": "A book about building habits."
}
```

## Member APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/members` | Register a member |
| GET | `/api/members` | List all members |
| GET | `/api/members/:id` | Get one member |
| GET | `/api/members/:id/loans` | View a member's loans |
| PATCH | `/api/members/:id/status` | Activate/deactivate member |

Register member JSON:

```json
{
  "name": "Suyog Deshmukh",
  "email": "suyog@example.com",
  "phone": "9876543210",
  "membershipNumber": "LIB-001"
}
```

## Issue, return, and tracking APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/loans/issue` | Issue a book to a member |
| GET | `/api/loans` | List all loans |
| GET | `/api/loans?status=issued` | List currently issued books |
| GET | `/api/loans?status=returned` | List returned books |
| GET | `/api/loans?memberId=MEMBER_ID` | Track loans for one member |
| GET | `/api/loans?bookId=BOOK_ID` | Track loans for one book |
| GET | `/api/loans/:id` | Get one loan |
| PATCH | `/api/loans/:id/return` | Return a book |
| PATCH | `/api/loans/:id/fine-paid` | Mark a fine as paid |

Issue book JSON:

```json
{
  "bookId": "BOOK_OBJECT_ID",
  "memberId": "MEMBER_OBJECT_ID"
}
```

Return a book: send `PATCH /api/loans/LOAN_OBJECT_ID/return` with no body.

Mark fine paid: send `PATCH /api/loans/LOAN_OBJECT_ID/fine-paid` with no body.

## Notes

- Book availability is checked before issue; the API refuses issue requests when `availableCopies` is zero.
- Issue/return use MongoDB transactions. For transactions, MongoDB must run as a replica set (Atlas does; a standalone local MongoDB instance may need replica-set setup). If you get a transaction/replica-set error, use MongoDB Atlas or configure local MongoDB as a single-node replica set.
- Default loan duration is 14 days; default late fine is ₹5 per day. These can be configured with `LOAN_PERIOD_DAYS` and `FINE_PER_DAY` in `.env`.
- This simplified version intentionally omits authentication. Add authentication and role checks before using it for real users.
