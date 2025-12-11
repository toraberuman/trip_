import React, { useState, useMemo } from 'react';
import { TripData, PaymentMethod, ItineraryEvent } from '../types';
import { Banknote, CreditCard, ChevronRight, Edit2 } from 'lucide-react';

interface ExpenseSummaryProps {
  tripData: TripData;
  isOpen: boolean;
  onClose: () => void;
  onUpdateExpense: (id: string, amountPerPerson: number, method: PaymentMethod, peopleCount: number) => void;
}

export const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({ tripData, isOpen, onClose, onUpdateExpense }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'list'>('summary');

  // Calculation
  const stats = useMemo(() => {
    let cash = 0;
    let card = 0;
    const items: { event: ItineraryEvent, dayTitle: string, total: number }[] = [];

    tripData.days.forEach(day => {
      day.events.forEach(event => {
         if (event.expense && event.expense.amountPerPerson > 0) {
            const total = event.expense.amountPerPerson * (event.expense.peopleCount || tripData.participants || 6);
            if (event.expense.method === PaymentMethod.Cash) cash += total;
            if (event.expense.method === PaymentMethod.Card) card += total;
            
            items.push({
                event,
                dayTitle: day.dayTitle,
                total
            });
         }
      });
    });
    return { cash, card, total: cash + card, items };
  }, [tripData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#FEFBEA] w-full max-w-lg sm:rounded-2xl shadow-xl overflow-hidden flex flex-col h-[85vh] sm:h-auto animate-in slide-in-from-bottom-4">
        
        {/* Header Tabs */}
        <div className="bg-white border-b border-slate-200 flex">
            <button 
              onClick={() => setActiveTab('summary')}
              className={`flex-1 py-4 text-sm font-bold tracking-wide uppercase border-b-2 transition-colors ${activeTab === 'summary' ? 'border-indigo-600 text-indigo-900' : 'border-transparent text-slate-400'}`}
            >
                總覽統計
            </button>
            <button 
              onClick={() => setActiveTab('list')}
              className={`flex-1 py-4 text-sm font-bold tracking-wide uppercase border-b-2 transition-colors ${activeTab === 'list' ? 'border-indigo-600 text-indigo-900' : 'border-transparent text-slate-400'}`}
            >
                詳細清單
            </button>
            <button onClick={onClose} className="px-6 text-slate-400 hover:text-slate-600">
                <ChevronRight className="w-5 h-5 rotate-90" />
            </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 bg-[#FEFBEA]">
           
           {activeTab === 'summary' ? (
               <div className="space-y-6">
                   <div className="flex flex-col items-center justify-center py-8 bg-white rounded-2xl border border-slate-100 shadow-sm">
                     <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">Total Expenses</span>
                     <span className="text-5xl font-mono font-bold text-slate-800 tracking-tighter">¥{stats.total.toLocaleString()}</span>
                     <span className="text-xs text-slate-400 mt-2">包含 {tripData.participants} 人份預算</span>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 rounded-xl border border-green-100 bg-white shadow-sm">
                         <div className="flex items-center gap-2 mb-3 text-green-700">
                            <Banknote className="w-5 h-5" />
                            <span className="font-bold text-sm">現金</span>
                         </div>
                         <p className="text-2xl font-mono font-bold text-slate-700">¥{stats.cash.toLocaleString()}</p>
                      </div>

                      <div className="p-5 rounded-xl border border-blue-100 bg-white shadow-sm">
                         <div className="flex items-center gap-2 mb-3 text-blue-700">
                            <CreditCard className="w-5 h-5" />
                            <span className="font-bold text-sm">信用卡</span>
                         </div>
                         <p className="text-2xl font-mono font-bold text-slate-700">¥{stats.card.toLocaleString()}</p>
                      </div>
                   </div>
               </div>
           ) : (
               <div className="space-y-4">
                   {stats.items.map(({ event, total }, idx) => (
                       <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm">
                           <div>
                               <div className="font-bold text-slate-800 text-sm">{event.activity}</div>
                               <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                                  <span>{event.expense.method}</span>
                                  <span>•</span>
                                  <span>{event.expense.peopleCount} 人</span>
                               </div>
                           </div>
                           <div className="text-right">
                               <div className="font-mono font-bold text-slate-700">¥{total.toLocaleString()}</div>
                               <button 
                                 onClick={() => {
                                    // Could trigger a small inline edit or re-open modal. 
                                    // For simplicity, let's just show it's interactable or use existing update flow via Modal
                                 }}
                                 className="text-[10px] text-indigo-500 font-medium underline mt-1"
                               >
                                   
                               </button>
                           </div>
                       </div>
                   ))}
                   {stats.items.length === 0 && (
                       <div className="text-center text-slate-400 py-10">尚無記帳資料</div>
                   )}
               </div>
           )}

        </div>
      </div>
    </div>
  );
};