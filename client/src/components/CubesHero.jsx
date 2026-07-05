import React, { useState } from 'react';
import Spline from '@splinetool/react-spline';

export default function CubesHero({ onLoadComplete }) {
  const [showHint, setShowHint] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const [moveCount, setMoveCount] = useState(0);

  const handleSplineLoad = (splineApp) => {
    console.log('3D Scene loaded. Cleaning up UI components...');

    // ── Strip the Spline scene background completely ──────────────────────────
    try {
      const renderer = splineApp.renderer || splineApp._renderer;
      if (renderer) {
        // Method 1: transparent clear color (alpha = 0)
        if (renderer.setClearColor) renderer.setClearColor(0x000000, 0);
        if (renderer.setClearAlpha) renderer.setClearAlpha(0);

        // Method 2: mark renderer as alpha-capable
        if (renderer.gl) renderer.gl.clearColor(0, 0, 0, 0);

        // Method 3: make the underlying canvas DOM element transparent
        const canvas = renderer.domElement;
        if (canvas) {
          canvas.style.background = 'transparent';
          canvas.style.backgroundColor = 'transparent';
        }
      }

      // Method 4: hide Spline's internal scene background object
      const backgroundNames = [
        'Background', 'background', 'Scene Background',
        'Environment', 'Sky', 'Backdrop'
      ];
      backgroundNames.forEach(name => {
        const obj = splineApp.findObjectByName(name);
        if (obj) {
          obj.visible = false;
          console.log(`Hidden background: ${name}`);
        }
      });

      // Method 5: null out scene background via Three.js scene reference
      const scene = splineApp.scene || splineApp._scene;
      if (scene) {
        scene.background = null;
        scene.environment = null;
      }
    } catch (e) {
      console.warn('Background removal error:', e);
    }

    // List of elements to hide to isolate the interactive cube grid
    const objectsToHide = [
      'Text', 'Text 2', 'Text 3', 'Text 4', 'Text 5', 'Text 6', 'Text 7',
      'UI', 'UI Scene',
      'Rectangle', 'Rectangle 2', 'Rectangle 3',
      'Ellipse'
    ];

    objectsToHide.forEach(name => {
      const obj = splineApp.findObjectByName(name);
      if (obj) {
        obj.visible = false;
        console.log(`Hidden object: ${name}`);
      }
    });

    if (onLoadComplete) onLoadComplete();

    setTimeout(() => {
      if (!interacted) setShowHint(true);
    }, 800);
  };



  const handlePointerDown = () => {
    setInteracted(true);
    setShowHint(false);
  };

  const handlePointerMove = () => {
    if (interacted) return;
    setMoveCount(prev => {
      const next = prev + 1;
      if (next > 20) {
        setInteracted(true);
        setShowHint(false);
      }
      return next;
    });
  };

  return (
    <>
      <main className="experience-container">
        <div 
          onPointerDown={handlePointerDown} 
          onPointerMove={handlePointerMove}
          style={{ width: '100%', height: '100%' }}
        >
          <Spline 
            id="canvas3d"
            scene="https://prod.spline.design/tm8wZ7GtWO96OrOs/scene.splinecode" 
            onLoad={handleSplineLoad}
          />
        </div>
      </main>
    </>
  );
}
