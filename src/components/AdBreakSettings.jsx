import React, { useState } from 'react';

const AdBreakSettings = ({
    adBreakMinute,
    adBreakDuration,
    isTimerRunning,
    onMinuteChange,
    onDurationChange,
    onStartTimer,
    onStopTimer,
    onResetTimer,
    onManualAdBreak,
    isAdBreakActive
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <div className="bg-radio-dark border-b border-gray-700">
            <div className="max-w-6xl mx-auto p-4">

                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-2 text-white bg-radio-accent hover:bg-radio-accent-hover rounded transition-colors"
                            title="Geavanceerde instellingen"
                        >
                            Instellingen
                        </button>
                    </h2>

                    <div className="flex items-center space-x-4">
                        {/* Quick Status */}
                        <div className="hidden sm:flex items-center space-x-4 text-sm">
                            <span className="text-radio-secondary">
                                Elk uur op minuut {adBreakMinute} gedurende {adBreakDuration}min
                            </span>
                        </div>


                        <div className="flex items-center space-x-2">
                            {!isTimerRunning ? (
                                <button
                                    onClick={onStartTimer}
                                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors flex items-center space-x-1"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                    <span>Activeren</span>
                                </button>
                            ) : (
                                <button
                                    onClick={onStopTimer}
                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors flex items-center space-x-1"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 6h12v12H6z" />
                                    </svg>
                                    <span>Stoppen</span>
                                </button>
                            )}


                        </div>
                    </div>
                </div>

                {/* Expanded Settings */}
                {isExpanded && (
                    <div className="mt-4 space-y-4">
                        {/* Timing Settings */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Reclamepauze op minuut van het uur
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="60"
                                    value={adBreakMinute}
                                    onChange={(e) => {
                                        let value = parseInt(e.target.value);
                                        if (isNaN(value)) value = null;
                                        if (value < 0) value = 0;
                                        if (value > 60) value = 60;
                                        onMinuteChange(value);
                                    }}
                                    className="w-full px-3 py-2 bg-radio-darker border border-gray-600 rounded-lg text-white focus:border-radio-accent focus:outline-none"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Elk uur wordt op dit moment een reclamepauze gestart
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Duur reclamepauze (minuten)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="30"
                                    value={adBreakDuration}
                                    onChange={(e) => onDurationChange(parseInt(e.target.value))}
                                    className="w-full px-3 py-2 bg-radio-darker border border-gray-600 rounded-lg text-white focus:border-radio-accent focus:outline-none"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Hoe lang de afspeellijst wordt afgespeeld
                                </p>
                            </div>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex flex-wrap gap-2">


                            <button
                                onClick={onManualAdBreak}
                                className={`px-4 py-2 rounded transition-colors flex items-center space-x-1 ${isAdBreakActive
                                        ? 'bg-red-600 hover:bg-red-700 text-white'
                                        : 'bg-orange-600 hover:bg-orange-700 text-white'
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6L12 10.5 8.5 8 12 5.5 15.5 8zM8.5 16l3.5-2.5L15.5 16 12 18.5 8.5 16z" />
                                </svg>
                                <span>{isAdBreakActive ? 'Stop Reclamepauze' : 'Test Reclamepauze'}</span>
                            </button>
                        </div>


                    </div>
                )}
            </div>
        </div>
    );
};

export default AdBreakSettings;
