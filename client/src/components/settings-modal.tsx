import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UPDATE_INTERVALS = [
  { value: 30, label: "30초" },
  { value: 60, label: "1분" },
  { value: 120, label: "2분" },
  { value: 180, label: "3분" },
  { value: 300, label: "5분" },
  { value: 600, label: "10분" },
  { value: 1200, label: "20분" },
  { value: 1800, label: "30분" },
  { value: 3600, label: "60분" }
];

export default function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [selectedInterval, setSelectedInterval] = useState<string>("30");
  const [loading, setLoading] = useState(false);
  const [kakaoEnabled, setKakaoEnabled] = useState(false);
  const { toast } = useToast();

  // Load current setting when modal opens
  useEffect(() => {
    if (open) {
      loadCurrentSetting();
    }
  }, [open]);

  const loadCurrentSetting = async () => {
    try {
      // Load update interval
      const intervalResponse = await fetch('/api/settings/updateInterval');
      if (intervalResponse.ok) {
        const setting = await intervalResponse.json();
        setSelectedInterval(setting.value);
      } else {
        setSelectedInterval("30");
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setSelectedInterval("30");
    }
  };

  const handleKakaoAuth = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/kakao/auth-url');
      const { authUrl } = await response.json();
      
      // Open Kakao auth in new window
      window.open(authUrl, 'kakao-auth', 'width=500,height=600');
      
      toast({
        title: "카카오톡 인증",
        description: "새 창에서 카카오톡 로그인을 완료해주세요.",
      });
    } catch (error) {
      console.error('Failed to get Kakao auth URL:', error);
      toast({
        title: "오류",
        description: "카카오톡 인증 URL을 가져오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save update interval
      await apiRequest('POST', '/api/settings', {
        key: 'updateInterval',
        value: selectedInterval
      });

      const interval = UPDATE_INTERVALS.find(i => i.value.toString() === selectedInterval);
      toast({
        title: "설정 저장됨",
        description: `업데이트 주기가 ${interval?.label}로 변경되었습니다.`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save setting:', error);
      toast({
        title: "설정 저장 실패",
        description: "설정을 저장하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>환율 업데이트 설정</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">업데이트 주기</label>
            <Select value={selectedInterval} onValueChange={setSelectedInterval}>
              <SelectTrigger>
                <SelectValue placeholder="업데이트 주기를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {UPDATE_INTERVALS.map((interval) => (
                  <SelectItem key={interval.value} value={interval.value.toString()}>
                    {interval.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">카카오톡 알림</label>
            <Button
              variant="outline"
              onClick={handleKakaoAuth}
              disabled={loading}
              className="w-full"
            >
              {loading ? "연결 중..." : "카카오톡 연결하기"}
            </Button>
            <p className="text-xs text-muted-foreground">
              카카오톡으로 환율 알림을 받을 수 있습니다.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "저장 중..." : "저장"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}