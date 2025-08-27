'use client';

import { DataInfo } from '@/utils/cloudcasting-api';

interface TimestampDisplayProps {
  dataInfo: DataInfo | null;
  isLoading: boolean;
}

export default function TimestampDisplay({ dataInfo, isLoading }: TimestampDisplayProps) {
  // Format init_time from ISO string to human readable

  // Format init_time from ISO string to human readable
  const formatInitTime = (isoString: string | null) => {
    if (!isoString) return 'Not available';

    try {
      const date = new Date(isoString);
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Get the best available timestamp from data info
  const getBestTimeDisplay = (info: DataInfo | null) => {
    if (!info) return 'No data available';

    // Try init_time first
    if (info.init_time) return formatInitTime(info.init_time);

    // Then try last_modified
    if (info.last_modified) return formatInitTime(info.last_modified);

    // Then try time_range
    if (info.time_range) return info.time_range;

    // If we have file info but no timestamps
    if (info.file_exists) {
      return `Data file (${info.file_size_mb.toFixed(2)} MB)`;
    }

    // No usable timestamp
    return 'No timestamp available';
  };

  return (
    <div className="fixed bottom-4 right-4 z-20 text-white px-3 py-2">
      <div className="flex items-center text-sm">
        {isLoading ? (
          <span className="italic text-gray-300">Loading...</span>
        ) : (
          <span>{dataInfo ? getBestTimeDisplay(dataInfo) : 'No data available'}</span>
        )}
      </div>
    </div>
  );
}
