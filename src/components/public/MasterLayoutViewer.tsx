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

  return (
    <div className="w-full bg-white dark:bg-[#0B2516] rounded-3xl border border-slate-200 dark:border-[#1E5D32] p-4 sm:p-6 shadow-xl space-y-4 select-none">
      {/* ─────────────────────────────────────────────────────────────
          SECONDARY SEGMENTED CONTROL: 4 LAYOUT DISPLAY MODES
          Mode 1: 2D Vector Blueprint (CAD)
          Mode 2: 2D Top-Down Master Render
          Mode 3: 3D Perspective Bird’s Eye View
          Mode 4: Live Satellite & Google Maps Integration
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
              Select any plot to inspect specifications below.
            </p>
          </div>
        </div>

        {/* Segmented Mode Switcher */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#112F1C] rounded-2xl border border-slate-200 dark:border-[#1E5D32]">
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
            onClick={() => onModeChange('topdown')}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              displayMode === 'topdown'
                ? 'bg-[#15803D] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>2D Top-Down Render</span>
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
            <span>Satellite & GPS</span>
          </button>
        </div>
      </div>

      {/* Sub-bar for Mode 1: Coloured vs Uncoloured Toggle */}
      {displayMode === 'blueprint' && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-500 dark:text-slate-400">Blueprint Scheme:</span>
            <div className="inline-flex rounded-xl p-0.5 bg-slate-100 dark:bg-[#112F1C] border border-slate-200 dark:border-[#1E5D32]">
              <button
                type="button"
                onClick={() => setCadColorMode('coloured')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  cadColorMode === 'coloured'
                    ? 'bg-white dark:bg-[#15803D] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Coloured (Status)
              </button>
              <button
                type="button"
                onClick={() => setCadColorMode('uncoloured')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  cadColorMode === 'uncoloured'
                    ? 'bg-white dark:bg-[#15803D] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Uncoloured (Clean CAD)
              </button>
            </div>
          </div>

          {/* Status Legend */}
          <div className="flex items-center gap-3 text-[11px] font-bold">
            <span className="flex items-center gap-1 text-[#15803D] dark:text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]" />
              Available
            </span>
            <span className="flex items-center gap-1 text-[#CA8A04] dark:text-[#EAB308]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" />
              Reserved
            </span>
            <span className="flex items-center gap-1 text-[#991B1B] dark:text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-[#991B1B]" />
              Sold
            </span>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          VIEWPORT CONTAINER (Dynamic depending on active mode)
          ───────────────────────────────────────────────────────────── */}
      <div className="relative w-full rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-[#1E5D32] bg-slate-50 dark:bg-[#07170E] min-h-[460px] sm:min-h-[540px] flex items-center justify-center p-2 sm:p-4">
        {/* ─── MODE 1: 2D VECTOR BLUEPRINT (CLEAN CAD DRAWING) ─── */}
        {displayMode === 'blueprint' && (
          <div className="w-full h-full flex flex-col items-center justify-center overflow-x-auto p-2">
            <svg
              viewBox="0 0 920 620"
              className="w-full max-w-4xl h-auto drop-shadow-md select-none transition-all"
              style={{ minWidth: '600px' }}
            >
              {/* Background Cad Paper grid lines */}
              <defs>
                <pattern id="cadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2E8F0" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="920" height="620" fill={cadColorMode === 'uncoloured' ? '#FAFBFD' : '#F8FAFC'} />
              <rect width="920" height="620" fill="url(#cadGrid)" opacity="0.6" />

              {/* Layout Boundary Outer Border with Corner Markings */}
              <rect x="25" y="25" width="870" height="570" fill="none" stroke="#0F172A" strokeWidth="2.5" />

              {/* North Arrow Compass in Top Right */}
              <g transform="translate(830, 75)">
                <circle cx="0" cy="0" r="28" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
                <polygon points="0,-22 7,-3 0,0" fill="#0F172A" />
                <polygon points="0,-22 -7,-3 0,0" fill="#CA8A04" />
                <polygon points="0,22 7,3 0,0" fill="#94A3B8" />
                <polygon points="0,22 -7,3 0,0" fill="#CBD5E1" />
                <text x="0" y="-25" textAnchor="middle" fontSize="13" fontWeight="900" fill="#0F172A">N</text>
              </g>

              {/* Grand Main Entrance Archway (Front Highway) */}
              <g transform="translate(40, 35)">
                <rect x="0" y="0" width="180" height="36" fill="#0B2516" rx="4" />
                <text x="90" y="22" textAnchor="middle" fill="#EAB308" fontSize="12" fontWeight="900" letterSpacing="1">
                  MAIN ENTRANCE ARCH (60' ROAD)
                </text>
              </g>

              {/* Road 1: 40-Foot Main Avenue Boulevard (Horizontal) */}
              <rect x="30" y="270" width="860" height="70" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="6 4" />
              <text x="460" y="310" textAnchor="middle" fill="#475569" fontSize="13" fontWeight="900" letterSpacing="2">
                MAIN AVENUE — 40'-0" WIDE TAR ROAD
              </text>

              {/* Road 2: 30-Foot Cross Street (Vertical) */}
              <rect x="420" y="30" width="60" height="560" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="6 4" />
              <text x="450" y="160" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="800" transform="rotate(-90 450 160)" letterSpacing="1">
                CROSS STREET — 30'-0" WIDE
              </text>

              {/* OSR Children Park & Jogging Track (North-East Corner) */}
              <g transform="translate(620, 35)">
                <rect
                  x="0"
                  y="0"
                  width="180"
                  height="225"
                  fill="#BBF7D0"
                  stroke="#16A34A"
                  strokeWidth="2"
                  rx="8"
                />
                <text x="90" y="80" textAnchor="middle" fill="#14532D" fontSize="13" fontWeight="900">
                  OSR PARK & GARDEN
                </text>
                <text x="90" y="105" textAnchor="middle" fill="#15803D" fontSize="11" fontWeight="700">
                  (40,000 SQ.FT DTCP OSR)
                </text>
                <text x="90" y="130" textAnchor="middle" fill="#166534" fontSize="10">
                  Children Play Equipment & Trees
                </text>
                <circle cx="90" cy="165" r="20" fill="none" stroke="#15803D" strokeWidth="2" strokeDasharray="4 2" />
                <text x="90" y="170" textAnchor="middle" fill="#15803D" fontSize="9" fontWeight="bold">WELL</text>
              </g>

              {/* Commercial Frontage Sector (Top Left) */}
              {plots.filter((p) => p.plotNumber.startsWith('C') || p.category === 'Commercial').map((plot, i) => {
                const isSelected = selectedPlot?.id === plot.id;
                const style = getPlotCadStyle(plot, isSelected);
                const x = 50 + i * 115;
                const y = 80;
                const w = 105;
                const h = 180;

                return (
                  <g
                    key={plot.id}
                    onClick={() => onSelectPlot(plot)}
                    className="cursor-pointer transition-transform hover:opacity-90"
                  >
                    <rect
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      fill={style.fill}
                      stroke={style.stroke}
                      strokeWidth={style.strokeWidth}
                      rx="4"
                    />
                    <text x={x + w / 2} y={y + 35} textAnchor="middle" fontSize="14" fontWeight="900" fill={style.textColor}>
                      #{plot.plotNumber}
                    </text>
                    <text x={x + w / 2} y={y + 60} textAnchor="middle" fontSize="10" fontWeight="bold" fill={style.textColor}>
                      COMMERCIAL
                    </text>
                    <text x={x + w / 2} y={y + 85} textAnchor="middle" fontSize="10" fill={style.textColor}>
                      {plot.plotDimensions}
                    </text>
                    <text x={x + w / 2} y={y + 110} textAnchor="middle" fontSize="10" fontWeight="800" fill={style.textColor}>
                      {plot.areaSqFt} SQ.FT
                    </text>
                    <text x={x + w / 2} y={y + 135} textAnchor="middle" fontSize="11" fontWeight="900" fill={style.textColor}>
                      ₹{(plot.totalPrice / 100000).toFixed(1)}L
                    </text>
                    {/* Status pill dot */}
                    <circle cx={x + w / 2} cy={y + 155} r="5" fill={plot.status === 'Available' ? '#15803D' : plot.status === 'Reserved' ? '#EAB308' : '#991B1B'} />
                  </g>
                );
              })}

              {/* Residential Sector A (South of 40ft road, Left block) */}
              {plots
                .filter((p) => !p.plotNumber.startsWith('C') && p.category !== 'Commercial')
                .slice(0, 6)
                .map((plot, i) => {
                  const isSelected = selectedPlot?.id === plot.id;
                  const style = getPlotCadStyle(plot, isSelected);
                  const col = i % 3;
                  const row = Math.floor(i / 3);
                  const x = 50 + col * 115;
                  const y = 350 + row * 115;
                  const w = 105;
                  const h = 105;

                  return (
                    <g
                      key={plot.id}
                      onClick={() => onSelectPlot(plot)}
                      className="cursor-pointer transition-transform hover:opacity-90"
                    >
                      <rect
                        x={x}
                        y={y}
                        width={w}
                        height={h}
                        fill={style.fill}
                        stroke={style.stroke}
                        strokeWidth={style.strokeWidth}
                        rx="4"
                      />
                      <text x={x + w / 2} y={y + 28} textAnchor="middle" fontSize="13" fontWeight="900" fill={style.textColor}>
                        #{plot.plotNumber}
                      </text>
                      <text x={x + w / 2} y={y + 48} textAnchor="middle" fontSize="10" fontWeight="bold" fill={style.textColor}>
                        {plot.facing} Facing
                      </text>
                      <text x={x + w / 2} y={y + 68} textAnchor="middle" fontSize="9.5" fill={style.textColor}>
                        {plot.plotDimensions}
                      </text>
                      <text x={x + w / 2} y={y + 88} textAnchor="middle" fontSize="11" fontWeight="900" fill={style.textColor}>
                        ₹{(plot.totalPrice / 100000).toFixed(1)}L
                      </text>
                    </g>
                  );
                })}

              {/* Residential Sector B (South of 40ft road, Right block) */}
              {plots
                .filter((p) => !p.plotNumber.startsWith('C') && p.category !== 'Commercial')
                .slice(6, 12)
                .map((plot, i) => {
                  const isSelected = selectedPlot?.id === plot.id;
                  const style = getPlotCadStyle(plot, isSelected);
                  const col = i % 3;
                  const row = Math.floor(i / 3);
                  const x = 490 + col * 125;
                  const y = 350 + row * 115;
                  const w = 115;
                  const h = 105;

                  return (
                    <g
                      key={plot.id}
                      onClick={() => onSelectPlot(plot)}
                      className="cursor-pointer transition-transform hover:opacity-90"
                    >
                      <rect
                        x={x}
                        y={y}
                        width={w}
                        height={h}
                        fill={style.fill}
                        stroke={style.stroke}
                        strokeWidth={style.strokeWidth}
                        rx="4"
                      />
                      <text x={x + w / 2} y={y + 28} textAnchor="middle" fontSize="13" fontWeight="900" fill={style.textColor}>
                        #{plot.plotNumber}
                      </text>
                      <text x={x + w / 2} y={y + 48} textAnchor="middle" fontSize="10" fontWeight="bold" fill={style.textColor}>
                        {plot.facing} • {plot.plotDimensions}
                      </text>
                      <text x={x + w / 2} y={y + 68} textAnchor="middle" fontSize="9.5" fill={style.textColor}>
                        {plot.areaSqFt} Sq.Ft ({plot.areaCents} Cents)
                      </text>
                      <text x={x + w / 2} y={y + 88} textAnchor="middle" fontSize="11" fontWeight="900" fill={style.textColor}>
                        ₹{(plot.totalPrice / 100000).toFixed(1)}L
                      </text>
                    </g>
                  );
                })}
            </svg>
          </div>
        )}

        {/* ─── MODE 2: 2D TOP-DOWN MASTER RENDER (SUDHA 3D WORKS STYLE) ─── */}
        {displayMode === 'topdown' && (
          <div className="relative w-full h-full min-h-[500px] flex items-center justify-center overflow-hidden rounded-xl">
            {/* Photorealistic Render Base with Lush Lawns and Asphalt Roads */}
            <div className="absolute inset-0 bg-[#1E3A24] bg-[radial-gradient(#285233_1px,transparent_1px)] [background-size:16px_16px]">
              {/* Asphalt Road Canvas */}
              <div className="absolute top-1/2 left-0 right-0 h-16 bg-[#2B2D2F] border-y-2 border-white/20 flex items-center justify-center">
                <div className="w-full border-t border-dashed border-[#EAB308]/60" />
                <span className="absolute text-[10px] font-black tracking-widest text-[#EAB308] uppercase">
                  40 FT AVENUE BLACKTOP
                </span>
              </div>

              {/* Park Reserve */}
              <div className="absolute top-6 right-6 w-48 h-48 rounded-2xl bg-gradient-to-tr from-[#166534] to-[#22C55E] border-2 border-emerald-300/40 p-3 shadow-xl flex flex-col justify-between text-white">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#EAB308]">
                    OSR PARK & JOGGING TRACK
                  </span>
                  <p className="text-xs font-bold mt-1">40,000 Sq.Ft Green Oasis</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <TreePine className="w-5 h-5 text-emerald-200" />
                  <span className="text-[10px]">Indigenous Flora & Lawns</span>
                </div>
              </div>

              {/* Grand Arch Entrance Marker */}
              <div className="absolute top-4 left-6 px-4 py-2 rounded-xl bg-[#0B2516] border border-[#EAB308] text-white shadow-xl">
                <span className="text-[10px] font-black text-[#EAB308] uppercase block">
                  MAIN ENTRANCE GATED ARCH
                </span>
                <span className="text-xs font-bold text-white">60-Foot Commercial Corridor</span>
              </div>
            </div>

            {/* Overlaid Interactive Plot Tiles */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 max-w-4xl w-full my-auto">
              {plots.slice(0, 8).map((plot) => {
                const isSelected = selectedPlot?.id === plot.id;
                let bgTint = 'bg-white/95 border-emerald-500 text-slate-900';
                if (plot.status === 'Reserved') bgTint = 'bg-amber-50/95 border-[#EAB308] text-amber-950';
                if (plot.status === 'Sold') bgTint = 'bg-red-50/90 border-red-500 text-red-950 opacity-75';

                return (
                  <motion.div
                    key={plot.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectPlot(plot)}
                    className={`p-3 rounded-2xl border-2 shadow-lg backdrop-blur-md cursor-pointer transition-all ${bgTint} ${
                      isSelected ? 'ring-4 ring-[#EAB308] scale-105' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black">#{plot.plotNumber}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        plot.status === 'Available' ? 'bg-[#15803D] text-white' : plot.status === 'Reserved' ? 'bg-[#EAB308] text-slate-950' : 'bg-[#991B1B] text-white'
                      }`}>
                        {plot.status}
                      </span>
                    </div>

                    <div className="mt-2 text-xs font-semibold">
                      <p>{plot.plotDimensions}</p>
                      <p className="text-[11px] opacity-75">{plot.areaSqFt} sq.ft · {plot.facing}</p>
                    </div>

                    <div className="mt-2 pt-1 border-t border-black/10 flex items-center justify-between text-xs font-black">
                      <span>₹{(plot.totalPrice / 100000).toFixed(1)}L</span>
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── MODE 3: 3D PERSPECTIVE BIRD’S EYE VIEW ─── */}
        {displayMode === 'isometric' && (
          <div className="relative w-full h-full min-h-[500px] flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-[#0F2818] to-[#081B10]">
            {/* 3D Isometric Layout Stage */}
            <div
              className="relative w-full max-w-2xl aspect-[16/10] p-6 flex flex-col justify-between"
              style={{
                transform: 'perspective(900px) rotateX(25deg)',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* 3D Gated Community Perimeter Wall */}
              <div className="absolute inset-0 rounded-3xl border-4 border-[#CA8A04] shadow-2xl bg-[#113B24]/90 backdrop-blur-md p-6">
                <div className="flex items-center justify-between text-white text-xs border-b border-emerald-500/30 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#EAB308] animate-ping" />
                    <span className="font-black text-[#EAB308]">ISOMETRIC TOWNSHIP VIEW</span>
                  </div>
                  <span className="text-[11px] text-emerald-200">24/7 Guarded Gated Community</span>
                </div>

                {/* 3D Isometric Avenue Grid */}
                <div className="grid grid-cols-3 gap-4 pt-6">
                  {plots.slice(0, 6).map((plot) => {
                    const isSelected = selectedPlot?.id === plot.id;
                    return (
                      <div
                        key={plot.id}
                        onClick={() => onSelectPlot(plot)}
                        className={`p-4 rounded-2xl bg-white dark:bg-[#0B2516] border-2 transition-transform cursor-pointer shadow-xl ${
                          isSelected
                            ? 'border-[#EAB308] -translate-y-2 ring-4 ring-[#EAB308]'
                            : 'border-slate-300 dark:border-emerald-700/60 hover:-translate-y-1'
                        }`}
                        style={{ transform: isSelected ? 'translateZ(30px)' : 'translateZ(10px)' }}
                      >
                        <div className="flex items-center justify-between text-xs font-black">
                          <span>Plot #{plot.plotNumber}</span>
                          <span className="text-[10px] text-[#CA8A04]">{plot.facing}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{plot.plotDimensions}</p>
                        <p className="text-xs font-black text-[#15803D] mt-2">
                          ₹{(plot.totalPrice / 100000).toFixed(1)} Lakhs
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom 3D Helper Note */}
            <div className="absolute bottom-4 inset-x-4 flex items-center justify-between text-xs text-emerald-200/90 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
              <span>Isometric 45° Gated Boundary with Entrance Arch & Security</span>
              <span className="text-[#EAB308] font-bold">Click any plot parcel to inspect</span>
            </div>
          </div>
        )}

        {/* ─── MODE 4: LIVE SATELLITE & GOOGLE MAPS INTEGRATION ─── */}
        {displayMode === 'satellite' && (
          <div className="relative w-full h-full min-h-[500px] flex flex-col justify-between overflow-hidden rounded-xl">
            {/* Real Satellite Aerial Texture */}
            <img
              src="https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=1600&q=85"
              alt="Satellite Boundary"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px]" />

            {/* Overlaid GPS Boundary Polygon */}
            <div className="absolute inset-10 sm:inset-16 border-3 border-dashed border-[#EAB308] rounded-3xl shadow-2xl bg-[#15803D]/15 flex items-center justify-center pointer-events-none">
              <div className="p-4 rounded-2xl bg-black/80 backdrop-blur-md text-white border border-[#EAB308]/60 text-center max-w-sm pointer-events-auto">
                <MapPin className="w-6 h-6 text-[#EAB308] mx-auto mb-1 animate-bounce" />
                <h4 className="text-sm font-black">{project.name} GPS Site Boundary</h4>
                <p className="text-xs text-emerald-300 font-mono mt-0.5">
                  11.7480° N, 79.7714° E · NH Bypass Frontage
                </p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <a
                    href="https://maps.google.com/?q=11.7480,79.7714"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#15803D] hover:bg-[#113B24] text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                  >
                    <span>Get Directions in Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Top Bar Coordinates */}
            <div className="relative z-10 m-4 flex flex-wrap items-center justify-between gap-2">
              <div className="px-3.5 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-white text-xs font-mono border border-white/20">
                <span className="text-[#EAB308] font-bold">GPS: </span>
                <span>Cuddalore NH Bypass Corridor (Opp. Town Link)</span>
              </div>

              <div className="px-3.5 py-1.5 rounded-xl bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                <Navigation className="w-3.5 h-3.5" />
                <span>Live Satellite Imagery</span>
              </div>
            </div>

            {/* Landmark Distance Markers Ribbon */}
            <div className="relative z-10 m-4 p-3 bg-black/80 backdrop-blur-md rounded-2xl border border-white/20 text-white flex flex-wrap items-center justify-around gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#EAB308]" />
                <span>Cuddalore Bus Stand: 4.2 km</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#EAB308]" />
                <span>Railway Station: 5.1 km</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#EAB308]" />
                <span>Silver Beach: 7.5 km</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#EAB308]" />
                <span>NH Bypass Link: 200m</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
