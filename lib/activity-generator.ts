/**
 * Algorithmic Activity Engine for TaskPlay Nigeria
 * Generates thousands of unique, anonymous, and realistic earning signals.
 */

const commonNames = [
  "emmanuel", "amaka", "chinedu", "tunde", "olumide", "funke", "blessing", "musa", "obinna", "zainab",
  "ibrahim", "chioma", "ade", "bolaji", "uche", "favour", "patience", "gift", "sunday", "peter",
  "ngozi", "okoro", "abiodun", "fatai", "aminu", "amina", "nnamdi", "ifeanyi", "promise", "joy",
  "precious", "goodness", "mercy", "victoria", "daniel", "david", "faith", "hope", "peace", "grace",
  "chima", "chidi", "kechi", "uchechi", "tobechukwu", "oluchi", "somto", "kamsi", "kaosy", "nonso",
  "ezinne", "ikemefuna", "obiora", "akanbi", "ayinde", "ajani", "adebowale", "ademola", "adesina",
  "folarin", "olowu", "osun", "ogun", "yinka", "tokunbo", "bidemi", "eniola", "nike", "remi",
  "shola", "wale", "kole", "seun", "kunle", "dare", "femi", "segun", "bukola", "yemi", "jide",
  "kola", "biodun", "dele", "bayo", "ayo", "dayo", "bolu", "bola", "bimbo", "tayo", "fola"
];

const actions = [
  { type: "withdrawal", label: "withdrew", min: 2000, max: 25000, suffix: "to GTBank", weight: 3 },
  { type: "withdrawal", label: "withdrew", min: 1500, max: 15000, suffix: "to Kuda", weight: 2 },
  { type: "withdrawal", label: "withdrew", min: 5000, max: 50000, suffix: "to Zenith", weight: 1 },
  { type: "task", label: "earned", min: 50, max: 1500, suffix: "from Social Task", weight: 10 },
  { type: "task", label: "earned", min: 1500, max: 5000, suffix: "from CPA Loop", weight: 5 },
  { type: "upgrade", label: "verified", min: 0, max: 0, suffix: "License VIP", weight: 4 },
  { type: "upgrade", label: "activated", min: 0, max: 0, suffix: "Earning Node", weight: 2 }
];

function maskName(name: string) {
  if (name.length <= 4) return `${name.slice(0, 2)}***`;
  return `${name.slice(0, 2)}***${name.slice(-1)}`;
}

export function generateRandomActivity(idOverride?: number) {
  // Weighted random action selection
  const totalWeight = actions.reduce((acc, curr) => acc + curr.weight, 0);
  let randomWeight = Math.random() * totalWeight;
  let action = actions[0];

  for (let a of actions) {
    if (randomWeight < a.weight) {
      action = a;
      break;
    }
    randomWeight -= a.weight;
  }

  const name = commonNames[Math.floor(Math.random() * commonNames.length)];
  const amountVal = action.min === 0 ? 0 : Math.floor(action.min + Math.random() * (action.max - action.min));
  const amountStr = action.type === 'upgrade' ? 'VIP' : `₦${amountVal.toLocaleString()}`;
  
  // Random time between 1m and 45m
  const time = `${Math.floor(1 + Math.random() * 44)}m ago`;

  return {
    id: idOverride || Math.floor(Math.random() * 1000000),
    user: maskName(name),
    action: action.label,
    amount: amountStr,
    time: time,
    suffix: action.suffix,
    type: action.type
  };
}

export function generateBatchActivity(size: number) {
    return Array.from({ length: size }, (_, i) => generateRandomActivity(i));
}
