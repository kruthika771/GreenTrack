// Carbon emission factors
const FACTORS = {
  electricity: 0.5, // kg CO₂ per kWh
  car: 0.21, // kg CO₂ per km
  publicTransport: 0.089, // kg CO₂ per km
  bike: 0, // kg CO₂ per km
  nonVegMeal: 3.3, // kg CO₂ per meal
  vegMeal: 1.7, // kg CO₂ per meal
  waste: 0.5, // kg CO₂ per kg waste
};

export interface CarbonInputs {
  electricity: number; // kWh/month
  transportMode: "car" | "public" | "bike" | "mixed";
  transportDistance: number; // km/week
  foodType: "veg" | "non-veg" | "mixed";
  mealsPerDay: number;
  waste: number; // kg/week
}

export interface CarbonBreakdown {
  electricity: number;
  transport: number;
  food: number;
  waste: number;
  total: number;
}

export function calculateCarbon(inputs: CarbonInputs): CarbonBreakdown {
  const electricity = inputs.electricity * FACTORS.electricity;

  const weeklyTransport = (() => {
    switch (inputs.transportMode) {
      case "car": return inputs.transportDistance * FACTORS.car;
      case "public": return inputs.transportDistance * FACTORS.publicTransport;
      case "bike": return 0;
      case "mixed": return inputs.transportDistance * ((FACTORS.car + FACTORS.publicTransport) / 2);
    }
  })();
  const transport = weeklyTransport * 4.33;

  const mealFactor = (() => {
    switch (inputs.foodType) {
      case "veg": return FACTORS.vegMeal;
      case "non-veg": return FACTORS.nonVegMeal;
      case "mixed": return (FACTORS.vegMeal + FACTORS.nonVegMeal) / 2;
    }
  })();
  const food = inputs.mealsPerDay * mealFactor * 30;

  const waste = inputs.waste * FACTORS.waste * 4.33;

  return {
    electricity: Math.round(electricity * 10) / 10,
    transport: Math.round(transport * 10) / 10,
    food: Math.round(food * 10) / 10,
    waste: Math.round(waste * 10) / 10,
    total: Math.round((electricity + transport + food + waste) * 10) / 10,
  };
}

export function treesEquivalent(kgCO2: number): number {
  // One tree absorbs ~22 kg CO₂/year → ~1.83 kg/month
  return Math.round(kgCO2 / 1.83);
}

export function getEcoScore(kgCO2: number): { score: number; label: string; color: string } {
  if (kgCO2 < 150) return { score: 95, label: "Eco Champion 🏆", color: "text-primary" };
  if (kgCO2 < 300) return { score: 80, label: "Green Warrior 💚", color: "text-eco-leaf" };
  if (kgCO2 < 500) return { score: 60, label: "Eco Learner 🌱", color: "text-eco-lime" };
  if (kgCO2 < 800) return { score: 40, label: "Getting Started 🌿", color: "text-eco-earth" };
  return { score: 20, label: "Room to Grow 🌍", color: "text-destructive" };
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
}

export function getBadges(history: CarbonBreakdown[]): Badge[] {
  const latest = history[history.length - 1];
  const badges: Badge[] = [
    { id: "first", name: "First Step", icon: "👣", description: "Calculate your first footprint", unlocked: history.length >= 1 },
    { id: "tracker", name: "Consistent Tracker", icon: "📊", description: "Track 3+ times", unlocked: history.length >= 3 },
    { id: "low-carbon", name: "Low Carbon", icon: "🌿", description: "Under 300 kg CO₂/month", unlocked: latest ? latest.total < 300 : false },
    { id: "eco-hero", name: "Eco Hero", icon: "🦸", description: "Under 150 kg CO₂/month", unlocked: latest ? latest.total < 150 : false },
    { id: "improver", name: "Improving", icon: "📈", description: "Reduce footprint from previous", unlocked: history.length >= 2 && history[history.length - 1].total < history[history.length - 2].total },
    { id: "green-diet", name: "Green Diet", icon: "🥗", description: "Food emissions under 100 kg", unlocked: latest ? latest.food < 100 : false },
  ];
  return badges;
}

export interface HistoryEntry {
  date: string;
  breakdown: CarbonBreakdown;
  inputs: CarbonInputs;
}

const STORAGE_KEY = "greentrack_history";

export function saveToHistory(entry: HistoryEntry): void {
  const history = getHistory();
  history.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function getHistory(): HistoryEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}
