import { useState } from 'react';
import { Plus, CheckCircle, Circle, Calendar, Pencil, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../types';

interface TaskViewProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  onTaskComplete: (taskId: string) => void;
  onEditTask?: (taskId: string, task: Partial<Task>) => void;
  onDeleteTask?: (taskId: string) => void;
}

export function TaskView({ 
  tasks, 
  onAddTask, 
  onTaskComplete,
  onEditTask,
  onDeleteTask 
}: TaskViewProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskInterval, setNewTaskInterval] = useState<Task['interval']>('weekly');
  const [newTaskDueDate, setNewTaskDueDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTask({
      title: newTaskTitle,
      interval: newTaskInterval,
      nextDue: new Date(newTaskDueDate),
    });
    setNewTaskTitle('');
    setNewTaskInterval('weekly');
    setNewTaskDueDate(new Date().toISOString().split('T')[0]);
    setIsAddingTask(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !onEditTask) return;

    onEditTask(editingTask.id, {
      title: newTaskTitle,
      interval: newTaskInterval,
      nextDue: new Date(newTaskDueDate),
    });

    setEditingTask(null);
    setNewTaskTitle('');
    setNewTaskInterval('weekly');
    setNewTaskDueDate(new Date().toISOString().split('T')[0]);
  };

  const startEditing = (task: Task) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setNewTaskInterval(task.interval);
    setNewTaskDueDate(new Date(task.nextDue).toISOString().split('T')[0]);
  };

  const handleDelete = (taskId: string) => {
    if (onDeleteTask && window.confirm('Möchten Sie diese Aufgabe wirklich löschen?')) {
      onDeleteTask(taskId);
    }
  };

  return (
    <div className="space-y-4">
      <motion.div 
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-semibold text-gray-800">Aufgaben</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAddingTask(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Neue Aufgabe
        </motion.button>
      </motion.div>

      <motion.div 
        className="space-y-2"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.05
            }
          }
        }}
      >
        <AnimatePresence mode='popLayout'>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`flex items-center justify-between p-4 bg-white rounded-lg border ${
                task.completed ? 'border-green-100' : 'border-gray-100'
              } hover:shadow-sm transition-shadow group`}
            >
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onTaskComplete(task.id)}
                  className="focus:outline-none"
                >
                  {task.completed ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-300" />
                  )}
                </motion.button>
                <div>
                  <p
                    className={`font-medium ${
                      task.completed ? 'text-gray-400 line-through' : 'text-gray-800'
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      Fällig am {new Date(task.nextDue).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                  {task.interval === 'daily' && 'Täglich'}
                  {task.interval === 'weekly' && 'Wöchentlich'}
                  {task.interval === 'monthly' && 'Monatlich'}
                  {task.interval === 'quarterly' && 'Vierteljährlich'}
                  {task.interval === 'yearly' && 'Jährlich'}
                </span>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onEditTask && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => startEditing(task)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </motion.button>
                  )}
                  {onDeleteTask && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(task.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {(isAddingTask || editingTask) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingTask ? 'Aufgabe bearbeiten' : 'Neue Aufgabe hinzufügen'}
              </h2>
              <form onSubmit={editingTask ? handleEditSubmit : handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titel
                  </label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Intervall
                  </label>
                  <select
                    value={newTaskInterval}
                    onChange={(e) => setNewTaskInterval(e.target.value as Task['interval'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    Fälligkeitsdatum
                  </label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      setIsAddingTask(false);
                      setEditingTask(null);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Abbrechen
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {editingTask ? 'Speichern' : 'Hinzufügen'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}