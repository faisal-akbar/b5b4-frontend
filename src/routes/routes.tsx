import AddEditBook from "@/components/books/add-edit-book";
import BookDetails from "@/components/books/book-details";
import Books from "@/components/books/books";
import Borrow from "@/components/borrow/borrow";
import BorrowSummary from "@/components/borrow/borrow-summary";
import NotFound from "@/components/not-found";
import Layout from "@/components/shared/layout";
import { createBrowserRouter } from "react-router";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true, // This matches "/"
        element: <Books />, // Could show featured books, stats, etc.
      },
      {
        path: "books",
        element: <Books />,
      },
      {
        path: "create-book",
        element: <AddEditBook />,
      },
      {
        path: "/books/:id",
        element: <BookDetails />,
      },
      {
        path: "/edit-book/:id",
        element: <AddEditBook />,
      },
      {
        path: "borrow/:bookId",
        element: <Borrow />,
      },
      {
        path: "borrow-summary",
        element: <BorrowSummary />,
      },
      {
        path: "*", // This catches all unmatched routes
        element: <NotFound />,
      },
    ],
  },
]);

export default router;
