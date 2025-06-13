import React, { useRef, useEffect } from "react";

const Startfield = ({ starCount = 100 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Generate stars
    const stars = Array.from({ length: starCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.2 + 0.2,
      speed: Math.random() * 0.7 + 0.2,
      alpha: Math.random() * 0.5 + 0.5,
    }));

    function draw() {
      ctx.clearRect(0, 0, width, height);
      for (let star of stars) {
        ctx.save();
        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
        ctx.fillStyle = "#fff";
        ctx.shadowColor = "#fff";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();

        // Move star
        star.x += star.speed;
        if (star.x > width) {
          star.x = 0;
          star.y = Math.random() * height;
        }
      }
      requestAnimationFrame(draw);
    }

    draw();

    // Handle resize
    function handleResize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [starCount]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
};

export default Startfield;