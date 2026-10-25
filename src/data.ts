export type Resort = 'Disneyland' | 'Disney World';
export type Verdict = 'must' | 'eat' | 'skip';
/** Limited-time event an item belongs to. 'special' = limited-run items with no fixed season. 'icon' = year-round items that are must-eat nearly every visit. */
export type EventKey = 'halloween' | 'christmas' | 'food-wine' | 'special' | 'icon';

/** Year-round items are only kept when they are reliably must-eat. Enforced by a test. */
export const ICON_MIN_RATING = 4.6;

export const EVENTS: Record<EventKey, { label: string; emoji: string }> = {
  halloween: { label: 'Halloween', emoji: '🎃' },
  christmas: { label: 'Christmas', emoji: '🎄' },
  'food-wine': { label: 'Food & Wine Festival', emoji: '🍷' },
  special: { label: 'Limited run', emoji: '✨' },
  icon: { label: 'Always a must', emoji: '🏆' },
};

export interface Food {
  id: string;
  name: string;
  park: string;
  resort: Resort;
  venue: string;
  area: string;
  lat: number;
  lng: number;
  price: number; // approximate USD, verify in the official app
  desc: string;
  emoji: string;
  rating: number; // 0-5 aggregate guest rating (sample data)
  votes: number;
  trend: number; // 0-100 social buzz score (sample data)
  tags: string[];
  event: EventKey;
  /** Approximate yearly window as "MM-DD". Null = no fixed season. A window may wrap past New Year (e.g. 11-10 to 01-06). */
  window: { from: string; to: string } | null;
}

export const PARKS: Record<string, { resort: Resort; lat: number; lng: number }> = {
  'Disneyland Park': { resort: 'Disneyland', lat: 33.8121, lng: -117.919 },
  'Disney California Adventure': { resort: 'Disneyland', lat: 33.8062, lng: -117.9217 },
  'Magic Kingdom': { resort: 'Disney World', lat: 28.4177, lng: -81.5812 },
  EPCOT: { resort: 'Disney World', lat: 28.3747, lng: -81.5494 },
  'Hollywood Studios': { resort: 'Disney World', lat: 28.3575, lng: -81.5583 },
  'Animal Kingdom': { resort: 'Disney World', lat: 28.3553, lng: -81.5901 },
};

// Seasonal windows are approximate and change every year; always confirm dates in the official app.
const HAL_DL = ['09-01', '10-31'], HAL_WDW = ['08-08', '10-31'], XMAS_DL = ['11-10', '01-06'], XMAS_WDW = ['11-08', '12-31'];
const FW_EPCOT = ['08-28', '11-22'], FW_DCA = ['03-06', '04-27'];

type Row = [string, string, string, string, number, number, number, string, string, number, number, number, string, EventKey, string[] | null];
// name, park, venue, area, lat, lng, price, desc, emoji, rating, votes, trend, tags, event, window
const rows: Row[] = [
  // ---- Halloween ----
  ['Pumpkin Spice Churro', 'Disneyland Park', 'Churro carts', 'Main Street', 33.8115, -117.9195, 7, 'Classic churro rolled in pumpkin spice sugar.', '🥖', 4.3, 3100, 84, 'snack,pumpkin', 'halloween', HAL_DL],
  ['Candy Corn Cupcake', 'Disneyland Park', 'Jolly Holiday Bakery Cafe', 'Main Street', 33.8113, -117.9190, 7.5, 'Layered candy-corn colored cupcake with buttercream.', '🧁', 3.7, 900, 61, 'dessert,candy-corn', 'halloween', HAL_DL],
  ['Haunted Beignets', 'Disneyland Park', 'Cafe Orleans', 'New Orleans Square', 33.8126, -117.9211, 11, 'Beignets with a spooky seasonal dipping sauce.', '🍩', 4.5, 1700, 77, 'dessert', 'halloween', HAL_DL],
  ['Oogie Boogie Bash Treat', 'Disney California Adventure', 'Cozy Cone Motel', 'Cars Land', 33.8052, -117.9229, 9, 'Green-and-purple dessert themed for the ticketed Halloween party.', '👻', 3.9, 1500, 80, 'dessert,party', 'halloween', ['08-15', '10-31']],
  ['Spiderweb Cheeseburger', 'Disney California Adventure', 'Award Wieners', 'Hollywood Land', 33.8073, -117.9190, 14, 'Burger with a web-piped sauce on a black bun.', '🍔', 3.5, 700, 50, 'savory', 'halloween', HAL_DL],
  ['Pumpkin Cinnamon Roll', 'Magic Kingdom', 'Main Street Bakery', 'Main Street, U.S.A.', 28.4174, -81.5812, 8, 'Giant cinnamon roll with pumpkin icing.', '🍥', 4.4, 3600, 82, 'breakfast,pumpkin', 'halloween', HAL_WDW],
  ['Not-So-Scary Party Cookie', 'Magic Kingdom', "Casey's Corner", 'Main Street, U.S.A.', 28.4170, -81.5810, 5, 'Frosted Mickey cookie with Halloween sprinkles.', '🍪', 3.8, 2200, 66, 'dessert,party', 'halloween', HAL_WDW],
  ['Mummy Dog', 'Magic Kingdom', 'Pecos Bill Tall Tale Inn', 'Frontierland', 28.4192, -81.5845, 11, 'Hot dog wrapped in pastry bandages.', '🌭', 3.6, 800, 55, 'savory', 'halloween', HAL_WDW],
  ['Pumpkin Funnel Cake', "Hollywood Studios", 'Dockside Diner', 'Echo Lake', 28.3578, -81.5590, 9, 'Funnel cake with pumpkin spice and whipped cream.', '🎃', 4.0, 1000, 63, 'dessert,pumpkin', 'halloween', HAL_WDW],
  ['Ghost Pepper Wings', 'Animal Kingdom', 'Harambe Market', 'Africa', 28.3558, -81.5907, 13, 'Very spicy wings for a Halloween dare.', '🌶️', 3.3, 400, 38, 'savory,spicy', 'halloween', HAL_WDW],

  // ---- Christmas ----
  ['Peppermint Hot Chocolate', 'Disneyland Park', 'Refreshment Corner', 'Main Street', 33.8114, -117.9192, 7, 'Rich cocoa with peppermint and whipped cream.', '☕', 4.5, 2900, 86, 'drink,warm', 'christmas', XMAS_DL],
  ['Gingerbread Cookie Mickey', 'Disneyland Park', 'Jolly Holiday Bakery Cafe', 'Main Street', 33.8113, -117.9190, 6, 'Mickey gingerbread with royal icing.', '🍪', 4.1, 2400, 70, 'dessert', 'christmas', XMAS_DL],
  ['Holiday Roast Turkey Dinner', 'Disneyland Park', 'Plaza Inn', 'Main Street', 33.8120, -117.9183, 24, 'Turkey, stuffing, mashed potatoes and cranberry.', '🦃', 4.2, 1100, 58, 'dinner', 'christmas', XMAS_DL],
  ['Snowman Beignets', 'Disney California Adventure', 'Pacific Wharf Cafe', 'Pacific Wharf', 33.8066, -117.9209, 10, 'Powdered-sugar beignets with a holiday sauce.', '⛄', 4.0, 800, 60, 'dessert', 'christmas', XMAS_DL],
  ['Eggnog Latte', 'Magic Kingdom', 'Main Street Bakery', 'Main Street, U.S.A.', 28.4174, -81.5812, 7, 'Espresso with eggnog and nutmeg.', '🥛', 3.8, 1300, 59, 'drink,warm', 'christmas', XMAS_WDW],
  ['Unlimited Cookies & Cocoa', 'Magic Kingdom', 'Party cookie stations', 'Main Street, U.S.A.', 28.4172, -81.5811, 0, 'Included with the ticketed Christmas party. Free refills.', '🍪', 4.7, 5200, 90, 'party,free', 'christmas', ['11-08', '12-23']],
  ['Chimney Cake', 'EPCOT', 'Holiday Kitchen: Hungary', 'World Showcase', 28.3715, -81.5480, 8, 'Hungarian kürtőskalács rolled in cinnamon sugar. Festival of the Holidays favorite.', '🥐', 4.8, 4000, 91, 'dessert,festival', 'christmas', ['11-27', '12-30']],
  ['Hot Chocolate Flight', 'EPCOT', 'Holiday Kitchen: Hot Chocolate', 'World Showcase', 28.3710, -81.5490, 9, 'Three mini hot chocolates with different toppings.', '🍫', 4.3, 1200, 68, 'drink,festival', 'christmas', ['11-27', '12-30']],
  ['Jollywood Nights Cocoa', "Hollywood Studios", 'Sweet Spells', "Sunset Boulevard", 28.3585, -81.5595, 6, 'Seasonal cocoa served with festive marshmallows.', '🍫', 3.9, 700, 55, 'drink,warm', 'christmas', XMAS_WDW],

  // ---- Food & Wine Festival ----
  ['Cheddar Cheese Soup', 'EPCOT', 'Canada Marketplace', 'World Showcase: Canada', 28.3693, -81.5496, 7, 'Thick Canadian cheddar soup with pretzel crouton. A long-time festival favorite.', '🧀', 4.7, 6800, 89, 'savory,festival', 'food-wine', FW_EPCOT],
  ['Pão de Queijo', 'EPCOT', 'Brazil Marketplace', 'World Showcase', 28.3719, -81.5476, 5, 'Warm Brazilian cheese bread.', '🧀', 4.6, 3900, 81, 'snack,festival', 'food-wine', FW_EPCOT],
  ['Belgian Waffle With Berries', 'EPCOT', 'Belgium Marketplace', 'World Showcase', 28.3722, -81.5488, 7, 'Light waffle with strawberries and whipped cream.', '🧇', 4.7, 5100, 85, 'dessert,festival', 'food-wine', FW_EPCOT],
  ['Baklava', 'EPCOT', 'Greece Marketplace', 'World Showcase', 28.3712, -81.5467, 5.5, 'Layered phyllo, nuts and honey syrup.', '🍯', 4.3, 1500, 62, 'dessert,festival', 'food-wine', FW_EPCOT],
  ['Quesabirria Tacos', 'EPCOT', 'Mexico Marketplace', 'World Showcase: Mexico', 28.3708, -81.5504, 9, 'Cheesy braised-beef tacos with consomé.', '🌮', 4.4, 2600, 83, 'savory,festival', 'food-wine', FW_EPCOT],
  ['Grand Marnier Orange Slush', 'EPCOT', 'Refreshment Port', 'World Showcase: France', 28.3718, -81.5470, 13, 'Boozy frozen orange. Great on a hot day.', '🍊', 4.3, 1900, 60, 'drink,festival', 'food-wine', FW_EPCOT],
  ['Loaded Fries Festival Plate', 'EPCOT', 'Poland Marketplace', 'World Showcase', 28.3725, -81.5500, 8, 'Hearty plate of pierogi-style comfort food.', '🥟', 3.6, 600, 44, 'savory,festival', 'food-wine', FW_EPCOT],
  ['Sonoma Wine Flight', 'Disney California Adventure', 'Festival Marketplace: Wine', 'Pacific Wharf', 33.8068, -117.9211, 16, 'Three pours from California wineries. Spring Food & Wine Festival.', '🍷', 4.2, 700, 59, 'drink,festival', 'food-wine', FW_DCA],
  ['Berry Sorbet Bite', 'Disney California Adventure', 'Festival Marketplace: Sweets', 'Buena Vista Street', 33.8082, -117.9226, 6, 'Small sorbet and shortbread bite.', '🍧', 3.8, 500, 48, 'dessert,festival', 'food-wine', FW_DCA],

  // ---- Always a must (year-round, only the reliably great ones) ----
  ['Dole Whip', 'Magic Kingdom', 'Aloha Isle', 'Adventureland', 28.4180, -81.5826, 6.5, 'The original pineapple soft serve. Try the float.', '🍍', 4.9, 9100, 95, 'dessert,vegan,classic', 'icon', null],
  ['Dole Whip', 'Disneyland Park', 'Tiki Juice Bar', 'Adventureland', 33.8117, -117.9208, 6.5, 'Dairy-free pineapple soft serve.', '🍍', 4.8, 5400, 92, 'dessert,vegan,classic', 'icon', null],
  ['Monte Cristo Sandwich', 'Disneyland Park', 'Blue Bayou Restaurant', 'New Orleans Square', 33.8124, -117.9213, 28, 'Battered ham, turkey and cheese with powdered sugar and jam.', '🥪', 4.6, 3300, 78, 'lunch,classic', 'icon', null],
  ['Clam Chowder Bread Bowl', 'Disney California Adventure', 'Pacific Wharf Cafe', 'Pacific Wharf', 33.8066, -117.9209, 14, 'Creamy chowder in a sourdough bowl.', '🥣', 4.7, 2600, 80, 'lunch,classic', 'icon', null],
  ['School Bread', 'EPCOT', 'Kringla Bakeri Og Kafe', 'World Showcase: Norway', 28.3702, -81.5493, 6, 'Sweet bun filled with custard and dusted with coconut.', '🍞', 4.8, 4300, 88, 'dessert,world-showcase', 'icon', null],
  ['Le Cellier Filet Mignon', 'EPCOT', 'Le Cellier Steakhouse', 'World Showcase: Canada', 28.3693, -81.5496, 62, 'Signature filet with cheddar soup and truffle fries. Reservation needed.', '🥩', 4.8, 2200, 76, 'dinner,sit-down', 'icon', null],
  ['Ronto Wrap', "Hollywood Studios", "Ronto Roasters", "Star Wars: Galaxy's Edge", 28.3548, -81.5622, 14, 'Roasted pork and sausage wrap with peppercorn sauce.', '🌯', 4.6, 2900, 79, 'lunch', 'icon', null],

  // ---- Special / limited run (no fixed season) ----
  ['Celebration Cake Slice', 'Magic Kingdom', 'Be Our Guest Bakery', 'Fantasyland', 28.4203, -81.5799, 8, 'Rotating limited-run cake for park anniversaries and milestones.', '🍰', 4.1, 1000, 57, 'dessert,limited', 'special', null],
  ['Villain Sundae', 'Disneyland Park', 'Gibson Girl Ice Cream Parlor', 'Main Street', 33.8112, -117.9193, 12, 'Rotating themed sundae from the latest movie or character celebration.', '🍨', 3.9, 800, 52, 'dessert,limited', 'special', null],
  ['Star Wars Limited Cookie', 'Hollywood Studios', "Ronto Roasters", "Star Wars: Galaxy's Edge", 28.3548, -81.5622, 8, 'Limited-run themed cookie tied to new releases.', '🍪', 3.7, 600, 54, 'dessert,limited', 'special', null],
  ['Pandora Limited Bao', 'Animal Kingdom', "Satu'li Canteen", 'Pandora', 28.3547, -81.5921, 10, 'Limited-run flavor of the signature cheeseburger bao.', '🥟', 4.4, 1900, 76, 'savory,limited', 'special', null],
];

export const FOODS: Food[] = rows.map((r, i) => ({
  id: `f${i}`,
  name: r[0], park: r[1], resort: PARKS[r[1]].resort, venue: r[2], area: r[3],
  lat: r[4], lng: r[5], price: r[6], desc: r[7], emoji: r[8],
  rating: r[9], votes: r[10], trend: r[11], tags: r[12].split(','),
  event: r[13], window: r[14] ? { from: r[14][0], to: r[14][1] } : null,
}));

export function verdict(f: Food): Verdict {
  if (f.rating >= 4.4) return 'must';
  if (f.rating >= 3.6) return 'eat';
  return 'skip';
}

export function trendLabel(t: number): string {
  if (t >= 85) return '🔥 Exploding';
  if (t >= 65) return '📈 Trending';
  if (t >= 45) return '➡️ Steady';
  return '💤 Quiet';
}

export function distM(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371000, rad = Math.PI / 180;
  const dLat = (bLat - aLat) * rad, dLng = (bLng - aLng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function fmtDist(m: number): string {
  const ft = m * 3.281;
  return ft < 1000 ? `${Math.round(ft / 10) * 10} ft` : `${(m / 1609).toFixed(1)} mi`;
}

/** Deep links to what people are posting. Official APIs for these do not exist for search, so we open the app's own search. */
export function socialLinks(f: Food) {
  const q = `${f.name} ${f.resort === 'Disneyland' ? 'Disneyland' : 'Disney World'}`;
  const tag = (f.name + f.park).replace(/[^a-z0-9]/gi, '').toLowerCase();
  return {
    instagram: `https://www.instagram.com/explore/tags/${encodeURIComponent(tag)}/`,
    tiktok: `https://www.tiktok.com/search?q=${encodeURIComponent(q)}`,
    official: f.resort === 'Disneyland'
      ? `https://disneyland.disney.go.com/search/?q=${encodeURIComponent(f.name)}`
      : `https://disneyworld.disney.go.com/search/?q=${encodeURIComponent(f.name)}`,
  };
}
