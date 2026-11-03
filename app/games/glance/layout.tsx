import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "glance — reading-fluency drills",
  description:
    "A word flashes, half as long each time you read it right. Then whole lines, a page that erases itself as you read, and a timed read an AI checks. Works on a page of your own book.",
  alternates: { canonical: "/games/glance" },
}

export default function GlanceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
