## Library Management UI with React, TypeScript, and Redux Toolkit Query

This project is a simple library management UI built using React, TypeScript, and Redux Toolkit Query. It provides a user-friendly interface for managing books and borrow records.

### Live UI

You can access the live UI at [https://b5b4-frontend.vercel.app/](https://b5b4-frontend.vercel.app/).

### Features:

- Type-safe API with TypeScript and validation using zod.
- Integration with Redux Toolkit Query for efficient data fetching and caching, including optimistic updates and error handling.
- Responsive design with Tailwind CSS and shadcn/ui components.
- User-friendly interface for managing books and borrow records.
- Viewing all books with server side pagination and sorting
- Creating, updating, and deleting books with RTK Query and caching
- Borrowing books and aggregation summary reports for borrowed books
- user-friendly forms with validation using zod and notifications

### Technologies Used

- React
- TypeScript
- Redux Toolkit and Redux Toolkit Query
- React Router for navigation
- Tailwind CSS
- shadcn/ui components
- zod for validation
- MongoDB for the database
- Express.js for the backend API
- Mongoose for MongoDB object modeling

### How to Run the Project Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/faisal-akbar/b5b4-frontend.git
   ```
2. Navigate to the project directory:
   ```bash
    cd b5b4-frontend
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. change API URL in `src/constant/apiURL.ts` to point to your local or remote API.

   ```plaintext
   export const API_URL: string = "http://localhost:5000";
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```
6. The React app will be running on `http://localhost:5173/`.

### Route

- **Books**
  - `/` or `/books`: List of all books in table format with server side pagination, sorting and action for view details, edit, and delete and borrow book
  - `/books/:id`: View details of a specific book
  - `/create-book`: Form to create a new book with validation
  - `/edit-book/:id`: Form to edit an existing book with validation
  - `/borrow/:bookId`: Delete a book
  - `/borrow-summary`: Summary of borrowed books with client side pagination and sorting
