import { useLocation } from 'wouter';
import { ArrowLeft, ShieldAlert, CircleCheck, CircleX } from 'lucide-react';

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
    <div className="flex-1 flex flex-col">
      {/* Sticky glass header */}
      <div className="glass-strong sticky top-3 z-10 mx-4 mt-3 rounded-3xl px-4 py-3 flex items-center gap-3">
        <button
          className="w-9 h-9 rounded-xl glass-inset flex items-center justify-center active-scale shrink-0"
          onClick={() => setLocation('/profile')}
          aria-label="Back"
          data-testid="button-back-rules"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-foreground leading-tight">অ্যাপের নিয়মাবলী</h1>
          <p className="text-xs text-muted-foreground">আয় শুরু করার আগে পড়ে নিন</p>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Do card */}
        <section className="glass rounded-3xl p-5 animate-fade-up stagger-1" style={{ borderLeft: '3px solid var(--success)' }}>
          <h2 className="font-bold text-base flex items-center gap-2 mb-3" style={{ color: 'var(--success)' }}>
            <span className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'oklch(0.8 0.17 155 / 14%)' }}>
              <CircleCheck size={15} />
            </span>
            যা করবেন
          </h2>
          <ul className="space-y-3">
            {doRules.map((rule, i) => (
              <li key={i} className="flex gap-3 text-sm text-foreground/85 leading-relaxed">
                <span className="num text-[10px] font-bold shrink-0 mt-1" style={{ color: 'var(--success)' }}>{String(i + 1).padStart(2, '0')}</span>
                {rule}
              </li>
            ))}
          </ul>
        </section>

        {/* Don't card */}
        <section className="glass rounded-3xl p-5 animate-fade-up stagger-2" style={{ borderLeft: '3px solid var(--destructive)' }}>
          <h2 className="font-bold text-base flex items-center gap-2 mb-3" style={{ color: 'oklch(0.75 0.17 24)' }}>
            <span className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'oklch(0.63 0.21 24 / 14%)' }}>
              <CircleX size={15} />
            </span>
            যা করবেন না
          </h2>
          <ul className="space-y-3">
            {dontRules.map((rule, i) => (
              <li key={i} className="flex gap-3 text-sm text-foreground/85 leading-relaxed">
                <span className="num text-[10px] font-bold shrink-0 mt-1" style={{ color: 'oklch(0.75 0.17 24)' }}>{String(i + 1).padStart(2, '0')}</span>
                {rule}
              </li>
            ))}
          </ul>
        </section>

        {/* Consequence */}
        <div className="glass rounded-3xl p-4 flex gap-3 items-start animate-fade-up stagger-3" style={{ border: '1px solid oklch(0.63 0.21 24 / 35%)', background: 'oklch(0.63 0.21 24 / 8%)' }}>
          <ShieldAlert className="text-destructive shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-bold text-destructive text-sm">নিয়ম ভঙ্গের ফলাফল</p>
            <p className="text-xs text-foreground/70 mt-1 leading-relaxed">
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
