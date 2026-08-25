document.addEventListener('DOMContentLoaded', () => {
  const ham = document.getElementById('ham');
  const mob = document.getElementById('mob-menu');
  if (ham && mob) {
    const openMenu = () => {
      document.body.classList.add('nav-open');
      mob.classList.add('open');
      ham.setAttribute('aria-expanded', 'true');
      ham.setAttribute('aria-label', '關閉選單');
    };
    const closeMenu = ({ returnFocus } = {}) => {
      document.body.classList.remove('nav-open');
      mob.classList.remove('open');
      ham.setAttribute('aria-expanded', 'false');
      ham.setAttribute('aria-label', '開啟選單');
      if (returnFocus) ham.focus();
    };

    ham.addEventListener('click', () => {
      if (mob.classList.contains('open')) closeMenu();
      else openMenu();
    });
    mob.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeMenu()));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mob.classList.contains('open')) closeMenu({ returnFocus: true });
    });
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
});
