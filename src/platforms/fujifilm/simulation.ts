import { parseFujifilmMakerNote } from './server';

const TAG_ID_SATURATION = 0x1003;
const TAG_ID_FILM_MODE  = 0x1401;

type FujifilmSimulationFromSaturation =
  | 'monochrome'
  | 'monochrome-ye'
  | 'monochrome-r'
  | 'monochrome-g'
  | 'sepia'
  | 'acros'
  | 'acros-ye'
  | 'acros-r'
  | 'acros-g';

type FujifilmMode =
  | 'provia'
  | 'portrait'
  | 'portrait-saturation'
  | 'astia'
  | 'portrait-sharpness'
  | 'portrait-ex'
  | 'velvia'
  | 'pro-neg-std'
  | 'pro-neg-hi'
  | 'classic-chrome'
  | 'eterna'
  | 'classic-neg'
  | 'eterna-bleach-bypass'
  | 'nostalgic-neg'
  | 'reala';

export type FujifilmSimulation =
  | FujifilmSimulationFromSaturation
  | FujifilmMode;

const getFujifilmSimulationFromSaturation = (
  value?: number,
): FujifilmSimulationFromSaturation | undefined => {
  switch (value) {
    case 0x300: return 'monochrome';
    case 0x301: return 'monochrome-r';
    case 0x302: return 'monochrome-ye';
    case 0x303: return 'monochrome-g';
    case 0x310: return 'sepia';
    case 0x500: return 'acros';
    case 0x501: return 'acros-r';
    case 0x502: return 'acros-ye';
    case 0x503: return 'acros-g';
  }
};

const getFujifilmMode = (
  value?: number,
): FujifilmMode | undefined => {
  switch (value) {
    case 0x000: return 'provia';
    case 0x100: return 'portrait';
    case 0x110: return 'portrait-saturation';
    case 0x120: return 'astia';
    case 0x130: return 'portrait-sharpness';
    case 0x300: return 'portrait-ex';
    case 0x200:
    case 0x400: return 'velvia';
    case 0x500: return 'pro-neg-std';
    case 0x501: return 'pro-neg-hi';
    case 0x600: return 'classic-chrome';
    case 0x700: return 'eterna';
    case 0x800: return 'classic-neg';
    case 0x900: return 'eterna-bleach-bypass';
    case 0xa00: return 'nostalgic-neg';
    case 0xb00: return 'reala';
  }
};

const FUJIFILM_SIMULATION_LABELS: Record<FujifilmSimulation, string> = {
  'monochrome':            'Monochrome',
  'monochrome-ye':         'Monochrome + Yellow Filter',
  'monochrome-r':          'Monochrome + Red Filter',
  'monochrome-g':          'Monochrome + Green Filter',
  'sepia':                 'Sepia',
  'acros':                 'ACROS',
  'acros-ye':              'ACROS + Yellow Filter',
  'acros-r':               'ACROS + Red Filter',
  'acros-g':               'ACROS + Green Filter',
  'provia':                'PROVIA / Standard',
  'portrait':              'Studio Portrait',
  'portrait-saturation':   'Studio Portrait + Enhanced Saturation',
  'astia':                 'ASTIA / Soft',
  'portrait-sharpness':    'Studio Portrait + Enhanced Sharpness',
  'portrait-ex':           'Studio Portrait + Ex',
  'velvia':                'Velvia / Vivid',
  'pro-neg-std':           'PRO Neg. Std',
  'pro-neg-hi':            'PRO Neg. Hi',
  'classic-chrome':        'Classic Chrome',
  'eterna':                'ETERNA / Cinema',
  'classic-neg':           'Classic Neg.',
  'eterna-bleach-bypass':  'ETERNA Bleach Bypass',
  'nostalgic-neg':         'Nostalgic Neg.',
  'reala':                 'REALA ACE',
};

export const labelForFujifilmSimulation = (film: FujifilmSimulation): string =>
  FUJIFILM_SIMULATION_LABELS[film] ?? film;

/**
 * Read Fujifilm film simulation from a raw MakerNote buffer.
 * Saturation tag takes priority — it distinguishes B&W/Acros modes
 * that would otherwise share the same FilmMode value.
 */
export const getFujifilmSimulationFromMakerNote = (
  bytes: Buffer,
): FujifilmSimulation | undefined => {
  let filmModeFromSaturation: FujifilmSimulationFromSaturation | undefined;
  let filmMode: FujifilmMode | undefined;

  parseFujifilmMakerNote(bytes, (tag, numbers) => {
    switch (tag) {
      case TAG_ID_SATURATION:
        filmModeFromSaturation = getFujifilmSimulationFromSaturation(numbers[0]);
        break;
      case TAG_ID_FILM_MODE:
        filmMode = getFujifilmMode(numbers[0]);
        break;
    }
  });

  return filmModeFromSaturation ?? filmMode;
};
