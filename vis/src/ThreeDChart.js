import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
const ThreeDChart = ({ dataUrl: dataUrl }) => {
    const chartRef = useRef();

    useEffect(() => {
        // Load the JSON file
        fetch(dataUrl)
            .then(response => response.json())
            .then(data => {
                // Create a scene
                const scene = new THREE.Scene();

                // Create a camera
                const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
                camera.position.z = 5;

                // Create a renderer
                const renderer = new THREE.WebGLRenderer();
                renderer.setClearColor(0xffffff);
                renderer.setSize(720, 720);
                chartRef.current.innerHTML = '';
                chartRef.current.appendChild(renderer.domElement);

                const controls = new OrbitControls(camera, renderer.domElement);

                // Create a material
                const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });

                const rValues = data.map(d => d.r);
                const maxR = Math.max(...rValues);
                const minR = Math.min(...rValues);
                // Add vertices to the array
                data.forEach((d, i) => {
                    if (isNaN(d.x) || isNaN(d.y) || isNaN(d.r)) {
                        console.error('Invalid data:', d);
                    } else {
                        console.log('Valid data:', d);
                        const nR = (d.r - minR) / (maxR - minR) * 10 -5;
                        const geometry = new THREE.SphereGeometry(0.05, 32, 32);
                        const sphere = new THREE.Mesh(geometry, material);
                        sphere.position.set(d.x, nR, d.y);
                        scene.add(sphere);
                    }
                });

                // Update controls in the animation loop
                const animate = function () {
                    requestAnimationFrame(animate);
                    controls.update(); // Add this line
                    renderer.render(scene, camera);
                };

                animate();
            });
    }, [dataUrl]);

    return <div ref={chartRef} />;
};

export default ThreeDChart;