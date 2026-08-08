"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface FlickeringGridProps extends React.HTMLAttributes<HTMLDivElement> {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  width?: number;
  height?: number;
  className?: string;
  maxOpacity?: number;
}

export const FlickeringGrid: React.FC<FlickeringGridProps> = ({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = "rgb(0, 0, 0)",
  width,
  height,
  className,
  maxOpacity = 0.3,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // El patrón de la rejilla se guarda en un ref para que persista entre
  // redimensionados y cambios de visibilidad. Así el grid no se regenera (con
  // valores aleatorios nuevos) cuando el hero cambia de altura o el usuario
  // hace scroll, que antes provocaba un "recarga" visible del fondo.
  const gridRef = useRef<{ cols: number; rows: number; squares: Float32Array } | null>(null);
  // La visibilidad vive en un ref (no en el estado) para no reiniciar el
  // efecto —y con él el patrón— cada vez que el componente entra o sale del
  // viewport.
  const isInViewRef = useRef(false);

  const memoizedColor = useMemo(() => {
    const toRGBA = (color: string) => {
      if (typeof window === "undefined") {
        return `rgba(0, 0, 0,`;
      }
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext("2d");
      if (!ctx) return "rgba(255, 0, 0,";
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data);
      return `rgba(${r}, ${g}, ${b},`;
    };
    return toRGBA(color);
  }, [color]);

  const setupCanvas = useCallback(
    (canvas: HTMLCanvasElement, width: number, height: number) => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const cols = Math.ceil(width / (squareSize + gridGap));
      const rows = Math.ceil(height / (squareSize + gridGap));

      // Si la geometría no ha cambiado, reutilizamos el patrón cacheado: la
      // animación continúa exactamente donde estaba, sin reiniciarse.
      const prev = gridRef.current;
      if (prev && prev.cols === cols && prev.rows === rows) {
        return { cols, rows, squares: prev.squares, dpr };
      }

      // La geometría cambió (creció o encogió el contenedor): conservamos los
      // cuadrados que ya existían en la zona común y solo randomizamos los
      // nuevos, para que el fondo no "parpadee" a un patrón completamente
      // distinto al redimensionar.
      const squares = new Float32Array(cols * rows);
      if (prev) {
        const overlapCols = Math.min(cols, prev.cols);
        const overlapRows = Math.min(rows, prev.rows);
        for (let i = 0; i < overlapCols; i++) {
          for (let j = 0; j < overlapRows; j++) {
            squares[i * rows + j] = prev.squares[i * prev.rows + j];
          }
        }
        for (let idx = 0; idx < squares.length; idx++) {
          const i = Math.floor(idx / rows);
          const j = idx % rows;
          if (i >= overlapCols || j >= overlapRows) {
            squares[idx] = Math.random() * maxOpacity;
          }
        }
      } else {
        for (let i = 0; i < squares.length; i++) {
          squares[i] = Math.random() * maxOpacity;
        }
      }
      gridRef.current = { cols, rows, squares };

      return { cols, rows, squares, dpr };
    },
    [squareSize, gridGap, maxOpacity]
  );

  const updateSquares = useCallback(
    (squares: Float32Array, deltaTime: number) => {
      for (let i = 0; i < squares.length; i++) {
        if (Math.random() < flickerChance * deltaTime) {
          squares[i] = Math.random() * maxOpacity;
        }
      }
    },
    [flickerChance, maxOpacity]
  );

  const drawGrid = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      cols: number,
      rows: number,
      squares: Float32Array,
      dpr: number
    ) => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "transparent";
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const opacity = squares[i * rows + j];
          ctx.fillStyle = `${memoizedColor}${opacity})`;
          ctx.fillRect(
            i * (squareSize + gridGap) * dpr,
            j * (squareSize + gridGap) * dpr,
            squareSize * dpr,
            squareSize * dpr
          );
        }
      }
    },
    [memoizedColor, squareSize, gridGap]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas?.getContext("2d") ?? null;
    let animationFrameId: number | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let intersectionObserver: IntersectionObserver | null = null;
    let gridParams: ReturnType<typeof setupCanvas> | null = null;
    let lastTime = 0;

    if (canvas && container && ctx) {
      const updateCanvasSize = () => {
        const newWidth = width || container.clientWidth;
        const newHeight = height || container.clientHeight;
        setCanvasSize({ width: newWidth, height: newHeight });
        gridParams = setupCanvas(canvas, newWidth, newHeight);
      };

      updateCanvasSize();

      const animate = (time: number) => {
        if (!isInViewRef.current || !gridParams) return;

        // Evita un delta gigante en el primer frame tras arrancar o redimensionar,
        // que haría parpadear todos los cuadrados a la vez.
        const deltaTime = lastTime === 0 ? 0 : (time - lastTime) / 1000;
        lastTime = time;

        updateSquares(gridParams.squares, deltaTime);
        drawGrid(
          ctx,
          canvas.width,
          canvas.height,
          gridParams.cols,
          gridParams.rows,
          gridParams.squares,
          gridParams.dpr
        );
        animationFrameId = requestAnimationFrame(animate);
      };

      const start = () => {
        if (animationFrameId === null) {
          lastTime = 0;
          animationFrameId = requestAnimationFrame(animate);
        }
      };
      const stop = () => {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      };

      resizeObserver = new ResizeObserver(() => {
        updateCanvasSize();
      });
      resizeObserver.observe(container);

      intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          isInViewRef.current = entry.isIntersecting;
          if (entry.isIntersecting) {
            start();
          } else {
            stop();
          }
        },
        { threshold: 0 }
      );
      intersectionObserver.observe(canvas);

      if (isInViewRef.current) {
        start();
      }
    }

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (intersectionObserver) {
        intersectionObserver.disconnect();
      }
    };
  }, [setupCanvas, updateSquares, drawGrid, width, height]);

  return (
    <div ref={containerRef} className={cn(`h-full w-full ${className}`)} {...props}>
      <canvas
        ref={canvasRef}
        className="pointer-events-none"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
        }}
      />
    </div>
  );
};
