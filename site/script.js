/* ============================================================
   SCRIPT.JS — Birthday Surprise Website
   Features:
     • Starfield animation
     • Intro "Are you ready?" screen (Yes / No)
     • Slide-based navigation (no page scroll)
     • Keyboard + touch swipe support
     • Toran flowers, Confetti, Cake candles
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────────
   1. STARFIELD
───────────────────────────────────────────── */
(function starfield() {
  const canvas = document.getElementById('stars');
  const ctx    = canvas.getContext('2d');
  let stars = [], w, h;

  function resize() {
    w = canvas.width  = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.floor((w * h) / 8000);
    stars = Array.from({ length: count }, () => ({
      x:     Math.random() * w,
      y:     Math.random() * h,
      r:     Math.random() * 1.4 + 0.3,
      speed: Math.random() * 0.018 + 0.004,
      phase: Math.random() * Math.PI * 2
    }));
  }

  window.addEventListener('resize', resize);
  resize();

  let t = 0;
  (function draw() {
    t += 0.8;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#080716';
    ctx.fillRect(0, 0, w, h);
    stars.forEach(s => {
      const twinkle = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(253,246,233,${twinkle})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  })();
})();

/* ─────────────────────────────────────────────
   2. CONFETTI
───────────────────────────────────────────── */
function burstConfetti(containerId, count = 60) {
  const layer = document.getElementById(containerId);
  if (!layer) return;
  const colors = ['#F5A623', '#FFC857', '#FF6B8B', '#FDF6E9', '#8b5cf6', '#34d399'];
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.left              = Math.random() * 100 + '%';
    p.style.background        = colors[Math.floor(Math.random() * colors.length)];
    p.style.animationDuration = (2.4 + Math.random() * 2.6) + 's';
    p.style.animationDelay    = (Math.random() * 1.4) + 's';
    p.style.width             = (6 + Math.random() * 7) + 'px';
    p.style.height            = (10 + Math.random() * 9) + 'px';
    p.style.borderRadius      = Math.random() > 0.5 ? '50%' : '2px';
    layer.appendChild(p);
    setTimeout(() => p.remove(), 6000);
  }
}

/* ─────────────────────────────────────────────
   3. TORAN FLOWERS
───────────────────────────────────────────── */
function buildToran() {
  const el = document.getElementById('toranFlowers');
  if (!el) return;
  const n = window.innerWidth < 720 ? 9 : 16;
  el.innerHTML = '';
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.style.animationDelay = (Math.random() * 2) + 's';
    el.appendChild(s);
  }
}

/* ─────────────────────────────────────────────
   4. INTRO SCREEN — "Are you ready?"
───────────────────────────────────────────── */
const introScreen = document.getElementById('introScreen');
const slideshow   = document.getElementById('slideshow');
const yesBtn      = document.getElementById('yesBtn');
const noBtn       = document.getElementById('noBtn');
const noMsg       = document.getElementById('noMsg');

const noLines = [
  "Nice try! We both know you meant YES 😄",
  "Come on Papa… the party's already started 🎊",
  "Okay okay, here we go! 🥰"
];
let noPresses = 0;

noBtn.addEventListener('click', () => {
  noPresses++;
  noMsg.textContent = noLines[Math.min(noPresses - 1, noLines.length - 1)];

  // Jiggle the no button
  noBtn.classList.remove('shake');
  void noBtn.offsetWidth;          // reflow to restart animation
  noBtn.classList.add('shake');

  // After third press (or second press message), auto-launch
  if (noPresses >= 2) {
    setTimeout(launchSurprise, 1600);
  }
});

yesBtn.addEventListener('click', () => {
  yesBtn.querySelector('.btn-text').textContent = 'Here we go! 🎊';
  yesBtn.style.transform = 'scale(1.08)';
  setTimeout(launchSurprise, 750);
});

function launchSurprise() {
  introScreen.classList.add('fade-out');
  setTimeout(() => {
    introScreen.style.display = 'none';
    slideshow.classList.remove('hidden');
    buildToran();
    burstConfetti('confettiLayer', 65);
    setInterval(() => burstConfetti('confettiLayer', 10), 4500);

    // Auto-reveal the music player widget so Papa notices it
    const widget = document.getElementById('musicWidget');
    if (widget) {
      widget.classList.add('expanded');
      setTimeout(() => {
        // Collapse after 3.8s unless he has interacted with it
        if (widget.classList.contains('expanded') && !widget.dataset.userInteracted) {
          widget.classList.remove('expanded');
        }
      }, 3800);
    }
  }, 900);
}

/* ─────────────────────────────────────────────
   5. SLIDE ENGINE
───────────────────────────────────────────── */
const slides   = Array.from(document.querySelectorAll('.slide'));
const dots     = Array.from(document.querySelectorAll('.chapter-nav .dot'));
const prevBtn  = document.getElementById('prevBtn');
const nextBtn  = document.getElementById('nextBtn');
const counter  = document.getElementById('slideCounter');

let current    = 0;
let animating  = false;

function goTo(index, dir) {
  if (animating || index === current) return;
  if (index < 0 || index >= slides.length) return;

  animating = true;

  const fromSlide = slides[current];
  const toSlide   = slides[index];

  // Position the incoming slide off-screen
  toSlide.style.transition = 'none';
  toSlide.style.transform  = dir === 'next' ? 'translateX(100%)' : 'translateX(-100%)';
  toSlide.style.opacity    = '0';
  toSlide.style.zIndex     = '2';
  fromSlide.style.zIndex   = '1';

  // Force reflow
  toSlide.offsetHeight;

  // Animate
  toSlide.style.transition  = 'transform .72s cubic-bezier(.77,0,.175,1), opacity .72s ease';
  toSlide.style.transform   = 'translateX(0)';
  toSlide.style.opacity     = '1';

  fromSlide.style.transition = 'transform .72s cubic-bezier(.77,0,.175,1), opacity .72s ease';
  fromSlide.style.transform  = dir === 'next' ? 'translateX(-100%)' : 'translateX(100%)';
  fromSlide.style.opacity    = '0';

  setTimeout(() => {
    fromSlide.classList.remove('active');
    fromSlide.style.transform  = '';
    fromSlide.style.opacity    = '';
    fromSlide.style.transition = '';
    fromSlide.style.zIndex     = '';

    toSlide.classList.add('active');
    toSlide.style.transform    = '';
    toSlide.style.opacity      = '';
    toSlide.style.transition   = '';
    toSlide.style.zIndex       = '';

    current = index;
    animating = false;
    updateUI();

    // Slide-specific triggers
    if (index === 6) {
      // Cake slide
      setTimeout(() => burstConfetti('confettiLayer2', 80), 500);
    }
  }, 740);

  // Update dots immediately (feels snappier)
  dots.forEach((d, i) => d.classList.toggle('active', i === index));
}

function updateUI() {
  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === slides.length - 1;
  if (counter) counter.textContent = `${current + 1} / ${slides.length}`;
}

prevBtn.addEventListener('click', () => goTo(current - 1, 'prev'));
nextBtn.addEventListener('click', () => goTo(current + 1, 'next'));

dots.forEach((dot, i) => {
  dot.addEventListener('click', () => goTo(i, i > current ? 'next' : 'prev'));
});

/* Keyboard navigation */
window.addEventListener('keydown', e => {
  if (!introScreen.style.display && !introScreen.classList.contains('fade-out')) return; // intro still up
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown')  goTo(current + 1, 'next');
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')    goTo(current - 1, 'prev');
});

/* Touch / swipe */
let touchX = 0, touchY = 0;
document.addEventListener('touchstart', e => {
  touchX = e.touches[0].clientX;
  touchY = e.touches[0].clientY;
}, { passive: true });
document.addEventListener('touchend', e => {
  if (introScreen && !introScreen.classList.contains('fade-out')) return;
  const dx = e.changedTouches[0].clientX - touchX;
  const dy = e.changedTouches[0].clientY - touchY;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 48) {
    dx < 0 ? goTo(current + 1, 'next') : goTo(current - 1, 'prev');
  }
});

updateUI();

/* ─────────────────────────────────────────────
   5b. MEMORIES CAROUSEL & FLIP CARD
───────────────────────────────────────────── */
(function memoriesCarousel() {
  const carouselData = [
    {
      img: 'images/img10.jpg',
      cap: 'Shuruaat ke din 🥹',
      icon: '🥹',
      msg: "Aapne apni life ke itne saare years humko dedicate kare hain Papa. Aapki mehnat aur pyaar hi humari taaqat hai. We love you so much! 💛"
    },
    {
      img: 'images/img2.jpg',
      cap: 'Festive mode mein Papa! 👑',
      icon: '👑',
      msg: "Aapke bina humara kuch nahi ho sakta. Aap is parivaar ki shaan ho, sabse pyaare aur sabse special. We are very proud of you! 🥰"
    },
    {
      img: 'images/img1.jpg',
      cap: 'Fatehpur Sikri ke haseen pal 🏰',
      icon: '🏰',
      msg: "Aapne family ke liye bohot kuch kara hai. Ab humari baari hai aapko wahi care aur love wapas dene ki jo aap deserve karte ho. Hum hamesha aapke saath hain! 💛"
    },
    {
      img: 'images/img7.jpg',
      cap: 'Ek pyaari muskaan aapke chehre par 😊',
      icon: '☀️',
      msg: "Aap humare liye bohot important ho Papa. Aapki muskurahat se hi ghar mein raunak aati hai. Hum sab aapse bohot pyaar karte hain! 💕"
    },
    {
      img: 'images/img5.jpg',
      cap: 'Misty temple mein shanti ke pal 🕌',
      icon: '🌟',
      msg: "You are the best person, Papa. Har mushkil mein aapka saath aur hosla humein kabhi dharne nahi deta. Aap se badh kar humare liye kuch bhi nahi hai! ⚡"
    },
    {
      img: 'images/img6.jpg',
      cap: 'Mazedaar buggy ride ka safar 🚗',
      icon: '🚗',
      msg: "Aapne family ke liye apna sab kuch de diya. Ab humari baari hai aapko saari khushiyan dene ki. We love you so much! 🤝"
    },
    {
      img: 'images/img9.jpg',
      cap: 'Hawaon ke beech sukoon ka waqt 🍃',
      icon: '🏡',
      msg: "Family ke liye aapka hard work aur dedication bemisaal hai. Aapne humein jo khushiyan di hain, unka koi jawab nahi. Proud of you, Papa! 💛"
    },
    {
      img: 'images/img3.jpg',
      cap: 'Aapka favourite selfie moment! 📸',
      icon: '📸',
      msg: "Aap humare dil ki dharkan ho, Papa. Har ek photo aur har ek memory ko special banane ke liye shukriya. We are so proud of you! 💕"
    }
  ];

  let activeIdx = 0;
  const flipCard      = document.getElementById('flipCard');
  const carouselImg   = document.getElementById('carouselImg');
  const frontCap      = document.getElementById('frontCap');
  const flipBackIcon  = document.getElementById('flipBackIcon');
  const flipBackMsg   = document.getElementById('flipBackMsg');
  const carPrev       = document.getElementById('carPrev');
  const carNext       = document.getElementById('carNext');
  const thumbDots     = document.getElementById('thumbDots');
  const photoCounter  = document.getElementById('photoCounter');

  if (!flipCard) return;

  // Toggle flip on card click
  flipCard.addEventListener('click', () => {
    flipCard.classList.toggle('flipped');
  });

  // Render thumbnail dots
  carouselData.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = `thumb-dot ${i === 0 ? 'active' : ''}`;
    dot.setAttribute('aria-label', `Go to photo ${i + 1}`);
    dot.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent flipping card
      showPhoto(i);
    });
    thumbDots.appendChild(dot);
  });

  function showPhoto(idx) {
    if (idx < 0 || idx >= carouselData.length) return;
    
    const isFlipped = flipCard.classList.contains('flipped');
    if (isFlipped) {
      flipCard.classList.remove('flipped');
    }
    
    // Delay source update if currently flipped, so card flips to front before image swaps
    const delay = isFlipped ? 200 : 0;
    
    setTimeout(() => {
      activeIdx = idx;
      const item = carouselData[idx];
      carouselImg.src = item.img;
      frontCap.textContent = item.cap;
      flipBackIcon.textContent = item.icon;
      flipBackMsg.textContent = item.msg;
      
      photoCounter.textContent = `${idx + 1} / ${carouselData.length}`;
      
      // Update arrows
      carPrev.disabled = idx === 0;
      carNext.disabled = idx === carouselData.length - 1;
      
      // Update thumbnail dots
      const dots = thumbDots.querySelectorAll('.thumb-dot');
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    }, delay);
  }

  carPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    showPhoto(activeIdx - 1);
  });

  carNext.addEventListener('click', (e) => {
    e.stopPropagation();
    showPhoto(activeIdx + 1);
  });

  // Initialize
  showPhoto(0);
})();

updateUI();

/* ─────────────────────────────────────────────
   6. CAKE CANDLES
───────────────────────────────────────────── */
(function cake() {
  const cakeSvg = document.getElementById('cakeSvg');
  const hint    = document.getElementById('cakeHint');
  const finale  = document.getElementById('finale');
  const candles = document.querySelectorAll('.candle');
  if (!candles.length) return;

  let remaining = candles.length;

  candles.forEach(candle => {
    candle.addEventListener('click', () => {
      if (candle.dataset.lit !== 'true') return;
      candle.dataset.lit = 'false';
      remaining--;

      // Smoke puffs
      const box     = candle.getBoundingClientRect();
      const cakeBox = cakeSvg.getBoundingClientRect();
      for (let i = 0; i < 5; i++) {
        const puff = document.createElement('div');
        puff.className = 'smoke';
        puff.style.left = (box.left - cakeBox.left + box.width / 2 + (Math.random() * 10 - 5)) + 'px';
        puff.style.top  = (box.top  - cakeBox.top) + 'px';
        cakeSvg.parentElement.appendChild(puff);
        setTimeout(() => puff.remove(), 1300);
      }

      if (remaining > 0) {
        hint.textContent = remaining + (remaining === 1 ? ' candle left — one more!' : ' candles left — keep going');
      } else {
        hint.textContent = 'Wish made ✨';
        finale.classList.add('show');
        burstConfetti('confettiLayer2', 90);
      }
    });
  });
})();

/* ─────────────────────────────────────────────
   7. OPEN WHEN LETTERS — DATA & MODAL
───────────────────────────────────────────── */
const letterData = [
  {
    label:   'you need a laugh',
    icon:    '😄',
    title:   'Some Things to Make You Smile 😂',
    coupons: [
      { icon: '🎤', name: '3 On-Demand Dad Joke Sessions',    desc: "We'll listen. Patiently. Mostly." },
      { icon: '🎥', name: '1 Family Movie Night — Your Pick', desc: 'No arguments, no negotiations. You choose.' },
      { icon: '📸', name: 'Unlimited "Ek Aur" Photo Requests',desc: 'At every monument. Guaranteed forever.' }
    ]
  },
  {
    label:   'you need some comfort',
    icon:    '🤗',
    title:   'Some Comfort Coupons! ❤️',
    coupons: [
      { icon: '🍲', name: '1 Week of Homecooked Meals',        desc: 'Your favourites, made with love, whenever you want.' },
      { icon: '🤗', name: 'Unlimited Hugs',                    desc: 'Redeemable anytime, anywhere. No expiry ever.' },
      { icon: '☕', name: '1 Stress-Free Day Off',             desc: "Put your feet up. We've genuinely got it." }
    ]
  },
  {
    label:   'you miss the trips',
    icon:    '✈️',
    title:   'Next Adventure Awaits! 🗺️',
    coupons: [
      { icon: '🗺️', name: '1 Family Trip Planning Session',   desc: "You're the Chief Planner. We will follow anywhere." },
      { icon: '📷', name: 'Unlimited "One More Photo" Moments',desc: 'At every monument, palace, or random roadside sign.' },
      { icon: '🏨', name: 'You Choose the Destination',        desc: "Wherever you want — we're completely in." }
    ]
  },
  {
    label:   'you want company',
    icon:    '💛',
    title:   "We're Always Here 👨‍👩‍👧",
    coupons: [
      { icon: '📞', name: 'Call Anytime — Always Pick Up',     desc: 'Day or night, rain or shine — always.' },
      { icon: '🍽️', name: '1 Week of Choosing Where to Eat',  desc: 'No arguments. You decide. Every single day.' },
      { icon: '👨‍👩‍👧', name: '1 Family Get-Together — On Us', desc: 'Just say when, and we\'ll all be there.' }
    ]
  },
  {
    label:   'you feel proud',
    icon:    '⭐',
    title:   'A Note From Us 💜',
    coupons: [
      { icon: '🏠', name: "You've Built Something Beautiful",  desc: "A home. A family. A lifetime of memories we'll always carry." },
      { icon: '🌟', name: 'We Notice Everything',              desc: 'Every early morning. Every quiet sacrifice. Thank you.' },
      { icon: '💛', name: "We're Proud to Call You Papa",      desc: 'Always and forever, your biggest fans.' }
    ]
  },
  {
    label:   'you need a smile',
    icon:    '🌻',
    title:   'Just For You, Papa 💛',
    coupons: [
      { icon: '👑', name: 'A Turban for Every Occasion',       desc: 'Because honestly, nobody wears it better.' },
      { icon: '🕶️', name: 'Sunglasses At All Times',          desc: 'Main character energy. Permanent. Non-negotiable.' },
      { icon: '🎂', name: 'Happy Birthday, Papa! 🎉',          desc: "Here's to you — today, tomorrow, and every day after." }
    ]
  }
];

/* ── Modal elements ── */
const letterModal   = document.getElementById('letterModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalClose    = document.getElementById('modalClose');
const modalSeal     = document.getElementById('modalSeal');
const modalReason   = document.getElementById('modalReason');
const modalTitle    = document.getElementById('modalTitle');
const couponsGrid   = document.getElementById('couponsGrid');

function openLetter(idx) {
  const data = letterData[idx];
  if (!data) return;

  modalSeal.textContent   = data.icon;
  modalReason.textContent = data.label;
  modalTitle.textContent  = data.title;

  couponsGrid.innerHTML = data.coupons.map(c => `
    <div class="coupon-card">
      <span class="coupon-icon">${c.icon}</span>
      <div class="coupon-text">
        <span class="coupon-name">${c.name}</span>
        <p class="coupon-desc">${c.desc}</p>
      </div>
    </div>
  `).join('');

  letterModal.classList.add('open');
  letterModal.setAttribute('aria-hidden', 'false');
  modalClose.focus();
}

function closeLetter() {
  letterModal.classList.remove('open');
  letterModal.setAttribute('aria-hidden', 'true');
}

/* Envelope buttons */
document.querySelectorAll('.envelope-card').forEach(card => {
  card.addEventListener('click', () => openLetter(parseInt(card.dataset.letter, 10)));
});

/* Close via button, backdrop, or Escape */
modalClose.addEventListener('click', closeLetter);
modalBackdrop.addEventListener('click', closeLetter);
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && letterModal.classList.contains('open')) closeLetter();
});

