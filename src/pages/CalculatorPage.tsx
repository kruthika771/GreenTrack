import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Calculator, Zap, Car, UtensilsCrossed, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { calculateCarbon, saveToHistory, type CarbonInputs, type CarbonBreakdown } from "@/lib/carbon";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CalculationResults from "@/components/CalculationResults";

export default function CalculatorPage() {
  const { user } = useAuth();
  const [result, setResult] = useState<CarbonBreakdown | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [inputs, setInputs] = useState<CarbonInputs>({
    electricity: 200,
    transportMode: "car",
    transportDistance: 100,
    foodType: "mixed",
    mealsPerDay: 3,
    waste: 5,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const breakdown = calculateCarbon(inputs);

    if (user) {
      // Save to cloud
      const { error } = await supabase.from("carbon_history").insert({
        user_id: user.id,
        electricity: breakdown.electricity,
        transport: breakdown.transport,
        food: breakdown.food,
        waste: breakdown.waste,
        total: breakdown.total,
        inputs: inputs as any,
      });
    if (error) {
        toast.error("Failed to save: " + error.message);
        return;
      }
    } else {
      // Fallback to localStorage for guests
      saveToHistory({
        date: new Date().toISOString(),
        breakdown,
        inputs,
      });
    }

    toast.success(`Your carbon footprint: ${breakdown.total} kg CO₂/month`);
    setResult(breakdown);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Calculator className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Carbon Calculator</h1>
          <p className="text-muted-foreground">Enter your monthly habits to estimate your carbon footprint</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Electricity */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-eco-sky/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-eco-sky" />
              </div>
              <div>
                <h3 className="font-display font-semibold">Electricity Usage</h3>
                <p className="text-sm text-muted-foreground">kWh per month</p>
              </div>
            </div>
            <div className="space-y-3">
              <Slider
                value={[inputs.electricity]}
                onValueChange={([v]) => setInputs({ ...inputs, electricity: v })}
                max={1000}
                step={10}
                className="py-2"
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">0 kWh</span>
                <Input
                  type="number"
                  value={inputs.electricity}
                  onChange={(e) => setInputs({ ...inputs, electricity: Number(e.target.value) })}
                  className="w-24 text-center"
                />
                <span className="text-sm text-muted-foreground">1000 kWh</span>
              </div>
            </div>
          </div>

          {/* Transport */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Car className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold">Transportation</h3>
                <p className="text-sm text-muted-foreground">Weekly travel habits</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-sm mb-1.5 block">Mode of transport</Label>
                <Select value={inputs.transportMode} onValueChange={(v) => setInputs({ ...inputs, transportMode: v as CarbonInputs["transportMode"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="car">Car 🚗</SelectItem>
                    <SelectItem value="public">Public Transport 🚌</SelectItem>
                    <SelectItem value="bike">Bicycle 🚲</SelectItem>
                    <SelectItem value="mixed">Mixed 🔄</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">Distance per week (km)</Label>
                <Input
                  type="number"
                  value={inputs.transportDistance}
                  onChange={(e) => setInputs({ ...inputs, transportDistance: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {/* Food */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-eco-lime/10 flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-eco-lime" />
              </div>
              <div>
                <h3 className="font-display font-semibold">Food Habits</h3>
                <p className="text-sm text-muted-foreground">Diet and meal frequency</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-sm mb-1.5 block">Diet type</Label>
                <Select value={inputs.foodType} onValueChange={(v) => setInputs({ ...inputs, foodType: v as CarbonInputs["foodType"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="veg">Vegetarian 🥗</SelectItem>
                    <SelectItem value="non-veg">Non-Vegetarian 🥩</SelectItem>
                    <SelectItem value="mixed">Mixed 🍽️</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">Meals per day</Label>
                <Input
                  type="number"
                  value={inputs.mealsPerDay}
                  onChange={(e) => setInputs({ ...inputs, mealsPerDay: Number(e.target.value) })}
                  min={1}
                  max={6}
                />
              </div>
            </div>
          </div>

          {/* Waste */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-eco-earth/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-eco-earth" />
              </div>
              <div>
                <h3 className="font-display font-semibold">Waste Generation</h3>
                <p className="text-sm text-muted-foreground">kg per week</p>
              </div>
            </div>
            <Slider
              value={[inputs.waste]}
              onValueChange={([v]) => setInputs({ ...inputs, waste: v })}
              max={30}
              step={0.5}
              className="py-2"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-muted-foreground">0 kg</span>
              <span className="text-sm font-medium">{inputs.waste} kg/week</span>
              <span className="text-sm text-muted-foreground">30 kg</span>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full text-lg bg-primary hover:bg-primary/90 text-primary-foreground">
            Calculate My Footprint 🌱
          </Button>
        </form>

        {result && (
          <div ref={resultsRef}>
            <CalculationResults breakdown={result} />
          </div>
        )}
      </motion.div>
    </div>
  );
}
