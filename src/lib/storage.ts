import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

export async function uploadWasteSchedule(propertyId: string, file: File) {
  try {
    // Create a unique filename using timestamp
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const fileRef = ref(storage, `waste-schedules/${propertyId}/${filename}`);
    
    // Upload the file
    const snapshot = await uploadBytes(fileRef, file);
    console.log('File uploaded successfully:', snapshot);
    
    // Get the download URL
    const downloadUrl = await getDownloadURL(snapshot.ref);
    console.log('Download URL obtained:', downloadUrl);
    
    // Update the property document with the new URL
    const propertyRef = doc(db, 'properties', propertyId);
    await updateDoc(propertyRef, {
      wasteScheduleUrl: downloadUrl,
      updatedAt: new Date()
    });
    console.log('Property document updated with new URL');
    
    return downloadUrl;
  } catch (error: any) {
    console.error('Error in uploadWasteSchedule:', error);
    if (error.code === 'storage/unauthorized') {
      throw new Error('Keine Berechtigung zum Hochladen von Dateien. Bitte melden Sie sich erneut an.');
    } else if (error.code === 'storage/canceled') {
      throw new Error('Upload wurde abgebrochen.');
    } else if (error.code === 'storage/unknown') {
      throw new Error('Ein unbekannter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    }
    throw error;
  }
}