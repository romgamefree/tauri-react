import { useEffect, useState, type FormEvent } from "react";
import { Database, LoaderCircle, PlugZap, Save } from "lucide-react";
import { isTauri } from "@tauri-apps/api/core";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { loadSqlServerConnection, saveSqlServerConnection, testSqlServerConnection } from "@/services/sql-server-service";
import type { SqlServerConnection, SqlServerInput } from "@/types/sql-server";

const defaults: SqlServerConnection = {
  host: "",
  port: 1433,
  database: "",
  username: "",
  trustServerCertificate: false,
};

export function SqlServerPage() {
  const [settings, setSettings] = useState<SqlServerConnection>(defaults);
  const [password, setPassword] = useState("");
  const [hasSavedPassword, setHasSavedPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"save" | "test" | null>(null);
  const { toast, notify, dismissToast } = useToast();
  const desktop = isTauri();

  useEffect(() => {
    if (!desktop) {
      setLoading(false);
      return;
    }
    let mounted = true;
    loadSqlServerConnection()
      .then((saved) => {
        if (!mounted) return;
        if (saved.settings) setSettings(saved.settings);
        setHasSavedPassword(saved.hasPassword);
      })
      .catch((error) => { if (mounted) notify(`Không tải được cấu hình: ${String(error)}`, "error"); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [desktop, notify]);

  function update<K extends keyof SqlServerConnection>(key: K, value: SqlServerConnection[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function input(): SqlServerInput {
    return { ...settings, host: settings.host.trim(), database: settings.database.trim(), username: settings.username.trim(), password };
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("save");
    try {
      await saveSqlServerConnection(input());
      if (password) setHasSavedPassword(true);
      setPassword("");
      notify("Đã lưu cấu hình kết nối SQL Server.");
    } catch (error) {
      notify(`Không lưu được cấu hình: ${String(error)}`, "error");
    } finally {
      setBusy(null);
    }
  }

  async function handleTest() {
    setBusy("test");
    try {
      await testSqlServerConnection(input());
      notify("Kết nối SQL Server thành công.");
    } catch (error) {
      notify(`Kết nối thất bại: ${String(error)}`, "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Cài đặt</p>
          <h1 className="text-2xl font-semibold tracking-tight">Kết nối SQL Server</h1>
          <p className="text-sm text-muted-foreground">Thiết lập kết nối trực tiếp đến cơ sở dữ liệu của bên thứ ba.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={handleTest} disabled={loading || busy !== null || !desktop || !settings.host || !settings.database || !settings.username || (!password && !hasSavedPassword)}>
            {busy === "test" ? <LoaderCircle className="animate-spin" /> : <PlugZap />} Kiểm tra kết nối
          </Button>
          <Button type="submit" form="sql-server-settings" disabled={loading || busy !== null || !desktop}>
            {busy === "save" ? <LoaderCircle className="animate-spin" /> : <Save />} Lưu cấu hình
          </Button>
        </div>
      </div>

      <section className="w-full min-w-0 rounded-xl border bg-card p-4 sm:p-6">
        <div className="mb-6 flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Database className="size-5" /></span>
          <div className="min-w-0">
            <h2 className="font-semibold">Kết nối SQL Server</h2>
            <p className="text-sm text-muted-foreground">Dùng tài khoản SQL Server để kết nối qua mạng. Cấu hình này độc lập với SQLite của ứng dụng.</p>
          </div>
        </div>

        {!desktop && <p role="status" className="mb-5 rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground">Chức năng kết nối chỉ dùng được trong ứng dụng desktop Tauri.</p>}

        <form id="sql-server-settings" className="flex max-w-2xl flex-col gap-5" onSubmit={handleSave}>
          <div className="grid min-w-0 gap-5 sm:grid-cols-[minmax(0,1fr)_9rem]">
            <Field>
              <FieldLabel htmlFor="sql-host">Máy chủ</FieldLabel>
              <Input id="sql-host" value={settings.host} onChange={(event) => update("host", event.target.value)} placeholder="192.168.1.10 hoặc sql.example.com" required disabled={loading || busy !== null || !desktop} />
            </Field>
            <Field>
              <FieldLabel htmlFor="sql-port">Cổng</FieldLabel>
              <Input id="sql-port" type="number" min="1" max="65535" value={settings.port} onChange={(event) => update("port", Number(event.target.value))} required disabled={loading || busy !== null || !desktop} />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="sql-database">Cơ sở dữ liệu</FieldLabel>
            <Input id="sql-database" value={settings.database} onChange={(event) => update("database", event.target.value)} required disabled={loading || busy !== null || !desktop} />
          </Field>
          <Field>
            <FieldLabel htmlFor="sql-user">Tên đăng nhập SQL Server</FieldLabel>
            <Input id="sql-user" value={settings.username} onChange={(event) => update("username", event.target.value)} autoComplete="username" required disabled={loading || busy !== null || !desktop} />
          </Field>
          <Field>
            <FieldLabel htmlFor="sql-password">Mật khẩu</FieldLabel>
            <Input id="sql-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" placeholder={hasSavedPassword ? "Đã lưu trong hệ điều hành; để trống để giữ nguyên" : "Nhập mật khẩu SQL Server"} disabled={loading || busy !== null || !desktop} />
            <FieldDescription>Mật khẩu được lưu trong kho thông tin đăng nhập của hệ điều hành, không ghi vào tệp cấu hình.</FieldDescription>
          </Field>
          <label className="flex items-start gap-3 rounded-lg border p-3 text-sm">
            <input type="checkbox" className="mt-0.5 size-4 shrink-0 accent-primary" checked={settings.trustServerCertificate} onChange={(event) => update("trustServerCertificate", event.target.checked)} disabled={loading || busy !== null || !desktop} />
            <span><span className="font-medium">Tin cậy chứng chỉ máy chủ</span><span className="mt-1 block text-muted-foreground">Chỉ bật khi SQL Server dùng chứng chỉ tự ký hoặc nội bộ và bạn tin cậy máy chủ đó.</span></span>
          </label>
        </form>
      </section>
      <Toast message={toast} onDismiss={dismissToast} />
    </div>
  );
}
