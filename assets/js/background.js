(function () {
    const canvas = document.getElementById('background-canvas');
    if (!canvas) return;

    const context = canvas.getContext('2d');
    const colorPrimary = getComputedStyle(document.documentElement).getPropertyValue('--bg-accent').trim() || '#38bdf8';
    const colorSecondary = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#38f9d7';
    const colorTertiary = getComputedStyle(document.documentElement).getPropertyValue('--accent-strong').trim() || '#c084fc';

    const shapeCount = 60;
    const connectionDistance = 180;
    const shapes = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function createShape() {
        const speed = Math.random() * 0.9 + 0.4;
        const angle = Math.random() * Math.PI * 2;
        const velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed,
        };

        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 40 + 16,
            velocity,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.01,
            sides: Math.random() > 0.6 ? 6 : Math.floor(Math.random() * 3) + 4,
            pulseOffset: Math.random() * Math.PI * 2,
        };
    }

    for (let i = 0; i < shapeCount; i++) {
        shapes.push(createShape());
    }

    function drawPolygon(x, y, radius, sides, rotation) {
        context.beginPath();
        for (let i = 0; i <= sides; i++) {
            const theta = (i / sides) * Math.PI * 2 + rotation;
            const px = x + Math.cos(theta) * radius;
            const py = y + Math.sin(theta) * radius;
            context.lineTo(px, py);
        }
        context.closePath();
    }

    function drawConnections() {
        for (let i = 0; i < shapes.length; i++) {
            for (let j = i + 1; j < shapes.length; j++) {
                const a = shapes[i];
                const b = shapes[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance) {
                    const alpha = 1 - distance / connectionDistance;
                    context.strokeStyle = `rgba(148, 163, 184, ${alpha * 0.6})`;
                    context.lineWidth = 1;
                    context.beginPath();
                    context.moveTo(a.x, a.y);
                    context.lineTo(b.x, b.y);
                    context.stroke();
                }
            }
        }
    }

    function draw() {
        context.fillStyle = 'rgba(15, 23, 42, 0.18)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        drawConnections();

        shapes.forEach((shape) => {
            shape.x += shape.velocity.x;
            shape.y += shape.velocity.y;
            shape.rotation += shape.rotationSpeed;

            // wrapping
            if (shape.x < -shape.radius) shape.x = canvas.width + shape.radius;
            if (shape.x > canvas.width + shape.radius) shape.x = -shape.radius;
            if (shape.y < -shape.radius) shape.y = canvas.height + shape.radius;
            if (shape.y > canvas.height + shape.radius) shape.y = -shape.radius;

            const pulse = Math.sin(Date.now() * 0.0015 + shape.pulseOffset) * 0.15 + 1;
            const currentRadius = shape.radius * pulse;

            drawPolygon(shape.x, shape.y, currentRadius, shape.sides, shape.rotation);

            const gradient = context.createRadialGradient(
                shape.x,
                shape.y,
                currentRadius * 0.2,
                shape.x,
                shape.y,
                currentRadius
            );
            gradient.addColorStop(0, `${colorSecondary}dd`);
            gradient.addColorStop(0.6, `${colorPrimary}bb`);
            gradient.addColorStop(1, `${colorTertiary}55`);

            context.fillStyle = gradient;
            context.fill();

            context.strokeStyle = `${colorSecondary}99`;
            context.lineWidth = 1.5;
            context.stroke();
        });

        requestAnimationFrame(draw);
    }

    draw();
})();
