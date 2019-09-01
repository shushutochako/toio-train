const _melodies = {
  haru: [
    { durationMs: 2285, noteName: 127 },
    { durationMs: 285, noteName: 79 },
    { durationMs: 285, noteName: 84 },
    { durationMs: 285, noteName: 88 },
    { durationMs: 285, noteName: 79 },
    { durationMs: 285, noteName: 83 },
    { durationMs: 285, noteName: 86 },
    { durationMs: 285, noteName: 77 },
    { durationMs: 285, noteName: 81 },
    { durationMs: 285, noteName: 84 },
    { durationMs: 285, noteName: 81 },
    { durationMs: 285, noteName: 83 },
    { durationMs: 285, noteName: 79 },
    { durationMs: 285, noteName: 79 },
    { durationMs: 285, noteName: 84 },
    { durationMs: 285, noteName: 88 },
    { durationMs: 285, noteName: 79 },
    { durationMs: 285, noteName: 83 },
    { durationMs: 285, noteName: 86 },
    { durationMs: 285, noteName: 76 },
    { durationMs: 285, noteName: 81 },
    { durationMs: 285, noteName: 84 },
    { durationMs: 285, noteName: 81 },
    { durationMs: 285, noteName: 83 },
    { durationMs: 285, noteName: 86 },
    { durationMs: 57, noteName: 72 },
    { durationMs: 57, noteName: 76 },
    { durationMs: 114, noteName: 79 },
  ]
}

export type Operation = {
  durationMs: number,
  noteName: number
};

enum Melody {
  Haru
}

namespace Melody {

  function getKey(melody: Melody): string {
    switch (melody) {
      case Melody.Haru:
        return 'haru';
    }
  }

  export function operations(melody: Melody): Array<Operation> {
    return _melodies[getKey(melody)];
  }

  export function numberOfOperations(melody: Melody): number {
    return operations(melody).length;
  }

  export function playTimeMillisec(melody: Melody): number {
    return operations(melody).reduce((p, x) => p + x.durationMs, 0);
  }
}

export {
  Melody
}