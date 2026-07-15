import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { ArrowLeft, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

const doRules = [
  'প্রতি ব্যক্তি, প্রতি ডিভাইস এবং প্রতি Telegram ID-তে শুধুমাত্র একটি অ্যাকাউন্ট ব্যবহার করুন।',
  'নিজে ad দেখুন এবং task সম্পন্ন করুন — অটোমেশন, বট বা ক্লিক-ফার্ম ব্যবহার করা যাবে না।',
  'প্রকৃত বন্ধুদের রেফার করুন যারা সত্যিই অ্যাপটি ব্যবহার করতে চান।',
  'আপনার withdrawal অ্যাকাউন্টের তথ্য সঠিক ও আপডেট রাখুন।',
  'কোনো bug বা সন্দেহজনক কার্যকলাপ দেখলে Help & Support-এ জানান।',
];

const dontRules = [
  'রেফারেল বোনাস বা ad reward পাওয়ার জন্য একাধিক/ডুপ্লিকেট অ্যাকাউন্ট তৈরি করা যাবে না।',
  'ad view বা task completion ভুয়া দেখাতে VPN, emulator, বট বা স্ক্রিপ্ট ব্যবহার করা যাবে না।',
  'নিজের ডিভাইস বা নেটওয়ার্ক থেকে তৈরি অ্যাকাউন্ট রেফার করা যাবে না।',
  'আপনার অ্যাকাউন্ট কারো সাথে শেয়ার, বিক্রি বা লেনদেন করা যাবে না।',
  'বাড়তি ব্যালেন্সের জন্য কোনো bug কাজে লাগানো যাবে না — বরং সেটা রিপোর্ট করুন।',
];

export default function Rules() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex-1 flex flex-col bg-muted/20 overflow-y-auto">
      <div className="bg-card border-b px-6 py-4 sticky top-0 z-10 shadow-sm flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => setLocation('/profile')}
          data-testid="button-back-rules"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">App Rules</h1>
          <p className="text-sm text-muted-foreground mt-1">আয় শুরু করার আগে পড়ে নিন</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <Card className="border shadow-sm bg-card">
          <CardContent className="p-5 space-y-3">
            <h2 className="font-bold text-base flex items-center gap-2 text-green-700">
              <CheckCircle2 size={18} />
              যা করবেন
            </h2>
            <ul className="space-y-2.5">
              {doRules.map((rule, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-foreground/90 leading-relaxed">
                  <span className="text-green-600 font-bold shrink-0">•</span>
                  {rule}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-card">
          <CardContent className="p-5 space-y-3">
            <h2 className="font-bold text-base flex items-center gap-2 text-destructive">
              <XCircle size={18} />
              যা করবেন না
            </h2>
            <ul className="space-y-2.5">
              {dontRules.map((rule, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-foreground/90 leading-relaxed">
                  <span className="text-destructive font-bold shrink-0">•</span>
                  {rule}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex gap-3 items-start">
          <ShieldAlert className="text-destructive shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-bold text-destructive text-sm">নিয়ম ভঙ্গের ফলাফল</p>
            <p className="text-xs text-destructive/80 mt-1 leading-relaxed">
              যেসব অ্যাকাউন্ট এই নিয়ম ভঙ্গ করবে — যেমন ভুয়া রেফারেল, একাধিক অ্যাকাউন্ট, অথবা ভুয়া ad/task কার্যকলাপ — সেগুলো ফ্ল্যাগ হবে
              এবং স্থায়ীভাবে ব্যান হতে পারে, সাথে জমাকৃত ব্যালেন্সও বাতিল হয়ে যেতে পারে। ফ্ল্যাগড বা ব্যানড অ্যাকাউন্ট থেকে withdrawal
              রিকোয়েস্ট বাতিল করা হবে। যদি মনে করেন আপনার অ্যাকাউন্ট ভুলবশত ফ্ল্যাগ হয়েছে, তাহলে Help & Support-এ যোগাযোগ করুন।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
