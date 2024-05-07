import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { BufferGeometry, Float32BufferAttribute, ShaderMaterial, MeshLambertMaterial, Mesh, DirectionalLight } from 'three';
import triangulate from 'delaunay-triangulate';

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
                const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
                camera.position.z = 5;

                // Create a renderer
                const renderer = new THREE.WebGLRenderer();
                renderer.setClearColor(0xffffff);
                renderer.setSize(720, 720);
                chartRef.current.innerHTML = '';
                chartRef.current.appendChild(renderer.domElement);

                const controls = new OrbitControls(camera, renderer.domElement);

                // Create a material
                const pointMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });

                const rValues = data.map(d => d.r);
                const maxR = Math.max(...rValues);
                const minR = Math.min(...rValues);

                const points = [];
                data.forEach((d, i) => {
                    if (isNaN(d.x) || isNaN(d.y) || isNaN(d.r)) {
                        console.error('Invalid data:', d);
                    } else {
                        console.log('Valid data:', d);
                        const nR = (d.r - minR) / (maxR - minR) * 10 - 5;
                        points.push({ x: d.x, y: nR, z: d.y });
                    }
                });

                // Perform triangulation in the x, z plane
                const pointsArray = points.map(p => [p.x, p.z]);
                const triangles = triangulate(pointsArray);

                // Create geometry using x, y, z coordinates
                const geometry = new BufferGeometry();
                geometry.setAttribute('position', new Float32BufferAttribute(points.flatMap(p => [p.x, p.y, p.z]), 3));

                const indices = [];
                triangles.forEach(triangle => {
                    indices.push(...triangle);
                });
                geometry.setIndex(indices);

                geometry.computeVertexNormals();

                // Get min and max y
                const minY = Math.min(...points.map(p => p.y));
                const maxY = Math.max(...points.map(p => p.y));

                // Create a ShaderMaterial
                const surfaceMaterial = new ShaderMaterial({
                    vertexShader: `
                        varying vec3 vUv; 

                        void main() {
                        vUv = position; 
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
                        }
                    `,
                    fragmentShader: `
                        varying vec3 vUv;
                        uniform float minY;
                        uniform float maxY;

                        void main() {
                        float green = (vUv.y - minY) / (maxY - minY);
                        float red = 1.0 - green;
                        gl_FragColor = vec4(red, green, 0.0, 1.0);
                        }
  `,
                    uniforms: {
                        minY: { value: minY },
                        maxY: { value: maxY }
                    }
                });

                const mesh = new Mesh(geometry, surfaceMaterial);
                scene.add(mesh);

                // Add vertices to the array
                points.forEach((p) => {
                    const geometry = new THREE.SphereGeometry(0.05, 32, 32);
                    const sphere = new THREE.Mesh(geometry, pointMaterial);
                    sphere.position.set(p.x, p.y, p.z);
                    scene.add(sphere);
                });
                // Add a light source
                const light = new DirectionalLight(0xffffff, 1);
                light.position.set(10, 10, 10);
                scene.add(light);

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