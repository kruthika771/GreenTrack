import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TreePine, TrendingDown, Award, Leaf, Download, AlertTriangle, X, Lightbulb, ChevronRight, History, Trash2 } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { getHistory, treesEquivalent, getEcoScore, getBadges, type CarbonBreakdown, type HistoryEntry } from "@/lib/carbon";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const COLORS = ["#2A9D5C", "#4CAF50", "#8BC34A", "#A1887F"];
const HIGHLIGHT_COLOR = "#EF4444";
const HIGHLIGHT_GLOW = "#F97316";

const CATEGORY_INSIGHTS: Record<string, { icon: string; description: string; tips: string[] }> = {
  Electricity: {
    icon: "⚡",
    description: "Your electricity usage is contributing the most to your carbon footprint. This is typically caused by heavy appliance usage, inefficient lighting, leaving devices on standby, or relying on non-renewable energy sources for power.",
    tips: [
      "Switch to LED bulbs — they use 75% less energy",
      "Unplug electronics and chargers when not in use",
      "Use a programmable thermostat to optimize heating/cooling",
      "Consider switching to a green energy provider",
      "Air-dry clothes instead of using a dryer",
      "Use natural light during daytime hours"
    ]
  },
  Transport: {
    icon: "🚗",
    description: "Your transport usage is contributing the most to your carbon footprint, mainly due to fuel consumption, frequent travel, long commutes, or heavy reliance on private vehicles instead of shared or public transport.",
    tips: [
      "Use public transport whenever possible",
      "Walk or cycle for short distances (under 3 km)",
      "Carpool with colleagues or friends",
      "Reduce unnecessary trips by combining errands",
      "Consider switching to an electric or hybrid vehicle",
      "Work from home when your job allows it"
    ]
  },
  Food: {
    icon: "🍽️",
    description: "Your food-related emissions are the highest. This is often driven by high consumption of red meat and dairy, food waste, purchasing out-of-season or imported produce, and processed food packaging.",
    tips: [
      "Reduce red meat consumption — try 2 meatless days per week",
      "Buy local and seasonal produce to cut transport emissions",
      "Plan meals ahead to minimize food waste",
      "Compost kitchen scraps instead of sending to landfill",
      "Choose plant-based alternatives for dairy products",
      "Avoid single-use packaging — buy in bulk"
    ]
  },
  Waste: {
    icon: "🗑️",
    description: "Your waste production is the highest emission category. This is typically caused by excessive single-use plastics, low recycling rates, food waste going to landfill where it produces methane, and overconsumption of disposable products.",
    tips: [
      "Follow the 3 R's: Reduce, Reuse, Recycle",
      "Start composting organic waste at home",
      "Carry reusable bags, bottles, and containers",
      "Avoid single-use plastics and disposable items",
      "Donate or repurpose items instead of discarding",
      "Separate waste properly for effective recycling"
    ]
  }
};

function exportPDF(breakdown: CarbonBreakdown, trees: number, eco: { score: number; label: string }, history: HistoryEntry[]) {
  const doc = new jsPDF();

  doc.setFontSize(22);
  doc.setTextColor(42, 157, 92);
  doc.text("GreenTrack Carbon Report", 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

  doc.setDrawColor(42, 157, 92);
  doc.line(14, 34, 196, 34);

  doc.setFontSize(14);
  doc.setTextColor(30);
  doc.text("Summary", 14, 44);

  autoTable(doc, {
    startY: 48,
    head: [["Metric", "Value"]],
    body: [
      ["Total CO2/month", `${breakdown.total} kg`],
      ["Electricity", `${breakdown.electricity} kg`],
      ["Transport", `${breakdown.transport} kg`],
      ["Food", `${breakdown.food} kg`],
      ["Waste", `${breakdown.waste} kg`],
      ["Trees to offset", `${trees} trees`],
      ["Eco Score", `${eco.score}/100 - ${eco.label}`],
    ],
    theme: "grid",
    headStyles: { fillColor: [42, 157, 92] },
  });

  if (history.length > 1) {
    const finalY = (doc as any).lastAutoTable?.finalY || 120;
    doc.setFontSize(14);
    doc.setTextColor(30);
    doc.text("History", 14, finalY + 12);

    autoTable(doc, {
      startY: finalY + 16,
      head: [["Date", "Electricity", "Transport", "Food", "Waste", "Total"]],
      body: history.map((h) => [
        new Date(h.date).toLocaleDateString(),
        `${h.breakdown.electricity}`,
        `${h.breakdown.transport}`,
        `${h.breakdown.food}`,
        `${h.breakdown.waste}`,
        `${h.breakdown.total}`,
      ]),
      theme: "grid",
      headStyles: { fillColor: [42, 157, 92] },
    });
  }

  doc.save("greentrack-report.pdf");
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    async function loadHistory() {
      if (user) {
        const { data } = await supabase
          .from("carbon_history")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: true });

        if (data) {
          setHistory(
            data.map((row) => ({
              date: row.date,
              breakdown: {
                electricity: Number(row.electricity),
                transport: Number(row.transport),
                food: Number(row.food),
                waste: Number(row.waste),
                total: Number(row.total),
              },
              inputs: row.inputs as any,
            }))
          );
        }
      } else {
        setHistory(getHistory());
      }
      setLoading(false);
    }
    loadHistory();
  }, [user]);

  const latest = history.length > 0 ? history[history.length - 1] : null;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <Leaf className="w-16 h-16 text-primary mx-auto mb-6 animate-pulse" />
        <p className="text-muted-foreground">Loading your data...</p>
      </div>
    );
  }

  if (!latest) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Leaf className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-3xl font-display font-bold mb-4">No Data Yet</h1>
          <p className="text-muted-foreground mb-8">Calculate your first carbon footprint to see your dashboard.</p>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link to="/calculator">Go to Calculator</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  const breakdown = latest.breakdown;
  const categories = [
    { name: "Electricity", value: breakdown.electricity },
    { name: "Transport", value: breakdown.transport },
    { name: "Food", value: breakdown.food },
    { name: "Waste", value: breakdown.waste },
  ];
  const maxValue = Math.max(...categories.map(c => c.value));
  const highestCategory = categories.find(c => c.value === maxValue)?.name || "";

  const pieData = categories;
  const barData = categories.map(c => ({
    ...c,
    isHighest: c.name === highestCategory,
  }));
  const lineData = history.map((h, i) => ({
    entry: `#${i + 1}`,
    total: h.breakdown.total,
    date: new Date(h.date).toLocaleDateString(),
  }));

  const trees = treesEquivalent(breakdown.total);
  const eco = getEcoScore(breakdown.total);
  const badges = getBadges(history.map((h) => h.breakdown));

  const handleBarClick = (data: any) => {
    if (data?.activePayload?.[0]) {
      setSelectedCategory(data.activePayload[0].payload.name);
    }
  };

  const handlePieClick = (_: any, index: number) => {
    setSelectedCategory(pieData[index].name);
  };

  const activeInsight = selectedCategory ? CATEGORY_INSIGHTS[selectedCategory] : null;
  const activeValue = selectedCategory ? categories.find(c => c.name === selectedCategory)?.value : 0;

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Your Dashboard</h1>
            <p className="text-muted-foreground">Your carbon footprint overview and progress</p>
          </div>
          <Button
            onClick={() => exportPDF(breakdown, trees, eco, history)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export PDF
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon={<Leaf className="w-5 h-5" />} label="Total CO2" value={`${breakdown.total} kg`} sub="per month" />
          <StatCard icon={<TreePine className="w-5 h-5" />} label="Tree Equivalent" value={`${trees} trees`} sub="needed to offset" />
          <StatCard icon={<Award className="w-5 h-5" />} label="Eco Score" value={`${eco.score}/100`} sub={eco.label} />
          <div
            onClick={() => setShowHistory(!showHistory)}
            className="glass-card p-5 cursor-pointer hover:border-primary/30 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-2 text-primary mb-2">
              <TrendingDown className="w-5 h-5" />
              <span className="text-sm font-medium text-muted-foreground">Entries</span>
              <History className="w-3.5 h-3.5 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <p className="text-2xl font-display font-bold">{history.length}</p>
            <p className="text-xs text-muted-foreground mt-1">click to view all entries</p>
          </div>
        </div>

        {/* History Entries Panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="mb-10 overflow-hidden"
            >
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    <h3 className="font-display font-semibold text-lg">All Entries</h3>
                  </div>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
                  {[...history].reverse().map((entry, idx) => {
                    const entryCategories = [
                      { name: "Electricity", value: entry.breakdown.electricity, icon: "⚡", color: "#2A9D5C" },
                      { name: "Transport", value: entry.breakdown.transport, icon: "🚗", color: "#4CAF50" },
                      { name: "Food", value: entry.breakdown.food, icon: "🍽️", color: "#8BC34A" },
                      { name: "Waste", value: entry.breakdown.waste, icon: "🗑️", color: "#A1887F" },
                    ];
                    const entryMax = Math.max(...entryCategories.map(c => c.value));
                    const entryHighest = entryCategories.find(c => c.value === entryMax);
                    const isLatest = idx === 0;

                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`p-4 rounded-xl border transition-all ${
                          isLatest
                            ? "bg-primary/5 border-primary/20 shadow-sm"
                            : "bg-background border-border hover:border-primary/15 hover:bg-primary/[0.02]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-muted-foreground">#{history.length - idx}</span>
                            <span className="text-sm font-semibold">
                              {new Date(entry.date).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                            {isLatest && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary text-white font-bold">LATEST</span>
                            )}
                          </div>
                          <span className="text-lg font-display font-bold text-primary">
                            {entry.breakdown.total} kg
                          </span>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                          {entryCategories.map((cat) => (
                            <div
                              key={cat.name}
                              className={`text-center p-2 rounded-lg text-xs ${
                                cat.value === entryMax
                                  ? "bg-red-50 border border-red-200/50 text-red-700"
                                  : "bg-muted/30"
                              }`}
                            >
                              <span className="text-base">{cat.icon}</span>
                              <p className="font-bold mt-0.5">{cat.value}</p>
                              <p className="text-[9px] text-muted-foreground">{cat.name}</p>
                            </div>
                          ))}
                        </div>

                        {entryHighest && (
                          <p className="text-[10px] text-muted-foreground mt-2">
                            Highest: <span className="font-semibold text-red-500">{entryHighest.icon} {entryHighest.name} ({entryHighest.value} kg)</span>
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {history.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-6">No entries yet. Use the calculator to add your first one!</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Highest Emission Alert Banner */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 p-4 rounded-xl border border-red-300/40 bg-gradient-to-r from-red-500/10 via-orange-500/5 to-transparent flex items-center gap-3 cursor-pointer hover:border-red-400/60 transition-all"
          onClick={() => setSelectedCategory(highestCategory)}
        >
          <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
              Highest Emission: {highestCategory} — {maxValue} kg CO2/month
            </p>
            <p className="text-xs text-muted-foreground">Click here or on the chart to see tips on how to reduce it</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          <div className="glass-card p-6">
            <h3 className="font-display font-semibold text-lg mb-4">Emission Breakdown</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}${name === highestCategory ? " ⚠️" : ""}`}
                  onClick={handlePieClick}
                  style={{ cursor: "pointer" }}
                >
                  {pieData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.name === highestCategory ? HIGHLIGHT_COLOR : COLORS[i]}
                      stroke={entry.name === highestCategory ? HIGHLIGHT_GLOW : "none"}
                      strokeWidth={entry.name === highestCategory ? 3 : 0}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value} kg CO2`,
                    name === highestCategory ? `${name} (Highest!)` : name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-center text-xs text-muted-foreground mt-2">Click a slice to see category details</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg">By Category (kg CO2/month)</h3>
              <span className="text-[10px] px-2 py-1 rounded-full bg-red-500/15 text-red-500 font-semibold">🔴 = Highest</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} onClick={handleBarClick} style={{ cursor: "pointer" }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(name) => name === highestCategory ? `⚠ ${name}` : name}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number, _: string, props: any) => [
                    `${value} kg CO2`,
                    props.payload.isHighest ? "⚠ Highest Emission" : "Emission"
                  ]}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.isHighest ? HIGHLIGHT_COLOR : COLORS[i]}
                      stroke={entry.isHighest ? HIGHLIGHT_GLOW : "transparent"}
                      strokeWidth={entry.isHighest ? 2 : 0}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-center text-xs text-muted-foreground mt-2">Click a bar to see reduction tips</p>
          </div>
        </div>

        {/* Detailed Category Insight Popup/Card */}
        <AnimatePresence>
          {selectedCategory && activeInsight && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="mb-10 rounded-2xl border-2 overflow-hidden shadow-xl"
              style={{ borderColor: selectedCategory === highestCategory ? HIGHLIGHT_COLOR + "40" : "hsl(var(--border))" }}
            >
              {/* Header */}
              <div className={`p-5 flex items-start justify-between gap-4 ${
                selectedCategory === highestCategory
                  ? "bg-gradient-to-r from-red-500/15 via-orange-500/10 to-transparent"
                  : "bg-gradient-to-r from-primary/10 via-emerald-500/5 to-transparent"
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{activeInsight.icon}</span>
                  <div>
                    <h3 className="font-display font-bold text-lg">
                      {selectedCategory} Emissions {selectedCategory === highestCategory ? "Are High" : "Overview"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-bold font-display">{activeValue} kg</span>
                      <span className="text-xs text-muted-foreground">CO2 per month</span>
                      {selectedCategory === highestCategory && (
                        <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-red-500 text-white font-bold animate-pulse">
                          ⚠ You are high in this area
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="p-1.5 rounded-lg hover:bg-background/60 transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 bg-background/50">
                <p className="text-sm leading-relaxed text-muted-foreground mb-5">
                  {activeInsight.description}
                </p>

                <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    <h4 className="font-display font-semibold text-sm">How to Reduce Your {selectedCategory} Footprint</h4>
                  </div>
                  <ul className="space-y-2">
                    {activeInsight.tips.map((tip, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        <span>{tip}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {history.length > 1 && (
          <div className="glass-card p-6 mb-10">
            <h3 className="font-display font-semibold text-lg mb-4">Progress Over Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="entry" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip labelFormatter={(_, payload) => payload[0]?.payload?.date || ""} />
                <Line type="monotone" dataKey="total" stroke="#2A9D5C" strokeWidth={3} dot={{ r: 5, fill: "#2A9D5C" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}


        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg mb-4">Badges & Achievements</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`text-center p-4 rounded-xl border transition-all ${
                  b.unlocked ? "bg-primary/5 border-primary/20" : "opacity-40 border-border"
                }`}
              >
                <div className="text-3xl mb-2">{b.icon}</div>
                <p className="text-xs font-semibold">{b.name}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 text-primary mb-2">{icon}<span className="text-sm font-medium text-muted-foreground">{label}</span></div>
      <p className="text-2xl font-display font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}
