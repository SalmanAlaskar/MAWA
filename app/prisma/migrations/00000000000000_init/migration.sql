-- CreateEnum
CREATE TYPE "AccountRole" AS ENUM ('owner', 'smb_admin', 'platform_ops');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('pending', 'approved', 'rejected', 'more_info_needed', 'suspended');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('unverified', 'pending', 'verified', 'failed');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('draft', 'under_review', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('draft', 'pending_fal_license', 'under_review', 'live', 'suspended');

-- CreateEnum
CREATE TYPE "TransitType" AS ENUM ('train', 'metro', 'bus');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('owner', 'smb', 'property');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('pending', 'in_review', 'approved', 'rejected', 'expired', 'resubmission_required');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('requested', 'terms_reviewed', 'signed', 'ejar_registration', 'active', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "EjarStatus" AS ENUM ('not_submitted', 'submitted', 'registered', 'failed');

-- CreateEnum
CREATE TYPE "PayerType" AS ENUM ('smb', 'platform');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('rent', 'deposit', 'platform_fee', 'vat', 'insurance_premium');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'scheduled', 'paid', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('filed', 'evidence_collection', 'under_review', 'approved', 'rejected', 'paid_out');

-- CreateEnum
CREATE TYPE "FiledByRole" AS ENUM ('owner', 'smb_admin', 'platform_ops');

-- CreateEnum
CREATE TYPE "ReviewRole" AS ENUM ('owner', 'smb_admin');

-- CreateEnum
CREATE TYPE "FeatureFlagCategory" AS ENUM ('provider', 'product');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "role" "AccountRole" NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "fullName" TEXT NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'pending',
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'unverified',
    "nafathVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "crNumber" TEXT NOT NULL,
    "wathqVerifiedAt" TIMESTAMP(3),
    "taxId" TEXT,
    "status" "AccountStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "ownerAccountId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Riyadh',
    "nationalAddressCode" TEXT NOT NULL,
    "geoLat" DOUBLE PRECISION NOT NULL,
    "geoLng" DOUBLE PRECISION NOT NULL,
    "titleDeedRef" TEXT NOT NULL,
    "baladyPermitRef" TEXT,
    "status" "PropertyStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "beds" INTEGER NOT NULL,
    "privateBaths" INTEGER NOT NULL,
    "parkingSpots" INTEGER NOT NULL DEFAULT 0,
    "parkingCovered" BOOLEAN NOT NULL DEFAULT false,
    "furnished" BOOLEAN NOT NULL DEFAULT false,
    "sizeSqm" DOUBLE PRECISION NOT NULL,
    "maxOccupants" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listings" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "priceMonthly" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "falAdLicenseNo" TEXT,
    "availableFrom" TIMESTAMP(3) NOT NULL,
    "leaseTermMinMo" INTEGER NOT NULL DEFAULT 12,
    "status" "ListingStatus" NOT NULL DEFAULT 'draft',
    "sandbox" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amenities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_amenities" (
    "listingId" TEXT NOT NULL,
    "amenityId" TEXT NOT NULL,

    CONSTRAINT "listing_amenities_pkey" PRIMARY KEY ("listingId","amenityId")
);

-- CreateTable
CREATE TABLE "transit_stops" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "geoLat" DOUBLE PRECISION NOT NULL,
    "geoLng" DOUBLE PRECISION NOT NULL,
    "type" "TransitType" NOT NULL,

    CONSTRAINT "transit_stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_transit_distances" (
    "listingId" TEXT NOT NULL,
    "transitStopId" TEXT NOT NULL,
    "distanceM" INTEGER NOT NULL,
    "walkTimeMin" INTEGER NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_transit_distances_pkey" PRIMARY KEY ("listingId","transitStopId")
);

-- CreateTable
CREATE TABLE "compliance_rule_sets" (
    "id" TEXT NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'KSA',
    "actorType" "ActorType" NOT NULL,
    "requiredDocs" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_rule_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_checks" (
    "id" TEXT NOT NULL,
    "accountId" TEXT,
    "propertyId" TEXT,
    "docType" TEXT NOT NULL,
    "fileRef" TEXT,
    "status" "ComplianceStatus" NOT NULL DEFAULT 'pending',
    "reviewerId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "notes" TEXT,
    "verificationResult" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "smbCompanyId" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'requested',
    "leaseStart" TIMESTAMP(3) NOT NULL,
    "leaseEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "templateVersion" TEXT NOT NULL DEFAULT 'v1',
    "signedOwnerAt" TIMESTAMP(3),
    "signedSmbAt" TIMESTAMP(3),
    "ejarContractId" TEXT,
    "ejarStatus" "EjarStatus" NOT NULL DEFAULT 'not_submitted',
    "termsJson" JSONB NOT NULL,
    "sandbox" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "payer" "PayerType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "type" "PaymentType" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "zatcaInvoiceRef" TEXT,
    "sandbox" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guarantee_claims" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "filedById" TEXT,
    "filedByRole" "FiledByRole" NOT NULL,
    "reason" TEXT NOT NULL,
    "evidenceRefs" JSONB NOT NULL DEFAULT '[]',
    "status" "ClaimStatus" NOT NULL DEFAULT 'filed',
    "payoutAmount" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guarantee_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "fromRole" "ReviewRole" NOT NULL,
    "toRole" "ReviewRole" NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "FeatureFlagCategory" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_email_key" ON "accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "companies_accountId_key" ON "companies"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "companies_crNumber_key" ON "companies"("crNumber");

-- CreateIndex
CREATE UNIQUE INDEX "listings_unitId_key" ON "listings"("unitId");

-- CreateIndex
CREATE UNIQUE INDEX "amenities_name_key" ON "amenities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "compliance_rule_sets_region_actorType_key" ON "compliance_rule_sets"("region", "actorType");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_bookingId_key" ON "contracts"("bookingId");

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_ownerAccountId_fkey" FOREIGN KEY ("ownerAccountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_amenities" ADD CONSTRAINT "listing_amenities_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_amenities" ADD CONSTRAINT "listing_amenities_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "amenities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_transit_distances" ADD CONSTRAINT "listing_transit_distances_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_transit_distances" ADD CONSTRAINT "listing_transit_distances_transitStopId_fkey" FOREIGN KEY ("transitStopId") REFERENCES "transit_stops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_checks" ADD CONSTRAINT "compliance_checks_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_checks" ADD CONSTRAINT "compliance_checks_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_checks" ADD CONSTRAINT "compliance_checks_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_smbCompanyId_fkey" FOREIGN KEY ("smbCompanyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guarantee_claims" ADD CONSTRAINT "guarantee_claims_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guarantee_claims" ADD CONSTRAINT "guarantee_claims_filedById_fkey" FOREIGN KEY ("filedById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

