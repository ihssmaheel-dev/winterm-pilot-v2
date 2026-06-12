import type { ColorScheme } from '@/types'

function scheme(partial: Omit<ColorScheme, 'brightBlack' | 'brightRed' | 'brightGreen' | 'brightYellow' | 'brightBlue' | 'brightPurple' | 'brightCyan' | 'brightWhite'> & { bright?: Partial<Pick<ColorScheme, 'brightBlack' | 'brightRed' | 'brightGreen' | 'brightYellow' | 'brightBlue' | 'brightPurple' | 'brightCyan' | 'brightWhite'>> }): ColorScheme {
  const b = partial.bright || {}
  return {
    ...partial,
    brightBlack: b.brightBlack ?? partial.black,
    brightRed: b.brightRed ?? partial.red,
    brightGreen: b.brightGreen ?? partial.green,
    brightYellow: b.brightYellow ?? partial.yellow,
    brightBlue: b.brightBlue ?? partial.blue,
    brightPurple: b.brightPurple ?? partial.purple,
    brightCyan: b.brightCyan ?? partial.cyan,
    brightWhite: b.brightWhite ?? partial.white,
  }
}

export const COLOR_SCHEMES: ColorScheme[] = [
  scheme({
    name: 'Campbell', background: '#0C0C0C', foreground: '#CCCCCC', cursorColor: '#CCCCCC', selectionBackground: '#FFFFFF',
    black: '#0C0C0C', red: '#C50F1F', green: '#13A10E', yellow: '#C19C00', blue: '#0037DA', purple: '#881798', cyan: '#3A96DD', white: '#CCCCCC',
    bright: { brightBlack: '#767676', brightRed: '#E74856', brightGreen: '#16C60C', brightYellow: '#F9F1A5', brightBlue: '#3B78FF', brightPurple: '#B4009E', brightCyan: '#61D6D6', brightWhite: '#F2F2F2' },
  }),
  scheme({
    name: 'Dark+', background: '#1E1E1E', foreground: '#D4D4D4', cursorColor: '#D4D4D4', selectionBackground: '#264F78',
    black: '#000000', red: '#CD3131', green: '#0DBC79', yellow: '#E5E510', blue: '#2472C8', purple: '#BC3FBC', cyan: '#11A8CD', white: '#E5E5E5',
    bright: { brightBlack: '#666666', brightRed: '#F14C4C', brightGreen: '#23D18B', brightYellow: '#F5F543', brightBlue: '#3B8EEA', brightPurple: '#D670D6', brightCyan: '#29B8DB', brightWhite: '#FFFFFF' },
  }),
  scheme({
    name: 'One Half Dark', background: '#282C34', foreground: '#DCDFE4', cursorColor: '#DCDFE4', selectionBackground: '#3E4452',
    black: '#282C34', red: '#E06C75', green: '#98C379', yellow: '#E5C07B', blue: '#61AFEF', purple: '#C678DD', cyan: '#56B6C2', white: '#DCDFE4',
    bright: { brightWhite: '#FFFFFF' },
  }),
  scheme({
    name: 'Solarized Dark', background: '#002B36', foreground: '#839496', cursorColor: '#D33682', selectionBackground: '#073642',
    black: '#073642', red: '#DC322F', green: '#859900', yellow: '#B58900', blue: '#268BD2', purple: '#D33682', cyan: '#2AA198', white: '#EEE8D5',
    bright: { brightBlack: '#586E75', brightRed: '#CB4B16', brightWhite: '#FDF6E3' },
  }),
  scheme({
    name: 'Solarized Light', background: '#FDF6E3', foreground: '#657B83', cursorColor: '#657B83', selectionBackground: '#EEE8D5',
    black: '#073642', red: '#DC322F', green: '#859900', yellow: '#B58900', blue: '#268BD2', purple: '#D33682', cyan: '#2AA198', white: '#EEE8D5',
    bright: { brightBlack: '#586E75', brightRed: '#CB4B16', brightWhite: '#FDF6E3' },
  }),
  scheme({
    name: 'Tango Dark', background: '#2E3436', foreground: '#D3D7CF', cursorColor: '#D3D7CF', selectionBackground: '#3465A4',
    black: '#2E3436', red: '#CC0000', green: '#4E9A06', yellow: '#C4A000', blue: '#3465A4', purple: '#75507B', cyan: '#06989A', white: '#D3D7CF',
    bright: { brightBlack: '#555753', brightRed: '#EF2929', brightGreen: '#8AE234', brightYellow: '#FCE94F', brightBlue: '#729FCF', brightPurple: '#AD7FA8', brightCyan: '#34E2E2', brightWhite: '#EEEEEC' },
  }),
  scheme({
    name: 'Ubuntu-ColorScheme', background: '#300A24', foreground: '#EEEEEC', cursorColor: '#EEEEEC', selectionBackground: '#490A34',
    black: '#2E3436', red: '#CC0000', green: '#4E9A06', yellow: '#C4A000', blue: '#3465A4', purple: '#75507B', cyan: '#06989A', white: '#D3D7CF',
    bright: { brightBlack: '#555753', brightRed: '#EF2929', brightGreen: '#8AE234', brightYellow: '#FCE94F', brightBlue: '#729FCF', brightPurple: '#AD7FA8', brightCyan: '#34E2E2', brightWhite: '#FFFFFF' },
  }),
  scheme({
    name: 'Vintage', background: '#000000', foreground: '#00FF00', cursorColor: '#00FF00', selectionBackground: '#003300',
    black: '#000000', red: '#AA0000', green: '#00FF00', yellow: '#AAAA00', blue: '#0000AA', purple: '#AA00AA', cyan: '#00AAAA', white: '#AAAAAA',
    bright: { brightBlack: '#555555', brightRed: '#FF5555', brightGreen: '#55FF55', brightYellow: '#FFFF55', brightBlue: '#5555FF', brightPurple: '#FF55FF', brightCyan: '#55FFFF', brightWhite: '#FFFFFF' },
  }),
  scheme({
    name: 'CGA', background: '#000000', foreground: '#AAAAAA', cursorColor: '#AAAAAA', selectionBackground: '#555555',
    black: '#000000', red: '#FF5555', green: '#55FF55', yellow: '#FFFF55', blue: '#5555FF', purple: '#FF55FF', cyan: '#55FFFF', white: '#FFFFFF',
    bright: { brightBlack: '#555555', brightWhite: '#FFFFFF' },
  }),
  scheme({
    name: 'IBM 5153', background: '#000000', foreground: '#FFFFFF', cursorColor: '#FFFFFF', selectionBackground: '#555555',
    black: '#000000', red: '#FF5555', green: '#55FF55', yellow: '#FFFF55', blue: '#5555FF', purple: '#FF55FF', cyan: '#55FFFF', white: '#FFFFFF',
    bright: { brightBlack: '#555555', brightWhite: '#FFFFFF' },
  }),
]

export function getScheme(name: string): ColorScheme | undefined {
  return COLOR_SCHEMES.find(s => s.name === name)
}
