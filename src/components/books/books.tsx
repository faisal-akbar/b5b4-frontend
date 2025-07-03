import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type Row,
  type SortingState,
} from "@tanstack/react-table";
import {
  ChevronDownIcon,
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  EllipsisIcon,
} from "lucide-react";
import { useId, useState } from "react";

import DeleteConfirmation from "@/components/shared/delete-confirmation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDeleteBookMutation,
  useGetBooksQuery,
} from "@/features/books/booksApi";
import { getErrorMessage } from "@/lib/extract-error";
import { cn } from "@/lib/utils";
import type { IBooks } from "@/types/books-interface";
import { useNavigate } from "react-router";
import DataAlert from "../shared/data-alert";
import Error from "../shared/error";
import Loading from "../shared/loader";

const columns: ColumnDef<IBooks>[] = [
  {
    header: "Title",
    accessorKey: "title",
    cell: ({ row }) => <div className="text-left">{row.getValue("title")}</div>,
    size: 220,
    enableHiding: false,
    enableSorting: true, // Enable sorting for this column
  },
  {
    header: "Author",
    accessorKey: "author",
    cell: ({ row }) => (
      <div className="text-left">{row.getValue("author")}</div>
    ),
    size: 200,
    enableSorting: true, // Enable sorting for this column
  },
  {
    header: "Genre",
    accessorKey: "genre",
    cell: ({ row }) => <div className="text-left">{row.getValue("genre")}</div>,
    size: 180,
    enableSorting: true, // Enable sorting for this column
  },
  {
    header: "ISBN",
    accessorKey: "isbn",
    cell: ({ row }) => <div className="text-left">{row.getValue("isbn")}</div>,
    size: 200,
    enableSorting: false, // Disable sorting for ISBN
  },
  {
    header: "Copies",
    accessorKey: "copies",
    cell: ({ row }) => (
      <div className="text-left">{row.getValue("copies")}</div>
    ),
    size: 160,
    enableSorting: true, // Enable sorting for this column
  },
  {
    header: "Availability",
    accessorKey: "available",
    cell: ({ row }) => (
      <Badge
        className={cn(
          row.getValue("available") !== true &&
            "bg-muted-foreground/60 text-primary-foreground"
        )}
      >
        {row.getValue("available") ? (
          <span>Available</span>
        ) : (
          <span>Unavailable</span>
        )}
      </Badge>
    ),
    size: 100,
    enableSorting: true, // Enable sorting for this column
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <RowActions row={row} />,
    size: 60,
    enableHiding: false,
    enableSorting: false, // Disable sorting for actions column
  },
];

export default function Books() {
  const id = useId();

  // State for pagination
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0, // 0-based for React Table
    pageSize: 10,
  });

  // State for sorting
  const [sorting, setSorting] = useState<SortingState>([]);

  // Convert sorting state to API format
  const getSortingParams = () => {
    // console.log("Current sorting state:", sorting);
    if (sorting.length === 0) {
      return {
        sortBy: "title",
        sortOrder: "asc",
      };
    }

    const sort = sorting[0]; // Only handle single column sorting for now
    return {
      sortBy: sort.id,
      sortOrder: sort.desc ? "desc" : "asc",
    };
  };

  const {
    data: booksResponse,
    isLoading,
    isError,
    error,
  } = useGetBooksQuery({
    page: pagination.pageIndex + 1, // Convert to 1-based for API
    limit: pagination.pageSize,
    ...getSortingParams(),
  });

  const books = Array.isArray(booksResponse?.data) ? booksResponse.data : [];
  const paginationInfo = booksResponse?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalBooks: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const table = useReactTable({
    data: books,
    columns,
    // Server-side pagination configuration
    manualPagination: true,
    pageCount: paginationInfo.totalPages,
    rowCount: paginationInfo.totalBooks,

    // Server-side sorting configuration
    manualSorting: true,
    enableSortingRemoval: true,
    enableMultiSort: false,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),

    // Event handlers
    onSortingChange: (updater) => {
      setSorting(updater);
      // Reset to first page when sorting changes
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    onPaginationChange: setPagination,

    state: {
      sorting,
      pagination,
    },
  });

  let content = null;
  if (isLoading) {
    content = <Loading />;
  }
  if (!isLoading && isError) {
    const errorMessage = getErrorMessage(error);
    content = <Error message={errorMessage} />;
  }
  if (!isLoading && !isError && books.length === 0) {
    content = <DataAlert message="No books found." />;
  }
  if (!isLoading && !isError && books.length > 0) {
    content = (
      <>
        <div className="bg-background overflow-hidden rounded-md border">
          <Table className="table-fixed">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        style={{ width: `${header.getSize()}px` }}
                        className="h-11"
                      >
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <div
                            className={cn(
                              header.column.getCanSort() &&
                                "flex h-full cursor-pointer items-center justify-between gap-2 select-none hover:bg-muted/50 rounded px-2 -mx-2 transition-colors"
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                            onKeyDown={(e) => {
                              if (
                                header.column.getCanSort() &&
                                (e.key === "Enter" || e.key === " ")
                              ) {
                                e.preventDefault();
                                header.column.getToggleSortingHandler()?.(e);
                              }
                            }}
                            tabIndex={
                              header.column.getCanSort() ? 0 : undefined
                            }
                            role="button"
                            aria-label={`Sort by ${header.column.columnDef.header}`}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            <div className="flex items-center">
                              {{
                                asc: (
                                  <ChevronUpIcon
                                    className="shrink-0 opacity-60"
                                    size={16}
                                    aria-hidden="true"
                                  />
                                ),
                                desc: (
                                  <ChevronDownIcon
                                    className="shrink-0 opacity-60"
                                    size={16}
                                    aria-hidden="true"
                                  />
                                ),
                              }[header.column.getIsSorted() as string] ?? (
                                <div className="w-4 h-4 opacity-30">
                                  <ChevronUpIcon
                                    size={12}
                                    className="opacity-40"
                                  />
                                  <ChevronDownIcon
                                    size={12}
                                    className="opacity-40 -mt-2"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="px-2 -mx-2">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </div>
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="last:py-0">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {isLoading ? "Loading..." : "No results."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between gap-8">
          {/* Results per page */}
          <div className="flex items-center gap-3">
            <Label htmlFor={id} className="max-sm:sr-only">
              Rows per page
            </Label>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger id={id} className="w-fit whitespace-nowrap">
                <SelectValue placeholder="Select number of results" />
              </SelectTrigger>
              <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
                {[5, 10, 20, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Page number information */}
          <div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
            <p
              className="text-muted-foreground text-sm whitespace-nowrap"
              aria-live="polite"
            >
              <span className="text-foreground">
                {paginationInfo.totalBooks === 0
                  ? 0
                  : (paginationInfo.currentPage - 1) * paginationInfo.limit + 1}
                -
                {Math.min(
                  paginationInfo.currentPage * paginationInfo.limit,
                  paginationInfo.totalBooks
                )}
              </span>{" "}
              of{" "}
              <span className="text-foreground">
                {paginationInfo.totalBooks}
              </span>
            </p>
          </div>

          {/* Pagination buttons */}
          <div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    className="disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => table.firstPage()}
                    disabled={!paginationInfo.hasPrevPage || isLoading}
                    aria-label="Go to first page"
                  >
                    <ChevronFirstIcon size={16} aria-hidden="true" />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    className="disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => table.previousPage()}
                    disabled={!paginationInfo.hasPrevPage || isLoading}
                    aria-label="Go to previous page"
                  >
                    <ChevronLeftIcon size={16} aria-hidden="true" />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    className="disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => table.nextPage()}
                    disabled={!paginationInfo.hasNextPage || isLoading}
                    aria-label="Go to next page"
                  >
                    <ChevronRightIcon size={16} aria-hidden="true" />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    className="disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => table.lastPage()}
                    disabled={!paginationInfo.hasNextPage || isLoading}
                    aria-label="Go to last page"
                  >
                    <ChevronLastIcon size={16} aria-hidden="true" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </>
    );
  }

  return <div className="space-y-4">{content}</div>;
}

function RowActions({ row }: { row: Row<IBooks> }) {
  const navigate = useNavigate();
  const [deleteBook] = useDeleteBookMutation();

  const handleDelete = (row: Row<IBooks>) => {
    deleteBook(row.original._id);
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex justify-end">
          <Button
            size="icon"
            variant="ghost"
            className="shadow-none"
            aria-label="Edit item"
          >
            <EllipsisIcon size={16} aria-hidden="true" />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => navigate(`/books/${row.original._id}`)}
          >
            <span>View</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => navigate(`/borrow/${row.original._id}`)}
          >
            <span>Borrow</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => navigate(`/edit-book/${row.original._id}`)}
          >
            <span>Edit</span>
          </DropdownMenuItem>
          <DeleteConfirmation
            trigger={
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={(e) => e.preventDefault()}
              >
                <span>Delete</span>
              </DropdownMenuItem>
            }
            title="Are you absolutely sure?"
            description={`This action cannot be undone. This will permanently delete the book "${row.getValue(
              "title"
            )}".`}
            onConfirm={() => {
              handleDelete(row);
              console.log("Deleting book:", row.original._id);
            }}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
