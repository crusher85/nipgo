"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import {
  Star, StarOff, Phone, Mail, Globe, MapPin, Tag, Plus, X,
  ChevronRight, Check, Clock, Trash2, Edit3, Send, Building2,
  ArrowUpRight, Filter, Search, Download, Share2, CheckSquare, Square
} from "lucide-react"

type CrmContact = {
  id: string; nip: string; nazwa: string | null; forma_prawna: string | null
  miejscowosc: string | null; telefon: string | null; email: string | null
  www: string | null; status: string; score: number; tags: string[]
  source: string; created_at: string; updated_at: string
}
type CrmNote = { id: string; contact_id: string; content: string; created_at: string }
type CrmTask = { id: string; contact_id: string; title: string; due_date: string | null; done: boolean; done_at: string | null; created_at: string }
type CrmStatusHistory = { id: string; contact_id: string; status_old: string | null; status_new: string; created_at: string }

const STATUSES = [
  { value: "nowy",           label: "Nowy",           color: "#6b7280", bg: "#f3f4f6" },
  { value: "skontaktowany",  label: "Skontaktowany",  color: "#2563eb", bg: "#eff6ff" },
  { value: "w_negocjacjach", label: "W negocjacjach", color: "#f59e0b", bg: "#fef3c7" },
  { value: "klient",         label: "Klient",         color: "#16a34a", bg: "#f0fdf4" },
  { value: "zrezygnowal",    label: "Zrezygnował",    color: "#ef4444", bg: "#fef2f2" },
]

function statusMeta(value: string) {
  return STATUSES.find(s => s.value === value) ?? STATUSES[0]
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("pl-PL", { day: "2-digit", month: "short", year: "numeric" })
}
function fmtDateTime(d: string) {
  return new Date(d).toLocaleDateString("pl-PL", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
}
function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} min temu`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h temu`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d temu`
  return fmtDate(d)
}

export function TabCrm({ dark, userId }: { dark: boolean; userId: string }) {
  const supabase = createClient()

  const text = dark ? "#f5f5f5" : "#111"
  const muted = dark ? "#555" : "#9ca3af"
  const card = dark ? "#111" : "#fff"
  const border = dark ? "#1e1e1e" : "#e8eaed"
  const sub = dark ? "#0d0d0d" : "#f8f9fb"
  const hover = dark ? "#1a1a1a" : "#f9fafb"
  const divider = dark ? "#1a1a1a" : "#f3f4f6"
  const inputBorder = dark ? "#2a2a2a" : "#e8eaed"

  const [contacts, setContacts] = useState<CrmContact[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<CrmContact | null>(null)
  const [notes, setNotes] = useState<CrmNote[]>([])
  const [tasks, setTasks] = useState<CrmTask[]>([])
  const [history, setHistory] = useState<CrmStatusHistory[]>([])
  const [newNote, setNewNote] = useState("")
  const [newTask, setNewTask] = useState("")
  const [newTaskDate, setNewTaskDate] = useState("")
  const [savingNote, setSavingNote] = useState(false)
  const [savingTask, setSavingTask] = useState(false)
  const [filterStatus, setFilterStatus] = useState("")
  const [filterQ, setFilterQ] = useState("")
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [shareModal, setShareModal] = useState<CrmContact | null>(null)
  const [shareEmail, setShareEmail] = useState("")
  const [sharing, setSharing] = useState(false)
  const [shareResult, setShareResult] = useState<"sent" | "error" | null>(null)
  const [editingTag, setEditingTag] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [statusDropdown, setStatusDropdown] = useState(false)
  const [detailTab, setDetailTab] = useState<"notatki" | "zadania" | "historia">("notatki")

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", fontSize: 13, color: text,
    background: sub, border: `1px solid ${inputBorder}`, borderRadius: 8,
    outline: "none", fontFamily: "'DM Sans', system-ui, sans-serif", boxSizing: "border-box"
  }

  // Load contacts
  useEffect(() => {
    loadContacts()
  }, [])

  async function loadContacts() {
    setLoading(true)
    const { data } = await supabase
      .from("crm_contacts")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
    setContacts(data ?? [])
    setLoading(false)
  }

  // Load contact details
  async function loadDetails(contact: CrmContact) {
    setSelected(contact)
    setDetailTab("notatki")
    const [{ data: n }, { data: t }, { data: h }] = await Promise.all([
      supabase.from("crm_notes").select("*").eq("contact_id", contact.id).order("created_at", { ascending: false }),
      supabase.from("crm_tasks").select("*").eq("contact_id", contact.id).order("due_date", { ascending: true }),
      supabase.from("crm_status_history").select("*").eq("contact_id", contact.id).order("created_at", { ascending: false }),
    ])
    setNotes(n ?? [])
    setTasks(t ?? [])
    setHistory(h ?? [])
  }

  async function handleStatusChange(contact: CrmContact, newStatus: string) {
    const old = contact.status
    // Optimistic update
    setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, status: newStatus } : c))
    if (selected?.id === contact.id) setSelected(prev => prev ? { ...prev, status: newStatus } : prev)

    await supabase.from("crm_contacts").update({ status: newStatus }).eq("id", contact.id)
    await supabase.from("crm_status_history").insert({ user_id: userId, contact_id: contact.id, status_old: old, status_new: newStatus })

    if (selected?.id === contact.id) {
      const { data } = await supabase.from("crm_status_history").select("*").eq("contact_id", contact.id).order("created_at", { ascending: false })
      setHistory(data ?? [])
    }
    setStatusDropdown(false)
  }

  async function handleScoreChange(contact: CrmContact, score: number) {
    const newScore = contact.score === score ? 0 : score
    setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, score: newScore } : c))
    if (selected?.id === contact.id) setSelected(prev => prev ? { ...prev, score: newScore } : prev)
    await supabase.from("crm_contacts").update({ score: newScore }).eq("id", contact.id)
  }

  async function handleAddNote() {
    if (!newNote.trim() || !selected) return
    setSavingNote(true)
    const { data } = await supabase.from("crm_notes").insert({
      user_id: userId, contact_id: selected.id, content: newNote.trim()
    }).select().single()
    if (data) setNotes(prev => [data, ...prev])
    setNewNote("")
    setSavingNote(false)
    // touch updated_at
    await supabase.from("crm_contacts").update({ updated_at: new Date().toISOString() }).eq("id", selected.id)
    setContacts(prev => prev.map(c => c.id === selected.id ? { ...c, updated_at: new Date().toISOString() } : c))
  }

  async function handleDeleteNote(id: string) {
    await supabase.from("crm_notes").delete().eq("id", id)
    setNotes(prev => prev.filter(n => n.id !== id))
  }

  async function handleAddTask() {
    if (!newTask.trim() || !selected) return
    setSavingTask(true)
    const { data } = await supabase.from("crm_tasks").insert({
      user_id: userId, contact_id: selected.id, title: newTask.trim(),
      due_date: newTaskDate || null
    }).select().single()
    if (data) setTasks(prev => [...prev, data].sort((a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? "")))
    setNewTask(""); setNewTaskDate("")
    setSavingTask(false)
  }

  async function handleToggleTask(task: CrmTask) {
    const done = !task.done
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done, done_at: done ? new Date().toISOString() : null } : t))
    await supabase.from("crm_tasks").update({ done, done_at: done ? new Date().toISOString() : null }).eq("id", task.id)
  }

  async function handleDeleteTask(id: string) {
    await supabase.from("crm_tasks").delete().eq("id", id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  async function handleAddTag() {
    if (!newTag.trim() || !selected) return
    const tags = [...(selected.tags ?? []), newTag.trim()]
    await supabase.from("crm_contacts").update({ tags }).eq("id", selected.id)
    setContacts(prev => prev.map(c => c.id === selected.id ? { ...c, tags } : c))
    setSelected(prev => prev ? { ...prev, tags } : prev)
    setNewTag(""); setEditingTag(false)
  }

  async function handleRemoveTag(tag: string) {
    if (!selected) return
    const tags = selected.tags.filter(t => t !== tag)
    await supabase.from("crm_contacts").update({ tags }).eq("id", selected.id)
    setContacts(prev => prev.map(c => c.id === selected.id ? { ...c, tags } : c))
    setSelected(prev => prev ? { ...prev, tags } : prev)
  }

  async function handleDelete(contact: CrmContact) {
    if (!confirm(`Usunąć ${contact.nazwa ?? contact.nip} z CRM?`)) return
    await supabase.from("crm_contacts").delete().eq("id", contact.id)
    setContacts(prev => prev.filter(c => c.id !== contact.id))
    if (selected?.id === contact.id) setSelected(null)
  }

  async function handleShare() {
    if (!shareModal || !shareEmail.trim()) return
    setSharing(true)
    try {
      const res = await fetch("/api/crm/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: shareModal.id, email: shareEmail.trim() })
      })
      const data = await res.json()
      setShareResult(data.success ? "sent" : "error")
    } catch {
      setShareResult("error")
    }
    setSharing(false)
  }

  // Filtered contacts
  const filtered = contacts.filter(c => {
    if (filterStatus && c.status !== filterStatus) return false
    if (filterQ) {
      const q = filterQ.toLowerCase()
      if (!(c.nazwa ?? "").toLowerCase().includes(q) && !c.nip.includes(q) && !(c.miejscowosc ?? "").toLowerCase().includes(q)) return false
    }
    return true
  })

  const todayTasks = contacts.reduce((acc, c) => {
    // We'll show tasks due today from the selected contact's tasks in the detail panel
    return acc
  }, 0)

  const statsCounts = STATUSES.map(s => ({ ...s, count: contacts.filter(c => c.status === s.value).length }))

  // ── RENDER ──
  return (
    <div style={{ display: "flex", gap: 20, minHeight: 600 }}>

      {/* ── LEFT: List ── */}
      <div style={{ flex: "0 0 420px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Stats strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
          {statsCounts.map(s => (
            <button key={s.value} onClick={() => setFilterStatus(filterStatus === s.value ? "" : s.value)}
              style={{ padding: "10px 8px", borderRadius: 10, border: `1px solid ${filterStatus === s.value ? s.color : border}`, background: filterStatus === s.value ? s.bg : card, cursor: "pointer", textAlign: "center" }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: s.color, margin: 0 }}>{s.count}</p>
              <p style={{ fontSize: 10, color: muted, margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.label}</p>
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: "relative" }}>
          <Search size={13} color={muted} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input value={filterQ} onChange={e => setFilterQ(e.target.value)}
            placeholder="Szukaj po nazwie, NIP, mieście..."
            style={{ ...inputStyle, paddingLeft: 30 }} />
        </div>

        {/* Contact list */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 32, textAlign: "center", color: muted, fontSize: 13 }}>Ładowanie...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <Building2 size={28} color={dark ? "#222" : "#e5e7eb"} style={{ marginBottom: 10 }} />
              <p style={{ fontSize: 14, fontWeight: 500, color: text, margin: 0 }}>Brak kontaktów</p>
              <p style={{ fontSize: 12, color: muted, marginTop: 4 }}>Dodaj firmy z karty firmy lub wyszukiwarki</p>
            </div>
          ) : filtered.map((c, i) => {
            const sm = statusMeta(c.status)
            const isSelected = selected?.id === c.id
            return (
              <div key={c.id}
                onClick={() => loadDetails(c)}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "13px 16px",
                  borderBottom: i < filtered.length - 1 ? `1px solid ${divider}` : "none",
                  cursor: "pointer", background: isSelected ? (dark ? "#1a2a4a" : "#eff6ff") : "transparent",
                  transition: "background 0.1s"
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = hover }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent" }}>

                {/* Score stars */}
                <div style={{ display: "flex", flexDirection: "column", gap: 1, flexShrink: 0 }}>
                  {[5, 4, 3, 2, 1].map(n => (
                    <button key={n} onClick={e => { e.stopPropagation(); handleScoreChange(c, n) }}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, color: c.score >= n ? "#f59e0b" : (dark ? "#2a2a2a" : "#e5e7eb") }}>
                      <Star size={8} fill={c.score >= n ? "#f59e0b" : "none"} />
                    </button>
                  ))}
                </div>

                {/* Avatar */}
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: dark ? "#1e1e1e" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#2563eb", flexShrink: 0 }}>
                  {(c.nazwa ?? "?").replace(/[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, "").slice(0, 2).toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.nazwa ?? c.nip}
                  </p>
                  <p style={{ fontSize: 11, color: muted, margin: "2px 0 0", display: "flex", alignItems: "center", gap: 6 }}>
                    {c.miejscowosc && <span style={{ display: "flex", alignItems: "center", gap: 2 }}><MapPin size={9} />{c.miejscowosc}</span>}
                    {c.tags?.length > 0 && <span style={{ display: "flex", alignItems: "center", gap: 2 }}><Tag size={9} />{c.tags[0]}{c.tags.length > 1 ? ` +${c.tags.length - 1}` : ""}</span>}
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 100, background: sm.bg, color: sm.color }}>
                    {sm.label}
                  </span>
                  <span style={{ fontSize: 10, color: muted }}>{timeAgo(c.updated_at)}</span>
                </div>
              </div>
            )
          })}
        </div>

        {contacts.length > 0 && (
          <p style={{ fontSize: 11, color: muted, textAlign: "center" }}>
            {contacts.length} / 500 kontaktów
          </p>
        )}
      </div>

      {/* ── RIGHT: Detail panel ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {!selected ? (
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: "64px 32px", textAlign: "center" }}>
            <Building2 size={32} color={dark ? "#222" : "#e5e7eb"} style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 14, fontWeight: 500, color: text, margin: 0 }}>Wybierz kontakt</p>
            <p style={{ fontSize: 13, color: muted, marginTop: 4 }}>Kliknij firmę z listy aby zobaczyć szczegóły</p>
          </div>
        ) : (
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, overflow: "hidden" }}>

            {/* Header */}
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${divider}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <h2 style={{ fontSize: 17, fontWeight: 700, color: text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {selected.nazwa ?? selected.nip}
                    </h2>
                    <Link href={`/firma/${selected.nip}`} target="_blank"
                      style={{ color: muted, display: "flex", flexShrink: 0 }}
                      title="Otwórz kartę firmy">
                      <ArrowUpRight size={14} />
                    </Link>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {selected.forma_prawna && <span style={{ fontSize: 11, color: muted }}>{selected.forma_prawna}</span>}
                    {selected.miejscowosc && <span style={{ fontSize: 11, color: muted, display: "flex", alignItems: "center", gap: 3 }}><MapPin size={10} />{selected.miejscowosc}</span>}
                    {selected.telefon && <a href={`tel:${selected.telefon}`} style={{ fontSize: 11, color: "#16a34a", display: "flex", alignItems: "center", gap: 3, textDecoration: "none" }}><Phone size={10} />{selected.telefon}</a>}
                    {selected.email && <a href={`mailto:${selected.email}`} style={{ fontSize: 11, color: "#2563eb", display: "flex", alignItems: "center", gap: 3, textDecoration: "none" }}><Mail size={10} />{selected.email}</a>}
                    {selected.www && <a href={selected.www} target="_blank" style={{ fontSize: 11, color: muted, display: "flex", alignItems: "center", gap: 3, textDecoration: "none" }}><Globe size={10} />{selected.www.replace(/^https?:\/\//, "").slice(0, 20)}</a>}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {/* Score */}
                  <div style={{ display: "flex", gap: 2 }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => handleScoreChange(selected, n)}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: selected.score >= n ? "#f59e0b" : (dark ? "#2a2a2a" : "#e5e7eb") }}>
                        <Star size={14} fill={selected.score >= n ? "#f59e0b" : "none"} />
                      </button>
                    ))}
                  </div>

                  {/* Status dropdown */}
                  <div style={{ position: "relative" }}>
                    <button onClick={() => setStatusDropdown(o => !o)}
                      style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 8, border: `1px solid ${statusMeta(selected.status).color}`, background: statusMeta(selected.status).bg, color: statusMeta(selected.status).color, cursor: "pointer" }}>
                      {statusMeta(selected.status).label} ▾
                    </button>
                    {statusDropdown && (
                      <>
                        <div onClick={() => setStatusDropdown(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
                        <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", background: card, border: `1px solid ${border}`, borderRadius: 10, overflow: "hidden", zIndex: 50, minWidth: 160, boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
                          {STATUSES.map(s => (
                            <button key={s.value} onClick={() => handleStatusChange(selected, s.value)}
                              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 14px", fontSize: 13, color: selected.status === s.value ? s.color : text, background: selected.status === s.value ? s.bg : "transparent", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}
                              onMouseEnter={e => { if (selected.status !== s.value) e.currentTarget.style.background = hover }}
                              onMouseLeave={e => { if (selected.status !== s.value) e.currentTarget.style.background = "transparent" }}>
                              {selected.status === s.value && <Check size={12} />}
                              {selected.status !== s.value && <div style={{ width: 12 }} />}
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Share */}
                  <button onClick={() => { setShareModal(selected); setShareEmail(""); setShareResult(null) }}
                    title="Wyślij kontakt"
                    style={{ width: 32, height: 32, borderRadius: 8, background: "transparent", border: `1px solid ${border}`, color: muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Share2 size={13} />
                  </button>

                  {/* Delete */}
                  <button onClick={() => handleDelete(selected)}
                    title="Usuń z CRM"
                    style={{ width: 32, height: 32, borderRadius: 8, background: "transparent", border: `1px solid ${border}`, color: muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                {selected.tags?.map(tag => (
                  <span key={tag} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 100, background: dark ? "#1e1e1e" : "#f3f4f6", color: muted }}>
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: muted, lineHeight: 1, display: "flex" }}><X size={10} /></button>
                  </span>
                ))}
                {editingTag ? (
                  <div style={{ display: "flex", gap: 4 }}>
                    <input value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleAddTag(); if (e.key === "Escape") setEditingTag(false) }}
                      placeholder="Nowy tag..." autoFocus
                      style={{ ...inputStyle, width: 120, padding: "3px 8px", fontSize: 11 }} />
                    <button onClick={handleAddTag} style={{ fontSize: 11, padding: "3px 8px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>OK</button>
                    <button onClick={() => setEditingTag(false)} style={{ fontSize: 11, padding: "3px 8px", background: "transparent", color: muted, border: `1px solid ${border}`, borderRadius: 6, cursor: "pointer" }}>✕</button>
                  </div>
                ) : (
                  <button onClick={() => setEditingTag(true)}
                    style={{ fontSize: 11, color: muted, background: "none", border: `1px dashed ${border}`, borderRadius: 100, padding: "3px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    <Plus size={10} /> Tag
                  </button>
                )}
              </div>
            </div>

            {/* Detail tabs */}
            <div style={{ display: "flex", borderBottom: `1px solid ${divider}`, padding: "0 24px" }}>
              {(["notatki", "zadania", "historia"] as const).map(tab => (
                <button key={tab} onClick={() => setDetailTab(tab)}
                  style={{ padding: "12px 16px", fontSize: 13, fontWeight: detailTab === tab ? 600 : 400, color: detailTab === tab ? "#2563eb" : muted, background: "none", border: "none", borderBottom: detailTab === tab ? "2px solid #2563eb" : "2px solid transparent", cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize" }}>
                  {tab === "notatki" ? `Notatki (${notes.length})` : tab === "zadania" ? `Zadania (${tasks.filter(t => !t.done).length})` : "Historia"}
                </button>
              ))}
            </div>

            {/* Notatki */}
            {detailTab === "notatki" && (
              <div style={{ padding: 20 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <textarea value={newNote} onChange={e => setNewNote(e.target.value)}
                    placeholder="Dodaj notatkę... (Enter aby zapisać)"
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddNote() } }}
                    style={{ ...inputStyle, resize: "none", height: 72, lineHeight: 1.5 }} />
                  <button onClick={handleAddNote} disabled={savingNote || !newNote.trim()}
                    style={{ width: 40, background: newNote.trim() ? "#2563eb" : (dark ? "#1e1e1e" : "#f3f4f6"), border: "none", borderRadius: 8, cursor: newNote.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: newNote.trim() ? "#fff" : muted }}>
                    <Send size={14} />
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {notes.length === 0 ? (
                    <p style={{ fontSize: 13, color: muted, textAlign: "center", padding: "24px 0" }}>Brak notatek</p>
                  ) : notes.map(note => (
                    <div key={note.id} style={{ background: sub, borderRadius: 10, padding: "12px 14px", position: "relative" }}
                      onMouseEnter={e => e.currentTarget.querySelector<HTMLElement>(".del-btn")!.style.opacity = "1"}
                      onMouseLeave={e => e.currentTarget.querySelector<HTMLElement>(".del-btn")!.style.opacity = "0"}>
                      <p style={{ fontSize: 13, color: text, margin: "0 0 6px", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{note.content}</p>
                      <p style={{ fontSize: 11, color: muted, margin: 0 }}>{fmtDateTime(note.created_at)}</p>
                      <button className="del-btn" onClick={() => handleDeleteNote(note.id)}
                        style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", cursor: "pointer", color: muted, opacity: 0, transition: "opacity 0.1s", padding: 4, display: "flex" }}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Zadania */}
            {detailTab === "zadania" && (
              <div style={{ padding: 20 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <input value={newTask} onChange={e => setNewTask(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAddTask()}
                    placeholder="Nowe zadanie..."
                    style={{ ...inputStyle, flex: 1 }} />
                  <input type="date" value={newTaskDate} onChange={e => setNewTaskDate(e.target.value)}
                    style={{ ...inputStyle, width: 140, fontSize: 12 }} />
                  <button onClick={handleAddTask} disabled={!newTask.trim()}
                    style={{ padding: "0 14px", background: newTask.trim() ? "#2563eb" : (dark ? "#1e1e1e" : "#f3f4f6"), border: "none", borderRadius: 8, cursor: newTask.trim() ? "pointer" : "default", color: newTask.trim() ? "#fff" : muted, flexShrink: 0, fontSize: 13, fontWeight: 600 }}>
                    + Dodaj
                  </button>
                </div>

                {/* Pending tasks */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                  {tasks.filter(t => !t.done).length === 0 && (
                    <p style={{ fontSize: 13, color: muted, textAlign: "center", padding: "16px 0" }}>Brak zadań do zrobienia</p>
                  )}
                  {tasks.filter(t => !t.done).map(task => {
                    const overdue = task.due_date && new Date(task.due_date) < new Date()
                    return (
                      <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: sub, borderRadius: 8, border: `1px solid ${overdue ? "#fecaca" : border}` }}>
                        <button onClick={() => handleToggleTask(task)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: muted, display: "flex", flexShrink: 0 }}>
                          <Square size={16} />
                        </button>
                        <span style={{ flex: 1, fontSize: 13, color: text }}>{task.title}</span>
                        {task.due_date && (
                          <span style={{ fontSize: 11, color: overdue ? "#ef4444" : muted, display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
                            <Clock size={10} />{fmtDate(task.due_date)}
                          </span>
                        )}
                        <button onClick={() => handleDeleteTask(task.id)} style={{ background: "none", border: "none", cursor: "pointer", color: muted, padding: 0, display: "flex" }}>
                          <X size={12} />
                        </button>
                      </div>
                    )
                  })}
                </div>

                {/* Done tasks */}
                {tasks.filter(t => t.done).length > 0 && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Zrobione</p>
                    {tasks.filter(t => t.done).map(task => (
                      <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", opacity: 0.5 }}>
                        <button onClick={() => handleToggleTask(task)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#16a34a", display: "flex", flexShrink: 0 }}>
                          <CheckSquare size={16} />
                        </button>
                        <span style={{ flex: 1, fontSize: 13, color: muted, textDecoration: "line-through" }}>{task.title}</span>
                        <button onClick={() => handleDeleteTask(task.id)} style={{ background: "none", border: "none", cursor: "pointer", color: muted, padding: 0, display: "flex" }}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Historia */}
            {detailTab === "historia" && (
              <div style={{ padding: 20 }}>
                {history.length === 0 ? (
                  <p style={{ fontSize: 13, color: muted, textAlign: "center", padding: "24px 0" }}>Brak historii zmian</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {history.map((h, i) => {
                      const sm = statusMeta(h.status_new)
                      return (
                        <div key={h.id} style={{ display: "flex", gap: 12, paddingBottom: 16, position: "relative" }}>
                          {i < history.length - 1 && (
                            <div style={{ position: "absolute", left: 11, top: 24, bottom: 0, width: 1, background: divider }} />
                          )}
                          <div style={{ width: 23, height: 23, borderRadius: "50%", background: sm.bg, border: `2px solid ${sm.color}`, flexShrink: 0, zIndex: 1 }} />
                          <div>
                            <p style={{ fontSize: 13, color: text, margin: 0 }}>
                              {h.status_old
                                ? <><span style={{ color: muted }}>{statusMeta(h.status_old).label}</span> → <span style={{ color: sm.color, fontWeight: 600 }}>{sm.label}</span></>
                                : <span style={{ color: sm.color, fontWeight: 600 }}>Dodano do CRM jako {sm.label}</span>
                              }
                            </p>
                            <p style={{ fontSize: 11, color: muted, margin: "2px 0 0" }}>{fmtDateTime(h.created_at)}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Share Modal ── */}
      {shareModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 28, maxWidth: 400, width: "100%", boxShadow: "0 16px 48px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: text, margin: 0 }}>Wyślij kontakt</p>
                <p style={{ fontSize: 12, color: muted, margin: "2px 0 0" }}>{shareModal.nazwa ?? shareModal.nip}</p>
              </div>
              <button onClick={() => setShareModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: muted }}><X size={16} /></button>
            </div>

            {shareResult === "sent" ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <Check size={20} color="#16a34a" />
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: text, margin: 0 }}>Wysłano!</p>
                <p style={{ fontSize: 12, color: muted, marginTop: 4 }}>Kontakt został wysłany na {shareEmail}</p>
                <button onClick={() => setShareModal(null)} style={{ marginTop: 16, fontSize: 13, fontWeight: 600, padding: "8px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>OK</button>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 13, color: muted, marginBottom: 12, lineHeight: 1.5 }}>
                  Jeśli odbiorca ma konto nipgo.pl, kontakt trafi do jego CRM. Jeśli nie — dostanie email z zaproszeniem.
                </p>
                <input value={shareEmail} onChange={e => setShareEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleShare()}
                  placeholder="email@firma.pl" type="email"
                  style={{ ...inputStyle, marginBottom: 12 }} />
                {shareResult === "error" && (
                  <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 8 }}>Błąd wysyłania — spróbuj ponownie</p>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setShareModal(null)} style={{ flex: 1, padding: "9px", fontSize: 13, background: "transparent", border: `1px solid ${border}`, borderRadius: 8, color: text, cursor: "pointer" }}>Anuluj</button>
                  <button onClick={handleShare} disabled={sharing || !shareEmail.trim()}
                    style={{ flex: 2, padding: "9px", fontSize: 13, fontWeight: 600, background: shareEmail.trim() ? "#2563eb" : (dark ? "#1e1e1e" : "#f3f4f6"), color: shareEmail.trim() ? "#fff" : muted, border: "none", borderRadius: 8, cursor: shareEmail.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    {sharing ? "Wysyłanie..." : <><Send size={13} /> Wyślij</>}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
