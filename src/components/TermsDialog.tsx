/**
 * `TermsDialog` — the AC-66 Käyttöehdot terms-of-use gate. Opens on
 * the first compact-mode send (textarea or chip activation) for any
 * browser profile that has not yet accepted, holding the queued
 * question while the user reads. Mounts at App level as a sibling of
 * `ConfirmDialog` (the AC-33e per-row delete modal); the two never
 * co-occur because the gate is reachable only from compact and the
 * delete modal only from expanded.
 *
 * Figma anchors:
 * - `ds:257:1096` — short form (one paragraph + *Lue lisää* link).
 * - `ds:242:551` — long form (full §-by-§ legal copy in a
 *   scrollable body, Figma scrollbar `ds:242:578`).
 * - `site:555:2186` — short form composed over the dimmed compact
 *   hero (the in-screen visual context).
 * - `site:555:2200` — long form composed over the dimmed compact
 *   hero (Lane L, 2026-05-11). Same `Background dim` rectangle at
 *   `rgba(0, 0, 0, 0.2)` pattern as the AC-33e modal anchored on
 *   `site:555:2214`; no `backdrop-filter: blur` at the modal layer.
 *
 * The card visually re-uses the AC-33e dialog shell (white surface,
 * `--radius`, `--textarea-shadow`, 32 px padding, 32 px section gap)
 * but with a `--cta-gradient` primary button (`ds:242:609`
 * "Hyväksyn käyttöehdot") instead of the destructive red AC-33e
 * variant. Cancel ("Peruuta", outlined `ds:242:607`) leaves the
 * widget in compact and preserves the textarea draft per AC-66.
 *
 * Long-form expansion (AC-66b):
 * - *Lue lisää* swaps the body in-place to the long form; the toggle
 *   becomes *Näytä vähemmän* and the body gets a scrollable region
 *   so the surrounding card height stays bounded by the viewport.
 * - Section headings render as `<strong>` (no Markdown / HTML
 *   injection per AC-N1).
 * - When `privacyPolicyUrl` is supplied, the closing privacy-policy
 *   sentence renders that URL as an anchor with
 *   `target="_blank" rel="noopener noreferrer"` (AC-66b, mirrors
 *   AC-25b's link semantics). When omitted, the sentence stands
 *   alone with no broken-looking placeholder.
 *
 * Cancel paths (per AC-66, mirroring AC-33e):
 * - *Peruuta* button click → `onCancel`.
 * - `Esc` keypress while the dialog has focus → `onCancel`.
 * - Click on the dimmed backdrop outside the card → `onCancel`.
 *
 * Focus management mirrors `ConfirmDialog`: the previously-focused
 * element is captured on open and restored on close; cancel is
 * auto-focused so a stray `Enter` does not record acceptance the
 * user did not actually grant.
 */

import { useEffect, useId, useRef, useState } from 'react'
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from 'react'
import styles from '../styles/termsDialog.module.css'

interface TermsDialogProps {
  open: boolean
  onAccept: () => void
  onCancel: () => void
  privacyPolicyUrl?: string
}

const SHORT_BODY =
  'Tämä IR-agentti on tekoälyavusteinen agentti. Agentti ei anna ' +
  'sijoitusneuvontaa eikä se suosittele arvopapereiden ostamista, ' +
  'myymistä eikä hallussapitoa. IR-agentti täydentää Siilin ' +
  'sijoittajasivuja ja on tarkoitettu yksinomaan avustamaan käyttäjää. ' +
  'Ethän syötä IR-agentille henkilötietojasi tai muita ' +
  'luottamuksellisia tietoja. Olen lukenut ja ymmärtänyt IR-agenttia ' +
  'koskevat ehdot ja hyväksyn ne.'

interface LongFormSection {
  heading?: string
  paragraphs: string[]
}

const LONG_FORM_SECTIONS: LongFormSection[] = [
  { paragraphs: [SHORT_BODY] },
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
    // The closing privacy-policy sentence is rendered separately below
    // so the optional `privacyPolicyUrl` can be wrapped as an anchor
    // without splitting the paragraph at render time.
    paragraphs: [
      'Palveluun syöttämäsi kysymykset tallennetaan palvelun laadun ' +
        'varmistamiseksi, väärinkäytösten estämiseksi ja sovellettavan ' +
        'sääntelyn noudattamiseksi. Tietojenkäsittely tapahtuu Siili ' +
        'Solutions Oyj:n tietosuojaselosteen mukaisesti.',
    ],
  },
]

export function TermsDialog({
  open,
  onAccept,
  onCancel,
  privacyPolicyUrl,
}: TermsDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)
  const [expanded, setExpanded] = useState(false)
  const titleId = useId()
  const bodyId = useId()

  useEffect(() => {
    if (!open) return
    previouslyFocusedRef.current =
      (document.activeElement as HTMLElement | null) ?? null
    cancelRef.current?.focus()
    return () => {
      previouslyFocusedRef.current?.focus?.()
      previouslyFocusedRef.current = null
      // Reset to short form so the next open starts fresh — matches
      // the Figma component which ships short and long as siblings.
      setExpanded(false)
    }
  }, [open])

  if (!open) return null

  const handleBackdropClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onCancel()
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onCancel()
      return
    }
    if (event.key !== 'Tab') return
    // Light focus trap covering only the two action buttons. The
    // Lue lisää / Näytä vähemmän toggle and the optional privacy-
    // policy anchor are part of the natural Tab order between cancel
    // and confirm; if the user tabs onto the toggle and then back
    // out, the regular Tab key carries them to confirm — only the
    // edges (cancel ⇄ confirm) need to wrap.
    const cancel = cancelRef.current
    const confirm = confirmRef.current
    if (!cancel || !confirm) return
    const active = document.activeElement
    if (event.shiftKey && active === cancel) {
      event.preventDefault()
      confirm.focus()
    } else if (!event.shiftKey && active === confirm) {
      event.preventDefault()
      cancel.focus()
    }
  }

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div
        className={styles.card}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
      >
        <p id={titleId} className={styles.title}>
          Käyttöehdot
        </p>
        <div id={bodyId} className={styles.body}>
          {expanded ? (
            <LongForm privacyPolicyUrl={privacyPolicyUrl} />
          ) : (
            <p>{SHORT_BODY}</p>
          )}
          <p>
            <button
              type="button"
              className={styles.expandToggle}
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
            >
              {expanded ? 'Näytä vähemmän' : 'Lue lisää'}
            </button>
          </p>
        </div>
        <div className={styles.actions}>
          <button
            ref={cancelRef}
            type="button"
            className={styles.cancel}
            onClick={onCancel}
          >
            Peruuta
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={styles.confirm}
            onClick={onAccept}
          >
            Hyväksyn käyttöehdot
          </button>
        </div>
      </div>
    </div>
  )
}

function LongForm({ privacyPolicyUrl }: { privacyPolicyUrl?: string }) {
  return (
    <>
      {LONG_FORM_SECTIONS.map((section, sectionIdx) => (
        <div key={sectionIdx}>
          {section.heading ? (
            <p>
              <strong>{section.heading}</strong>
            </p>
          ) : null}
          {section.paragraphs.map((paragraph, paragraphIdx) => (
            <p key={paragraphIdx}>{paragraph}</p>
          ))}
        </div>
      ))}
      <p>
        Tietosuojaseloste on saatavilla yhtiön verkkosivustolla
        {privacyPolicyUrl ? (
          <>
            {' '}(
            <a
              className={styles.policyLink}
              href={privacyPolicyUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              tietosuojaseloste
            </a>
            ).
          </>
        ) : (
          <>.</>
        )}
      </p>
    </>
  )
}
