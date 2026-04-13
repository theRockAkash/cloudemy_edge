/**
 * Cloudemy Edge — Central Component Loader v2
 * Handles: nav injection, footer injection, mobile menu,
 *          nav scroll bg, active link, smooth scroll,
 *          reveal on scroll, FAQ accordion, count-up,
 *          announcement bar, section glows, WA float
 * Domain: cloudemyedge.com
 */
(function () {
  'use strict';

  var NAV_URL    = '/components/nav.html';
  var FOOTER_URL = '/components/footer.html';

  /* ─── INJECT NAV ─── */
  var navPH = document.getElementById('nav-placeholder');
  if (navPH) {
    fetch(NAV_URL)
      .then(function(r){ return r.text(); })
      .then(function(html){
        var tmp = document.createElement('div');
        tmp.innerHTML = html;
        navPH.parentNode.replaceChild(tmp.firstElementChild, navPH);
        // also inject mobile menu if present
        var mm = tmp.querySelector('#mm');
        if (mm) document.body.insertBefore(mm, document.body.firstChild.nextSibling);
        initNav();
      })
      .catch(function(){ if(navPH) navPH.style.display='none'; initNav(); });
  } else {
    initNav();
  }

  /* ─── INJECT FOOTER ─── */
  var footerPH = document.getElementById('footer-placeholder');
  if (footerPH) {
    fetch(FOOTER_URL)
      .then(function(r){ return r.text(); })
      .then(function(html){
        var tmp = document.createElement('div');
        tmp.innerHTML = html;
        footerPH.parentNode.replaceChild(tmp.firstElementChild, footerPH);
      })
      .catch(function(){ if(footerPH) footerPH.style.display='none'; });
  }

  /* ─── NAV INIT ─── */
  function initNav() {
    var nav = document.querySelector('nav');
    var btn = document.getElementById('hbg');
    var menu = document.getElementById('mm');

    /* Scroll background */
    if (nav) {
      window.addEventListener('scroll', function(){
        nav.classList.toggle('sc', window.scrollY > 40);
      }, { passive: true });
    }

    /* Mobile menu */
    if (btn && menu) {
      btn.onclick = function(){
        var open = menu.classList.toggle('open');
        btn.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', open);
        document.body.style.overflow = open ? 'hidden' : '';
      };
      menu.querySelectorAll('a').forEach(function(a){
        a.addEventListener('click', function(){
          menu.classList.remove('open');
          btn.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });
      document.addEventListener('click', function(e){
        if (menu.classList.contains('open') &&
            !menu.contains(e.target) &&
            !btn.contains(e.target)) {
          menu.classList.remove('open');
          btn.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });
    }

    /* Active link highlight */
    if (nav) {
      var path = window.location.pathname.replace(/\/$/, '') || '/';
      nav.querySelectorAll('.nl a').forEach(function(a){
        var href = (a.getAttribute('href') || '').split('#')[0].replace(/\/$/, '');
        if (!href) return;
        if (href === path || (href.length > 1 && path.startsWith(href + '/')) || (href.length > 1 && path === href)) {
          a.classList.add('active-nav');
        }
      });
    }
  }

  /* ─── SMOOTH SCROLL ─── */
  document.addEventListener('click', function(e){
    var a = e.target.closest('a[href^="#"], a[href*="/#"]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (href.includes('/#')) {
      // cross-page anchor — let browser navigate
      return;
    }
    var id = href.slice(1);
    var target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  /* ─── REVEAL ON SCROLL ─── */
  if ('IntersectionObserver' in window) {
    var revealIO = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){ e.target.classList.add('on'); revealIO.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
    function initReveal(){
      document.querySelectorAll('.rv').forEach(function(el){ revealIO.observe(el); });
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initReveal);
    } else { initReveal(); }
  }

  /* ─── DOM READY HANDLERS ─── */
  function onReady(fn){
    if (document.readyState !== 'loading') { fn(); }
    else { document.addEventListener('DOMContentLoaded', fn); }
  }

  onReady(function(){

    /* Announcement bar dismiss */
    var ab = document.getElementById('ab');
    var abc = document.getElementById('abc');
    if (ab && abc) {
      try { if (localStorage.getItem('ab_dismissed')) ab.classList.add('gone'); } catch(e){}
      abc.onclick = function(){
        ab.classList.add('gone');
        try { localStorage.setItem('ab_dismissed','1'); } catch(e){}
      };
    }

    /* FAQ accordion */
    document.querySelectorAll('.fq').forEach(function(btn){
      btn.addEventListener('click', function(){
        var item = this.closest('.fi');
        var isOpen = item.classList.contains('open');
        document.querySelectorAll('.fi.open').forEach(function(i){ i.classList.remove('open'); });
        if (!isOpen) item.classList.add('open');
      });
    });

    /* Count-up stats */
    var stts = document.querySelector('.stts');
    if (stts && 'IntersectionObserver' in window) {
      var done = false;
      var cio = new IntersectionObserver(function(e){
        if (!e[0].isIntersecting || done) return;
        done = true;
        document.querySelectorAll('[data-target]').forEach(function(el){
          var t = parseFloat(el.dataset.target);
          var s = el.dataset.suffix || '';
          var dec = el.dataset.decimal === 'true';
          var v = 0, dur = 1800, step = 16, inc = t / (dur / step);
          var ti = setInterval(function(){
            v += inc;
            if (v >= t){ v = t; clearInterval(ti); }
            el.textContent = (dec ? v.toFixed(1) : Math.floor(v)) + s;
          }, step);
        });
      }, { threshold: 0.4 });
      cio.observe(stts);
    }

    /* Sticky bottom bar */
    var sb = document.getElementById('sb');
    if (sb) {
      window.addEventListener('scroll', function(){
        sb.classList.toggle('visible', window.scrollY > 600);
      }, { passive: true });
    }

    /* Section glow injection (home page only) */
    var glows = [
      { sel:'#programs', color:'rgba(17,107,252,.07)', size:'600px', x:'80%', y:'50%' },
      { sel:'#courses',  color:'rgba(123,31,228,.06)', size:'500px', x:'10%', y:'40%' },
      { sel:'#whyus',    color:'rgba(17,107,252,.06)', size:'550px', x:'70%', y:'30%' },
      { sel:'#skills',   color:'rgba(0,255,135,.04)',  size:'480px', x:'20%', y:'60%' },
      { sel:'#mentor',   color:'rgba(17,107,252,.07)', size:'520px', x:'75%', y:'50%' },
      { sel:'#projects', color:'rgba(0,212,255,.05)',  size:'440px', x:'15%', y:'50%' },
      { sel:'#reviews',  color:'rgba(123,31,228,.06)', size:'460px', x:'80%', y:'40%' },
      { sel:'#enroll',   color:'rgba(0,255,135,.05)',  size:'500px', x:'50%', y:'50%' },
    ];
    glows.forEach(function(g){
      var sec = document.querySelector(g.sel);
      if (!sec) return;
      sec.style.position = 'relative';
      var d = document.createElement('div');
      d.className = 'sec-glow';
      d.style.cssText = 'width:'+g.size+';height:'+g.size+';background:'+g.color+
        ';border-radius:50%;position:absolute;left:'+g.x+';top:'+g.y+
        ';transform:translate(-50%,-50%);filter:blur(80px);pointer-events:none;z-index:0;';
      sec.insertBefore(d, sec.firstChild);
    });

    /* BG canvas visibility pause */
    var bg = document.getElementById('bg-canvas');
    if (bg) {
      document.addEventListener('visibilitychange', function(){
        var s = document.hidden ? 'paused' : 'running';
        bg.querySelectorAll('div').forEach(function(d){ d.style.animationPlayState = s; });
      });
    }

    /* Load video on click */
    var ytPlay = document.getElementById('yt-play');
    if (ytPlay) {
      ytPlay.addEventListener('click', function(){
        var frame = document.getElementById('yt-frame');
        var thumb = document.querySelector('.vid-thumb');
        if (frame) { frame.src = (frame.dataset.src || ''); frame.style.display = 'block'; }
        ytPlay.style.display = 'none';
        if (thumb) thumb.style.opacity = '0';
      });
    }

  });

})();
