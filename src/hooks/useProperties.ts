import { useState, useEffect } from 'react';
import { Property, Task } from '../types';
import { useAuth } from '../contexts/AuthContext';
import * as firestoreService from '../lib/firestore';

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setProperties([]);
      setLoading(false);
      return;
    }

    const unsubscribe = firestoreService.watchProperties(user.uid, (updatedProperties) => {
      setProperties(updatedProperties);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addProperty = async (property: Omit<Property, 'id' | 'tasks'>) => {
    if (!user) throw new Error('Not authenticated');
    try {
      await firestoreService.addProperty(user.uid, property);
    } catch (err) {
      setError('Failed to add property');
      throw err;
    }
  };

  const deleteProperty = async (propertyId: string) => {
    try {
      await firestoreService.deleteProperty(propertyId);
    } catch (err) {
      setError('Failed to delete property');
      throw err;
    }
  };

  const addTask = async (propertyId: string, task: Omit<Task, 'id' | 'completed'>) => {
    try {
      await firestoreService.addTask(propertyId, task);
    } catch (err) {
      setError('Failed to add task');
      throw err;
    }
  };

  const updateTask = async (propertyId: string, taskId: string, data: Partial<Task>) => {
    try {
      await firestoreService.updateTask(propertyId, taskId, data);
    } catch (err) {
      setError('Failed to update task');
      throw err;
    }
  };

  const deleteTask = async (propertyId: string, taskId: string) => {
    try {
      await firestoreService.deleteTask(propertyId, taskId);
    } catch (err) {
      setError('Failed to delete task');
      throw err;
    }
  };

  return {
    properties,
    loading,
    error,
    addProperty,
    deleteProperty,
    addTask,
    updateTask,
    deleteTask
  };
}