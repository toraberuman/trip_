import React, { useState, useEffect } from 'react';
import { X, Navigation, Clock, Utensils, BedDouble, ChevronRight, Banknote, CreditCard, Plane, Map as MapIcon, Link, Calendar, Users, ExternalLink, Phone, Car, Info } from 'lucide-react';
import { ItineraryEvent, PaymentMethod } from '../types';

interface ModalProps {
  event: ItineraryEvent;
  onClose: () => void;
  onUpdateExpense: (id: string, amountPerPerson: number, method: PaymentMethod, peopleCount: number) => void;
  totalParticipants: number;
}

export const EventDetailModal: React.FC<ModalProps> = ({ event, onClose, onUpdateExpense, totalParticipants }) => {
  // Safely initialize state with fallbacks to avoid "undefined.toString()" error
  const [amountPerPerson, setAmountPerPerson] = useState(() => {
    return (event.expense?.amountPerPerson ?? 0).toString();
  });
  
  const [peopleCount, setPeopleCount] = useState(() => {
    return event.expense?.peopleCount || totalParticipants;
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(event.expense?.method || PaymentMethod.Cash);

  // Auto-save effect
  useEffect(() => {
    const timer = setTimeout(() => {
      onUpdateExpense(event.id, parseFloat(amountPerPerson) || 0, paymentMethod, peopleCount);
    }, 500);
    return () => clearTimeout(timer);
  }, [amountPerPerson, peopleCount, paymentMethod, event.id, onUpdateExpense]);

  const { details } = event;
  const isFlight = event.category === 'TRANSPORT' && (event.activity.includes('Flight') || event.activity.includes('飛'));
  const isStay = event.category === 'STAY';
  const isDining = event.category === 'FOOD' || !!details.popularDishes || !!details.tabelogUrl || !!details.reservationUrl;

  // Placeholder for Room image if AI doesn't return one
  const defaultRoomImage = "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1974&auto=format&fit=crop";
  const defaultCarImage = "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop";

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-slate-900/30 backdrop-blur-[2px] transition-opacity" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-[70] transform transition-transform duration-300 ease-out bg-[#FEFBEA] rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] h-[90vh] overflow-hidden flex flex-col">
        
        {/* Handle Bar */}
        <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
            <div className="w-12 h-1.5 bg-slate-300 rounded-full cursor-pointer" />
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto px-6 pb-20">
            
            {/* Header: Category & Time */}
            <div className="pt-4 flex items-center justify-between text-xs font-bold tracking-widest text-slate-400 uppercase mb-2">
                <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-slate-100 rounded text-slate-600">{event.category}</span>
                    <span>{event.time}</span>
                    {isStay && details.mealPlan && (
                         <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded font-bold border border-orange-200 flex items-center gap-1">
                            <Utensils className="w-3 h-3" />
                            {details.mealPlan}
                         </span>
                    )}
                </div>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
                    <X className="w-5 h-5 text-slate-500" />
                </button>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold serif text-slate-900 leading-tight mb-2">{event.activity}</h2>
            {details.japaneseName && (
                <div className="flex flex-col gap-0.5 mb-2 pl-1 border-l-2 border-slate-300">
                   <div className="text-base font-medium text-slate-700">
                      {details.japaneseName}
                      {details.hiragana && <span className="ml-2 text-xs text-slate-400 font-light tracking-wide">({details.hiragana})</span>}
                   </div>
                </div>
            )}
            <p className="text-sm text-slate-400 mb-6 border-b border-slate-200 pb-4">{details.address || event.location}</p>

            {/* HIGHLY VISIBLE PHONE NUMBER / MAP CODE FOR CAR NAV */}
            {details.phoneNumber && (
                <div className="mb-6 bg-slate-800 text-white rounded-xl shadow-lg p-4 flex items-center justify-between active:scale-95 transition-transform">
                     <div>
                         <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                             電話 / MAP CODE
                         </div>
                         <div className="text-3xl font-mono font-bold tracking-wider text-yellow-400">
                             {details.phoneNumber}
                         </div>
                     </div>
                     <div className="bg-slate-700 p-3 rounded-full">
                         <Navigation className="w-6 h-6 text-white" />
                     </div>
                </div>
            )}

            {/* Operational Information List (Visible for ALL Categories) */}
            {(details.openingHours || details.holidays || details.lastOrder) && (
                <div className="mb-6 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                    
                    {details.openingHours && (
                        <div className="flex gap-3 items-start border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                             <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600">
                                 <Clock className="w-4 h-4" />
                             </div>
                             <div>
                                 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">營業時間</h4>
                                 <p className="text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">{details.openingHours}</p>
                             </div>
                        </div>
                    )}

                    {details.lastOrder && (
                        <div className="flex gap-3 items-start border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                             <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 text-red-600">
                                 <Utensils className="w-4 h-4" />
                             </div>
                             <div>
                                 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">最後點餐時間</h4>
                                 <p className="text-sm font-medium text-slate-800">{details.lastOrder}</p>
                             </div>
                        </div>
                    )}
                    
                    {details.holidays && (
                         <div className="flex gap-3 items-start border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                             <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 text-orange-600">
                                 <Calendar className="w-4 h-4" />
                             </div>
                             <div>
                                 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">休假日</h4>
                                 <p className="text-sm font-medium text-slate-800 leading-relaxed">{details.holidays}</p>
                             </div>
                        </div>
                    )}
                </div>
            )}

            {/* FLIGHT CARD - Block Layout */}
            {isFlight && (
                <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden mb-6 relative">
                    <div className="h-2 bg-indigo-600 w-full" />
                    <div className="p-5">
                        <div className="flex justify-between items-center mb-6">
                             <div className="flex items-center gap-2 text-indigo-900 font-bold tracking-wider">
                                <Plane className="w-5 h-5" />
                                BOARDING PASS
                             </div>
                             {details.transportInfo?.flightNumber && (
                                <div className="font-mono text-lg font-bold tracking-widest text-slate-800 bg-slate-100 px-3 py-1 rounded">
                                   {details.transportInfo.flightNumber}
                                </div>
                             )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            {/* DEPARTURE BLOCK */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col">
                                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">Departure</div>
                                <div className="text-2xl font-black text-slate-900 leading-none mb-1">{event.location.split('->')[0] || 'DEP'}</div>
                                <div className="text-xl font-mono font-bold text-indigo-600 mb-2">{event.time}</div>
                                {details.transportInfo?.departureTerminal && (
                                    <div className="mt-auto inline-block bg-white border border-slate-200 text-slate-600 text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                                        Term. {details.transportInfo.departureTerminal}
                                    </div>
                                )}
                            </div>
                            
                            {/* ARRIVAL BLOCK */}
                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex flex-col text-right items-end">
                                <div className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider mb-2">Arrival</div>
                                <div className="text-2xl font-black text-indigo-900 leading-none mb-1">{event.location.split('->')[1] || 'ARR'}</div>
                                <div className="text-xl font-mono font-bold text-indigo-600 mb-2">{event.endTime || '--:--'}</div>
                                {details.transportInfo?.arrivalTerminal && (
                                    <div className="mt-auto inline-block bg-white border border-indigo-200 text-indigo-600 text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                                        Term. {details.transportInfo.arrivalTerminal}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CAR RENTAL CARD - Block Layout */}
            {details.carRental && (
                <div className="mb-6 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="relative h-48 bg-slate-100">
                        <img 
                          src={defaultCarImage} 
                          alt="Car Rental"
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-800 flex items-center gap-1 shadow-sm">
                             <Car className="w-3 h-3" />
                             租車預約
                        </div>
                        <div className="absolute bottom-4 left-4 text-white">
                             <h3 className="font-serif text-2xl font-bold text-shadow-md">{details.carRental.model || "Vehicle"}</h3>
                             <p className="text-sm opacity-90 text-shadow-sm">{details.carRental.company || "Rental Company"}</p>
                        </div>
                    </div>
                    
                    <div className="p-4 grid grid-cols-2 gap-3">
                        {/* Pickup Block */}
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                             <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase mb-2">
                                 <div className="w-2 h-2 rounded-full bg-green-500"></div> Pick Up
                             </div>
                             <div className="font-medium text-slate-900 text-sm leading-snug mb-2">
                                {details.carRental.pickupLocation || "Location N/A"}
                             </div>
                             <div className="font-mono text-sm font-bold text-slate-700 bg-white inline-block px-2 py-0.5 rounded border border-slate-100">
                                {event.time}
                             </div>
                        </div>

                        {/* Dropoff Block */}
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                             <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase mb-2">
                                 <div className="w-2 h-2 rounded-full bg-red-500"></div> Return
                             </div>
                             <div className="font-medium text-slate-900 text-sm leading-snug mb-2">
                                {details.carRental.dropoffLocation || "Location N/A"}
                             </div>
                             {/* Assuming EndTime might be available or generic */}
                             <div className="font-mono text-sm font-bold text-slate-700 bg-white inline-block px-2 py-0.5 rounded border border-slate-100">
                                {event.endTime || "--:--"}
                             </div>
                        </div>
                    </div>
                </div>
            )}


            {/* ONSEN / HOTEL INFO - Separate Cards for Multiple Rooms */}
            {isStay && (
                <div className="mb-6 space-y-6">
                    
                    {/* Render Each Room Type Separately */}
                    {details.rooms && details.rooms.length > 0 ? (
                        details.rooms.map((room, idx) => (
                           <div key={idx} className="relative group overflow-hidden rounded-xl shadow-lg border border-slate-200 bg-slate-900 mb-4">
                                 {/* Image Background */}
                                 <div className="w-full h-48 overflow-hidden opacity-80">
                                    <img 
                                      src={room.imageUrl || defaultRoomImage} 
                                      alt="Room View" 
                                      className="w-full h-full object-cover" 
                                    />
                                 </div>
                                 
                                 {/* Overlay Content */}
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-5 flex flex-col justify-end text-white">
                                      <div className="flex justify-between items-end">
                                          <div>
                                              <div className="text-[10px] text-orange-200 uppercase tracking-widest font-bold mb-1 flex items-center gap-1">
                                                <BedDouble className="w-3 h-3" /> 
                                                Room {idx + 1}
                                              </div>
                                              <h3 className="font-serif text-xl font-bold leading-tight mb-2 text-shadow-sm">
                                                {room.name}
                                              </h3>
                                              {room.description && (
                                                <p className="text-xs text-gray-300 line-clamp-2">{room.description}</p>
                                              )}
                                          </div>
                                      </div>
                                      {(room.link || details.websiteUrl) && (
                                          <a 
                                            href={room.link || details.websiteUrl} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="mt-3 text-xs flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
                                          >
                                            <ExternalLink className="w-3 h-3" />
                                            {room.link ? '查看此房型詳情' : '前往官網'}
                                          </a>
                                      )}
                                 </div>
                            </div>
                        ))
                    ) : details.roomType ? (
                       // Fallback for old data structure if re-parsing hasn't happened yet
                       <div className="relative group overflow-hidden rounded-xl shadow-lg border border-slate-200 bg-slate-900">
                             <div className="w-full h-48 overflow-hidden opacity-80">
                                <img src={defaultRoomImage} alt="Room" className="w-full h-full object-cover" />
                             </div>
                             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-5 flex flex-col justify-end text-white">
                                  <h3 className="font-serif text-xl font-bold leading-tight mb-2">{details.roomType}</h3>
                                  {details.websiteUrl && (
                                      <a href={details.websiteUrl} target="_blank" rel="noreferrer" className="mt-2 text-xs flex items-center gap-1 text-slate-300">
                                        <ExternalLink className="w-3 h-3" /> 官網
                                      </a>
                                  )}
                             </div>
                        </div>
                    ) : null}
                    
                    {details.onsen && (
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide text-orange-800">
                                ♨️ 溫泉情報
                            </h3>
                            <div className="space-y-3 text-sm">
                                {details.onsen.hasPrivateBath && (
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-slate-600">貸切風呂 (Private)</span>
                                        <span className="font-medium text-slate-900">{details.onsen.privateBathFee || 'Check Fee'}</span>
                                    </div>
                                )}
                                {details.onsen.hasOpenAir && (
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-slate-600">露天風呂</span>
                                        <span className="font-medium text-slate-900 text-green-600">有</span>
                                    </div>
                                )}
                                {details.onsen.hours && (
                                    <div className="block">
                                        <span className="text-slate-500 text-xs block mb-1">開放時間 / 男女交替</span>
                                        <p className="text-slate-800">{details.onsen.hours}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* RESTAURANT / DINING CARD (Extra Links for Food) */}
            {isDining && (
                <div className="mb-6 bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 mb-4 text-orange-600">
                        <Utensils className="w-5 h-5" />
                        <h3 className="font-bold text-slate-800">餐飲資訊</h3>
                    </div>
                    
                    {details.popularDishes && (
                        <div className="mb-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2">人氣推薦</span>
                            <div className="flex flex-wrap gap-2">
                                {details.popularDishes.map((d, i) => (
                                    <span key={i} className="px-3 py-1 bg-orange-50 text-orange-800 rounded-full text-xs font-medium border border-orange-100">
                                        {d.original} ({d.translated})
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="flex gap-3 mt-4">
                        {details.reservationUrl && (
                            <a href={details.reservationUrl} target="_blank" rel="noreferrer" className="flex-1 py-2 px-4 bg-slate-800 text-white text-center rounded-lg text-sm font-medium hover:bg-slate-900">
                                線上訂位
                            </a>
                        )}
                        {details.tabelogUrl && (
                            <a href={details.tabelogUrl} target="_blank" rel="noreferrer" className="flex-1 py-2 px-4 bg-orange-100 text-orange-700 text-center rounded-lg text-sm font-medium hover:bg-orange-200">
                                Tabelog
                            </a>
                        )}
                    </div>
                </div>
            )}

            {/* Google Maps Embed (Bottom) */}
            {details.coordinates && (
                <div className="mb-6 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500">
                        地圖預覽
                    </div>
                    <div className="h-40 bg-slate-200 relative">
                         <iframe 
                           width="100%" 
                           height="100%" 
                           style={{ border: 0 }} 
                           loading="lazy" 
                           allowFullScreen 
                           src={`https://maps.google.com/maps?q=${details.coordinates.lat},${details.coordinates.lng}&z=15&output=embed`}
                         />
                    </div>
                </div>
            )}


            {/* EXPENSE TRACKER */}
            <div className="border-t-2 border-dashed border-slate-300 pt-6 mt-8">
               <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                 <Banknote className="w-5 h-5 text-green-600" />
                 消費記帳
               </h3>
               
               <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                   <div className="grid grid-cols-2 gap-4 mb-4">
                       <div>
                           <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">單人金額 (JPY)</label>
                           <input 
                             type="number" 
                             value={amountPerPerson}
                             onChange={(e) => setAmountPerPerson(e.target.value)}
                             className="w-full text-lg font-mono font-bold border-b border-slate-200 focus:border-green-500 outline-none py-1 bg-white text-slate-900 rounded px-1"
                             placeholder="0"
                           />
                       </div>
                       <div>
                           <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">人數</label>
                           <div className="flex items-center gap-2">
                               <Users className="w-4 h-4 text-slate-400" />
                               <input 
                                 type="number" 
                                 value={peopleCount}
                                 onChange={(e) => setPeopleCount(parseInt(e.target.value) || 0)}
                                 className="w-full text-lg font-mono font-bold border-b border-slate-200 focus:border-green-500 outline-none py-1 bg-white text-slate-900 rounded px-1"
                               />
                           </div>
                       </div>
                   </div>

                   <div className="flex gap-2 mb-4">
                        <button 
                            onClick={() => setPaymentMethod(PaymentMethod.Cash)}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${paymentMethod === PaymentMethod.Cash ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-400 border-slate-200'}`}
                        >
                            現金
                        </button>
                        <button 
                            onClick={() => setPaymentMethod(PaymentMethod.Card)}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${paymentMethod === PaymentMethod.Card ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-200'}`}
                        >
                            信用卡
                        </button>
                   </div>

                   <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                       <span className="text-sm font-bold text-slate-500">總計 (Total)</span>
                       <span className="text-2xl font-mono font-bold text-slate-800">
                           ¥{((parseFloat(amountPerPerson) || 0) * (peopleCount || 0)).toLocaleString()}
                       </span>
                   </div>
               </div>
            </div>

        </div>
      </div>
    </>
  );
};