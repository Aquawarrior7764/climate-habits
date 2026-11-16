/* SPDX-License-Identifier: GPL-3.0-only
 * Pointer mapping and spring settings adapted from pokemon-cards-css,
 * src/lib/components/Card.svelte and src/lib/helpers/Math.js.
 * Copyright (C) 2022 Simon Goellner, @simeydotme.
 * Modified for Climate Habits, 2026-11-15: dependency-free numeric spring,
 * shared idle-aware scheduler, independent flip, keyboard/touch/editor support.
 * Spring integration adapted from Svelte 3.52.0 (MIT); see licenses/svelte-MIT.txt.
 * This program is free software under GPL-3.0, without warranty.
 * See ../CARD-CREDITS.md and ../licenses/pokemon-cards-css-GPL-3.0.txt.
 */
(function () {
  'use strict';

  const elements = document.querySelectorAll('[data-climate-card]');
  if (!elements.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const resting = { rx: 0, ry: 0, px: 50, py: 50, bx: 50, by: 50, opacity: 0 };
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const moving = new Set();
  const cards = [];
  let frame = 0;
  let lastTime = 0;
  let editing = document.body.classList.contains('se-editing');

  class Spring {
    constructor(value, stiffness = .066, damping = .25) {
      this.value = this.target = this.last = value;
      this.stiffness = stiffness;
      this.damping = damping;
      this.mass = 1;
    }
    set(target, stiffness = this.stiffness, damping = this.damping, soft = false) {
      this.target = target;
      this.stiffness = stiffness;
      this.damping = damping;
      if (soft) this.mass = 0;
    }
    snap(value = this.target) {
      this.value = this.target = this.last = value;
      this.mass = 1;
    }
    tick(dt) {
      // Same spring/damper/velocity integration as Svelte 3's tick_spring.
      // Bound each step to a 60Hz frame to keep long frames stable.
      this.mass = Math.min(1, this.mass + dt / 60);
      const delta = this.target - this.value;
      const velocity = (this.value - this.last) / dt;
      const acceleration = (this.stiffness * delta - this.damping * velocity) * this.mass;
      const displacement = (velocity + acceleration) * dt;
      this.last = this.value;
      if (Math.abs(displacement) < .01 && Math.abs(delta) < .01) {
        this.snap();
        return false;
      }
      this.value += displacement;
      return true;
    }
  }

  function wake(card) {
    moving.add(card);
    card.element.classList.add('is-moving');
    if (!frame && !document.hidden) {
      lastTime = performance.now();
      frame = requestAnimationFrame(animate);
    }
  }

  function animate(time) {
    // Fixed 60Hz integration preserves the source spring feel at 60/120/144Hz.
    // Accumulate fractional frames rather than changing the spring's velocity unit.
    const elapsed = clamp((time - lastTime) * 60 / 1000, 0, 4);
    lastTime = time;
    moving.forEach((card) => {
      card.accumulator += elapsed;
      let active = true;
      while (card.accumulator >= 1) {
        active = false;
        Object.values(card.springs).forEach((spring) => { active = spring.tick(1) || active; });
        card.accumulator -= 1;
      }
      render(card);
      if (!active) {
        moving.delete(card);
        card.accumulator = 0;
        card.element.classList.remove('is-moving');
      }
    });
    frame = moving.size ? requestAnimationFrame(animate) : 0;
  }

  function render(card) {
    const value = (key) => card.springs[key].value;
    const style = card.element.style;
    const set = (key, number, unit = '') => style.setProperty(key, number.toFixed(3) + unit);
    set('--rotate-x', value('rx'), 'deg');
    set('--rotate-y', value('ry'), 'deg');
    set('--flip-angle', value('flip'), 'deg');
    set('--pointer-x', value('px'), '%');
    set('--pointer-y', value('py'), '%');
    set('--background-x', value('bx'), '%');
    set('--background-y', value('by'), '%');
    set('--card-opacity', clamp(value('opacity'), 0, 1));
    set('--pointer-from-center', clamp(Math.hypot(value('px') - 50, value('py') - 50) / 50, 0, 1));
  }

  function updateAccessibility(card) {
    const name = card.front.querySelector('h3').textContent.trim();
    card.button.setAttribute('aria-pressed', String(card.flipped));
    card.button.setAttribute('aria-label', `${name}: ${card.flipped ? 'show front' : 'show back'}`);
    card.button.setAttribute('aria-describedby', card.flipped ? card.back.id : card.front.id);
    card.front.setAttribute('aria-hidden', String(!editing && card.flipped));
    card.back.setAttribute('aria-hidden', String(!editing && !card.flipped));
  }

  function reset(card, immediate = false) {
    clearTimeout(card.leaveTimer);
    Object.entries(resting).forEach(([key, target]) => {
      if (immediate) card.springs[key].snap(target);
      else card.springs[key].set(target, .01, .06, true);
    });
    if (immediate) {
      card.springs.flip.snap(card.flipped ? 180 : 0);
      moving.delete(card);
      card.element.classList.remove('is-moving');
      render(card);
    } else wake(card);
  }

  elements.forEach((element) => {
    const button = element.querySelector('.climate-card__toggle');
    const front = element.querySelector('.climate-card__front');
    const back = element.querySelector('.climate-card__back');
    if (!button || !front || !back) return;
    const card = {
      element, button, front, back, flipped: false, leaveTimer: 0, accumulator: 0,
      springs: Object.fromEntries(Object.entries(resting).map(([key, value]) => [key, new Spring(value)]))
    };
    card.springs.flip = new Spring(0, .033, .45);
    cards.push(card);
    element.classList.add('is-animated');
    button.hidden = false;
    updateAccessibility(card);

    element.addEventListener('pointermove', (event) => {
      if (editing || reducedMotion.matches || event.pointerType === 'touch') return;
      clearTimeout(card.leaveTimer);
      const rect = element.getBoundingClientRect();
      const x = clamp((event.clientX - rect.left) / rect.width * 100, 0, 100);
      const y = clamp((event.clientY - rect.top) / rect.height * 100, 0, 100);
      const targets = {
        rx: -(x - 50) / 3.5, ry: (y - 50) / 3.5,
        px: x, py: y, bx: 37 + x * .26, by: 33 + y * .34, opacity: 1
      };
      Object.entries(targets).forEach(([key, value]) => card.springs[key].set(value, .066, .25));
      wake(card);
    }, { passive: true });

    element.addEventListener('pointerleave', () => {
      // Original has a 500ms pause before its soft, low-damping return.
      clearTimeout(card.leaveTimer);
      if (!editing && !reducedMotion.matches) card.leaveTimer = setTimeout(() => reset(card), 500);
    }, { passive: true });
    element.addEventListener('pointercancel', () => reset(card, true), { passive: true });
    button.addEventListener('blur', () => reset(card, true));
    button.addEventListener('click', () => {
      if (editing) return;
      card.flipped = !card.flipped;
      card.springs.flip.set(card.flipped ? 180 : 0);
      updateAccessibility(card);
      if (reducedMotion.matches) reset(card, true);
      else wake(card);
      // Future game logic can listen without coupling scoring to animation.
      element.dispatchEvent(new CustomEvent('climatecardflip', {
        bubbles: true, detail: { flipped: card.flipped }
      }));
    });
  });

  // The page editor adds/removes this class. Both faces are exposed for editing;
  // no animation, click overlay, or stale accessibility state blocks its controls.
  new MutationObserver(() => {
    const next = document.body.classList.contains('se-editing');
    if (next === editing) return;
    editing = next;
    cards.forEach((card) => { reset(card, true); updateAccessibility(card); });
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  function stopMotion() {
    cancelAnimationFrame(frame);
    frame = 0;
    cards.forEach((card) => reset(card, true));
    moving.clear();
  }
  reducedMotion.addEventListener('change', stopMotion);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopMotion(); });
  window.addEventListener('pagehide', stopMotion);
})();
