import PolicyPage from '@/components/PolicyPage'; import { createPageMetadata } from '@/lib/seo';
export const metadata = createPageMetadata({ title: 'Privacy', description: 'Read how Artsy by Oma handles information shared through the website, enquiries, accounts, and purchases.', pathname: '/privacy' });
export default function PrivacyPage() {
  return <PolicyPage
    label="Privacy notice"
    title="Privacy policy"
    intro="This notice explains what personal information Artsy by Oma collects, why we use it, who may receive it, how long we keep it, and the choices available to you."
    updated="3 September 2026"
    sections={[
      {
        heading: '1. Who we are and when this notice applies',
        body: [
          'Artsy by Oma is a creative studio operated by Oma Achebe in Awka, Anambra, Nigeria. For the personal information described in this notice, Artsy by Oma is the data controller and decides why and how that information is used.',
          'This notice applies when you visit artsybyoma.com, create or use a customer account, buy artwork or materials, book a studio experience, enquire about a private event or commission, contact us by email, phone or WhatsApp, or otherwise interact with the studio. A third-party website or service you choose to use has its own privacy notice.',
          'Privacy questions and requests can be sent to support@artsybyoma.com or made by phone on 0816 700 9545. Please include “Privacy request” in the subject line where possible.',
        ],
      },
      {
        heading: '2. Personal information we collect',
        body: [
          'Contact and identity information: your name, email address, phone number, customer account identifier, display name and, if supplied through Google sign-in, profile photo.',
          'Orders and payments: the items you order, price, currency, delivery or collection choice, delivery address, order notes, payment status, transaction reference, refunds and related customer-support records. Paystack collects and processes card, bank or other payment credentials on its secure checkout; Artsy by Oma does not receive or store your full card number, CVV or online-banking password.',
          'Bookings and enquiries: your preferred date and time, number of guests, selected activity, event type, special requests, commission brief, messages, booking status and correspondence with the studio.',
          'Account and authentication information: your email address, encrypted authentication credentials, sign-in provider, login session and password-reset activity. If you use Google sign-in, Google provides Firebase Authentication with the basic account details needed to sign you in.',
          'Technical information: IP address, browser and device type, operating system, referral and requested pages, approximate location derived from IP, timestamps, security events and server logs. We also store cart contents and session or preference information in your browser so the site can work correctly.',
          'Please do not send health information, government identification numbers, financial credentials or other sensitive personal information unless we specifically request it and explain why it is needed.',
        ],
      },
      {
        heading: '3. Where the information comes from',
        body: [
          'Most information comes directly from you when you complete a form, create an account, place an order, make a booking, send a message or speak with the studio.',
          'We may also receive limited information from Google when you choose Google sign-in; from Paystack and participating banks about the status and reference of a payment; from delivery partners about fulfilment; and automatically from the website, hosting systems and security logs when you use the service.',
          'If you provide information about another person, such as another booking guest or delivery recipient, please make sure you are authorised to share it and that they understand how it will be used.',
        ],
      },
      {
        heading: '4. Why we use information and our lawful bases',
        body: [
          'Contract and steps requested before a contract: to create and manage your account, answer a booking or commission request, reserve a session, process an order or payment, arrange collection or delivery, issue confirmations and receipts, and provide the service you requested.',
          'Legitimate interests: to operate and improve the studio and website, provide customer support, maintain accurate records, secure accounts, prevent fraud and misuse, understand service performance, enforce our terms, and establish or defend legal claims. We consider the effect on your rights before relying on this basis.',
          'Legal obligations: to maintain transaction, tax and accounting records; respond to lawful requests; manage complaints, refunds and disputes; and comply with applicable Nigerian law.',
          'Consent: where we ask permission for optional marketing, a testimonial, publication of an identifiable photo, or another use that requires consent. You may withdraw consent at any time, without affecting processing that was lawful before withdrawal.',
          'We do not sell or rent personal information. We do not use customer information for third-party behavioural advertising, and we do not make decisions that produce legal or similarly significant effects solely by automated means.',
        ],
      },
      {
        heading: '5. Payments',
        body: [
          'Online payments are processed by Paystack Payments Limited. We send Paystack the information needed to start and reconcile a transaction, such as your email address, amount, currency, order or booking identifier and transaction metadata. Paystack may collect payment credentials, device information and fraud-prevention information under its own privacy terms.',
          'We receive transaction status, reference and limited customer or payment information needed to confirm the order, issue a receipt, investigate a failed or disputed payment, process a refund and keep financial records. A pending order or booking is not treated as paid until Paystack verifies the transaction.',
        ],
        links: [
          { href: 'https://paystack.com/terms', label: 'Read Paystack’s Privacy & Cookie Policy' },
        ],
      },
      {
        heading: '6. When we share information',
        body: [
          'We disclose only the information reasonably needed for the relevant purpose. Our providers include Google Firebase for authentication, database and file storage; Vercel for website hosting and request logs; Paystack for payment processing; Resend or a configured email provider for transactional messages; and delivery or logistics providers when an order needs to be delivered.',
          'We may also share information with professional advisers, insurers, auditors or contractors subject to appropriate confidentiality duties; with a regulator, court, law-enforcement agency or other authority where disclosure is legally required; or where necessary to protect customers, the studio, our rights or the security of the service.',
          'If the studio is reorganised, sold or transferred, relevant information may be disclosed to advisers and a prospective successor subject to confidentiality and applicable law. We do not allow a service provider to use information for an unrelated purpose merely because it provides a service to us.',
        ],
        links: [
          { href: 'https://firebase.google.com/support/privacy', label: 'Firebase privacy and security information' },
          { href: 'https://vercel.com/legal/privacy-notice', label: 'Vercel Privacy Notice' },
          { href: 'https://resend.com/legal/privacy-policy', label: 'Resend Privacy Policy' },
        ],
      },
      {
        heading: '7. International processing',
        body: [
          'Some providers operate infrastructure outside Nigeria. For example, Firebase Authentication is operated from the United States, while Firebase, Vercel and email infrastructure may process information in other countries where they or their subprocessors operate.',
          'Where personal information is transferred outside Nigeria, we take reasonable steps to use providers and contractual arrangements that protect the information and to rely on a transfer basis permitted by the Nigeria Data Protection Act 2023. Privacy laws and government-access rules in another country may differ from those in Nigeria.',
        ],
      },
      {
        heading: '8. How long we keep information',
        body: [
          'We keep information only for as long as reasonably necessary for the purpose collected and for legal, accounting, security and dispute-resolution needs. The period depends on the record and our relationship with you.',
          'Account and profile information is generally kept while the account remains active and for a limited period after closure or a deletion request. Enquiries, unsuccessful booking requests and routine correspondence are generally kept for up to 24 months after the last meaningful contact unless an ongoing matter requires longer retention.',
          'Completed order, booking, payment, refund and accounting records may be kept for up to seven years, or longer where required by law or an active dispute. Security and server logs are normally kept for shorter operational periods determined by the relevant provider. Browser-stored cart information remains on your device until it expires or you clear it.',
          'When information is no longer required, we delete it, anonymise it or securely isolate it from further use. Residual copies may remain temporarily in protected backups before being overwritten through normal backup cycles.',
        ],
      },
      {
        heading: '9. Cookies, local storage and similar technologies',
        body: [
          'The website uses technologies that are necessary for functions such as account sign-in, authentication security, shopping-cart persistence and remembering session choices. These may include cookies, browser local storage and Firebase authentication storage.',
          'We do not currently place advertising cookies or run third-party behavioural analytics on the public website. Paystack and other third-party pages you choose to open may use their own cookies under their own notices. You can clear or block browser storage through your browser settings, but account, cart or checkout features may then stop working correctly.',
        ],
      },
      {
        heading: '10. Security',
        body: [
          'We use reasonable technical and organisational safeguards designed to protect personal information. These include HTTPS in transit, access controls, role-based administration, database and storage security rules, payment verification, restricted administrative sessions and limiting staff access to legitimate business needs.',
          'No internet service can guarantee absolute security. Use a unique password, protect access to your email and Google account, sign out on shared devices, and contact us promptly if you believe your Artsy by Oma account or transaction information has been compromised.',
        ],
      },
      {
        heading: '11. Your privacy rights',
        body: [
          'Subject to applicable law and any relevant exception, you may ask whether we hold personal information about you and request access to it; request correction of inaccurate or incomplete information; request deletion; request restriction of certain processing; object to processing based on legitimate interests or direct marketing; withdraw consent; and request a portable copy of eligible information.',
          'To exercise a right, email support@artsybyoma.com and describe the request and the account, order, booking or enquiry it relates to. We may ask for proportionate information to verify your identity and protect the records from unauthorised disclosure. We will respond without undue delay and within the period required by applicable law, or explain any lawful reason why a request cannot be fulfilled in full.',
          'You also have the right to complain to the Nigeria Data Protection Commission. We would appreciate the opportunity to address your concern first, but contacting us does not limit your right to approach the Commission or seek another remedy available under law.',
        ],
        links: [
          { href: 'https://ndpc.gov.ng/', label: 'Nigeria Data Protection Commission' },
          { href: 'https://ndpc.gov.ng/download/nigeria-data-protection-act-2023', label: 'Nigeria Data Protection Act 2023' },
        ],
      },
      {
        heading: '12. Children and studio activities',
        body: [
          'The website, customer accounts and online checkout are intended for adults. Children may take part in appropriate studio activities only when arranged or supervised by a parent, guardian, school or responsible organiser.',
          'We do not knowingly create independent customer accounts for children or use a child’s information for marketing without the authorisation required by law. If you believe a child has submitted personal information without appropriate permission, contact us so we can investigate and delete it where required.',
        ],
      },
      {
        heading: '13. Marketing, external links and changes',
        body: [
          'Transactional messages about an order, booking, account or enquiry are part of providing the requested service. If we introduce optional promotional email or messaging, we will provide an appropriate choice and a straightforward way to opt out. Opting out of marketing does not stop necessary service messages.',
          'Our website may link to Instagram, TikTok, Facebook, WhatsApp, Google, Paystack and other external services. Those services control their own collection and use of information once you interact with them, so please review their notices before providing personal information.',
          'We may update this policy when our services, providers or legal obligations change. Material changes will be highlighted on this page or communicated through another appropriate channel. The “Last updated” date shows when the current version took effect.',
        ],
      },
    ]}
  />;
}
