import React from 'react';
import { Building2, CalendarCheck, ClipboardList, Trash2 } from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
  onDelete: (propertyId: string) => void;
}

export function PropertyCard({ property, onSelect, onDelete }: PropertyCardProps) {
  const pendingTasks = property.tasks.filter(task => !task.completed).length;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Möchten Sie dieses Objekt wirklich löschen? Alle zugehörigen Aufgaben werden ebenfalls gelöscht.')) {
      onDelete(property.id);
    }
  };

  return (
    <div 
      onClick={() => onSelect(property)}
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border border-gray-100 relative group"
    >
      <button
        onClick={handleDelete}
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Objekt löschen"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-3 mb-4">
        <Building2 className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-800">{property.name}</h3>
      </div>
      
      <p className="text-gray-600 mb-4">{property.address}</p>
      
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-blue-600" />
          <span>{pendingTasks} offene Aufgaben</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-green-600" />
          <span>{property.tasks.length} Gesamt</span>
        </div>
      </div>
    </div>
  );
}