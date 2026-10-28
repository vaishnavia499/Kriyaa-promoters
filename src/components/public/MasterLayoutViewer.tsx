import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  Layers,
  MapPin,
  ExternalLink,
  Sparkles,
  Info,
  Maximize2,
  Navigation,
  Eye,
  CheckCircle2,
  TreePine,
  Car,
  Box,
} from 'lucide-react';
import { Property, LayoutDisplayMode, PropertyStatus, Project } from '../../types';

interface MasterLayoutViewerProps {
  project: Project;
  plots: Property[];
  selectedPlot: Property | null;
  onSelectPlot: (plot: Property) => void;
  displayMode: LayoutDisplayMode;
  onModeChange: (mode: LayoutDisplayMode) => void;
}

export const MasterLayoutViewer: React.FC<MasterLayoutViewerProps> = ({
  project,
  plots,
  selectedPlot,
  onSelectPlot,
  displayMode,
  onModeChange,
}) => {
  // CAD Drawing color toggle: 'coloured' | 'uncoloured'
  const [cadColorMode, setCadColorMode] = useState<'coloured' | 'uncoloured'>('coloured');

  // Helper to determine plot styles based on status and CAD mode
  const getPlotCadStyle = (plot: Property, isSelected: boolean) => {
    if (cadColorMode === 'uncoloured') {
      return {
        fill: isSelected ? '#FEF08A' : '#FFFFFF',
        stroke: '#1E293B',
        strokeWidth: isSelected ? '2.5' : '1.2',
        textColor: '#0F172A',
      };
    }

    if (plot.status === 'Reserved') {
      return {
        fill: isSelected ? '#FDE047' : '#FEF3C7',
        stroke: '#CA8A04',
        strokeWidth: isSelected ? '2.5' : '1.5',
        textColor: '#854D0E',
      };
    }

    if (plot.status === 'Sold') {
      return {
        fill: isSelected ? '#FCA5A5' : '#FEE2E2',
        stroke: '#DC2626',
        strokeWidth: isSelected ? '2.5' : '1.5',
        textColor: '#991B1B',
      };
    }

    // Available
    return {
      fill: isSelected ? '#86EFAC' : '#DCFCE7',
      stroke: '#16A34A',
      strokeWidth: isSelected ? '2.5' : '1.5',
      textColor: '#14532D',
    };
  };

  const layoutImageSrc = project.layoutImageUrl || project.masterPlanImage;

  return (
    <div className="w-full bg-white dark:bg-[#0B2516] rounded-3xl border border-slate-200 dark:border-[#1E5D32] p-4 sm:p-6 shadow-xl space-y-4 select-none">
      {/* ─────────────────────────────────────────────────────────────
          SECONDARY SEGMENTED CONTROL: 4 LAYOUT DISPLAY MODES
          Mode 1: 2D Vector Blueprint (CAD)
          Mode 2: 2D Top-Down Master Render (Uploaded Blueprint + Overlaid Boundaries)
          Mode 3: 3D Perspective Bird’s Eye View (Generated from boundary coordinates)
          Mode 4: Live Satellite & GPS Map
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#1E5D32]/60">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-[#15803D]/10 text-[#15803D] dark:text-emerald-400">
            <Layers className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              Layout Visualization View
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Select any plot boundary to inspect real-time measurements &amp; bank loan estimates.
            </p>
          </div>
        </div>

        {/* Segmented Mode Switcher */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#112F1C] rounded-2xl border border-slate-200 dark:border-[#1E5D32]">
          <button
            type="button"
            onClick={() => onModeChange('topdown')}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              displayMode === 'topdown'
                ? 'bg-[#15803D] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>2D Master Layout</span>
          </button>

          <button
            type="button"
            onClick={() => onModeChange('blueprint')}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              displayMode === 'blueprint'
                ? 'bg-[#15803D] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>2D CAD Blueprint</span>
          </button>

          <button
            type="button"
            onClick={() => onModeChange('isometric')}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              displayMode === 'isometric'
                ? 'bg-[#15803D] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>3D Bird’s Eye View</span>
          </button>

          <button
            type="button"
            onClick={() => onModeChange('satellite')}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              displayMode === 'satellite'
                ? 'bg-[#15803D] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Satellite &amp; GPS</span>
          </button>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-500 dark:text-slate-400">Plot Status:</span>
          <div className="flex items-center gap-3 text-[11px] font-bold">
            <span className="flex items-center gap-1 text-[#15803D] dark:text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]" />
              Available ({plots.filter((p) => p.status === 'Available').length})
            </span>
            <span className="flex items-center gap-1 text-[#CA8A04] dark:text-[#EAB308]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" />
              Reserved ({plots.filter((p) => p.status === 'Reserved').length})
            </span>
            <span className="flex items-center gap-1 text-[#991B1B] dark:text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-[#991B1B]" />
              Sold ({plots.filter((p) => p.status === 'Sold').length})
            </span>
          </div>
        </div>

        {displayMode === 'blueprint' && (
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-500 dark:text-slate-400">CAD Scheme:</span>
            <div className="inline-flex rounded-xl p-0.5 bg-slate-100 dark:bg-[#112F1C] border border-slate-200 dark:border-[#1E5D32]">
              <button
                type="button"
                onClick={() => setCadColorMode('coloured')}
                className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  cadColorMode === 'coloured'
                    ? 'bg-white dark:bg-[#15803D] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Coloured
              </button>
              <button
                type="button"
                onClick={() => setCadColorMode('uncoloured')}
                className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  cadColorMode === 'uncoloured'
                    ? 'bg-white dark:bg-[#15803D] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Clean CAD
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          VIEWPORT CONTAINER (Dynamic depending on active mode)
          ───────────────────────────────────────────────────────────── */}
      <div className="relative w-full rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-[#1E5D32] bg-slate-50 dark:bg-[#07170E] min-h-[460px] sm:min-h-[540px] flex items-center justify-center p-2 sm:p-4">
        {/* ─── MODE 2 (DEFAULT): 2D TOP-DOWN MASTER RENDER WITH OVERLAID BOUNDARIES ─── */}
        {displayMode === 'topdown' && (
          <div className="relative w-full max-w-5xl aspect-[16/10] sm:aspect-[16/11] rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-emerald-800/60 bg-slate-950">
            {/* Background Layout Blueprint Image */}
            <img
              src={layoutImageSrc}
              alt={project.name}
              className="w-full h-full object-cover select-none pointer-events-none"
              draggable={false}
            />

            {/* Overlaid Verified Plot Boundaries */}
            {plots.map((plot, idx) => {
              const isSelected = selectedPlot?.id === plot.id;
              const b = plot.boundary || {
                x: 10 + (idx % 6) * 14,
                y: 20 + Math.floor(idx / 6) * 18,
                width: 11,
                height: 14,
              };

              const statusColor =
                plot.status === 'Sold'
                  ? 'border-red-500 bg-red-600/30 text-white hover:bg-red-600/40'
                  : plot.status === 'Reserved'
                  ? 'border-amber-400 bg-amber-500/35 text-amber-100 hover:bg-amber-500/45'
                  : 'border-emerald-400 bg-emerald-600/35 text-emerald-100 hover:bg-emerald-600/45';

              return (
                <div
                  key={plot.id}
                  onClick={() => onSelectPlot(plot)}
                  style={{
                    left: `${b.x}%`,
                    top: `${b.y}%`,
                    width: `${b.width}%`,
                    height: `${b.height}%`,
                  }}
                  className={`absolute rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center p-1 text-center font-bold backdrop-blur-xs select-none shadow-md ${statusColor} ${
                    isSelected
                      ? 'ring-4 ring-[#EAB308] scale-105 z-30 shadow-2xl brightness-110'
                      : 'hover:scale-102 z-10'
                  }`}
                >
                  <span className="text-[11px] sm:text-xs font-black drop-shadow-md">
                    #{plot.plotNumber}
                  </span>
                  <span className="text-[9px] font-semibold opacity-90 truncate max-w-full">
                    {plot.facing}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-black text-[#EAB308]">
                    ₹{(plot.totalPrice / 100000).toFixed(1)}L
                  </span>
                </div>
              );
            })}

            {/* Bottom Overlay Info Tag */}
            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-sm border border-white/10 text-white text-xs flex items-center gap-2 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-[#15803D] animate-ping" />
              <span>{project.name} · Click any plot parcel to inspect</span>
            </div>
          </div>
        )}

        {/* ─── MODE 1: 2D VECTOR BLUEPRINT (CLEAN CAD DRAWING) ─── */}
        {displayMode === 'blueprint' && (
          <div className="w-full h-full flex flex-col items-center justify-center overflow-x-auto p-2">
            <svg
              viewBox="0 0 920 620"
              className="w-full max-w-4xl h-auto drop-shadow-md select-none transition-all"
              style={{ minWidth: '600px' }}
            >
              <defs>
                <pattern id="cadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2E8F0" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="920" height="620" fill={cadColorMode === 'uncoloured' ? '#FAFBFD' : '#F8FAFC'} />
              <rect width="920" height="620" fill="url(#cadGrid)" opacity="0.6" />

              {/* Layout Outer Border */}
              <rect x="25" y="25" width="870" height="570" fill="none" stroke="#0F172A" strokeWidth="2.5" />

              {/* Compass */}
              <g transform="translate(830, 75)">
                <circle cx="0" cy="0" r="28" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
                <polygon points="0,-22 7,-3 0,0" fill="#0F172A" />
                <polygon points="0,-22 -7,-3 0,0" fill="#CA8A04" />
                <polygon points="0,22 7,3 0,0" fill="#94A3B8" />
                <text x="0" y="-25" textAnchor="middle" fontSize="13" fontWeight="900" fill="#0F172A">N</text>
              </g>

              {/* Entrance Arch */}
              <g transform="translate(40, 35)">
                <rect x="0" y="0" width="200" height="36" fill="#0B2516" rx="4" />
                <text x="100" y="22" textAnchor="middle" fill="#EAB308" fontSize="11" fontWeight="900" letterSpacing="1">
                  MAIN ENTRANCE (60' ROAD)
                </text>
              </g>

              {/* Dynamic CAD Plots mapped from verified boundary */}
              {plots.map((plot, idx) => {
                const isSelected = selectedPlot?.id === plot.id;
                const style = getPlotCadStyle(plot, isSelected);

                // Derive pixel positioning from verified boundary percentage
                const b = plot.boundary || {
                  x: 10 + (idx % 6) * 14,
                  y: 20 + Math.floor(idx / 6) * 18,
                  width: 11,
                  height: 14,
                };

                const pxX = 40 + (b.x / 100) * 820;
                const pxY = 40 + (b.y / 100) * 520;
                const pxW = Math.max(70, (b.width / 100) * 820);
                const pxH = Math.max(65, (b.height / 100) * 520);

                return (
                  <g
                    key={plot.id}
                    onClick={() => onSelectPlot(plot)}
                    className="cursor-pointer transition-transform hover:opacity-90"
                  >
                    <rect
                      x={pxX}
                      y={pxY}
                      width={pxW}
                      height={pxH}
                      fill={style.fill}
                      stroke={style.stroke}
                      strokeWidth={style.strokeWidth}
                      rx="4"
                    />
                    <text x={pxX + pxW / 2} y={pxY + 22} textAnchor="middle" fontSize="12" fontWeight="900" fill={style.textColor}>
                      #{plot.plotNumber}
                    </text>
                    <text x={pxX + pxW / 2} y={pxY + 38} textAnchor="middle" fontSize="9.5" fontWeight="bold" fill={style.textColor}>
                      {plot.facing}
                    </text>
                    <text x={pxX + pxW / 2} y={pxY + 54} textAnchor="middle" fontSize="10" fontWeight="900" fill={style.textColor}>
                      ₹{(plot.totalPrice / 100000).toFixed(1)}L
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* ─── MODE 3: 3D PERSPECTIVE BIRD’S EYE VIEW (FROM VERIFIED BOUNDARIES) ─── */}
        {displayMode === 'isometric' && (
          <div className="relative w-full h-full min-h-[500px] flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-[#0F2818] via-[#081B10] to-[#04120A] p-4">
            <div
              className="relative w-full max-w-4xl aspect-[16/10] p-6 flex flex-col justify-between"
              style={{
                transform: 'perspective(1000px) rotateX(24deg) rotateY(-2deg)',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* 3D Township Perimeter Base */}
              <div className="absolute inset-0 rounded-3xl border-4 border-[#CA8A04]/80 shadow-[0_25px_50px_rgba(0,0,0,0.8)] bg-[#0B2516]/95 backdrop-blur-md p-6 overflow-hidden">
                <div className="flex items-center justify-between text-white text-xs border-b border-emerald-500/30 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#EAB308] animate-ping" />
                    <span className="font-black text-[#EAB308] uppercase tracking-wider">
                      3D PERSPECTIVE GEOMETRY VIEW · {project.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-200">Generated from verified plot boundaries</span>
                </div>

                {/* 3D Extruded Plots Grid */}
                <div className="relative w-full h-full pt-4">
                  {plots.map((plot, idx) => {
                    const isSelected = selectedPlot?.id === plot.id;
                    const b = plot.boundary || {
                      x: 10 + (idx % 6) * 14,
                      y: 20 + Math.floor(idx / 6) * 18,
                      width: 11,
                      height: 14,
                    };

                    const statusBg =
                      plot.status === 'Sold'
                        ? 'bg-red-800/90 border-red-500 text-white'
                        : plot.status === 'Reserved'
                        ? 'bg-amber-600/90 border-amber-300 text-slate-950'
                        : 'bg-emerald-600/90 border-emerald-300 text-white';

                    return (
                      <div
                        key={plot.id}
                        onClick={() => onSelectPlot(plot)}
                        style={{
                          left: `${b.x}%`,
                          top: `${b.y}%`,
                          width: `${b.width}%`,
                          height: `${b.height}%`,
                          transform: isSelected ? 'translateZ(35px) scale(1.08)' : 'translateZ(12px)',
                          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }}
                        className={`absolute rounded-xl border-2 p-1.5 flex flex-col items-center justify-center text-center cursor-pointer shadow-2xl select-none ${statusBg} ${
                          isSelected ? 'ring-4 ring-[#EAB308] z-30 shadow-[#EAB308]/40' : 'hover:translate-z-4 z-10'
                        }`}
                      >
                        <span className="text-[10px] sm:text-xs font-black">#{plot.plotNumber}</span>
                        <span className="text-[8px] sm:text-[9px] font-semibold opacity-90 truncate max-w-full">
                          {plot.plotDimensions}
                        </span>
                        <span className="text-[9px] font-black text-amber-200">
                          ₹{(plot.totalPrice / 100000).toFixed(1)}L
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom 3D Helper Note */}
            <div className="absolute bottom-4 inset-x-4 flex items-center justify-between text-xs text-emerald-200/90 bg-black/70 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
              <span className="flex items-center gap-1.5">
                <Box className="w-4 h-4 text-[#EAB308]" />
                <span>3D Architectural Isometric Extrusions</span>
              </span>
              <span className="text-[#EAB308] font-bold">Click any plot to inspect &amp; sync</span>
            </div>
          </div>
        )}

        {/* ─── MODE 4: LIVE SATELLITE & GOOGLE MAPS INTEGRATION ─── */}
        {displayMode === 'satellite' && (
          <div className="relative w-full h-full min-h-[500px] flex flex-col justify-between overflow-hidden rounded-xl bg-slate-950">
            {/* Satellite Base Image */}
            <img
              src="https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=1600&q=85"
              alt="Satellite Boundary"
              className="absolute inset-0 w-full h-full object-cover select-none"
            />
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[0.5px]" />

            {/* Overlaid Verified Site Pin & Boundaries */}
            <div className="absolute inset-6 sm:inset-12 border-3 border-dashed border-[#EAB308] rounded-3xl shadow-2xl bg-[#15803D]/15 flex items-center justify-center pointer-events-none">
              <div className="p-5 rounded-2xl bg-black/85 backdrop-blur-md text-white border border-[#EAB308]/60 text-center max-w-md pointer-events-auto shadow-2xl space-y-2">
                <MapPin className="w-8 h-8 text-[#EAB308] mx-auto animate-bounce" />
                <h4 className="text-base font-black">{project.name} Verified Geolocation</h4>
                <p className="text-xs text-emerald-300 font-mono">
                  {project.geoCoordinates
                    ? `${project.geoCoordinates.lat.toFixed(4)}° N, ${project.geoCoordinates.lng.toFixed(4)}° E`
                    : '11.7480° N, 79.7714° E'}
                  {' · '}{project.location}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sanctioned DTCP layout boundary with direct frontage on the National Highway Corridor.
                </p>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${project.name} ${project.location}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#15803D] hover:bg-[#113B24] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Plot Georeferencing Strip */}
            <div className="relative z-10 p-3 bg-black/75 backdrop-blur-md flex items-center justify-between text-xs text-white border-t border-white/10">
              <span>{project.district} · {project.totalAreaExtent || 'Sanctioned Layout'}</span>
              <span className="text-[#EAB308] font-bold">DTCP No: {project.dtcpNumber}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
