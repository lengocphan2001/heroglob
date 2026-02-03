import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { systemApi, type SystemConfig } from '../api/system';

export function Settings() {
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const data = await systemApi.getAll();
      const map: Record<string, string> = {};
      data.forEach((c: SystemConfig) => (map[c.key] = c.value));
      setConfigs(map);
    } catch (error) {
      console.error('Failed to fetch configs', error);
      toast.error('Không thể tải cấu hình');
    }
  };

  const handleSave = async (key: string, value: string) => {
    try {
      setLoading(true);
      await systemApi.update(key, value);
      toast.success('Đã lưu cấu hình');
      setConfigs((prev) => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi lưu');
    } finally {
      setLoading(false);
    }
  };

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

      <Card title="Active Power Configuration">
        <div className="max-w-md space-y-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                label="Active Power tối thiểu (USDT)"
                type="number"
                value={configs['INVESTMENT_MIN_USDT'] || ''}
                onChange={(e) =>
                  setConfigs({ ...configs, INVESTMENT_MIN_USDT: e.target.value })
                }
              />
            </div>
            <Button
              variant="primary"
              onClick={() =>
                handleSave('INVESTMENT_MIN_USDT', configs['INVESTMENT_MIN_USDT'])
              }
              disabled={loading}
            >
              Lưu
            </Button>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                label="Lợi nhuận hàng ngày (%)"
                type="number"
                value={configs['INVESTMENT_PROFIT_PERCENT'] || ''}
                onChange={(e) =>
                  setConfigs({
                    ...configs,
                    INVESTMENT_PROFIT_PERCENT: e.target.value,
                  })
                }
              />
            </div>
            <Button
              variant="primary"
              onClick={() =>
                handleSave(
                  'INVESTMENT_PROFIT_PERCENT',
                  configs['INVESTMENT_PROFIT_PERCENT'],
                )
              }
              disabled={loading}
            >
              Lưu
            </Button>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                label="Tên Token Dự Án"
                value={configs['PROJECT_TOKEN_NAME'] || 'Hero Coin'}
                onChange={(e) =>
                  setConfigs({
                    ...configs,
                    PROJECT_TOKEN_NAME: e.target.value,
                  })
                }
              />
            </div>
            <Button
              variant="primary"
              onClick={() =>
                handleSave('PROJECT_TOKEN_NAME', configs['PROJECT_TOKEN_NAME'])
              }
              disabled={loading}
            >
              Lưu
            </Button>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                label="Ký hiệu Token (Symbol)"
                value={configs['PROJECT_TOKEN_SYMBOL'] || 'HERO'}
                onChange={(e) =>
                  setConfigs({
                    ...configs,
                    PROJECT_TOKEN_SYMBOL: e.target.value,
                  })
                }
              />
            </div>
            <Button
              variant="primary"
              onClick={() =>
                handleSave('PROJECT_TOKEN_SYMBOL', configs['PROJECT_TOKEN_SYMBOL'])
              }
              disabled={loading}
            >
              Lưu
            </Button>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                label="Địa chỉ ví nhận tiền (Payment Receiver)"
                value={configs['PAYMENT_RECEIVER_ADDRESS'] || ''}
                onChange={(e) =>
                  setConfigs({
                    ...configs,
                    PAYMENT_RECEIVER_ADDRESS: e.target.value,
                  })
                }
              />
            </div>
            <Button
              variant="primary"
              onClick={() =>
                handleSave('PAYMENT_RECEIVER_ADDRESS', configs['PAYMENT_RECEIVER_ADDRESS'])
              }
              disabled={loading}
            >
              Lưu
            </Button>
          </div>
        </div>
      </Card>

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
