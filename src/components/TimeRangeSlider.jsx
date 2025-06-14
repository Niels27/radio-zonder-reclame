import React, { useRef } from "react";

/**
 * TimeRangeSlider - 24h slider with draggable start/end handles and ruler
 * @param {number} startHour - 0-24
 * @param {number} endHour - 0-24
 * @param {function} onChange - (start, end) => void
 */
export default function TimeRangeSlider({ startHour = 0, endHour = 24, onChange, step = 0.15, editable = true, disabled = false }) {
  const min = 0;
  const max = 24;
  const sliderRef = useRef();

  // Drag state
  const dragType = useRef(null); // 'start' or 'end'

  // Mouse/touch drag handlers
  const handlePointerDown = (type) => (e) => {
    dragType.current = type;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };
  const handlePointerMove = (e) => {
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    let percent = (x - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    let hour = Math.round(percent * 24 * 4) / 4;
    if (dragType.current === 'start') {
      if (hour >= endHour) hour = endHour - step;
      if (hour < min) hour = min;
      onChange(hour, endHour);
    } else if (dragType.current === 'end') {
      if (hour <= startHour) hour = startHour + step;
      if (hour > max) hour = max;
      onChange(startHour, hour);
    }
  };
  const handlePointerUp = () => {
    dragType.current = null;
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  };

  // Click on track to move nearest handle
  const handleTrackClick = (e) => {
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX;
    let percent = (x - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    let hour = Math.round(percent * 24 * 4) / 4;
    // Move the closest handle
    if (Math.abs(hour - startHour) < Math.abs(hour - endHour)) {
      if (hour >= endHour) hour = endHour - step;
      if (hour < min) hour = min;
      onChange(hour, endHour);
    } else {
      if (hour <= startHour) hour = startHour + step;
      if (hour > max) hour = max;
      onChange(startHour, hour);
    }
  };

  // Ruler dashes
  const dashes = Array.from({ length: 97 }, (_, i) => (
    <div key={i} style={{ width: '4%' }} className="flex flex-col items-center">
      <div className="h-3 w-0.5 bg-gray-400" style={{ opacity: i % 24 === 0 ? 1 : 0.5 }} />
      {i % 24 === 0 && (
        <span className="text-xs text-gray-400 mt-1">{String(i / 4).padStart(2, '0')}</span>
      )}
    </div>
  ));

  // Format time to show 15-minute increments properly
  const formatTime = (hour) => {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center w-full select-none">
      <div
        className="relative w-full flex items-center cursor-pointer"
        style={{ height: 36 }}
        ref={sliderRef}
        onClick={handleTrackClick}
      >
        {/* Track */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 rounded bg-gradient-to-r from-blue-700 via-purple-700 to-blue-700 opacity-70" />
        {/* Range highlight */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2 rounded bg-blue-500/80"
          style={{ left: `${(startHour/24)*100}%`, width: `${((endHour-startHour)/24)*100}%` }}
        />
        {/* Start handle */}
        <div
          className="absolute z-20"
          style={{ left: `calc(${(startHour/24)*100}% - 12px)`, top: 0 }}
        >
          <div
            className="w-6 h-6 bg-blue-500 border-2 border-white rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing"
            onPointerDown={handlePointerDown('start')}
            tabIndex={0}
            role="slider"
            aria-valuenow={startHour}
            aria-valuemin={min}
            aria-valuemax={endHour-1}
            aria-label="Starttijd"
          >
            <span className="text-xs text-white font-bold select-none">S</span>
          </div>
        </div>
        {/* End handle */}
        <div
          className="absolute z-20"
          style={{ left: `calc(${(endHour/24)*100}% - 12px)`, top: 0 }}
        >
          <div
            className="w-6 h-6 bg-purple-500 border-2 border-white rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing"
            onPointerDown={handlePointerDown('end')}
            tabIndex={0}
            role="slider"
            aria-valuenow={endHour}
            aria-valuemin={startHour+1}
            aria-valuemax={max}
            aria-label="Eindtijd"
          >
            <span className="text-xs text-white font-bold select-none">E</span>
          </div>
        </div>
      </div>
      {/* Ruler */}
      <div className="flex flex-row justify-between w-full mt-2 select-none">
        {dashes}
      </div>
      <div className="flex justify-between w-full text-xs mt-1">
        <span className="text-blue-400 font-semibold">Start: {formatTime(startHour)}</span>
        <span className="text-purple-400 font-semibold">Einde: {formatTime(endHour)}</span>
      </div>
    </div>
  );
}
