

import React from 'react';
import { ItineraryDay, EventCategory, ItineraryEvent } from '../types';
import { Plane, ChevronRight, Info, CheckCircle2, Utensils, BedDouble, Car, Camera, Coffee } from 'lucide-react';

interface TimelineProps {
  day: ItineraryDay;
  onEventClick: (event: ItineraryEvent) => void;
}

const getCategoryIcon = (cat: EventCategory) => {
    switch(cat) {
        case EventCategory.Food: return <Utensils className="w-3 h-3" />;
        case EventCategory.Stay: return <BedDouble className="w-3 h-3" />;
        case EventCategory.Transport: return <Car className="w-3 h-3" />;
        default: return <Camera className="w-3 h-3" />;
    }
};

export const Timeline: React.FC<TimelineProps> = ({ day, onEventClick }) => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
      <div className="space-y-6">
        {day.events.map((event, idx) => {
          const isFlight = event.category === EventCategory.Transport && (event.activity.includes('飛') || event.activity.includes('Flight') || event.details.transportInfo);
          const isStay = event.category === EventCategory.Stay;

          return (
            <div 
              key={idx} 
              onClick={() => onEventClick(event)}
              className={`relative flex group cursor-pointer transition-all duration-300 rounded-xl p-3 sm:p-4 -mx-2 sm:mx-0
                ${isFlight ? 'bg-indigo-50 border border-indigo-100 shadow-sm' : 'hover:bg-white hover:shadow-lg hover:-translate-y-0.5 border border-transparent'}
              `}
            >
              {/* Time Column */}
              <div className="w-14 sm:w-16 flex flex-col items-center flex-shrink-0 pt-1">
                 <span className="font-mono text-sm font-bold text-slate-800 tracking-tight">
                   {event.time}
                 </span>
                 {isFlight && event.endTime && (
                   <>
                     <div className="h-4 w-px bg-indigo-300 my-1"></div>
                     <span className="font-mono text-sm font-bold text-slate-500 tracking-tight">
                       {event.endTime}
                     </span>
                   </>
                 )}
              </div>

              {/* Content Column */}
              <div className="flex-1 pl-3 sm:pl-4 border-l border-slate-200/50">
                 {/* Title Row */}
                 <div className="flex flex-col gap-1">
                   <div className="flex items-center gap-2 flex-wrap">
                       {/* Category Badge */}
                       <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 uppercase tracking-wider
                         ${event.category === EventCategory.Food ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                           event.category === EventCategory.Stay ? 'bg-slate-800 text-white border-slate-800' :
                           event.category === EventCategory.Transport ? 'bg-blue-50 text-blue-700 border-blue-100' :
                           'bg-slate-50 text-slate-600 border-slate-100'
                         }
                       `}>
                          {getCategoryIcon(event.category)}
                          {event.category}
                       </span>

                       {/* Reserved Badge - Hide for Stays */}
                       {!isStay && event.details.isReserved && (
                         <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            已預訂
                         </span>
                       )}

                       {/* Hotel Meal Badge - Show specific Meal Plan if available */}
                       {isStay && event.details.mealPlan && (
                         <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200 flex items-center gap-1">
                            <Utensils className="w-3 h-3" />
                            {event.details.mealPlan}
                         </span>
                       )}
                   </div>

                   <div className="flex justify-between items-start">
                       <div>
                           <h3 className={`font-bold text-lg serif leading-tight ${isFlight ? 'text-indigo-900' : 'text-slate-800'}`}>
                             {event.activity}
                           </h3>
                           {event.details?.japaneseName && (
                             <div className="text-slate-500 text-sm font-light mt-0.5">
                               {event.details.japaneseName}
                             </div>
                           )}
                       </div>
                       
                       {/* Price (Right Side) */}
                       {event.expense.amountPerPerson > 0 && (
                         <div className="text-right pl-2 flex-shrink-0">
                           <span className="block font-mono font-bold text-slate-700">
                             ¥{event.expense.amountPerPerson.toLocaleString()}
                           </span>
                           <span className="text-[10px] text-slate-400 block">(每人)</span>
                         </div>
                       )}
                   </div>
                 </div>

                 {/* Extra Info / Notes */}
                 {event.notes && (
                   <div className="mt-3 flex items-start gap-2 text-xs text-slate-500 bg-yellow-50/50 p-2 rounded-lg">
                     <Info className="w-3 h-3 flex-shrink-0 mt-0.5 text-yellow-600" />
                     <span className="leading-relaxed">{event.notes}</span>
                   </div>
                 )}

                 {/* Flight Decoration */}
                 {isFlight && (
                   <div className="mt-3 flex items-center gap-2 text-xs text-indigo-500 font-bold uppercase tracking-wider">
                     <Plane className="w-3 h-3" />
                     Boarding Information
                   </div>
                 )}
              </div>
              
              {/* Chevron */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
            </div>
          );
        })}
      </div>
      
      {day.events.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <p className="serif text-lg italic">No events planned</p>
        </div>
      )}
    </div>
  );
};
