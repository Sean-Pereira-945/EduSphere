import React, { useState } from 'react';
import Spline from '@splinetool/react-spline';

export default function CubesHero({ onLoadComplete }) {
  const [showHint, setShowHint] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const [moveCount, setMoveCount] = useState(0);

  const handleSplineLoad = (splineApp) => {
    console.log('3D Scene loaded. Cleaning up UI components...');

    // List of elements to hide to isolate the interactive cube grid
    const objectsToHide = [
      'Text', 'Text 2', 'Text 3', 'Text 4', 'Text 5', 'Text 6', 'Text 7',
      'UI', 'UI Scene',
      'Rectangle', 'Rectangle 2', 'Rectangle 3',
      'Ellipse'
    ];

    // Hide each target object programmatically
    objectsToHide.forEach(name => {
      const obj = splineApp.findObjectByName(name);
      if (obj) {
        obj.visible = false;
        console.log(`Hidden object: ${name}`);
      } else {
        console.warn(`Object not found in scene tree: ${name}`);
      }
    });

    // Notify parent component (for loader overlay fade out)
    if (onLoadComplete) {
      onLoadComplete();
    }

    // Show interaction hint overlay after a small delay
    setTimeout(() => {
      if (!interacted) {
        setShowHint(true);
      }
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
