import { cow, draw, get, list, random, combine, frame, banner, type ArtName, type ArtInfo } from 'draw-ascii';

const a: string = cow({ say: 'hi', frame: { style: 'round', title: 'moo' }, color: '#ff8800' });
const b: string = draw('cat', { think: '...', flip: true });
const name: ArtName = 'duck';
const info: ArtInfo | undefined = get(name);
const names: ArtName[] = list('animals');
const c: string = random({ category: 'food', color: 'rainbow' });
const d: string = combine([a, b], { align: 'center' });
const e: string = frame(banner('ok'), 'double');

// @ts-expect-error unknown category
list('nope');
// @ts-expect-error unknown frame style
frame('x', 'wavy');

void [a, b, info, names, c, d, e];
