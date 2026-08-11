# MAWA (مأوى) — Product & Technical Spec

**Brand: MAWA in English, مأوى ("shelter/dwelling place") in Arabic.** Repository: [github.com/SalmanAlaskar/MAWA](https://github.com/SalmanAlaskar/MAWA).

**Target market: Kingdom of Saudi Arabia (KSA).** Regulatory and localization specifics below (§8) are load-bearing for this build, not cosmetic — in particular, real estate brokerage in KSA is a licensed activity, and rental contracts must be registered on a government platform to be legally enforceable. Both affect the core transaction flow, not just the UI.

## 1. What this is

A three-sided marketplace connecting:

1. **Property Owners** — list residential units for rent.
2. **SMBs (Business Clients)** — search, filter, and select housing for their employees.
3. **The Platform (Intermediary / "us")** — vets both sides, sets compliance rules, guarantees the transaction (insurance), and earns a fee from both owner and SMB on every match.

This is not a plain listings site — the platform's core value is **trust brokering**: it approves who's allowed on (owners and businesses), stands behind the deal financially, and takes a cut for that guarantee. That changes the data model, the state machine, and the ops workload versus a typical marketplace, and it's the main thing this spec is designed around.

## 2. Actors & responsibilities

| Actor | Provides | Gets |
|---|---|---|
| **Property Owner** | Unit listings, compliance documents (ownership/title, safety certs) | Vetted business tenants, guaranteed payment, damage/default protection |
| **SMB Admin** | Company registration/compliance docs, housing requirements, employee headcount | Vetted properties, guaranteed availability/condition, single invoice across all units |
| **Platform (us)** | Vetting workflow, matching/search, contract templating, insurance/guarantee fund or insurer partnership, dispute resolution | Fee from both sides (commission and/or subscription) |

Note: employees themselves are **not** platform users in v1 — the SMB admin books on their behalf. This can be added later (e.g., an employee view to browse a shortlist), but keeping it out of v1 avoids a third consumer-facing UI and identity/consent complexity before the core two-sided flow is proven.

## 3. Core flows

### 3.1 Owner onboarding & approval
1. Owner signs up, submits: identity, proof of ownership (title deed), property compliance docs (safety/fire cert, occupancy permit where applicable), bank details for payout.
2. Platform ops reviews → **Approved / Rejected / More Info Needed**.
3. Approved owner lists units (see §5 Data Model → `Property`/`Unit`).
4. Each **listing** also goes through a lighter automated + spot-manual compliance check (photos present, required fields filled, price within sane bounds) before it goes live.

### 3.2 SMB onboarding & approval
1. SMB admin signs up, submits: commercial registration, tax ID, authorized signatory ID, expected headcount/budget.
2. Platform ops reviews → **Approved / Rejected / More Info Needed**.
3. Approved SMB can search, shortlist, and request bookings.

### 3.3 Search & match
SMB admin filters live listings by:
- Price (per bed / per unit, monthly)
- Location (city/district, radius, map draw)
- Distance/time to nearest transit stop (train/metro/bus)
- Bed count, private-bathroom count
- Parking (count, covered/uncovered)
- Furnished/unfurnished, lease term, move-in date
- Building amenities (elevator, gym, etc.), max occupants per unit
- Owner rating / platform trust score

Results rank by relevance + a configurable weight per filter (e.g., an SMB that cares most about transit distance can weight it higher).

### 3.4 Booking / contract
1. SMB shortlists → requests booking for one or more units.
2. Platform generates a **standard contract** covering rent, deposit, term, damage liability, and the platform's guarantee terms.
3. Both parties e-sign, and the contract is **registered on Ejar** (REGA's mandatory rental-contract registration platform — see §10.2). An unregistered lease is not just a compliance gap in KSA; it's generally unenforceable and blocks the tenant from getting utility connections (Saudi Electricity Company requires an Ejar contract number for new service).
4. Platform collects payment from SMB (rent + platform fee + VAT + insurance premium if separate), holds/escrows, disburses to owner minus owner-side fee.
5. Recurring billing for the lease term; platform reconciles monthly.

### 3.5 Guarantee / insurance
Two viable models — pick one for v1, don't build both:
- **Platform-backed guarantee fund**: platform sets aside a % of fees into a reserve that pays out on owner default-of-payment or SMB damage-of-property claims, up to a cap.
- **Insurer partnership**: platform white-labels a real insurance product (rent-default cover for owners, damage/liability cover for SMBs) and passes through the premium.
Recommendation: start with the guarantee fund (faster to launch, no insurer negotiation/regulatory licensing dependency), and revisit an insurer partnership once claim-rate data exists to price it properly.

### 3.6 Fees
- **Owner side**: % commission per booking, deducted from payout (e.g., 8–12%).
- **SMB side**: % commission per booking and/or flat platform subscription for multi-unit/enterprise accounts (e.g., 5–8% + optional monthly seat fee for self-serve dashboards, reporting, multi-admin access).
- Fee % should be configurable per listing/segment, not hardcoded — ops will want to run promos or negotiate enterprise rates.
- **VAT**: residential rental itself is VAT-exempt in KSA, but the platform's brokerage/commission fee is a taxable service — ZATCA-compliant e-invoicing (Fatoora) is required on every fee charged, separate from the rent line.

### 3.7 Dispute resolution
Platform needs an internal case-management flow (not necessarily user-facing v1): flag → evidence collection (photos, contract terms) → ops decision → payout adjustment / claim against guarantee fund.

## 4. Compliance & vetting criteria (configurable rule set)

The platform should treat vetting rules as **data, not hardcoded logic** — ops will change document requirements per segment or as regulation evolves, without a code deploy. For KSA specifically, several checks should hit government verification APIs rather than accept self-uploaded documents at face value:

- **Property Owner**: national ID verified via **Nafath** (or Absher), title deed, Balady-issued safety/occupancy compliance where applicable.
- **SMB**: Commercial Registration (CR) verified live against **Wathq** (CR number → legal name/status/activity match), authorized signatory ID via Nafath.
- **Platform itself**: a REGA real estate brokerage license and a **Fal** advertising license are prerequisites to operate legally, not something to vet on others — see §10.1. This gates go-live, not a per-user check.

- `ComplianceRuleSet` per (country/region, actor type) → list of required document types + validity rules (e.g., expiry dates).
- `ComplianceCheck` records per submission: document, reviewer, status, timestamp, notes, and — where applicable — the external verification API response (Wathq/Nafath) it was checked against.
- Status states: `pending`, `in_review`, `approved`, `rejected`, `expired`, `resubmission_required`.

## 5. Data model (core entities)

```
Account            (id, role[owner|smb_admin|platform_ops], email, phone, status, kyc_status, nafath_verified)
Company             (id, account_id, legal_name, cr_number, wathq_verified_at, tax_id, status)
Property            (id, owner_account_id, address, national_address_code, geo_lat, geo_lng, title_deed_ref, balady_permit_ref, status)
Unit                (id, property_id, beds, private_baths, parking_spots, furnished, size_sqm)
Listing             (id, unit_id, price_monthly, currency[SAR], fal_ad_license_no, available_from, lease_term_min, status)
Amenity             (id, name)                       -- m2m via ListingAmenity
TransitStop         (id, name, geo_lat, geo_lng, type[train|metro|bus])
ListingTransitDistance (listing_id, transit_stop_id, distance_m, walk_time_min)  -- precomputed
ComplianceRuleSet   (id, region, actor_type, required_docs[])
ComplianceCheck     (id, account_id|property_id, doc_type, file_ref, status, reviewer_id, reviewed_at)
Booking             (id, listing_id, smb_company_id, status, lease_start, lease_end)
Contract            (id, booking_id, template_version, signed_owner_at, signed_smb_at, ejar_contract_id, ejar_status, terms_json)
Payment             (id, booking_id, payer, amount, type[rent|deposit|platform_fee|vat|insurance_premium], status, due_date, zatca_invoice_ref)
GuaranteeClaim      (id, booking_id, filed_by, reason, evidence_refs[], status, payout_amount)
Review              (id, booking_id, from_role, to_role, rating, comment)
```

`ListingTransitDistance` is precomputed (batch job against a transit-stops dataset) rather than computed live per search — live geo-distance-to-transit queries at search time don't scale past a small catalog.

## 6. Non-functional requirements

- **Security**: PII and legal documents (title deeds, IDs, tax docs) need encryption at rest, signed-URL access, and audit logging on every compliance-doc view.
- **Payments**: needs a PCI-compliant processor (Stripe/Checkout.com/local equivalent) — the platform should never store raw card data.
- **Search**: geo + faceted filtering → Postgres with PostGIS is sufficient at MVP scale; move to Elasticsearch/Meilisearch only if catalog size or filter complexity outgrows it.
- **Localization**: Arabic-first, RTL layout, with English as a secondary language — this is the default UX expectation for Saudi B2B platforms, not an afterthought to bolt on. Currency is SAR; addresses should capture the Saudi National Address format (short code + building number).
- **Data residency**: KSA's Personal Data Protection Law (PDPL, enforced by SDAIA) has data-localization implications for PII and government-verification data (Nafath/Wathq responses, ID documents). Confirm hosting region requirements before picking infrastructure — this can constrain cloud provider/region choice.
- **Auditability**: every compliance decision and payout needs an immutable audit trail — this is a trust-brokering platform, and disputes will require reconstructing "who approved what, when."

## 7. Recommended architecture (MVP)

- **Frontend**: Next.js (React) — one codebase, two role-gated dashboards (Owner, SMB Admin) + an internal ops/admin panel.
- **Backend**: Node.js/TypeScript API (NestJS or plain Express) — or Next.js API routes if keeping it monolithic for speed.
- **Database**: PostgreSQL + PostGIS extension (geo queries for location/transit-distance filters).
- **File storage**: S3-compatible object storage for compliance documents and listing photos, behind signed URLs.
- **Payments**: Stripe Connect's marketplace split-payment support is not reliably available for KSA-based platforms today. Researched the five common Saudi orchestrators against the actual requirement (split a payment between SMB payer and owner payee, minus platform fee, on a recurring monthly schedule, with mada support):
  - **Tap Payments** — strongest fit. Documented `destinations` API splits a charge across sub-merchant accounts with automatic commission routing, plus mada-specific recurring docs ("Mada Recurring").
  - **Moyasar** — close second. Dedicated "Platforms and Marketplaces" product with sub-merchant KYC/onboarding and scheduled payouts (the onboarding/KYC angle is useful here since owners need vetting anyway); best general developer experience of the five.
  - HyperPay has a named marketplace product ("Hypersplit") but thinner public technical docs; PayTabs' marketplace capability is unconfirmed beyond a third-party claim; Geidea shows no public evidence of split/sub-merchant settlement and is better suited to standard single-merchant billing.
  - **Open gap**: no provider's public docs confirm that a split payment can run on an *automated recurring schedule* (vs. split-at-checkout and recurring-charge being separate mechanisms) — this is the exact combination the monthly rent flow needs, and it must be confirmed directly with Tap's or Moyasar's solutions team before committing.
- **Auth**: role-based (owner / smb_admin / ops), with a distinct verified/unverified state gating what each role can do before compliance approval.
- **Background jobs**: queue (BullMQ/SQS) for transit-distance precomputation, recurring billing, document-expiry reminders.

This is a reasonable default, not a hard requirement — swap any piece for your existing stack.

## 8. KSA regulatory & market considerations

These are the pieces that specifically change because this launches in Saudi Arabia. Two of them (8.1, 8.2) are gating — they affect whether the platform can legally operate the way it's described, not just how it's built.

### 8.1 Real estate brokerage licensing (REGA / Fal) — in progress
**Resolved (structurally):** the platform itself will hold the REGA brokerage license — not a partner/aggregator-of-brokers model. The license application is currently in progress, not yet granted. This has two build implications while it's pending:
- **`Property Owner` accounts are individual/entity owners**, not third-party brokers — the platform is the single licensed intermediary between owner and SMB. No need to model a separate "broker" role.
- **Go-live is gated on license approval.** The platform cannot legally publish real estate ads or intermediate lease transactions until the REGA brokerage license and the **Fal** advertising license are both granted — every listing must carry a valid Fal ad-license number, which will be the platform's own once issued. Build can proceed in parallel, but launch planning (and any public listing activity, even a soft launch) should have a hard dependency on license issuance, not a target date.
- Track license status as a project milestone with its own owner — it's an external approval on the critical path, not an engineering task.

### 8.2 Ejar contract registration — gating on the booking flow
**Ejar** is REGA's mandatory platform for registering residential and commercial lease contracts. An unregistered contract is generally not legally enforceable in KSA and blocks utility hookups. This means the booking flow (§3.4) isn't complete without either:
- Direct API integration with Ejar (requires REGA partnership/approval), or
- A manual/semi-automated step where ops registers each signed contract on Ejar on behalf of both parties.
This should be scoped explicitly in MVP planning — it's not an optional nice-to-have integration, it's what makes the contract real.

### 8.3 Other verification & compliance touchpoints
- **Wathq**: live Commercial Registration lookup/verification for SMB onboarding (§4).
- **Nafath**: national identity verification/SSO — usable for both owner and SMB signatory identity checks, likely a better UX than manual ID upload.
- **Balady**: municipal system covering building safety/occupancy compliance — relevant to property-level compliance checks.
- **ZATCA**: VAT registration and e-invoicing (Fatoora) compliance on platform fee invoices (§3.6).
- **National Address**: capture the Saudi Post short-code address format on every property, not just lat/lng — SMB admins and government integrations will expect it.

### 8.4 Payments & language
- **mada** support is close to non-negotiable for a KSA B2B platform; see the payments note in §7.
- Arabic-first, RTL UI, per §6.

## 9. MVP scope vs. Phase 2

The REGA brokerage/Fal license is still pending (§8.1), so MVP is split into a **pre-license sandbox stage** and a **licensed public stage** — this lets engineering proceed now without waiting on an external approval, while making sure nothing that requires the license goes live before it's granted.

**MVP — Stage 0: Sandbox (pre-license)**
- Full build of onboarding, listing, search/filter, booking, and contract flows
- Owner and SMB accounts can be created and vetted; listings can be created and matched
- Listings are **not publicly advertised or bookable for real** — no live Fal ad-license number exists yet, so nothing in this stage can go out as a real, legally-binding rental ad or contract
- Usable for internal testing, demoing to design-partner owners/SMBs, and validating the vetting workflow end-to-end with real (or near-real) data
- Fal licensing, Ejar registration, and the payment orchestrator all run through their `Mock*` provider implementations (§11) — the full booking → contract → payment flow works end-to-end on fake-but-realistic data, nothing here is a legally binding ad, contract, or charge

**MVP — Stage 1: Licensed public launch** (gated on REGA brokerage license + Fal license issuance, and on each `Live*` provider being confirmed per §11.3)
- Toggle listings from sandbox to live: real Fal ad-license number attached, real Ejar contract registration on booking, real payment provider wired in
- Guarantee fund active (not full insurer integration)
- Fixed-but-configurable fee %, ZATCA-compliant invoicing live
- This is the actual go-live — no listing should be publicly bookable before this stage regardless of engineering readiness

**Phase 2**
- Employee-facing shortlist/preference view
- Insurer partnership integration
- Dynamic/negotiated pricing, enterprise SMB contracts
- Owner/SMB rating and trust-score-driven ranking
- Self-serve compliance re-verification workflows

## 10. Open questions to resolve before build

1. ~~REGA brokerage/Fal licensing structure~~ — resolved: platform holds the license directly (§8.1). Open sub-item: **expected license grant date**, since that's the hard gate on any real (non-sandbox) listing activity going live.
2. **Ejar integration path** (§8.2): direct REGA/Ejar API partnership vs. an ops-manual registration step for MVP — may be easier to pursue alongside the brokerage license application, if REGA bundles those conversations.
3. **Guarantee fund sizing**: what reserve % and payout cap makes the guarantee credible without the platform being under-capitalized?
4. **Fee structure specifics**: flat % vs. tiered by lease value vs. enterprise subscription, plus how ZATCA VAT is presented on the SMB invoice — needs a pricing model, not just a placeholder %.
5. **Manual vs. automated vetting**: how much of document review is ops-manual at launch vs. automated via Wathq/Nafath?
6. ~~Payment orchestrator shortlist~~ — narrowed to **Tap Payments** or **Moyasar** (§7). Remaining: confirm with either's solutions team whether split settlement can run on an automated recurring schedule, since that's undocumented publicly and is exactly what monthly rent collection needs.
7. **Data residency**: does PDPL require in-Kingdom hosting for this data set, and does that constrain infrastructure choice (§6)?

## 11. Mocking strategy: REGA/Fal/Ejar and payments, until they're real

Three external dependencies are pending and outside engineering's control: the REGA brokerage license, Fal ad-licensing, Ejar contract registration (§8.1–8.2), and the payment orchestrator's confirmed recurring+split behavior (§7, open question 6). None of that should block building the product. Each is wrapped behind an interface with a mock implementation now and a live one swapped in later — same pattern as Stage 0 sandbox mode in §9, made explicit as an architecture decision rather than left implicit.

### 11.1 Provider interfaces, not hard dependencies
Business logic (booking flow, contract flow, payout flow) calls an interface, never the external API directly. Swapping mock → live is a config/environment change, not a rewrite of booking/contract/payment logic.

- **`LicenseRegistryProvider`** — issues/validates Fal ad-license numbers and platform brokerage status.
  - `MockLicenseRegistryProvider`: stamps every approved listing with a clearly-fake number (e.g. `FAL-SANDBOX-000123`) and reports platform license status as "pending."
  - `LiveLicenseRegistryProvider`: wraps the real REGA/Fal integration once the license is granted.
- **`ContractRegistrationProvider`** — registers signed leases on Ejar.
  - `MockContractRegistrationProvider`: simulates the real lifecycle (`submitted` → delay → `registered`, with a fake Ejar reference), so the booking stepper (§3.4) can be built and demoed end-to-end today.
  - `LiveContractRegistrationProvider`: wraps the real Ejar API once REGA/Ejar access exists.
- **`PaymentProvider`** — collects from the SMB, splits rent/fee/VAT, disburses to the owner, handles recurring monthly billing.
  - `MockPaymentProvider`: simulates charge creation, the fee/VAT split calculation, recurring monthly triggering, and success/failure callbacks — enough to build and demo the full booking → payment → payout flow before Tap/Moyasar's recurring+split combination is confirmed.
  - `LivePaymentProvider`: wraps Tap or Moyasar once that open question is resolved.

### 11.2 What stays real even while mocked
Vetting rules, the data model, contract terms, and fee/VAT calculation logic are built against real business rules throughout — only the external license/registration/payment *calls* are faked. That's what makes this a genuine dry run rather than a disposable prototype: when a `Live*` provider is swapped in, nothing about the surrounding workflow needs to change.

### 11.3 Guardrails (so a mock is never mistaken for the real thing)
- Every sandbox-generated record — mock Fal number, mock Ejar reference, mock payment/payout — carries a `sandbox: true` flag in the data model and a persistent banner in the UI. A mock listing must never be visually indistinguishable from a real, legally-binding one.
- Going live is not one switch. Swap in `Live*` providers independently as each real integration is confirmed — e.g. payments can go live before Ejar access does, or vice versa — rather than requiring all three simultaneously.
- Enforce with an environment check, not convention: no `Mock*` provider should be constructible in a production environment once its corresponding `Live*` provider exists for that concern.

## 12. Feature control panel

Ops needs to turn platform capabilities on and off without a redeploy — which provider (mock vs. live) is active per concern, and which product features are exposed — from the Administration screen (§9), not from environment variables ops can't touch in production.

- **`FeatureFlag`** table: `key` (e.g. `payments_live`, `ejar_live_registration`, `fal_live_licensing`, `guarantee_fund_claims`, `employee_shortlist_view`), `label`, `description`, `category` (`Provider` | `Product`), `enabled`, `updatedBy`, `updatedAt`. Seeded with one row per provider concern (§11) plus product-level toggles (e.g. hide/show the Phase 2 employee shortlist view from §9 before it's ready).
- The control panel can *flip a flag*, but flipping `payments_live` to on does not bypass the §11.3 guardrail — the backend still refuses to construct a `Live*` provider if its real credentials/license aren't actually configured, and surfaces that as a clear error in the panel rather than silently allowing an unsafe half-configured state. The flag is the operator-facing switch; the environment-level guard underneath it is what actually keeps sandbox and production honest.
- Every flag change is audit-logged (who, what, when) — this is the same trust-brokering rationale as §6's audit requirement: a dispute may eventually turn on "was live payment collection actually on when this booking was made."
