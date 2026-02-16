export const POLICY_CONTACT_EMAIL = 'hello.flico.mv@outlook.com'

export const POLICIES = {
  privacy: {
    key: 'privacy',
    title: 'Privacy Policy',
    description: 'We respect your privacy and are committed to protecting your personal data.',
    lastUpdated: 'February 9, 2026',
    sections: [
      {
        id: 'intro',
        heading: '1. Introduction',
        blocks: [
          {
            type: 'p',
            text: 'Welcome to Flico. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our movie recommendation services.'
          },
          {
            type: 'p',
            text: 'We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this policy, or our practices with regards to your personal information, please contact us.'
          }
        ]
      },
      {
        id: 'collection',
        heading: '2. Information We Collect',
        blocks: [
          {
            type: 'p',
            text: 'We collect information that helps us provide you with the best personalized movie recommendations.'
          },
          {
            type: 'ul',
            items: [
              '**Personal Information:** Name, email address, and profile settings you provide during registration.',
              '**Preferences:** Movie genres, streaming platforms, watch history, and quiz results.',
              '**Technical Data:** IP address, browser type, device information, and operating system.',
              '**Usage Data:** Pages visited, time spent, clicks, and interactions with our features.'
            ]
          }
        ]
      },
      {
        id: 'usage',
        heading: '3. How We Use Your Information',
        blocks: [
          {
            type: 'p',
            text: 'We use the information we collect to:'
          },
          {
            type: 'ul',
            items: [
              'Create and manage your account.',
              'Generate personalized movie and TV show recommendations.',
              'Analyze usage patterns to improve our algorithms and user interface.',
              'Send you updates, security alerts, and support messages.',
              'Prevent fraudulent activity and ensure the security of our platform.'
            ]
          }
        ]
      },
      {
        id: 'sharing',
        heading: '4. Sharing Your Information',
        blocks: [
          {
            type: 'p',
            text: 'We do not sell your personal information. We may share your data in the following situations:'
          },
          {
            type: 'ul',
            items: [
              '**Service Providers:** With third-party vendors who perform services for us (e.g., hosting, analytics, email delivery).',
              '**Legal Obligations:** If required by law or to protect the rights and safety of Flico, our users, or others.',
              '**Business Transfers:** In connection with a merger, sale of company assets, financing, or acquisition.'
            ]
          }
        ]
      },
      {
        id: 'rights',
        heading: '5. Your Rights',
        blocks: [
          {
            type: 'p',
            text: 'Depending on your location, you may have the following rights:'
          },
          {
            type: 'ul',
            items: [
              '**Access:** Request a copy of the personal data we hold about you.',
              '**Correction:** Request correction of inaccurate or incomplete data.',
              '**Deletion:** Request deletion of your personal data (Right to be Forgotten).',
              '**Portability:** Request transfer of your data to another service.',
              '**Opt-out:** Opt-out of marketing communications.'
            ]
          }
        ]
      },
      {
        id: 'cookies',
        heading: '6. Cookies and Tracking',
        blocks: [
          {
            type: 'p',
            text: 'We use cookies and similar tracking technologies to track the activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.'
          },
          {
            type: 'p',
            text: 'For more detailed information, please refer to our [Cookie Policy](/cookies).'
          }
        ]
      },
      {
        id: 'updates',
        heading: '7. Updates to This Policy',
        blocks: [
          {
            type: 'p',
            text: 'We may update this Privacy Policy from time to time. The updated version will be indicated by an updated "Last updated" date and the updated version will be effective as soon as it is accessible.'
          }
        ]
      },
      {
        id: 'jurisdiction',
        heading: '8. Jurisdiction Specific Provisions',
        blocks: [
          {
             type: 'p',
             text: 'Depending on your location, specific laws may apply to your personal data.'
          },
          {
             type: 'h3',
             text: 'California Residents (CCPA/CPRA)'
          },
          {
             type: 'p',
             text: '[Placeholder: Specific disclosures required by the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA), including categories of personal information collected, sold, or shared, and specific rights for California residents.]'
          },
          {
             type: 'h3',
             text: 'EEA and UK Residents (GDPR)'
          },
          {
             type: 'p',
             text: '[Placeholder: Specific disclosures required by the General Data Protection Regulation (GDPR), including lawful basis for processing, international data transfers, and data protection officer contact information.]'
          }
        ]
      },
      {
        id: 'contact',
        heading: '9. Contact Us',
        blocks: [
          {
            type: 'p',
            text: 'If you have questions or comments about this policy, you may email us at hello.flico.mv@outlook.com or use our [Contact Page](/contact).'
          }
        ]
      }
    ]
  },
  terms: {
    key: 'terms',
    title: 'Terms of Service',
    description: 'The rules and regulations for using Flico.',
    lastUpdated: 'February 9, 2026',
    sections: [
      {
        id: 'acceptance',
        heading: '1. Acceptance of Terms',
        blocks: [
          {
            type: 'p',
            text: 'By accessing or using Flico, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.'
          }
        ]
      },
      {
        id: 'account',
        heading: '2. User Accounts',
        blocks: [
          {
            type: 'p',
            text: 'When you create an account with us, you must provide information that is accurate, complete, and current. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.'
          },
          {
            type: 'p',
            text: 'You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.'
          }
        ]
      },
      {
        id: 'conduct',
        heading: '3. Prohibited Behaviors',
        blocks: [
          {
            type: 'p',
            text: 'You agree not to:'
          },
          {
            type: 'ul',
            items: [
              'Use the service for any unlawful purpose.',
              'Attempt to gain unauthorized access to any portion of the service.',
              'Interfere with or disrupt the operation of the service.',
              'Harass, abuse, or harm another person or group.',
              'Use automated systems (bots, scrapers) to access the service.'
            ]
          }
        ]
      },
      {
        id: 'ip',
        heading: '4. Intellectual Property',
        blocks: [
          {
            type: 'p',
            text: 'The service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of Flico and its licensors.'
          }
        ]
      },
      {
        id: 'termination',
        heading: '5. Termination',
        blocks: [
          {
            type: 'p',
            text: 'We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.'
          }
        ]
      },
      {
        id: 'disclaimers',
        heading: '6. Disclaimers',
        blocks: [
          {
            type: 'p',
            text: 'The service is provided on an "AS IS" and "AS AVAILABLE" basis. Flico makes no warranties, expressed or implied, regarding the operation of the service or the information, content, or materials included therein.'
          }
        ]
      },
      {
        id: 'contact',
        heading: '7. Contact Us',
        blocks: [
          {
            type: 'p',
            text: 'If you have any questions about these Terms, please contact us at hello.flico.mv@outlook.com.'
          }
        ]
      }
    ]
  },
  cookies: {
    key: 'cookies',
    title: 'Cookie Policy',
    description: 'Understanding how we use cookies to improve your experience.',
    lastUpdated: 'February 9, 2026',
    sections: [
      {
        id: 'what-are-cookies',
        heading: '1. What Are Cookies',
        blocks: [
          {
            type: 'p',
            text: 'Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the owners of the site.'
          }
        ]
      },
      {
        id: 'how-we-use',
        heading: '2. How We Use Cookies',
        blocks: [
          {
            type: 'p',
            text: 'We use cookies for several reasons:'
          },
          {
            type: 'ul',
            items: [
              '**Essential Cookies:** Necessary for the website to function properly (e.g., keeping you logged in).',
              '**Preference Cookies:** Allow the website to remember choices you make (e.g., language, region).',
              '**Analytics Cookies:** Help us understand how visitors interact with the website.',
              '**Marketing Cookies:** Used to track visitors across websites to display relevant ads.'
            ]
          }
        ]
      },
      {
        id: 'manage-preferences',
        heading: '3. Managing Your Preferences',
        blocks: [
          {
            type: 'p',
            text: 'You can change your cookie preferences at any time. You can also control and/or delete cookies as you wish using your browser settings.'
          }
        ]
      },
      {
        id: 'contact',
        heading: '4. Contact Us',
        blocks: [
          {
            type: 'p',
            text: 'If you have questions about our use of cookies, please contact us at hello.flico.mv@outlook.com.'
          }
        ]
      }
    ]
  }
}
