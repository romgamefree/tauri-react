import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Toast } from "@/components/ui/toast";
import type { CatalogItem } from "@/types/catalog";
import { EntityForm } from "./entity-form";
import type { EntityController } from "./use-entity";

export function EntityDialogs<T extends CatalogItem>({ controller }: { controller: EntityController<T> }) {
  const {
    config, items, editing, formOpen, setFormOpen, saveItem,
    pendingDelete, setPendingDelete, deleteItems,
    notify, toast, dismissToast,
  } = controller;

  return (
    <>
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? `Sửa ${config.singular}` : `Thêm ${config.singular}`}</DialogTitle>
            <DialogDescription>Nhập thông tin và lưu vào cơ sở dữ liệu trên thiết bị này.</DialogDescription>
          </DialogHeader>
          {formOpen && (
            <EntityForm
              key={editing?.id ?? "new"}
              config={config}
              item={editing}
              items={items}
              onSave={saveItem}
              onError={(message) => notify(message, "error")}
              onCancel={() => setFormOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={pendingDelete.length > 0} onOpenChange={(open) => { if (!open) setPendingDelete([]); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa {pendingDelete.length} {config.singular}?</AlertDialogTitle>
            <AlertDialogDescription>Thao tác này sẽ xóa dữ liệu đã chọn khỏi cơ sở dữ liệu trên thiết bị.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={deleteItems}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toast message={toast} onDismiss={dismissToast} />
    </>
  );
}
