# Rescue The Generation (RTG) — Website & Digital Systems
## Project Documentation, Service Record & Payment Justification

| | |
|---|---|
| **Prepared for** | The Executive Committee, Rescue The Generation (Swedish org. nr 802538-0992; Ethiopia country office, Bole Subcity, Addis Ababa) |
| **Prepared at the request of** | Dr. Dawit and Mr. Teklina |
| **Prepared by** | Filmon Gidena, independent website & digital-systems developer |
| **Contact** | +251 982 155 737 · filmongidena@gmail.com |
| **Engagement period** | July 2026 – present |
| **Document version** | 1.0 · 31 July 2026 |

---

## 1. Purpose of this document

This document records (a) the digital work delivered to RTG to date, (b) the work remaining until project completion, (c) the agreed payment of **50,000 Ethiopian birr** and the basis on which that amount was set, and (d) the proposed continued role thereafter. It is intended for the Executive Committee's records, for review by any board member, and as supporting documentation for future audit or regulatory review of RTG's expenditures in Ethiopia.

## 2. Background

RTG's previous website (rtgeth.org) had not been updated since 2023. It contained a broken contact link pointing to a defunct hosting address, no way to donate, a volunteer page with no working form, and none of RTG's current programs (Afar digital classrooms, Debre Birhan University dignity support, youth sports development, health insurance for elderly and disabled residents of Addis Ababa, the single-mothers tailoring cooperative, or the Gamo landslide response). For an organization whose credibility with donors depends on showing current, documented work, the website was a liability.

RTG engaged the contractor to redesign and rebuild its entire digital presence, and subsequently to add the systems an NGO needs to operate it: online donations, and an administration panel so RTG staff can update the site themselves without a developer.

## 3. Work completed to date

### Phase 1 — Website redesign and rebuild (July 2026) ✔ Delivered

1. **Research & content recovery.** Full audit of the old website; recovery and rewriting of all organizational content (mission, governance, board biographies, program history); integration of RTG's current 2025–26 program information supplied by the team.
2. **Complete visual identity for the web**, designed around RTG's own motto ያገባኛል ("It concerns me"), with Ethiopian typographic elements (Ge'ez numerals, Amharic display type) and RTG's brand color. This is original custom design work, not a purchased template.
3. **A fully custom-built, modern website** (React) with professional-grade animation and interaction design, fast load times, dark/light modes, and full mobile support.
4. **Donor-trust features** modeled on international best practice (charity: water, MSF, GiveDirectly): an emergency-appeal banner (currently the Gamo landslide response), a transparent "where the money goes" statement, a donations FAQ, program metrics with dates, partner listing, and a structured bank-transfer guide with confirmation loop.
5. **Publication** of the site code to RTG's own repository (github.com/Phili-gidab/rtgeth) with free hosting configured (Vercel), so RTG carries no hosting cost for the public site during this phase.

### Phase 2 — Donations, CMS & infrastructure (July 2026) ✔ Delivered, awaiting credentials

6. **Online donation system via Chapa** (Ethiopian payment processor: cards, telebirr, CBE Birr, international cards). Implemented to production security standards: server-side payment verification, amount matching, signed webhook handling, and a donor thank-you/receipt page. *Awaiting only RTG's Chapa merchant account credentials to go live.*
7. **Content-management system (CMS)** at a protected `/admin` address: RTG staff can log in and edit **every section of the website** — headline texts, programs, impact numbers, photo gallery, board members, FAQ, partners, donation tiers, the emergency banner, and contact details — including photo uploads, without any technical knowledge. Includes a donations ledger (every online gift recorded with reference, donor, amount, status) and an inbox for membership/volunteer applications submitted through the site.
8. **Server and database software** (the system behind the CMS and donations), built deliberately so it can run either on cloud infrastructure or on ordinary cPanel web hosting — RTG is not locked into any provider.
9. **Infrastructure-as-code** (Terraform) for a low-cost cloud server (~USD 10/month class), prepared and validated, ready to deploy on RTG's decision.

## 4. Work remaining to completion

| # | Item | Depends on |
|---|---|---|
| 1 | Activate live donations | RTG completes Chapa business verification (checklist below) and provides the keys |
| 2 | Deploy server & database to production hosting | RTG's hosting decision (cloud vs cPanel) and account access |
| 3 | Point the rtgeth.org domain to the new site | Access to RTG's domain registrar |
| 4 | TLS certificate, launch checks, small live donation test | Items 1–3 |
| 5 | Admin training session for designated RTG staff (approx. 1 hour) + a one-page how-to guide | Scheduling |
| 6 | Handover of all credentials and accounts to RTG's designated custodian | Board designating the custodian |

On completion of item 6, RTG owns and controls every part of the system.

> **Documents RTG must gather for Chapa business verification** (per Chapa's compliance form):
> ① Articles of Association (founding statutes/bylaws); ② certificate or license from the government
> authority (the Ethiopian civil-society registration certificate); ③ a manager appointment or hiring
> letter for the person who will administer the account; ④ a dedicated contact person with authority
> to act for the organization, whose national ID exactly matches their legal name; ⑤ the office's full
> business address (region, kifle ketema, woreda, kebele, house no.); ⑥ RTG's bank account for
> settlement. The contact person should be an RTG officer rather than an external contractor, so that
> control of donation funds rests with the organization.

## 5. Payment terms

**Agreed compensation: 50,000 ETB (fifty thousand birr), one-time, covering all work in Sections 3 and 4.**

- **Initial payment:** 25,000 ETB (50%) upon the Committee's approval of this document.
- **Final payment:** 25,000 ETB (50%) upon project completion — all items in Section 4 done and handed over.
- The amount is a one-time project payment; no part of it is recurring.
- This engagement is priced as agreed between the parties; future work (Section 6) is scoped and priced separately.

Payments should be made by bank transfer with reference "Website project 2026" so each transaction is self-documenting in RTG's records.

## 6. Continued role after completion (proposed, separate terms)

The Committee has offered the contractor a continued role. Proposed scope, to be agreed separately and documented by a simple monthly statement of work:

- **Digital content & social media:** producing posts, program-story graphics and templates in the website's design language for RTG's channels (Facebook/Instagram/others), so RTG's public communication remains consistent with its new identity.
- **Website upkeep:** content refreshes RTG staff cannot do via the CMS, security updates, and the "proof ledger" discipline of keeping program pages dated and current.
- Compensation for this role is **not included** in the 50,000 ETB and should be agreed as either a modest monthly retainer or a formally minuted volunteer appointment with a defined title.

## 7. Ownership, accounts and recurring costs RTG should budget

**Ownership.** All code, designs, content and documentation belong to RTG. Everything lives in RTG's repository; nothing is licensed, rented, or dependent on the contractor's personal accounts after handover. Third-party photo used for the Gamo section is openly licensed (Wikimedia Commons, CC BY-SA 3.0, credited on the site).

**Accounts to be held by RTG** (custodian to be designated by the board): domain registrar (rtgeth.org), GitHub repository, hosting account, Chapa merchant account, CMS administrator login.

**Recurring third-party costs (paid by RTG directly to providers, not to the contractor):**

| Item | Approx. cost |
|---|---|
| Domain renewal (rtgeth.org) | ~USD 15–20 / year |
| Server hosting (cloud VM or cPanel plan) | ~USD 5–15 / month |
| Chapa transaction fees | ~2.85% per donation (per Chapa's published schedule — verify on signup) |
| Public website hosting (current) | Free tier |

## 8. Declarations

- The contractor has no conflict of interest with RTG board members and is not a related party.
- All credentials currently held by the contractor are held temporarily for development purposes and will be transferred at handover (Section 4, item 6).
- This document was prepared by the contractor and is submitted for the Committee's review, correction and approval; it becomes part of RTG's project record upon approval.

---

**For the contractor**

Name: ______________________  Signature: ______________________  Date: ____________

**For Rescue The Generation**

Name/Role: ______________________  Signature: ______________________  Date: ____________

Name/Role: ______________________  Signature: ______________________  Date: ____________

---

## Appendix A — Technical inventory (for technical or audit review)

| Component | Technology | Location |
|---|---|---|
| Public website | React 19 + Vite, GSAP animation, custom CSS design system | `/src` in repository; deployed via Vercel |
| CMS admin panel | Same application, protected `/admin` route, role-based JWT login | `/src/admin` |
| API server | Node.js (Express), portable to cPanel | `/server` |
| Database | MySQL 8 (content, donations ledger, form submissions, admin users) | schema at `/server/src/db/schema.sql` |
| Donations | Chapa hosted checkout; server-side initialize/verify/webhook with HMAC signature verification and amount matching | `/server/src/routes/chapa.js` |
| Infrastructure | Terraform for AWS Lightsail (nginx + Node + MariaDB), portable to cPanel by design | `/infra` |
| Project history | Every change timestamped and attributable | Git history of the repository |
