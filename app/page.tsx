"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

type Reason = {
  id: string;
  rank: number;
  text: string;
  category: string;
};

type ReasonsResponse = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: Reason[];
};

// ─── Element Themes ───────────────────────────────────────────────────────────

const ELEMENTS = ["air", "water", "fire", "earth"] as const;
type Element = (typeof ELEMENTS)[number];

const ELEMENT_META: Record<
  Element,
  {
    label: string;
    emoji: string;
    accent: string;
    glow: string;
    cardBorder: string;
    rankColor: string;
    catColor: string;
    stripe: string;
  }
> = {
  air: {
    label: "Air",
    emoji: "🌀",
    accent: "from-sky-200 via-cyan-100 to-white",
    glow: "bg-sky-300/20",
    cardBorder: "border-sky-400/30",
    rankColor: "text-sky-100",
    catColor: "text-cyan-300",
    stripe: "bg-sky-400",
  },
  water: {
    label: "Water",
    emoji: "🌊",
    accent: "from-blue-300 via-cyan-400 to-teal-200",
    glow: "bg-blue-400/20",
    cardBorder: "border-blue-400/30",
    rankColor: "text-teal-100",
    catColor: "text-blue-300",
    stripe: "bg-teal-400",
  },
  fire: {
    label: "Fire",
    emoji: "🔥",
    accent: "from-orange-300 via-red-300 to-yellow-200",
    glow: "bg-orange-400/20",
    cardBorder: "border-orange-400/30",
    rankColor: "text-orange-100",
    catColor: "text-red-300",
    stripe: "bg-orange-400",
  },
  earth: {
    label: "Earth",
    emoji: "🪨",
    accent: "from-lime-300 via-green-300 to-emerald-200",
    glow: "bg-green-500/20",
    cardBorder: "border-green-500/30",
    rankColor: "text-lime-100",
    catColor: "text-emerald-300",
    stripe: "bg-lime-400",
  },
};

const CATEGORY_OPTIONS = [
  "all",
  "spirituality",
  "airbending",
  "leadership",
  "growth",
  "strategy",
  "values",
  "legacy",
  "combat",
  "teamwork",
  "avatar-duty",
] as const;

// ─── 3D Tilt Card ─────────────────────────────────────────────────────────────

function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [shine, setShine] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      setRotate({ x: -(py - 0.5) * 14, y: (px - 0.5) * 14 });
      setShine({ x: px * 100, y: py * 100 });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setRotate({ x: 0, y: 0 });
    setHovered(false);
  }, []);

  return (
    <motion.div
      ref={ref}
      className={`tilt-card ${className ?? ""}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX: rotate.x, rotateY: rotate.y, scale: hovered ? 1.025 : 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 22, mass: 0.5 }}
      style={{ transformStyle: "preserve-3d", perspective: 900 }}
    >
      {hovered && (
        <div
          className="shine-overlay pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,0.1), transparent 60%)`,
          }}
        />
      )}
      {children}
    </motion.div>
  );
}

// ─── Reason Card ──────────────────────────────────────────────────────────────

function ReasonCard({
  reason,
  theme,
  index,
}: {
  reason: Reason;
  theme: (typeof ELEMENT_META)[Element];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.38, delay: (index % 9) * 0.04, ease: "easeOut" }}
    >
      <TiltCard
        className={`reason-card group relative flex flex-col overflow-hidden rounded-2xl border ${theme.cardBorder}`}
      >
        {/* card background image */}
        <Image
          src="/cardbg.png"
          alt=""
          fill
          className="object-cover object-center opacity-60 transition-opacity duration-300 group-hover:opacity-75"
          aria-hidden
        />

        {/* dark overlay — lighter so image shows through */}
        <div className="absolute inset-0 bg-linear-to-br from-slate-950/60 via-slate-900/40 to-slate-950/65" />

        {/* coloured left stripe */}
        <div className={`absolute left-0 top-0 h-full w-1 ${theme.stripe} opacity-80`} />

        {/* rank badge — top right */}
        <div className="absolute right-3 top-3 z-10 rounded-full bg-black/50 px-2.5 py-0.5 text-xs font-black tabular-nums text-white/50 ring-1 ring-white/10 backdrop-blur">
          #{reason.rank}
        </div>

        {/* content */}
        <div className="relative z-10 flex flex-col gap-3 p-5 pl-6">
          <span
            className={`w-fit rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${theme.catColor} bg-white/5 ring-1 ring-white/10`}
          >
            {reason.category}
          </span>
          <p className="text-sm leading-relaxed text-slate-100/90">
            {reason.text.replace(/^Reason #\d+:\s*/i, "")}
          </p>
        </div>

        {/* rank progress bar */}
        <div className="relative z-10 mt-auto border-t border-white/5 px-5 py-2.5 pl-6">
          <div className="h-0.5 w-full rounded-full bg-white/5">
            <div
              className={`h-0.5 rounded-full ${theme.stripe} opacity-60`}
              style={{ width: `${Math.min((reason.rank / 1000) * 100, 100)}%` }}
            />
          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Reason[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [q, setQ] = useState("");
  const [category, setCategory] =
    useState<(typeof CATEGORY_OPTIONS)[number]>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [randomReason, setRandomReason] = useState<Reason | null>(null);

  // Use a ref so the IntersectionObserver callback always reads the latest
  // loading value without needing to be re-created when loading changes.
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const [element, setElement] = useState<Element>("air");
  const theme = ELEMENT_META[element];

  const [aangVotes, setAangVotes] = useState(720);
  const [korraVotes, setKorraVotes] = useState(280);
  const totalVotes = aangVotes + korraVotes;
  const aangPct = Math.round((aangVotes / totalVotes) * 100);
  const korraPct = 100 - aangPct;

  const { scrollYProgress } = useScroll();
  const progressScale = useSpring(scrollYProgress, {
    stiffness: 130,
    damping: 30,
    mass: 0.2,
  });

  const filterQuery = useMemo(() => {
    const params = new URLSearchParams();
    params.set("limit", "12");
    if (category !== "all") params.set("category", category);
    if (q.trim()) params.set("q", q.trim());
    return params.toString();
  }, [category, q]);

  // Keep loadingRef in sync so observer doesn't need loading in its dep array
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  // Fetch reasons
  useEffect(() => {
    const controller = new AbortController();

    async function loadReasons() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/reasons?page=${page}&${filterQuery}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to load reasons");
        const payload = (await res.json()) as ReasonsResponse;
        setTotal(payload.total);
        setTotalPages(payload.totalPages);
        setItems((cur) =>
          page === 1 ? payload.items : [...cur, ...payload.items]
        );
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadReasons();
    return () => controller.abort();
  }, [page, filterQuery]);

  // Infinite scroll — only depends on totalPages so observer is stable
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loadingRef.current) {
          setPage((p) => {
            // read latest totalPages from closure via state setter; bail if done
            let next = p;
            setTotalPages((tp) => {
              if (p < tp) next = p + 1;
              return tp;
            });
            return next;
          });
        }
      },
      { rootMargin: "0px 0px 200px 0px", threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []); // intentionally empty — loadingRef & setTotalPages are stable refs

  async function fetchRandomReason() {
    try {
      const res = await fetch("/api/reasons/random", { cache: "no-store" });
      if (!res.ok) throw new Error("Could not fetch random reason");
      setRandomReason((await res.json()) as Reason);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  function resetFilters() {
    setPage(1);
    setItems([]);
    setQ("");
    setCategory("all");
  }

  return (
    <main
      className={`arena-root element-${element} relative min-h-screen overflow-x-hidden text-slate-100`}
    >
      {/* Scroll progress bar */}
      <motion.div className="scroll-meter" style={{ scaleX: progressScale }} />

      {/* Fixed background */}
      <div className="fixed inset-0 -z-20">
        <Image
          src="/aangvskorra.png"
          alt="Aang vs Korra"
          fill
          className="object-cover object-center"
          priority
          quality={90}
        />
      </div>
      <div className="bg-overlay fixed inset-0 -z-10" />
      <div className="arena-lights pointer-events-none fixed inset-0 -z-10" />

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
        className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-8 lg:px-12"
      >
        {/* ── Hero ──────────────────────────────────────────── */}
        <motion.header
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="arena-hero relative overflow-hidden rounded-4xl border p-7 backdrop-blur"
        >
          <motion.div
            className={`pointer-events-none absolute -right-20 -top-10 h-72 w-72 rounded-full blur-3xl ${theme.glow}`}
            animate={{ x: [0, -12, 0], y: [0, 14, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className={`pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full blur-3xl ${theme.glow}`}
            animate={{ x: [0, 10, 0], y: [0, -10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />

          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
            The Avatar Archive
          </p>
          <h1
            className={`mt-2 bg-linear-to-r ${theme.accent} bg-clip-text text-5xl font-black leading-none text-transparent sm:text-7xl`}
          >
            Aang
            <br />
            <span className="text-3xl font-light text-white/40 sm:text-4xl">
              over
            </span>{" "}
            Korra
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-300/80">
            1000 powered takes on why Aang is the superior Avatar —
            fetched live, sorted by rank, filter by element.
          </p>

          {/* Stats row */}
          <div className="mt-6 flex flex-wrap gap-6">
            {[
              { label: "Total reasons", value: total || 1000 },
              { label: "Loaded", value: items.length },
              { label: "Page", value: `${page} / ${totalPages}` },
            ].map((s) => (
              <div key={s.label} className="flex flex-col">
                <span className="text-2xl font-black text-white">
                  {s.value}
                </span>
                <span className="text-xs text-slate-400">{s.label}</span>
              </div>
            ))}
          </div>
        </motion.header>

        {/* ── Element Switcher ──────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold uppercase tracking-widest text-white/30">
            Theme
          </span>
          {ELEMENTS.map((el) => {
            const meta = ELEMENT_META[el];
            const active = element === el;
            return (
              <motion.button
                key={el}
                onClick={() => setElement(el)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className={`element-btn relative overflow-hidden rounded-full px-4 py-1.5 text-sm font-bold ${
                  active ? "element-btn-active" : ""
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="element-pill"
                    className={`absolute inset-0 rounded-full bg-linear-to-r ${meta.accent} opacity-20`}
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  />
                )}
                <span className="relative z-10">
                  {meta.emoji} {meta.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* ── Duel Meter ────────────────────────────────────── */}
        <section className="arena-duel rounded-3xl border p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
            Who wins? Cast your vote
          </p>
          <div className="mb-4 flex items-center justify-between gap-4">
            <motion.button
              onClick={() => setAangVotes((v) => v + 1)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
              className="vote-btn-aang flex-1 rounded-2xl px-4 py-3 text-sm font-black text-slate-950"
            >
              🌀 Aang
            </motion.button>
            <div className="text-center">
              <p className="text-xl font-black">
                <span className="text-cyan-300">{aangPct}%</span>
                <span className="mx-1.5 text-white/20">·</span>
                <span className="text-orange-300">{korraPct}%</span>
              </p>
              <p className="text-[10px] text-white/30">{totalVotes} votes</p>
            </div>
            <motion.button
              onClick={() => setKorraVotes((v) => v + 1)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
              className="vote-btn-korra flex-1 rounded-2xl px-4 py-3 text-sm font-black text-slate-950"
            >
              Korra 🔥
            </motion.button>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="absolute left-0 top-0 h-full bg-linear-to-r from-cyan-400 to-sky-300"
              animate={{ width: `${aangPct}%` }}
              transition={{ type: "spring", stiffness: 80, damping: 16 }}
            />
            <motion.div
              className="absolute right-0 top-0 h-full bg-linear-to-l from-orange-400 to-red-300"
              animate={{ width: `${korraPct}%` }}
              transition={{ type: "spring", stiffness: 80, damping: 16 }}
            />
            <div className="absolute left-1/2 top-0 h-full w-px bg-white/30" />
          </div>
        </section>

        {/* ── Search / Filter Controls ──────────────────────── */}
        <section className="arena-controls flex flex-wrap gap-3 rounded-2xl border p-4">
          <input
            value={q}
            onChange={(e) => {
              setPage(1);
              setItems([]);
              setQ(e.target.value);
            }}
            placeholder="Search reasons..."
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm outline-none placeholder:text-white/25 ring-fuchsia-300/50 transition focus:ring-2"
          />
          <select
            value={category}
            onChange={(e) => {
              setPage(1);
              setItems([]);
              setCategory(e.target.value as typeof category);
            }}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none ring-cyan-300/50 transition focus:ring-2"
          >
            {CATEGORY_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item === "all" ? "All categories" : item}
              </option>
            ))}
          </select>
          <motion.button
            onClick={fetchRandomReason}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`rounded-xl bg-linear-to-r ${theme.accent} px-4 py-2 text-sm font-black text-slate-950`}
          >
            ✦ Random take
          </motion.button>
          <motion.button
            onClick={resetFilters}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/60 hover:text-white/90"
          >
            Reset
          </motion.button>
        </section>

        {/* ── Random Spotlight ──────────────────────────────── */}
        <AnimatePresence mode="wait">
          {randomReason ? (
            <motion.div
              key={randomReason.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="spotlight-card rounded-3xl border p-6 backdrop-blur"
            >
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
                ✦ random spotlight
              </p>
              <div className="flex gap-4">
                <span
                  className={`mt-0.5 shrink-0 text-4xl font-black tabular-nums leading-none ${theme.rankColor} opacity-30`}
                >
                  {randomReason.rank}
                </span>
                <p className="text-base leading-relaxed text-slate-100">
                  {randomReason.text.replace(/^Reason #\d+:\s*/i, "")}
                </p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {error ? (
          <p className="rounded-xl border border-red-400/20 bg-red-950/30 p-4 text-sm text-red-300">
            {error}
          </p>
        ) : null}

        {/* ── Reason Cards ──────────────────────────────────── */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {loading && items.length === 0
            ? Array.from({ length: 9 }, (_, i) => (
                <div
                  key={`sk-${i}`}
                  className="h-36 animate-pulse rounded-2xl border border-white/5 bg-white/5"
                />
              ))
            : items.map((reason, index) => (
                <ReasonCard
                  key={reason.id}
                  reason={reason}
                  theme={theme}
                  index={index}
                />
              ))}
        </section>

        {/* ── Sentinel + footer ─────────────────────────────── */}
        <div ref={sentinelRef} className="h-4 w-full" aria-hidden />

        <footer className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-5 py-3 backdrop-blur">
          <p className="text-xs text-white/30">
            {items.length} of {total} reasons loaded
          </p>
          {loading && items.length > 0 ? (
            <motion.span
              className="text-xs text-white/40"
              animate={{ opacity: [0.3, 0.9, 0.3] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            >
              fetching more…
            </motion.span>
          ) : !loading && page >= totalPages && items.length > 0 ? (
            <span className="text-xs text-white/30">
              end of archive ✦
            </span>
          ) : null}
        </footer>
      </motion.section>

      {/* Scroll to top button */}
      <AnimatePresence>
        {items.length > 12 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="scroll-top-btn fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-xl"
            aria-label="Scroll to top"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </main>
  );
}
