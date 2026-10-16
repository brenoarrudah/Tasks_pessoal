import confetti from 'canvas-confetti';

/**
 * Disparo clássico e vibrante de confetes para celebração de Vitória Diária (100% das tarefas concluídas)
 */
export const dispararConfetes = () => {
  const count = 180;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  const fire = (particleRatio: number, opts: confetti.Options) => {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  };

  fire(0.25, {
    spread: 30,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};

/**
 * Disparo épico de confetes dourados e cósmicos para comemoração de Level Up (Solo Leveling)
 */
export const dispararConfetesLevelUp = () => {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const colors = ['#FFD700', '#FFA500', '#FF8C00', '#6366F1', '#A855F7', '#38BDF8'];

  const frame = () => {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 60,
      origin: { x: 0 },
      colors,
      zIndex: 9999,
    });
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 60,
      origin: { x: 1 },
      colors,
      zIndex: 9999,
    });

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  };

  frame();
};
