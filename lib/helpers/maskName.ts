// lib/helpers/maskName.ts

export function maskName(name: string) {
  const [first, ...rest] = name.split(' ');
  return `${first[0]}. ${rest.join(' ')}`;
}
