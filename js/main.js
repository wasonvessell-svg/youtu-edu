/* =============================================
   优途研学社 - 交互脚本
   ============================================= */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // ---------- 移动端汉堡菜单 ----------
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    nav.classList.toggle('active');
  });

  // 点击导航链接后关闭菜单
  document.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      nav.classList.remove('active');
    });
  });

  // ---------- 导航栏滚动效果 ----------
  const header = document.getElementById('header');
  const backToTop = document.getElementById('backToTop');

  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // 添加阴影
    if (scrollY > 50) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }

    // 返回顶部按钮
    if (scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }

    lastScroll = scrollY;
  });

  // ---------- 返回顶部 ----------
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---------- 导航高亮（滚动监听） ----------
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  function updateActiveLink() {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink);

  // ---------- 滚动入场动画 (Intersection Observer) ----------
  const revealElements = document.querySelectorAll(
    '.section__header, .about__card, .achievement-card, .teacher-card, .pricing-card, .step'
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal', 'visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  );

  revealElements.forEach(el => observer.observe(el));

  // ---------- 表单提交 ----------
  const form = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // 简单表单验证
      const name = document.getElementById('name').value.trim();
      const grade = document.getElementById('grade').value;
      const phone = document.getElementById('phone').value.trim();

      if (!name || !grade || !phone) {
        alert('请填写所有必填项');
        return;
      }

      // 手机号简单校验
      if (!/^1\d{10}$/.test(phone)) {
        alert('请输入正确的手机号');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '提交中... <i class="fas fa-spinner fa-spin"></i>';
      submitBtn.disabled = true;

      try {
        const response = await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, grade, phone, message: document.getElementById('message').value.trim() }),
        });

        const result = await response.json();

        if (result.success) {
          form.style.display = 'none';
          formSuccess.style.display = 'block';
        } else {
          alert(result.error || '提交失败，请稍后重试');
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }
      } catch (err) {
        alert('网络错误，请稍后重试');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // ---------- 计数器动画（优化体验） ----------
  function animateCounter(element, target, suffix = '') {
    let current = 0;
    const increment = Math.ceil(target / 60);
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = current + suffix;
    }, 20);
  }

  // ---------- 平滑锚点（兼容旧浏览器） ----------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  console.log('🎓 优途研学社 网站已加载完成');
});
