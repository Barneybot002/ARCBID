"use client";

import { useEffect, useState } from "react";

interface Star {
    id: number;
    x: number;
    y: number;
    size: number;
    delay: number;
    duration: number;
}

export default function StarField() {
    const [stars, setStars] = useState<Star[]>([]);

    useEffect(() => {
        const generated: Star[] = [];
        for (let i = 0; i < 80; i++) {
            generated.push({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 2 + 0.5,
                delay: Math.random() * 8,
                duration: Math.random() * 4 + 4,
            });
        }
        setStars(generated);
    }, []);

    return (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            {stars.map((s) => (
                <div
                    key={s.id}
                    className="absolute rounded-full bg-white"
                    style={{
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        width: s.size,
                        height: s.size,
                        opacity: 0,
                        animation: `star-drift ${s.duration}s ease-in-out ${s.delay}s infinite`,
                    }}
                />
            ))}
        </div>
    );
}
