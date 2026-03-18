import React, { useState, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Environment, ContactShadows, Text, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Printer, Calculator, Box, Droplets, Layers, Maximize, Settings2, Info } from 'lucide-react';

// --- Types & Constants ---

const membraneData: Record<string, { area: number; height: number; width: number }> = {
  BF100Oxy: { area: 10, height: 1000, width: 610 },
  BF200Oxy: { area: 20, height: 1500, width: 610 },
  BF220Oxy: { area: 22, height: 2055, width: 610 },
  BF100N: { area: 10, height: 1000, width: 610 },
  BF150N: { area: 15, height: 1500, width: 610 },
  BF200N: { area: 20, height: 2000, width: 610 },
  SUS097: { area: 9.7, height: 1300, width: 680 },
  SUS113: { area: 11.3, height: 1500, width: 680 },
  SUS193: { area: 19.3, height: 1300, width: 1250 },
  SUS227: { area: 22.7, height: 1500, width: 1250 },
  SUS313: { area: 31.3, height: 2000, width: 1250 },
  SUS400: { area: 40, height: 2000, width: 1250 },
};

// --- 3D Components ---

const Tank = ({ width, length, height, waterLevel }: { width: number; length: number; height: number; waterLevel: number }) => {
  return (
    <group>
      {/* Tank Walls */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, length]} />
        <meshStandardMaterial
          color="#e5e7eb"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>
      <Html
        position={[width / 2 + 20, 0, 0]}
        center
        distanceFactor={10}
      >
        <div className="bg-gray-800 text-white text-[5px] px-2 py-0.5 rounded shadow-lg whitespace-nowrap font-bold uppercase">
          Tank length: {length} mm
        </div>
      </Html>

      {/* Tank Wireframe */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, length]} />
        <meshStandardMaterial color="#9ca3af" wireframe />
      </mesh>
      <Html
        position={[0, 0, length / 2 + 20]}
        center
        distanceFactor={10}
      >
        <div className="bg-gray-800 text-white text-[5px] px-2 py-0.5 rounded shadow-lg whitespace-nowrap font-bold uppercase">
          Tank width: {width} mm
        </div>
      </Html>

      {/* Water Level */}
      <mesh position={[0, waterLevel / 2, 0]}>
        <boxGeometry args={[width - 10, waterLevel, length - 10]} />
        <meshStandardMaterial
          color="#3b82f6"
          transparent
          opacity={0.3}
          roughness={0}
          metalness={0.5}
        />
      </mesh>

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[width + 1000, length + 1000]} />
        <meshStandardMaterial color="#f3f4f6" />
      </mesh>



    </group>
  );
};

const MembraneFrame = ({
  position,
  width,
  length,
  height,
  membraneQty,
  label,
  rotation = 0
}: {
  position: [number, number, number];
  width: number;
  length: number;
  height: number;
  membraneQty: number;
  label: string;
  rotation?: number;
}) => {
  // Calculate membrane positions within frame
  const membranes = useMemo(() => {
    const items = [];
    const spacing = length / (membraneQty + 1);
    for (let i = 0; i < membraneQty; i++) {
      items.push({
        pos: [-length / 2 + (i + 1) * spacing, 0, 0]
      });
    }
    return items;
  }, [membraneQty, length]);

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Frame Structure */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[length, height, width]} />
        <meshStandardMaterial color="#4b5563" transparent opacity={0.2} />
      </mesh>

      {/* Frame Edges */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[length, height, width]} />
        <meshStandardMaterial color="#1f2937" wireframe />
      </mesh>

      {/* Membranes */}
      {membranes.map((m, idx) => (
        <mesh key={idx} position={[m.pos[0], height / 2, 0]}>
          <boxGeometry args={[10, height - 100, width - 40]} />
          <meshStandardMaterial color="#10b981" roughness={0.5} />
        </mesh>
      ))}

      {/* Label */}
      <Html position={[0, height + 200, 0]} center>
        <div className="bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded shadow-lg whitespace-nowrap font-bold uppercase">
          {label} ({membraneQty} M)
        </div>
      </Html>
    </group>
  );
};

// --- Main Component ---

const Mbr3DLayout: React.FC = () => {
  const [inputs, setInputs] = useState({
    capacity: 160,
    flux: 15,
    hours: 20,
    model: 'BF100Oxy'
  });

  const [viewMode, setViewMode] = useState<'3D' | 'Plan' | 'Side'>('3D');
  const [placement, setPlacement] = useState<'Horizontal' | 'Vertical'>('Horizontal');

  const calculations = useMemo(() => {
    const { capacity, flux, hours, model } = inputs;
    const data = membraneData[model];
    const area = data.area;
    const height = data.height;
    const width = data.width;

    const qty = Math.ceil((capacity * 1000) / (area * flux * hours));

    let frames = 1;
    let config = "";
    let perFrame = 0;
    let frameLength = 0;
    let frameWidth = 0;
    let frameHeight = 0;
    let HorizontalTankLength = 0, HorizontalTankWidth = 0, VerticalTankLength = 0, VerticalTankWidth = 0, WaterLevelHeight = 0, TotalTankHeight = 0, TankVolumeHorizontal = 0, TankVolumeVertical = 0;


    // IF bf uSE THIS ELSE if sus
    if (model.startsWith('BF')) {
      if (qty > 25) {
        frames = Math.pow(2, Math.ceil(Math.log(qty / 25) / Math.log(2)));
        config = qty <= 25 ? "1 Single Skid" : (Math.ceil(frames / 2)) + " Double Skid";
        perFrame = Math.ceil(qty / frames);
        frameLength = ((perFrame + 1) * (perFrame < 25 ? 80 : 85)) + (perFrame < 25 ? 80 : 100);
        frameWidth = width + (perFrame <= 25 ? 80 : 100);
        frameHeight = height + 300;

        // Tank Dimensions
        HorizontalTankLength = (frameLength + 100) * (frames / Math.ceil(frames / 2)) + 500;
        HorizontalTankWidth = (frameWidth + 100) * Math.ceil(frames / 2) + 500;

        VerticalTankLength = ((frameWidth * frames) + ((frames - 1) * 100)) + 600;
        VerticalTankWidth = frameLength + 600;

        WaterLevelHeight = frameHeight + 300;
        TotalTankHeight = WaterLevelHeight + 400;

        TankVolumeHorizontal = Math.ceil(((HorizontalTankLength / 1000) * (HorizontalTankWidth / 1000) * (TotalTankHeight / 1000)) * 100) / 100;
        TankVolumeVertical = Math.ceil(((VerticalTankLength / 1000) * (VerticalTankWidth / 1000) * (TotalTankHeight / 1000)) * 100) / 100;
      }

    } else if (model.startsWith('SUS')) {
      frames = Math.ceil(qty / 40);
      config = qty <= 40 ? "1 Single Skid" : Math.ceil((frames / 2) + 1) + " Single Skid";
      perFrame = Math.ceil(qty / frames);
      frameLength = ((perFrame * 33) + (15 * perFrame) + 100);
      frameWidth = width + 100;
      frameHeight = height + 300;

      // Tank Dimensions
      HorizontalTankLength = (frameLength * (frames === 1 ? 1 : 2)) + (((frames === 1 ? 1 : 2) - 1) * 100) + 600;
      HorizontalTankWidth = (frameWidth * (frames === 1 ? 1 : Math.ceil(frames / 2))) + (((frames === 1 ? 1 : Math.ceil(frames / 2)) - 1) * 100) + 600;

      VerticalTankLength = ((frameWidth * frames) + ((frames - 1) * 100)) + 600;
      VerticalTankWidth = frameLength + 600;

      WaterLevelHeight = frameHeight + 300;
      TotalTankHeight = WaterLevelHeight + 400;

      TankVolumeHorizontal = Math.ceil(((HorizontalTankLength / 1000) * (HorizontalTankWidth / 1000) * (TotalTankHeight / 1000)) * 100) / 100;
      TankVolumeVertical = Math.ceil(((VerticalTankLength / 1000) * (VerticalTankWidth / 1000) * (TotalTankHeight / 1000)) * 100) / 100;
    }

    return {
      qty,
      frames,
      perFrame,
      config,
      frameLength,
      frameWidth,
      frameHeight,
      HorizontalTankLength, HorizontalTankWidth, VerticalTankLength, VerticalTankWidth, WaterLevelHeight, TotalTankHeight, TankVolumeHorizontal, TankVolumeVertical,
      area
    };
  }, [inputs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: name === 'model' ? value : Number(value) }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 p-2 rounded-lg text-white">
            <Maximize className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">MBR 3D Layout Designer</h1>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Membrane Frame & Tank Visualization</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg no-print">
          {(['Plan', 'Side', '3D'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === mode
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {mode}
            </button>
          ))}
          <button type="button" onClick={() => window.print()} className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-1.5 px-3 rounded text-[11px] transition-all flex items-center justify-center gap-2 mt-1 no-print">
                              <Printer className="w-3 h-3" /> Print
                            </button>
        </div>
      </div>

      <div className="flex-grow flex overflow-hidden bg-gray-50 rounded-b-xl border border-gray-200 print:flex print:flex-col">
        {/* Sidebar Controls */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto p-6 space-y-6 print:w-full print:flex print:flex-col-3 print:gap-3 print:text-[10px] print:px-[6px] print:py-[10px]">
          <section className="space-y-4 print:w-full print:text-[10px] print:px-[6px] print:py-[10px]">
            <div className="flex items-center gap-2 text-purple-700 border-b border-purple-100 pb-2">
              <Settings2 className="w-4 h-4" />
              <h2 className="text-xs font-bold uppercase tracking-tight">Input Parameters</h2>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Placement Type</label>
                <div className="flex gap-2">
                  {(['Horizontal', 'Vertical'] as const).map(type => (
                    <label key={type} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${placement === type
                      ? 'bg-purple-50 border-purple-200 text-purple-700 font-bold'
                      : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'
                      }`}>
                      <input
                        type="radio"
                        name="placement"
                        value={type}
                        checked={placement === type}
                        onChange={() => setPlacement(type)}
                        className="hidden"
                      />
                      <span className="text-xs">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Plant Capacity (KLD)</label>
                <input
                  type="number"
                  name="capacity"
                  value={inputs.capacity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Membrane Model</label>
                <select
                  name="model"
                  value={inputs.model}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <optgroup label="BF Series">
                    {Object.keys(membraneData)
                      .filter(m => m.startsWith('BF'))
                      .map(m => <option key={m} value={m}>{m}</option>)}
                  </optgroup>

                  <optgroup label="SUS Series">
                    {Object.keys(membraneData)
                      .filter(m => m.startsWith('SUS'))
                      .map(m => <option key={m} value={m}>{m}</option>)}
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Flux (LMH)</label>
                  <input
                    type="number"
                    name="flux"
                    value={inputs.flux}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Hours/Day</label>
                  <input
                    type="number"
                    name="hours"
                    value={inputs.hours}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4 print:w-full print:text-[10px] print:px-[6px] print:py-[10px]">
            <div className="flex items-center gap-2 text-emerald-700 border-b border-emerald-100 pb-2">
              <Calculator className="w-4 h-4" />
              <h2 className="text-xs font-bold uppercase tracking-tight">Calculations</h2>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <StatItem label="Total Membranes" value={calculations.qty} unit="Nos" />
              <StatItem label="No. of Frames" value={calculations.frames} unit="Nos" />
              <StatItem label="Configuration" value={calculations.config} unit="" />
              <StatItem label="Membrane/Frame" value={calculations.perFrame} unit="Nos" />
              <StatItem label="Surface Area" value={calculations.area} unit="m²" />
            </div>
          </section>

          <section className="space-y-4 print:w-full print:text-[10px] print:px-[6px] print:py-[10px]">
            <div className="flex items-center gap-2 text-blue-800 border-b border-blue-100 pb-2">
              <Box className="w-4 h-4" />
              <h2 className="text-xs font-bold uppercase tracking-tight">Tank Dimensions</h2>
            </div>

            <div className="space-y-4">
              <div className={`p-3 rounded-lg border ${calculations.TankVolumeHorizontal > calculations.TankVolumeVertical ? 'bg-red-100 border-red-100' : 'bg-green-100 border-green-100'}`}>

                <p className="text-[10px] font-bold text-gray-800 uppercase mb-2">Horizontal Skid</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <DimensionItem label="L" value={calculations.HorizontalTankLength} />
                  <DimensionItem label="W" value={calculations.HorizontalTankWidth} />
                  <DimensionItem label="H" value={calculations.TotalTankHeight} />
                  <DimensionItem label="Vol" value={calculations.TankVolumeHorizontal} unit="m³" />
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${calculations.TankVolumeHorizontal < calculations.TankVolumeVertical ? 'bg-red-100 border-red-100' : 'bg-green-100 border-green-100'}`}>
                <p className="text-[10px] font-bold text-gray-800 uppercase mb-2">Vertical Skid</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <DimensionItem label="L" value={calculations.VerticalTankLength} />
                  <DimensionItem label="W" value={calculations.VerticalTankWidth} />
                  <DimensionItem label="H" value={calculations.TotalTankHeight} />
                  <DimensionItem label="Vol" value={calculations.TankVolumeVertical} unit="m³" />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* 3D Viewport */}
        <div className="flex-grow relative bg-gray-900">
          <Canvas shadows camera={{ position: [15, 15, 15], fov: 45, far: 1000 }}>
            <Suspense fallback={null}>
              <PerspectiveCamera
                makeDefault
                position={viewMode === 'Plan' ? [0, 30, 0] : viewMode === 'Side' ? [30, 0, 0] : [15, 15, 15]}
                fov={45}
                far={1000}
              />

              <OrbitControls
                enableDamping
                dampingFactor={0.05}
                maxPolarAngle={viewMode === 'Plan' ? 0 : Math.PI / 2}
                minPolarAngle={viewMode === 'Plan' ? 0 : 0}
              />

              <ambientLight intensity={0.5} />
              <pointLight position={[20, 20, 20]} intensity={1} castShadow />
              <spotLight position={[-20, 20, 10]} angle={0.15} penumbra={1} intensity={0.5} />

              <group scale={0.001}>
                {/* Tank */}
                <Tank
                  width={placement === 'Horizontal' ? calculations.HorizontalTankWidth : calculations.VerticalTankWidth}
                  length={placement === 'Horizontal' ? calculations.HorizontalTankLength : calculations.VerticalTankLength}
                  height={calculations.TotalTankHeight}
                  waterLevel={calculations.WaterLevelHeight}
                />

                {/* Frames Layout */}
                {Array.from({ length: calculations.frames }).map((_, idx) => {
                  let xPos = 0;
                  let zPos = 0;
                  let rotation = 0;

                  if (placement === 'Horizontal') {
                    // Tank X is HorizontalTankWidth (uses width), Tank Z is HorizontalTankLength (uses length)
                    // Frame should have Width along X, Length along Z
                    // MembraneFrame local X is length, local Z is width. 
                    // So we rotate 90 deg (PI/2) to swap them.
                    const framesPerRow = Math.ceil(calculations.frames / 2);
                    const numRows = Math.ceil(calculations.frames / framesPerRow);
                    const row = Math.floor(idx / framesPerRow);
                    const col = idx % framesPerRow;

                    // col is along X (Width), row is along Z (Length)
                    xPos = (col - (framesPerRow - 1) / 2) * (calculations.frameWidth + 100);
                    zPos = (row - (numRows - 1) / 2) * (calculations.frameLength + 100);
                    rotation = Math.PI / 2;
                  } else {
                    // Vertical Placement (Single Row)
                    // Tank X is VerticalTankWidth (uses length), Tank Z is VerticalTankLength (uses width)
                    // Frame should have Length along X, Width along Z
                    // MembraneFrame local X is length, local Z is width.
                    // So rotation = 0.
                    xPos = 0;
                    zPos = (idx - (calculations.frames - 1) / 2) * (calculations.frameWidth + 100);
                    rotation = 0;
                  }

                  return (
                    <MembraneFrame
                      key={idx}
                      position={[xPos, 100, zPos]}
                      width={calculations.frameWidth}
                      length={calculations.frameLength}
                      height={calculations.frameHeight}
                      membraneQty={calculations.perFrame}
                      label={`Frame ${idx + 1}`}
                      rotation={rotation}
                    />
                  );
                })}
              </group>

              <Grid
                infiniteGrid
                fadeDistance={50}
                fadeStrength={5}
                cellSize={1}
                sectionSize={5}
                sectionColor="#334155"
                cellColor="#1e293b"
              />

              <Environment preset="city" />
              <ContactShadows position={[0, -0.01, 0]} opacity={0.4} scale={40} blur={2.4} far={10} />
            </Suspense>
          </Canvas>

          {/* Legend */}
          <div className="absolute bottom-6 left-6 bg-black/50 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white space-y-3 pointer-events-none">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Membrane Modules</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-600"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Skid Frame</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500/50"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Water Level</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border border-white/30"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Tank Boundary</span>
            </div>
          </div>

          {/* View Info */}
          <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Use mouse to rotate & zoom</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ label, value, unit }: { label: string; value: any; unit: string }) => (
  <div className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
    <span className="text-[10px] font-medium text-gray-500 uppercase">{label}</span>
    <div className="flex items-baseline gap-1">
      <span className="text-sm font-bold text-gray-900">{value}</span>
      <span className="text-[8px] font-bold text-gray-400 uppercase">{unit}</span>
    </div>
  </div>
);

const DimensionItem = ({ label, value, unit = 'mm' }: { label: string; value: any; unit?: string }) => (
  <div className="flex items-baseline gap-1">
    <span className="text-[9px] font-bold text-gray-400 w-4">{label}:</span>
    <span className="text-xs font-bold text-gray-700">{value}</span>
    <span className="text-[8px] text-gray-400">{unit}</span>
  </div>
);

export default Mbr3DLayout;
