"use client"

import { useState, useEffect, useCallback } from "react"
import { Topbar } from "@/components/Topbar"
import { DataTable, Column } from "@/components/DataTable"
import { QuotationDetailDialog } from "@/components/QuotationDetailDialog"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { getQuotations, updateQuotationStatus } from "@/lib/api/salesman"
import { format } from "date-fns"
import { Check, X, RefreshCw, Loader2, FileDown } from "lucide-react"

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedQuotation, setSelectedQuotation] = useState<any | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchQuotations = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getQuotations(statusFilter)
      setQuotations(res.data || [])
    } catch (e) {
      console.error("Failed to fetch quotations", e)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchQuotations()
  }, [fetchQuotations])

  const handleApprove = async (id: string) => {
    setActionLoading(id + "_approve")
    try {
      await updateQuotationStatus(id, "APPROVED")
      await fetchQuotations()
      // If modal is open for the same item, update the selected quotation
      if (selectedQuotation && selectedQuotation.id === id) {
        setSelectedQuotation((prev: any) => ({
          ...prev,
          status: "APPROVED",
          pdfUrl: `/uploads/quotations/quotation_${id}.pdf`,
        }))
      }
    } catch (e) {
      console.error("Failed to approve quotation", e)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id: string, reason: string) => {
    setActionLoading(id + "_reject")
    try {
      await updateQuotationStatus(id, "REJECTED", reason)
      await fetchQuotations()
      if (selectedQuotation && selectedQuotation.id === id) {
        setSelectedQuotation((prev: any) => ({
          ...prev,
          status: "REJECTED",
          rejectionReason: reason,
        }))
      }
    } catch (e) {
      console.error("Failed to reject quotation", e)
    } finally {
      setActionLoading(null)
    }
  }

  const columns: Column<any>[] = [
    {
      header: "Date",
      accessor: (row) => format(new Date(row.createdAt), "MMM dd, yyyy HH:mm"),
    },
    {
      header: "Salesman",
      accessor: (row) => row.salesman?.name || "N/A",
    },
    {
      header: "Customer",
      accessor: (row) => row.customer?.name || "Walk-in Customer",
    },
    {
      header: "Total Value",
      accessor: (row) => `SAR ${row.totalAmount.toFixed(2)}`,
    },
    {
      header: "Status",
      accessor: (row) => (
        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
          row.status === "APPROVED" ? "bg-green-100 text-green-800" :
          row.status === "REJECTED" ? "bg-red-100 text-red-800" :
          row.status === "SUBMITTED" ? "bg-blue-100 text-blue-800" :
          "bg-yellow-100 text-yellow-800"
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      header: "PDF",
      accessor: (row) => row.status === "APPROVED" && row.pdfUrl ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            window.open(row.pdfUrl, "_blank")
          }}
          className="text-blue-600 hover:text-blue-700"
          title="Download PDF"
        >
          <FileDown className="h-4 w-4" />
        </Button>
      ) : "—",
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-2 items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedQuotation(row)
              setDetailModalOpen(true)
            }}
          >
            View Details
          </Button>

          {row.status === "SUBMITTED" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleApprove(row.id)}
                disabled={actionLoading !== null}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                title="Approve"
              >
                {actionLoading === row.id + "_approve" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedQuotation(row)
                  setDetailModalOpen(true)
                  // Delayed trigger to show reject input box
                  setTimeout(() => {
                    const textarea = document.querySelector("textarea")
                    if (textarea) textarea.focus()
                  }, 100)
                }}
                disabled={actionLoading !== null}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Reject"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Topbar
        title="B2B Quotations"
        actions={
          <Button size="sm" onClick={fetchQuotations} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="text-sm text-slate-500">
            Total Quotations: <span className="font-semibold text-slate-800">{quotations.length}</span>
          </div>
          <div className="w-full sm:w-64">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-sm text-slate-500">Loading quotations...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <DataTable data={quotations} columns={columns} />
          </div>
        )}
      </div>

      <QuotationDetailDialog
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        quotation={selectedQuotation}
        onApprove={handleApprove}
        onReject={handleReject}
        actionLoading={actionLoading}
      />
    </div>
  )
}
