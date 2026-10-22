import { redirect } from "next/navigation"

// The Van Warehouse picker was merged into the Vans page (each van row has a
// Warehouse action). This keeps old bookmarks and links working.
export default function WarehouseRedirect() {
  redirect("/dashboard/vans-reps")
}
