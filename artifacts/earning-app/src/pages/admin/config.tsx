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
  useListVerificationMethods,
  useCreateVerificationMethod,
  useUpdateVerificationMethod,
  useDeleteVerificationMethod,
  getListVerificationMethodsQueryKey,
  PaymentType,
} from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Save, Send, RefreshCw, ServerCog, Settings2, Megaphone, Link2, AlertCircle, ShieldCheck, Copy, KeyRound, Plus, Trash2 } from 'lucide-react';
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
  verificationEnabled: z.boolean().default(false),
  verificationMode: z.enum(['manual', 'auto'] as const).default('manual'),
  verificationFee: z.coerce.number().min(0),
  verificationBkashNumber: z.string().optional().or(z.literal('')),
  verificationNagadNumber: z.string().optional().or(z.literal('')),
  verificationAutoUrl: z.string().optional().or(z.literal('')),
  verificationAutoSecret: z.string().optional().or(z.literal('')),
  bkashLogoUrl: z.string().optional().or(z.literal('')),
  nagadLogoUrl: z.string().optional().or(z.literal('')),
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
      verificationEnabled: false,
      verificationMode: 'manual',
      verificationFee: 0,
      verificationBkashNumber: '',
      verificationNagadNumber: '',
      verificationAutoUrl: '',
      verificationAutoSecret: '',
      bkashLogoUrl: '',
      nagadLogoUrl: '',
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
        verificationEnabled: config.verificationEnabled,
        verificationMode: config.verificationMode,
        verificationFee: config.verificationFee,
        verificationBkashNumber: config.verificationBkashNumber || '',
        verificationNagadNumber: config.verificationNagadNumber || '',
        verificationAutoUrl: config.verificationAutoUrl || '',
        verificationAutoSecret: config.verificationAutoSecret || '',
        bkashLogoUrl: config.bkashLogoUrl || '',
        nagadLogoUrl: config.nagadLogoUrl || '',
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
                              <FormLabel>Video Ads (GigaPub)</FormLabel>
                              <p className="text-[10px] text-muted-foreground">
                                Turn off to hide the "Watch" ad button from users.
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
                              <FormLabel>Adsgram Ads (unused)</FormLabel>
                              <p className="text-[10px] text-muted-foreground">
                                No longer shown — the app now serves GigaPub ads via the "Watch" button.
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
                    <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Account Verification</h3>
                    <FormField
                      control={form.control}
                      name="verificationEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background">
                          <div className="space-y-0.5">
                            <FormLabel>Require Paid Verification</FormLabel>
                            <p className="text-[10px] text-muted-foreground">
                              When on, every user must pay a one-time verification fee before their first withdrawal.
                            </p>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-verification-enabled" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    {form.watch('verificationEnabled') && (
                      <>
                        <FormField
                          control={form.control}
                          name="verificationMode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payment Mode</FormLabel>
                              <div className="grid grid-cols-2 gap-3 mt-1">
                                {(['manual', 'auto'] as const).map((m) => (
                                  <button
                                    key={m}
                                    type="button"
                                    onClick={() => field.onChange(m)}
                                    className={`h-10 rounded-lg font-semibold text-sm border capitalize transition-colors ${
                                      field.value === m
                                        ? 'bg-primary text-primary-foreground border-transparent'
                                        : 'bg-background text-muted-foreground border-border'
                                    }`}
                                    data-testid={`select-verification-mode-${m}`}
                                  >
                                    {m === 'manual' ? 'Manual (bKash/Nagad)' : 'Auto Payment'}
                                  </button>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="verificationFee"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Verification Fee (৳)</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" {...field} data-testid="input-verification-fee" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        {form.watch('verificationMode') === 'manual' ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="verificationBkashNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>bKash Number (receive payments)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="01XXXXXXXXX" {...field} data-testid="input-verification-bkash" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="verificationNagadNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nagad Number (receive payments)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="01XXXXXXXXX" {...field} data-testid="input-verification-nagad" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="md:col-span-2">
                              <VerificationMethodsManager />
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="verificationAutoUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Gateway Payment URL</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://your-gateway.com/pay/..." {...field} data-testid="input-verification-auto-url" />
                                  </FormControl>
                                  <p className="text-[10px] text-muted-foreground">
                                    Users are sent here to pay. Configure the gateway to confirm via
                                    POST /api/verification/postback?secret=&lt;secret&gt;&amp;request_id=&lt;id&gt;
                                  </p>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="verificationAutoSecret"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Gateway Postback Secret</FormLabel>
                                  <FormControl>
                                    <Input placeholder="shared secret" {...field} data-testid="input-verification-auto-secret" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Payment Method Logos</h3>
                    <p className="text-[11px] text-muted-foreground -mt-2">
                      Shown next to bKash/Nagad in the user app (withdraw buttons and the verification popup). Paste any hosted image URL.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="bkashLogoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              bKash Logo URL
                              {field.value ? <img src={field.value} alt="bKash logo" className="w-6 h-6 rounded object-contain border" /> : null}
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="https://.../bkash.png" {...field} data-testid="input-bkash-logo" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="nagadLogoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              Nagad Logo URL
                              {field.value ? <img src={field.value} alt="Nagad logo" className="w-6 h-6 rounded object-contain border" /> : null}
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="https://.../nagad.png" {...field} data-testid="input-nagad-logo" />
                            </FormControl>
                            <FormMessage />
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
                <Megaphone size={20} className="text-primary" />
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
                <ServerCog size={20} className="text-accent-foreground" />
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

/**
 * Admin-managed extra payment methods for the verification fee (Upay,
 * Rocket, ...). Each has a receive number, optional logo, and whether the
 * user should Send Money or Cash Out. Rendered inside the Settings page's
 * verification section (manual mode).
 */
function VerificationMethodsManager() {
  const { data: methods, isLoading } = useListVerificationMethods();
  const createMutation = useCreateVerificationMethod();
  const updateMutation = useUpdateVerificationMethod();
  const deleteMutation = useDeleteVerificationMethod();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('send_money' as PaymentType);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListVerificationMethodsQueryKey() });

  const handleAdd = () => {
    if (name.trim().length < 2 || accountNumber.trim().length < 5) {
      toast({ title: 'Error', description: 'Name and account number are required.', variant: 'destructive' });
      return;
    }
    createMutation.mutate(
      {
        data: {
          name: name.trim(),
          accountNumber: accountNumber.trim(),
          logoUrl: logoUrl.trim() || null,
          paymentType,
        },
      },
      {
        onSuccess: () => {
          toast({ title: 'Method added' });
          setName('');
          setAccountNumber('');
          setLogoUrl('');
          invalidate();
        },
        onError: () => toast({ title: 'Error', description: 'Could not add method.', variant: 'destructive' }),
      },
    );
  };

  return (
    <div className="rounded-lg border p-4 space-y-3 bg-muted/10">
      <div>
        <p className="font-semibold text-sm">Extra Payment Methods</p>
        <p className="text-[11px] text-muted-foreground">
          Add more ways to receive the verification fee (Upay, Rocket, ...). These appear in the
          user's verification popup alongside the bKash/Nagad numbers above.
        </p>
      </div>

      {isLoading ? (
        <div className="h-10 bg-muted animate-pulse rounded-lg" />
      ) : methods && methods.length > 0 ? (
        <div className="space-y-2">
          {methods.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center gap-3 rounded-lg border bg-background px-3 py-2">
              {m.logoUrl ? (
                <img src={m.logoUrl} alt={m.name} className="w-7 h-7 rounded object-contain border" />
              ) : (
                <div className="w-7 h-7 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  {m.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold truncate">{m.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{m.accountNumber}</p>
              </div>
              <span className="text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded bg-muted">
                {m.paymentType === 'send_money' ? 'Send Money' : 'Cash Out'}
              </span>
              <div className="flex items-center gap-2">
                <Switch
                  checked={m.isActive}
                  onCheckedChange={(checked) =>
                    updateMutation.mutate(
                      { id: m.id, data: { isActive: checked } },
                      { onSuccess: invalidate, onError: () => toast({ title: 'Error', variant: 'destructive' }) },
                    )
                  }
                  data-testid={`switch-method-active-${m.id}`}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => {
                    if (!confirm(`Delete ${m.name}?`)) return;
                    deleteMutation.mutate(
                      { id: m.id },
                      { onSuccess: () => { toast({ title: 'Method deleted' }); invalidate(); }, onError: () => toast({ title: 'Error', variant: 'destructive' }) },
                    );
                  }}
                  data-testid={`button-delete-method-${m.id}`}
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground border border-dashed rounded-lg p-3 text-center">
          No extra methods yet.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
        <Input placeholder="Name (e.g. Upay)" value={name} onChange={(e) => setName(e.target.value)} data-testid="input-new-method-name" />
        <Input placeholder="Account number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} data-testid="input-new-method-number" />
        <Input placeholder="Logo URL (optional)" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} data-testid="input-new-method-logo" />
        <div className="grid grid-cols-2 gap-2">
          {(['send_money', 'cash_out'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setPaymentType(t as PaymentType)}
              className={`h-9 rounded-lg text-xs font-bold border transition-colors ${
                paymentType === t
                  ? 'bg-primary text-primary-foreground border-transparent'
                  : 'bg-background text-muted-foreground border-border'
              }`}
              data-testid={`select-new-method-type-${t}`}
            >
              {t === 'send_money' ? 'Send Money' : 'Cash Out'}
            </button>
          ))}
        </div>
      </div>
      <Button type="button" size="sm" onClick={handleAdd} disabled={createMutation.isPending} data-testid="button-add-method">
        <Plus size={14} className="mr-1" /> Add Method
      </Button>
    </div>
  );
}
