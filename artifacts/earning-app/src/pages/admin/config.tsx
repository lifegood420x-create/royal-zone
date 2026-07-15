import { useState, useEffect, useRef } from 'react';
import { 
  useGetAdminConfig, 
  useUpdateAdminConfig, 
  useRegeneratePostbackSecret,
  useGetWebhookStatus,
  useResetWebhook
} from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  Settings2, 
  Save, 
  RefreshCw, 
  Copy, 
  ServerCrash,
  CheckCircle2,
  DollarSign,
  PlaySquare,
  Bot
} from 'lucide-react';
import type { ConfigUpdate } from '@workspace/api-client-react';

export default function AdminConfig() {
  const { data: config, isLoading: isConfigLoading, refetch: refetchConfig } = useGetAdminConfig();
  const { data: webhookStatus, isLoading: isWebhookLoading, refetch: refetchWebhook } = useGetWebhookStatus();
  
  const updateConfig = useUpdateAdminConfig();
  const regenSecret = useRegeneratePostbackSecret();
  const resetWebhook = useResetWebhook();
  const { toast } = useToast();

  const [formData, setFormData] = useState<ConfigUpdate>({});
  
  // Guard initialization to run once per fetch result
  const initialized = useRef(false);
  useEffect(() => {
    if (config && !initialized.current) {
      setFormData({
        minWithdraw: config.minWithdraw,
        referralBonus: config.referralBonus,
        adReward: config.adReward,
        adDailyLimit: config.adDailyLimit,
        adDurationSeconds: config.adDurationSeconds,
        botName: config.botName,
        botUsername: config.botUsername,
        channelUsername: config.channelUsername || undefined,
        adminUsername: config.adminUsername,
        monetagZoneId: config.monetagZoneId || undefined,
        adsgramBlockId: config.adsgramBlockId || undefined,
        monetagEnabled: config.monetagEnabled,
        adsgramEnabled: config.adsgramEnabled,
        requireAdPostback: config.requireAdPostback
      });
      initialized.current = true;
    }
  }, [config]);

  const handleChange = (key: keyof ConfigUpdate, value: ConfigUpdate[keyof ConfigUpdate]) => {
    setFormData((prev: ConfigUpdate) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateConfig.mutate({ data: formData }, {
      onSuccess: () => {
        toast({ title: "Settings Saved", description: "Global configuration updated successfully." });
        refetchConfig();
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
      }
    });
  };

  const handleRegenSecret = () => {
    if (confirm("Are you sure? Existing ad postbacks will stop working until ad networks are updated with the new URL.")) {
      regenSecret.mutate(undefined, {
        onSuccess: () => {
          toast({ title: "Secret Regenerated", description: "Your postback URL has been updated." });
          refetchConfig();
        }
      });
    }
  };

  const handleResetWebhook = () => {
    resetWebhook.mutate(undefined, {
      onSuccess: () => {
        toast({ title: "Webhook Reset", description: "Telegram webhook integration refreshed." });
        refetchWebhook();
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "URL copied to clipboard." });
  };

  if (isConfigLoading) {
    return <div className="p-8 space-y-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-[400px] w-full" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings2 size={24} className="text-primary" /> System Settings
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Configure app economy, ad networks, and integrations.</p>
        </div>
        <Button onClick={handleSave} disabled={updateConfig.isPending} className="gap-2 shrink-0 shadow-sm px-6">
          <Save size={16} /> {updateConfig.isPending ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Economy Settings */}
        <Card className="border-accent/50 shadow-sm flex flex-col">
          <CardHeader className="bg-accent/10 border-b border-accent/30 pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign size={18} className="text-primary" /> Economy & Rewards
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-5 flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Min Withdraw</Label>
                <Input 
                  type="number" 
                  value={formData.minWithdraw || 0} 
                  onChange={e => handleChange('minWithdraw', Number(e.target.value))} 
                  className="font-mono bg-card"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Referral Bonus</Label>
                <Input 
                  type="number" 
                  value={formData.referralBonus || 0} 
                  onChange={e => handleChange('referralBonus', Number(e.target.value))}
                  className="font-mono bg-card"
                />
              </div>
            </div>
            <Separator className="bg-accent/50" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Ad Reward</Label>
                <Input 
                  type="number" 
                  value={formData.adReward || 0} 
                  onChange={e => handleChange('adReward', Number(e.target.value))}
                  className="font-mono bg-card"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Daily Ad Limit</Label>
                <Input 
                  type="number" 
                  value={formData.adDailyLimit || 0} 
                  onChange={e => handleChange('adDailyLimit', Number(e.target.value))}
                  className="font-mono bg-card"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Telegram Integrations */}
        <Card className="border-accent/50 shadow-sm flex flex-col">
          <CardHeader className="bg-accent/10 border-b border-accent/30 pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Bot size={18} className="text-primary" /> Telegram Config
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 flex-1">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Bot Details</Label>
              <div className="grid grid-cols-2 gap-3">
                <Input 
                  placeholder="App Name"
                  value={formData.botName || ''} 
                  onChange={e => handleChange('botName', e.target.value)} 
                />
                <Input 
                  placeholder="@username"
                  value={formData.botUsername || ''} 
                  onChange={e => handleChange('botUsername', e.target.value)} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Community</Label>
              <div className="grid grid-cols-2 gap-3">
                <Input 
                  placeholder="Channel Username (e.g. @updates)"
                  value={formData.channelUsername || ''} 
                  onChange={e => handleChange('channelUsername', e.target.value)} 
                />
                <Input 
                  placeholder="Admin Username (e.g. @owner)"
                  value={formData.adminUsername || ''} 
                  onChange={e => handleChange('adminUsername', e.target.value)} 
                />
              </div>
            </div>
            
            {/* Webhook Status Mini */}
            <div className="mt-4 bg-accent/30 p-3 rounded-lg border border-accent/50 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground">Webhook Status</span>
                <span className="text-[10px] text-muted-foreground">
                  {isWebhookLoading ? 'Checking...' : webhookStatus?.lastErrorMessage ? 'Error Detected' : 'Healthy'}
                </span>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={handleResetWebhook} disabled={resetWebhook.isPending}>
                <RefreshCw size={12} className={`mr-1 ${resetWebhook.isPending ? 'animate-spin' : ''}`} /> Sync
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Ad Networks */}
        <Card className="border-accent/50 shadow-sm md:col-span-2">
          <CardHeader className="bg-accent/10 border-b border-accent/30 pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <PlaySquare size={18} className="text-primary" /> Monetization & Ads
            </CardTitle>
            <CardDescription>Configure rewarded video networks and security.</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Networks */}
              <div className="space-y-6">
                <div className="flex items-start justify-between border-b pb-4">
                  <div className="space-y-1 pr-4">
                    <Label className="text-sm font-bold text-foreground">Monetag</Label>
                    <p className="text-xs text-muted-foreground">Enable Monetag rewarded ads</p>
                    <Input 
                      placeholder="Zone ID"
                      value={formData.monetagZoneId || ''} 
                      onChange={e => handleChange('monetagZoneId', e.target.value)} 
                      className="mt-2 h-8 text-sm max-w-[200px]"
                    />
                  </div>
                  <Switch 
                    checked={formData.monetagEnabled} 
                    onCheckedChange={c => handleChange('monetagEnabled', c)} 
                  />
                </div>
                
                <div className="flex items-start justify-between border-b pb-4">
                  <div className="space-y-1 pr-4">
                    <Label className="text-sm font-bold text-foreground">Adsgram</Label>
                    <p className="text-xs text-muted-foreground">Enable Adsgram rewarded ads</p>
                    <Input 
                      placeholder="Block ID"
                      value={formData.adsgramBlockId || ''} 
                      onChange={e => handleChange('adsgramBlockId', e.target.value)} 
                      className="mt-2 h-8 text-sm max-w-[200px]"
                    />
                  </div>
                  <Switch 
                    checked={formData.adsgramEnabled} 
                    onCheckedChange={c => handleChange('adsgramEnabled', c)} 
                  />
                </div>
              </div>

              {/* Postback Settings */}
              <div className="bg-muted/40 p-4 rounded-xl border border-accent/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold text-foreground">Secure Postback</Label>
                    <p className="text-xs text-muted-foreground">Require S2S verification</p>
                  </div>
                  <Switch 
                    checked={formData.requireAdPostback} 
                    onCheckedChange={c => handleChange('requireAdPostback', c)} 
                  />
                </div>
                
                <div className="space-y-2 pt-2 border-t">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Postback URL (For Ad Networks)</Label>
                  <div className="flex items-center gap-2">
                    <code className="text-[10px] sm:text-xs bg-card p-2 rounded flex-1 border truncate font-mono text-muted-foreground">
                      {config?.postbackUrl}
                    </code>
                    <Button variant="secondary" size="icon" onClick={() => copyToClipboard(config?.postbackUrl || '')} className="shrink-0">
                      <Copy size={14} />
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleRegenSecret} disabled={regenSecret.isPending} className="w-full mt-2 text-xs h-8">
                    <RefreshCw size={12} className={`mr-2 ${regenSecret.isPending ? 'animate-spin' : ''}`} /> Regenerate Secret Key
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}