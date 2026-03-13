import React from 'react';
// ─── Static imports — webpack bundles images correctly, no hardcoded URLs ───
import campusLifeImg   from './campus_life.png';
import campusEventsImg from './campus_events.png';
import campusPlaceImg  from './campus_placements.png';
import avatarImg       from './student_avatar.png';
import tcsLogo         from './logo_tcs.png';
import infosysLogo     from './logo_infosys.png';

// ─── Campus Highlights ───────────────────────────────────────────────────────
export const campusHighlights = [
  {
    id: 1,
    title: 'Campus Life',
    description: 'Explore clubs, sports & student activities',
    image: campusLifeImg,
    tag: 'Student Life',
    color: '#e0f2fe',
  },
  {
    id: 2,
    title: 'Events & Fests',
    description: 'Tech fests, cultural nights & hackathons',
    image: campusEventsImg,
    tag: 'Events',
    color: '#fce7f3',
  },
  {
    id: 3,
    title: 'Placements',
    description: 'Top companies visiting every semester',
    image: campusPlaceImg,
    tag: 'Careers',
    color: '#d1fae5',
  },
];

// ─── Student Profile ─────────────────────────────────────────────────────────
export const studentProfile = {
  name: 'Student',
  initials: 'S',
  avatar: avatarImg,
  course: 'B.Tech – CSE',
  year: '3rd Year',
  cgpa: '8.7',
};

// ─── Job Listings ────────────────────────────────────────────────────────────
// Only TCS and Infosys have generated logos; others use an SVG color badge.
export const jobListings = [
  {
    id: 1,
    title: 'Software Engineer',
    company: 'TCS',
    logo: tcsLogo,
    logoType: 'image',
    location: 'Hyderabad',
    ctc: '7.5 LPA',
    type: 'Full-Time',
    skills: ['Java', 'Spring Boot', 'SQL'],
    deadline: '2025-04-10',
    badge: 'Hot',
    badgeColor: '#ef4444',
    logoColor: '#0052cc',
  },
  {
    id: 2,
    title: 'Systems Engineer',
    company: 'Infosys',
    logo: infosysLogo,
    logoType: 'image',
    location: 'Bangalore',
    ctc: '6.5 LPA',
    type: 'Full-Time',
    skills: ['Python', 'Django', 'REST APIs'],
    deadline: '2025-04-15',
    badge: 'New',
    badgeColor: '#1a73e8',
    logoColor: '#007cc2',
  },
  {
    id: 3,
    title: 'Graduate Engineer Trainee',
    company: 'Wipro',
    logo: null,
    logoType: 'abbr',
    location: 'Pune',
    ctc: '6.0 LPA',
    type: 'Full-Time',
    skills: ['C++', 'Cloud', 'DevOps'],
    deadline: '2025-04-20',
    badge: 'Closing Soon',
    badgeColor: '#f59e0b',
    logoColor: '#9b59b6',
  },
  {
    id: 4,
    title: 'Cloud Associate',
    company: 'HCL Tech',
    logo: null,
    logoType: 'abbr',
    location: 'Chennai',
    ctc: '5.5 LPA',
    type: 'Full-Time',
    skills: ['AWS', 'Azure', 'Linux'],
    deadline: '2025-04-25',
    badge: null,
    badgeColor: null,
    logoColor: '#e91e63',
  },
  {
    id: 5,
    title: 'Data Analyst',
    company: 'Tech Mahindra',
    logo: null,
    logoType: 'abbr',
    location: 'Hyderabad',
    ctc: '8.0 LPA',
    type: 'Full-Time',
    skills: ['Python', 'Tableau', 'ML'],
    deadline: '2025-05-01',
    badge: 'New',
    badgeColor: '#1a73e8',
    logoColor: '#00897b',
  },
  {
    id: 6,
    title: 'Front-End Developer',
    company: 'Capgemini',
    logo: null,
    logoType: 'abbr',
    location: 'Mumbai',
    ctc: '7.0 LPA',
    type: 'Full-Time',
    skills: ['React', 'TypeScript', 'CSS'],
    deadline: '2025-05-10',
    badge: null,
    badgeColor: null,
    logoColor: '#1565c0',
  },
];

// ─── Open Opportunities ──────────────────────────────────────────────────────
export const openOpportunities = [
  {
    id: 1,
    company: "TCS",
    logo: tcsLogo,
    logoType: 'image',
    role: "NQT Hiring Test",
    eligibility: "All Branches",
    mode: "Online Test",
    deadline: "2026-03-25",
    logoColor: '#0052cc',
  },
  {
    id: 2,
    company: "Infosys",
    logo: infosysLogo,
    logoType: 'image',
    role: "HackWithInfy",
    eligibility: "3rd & 4th Year",
    mode: "Coding Contest",
    deadline: "2026-03-28",
    logoColor: '#007cc2',
  },
  {
    id: 3,
    company: "Wipro",
    logo: null,
    logoType: 'abbr',
    role: "Elite National Talent Hunt",
    eligibility: "B.Tech CSE/IT",
    mode: "Online Test",
    deadline: "2026-04-10",
    logoColor: '#9b59b6',
  },
];
