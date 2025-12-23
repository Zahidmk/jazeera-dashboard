import { MobileNav } from "@/components/mobile/MobileNav"

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {children}
      <MobileNav />
    </div>
  )
}










