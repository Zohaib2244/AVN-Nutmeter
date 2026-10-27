/* LOOK lofi — "a desk clock radio standing in a lofi room".
   Meter: a tuning dial per account — ticks across a scale, a needle parked at the quota. The low
   quarter of every scale carries denser ticks, so the needle's POSITION is the warning.
   Scene: the room plate, a breathing lamp, and dust drifting through the lamplight. The whole room
   also creeps very slowly, which doubles as burn-in protection on an always-on screen.

   Clock faces are swappable: ?face=flip|vfd|nixie|type (remembered on the device).
   There is no tick scale on any face — the tuning scales belong to the meters, and repeating them
   under the clock made the whole screen read as one striped texture. */
(function () {
  var MOTES = 14;

  function pref(k, d) {
    var q = new URLSearchParams(location.search);
    try {
      if (q.has(k)) localStorage.setItem('nutmeter.' + k, q.get(k));
      return localStorage.getItem('nutmeter.' + k) || d;
    } catch (e) { return q.get(k) || d; }
  }

  /* ---- clock faces ------------------------------------------------------- */
  var prev = {};

  // split-flap: four printed cards, each one flapping down as its digit turns over
  function flip(hh, mm) {
    var s = hh + mm, out = '';
    for (var i = 0; i < 4; i++) {
      if (i === 2) out += '<span class="fcc"><i></i><i></i></span>';
      var ch = s.charAt(i), f = prev[i] !== undefined && prev[i] !== ch ? ' flip' : '';
      prev[i] = ch;
      out += '<span class="fcd' + f + '">' + ch + '</span>';
    }
    return out;
  }

  // vacuum fluorescent: seven segments, the unlit ones left as faint ghosts
  var SEG = { '0': 'abcdef', '1': 'bc', '2': 'abged', '3': 'abgcd', '4': 'fgbc', '5': 'afgcd',
              '6': 'afgecd', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg' };
  function vfd(hh, mm) {
    function d(ch) {
      var on = SEG[ch] || '', h = '<span class="sv">';
      'abcdefg'.split('').forEach(function (s) {
        h += '<i class="s' + (s === 'd' ? 'dn' : s) + (on.indexOf(s) >= 0 ? ' on' : '') + '"></i>';
      });
      return h + '</span>';
    }
    return d(hh.charAt(0)) + d(hh.charAt(1)) + '<span class="svc"><i></i><i></i></span>' +
           d(mm.charAt(0)) + d(mm.charAt(1));
  }

  // nixie: each numeral glowing inside its own glass tube, with the unlit cathodes behind it
  function nixie(hh, mm) {
    function t(ch) {
      return '<span class="tube"><i class="ghost">8</i><span class="lit">' + ch + '</span></span>';
    }
    return t(hh.charAt(0)) + t(hh.charAt(1)) + '<span class="tbc"><i></i><i></i></span>' +
           t(mm.charAt(0)) + t(mm.charAt(1));
  }

  // typographic: no hardware at all, just quiet light on the glass
  function type(hh, mm) {
    return '<span class="dg">' + hh + '</span><span class="cln">:</span><span class="dg">' + mm + '</span>';
  }

  var FACES = { flip: flip, vfd: vfd, nixie: nixie, type: type };
  var FACE = pref('face', 'flip');
  if (!FACES[FACE]) FACE = 'flip';
  document.documentElement.dataset.face = FACE;

  /* ---- the room ---------------------------------------------------------- */
  function scene() {
    var h = '<div class="room still"></div><div class="veil"></div><div class="glow"></div>';
    for (var i = 0; i < MOTES; i++) {
      h += '<i class="mote" style="left:' + (3 + Math.random() * 25).toFixed(1) + '%;' +
           'top:' + (42 + Math.random() * 42).toFixed(1) + '%;' +
           '--d:' + (26 + Math.random() * 28).toFixed(1) + 's;' +
           '--dl:' + (Math.random() * -50).toFixed(1) + 's;' +
           '--s:' + (0.2 + Math.random() * 0.3).toFixed(2) + 'cqw"></i>';
    }
    return h + '<div class="cab"></div>';
  }

  /* Optional: drop a seamless loop at looks/art/room.webm and it takes over from the still plate.
     If the file isn't there the video errors out and removes itself, leaving the still. */
  function tryClip(host) {
    var v = document.createElement('video');
    v.className = 'room vid';
    v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('loop', '');
    v.onerror = function () { v.remove(); };
    v.oncanplay = function () { host.classList.add('has-vid'); v.play().catch(function () {}); };
    v.src = '/looks/art/room.webm';
    host.insertBefore(v, host.querySelector('.veil'));
  }

  function place() {
    var s = document.getElementById('scene');
    if (!s) return;
    s.innerHTML = scene();
    tryClip(s);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', place);
  else place();

  window.LOOK = {
    clock: function (hh, mm) { return FACES[FACE](hh, mm); },
    meter: function (c) {
      return '<span class="hd"><span class="ic">' + c.icon + '</span><span class="hl">' + c.label + '</span>' +
             '<b>' + c.p + '%</b></span>' +
             '<span class="scale"><i class="tk"></i><i class="lz"></i><i class="base"></i>' +
             '<i class="nd" style="left:' + c.p + '%;background:' + c.tone + ';box-shadow:0 0 .6cqw ' + c.tone + '"></i></span>';
    }
  };
})();
