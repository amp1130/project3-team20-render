'use client';
import React, { useEffect, useState, useRef } from "react";
import { useMagnifier } from "@/context/page-magnifier-context";


const PageMagnifier: React.FC<{ zoom?: number; lensSize?: number }> = ({
  zoom = 2,
  lensSize = 200,
}) => {  
  const { isEnabled } = useMagnifier();
  if (!isEnabled) return null;

  const [mousePos, setMousePos] = useState({ x: 0, y: 0, visible: false });
  const magnifierRef = useRef<HTMLDivElement | null>(null);
  const cloneRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(() => {
          setMousePos({
            x: e.clientX,
            y: e.clientY,
            visible: true,
          });

          animationFrameId = undefined;
        });
      }
    };

    const handleMouseLeave = () => {
      setMousePos((prev) => ({ ...prev, visible: false }));
      cancelAnimationFrame(animationFrameId);
      animationFrameId = undefined;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    if (!cloneRef.current || typeof document === "undefined") return;

    // Clone the full body
    const bodyClone = document.body.cloneNode(true) as HTMLElement;

    // Remove magnifier from the clone to prevent recursion
    bodyClone.querySelectorAll(".magnifier-original").forEach((el) => el.remove());

    cloneRef.current.innerHTML = "";
    cloneRef.current.appendChild(bodyClone);
  }, [mousePos]); // Optional: you can throttle this

  const offsetX = (mousePos.x + window.scrollX) * zoom - lensSize / 2;
  const offsetY = (mousePos.y + window.scrollY) * zoom - lensSize / 2;

  return (
    <>
      {mousePos.visible && (
        <div
          ref={magnifierRef}
          className="fixed z-[9999] pointer-events-none rounded-full border-2 border-white shadow-2xl overflow-hidden magnifier-original"
          style={{
            width: lensSize,
            height: lensSize,
            top: mousePos.y - lensSize / 2,
            left: mousePos.x - lensSize / 2,
          }}
        >
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              position: "absolute",
              top: -offsetY,
              left: -offsetX,
              width: "100vw",
              height: "100vh",
              pointerEvents: "none",
              background: "white",
            }}
          >
            <div ref={cloneRef} />
          </div>
        </div>
      )}
    </>
  );
};

export default PageMagnifier;
