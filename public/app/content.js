export const ROLE_COPY = {
  captain: {
    eyebrow: "Radio + Navigation",
    title: "Captain Seat",
    description: "Reads clues, restores phrases, and keeps the shared route understandable.",
  },
  engineer: {
    eyebrow: "Maintenance + Repair",
    title: "Engineer Seat",
    description: "Sorts systems, balances repairs, and executes the Captain's callouts.",
  },
};

export const WORD_GRIDS = {
  RADIO: ["R A D I O".split(" "), "W T S E A".split(" "), "P M A P L".split(" "), "C O D E K".split(" "), "B U O Y S".split(" ")],
  ANCHOR: ["A N C H O R".split(" "), "T I D E S X".split(" "), "M A S T S Y".split(" "), "B U O Y S Z".split(" "), "C O V E S Q".split(" "), "R O P E S P".split(" ")],
};

export const LIQUID_START = [["sun", "sea", "rose", "sun"], ["sea", "rose", "mint", "mint"], ["rose", "sun", "sea", "mint"], []];
export const MATCHING_ICONS = ["⚓", "🧭", "🔧", "💡"];
export const MANUAL_SECTIONS = ["Launch Rituals", "Treasure Protocol", "Pirate Calm", "Storm Recovery", "Signal Etiquette", "Voyage Lore"];
export const SIGNAL_SET = ["wave", "flag", "bell", "star", "sun", "anchor"];
export const SIGNAL_ICONS = { wave: "〰️", flag: "🚩", bell: "🔔", star: "⭐", sun: "☀️", anchor: "⚓" };
export const PULSE_COLORS = { amber: "🟡", blue: "🔵", green: "🟢", rose: "🩷" };
export const CARGO_ITEMS = [
  { id: "apple", label: "Apple Crate", group: "fruit", icon: "🍎" },
  { id: "berry", label: "Berry Basket", group: "fruit", icon: "🫐" },
  { id: "pear", label: "Pear Box", group: "fruit", icon: "🍐" },
  { id: "hammer", label: "Hammer Kit", group: "tools", icon: "🔨" },
  { id: "wrench", label: "Wrench Tin", group: "tools", icon: "🔧" },
  { id: "bolt", label: "Bolt Jar", group: "tools", icon: "🪛" },
  { id: "coin", label: "Coin Chest", group: "treasure", icon: "🪙" },
  { id: "gem", label: "Gem Crate", group: "treasure", icon: "💎" },
  { id: "pearl", label: "Pearl Bowl", group: "treasure", icon: "🦪" },
];
