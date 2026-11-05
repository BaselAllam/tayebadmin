import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSimpleToast } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import logoIcon from "@/assets/LogoTrans.png";
import LoadingSpinner from '@/components/LoadingSpinner';
import { useI18n } from '@/lib/i18n';
import PhoneInput from '@/components/PhoneInput';

const DOT_PATTERN =
  "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')";

const LoginPage = () => {
  const { t } = useI18n();
  const { success, error, warning, info, toast } = useSimpleToast();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      error(t('err.fill'));
      return;
    }
    setIsSubmitting(true);
    try {
      await login(phone, password);
      navigate('/', { replace: true });
      setPassword('');
    } catch (err: any) {
      error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-background"
      style={{ direction: 'ltr' }}
    >
      <div className="w-full max-w-[400px]">

        <div className="flex justify-center mb-6">
          <div
            className="w-30 h-30 rounded-2xl flex items-center justify-center"
          >
            <img 
              src={logoIcon}
              alt="Logo" 
              className="h-30 w-30 object-contain"
            />
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-border shadow-2xl bg-card">
          <div className="relative bg-gradient-to-r from-primary to-primary/90 px-6 py-5 overflow-hidden">
            <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: DOT_PATTERN }} />
            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10 blur-2xl pointer-events-none" />

            <div className="relative z-10">

              {/* Pill badge */}
              <div className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 rounded-full px-2.5 py-0.5 mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white/90 animate-pulse" />
                <span className="text-white/90 text-[0.62rem] font-medium tracking-widest uppercase">
                  {t('badge.welcome')}
                </span>
              </div>

              <h1 className="text-white text-xl font-semibold tracking-tight leading-tight mb-0.5">
                {t('login.title')}
              </h1>
              <p className="text-white/80 text-xs font-light leading-relaxed">
                {t('login.sub')}
              </p>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="px-6 pt-5 pb-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="login-phone" className="text-sm font-medium text-foreground">
                {t('login.phone')}
              </Label>
              <PhoneInput
                value={phone}
                onChange={(value) => setPhone(value)}
                placeholder={'+1 (555) 123-4567'}
                required
                showFlag={true}
                />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password" className="text-sm font-medium text-foreground">
                  {t('login.pass')}
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-10 rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-10 rounded-xl text-white font-medium" disabled={isSubmitting}>
              {isSubmitting
                ? <span className="text-white flex items-center justify-center"><LoadingSpinner />{t('login.signing')}</span>
                : t('login.cta')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;