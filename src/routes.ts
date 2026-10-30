import { createBrowserRouter } from 'react-router'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, lazy: async () => ({ Component: (await import('./pages/Landing')).default }) },
      { path: 'login', lazy: async () => ({ Component: (await import('./pages/Login')).default }) },
      { path: 'pages/login', lazy: async () => ({ Component: (await import('./pages/Login')).default }) },
      { path: 'signup', lazy: async () => ({ Component: (await import('./pages/Signup')).default }) },
      { path: 'pages/signup', lazy: async () => ({ Component: (await import('./pages/Signup')).default }) },
      {
        Component: RequireAuth,
        children: [
          { path: 'dashboard', lazy: async () => ({ Component: (await import('./pages/Dashboard')).default }) },
          { path: 'pages/dashboard', lazy: async () => ({ Component: (await import('./pages/Dashboard')).default }) },
          { path: 'practice', lazy: async () => ({ Component: (await import('./pages/PracticeTest')).default }) },
          { path: 'practice-test', lazy: async () => ({ Component: (await import('./pages/PracticeTest')).default }) },
          { path: 'pages/practice-test', lazy: async () => ({ Component: (await import('./pages/PracticeTest')).default }) },
          { path: 'pages/practice', lazy: async () => ({ Component: (await import('./pages/PracticeTest')).default }) },
          { path: 'writing', lazy: async () => ({ Component: (await import('./pages/WritingEval')).default }) },
          { path: 'pages/writing-eval', lazy: async () => ({ Component: (await import('./pages/WritingEval')).default }) },
          { path: 'pages/writing', lazy: async () => ({ Component: (await import('./pages/WritingEval')).default }) },
          { path: 'documents', lazy: async () => ({ Component: (await import('./pages/DocGenerator')).default }) },
          { path: 'pages/documents', lazy: async () => ({ Component: (await import('./pages/DocGenerator')).default }) },
          { path: 'resources', lazy: async () => ({ Component: (await import('./pages/ResourceLibrary')).default }) },
          { path: 'pages/resources', lazy: async () => ({ Component: (await import('./pages/ResourceLibrary')).default }) },
          { path: 'community', lazy: async () => ({ Component: (await import('./pages/CommunityForum')).default }) },
          { path: 'pages/forum', lazy: async () => ({ Component: (await import('./pages/CommunityForum')).default }) },
          { path: 'pages/community', lazy: async () => ({ Component: (await import('./pages/CommunityForum')).default }) },
          { path: 'profile', lazy: async () => ({ Component: (await import('./pages/UserProfile')).default }) },
          { path: 'pages/profile', lazy: async () => ({ Component: (await import('./pages/UserProfile')).default }) },
          { path: 'admin', lazy: async () => ({ Component: (await import('./pages/AdminDashboard')).default }) },
          { path: 'pages/admin', lazy: async () => ({ Component: (await import('./pages/AdminDashboard')).default }) },
          { path: 'results', lazy: async () => ({ Component: (await import('./pages/Results')).default }) },
          { path: 'pages/results', lazy: async () => ({ Component: (await import('./pages/Results')).default }) },
          { path: 'exam-dates', lazy: async () => ({ Component: (await import('./pages/ExamDates')).default }) },
          { path: 'pages/exam-dates', lazy: async () => ({ Component: (await import('./pages/ExamDates')).default }) },
        ],
      },
    ],
  },
])
