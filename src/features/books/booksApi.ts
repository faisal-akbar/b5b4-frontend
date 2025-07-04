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

export const booksApi = apiSlice.injectEndpoints({
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
    deleteBook: builder.mutation<
      void,
      {
        id: string;
        queryArgs: {
          page: number;
          limit: number;
          sortBy: string;
          sortOrder: string;
        };
      }
    >({
      query: ({ id }) => ({
        url: `/api/books/${id}`,
        method: "DELETE",
      }),

      async onQueryStarted({ id, queryArgs }, { dispatch, queryFulfilled }) {
        // Optimistically remove the book from the cache
        const patchResult = dispatch(
          booksApi.util.updateQueryData("getBooks", queryArgs, (draft) => {
            console.log("Optimistically removing book with id:", id);
            draft.data = draft.data.filter((book) => book._id !== id);
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },

      // invalidatesTags: (result, error, { id }) => [
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
