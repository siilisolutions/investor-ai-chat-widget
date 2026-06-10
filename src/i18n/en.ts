/**
 * English (`en`) string table. The widget-chrome copy is an engineer
 * translation; the `Käyttöehdot` legal body (`termsShortBody` +
 * `termsLongFormSections`) ships pending a designer / legal review
 * (AC-63, 2026-06 directive — it is not a Finnish fallback). Implements
 * the `WidgetStrings` contract; a missing key is a `tsc` build failure.
 * See `strings.ts` for the aggregating `STRINGS` record.
 */

import type { WidgetStrings } from './strings.ts'

export const en: WidgetStrings = {
  inputPlaceholder: 'Ask me about Siili as an investment.',
  inputAriaLabel: 'Siili investor chatbot message',
  sendButtonAriaLabel: 'Send message',

  heroTitleLine1: 'At Siili, AI is real -',
  heroTitleLine2: 'for investors too.',
  heroSectionAriaLabel: 'Investor AI hero',
  suggestions: [
    "What is Siili's strategy and how has its execution progressed?",
    "What is the company's current dividend policy?",
    "Where can I find more information about the company's revenue and result?",
  ],

  continueDiscussion: 'Continue previous conversation',

  scrollCueLabel: "Would you like to view Siili's more traditional investor pages?",

  expandedTitle: 'Siili AI assistant',

  loadingText: 'Searching for information...',
  sourcesLabel: 'Sources:',

  closeAriaLabel: 'Close conversation',
  menuOpenAriaLabel: 'Open conversation menu',
  menuDialogAriaLabel: 'Conversation menu',

  newConversationLabel: 'Create new conversation',
  recentConversationsHeading: 'Recent conversations',
  neutralConversationLabel: 'New conversation',
  deleteConversationAriaLabel: (label) => `Delete conversation — ${label}`,

  deleteDialogTitle: 'Delete conversation',
  deleteDialogDescriptionPrefix:
    'Are you sure you want to delete the conversation ',
  deleteDialogDescriptionSuffix: '?',
  cancelLabel: 'Cancel',
  deleteLabel: 'Delete',

  safeError:
    "Sorry, I can't fetch an answer right now. Please try again in a moment.",

  termsTitle: 'Terms of use',
  termsReadMore: 'Read more',
  termsShowLess: 'Show less',
  termsAccept: 'I accept the terms of use',
  termsShortBody:
    'This IR agent is an AI-assisted agent. The agent does not provide ' +
    'investment advice and does not recommend buying, selling, or holding ' +
    'securities. The IR agent complements Siili\u2019s investor site and ' +
    'is intended solely to assist the user. Please do not enter personal ' +
    'data or other confidential information into the IR agent. I have read ' +
    'and understood the terms regarding the IR agent and accept them.',
  termsLongFormSections: [
    {
      heading: 'Nature and timeliness of information',
      paragraphs: [
        'This IR agent is based exclusively on information officially ' +
          'published by Siili Solutions Plc, such as stock exchange ' +
          'releases, financial statements, interim reports, and other ' +
          'officially disclosed documents. The service does not contain ' +
          'undisclosed information and does not speculate on future events.',
        "The IR agent's information may be delayed in relation to the most " +
          'recent official disclosures. Users must always verify information ' +
          "from the company's official investor website and the stock " +
          'exchange release archive.',
      ],
    },
    {
      heading: 'Legal restrictions',
      paragraphs: [
        'The service is intended for investors and analysts for ' +
          'informational purposes. It does not replace independent investment ' +
          "analysis, professional advice, or the company's official " +
          'documents. Information produced by the service does not constitute ' +
          'official disclosure within the meaning of the Securities Markets ' +
          'Act, the EU Market Abuse Regulation (MAR), or any other ' +
          'regulation. The service is not available to users subject to local ' +
          'laws or regulations restricting its use.',
      ],
    },
    {
      heading: 'Limitations of the AI system',
      paragraphs: [
        'The AI-based system may produce incorrect, incomplete, or ' +
          'inaccurate responses. Siili Solutions Plc is not liable for ' +
          'decisions made on the basis of such responses or for any damages ' +
          'that may result from them. The service should be used only as a ' +
          'preliminary source of information. All investment decisions ' +
          'should be based on up-to-date official documents and, where ' +
          'necessary, professional advice.',
      ],
    },
    {
      heading: 'Processing of personal data',
      paragraphs: [
        'The questions you submit to the service are stored to ensure the ' +
          'quality of the service, to prevent misuse, and to comply with ' +
          'applicable regulations. Data processing is carried out in ' +
          "accordance with Siili Solutions Plc's privacy policy.",
      ],
    },
  ],
  termsPrivacySentencePrefix:
    "The privacy policy is available on the company's website",
  termsPrivacyLinkText: 'privacy policy',

  mockAnswer:
    'Siili Solutions is a Finnish digital business consultancy. The ' +
    "company's operations are divided into several segments, and its " +
    'growth is supported by both organic development and strategic ' +
    'acquisitions.\n\nThis is a mock response — connect a real backend to ' +
    'get genuine answers with source references.',
  mockSources: [
    { label: 'PDF: Annual Report 2025, p.21' },
    { label: 'PDF: Annual Report 2025, p.34' },
  ],
}
