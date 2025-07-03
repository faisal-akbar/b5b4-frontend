import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  useGetBorrowedSummaryQuery,
  type IBorrowSummaryItem,
} from "@/features/borrow/borrowApi";
import { getErrorMessage } from "@/lib/extract-error";
import { cn } from "@/lib/utils";
import DataAlert from "../shared/data-alert";
import Error from "../shared/error";
import Loading from "../shared/loader";

const columns: ColumnDef<IBorrowSummaryItem>[] = [
  {
    header: "Title",
    accessorKey: "book.title",
    cell: ({ row }) => (
      <div className="text-left">{row.original.book.title}</div>
    ),
    size: 300,
    enableSorting: true,
    // Custom sorting function for nested property
    sortingFn: (rowA, rowB) => {
      const titleA = rowA.original.book.title.toLowerCase();
      const titleB = rowB.original.book.title.toLowerCase();
      return titleA < titleB ? -1 : titleA > titleB ? 1 : 0;
    },
  },
  {
    header: "ISBN",
    accessorKey: "book.isbn",
    cell: ({ row }) => (
      <div className="text-left">{row.original.book.isbn}</div>
    ),
    size: 200,
    enableSorting: true,
    // Custom sorting function for nested property
    sortingFn: (rowA, rowB) => {
      const isbnA = rowA.original.book.isbn;
      const isbnB = rowB.original.book.isbn;
      return isbnA < isbnB ? -1 : isbnA > isbnB ? 1 : 0;
    },
  },
  {
    header: "Total Quantity",
    accessorKey: "totalQuantity",
    cell: ({ row }) => (
      <div className="text-left">{row.getValue("totalQuantity")}</div>
    ),
    size: 150,
    enableSorting: true,
  },
];

export default function BorrowSummary() {
  const [sorting, setSorting] = useState<SortingState>([]);

  const {
    data: borrowResponse,
    isLoading,
    isError,
    error,
  } = useGetBorrowedSummaryQuery();

  const borrowData = Array.isArray(borrowResponse?.data)
    ? borrowResponse.data
    : [];

  const table = useReactTable({
    data: borrowData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: true,
    enableMultiSort: false,
    state: {
      sorting,
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

  if (!isLoading && !isError && borrowData.length === 0) {
    content = <DataAlert message="No borrow summary found." />;
  }

  if (!isLoading && !isError && borrowData.length > 0) {
    content = (
      <div className="space-y-4">
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
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return <div className="space-y-4">{content}</div>;
}
