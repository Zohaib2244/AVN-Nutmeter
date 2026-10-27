/* LOOK pocket — "backlit handheld LCD".
   Clock face: a seven-segment display. Unlit segments stay faintly visible (the ghost you see on a
   real LCD), so the panel reads as hardware rather than text.
   Meter: a ten-cell energy bar. The NUMBER OF LIT CELLS is the low-quota cue, not their colour. */
(function () {
  var SEG = { '0': 'abcdef', '1': 'bc', '2': 'abged', '3': 'abgcd', '4': 'fgbc', '5': 'afgcd',
              '6': 'afgecd', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg' };
  var CELLS = 10;

  function digit(ch) {
    var on = SEG[ch] || '', h = '<span class="sv">';
    'abcdefg'.split('').forEach(function (s) {
      h += '<i class="s' + (s === 'd' ? 'dn' : s) + (on.indexOf(s) >= 0 ? ' on' : '') + '"></i>';
    });
    return h + '</span>';
  }

  window.LOOK = {
    clock: function (hh, mm) {
      return digit(hh.charAt(0)) + digit(hh.charAt(1)) +
        '<span class="svc"><i></i><i></i></span>' +
        digit(mm.charAt(0)) + digit(mm.charAt(1));
    },
    meter: function (c) {
      var lit = c.p <= 0 ? 0 : Math.max(1, Math.floor(c.p / (100 / CELLS))), bar = '';
      for (var i = 0; i < CELLS; i++) bar += '<i' + (i < lit ? ' class="on" style="background:' + c.tone + '"' : '') + '></i>';
      return '<span class="hd"><span class="ic">' + c.icon + '</span><span class="hl">' + c.label + '</span><b>' + c.p + '%</b></span>' +
             '<span class="cells">' + bar + '</span>';
    }
  };
})();
