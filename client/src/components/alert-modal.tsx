import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPair?: string;
}

const CURRENCY_PAIRS = [
  { value: "USD/KRW", label: "USD/KRW" },
  { value: "JPY/KRW", label: "JPY/KRW" },
  { value: "USD/JPY", label: "USD/JPY" },
];

export default function AlertModal({ open, onOpenChange, defaultPair }: AlertModalProps) {
  const [currencyPair, setCurrencyPair] = useState(defaultPair || "USD/KRW");
  const [alertType, setAlertType] = useState<"above" | "below">("above");
  const [targetRate, setTargetRate] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setCurrencyPair(defaultPair || "USD/KRW");
      setAlertType("above");
      setTargetRate("");
    }
  }, [open, defaultPair]);

  const createAlertMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/alerts", data),
    onSuccess: () => {
      // 강제로 알림 데이터 새로고침
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      queryClient.refetchQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Alert Created",
        description: "Your price alert has been set successfully.",
      });
      onOpenChange(false);
      setTargetRate("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create alert. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!targetRate || isNaN(parseFloat(targetRate))) {
      toast({
        title: "Invalid Rate",
        description: "Please enter a valid target rate.",
        variant: "destructive",
      });
      return;
    }

    const alertData = {
      currencyPair,
      targetType: alertType,
      targetRate,
      isActive: true,
    };
    
    console.log('Creating alert with data:', alertData);
    createAlertMutation.mutate(alertData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Set Price Alert</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="currencyPair">Currency Pair</Label>
            <Select value={currencyPair} onValueChange={setCurrencyPair}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_PAIRS.map((pair) => (
                  <SelectItem key={pair.value} value={pair.value}>
                    {pair.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Alert Type</Label>
            <RadioGroup
              value={alertType}
              onValueChange={(value) => setAlertType(value as "above" | "below")}
              className="grid grid-cols-2 gap-3 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="above" id="above" />
                <Label htmlFor="above">Above target</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="below" id="below" />
                <Label htmlFor="below">Below target</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="targetRate">Target Rate</Label>
            <Input
              id="targetRate"
              type="number"
              step="0.01"
              placeholder="Enter target rate"
              value={targetRate}
              onChange={(e) => setTargetRate(e.target.value)}
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={createAlertMutation.isPending}
            >
              {createAlertMutation.isPending ? "Creating..." : "Create Alert"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
