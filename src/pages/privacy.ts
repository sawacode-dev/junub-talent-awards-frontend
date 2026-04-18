import { renderLegalPage, type LegalDoc } from './legal';

const doc: LegalDoc = {
  kind: 'privacy',
  title: 'Privacy Policy',
  metaTitle: 'Privacy Policy — Junub Talent Awards',
  metaDescription:
    'Learn how Junub Talent Awards collects, uses, and protects your personal information when you vote on junubtalentsawards.com.',
  lastUpdated: 'April 18, 2026',
  intro:
    'Welcome to Junub Talents Awards ("we," "our," or "us"). We operate junubtalentsawards.com (the "Platform"), a voting system celebrating South Sudanese excellence across music, comedy, acting, sports, entrepreneurship, and digital content. This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our Platform. By using our Platform, you agree to the collection and use of information in accordance with this policy.',
  sections: [
    {
      id: 'information-we-collect',
      title: '1. Information We Collect',
      body: `
        <h3 class="legal__h3">1.1 Information You Provide Directly</h3>
        <p>When you sign in with Google to vote, we collect:</p>
        <ul>
          <li>Your name</li>
          <li>Your email address</li>
          <li>Your Google profile picture</li>
          <li>Your Google account ID (used to prevent duplicate voting)</li>
        </ul>

        <h3 class="legal__h3">1.2 Information Collected Automatically</h3>
        <p>When you use our Platform, we automatically collect:</p>
        <ul>
          <li>Device information (browser type, operating system, device model)</li>
          <li>Usage data (pages visited, voting actions, time spent on the Platform)</li>
          <li>IP address and approximate geographic location (country/city level)</li>
        </ul>

        <h3 class="legal__h3">1.3 Information We Do Not Collect</h3>
        <p>We do <strong>NOT</strong> collect:</p>
        <ul>
          <li>Payment information (the Platform is free to use)</li>
          <li>Sensitive personal information (race, religion, health data, etc.)</li>
          <li>Your Google account password (authentication is handled by Google OAuth)</li>
          <li>Precise geolocation (GPS coordinates)</li>
        </ul>
      `,
    },
    {
      id: 'how-we-use',
      title: '2. How We Use Your Information',
      body: `
        <h3 class="legal__h3">2.1 Platform Functionality</h3>
        <ul>
          <li>Authenticate your identity when you sign in</li>
          <li>Record and count your votes</li>
          <li>Prevent duplicate voting (one vote per person per category)</li>
          <li>Display your voting history on your profile page</li>
          <li>Show your name and profile picture in your account settings</li>
        </ul>

        <h3 class="legal__h3">2.2 Platform Improvement</h3>
        <ul>
          <li>Analyze voting patterns to detect fraud or abuse</li>
          <li>Monitor platform performance and fix technical issues</li>
          <li>Understand which categories are most popular</li>
        </ul>

        <h3 class="legal__h3">2.3 Communication</h3>
        <ul>
          <li>Send you important notifications about voting periods (if you opt in)</li>
          <li>Respond to your support requests</li>
        </ul>

        <h3 class="legal__h3">2.4 Legal Compliance</h3>
        <ul>
          <li>Comply with applicable laws and regulations</li>
          <li>Protect against fraudulent or illegal activity</li>
          <li>Enforce our Terms of Service</li>
        </ul>
      `,
    },
    {
      id: 'how-we-share',
      title: '3. How We Share Your Information',
      body: `
        <h3 class="legal__h3">3.1 Public Information</h3>
        <p>The following information <strong>is</strong> visible to other users:</p>
        <ul>
          <li>Your votes (which nominees you voted for) are visible on your public profile page if you choose to make your profile public</li>
          <li>Your name may appear in aggregate statistics (e.g., "1,234 people voted in the Musicians category")</li>
        </ul>
        <p>The following information is <strong>NOT</strong> publicly visible:</p>
        <ul>
          <li>Your email address (never shared publicly)</li>
          <li>Your Google account ID (used only for duplicate prevention)</li>
          <li>Your IP address (used only for fraud detection)</li>
        </ul>

        <h3 class="legal__h3">3.2 Service Providers</h3>
        <p>We share your information with third-party service providers who help us operate the Platform:</p>
        <ul>
          <li><strong>Supabase</strong> (database and authentication provider) — stores your profile information, votes, and authentication tokens. Supabase is SOC 2 Type II compliant and operates under GDPR. <a class="legal__link" href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Privacy policy</a></li>
          <li><strong>Cloudflare</strong> (hosting and content delivery) — processes your requests and delivers the Platform. <a class="legal__link" href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Privacy policy</a></li>
          <li><strong>Google</strong> (authentication provider) — handles sign-in via OAuth. We do not receive your Google password. <a class="legal__link" href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy policy</a></li>
        </ul>
        <p>We do <strong>NOT</strong> sell your personal information to third parties. We do <strong>NOT</strong> share your information with advertisers or marketing companies.</p>

        <h3 class="legal__h3">3.3 Legal Requirements</h3>
        <p>We may disclose your information if required by law, court order, or government request, or if necessary to:</p>
        <ul>
          <li>Protect our legal rights</li>
          <li>Detect or prevent fraud or security issues</li>
          <li>Protect the safety of users or the public</li>
        </ul>
      `,
    },
    {
      id: 'data-retention',
      title: '4. Data Retention',
      body: `
        <ul>
          <li><strong>Active accounts:</strong> We retain your information for as long as you have an account</li>
          <li><strong>Deleted accounts:</strong> If you request account deletion, we permanently delete your personal information within 30 days, except:
            <ul>
              <li>Aggregate voting statistics (anonymized, no personal identifiers)</li>
              <li>Information we must retain for legal or regulatory purposes</li>
            </ul>
          </li>
          <li><strong>Inactive accounts:</strong> If you do not sign in for 3 years, we may delete your account</li>
        </ul>
      `,
    },
    {
      id: 'your-rights',
      title: '5. Your Rights and Choices',
      body: `
        <h3 class="legal__h3">5.1 Access and Correction</h3>
        <p>You can access and update your information by:</p>
        <ul>
          <li>Signing into your account and visiting your profile page</li>
          <li>Contacting us at <a class="legal__link" href="mailto:liondynasty97@gmail.com">liondynasty97@gmail.com</a> to request a copy of your data</li>
        </ul>

        <h3 class="legal__h3">5.2 Account Deletion</h3>
        <p>You can request deletion of your account by emailing <a class="legal__link" href="mailto:liondynasty97@gmail.com">liondynasty97@gmail.com</a>. Upon deletion:</p>
        <ul>
          <li>Your personal information is permanently removed</li>
          <li>Your votes remain in the system but are no longer linked to your identity</li>
          <li>This action cannot be undone</li>
        </ul>

        <h3 class="legal__h3">5.3 Marketing Communications</h3>
        <p>We do not send marketing emails. If we introduce optional notifications in the future, you can opt out at any time.</p>

        <h3 class="legal__h3">5.4 Cookie Preferences</h3>
        <p>The Platform uses essential cookies for authentication. You can disable cookies in your browser, but this will prevent you from signing in and voting.</p>
      `,
    },
    {
      id: 'security',
      title: '6. Security',
      body: `
        <p>We implement reasonable security measures to protect your information:</p>
        <ul>
          <li>All data transmission is encrypted via HTTPS</li>
          <li>Authentication is handled by Google OAuth (we do not store passwords)</li>
          <li>Database access is restricted to authorized personnel only</li>
          <li>Regular security audits and updates</li>
        </ul>
        <p>However, no internet transmission is 100% secure. We cannot guarantee absolute security.</p>
      `,
    },
    {
      id: 'childrens-privacy',
      title: "7. Children's Privacy",
      body: `
        <p>The Platform is not intended for children under 13. We do not knowingly collect information from children under 13. If we discover we have collected information from a child under 13, we will delete it immediately.</p>
      `,
    },
    {
      id: 'international-transfers',
      title: '8. International Data Transfers',
      body: `
        <p>Our Platform is operated from South Sudan. If you access the Platform from outside this country, your information may be transferred to and processed in countries with different data protection laws. By using the Platform, you consent to such transfers.</p>
      `,
    },
    {
      id: 'changes',
      title: '9. Changes to This Privacy Policy',
      body: `
        <p>We may update this Privacy Policy from time to time. We will notify you of material changes by:</p>
        <ul>
          <li>Posting the updated policy on this page</li>
          <li>Updating the "Last Updated" date at the top</li>
        </ul>
        <p>Continued use of the Platform after changes indicates your acceptance of the updated policy.</p>
      `,
    },
    {
      id: 'contact',
      title: '10. Contact Us',
      body: `
        <p>If you have questions about this Privacy Policy or your personal information, contact us:</p>
        <ul class="legal__contact-list">
          <li><strong>Email:</strong> <a class="legal__link" href="mailto:liondynasty97@gmail.com">liondynasty97@gmail.com</a></li>
          <li><strong>Address:</strong> Juba, South Sudan</li>
          <li><strong>Website:</strong> <a class="legal__link" href="https://junubtalentsawards.com">junubtalentsawards.com</a></li>
          <li><strong>Response time:</strong> We aim to respond within 7 business days</li>
        </ul>
      `,
    },
  ],
};

export function renderPrivacyPage(container: HTMLElement): void {
  renderLegalPage(container, doc);
}
