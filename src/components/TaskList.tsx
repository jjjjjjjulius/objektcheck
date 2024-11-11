import React from 'react';
import { CheckCircle2, Circle, RotateCcw, Pencil, Trash2 } from 'lucide-react';
import { Task } from '../types';
import { AddTaskButton } from './AddTaskButton';
import { EditTaskModal } from './EditTaskModal';

interface TaskListProps {
  tasks: Task[];
  onTaskComplete: (taskId: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'completed' | 'lastCompleted'>) => void;
  onEditTask: (taskId: string, task: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskList({ tasks, onTaskComplete, onAddTask, onEditTask, onDeleteTask }: TaskListProps) {
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);

  const handleTaskComplete = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      onTaskComplete(taskId);
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <div 
          key={task.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleTaskComplete(task.id)}
              className="focus:outline-none"
            >
              {task.completed ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : (
                <Circle className="w-6 h-6 text-gray-400" />
              )}
            </button>
            <div>
              <h4 className={`font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                {task.title}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <RotateCcw className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {task.interval === 'daily' && 'Täglich'}
                  {task.interval === 'weekly' && 'Wöchentlich'}
                  {task.interval === 'monthly' && 'Monatlich'}
                  {task.interval === 'quarterly' && 'Vierteljährlich'}
                  {task.interval === 'yearly' && 'Jährlich'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 mr-4">
              Fällig: {new Date(task.nextDue).toLocaleDateString('de-DE')}
            </span>
            <button
              onClick={() => setEditingTask(task)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Bearbeiten"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeleteTask(task.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Löschen"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
      <AddTaskButton onAdd={onAddTask} />
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onSave={(updatedTask) => {
            onEditTask(editingTask.id, updatedTask);
            setEditingTask(null);
          }}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}