export interface Appointment {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  status: string;
  category_id: number;
  category?: {
    id: number;
    name: string;
    color: string;
  };
}

export interface Category {
  id: number;
  name: string;
  color: string;
}

export const mockCategories: Category[] = [
  { id: 1, name: "Work", color: "#4285F4" },
  { id: 2, name: "Personal", color: "#EA4335" },
  { id: 3, name: "Health", color: "#34A853" },
  { id: 4, name: "Education", color: "#FBBC05" },
  { id: 5, name: "Meeting", color: "#8E44AD" },
];

export const mockAppointments: Appointment[] = [
  {
    id: 1,
    title: "Team Meeting",
    description: "Weekly team sync about project progress",
    start_time: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    end_time: new Date(Date.now() + 7200000).toISOString(),   // 2 hours from now
    status: "scheduled",
    category_id: 1,
    category: mockCategories.find(c => c.id === 1),
  },
  {
    id: 2,
    title: "Doctor Appointment",
    description: "Annual physical checkup",
    start_time: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
    end_time: new Date(Date.now() + 88200000).toISOString(),   // 1 day + 30 min from now
    status: "scheduled",
    category_id: 3,
    category: mockCategories.find(c => c.id === 3),
  },
  {
    id: 3,
    title: "Lunch with Alex",
    description: "Discuss partnership opportunities",
    start_time: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
    end_time: new Date(Date.now() + 176400000).toISOString(),   // 2 days + 1 hour from now
    status: "scheduled",
    category_id: 2,
    category: mockCategories.find(c => c.id === 2),
  },
  {
    id: 4,
    title: "Online Course",
    description: "React Advanced Patterns",
    start_time: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
    end_time: new Date(Date.now() + 266400000).toISOString(),   // 3 days + 2 hours from now
    status: "scheduled",
    category_id: 4,
    category: mockCategories.find(c => c.id === 4),
  },
  {
    id: 5,
    title: "Client Presentation",
    description: "Present the new product features",
    start_time: new Date(Date.now() + 345600000).toISOString(), // 4 days from now
    end_time: new Date(Date.now() + 349200000).toISOString(),   // 4 days + 1 hour from now
    status: "scheduled",
    category_id: 5,
    category: mockCategories.find(c => c.id === 5),
  },
]; 