// src/utils/categoryHelpers.ts
import { Category } from '../services/api';

// ============================
// TYPES
// ============================

export interface DailyPreviewItem {
  day: string;
  emoji: string;
  name: string;
}

export interface WeeklyPreviewItem {
  week: number;
  emoji: string;
  name: string;
}

// ============================
// DAILY CATEGORY ITEMS
// ============================

export const DAILY_CATEGORY_ITEMS: Record<Category, Array<{ emoji: string; name: string }>> = {
  aircraft: [
    { emoji: '✈️', name: 'Aircraft' },
    { emoji: '🛩️', name: 'Small Plane' },
    { emoji: '🛫', name: 'Departure' },
    { emoji: '🛬', name: 'Arrival' },
    { emoji: '🚁', name: 'Helicopter' },
    { emoji: '🛰️', name: 'Satellite' },
    { emoji: '🚀', name: 'Rocket' }
  ],
  animals: [
    { emoji: '🦁', name: 'Lion' },
    { emoji: '🐘', name: 'Elephant' },
    { emoji: '🦒', name: 'Giraffe' },
    { emoji: '🦓', name: 'Zebra' },
    { emoji: '🐅', name: 'Tiger' },
    { emoji: '🦍', name: 'Gorilla' },
    { emoji: '🐊', name: 'Crocodile' }
  ],
  arabic: [
    { emoji: '🕌', name: 'Mosque' },
    { emoji: '📿', name: 'Prayer Beads' },
    { emoji: '☪️', name: 'Star and Crescent' },
    { emoji: '🫖', name: 'Teapot' },
    { emoji: "🔮", name: 'Lamp' },
    { emoji: '🏺', name: 'Jug' },
    { emoji: '🗡️', name: 'Dagger' }
  ],
  birds: [
    { emoji: '🦜', name: 'Parrot' },
    { emoji: '🦚', name: 'Peacock' },
    { emoji: '🦢', name: 'Swan' },
    { emoji: '🦩', name: 'Flamingo' },
    { emoji: '🐧', name: 'Penguin' },
    { emoji: '🕊️', name: 'Dove' },
    { emoji: '🦅', name: 'Eagle' }
  ],
  bugs: [
    { emoji: '🐞', name: 'Ladybug' },
    { emoji: '🦋', name: 'Butterfly' },
    { emoji: '🐝', name: 'Bee' },
    { emoji: '🐜', name: 'Ant' },
    { emoji: '🕷️', name: 'Spider' },
    { emoji: '🦟', name: 'Mosquito' },
    { emoji: '🦗', name: 'Cricket' }
  ],
  cars: [
    { emoji: '🚗', name: 'Car' },
    { emoji: '🚕', name: 'Taxi' },
    { emoji: '🚙', name: 'SUV' },
    { emoji: '🚌', name: 'Bus' },
    { emoji: '🏎️', name: 'Race Car' },
    { emoji: '🚓', name: 'Police Car' },
    { emoji: '🚑', name: 'Ambulance' }
  ],
  clothing: [
    { emoji: '👕', name: 'T-Shirt' },
    { emoji: '👖', name: 'Jeans' },
    { emoji: '🧥', name: 'Coat' },
    { emoji: '🧦', name: 'Socks' },
    { emoji: '👟', name: 'Shoes' },
    { emoji: '🧢', name: 'Cap' },
    { emoji: '🧣', name: 'Scarf' }
  ],
  colors: [
    { emoji: '🔴', name: 'Red' },
    { emoji: '🟠', name: 'Orange' },
    { emoji: '🟡', name: 'Yellow' },
    { emoji: '🟢', name: 'Green' },
    { emoji: '🔵', name: 'Blue' },
    { emoji: '🟣', name: 'Purple' },
    { emoji: '⚫', name: 'Black' }
  ],
  cyrillic: [
    { emoji: '🇷🇺', name: 'Russian' },
    { emoji: '📜', name: 'Scroll' },
    { emoji: '✍️', name: 'Writing' },
    { emoji: '📚', name: 'Books' },
    { emoji: '🏛️', name: 'Temple' },
    { emoji: '🕌', name: 'Mosque' },
    { emoji: '⛪', name: 'Church' }
  ],
  devanagari: [
    { emoji: '🕉️', name: 'Om' },
    { emoji: '🪷', name: 'Lotus' },
    { emoji: '🛕', name: 'Temple' },
    { emoji: '📿', name: 'Prayer Beads' },
    { emoji: '🪔', name: 'Diya' },
    { emoji: '🎪', name: 'Festival' },
    { emoji: '🥻', name: 'Sari' }
  ],
  emotions: [
    { emoji: '😊', name: 'Happy' },
    { emoji: '😢', name: 'Sad' },
    { emoji: '😡', name: 'Angry' },
    { emoji: '😱', name: 'Shocked' },
    { emoji: '🥰', name: 'Loving' },
    { emoji: '😴', name: 'Sleepy' },
    { emoji: '🥳', name: 'Celebrating' }
  ],
  fantasy: [
    { emoji: '🧙', name: 'Wizard' },
    { emoji: '🧝', name: 'Elf' },
    { emoji: '🧌', name: 'Troll' },
    { emoji: '🐉', name: 'Dragon' },
    { emoji: '🦄', name: 'Unicorn' },
    { emoji: '🧚', name: 'Fairy' },
    { emoji: '🧛', name: 'Vampire' }
  ],
  fish: [
    { emoji: '🐠', name: 'Tropical Fish' },
    { emoji: '🐟', name: 'Fish' },
    { emoji: '🐡', name: 'Blowfish' },
    { emoji: '🦈', name: 'Shark' },
    { emoji: '🐋', name: 'Whale' },
    { emoji: '🐬', name: 'Dolphin' },
    { emoji: '🐙', name: 'Octopus' }
  ],
  flags: [
    { emoji: '🏁', name: 'Checkered' },
    { emoji: '🚩', name: 'Triangular' },
    { emoji: '🎌', name: 'Crossed' },
    { emoji: '🏳️', name: 'White' },
    { emoji: '🏴', name: 'Black' },
    { emoji: '🏳️‍🌈', name: 'Rainbow' },
    { emoji: '🏴‍☠️', name: 'Pirate' }
  ],
  flowers: [
    { emoji: '🌸', name: 'Cherry' },
    { emoji: '🌺', name: 'Hibiscus' },
    { emoji: '🌻', name: 'Sunflower' },
    { emoji: '🌹', name: 'Rose' },
    { emoji: '🌷', name: 'Tulip' },
    { emoji: '🌼', name: 'Daisy' },
    { emoji: '🪷', name: 'Lotus' }
  ],
  food: [
    { emoji: '🍕', name: 'Pizza' },
    { emoji: '🍔', name: 'Burger' },
    { emoji: '🌮', name: 'Taco' },
    { emoji: '🍣', name: 'Sushi' },
    { emoji: '🍝', name: 'Pasta' },
    { emoji: '🥗', name: 'Salad' },
    { emoji: '🍜', name: 'Ramen' }
  ],
  fruits: [
    { emoji: '🍎', name: 'Apple' },
    { emoji: '🍌', name: 'Banana' },
    { emoji: '🍊', name: 'Orange' },
    { emoji: '🍇', name: 'Grapes' },
    { emoji: '🍓', name: 'Strawberry' },
    { emoji: '🥝', name: 'Kiwi' },
    { emoji: '🍍', name: 'Pineapple' }
  ],
  games: [
    { emoji: '🎮', name: 'Controller' },
    { emoji: '🎲', name: 'Dice' },
    { emoji: '🃏', name: 'Cards' },
    { emoji: '♟️', name: 'Chess' },
    { emoji: '🎯', name: 'Darts' },
    { emoji: '🎰', name: 'Slot' },
    { emoji: '🧩', name: 'Puzzle' }
  ],
  geography: [
    { emoji: '🌍', name: 'Earth' },
    { emoji: '🗺️', name: 'Map' },
    { emoji: '🏔️', name: 'Mountain' },
    { emoji: '🏝️', name: 'Island' },
    { emoji: '🌋', name: 'Volcano' },
    { emoji: '🏜️', name: 'Desert' },
    { emoji: '🌲', name: 'Forest' }
  ],
  greek: [
    { emoji: '🏛️', name: 'Temple' },
    { emoji: '⚱️', name: 'Urn' },
    { emoji: '🏺', name: 'Amphora' },
    { emoji: '🪶', name: 'Feather' },
    { emoji: '📜', name: 'Scroll' },
    { emoji: '🏅', name: 'Medal' },
    { emoji: '⚖️', name: 'Scale' }
  ],
  hebrew: [
    { emoji: '✡️', name: 'Star' },
    { emoji: '🕎', name: 'Menorah' },
    { emoji: '📜', name: 'Scroll' },
    { emoji: '🕍', name: 'Synagogue' },
    { emoji: '🍷', name: 'Wine' },
    { emoji: '🥖', name: 'Bread' },
    { emoji: '🕯️', name: 'Candle' }
  ],
  holidays: [
    { emoji: '🎉', name: 'Party' },
    { emoji: '🎄', name: 'Christmas' },
    { emoji: '🎃', name: 'Halloween' },
    { emoji: '🕎', name: 'Hanukkah' },
    { emoji: '🪔', name: 'Diwali' },
    { emoji: '🐰', name: 'Easter' },
    { emoji: '🎊', name: 'Confetti' }
  ],
  latin: [
    { emoji: '🏛️', name: 'Rome' },
    { emoji: '⚔️', name: 'Sword' },
    { emoji: '🛡️', name: 'Shield' },
    { emoji: '🏺', name: 'Vase' },
    { emoji: '📜', name: 'Scroll' },
    { emoji: '🗿', name: 'Statue' },
    { emoji: '👑', name: 'Crown' }
  ],
  math: [
    { emoji: '🔢', name: 'Numbers' },
    { emoji: '➕', name: 'Plus' },
    { emoji: '➖', name: 'Minus' },
    { emoji: '✖️', name: 'Multiply' },
    { emoji: '➗', name: 'Divide' },
    { emoji: '≈', name: 'Approx' },
    { emoji: '∞', name: 'Infinity' }
  ],
  music: [
    { emoji: '🎵', name: 'Music' },
    { emoji: '🎸', name: 'Guitar' },
    { emoji: '🎹', name: 'Piano' },
    { emoji: '🥁', name: 'Drum' },
    { emoji: '🎻', name: 'Violin' },
    { emoji: '🎷', name: 'Sax' },
    { emoji: '🎺', name: 'Trumpet' }
  ],
  numbers: [
    { emoji: '0️⃣', name: 'Zero' },
    { emoji: '1️⃣', name: 'One' },
    { emoji: '2️⃣', name: 'Two' },
    { emoji: '3️⃣', name: 'Three' },
    { emoji: '4️⃣', name: 'Four' },
    { emoji: '5️⃣', name: 'Five' },
    { emoji: '6️⃣', name: 'Six' }
  ],
  office: [
    { emoji: '💼', name: 'Briefcase' },
    { emoji: '📎', name: 'Paperclip' },
    { emoji: '📌', name: 'Pin' },
    { emoji: '✂️', name: 'Scissors' },
    { emoji: '📏', name: 'Ruler' },
    { emoji: '🖊️', name: 'Pen' },
    { emoji: '📄', name: 'Paper' }
  ],
  planets: [
    { emoji: '🪐', name: 'Saturn' },
    { emoji: '☀️', name: 'Sun' },
    { emoji: '🌙', name: 'Moon' },
    { emoji: '🌍', name: 'Earth' },
    { emoji: '🔥', name: 'Mars' },
    { emoji: '⭐', name: 'Star' },
    { emoji: '🌕', name: 'Full Moon' }
  ],
  plants: [
    { emoji: '🌿', name: 'Herb' },
    { emoji: '🌱', name: 'Seedling' },
    { emoji: '🌴', name: 'Palm' },
    { emoji: '🎋', name: 'Bamboo' },
    { emoji: '🍀', name: 'Clover' },
    { emoji: '🌵', name: 'Cactus' },
    { emoji: '🌲', name: 'Tree' }
  ],
  roadSigns: [
    { emoji: '⚠️', name: 'Warning' },
    { emoji: '🚧', name: 'Construction' },
    { emoji: '🚸', name: 'Children' },
    { emoji: '🚫', name: 'No Entry' },
    { emoji: '🅿️', name: 'Parking' },
    { emoji: '🚦', name: 'Traffic Light' },
    { emoji: '🛑', name: 'Stop' }
  ],
  science: [
    { emoji: '🔬', name: 'Microscope' },
    { emoji: '🧪', name: 'Test Tube' },
    { emoji: '🧫', name: 'Petri Dish' },
    { emoji: '🧬', name: 'DNA' },
    { emoji: '⚗️', name: 'Alchemy' },
    { emoji: '🔭', name: 'Telescope' },
    { emoji: '🧲', name: 'Magnet' }
  ],
  shapes: [
    { emoji: '⬛', name: 'Square' },
    { emoji: '🔴', name: 'Circle' },
    { emoji: '🔺', name: 'Triangle' },
    { emoji: '⬜', name: 'White Square' },
    { emoji: '🔵', name: 'Blue Circle' },
    { emoji: '🔶', name: 'Orange Diamond' },
    { emoji: '🔷', name: 'Blue Diamond' }
  ],
  sports: [
    { emoji: '⚽', name: 'Soccer' },
    { emoji: '🏀', name: 'Basketball' },
    { emoji: '🏈', name: 'Football' },
    { emoji: '⚾', name: 'Baseball' },
    { emoji: '🎾', name: 'Tennis' },
    { emoji: '🏐', name: 'Volleyball' },
    { emoji: '🏓', name: 'Table Tennis' }
  ],
  tech: [
    { emoji: '💻', name: 'Laptop' },
    { emoji: '📱', name: 'Phone' },
    { emoji: '🖥️', name: 'Computer' },
    { emoji: '⌨️', name: 'Keyboard' },
    { emoji: '🖱️', name: 'Mouse' },
    { emoji: '📷', name: 'Camera' },
    { emoji: '🎧', name: 'Headphones' }
  ],
  time: [
    { emoji: '⏰', name: 'Alarm' },
    { emoji: '⌚', name: 'Watch' },
    { emoji: '⏱️', name: 'Stopwatch' },
    { emoji: '⏲️', name: 'Timer' },
    { emoji: '🕰️', name: 'Clock' },
    { emoji: '⌛', name: 'Hourglass' },
    { emoji: '📅', name: 'Calendar' }
  ],
  tools: [
    { emoji: '🔧', name: 'Wrench' },
    { emoji: '🔨', name: 'Hammer' },
    { emoji: '🪛', name: 'Screwdriver' },
    { emoji: '🔩', name: 'Nut' },
    { emoji: '⚒️', name: 'Pick' },
    { emoji: '🛠️', name: 'Tools' },
    { emoji: '🗜️', name: 'Clamp' }
  ],
  trains: [
    { emoji: '🚂', name: 'Train' },
    { emoji: '🚆', name: 'Railway' },
    { emoji: '🚇', name: 'Metro' },
    { emoji: '🚈', name: 'Light Rail' },
    { emoji: '🚝', name: 'Monorail' },
    { emoji: '🚞', name: 'Mountain Rail' },
    { emoji: '🚋', name: 'Tram' }
  ],
  transport: [
    { emoji: '🚌', name: 'Bus' },
    { emoji: '🚎', name: 'Trolley' },
    { emoji: '🚐', name: 'Van' },
    { emoji: '🚑', name: 'Ambulance' },
    { emoji: '🚒', name: 'Fire Truck' },
    { emoji: '🚓', name: 'Police Car' },
    { emoji: '🚕', name: 'Taxi' }
  ],
  vegetables: [
    { emoji: '🥕', name: 'Carrot' },
    { emoji: '🥦', name: 'Broccoli' },
    { emoji: '🥬', name: 'Lettuce' },
    { emoji: '🥒', name: 'Cucumber' },
    { emoji: '🌽', name: 'Corn' },
    { emoji: '🧅', name: 'Onion' },
    { emoji: '🍅', name: 'Tomato' }
  ],
  weather: [
    { emoji: '☀️', name: 'Sunny' },
    { emoji: '☁️', name: 'Cloudy' },
    { emoji: '🌧️', name: 'Rainy' },
    { emoji: '⛈️', name: 'Storm' },
    { emoji: '❄️', name: 'Snow' },
    { emoji: '🌪️', name: 'Tornado' },
    { emoji: '🌈', name: 'Rainbow' }
  ]
};

// ============================
// WEEKLY CATEGORY ITEMS
// ============================

export const WEEKLY_CATEGORY_ITEMS: Record<Category, Array<{ emoji: string; name: string }>> = {
  aircraft: [
    { emoji: '✈️', name: 'Aircraft' },
    { emoji: '🚁', name: 'Helicopter' },
    { emoji: '🛩️', name: 'Small Plane' },
    { emoji: '🛫', name: 'Departure' },
    { emoji: '🛬', name: 'Arrival' },
    { emoji: '💺', name: 'Seat' },
    { emoji: '🧳', name: 'Luggage' },
    { emoji: '🛰️', name: 'Satellite' },
    { emoji: '🚀', name: 'Rocket' },
    { emoji: '🪂', name: 'Parachute' }
  ],
  animals: [
    { emoji: '🦁', name: 'Lion' },
    { emoji: '🐘', name: 'Elephant' },
    { emoji: '🦒', name: 'Giraffe' },
    { emoji: '🦓', name: 'Zebra' },
    { emoji: '🐅', name: 'Tiger' },
    { emoji: '🦍', name: 'Gorilla' },
    { emoji: '🐊', name: 'Crocodile' },
    { emoji: '🦏', name: 'Rhino' },
    { emoji: '🐆', name: 'Leopard' },
    { emoji: '🦛', name: 'Hippo' }
  ],
  arabic: [
    { emoji: '🕌', name: 'Mosque' },
    { emoji: '📿', name: 'Prayer Beads' },
    { emoji: '☪️', name: 'Star' },
    { emoji: '🫖', name: 'Teapot' },
    { emoji: "🔮", name: 'Lamp' },
    { emoji: '🏺', name: 'Jug' },
    { emoji: '🗡️', name: 'Dagger' },
    { emoji: '🧕', name: 'Hijab' },
    { emoji: '👳', name: 'Turban' },
    { emoji: '🐪', name: 'Camel' }
  ],
  birds: [
    { emoji: '🦜', name: 'Parrot' },
    { emoji: '🦚', name: 'Peacock' },
    { emoji: '🦢', name: 'Swan' },
    { emoji: '🦩', name: 'Flamingo' },
    { emoji: '🐧', name: 'Penguin' },
    { emoji: '🕊️', name: 'Dove' },
    { emoji: '🦅', name: 'Eagle' },
    { emoji: '🦉', name: 'Owl' },
    { emoji: '🐦', name: 'Bird' },
    { emoji: '🐤', name: 'Chick' }
  ],
  bugs: [
    { emoji: '🐞', name: 'Ladybug' },
    { emoji: '🦋', name: 'Butterfly' },
    { emoji: '🐝', name: 'Bee' },
    { emoji: '🐜', name: 'Ant' },
    { emoji: '🕷️', name: 'Spider' },
    { emoji: '🦟', name: 'Mosquito' },
    { emoji: '🦗', name: 'Cricket' },
    { emoji: '🐌', name: 'Snail' },
    { emoji: '🪰', name: 'Fly' },
    { emoji: '🪲', name: 'Beetle' }
  ],
  cars: [
    { emoji: '🚗', name: 'Car' },
    { emoji: '🚕', name: 'Taxi' },
    { emoji: '🚙', name: 'SUV' },
    { emoji: '🚌', name: 'Bus' },
    { emoji: '🏎️', name: 'Race Car' },
    { emoji: '🚓', name: 'Police' },
    { emoji: '🚑', name: 'Ambulance' },
    { emoji: '🚒', name: 'Fire' },
    { emoji: '🚚', name: 'Truck' },
    { emoji: '🚛', name: 'Lorry' }
  ],
  clothing: [
    { emoji: '👕', name: 'T-Shirt' },
    { emoji: '👖', name: 'Jeans' },
    { emoji: '🧥', name: 'Coat' },
    { emoji: '🧦', name: 'Socks' },
    { emoji: '👟', name: 'Shoes' },
    { emoji: '🧢', name: 'Cap' },
    { emoji: '🧣', name: 'Scarf' },
    { emoji: '🧤', name: 'Gloves' },
    { emoji: '👗', name: 'Dress' },
    { emoji: '👔', name: 'Shirt' }
  ],
  colors: [
    { emoji: '🔴', name: 'Red' },
    { emoji: '🟠', name: 'Orange' },
    { emoji: '🟡', name: 'Yellow' },
    { emoji: '🟢', name: 'Green' },
    { emoji: '🔵', name: 'Blue' },
    { emoji: '🟣', name: 'Purple' },
    { emoji: '⚫', name: 'Black' },
    { emoji: '⚪', name: 'White' },
    { emoji: '🟤', name: 'Brown' },
    { emoji: '🟨', name: 'Yellow' }
  ],
  cyrillic: [
    { emoji: '🇷🇺', name: 'Russian' },
    { emoji: '📜', name: 'Scroll' },
    { emoji: '✍️', name: 'Writing' },
    { emoji: '📚', name: 'Books' },
    { emoji: '🏛️', name: 'Temple' },
    { emoji: '🕌', name: 'Mosque' },
    { emoji: '⛪', name: 'Church' },
    { emoji: '🎭', name: 'Theater' },
    { emoji: '🪆', name: 'Doll' },
    { emoji: '🧸', name: 'Bear' }
  ],
  devanagari: [
    { emoji: '🕉️', name: 'Om' },
    { emoji: '🪷', name: 'Lotus' },
    { emoji: '🛕', name: 'Temple' },
    { emoji: '📿', name: 'Beads' },
    { emoji: '🪔', name: 'Diya' },
    { emoji: '🎪', name: 'Festival' },
    { emoji: '🥻', name: 'Sari' },
    { emoji: '🫓', name: 'Bread' },
    { emoji: '🍛', name: 'Curry' },
    { emoji: '🐘', name: 'Elephant' }
  ],
  emotions: [
    { emoji: '😊', name: 'Happy' },
    { emoji: '😢', name: 'Sad' },
    { emoji: '😡', name: 'Angry' },
    { emoji: '😱', name: 'Shocked' },
    { emoji: '🥰', name: 'Loving' },
    { emoji: '😴', name: 'Sleepy' },
    { emoji: '🥳', name: 'Party' },
    { emoji: '😨', name: 'Scared' },
    { emoji: '🤔', name: 'Thinking' },
    { emoji: '😎', name: 'Cool' }
  ],
  fantasy: [
    { emoji: '🧙', name: 'Wizard' },
    { emoji: '🧝', name: 'Elf' },
    { emoji: '🧌', name: 'Troll' },
    { emoji: '🐉', name: 'Dragon' },
    { emoji: '🦄', name: 'Unicorn' },
    { emoji: '🧚', name: 'Fairy' },
    { emoji: '🧛', name: 'Vampire' },
    { emoji: '🧟', name: 'Zombie' },
    { emoji: '🧞', name: 'Genie' },
    { emoji: '🦹', name: 'Villain' }
  ],
  fish: [
    { emoji: '🐠', name: 'Tropical' },
    { emoji: '🐟', name: 'Fish' },
    { emoji: '🐡', name: 'Blowfish' },
    { emoji: '🦈', name: 'Shark' },
    { emoji: '🐋', name: 'Whale' },
    { emoji: '🐬', name: 'Dolphin' },
    { emoji: '🐙', name: 'Octopus' },
    { emoji: '🪼', name: 'Jellyfish' },
    { emoji: '🦀', name: 'Crab' },
    { emoji: '🦞', name: 'Lobster' }
  ],
  flags: [
    { emoji: '🏁', name: 'Checkered' },
    { emoji: '🚩', name: 'Triangular' },
    { emoji: '🎌', name: 'Crossed' },
    { emoji: '🏳️', name: 'White' },
    { emoji: '🏴', name: 'Black' },
    { emoji: '🏳️‍🌈', name: 'Rainbow' },
    { emoji: '🏴‍☠️', name: 'Pirate' },
    { emoji: '🇺🇳', name: 'UN' },
    { emoji: '🇪🇺', name: 'EU' },
    { emoji: '🏴', name: 'England' }
  ],
  flowers: [
    { emoji: '🌸', name: 'Cherry' },
    { emoji: '🌺', name: 'Hibiscus' },
    { emoji: '🌻', name: 'Sunflower' },
    { emoji: '🌹', name: 'Rose' },
    { emoji: '🌷', name: 'Tulip' },
    { emoji: '🌼', name: 'Daisy' },
    { emoji: '🪷', name: 'Lotus' },
    { emoji: '💐', name: 'Bouquet' },
    { emoji: '🥀', name: 'Wilted' },
    { emoji: '🪻', name: 'Hyacinth' }
  ],
  food: [
    { emoji: '🍕', name: 'Pizza' },
    { emoji: '🍔', name: 'Burger' },
    { emoji: '🌮', name: 'Taco' },
    { emoji: '🍣', name: 'Sushi' },
    { emoji: '🍝', name: 'Pasta' },
    { emoji: '🥗', name: 'Salad' },
    { emoji: '🍜', name: 'Ramen' },
    { emoji: '🍲', name: 'Soup' },
    { emoji: '🍛', name: 'Curry' },
    { emoji: '🍱', name: 'Bento' }
  ],
  fruits: [
    { emoji: '🍎', name: 'Apple' },
    { emoji: '🍌', name: 'Banana' },
    { emoji: '🍊', name: 'Orange' },
    { emoji: '🍇', name: 'Grapes' },
    { emoji: '🍓', name: 'Strawberry' },
    { emoji: '🥝', name: 'Kiwi' },
    { emoji: '🍍', name: 'Pineapple' },
    { emoji: '🥭', name: 'Mango' },
    { emoji: '🍑', name: 'Peach' },
    { emoji: '🍒', name: 'Cherry' }
  ],
  games: [
    { emoji: '🎮', name: 'Controller' },
    { emoji: '🎲', name: 'Dice' },
    { emoji: '🃏', name: 'Cards' },
    { emoji: '♟️', name: 'Chess' },
    { emoji: '🎯', name: 'Darts' },
    { emoji: '🎰', name: 'Slot' },
    { emoji: '🧩', name: 'Puzzle' },
    { emoji: '🎳', name: 'Bowling' },
    { emoji: '🎪', name: 'Circus' },
    { emoji: '🎨', name: 'Art' }
  ],
  geography: [
    { emoji: '🌍', name: 'Earth' },
    { emoji: '🗺️', name: 'Map' },
    { emoji: '🏔️', name: 'Mountain' },
    { emoji: '🏝️', name: 'Island' },
    { emoji: '🌋', name: 'Volcano' },
    { emoji: '🏜️', name: 'Desert' },
    { emoji: '🌲', name: 'Forest' },
    { emoji: '🏞️', name: 'Park' },
    { emoji: '🌊', name: 'Ocean' },
    { emoji: '🏖️', name: 'Beach' }
  ],
  greek: [
    { emoji: '🏛️', name: 'Temple' },
    { emoji: '⚱️', name: 'Urn' },
    { emoji: '🏺', name: 'Amphora' },
    { emoji: '🪶', name: 'Feather' },
    { emoji: '📜', name: 'Scroll' },
    { emoji: '🏅', name: 'Medal' },
    { emoji: '⚖️', name: 'Scale' },
    { emoji: '🛡️', name: 'Shield' },
    { emoji: '⚔️', name: 'Sword' },
    { emoji: '👑', name: 'Crown' }
  ],
  hebrew: [
    { emoji: '✡️', name: 'Star' },
    { emoji: '🕎', name: 'Menorah' },
    { emoji: '📜', name: 'Scroll' },
    { emoji: '🕍', name: 'Synagogue' },
    { emoji: '🍷', name: 'Wine' },
    { emoji: '🥖', name: 'Bread' },
    { emoji: '🕯️', name: 'Candle' },
    { emoji: '🍎', name: 'Apple' },
    { emoji: '🍯', name: 'Honey' },
    { emoji: '🐟', name: 'Fish' }
  ],
  holidays: [
    { emoji: '🎉', name: 'Party' },
    { emoji: '🎄', name: 'Christmas' },
    { emoji: '🎃', name: 'Halloween' },
    { emoji: '🕎', name: 'Hanukkah' },
    { emoji: '🪔', name: 'Diwali' },
    { emoji: '🐰', name: 'Easter' },
    { emoji: '🎊', name: 'Confetti' },
    { emoji: '🎆', name: 'Fireworks' },
    { emoji: '🎇', name: 'Sparkler' },
    { emoji: '🧧', name: 'Red Envelope' }
  ],
  latin: [
    { emoji: '🏛️', name: 'Rome' },
    { emoji: '⚔️', name: 'Sword' },
    { emoji: '🛡️', name: 'Shield' },
    { emoji: '🏺', name: 'Vase' },
    { emoji: '📜', name: 'Scroll' },
    { emoji: '🗿', name: 'Statue' },
    { emoji: '👑', name: 'Crown' },
    { emoji: '🦅', name: 'Eagle' },
    { emoji: '🐺', name: 'Wolf' },
    { emoji: '🏟️', name: 'Colosseum' }
  ],
  math: [
    { emoji: '🔢', name: 'Numbers' },
    { emoji: '➕', name: 'Plus' },
    { emoji: '➖', name: 'Minus' },
    { emoji: '✖️', name: 'Multiply' },
    { emoji: '➗', name: 'Divide' },
    { emoji: '≈', name: 'Approx' },
    { emoji: '∞', name: 'Infinity' },
    { emoji: '∑', name: 'Sum' },
    { emoji: '√', name: 'Root' },
    { emoji: 'π', name: 'Pi' }
  ],
  music: [
    { emoji: '🎵', name: 'Music' },
    { emoji: '🎸', name: 'Guitar' },
    { emoji: '🎹', name: 'Piano' },
    { emoji: '🥁', name: 'Drum' },
    { emoji: '🎻', name: 'Violin' },
    { emoji: '🎷', name: 'Sax' },
    { emoji: '🎺', name: 'Trumpet' },
    { emoji: '🎤', name: 'Mic' },
    { emoji: '🎧', name: 'Headphones' },
    { emoji: '🎼', name: 'Score' }
  ],
  numbers: [
    { emoji: '0️⃣', name: 'Zero' },
    { emoji: '1️⃣', name: 'One' },
    { emoji: '2️⃣', name: 'Two' },
    { emoji: '3️⃣', name: 'Three' },
    { emoji: '4️⃣', name: 'Four' },
    { emoji: '5️⃣', name: 'Five' },
    { emoji: '6️⃣', name: 'Six' },
    { emoji: '7️⃣', name: 'Seven' },
    { emoji: '8️⃣', name: 'Eight' },
    { emoji: '9️⃣', name: 'Nine' }
  ],
  office: [
    { emoji: '💼', name: 'Briefcase' },
    { emoji: '📎', name: 'Paperclip' },
    { emoji: '📌', name: 'Pin' },
    { emoji: '✂️', name: 'Scissors' },
    { emoji: '📏', name: 'Ruler' },
    { emoji: '🖊️', name: 'Pen' },
    { emoji: '📄', name: 'Paper' },
    { emoji: '📁', name: 'Folder' },
    { emoji: '🗂️', name: 'Divider' },
    { emoji: '📅', name: 'Calendar' }
  ],
  planets: [
    { emoji: '🪐', name: 'Saturn' },
    { emoji: '☀️', name: 'Sun' },
    { emoji: '🌙', name: 'Moon' },
    { emoji: '🌍', name: 'Earth' },
    { emoji: '🔥', name: 'Mars' },
    { emoji: '⭐', name: 'Star' },
    { emoji: '🌕', name: 'Full Moon' },
    { emoji: '🌑', name: 'New Moon' },
    { emoji: '🌌', name: 'Galaxy' },
    { emoji: '☄️', name: 'Comet' }
  ],
  plants: [
    { emoji: '🌿', name: 'Herb' },
    { emoji: '🌱', name: 'Seedling' },
    { emoji: '🌴', name: 'Palm' },
    { emoji: '🎋', name: 'Bamboo' },
    { emoji: '🍀', name: 'Clover' },
    { emoji: '🌵', name: 'Cactus' },
    { emoji: '🌲', name: 'Tree' },
    { emoji: '🍂', name: 'Leaf' },
    { emoji: '🍁', name: 'Maple' },
    { emoji: '🌾', name: 'Rice' }
  ],
  roadSigns: [
    { emoji: '⚠️', name: 'Warning' },
    { emoji: '🚧', name: 'Construction' },
    { emoji: '🚸', name: 'Children' },
    { emoji: '🚫', name: 'No Entry' },
    { emoji: '🅿️', name: 'Parking' },
    { emoji: '🚦', name: 'Traffic Light' },
    { emoji: '🛑', name: 'Stop' },
    { emoji: '🚥', name: 'Horizontal Lights' },
    { emoji: '🚏', name: 'Bus Stop' },
    { emoji: '⛔', name: 'No Entry' }
  ],
  science: [
    { emoji: '🔬', name: 'Microscope' },
    { emoji: '🧪', name: 'Test Tube' },
    { emoji: '🧫', name: 'Petri Dish' },
    { emoji: '🧬', name: 'DNA' },
    { emoji: '⚗️', name: 'Alchemy' },
    { emoji: '🔭', name: 'Telescope' },
    { emoji: '🧲', name: 'Magnet' },
    { emoji: '🧪', name: 'Chemistry' },
    { emoji: '🧬', name: 'Biology' },
    { emoji: '🔬', name: 'Science' }
  ],
  shapes: [
    { emoji: '⬛', name: 'Square' },
    { emoji: '🔴', name: 'Circle' },
    { emoji: '🔺', name: 'Triangle' },
    { emoji: '⬜', name: 'White Square' },
    { emoji: '🔵', name: 'Blue Circle' },
    { emoji: '🔶', name: 'Orange Diamond' },
    { emoji: '🔷', name: 'Blue Diamond' },
    { emoji: '🔸', name: 'Small Diamond' },
    { emoji: '🔹', name: 'Small Blue' },
    { emoji: '🔻', name: 'Red Triangle' }
  ],
  sports: [
    { emoji: '⚽', name: 'Soccer' },
    { emoji: '🏀', name: 'Basketball' },
    { emoji: '🏈', name: 'Football' },
    { emoji: '⚾', name: 'Baseball' },
    { emoji: '🎾', name: 'Tennis' },
    { emoji: '🏐', name: 'Volleyball' },
    { emoji: '🏓', name: 'Table Tennis' },
    { emoji: '🏒', name: 'Hockey' },
    { emoji: '🥊', name: 'Boxing' },
    { emoji: '🥋', name: 'Martial Arts' }
  ],
  tech: [
    { emoji: '💻', name: 'Laptop' },
    { emoji: '📱', name: 'Phone' },
    { emoji: '🖥️', name: 'Computer' },
    { emoji: '⌨️', name: 'Keyboard' },
    { emoji: '🖱️', name: 'Mouse' },
    { emoji: '📷', name: 'Camera' },
    { emoji: '🎧', name: 'Headphones' },
    { emoji: '🖨️', name: 'Printer' },
    { emoji: '📠', name: 'Fax' },
    { emoji: '📟', name: 'Pager' }
  ],
  time: [
    { emoji: '⏰', name: 'Alarm' },
    { emoji: '⌚', name: 'Watch' },
    { emoji: '⏱️', name: 'Stopwatch' },
    { emoji: '⏲️', name: 'Timer' },
    { emoji: '🕰️', name: 'Clock' },
    { emoji: '⌛', name: 'Hourglass' },
    { emoji: '📅', name: 'Calendar' },
    { emoji: '⏳', name: 'Hourglass' },
    { emoji: '🕐', name: 'One' },
    { emoji: '🕑', name: 'Two' }
  ],
  tools: [
    { emoji: '🔧', name: 'Wrench' },
    { emoji: '🔨', name: 'Hammer' },
    { emoji: '🪛', name: 'Screwdriver' },
    { emoji: '🔩', name: 'Nut' },
    { emoji: '⚒️', name: 'Pick' },
    { emoji: '🛠️', name: 'Tools' },
    { emoji: '🗜️', name: 'Clamp' },
    { emoji: '⚙️', name: 'Gear' },
    { emoji: '🔪', name: 'Knife' },
    { emoji: '🪚', name: 'Saw' }
  ],
  trains: [
    { emoji: '🚂', name: 'Train' },
    { emoji: '🚆', name: 'Railway' },
    { emoji: '🚇', name: 'Metro' },
    { emoji: '🚈', name: 'Light Rail' },
    { emoji: '🚝', name: 'Monorail' },
    { emoji: '🚞', name: 'Mountain' },
    { emoji: '🚋', name: 'Tram' },
    { emoji: '🚄', name: 'Bullet' },
    { emoji: '🚅', name: 'Shinkansen' },
    { emoji: '🚃', name: 'Carriage' }
  ],
  transport: [
    { emoji: '🚌', name: 'Bus' },
    { emoji: '🚎', name: 'Trolley' },
    { emoji: '🚐', name: 'Van' },
    { emoji: '🚑', name: 'Ambulance' },
    { emoji: '🚒', name: 'Fire Truck' },
    { emoji: '🚓', name: 'Police' },
    { emoji: '🚕', name: 'Taxi' },
    { emoji: '🚚', name: 'Truck' },
    { emoji: '🚛', name: 'Lorry' },
    { emoji: '🚜', name: 'Tractor' }
  ],
  vegetables: [
    { emoji: '🥕', name: 'Carrot' },
    { emoji: '🥦', name: 'Broccoli' },
    { emoji: '🥬', name: 'Lettuce' },
    { emoji: '🥒', name: 'Cucumber' },
    { emoji: '🌽', name: 'Corn' },
    { emoji: '🧅', name: 'Onion' },
    { emoji: '🍅', name: 'Tomato' },
    { emoji: '🥔', name: 'Potato' },
    { emoji: '🧄', name: 'Garlic' },
    { emoji: '🫑', name: 'Pepper' }
  ],
  weather: [
    { emoji: '☀️', name: 'Sunny' },
    { emoji: '☁️', name: 'Cloudy' },
    { emoji: '🌧️', name: 'Rainy' },
    { emoji: '⛈️', name: 'Storm' },
    { emoji: '❄️', name: 'Snow' },
    { emoji: '🌪️', name: 'Tornado' },
    { emoji: '🌈', name: 'Rainbow' },
    { emoji: '🌊', name: 'Wave' },
    { emoji: '💨', name: 'Wind' },
    { emoji: '🌫️', name: 'Fog' }
  ]
};

// ============================
// HELPER FUNCTIONS
// ============================

/**
 * Get display name for a category
 */
export const getCategoryDisplayName = (category: Category): string => {
  const names: Record<Category, string> = {
    aircraft: 'Aircraft',
    animals: 'Animals',
    arabic: 'Arabic',
    birds: 'Birds',
    bugs: 'Bugs',
    cars: 'Cars',
    clothing: 'Clothing',
    colors: 'Colors',
    cyrillic: 'Cyrillic',
    devanagari: 'Devanagari',
    emotions: 'Emotions',
    fantasy: 'Fantasy',
    fish: 'Fish',
    flags: 'Flags',
    flowers: 'Flowers',
    food: 'Food',
    fruits: 'Fruits',
    games: 'Games',
    geography: 'Geography',
    greek: 'Greek',
    hebrew: 'Hebrew',
    holidays: 'Holidays',
    latin: 'Latin',
    math: 'Math',
    music: 'Music',
    numbers: 'Numbers',
    office: 'Office',
    planets: 'Planets',
    plants: 'Plants',
    roadSigns: 'Road Signs',
    science: 'Science',
    shapes: 'Shapes',
    sports: 'Sports',
    tech: 'Technology',
    time: 'Time',
    tools: 'Tools',
    trains: 'Trains',
    transport: 'Transport',
    vegetables: 'Vegetables',
    weather: 'Weather',
  };
  return names[category] || category.charAt(0).toUpperCase() + category.slice(1);
};

/**
 * Get representative emoji for a category
 */
export const getCategoryEmoji = (category: Category): string => {
  const emojis: Record<Category, string> = {
    aircraft: '✈️',
    animals: '🐘',
    arabic: '🕌',
    birds: '🦜',
    bugs: '🐞',
    cars: '🚗',
    clothing: '👕',
    colors: '🎨',
    cyrillic: '📜',
    devanagari: '🕉️',
    emotions: '😊',
    fantasy: '🧙',
    fish: '🐠',
    flags: '🏁',
    flowers: '🌸',
    food: '🍕',
    fruits: '🍎',
    games: '🎮',
    geography: '🌍',
    greek: '🏛️',
    hebrew: '✡️',
    holidays: '🎉',
    latin: '🏺',
    math: '🔢',
    music: '🎵',
    numbers: '🔢',
    office: '💼',
    planets: '🪐',
    plants: '🌿',
    roadSigns: '⚠️',
    science: '🔬',
    shapes: '⬛',
    sports: '⚽',
    tech: '💻',
    time: '⏰',
    tools: '🔧',
    trains: '🚂',
    transport: '🚌',
    vegetables: '🥕',
    weather: '☀️',
  };
  return emojis[category] || '🎯';
};

/**
 * Helper function to calculate week number
 * @param date - The date to calculate week number for
 * @returns Week number (1-52)
 */
export function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

/**
 * Get the current week number as a number
 */
export const getCurrentWeekNumber = (): number => {
  return getWeekNumber(new Date());
};

/**
 * Get the current week number as a string
 */
export const getCurrentWeekNumberString = (): string => {
  return getWeekNumber(new Date()).toString();
};

/**
 * Get the day name for a given day index
 */
export const getDayName = (dayIndex: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex] || 'Unknown';
};

/**
 * Get today's day name
 */
export const getTodayDayName = (): string => {
  return getDayName(new Date().getDay());
};

/**
 * Get today's item for the selected category
 * Returns a different item for each day of the week (Sunday = index 0, Monday = index 1, etc.)
 */
export const getTodayCategoryItem = (category: Category): { emoji: string; name: string } => {
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  // Get the daily items for this category, fallback to animals if category not found
  const items = DAILY_CATEGORY_ITEMS[category] || DAILY_CATEGORY_ITEMS.animals;
  
  // Return the item for today's index, or the first item if index is out of bounds
  return items[today] || items[0];
};

/**
 * Get this week's item for the selected category
 * Rotates through items based on the week number of the year
 */
export const getWeekCategoryItem = (category: Category): { emoji: string; name: string } => {
  // Get current week number (1-52)
  const weekNum = getWeekNumber(new Date());
  
  // Get the weekly items for this category, fallback to animals if category not found
  const items = WEEKLY_CATEGORY_ITEMS[category] || WEEKLY_CATEGORY_ITEMS.animals;
  
  // Calculate index based on week number (subtract 1 to make it 0-based, then modulo by items length)
  const index = (weekNum - 1) % items.length;
  
  return items[index];
};

/**
 * Get all daily items for a category (7 items)
 */
export const getDailyItemsForCategory = (category: Category): Array<{ emoji: string; name: string }> => {
  return DAILY_CATEGORY_ITEMS[category] || DAILY_CATEGORY_ITEMS.animals;
};

/**
 * Get all weekly items for a category (10 items)
 */
export const getWeeklyItemsForCategory = (category: Category): Array<{ emoji: string; name: string }> => {
  return WEEKLY_CATEGORY_ITEMS[category] || WEEKLY_CATEGORY_ITEMS.animals;
};

/**
 * Get a specific daily item by day index (0-6)
 */
export const getDailyItemByDay = (category: Category, dayIndex: number): { emoji: string; name: string } => {
  const items = DAILY_CATEGORY_ITEMS[category] || DAILY_CATEGORY_ITEMS.animals;
  const safeIndex = Math.max(0, Math.min(dayIndex, items.length - 1));
  return items[safeIndex];
};

/**
 * Get a specific weekly item by week offset
 */
export const getWeeklyItemByWeek = (category: Category, weekOffset: number): { emoji: string; name: string } => {
  const items = WEEKLY_CATEGORY_ITEMS[category] || WEEKLY_CATEGORY_ITEMS.animals;
  const index = weekOffset % items.length;
  return items[index];
};

/**
 * Check if a category has daily items defined
 */
export const hasDailyItems = (category: Category): boolean => {
  return !!DAILY_CATEGORY_ITEMS[category];
};

/**
 * Check if a category has weekly items defined
 */
export const hasWeeklyItems = (category: Category): boolean => {
  return !!WEEKLY_CATEGORY_ITEMS[category];
};

/**
 * Get a preview of the daily rotation for a category
 * Returns the items for the next 7 days starting from today
 */
export const getDailyPreview = (category: Category): DailyPreviewItem[] => {
  const today = new Date().getDay();
  const items = DAILY_CATEGORY_ITEMS[category] || DAILY_CATEGORY_ITEMS.animals;
  const preview: DailyPreviewItem[] = [];
  
  for (let i = 0; i < 7; i++) {
    const dayIndex = (today + i) % 7;
    const dayName = getDayName(dayIndex);
    preview.push({
      day: dayName,
      ...items[dayIndex]
    });
  }
  
  return preview;
};

/**
 * Get a preview of the weekly rotation for a category
 * Returns the next items based on the category's weekly items
 */
export const getWeeklyPreview = (category: Category): WeeklyPreviewItem[] => {
  const currentWeek = getWeekNumber(new Date());
  const items = WEEKLY_CATEGORY_ITEMS[category] || WEEKLY_CATEGORY_ITEMS.animals;
  const preview: WeeklyPreviewItem[] = [];
  
  for (let i = 0; i < items.length; i++) {
    const weekNum = currentWeek + i;
    const index = (weekNum - 1) % items.length;
    preview.push({
      week: weekNum,
      ...items[index]
    });
  }
  
  return preview;
};

/**
 * Get a limited preview of the daily rotation
 * Returns a specified number of upcoming days
 */
export const getDailyPreviewLimited = (category: Category, limit: number = 3): DailyPreviewItem[] => {
  const fullPreview = getDailyPreview(category);
  return fullPreview.slice(0, limit);
};

/**
 * Get a limited preview of the weekly rotation
 * Returns a specified number of upcoming weeks
 */
export const getWeeklyPreviewLimited = (category: Category, limit: number = 3): WeeklyPreviewItem[] => {
  const fullPreview = getWeeklyPreview(category);
  return fullPreview.slice(0, limit);
};

/**
 * Get the item for a specific date
 */
export const getItemForDate = (category: Category, date: Date): { emoji: string; name: string } => {
  const dayIndex = date.getDay();
  return getDailyItemByDay(category, dayIndex);
};

/**
 * Get the item for a specific week
 */
export const getItemForWeek = (category: Category, weekDate: Date): { emoji: string; name: string } => {
  const weekNum = getWeekNumber(weekDate);
  const items = WEEKLY_CATEGORY_ITEMS[category] || WEEKLY_CATEGORY_ITEMS.animals;
  const index = (weekNum - 1) % items.length;
  return items[index];
};

/**
 * Check if today's item matches a specific emoji/name
 */
export const isTodaysItem = (category: Category, emoji: string, name: string): boolean => {
  const todayItem = getTodayCategoryItem(category);
  return todayItem.emoji === emoji && todayItem.name === name;
};

/**
 * Check if this week's item matches a specific emoji/name
 */
export const isThisWeeksItem = (category: Category, emoji: string, name: string): boolean => {
  const weekItem = getWeekCategoryItem(category);
  return weekItem.emoji === emoji && weekItem.name === name;
};

/**
 * Get all available categories
 */
export const getAllCategories = (): Category[] => {
  return Object.keys(DAILY_CATEGORY_ITEMS) as Category[];
};

/**
 * Get the total number of categories
 */
export const getCategoriesCount = (): number => {
  return Object.keys(DAILY_CATEGORY_ITEMS).length;
};

/**
 * Check if a category has both daily and weekly items
 */
export const hasFullSupport = (category: Category): boolean => {
  return hasDailyItems(category) && hasWeeklyItems(category);
};

/**
 * Get the rotation info for a category
 */
export const getCategoryRotationInfo = (category: Category): {
  dailyItems: number;
  weeklyItems: number;
  hasDaily: boolean;
  hasWeekly: boolean;
  currentDaily: { emoji: string; name: string };
  currentWeekly: { emoji: string; name: string };
} => {
  const dailyItems = getDailyItemsForCategory(category);
  const weeklyItems = getWeeklyItemsForCategory(category);
  
  return {
    dailyItems: dailyItems.length,
    weeklyItems: weeklyItems.length,
    hasDaily: hasDailyItems(category),
    hasWeekly: hasWeeklyItems(category),
    currentDaily: getTodayCategoryItem(category),
    currentWeekly: getWeekCategoryItem(category),
  };
};

/**
 * Format category name for display in different contexts
 */
export const formatCategoryForDisplay = (
  category: Category, 
  format: 'title' | 'lowercase' | 'uppercase' | 'sentence' = 'title'
): string => {
  const displayName = getCategoryDisplayName(category);
  
  switch (format) {
    case 'lowercase':
      return displayName.toLowerCase();
    case 'uppercase':
      return displayName.toUpperCase();
    case 'sentence':
      return displayName.charAt(0).toUpperCase() + displayName.slice(1).toLowerCase();
    case 'title':
    default:
      return displayName;
  }
};

/**
 * Get a description for the category
 */
export const getCategoryDescription = (category: Category): string => {
  const descriptions: Partial<Record<Category, string>> = {
    animals: 'Explore the fascinating world of animals',
    birds: 'Discover beautiful birds from around the world',
    bugs: 'Learn about insects and their habitats',
    cars: 'Explore different types of vehicles',
    colors: 'Discover the spectrum of colors',
    emotions: 'Understand different feelings and expressions',
    fish: 'Dive into the world of aquatic life',
    flowers: 'Explore beautiful flowers and plants',
    food: 'Discover delicious dishes and ingredients',
    fruits: 'Learn about different fruits',
    geography: 'Explore countries and landmarks',
    music: 'Discover musical instruments and terms',
    numbers: 'Learn about mathematics and counting',
    planets: 'Explore our solar system',
    sports: 'Discover different sports and activities',
    weather: 'Learn about weather phenomena',
  };
  
  return descriptions[category] || `Explore the world of ${getCategoryDisplayName(category).toLowerCase()}`;
};

/**
 * Get a random category
 */
export const getRandomCategory = (): Category => {
  const categories = getAllCategories();
  const randomIndex = Math.floor(Math.random() * categories.length);
  return categories[randomIndex];
};

/**
 * Validate if a category exists
 */
export const isValidCategory = (category: string): category is Category => {
  return (Object.keys(DAILY_CATEGORY_ITEMS) as string[]).includes(category);
};