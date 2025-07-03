import { useAppDispatch } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  booksApi,
  useAddBookMutation,
  useEditBookMutation,
} from "@/features/books/booksApi";
import { GENRES } from "@/types/books-interface";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { z } from "zod";
import Error from "../shared/error";
import Loading from "../shared/loader";

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required.",
  }),
  author: z.string().min(1, {
    message: "Author is required.",
  }),
  genre: z.enum(GENRES, {
    message: "Genre must be one of the predefined values",
  }),
  isbn: z.string().min(1, {
    message: "ISBN is required.",
  }),
  description: z.string().optional(),
  copies: z.number().min(0, "Copies must be a positive number"),
});

export type BookFormData = z.infer<typeof formSchema>;

export default function AddEditBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const dispatch = useAppDispatch();
  const [
    editBook,
    {
      isLoading: isEditingLoading,
      isSuccess: isEditingSuccess,
      isError: isEditingError,
      error: editError,
    },
  ] = useEditBookMutation();

  const [
    addBook,
    {
      isLoading: isAddingLoading,
      isSuccess: isAddingSuccess,
      isError: isAddingError,
      error: addError,
    },
  ] = useAddBookMutation();

  // State for error handling
  const [error, setError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Store original data to compare changes
  const originalDataRef = useRef<BookFormData | null>(null);

  const form = useForm<BookFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      author: "",
      genre: GENRES[0],
      isbn: "",
      copies: 1,
      description: "",
    },
  });

  // Watch copies field to show availability status
  const watchedCopies = form.watch("copies");

  useEffect(() => {
    if (isEditing) {
      setIsLoadingData(true);
      setError(null);

      const result = dispatch(booksApi.endpoints.getBook.initiate(id)).unwrap();
      result
        .then((book) => {
          if (book) {
            const { title, author, genre, isbn, description, copies } =
              book.data;

            const bookData = {
              title,
              author,
              genre,
              isbn,
              description,
              copies,
            };

            // Store original data for comparison
            originalDataRef.current = bookData;

            // Reset form with fetched data
            form.reset(bookData);
          }
        })
        .catch((error) => {
          console.error("Error loading book data:", error);
          setError(error?.data?.message || "Failed to load book data.");
        })
        .finally(() => {
          setIsLoadingData(false);
        });
    }
  }, [id, isEditing, form, dispatch]);

  // Function to get only changed fields and add calculated available
  const getChangedFields = (currentValues: BookFormData) => {
    const dataWithAvailable = {
      ...currentValues,
      available: currentValues.copies > 0, // Auto-calculate available based on copies
    };

    if (!isEditing || !originalDataRef.current) {
      return dataWithAvailable; // For new books, send all data
    }

    const changedFields: Partial<typeof dataWithAvailable> = {};
    const original = {
      ...originalDataRef.current,
      available: originalDataRef.current.copies > 0,
    };

    // Compare each field
    Object.keys(dataWithAvailable).forEach((key) => {
      const fieldKey = key as keyof typeof dataWithAvailable;
      if (dataWithAvailable[fieldKey] !== original[fieldKey]) {
        changedFields[fieldKey] = dataWithAvailable[fieldKey];
      }
    });

    return changedFields;
  };

  function onSubmit(values: BookFormData) {
    // Add available field based on copies value
    const valuesWithAvailable = {
      ...values,
      available: values.copies > 0,
    };

    if (isEditing) {
      const changedFields = getChangedFields(values);

      // Only send request if there are changes
      if (Object.keys(changedFields).length === 0) {
        navigate("/books");
        return;
      }

      editBook({ id, data: changedFields });
    } else {
      addBook(valuesWithAvailable);
    }
  }

  useEffect(() => {
    if (isEditingSuccess || isAddingSuccess) {
      navigate("/");
    }
  }, [isEditingSuccess, isAddingSuccess, navigate]);

  if (isLoadingData || isEditingLoading || isAddingLoading) {
    return <Loading />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold">
          {isEditing ? "Edit Book" : "Add New Book"}
        </h1>
        <p className="text-muted-foreground">
          {isEditing
            ? "Update the book information below."
            : "Fill in the details to add a new book to the library."}
        </p>
      </div>

      {/* Error Alert */}
      {isEditingError && <Error message={editError?.data?.message} />}
      {isAddingError && <Error message={addError?.data?.message} />}
      {error && <Error message={error} />}

      {/* Form */}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter book title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Author */}
          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Author *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter author name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Genre and ISBN Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="genre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Genre *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GENRES.map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre.charAt(0).toUpperCase() +
                            genre.slice(1).replace("-", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isbn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ISBN *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter ISBN" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Copies with Availability Status */}
          <FormField
            control={form.control}
            name="copies"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Copies *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Enter number of copies"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
                  />
                </FormControl>
                {/* Show availability status based on copies */}
                <div className="flex items-center gap-2 mt-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      watchedCopies > 0 ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <p className="text-sm text-muted-foreground">
                    {watchedCopies > 0
                      ? "Available for borrowing"
                      : "Not available for borrowing"}
                  </p>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter book description (optional)"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={isEditingLoading || isAddingLoading}
            >
              {isEditingLoading ||
                (isAddingLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ))}
              {isEditing ? "Update Book" : "Add Book"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/books")}
              className="flex-1"
              disabled={isEditingLoading || isAddingLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
