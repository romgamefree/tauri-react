import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/features/catalog/data-table";
import { EntityDialogs } from "@/features/catalog/entity-dialogs";
import { useEntity } from "@/features/catalog/use-entity";
import { courseConfig } from "@/features/courses/config";
import { courseService } from "@/services/course-service";

export function CoursesPage() {
  const controller = useEntity(courseConfig, courseService);
  const {
    config, items, loading, pageError, retryLoad,
    startCreate, startEdit, copyId, setPendingDelete,
  } = controller;
  const stats = [
    { label: "Tổng khóa học", value: items.length },
    { label: "Đang đào tạo", value: items.filter((item) => item.status === "Đang đào tạo").length },
    { label: "Sắp khai giảng", value: items.filter((item) => item.status === "Sắp khai giảng").length },
    { label: "Đã kết thúc", value: items.filter((item) => item.status === "Đã kết thúc").length },
  ];

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Quản lý khóa học</p>
          <h1 className="text-2xl font-semibold tracking-tight">{config.title}</h1>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button disabled={loading || !!pageError} onClick={startCreate}>
            <Plus /> Thêm {config.singular}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      {pageError && (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          Không thể tải hoặc lưu dữ liệu: {pageError}
          <Button variant="outline" size="sm" className="ml-2" onClick={retryLoad}>Thử lại</Button>
        </p>
      )}
      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
      ) : (
        <DataTable config={config} data={items} onEdit={startEdit} onCopy={copyId} onDelete={setPendingDelete} />
      )}

      <EntityDialogs controller={controller} />
    </div>
  );
}
