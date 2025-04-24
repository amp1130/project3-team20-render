'use client';
import React, { useEffect, useState, useRef } from "react";
import { useMagnifier } from "@/context/page-magnifier-context";

const PageMagnifier: React.FC<{ zoom?: number; lensSize?: number }> = ({
  zoom = 2,
  lensSize = 200,
}) => {
  const { isEnabled } = useMagnifier();
  
  // Ensure that we're only using window on the client side
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, visible: false });
  const magnifierRef = useRef<HTMLDivElement | null>(null);
  const cloneRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !isEnabled) return;

    let animationFrameId: number | undefined;

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
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = undefined;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isEnabled]); // Depend on isEnabled to stop when it's turned off

  useEffect(() => {
    if (!cloneRef.current || typeof document === "undefined" || !isEnabled) return;

    // Function to update the clone
    const updateClone = () => {
      if (!cloneRef.current) return; // Ensure cloneRef is not null

      const bodyClone = document.body.cloneNode(true) as HTMLElement;
      bodyClone.querySelectorAll(".magnifier-original").forEach((el) => el.remove());

      // Update cloneRef only if it's not null
      if (cloneRef.current) {
        cloneRef.current.innerHTML = "";
        cloneRef.current.appendChild(bodyClone);
      }
    };

    // Initial update on mount and mouse movement
    updateClone();

    // Periodic update every 100ms while the magnifier is enabled
    const intervalId = setInterval(updateClone, 100);

    return () => {
      clearInterval(intervalId);
    };
  }, [mousePos, isEnabled]); // Depend on mousePos and isEnabled to update the clone

  const offsetX = (mousePos.x + (typeof window !== "undefined" ? window.scrollX : 0)) * zoom - lensSize / 2;
  const offsetY = (mousePos.y + (typeof window !== "undefined" ? window.scrollY : 0)) * zoom - lensSize / 2;

  return (
    <>
      {isEnabled && mousePos.visible && (
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
