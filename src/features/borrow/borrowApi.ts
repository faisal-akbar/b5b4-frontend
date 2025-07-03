import { apiSlice } from "../api/apiSlice";

// Define the book object within borrow summary
export interface IBorrowSummaryBook {
  title: string;
  isbn: string;
}

// Define the individual borrow summary item
export interface IBorrowSummaryItem {
  totalQuantity: number;
  book: IBorrowSummaryBook;
}

// Define the complete API response structure - now includes success and message
export interface IBorrowSummaryResponse {
  success: boolean;
  message: string;
  data: IBorrowSummaryItem[];
}

// Define the borrow book request payload
export interface IBorrowBookRequest {
  book: string;
  quantity: number;
  dueDate: string;
}

export interface IBorrowBookResponse {
  success: boolean;
  message: string;
  data: {
    book: string;
    quantity: number;
    dueDate: string;
    _id: string;
    createdAt: string;
    updatedAt: string;
  };
}

export const borrowApi = apiSlice
  .enhanceEndpoints({
    addTagTypes: ["BorrowSummary"],
  })
  .injectEndpoints({
    endpoints: (builder) => ({
      getBorrowedSummary: builder.query<IBorrowSummaryResponse, void>({
        query: () => "/api/borrow",
        providesTags: [{ type: "BorrowSummary" }],
      }),
      borrowBook: builder.mutation<IBorrowBookResponse, IBorrowBookRequest>({
        query: (data) => ({
          url: "/api/borrow",
          method: "POST",
          body: data,
        }),
        invalidatesTags: ["BorrowSummary"],
      }),
    }),
  });

export const { useGetBorrowedSummaryQuery, useBorrowBookMutation } = borrowApi;
