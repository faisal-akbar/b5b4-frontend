import type { IBooks } from "./books-interface";

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
