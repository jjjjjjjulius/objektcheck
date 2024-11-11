import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Building2 } from 'lucide-react';
import { Property, Task } from '../types';
import { PropertyList } from './PropertyList';
import { TaskView } from './TaskView';
import { WasteSchedule } from './WasteSchedule';
import { useProperties } from '../hooks/useProperties';
import * as firestoreService from '../lib/firestore';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeView, setActiveView] = useState<'tasks' | 'waste'>('tasks');
  const { properties, loading, addProperty, deleteProperty, addTask, updateTask, deleteTask } = useProperties();

  // Watch tasks for selected property
  useEffect(() => {
    if (!selectedProperty) return;

    const unsubscribe = firestoreService.watchTasks(selectedProperty.id, (tasks) => {
      setSelectedProperty(prev => prev ? { ...prev, tasks } : null);
    });

    return () => unsubscribe();
  }, [selectedProperty?.id]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const handleAddProperty = async (property: Omit<Property, 'id' | 'tasks'>) => {
    await addProperty(property);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    await deleteProperty(propertyId);
    if (selectedProperty?.id === propertyId) {
      setSelectedProperty(null);
    }
  };

  const handleAddTask = async (task: Omit<Task, 'id' | 'completed'>) => {
    if (!selectedProperty) return;
    await addTask(selectedProperty.id, task);
  };

  const handleEditTask = async (taskId: string, updatedTask: Partial<Task>) => {
    if (!selectedProperty) return;
    await updateTask(selectedProperty.id, taskId, updatedTask);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!selectedProperty) return;
    await deleteTask(selectedProperty.id, taskId);
  };

  const handleTaskComplete = async (taskId: string) => {
    if (!selectedProperty) return;
    const task = selectedProperty.tasks.find(t => t.id === taskId);
    if (!task) return;

    await updateTask(selectedProperty.id, taskId, {
      completed: !task.completed,
      lastCompleted: !task.completed ? new Date() : null
    });
  };

  const handleWasteScheduleUpload = async (url: string) => {
    if (!selectedProperty) return;
    await firestoreService.updateProperty(selectedProperty.id, {
      wasteScheduleUrl: url
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-semibold text-gray-800">
                Objektverwaltung
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <LogOut className="w-5 h-5" />
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedProperty ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  ← Zurück zur Übersicht
                </button>
                <h1 className="text-2xl font-bold text-gray-800 mt-2">
                  {selectedProperty.name}
                </h1>
                <p className="text-gray-600">{selectedProperty.address}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveView('tasks')}
                  className={`px-4 py-2 rounded-lg ${
                    activeView === 'tasks'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600'
                  }`}
                >
                  Checkliste
                </button>
                <button
                  onClick={() => setActiveView('waste')}
                  className={`px-4 py-2 rounded-lg ${
                    activeView === 'waste'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600'
                  }`}
                >
                  Müllplan
                </button>
              </div>
            </div>

            {activeView === 'tasks' ? (
              <TaskView
                tasks={selectedProperty.tasks}
                onAddTask={handleAddTask}
                onTaskComplete={handleTaskComplete}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
              />
            ) : (
              <WasteSchedule
                propertyId={selectedProperty.id}
                scheduleUrl={selectedProperty.wasteScheduleUrl}
                onUpload={handleWasteScheduleUpload}
              />
            )}
          </div>
        ) : (
          <PropertyList
            properties={properties}
            onSelectProperty={setSelectedProperty}
            onAddProperty={handleAddProperty}
            onDeleteProperty={handleDeleteProperty}
          />
        )}
      </main>
    </div>
  );
}