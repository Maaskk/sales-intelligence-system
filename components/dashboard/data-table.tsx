"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight, Tag } from "lucide-react"
import type { SalesData } from "@/lib/types"

interface DataTableProps {
  salesData: SalesData[]
}

export function DataTable({ salesData }: DataTableProps) {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [regionFilter, setRegionFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const pageSize = 10

  const categories = useMemo(() => {
    const cats = new Set(salesData.map((s) => s.category))
    return Array.from(cats)
  }, [salesData])

  const regions = useMemo(() => {
    const regs = new Set(salesData.map((s) => s.region))
    return Array.from(regs)
  }, [salesData])

  const filteredData = useMemo(() => {
    return salesData.filter((s) => {
      const matchesSearch =
        s.product_name.toLowerCase().includes(search.toLowerCase()) ||
        s.product_id.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter === "all" || s.category === categoryFilter
      const matchesRegion = regionFilter === "all" || s.region === regionFilter
      return matchesSearch && matchesCategory && matchesRegion
    })
  }, [salesData, search, categoryFilter, regionFilter])

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, page])

  const totalPages = Math.ceil(filteredData.length / pageSize)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Transactions</CardTitle>
        <CardDescription>
          Browse and filter historical sales data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-9"
            />
          </div>
          <Select
            value={categoryFilter}
            onValueChange={(value) => {
              setCategoryFilter(value)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={regionFilter}
            onValueChange={(value) => {
              setRegionFilter(value)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map((reg) => (
                <SelectItem key={reg} value={reg}>
                  {reg}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Region</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Promo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="text-muted-foreground">
                    {new Date(sale.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">{sale.product_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{sale.category}</Badge>
                  </TableCell>
                  <TableCell>{sale.region}</TableCell>
                  <TableCell className="text-right">{sale.quantity}</TableCell>
                  <TableCell className="text-right">
                    ${sale.unit_price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ${sale.total_sales.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {sale.promotion ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        <Tag className="h-3 w-3 mr-1" />
                        Yes
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {((page - 1) * pageSize) + 1} to{" "}
            {Math.min(page * pageSize, filteredData.length)} of{" "}
            {filteredData.length} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
