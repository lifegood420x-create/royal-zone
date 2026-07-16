import { useEffect, useRef, useState } from 'react';
import { 
  useGetAdminConfig, 
  useUpdateAdminConfig,
  useSendBroadcast,
  useGetWebhookStatus,
  useResetWebhook,
  useRegeneratePostbackSecret,
  getGetAdminConfigQueryKey,
  getGetWebhookStatusQueryKey,
} from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Save, Send, RefreshCw, ServerCog, Settings2, Megaphone, Link2, AlertCircle, ShieldCheck, Copy, KeyRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const configSchema = z.object({
  minWithdraw: z.coerce.number().min(0),
  referralBonus: z.coerce.number().min(0),
  adReward: z.coerce.number().min(0),
  adDailyLimit: z.coerce.number().min(0),
  adDurationSeconds: z.coerce.number().min(1),
  botName: z.string().min(1),
  botUsername: z.string().min(1),
  channelUsername: z.string().optional().or(z.literal('')),
  adminUsername: z.string().min(1),
  monetagZoneId: z.string().optional().or(z.literal('')),
  adsgramBlockId: z.string().optional().or(z.literal('')),
  monetagEnabled: z.boolean().default(true),
  adsgramEnabled: z.boolean().default(true),
  requireAdPostback: z.boolean(),
});

type ConfigFormValues = z.infer<typeof configSchema>;

export default function AdminConfig() {
  const { data: config, isLoading: isConfigLoading } = useGetAdminConfig();
  const { data: webhookStatus, isLoading: isWebhookLoading } = useGetWebhookStatus();
  
  const updateConfigMutation = useUpdateAdminConfig();
  const broadcastMutation = useSendBroadcast();
  const resetWebhookMutation = useResetWebhook();
  const regenerateSecretMutation = useRegeneratePostbackSecret();
  const [copied, setCopied] = useState(false);
  const [copiedAdsgram, setCopiedAdsgram] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      minWithdraw: 0,
      referralBonus: 0,
      adReward: 0,
      adDailyLimit: 0,
      adDurationSeconds: 15,
      botName: '',
      botUsername: '',
      channelUsername: '',
      adminUsername: '',
      monetagZoneId: '',
      adsgramBlockId: '',
      monetagEnabled: true,
      adsgramEnabled: true,
      requireAdPostback: false,
    },
  });

  const broadcastForm = useForm<{ message: string }>({
    defaultValues: { message: '' }
  });

  const initializedRef = useRef(false);

  useEffect(() => {
    if (config && !initializedRef.current) {
      form.reset({
        minWithdraw: config.minWithdraw,
        referralBonus: config.referralBonus,
        adReward: config.adReward,
        adDailyLimit: config.adDailyLimit,
        adDurationSeconds: config.adDurationSeconds,
        botName: config.botName,
        botUsername: config.botUsername,
        channelUsername: config.channelUsername || '',
        adminUsername: config.adminUsername,
        monetagZoneId: config.monetagZoneId || '',
        adsgramBlockId: config.adsgramBlockId || '',
        monetagEnabled: config.monetagEnabled,
        adsgramEnabled: config.adsgramEnabled,
        requireAdPostback: config.requireAdPostback,
      });
      initializedRef.current = true;
    }
  }, [config, form]);

  const onConfigSubmit = (data: ConfigFormValues) => {
    updateConfigMutation.mutate(
      { data },
      {
        onSuccess: () => {
          toast({ title: 'Settings saved', description: 'App configuration updated successfully.' });
          queryClient.invalidateQueries({ queryKey: getGetAdminConfigQueryKey() });
        },
        onError: (err: any) => {
          toast({ title: 'Error saving settings', description: err.message || 'Something went wrong.', variant: 'destructive' });
        }
      }
    );
  };

  const onBroadcastSubmit = (data: { message: string }) => {
    if (!data.message.trim()) return;
    
    broadcastMutation.mutate(
      { data: { message: data.message } },
      {
        onSuccess: (res) => {
          toast({ 
            title: 'Broadcast sent', 
            description: `Successfully sent to ${res.sentCount} users. Failed: ${res.failedCount}.` 
          });
          broadcastForm.reset();
        },
        onError: (err: any) => {
          toast({ title: 'Broadcast failed', description: err.message || 'Could not send message.', variant: 'destructive' });
        }
      }
    );
  };

  const handleResetWebhook = () => {
    resetWebhookMutation.mutate(
      undefined,
      {
        onSuccess: () => {
          toast({ title: 'Webhook reset', description: 'Telegram webhook has been reconfigured.' });
          queryClient.invalidateQueries({ queryKey: getGetWebhookStatusQueryKey() });
        },
        onError: (err: any) => {
          toast({ title: 'Webhook error', description: err.message || 'Could not reset webhook.', variant: 'destructive' });
        }
      }
    );
  };

  const handleCopyPostbackUrl = () => {
    if (!config?.postbackUrl) return;
    navigator.clipboard.writeText(config.postbackUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAdsgramPostbackUrl = () => {
    if (!config?.adsgramPostbackUrl) return;
    navigator.clipboard.writeText(config.adsgramPostbackUrl);
    setCopiedAdsgram(true);
    setTimeout(() => setCopiedAdsgram(false), 2000);
  };

  const handleRegenerateSecret = () => {
    if (!confirm('This invalidates the current postback URL — you will need to update it in your Monetag/Adsgram dashboard. Continue?')) return;
    regenerateSecretMutation.mutate(undefined, {
      onSuccess: () => {
        toast({ title: 'Postback secret regenerated', description: 'Update the URL in your ad network dashboard.' });
        queryClient.invalidateQueries({ queryKey: getGetAdminConfigQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: 'Error', description: err.message || 'Could not regenerate secret.', variant: 'destructive' });
      }
    });
  };

  if (isConfigLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading configuration...</div>;
  }

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure app parameters and integrations</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card className="border shadow-sm">
            <CardHeader className="bg-muted/20 border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings2 size={20} className="text-primary" />
                App Configuration
              </CardTitle>
              <CardDescription>Main parameters governing economy and identity</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onConfigSubmit)} className="space-y-6">
                  
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Economy</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="minWithdraw"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Base Minimum Withdraw (৳)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="referralBonus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Referral Bonus (৳)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Ads & Limits</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="adReward"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ad Watch Reward (৳)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="adDailyLimit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Daily Ad Limit (per user)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="adDurationSeconds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ad Countdown (seconds)</FormLabel>
                            <FormControl>
                              <Input type="number" min={1} {...field} />
                            </FormControl>
                            <p className="text-[10px] text-muted-foreground">
                              User must wait this long after starting an ad before the reward is credited.
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="monetagZoneId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monetag Zone ID (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 1234567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="adsgramBlockId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adsgram Block ID (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. block-123" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="monetagEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-muted/20">
                            <div className="space-y-0.5">
                              <FormLabel>Monetag Ads</FormLabel>
                              <p className="text-[10px] text-muted-foreground">
                                Turn off to hide the Monetag "Server 1" button from users.
                              </p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-monetag-enabled" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="adsgramEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-muted/20">
                            <div className="space-y-0.5">
                              <FormLabel>Adsgram Ads</FormLabel>
                              <p className="text-[10px] text-muted-foreground">
                                Turn off to hide the Adsgram "Server 2" button from users.
                              </p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-adsgram-enabled" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Ad Postback Verification</h3>
                    <p className="text-xs text-muted-foreground -mt-2">
                      By default, a reward is credited as soon as the ad SDK reports "watched" — which a user could fake via devtools.
                      For fraud-proof crediting, paste the URL below as the <strong>Postback URL</strong> in your Monetag/Adsgram dashboard
                      for each zone, then enable the toggle below once you've confirmed test postbacks are arriving.
                    </p>
                    <div className="rounded-lg border bg-muted/20 p-3 space-y-3">
                      {/* Monetag postback URL */}
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Monetag (Server 1)</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-xs break-all bg-background border rounded px-2 py-1.5 font-mono">
                            {config?.postbackUrl || 'Loading...'}
                          </code>
                          <Button type="button" size="sm" variant="outline" onClick={handleCopyPostbackUrl}>
                            <Copy size={14} className="mr-1.5" /> {copied ? 'Copied' : 'Copy'}
                          </Button>
                        </div>
                      </div>
                      {/* AdsGram postback URL */}
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">AdsGram (Server 2)</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-xs break-all bg-background border rounded px-2 py-1.5 font-mono">
                            {config?.adsgramPostbackUrl || 'Loading...'}
                          </code>
                          <Button type="button" size="sm" variant="outline" onClick={handleCopyAdsgramPostbackUrl}>
                            <Copy size={14} className="mr-1.5" /> {copiedAdsgram ? 'Copied' : 'Copy'}
                          </Button>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-orange-600 border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        onClick={handleRegenerateSecret}
                        disabled={regenerateSecretMutation.isPending}
                      >
                        <KeyRound size={14} className={`mr-1.5 ${regenerateSecretMutation.isPending ? 'animate-spin' : ''}`} />
                        Regenerate Secret
                      </Button>
                      <FormField
                        control={form.control}
                        name="requireAdPostback"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background">
                            <div className="space-y-0.5 flex items-start gap-2">
                              <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                              <div>
                                <FormLabel>Require Postback Verification</FormLabel>
                                <p className="text-[10px] text-muted-foreground">
                                  When on, ad rewards are only credited after the ad network's server confirms the view — not the browser.
                                </p>
                              </div>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Identity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="botName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bot Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="botUsername"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bot Username (without @)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="channelUsername"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Channel Username (with @)</FormLabel>
                            <FormControl>
                              <Input placeholder="@mychannel" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="adminUsername"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Admin Contact Username (with @)</FormLabel>
                            <FormControl>
                              <Input placeholder="@admin" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t flex justify-end">
                    <Button type="submit" size="lg" disabled={updateConfigMutation.isPending} className="font-bold min-w-[150px]">
                      {updateConfigMutation.isPending ? <RefreshCw className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
                      Save Settings
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border shadow-sm">
            <CardHeader className="bg-muted/20 border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Megaphone size={20} className="text-blue-500" />
                Broadcast Message
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Form {...broadcastForm}>
                <form onSubmit={broadcastForm.handleSubmit(onBroadcastSubmit)} className="space-y-4">
                  <FormField
                    control={broadcastForm.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Message Text</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Type a message to send to all users..." 
                            className="min-h-[120px] resize-none"
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={broadcastMutation.isPending || !broadcastForm.watch('message')}>
                    {broadcastMutation.isPending ? <RefreshCw className="animate-spin mr-2" size={16} /> : <Send className="mr-2" size={16} />}
                    Send to All Users
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="bg-muted/20 border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ServerCog size={20} className="text-orange-500" />
                Webhook Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {isWebhookLoading ? (
                <div className="h-20 animate-pulse bg-muted rounded" />
              ) : webhookStatus ? (
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Link2 size={16} className="text-muted-foreground shrink-0 mt-0.5" />
                    <span className="break-all font-mono text-xs text-muted-foreground">{webhookStatus.url || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between bg-muted/50 p-2 rounded">
                    <span className="text-muted-foreground">Pending Updates:</span>
                    <span className="font-bold">{webhookStatus.pendingUpdateCount}</span>
                  </div>
                  {webhookStatus.lastErrorMessage && (
                    <div className="bg-destructive/10 text-destructive p-2 rounded text-xs flex gap-2">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <span>{webhookStatus.lastErrorMessage}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Status unavailable.</p>
              )}
              
              <Button 
                variant="outline" 
                className="w-full text-orange-600 border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                onClick={handleResetWebhook}
                disabled={resetWebhookMutation.isPending}
              >
                <RefreshCw size={16} className={`mr-2 ${resetWebhookMutation.isPending ? 'animate-spin' : ''}`} />
                Reset Webhook
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
