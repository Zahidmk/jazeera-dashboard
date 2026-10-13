"use client"

import { useState, useEffect, useCallback } from "react"
import { Topbar } from "@/components/Topbar"
import { DataTable, Column } from "@/components/DataTable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { apiCall } from "@/lib/api/client"
import {
  FEEDBACK_CATEGORIES, FEEDBACK_STATUSES, FeedbackRow, PageMeta, UserBrief, VisitRow,
  fmtDateTime, fmtTime,
} from "@/lib/api/merchandiser"
import { Loader2, ClipboardList, MessageSquare, AlertTriangle, Star } from "lucide-react"

interface List<T> { success: boolean; data: T[]; meta?: PageMeta }
interface VisitDetail extends Omit<VisitRow, "_count"> { feedback: FeedbackRow[] }

const statusBadge = (s: FeedbackRow["status"]) =>
  s === "NEW" ? <Badge variant="warning">New</Badge> : s === "REVIEWED" ? <Badge variant="secondary">Reviewed</Badge> : <Badge variant="success">Resolved</Badge>

export default function ShopVisitsPage() {
  const [tab, setTab] = useState<"visits" | "feedback">("feedback")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [merchandiserId, setMerchandiserId] = useState("")
  const [outOfRange, setOutOfRange] = useState(false)
  const [fbStatus, setFbStatus] = useState("")
  const [fbCategory, setFbCategory] = useState("")
  const [followUp, setFollowUp] = useState(false)
  const [page, setPage] = useState(1)

  const [visits, setVisits] = useState<VisitRow[]>([])
  const [feedback, setFeedback] = useState<FeedbackRow[]>([])
  const [meta, setMeta] = useState<PageMeta | null>(null)
  const [people, setPeople] = useState<UserBrief[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [visit, setVisit] = useState<VisitDetail | null>(null)
  const [review, setReview] = useState<FeedbackRow | null>(null)
  const [reviewStatus, setReviewStatus] = useState<FeedbackRow["status"]>("REVIEWED")
  const [reviewNote, setReviewNote] = useState("")
  const [saving, setSaving] = useState(false)
  const [reviewError, setReviewError] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const qs = new URLSearchParams({ page: String(page), limit: "30" })
      if (from) qs.set("from", from)
      if (to) qs.set("to", to)
      if (merchandiserId) qs.set("merchandiserId", merchandiserId)
      if (tab === "visits") {
        if (outOfRange) qs.set("outOfRange", "true")
        const res = await apiCall<List<VisitRow>>(`/api/v1/admin/shop-visits?${qs}`)
        setVisits(res.data); setMeta(res.meta ?? null)
      } else {
        if (fbStatus) qs.set("status", fbStatus)
        if (fbCategory) qs.set("category", fbCategory)
        if (followUp) qs.set("followUp", "true")
        const res = await apiCall<List<FeedbackRow>>(`/api/v1/admin/feedback?${qs}`)
        setFeedback(res.data); setMeta(res.meta ?? null)
      }
      if (people.length === 0) {
        const p = await apiCall<List<UserBrief>>("/api/v1/admin/merchandisers")
        setPeople(p.data)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, page, from, to, merchandiserId, outOfRange, fbStatus, fbCategory, followUp])

  useEffect(() => { load() }, [load])

  const openVisit = async (id: string) => {
    try {
      const res = await apiCall<{ data: VisitDetail }>(`/api/v1/admin/shop-visits/${id}`)
      setVisit(res.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load visit")
    }
  }

  const openReview = (f: FeedbackRow) => {
    setReview(f); setReviewStatus(f.status === "NEW" ? "REVIEWED" : f.status); setReviewNote(f.adminNote ?? ""); setReviewError("")
  }

  const saveReview = async () => {
    if (!review) return
    setSaving(true); setReviewError("")
    try {
      await apiCall(`/api/v1/admin/feedback/${review.id}`, { method: "PATCH", body: JSON.stringify({ status: reviewStatus, adminNote: reviewNote }) })
      setReview(null)
      load()
    } catch (e) {
      setReviewError(e instanceof Error ? e.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const newCount = tab === "feedback" && !fbStatus && !fbCategory && !followUp ? feedback.filter((f) => f.status === "NEW").length : null

  const visitColumns: Column<VisitRow>[] = [
    { header: "Shop", accessor: (v) => <span className="font-medium">{v.customer.name}</span> },
    { header: "Merchandiser", accessor: (v) => v.merchandiser.name },
    { header: "Started", accessor: (v) => fmtDateTime(v.startedAt) },
    { header: "Ended", accessor: (v) => (v.status === "IN_PROGRESS" ? <Badge variant="warning">In progress</Badge> : fmtTime(v.endedAt)) },
    { header: "Distance", accessor: (v) => v.startDistanceM == null ? "—" : v.outOfRange ? <Badge variant="destructive">{Math.round(v.startDistanceM)} m · out of range</Badge> : `${Math.round(v.startDistanceM)} m` },
    { header: "Feedback", accessor: (v) => <Badge variant="secondary">{v._count.feedback}</Badge> },
    { header: "", accessor: (v) => <Button variant="ghost" size="sm" className="cursor-pointer" onClick={() => openVisit(v.id)}>Details</Button> },
  ]

  const feedbackColumns: Column<FeedbackRow>[] = [
    { header: "Shop", accessor: (f) => <span className="font-medium">{f.customer.name}</span> },
    { header: "Merchandiser", accessor: (f) => f.merchandiser.name },
    { header: "Category", accessor: (f) => <Badge variant="outline">{f.category}</Badge> },
    { header: "Rating", accessor: (f) => f.rating ? <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-500" />{f.rating}</span> : "—" },
    { header: "Feedback", accessor: (f) => <span className="block max-w-xs truncate" title={f.comments}>{f.comments}</span> },
    { header: "Follow-up", accessor: (f) => (f.followUpRequired ? <Badge variant="warning">Required</Badge> : "—") },
    { header: "Status", accessor: (f) => statusBadge(f.status) },
    { header: "Date", accessor: (f) => fmtDateTime(f.createdAt) },
    { header: "", accessor: (f) => <Button variant="ghost" size="sm" className="cursor-pointer" onClick={() => openReview(f)}>Review</Button> },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Topbar title="Shop Visits & Feedback" />
      <div className="p-3 sm:p-4 lg:p-6 xl:p-8 space-y-4">
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-600"><span className="flex items-center gap-1"><ClipboardList className="h-3.5 w-3.5" />{tab === "visits" ? "Visits (this filter)" : "Feedback (this filter)"}</span></CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{meta?.total ?? 0}</div></CardContent></Card>
          {newCount !== null && (
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-600"><span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />New on this page</span></CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{newCount}</div></CardContent></Card>
          )}
        </div>

        <div className="flex gap-2 border-b border-slate-200">
          {([["feedback", "Feedback"], ["visits", "Visits"]] as const).map(([k, label]) => (
            <button key={k} onClick={() => { setTab(k); setPage(1) }} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px cursor-pointer ${tab === k ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>{label}</button>
          ))}
        </div>

        <div className="flex gap-3 items-center flex-wrap">
          <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1) }} className="w-40" title="From" />
          <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1) }} className="w-40" title="To" />
          <Select value={merchandiserId} onChange={(e) => { setMerchandiserId(e.target.value); setPage(1) }} className="w-52">
            <option value="">All merchandisers</option>
            {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          {tab === "visits" ? (
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer"><input type="checkbox" checked={outOfRange} onChange={(e) => { setOutOfRange(e.target.checked); setPage(1) }} /><AlertTriangle className="h-3.5 w-3.5 text-amber-500" />Out of range only</label>
          ) : (
            <>
              <Select value={fbStatus} onChange={(e) => { setFbStatus(e.target.value); setPage(1) }} className="w-40">
                <option value="">Any status</option>{FEEDBACK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
              <Select value={fbCategory} onChange={(e) => { setFbCategory(e.target.value); setPage(1) }} className="w-44">
                <option value="">Any category</option>{FEEDBACK_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer"><input type="checkbox" checked={followUp} onChange={(e) => { setFollowUp(e.target.checked); setPage(1) }} />Follow-up required</label>
            </>
          )}
          <Button variant="outline" size="sm" onClick={load} className="cursor-pointer">Refresh</Button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
          : tab === "visits" ? <DataTable data={visits} columns={visitColumns} /> : <DataTable data={feedback} columns={feedbackColumns} />}

        {meta && meta.total > meta.limit && (
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Page {meta.page} of {Math.ceil(meta.total / meta.limit)} · {meta.total} records</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="cursor-pointer">Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= Math.ceil(meta.total / meta.limit)} onClick={() => setPage(page + 1)} className="cursor-pointer">Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Visit details */}
      <Dialog open={!!visit} onOpenChange={(o) => !o && setVisit(null)}>
        <DialogContent onClose={() => setVisit(null)} className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {visit && (
            <>
              <DialogHeader>
                <DialogTitle>{visit.customer.name}</DialogTitle>
                <DialogDescription>{visit.merchandiser.name} · {fmtDateTime(visit.startedAt)} → {visit.endedAt ? fmtTime(visit.endedAt) : "in progress"}</DialogDescription>
              </DialogHeader>
              <div className="space-y-2 text-sm">
                {visit.outOfRange && <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">Visit started {visit.startDistanceM != null ? Math.round(visit.startDistanceM) : "?"} m from the shop&apos;s recorded location.</p>}
                {visit.notes && <p><span className="font-medium">Notes:</span> {visit.notes}</p>}
                <p className="font-semibold pt-2">Feedback ({visit.feedback.length})</p>
                {visit.feedback.length === 0 ? <p className="text-slate-400">No feedback was submitted</p> : visit.feedback.map((f) => (
                  <div key={f.id} className="border border-slate-100 rounded-lg p-3 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap"><Badge variant="outline">{f.category}</Badge>{statusBadge(f.status)}{f.followUpRequired && <Badge variant="warning">Follow-up</Badge>}{f.rating && <span className="inline-flex items-center gap-1 text-xs"><Star className="h-3 w-3 text-amber-500" />{f.rating}/5</span>}</div>
                    <p>{f.comments}</p>
                    {f.adminNote && <p className="text-xs text-slate-500">Admin note: {f.adminNote}</p>}
                  </div>
                ))}
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setVisit(null)} className="cursor-pointer">Close</Button></DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Feedback review */}
      <Dialog open={!!review} onOpenChange={(o) => !o && setReview(null)}>
        <DialogContent onClose={() => setReview(null)} className="max-w-[95vw] sm:max-w-lg">
          {review && (
            <>
              <DialogHeader>
                <DialogTitle>Review feedback</DialogTitle>
                <DialogDescription>{review.customer.name} · {review.merchandiser.name} · {fmtDateTime(review.createdAt)}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="flex items-center gap-2"><Badge variant="outline">{review.category}</Badge>{review.followUpRequired && <Badge variant="warning">Follow-up</Badge>}</div>
                <p className="text-sm bg-slate-50 rounded-lg p-3">{review.comments}</p>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={reviewStatus} onChange={(e) => setReviewStatus(e.target.value as FeedbackRow["status"])} className="mt-1">
                    {FEEDBACK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Admin note</label>
                  <Input value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} maxLength={1000} placeholder="What was done / decided" className="mt-1" />
                </div>
                {reviewError && <p className="text-sm text-red-500">{reviewError}</p>}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setReview(null)} className="cursor-pointer">Cancel</Button>
                <Button onClick={saveReview} disabled={saving} className="cursor-pointer">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
