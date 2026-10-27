/* LOOK family — AVN Family's pixel world, with Dora living in it.
   Clock face: 5x7 pixel digits, each pixel a bevelled block so the readout has depth.
   Meter: a hundred pixels, one per percent, grouped in fives like a ruler.
   Dora sits beside the clock: asleep while every quota is healthy, awake and ears-up the moment one
   drops under 25% (driven by data-low on <html>, which the app sets). She is the warning you
   notice from across the room. */
(function () {
  var FONT = {
    '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
    '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
    '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
    '3': ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
    '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
    '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
    '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
    '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
    '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
    '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100']
  };

  function digit(ch) {
    var rows = FONT[ch] || FONT['0'], h = '<span class="pd">';
    for (var r = 0; r < 7; r++) for (var c = 0; c < 5; c++) h += '<i' + (rows[r].charAt(c) === '1' ? ' class="on"' : '') + '></i>';
    return h + '</span>';
  }

  /* Dora: one body, two heads. CSS shows the sleeping head or the awake one. */
  function px(cells, cls) {
    var h = cls ? '<g class="' + cls + '">' : '<g>';
    cells.forEach(function (c) {
      h += '<rect x="' + c[0] + '" y="' + c[1] + '" width="' + (c[2] || 1) + '" height="' + (c[3] || 1) + '" fill="' + (c[4] || '#161210') + '"/>';
    });
    return h + '</g>';
  }
  function grid(rows, x0, y0, fill) {
    var cells = [];
    rows.forEach(function (row, r) {
      for (var c = 0; c < row.length; c++) if (row.charAt(c) === '#') cells.push([x0 + c, y0 + r, 1, 1, fill]);
    });
    return cells;
  }

  // a narrow head over a wider body, with a neck between them, so she reads as a cat and not a blob
  var HEAD = ['#......#', '##....##', '########', '########', '########', '.######.'];
  var BODY = ['..######..', '.########.', '.########.', '##########', '##########', '##########'];
  var TAIL = ['##', '.#', '##'];

  function dora() {
    var ink = '#efe6d5', dark = '#1c1713';
    var c = [].concat(
      grid(HEAD, 3, 0, ink),
      grid(BODY, 2, 6, ink),
      grid(TAIL, 12, 8, ink)
    );
    return '<svg class="dora" viewBox="0 0 15 12" shape-rendering="crispEdges" aria-hidden="true">' +
      px(c) +
      // asleep: two closed eyes and a drifting z
      px([[5, 3, 2, 1, dark], [8, 3, 2, 1, dark]], 'zzz') +
      px([[13, 0, 1, 1, '#8f826e'], [14, 2, 1, 1, '#8f826e']], 'zzz zpf') +
      // awake: round eyes, pupils blown, ears already up
      px([[5, 2, 2, 2, dark], [8, 2, 2, 2, dark], [6, 2, 1, 1, ink], [9, 2, 1, 1, ink]], 'wake') +
      '</svg>';
  }

  function place() {
    var s = document.getElementById('scene');
    if (s) s.innerHTML = dora();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', place);
  else place();

  window.LOOK = {
    clock: function (hh, mm) {
      return digit(hh.charAt(0)) + digit(hh.charAt(1)) +
        '<span class="pc"><i></i><i></i></span>' +
        digit(mm.charAt(0)) + digit(mm.charAt(1));
    },
    meter: function (c) {
      var dots = '';
      for (var i = 0; i < 100; i++) dots += '<i' + (i < c.p ? ' class="on" style="background:' + c.tone + '"' : '') + '></i>';
      return '<span class="hd"><span class="ic">' + c.icon + '</span><span class="hl">' + c.label + '</span><b>' + c.p + '%</b></span>' +
             '<span class="q">' + dots + '</span>';
    }
  };
})();
