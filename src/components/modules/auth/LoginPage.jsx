import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Avatar } from "../../ui/Avatar";
import { Button } from "../../ui/Button";
import ThemeSwitch from "../../ui/ThemeSwitch";
import { useAuth } from "../../store/useAuth";
import { useToast } from "../../store/useToast";
import { resetPassword } from "../../../supabase/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Input with a leading icon + inline error message */
function AuthField({ label, icon, error, errorText, right, children }) {
  return (
    <div className="mb-4">
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-[0.72rem] font-bold text-on-surface">
          {label}
        </label>
        {right}
      </div>
      <div className="relative">
        <i
          className={`${icon} absolute top-1/2 left-3.5 -translate-y-1/2 text-[0.85rem] text-on-surface-muted`}
        />
        {children(error)}
      </div>
      {error && (
        <div className="mt-1 text-[0.72rem] font-semibold text-error">
          {errorText}
        </div>
      )}
    </div>
  );
}

const inputClass = (error) =>
  `h-11 w-full rounded-md border bg-field-bg pr-10 pl-10 text-[0.84rem] text-on-surface transition duration-200 placeholder:text-on-surface-muted focus:ring-3 focus:outline-none ${
    error
      ? "border-error focus:ring-error/20"
      : "border-outline-subtle focus:border-accent focus:ring-accent/20"
  }`;

const LoginPage = () => {
  const { isAuthenticated, login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [view, setView] = useState("signin"); // signin | forgot | sent
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState(false);

  if (isAuthenticated)
    return <Navigate to={location.state?.from?.pathname || "/"} replace />;

  const submit = async (e) => {
    e.preventDefault();
    const next = {
      email: !EMAIL_RE.test(email.trim()),
      password: password.length < 6,
    };
    setErrors(next);
    setAlert("");
    if (next.email || next.password) return;

    setLoading(true);
    const res = await login({ email, password });
    setLoading(false);
    if (!res.ok) return setAlert(res.error);
    toast(`Welcome back, ${res.user.name.split(" ")[0]}!`, "success");
    navigate(location.state?.from?.pathname || "/", { replace: true });
  };

  const submitForgot = async (e) => {
    e.preventDefault();
    const ok = EMAIL_RE.test(forgotEmail.trim());
    setForgotError(!ok);
    if (!ok) return;
    setLoading(true);
    setAlert("");
    try {
      await resetPassword(forgotEmail);
      setView("sent");
    } catch (err) {
      setAlert(
        err.message || "Could not send the reset link. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-surface-base lg:grid-cols-[1.1fr_1fr]">
      {/* ============ Hero ============ */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-linear-155 from-hero-from via-hero-mid to-hero-to p-12 text-white lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[34px_34px]" />

        <div className="relative flex items-center gap-3">
          <div className="flex size-9.5 items-center justify-center rounded-[11px] bg-brand text-on-brand">
            <i className="fas fa-city" />
          </div>
          <div className="flex flex-col leading-tight">
            <strong className="text-[1.05rem] font-extrabold tracking-[-0.04em]">
              EstatePulse
            </strong>
            <span className="kicker text-[0.6rem] text-white/60">
              CRM Intelligence
            </span>
          </div>
        </div>

        <div className="relative max-w-130">
          <div className="kicker text-[0.7rem] text-brand">
            Brokerage intelligence
          </div>
          <h1 className="mt-3 text-[2.8rem] leading-[1.08] font-extrabold tracking-[-0.045em]">
            Every lead,{" "}
            <em className="text-brand not-italic">every site visit,</em> one
            pulse.
          </h1>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-white/70">
            Track inquiries from first call to closing day. EstatePulse keeps
            your pipeline, inventory and agents in sync, so no hot buyer goes
            cold.
          </p>
          <div className="mt-8 flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
            <Avatar className="bg-brand text-on-brand">PS</Avatar>
            <div className="text-[0.82rem] text-white/70">
              <q className="mb-1 block text-white/90">
                “We closed Q3 two weeks early. The follow-up reminders alone
                paid for it.”
              </q>
              Priya Sharma · Principal Broker
            </div>
          </div>
        </div>

        <div className="relative grid grid-cols-3 gap-4">
          {[
            ["3.2×", "Faster follow-up"],
            ["$48M", "Deals tracked"],
            ["99.9%", "Uptime"],
          ].map(([b, s]) => (
            <div key={s}>
              <b className="num block text-[1.6rem] font-medium">{b}</b>
              <small className="text-[0.72rem] text-white/60">{s}</small>
            </div>
          ))}
        </div>

        <svg
          className="pointer-events-none absolute inset-x-0 bottom-0 h-60 w-full"
          viewBox="0 0 800 240"
          preserveAspectRatio="xMidYMax slice"
          aria-hidden="true"
        >
          <path
            className="fill-white/5"
            d="M0 240V150h50V110h40v40h30V70h56v80h34V120h46V40h60v110h30V90h50v60h40V130h54V60h66v90h40V100h50v50h54V80h40v160z"
          />
          <g className="fill-brand/50">
            <rect x="140" y="84" width="8" height="8" />
            <rect x="160" y="84" width="8" height="8" />
            <rect x="140" y="104" width="8" height="8" />
            <rect x="330" y="56" width="8" height="8" />
            <rect x="350" y="76" width="8" height="8" />
            <rect x="330" y="96" width="8" height="8" />
            <rect x="560" y="76" width="8" height="8" />
            <rect x="580" y="96" width="8" height="8" />
            <rect x="560" y="116" width="8" height="8" />
            <rect x="720" y="96" width="8" height="8" />
            <rect x="740" y="116" width="8" height="8" />
          </g>
        </svg>
      </section>

      {/* ============ Form panel ============ */}
      <section className="flex min-h-screen flex-col px-6 py-6 sm:px-10">
        <div className="flex items-center justify-between gap-4">
          <div className="max-lg:hidden" />
          <div className="flex items-center gap-2 text-[0.95rem] font-extrabold tracking-[-0.03em] text-on-surface lg:hidden">
            <div className="flex size-8.5 items-center justify-center rounded-[10px] bg-brand text-[0.9rem] text-on-brand">
              <i className="fas fa-city" />
            </div>
            EstatePulse
          </div>
          <ThemeSwitch />
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-105 animate-fade-in rounded-xl border border-outline-subtle bg-surface-card p-8 shadow-md">
            {view === "signin" && (
              <>
                <span className="kicker text-[0.66rem] text-brand-text">
                  Welcome back
                </span>
                <h2 className="mt-[0.4rem] text-[1.6rem] font-extrabold tracking-[-0.04em] text-on-surface">
                  Sign in to your workspace
                </h2>
                <p className="mt-1 mb-5 text-[0.84rem] text-on-surface-muted">
                  Pick up where you left off: leads, visits and deals are
                  waiting.
                </p>

                {alert && (
                  <div
                    role="alert"
                    className="mb-4 flex gap-2 rounded-md border border-error/30 bg-error-soft p-3 text-[0.8rem] font-semibold text-error"
                  >
                    <i className="fas fa-circle-exclamation mt-0.5" />
                    <span>{alert}</span>
                  </div>
                )}

                <form onSubmit={submit} noValidate>
                  <AuthField
                    label="Work email"
                    icon="far fa-envelope"
                    error={errors.email}
                    errorText="Enter a valid email address."
                  >
                    {(err) => (
                      <input
                        className={inputClass(err)}
                        type="email"
                        autoComplete="username"
                        placeholder="you@brokerage.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErrors((x) => ({ ...x, email: false }));
                        }}
                      />
                    )}
                  </AuthField>

                  <AuthField
                    label="Password"
                    icon="fas fa-lock"
                    error={errors.password}
                    errorText="Password must be at least 6 characters."
                    right={
                      <button
                        type="button"
                        onClick={() => setView("forgot")}
                        className="text-[0.72rem] font-bold text-accent hover:underline"
                      >
                        Forgot password?
                      </button>
                    }
                  >
                    {(err) => (
                      <>
                        <input
                          className={inputClass(err)}
                          type={showPass ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setErrors((x) => ({ ...x, password: false }));
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass((s) => !s)}
                          aria-label={
                            showPass ? "Hide password" : "Show password"
                          }
                          className="absolute top-1/2 right-3 -translate-y-1/2 text-on-surface-muted hover:text-on-surface"
                        >
                          <i
                            className={`far ${showPass ? "fa-eye-slash" : "fa-eye"}`}
                          />
                        </button>
                      </>
                    )}
                  </AuthField>

                  <Button
                    type="submit"
                    block
                    loading={loading}
                    className="h-11"
                  >
                    <span>{loading ? "Signing in…" : "Sign in"}</span>{" "}
                    {!loading && <i className="fas fa-arrow-right" />}
                  </Button>
                </form>

                <div className="my-5 flex items-center gap-3 text-[0.72rem] text-on-surface-muted before:h-px before:flex-1 before:bg-outline-subtle after:h-px after:flex-1 after:bg-outline-subtle">
                  or continue with
                </div>
              </>
            )}

            {view === "forgot" && (
              <>
                <span className="kicker text-[0.66rem] text-brand-text">
                  Account recovery
                </span>
                <h2 className="mt-[0.4rem] text-[1.6rem] font-extrabold tracking-[-0.04em] text-on-surface">
                  Reset your password
                </h2>
                <p className="mt-1 mb-5 text-[0.84rem] text-on-surface-muted">
                  Enter your work email and we’ll send a secure link to set a
                  new password.
                </p>
                {alert && (
                  <div
                    role="alert"
                    className="mb-4 flex gap-2 rounded-md border border-error/30 bg-error-soft p-3 text-[0.8rem] font-semibold text-error"
                  >
                    <i className="fas fa-circle-exclamation mt-0.5" />
                    <span>{alert}</span>
                  </div>
                )}
                <form onSubmit={submitForgot} noValidate>
                  <AuthField
                    label="Work email"
                    icon="far fa-envelope"
                    error={forgotError}
                    errorText="Enter a valid email address."
                  >
                    {(err) => (
                      <input
                        className={inputClass(err)}
                        type="email"
                        placeholder="you@brokerage.com"
                        value={forgotEmail}
                        onChange={(e) => {
                          setForgotEmail(e.target.value);
                          setForgotError(false);
                        }}
                      />
                    )}
                  </AuthField>
                  <Button
                    type="submit"
                    block
                    loading={loading}
                    className="h-11"
                  >
                    {loading ? "Sending…" : "Send reset link"}
                  </Button>
                </form>
                <p className="mt-5 text-center">
                  <button
                    type="button"
                    onClick={() => setView("signin")}
                    className="text-[0.8rem] font-bold text-accent hover:underline"
                  >
                    <i className="fas fa-arrow-left" /> Back to sign in
                  </button>
                </p>
              </>
            )}

            {view === "sent" && (
              <div className="text-center">
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-success-soft text-[1.3rem] text-success">
                  <i className="fas fa-paper-plane" />
                </div>
                <h4 className="text-[1.4rem] font-extrabold tracking-[-0.02em] text-on-surface">
                  Check your inbox
                </h4>
                <p className="mt-2 mb-5 text-[0.84rem] text-on-surface-muted">
                  If an account exists for{" "}
                  <b className="num text-[0.8rem] text-on-surface">
                    {forgotEmail}
                  </b>
                  , a reset link is on its way.
                </p>
                <button
                  type="button"
                  onClick={() => setView("signin")}
                  className="text-[0.8rem] font-bold text-accent hover:underline"
                >
                  <i className="fas fa-arrow-left" /> Back to sign in
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 text-[0.72rem] text-on-surface-muted">
          <span>© 2026 EstatePulse</span>
          {["Privacy", "Terms", "Help"].map((l) => (
            <a
              key={l}
              href="#"
              onClick={(e) => e.preventDefault()}
              className="hover:text-accent"
            >
              {l}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};
export default LoginPage;
