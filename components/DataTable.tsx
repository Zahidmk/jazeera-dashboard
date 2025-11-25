"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

export interface Column<T> {
  header: string
  accessor: keyof T | ((row: T) => ReactNode)
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  className?: string
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  className,
}: DataTableProps<T>) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden ${className || ""}`}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              {columns.map((column, index) => (
                <TableHead 
                  key={index} 
                  className={cn(
                    "font-semibold text-slate-700 whitespace-nowrap",
                    column.className
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <p className="font-medium">No data available</p>
                    <p className="text-sm text-slate-400">There are no records to display</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow 
                  key={rowIndex}
                  className="transition-colors hover:bg-slate-50/50 border-b border-slate-100"
                >
                  {columns.map((column, colIndex) => (
                    <TableCell 
                      key={colIndex} 
                      className={cn(
                        "text-slate-700 whitespace-nowrap text-sm",
                        column.className
                      )}
                    >
                      {typeof column.accessor === "function"
                        ? column.accessor(row)
                        : row[column.accessor]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

