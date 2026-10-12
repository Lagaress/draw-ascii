# draw-ascii

[![npm](https://img.shields.io/npm/v/draw-ascii.svg)](https://www.npmjs.com/package/draw-ascii)
[![CI](https://github.com/Lagaress/draw-ascii/actions/workflows/ci.yml/badge.svg)](https://github.com/Lagaress/draw-ascii/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/draw-ascii.svg)](LICENSE)

[🖼 Gallery](GALLERY.md) ·
[🐞 Report Bug](https://github.com/Lagaress/draw-ascii/issues/new?template=bug-report.md) ·
[🍩 Request Feature](https://github.com/Lagaress/draw-ascii/issues/new?template=feature-request.md)

Hundreds of ASCII drawings for your terminal, CLI tools, logs and READMEs, with speech bubbles,
frames, colors, big banner text and a command line tool. Zero dependencies, works in Node and in the
browser, ships with TypeScript types and both ESM and CommonJS builds.

```text
 _______________________
< draw-ascii v2 is here >
 -----------------------
    \   ^__^
     \  (oo)\_______
        (__)\       )\/\
            ||----w |
            ||     ||
```

## Installation

```bash
npm install draw-ascii
```

Or try it without installing:

```bash
npx draw-ascii cow --say "Hello!"
```

## Quick start

```js
import { cow, draw, random } from 'draw-ascii';
// or: const { cow, draw, random } = require('draw-ascii');

console.log(cow());                                  // the plain drawing
console.log(cow({ say: 'Moo!' }));                   // with a speech bubble
console.log(draw('cat', { think: 'hmm...', frame: 'round' }));
console.log(random({ category: 'animals', color: 'rainbow' }));
```

Every drawing is a named export that returns a string. Browse them all in the **[gallery](GALLERY.md)**,
or from the terminal with `npx draw-ascii --list`.

## API

### Drawing

| Function | Description |
| --- | --- |
| `draw(name, options?)` | Returns a drawing by name. Unknown names throw an error with a "did you mean" hint. |
| `<name>(options?)` | Shortcut for every drawing: `cow(options)` is `draw('cow', options)`. |
| `random(options?)` | A random drawing. Accepts `category` and `tag` filters plus every draw option. |

**Options** (applied in this order):

| Option | Type | Description |
| --- | --- | --- |
| `flip` | `boolean` | Mirror horizontally. Direction-sensitive characters like `/`, `(`, `<` are swapped. |
| `say` | `string` | Speech bubble above the drawing. |
| `think` | `string` | Thought bubble above the drawing. |
| `width` | `number` | Line width inside bubbles. Defaults to `40`. |
| `frame` | `boolean \| style \| { style, padding, title }` | Border around everything. |
| `color` | `string` | ANSI color: `red`, `green`, `brightBlue`..., `rainbow` or a hex code like `#ff8800`. |

### Catalog

| Function | Description |
| --- | --- |
| `list(category?)` | Names of every drawing, optionally from one category. |
| `categories` | Every category name. |
| `search(query)` | Drawings whose name, category or tags match, best matches first. |
| `get(name)` | `{ name, category, tags, artist, art, width, height }`, or `undefined`. |

```js
search('halloween').map((item) => item.name); // ['bat', 'spider', 'ghost', 'coffin', ...]
```

### Transformations

These work on **any** string, including your own art, and can be chained:

| Function | Description |
| --- | --- |
| `say(art, text, { width })` | Speech bubble. |
| `think(art, text, { width })` | Thought bubble. |
| `flip(art)` | Horizontal mirror. |
| `frame(art, { style, padding, title })` | Border. Styles: `ascii`, `single`, `double`, `round`, `bold`, `stars`, `hash`. |
| `combine(arts, { gap, align })` | Side by side, aligned `top`, `center` or `bottom` (default). |
| `center(art, width?)` | Centers in the given width, or the terminal width. |
| `scale(art, factor)` | Makes it bigger by repeating characters and lines. |
| `color(art, color)` | ANSI colors (see above). |
| `banner(text, { char, gap })` | Big 5-line block letters. |
| `stripAnsi(text)` | Removes ANSI color codes. |

```js
import { combine, frame, banner, cat, dog, duck } from 'draw-ascii';

console.log(frame(combine([cat(), dog(), duck()]), { style: 'round', title: 'friends' }));
console.log(banner('Hi!'));
```

```text
#   # ### #
#   #  #  #
#####  #  #
#   #  #
#   # ### #
```

## Command line

```bash
draw-ascii cow --say "Hello!"              # speech bubble
draw-ascii cat --think "..." --frame round # thought bubble inside a border
draw-ascii cat dog duck                    # several drawings side by side
draw-ascii --random --category food        # something random
draw-ascii --banner "Deploy OK" --color green
git log -1 --format=%s | draw-ascii cow --say -   # read the text from stdin

draw-ascii --list            # every name
draw-ascii --categories      # categories with counts
draw-ascii --search space    # search names, categories and tags
draw-ascii --info bee        # metadata for one drawing
draw-ascii --help            # all options
```

Colors are disabled when the `NO_COLOR` environment variable is set.

## Upgrading from 1.x

- Drawings no longer start with a blank line or end with stray spaces, so `cow()` returns exactly the
  drawing. If you relied on that extra newline, add it yourself.
- Several 1.x drawings lost backslashes because of escaping bugs (bat, bear, zebra, clock and more)
  and `sofa()` threw an error. They are all fixed.
- Every 1.x name still exists and is still a function, so `cow()` keeps working.

## Contributing

New drawings are very welcome, and you don't have to write any JavaScript:

1. Create `art/<category>/<name>.txt` (lowercase letters and numbers only):

   ```text
   ---
   tags: cute, pet
   artist: your-name
   ---
   (\(\
   ( -.-)
   o_(")(")
   ```

   Paste the drawing as-is: no escaping needed. Printable ASCII only, up to 60 columns and 25 lines.
2. Run `npm run build` to regenerate `lib/` and `GALLERY.md`, then `npm test`.
3. Open a pull request.

Only submit drawings you made yourself or that you are allowed to share, and keep the original
artist's signature and credit.

## Credits

The original 1.x drawings come from [ascii.co.uk](https://www.ascii.co.uk/) and keep their artists'
signatures (jgs, mrf, ldb, DcaU and others). The drawings added in 2.0 are original work made for this
library.

## Author

**Jesús Lagares** · [@Lagaress](https://github.com/Lagaress) · jesuslagaresgalan@gmail.com

## License

[MIT](LICENSE)
