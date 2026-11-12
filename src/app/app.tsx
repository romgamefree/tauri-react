import { useState } from "react";
import type { PageKey } from "@/types/navigation";
import type { EntityKey } from "@/types/catalog";
import { CoursesPage } from "@/pages/courses-page";
import { OverviewPage } from "@/pages/overview-page";
import { StudentsPage } from "@/pages/students-page";
import { TeachersPage } from "@/pages/teachers-page";
import { VehiclesPage } from "@/pages/vehicles-page";
import { SqlServerPage } from "@/pages/sql-server-page";
import Layout from "@/layouts/app-layout";

function App() {
  const [activePage, setActivePage] = useState<PageKey>("overview");

  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      {activePage === "overview" && <OverviewPage onNavigate={(page: EntityKey) => setActivePage(page)} />}
      {activePage === "students" && <StudentsPage />}
      {activePage === "teachers" && <TeachersPage />}
      {activePage === "vehicles" && <VehiclesPage />}
      {activePage === "courses" && <CoursesPage />}
      {activePage === "sqlServer" && <SqlServerPage />}
    </Layout>
  );
}

export default App;
