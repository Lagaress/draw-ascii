# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2026-10-12

### Added
- 427 drawings in total (up from 56), across new categories: vehicles, space, tech, nature, places, fantasy, holidays, people, symbols, sports and music.
- `draw(name, options)` with `say`, `think`, `flip`, `frame` and `color` options. Every named export
  (`cow()`, `cat()`...) accepts the same options.
- Speech and thought bubbles with word wrapping (`say`, `think`).
- Borders in seven styles with optional titles (`frame`).
- ANSI colors, hex colors and a rainbow mode (`color`).
- Side-by-side layouts (`combine`), `center`, `scale` and `flip`.
- Big block letters (`banner`).
- Catalog helpers: `list`, `categories`, `search`, `get` and `random`.
- A `draw-ascii` command line tool (`npx draw-ascii cow --say hi`).
- TypeScript declarations, including a union type of every drawing name.
- Native ES module entry point alongside CommonJS.
- `GALLERY.md` with every drawing.
- Tests and continuous integration on Node 18, 20, 22 and 24.

### Changed
- **Breaking:** drawings are returned trimmed, without the leading blank line and trailing spaces.
- **Breaking:** requires Node.js 18.3 or newer.
- Drawings now live as plain text files in `art/`, so contributors can add art without escaping it.

### Fixed
- `sofa()` threw `TypeError: ... is not a function`.
- Backslashes were silently dropped from several drawings (bat, bear, squirrel, tapir, zebra, bucket,
  clock, arrow and others).
- The README example printed the function source instead of the cow.
- Broken and duplicated entries in the README.

## [1.0.2] - 2024-10-07
### Added
- Added new art:
  - Cheese
  - Donut
  - Fish
  - Milk
  - Pear
  - Gun
  - Microphone
  - Pen
  - Towel
  - Typewriter

## [1.0.1] - 2024-09-29
### Changed
- Updated the export structure to allow named imports.

### Fixed
- Fixed broken links in the README.

## [1.0.0] - 2024-09-28
- Initial stable release

[Unreleased]: https://github.com/Lagaress/draw-ascii/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/Lagaress/draw-ascii/compare/v1.0.2...v2.0.0
[1.0.2]: https://github.com/Lagaress/draw-ascii/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/Lagaress/draw-ascii/releases/tag/v1.0.1
[1.0.0]: https://github.com/Lagaress/draw-ascii/releases/tag/v1.0.0
