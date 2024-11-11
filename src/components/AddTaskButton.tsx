import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Task } from '../types';

interface AddTaskButtonProps {
  onAdd: (task: Omit<Task, 'id' | 'completed' | 'lastCompleted'>) => void;
}

export function AddTaskButton({ onAdd }: AddTaskButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [interval, setInterval] = useState<Task['interval']>('weekly');
  const [nextDue, setNextDue] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && interval && nextDue) {
      onAdd({
        title,
        interval,
        nextDue: new Date(nextDue),
      });
      setTitle('');
      setInterval('weekly');
      setNextDue(new Date().toISOString().split('T')[0]);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-white rounded-lg border-2 border-dashed border-gray-200 p-4 flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span>Neue Aufgabe hinzufügen</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Neue Aufgabe erstellen</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titel
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="z.B. Treppenhaus reinigen"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Intervall
                  </label>
                  <select
                    value={interval}
                    onChange={(e) => setInterval(e.target.value as Task['interval'])}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Täglich</option>
                    <option value="weekly">Wöchentlich</option>
                    <option value="monthly">Monatlich</option>
                    <option value="quarterly">Vierteljährlich</option>
                    <option value="yearly">Jährlich</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nächstes Fälligkeitsdatum
                  </label>
                  <input
                    type="date"
                    value={nextDue}
                    onChange={(e) => setNextDue(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Erstellen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}