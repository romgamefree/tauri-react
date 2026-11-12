import { useState } from "react";
import { ArrowRight, BookOpenCheck, CarFront, Database, GraduationCap, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { entities } from "@/features/catalog/config";
import { seedDatabase } from "@/services/seed-database-service";
import type { EntityKey } from "@/types/catalog";

const cards = [
  { key: "students" as const, icon: GraduationCap },
  { key: "teachers" as const, icon: UsersRound },
  { key: "vehicles" as const, icon: CarFront },
  { key: "courses" as const, icon: BookOpenCheck },
];

export function OverviewPage({ onNavigate }: { onNavigate: (page: EntityKey) => void }) {
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState("");
  const [seedError, setSeedError] = useState(false);

  async function handleSeed() {
    setSeeding(true);
    setSeedMessage("");
    try {
      const result = await seedDatabase();
      const count = result.students + result.teachers + result.vehicles + result.courses;
      setSeedMessage(count === 0 ? "Dữ liệu mẫu đã có trong cơ sở dữ liệu." : `Đã thêm ${count} dữ liệu mẫu vào SQLite.`);
      setSeedError(false);
    } catch (cause) {
      setSeedMessage(`Không thể thêm dữ liệu mẫu: ${String(cause)}`);
      setSeedError(true);
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-8 p-4 md:p-6">
      <div className="space-y-3">
        <Badge variant="secondary">Mẫu quản lý đào tạo</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">Chào mừng đến {import.meta.env.APP_NAME || "DrivePro"}</h1>
        <p className="max-w-2xl text-muted-foreground">
          Quản lý học viên, giáo viên, xe và khóa học trong một giao diện. Chọn danh mục để bắt đầu thêm, sửa, tìm kiếm và theo dõi dữ liệu.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5">
        <div>
          <h2 className="font-semibold">Dữ liệu mẫu</h2>
          <p className="mt-1 text-sm text-muted-foreground">Thêm dữ liệu mẫu còn thiếu vào SQLite. Dữ liệu đã có sẽ được giữ nguyên.</p>
          {seedMessage && <p role="status" className={`mt-2 text-sm ${seedError ? "text-destructive" : "text-foreground"}`}>{seedMessage}</p>}
        </div>
        <Button disabled={seeding} onClick={handleSeed}>
          <Database /> {seeding ? "Đang thêm..." : "Seed dữ liệu"}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ key, icon: Icon }) => (
          <div key={key} className="flex flex-col rounded-xl border bg-card p-5 shadow-xs">
            <span className="mb-5 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-5" /></span>
            <h2 className="text-lg font-semibold">{entities[key].title}</h2>
            <p className="mt-1 min-h-16 text-sm text-muted-foreground">{entities[key].description}</p>
            <Button variant="outline" className="mt-4 w-full justify-between" onClick={() => onNavigate(key)}>
              Mở danh mục <ArrowRight />
            </Button>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-muted/30 p-5">
        <h2 className="font-semibold">Nghiệp vụ trong tài liệu yêu cầu</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Mẫu hiện tập trung vào CRUD và bảng dữ liệu. Các quy trình phân công giáo viên, chuyển khóa, in chứng chỉ và báo cáo cần thêm dữ liệu nghiệp vụ cùng phần xử lý riêng.
        </p>
      </div>
    </div>
  );
}
