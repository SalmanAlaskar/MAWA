import { Icon } from './Icon';

/**
 * Abstract placeholder tile standing in for a property photo — there are no
 * real photos (this is fictional seed data; the approved mockup itself only
 * ever used a plain icon-in-a-box here). Deterministic per `seed` (e.g. a
 * listing id) so the same listing always renders the same tile rather than
 * reshuffling on every request.
 */
const VARIANTS = [
  'from-accent-tint to-accent/25 text-accent-strong',
  'from-success-tint to-success/25 text-success',
  'from-warning-tint to-warning/25 text-warning',
  'from-neutral-tint to-clay/20 text-clay',
];

function variantFor(seed: string) {
  const hash = seed.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return VARIANTS[hash % VARIANTS.length];
}

export function PropertyImage({ seed, className = '' }: { seed: string; className?: string }) {
  const [gradient, textColor] = splitVariant(variantFor(seed));
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} ${className}`}>
      <Icon
        name="building"
        className={`absolute -bottom-2 -end-2 h-[85%] w-[85%] ${textColor} opacity-25`}
      />
      <Icon name="building" className={`relative h-full w-full p-[28%] ${textColor} opacity-70`} />
    </div>
  );
}

function splitVariant(variant: string): [string, string] {
  const parts = variant.split(' ');
  return [parts.slice(0, 2).join(' '), parts[2]];
}
