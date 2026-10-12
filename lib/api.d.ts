import type { ArtName, Category } from './names';

export type FrameStyle = 'ascii' | 'single' | 'double' | 'round' | 'bold' | 'stars' | 'hash';

export type ColorName =
  | 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' | 'gray'
  | 'brightRed' | 'brightGreen' | 'brightYellow' | 'brightBlue' | 'brightMagenta' | 'brightCyan' | 'brightWhite'
  | 'rainbow';

/** A named color, "rainbow", or a hex code such as "#ff8800". */
export type Color = ColorName | `#${string}`;

export interface FrameOptions {
  /** Border style. Defaults to "ascii". */
  style?: FrameStyle;
  /** Spaces between the art and the border. Defaults to 1. */
  padding?: number;
  /** Text embedded in the top border. */
  title?: string;
}

export interface BubbleOptions {
  /** Maximum characters per line inside the bubble. Defaults to 40. */
  width?: number;
}

export interface DrawOptions {
  /** Speech bubble text. */
  say?: string;
  /** Thought bubble text. Ignored when `say` is set. */
  think?: string;
  /** Maximum characters per line inside the bubble. Defaults to 40. */
  width?: number;
  /** Mirror the art horizontally. */
  flip?: boolean;
  /** Draw a border. `true` uses the default ascii style. */
  frame?: boolean | FrameStyle | FrameOptions;
  /** ANSI color for terminals. */
  color?: Color;
}

export interface RandomOptions extends DrawOptions {
  /** Only pick from this category. */
  category?: Category;
  /** Only pick pieces with this tag. */
  tag?: string;
}

export interface CombineOptions {
  /** Spaces between pieces. Defaults to 2. */
  gap?: number;
  /** Vertical alignment. Defaults to "bottom". */
  align?: 'top' | 'center' | 'bottom';
}

export interface BannerOptions {
  /** Character used to draw the letters. Defaults to "#". */
  char?: string;
  /** Spaces between letters. Defaults to 1. */
  gap?: number;
}

export interface ArtInfo {
  name: ArtName;
  category: Category;
  tags: string[];
  /** Signature of the original artist, when known. */
  artist: string | null;
  art: string;
  width: number;
  height: number;
}

/** Returns the art; accepts the same options as `draw`. */
export type ArtFunction = (options?: DrawOptions) => string;

/** Returns a piece by name, optionally transformed. Throws for unknown names. */
export declare function draw(name: ArtName | (string & {}), options?: DrawOptions): string;
/** Metadata for one piece, or undefined if it does not exist. */
export declare function get(name: ArtName | (string & {})): ArtInfo | undefined;
/** Names of every piece, optionally restricted to one category. */
export declare function list(category?: Category): ArtName[];
/** Pieces whose name, category or tags match the query, best matches first. */
export declare function search(query: string): ArtInfo[];
/** A random piece, optionally filtered by category or tag. */
export declare function random(options?: RandomOptions): string;
/** Every category name. */
export declare const categories: readonly Category[];

/** Adds a speech bubble above any art. */
export declare function say(art: string, text: string, options?: BubbleOptions): string;
/** Adds a thought bubble above any art. */
export declare function think(art: string, text: string, options?: BubbleOptions): string;
/** Mirrors art horizontally. */
export declare function flip(art: string): string;
/** Draws a border around any art. */
export declare function frame(art: string, options?: FrameStyle | FrameOptions): string;
/** Places several pieces side by side. */
export declare function combine(arts: string[], options?: CombineOptions): string;
/** Centers art within a width (defaults to the terminal width or 80). */
export declare function center(art: string, width?: number): string;
/** Scales art up by an integer factor. */
export declare function scale(art: string, factor?: number): string;
/** Colors art with ANSI escape codes. */
export declare function color(art: string, color: Color): string;
/** Renders text in big block letters. */
export declare function banner(text: string, options?: BannerOptions): string;
/** Removes ANSI color codes. */
export declare function stripAnsi(text: string): string;
