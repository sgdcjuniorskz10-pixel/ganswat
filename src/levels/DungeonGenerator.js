export class DungeonGenerator {
  constructor(cols, rows) {
    this.cols = cols;
    this.rows = rows;
  }

  generate({ rooms = 16, minRoom = 4, maxRoom = 9, corridorWidth = 2, padding = 2 } = {}) {
    const { cols, rows } = this;

    // 1 = wall, 0 = floor
    const grid = Array.from({ length: rows }, () => new Array(cols).fill(1));
    const placed = [];

    let attempts = 0;
    while (placed.length < rooms && attempts < 600) {
      attempts++;
      const w = randInt(minRoom, maxRoom);
      const h = randInt(minRoom, maxRoom);
      const x = randInt(1, cols - w - 2);
      const y = randInt(1, rows - h - 2);

      // padding tiles of wall between rooms
      const overlaps = placed.some((r) => (
        x < r.x + r.w + padding &&
        r.x < x + w + padding &&
        y < r.y + r.h + padding &&
        r.y < y + h + padding
      ));
      if (overlaps) continue;

      placed.push({ x, y, w, h });
      carveRect(grid, x, y, w, h);
    }

    // connect each room to the previous one (chain)
    for (let i = 1; i < placed.length; i++) {
      connect(grid, placed[i - 1], placed[i], rows, cols, corridorWidth);
    }

    const roomsInfo = placed.map((r) => ({
      ...r,
      centerX: r.x + Math.floor(r.w / 2),
      centerY: r.y + Math.floor(r.h / 2),
    }));

    this._grid = grid;

    return {
      grid,
      cols,
      rows,
      rooms: roomsInfo,
      roomCount: roomsInfo.length,
    };
  }

  /** Returns merged wall rectangles in world coords (tile units). */
  wallRects() {
    const rects = [];
    for (let y = 0; y < this.rows; y++) {
      let start = -1;
      for (let x = 0; x <= this.cols; x++) {
        const isWall = x < this.cols && this.grid[y][x] === 1;
        if (isWall && start === -1) {
          start = x;
        } else if (!isWall && start !== -1) {
          rects.push({ x: start, y, w: x - start, h: 1 });
          start = -1;
        }
      }
    }
    return rects;
  }

  get grid() {
    return this._grid;
  }

  set grid(g) {
    this._grid = g;
  }
}

function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function carveRect(grid, x, y, w, h) {
  for (let j = y; j < y + h; j++) {
    for (let i = x; i < x + w; i++) {
      grid[j][i] = 0;
    }
  }
}

function carveH(grid, x1, x2, y, rows, width) {
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  for (let yy = y; yy < y + width; yy++) {
    if (yy < 0 || yy >= rows) continue;
    for (let x = minX; x <= maxX; x++) grid[yy][x] = 0;
  }
}

function carveV(grid, y1, y2, x, cols, width) {
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  for (let xx = x; xx < x + width; xx++) {
    if (xx < 0 || xx >= cols) continue;
    for (let y = minY; y <= maxY; y++) grid[y][xx] = 0;
  }
}

function connect(grid, a, b, rows, cols, width) {
  const ax = a.x + Math.floor(a.w / 2);
  const ay = a.y + Math.floor(a.h / 2);
  const bx = b.x + Math.floor(b.w / 2);
  const by = b.y + Math.floor(b.h / 2);

  // offset the corridor band so it stays inside the map bounds
  const half = Math.floor(width / 2);
  const cax = ax - half;
  const cay = ay - half;
  const cbx = bx - half;
  const cby = by - half;

  if (Math.random() < 0.5) {
    carveH(grid, cax, cbx, cay, rows, width);
    carveV(grid, cay, cby, cbx, cols, width);
  } else {
    carveV(grid, cay, cby, cax, cols, width);
    carveH(grid, cax, cbx, cby, rows, width);
  }
}
