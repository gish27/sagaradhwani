# 09 · Data Protection, Consent & Retention

**Source:** plan §5.6, §6.1, §6.7, §12.5 (consent templates are an open item — these are the drafts). For legal review before launch.

## 1. Consent is a first-class record

Every piece of content that includes a person we did not film at a public event, or any footage we did not shoot, references a **consent record** in the platform (`consent` table): kind, subject, who gave it, relation (for minors), reference (screenshot/text/signed form), date, and the story/creator it attaches to. Revocation is recorded, never deleted.

| Kind | When | Reference stored |
|---|---|---|
| `creator_standing` | A roster creator allows reuse of public clips | WhatsApp message text/screenshot |
| `viewer_submission` | A viewer sends footage/photos/text for publication | Written permission in chat |
| `interviewee` | Anyone we interview who is not a public official acting in role | On-camera statement or log entry |
| `parental` | Any identifiable minor | Parent/guardian written consent |
| `advertiser_creative` | Advertiser supplies logos/photos for an ad | Contract clause or message |

## 2. Templates (Kannada versions to be prepared; English drafts below)

### 2.1 Creator standing permission (WhatsApp)
> Namaskara [Name]. This is [Your name] from Sagara Dhwani. We would like to occasionally use short clips from your public posts about Sagara in our daily channel, always with your name and handle on screen. One reply covers all future use; you can withdraw any time by messaging us and we will stop within 7 days. Reply "Yes, I agree" to confirm.

### 2.2 Viewer submission permission (WhatsApp)
> Thank you for sending this. Before we publish: (1) Did you record it yourself? (2) Does everyone identifiable in it know it may be published? (3) Are there any children in it? If yes, is a parent okay with it? If all fine, reply "Yes, you can publish with my name" or "Yes, you can publish without my name".

### 2.3 Interviewee statement (on camera or in capture log)
> "My name is [full name], I am [designation] at/from [place], and I am speaking to Sagara Dhwani knowing this will be published."

### 2.4 Parental consent (message or form)
> I, [parent/guardian name], parent/guardian of [child's name, age], permit Sagara Dhwani to publish video/photos of my child recorded at [event/place] on [date]. I understand I can ask for removal at any time.

### 2.5 Advertiser creative licence (contract clause)
> Advertiser confirms it owns or has licensed all logos, photos and text supplied, and grants Sagara Dhwani a licence to use them in the contracted advertisement.

## 3. Dignity rules (non-negotiable)

- No CCTV or accident footage of identifiable victims.
- No footage of a minor without a parent's consent.
- No one's private video without consent.
- Grievance and serious-allegation stories escalate before shooting.

## 4. Data minimisation

- Tip-line numbers are kept only as long as the tip is live (30 days if not published).
- Capture logs record interviewee identity for verification — not addresses or IDs.
- Audience analytics are aggregate only; no individual viewer tracking on the channel page.
- Staff declared affiliations are visible only to founder/content head.

## 5. Retention schedule

| Data | Retention | Owner |
|---|---|---|
| Published identity pieces + archive metadata | Permanent (subject to erasure requests) | Content head |
| Published daily news (archived copy) | 3 years | Production desk |
| Raw footage, unused | 90 days | Production desk |
| Raw footage, used in a published piece | 1 year, then finished piece only | Production desk |
| Viewer submissions, unpublished | 30 days | Taluk editor |
| Consent records | Life of content + 3 years | Content head |
| Advertiser contracts, invoices, payments | 8 years | Sales & collections |
| MCMC certificates, political ad records | 8 years / per ECI | Sales & collections |
| Takedown and complaint records | 5 years | Production desk |
| Staff records | Engagement + 3 years | Founder |
| Audit log | 5 years | Founder |
| Backups | 35 daily rolling + monthly for 1 year | Production desk |

## 6. Access to raw footage and consent media

Restricted to state-hub production roles and the originating taluk unit. Exports are logged. Consent media (screenshots, forms) are stored in a restricted asset folder and referenced by ID.

## 7. Rights requests workflow

1. Request arrives (privacy@, WhatsApp, platform) → logged as a takedown/complaint record the same day.
2. Item taken down from our page and scheduled posts immediately while examined.
3. Content head decides within 7 days; outcome recorded; requester informed.
4. Where consent was the basis and is withdrawn: stop further use, remove from archive index (rights_status = withdrawn), keep a minimal record of the withdrawal.
5. Journalistic retention of public-interest material about public officials is decided by the content head with the media lawyer's advice; the requester is told.

## 8. Breach response

Suspected unauthorised access to raw footage, consent media or advertiser data → founder and production desk informed within 24 hours; affected individuals informed where required under DPDP; Data Protection Board notification as applicable; record kept.

## 9. Processor list (to maintain)

Hosting · object storage/backups · Kannada TTS · AI image/video generation · email/WhatsApp notifications · accountant. Each under a written agreement covering confidentiality, instructions-only processing and deletion on termination.
