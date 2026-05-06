import { motion } from "framer-motion";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { Shield, AlertTriangle, Lightbulb, TreePine, Droplets, Flame, Leaf, TrendingDown, ChevronRight } from "lucide-react";
import { type CarbonBreakdown, treesEquivalent, getEcoScore } from "@/lib/carbon";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const COLORS = ["#2A9D5C", "#4CAF50", "#8BC34A", "#A1887F"];

interface Props {
  breakdown: CarbonBreakdown;
}

function getPrecautions(breakdown: CarbonBreakdown) {
  const tips: { icon: React.ReactNode; title: string; description: string; severity: "high" | "medium" | "low" }[] = [];

  // Electricity
  if (breakdown.electricity > 80) {
    tips.push({ icon: <Flame className="w-5 h-5" />, title: "High Electricity Usage", description: "Switch to LED bulbs, use energy-efficient appliances, and turn off devices when not in use. Consider solar panels if possible.", severity: "high" });
  } else if (breakdown.electricity > 40) {
    tips.push({ icon: <Lightbulb className="w-5 h-5" />, title: "Moderate Electricity Usage", description: "Use smart power strips and schedule heavy appliances during off-peak hours to reduce consumption.", severity: "medium" });
  } else {
    tips.push({ icon: <Lightbulb className="w-5 h-5" />, title: "Good Electricity Habits", description: "Your electricity usage is efficient! Keep using energy-saving practices.", severity: "low" });
  }

  // Transport
  if (breakdown.transport > 60) {
    tips.push({ icon: <AlertTriangle className="w-5 h-5" />, title: "High Transport Emissions", description: "Consider carpooling, using public transport, or switching to an electric/hybrid vehicle. Walking or cycling for short trips can significantly reduce emissions.", severity: "high" });
  } else if (breakdown.transport > 25) {
    tips.push({ icon: <TrendingDown className="w-5 h-5" />, title: "Moderate Transport Emissions", description: "Try combining trips, working from home when possible, and maintaining proper tire pressure for better fuel efficiency.", severity: "medium" });
  } else {
    tips.push({ icon: <Leaf className="w-5 h-5" />, title: "Low Transport Emissions", description: "Great job keeping transport emissions low! Continue using eco-friendly commuting options.", severity: "low" });
  }

  // Food
  if (breakdown.food > 200) {
    tips.push({ icon: <AlertTriangle className="w-5 h-5" />, title: "High Food Emissions", description: "Reduce red meat consumption, buy local and seasonal produce, minimize food waste, and try plant-based meals a few days per week.", severity: "high" });
  } else if (breakdown.food > 100) {
    tips.push({ icon: <Droplets className="w-5 h-5" />, title: "Moderate Food Emissions", description: "Consider Meatless Mondays, composting food scraps, and choosing products with less packaging.", severity: "medium" });
  } else {
    tips.push({ icon: <Leaf className="w-5 h-5" />, title: "Eco-Friendly Diet", description: "Your food choices are environmentally conscious! Keep prioritizing plant-based meals.", severity: "low" });
  }

  // Waste
  if (breakdown.waste > 15) {
    tips.push({ icon: <AlertTriangle className="w-5 h-5" />, title: "High Waste Generation", description: "Practice the 3Rs: Reduce, Reuse, Recycle. Compost organic waste, avoid single-use plastics, and buy products with minimal packaging.", severity: "high" });
  } else if (breakdown.waste > 7) {
    tips.push({ icon: <Shield className="w-5 h-5" />, title: "Moderate Waste Output", description: "Start composting at home and carry reusable bags, bottles, and containers to reduce waste further.", severity: "medium" });
  } else {
    tips.push({ icon: <Leaf className="w-5 h-5" />, title: "Low Waste Generation", description: "You're doing well at minimizing waste! Continue your sustainable practices.", severity: "low" });
  }

  return tips;
}

const severityColors = {
  high: "border-destructive/30 bg-destructive/5",
  medium: "border-yellow-500/30 bg-yellow-500/5",
  low: "border-primary/30 bg-primary/5",
};

const severityBadge = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  low: "bg-primary/10 text-primary",
};

export default function CalculationResults({ breakdown }: Props) {
  const pieData = [
    { name: "Electricity", value: breakdown.electricity },
    { name: "Transport", value: breakdown.transport },
    { name: "Food", value: breakdown.food },
    { name: "Waste", value: breakdown.waste },
  ];

  const radarData = [
    { category: "Electricity", value: Math.min(breakdown.electricity, 150), max: 150 },
    { category: "Transport", value: Math.min(breakdown.transport, 150), max: 150 },
    { category: "Food", value: Math.min(breakdown.food, 300), max: 300 },
    { category: "Waste", value: Math.min(breakdown.waste, 50), max: 50 },
  ];

  const trees = treesEquivalent(breakdown.total);
  const eco = getEcoScore(breakdown.total);
  const precautions = getPrecautions(breakdown);
  const highCount = precautions.filter((p) => p.severity === "high").length;

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8 mt-10">
      {/* Summary Banner */}
      <div className="glass-card p-6 text-center">
        <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
          Your Carbon Footprint: <span className={eco.color}>{breakdown.total} kg CO₂/month</span>
        </h2>
        <p className="text-muted-foreground mb-4">
          Eco Score: <span className="font-semibold">{eco.score}/100</span> — {eco.label}
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <TreePine className="w-4 h-4 text-primary" />
          <span>You'd need <strong className="text-foreground">{trees} trees</strong> to offset your monthly emissions</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg mb-4">Emission Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg mb-4">Impact Radar</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <PolarRadiusAxis tick={{ fontSize: 10 }} />
              <Radar name="Your Impact" dataKey="value" stroke="#2A9D5C" fill="#2A9D5C" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6 lg:col-span-2">
          <h3 className="font-display font-semibold text-lg mb-4">Category Comparison (kg CO₂/month)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={pieData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Safety Measures & Precautions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg">Safety Measures & Precautions</h3>
            <p className="text-sm text-muted-foreground">
              {highCount > 0
                ? `${highCount} area${highCount > 1 ? "s" : ""} need${highCount === 1 ? "s" : ""} immediate attention`
                : "Your habits are mostly eco-friendly!"}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {precautions.map((tip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className={`rounded-xl border p-5 ${severityColors[tip.severity]}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${severityBadge[tip.severity]}`}>
                  {tip.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{tip.title}</h4>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${severityBadge[tip.severity]}`}>
                      {tip.severity}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tip.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link to="/dashboard">
            View Full Dashboard <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/tips">Explore More Tips</Link>
        </Button>
      </div>
    </motion.div>
  );
}
