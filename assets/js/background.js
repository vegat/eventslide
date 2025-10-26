(function () {
    const canvas = document.getElementById('background-canvas');
    if (!canvas) return;

    const context = canvas.getContext('2d');
    const colorPrimary = getComputedStyle(document.documentElement).getPropertyValue('--bg-accent').trim() || '#38bdf8';
    const colorSecondary = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#38f9d7';

    const particleCount = 80;
    const particles = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function createParticle() {
        const speed = Math.random() * 0.6 + 0.2;
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * speed,
            speedY: (Math.random() - 0.5) * speed,
            hue: Math.random(),
        };
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle());
    }

    function draw() {
        context.fillStyle = 'rgba(15, 23, 42, 0.35)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        particles.forEach((particle) => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

            const gradient = context.createRadialGradient(
                particle.x,
                particle.y,
                0,
                particle.x,
                particle.y,
                particle.size * 12
            );
            gradient.addColorStop(0, colorSecondary);
            gradient.addColorStop(1, colorPrimary);

            context.fillStyle = gradient;
            context.beginPath();
            context.arc(particle.x, particle.y, particle.size * 6, 0, Math.PI * 2);
            context.fill();
        });

        requestAnimationFrame(draw);
    }

    draw();
})();
