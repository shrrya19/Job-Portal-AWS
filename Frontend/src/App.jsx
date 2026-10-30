import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Home from "./components/Home";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Jobs from "./components/Jobs";
import Browse from "./components/Browse";
import SavedJobs from "./components/SavedJobs";
import Profile from "./components/Profile";
import JobDescription from "./components/JobDescription";

// Events
import Events from "./components/events/Events";
import EventDetails from "./components/events/EventDetails";

// ATS Resume Builder & Analyzer
import AtsResumeHub from "./components/resume/AtsResumeHub";

// Demo Interview Scheduling System
import DemoInterviewHub from "./components/interview/DemoInterviewHub";
import InterviewSession from "./components/interview/InterviewSession";
import InterviewFeedback from "./components/interview/InterviewFeedback";

// Admin
import Companies from "./components/admin/Companies";
import CompanyCreate from "./components/admin/CompanyCreate";
import CompanySetup from "./components/admin/CompanySetup";
import AdminJobs from "./components/admin/AdminJobs";
import PostJob from "./components/admin/PostJob";
import Applicants from "./components/admin/Applicants";
import ProtectedRoute from "./components/admin/ProtectedRoute";

import "./App.css";

const appRouter = createBrowserRouter([
  // Public Routes
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/jobs",
    element: <Jobs />,
  },
  {
    path: "/internships",
    element: <Jobs internshipsOnly />,
  },
  {
    path: "/description/:id",
    element: <JobDescription />,
  },
  {
    path: "/browse",
    element: <Browse />,
  },
  {
    path: "/savedjobs",
    element: <SavedJobs />,
  },

  // Events
  {
    path: "/events",
    element: <Events />,
  },
  {
    path: "/events/:id",
    element: <EventDetails />,
  },

  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/ats-resume",
    element: <AtsResumeHub />,
  },
  {
    path: "/demo-interview",
    element: <DemoInterviewHub />,
  },
  {
    path: "/demo-interview/session/:id",
    element: <InterviewSession />,
  },
  {
    path: "/demo-interview/feedback/:id",
    element: <InterviewFeedback />,
  },

  // Admin Routes
  {
    path: "/admin/companies",
    element: (
      <ProtectedRoute>
        <Companies />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/companies/create",
    element: (
      <ProtectedRoute>
        <CompanyCreate />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/companies/:id",
    element: (
      <ProtectedRoute>
        <CompanySetup />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs",
    element: (
      <ProtectedRoute>
        <AdminJobs />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs/create",
    element: (
      <ProtectedRoute>
        <PostJob />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs/:id/edit",
    element: (
      <ProtectedRoute>
        <PostJob />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs/:id/applicants",
    element: (
      <ProtectedRoute>
        <Applicants />
      </ProtectedRoute>
    ),
  },
]);

function App() {
  return <RouterProvider router={appRouter} />;
}

export default App;