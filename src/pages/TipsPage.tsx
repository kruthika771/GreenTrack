import { motion } from "framer-motion";
import { Zap, Car, UtensilsCrossed, Trash2, Droplets, TreePine } from "lucide-react";

const tips = [
  {
    icon: Zap,
    category: "Electricity",
    color: "text-eco-sky",
    bg: "bg-eco-sky/10",
    items: [
      "Switch to LED bulbs — they use 75% less energy",
      "Unplug devices when not in use to eliminate phantom power",
      "Use a programmable thermostat to reduce heating/cooling waste",
      "Switch to renewable energy providers if available",
    ],
  },
  {
    icon: Car,
    category: "Transportation",
    color: "text-primary",
    bg: "bg-primary/10",
    items: [
      "Use public transport, cycling, or walking when possible",
      "Carpool to reduce per-person emissions",
      "Consider an electric or hybrid vehicle",
      "Combine errands to reduce total trips",
    ],
  },
  {
    icon: UtensilsCrossed,
    category: "Food & Diet",
    color: "text-eco-lime",
    bg: "bg-eco-lime/10",
    items: [
      "Shift toward a plant-based diet — even one meatless day helps",
      "Buy local and seasonal produce to cut transport emissions",
      "Reduce food waste by planning meals in advance",
      "Compost organic waste instead of sending it to landfill",
    ],
  },
  {
    icon: Trash2,
    category: "Waste Reduction",
    color: "text-eco-earth",
    bg: "bg-eco-earth/10",
    items: [
      "Recycle paper, plastic, glass, and metals properly",
      "Use reusable bags, bottles, and containers",
      "Avoid single-use plastics whenever possible",
      "Donate or repurpose items instead of throwing them away",
    ],
  },
  {
    icon: Droplets,
    category: "Water",
    color: "text-eco-sky",
    bg: "bg-eco-sky/10",
    items: [
      "Take shorter showers to save water and heating energy",
      "Fix leaky faucets promptly",
      "Use a water-efficient washing machine",
      "Collect rainwater for garden irrigation",
    ],
  },
  {
    icon: TreePine,
    category: "Lifestyle",
    color: "text-primary",
    bg: "bg-primary/10",
    items: [
      "Plant trees or support reforestation programs",
      "Support businesses with strong environmental policies",
      "Offset your remaining emissions through verified programs",
      "Educate friends and family about sustainability",
    ],
  },
];

export default function TipsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Eco-Friendly Tips 🌿</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">Actionable suggestions to reduce your carbon footprint and live more sustainably</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tips.map((section, i) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl ${section.bg} flex items-center justify-center`}>
                  <section.icon className={`w-5 h-5 ${section.color}`} />
                </div>
                <h3 className="font-display font-semibold text-lg">{section.category}</h3>
              </div>
              <ul className="space-y-3">
                {section.items.map((tip, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-0.5">✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
