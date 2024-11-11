import { Property } from '../types';

export const properties: Property[] = [
  {
    id: '1',
    name: 'Residenz Sonnenhof',
    address: 'Sonnenallee 123, 10115 Berlin',
    tasks: [
      {
        id: '1',
        title: 'Treppenhaus reinigen',
        interval: 'weekly',
        nextDue: new Date(2024, 2, 20),
        completed: false,
      },
      {
        id: '2',
        title: 'Heizungsanlage prüfen',
        interval: 'monthly',
        nextDue: new Date(2024, 3, 1),
        completed: false,
      },
    ],
  },
  {
    id: '2',
    name: 'Parkview Apartments',
    address: 'Parkstraße 45, 10117 Berlin',
    tasks: [
      {
        id: '3',
        title: 'Außenanlage pflegen',
        interval: 'weekly',
        nextDue: new Date(2024, 2, 21),
        completed: false,
      },
    ],
  },
];