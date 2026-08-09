import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layouts/MainLayout';
import AttendeeLayout from '../components/layouts/AttendeeLayout';
import LoginPage from '../pages/LoginPage';
import SignUpPage from '../pages/SignUpPage';
import DashboardPage from '../pages/DashboardPage';
import LandingPage from '../pages/LandingPage';
import EventsPage from '../pages/EventsPage';
import EventDetailPage from '../pages/EventDetailPage';
import GlobalEventsPage from '../pages/GlobalEventsPage';
import BroadcastPage from '../pages/BroadcastPage';
import FeedbackPage from '../pages/FeedbackPage';
import SettingsPage from '../pages/SettingsPage';
import GuestsPage from '../pages/GuestsPage';
import AdminReportsPage from '../pages/AdminReportsPage';
import AdminFinancePage from '../pages/AdminFinancePage';
import AttendeeDashboardPage from '../pages/AttendeeDashboardPage';
import AttendeeTicketsPage from '../pages/AttendeeTicketsPage';
import AttendeeEventsPage from '../pages/AttendeeEventsPage';
import AttendeeExplorePage from '../pages/AttendeeExplorePage';
import AttendeeQRPage from '../pages/AttendeeQRPage';
import AttendeeReviewPage from '../pages/AttendeeReviewPage';
import AttendeeFavoritesPage from '../pages/AttendeeFavoritesPage';
import OrganizerLayout from '../components/layouts/OrganizerLayout';
import OrganizerDashboardPage from '../pages/OrganizerDashboardPage';
import OrganizerEventsPage from '../pages/OrganizerEventsPage';
import OrganizerAttendeesPage from '../pages/OrganizerAttendeesPage';
import OrganizerEventAttendeesPage from '../pages/OrganizerEventAttendeesPage';
import OrganizerSchedulePage from '../pages/OrganizerSchedulePage';
import OrganizerTimelinePage from '../pages/OrganizerTimelinePage';
import OrganizerReportPage from '../pages/OrganizerReportPage';
import OrganizerReportAnalyticsPage from '../pages/OrganizerReportAnalyticsPage';
import OrganizerReportTemplatesPage from '../pages/OrganizerReportTemplatesPage';
import OrganizerFinancePage from '../pages/OrganizerFinancePage';
import OrganizerEventFinancePage from '../pages/OrganizerEventFinancePage';
import CreateEventPage from '../pages/CreateEventPage';
import InvitationAcceptPage from '../pages/InvitationAcceptPage';
import NotificationPage from '../pages/NotificationPage';
import SupportPage from '../pages/SupportPage';
import { useAuth } from '../stores/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};



const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/invitations/:token" element={<InvitationAcceptPage />} />
        
        {/* Organizer Protected Routes - With Sidebar/Header */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><MainLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="events" element={<GlobalEventsPage />} />
          <Route path="events/create" element={<CreateEventPage />} />
          <Route path="broadcast" element={<BroadcastPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="guests" element={<GuestsPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="finance" element={<AdminFinancePage />} />
          <Route path="help" element={<SupportPage />} />
          <Route path="notifications" element={<NotificationPage />} />
        </Route>

        {/* Attendee Protected Routes - Separate Layout */}
        <Route path="/attendee" element={<ProtectedRoute allowedRoles={['ATTENDEE']}><AttendeeLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/attendee/dashboard" replace />} />
          <Route path="dashboard" element={<AttendeeDashboardPage />} />
          <Route path="tickets" element={<AttendeeTicketsPage />} />
          <Route path="events" element={<AttendeeEventsPage />} />
          <Route path="events/:id" element={<EventDetailPage />} />
          <Route path="explore" element={<AttendeeExplorePage />} />
          <Route path="qr" element={<AttendeeQRPage />} />
          <Route path="reviews" element={<AttendeeReviewPage />} />
          <Route path="favorites" element={<AttendeeFavoritesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="help" element={<SupportPage />} />
          <Route path="notifications" element={<NotificationPage />} />
        </Route>

        {/* Organizer Protected Routes - New Role Layout */}
        <Route path="/organizer" element={<ProtectedRoute allowedRoles={['ORGANIZER']}><OrganizerLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/organizer/dashboard" replace />} />
          <Route path="dashboard" element={<OrganizerDashboardPage />} />
          <Route path="events" element={<OrganizerEventsPage />} />
          <Route path="events/create" element={<CreateEventPage />} />
          <Route path="attendees" element={<OrganizerAttendeesPage />} />
          <Route path="events/:id/attendees" element={<OrganizerEventAttendeesPage />} />
          <Route path="schedule" element={<OrganizerSchedulePage />} />
          <Route path="timeline" element={<OrganizerTimelinePage />} />
          <Route path="reports" element={<OrganizerReportPage />} />
          <Route path="reports/analytics" element={<OrganizerReportAnalyticsPage />} />
          <Route path="reports/templates" element={<OrganizerReportTemplatesPage />} />
          <Route path="finance" element={<OrganizerFinancePage />} />
          <Route path="finance/:id" element={<OrganizerEventFinancePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="help" element={<SupportPage />} />
          <Route path="notifications" element={<NotificationPage />} />
        </Route>


        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;


