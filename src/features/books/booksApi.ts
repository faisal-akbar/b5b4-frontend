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
}

export const booksApi = apiSlice
  .enhanceEndpoints({ addTagTypes: ["Books"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      getBooks: builder.query<IBookResponseData, void>({
        query: () => {
          return `/api/books`;
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
        // Optimistic update to remove book from cache
        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          const patchResult = dispatch(
            booksApi.util.updateQueryData("getBooks", undefined, (draft) => {
              draft.data = draft.data.filter((book) => book._id != arg);
            })
          );

          try {
            await queryFulfilled;
          } catch {
            patchResult.undo();
          }
        },
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
