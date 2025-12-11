import React, { useState } from 'react';
import { Map, Link as LinkIcon, RefreshCw, FileSpreadsheet } from 'lucide-react';

interface HeaderProps {
  sheetId: string;
  onUpdateSheet: (newId: string) => void;
  isLoading: boolean;
  onRefresh: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ sheetId, onUpdateSheet, isLoading, onRefresh, title }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(sheetId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic extraction if they paste a full URL
    let cleanId = inputValue;
    const match = inputValue.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      cleanId = match[1];
    }
    onUpdateSheet(cleanId);
    setInputValue(cleanId);
    setIsEditing(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Map className="w-5 h-5" />
          </div>
          <h1 className="font-bold text-lg text-slate-900 hidden sm:block">
            {title || 'Sheet to Trip'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
             <form onSubmit={handleSubmit} className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Paste Google Sheet Link/ID"
                  className="px-3 py-1.5 text-sm border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-64"
                  autoFocus
                />
                <button type="submit" className="text-xs bg-indigo-600 text-white px-3 py-2 rounded-md font-medium hover:bg-indigo-700">
                  Load
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="text-xs text-slate-500 px-2 hover:text-slate-800">
                  Cancel
                </button>
             </form>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 text-sm text-slate-600 hover:bg-slate-50 px-3 py-1.5 rounded-md transition-colors border border-transparent hover:border-slate-200"
              title="Change Sheet"
            >
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
              <span className="hidden sm:inline text-xs font-mono max-w-[100px] truncate opacity-50">{sheetId}</span>
            </button>
          )}

          <a 
            href={`https://docs.google.com/spreadsheets/d/${sheetId}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
            title="Open Source Sheet"
          >
            <LinkIcon className="w-5 h-5" />
          </a>

          <button 
            onClick={onRefresh}
            disabled={isLoading}
            className={`p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors ${isLoading ? 'animate-spin text-indigo-600' : ''}`}
            title="Refresh Data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};