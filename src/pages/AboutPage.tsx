import { motion } from "framer-motion";
import { Leaf, Target, Users, Globe } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">About GreenTrack</h1>
          <p className="text-muted-foreground text-lg">Empowering individuals to understand and reduce their environmental impact</p>
        </div>

        <div className="space-y-6">
          {[
            { icon: Target, title: "Our Mission", text: "GreenTrack helps you measure your carbon footprint from everyday activities — electricity, travel, food, and waste — so you can make informed decisions toward a more sustainable lifestyle." },
            { icon: Globe, title: "Why It Matters", text: "The average person generates around 4-8 tonnes of CO₂ per year. By understanding where your emissions come from, you can identify the most impactful areas to improve and track your progress over time." },
            { icon: Users, title: "How It Works", text: "Simply enter your monthly habits into our calculator, and we'll estimate your carbon footprint using established emission factors. View your breakdown on the dashboard, track your history, earn eco badges, and get personalized tips to go greener." },
          ].map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 flex gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg mb-1">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.text}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="glass-card p-8 mt-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 eco-gradient-bg opacity-5" />
          <p className="text-lg font-display relative z-10">
            "The greatest threat to our planet is the belief that someone else will save it." — Robert Swan 🌍
          </p>
        </div>
      </motion.div>
    </div>
  );
}
