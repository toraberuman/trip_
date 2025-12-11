

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { Timeline } from './components/Timeline';
import { WeatherWidget } from './components/WeatherWidget';
import { EventDetailModal } from './components/EventDetailModal';
import { ExpenseSummary } from './components/ExpenseSummary';
import { parseCSVToItinerary } from './services/ai';
import { TripData, ItineraryEvent, PaymentMethod, EventCategory } from './types';
import { Plane, AlertCircle, Wallet, Navigation, Users, MapPin } from 'lucide-react';

const DEFAULT_SHEET_ID = '1uDYMnPGfWsYKpshxV-r0Qg6TzPG-3wczMy4qLhQV2Cw';

// Curated high-quality Autumn in Japan image
const AUTUMN_IMAGE_URL = "https://plus.unsplash.com/premium_photo-1761351502831-686bf8f61ed9?q=80&w=1373&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export default function App() {
  const [sheetId, setSheetId] = useState(DEFAULT_SHEET_ID);
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  
  // Modal States
  const [selectedEvent, setSelectedEvent] = useState<ItineraryEvent | null>(null);
  const [showExpenseSummary, setShowExpenseSummary] = useState(false);

  const fetchAndParseSheet = useCallback(async () => {
    if (!sheetId) return;

    setLoading(true);
    setError(null);

    try {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      const response = await fetch(csvUrl);
      
      if (!response.ok) {
        if (response.status === 404) {
             throw new Error("Sheet not found. Check the ID and ensure it is public.");
        }
        throw new Error(`Failed to fetch sheet: ${response.statusText}`);
      }
      
      const csvText = await response.text();
      const data = await parseCSVToItinerary(csvText);
      setTripData(data);
      setSelectedDayIndex(0);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [sheetId]);

  useEffect(() => {
    fetchAndParseSheet();
  }, [fetchAndParseSheet]);

  const handleUpdateExpense = (eventId: string, amountPerPerson: number, method: PaymentMethod, peopleCount: number) => {
    if (!tripData) return;
    
    // Deep clone
    const newTripData = { ...tripData };
    
    // Update logic
    for (const day of newTripData.days) {
      const eventIndex = day.events.findIndex(e => e.id === eventId);
      if (eventIndex !== -1) {
        day.events[eventIndex].expense = {
          ...day.events[eventIndex].expense,
          amountPerPerson,
          method,
          peopleCount,
          total: amountPerPerson * peopleCount
        };
        break;
      }
    }
    setTripData(newTripData);
    
    if (selectedEvent && selectedEvent.id === eventId) {
      setSelectedEvent(prev => prev ? { 
        ...prev, 
        expense: { 
          ...prev.expense, 
          amountPerPerson, 
          method,
          peopleCount,
          total: amountPerPerson * peopleCount
        } 
      } : null);
    }
  };

  // Nav Tip Logic
  const navTip = useMemo(() => {
    if (!tripData || !tripData.days[selectedDayIndex]) return null;
    const events = tripData.days[selectedDayIndex].events;
    if (events.length > 1) {
      const nextEvent = events[1];
      return {
        nextLocation: nextEvent.activity,
        estimatedTime: nextEvent.estimatedTravelTime || "35 min",
        estimatedArrival: nextEvent.estimatedArrivalTime || "14:30", // Fallback if AI hasn't regenerated
        distance: nextEvent.distance || "12 km",
        trafficStatus: nextEvent.trafficStatus || 'normal' // normal, moderate, congested
      };
    }
    return null;
  }, [tripData, selectedDayIndex]);

  // Determine Weather Location (Prefer STAY event)
  const weatherLocation = useMemo(() => {
     if (!tripData) return null;
     const day = tripData.days[selectedDayIndex];
     const stayEvent = day.events.find(e => e.category === EventCategory.Stay);
     
     if (stayEvent && stayEvent.details.coordinates) {
         return {
             name: stayEvent.activity,
             lat: stayEvent.details.coordinates.lat,
             lng: stayEvent.details.coordinates.lng
         };
     }
     
     // Fallback to day default
     return {
         name: day.location,
         lat: day.coordinates?.lat,
         lng: day.coordinates?.lng
     };
  }, [tripData, selectedDayIndex]);

  return (
    <div className="min-h-screen bg-[#FEFBEA] flex flex-col font-sans text-slate-800">
      <Header 
        sheetId={sheetId} 
        onUpdateSheet={setSheetId} 
        isLoading={loading}
        onRefresh={fetchAndParseSheet}
        title="東北紅葉秘湯旅"
      />

      <main className="flex-1 w-full max-w-lg md:max-w-2xl mx-auto flex flex-col bg-[#FEFBEA] shadow-2xl min-h-screen relative border-x border-yellow-200/40 pb-24">
        {error && (
          <div className="m-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Unable to load itinerary</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {loading && !tripData && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-pulse">
            <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4">
              <Plane className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-xl serif text-slate-800">規劃行程中...</h3>
            <p className="text-slate-500 mt-2 text-sm">正在讀取試算表並分析資料</p>
          </div>
        )}

        {tripData && (
          <>
             {/* Hero Header */}
             <div className="pt-8 px-6 pb-4 text-center relative z-10">
                <div className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-2">FAMILY TRIP</div>
                
                {/* Custom Title Layout */}
                <h1 className="text-4xl font-black serif text-slate-900 mb-2 leading-tight">
                  東北紅葉秘湯旅
                </h1>
                
                <div className="flex items-center justify-center gap-2 mb-4">
                   <span className="text-2xl font-serif text-slate-700 font-bold">2025</span>
                   <span className="bg-red-700 text-white px-2 py-0.5 rounded text-sm font-bold tracking-widest shadow-sm">
                     10月
                   </span>
                </div>

                <div className="flex justify-center items-center gap-1 text-xs text-slate-400 font-mono">
                    <Users className="w-3 h-3" />
                    {tripData.participants} Travelers
                </div>
             </div>

             {/* Horizontal Date Tabs - Removed border-b and added pb-4 for red dot visibility */}
             <div className="sticky top-16 z-30 bg-[#FEFBEA]/95 backdrop-blur-sm pt-2 pb-4">
               <div className="flex overflow-x-auto no-scrollbar px-6 gap-6 snap-x">
                 {tripData.days.map((day, idx) => {
                    const isSelected = idx === selectedDayIndex;
                    return (
                      <button 
                        key={idx}
                        onClick={() => setSelectedDayIndex(idx)}
                        className={`flex flex-col items-center min-w-[3rem] snap-start transition-all duration-300 ${isSelected ? 'scale-110 opacity-100' : 'opacity-40 hover:opacity-70'}`}
                      >
                         <span className="text-[10px] font-bold tracking-widest uppercase mb-1 text-slate-500">{day.dayOfWeek}</span>
                         <span className={`serif text-2xl font-bold ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                           {day.dayNumber}
                         </span>
                         {isSelected && <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-1.5 shadow-sm" />}
                      </button>
                    );
                 })}
               </div>
             </div>

             {/* Day Image Summary - Fixed Clean Autumn Image */}
             <div className="relative h-48 mx-4 mt-2 rounded-2xl overflow-hidden shadow-lg group">
                <img 
                  src={AUTUMN_IMAGE_URL}
                  alt="Autumn in Japan"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                   <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-wider mb-1">
                      <span className="border border-white/30 px-2 py-0.5 rounded backdrop-blur-md">
                         {/* Display actual date instead of DAY X */}
                         {tripData.days[selectedDayIndex].date}
                      </span>
                      <MapPin className="w-3 h-3" /> {tripData.days[selectedDayIndex].location}
                   </div>
                   <h2 className="text-white font-bold serif text-2xl text-shadow-md">
                      {tripData.days[selectedDayIndex].dayTitle}
                   </h2>
                </div>
             </div>

             {/* Weather (Uses Stay Location if available) */}
             <WeatherWidget 
               locationName={weatherLocation?.name || tripData.days[selectedDayIndex].location} 
               lat={weatherLocation?.lat}
               lng={weatherLocation?.lng}
             />

             {/* Timeline */}
             <Timeline 
               day={tripData.days[selectedDayIndex]} 
               onEventClick={setSelectedEvent}
             />
          </>
        )}
      </main>

      {/* Floating Action Button (Expense) */}
      {tripData && (
        <button
          onClick={() => setShowExpenseSummary(true)}
          className="fixed bottom-24 right-6 bg-white text-slate-800 p-4 rounded-full shadow-xl border border-slate-100 z-40 hover:scale-110 transition-transform"
        >
          <Wallet className="w-6 h-6 text-green-600" />
        </button>
      )}

      {/* Navigation Tip Bar */}
      {navTip && (
        <div className="fixed bottom-4 left-4 right-4 max-w-lg md:max-w-2xl mx-auto z-40 animate-in slide-in-from-bottom-6">
           <div className="bg-slate-900/90 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-slate-700/50 flex items-center justify-between">
              <div className="flex flex-col">
                 <div className="flex items-center gap-2 text-xs text-slate-400 mb-0.5">
                    <Navigation className="w-3 h-3" />
                    <span>前往下一站</span>
                 </div>
                 <div className="font-bold text-lg truncate max-w-[180px] text-white">
                    {navTip.nextLocation}
                 </div>
                 <div className="text-[10px] text-slate-500">
                    預計抵達: {navTip.estimatedArrival} (距離 {navTip.distance})
                 </div>
              </div>
              <div className="text-right pl-4 border-l border-slate-700">
                 <div className="text-3xl font-mono font-bold leading-none">{navTip.estimatedTime}</div>
                 
                 {/* Traffic Lights */}
                 <div className="flex justify-end gap-1.5 items-center mt-2">
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${navTip.trafficStatus === 'normal' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] scale-110' : 'bg-slate-700'}`} />
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${navTip.trafficStatus === 'moderate' ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)] scale-110' : 'bg-slate-700'}`} />
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${navTip.trafficStatus === 'congested' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] scale-110' : 'bg-slate-700'}`} />
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Modals */}
      {selectedEvent && tripData && (
        <EventDetailModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
          onUpdateExpense={handleUpdateExpense}
          totalParticipants={tripData.participants}
        />
      )}

      {tripData && (
        <ExpenseSummary 
           tripData={tripData} 
           isOpen={showExpenseSummary} 
           onClose={() => setShowExpenseSummary(false)}
           onUpdateExpense={handleUpdateExpense}
        />
      )}
    </div>
  );
}