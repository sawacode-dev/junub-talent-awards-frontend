import { renderLegalPage, type LegalDoc } from './legal';

const doc: LegalDoc = {
  kind: 'terms',
  title: 'Terms of Service',
  metaTitle: 'Terms of Service — Junub Talent Awards',
  metaDescription:
    'Read the Terms of Service for Junub Talent Awards. Understand your rights, voting rules, and responsibilities when using junubtalentsawards.com.',
  lastUpdated: 'April 18, 2026',
  intro:
    'Welcome to Junub Talents Awards. By accessing or using junubtalentsawards.com (the "Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Platform.',
  sections: [
    {
      id: 'description',
      title: '1. Description of Service',
      body: `
        <p>Junub Talents Awards is a voting platform that allows users to vote for outstanding South Sudanese talent across multiple categories including music, comedy, acting, sports, entrepreneurship, and digital content. The Platform is operated by SawaCode Digital Solutions.</p>
        <p>The Platform allows you to:</p>
        <ul>
          <li>Sign in using your Google account</li>
          <li>Vote for nominees in various talent categories</li>
          <li>View your voting history</li>
          <li>View results after they are revealed by administrators</li>
        </ul>
        <p>The Platform does <strong>NOT</strong>:</p>
        <ul>
          <li>Guarantee any nominee will win</li>
          <li>Provide prizes or compensation to users (prizes, if any, are awarded to winning nominees, not voters)</li>
          <li>Allow you to change or delete votes after submission</li>
        </ul>
      `,
    },
    {
      id: 'eligibility',
      title: '2. Eligibility',
      body: `
        <p>To use the Platform, you must:</p>
        <ul>
          <li>Be at least 13 years of age</li>
          <li>Have a valid Google account</li>
          <li>Not be located in a country where use of the Platform is prohibited by law</li>
          <li>Comply with all applicable local, national, and international laws</li>
        </ul>
      `,
    },
    {
      id: 'account',
      title: '3. Account Registration and Security',
      body: `
        <h3 class="legal__h3">3.1 Account Creation</h3>
        <p>You create an account by signing in with Google. By doing so, you:</p>
        <ul>
          <li>Authorize us to access your Google name, email, and profile picture</li>
          <li>Confirm that the information you provide is accurate and current</li>
          <li>Agree to maintain the security of your Google account</li>
        </ul>

        <h3 class="legal__h3">3.2 Account Security</h3>
        <p>You are responsible for:</p>
        <ul>
          <li>Maintaining the confidentiality of your Google account credentials</li>
          <li>All activities that occur under your account</li>
          <li>Notifying us immediately if you suspect unauthorized use</li>
        </ul>
        <p>We are not liable for any loss or damage arising from your failure to protect your account.</p>

        <h3 class="legal__h3">3.3 One Account Per Person</h3>
        <p>Each person may have only <strong>ONE</strong> account. Creating multiple accounts to vote multiple times is prohibited and grounds for account termination.</p>
      `,
    },
    {
      id: 'voting-rules',
      title: '4. Voting Rules',
      body: `
        <h3 class="legal__h3">4.1 How Voting Works</h3>
        <ul>
          <li>You may vote <strong>ONCE</strong> per category during each voting period</li>
          <li>Votes are final and cannot be changed or deleted after submission</li>
          <li>You must be signed in to vote</li>
          <li>Voting is free (no payment required)</li>
        </ul>

        <h3 class="legal__h3">4.2 Prohibited Voting Practices</h3>
        <p>You may <strong>NOT</strong>:</p>
        <ul>
          <li>Vote more than once per category by creating multiple accounts</li>
          <li>Use automated tools, bots, or scripts to vote</li>
          <li>Manipulate vote counts through technical exploits</li>
          <li>Coordinate vote-buying or vote-selling schemes</li>
          <li>Engage in any form of vote manipulation or fraud</li>
        </ul>
        <p>Violation of these rules will result in immediate account termination and disqualification of affected votes.</p>

        <h3 class="legal__h3">4.3 Vote Verification</h3>
        <p>We reserve the right to:</p>
        <ul>
          <li>Verify the legitimacy of votes</li>
          <li>Disqualify fraudulent or suspicious votes</li>
          <li>Adjust vote counts if manipulation is detected</li>
          <li>Disqualify nominees if evidence suggests they coordinated vote manipulation</li>
        </ul>
      `,
    },
    {
      id: 'intellectual-property',
      title: '5. Intellectual Property',
      body: `
        <h3 class="legal__h3">5.1 Our Content</h3>
        <p>The Platform and its content (text, graphics, logos, designs, code) are owned by us or our licensors and are protected by copyright, trademark, and other intellectual property laws.</p>
        <p>You may <strong>NOT</strong>:</p>
        <ul>
          <li>Copy, modify, or distribute our content without permission</li>
          <li>Use our trademarks or branding without written authorization</li>
          <li>Reverse engineer or attempt to extract source code from the Platform</li>
        </ul>

        <h3 class="legal__h3">5.2 User Content</h3>
        <p>By using the Platform, you grant us a worldwide, non-exclusive, royalty-free license to:</p>
        <ul>
          <li>Store and display your profile information and voting activity</li>
          <li>Use anonymized voting data for analytics and platform improvement</li>
        </ul>
        <p>You retain ownership of your personal information. See our <a class="legal__link" href="#/privacy">Privacy Policy</a> for how we handle your data.</p>

        <h3 class="legal__h3">5.3 Nominee Content</h3>
        <p>Nominee information (names, images, biographies) is submitted by administrators or the nominees themselves. If you believe any nominee content infringes your intellectual property rights, contact us at <a class="legal__link" href="mailto:liondynasty97@gmail.com">liondynasty97@gmail.com</a>.</p>
      `,
    },
    {
      id: 'prohibited-conduct',
      title: '6. Prohibited Conduct',
      body: `
        <p>You agree <strong>NOT</strong> to:</p>

        <h3 class="legal__h3">6.1 Abuse the Platform</h3>
        <ul>
          <li>Interfere with or disrupt the Platform's operation</li>
          <li>Circumvent security measures or access restrictions</li>
          <li>Overload or harm our servers or infrastructure</li>
          <li>Use the Platform for any illegal purpose</li>
        </ul>

        <h3 class="legal__h3">6.2 Harass or Harm Others</h3>
        <ul>
          <li>Post hateful, abusive, or threatening content</li>
          <li>Impersonate another person or entity</li>
          <li>Violate others' privacy or intellectual property rights</li>
          <li>Engage in spam, phishing, or fraudulent activity</li>
        </ul>

        <h3 class="legal__h3">6.3 Scrape or Data Mine</h3>
        <ul>
          <li>Extract data from the Platform using automated tools</li>
          <li>Create derivative databases from Platform data</li>
          <li>Attempt to collect other users' personal information</li>
        </ul>
      `,
    },
    {
      id: 'results',
      title: '7. Results and Winners',
      body: `
        <h3 class="legal__h3">7.1 Result Timing</h3>
        <ul>
          <li>Voting closes on the date specified on the Platform</li>
          <li>Results are revealed at the discretion of administrators, typically at a live awards ceremony</li>
          <li>Results are based on legitimate vote counts, adjusted for any detected fraud</li>
        </ul>

        <h3 class="legal__h3">7.2 No Guarantees</h3>
        <p>We do <strong>NOT</strong> guarantee:</p>
        <ul>
          <li>That any particular nominee will win</li>
          <li>The accuracy of vote counts (we take reasonable measures but cannot guarantee 100% accuracy)</li>
          <li>That results will be revealed on a specific date</li>
          <li>That winners will receive any particular prize (prizes are determined by event organizers, not the Platform)</li>
        </ul>

        <h3 class="legal__h3">7.3 Disputes</h3>
        <p>All decisions regarding vote validity, fraud detection, and winner selection are final and made at our sole discretion. We are not responsible for disputes between nominees, voters, or third parties.</p>
      `,
    },
    {
      id: 'disclaimers',
      title: '8. Disclaimers',
      body: `
        <h3 class="legal__h3">8.1 "As-Is" Service</h3>
        <p class="legal__caps">THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:</p>
        <ul>
          <li>MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE</li>
          <li>UNINTERRUPTED OR ERROR-FREE OPERATION</li>
          <li>ACCURACY OR RELIABILITY OF RESULTS</li>
          <li>SECURITY OF DATA TRANSMISSION</li>
        </ul>

        <h3 class="legal__h3">8.2 No Professional Advice</h3>
        <p>The Platform does not provide professional, legal, financial, or medical advice. Content is for informational purposes only.</p>

        <h3 class="legal__h3">8.3 Third-Party Content</h3>
        <p>We are not responsible for:</p>
        <ul>
          <li>Nominee information accuracy (submitted by third parties)</li>
          <li>Comments or content posted by other users</li>
          <li>Third-party websites linked from the Platform</li>
        </ul>
      `,
    },
    {
      id: 'liability',
      title: '9. Limitation of Liability',
      body: `
        <h3 class="legal__h3">9.1 No Liability for Damages</h3>
        <p class="legal__caps">WE ARE NOT LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING:</p>
        <ul>
          <li>Lost profits or revenue</li>
          <li>Data loss or corruption</li>
          <li>Harm to reputation</li>
          <li>Missed opportunities due to voting results</li>
        </ul>

        <h3 class="legal__h3">9.2 Maximum Liability</h3>
        <p class="legal__caps">OUR TOTAL LIABILITY TO YOU FOR ANY CLAIMS ARISING FROM USE OF THE PLATFORM SHALL NOT EXCEED THE AMOUNT YOU PAID TO USE THE PLATFORM (which is zero, as the Platform is free).</p>

        <h3 class="legal__h3">9.3 Exceptions</h3>
        <p>Some jurisdictions do not allow exclusion of certain warranties or limitation of liability. In such jurisdictions, our liability is limited to the maximum extent permitted by law.</p>
      `,
    },
    {
      id: 'indemnification',
      title: '10. Indemnification',
      body: `
        <p>You agree to indemnify, defend, and hold us harmless from any claims, damages, losses, or expenses (including legal fees) arising from:</p>
        <ul>
          <li>Your violation of these Terms</li>
          <li>Your violation of any laws or third-party rights</li>
          <li>Your use of the Platform</li>
          <li>Your voting activity</li>
        </ul>
      `,
    },
    {
      id: 'termination',
      title: '11. Termination',
      body: `
        <h3 class="legal__h3">11.1 By You</h3>
        <p>You may stop using the Platform at any time. To delete your account, contact us at <a class="legal__link" href="mailto:liondynasty97@gmail.com">liondynasty97@gmail.com</a>.</p>

        <h3 class="legal__h3">11.2 By Us</h3>
        <p>We may terminate or suspend your account immediately, without notice, if you:</p>
        <ul>
          <li>Violate these Terms</li>
          <li>Engage in fraudulent voting</li>
          <li>Abuse or harm the Platform or other users</li>
          <li>For any other reason at our sole discretion</li>
        </ul>
        <p>Upon termination:</p>
        <ul>
          <li>Your access to the Platform is revoked</li>
          <li>Your votes remain in the system but cannot be changed</li>
          <li>We may delete your account data per our Privacy Policy</li>
        </ul>
      `,
    },
    {
      id: 'changes-to-terms',
      title: '12. Changes to Terms',
      body: `
        <p>We may update these Terms at any time by:</p>
        <ul>
          <li>Posting the updated Terms on this page</li>
          <li>Updating the "Last Updated" date</li>
        </ul>
        <p>Material changes will be notified via a notice on the Platform homepage, or an email to registered users (if applicable). Continued use of the Platform after changes constitutes acceptance of the updated Terms.</p>
      `,
    },
    {
      id: 'governing-law',
      title: '13. Governing Law and Disputes',
      body: `
        <h3 class="legal__h3">13.1 Governing Law</h3>
        <p>These Terms are governed by the laws of South Sudan, without regard to conflict of law principles.</p>

        <h3 class="legal__h3">13.2 Dispute Resolution</h3>
        <p>If you have a dispute with us:</p>
        <ul>
          <li>First, contact us at <a class="legal__link" href="mailto:liondynasty97@gmail.com">liondynasty97@gmail.com</a> to resolve informally</li>
          <li>If unresolved, disputes shall be settled by binding arbitration in Juba, South Sudan</li>
          <li>You waive the right to participate in class actions or class arbitrations</li>
        </ul>

        <h3 class="legal__h3">13.3 Exceptions</h3>
        <p>We may seek injunctive relief in any court of competent jurisdiction to prevent intellectual property infringement, fraud or vote manipulation, or violations that harm the Platform or other users.</p>
      `,
    },
    {
      id: 'general',
      title: '14. General Provisions',
      body: `
        <h3 class="legal__h3">14.1 Entire Agreement</h3>
        <p>These Terms, together with our <a class="legal__link" href="#/privacy">Privacy Policy</a>, constitute the entire agreement between you and us regarding the Platform.</p>

        <h3 class="legal__h3">14.2 Severability</h3>
        <p>If any provision of these Terms is found invalid or unenforceable, the remaining provisions remain in full effect.</p>

        <h3 class="legal__h3">14.3 No Waiver</h3>
        <p>Our failure to enforce any right or provision does not constitute a waiver of that right or provision.</p>

        <h3 class="legal__h3">14.4 Assignment</h3>
        <p>You may not transfer or assign your rights under these Terms. We may assign our rights and obligations without restriction.</p>

        <h3 class="legal__h3">14.5 Survival</h3>
        <p>Provisions that by their nature should survive termination (including Intellectual Property, Disclaimers, Limitation of Liability, Indemnification) remain in effect after termination.</p>
      `,
    },
    {
      id: 'contact',
      title: '15. Contact Information',
      body: `
        <p>If you have questions about these Terms, contact us:</p>
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

export function renderTermsPage(container: HTMLElement): void {
  renderLegalPage(container, doc);
}
