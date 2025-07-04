import { useGetBookQuery } from "@/features/books/booksApi";
import { getErrorMessage } from "@/lib/extract-error";
import { useParams } from "react-router";
import Error from "../shared/error";
import Loading from "../shared/loader";

export default function BookDetails() {
  const { id } = useParams();
  const {
    data: book,
    isLoading,
    isError,
    error,
  } = useGetBookQuery(id as string);
  const { title, author, genre, isbn, description, copies, available } =
    book?.data || {};

  let content = null;

  if (isLoading) {
    content = <Loading />;
  }

  if (!isLoading && isError) {
    const errorMessage = getErrorMessage(error);
    content = <Error message={errorMessage} />;
  }

  // if (!isLoading && !isError && book?._id) {
  //   content = <p style={{ color: "#f87171" }}>"No tasks found!"</p>;
  // }

  if (!isLoading && !isError && book?.success) {
    content = (
      <div>
        <div className="px-4 sm:px-0">
          <h3 className="text-base/7 font-semibold text-gray-900">
            Book Information
          </h3>
          <p className="mt-1 max-w-2xl text-sm/6 text-gray-500">
            Details about the book you have selected.
          </p>
        </div>
        <div className="mt-6 border-t border-gray-100">
          <dl className="divide-y divide-gray-100">
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-900">Title</dt>
              <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                {title}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-900">Author</dt>
              <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                {author}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-900">Genre</dt>
              <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                {genre}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-900">ISBN</dt>
              <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                {isbn}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-900">
                Description
              </dt>
              <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                {description}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-900">Copies</dt>
              <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                {copies}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-900">Available</dt>
              <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                {available ? "Available" : "Unavailable"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    );
  }

  return <>{content}</>;
}
