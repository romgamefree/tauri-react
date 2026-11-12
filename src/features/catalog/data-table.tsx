import { useEffect, useMemo, useState } from "react";
import {
  createColumnHelper,
  useTable,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns3,
  MoreHorizontal,
  Search,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CatalogItem, EntityConfig } from "@/types/catalog";
import { features, type DataTableFeatures } from "./table-features";

type Props<T extends CatalogItem> = {
  config: EntityConfig;
  data: T[];
  onEdit: (item: T) => void;
  onCopy: (id: string) => void;
  onDelete: (ids: string[]) => void;
};

export function DataTable<T extends CatalogItem>({ config, data, onEdit, onCopy, onDelete }: Props<T>) {
  const columnHelper = createColumnHelper<DataTableFeatures, T>();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  useEffect(() => setRowSelection({}), [data]);

  const columns = useMemo(() => columnHelper.columns([
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Chọn tất cả dòng trên trang"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={`Chọn ${String(row.original[config.searchField as keyof T] ?? "")}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }),
    ...config.fields.map((field) => columnHelper.accessor(
      (item) => String(item[field.key as keyof T] ?? ""),
      {
        id: field.key,
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {field.label}
            <ArrowUpDown className="size-3.5" />
          </Button>
        ),
        cell: ({ row }) => field.key === "status" ? (
          <Badge variant={row.original.status.includes("Bảo") || row.original.status.includes("nghỉ") ? "secondary" : "outline"}>
            {row.original.status}
          </Badge>
        ) : (
          <span className={field.key === config.searchField ? "font-medium" : undefined}>
            {String(row.original[field.key as keyof T] || "—")}
          </span>
        ),
        filterFn: "includesString",
        sortFn: "alphanumeric",
      },
    )),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
            <MoreHorizontal />
            <span className="sr-only">Thao tác với dòng</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(row.original)}>Chỉnh sửa</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCopy(row.original.id)}>
                Sao chép ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete([row.original.id])}>
                Xóa
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableHiding: false,
    }),
  ]), [config, onEdit, onCopy, onDelete]);

  const table = useTable({
    features,
    data,
    columns,
    getRowId: (row) => row.id,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  });

  const selectedIds = table.getFilteredSelectedRowModel().rows.map((row) => row.original.id);
  const statusColumn = table.getColumn("status");
  const statusOptions = config.fields.find((field) => field.key === "status")?.options ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={`Tìm theo ${config.fields.find((field) => field.key === config.searchField)?.label.toLowerCase()}...`}
            value={(table.getColumn(config.searchField)?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn(config.searchField)?.setFilterValue(event.target.value)}
          />
        </div>
        <select
          aria-label="Lọc trạng thái"
          className="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={(statusColumn?.getFilterValue() as string) ?? ""}
          onChange={(event) => statusColumn?.setFilterValue(event.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
            <Columns3 /> Cột
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Hiển thị cột</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table.getAllColumns().filter((column) => column.getCanHide()).map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {config.fields.find((field) => field.key === column.id)?.label ?? column.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        {selectedIds.length > 0 && (
          <Button variant="destructive" size="sm" onClick={() => onDelete(selectedIds)}>
            <Trash2 /> Xóa {selectedIds.length} mục
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}><table.FlexRender cell={cell} /></TableCell>
                ))}
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={table.getVisibleLeafColumns().length} className="h-28 text-center text-muted-foreground">
                  Không có dữ liệu phù hợp.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>{selectedIds.length} / {table.getFilteredRowModel().rows.length} dòng được chọn</span>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="page-size">Số dòng</label>
          <select
            id="page-size"
            className="h-8 rounded-lg border border-input bg-background px-2 text-foreground"
            value={table.state.pagination.pageSize}
            onChange={(event) => table.setPageSize(Number(event.target.value))}
          >
            {[5, 10, 20, 50].map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
          <span className="min-w-24 text-center">Trang {table.state.pagination.pageIndex + 1} / {Math.max(table.getPageCount(), 1)}</span>
          <Button variant="outline" size="icon-sm" aria-label="Trang đầu" disabled={!table.getCanPreviousPage()} onClick={() => table.setPageIndex(0)}><ChevronsLeft /></Button>
          <Button variant="outline" size="icon-sm" aria-label="Trang trước" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}><ChevronLeft /></Button>
          <Button variant="outline" size="icon-sm" aria-label="Trang sau" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}><ChevronRight /></Button>
          <Button variant="outline" size="icon-sm" aria-label="Trang cuối" disabled={!table.getCanNextPage()} onClick={() => table.setPageIndex(table.getPageCount() - 1)}><ChevronsRight /></Button>
        </div>
      </div>
    </div>
  );
}
