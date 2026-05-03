function initCommon() {

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: .16 });

  document.querySelectorAll('.fade').forEach((el) => io.observe(el));

  const navLinks = document.querySelectorAll('.nav a');
  if (navLinks.length) {
    const current = location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach((a) => {
      const href = a.getAttribute('href');
      if ((current === 'index.html' && href === 'index.html') || href === current)
        a.classList.add('active');
    });
  }

  const burger = document.querySelector('[data-burger]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => mobileMenu.classList.toggle('show'));
    mobileMenu.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => mobileMenu.classList.remove('show'))
    );
  }

  const form = document.getElementById('leadForm');

  if (form) {
    const statusBox = document.getElementById('status');

    const inputs = {
      type: document.getElementById('type'),
      material: document.getElementById('material'),
      area: document.getElementById('area'),
      complexity: document.getElementById('complexity'),
      price: document.getElementById('price'),
      monthly: document.getElementById('monthly')
    };

    // калькулятор
    if (inputs.type && inputs.material && inputs.area && inputs.complexity) {
      const baseMap = {
        kitchen: 24500,
        wardrobe: 17000,
        closet: 18000,
        kids: 17500,
        office: 15500
      };

      const matCoef = {
        ldsp: .86,
        mdf: 1,
        acrylic: 1.18,
        premium: 1.35
      };

      const fmt = (n) => new Intl.NumberFormat('ru-RU').format(Math.round(n));

      const recalc = () => {
        const base = baseMap[inputs.type.value] || 20000;
        const m = matCoef[inputs.material.value] || 1;
        const a = Number(inputs.area.value);
        const c = 1 + (Number(inputs.complexity.value) - 1) * .12;

        const total = base * a * m * c;
        const installment = total / 6;

        if (inputs.price) inputs.price.textContent = `≈ ${fmt(total)} ₽`;
        if (inputs.monthly) inputs.monthly.textContent = `Рассрочка: ≈ ${fmt(installment)} ₽ / мес`;
      };

      [inputs.type, inputs.material, inputs.area, inputs.complexity]
        .forEach((el) => el && el.addEventListener('input', recalc));

      recalc();
    }

    // 🔥 ФИКС формы
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (statusBox) statusBox.textContent = 'Отправляю заявку...';

      try {
        const data = Object.fromEntries(new FormData(form).entries());

        const res = await fetch('/api/lead', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        // 👉 сначала проверяем статус
        if (!res.ok) {
          throw new Error('HTTP ' + res.status);
        }

        // 👉 безопасный парс JSON
        let json;
        try {
          json = await res.json();
        } catch {
          throw new Error('Invalid JSON');
        }

        if (json.ok) {
          if (statusBox) statusBox.textContent = 'Заявка отправлена ✔';
          form.reset();
        } else {
          if (statusBox) statusBox.textContent = json.error || 'Ошибка отправки';
        }

      } catch (err) {
        console.error(err);
        if (statusBox) statusBox.textContent = 'Ошибка соединения с сервером';
      }
    });
  }

  // фильтр
  const filterButtons = document.querySelectorAll('[data-filter]');
  const cards = document.querySelectorAll('[data-category]');

  if (filterButtons.length && cards.length) {
    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        cards.forEach((card) => {
          const ok = filter === 'all' || card.dataset.category === filter;
          card.style.display = ok ? '' : 'none';
        });
      });
    });
  }

  // lightbox
  const lightbox = document.querySelector('.lightbox');
  const lightImg = lightbox ? lightbox.querySelector('img') : null;

  document.querySelectorAll('[data-lightbox]').forEach((img) => {
    img.addEventListener('click', () => {
      if (!lightbox || !lightImg) return;
      lightImg.src = img.src;
      lightbox.classList.add('show');
    });
  });

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) lightbox.classList.remove('show');
    });

    const close = lightbox.querySelector('.close');
    if (close) {
      close.addEventListener('click', () => lightbox.classList.remove('show'));
    }
  }
}

window.addEventListener('DOMContentLoaded', initCommon);
