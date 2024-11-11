import { Upload, FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { uploadWasteSchedule } from '../lib/storage';
import { motion, AnimatePresence } from 'framer-motion';

interface WasteScheduleProps {
  propertyId: string;
  scheduleUrl?: string;
  onUpload: (url: string) => void;
}

export function WasteSchedule({ propertyId, scheduleUrl, onUpload }: WasteScheduleProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset error state
    setError(null);

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Bitte laden Sie nur PDF, JPG oder PNG Dateien hoch.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Die Datei darf nicht größer als 5MB sein.');
      return;
    }

    setUploading(true);

    try {
      console.log('Starting upload for file:', file.name);
      const url = await uploadWasteSchedule(propertyId, file);
      console.log('Upload completed, URL:', url);
      onUpload(url);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.message || 'Beim Hochladen ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-100 p-6"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Müllplan</h2>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {scheduleUrl ? (
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <FileText className="w-5 h-5 text-blue-600" />
            <a
              href={scheduleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Aktuellen Müllplan anzeigen
            </a>
          </motion.div>

          <div className="border-t pt-6">
            <p className="text-sm text-gray-600 mb-2">Neuen Plan hochladen:</p>
            <label className={`inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'} transition-all`}>
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>{uploading ? 'Wird hochgeladen...' : 'Datei auswählen'}</span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg"
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Noch kein Müllplan vorhanden</p>
          <label className={`inline-flex items-center gap-2 px-4 py-2 ${uploading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'} text-white rounded-lg transition-colors`}>
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>{uploading ? 'Wird hochgeladen...' : 'Müllplan hochladen'}</span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </motion.div>
      )}
    </motion.div>
  );
}