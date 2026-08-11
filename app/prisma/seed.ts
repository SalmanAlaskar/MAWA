/**
 * Illustrative KSA seed data, matching the approved mockup
 * (design/mockups.html) so the running app looks consistent with what
 * was designed: Al-Fanar Logistics LLC, Fahad Al-Otaibi, Nour Retail Group,
 * Sultan Al-Dossari, and properties across Al Yasmin / Al Malqa / Qurtubah /
 * Al Narjis / Al Olaya in Riyadh. Figures/names are illustrative only, per
 * SPEC.md's grounding note.
 *
 * Run with `npm run db:seed` against a running local Postgres (see README).
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding MAWA demo data...');

  // -------------------------------------------------------------------
  // Accounts
  // -------------------------------------------------------------------
  const fahad = await prisma.account.upsert({
    where: { email: 'fahad.alotaibi@example.com' },
    update: {},
    create: {
      id: 'seed-owner-fahad',
      role: 'owner',
      email: 'fahad.alotaibi@example.com',
      phone: '+966500000001',
      fullName: 'Fahad Al-Otaibi',
      status: 'approved',
      kycStatus: 'verified',
      nafathVerified: true,
      createdAt: new Date('2026-01-12'),
    },
  });

  const sultan = await prisma.account.upsert({
    where: { email: 'sultan.aldossari@example.com' },
    update: {},
    create: {
      id: 'seed-owner-sultan',
      role: 'owner',
      email: 'sultan.aldossari@example.com',
      phone: '+966500000002',
      fullName: 'Sultan Al-Dossari',
      status: 'suspended',
      kycStatus: 'failed',
      nafathVerified: false,
      createdAt: new Date('2026-06-28'),
    },
  });

  const alFanarContact = await prisma.account.upsert({
    where: { email: 'omar.alharbi@alfanar-logistics.example.com' },
    update: {},
    create: {
      id: 'seed-smb-alfanar',
      role: 'smb_admin',
      email: 'omar.alharbi@alfanar-logistics.example.com',
      phone: '+966500000003',
      fullName: 'Omar Al-Harbi',
      status: 'approved',
      kycStatus: 'verified',
      nafathVerified: true,
      createdAt: new Date('2026-03-03'),
    },
  });

  const nourContact = await prisma.account.upsert({
    where: { email: 'maha.alqahtani@nour-retail.example.com' },
    update: {},
    create: {
      id: 'seed-smb-nour',
      role: 'smb_admin',
      email: 'maha.alqahtani@nour-retail.example.com',
      phone: '+966500000004',
      fullName: 'Maha Al-Qahtani',
      status: 'approved',
      kycStatus: 'verified',
      nafathVerified: true,
      createdAt: new Date('2026-04-18'),
    },
  });

  await prisma.account.upsert({
    where: { email: 'lama.k@mawa.example.com' },
    update: {},
    create: {
      id: 'seed-ops-lama',
      role: 'platform_ops',
      email: 'lama.k@mawa.example.com',
      fullName: 'Lama K.',
      status: 'approved',
      kycStatus: 'verified',
      nafathVerified: true,
      createdAt: new Date('2025-11-01'),
    },
  });

  // -------------------------------------------------------------------
  // Companies
  // -------------------------------------------------------------------
  const alFanar = await prisma.company.upsert({
    where: { accountId: alFanarContact.id },
    update: {},
    create: {
      accountId: alFanarContact.id,
      legalName: 'Al-Fanar Logistics LLC',
      crNumber: '1010445872',
      wathqVerifiedAt: new Date('2026-08-09'),
      taxId: '311123456700003',
      status: 'approved',
    },
  });

  const nour = await prisma.company.upsert({
    where: { accountId: nourContact.id },
    update: {},
    create: {
      accountId: nourContact.id,
      legalName: 'Nour Retail Group',
      crNumber: '1010882231',
      wathqVerifiedAt: new Date('2026-08-07'),
      taxId: '311987654300003',
      status: 'approved',
    },
  });

  // -------------------------------------------------------------------
  // Amenities
  // -------------------------------------------------------------------
  const amenityNames = ['Elevator', 'Central AC', 'Furnished', "Maid's room", 'Building security', 'Gym'];
  const amenities: Record<string, string> = {};
  for (const name of amenityNames) {
    const a = await prisma.amenity.upsert({ where: { name }, update: {}, create: { name } });
    amenities[name] = a.id;
  }

  // -------------------------------------------------------------------
  // Transit stops
  // -------------------------------------------------------------------
  const anNarjisMetro = await prisma.transitStop.create({
    data: { name: 'An Narjis Metro Station', geoLat: 24.822, geoLng: 46.664, type: 'metro' },
  });
  const alMalqaMetro = await prisma.transitStop.create({
    data: { name: 'Al Malqa Metro Station', geoLat: 24.812, geoLng: 46.605, type: 'metro' },
  });

  // -------------------------------------------------------------------
  // Properties / units / listings — owned by Fahad
  // -------------------------------------------------------------------
  const yasminProp = await prisma.property.create({
    data: {
      ownerAccountId: fahad.id,
      address: 'Al Yasmin District, Building 12',
      district: 'Al Yasmin',
      city: 'Riyadh',
      nationalAddressCode: 'RRRD3312',
      geoLat: 24.8236,
      geoLng: 46.6636,
      titleDeedRef: 'TD-88213',
      baladyPermitRef: 'BLD-22910',
      status: 'approved',
      createdAt: new Date('2026-01-20'),
    },
  });
  const yasminUnit = await prisma.unit.create({
    data: {
      propertyId: yasminProp.id,
      beds: 3,
      privateBaths: 2,
      parkingSpots: 1,
      parkingCovered: true,
      furnished: true,
      sizeSqm: 148,
      maxOccupants: 6,
    },
  });
  const yasminListing = await prisma.listing.create({
    data: {
      unitId: yasminUnit.id,
      title: '3BR Apartment, Al Yasmin',
      priceMonthly: 4200,
      falAdLicenseNo: 'FAL-SANDBOX-000118',
      availableFrom: new Date('2026-10-01'),
      leaseTermMinMo: 12,
      status: 'live',
      sandbox: true,
      amenities: {
        create: ['Elevator', 'Central AC', 'Furnished', "Maid's room", 'Building security'].map((n) => ({
          amenity: { connect: { id: amenities[n] } },
        })),
      },
      transitDistances: {
        create: [{ transitStopId: anNarjisMetro.id, distanceM: 640, walkTimeMin: 8 }],
      },
    },
  });

  const malqaProp = await prisma.property.create({
    data: {
      ownerAccountId: fahad.id,
      address: 'Al Malqa District, Villa 4',
      district: 'Al Malqa',
      city: 'Riyadh',
      nationalAddressCode: 'RMLQ5521',
      geoLat: 24.812,
      geoLng: 46.601,
      titleDeedRef: 'TD-77104',
      baladyPermitRef: 'BLD-19042',
      status: 'approved',
      createdAt: new Date('2026-02-02'),
    },
  });
  const malqaUnit = await prisma.unit.create({
    data: {
      propertyId: malqaProp.id,
      beds: 3,
      privateBaths: 3,
      parkingSpots: 2,
      parkingCovered: true,
      furnished: false,
      sizeSqm: 175,
      maxOccupants: 6,
    },
  });
  const malqaListing = await prisma.listing.create({
    data: {
      unitId: malqaUnit.id,
      title: '3BR Duplex, Al Malqa',
      priceMonthly: 5100,
      falAdLicenseNo: 'FAL-SANDBOX-000204',
      availableFrom: new Date('2026-09-01'),
      leaseTermMinMo: 12,
      status: 'live',
      sandbox: true,
      amenities: {
        create: ['Elevator', 'Central AC', 'Building security'].map((n) => ({ amenity: { connect: { id: amenities[n] } } })),
      },
      transitDistances: {
        create: [{ transitStopId: alMalqaMetro.id, distanceM: 1100, walkTimeMin: 14 }],
      },
    },
  });

  const yasmin2Prop = await prisma.property.create({
    data: {
      ownerAccountId: fahad.id,
      address: 'Al Yasmin District, Building 7',
      district: 'Al Yasmin',
      city: 'Riyadh',
      nationalAddressCode: 'RRRD1187',
      geoLat: 24.826,
      geoLng: 46.667,
      titleDeedRef: 'TD-90310',
      baladyPermitRef: 'BLD-23871',
      status: 'approved',
      createdAt: new Date('2026-02-20'),
    },
  });
  const yasmin2Unit = await prisma.unit.create({
    data: {
      propertyId: yasmin2Prop.id,
      beds: 2,
      privateBaths: 2,
      parkingSpots: 1,
      parkingCovered: false,
      furnished: true,
      sizeSqm: 110,
      maxOccupants: 4,
    },
  });
  const yasmin2Listing = await prisma.listing.create({
    data: {
      unitId: yasmin2Unit.id,
      title: '2BR Apartment, Al Yasmin',
      priceMonthly: 3800,
      falAdLicenseNo: 'FAL-SANDBOX-000231',
      availableFrom: new Date('2026-09-15'),
      leaseTermMinMo: 12,
      status: 'live',
      sandbox: true,
      amenities: { create: ['Elevator', 'Furnished'].map((n) => ({ amenity: { connect: { id: amenities[n] } } })) },
      transitDistances: { create: [{ transitStopId: anNarjisMetro.id, distanceM: 1450, walkTimeMin: 18 }] },
    },
  });

  const qurtubahProp = await prisma.property.create({
    data: {
      ownerAccountId: fahad.id,
      address: 'Qurtubah District, Building 3',
      district: 'Qurtubah',
      city: 'Riyadh',
      nationalAddressCode: 'RQRT4402',
      geoLat: 24.774,
      geoLng: 46.749,
      titleDeedRef: 'TD-65310',
      baladyPermitRef: null,
      status: 'approved',
      createdAt: new Date('2026-07-10'),
    },
  });
  const qurtubahUnit = await prisma.unit.create({
    data: {
      propertyId: qurtubahProp.id,
      beds: 2,
      privateBaths: 2,
      parkingSpots: 1,
      parkingCovered: false,
      furnished: false,
      sizeSqm: 132,
      maxOccupants: 4,
    },
  });
  await prisma.listing.create({
    data: {
      unitId: qurtubahUnit.id,
      title: '2BR Apartment, Qurtubah',
      priceMonthly: 3100,
      falAdLicenseNo: null,
      availableFrom: new Date('2026-11-01'),
      leaseTermMinMo: 12,
      status: 'pending_fal_license',
      sandbox: true,
    },
  });

  const narjisProp = await prisma.property.create({
    data: {
      ownerAccountId: fahad.id,
      address: 'Al Narjis District, Villa 21',
      district: 'Al Narjis',
      city: 'Riyadh',
      nationalAddressCode: 'RNRJ7710',
      geoLat: 24.846,
      geoLng: 46.673,
      titleDeedRef: 'TD-54021',
      baladyPermitRef: null,
      status: 'under_review',
      createdAt: new Date('2026-08-01'),
    },
  });
  await prisma.unit.create({
    data: {
      propertyId: narjisProp.id,
      beds: 4,
      privateBaths: 3,
      parkingSpots: 2,
      parkingCovered: true,
      furnished: false,
      sizeSqm: 310,
      maxOccupants: 8,
    },
  });

  const olayaProp = await prisma.property.create({
    data: {
      ownerAccountId: fahad.id,
      address: 'Al Olaya District, Tower 2',
      district: 'Al Olaya',
      city: 'Riyadh',
      nationalAddressCode: 'ROLY2290',
      geoLat: 24.6941,
      geoLng: 46.6851,
      titleDeedRef: 'TD-11207',
      baladyPermitRef: null,
      status: 'draft',
      createdAt: new Date('2026-08-05'),
    },
  });
  await prisma.unit.create({
    data: {
      propertyId: olayaProp.id,
      beds: 0,
      privateBaths: 1,
      parkingSpots: 0,
      parkingCovered: false,
      furnished: true,
      sizeSqm: 45,
      maxOccupants: 1,
    },
  });

  // Second owner, in ops vetting queue with an ID mismatch.
  const sultanQurtubahProp = await prisma.property.create({
    data: {
      ownerAccountId: sultan.id,
      address: 'Qurtubah District, Building 9',
      district: 'Qurtubah',
      city: 'Riyadh',
      nationalAddressCode: 'RQRT9981',
      geoLat: 24.771,
      geoLng: 46.752,
      titleDeedRef: 'TD-30982',
      baladyPermitRef: null,
      status: 'under_review',
      createdAt: new Date('2026-08-06'),
    },
  });
  await prisma.unit.create({
    data: {
      propertyId: sultanQurtubahProp.id,
      beds: 3,
      privateBaths: 2,
      parkingSpots: 1,
      parkingCovered: false,
      furnished: false,
      sizeSqm: 140,
      maxOccupants: 5,
    },
  });

  // -------------------------------------------------------------------
  // Compliance rule sets (SPEC.md §4 — data, not hardcoded logic)
  // -------------------------------------------------------------------
  await prisma.complianceRuleSet.upsert({
    where: { region_actorType: { region: 'KSA', actorType: 'owner' } },
    update: {},
    create: {
      region: 'KSA',
      actorType: 'owner',
      requiredDocs: [
        { docType: 'national_id', label: 'National ID (Nafath)', expiryRequired: false },
        { docType: 'title_deed', label: 'Title deed', expiryRequired: false },
        { docType: 'balady_permit', label: 'Balady safety/occupancy permit', expiryRequired: true },
      ],
    },
  });
  await prisma.complianceRuleSet.upsert({
    where: { region_actorType: { region: 'KSA', actorType: 'smb' } },
    update: {},
    create: {
      region: 'KSA',
      actorType: 'smb',
      requiredDocs: [
        { docType: 'commercial_registration', label: 'Commercial Registration (Wathq)', expiryRequired: true },
        { docType: 'signatory_id', label: 'Authorized signatory ID (Nafath)', expiryRequired: false },
        { docType: 'tax_id', label: 'Tax ID (ZATCA)', expiryRequired: false },
        { docType: 'authorization_letter', label: 'Authorization letter', expiryRequired: false },
      ],
    },
  });
  await prisma.complianceRuleSet.upsert({
    where: { region_actorType: { region: 'KSA', actorType: 'property' } },
    update: {},
    create: {
      region: 'KSA',
      actorType: 'property',
      requiredDocs: [
        { docType: 'listing_photos', label: 'Listing photos', expiryRequired: false },
        { docType: 'safety_cert', label: 'Safety certificate', expiryRequired: true },
      ],
    },
  });

  // -------------------------------------------------------------------
  // Compliance checks — vetting queue (SPEC.md §4)
  // -------------------------------------------------------------------
  await prisma.complianceCheck.createMany({
    data: [
      // Al-Fanar Logistics LLC — fully verified (4/4)
      {
        accountId: alFanarContact.id,
        docType: 'commercial_registration',
        status: 'approved',
        reviewerId: 'seed-ops-lama',
        reviewedAt: new Date('2026-08-09T11:00:00'),
        verificationResult: {
          wathq: { crNumber: alFanar.crNumber, legalName: alFanar.legalName, status: 'Active', activity: 'Logistics & freight forwarding' },
        },
        createdAt: new Date('2026-08-09T09:00:00'),
      },
      {
        accountId: alFanarContact.id,
        docType: 'signatory_id',
        status: 'approved',
        reviewerId: 'seed-ops-lama',
        reviewedAt: new Date('2026-08-09T11:05:00'),
        verificationResult: { nafath: { verified: true } },
        createdAt: new Date('2026-08-09T09:00:00'),
      },
      {
        accountId: alFanarContact.id,
        docType: 'tax_id',
        status: 'approved',
        reviewerId: 'seed-ops-lama',
        reviewedAt: new Date('2026-08-09T11:10:00'),
        createdAt: new Date('2026-08-09T09:00:00'),
      },
      {
        accountId: alFanarContact.id,
        docType: 'authorization_letter',
        status: 'approved',
        reviewerId: 'seed-ops-lama',
        reviewedAt: new Date('2026-08-09T11:12:00'),
        createdAt: new Date('2026-08-09T09:00:00'),
      },
      // Fahad Al-Otaibi — Nafath pending (2/3)
      {
        accountId: fahad.id,
        docType: 'title_deed',
        status: 'approved',
        reviewerId: 'seed-ops-lama',
        reviewedAt: new Date('2026-08-08T10:00:00'),
        createdAt: new Date('2026-08-08T09:00:00'),
      },
      {
        accountId: fahad.id,
        docType: 'balady_permit',
        status: 'approved',
        reviewerId: 'seed-ops-lama',
        reviewedAt: new Date('2026-08-08T10:05:00'),
        createdAt: new Date('2026-08-08T09:00:00'),
      },
      {
        accountId: fahad.id,
        docType: 'national_id',
        status: 'pending',
        verificationResult: { nafath: { status: 'pending' } },
        createdAt: new Date('2026-08-08T09:00:00'),
      },
      // Nour Retail Group — fully verified (4/4)
      {
        accountId: nourContact.id,
        docType: 'commercial_registration',
        status: 'approved',
        reviewerId: 'seed-ops-lama',
        reviewedAt: new Date('2026-08-07T10:00:00'),
        verificationResult: {
          wathq: { crNumber: nour.crNumber, legalName: nour.legalName, status: 'Active', activity: 'Retail trade' },
        },
        createdAt: new Date('2026-08-07T09:00:00'),
      },
      {
        accountId: nourContact.id,
        docType: 'signatory_id',
        status: 'approved',
        reviewerId: 'seed-ops-lama',
        reviewedAt: new Date('2026-08-07T10:05:00'),
        verificationResult: { nafath: { verified: true } },
        createdAt: new Date('2026-08-07T09:00:00'),
      },
      {
        accountId: nourContact.id,
        docType: 'tax_id',
        status: 'approved',
        reviewerId: 'seed-ops-lama',
        reviewedAt: new Date('2026-08-07T10:10:00'),
        createdAt: new Date('2026-08-07T09:00:00'),
      },
      {
        accountId: nourContact.id,
        docType: 'authorization_letter',
        status: 'approved',
        reviewerId: 'seed-ops-lama',
        reviewedAt: new Date('2026-08-07T10:12:00'),
        createdAt: new Date('2026-08-07T09:00:00'),
      },
      // Sultan Al-Dossari — ID mismatch (3/3 submitted, one rejected)
      {
        accountId: sultan.id,
        docType: 'title_deed',
        status: 'approved',
        reviewerId: 'seed-ops-lama',
        reviewedAt: new Date('2026-08-06T14:00:00'),
        createdAt: new Date('2026-08-06T13:00:00'),
      },
      {
        accountId: sultan.id,
        docType: 'balady_permit',
        status: 'approved',
        reviewerId: 'seed-ops-lama',
        reviewedAt: new Date('2026-08-06T14:05:00'),
        createdAt: new Date('2026-08-06T13:00:00'),
      },
      {
        accountId: sultan.id,
        docType: 'national_id',
        status: 'rejected',
        reviewerId: 'seed-ops-lama',
        reviewedAt: new Date('2026-08-06T14:10:00'),
        notes: 'Name on title deed does not match Nafath identity record.',
        verificationResult: { nafath: { verified: false, reason: 'name_mismatch' } },
        createdAt: new Date('2026-08-06T13:00:00'),
      },
    ],
  });

  // -------------------------------------------------------------------
  // Booking / contract / payments — Al-Fanar renting the Al Yasmin unit
  // -------------------------------------------------------------------
  const booking1 = await prisma.booking.create({
    data: {
      listingId: yasminListing.id,
      smbCompanyId: alFanar.id,
      status: 'ejar_registration',
      leaseStart: new Date('2026-10-01'),
      leaseEnd: new Date('2027-09-30'),
      createdAt: new Date('2026-08-03'),
    },
  });

  await prisma.contract.create({
    data: {
      bookingId: booking1.id,
      templateVersion: 'v1',
      signedOwnerAt: new Date('2026-08-06T10:12:00'),
      signedSmbAt: new Date('2026-08-06T14:47:00'),
      ejarContractId: null,
      ejarStatus: 'submitted',
      termsJson: {
        rentMonthly: 4200,
        depositMonths: 1,
        leaseTermMonths: 12,
        damageLiability: 'Tenant liable up to deposit amount; excess covered by MAWA Guarantee.',
        guarantee: 'MAWA Guarantee — rent default and damage cover included.',
      },
      sandbox: true,
    },
  });

  await prisma.payment.createMany({
    data: [
      { bookingId: booking1.id, payer: 'smb', amount: 4200, type: 'deposit', status: 'paid', dueDate: new Date('2026-08-06'), paidAt: new Date('2026-08-06'), sandbox: true },
      { bookingId: booking1.id, payer: 'smb', amount: 4200, type: 'rent', status: 'pending', dueDate: new Date('2026-10-01'), sandbox: true },
      { bookingId: booking1.id, payer: 'smb', amount: 294, type: 'platform_fee', status: 'pending', dueDate: new Date('2026-10-01'), sandbox: true },
      { bookingId: booking1.id, payer: 'smb', amount: 44.1, type: 'vat', status: 'pending', dueDate: new Date('2026-10-01'), sandbox: true },
      { bookingId: booking1.id, payer: 'smb', amount: 4200, type: 'rent', status: 'scheduled', dueDate: new Date('2026-11-01'), sandbox: true },
      { bookingId: booking1.id, payer: 'smb', amount: 294, type: 'platform_fee', status: 'scheduled', dueDate: new Date('2026-11-01'), sandbox: true },
      { bookingId: booking1.id, payer: 'smb', amount: 44.1, type: 'vat', status: 'scheduled', dueDate: new Date('2026-11-01'), sandbox: true },
    ],
  });

  // A second, already-active booking (Nour Retail in the second Al Yasmin unit)
  // so the owner dashboard's occupancy numbers reflect more than one tenant.
  const booking2 = await prisma.booking.create({
    data: {
      listingId: yasmin2Listing.id,
      smbCompanyId: nour.id,
      status: 'active',
      leaseStart: new Date('2026-06-01'),
      leaseEnd: new Date('2027-05-31'),
      createdAt: new Date('2026-05-02'),
    },
  });
  await prisma.contract.create({
    data: {
      bookingId: booking2.id,
      templateVersion: 'v1',
      signedOwnerAt: new Date('2026-05-10T09:00:00'),
      signedSmbAt: new Date('2026-05-10T11:30:00'),
      ejarContractId: 'EJAR-SANDBOX-20260510',
      ejarStatus: 'registered',
      termsJson: { rentMonthly: 3800, depositMonths: 1, leaseTermMonths: 12 },
      sandbox: true,
    },
  });
  await prisma.payment.createMany({
    data: [
      { bookingId: booking2.id, payer: 'smb', amount: 3800, type: 'deposit', status: 'paid', dueDate: new Date('2026-05-10'), paidAt: new Date('2026-05-10'), sandbox: true },
      { bookingId: booking2.id, payer: 'smb', amount: 3800, type: 'rent', status: 'paid', dueDate: new Date('2026-08-01'), paidAt: new Date('2026-08-01'), sandbox: true },
    ],
  });

  const booking3 = await prisma.booking.create({
    data: {
      listingId: malqaListing.id,
      smbCompanyId: nour.id,
      status: 'active',
      leaseStart: new Date('2026-06-15'),
      leaseEnd: new Date('2027-06-14'),
      createdAt: new Date('2026-05-20'),
    },
  });
  await prisma.contract.create({
    data: {
      bookingId: booking3.id,
      templateVersion: 'v1',
      signedOwnerAt: new Date('2026-05-25T09:00:00'),
      signedSmbAt: new Date('2026-05-25T11:00:00'),
      ejarContractId: 'EJAR-SANDBOX-20260525',
      ejarStatus: 'registered',
      termsJson: { rentMonthly: 5100, depositMonths: 1, leaseTermMonths: 12 },
      sandbox: true,
    },
  });
  await prisma.payment.createMany({
    data: [
      { bookingId: booking3.id, payer: 'smb', amount: 5100, type: 'deposit', status: 'paid', dueDate: new Date('2026-05-25'), paidAt: new Date('2026-05-25'), sandbox: true },
      { bookingId: booking3.id, payer: 'smb', amount: 5100, type: 'rent', status: 'paid', dueDate: new Date('2026-08-01'), paidAt: new Date('2026-08-01'), sandbox: true },
    ],
  });

  // -------------------------------------------------------------------
  // Guarantee claims (SPEC.md §3.5, §3.7)
  // -------------------------------------------------------------------
  await prisma.guaranteeClaim.create({
    data: {
      bookingId: booking1.id,
      filedById: fahad.id,
      filedByRole: 'owner',
      reason: 'Rent default',
      status: 'under_review',
      payoutAmount: 4200,
      createdAt: new Date('2026-08-10'),
    },
  });
  await prisma.guaranteeClaim.create({
    data: {
      bookingId: booking2.id,
      filedById: nourContact.id,
      filedByRole: 'smb_admin',
      reason: 'Property damage',
      status: 'approved',
      payoutAmount: 6900,
      createdAt: new Date('2026-07-15'),
    },
  });

  // -------------------------------------------------------------------
  // Feature control panel (SPEC.md §12) — one row per provider concern
  // (§11) plus product-level toggles, matching design/mockups.html's
  // Administration screen exactly. Provider flags default off (sandbox);
  // flipping them here is operator-facing display state only — see the
  // FeatureFlag model comment in schema.prisma and src/lib/providers/guard.ts.
  // -------------------------------------------------------------------
  const featureFlags: Array<{
    key: string;
    label: string;
    description: string;
    category: 'provider' | 'product';
    enabled: boolean;
  }> = [
    {
      key: 'payments_live',
      label: 'Live payments (Tap / Moyasar)',
      description: 'Route booking payments through the live Tap/Moyasar payment provider instead of the mock payment simulator.',
      category: 'provider',
      enabled: false,
    },
    {
      key: 'ejar_live_registration',
      label: 'Live Ejar registration',
      description: 'Register signed contracts on the real Ejar platform instead of simulating the submitted → registered lifecycle.',
      category: 'provider',
      enabled: false,
    },
    {
      key: 'fal_live_licensing',
      label: 'Live Fal licensing',
      description: "Stamp listings with the platform's real Fal ad-license number instead of a sandbox placeholder.",
      category: 'provider',
      enabled: false,
    },
    {
      key: 'guarantee_fund_claims',
      label: 'Guarantee fund claims',
      description: 'Allow owners and SMBs to file guarantee fund claims from the Administration screen.',
      category: 'product',
      enabled: true,
    },
    {
      key: 'employee_shortlist_view',
      label: 'Employee shortlist view (Phase 2)',
      description: 'Expose the employee-facing shortlist/preference view described in SPEC.md §9 Phase 2.',
      category: 'product',
      enabled: false,
    },
  ];

  for (const flag of featureFlags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: {},
      create: { ...flag, updatedBy: 'seed-ops-lama' },
    });
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
