/**
 * Finnish (`fi`) string table — the host site default locale (PD-09).
 * Implements the `WidgetStrings` contract; a missing key is a `tsc`
 * build failure. See `strings.ts` for the aggregating `STRINGS` record
 * and the `WidgetStrings` shape.
 */

import type { WidgetStrings } from './strings.ts'

export const fi: WidgetStrings = {
  inputPlaceholder: 'Kysy minulta Siilistä sijoituskohteena.',
  inputAriaLabel: 'Siilin sijoittajachatbotin viesti',
  sendButtonAriaLabel: 'Lähetä viesti',

  heroTitleLine1: 'Siilillä tekoäly on totta -',
  heroTitleLine2: 'myös sijoittajille.',
  heroSectionAriaLabel: 'Sijoittaja-AI hero',
  suggestions: [
    'Mikä on Siilin strategia ja kuinka sen toteuttaminen on edennyt?',
    'Mikä on yhtiön nykyinen osinkopolitiikka?',
    'Mistä löydän lisätietoa yhtiön liikevaihdosta ja tuloksesta?',
  ],

  continueDiscussion: 'Jatka edellistä keskustelua',

  scrollCueLabel:
    'Haluatko tarkastella perinteisempiä Siilin sijoittajasivuja?',

  expandedTitle: 'Siili AI-avustaja',

  loadingText: 'Haetaan tietoa...',
  sourcesLabel: 'Lähteet:',

  closeAriaLabel: 'Sulje keskustelu',
  menuOpenAriaLabel: 'Avaa keskusteluvalikko',
  menuDialogAriaLabel: 'Keskusteluvalikko',

  newConversationLabel: 'Luo uusi keskustelu',
  recentConversationsHeading: 'Viimeisimmät keskustelut',
  neutralConversationLabel: 'Uusi keskustelu',
  deleteConversationAriaLabel: (label) => `Poista keskustelu — ${label}`,

  deleteDialogTitle: 'Poista keskustelu',
  deleteDialogDescriptionPrefix: 'Haluatko varmasti poistaa keskustelun ',
  deleteDialogDescriptionSuffix: '?',
  cancelLabel: 'Peruuta',
  deleteLabel: 'Poista',

  safeError:
    'Pahoittelut, en pysty juuri nyt hakemaan vastausta. Yritä hetken kuluttua uudelleen.',

  termsTitle: 'Käyttöehdot',
  termsReadMore: 'Lue lisää',
  termsShowLess: 'Näytä vähemmän',
  termsAccept: 'Hyväksyn käyttöehdot',
  termsShortBody:
    'Tämä IR-agentti on tekoälyavusteinen agentti. Agentti ei anna ' +
    'sijoitusneuvontaa eikä se suosittele arvopapereiden ostamista, ' +
    'myymistä eikä hallussapitoa. IR-agentti täydentää Siilin ' +
    'sijoittajasivuja ja on tarkoitettu yksinomaan avustamaan käyttäjää. ' +
    'Ethän syötä IR-agentille henkilötietojasi tai muita ' +
    'luottamuksellisia tietoja. Olen lukenut ja ymmärtänyt IR-agenttia ' +
    'koskevat ehdot ja hyväksyn ne.',
  termsLongFormSections: [
    {
      heading: 'Tietojen luonne ja ajantasaisuus',
      paragraphs: [
        'Tämä IR-agentti perustuu yksinomaan Siili Solutions Oyj:n ' +
          'virallisesti julkistamaan tietoon, kuten pörssitiedotteisiin, ' +
          'tilinpäätöksiin, osavuosikatsauksiin ja muihin virallisesti ' +
          'julkistettuihin asiakirjoihin. Palvelu ei sisällä ' +
          'julkistamatonta tietoa eikä spekuloi tulevista tapahtumista.',
        'IR-agentin tiedot saattavat viivästyä suhteessa viimeisimpiin ' +
          'virallisiin julkistuksiin. Käyttäjän on aina tarkistettava ' +
          'tiedot yhtiön viralliselta sijoittajasivustolta ja ' +
          'pörssitiedotejärjestelmästä.',
      ],
    },
    {
      heading: 'Oikeudelliset rajoitukset',
      paragraphs: [
        'Palvelu on suunnattu sijoittajille ja analyytikoille ' +
          'tutustumiskäyttöön. Se ei korvaa itsenäistä ' +
          'sijoitusanalyysiä, ammattilaisneuvontaa eikä yhtiön ' +
          'virallisia asiakirjoja. Palvelun tuottama tieto ei muodosta ' +
          'arvopaperimarkkinalain, EU:n markkinoiden ' +
          'väärinkäyttöasetuksen (MAR) eikä minkään muun sääntelyn ' +
          'tarkoittamaa virallista tiedonantoa. Palvelu ei ole ' +
          'saatavilla käyttäjille, joihin sovelletaan sen käyttöä ' +
          'rajoittavia paikallisia lakeja tai määräyksiä.',
      ],
    },
    {
      heading: 'Tekoälyjärjestelmän rajoitukset',
      paragraphs: [
        'Tekoälypohjainen järjestelmä saattaa tuottaa virheellisiä, ' +
          'puutteellisia tai epätäsmällisiä vastauksia. Siili Solutions ' +
          'Oyj ei vastaa tällaisten vastausten perusteella tehdyistä ' +
          'päätöksistä eikä niistä mahdollisesti aiheutuvista ' +
          'vahingoista. Palvelua tulee käyttää ainoastaan alustavana ' +
          'tietolähteenä. Kaikki sijoituspäätökset tulee perustaa ' +
          'ajantasaisiin virallisiin asiakirjoihin ja tarvittaessa ' +
          'asiantuntijaneuvontaan.',
      ],
    },
    {
      heading: 'Henkilötietojen käsittely',
      paragraphs: [
        'Palveluun syöttämäsi kysymykset tallennetaan palvelun laadun ' +
          'varmistamiseksi, väärinkäytösten estämiseksi ja sovellettavan ' +
          'sääntelyn noudattamiseksi. Tietojenkäsittely tapahtuu Siili ' +
          'Solutions Oyj:n tietosuojaselosteen mukaisesti.',
      ],
    },
  ],
  termsPrivacySentencePrefix:
    'Tietosuojaseloste on saatavilla yhtiön verkkosivustolla',
  termsPrivacyLinkText: 'tietosuojaseloste',

  mockAnswer:
    'Siili Solutions on suomalainen digitaalisen liiketoiminnan ' +
    'asiantuntijayritys. Yhtiön liiketoiminta jakautuu useisiin ' +
    'segmentteihin, ja sen kasvua tukevat sekä orgaaninen kehitys että ' +
    'strategiset yritysostot.\n\nTämä on mock-vastaus — kytkemällä oikea ' +
    'backend saat todelliset vastaukset lähdeviittauksineen.',
  mockSources: [
    { label: 'PDF: Vuosikertomus 2025, s.21' },
    { label: 'PDF: Vuosikertomus 2025, s.34' },
  ],
}
