"use client";

import { useEffect, useRef, useCallback } from "react";

interface ONode {
    x: number;
    y: number;
    baseAngle: number;
    radiusX: number;
    radiusY: number;
    tilt: number;
    speed: number;
    size: number;
    type: "plain" | "arcium" | "solana";
    pulse: number;
    pulseSpeed: number;
}

const ARCIUM_LOGO = "/demo-items/arcium-logo.png";
const SOLANA_LOGO = "/demo-items/solana-pfp.png";

function createNodes(): ONode[] {
    const nodes: ONode[] = [];
    const types: ONode["type"][] = [
        "arcium", "plain", "solana", "plain",
        "arcium", "plain", "plain", "plain", "plain",
    ];

    for (let i = 0; i < types.length; i++) {
        const angle = (Math.PI * 2 * i) / types.length + Math.random() * 0.4;
        const isLogo = types[i] !== "plain";
        nodes.push({
            x: 0,
            y: 0,
            baseAngle: angle,
            radiusX: 100 + Math.random() * 100,
            radiusY: 70 + Math.random() * 80,
            tilt: (Math.random() - 0.5) * 0.6,
            speed: 0.002 + Math.random() * 0.003,
            size: isLogo ? 24 : 4 + Math.random() * 4,
            type: types[i],
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: 0.02 + Math.random() * 0.015,
        });
    }
    return nodes;
}

export default function OrbitNetwork() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const nodesRef = useRef<ONode[]>(createNodes());
    const imagesRef = useRef<{ arcium: HTMLImageElement | null; solana: HTMLImageElement | null }>({
        arcium: null,
        solana: null,
    });
    const animFrameRef = useRef<number>(0);

    const loadImages = useCallback(() => {
        const arcImg = new Image();
        arcImg.src = ARCIUM_LOGO;
        arcImg.onload = () => { imagesRef.current.arcium = arcImg; };

        const solImg = new Image();
        solImg.src = SOLANA_LOGO;
        solImg.onload = () => { imagesRef.current.solana = solImg; };
    }, []);

    useEffect(() => {
        loadImages();
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let w = 0;
        let h = 0;

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            w = rect.width;
            h = rect.height;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        window.addEventListener("resize", resize);

        let t = 0;
        const nodes = nodesRef.current;

        const draw = () => {
            const cx = w / 2;
            const cy = h / 2;

            ctx.clearRect(0, 0, w, h);

            // Background radial glow
            const bgGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.48);
            bgGlow.addColorStop(0, "rgba(124, 58, 237, 0.07)");
            bgGlow.addColorStop(0.5, "rgba(124, 58, 237, 0.025)");
            bgGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = bgGlow;
            ctx.fillRect(0, 0, w, h);

            t += 0.016; // ~60fps step

            // Draw orbit path ellipses
            for (const node of nodes) {
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(node.tilt);
                ctx.strokeStyle = "rgba(124, 58, 237, 0.08)";
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.ellipse(0, 0, node.radiusX, node.radiusY, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }

            // Update positions — smooth elliptical orbits
            for (const node of nodes) {
                const angle = node.baseAngle + t * node.speed * 60;
                const cosT = Math.cos(node.tilt);
                const sinT = Math.sin(node.tilt);
                const ox = Math.cos(angle) * node.radiusX;
                const oy = Math.sin(angle) * node.radiusY;
                // Apply tilt rotation for varied ellipse orientations
                node.x = cx + ox * cosT - oy * sinT;
                node.y = cy + ox * sinT + oy * cosT;
                node.pulse += node.pulseSpeed;
            }

            // Draw nodes
            for (const node of nodes) {
                const pulseScale = 1 + Math.sin(node.pulse) * 0.15;

                if (node.type === "plain") {
                    // Outer glow
                    const glow = ctx.createRadialGradient(
                        node.x, node.y, 0,
                        node.x, node.y, node.size * 3.5 * pulseScale
                    );
                    glow.addColorStop(0, "rgba(167, 139, 250, 0.5)");
                    glow.addColorStop(0.4, "rgba(124, 58, 237, 0.12)");
                    glow.addColorStop(1, "rgba(124, 58, 237, 0)");
                    ctx.fillStyle = glow;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, node.size * 3.5 * pulseScale, 0, Math.PI * 2);
                    ctx.fill();

                    // Core dot
                    ctx.fillStyle = `rgba(196, 181, 253, ${0.7 + Math.sin(node.pulse) * 0.3})`;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, node.size * pulseScale, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    // Logo node
                    const img = node.type === "arcium"
                        ? imagesRef.current.arcium
                        : imagesRef.current.solana;
                    const s = node.size * pulseScale;

                    // Glow behind logo
                    const glow = ctx.createRadialGradient(
                        node.x, node.y, 0,
                        node.x, node.y, s * 2.2
                    );
                    glow.addColorStop(0, "rgba(124, 58, 237, 0.18)");
                    glow.addColorStop(1, "rgba(124, 58, 237, 0)");
                    ctx.fillStyle = glow;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, s * 2.2, 0, Math.PI * 2);
                    ctx.fill();

                    // Logo container circle
                    ctx.fillStyle = "rgba(10, 10, 15, 0.85)";
                    ctx.strokeStyle = "rgba(124, 58, 237, 0.3)";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, s, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();

                    // Draw logo image
                    if (img) {
                        const imgSize = s * 1.3;
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, s * 0.78, 0, Math.PI * 2);
                        ctx.clip();
                        ctx.drawImage(
                            img,
                            node.x - imgSize / 2,
                            node.y - imgSize / 2,
                            imgSize,
                            imgSize
                        );
                        ctx.restore();
                    }
                }
            }

            animFrameRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animFrameRef.current);
            window.removeEventListener("resize", resize);
        };
    }, [loadImages]);

    return (
        <canvas
            ref={canvasRef}
            className="h-full w-full"
            style={{ display: "block" }}
        />
    );
}
