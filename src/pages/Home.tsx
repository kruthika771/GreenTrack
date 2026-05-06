import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Lightbulb, TreePine, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  { icon: Calculator, title: "Calculate", desc: "Input your daily habits and get instant CO₂ estimates" },
  { icon: BarChart3, title: "Visualize", desc: "Beautiful charts showing your emission breakdown" },
  { icon: Lightbulb, title: "Improve", desc: "Personalized tips to reduce your carbon footprint" },
  { icon: TreePine, title: "Track", desc: "Monitor progress over time and earn eco badges" },
];

export default function Home() {
  return (
    <div>
      {/* Hero with environment background */}
      <section className="relative overflow-hidden min-h-[80vh] flex items-center">
        {/* Background image */}
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          {/* Medium highlight overlay */}
          <div className="absolute inset-0 bg-background/60 dark:bg-background/75" />
          <div className="absolute inset-0 eco-gradient-bg opacity-15" />
        </div>

        {/* Floating glow effects */}
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-primary/15 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-eco-lime/10 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

        <div className="container mx-auto px-4 py-24 md:py-36 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/80 backdrop-blur-sm text-secondary-foreground text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Carbon Footprint Tracker
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6">
              Track Your Carbon Footprint.{" "}
              <span className="eco-gradient-text">Save the Planet</span> 🌍
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Calculate your CO₂ emissions from daily activities, visualize your impact, and discover ways to live greener.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                <Link to="/calculator">
                  Start Calculating <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 backdrop-blur-sm bg-card/50">
                <Link to="/dashboard">View Dashboard</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-20">
        <div className="glass-card p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 eco-gradient-bg opacity-5" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Ready to make a difference?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Every action counts. Start tracking your carbon footprint today and join the movement for a greener tomorrow.
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link to="/calculator">Get Started Free <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
