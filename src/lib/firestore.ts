import { 
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  onSnapshot,
  orderBy,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { Property, Task } from '../types';

export const addProperty = async (userId: string, property: Omit<Property, 'id' | 'tasks'>) => {
  const propertyRef = doc(collection(db, 'properties'));
  await setDoc(propertyRef, {
    ...property,
    userId,
    tasks: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return propertyRef.id;
};

export const updateProperty = async (propertyId: string, data: Partial<Property>) => {
  const propertyRef = doc(db, 'properties', propertyId);
  await updateDoc(propertyRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const deleteProperty = async (propertyId: string) => {
  const batch = writeBatch(db);
  
  // Delete all tasks
  const tasksSnapshot = await getDocs(collection(db, 'properties', propertyId, 'tasks'));
  tasksSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  // Delete the property
  const propertyRef = doc(db, 'properties', propertyId);
  batch.delete(propertyRef);
  
  await batch.commit();
};

export const addTask = async (propertyId: string, task: Omit<Task, 'id' | 'completed'>) => {
  const taskRef = doc(collection(db, 'properties', propertyId, 'tasks'));
  await setDoc(taskRef, {
    ...task,
    completed: false,
    nextDue: Timestamp.fromDate(new Date(task.nextDue)),
    lastCompleted: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return taskRef.id;
};

export const updateTask = async (propertyId: string, taskId: string, data: Partial<Task>) => {
  const taskRef = doc(db, 'properties', propertyId, 'tasks', taskId);
  const updateData: Record<string, any> = {
    updatedAt: serverTimestamp()
  };
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      if (key === 'nextDue' && value instanceof Date) {
        updateData[key] = Timestamp.fromDate(value);
      } else if (key === 'lastCompleted') {
        updateData[key] = value ? Timestamp.fromDate(new Date(value)) : null;
      } else {
        updateData[key] = value;
      }
    }
  });

  await updateDoc(taskRef, updateData);
};

export const deleteTask = async (propertyId: string, taskId: string) => {
  const taskRef = doc(db, 'properties', propertyId, 'tasks', taskId);
  await deleteDoc(taskRef);
};

export const watchProperties = (userId: string, callback: (properties: Property[]) => void) => {
  // Changed query to only filter by userId without ordering
  // This avoids the need for a composite index
  const q = query(
    collection(db, 'properties'),
    where('userId', '==', userId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const properties = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        tasks: [],
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      }) as Property)
      // Sort on the client side instead
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      
    callback(properties);
  });
};

export const watchTasks = (propertyId: string, callback: (tasks: Task[]) => void) => {
  const q = query(
    collection(db, 'properties', propertyId, 'tasks'),
    orderBy('nextDue', 'asc') // Order by nextDue date instead of createdAt
  );
  
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        nextDue: data.nextDue?.toDate() || new Date(),
        lastCompleted: data.lastCompleted?.toDate() || null,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Task;
    });
    callback(tasks);
  });
};