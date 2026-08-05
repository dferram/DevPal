import { Event } from "@/components/EventCard";

export const mockEvents: Event[] = [
  {
    id: "1",
    title: "Taller React Native",
    date: "28 Ene",
    time: "18:00",
    location: "TechHub CDMX",
    category: "workshop",
    popular: true,
  },
  {
    id: "2",
    title: "Meetup IA & Machine Learning",
    date: "30 Ene",
    time: "19:00",
    location: "Google Dev Space",
    category: "meetup",
    spotsLeft: 3,
  },
  {
    id: "3",
    title: "Conferencia DevOps 2026",
    date: "2 Feb",
    time: "09:00",
    location: "Centro Banamex",
    category: "conference",
  },
  {
    id: "4",
    title: "Workshop Python para Data Science",
    date: "5 Feb",
    time: "16:00",
    location: "Innovation Lab",
    category: "workshop",
    popular: true,
    spotsLeft: 5,
  },
  {
    id: "5",
    title: "Hackathon Blockchain",
    date: "10 Feb",
    time: "10:00",
    location: "Startup Campus",
    category: "conference",
  },
];

export const userProfile = {
  name: "Diego",
  avatar: "",
  level: 7,
  streak: 12,
  eventsAttended: 24,
  interests: ["React", "Python", "IA", "UX/UI"],
};
