'use client';
import { cn } from '@/lib/utils';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

type DottedSurfaceProps = Omit<React.ComponentProps<'div'>, 'ref'>;

export function DottedSurface({ className, children, ...props }: DottedSurfaceProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const SEPARATION = 150;
        const AMOUNTX = 40;
        const AMOUNTY = 60;

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(
            60,
            container.clientWidth / container.clientHeight,
            1,
            10000,
        );
        camera.position.set(0, 355, 1220);

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0x000000, 0); // fully transparent

        container.appendChild(renderer.domElement);

        const positions: number[] = [];
        const colors: number[] = [];
        const geometry = new THREE.BufferGeometry();

        for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iy = 0; iy < AMOUNTY; iy++) {
                const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
                const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;
                positions.push(x, 0, z);
                // Bright emerald/teal dots
                colors.push(0.3, 0.85, 0.65);
            }
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 8,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            sizeAttenuation: true,
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        let count = 0;
        let animationId = 0;
        let currentScrollY = 0;

        const onScroll = () => { currentScrollY = window.scrollY; };
        window.addEventListener('scroll', onScroll, { passive: true });

        const animate = () => {
            animationId = requestAnimationFrame(animate);

            const maxScroll = document.body.scrollHeight - window.innerHeight || 1;
            const scrollFactor = Math.min(currentScrollY / maxScroll, 1);

            // Camera moves up and forward as user scrolls
            camera.position.y = 355 + scrollFactor * 500;
            camera.position.z = 1220 - scrollFactor * 800;
            camera.lookAt(0, 0, 0);

            const amplitude = 50 + scrollFactor * 40;

            const posAttr = geometry.attributes.position;
            const arr = posAttr.array as Float32Array;

            let i = 0;
            for (let ix = 0; ix < AMOUNTX; ix++) {
                for (let iy = 0; iy < AMOUNTY; iy++) {
                    arr[i * 3 + 1] =
                        Math.sin((ix + count) * 0.3) * amplitude +
                        Math.sin((iy + count) * 0.5) * amplitude;
                    i++;
                }
            }
            posAttr.needsUpdate = true;
            renderer.render(scene, camera);
            count += 0.07;
        };

        const onResize = () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        };
        window.addEventListener('resize', onResize);

        animate();

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onResize);
            cancelAnimationFrame(animationId);
            geometry.dispose();
            material.dispose();
            renderer.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={cn('absolute inset-0 overflow-hidden', className)}
            style={{ zIndex: 0 }}
            {...props}
        >
            {children}
        </div>
    );
}
