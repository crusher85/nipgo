"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import type { User } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type Plan = "free" | "basic" | "pro"

export type UserProfile = {
  user: User | null
  plan: Plan
  loading: boolean
  exportRecordsUsed: number
  exportRecordsLimit: number
  aiQueriesUsedToday: number
  aiQueriesLimit: number
  monitoringLimit: number
}

export function useUser(): UserProfile {
  const [user, setUser] = useState<User | null>(null)
  const [plan, setPlan] = useState<Plan>("free")
  const [loading, setLoading] = useState(true)
  const [exportRecordsUsed, setExportRecordsUsed] = useState(0)
  const [exportRecordsLimit, setExportRecordsLimit] = useState(0)
  const [aiQueriesUsedToday, setAiQueriesUsedToday] = useState(0)
  const [aiQueriesLimit, setAiQueriesLimit] = useState(0)
  const [monitoringLimit, setMonitoringLimit] = useState(0)

  useEffect(() => {
    const init = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) { setLoading(false); return }
      
      setUser(authUser)
      
      const { data: profile } = await supabase
      .from("user_profiles")
      .select("plan, export_records_used_month, export_records_limit, ai_queries_limit, monitoring_limit")
      .eq("id", authUser.id)
      .maybeSingle()

      if (profile) {
        setPlan((profile.plan as Plan) ?? "free")
        setExportRecordsUsed(profile.export_records_used_month ?? 0)
        setExportRecordsLimit(profile.export_records_limit ?? 0)
        setAiQueriesLimit(profile.ai_queries_limit ?? 0)
        setMonitoringLimit(profile.monitoring_limit ?? 0)
      }

      setLoading(false)
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null)
        setPlan("free")
        setLoading(false)
      } else {
        init()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, plan, loading, exportRecordsUsed, exportRecordsLimit, aiQueriesUsedToday, aiQueriesLimit, monitoringLimit }
}
