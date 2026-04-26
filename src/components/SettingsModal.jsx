import React, { memo, useState } from 'react';
import { X, Mail, Coffee, Shield, FileText, Info, ExternalLink } from 'lucide-react';

const TABS = [
    { key: 'about',   label: 'About',          icon: Info       },
    { key: 'privacy', label: 'Privacy Policy',  icon: Shield     },
    { key: 'terms',   label: 'Terms of Service',icon: FileText   },
];

const SectionHeader = ({ children }) => (
    <p style={{ color: 'var(--color-muted)', fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '8px', marginTop: '24px' }}>
        {children}
    </p>
);

const DocTitle = ({ children }) => (
    <h2 style={{ color: 'var(--color-text)', fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>{children}</h2>
);

const DocSubtitle = ({ children }) => (
    <p style={{ color: 'var(--color-muted)', fontSize: '12px', marginBottom: '20px' }}>{children}</p>
);

const DocHeading = ({ children }) => (
    <h3 style={{ color: 'var(--color-teal)', fontSize: '14px', fontWeight: 700, marginTop: '20px', marginBottom: '8px' }}>{children}</h3>
);

const DocBody = ({ children }) => (
    <p style={{ color: 'var(--color-muted)', fontSize: '13px', lineHeight: '1.6', marginBottom: '4px' }}>{children}</p>
);

const DocBullets = ({ items }) => (
    <ul style={{ paddingLeft: '8px', marginBottom: '4px' }}>
        {items.map((item, i) => (
            <li key={i} style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--color-teal)', fontSize: '13px', flexShrink: 0 }}>•</span>
                <span style={{ color: 'var(--color-muted)', fontSize: '13px', lineHeight: '1.5' }}>{item}</span>
            </li>
        ))}
    </ul>
);

const LinkRow = ({ icon: Icon, label, href }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 0',
            color: 'var(--color-text)',
            textDecoration: 'none',
            borderBottom: '1px solid var(--border-color)',
            fontSize: '14px',
        }}
    >
        <Icon size={16} style={{ color: 'var(--color-teal)', flexShrink: 0 }} />
        <span style={{ flex: 1 }}>{label}</span>
        <ExternalLink size={13} style={{ color: 'var(--color-muted)' }} />
    </a>
);

const InfoRow = ({ icon: Icon, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
        <Icon size={16} style={{ color: 'var(--color-teal)', flexShrink: 0 }} />
        <div>
            <p style={{ color: 'var(--color-muted)', fontSize: '12px' }}>{label}</p>
            <p style={{ color: 'var(--color-text)', fontSize: '14px' }}>{value}</p>
        </div>
    </div>
);

function AboutTab() {
    return (
        <div style={{ padding: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{
                    width: 72, height: 72, borderRadius: '16px',
                    background: 'linear-gradient(135deg, var(--color-teal) 0%, var(--color-neon-green) 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: '28px', fontWeight: 900, color: 'var(--bg-main)',
                    letterSpacing: '-1px'
                }}>
                    S/
                </div>
                <h1 style={{ color: 'var(--color-text)', fontSize: '22px', fontWeight: 700 }}>Split IDE</h1>
                <p style={{ color: 'var(--color-muted)', fontSize: '13px', marginTop: '4px' }}>Version 1.0.0</p>
                <p style={{ color: 'var(--color-muted)', fontSize: '13px' }}>A cloud-synced code editor for the web</p>
            </div>

            <SectionHeader>Contact</SectionHeader>
            <InfoRow icon={Mail} label="Email" value="itsadrex205@gmail.com" />

            <SectionHeader>Legal</SectionHeader>
            <LinkRow icon={Shield} label="Privacy Policy (Web)" href="https://www.termsfeed.com/live/0cd3a164-8fbe-43aa-8016-f02a86ca0020" />

            <SectionHeader>Support Development</SectionHeader>
            <LinkRow icon={Coffee} label="Buy Me a Coffee" href="https://ko-fi.com" />

            <p style={{ color: 'var(--color-muted)', fontSize: '12px', textAlign: 'center', marginTop: '32px', lineHeight: '1.6' }}>
                © 2026 Split IDE. All rights reserved.<br />Made with ❤ in Nigeria.
            </p>
        </div>
    );
}

function PrivacyTab() {
    return (
        <div style={{ padding: '20px' }}>
            <DocTitle>Privacy Policy</DocTitle>
            <DocSubtitle>Last updated: April 21, 2026</DocSubtitle>
            <DocBody>Split IDE ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use Split IDE.</DocBody>

            <DocHeading>1. Information We Collect</DocHeading>
            <DocBody>Account Information — When you register or sign in, we collect your email address and display name via Supabase authentication (including Google OAuth if used).</DocBody>
            <DocBody>User Content — We store the code files and projects you create within the app on Supabase cloud servers so you can access them across devices.</DocBody>
            <DocBody>Usage Data — We may collect basic usage data such as device type, browser version, and feature interactions to improve the service.</DocBody>

            <DocHeading>2. How We Use Your Information</DocHeading>
            <DocBullets items={[
                'To create and manage your account',
                'To sync and store your code projects across devices',
                'To provide technical support when you contact us',
                'To improve the app based on how it is used',
                'To send important service notices (not marketing emails)',
            ]} />

            <DocHeading>3. Data Storage & Security</DocHeading>
            <DocBody>Your data is stored on Supabase servers with encryption in transit (HTTPS/TLS). We apply commercially reasonable security practices. However, no internet transmission is 100% secure.</DocBody>

            <DocHeading>4. Third-Party Services</DocHeading>
            <DocBullets items={[
                'Supabase — authentication and cloud database (supabase.com/privacy)',
                'Google Sign-In — optional OAuth provider (policies.google.com/privacy)',
                'GitHub — optional OAuth provider (docs.github.com/site-policy/privacy-policies)',
            ]} />

            <DocHeading>5. Data Retention</DocHeading>
            <DocBody>We retain your account and project data for as long as your account is active. You may delete your account and data at any time by contacting us at itsadrex205@gmail.com. We will remove your data within 30 days.</DocBody>

            <DocHeading>6. Children's Privacy</DocHeading>
            <DocBody>Split IDE is not directed at children under the age of 16. We do not knowingly collect personal information from anyone under 16.</DocBody>

            <DocHeading>7. Your Rights</DocHeading>
            <DocBullets items={[
                'Access: You can view your data by logging into the app',
                'Correction: You can update your profile information in-app',
                'Deletion: Contact itsadrex205@gmail.com to request data deletion',
                'Portability: Contact us to request a copy of your stored data',
            ]} />

            <DocHeading>8. Changes to This Policy</DocHeading>
            <DocBody>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or an in-app notice. Continued use of the app after changes constitutes acceptance.</DocBody>

            <DocHeading>9. Contact Us</DocHeading>
            <DocBody>For privacy questions or data requests: Email: itsadrex205@gmail.com</DocBody>
            <div style={{ height: 32 }} />
        </div>
    );
}

function TermsTab() {
    return (
        <div style={{ padding: '20px' }}>
            <DocTitle>Terms of Service</DocTitle>
            <DocSubtitle>Last updated: April 21, 2026</DocSubtitle>
            <DocBody>Please read these Terms of Service carefully before using Split IDE. By accessing or using the app, you agree to be bound by these terms.</DocBody>

            <DocHeading>1. Acceptance of Terms</DocHeading>
            <DocBody>By creating an account or using Split IDE, you confirm that you are at least 16 years old and agree to these Terms. If you do not agree, do not use the app.</DocBody>

            <DocHeading>2. Description of Service</DocHeading>
            <DocBody>Split IDE is a cloud-synced code editor that allows you to write, edit, preview, and store HTML, CSS, JavaScript, and other code files from your browser or mobile device.</DocBody>

            <DocHeading>3. Your Account</DocHeading>
            <DocBullets items={[
                'You are responsible for maintaining the confidentiality of your account credentials',
                'You are responsible for all activity that occurs under your account',
                'You must provide accurate information when creating an account',
                'Notify us immediately at itsadrex205@gmail.com if you suspect unauthorized access',
            ]} />

            <DocHeading>4. Acceptable Use</DocHeading>
            <DocBody>You agree NOT to use Split IDE to:</DocBody>
            <DocBullets items={[
                'Write, store, or distribute malware, viruses, or malicious code',
                'Violate any applicable local, national, or international laws',
                'Infringe upon the intellectual property rights of others',
                "Attempt to gain unauthorized access to other users' data or our systems",
                'Use the service in any way that could damage or overburden our infrastructure',
            ]} />

            <DocHeading>5. Your Content</DocHeading>
            <DocBody>You retain full ownership of all code and content you create using Split IDE. By storing content on our servers, you grant us a limited license to host and transmit that content solely for the purpose of providing the service to you. We do not sell, share, or use your code for any other purpose.</DocBody>

            <DocHeading>6. Service Availability</DocHeading>
            <DocBody>We aim to keep Split IDE available at all times but do not guarantee uninterrupted access. The service may be temporarily unavailable due to maintenance or circumstances beyond our control.</DocBody>

            <DocHeading>7. Intellectual Property</DocHeading>
            <DocBody>Split IDE, its logo, design, and underlying code are the intellectual property of Split IDE. You may not copy, modify, distribute, or reverse engineer any part of the application without express written permission.</DocBody>

            <DocHeading>8. Termination</DocHeading>
            <DocBody>We reserve the right to suspend or terminate your account if you violate these Terms. You may also delete your account at any time by contacting us. Upon termination, your data will be deleted within 30 days.</DocBody>

            <DocHeading>9. Disclaimer of Warranties</DocHeading>
            <DocBody>Split IDE is provided "as is" without warranties of any kind, either express or implied. We do not warrant that the service will be error-free, secure, or continuously available.</DocBody>

            <DocHeading>10. Limitation of Liability</DocHeading>
            <DocBody>To the fullest extent permitted by applicable law, Split IDE shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service, including loss of data.</DocBody>

            <DocHeading>11. Governing Law</DocHeading>
            <DocBody>These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved under Nigerian jurisdiction.</DocBody>

            <DocHeading>12. Changes to These Terms</DocHeading>
            <DocBody>We may revise these Terms at any time. We will notify you of significant changes via email or in-app notice. Continued use of the app after changes means you accept the revised Terms.</DocBody>

            <DocHeading>13. Contact</DocHeading>
            <DocBody>For any questions about these Terms: Email: itsadrex205@gmail.com</DocBody>
            <div style={{ height: 32 }} />
        </div>
    );
}

const SettingsModal = memo(({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('about');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <div
                style={{
                    backgroundColor: 'var(--bg-panel)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    width: '100%',
                    maxWidth: '560px',
                    maxHeight: '85vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border-color)',
                    flexShrink: 0,
                }}>
                    <span style={{ color: 'var(--color-text)', fontWeight: 700, fontSize: '16px' }}>Settings</span>
                    <button onClick={onClose} className="icon-btn"><X size={18} /></button>
                </div>

                {/* Tab Bar */}
                <div style={{
                    display: 'flex',
                    borderBottom: '1px solid var(--border-color)',
                    flexShrink: 0,
                    backgroundColor: 'var(--bg-main)',
                }}>
                    {TABS.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            style={{
                                flex: 1,
                                padding: '10px 4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                border: 'none',
                                borderBottom: activeTab === key ? `2px solid var(--color-teal)` : '2px solid transparent',
                                backgroundColor: 'transparent',
                                color: activeTab === key ? 'var(--color-teal)' : 'var(--color-muted)',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            <Icon size={13} />
                            <span className="hidden sm:inline">{label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {activeTab === 'about'   && <AboutTab />}
                    {activeTab === 'privacy' && <PrivacyTab />}
                    {activeTab === 'terms'   && <TermsTab />}
                </div>
            </div>
        </div>
    );
});

SettingsModal.displayName = 'SettingsModal';

export default SettingsModal;
