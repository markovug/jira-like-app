import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import ProtectedRoute from "./ProtectedRoute";
import ProjectDetails from "./pages/ProjectDetails";
import ProjectIssues from "./pages/ProjectIssues";
import ProjectBoard from "./pages/ProjectBoard";
import IssueDetailsPage from "./pages/IssueDetailsPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AppShell from "./layout/AppShell";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/projects" replace />} />
      <Route path="/login" element={<Login />} />

      <Route 
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route
          path="/projects"
          element={ <Projects /> }
        />
        <Route
          path="/projects/:key"
          element={ <ProjectDetails /> }
        />
        <Route
          path="/projects/:key/issues"
          element={ <ProjectIssues /> }
        />
        <Route
          path="/projects/:key/board"
          element={ <ProjectBoard /> }
        />
        <Route
          path="/projects/:key/issues/:issueId"
          element={ <IssueDetailsPage /> }
        />
        <Route
          path="/admin/users"
          element={ <AdminUsersPage /> }
        />
      </Route>
    </Routes>
  );
}
