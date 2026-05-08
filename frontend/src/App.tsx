import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AuthProvider } from "./lib/auth";
import { CourseDetailPage } from "./pages/CourseDetailPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { MaterialsPage } from "./pages/MaterialsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { QuestionsPage } from "./pages/QuestionsPage";
import { RegisterPage } from "./pages/RegisterPage";
import { SessionsPage } from "./pages/SessionsPage";
import { UploadPage } from "./pages/UploadPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/materials" element={<MaterialsPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/questions" element={<QuestionsPage />} />
            <Route path="/sessions" element={<SessionsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
