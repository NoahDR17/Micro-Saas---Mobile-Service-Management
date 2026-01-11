import { Link } from 'react-router-dom';

export function Landing() {
  return (
    <div className="landing-page">
      <style>{`
        .landing-page {
          font-family: 'Manrope', 'Space Grotesk', 'Inter', system-ui, -apple-system, sans-serif;
          color: #0f172a;
          background: radial-gradient(circle at 20% 20%, rgba(79, 70, 229, 0.06), transparent 40%),
            radial-gradient(circle at 80% 10%, rgba(14, 165, 233, 0.08), transparent 38%),
            linear-gradient(180deg, #f7f9ff 0%, #ffffff 45%);
        }
        .lp-shell {
          max-width: 1280px;
          margin: 0 auto;
          padding: 32px 20px 80px;
        }
        .lp-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
        }
        .lp-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          font-size: 19px;
          color: #0f172a;
          text-decoration: none;
        }
        .lp-logo-mark {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #0f172a 100%);
          display: grid;
          place-items: center;
          color: #fff;
          font-weight: 800;
          font-size: 16px;
        }
        .lp-top-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .lp-ghost {
          color: #0f172a;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
        }
        .lp-pill {
          padding: 10px 16px;
          background: #111827;
          color: #fff;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 700;
          font-size: 14px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }
        .lp-hero {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 48px;
          align-items: center;
          padding: 24px 0 40px;
        }
        .lp-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #eef2ff;
          color: #4338ca;
          padding: 8px 12px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 12px;
        }
        .lp-title {
          font-size: 48px;
          line-height: 1.08;
          margin: 18px 0 16px;
          font-weight: 800;
        }
        .lp-title strong { color: #2563eb; }
        .lp-sub {
          font-size: 17px;
          color: #475569;
          max-width: 520px;
          line-height: 1.65;
          margin-bottom: 22px;
        }
        .lp-ctas {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-bottom: 16px;
        }
        .lp-btn-primary {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: #fff;
          padding: 13px 24px;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          text-decoration: none;
          box-shadow: 0 15px 35px rgba(37, 99, 235, 0.35);
        }
        .lp-btn-secondary {
          border: 1px solid #e2e8f0;
          color: #0f172a;
          background: #fff;
          padding: 12px 18px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .lp-social {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #475569;
          font-weight: 600;
          margin-top: 8px;
        }
        .lp-stats {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 10px;
        }
        .lp-stat-pill {
          background: #0f172a;
          color: #e2e8f0;
          padding: 10px 12px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 13px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.2);
        }
        .lp-stars { color: #f59e0b; }
        .lp-avatars {
          display: flex;
          align-items: center;
        }
        .lp-avatar {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          background: #cbd5e1;
          border: 2px solid #fff;
          margin-left: -8px;
        }
        .lp-avatar:first-child { margin-left: 0; }
        .lp-phone-wrap {
          justify-self: end;
        }
        .lp-phone {
          width: 360px;
          max-width: 100%;
          background: linear-gradient(180deg, #0f172a 0%, #111827 100%);
          border-radius: 28px;
          padding: 18px 14px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.25);
        }
        .lp-phone-inner {
          background: #f8fafc;
          border-radius: 22px;
          padding: 16px;
          min-height: 520px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.4);
          display: grid;
          gap: 12px;
        }
        .lp-row {
          background: #fff;
          border-radius: 14px;
          padding: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }
        .lp-chip-bar {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .lp-chip {
          background: #eff6ff;
          color: #1d4ed8;
          padding: 8px 10px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 12px;
        }
        .lp-add {
          background: #e0e7ff;
          color: #312e81;
          text-align: center;
          padding: 12px;
          border-radius: 12px;
          font-weight: 700;
        }
        .lp-fab {
          position: absolute;
          bottom: 18px;
          right: 18px;
          width: 44px;
          height: 44px;
          border-radius: 999px;
          background: #2563eb;
          color: #fff;
          display: grid;
          place-items: center;
          font-size: 24px;
          box-shadow: 0 12px 24px rgba(37,99,235,0.35);
        }
        .lp-trust {
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
          align-items: center;
          margin: 28px 0 10px;
          color: #94a3b8;
          font-weight: 600;
          font-size: 13px;
        }
        .lp-trust-logos {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }
        .lp-trust-chip {
          padding: 8px 12px;
          border-radius: 10px;
          background: #fff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
          font-weight: 700;
          color: #0f172a;
        }
        .lp-section {
          padding: 56px 0;
        }
        .lp-section h3 {
          font-size: 32px;
          margin: 0 0 10px;
        }
        .lp-section p {
          margin: 0 0 24px;
          color: #475569;
          font-size: 15px;
        }
        .lp-feature-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }
        .lp-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 16px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
        }
        .lp-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          font-size: 18px;
          margin-bottom: 10px;
        }
        .lp-icon.blue { background: #e0f2fe; color: #0369a1; }
        .lp-icon.orange { background: #fff7ed; color: #c2410c; }
        .lp-icon.green { background: #ecfdf3; color: #15803d; }
        .lp-card h4 {
          margin: 0 0 6px;
          font-size: 17px;
          font-weight: 700;
        }
        .lp-card p {
          margin: 0;
          color: #475569;
          line-height: 1.5;
          font-size: 14px;
        }
        .lp-steps {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }
        .lp-step {
          background: #0f172a;
          color: #e2e8f0;
          border-radius: 16px;
          padding: 18px;
          box-shadow: 0 16px 36px rgba(15, 23, 42, 0.25);
        }
        .lp-step h4 { margin: 0 0 8px; font-size: 18px; }
        .lp-step p { margin: 0; color: #cbd5e1; line-height: 1.6; font-size: 14px; }
        .lp-step-num {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: #1d4ed8;
          color: #fff;
          display: grid;
          place-items: center;
          font-weight: 800;
          margin-bottom: 10px;
        }
        .lp-cta-block {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: #fff;
          border-radius: 18px;
          padding: 28px;
          text-align: center;
          box-shadow: 0 20px 45px rgba(37, 99, 235, 0.35);
        }
        .lp-cta-block h3 { margin: 0 0 10px; font-size: 26px; }
        .lp-cta-block p { margin: 0 0 16px; color: rgba(255,255,255,0.9); }
        .lp-footer {
          margin-top: 32px;
          padding: 20px 0;
          color: #475569;
          font-size: 12px;
          text-align: center;
        }
        @media (max-width: 960px) {
          .lp-hero { grid-template-columns: 1fr; }
          .lp-phone-wrap { justify-self: center; }
          .lp-shell { padding: 24px 16px 48px; }
          .lp-title { font-size: 34px; }
          .lp-feature-grid { grid-template-columns: 1fr; }
          .lp-steps { grid-template-columns: 1fr; }
          .lp-topbar { flex-direction: column; gap: 12px; align-items: flex-start; }
        }
      `}</style>

      <div className="lp-shell">
        <div className="lp-topbar">
          <Link to="/" className="lp-logo">
            <div className="lp-logo-mark">S</div>
            ServiceMgr
          </Link>
          <div className="lp-top-actions">
            <Link to="/login" className="lp-ghost">Sign In</Link>
            <Link to="/signup" className="lp-pill">Start Free Trial</Link>
          </div>
        </div>

        <div className="lp-hero">
          <div>
            <div className="lp-badge">
              <span role="img" aria-label="spark">✨</span> New: AI Scheduling Assistant
            </div>
            <h1 className="lp-title">
              Run your service business from your <strong>pocket</strong>.
            </h1>
            <p className="lp-sub">
              The all-in-one CRM, booking, and automation tool built for mobile pros.
            </p>
            <div className="lp-ctas">
              <Link to="/signup" className="lp-btn-primary">Start Free Trial</Link>
              <Link to="/signup" className="lp-btn-secondary">
                <span role="img" aria-label="play">▶</span> Watch Demo
              </Link>
            </div>
            <div className="lp-social">
              <div className="lp-avatars">
                <div className="lp-avatar" />
                <div className="lp-avatar" />
                <div className="lp-avatar" />
                <div className="lp-avatar" />
                <div className="lp-avatar" />
              </div>
              <div>⭐ 4.9/5 from 500+ pros</div>
            </div>
            <div className="lp-stats">
              <div className="lp-stat-pill">⏱ Saves 8 hrs/week</div>
              <div className="lp-stat-pill">📈 +22% rebook rate</div>
              <div className="lp-stat-pill">🔒 GDPR-ready</div>
            </div>
          </div>

          <div className="lp-phone-wrap">
            <div className="lp-phone" style={{ position: 'relative' }}>
              <div className="lp-phone-inner">
                <div className="lp-row" style={{ display: 'grid', gap: '8px' }}>
                  <div className="lp-chip-bar">
                    <div className="lp-chip">New Booking</div>
                    <div className="lp-chip">Quote</div>
                    <div className="lp-chip">On the way</div>
                  </div>
                </div>
                <div className="lp-row" style={{ height: '60px' }} />
                <div className="lp-row" style={{ height: '60px' }} />
                <div className="lp-row" style={{ height: '48px' }} />
                <div className="lp-row" style={{ height: '48px' }} />
                <div className="lp-add">+ Add Booking</div>
              </div>
              <div className="lp-fab">+</div>
            </div>
          </div>
        </div>

        <div className="lp-trust">
          Trusted by growing mobile pros
          <div className="lp-trust-logos">
            <div className="lp-trust-chip">BrightClean</div>
            <div className="lp-trust-chip">Spark HVAC</div>
            <div className="lp-trust-chip">DetailPro</div>
            <div className="lp-trust-chip">UrbanGardens</div>
            <div className="lp-trust-chip">SwiftFix</div>
          </div>
        </div>

        <div className="lp-section">
          <h3>Everything you need</h3>
          <p>Powerful tools to help you grow without the administrative headache.</p>
          <div className="lp-feature-grid">
            <div className="lp-card">
              <div className="lp-icon blue" aria-hidden>📅</div>
              <h4>Smart Booking</h4>
              <p>Accept bookings 24/7. Syncs with your calendar automatically so you never double book.</p>
            </div>
            <div className="lp-card">
              <div className="lp-icon orange" aria-hidden>🔔</div>
              <h4>Auto-Reminders</h4>
              <p>Reduce no-shows by 80% with automated SMS and email reminders for clients.</p>
            </div>
            <div className="lp-card">
              <div className="lp-icon green" aria-hidden>📇</div>
              <h4>Client CRM</h4>
              <p>Keep track of client history, preferences, and notes in one secure place.</p>
            </div>
          </div>
        </div>

        <div className="lp-section">
          <h3>How it works</h3>
          <p>Automate the boring parts in three quick steps.</p>
          <div className="lp-steps">
            <div className="lp-step">
              <div className="lp-step-num">1</div>
              <h4>Import clients</h4>
              <p>Upload your existing book and we’ll deduplicate, enrich, and tag it automatically.</p>
            </div>
            <div className="lp-step">
              <div className="lp-step-num">2</div>
              <h4>Set reminders</h4>
              <p>Pick your templates and timing; we send SMS/email reminders so no-shows drop overnight.</p>
            </div>
            <div className="lp-step">
              <div className="lp-step-num">3</div>
              <h4>Get rebookings</h4>
              <p>Automations nudge clients to rebook on your schedule—no manual follow-ups needed.</p>
            </div>
          </div>
        </div>

        <div className="lp-cta-block">
          <h3>Ready to get organized?</h3>
          <p>No credit card required · 14-day free trial</p>
          <Link to="/signup" className="lp-btn-primary" style={{ boxShadow: '0 15px 35px rgba(0,0,0,0.2)' }}>
            Start Your Free Trial
          </Link>
        </div>

        <div className="lp-footer">
          © 2026 Mobile Service Manager. Already have an account? <Link to="/login" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}
