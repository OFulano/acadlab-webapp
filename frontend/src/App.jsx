import { useEffect, useMemo, useState } from "react";
import { api } from "./services/api";
import UniversityGate from "./pages/UniversityGate";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [universities, setUniversities] = useState([]);
  const [selectedUniversityId, setSelectedUniversityId] = useState("");

  const selectedUniversity = useMemo(
    () => universities.find((item) => item.id === selectedUniversityId),
    [universities, selectedUniversityId]
  );

  const loadUniversities = async () => {
    const data = await api.get("/api/universidades");
    setUniversities(data);
  };

  useEffect(() => {
    loadUniversities().catch((error) => {
      alert(`Falha ao carregar universidades: ${error.message}`);
    });
  }, []);

  const handleCreateUniversity = async (payload) => {
    const created = await api.post("/api/universidades", payload);
    await loadUniversities();
    setSelectedUniversityId(created.id);
  };

  const handleDeleteUniversity = async (universityId) => {
    await api.delete(`/api/universidades/${universityId}`, { force: "true" });
    if (selectedUniversityId === universityId) {
      setSelectedUniversityId("");
    }
    await loadUniversities();
  };

  if (!selectedUniversity) {
    return (
      <UniversityGate
        universities={universities}
        onSelect={setSelectedUniversityId}
        onCreate={handleCreateUniversity}
        onDelete={handleDeleteUniversity}
      />
    );
  }

  return (
    <Dashboard
      university={selectedUniversity}
      universities={universities}
      onBack={() => setSelectedUniversityId("")}
      onDeleteUniversity={handleDeleteUniversity}
    />
  );
}
