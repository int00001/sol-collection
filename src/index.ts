const world = 'world';

export default function hello(_world: string): string {
  return `Hello ${_world}! `;
}

console.log(hello(world));
