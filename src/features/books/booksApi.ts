import type { BookFormData } from "@/components/books/add-edit-book";
import { apiSlice } from "../api/apiSlice";

export const GENRES = [
  "FICTION",
  "NON_FICTION",
  "SCIENCE",
  "HISTORY",
  "BIOGRAPHY",
  "FANTASY",
] as const;

type Genre = (typeof GENRES)[number];

export interface IBooks {
  _id: string;
  title: string;
  author: string;
  genre: Genre;
  isbn: string;
  description: string;
  copies: number;
  available: boolean;
}

export interface IBookResponseData {
  data: IBooks;
  success: boolean;
  message: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalBooks: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const booksApi = apiSlice
  .enhanceEndpoints({ addTagTypes: ["Books"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      getBooks: builder.query<
        IBookResponseData,
        { page: number; limit: number; sortBy: string; sortOrder: string }
      >({
        query: ({ page, limit, sortBy, sortOrder }) => {
          return `/api/books?page=${page}&limit=${limit}&sortBy=${sortBy}&sort=${sortOrder}`;
        },
        providesTags: ["Books"],
      }),
      getBook: builder.query<IBookResponseData, string>({
        query: (id) => `/api/books/${id}`,
        providesTags: (result, error, id) => [{ type: "Books", id }],
      }),
      addBook: builder.mutation<IBookResponseData, BookFormData>({
        query: (data) => ({
          url: "/api/books",
          method: "POST",
          body: data,
        }),
        invalidatesTags: ["Books"],
      }),
      editBook: builder.mutation<
        IBookResponseData,
        { id: string; data: BookFormData }
      >({
        query: ({ id, data }) => ({
          url: `/api/books/${id}`,
          method: "PUT",
          body: data,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "Books", id },
          "Books",
        ],
      }),
      deleteBook: builder.mutation<IBookResponseData, string>({
        query: (bookId) => ({
          url: `/api/books/${bookId}`,
          method: "DELETE",
        }),
        async onQueryStarted(bookId, { dispatch, queryFulfilled, getState }) {
          // You may want to get the latest query args from the state or hardcode defaults
          // Here is an example using default values:
          const defaultQueryArgs = {
            page: 1,
            limit: 10,
            sortBy: "title",
            sortOrder: "asc",
          };
          const patchResult = dispatch(
            booksApi.util.updateQueryData(
              "getBooks",
              defaultQueryArgs,
              (draft) => {
                console.log("Deleting book with ID:", bookId);
                draft.data = draft.data.filter((book) => book._id != bookId);
              }
            )
          );

          try {
            await queryFulfilled;
          } catch {
            patchResult.undo();
          }
        },
        // invalidatesTags: (result, error, id) => [
        //   { type: "Books", id },
        //   "Books",
        // ],
      }),
    }),
  });

export const {
  useGetBooksQuery,
  useGetBookQuery,
  useAddBookMutation,
  useEditBookMutation,
  useDeleteBookMutation,
} = booksApi;
