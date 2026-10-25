export const choose = (items, random) => items[Math.min(items.length - 1, Math.floor(random() * items.length))];
export function weighted(items, random, weight = x => x.weight) {
  const total = items.reduce((sum, item) => sum + weight(item), 0);
  let roll = random() * total;
  for (const item of items) { roll -= weight(item); if (roll < 0) return item; }
  return items.at(-1);
}
export function repetitionWeight(expression, history) {
  const replies = history.filter(x => x.role === 'assistant').slice(-5).reverse();
  const distance = replies.findIndex(x => x.familyIds?.includes(expression.familyId) || x.expressionIds?.includes(expression.id));
  return distance < 0 ? 1 : distance === 0 ? .05 : distance < 3 ? .25 : .60;
}
export function choices(random) {
  return {tone: choose(['ironic','strict','sarcastic'], random), library: random() < .5 ? 'common' : 'odessa', tier: random() < .7 ? 'core' : 'extended', length: weighted([{n:1,weight:.4},{n:2,weight:.4},{n:3,weight:.2}],random).n};
}
