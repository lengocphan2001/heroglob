import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { systemApi, type SystemConfig } from '../api/system';
import { payoutsApi } from '../api/payouts';
import { commissionsApi } from '../api/commissions';

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
                label="Tên dự án"
                value={configs['PROJECT_NAME'] || 'HeroGlob'}
                onChange={(e) =>
                  setConfigs({
                    ...configs,
                    PROJECT_NAME: e.target.value,
                  })
                }
              />
            </div>
            <Button
              variant="primary"
              onClick={() =>
                handleSave('PROJECT_NAME', configs['PROJECT_NAME'])
              }
              disabled={loading}
            >
              Lưu
            </Button>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                label="Mô tả dự án"
                value={configs['PROJECT_DESCRIPTION'] || 'Metaverse & NFTs'}
                onChange={(e) =>
                  setConfigs({
                    ...configs,
                    PROJECT_DESCRIPTION: e.target.value,
                  })
                }
              />
            </div>
            <Button
              variant="primary"
              onClick={() =>
                handleSave('PROJECT_DESCRIPTION', configs['PROJECT_DESCRIPTION'])
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
                label="Địa chỉ Token (Contract Address)"
                placeholder="0x..."
                value={configs['PROJECT_TOKEN_ADDRESS'] || ''}
                onChange={(e) =>
                  setConfigs({
                    ...configs,
                    PROJECT_TOKEN_ADDRESS: e.target.value,
                  })
                }
              />
            </div>
            <Button
              variant="primary"
              onClick={() =>
                handleSave('PROJECT_TOKEN_ADDRESS', configs['PROJECT_TOKEN_ADDRESS'])
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

      <Card title="Cấu hình Payout & Hoa hồng">
        <div className="space-y-4">
          <div className="rounded-lg bg-amber-50 p-4 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Lưu ý:</strong> Hệ thống tự động trả lãi vào lúc 00:00 mỗi ngày. Chỉ sử dụng các nút dưới đây nếu bạn muốn kích hoạt thủ công.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-zinc-200 rounded-lg dark:border-zinc-800">
              <h3 className="text-sm font-semibold mb-2">Trả lãi ROI thủ công</h3>
              <p className="text-xs text-zinc-500 mb-4">Kích hoạt trả lãi ngày hôm nay cho tất cả các gói đầu tư đang hoạt động.</p>
              <Button
                variant="outline"
                onClick={async () => {
                  if (confirm('Bạn có chắc muốn chạy trả lãi thủ công ngay bây giờ?')) {
                    try {
                      setLoading(true);
                      const res = await payoutsApi.runManualPayout();
                      toast.success(res.message);
                    } catch (e: any) {
                      toast.error(e.message || 'Lỗi khi chạy payout');
                    } finally {
                      setLoading(false);
                    }
                  }
                }}
                disabled={loading}
              >
                Chạy trả lãi (ROI)
              </Button>
            </div>

            <div className="p-4 border border-zinc-200 rounded-lg dark:border-zinc-800">
              <h3 className="text-sm font-semibold mb-2">Xử lý hoa hồng</h3>
              <p className="text-xs text-zinc-500 mb-4">Cộng tiền hoa hồng từ các đơn hàng "Pending" vào số dư của các người giới thiệu.</p>
              <Button
                variant="outline"
                onClick={async () => {
                  if (confirm('Bạn có chắc muốn xử lý tất cả hoa hồng đang chờ?')) {
                    try {
                      setLoading(true);
                      const res = await commissionsApi.process();
                      toast.success(`Đã xử lý ${res.processed} hoa hồng, thất bại ${res.failed}`);
                    } catch (e: any) {
                      toast.error(e.message || 'Lỗi khi xử lý hoa hồng');
                    } finally {
                      setLoading(false);
                    }
                  }
                }}
                disabled={loading}
              >
                Xử lý hoa hồng
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
