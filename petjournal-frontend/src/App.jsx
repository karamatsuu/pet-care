import { Navigate, Route, Routes } from "react-router-dom";

import AddPetPage from "./pages/AddPetPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import EditPetPage from "./pages/EditPetPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import PetProfilePage from "./pages/PetProfilePage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/pets/new" element={<AddPetPage />} />
        <Route path="/pets/:petId" element={<PetProfilePage />} />
        <Route path="/pets/:petId/edit" element={<EditPetPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
