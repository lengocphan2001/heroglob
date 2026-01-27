import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Cài đặt
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Cấu hình chung cho hệ thống
        </p>
      </div>

      <Card title="Thông tin chung">
        <div className="max-w-md space-y-4">
          <Input label="Tên ứng dụng" placeholder="HeroGlob Admin" />
          <Input label="Email hỗ trợ" type="email" placeholder="support@heroglob.com" />
          <Button variant="primary">Lưu thay đổi</Button>
        </div>
      </Card>
    </div>
  );
}
