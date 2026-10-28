import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Upload,
  FileSpreadsheet,
  Layers,
  Save,
  CheckCircle2,
  Trash2,
  Eye,
  Plus,
  RefreshCw,
  Compass,
  Building2,
  ShieldCheck,
  MousePointer,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEFAULT_GOLDEN_HOTSPOTS } from '../../data/publicData';
import { HotspotBox, PropertyStatus } from '../../types';

export const OwnerHotspotSimulator: React.FC = () => {
  const { projects, properties, showToast, settings } = useApp();

  // Active Layout Blueprint Render for simulator
  const [renderImage, setRenderImage] = useState<string>(
    'https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=1400&q=85'
  );

  // Mapped hotspots state
  const [hotspots, setHotspots] = useState<HotspotBox[]>(() => {
    try {
      const saved = localStorage.getItem('kriyaa_owner_hotspots_v1');
      return saved ? JSON.parse(saved) : DEFAULT_GOLDEN_HOTSPOTS;
    } catch {
      return DEFAULT_GOLDEN_HOTSPOTS;
    }
  });

  // Selected hotspot for editing
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);

  // Drawing state
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Form for newly selected or clicked hotspot
  const activeHotspot = hotspots.find((h) => h.id === selectedHotspotId) || null;

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawingMode || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    const newPlotNumber = String(hotspots.length + 1).padStart(2, '0');
    const newHotspot: HotspotBox = {
      id: `hs-${Date.now()}`,
      plotNumber: newPlotNumber,
      x: Math.max(1, Math.min(88, Math.round(clickX))),
      y: Math.max(1, Math.min(85, Math.round(clickY))),
      width: 11,
      height: 14,
      dimensions: '30x40 ft',
      facing: 'North',
      status: 'Available',
      priceLakhs: 25.2,
    };

    setHotspots((prev) => [...prev, newHotspot]);
    setSelectedHotspotId(newHotspot.id);
    setIsDrawingMode(false);
    showToast(`Added Hotspot for Plot #${newPlotNumber}`, 'success');
  };

  const handleUpdateHotspot = (id: string, updates: Partial<HotspotBox>) => {
    setHotspots((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...updates } : h))
    );
  };

  const handleDeleteHotspot = (id: string) => {
    setHotspots((prev) => prev.filter((h) => h.id !== id));
    if (selectedHotspotId === id) setSelectedHotspotId(null);
    showToast('Hotspot boundary removed', 'info');
  };

  const handleSaveAll = () => {
    try {
      localStorage.setItem('kriyaa_owner_hotspots_v1', JSON.stringify(hotspots));
      showToast('Hotspot boundaries saved to Master Plan!', 'success');
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetDefaults = () => {
    setHotspots(DEFAULT_GOLDEN_HOTSPOTS);
    localStorage.removeItem('kriyaa_owner_hotspots_v1');
    showToast('Reset to default Golden City hotspot blueprint', 'info');
  };

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setRenderImage(event.target.result as string);
          showToast('Uploaded new architectural master render', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full space-y-6 select-none">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER TITLE & EXPLANATION
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#113B24] via-[#15803D] to-[#0B2516] rounded-3xl p-6 sm:p-8 text-white border border-[#1E5D32] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#EAB308]">
            <Sparkles className="w-4 h-4" />
            <span>OWNER VISUAL HOTSPOT SIMULATOR</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-white">
            Architectural Render to Interactive Blueprint Mapper
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
            Designed for <span className="text-[#EAB308] font-bold">Rajesh RTR</span>: Upload any 3D layout render or CAD plan, load inventory numbers, and click to define clickable plot boxes without writing a single line of code.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleSaveAll}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-[#EAB308] hover:bg-[#ca8a04] text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Hotspots</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. WORKFLOW STEPPER RIBBON
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {[
          { step: '01', title: 'Upload Render', desc: 'Load 3D orthographic JPEG/PNG' },
          { step: '02', title: 'Import Inventory', desc: 'Sync with 18 Golden City plots' },
          { step: '03', title: 'Click & Map Boxes', desc: 'Click canvas to define boundaries' },
          { step: '04', title: 'Publish Live', desc: 'Instantly synced on public website' },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white dark:bg-[#0B2516] border border-slate-200 dark:border-[#1E5D32] shadow-sm flex items-start gap-3"
          >
            <span className="text-lg font-black text-[#15803D] dark:text-emerald-400 font-mono">
              {item.step}
            </span>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                {item.title}
              </h4>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN CANVAS & HOTSPOT EDITOR SPLIT VIEW
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Render Canvas (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0B2516] rounded-3xl border border-slate-200 dark:border-[#1E5D32] p-4 sm:p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#1E5D32]">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-[#15803D]">
                <MousePointer className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Visual Mapping Canvas ({hotspots.length} Plots Mapped)
                </h3>
                <p className="text-[11px] text-slate-500">
                  {isDrawingMode
                    ? '🎯 Drawing Mode Active: Click anywhere on the render to place a plot box.'
                    : 'Click any box to inspect / edit coordinates on right.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#112F1C] hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Custom Render</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomImageUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => setIsDrawingMode(!isDrawingMode)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  isDrawingMode
                    ? 'bg-[#EAB308] text-slate-950 ring-2 ring-[#EAB308]/40 animate-pulse'
                    : 'bg-[#15803D] text-white hover:bg-[#113B24]'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isDrawingMode ? 'Click Canvas to Place' : '+ Add Plot Box'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Image Canvas */}
          <div
            ref={canvasRef}
            onClick={handleCanvasClick}
            className={`relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-900 shadow-inner select-none ${
              isDrawingMode ? 'cursor-crosshair ring-4 ring-[#EAB308]' : 'cursor-default'
            }`}
          >
            {/* Background Render */}
            <img
              src={renderImage}
              alt="Architectural Master Render"
              className="w-full h-full object-cover pointer-events-none"
            />
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />

            {/* Rendered Hotspot Boxes */}
            {hotspots.map((box) => {
              const isSelected = selectedHotspotId === box.id;
              let statusBorder = 'border-emerald-400 bg-[#15803D]/60 text-white';
              if (box.status === 'Reserved') {
                statusBorder = 'border-[#EAB308] bg-[#EAB308]/70 text-slate-950';
              } else if (box.status === 'Sold') {
                statusBorder = 'border-red-400 bg-red-600/70 text-white';
              }

              return (
                <div
                  key={box.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedHotspotId(box.id);
                  }}
                  style={{
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: `${box.width}%`,
                    height: `${box.height}%`,
                  }}
                  className={`absolute rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center p-1 text-center shadow-lg backdrop-blur-xs ${statusBorder} ${
                    isSelected ? 'ring-4 ring-white scale-105 z-20 shadow-2xl' : 'hover:scale-102 z-10'
                  }`}
                >
                  <span className="text-[11px] font-black leading-tight">
                    #{box.plotNumber}
                  </span>
                  <span className="text-[8.5px] font-bold opacity-90 truncate max-w-full">
                    ₹{box.priceLakhs}L
                  </span>
                </div>
              );
            })}
          </div>

          {/* Canvas Bottom Legend */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3 pt-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-bold text-[#15803D]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]" />
                Available ({hotspots.filter((h) => h.status === 'Available').length})
              </span>
              <span className="flex items-center gap-1 font-bold text-[#CA8A04]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" />
                Reserved ({hotspots.filter((h) => h.status === 'Reserved').length})
              </span>
              <span className="flex items-center gap-1 font-bold text-[#991B1B]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#991B1B]" />
                Sold ({hotspots.filter((h) => h.status === 'Sold').length})
              </span>
            </div>

            <span className="text-[11px] text-slate-400">
              Interactive Hotspot Coordinates Sync Active
            </span>
          </div>
        </div>

        {/* Right: Selected Hotspot Editor Panel (4 Cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0B2516] rounded-3xl border border-slate-200 dark:border-[#1E5D32] p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E5D32]">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Hotspot Properties
            </h3>

            {activeHotspot && (
              <button
                type="button"
                onClick={() => handleDeleteHotspot(activeHotspot.id)}
                className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                title="Delete this hotspot"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {activeHotspot ? (
            <div className="space-y-4">
              {/* Plot Number */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Plot Number Label
                </label>
                <input
                  type="text"
                  value={activeHotspot.plotNumber}
                  onChange={(e) =>
                    handleUpdateHotspot(activeHotspot.id, { plotNumber: e.target.value })
                  }
                  className="w-full text-xs font-black px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#112F1C] border border-slate-300 dark:border-[#1E5D32] text-slate-900 dark:text-white"
                />
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Status
                </label>
                <select
                  value={activeHotspot.status}
                  onChange={(e) =>
                    handleUpdateHotspot(activeHotspot.id, {
                      status: e.target.value as PropertyStatus,
                    })
                  }
                  className="w-full text-xs font-bold px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#112F1C] border border-slate-300 dark:border-[#1E5D32] text-slate-900 dark:text-white"
                >
                  <option value="Available">Available (Green)</option>
                  <option value="Reserved">Reserved (Gold)</option>
                  <option value="Sold">Sold (Crimson)</option>
                </select>
              </div>

              {/* Dimensions & Facing */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    value={activeHotspot.dimensions}
                    onChange={(e) =>
                      handleUpdateHotspot(activeHotspot.id, { dimensions: e.target.value })
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#112F1C] border border-slate-300 dark:border-[#1E5D32] text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Facing
                  </label>
                  <input
                    type="text"
                    value={activeHotspot.facing}
                    onChange={(e) =>
                      handleUpdateHotspot(activeHotspot.id, { facing: e.target.value })
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#112F1C] border border-slate-300 dark:border-[#1E5D32] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Price Lakhs */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Total Price (₹ Lakhs)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={activeHotspot.priceLakhs}
                  onChange={(e) =>
                    handleUpdateHotspot(activeHotspot.id, {
                      priceLakhs: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full text-xs font-black px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#112F1C] border border-slate-300 dark:border-[#1E5D32] text-slate-900 dark:text-white"
                />
              </div>

              {/* Coordinate Adjustments */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#1E5D32]">
                <span className="text-[11px] font-black uppercase text-slate-400 block">
                  Fine-Tune Position & Size
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block">Left X (%)</label>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      value={activeHotspot.x}
                      onChange={(e) =>
                        handleUpdateHotspot(activeHotspot.id, { x: parseInt(e.target.value) })
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block">Top Y (%)</label>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      value={activeHotspot.y}
                      onChange={(e) =>
                        handleUpdateHotspot(activeHotspot.id, { y: parseInt(e.target.value) })
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <MousePointer className="w-8 h-8 mx-auto text-slate-300" />
              <p>Click any box on the visual canvas to edit its plot properties.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
