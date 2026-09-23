import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BirthDetails, CalculatedChart, AstrologicalTradition } from '../types/astrology';
import { calculateFullNatalChart } from '../utils/astrologyCalculator';

interface ChartCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChartCalculated: (chart: CalculatedChart) => void;
  defaultTradition: AstrologicalTradition;
}

const GLOBAL_CITIES = [
  'London, United Kingdom',
  'New York, United States',
  'Paris, France',
  'Tokyo, Japan',
  'Mumbai, India',
  'Berlin, Germany',
  'Toronto, Canada',
  'Sydney, Australia',
];

export const ChartCalculatorModal: React.FC<ChartCalculatorModalProps> = ({
  isOpen,
  onClose,
  onChartCalculated,
  defaultTradition
}) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('1996-10-24');
  const [birthTime, setBirthTime] = useState('08:30');
  const [birthTimePeriod, setBirthTimePeriod] = useState<'AM' | 'PM'>('AM');
  const [city, setCity] = useState('London');
  const [country, setCountry] = useState('United Kingdom');
  const [tradition, setTradition] = useState<AstrologicalTradition>(defaultTradition || 'western');
  const [isUnknownTime, setIsUnknownTime] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const details: BirthDetails = {
      name: name.trim() || 'Cosmic Seeker',
      birthDate,
      birthTime: isUnknownTime ? '12:00' : birthTime,
      birthTimePeriod: isUnknownTime ? 'PM' : birthTimePeriod,
      city,
      country,
      tradition
    };

    const calculated = calculateFullNatalChart(details);
    onChartCalculated(calculated);

    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#C8A97E', '#DFC8A5', '#F7F5F0']
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050609]/95 overflow-y-auto">
      <div className="relative w-full max-w-lg solid-surface-elevated rounded-none p-8 shadow-2xl my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-none text-[#687182] hover:text-[#F7F5F0] hover:bg-[#1C202F] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5 mb-8 border-b border-[#222735] pb-6">
          <div className="text-[10px] font-mono uppercase tracking-institutional text-[#DFC8A5]">
            Ephemeris Calibration Intake
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#F7F5F0] tracking-wide">
            Cast Natal Horizon
          </h2>
          <p className="text-xs text-[#A2ABB8] font-sans leading-relaxed">
            Please furnish precise geographical coordinates and birth chronology for astronomical alignment across traditions.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A2ABB8] mb-2">
              Subject Identifier
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Julian Vance"
              className="w-full px-4 py-3 rounded-none solid-inset text-sm font-sans text-[#F7F5F0] placeholder-[#687182] transition-colors"
            />
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Birth Date */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A2ABB8] mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C8A97E]" />
                <span>Solar Birth Date</span>
              </label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-3 rounded-none solid-inset text-sm font-mono text-[#F7F5F0] transition-colors"
              />
            </div>

            {/* Birth Time */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A2ABB8] mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#C8A97E]" />
                  <span>Exact Time</span>
                </span>
                <span className="text-[10px] text-[#C8A97E] font-mono">Calibrates Ascendant</span>
              </label>
              
              <div className="flex gap-2">
                <input
                  type="time"
                  disabled={isUnknownTime}
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className={`flex-1 px-4 py-3 rounded-none solid-inset text-sm font-mono text-[#F7F5F0] transition-colors ${
                    isUnknownTime ? 'opacity-30 cursor-not-allowed' : ''
                  }`}
                />
                <button
                  type="button"
                  disabled={isUnknownTime}
                  onClick={() => setBirthTimePeriod(birthTimePeriod === 'AM' ? 'PM' : 'AM')}
                  className="px-3 py-3 rounded-none text-xs font-mono font-semibold border border-[#222735] bg-[#10131B] text-[#DFC8A5] hover:border-[#C8A97E] transition-colors"
                >
                  {birthTimePeriod}
                </button>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="unknownTime"
                  checked={isUnknownTime}
                  onChange={(e) => setIsUnknownTime(e.target.checked)}
                  className="rounded-none border-[#222735] bg-[#0C0E14] text-[#C8A97E] focus:ring-0"
                />
                <label htmlFor="unknownTime" className="text-[11px] text-[#687182] cursor-pointer font-sans">
                  Exact hour unknown (sets solar meridian baseline)
                </label>
              </div>
            </div>

          </div>

          {/* Place of Birth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A2ABB8] mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C8A97E]" />
                <span>Birth City</span>
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. London"
                className="w-full px-4 py-3 rounded-none solid-inset text-sm text-[#F7F5F0] placeholder-[#687182] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A2ABB8] mb-2">
                Sovereign State / Country
              </label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. United Kingdom"
                className="w-full px-4 py-3 rounded-none solid-inset text-sm text-[#F7F5F0] placeholder-[#687182] transition-colors"
              />
            </div>
          </div>

          {/* Quick Cities */}
          <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-[#687182] font-mono">
            <span>Coordinates:</span>
            {GLOBAL_CITIES.slice(0, 4).map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => {
                  const parts = c.split(', ');
                  setCity(parts[0]);
                  setCountry(parts[1]);
                }}
                className="text-[#A2ABB8] hover:text-[#DFC8A5] bg-[#10131B] px-2 py-0.5 rounded-none border border-[#222735] hover:border-[#C8A97E] transition-colors"
              >
                {c.split(',')[0]}
              </button>
            ))}
          </div>

          {/* Astrological System Preference */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#A2ABB8] mb-2">
              Primary Cosmological Framework
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'western', title: 'Western', sub: 'Tropical / Placidus' },
                { id: 'vedic', title: 'Vedic', sub: 'Sidereal / Lahiri' },
                { id: 'integrated', title: 'Triad', sub: 'Omni-Synthesis' }
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setTradition(item.id as AstrologicalTradition)}
                  className={`p-3 rounded-none border text-center transition-colors ${
                    tradition === item.id
                      ? 'bg-[#181D29] border-[#C8A97E] text-[#DFC8A5]'
                      : 'bg-[#10131B] border-[#222735] text-[#A2ABB8] hover:border-[#2E3547]'
                  }`}
                >
                  <div className="font-serif font-medium text-sm text-[#F7F5F0]">{item.title}</div>
                  <div className="text-[10px] font-mono text-[#687182] mt-0.5">{item.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Institutional Integrity Guarantee */}
          <div className="p-3 rounded-none bg-[#10131B] border border-[#222735] flex items-start gap-2.5 text-[11px] text-[#A2ABB8] font-sans">
            <Shield className="w-4 h-4 text-[#C8A97E] shrink-0 mt-0.5" />
            <span>
              <strong>Ethical Protocol:</strong> Ephemeris calculated client-side. We strictly uphold Jungian self-discovery and absolute non-determinism.
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-none font-mono font-bold text-xs tracking-widest uppercase bg-[#C8A97E] hover:bg-[#D8C2A0] text-[#090B10] transition-colors shadow-md"
          >
            Compute Natal Horizon
          </button>

        </form>

      </div>
    </div>
  );
};
