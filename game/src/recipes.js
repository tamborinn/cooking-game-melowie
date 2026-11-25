// Menu and ingredients made for Bara dan Rempah.
export const INGREDIENTS = [
  { id: 'rice', name: 'Nasi', color: '#f0dfb0' },
  { id: 'noodles', name: 'Mi', color: '#eabd58' },
  { id: 'chicken', name: 'Ayam', color: '#d99059' },
  { id: 'beef', name: 'Sapi', color: '#9b503e' },
  { id: 'egg', name: 'Telur', color: '#fff0cb' },
  { id: 'tofu', name: 'Tahu', color: '#e7d3a8' },
  { id: 'shallot', name: 'Bawang', color: '#b76466' },
  { id: 'chili', name: 'Cabai', color: '#c84436' },
  { id: 'lime', name: 'Jeruk limau', color: '#87a84d' },
  { id: 'peanut', name: 'Kacang', color: '#b9864b' },
];

export const RECIPES = [
  { name: 'Sate Ayam Madura', ingredients: ['chicken', 'peanut', 'lime'] },
  { name: 'Nasi Goreng Kampung', ingredients: ['rice', 'shallot', 'egg'] },
  { name: 'Soto Kuning', ingredients: ['chicken', 'tofu', 'lime'] },
  { name: 'Rendang Padang', ingredients: ['beef', 'chili', 'shallot'] },
  { name: 'Bakmi Jawa', ingredients: ['noodles', 'egg', 'shallot'] },
];

export function getIngredient(id) { return INGREDIENTS.find((item) => item.id === id); }
export function matchesRecipe(plate, recipe) {
  return plate.length === recipe.ingredients.length && recipe.ingredients.every((id) => plate.includes(id));
}
