import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// ─── Config ──────────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes('--dry-run');
const WRITE = process.argv.includes('--write');

if (!DRY_RUN && !WRITE) {
  console.log('Usage: node scripts/seed-new-products.mjs [--dry-run | --write]');
  process.exit(0);
}

// ─── Supabase Client ─────────────────────────────────────────────────────────

const envContent = readFileSync('.env.local', 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(name) {
  return name.toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[.]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─── Product Definitions ─────────────────────────────────────────────────────
// Each product: { name, normalized_category, tagline, industries: [{ slug, bts, pos, specific }] }
// bts = business_type_slugs, pos = market_position, specific = industry_specific

const PRODUCTS = [
  // ═══ HEALTHCARE ═══════════════════════════════════════════════════════════
  // Practice Management / EHR / EMR
  { name: 'Dentrix', normalized_category: 'Healthcare IT', tagline: 'Dental practice management software by Henry Schein',
    industries: [{ slug: 'healthcare', bts: ['dental-office'], pos: 'leader', specific: true }] },
  { name: 'Eaglesoft', normalized_category: 'Healthcare IT', tagline: 'Dental practice management and imaging software',
    industries: [{ slug: 'healthcare', bts: ['dental-office'], pos: 'leader', specific: true }] },
  { name: 'Open Dental', normalized_category: 'Healthcare IT', tagline: 'Open-source dental practice management software',
    industries: [{ slug: 'healthcare', bts: ['dental-office'], pos: 'challenger', specific: true }] },
  { name: 'Curve Dental', normalized_category: 'Healthcare IT', tagline: 'Cloud-based dental practice management',
    industries: [{ slug: 'healthcare', bts: ['dental-office'], pos: 'challenger', specific: true }] },
  { name: 'Denticon', normalized_category: 'Healthcare IT', tagline: 'Cloud dental software for DSOs and group practices',
    industries: [{ slug: 'healthcare', bts: ['dental-office'], pos: 'niche', specific: true }] },
  { name: 'PatientNow', normalized_category: 'Healthcare IT', tagline: 'Practice management for plastic surgery and aesthetics',
    industries: [{ slug: 'healthcare', bts: ['plastic-surgery-clinic'], pos: 'leader', specific: true }] },
  { name: 'Nextech', normalized_category: 'Healthcare IT', tagline: 'EHR and practice management for specialty physicians',
    industries: [{ slug: 'healthcare', bts: ['plastic-surgery-clinic'], pos: 'leader', specific: true }] },
  { name: 'Symplast', normalized_category: 'Healthcare IT', tagline: 'Mobile-first plastic surgery practice management',
    industries: [{ slug: 'healthcare', bts: ['plastic-surgery-clinic'], pos: 'challenger', specific: true }] },
  { name: 'WebPT', normalized_category: 'Healthcare IT', tagline: 'Physical therapy EMR and practice management platform',
    industries: [{ slug: 'healthcare', bts: ['physical-therapy'], pos: 'leader', specific: true }] },
  { name: 'TheraOffice', normalized_category: 'Healthcare IT', tagline: 'Rehab therapy practice management software',
    industries: [{ slug: 'healthcare', bts: ['physical-therapy'], pos: 'challenger', specific: true }] },
  { name: 'Prompt EMR', normalized_category: 'Healthcare IT', tagline: 'EMR built for outpatient rehab therapy',
    industries: [{ slug: 'healthcare', bts: ['physical-therapy'], pos: 'challenger', specific: true }] },
  { name: 'HENO', normalized_category: 'Healthcare IT', tagline: 'Physical therapy documentation and billing',
    industries: [{ slug: 'healthcare', bts: ['physical-therapy'], pos: 'niche', specific: true }] },
  { name: 'eVetPractice', normalized_category: 'Healthcare IT', tagline: 'Cloud-based veterinary practice management',
    industries: [{ slug: 'healthcare', bts: ['veterinary'], pos: 'challenger', specific: true }] },
  { name: 'Cornerstone', normalized_category: 'Healthcare IT', tagline: 'Veterinary practice management by IDEXX',
    industries: [{ slug: 'healthcare', bts: ['veterinary'], pos: 'leader', specific: true }] },
  { name: 'Avimark', normalized_category: 'Healthcare IT', tagline: 'Veterinary practice management by Covetrus',
    industries: [{ slug: 'healthcare', bts: ['veterinary'], pos: 'leader', specific: true }] },
  { name: 'Shepherd Veterinary Software', normalized_category: 'Healthcare IT', tagline: 'Modern cloud veterinary practice management',
    industries: [{ slug: 'healthcare', bts: ['veterinary'], pos: 'niche', specific: true }] },
  { name: 'Rhapsody', normalized_category: 'Healthcare IT', tagline: 'Veterinary management software formerly known as NaVetor',
    industries: [{ slug: 'healthcare', bts: ['veterinary'], pos: 'niche', specific: true }] },
  // Healthcare CRM
  { name: 'DrChrono', normalized_category: 'CRM', tagline: 'EHR and medical billing platform for healthcare practices',
    industries: [{ slug: 'healthcare', bts: [], pos: 'challenger', specific: true }] },
  { name: 'Solutionreach', normalized_category: 'CRM', tagline: 'Patient relationship management and communication platform',
    industries: [{ slug: 'healthcare', bts: [], pos: 'challenger', specific: true }] },
  { name: 'Demandforce', normalized_category: 'CRM', tagline: 'Patient communication and reputation management',
    industries: [{ slug: 'healthcare', bts: [], pos: 'challenger', specific: true }] },
  // Healthcare Scheduling
  { name: 'Zocdoc', normalized_category: 'Scheduling & Booking', tagline: 'Online doctor appointment booking marketplace',
    industries: [{ slug: 'healthcare', bts: [], pos: 'leader', specific: true }] },
  { name: 'LocalMed', normalized_category: 'Scheduling & Booking', tagline: 'Real-time online scheduling for dental practices',
    industries: [{ slug: 'healthcare', bts: ['dental-office'], pos: 'challenger', specific: true }] },
  { name: 'NexHealth', normalized_category: 'Scheduling & Booking', tagline: 'Patient experience platform with online booking',
    industries: [{ slug: 'healthcare', bts: [], pos: 'challenger', specific: true }] },
  { name: 'Klara', normalized_category: 'Scheduling & Booking', tagline: 'Patient communication and scheduling platform',
    industries: [{ slug: 'healthcare', bts: [], pos: 'challenger', specific: true }] },
  // Healthcare Billing
  { name: 'Tebra', normalized_category: 'Healthcare IT', tagline: 'Practice management and medical billing platform (formerly Kareo)',
    industries: [{ slug: 'healthcare', bts: [], pos: 'leader', specific: true }] },
  { name: 'AdvancedMD', normalized_category: 'Healthcare IT', tagline: 'Cloud medical office software with EHR and billing',
    industries: [{ slug: 'healthcare', bts: [], pos: 'leader', specific: true }] },
  { name: 'CollaborateMD', normalized_category: 'Healthcare IT', tagline: 'Medical billing and practice management software',
    industries: [{ slug: 'healthcare', bts: [], pos: 'challenger', specific: true }] },
  { name: 'athenahealth', normalized_category: 'Healthcare IT', tagline: 'Cloud-based EHR, billing, and patient engagement',
    industries: [{ slug: 'healthcare', bts: [], pos: 'leader', specific: true }] },
  // Patient Engagement
  { name: 'Weave', normalized_category: 'Healthcare IT', tagline: 'Patient communication and engagement platform',
    industries: [{ slug: 'healthcare', bts: [], pos: 'leader', specific: true }] },
  { name: 'RevenueWell', normalized_category: 'Healthcare IT', tagline: 'Dental patient marketing and communication',
    industries: [{ slug: 'healthcare', bts: ['dental-office'], pos: 'leader', specific: true }] },
  { name: 'Lighthouse 360', normalized_category: 'Healthcare IT', tagline: 'Automated patient communication for dental practices',
    industries: [{ slug: 'healthcare', bts: ['dental-office'], pos: 'challenger', specific: true }] },
  // Telehealth
  { name: 'Doxy.me', normalized_category: 'Healthcare IT', tagline: 'Simple and free telemedicine solution for clinicians',
    industries: [{ slug: 'healthcare', bts: [], pos: 'leader', specific: true }] },
  { name: 'Zoom for Healthcare', normalized_category: 'Healthcare IT', tagline: 'HIPAA-compliant video conferencing for healthcare',
    industries: [{ slug: 'healthcare', bts: [], pos: 'leader', specific: false }] },
  { name: 'SimplePractice', normalized_category: 'Healthcare IT', tagline: 'Practice management for therapists and health practitioners',
    industries: [{ slug: 'healthcare', bts: ['physical-therapy'], pos: 'challenger', specific: true }] },
  { name: 'TheraNest', normalized_category: 'Healthcare IT', tagline: 'Practice management for mental health professionals',
    industries: [{ slug: 'healthcare', bts: [], pos: 'challenger', specific: true }] },

  // ═══ FINANCIAL SERVICES ═══════════════════════════════════════════════════
  // CRM
  { name: 'Wealthbox', normalized_category: 'CRM', tagline: 'CRM designed for financial advisors',
    industries: [{ slug: 'financial-services', bts: ['financial-advisor'], pos: 'leader', specific: true }] },
  { name: 'Redtail CRM', normalized_category: 'CRM', tagline: 'CRM and client management for financial advisors',
    industries: [{ slug: 'financial-services', bts: ['financial-advisor'], pos: 'leader', specific: true }] },
  { name: 'AgencyZoom', normalized_category: 'CRM', tagline: 'Insurance agency management and automation platform',
    industries: [{ slug: 'financial-services', bts: ['insurance-agency'], pos: 'leader', specific: true }] },
  { name: 'HawkSoft', normalized_category: 'CRM', tagline: 'Agency management system for insurance professionals',
    industries: [{ slug: 'financial-services', bts: ['insurance-agency'], pos: 'challenger', specific: true }] },
  { name: 'Velocify', normalized_category: 'CRM', tagline: 'Lead management and sales automation for mortgage',
    industries: [{ slug: 'financial-services', bts: ['mortgage-broker'], pos: 'leader', specific: true }] },
  { name: 'Jungo', normalized_category: 'CRM', tagline: 'Salesforce-based CRM for mortgage professionals',
    industries: [{ slug: 'financial-services', bts: ['mortgage-broker'], pos: 'challenger', specific: true }] },
  // Financial Planning
  { name: 'eMoney Advisor', normalized_category: 'Financial Management', tagline: 'Financial planning and wealth management platform',
    industries: [{ slug: 'financial-services', bts: ['financial-advisor'], pos: 'leader', specific: true }] },
  { name: 'MoneyGuidePro', normalized_category: 'Financial Management', tagline: 'Goal-based financial planning software',
    industries: [{ slug: 'financial-services', bts: ['financial-advisor'], pos: 'leader', specific: true }] },
  { name: 'RightCapital', normalized_category: 'Financial Management', tagline: 'Next-gen financial planning for advisors',
    industries: [{ slug: 'financial-services', bts: ['financial-advisor'], pos: 'challenger', specific: true }] },
  { name: 'Orion Portfolio Solutions', normalized_category: 'Financial Management', tagline: 'Portfolio management and reporting for advisors',
    industries: [{ slug: 'financial-services', bts: ['financial-advisor'], pos: 'leader', specific: true }] },
  { name: 'Black Diamond', normalized_category: 'Financial Management', tagline: 'Wealth management platform and portfolio reporting',
    industries: [{ slug: 'financial-services', bts: ['financial-advisor'], pos: 'leader', specific: true }] },
  { name: 'Nitrogen', normalized_category: 'Financial Management', tagline: 'Risk assessment and portfolio analytics (formerly Riskalyze)',
    industries: [{ slug: 'financial-services', bts: ['financial-advisor'], pos: 'challenger', specific: true }] },
  { name: 'Morningstar Office', normalized_category: 'Financial Management', tagline: 'Investment research and portfolio management',
    industries: [{ slug: 'financial-services', bts: ['financial-advisor'], pos: 'leader', specific: true }] },
  // Accounting & Tax
  { name: 'Lacerte', normalized_category: 'Accounting Software', tagline: 'Professional tax preparation software by Intuit',
    industries: [{ slug: 'financial-services', bts: ['accounting-firm'], pos: 'leader', specific: true }] },
  { name: 'ProConnect Tax', normalized_category: 'Accounting Software', tagline: 'Cloud-based professional tax software by Intuit',
    industries: [{ slug: 'financial-services', bts: ['accounting-firm'], pos: 'leader', specific: true }] },
  { name: 'Drake Tax', normalized_category: 'Accounting Software', tagline: 'Tax preparation software for accounting professionals',
    industries: [{ slug: 'financial-services', bts: ['accounting-firm'], pos: 'challenger', specific: true }] },
  { name: 'UltraTax CS', normalized_category: 'Accounting Software', tagline: 'Professional tax software by Thomson Reuters',
    industries: [{ slug: 'financial-services', bts: ['accounting-firm'], pos: 'leader', specific: true }] },
  { name: 'CCH Axcess', normalized_category: 'Accounting Software', tagline: 'Cloud tax and accounting platform by Wolters Kluwer',
    industries: [{ slug: 'financial-services', bts: ['accounting-firm'], pos: 'leader', specific: true }] },
  // Financial Practice Management
  { name: 'Canopy', normalized_category: 'Accounting Software', tagline: 'Practice management for accounting firms',
    industries: [{ slug: 'financial-services', bts: ['accounting-firm'], pos: 'challenger', specific: true }] },
  { name: 'Karbon', normalized_category: 'Accounting Software', tagline: 'Collaborative workflow and practice management for accountants',
    industries: [{ slug: 'financial-services', bts: ['accounting-firm'], pos: 'challenger', specific: true }] },
  { name: 'TaxDome', normalized_category: 'Accounting Software', tagline: 'All-in-one practice management for tax professionals',
    industries: [{ slug: 'financial-services', bts: ['accounting-firm'], pos: 'challenger', specific: true }] },
  { name: 'Jetpack Workflow', normalized_category: 'Accounting Software', tagline: 'Workflow management for accounting firms',
    industries: [{ slug: 'financial-services', bts: ['accounting-firm'], pos: 'niche', specific: true }] },
  { name: 'Financial Cents', normalized_category: 'Accounting Software', tagline: 'Practice management for small accounting firms',
    industries: [{ slug: 'financial-services', bts: ['accounting-firm'], pos: 'niche', specific: true }] },
  // Insurance Agency Management
  { name: 'Applied Epic', normalized_category: 'Financial Management', tagline: 'Agency management system for insurance brokers',
    industries: [{ slug: 'financial-services', bts: ['insurance-agency'], pos: 'leader', specific: true }] },
  { name: 'AMS360', normalized_category: 'Financial Management', tagline: 'Insurance agency management by Vertafore',
    industries: [{ slug: 'financial-services', bts: ['insurance-agency'], pos: 'leader', specific: true }] },
  { name: 'EZLynx', normalized_category: 'Financial Management', tagline: 'Insurance agency rating and management platform',
    industries: [{ slug: 'financial-services', bts: ['insurance-agency'], pos: 'challenger', specific: true }] },
  { name: 'NowCerts', normalized_category: 'Financial Management', tagline: 'Cloud insurance agency management system',
    industries: [{ slug: 'financial-services', bts: ['insurance-agency'], pos: 'niche', specific: true }] },
  { name: 'AgencyBloc', normalized_category: 'Financial Management', tagline: 'Agency management for life and health insurance',
    industries: [{ slug: 'financial-services', bts: ['insurance-agency'], pos: 'niche', specific: true }] },
  // Mortgage Origination
  { name: 'Encompass', normalized_category: 'Financial Management', tagline: 'Mortgage origination platform by ICE Mortgage Technology',
    industries: [{ slug: 'financial-services', bts: ['mortgage-broker'], pos: 'leader', specific: true }] },
  { name: 'Byte Software', normalized_category: 'Financial Management', tagline: 'Loan origination software for mortgage lenders',
    industries: [{ slug: 'financial-services', bts: ['mortgage-broker'], pos: 'challenger', specific: true }] },
  { name: 'LoanPro', normalized_category: 'Financial Management', tagline: 'Modern loan management and servicing platform',
    industries: [{ slug: 'financial-services', bts: ['mortgage-broker'], pos: 'challenger', specific: true }] },
  { name: 'Calyx Point', normalized_category: 'Financial Management', tagline: 'Loan origination software for mortgage professionals',
    industries: [{ slug: 'financial-services', bts: ['mortgage-broker'], pos: 'challenger', specific: true }] },

  // ═══ LEGAL ════════════════════════════════════════════════════════════════
  // Practice Management
  { name: 'Clio', normalized_category: 'Legal Practice Management', tagline: 'Cloud-based legal practice management platform',
    industries: [{ slug: 'legal', bts: [], pos: 'leader', specific: true }] },
  { name: 'MyCase', normalized_category: 'Legal Practice Management', tagline: 'Legal practice management and client communication',
    industries: [{ slug: 'legal', bts: [], pos: 'leader', specific: true }] },
  { name: 'PracticePanther', normalized_category: 'Legal Practice Management', tagline: 'Legal practice management software for law firms',
    industries: [{ slug: 'legal', bts: [], pos: 'challenger', specific: true }] },
  { name: 'Smokeball', normalized_category: 'Legal Practice Management', tagline: 'Legal practice management with automatic time tracking',
    industries: [{ slug: 'legal', bts: [], pos: 'challenger', specific: true }] },
  { name: 'CosmoLex', normalized_category: 'Legal Practice Management', tagline: 'All-in-one legal practice management and accounting',
    industries: [{ slug: 'legal', bts: [], pos: 'challenger', specific: true }] },
  { name: 'LEAP', normalized_category: 'Legal Practice Management', tagline: 'Legal practice productivity solution',
    industries: [{ slug: 'legal', bts: [], pos: 'challenger', specific: true }] },
  { name: 'Filevine', normalized_category: 'Legal Practice Management', tagline: 'Legal work platform for case and matter management',
    industries: [{ slug: 'legal', bts: [], pos: 'challenger', specific: true }] },
  { name: 'Rocket Matter', normalized_category: 'Legal Practice Management', tagline: 'Cloud legal practice management for small firms',
    industries: [{ slug: 'legal', bts: ['solo-attorney'], pos: 'challenger', specific: true }] },
  { name: 'AbacusLaw', normalized_category: 'Legal Practice Management', tagline: 'Legal practice management and case tracking',
    industries: [{ slug: 'legal', bts: [], pos: 'niche', specific: true }] },
  { name: 'PCLaw', normalized_category: 'Legal Practice Management', tagline: 'Legal accounting and practice management software',
    industries: [{ slug: 'legal', bts: [], pos: 'niche', specific: true }] },
  // Legal CRM
  { name: 'Lawmatics', normalized_category: 'CRM', tagline: 'Legal CRM and client intake automation',
    industries: [{ slug: 'legal', bts: [], pos: 'leader', specific: true }] },
  { name: 'Clio Grow', normalized_category: 'CRM', tagline: 'Legal client intake and CRM (formerly Lexicata)',
    industries: [{ slug: 'legal', bts: [], pos: 'leader', specific: true }] },
  { name: 'Intake.me', normalized_category: 'CRM', tagline: 'Legal client intake management platform',
    industries: [{ slug: 'legal', bts: [], pos: 'niche', specific: true }] },
  // Legal Time Tracking
  { name: 'TimeSolv', normalized_category: 'Time Tracking & Productivity', tagline: 'Time and billing for legal professionals',
    industries: [{ slug: 'legal', bts: [], pos: 'challenger', specific: true }] },
  { name: 'Bill4Time', normalized_category: 'Time Tracking & Productivity', tagline: 'Time billing software for attorneys',
    industries: [{ slug: 'legal', bts: [], pos: 'challenger', specific: true }] },
  { name: 'Tabs3', normalized_category: 'Time Tracking & Productivity', tagline: 'Legal billing and practice management software',
    industries: [{ slug: 'legal', bts: [], pos: 'niche', specific: true }] },
  { name: 'LawPay', normalized_category: 'Time Tracking & Productivity', tagline: 'Legal payment processing by AffiniPay',
    industries: [{ slug: 'legal', bts: [], pos: 'leader', specific: true }] },
  // Document Management
  { name: 'NetDocuments', normalized_category: 'Document Management', tagline: 'Cloud document management for law firms',
    industries: [{ slug: 'legal', bts: ['law-firm'], pos: 'leader', specific: true }] },
  { name: 'iManage', normalized_category: 'Document Management', tagline: 'Document and email management for legal professionals',
    industries: [{ slug: 'legal', bts: ['law-firm'], pos: 'leader', specific: true }] },
  { name: 'Worldox', normalized_category: 'Document Management', tagline: 'Document management system for law firms',
    industries: [{ slug: 'legal', bts: ['law-firm'], pos: 'challenger', specific: true }] },
  // Legal Research
  { name: 'Westlaw', normalized_category: 'Legal Tech', tagline: 'Legal research platform by Thomson Reuters',
    industries: [{ slug: 'legal', bts: [], pos: 'leader', specific: true }] },
  { name: 'LexisNexis', normalized_category: 'Legal Tech', tagline: 'Legal research and business intelligence platform',
    industries: [{ slug: 'legal', bts: [], pos: 'leader', specific: true }] },
  { name: 'Fastcase', normalized_category: 'Legal Tech', tagline: 'Legal research with AI-powered search',
    industries: [{ slug: 'legal', bts: [], pos: 'challenger', specific: true }] },
  { name: 'Casetext', normalized_category: 'Legal Tech', tagline: 'AI-powered legal research by Thomson Reuters',
    industries: [{ slug: 'legal', bts: [], pos: 'challenger', specific: true }] },
  // E-Discovery
  { name: 'Relativity', normalized_category: 'Legal Tech', tagline: 'E-discovery and legal review platform',
    industries: [{ slug: 'legal', bts: ['law-firm'], pos: 'leader', specific: true }] },
  { name: 'Logikcull', normalized_category: 'Legal Tech', tagline: 'Instant discovery and document review',
    industries: [{ slug: 'legal', bts: [], pos: 'challenger', specific: true }] },
  { name: 'Everlaw', normalized_category: 'Legal Tech', tagline: 'Cloud litigation and investigation platform',
    industries: [{ slug: 'legal', bts: [], pos: 'challenger', specific: true }] },

  // ═══ REAL ESTATE ══════════════════════════════════════════════════════════
  // CRM
  { name: 'kvCORE', normalized_category: 'CRM', tagline: 'All-in-one real estate platform by Inside Real Estate',
    industries: [{ slug: 'real-estate', bts: ['real-estate-agent', 'brokerage'], pos: 'leader', specific: true }] },
  { name: 'LionDesk', normalized_category: 'CRM', tagline: 'CRM and marketing platform for real estate agents',
    industries: [{ slug: 'real-estate', bts: ['real-estate-agent'], pos: 'challenger', specific: true }] },
  { name: 'BoomTown', normalized_category: 'CRM', tagline: 'Real estate lead generation and CRM platform',
    industries: [{ slug: 'real-estate', bts: ['real-estate-agent', 'brokerage'], pos: 'challenger', specific: true }] },
  { name: 'Real Geeks', normalized_category: 'CRM', tagline: 'Real estate marketing and CRM solution',
    industries: [{ slug: 'real-estate', bts: ['real-estate-agent'], pos: 'challenger', specific: true }] },
  { name: 'Lofty', normalized_category: 'CRM', tagline: 'AI-powered real estate CRM (formerly Chime)',
    industries: [{ slug: 'real-estate', bts: ['real-estate-agent'], pos: 'challenger', specific: true }] },
  { name: 'Top Producer', normalized_category: 'CRM', tagline: 'Real estate CRM and marketing automation',
    industries: [{ slug: 'real-estate', bts: ['real-estate-agent'], pos: 'niche', specific: true }] },
  // Property Management
  { name: 'AppFolio', normalized_category: 'Property Management', tagline: 'Cloud property management software for real estate',
    industries: [{ slug: 'real-estate', bts: ['property-manager'], pos: 'leader', specific: true }] },
  { name: 'Buildium', normalized_category: 'Property Management', tagline: 'Property management software for residential managers',
    industries: [{ slug: 'real-estate', bts: ['property-manager'], pos: 'leader', specific: true }] },
  { name: 'Yardi Voyager', normalized_category: 'Property Management', tagline: 'Enterprise property management and accounting platform',
    industries: [{ slug: 'real-estate', bts: ['property-manager'], pos: 'leader', specific: true }] },
  { name: 'RealPage', normalized_category: 'Property Management', tagline: 'Property management solutions for multifamily real estate',
    industries: [{ slug: 'real-estate', bts: ['property-manager'], pos: 'leader', specific: true }] },
  { name: 'Rent Manager', normalized_category: 'Property Management', tagline: 'Property management and accounting software',
    industries: [{ slug: 'real-estate', bts: ['property-manager'], pos: 'challenger', specific: true }] },
  { name: 'TenantCloud', normalized_category: 'Property Management', tagline: 'Free property management software for small landlords',
    industries: [{ slug: 'real-estate', bts: ['property-manager'], pos: 'niche', specific: true }] },
  { name: 'Stessa', normalized_category: 'Property Management', tagline: 'Real estate asset management and tracking for investors',
    industries: [{ slug: 'real-estate', bts: ['real-estate-investor'], pos: 'challenger', specific: true }] },
  { name: 'DoorLoop', normalized_category: 'Property Management', tagline: 'All-in-one property management software',
    industries: [{ slug: 'real-estate', bts: ['property-manager'], pos: 'niche', specific: true }] },
  // Transaction Management
  { name: 'Dotloop', normalized_category: 'Document Management', tagline: 'Real estate transaction management and e-signatures',
    industries: [{ slug: 'real-estate', bts: ['real-estate-agent', 'brokerage'], pos: 'leader', specific: true }] },
  { name: 'SkySlope', normalized_category: 'Document Management', tagline: 'Real estate transaction management platform',
    industries: [{ slug: 'real-estate', bts: ['real-estate-agent', 'brokerage'], pos: 'leader', specific: true }] },
  { name: 'DocuSign', normalized_category: 'Document Management', tagline: 'Electronic signature and agreement management platform',
    industries: [{ slug: 'real-estate', bts: [], pos: 'leader', specific: false }] },
  { name: 'Brokermint', normalized_category: 'Document Management', tagline: 'Back office management for real estate brokerages',
    industries: [{ slug: 'real-estate', bts: ['brokerage'], pos: 'challenger', specific: true }] },
  // Lead Generation
  { name: 'Zillow Premier Agent', normalized_category: 'Marketing Automation', tagline: 'Real estate lead generation and advertising on Zillow',
    industries: [{ slug: 'real-estate', bts: ['real-estate-agent'], pos: 'leader', specific: true }] },
  { name: 'Realtor.com', normalized_category: 'Marketing Automation', tagline: 'Real estate listing and lead generation platform',
    industries: [{ slug: 'real-estate', bts: ['real-estate-agent'], pos: 'leader', specific: true }] },
  { name: 'Market Leader', normalized_category: 'Marketing Automation', tagline: 'Real estate marketing and lead generation',
    industries: [{ slug: 'real-estate', bts: ['real-estate-agent'], pos: 'challenger', specific: true }] },
  { name: 'Zurple', normalized_category: 'Marketing Automation', tagline: 'Real estate lead conversion software',
    industries: [{ slug: 'real-estate', bts: ['real-estate-agent'], pos: 'niche', specific: true }] },
  { name: 'Ylopo', normalized_category: 'Marketing Automation', tagline: 'AI-powered digital marketing for real estate',
    industries: [{ slug: 'real-estate', bts: ['real-estate-agent'], pos: 'challenger', specific: true }] },
  // Investment Analysis
  { name: 'DealMachine', normalized_category: 'Financial Management', tagline: 'Real estate investing lead generation and deal finder',
    industries: [{ slug: 'real-estate', bts: ['real-estate-investor'], pos: 'leader', specific: true }] },
  { name: 'REIPro', normalized_category: 'Financial Management', tagline: 'Real estate investment deal analysis software',
    industries: [{ slug: 'real-estate', bts: ['real-estate-investor'], pos: 'challenger', specific: true }] },
  { name: 'PropStream', normalized_category: 'Financial Management', tagline: 'Real estate data and investment analysis platform',
    industries: [{ slug: 'real-estate', bts: ['real-estate-investor'], pos: 'leader', specific: true }] },
  { name: 'BiggerPockets Tools', normalized_category: 'Financial Management', tagline: 'Real estate investing calculators and analysis tools',
    industries: [{ slug: 'real-estate', bts: ['real-estate-investor'], pos: 'niche', specific: true }] },

  // ═══ RESTAURANT & HOSPITALITY ════════════════════════════════════════════
  // POS
  { name: 'Toast', normalized_category: 'Point of Sale', tagline: 'Restaurant-first POS and management platform',
    industries: [{ slug: 'restaurant-hospitality', bts: ['restaurant', 'bar-nightlife', 'coffee-shop'], pos: 'leader', specific: true }] },
  { name: 'Square for Restaurants', normalized_category: 'Point of Sale', tagline: 'Restaurant POS system by Square',
    industries: [{ slug: 'restaurant-hospitality', bts: ['restaurant', 'coffee-shop'], pos: 'leader', specific: true }] },
  { name: 'Clover', normalized_category: 'Point of Sale', tagline: 'POS system for restaurants and retail businesses',
    industries: [
      { slug: 'restaurant-hospitality', bts: ['restaurant', 'bar-nightlife', 'coffee-shop'], pos: 'challenger', specific: false },
      { slug: 'retail-ecommerce', bts: ['brick-and-mortar'], pos: 'challenger', specific: false },
    ] },
  { name: 'Lightspeed Restaurant', normalized_category: 'Point of Sale', tagline: 'Cloud POS for restaurants and food service',
    industries: [{ slug: 'restaurant-hospitality', bts: ['restaurant'], pos: 'challenger', specific: true }] },
  { name: 'TouchBistro', normalized_category: 'Point of Sale', tagline: 'iPad POS system built for restaurants',
    industries: [{ slug: 'restaurant-hospitality', bts: ['restaurant'], pos: 'challenger', specific: true }] },
  { name: 'Revel Systems', normalized_category: 'Point of Sale', tagline: 'Cloud-based POS for restaurants and retail',
    industries: [{ slug: 'restaurant-hospitality', bts: ['restaurant'], pos: 'challenger', specific: false }] },
  { name: 'SpotOn', normalized_category: 'Point of Sale', tagline: 'Restaurant POS with integrated payments and loyalty',
    industries: [{ slug: 'restaurant-hospitality', bts: ['restaurant', 'bar-nightlife'], pos: 'challenger', specific: true }] },
  { name: 'Aloha POS', normalized_category: 'Point of Sale', tagline: 'Enterprise restaurant POS system by NCR',
    industries: [{ slug: 'restaurant-hospitality', bts: ['restaurant'], pos: 'leader', specific: true }] },
  { name: 'Oracle MICROS', normalized_category: 'Point of Sale', tagline: 'Enterprise POS for hospitality and food service',
    industries: [{ slug: 'restaurant-hospitality', bts: ['hotel', 'restaurant'], pos: 'leader', specific: true }] },
  // Reservation & Table Management
  { name: 'OpenTable', normalized_category: 'Scheduling & Booking', tagline: 'Restaurant reservation and table management platform',
    industries: [{ slug: 'restaurant-hospitality', bts: ['restaurant'], pos: 'leader', specific: true }] },
  { name: 'Resy', normalized_category: 'Scheduling & Booking', tagline: 'Restaurant reservation and guest management',
    industries: [{ slug: 'restaurant-hospitality', bts: ['restaurant', 'bar-nightlife'], pos: 'challenger', specific: true }] },
  { name: 'Yelp Reservations', normalized_category: 'Scheduling & Booking', tagline: 'Restaurant reservations and waitlist management',
    industries: [{ slug: 'restaurant-hospitality', bts: ['restaurant'], pos: 'challenger', specific: true }] },
  { name: 'SevenRooms', normalized_category: 'Scheduling & Booking', tagline: 'Guest experience platform for hospitality',
    industries: [{ slug: 'restaurant-hospitality', bts: ['restaurant', 'bar-nightlife', 'hotel'], pos: 'challenger', specific: true }] },
  // Hotel PMS
  { name: 'Opera PMS', normalized_category: 'Property Management', tagline: 'Hotel property management system by Oracle',
    industries: [{ slug: 'restaurant-hospitality', bts: ['hotel'], pos: 'leader', specific: true }] },
  { name: 'Cloudbeds', normalized_category: 'Property Management', tagline: 'Hospitality management platform for hotels and hostels',
    industries: [{ slug: 'restaurant-hospitality', bts: ['hotel'], pos: 'challenger', specific: true }] },
  { name: 'Mews', normalized_category: 'Property Management', tagline: 'Cloud-based hotel property management system',
    industries: [{ slug: 'restaurant-hospitality', bts: ['hotel'], pos: 'challenger', specific: true }] },
  { name: 'Little Hotelier', normalized_category: 'Property Management', tagline: 'Hotel management software for small properties',
    industries: [{ slug: 'restaurant-hospitality', bts: ['hotel'], pos: 'niche', specific: true }] },
  { name: 'Guesty', normalized_category: 'Property Management', tagline: 'Property management for short-term rentals and hotels',
    industries: [{ slug: 'restaurant-hospitality', bts: ['hotel'], pos: 'challenger', specific: true }] },
  // Inventory & Food Cost
  { name: 'MarketMan', normalized_category: 'Inventory Management', tagline: 'Restaurant inventory and food cost management',
    industries: [{ slug: 'restaurant-hospitality', bts: ['restaurant'], pos: 'leader', specific: true }] },
  { name: 'BlueCart', normalized_category: 'Inventory Management', tagline: 'Restaurant ordering and inventory platform',
    industries: [{ slug: 'restaurant-hospitality', bts: ['restaurant'], pos: 'challenger', specific: true }] },
  { name: 'CrunchTime', normalized_category: 'Inventory Management', tagline: 'Enterprise restaurant operations and inventory management',
    industries: [{ slug: 'restaurant-hospitality', bts: ['restaurant'], pos: 'leader', specific: true }] },
  { name: 'xtraCHEF', normalized_category: 'Inventory Management', tagline: 'Restaurant food cost and invoice management by Toast',
    industries: [{ slug: 'restaurant-hospitality', bts: ['restaurant'], pos: 'challenger', specific: true }] },
  // Scheduling & Labor
  { name: '7shifts', normalized_category: 'HR & Payroll', tagline: 'Restaurant team management and scheduling',
    industries: [{ slug: 'restaurant-hospitality', bts: ['restaurant', 'bar-nightlife', 'coffee-shop'], pos: 'leader', specific: true }] },
  { name: 'Fourth', normalized_category: 'HR & Payroll', tagline: 'Hospitality workforce management (formerly HotSchedules)',
    industries: [{ slug: 'restaurant-hospitality', bts: ['restaurant', 'hotel'], pos: 'leader', specific: true }] },
  { name: 'Homebase', normalized_category: 'HR & Payroll', tagline: 'Employee scheduling and time tracking for hourly teams',
    industries: [{ slug: 'restaurant-hospitality', bts: ['restaurant', 'coffee-shop'], pos: 'challenger', specific: false }] },
  { name: 'When I Work', normalized_category: 'HR & Payroll', tagline: 'Employee scheduling and time clock software',
    industries: [{ slug: 'restaurant-hospitality', bts: [], pos: 'challenger', specific: false }] },
  // Online Ordering
  { name: 'DoorDash for Merchants', normalized_category: 'E-commerce', tagline: 'Online ordering and delivery marketplace for restaurants',
    industries: [{ slug: 'restaurant-hospitality', bts: ['restaurant'], pos: 'leader', specific: true }] },
  { name: 'Uber Eats for Restaurants', normalized_category: 'E-commerce', tagline: 'Food delivery marketplace and online ordering',
    industries: [{ slug: 'restaurant-hospitality', bts: ['restaurant'], pos: 'leader', specific: true }] },
  { name: 'ChowNow', normalized_category: 'E-commerce', tagline: 'Commission-free online ordering for restaurants',
    industries: [{ slug: 'restaurant-hospitality', bts: ['restaurant'], pos: 'challenger', specific: true }] },
  { name: 'Olo', normalized_category: 'E-commerce', tagline: 'Enterprise digital ordering and delivery for restaurants',
    industries: [{ slug: 'restaurant-hospitality', bts: ['restaurant'], pos: 'leader', specific: true }] },
  { name: 'BentoBox', normalized_category: 'E-commerce', tagline: 'Restaurant website and online ordering platform',
    industries: [{ slug: 'restaurant-hospitality', bts: ['restaurant'], pos: 'challenger', specific: true }] },
  // Catering
  { name: 'Caterease', normalized_category: 'Event Management', tagline: 'Catering and event management software',
    industries: [{ slug: 'restaurant-hospitality', bts: ['catering'], pos: 'leader', specific: true }] },
  { name: 'Total Party Planner', normalized_category: 'Event Management', tagline: 'Catering business management software',
    industries: [{ slug: 'restaurant-hospitality', bts: ['catering'], pos: 'challenger', specific: true }] },
  { name: 'CaterTrax', normalized_category: 'Event Management', tagline: 'Enterprise catering management platform',
    industries: [{ slug: 'restaurant-hospitality', bts: ['catering'], pos: 'challenger', specific: true }] },
  { name: 'Better Cater', normalized_category: 'Event Management', tagline: 'Simple catering management and ordering software',
    industries: [{ slug: 'restaurant-hospitality', bts: ['catering'], pos: 'niche', specific: true }] },

  // ═══ RETAIL & E-COMMERCE ═════════════════════════════════════════════════
  // E-Commerce Platforms
  { name: 'Shopify', normalized_category: 'E-commerce', tagline: 'All-in-one commerce platform for online and retail',
    industries: [{ slug: 'retail-ecommerce', bts: ['online-store', 'omnichannel-retailer'], pos: 'leader', specific: false }] },
  { name: 'WooCommerce', normalized_category: 'E-commerce', tagline: 'Open-source e-commerce plugin for WordPress',
    industries: [{ slug: 'retail-ecommerce', bts: ['online-store'], pos: 'leader', specific: false }] },
  { name: 'BigCommerce', normalized_category: 'E-commerce', tagline: 'Enterprise e-commerce platform for growing businesses',
    industries: [{ slug: 'retail-ecommerce', bts: ['online-store', 'omnichannel-retailer'], pos: 'challenger', specific: false }] },
  { name: 'Squarespace Commerce', normalized_category: 'E-commerce', tagline: 'Website builder with integrated e-commerce',
    industries: [{ slug: 'retail-ecommerce', bts: ['online-store'], pos: 'challenger', specific: false }] },
  { name: 'Wix eCommerce', normalized_category: 'E-commerce', tagline: 'Website builder with online store capabilities',
    industries: [{ slug: 'retail-ecommerce', bts: ['online-store'], pos: 'challenger', specific: false }] },
  { name: 'Adobe Commerce', normalized_category: 'E-commerce', tagline: 'Enterprise e-commerce platform (formerly Magento)',
    industries: [{ slug: 'retail-ecommerce', bts: ['omnichannel-retailer'], pos: 'leader', specific: false }] },
  { name: 'PrestaShop', normalized_category: 'E-commerce', tagline: 'Open-source e-commerce solution',
    industries: [{ slug: 'retail-ecommerce', bts: ['online-store'], pos: 'niche', specific: false }] },
  // Retail POS
  { name: 'Shopify POS', normalized_category: 'Point of Sale', tagline: 'Point of sale system integrated with Shopify',
    industries: [{ slug: 'retail-ecommerce', bts: ['omnichannel-retailer'], pos: 'leader', specific: false }] },
  { name: 'Square', normalized_category: 'Point of Sale', tagline: 'POS and payment processing for small businesses',
    industries: [{ slug: 'retail-ecommerce', bts: ['brick-and-mortar'], pos: 'leader', specific: false }] },
  { name: 'Lightspeed Retail', normalized_category: 'Point of Sale', tagline: 'Cloud POS system for retail businesses',
    industries: [{ slug: 'retail-ecommerce', bts: ['brick-and-mortar'], pos: 'challenger', specific: false }] },
  { name: 'Vend', normalized_category: 'Point of Sale', tagline: 'Retail POS and inventory management by Lightspeed',
    industries: [{ slug: 'retail-ecommerce', bts: ['brick-and-mortar'], pos: 'challenger', specific: false }] },
  // Inventory Management
  { name: 'Cin7', normalized_category: 'Inventory Management', tagline: 'Connected inventory management for omnichannel sellers',
    industries: [{ slug: 'retail-ecommerce', bts: ['omnichannel-retailer'], pos: 'leader', specific: false }] },
  { name: 'QuickBooks Commerce', normalized_category: 'Inventory Management', tagline: 'Inventory and order management (formerly TradeGecko)',
    industries: [{ slug: 'retail-ecommerce', bts: ['omnichannel-retailer'], pos: 'challenger', specific: false }] },
  { name: 'Brightpearl', normalized_category: 'Inventory Management', tagline: 'Retail operations platform for omnichannel brands',
    industries: [{ slug: 'retail-ecommerce', bts: ['omnichannel-retailer'], pos: 'challenger', specific: false }] },
  { name: 'SkuVault', normalized_category: 'Inventory Management', tagline: 'Warehouse management and inventory control',
    industries: [{ slug: 'retail-ecommerce', bts: ['online-store'], pos: 'challenger', specific: false }] },
  { name: 'Ordoro', normalized_category: 'Inventory Management', tagline: 'Inventory management and shipping for e-commerce',
    industries: [{ slug: 'retail-ecommerce', bts: ['online-store'], pos: 'niche', specific: false }] },
  // Subscription Box
  { name: 'Recharge', normalized_category: 'E-commerce', tagline: 'Subscription management platform for e-commerce',
    industries: [{ slug: 'retail-ecommerce', bts: ['subscription-box'], pos: 'leader', specific: false }] },
  { name: 'Bold Subscriptions', normalized_category: 'E-commerce', tagline: 'Subscription and recurring billing for Shopify',
    industries: [{ slug: 'retail-ecommerce', bts: ['subscription-box'], pos: 'challenger', specific: false }] },
  { name: 'Cratejoy', normalized_category: 'E-commerce', tagline: 'Subscription box marketplace and management platform',
    industries: [{ slug: 'retail-ecommerce', bts: ['subscription-box'], pos: 'leader', specific: true }] },
  { name: 'Subbly', normalized_category: 'E-commerce', tagline: 'Subscription e-commerce platform',
    industries: [{ slug: 'retail-ecommerce', bts: ['subscription-box'], pos: 'niche', specific: false }] },
  // Shipping
  { name: 'ShipStation', normalized_category: 'Logistics & Shipping', tagline: 'Multi-carrier shipping solution for e-commerce',
    industries: [{ slug: 'retail-ecommerce', bts: ['online-store', 'omnichannel-retailer'], pos: 'leader', specific: false }] },
  { name: 'ShipBob', normalized_category: 'Logistics & Shipping', tagline: 'E-commerce fulfillment and 3PL platform',
    industries: [{ slug: 'retail-ecommerce', bts: ['online-store'], pos: 'leader', specific: false }] },
  { name: 'Pirate Ship', normalized_category: 'Logistics & Shipping', tagline: 'Free shipping software with discounted USPS and UPS rates',
    industries: [{ slug: 'retail-ecommerce', bts: ['online-store'], pos: 'challenger', specific: false }] },
  { name: 'EasyPost', normalized_category: 'Logistics & Shipping', tagline: 'Shipping API for e-commerce businesses',
    industries: [{ slug: 'retail-ecommerce', bts: ['online-store'], pos: 'challenger', specific: false }] },

  // ═══ PROFESSIONAL SERVICES ═══════════════════════════════════════════════
  // Project Management
  { name: 'Monday.com', normalized_category: 'Project Management', tagline: 'Work management platform for teams',
    industries: [{ slug: 'professional-services', bts: [], pos: 'leader', specific: false }] },
  { name: 'Asana', normalized_category: 'Project Management', tagline: 'Work management and team collaboration platform',
    industries: [{ slug: 'professional-services', bts: [], pos: 'leader', specific: false }] },
  { name: 'ClickUp', normalized_category: 'Project Management', tagline: 'All-in-one productivity and project management',
    industries: [{ slug: 'professional-services', bts: [], pos: 'challenger', specific: false }] },
  { name: 'Basecamp', normalized_category: 'Project Management', tagline: 'Project management and team communication tool',
    industries: [{ slug: 'professional-services', bts: [], pos: 'challenger', specific: false }] },
  { name: 'Wrike', normalized_category: 'Project Management', tagline: 'Collaborative work management for agencies and teams',
    industries: [{ slug: 'professional-services', bts: ['marketing-agency', 'consulting-firm'], pos: 'challenger', specific: false }] },
  { name: 'Teamwork', normalized_category: 'Project Management', tagline: 'Project management built for client work',
    industries: [{ slug: 'professional-services', bts: ['marketing-agency'], pos: 'challenger', specific: false }] },
  // CRM
  { name: 'Pipedrive', normalized_category: 'CRM', tagline: 'Sales CRM and pipeline management for small teams',
    industries: [
      { slug: 'professional-services', bts: ['freelancer'], pos: 'challenger', specific: false },
      { slug: 'technology-saas', bts: [], pos: 'challenger', specific: false },
    ] },
  // Time Tracking
  { name: 'Harvest', normalized_category: 'Time Tracking & Productivity', tagline: 'Time tracking and invoicing for teams',
    industries: [{ slug: 'professional-services', bts: [], pos: 'leader', specific: false }] },
  { name: 'Toggl Track', normalized_category: 'Time Tracking & Productivity', tagline: 'Simple and powerful time tracking for teams',
    industries: [{ slug: 'professional-services', bts: [], pos: 'leader', specific: false }] },
  { name: 'Clockify', normalized_category: 'Time Tracking & Productivity', tagline: 'Free time tracker and timesheet app for teams',
    industries: [{ slug: 'professional-services', bts: [], pos: 'challenger', specific: false }] },
  // Agency / PSA Tools
  { name: 'Productive.io', normalized_category: 'Project Management', tagline: 'Agency management tool for profitability tracking',
    industries: [{ slug: 'professional-services', bts: ['marketing-agency'], pos: 'challenger', specific: true }] },
  { name: 'Scoro', normalized_category: 'Project Management', tagline: 'End-to-end work management for agencies and consultancies',
    industries: [{ slug: 'professional-services', bts: ['marketing-agency', 'consulting-firm'], pos: 'challenger', specific: true }] },
  { name: 'Accelo', normalized_category: 'Project Management', tagline: 'Professional services automation platform',
    industries: [{ slug: 'professional-services', bts: [], pos: 'challenger', specific: true }] },
  { name: 'Kantata', normalized_category: 'Project Management', tagline: 'Professional services automation (formerly Mavenlink)',
    industries: [{ slug: 'professional-services', bts: ['consulting-firm', 'it-services'], pos: 'leader', specific: true }] },
  { name: 'ConnectWise', normalized_category: 'IT Service Management', tagline: 'IT service management and business automation',
    industries: [{ slug: 'professional-services', bts: ['it-services'], pos: 'leader', specific: true }] },
  { name: 'Autotask', normalized_category: 'IT Service Management', tagline: 'IT business management platform by Datto',
    industries: [{ slug: 'professional-services', bts: ['it-services'], pos: 'leader', specific: true }] },
  { name: 'Syncro', normalized_category: 'IT Service Management', tagline: 'Combined RMM and PSA platform for MSPs',
    industries: [{ slug: 'professional-services', bts: ['it-services'], pos: 'challenger', specific: true }] },

  // ═══ CONSTRUCTION & TRADES ═══════════════════════════════════════════════
  { name: 'PlanGrid', normalized_category: 'Construction Management', tagline: 'Construction productivity software by Autodesk',
    industries: [{ slug: 'construction-trades', bts: [], pos: 'challenger', specific: true }] },
  { name: 'ProEst', normalized_category: 'Construction Management', tagline: 'Cloud-based construction estimating software',
    industries: [{ slug: 'construction-trades', bts: ['commercial-builder'], pos: 'challenger', specific: true }] },
  { name: 'Clear Estimates', normalized_category: 'Construction Management', tagline: 'Estimating software for remodelers and contractors',
    industries: [{ slug: 'construction-trades', bts: ['remodeler'], pos: 'niche', specific: true }] },
  { name: 'AccuLynx', normalized_category: 'CRM', tagline: 'Roofing contractor CRM and project management',
    industries: [{ slug: 'construction-trades', bts: ['specialty-trade'], pos: 'leader', specific: true }] },
  { name: 'Leap', normalized_category: 'CRM', tagline: 'Digital sales platform for home improvement contractors',
    industries: [{ slug: 'construction-trades', bts: ['specialty-trade'], pos: 'challenger', specific: true }] },
  { name: 'MarketSharp', normalized_category: 'CRM', tagline: 'CRM for remodelers and home improvement companies',
    industries: [{ slug: 'construction-trades', bts: ['remodeler'], pos: 'niche', specific: true }] },
  { name: 'Sage 100 Contractor', normalized_category: 'Accounting Software', tagline: 'Construction accounting and project management',
    industries: [{ slug: 'construction-trades', bts: ['general-contractor'], pos: 'leader', specific: true }] },
  { name: 'Jonas Construction', normalized_category: 'Accounting Software', tagline: 'Construction accounting and operations software',
    industries: [{ slug: 'construction-trades', bts: ['commercial-builder'], pos: 'challenger', specific: true }] },
  // Field Service (cross-industry)
  { name: 'ServiceTitan', normalized_category: 'Field Service Management', tagline: 'All-in-one software for trades and home service businesses',
    industries: [
      { slug: 'construction-trades', bts: ['specialty-trade'], pos: 'leader', specific: true },
      { slug: 'home-services', bts: [], pos: 'leader', specific: true },
    ] },
  { name: 'Housecall Pro', normalized_category: 'Field Service Management', tagline: 'Business management for home service professionals',
    industries: [
      { slug: 'construction-trades', bts: ['specialty-trade'], pos: 'challenger', specific: true },
      { slug: 'home-services', bts: [], pos: 'leader', specific: true },
    ] },
  { name: 'SafetyCulture', normalized_category: 'Field Service Management', tagline: 'Workplace safety inspection and operations platform (iAuditor)',
    industries: [{ slug: 'construction-trades', bts: [], pos: 'leader', specific: false }] },
  { name: 'CompanyCam', normalized_category: 'Field Service Management', tagline: 'Photo documentation app for contractors',
    industries: [{ slug: 'construction-trades', bts: [], pos: 'challenger', specific: true }] },

  // ═══ EDUCATION ════════════════════════════════════════════════════════════
  // LMS
  { name: 'Teachable', normalized_category: 'Learning Management System', tagline: 'Online course and coaching platform for creators',
    industries: [{ slug: 'education', bts: ['online-course-creator'], pos: 'leader', specific: true }] },
  { name: 'Thinkific', normalized_category: 'Learning Management System', tagline: 'Online course platform for entrepreneurs and educators',
    industries: [{ slug: 'education', bts: ['online-course-creator'], pos: 'leader', specific: true }] },
  { name: 'Canvas LMS', normalized_category: 'Learning Management System', tagline: 'Learning management system for schools and institutions',
    industries: [{ slug: 'education', bts: ['private-school', 'training-company'], pos: 'leader', specific: true }] },
  { name: 'Blackboard', normalized_category: 'Learning Management System', tagline: 'Learning management platform for education',
    industries: [{ slug: 'education', bts: ['private-school'], pos: 'leader', specific: true }] },
  { name: 'Moodle', normalized_category: 'Learning Management System', tagline: 'Open-source learning management system',
    industries: [{ slug: 'education', bts: ['private-school', 'training-company'], pos: 'leader', specific: true }] },
  { name: 'TalentLMS', normalized_category: 'Learning Management System', tagline: 'Cloud LMS for training and employee development',
    industries: [{ slug: 'education', bts: ['training-company'], pos: 'leader', specific: true }] },
  { name: 'LearnDash', normalized_category: 'Learning Management System', tagline: 'WordPress LMS plugin for course creators',
    industries: [{ slug: 'education', bts: ['online-course-creator'], pos: 'challenger', specific: true }] },
  // Tutoring
  { name: 'TutorCruncher', normalized_category: 'Scheduling & Booking', tagline: 'Tutoring business management and scheduling',
    industries: [{ slug: 'education', bts: ['tutoring-service'], pos: 'leader', specific: true }] },
  { name: 'Teachworks', normalized_category: 'Scheduling & Booking', tagline: 'Tutoring and teaching business management',
    industries: [{ slug: 'education', bts: ['tutoring-service'], pos: 'challenger', specific: true }] },
  { name: 'Calendly', normalized_category: 'Scheduling & Booking', tagline: 'Scheduling automation platform for professionals',
    industries: [{ slug: 'education', bts: [], pos: 'challenger', specific: false }] },
  // Student Information Systems
  { name: 'PowerSchool', normalized_category: 'Learning Management System', tagline: 'K-12 student information and learning management',
    industries: [{ slug: 'education', bts: ['private-school'], pos: 'leader', specific: true }] },
  { name: 'Gradelink', normalized_category: 'Learning Management System', tagline: 'Student information system for private schools',
    industries: [{ slug: 'education', bts: ['private-school'], pos: 'challenger', specific: true }] },
  { name: 'FACTS SIS', normalized_category: 'Learning Management System', tagline: 'Student information system for K-12 schools',
    industries: [{ slug: 'education', bts: ['private-school'], pos: 'challenger', specific: true }] },
  { name: 'SchoolMint', normalized_category: 'Learning Management System', tagline: 'Student enrollment and school choice platform',
    industries: [{ slug: 'education', bts: ['private-school'], pos: 'niche', specific: true }] },
  // Course Creation
  { name: 'Articulate 360', normalized_category: 'Learning Management System', tagline: 'E-learning course authoring suite',
    industries: [{ slug: 'education', bts: ['training-company'], pos: 'leader', specific: true }] },
  { name: 'Camtasia', normalized_category: 'Learning Management System', tagline: 'Screen recording and video editing for course creation',
    industries: [{ slug: 'education', bts: ['online-course-creator'], pos: 'leader', specific: false }] },
  { name: 'Loom', normalized_category: 'Team Collaboration', tagline: 'Async video messaging and screen recording',
    industries: [{ slug: 'education', bts: [], pos: 'challenger', specific: false }] },
  { name: 'Canva', normalized_category: 'Design & Prototyping', tagline: 'Online graphic design and visual content platform',
    industries: [{ slug: 'education', bts: [], pos: 'challenger', specific: false }] },

  // ═══ FITNESS & WELLNESS ══════════════════════════════════════════════════
  { name: 'Glofox', normalized_category: 'Scheduling & Booking', tagline: 'Gym and studio management software',
    industries: [{ slug: 'fitness-wellness', bts: ['gym', 'yoga-pilates-studio'], pos: 'challenger', specific: true }] },
  { name: 'Zen Planner', normalized_category: 'Scheduling & Booking', tagline: 'Fitness studio and gym management platform',
    industries: [{ slug: 'fitness-wellness', bts: ['gym', 'yoga-pilates-studio'], pos: 'challenger', specific: true }] },
  { name: 'Wellness Living', normalized_category: 'Scheduling & Booking', tagline: 'All-in-one business management for fitness and wellness',
    industries: [{ slug: 'fitness-wellness', bts: ['gym', 'yoga-pilates-studio'], pos: 'challenger', specific: true }] },
  // Personal Trainer
  { name: 'Trainerize', normalized_category: 'Scheduling & Booking', tagline: 'Personal training software and client management',
    industries: [{ slug: 'fitness-wellness', bts: ['personal-trainer'], pos: 'leader', specific: true }] },
  { name: 'TrueCoach', normalized_category: 'Scheduling & Booking', tagline: 'Workout programming and client management for trainers',
    industries: [{ slug: 'fitness-wellness', bts: ['personal-trainer'], pos: 'challenger', specific: true }] },
  { name: 'My PT Hub', normalized_category: 'Scheduling & Booking', tagline: 'Personal training management and workout delivery',
    industries: [{ slug: 'fitness-wellness', bts: ['personal-trainer'], pos: 'challenger', specific: true }] },
  { name: 'Exercise.com', normalized_category: 'Scheduling & Booking', tagline: 'Fitness business management and workout software',
    industries: [{ slug: 'fitness-wellness', bts: ['personal-trainer', 'gym'], pos: 'niche', specific: true }] },
  // Gym Management
  { name: 'Club OS', normalized_category: 'Scheduling & Booking', tagline: 'Sales and marketing CRM for fitness clubs',
    industries: [{ slug: 'fitness-wellness', bts: ['gym'], pos: 'challenger', specific: true }] },
  { name: 'ABC Fitness', normalized_category: 'Scheduling & Booking', tagline: 'Enterprise gym management platform (now ABC Glofox)',
    industries: [{ slug: 'fitness-wellness', bts: ['gym'], pos: 'leader', specific: true }] },
  { name: 'Gymdesk', normalized_category: 'Scheduling & Booking', tagline: 'Simple gym management for small fitness businesses',
    industries: [{ slug: 'fitness-wellness', bts: ['gym'], pos: 'niche', specific: true }] },
  { name: 'Wodify', normalized_category: 'Scheduling & Booking', tagline: 'CrossFit and functional fitness gym management',
    industries: [{ slug: 'fitness-wellness', bts: ['gym'], pos: 'niche', specific: true }] },
  // Member Engagement
  { name: 'Virtuagym', normalized_category: 'CRM', tagline: 'Fitness member engagement and gym management',
    industries: [{ slug: 'fitness-wellness', bts: ['gym', 'yoga-pilates-studio'], pos: 'challenger', specific: true }] },
  { name: 'TeamUp', normalized_category: 'CRM', tagline: 'Class-based fitness business management',
    industries: [{ slug: 'fitness-wellness', bts: ['gym', 'yoga-pilates-studio'], pos: 'niche', specific: true }] },
  { name: 'FitGrid', normalized_category: 'CRM', tagline: 'Instructor-powered member engagement for studios',
    industries: [{ slug: 'fitness-wellness', bts: ['yoga-pilates-studio'], pos: 'niche', specific: true }] },

  // ═══ HOME SERVICES ═══════════════════════════════════════════════════════
  // (ServiceTitan and Housecall Pro defined above in Construction with multi-industry)
  { name: 'FieldEdge', normalized_category: 'Field Service Management', tagline: 'Field service management for home service contractors',
    industries: [{ slug: 'home-services', bts: [], pos: 'challenger', specific: true }] },
  { name: 'ServiceM8', normalized_category: 'Field Service Management', tagline: 'Job management for trades and home service businesses',
    industries: [{ slug: 'home-services', bts: [], pos: 'niche', specific: true }] },
  // CRM
  { name: 'GorillaDesk', normalized_category: 'CRM', tagline: 'Business management for pest control and lawn care',
    industries: [{ slug: 'home-services', bts: ['pest-control', 'landscaping'], pos: 'challenger', specific: true }] },
  { name: 'PestRoutes', normalized_category: 'CRM', tagline: 'Software built for pest control businesses',
    industries: [{ slug: 'home-services', bts: ['pest-control'], pos: 'leader', specific: true }] },
  { name: 'LawnPro', normalized_category: 'CRM', tagline: 'Lawn care business management software',
    industries: [{ slug: 'home-services', bts: ['landscaping'], pos: 'niche', specific: true }] },
  // Scheduling & Dispatch
  { name: 'Workiz', normalized_category: 'Scheduling & Booking', tagline: 'Field service management and scheduling for home services',
    industries: [{ slug: 'home-services', bts: [], pos: 'challenger', specific: true }] },
  { name: 'mHelpDesk', normalized_category: 'Scheduling & Booking', tagline: 'Field service and scheduling software',
    industries: [{ slug: 'home-services', bts: [], pos: 'challenger', specific: true }] },
  { name: 'OptimoRoute', normalized_category: 'Scheduling & Booking', tagline: 'Route optimization and planning for field teams',
    industries: [{ slug: 'home-services', bts: [], pos: 'challenger', specific: false }] },
  { name: 'ZenMaid', normalized_category: 'Scheduling & Booking', tagline: 'Scheduling software for maid services (formerly Launch27)',
    industries: [{ slug: 'home-services', bts: ['cleaning-service'], pos: 'niche', specific: true }] },
  // Invoicing
  { name: 'Square Invoices', normalized_category: 'Invoicing & Billing', tagline: 'Free invoicing and payment solution by Square',
    industries: [{ slug: 'home-services', bts: [], pos: 'challenger', specific: false }] },
  { name: 'Invoice Ninja', normalized_category: 'Invoicing & Billing', tagline: 'Open-source invoicing and billing platform',
    industries: [{ slug: 'home-services', bts: [], pos: 'niche', specific: false }] },

  // ═══ TECHNOLOGY & SAAS ═══════════════════════════════════════════════════
  // Dev Tools
  { name: 'Jira', normalized_category: 'Project Management', tagline: 'Issue tracking and project management for software teams',
    industries: [{ slug: 'technology-saas', bts: [], pos: 'leader', specific: false }] },
  { name: 'Linear', normalized_category: 'Project Management', tagline: 'Modern project management for software teams',
    industries: [{ slug: 'technology-saas', bts: ['saas-startup'], pos: 'challenger', specific: false }] },
  { name: 'GitHub', normalized_category: 'Project Management', tagline: 'Developer platform for version control and collaboration',
    industries: [{ slug: 'technology-saas', bts: [], pos: 'leader', specific: false }] },
  { name: 'GitLab', normalized_category: 'Project Management', tagline: 'DevSecOps platform for the complete software lifecycle',
    industries: [{ slug: 'technology-saas', bts: [], pos: 'leader', specific: false }] },
  { name: 'Notion', normalized_category: 'Project Management', tagline: 'All-in-one workspace for notes, docs, and projects',
    industries: [{ slug: 'technology-saas', bts: [], pos: 'leader', specific: false }] },
  // Analytics
  { name: 'Mixpanel', normalized_category: 'Analytics', tagline: 'Product analytics for data-driven decisions',
    industries: [{ slug: 'technology-saas', bts: ['saas-startup', 'mobile-app'], pos: 'leader', specific: false }] },
  { name: 'Amplitude', normalized_category: 'Analytics', tagline: 'Digital analytics platform for product teams',
    industries: [{ slug: 'technology-saas', bts: ['saas-startup', 'mobile-app'], pos: 'leader', specific: false }] },
  { name: 'PostHog', normalized_category: 'Analytics', tagline: 'Open-source product analytics and feature flags',
    industries: [{ slug: 'technology-saas', bts: ['saas-startup'], pos: 'challenger', specific: false }] },
  { name: 'Pendo', normalized_category: 'Analytics', tagline: 'Product experience and adoption platform',
    industries: [{ slug: 'technology-saas', bts: ['saas-startup', 'enterprise-software'], pos: 'leader', specific: false }] },
  // DevOps
  { name: 'Vercel', normalized_category: 'DevOps', tagline: 'Frontend cloud platform for web deployment',
    industries: [{ slug: 'technology-saas', bts: ['saas-startup'], pos: 'leader', specific: false }] },
  { name: 'Datadog', normalized_category: 'DevOps', tagline: 'Cloud monitoring and observability platform',
    industries: [{ slug: 'technology-saas', bts: [], pos: 'leader', specific: false }] },
  { name: 'PagerDuty', normalized_category: 'DevOps', tagline: 'Incident response and on-call management platform',
    industries: [{ slug: 'technology-saas', bts: [], pos: 'leader', specific: false }] },
  // Billing
  { name: 'Stripe', normalized_category: 'Invoicing & Billing', tagline: 'Payment infrastructure for the internet',
    industries: [{ slug: 'technology-saas', bts: [], pos: 'leader', specific: false }] },
  { name: 'Paddle', normalized_category: 'Invoicing & Billing', tagline: 'Complete payments and billing for SaaS companies',
    industries: [{ slug: 'technology-saas', bts: ['saas-startup'], pos: 'challenger', specific: false }] },
];


// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nMode: ${DRY_RUN ? 'DRY RUN' : 'WRITE'}\n`);
  console.log(`Total products defined: ${PRODUCTS.length}`);

  // Fetch existing products by name for dedup
  let existingProducts = [];
  let page = 0;
  while (true) {
    const { data, error } = await supabase
      .from('reaper_products')
      .select('id, name, slug, normalized_category')
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (error || !data || data.length === 0) break;
    existingProducts.push(...data);
    if (data.length < 1000) break;
    page++;
  }

  const existingByName = new Map();
  for (const p of existingProducts) {
    existingByName.set(p.name.toLowerCase(), p);
  }

  console.log(`Existing products in DB: ${existingProducts.length}\n`);

  // Separate into new products vs existing (just need relevance rows)
  const toInsert = [];
  const existingForRelevance = [];

  for (const product of PRODUCTS) {
    const existing = existingByName.get(product.name.toLowerCase());
    if (existing) {
      existingForRelevance.push({ ...product, id: existing.id });
    } else {
      toInsert.push(product);
    }
  }

  console.log(`New products to insert: ${toInsert.length}`);
  console.log(`Existing products (relevance only): ${existingForRelevance.length}\n`);

  if (DRY_RUN) {
    // Show what would be inserted
    console.log('─── New Products ────────────────────────────────────────');
    for (const p of toInsert) {
      console.log(`  + ${p.name} [${p.normalized_category}]`);
    }
    console.log(`\n─── Existing (relevance rows only) ─────────────────────`);
    for (const p of existingForRelevance) {
      console.log(`  ~ ${p.name} [${p.normalized_category}] (id: ${p.id.slice(0, 8)}...)`);
    }

    // Count relevance rows
    let totalRelevanceRows = 0;
    for (const p of PRODUCTS) {
      totalRelevanceRows += p.industries.length;
    }
    console.log(`\nTotal industry_product_relevance rows: ${totalRelevanceRows}`);
    console.log('\n✓ Dry run complete. Use --write to insert.');
    return;
  }

  // ── Phase 1: Insert new products ──────────────────────────────────────

  console.log('Phase 1: Inserting new products...');
  const insertedProducts = new Map(); // name -> { id, ... }

  // Check for existing slugs to avoid duplicates
  const slugsToInsert = toInsert.map((p) => slugify(p.name));
  const existingBySlug = new Map();
  for (let i = 0; i < slugsToInsert.length; i += 100) {
    const batch = slugsToInsert.slice(i, i + 100);
    const { data } = await supabase
      .from('reaper_products')
      .select('id, name, slug')
      .in('slug', batch);
    if (data) {
      for (const row of data) existingBySlug.set(row.slug, row);
    }
  }

  const actualInserts = [];
  for (const p of toInsert) {
    const slug = slugify(p.name);
    const existingSlug = existingBySlug.get(slug);
    if (existingSlug) {
      // Already exists by slug, just track it
      insertedProducts.set(p.name.toLowerCase(), existingSlug);
      console.log(`  Exists by slug: ${p.name} → ${slug}`);
    } else {
      actualInserts.push(p);
    }
  }

  // Insert in batches of 50
  const batchSize = 50;
  for (let i = 0; i < actualInserts.length; i += batchSize) {
    const batch = actualInserts.slice(i, i + batchSize).map((p) => ({
      name: p.name,
      slug: slugify(p.name),
      url: null,
      category: p.normalized_category,
      normalized_category: p.normalized_category,
      tagline: p.tagline,
      feature_count: 0,
      quality_score: 0.1,
      is_active: true,
      source: 'industry-seed',
    }));

    const { data, error } = await supabase
      .from('reaper_products')
      .insert(batch)
      .select('id, name, slug');

    if (error) {
      console.error(`  Error inserting batch at ${i}:`, error.message);
      // Try one by one
      for (const row of batch) {
        const { data: single, error: sErr } = await supabase
          .from('reaper_products')
          .insert(row)
          .select('id, name, slug');
        if (sErr) {
          console.error(`    Failed: ${row.name} — ${sErr.message}`);
        } else if (single && single[0]) {
          insertedProducts.set(single[0].name.toLowerCase(), single[0]);
        }
      }
    } else if (data) {
      for (const row of data) {
        insertedProducts.set(row.name.toLowerCase(), row);
      }
    }
  }

  console.log(`  Inserted ${insertedProducts.size} products (${actualInserts.length} new, ${toInsert.length - actualInserts.length} existing by slug).\n`);

  // ── Phase 2: Create relevance rows ────────────────────────────────────

  console.log('Phase 2: Creating industry_product_relevance rows...');
  const relevanceRows = [];

  for (const product of PRODUCTS) {
    // Find product ID
    let productId;
    const existing = existingByName.get(product.name.toLowerCase());
    if (existing) {
      productId = existing.id;
    } else {
      const inserted = insertedProducts.get(product.name.toLowerCase());
      if (inserted) {
        productId = inserted.id;
      }
    }

    if (!productId) {
      console.warn(`  Warning: No ID found for ${product.name}, skipping relevance rows`);
      continue;
    }

    for (const ind of product.industries) {
      relevanceRows.push({
        product_id: productId,
        industry_slug: ind.slug,
        business_type_slugs: ind.bts,
        relevance_rank: null, // Will be calculated in Phase 3
        market_position: ind.pos,
        industry_specific: ind.specific,
        notes: null,
      });
    }
  }

  // Upsert relevance rows in batches
  let relevanceInserted = 0;
  for (let i = 0; i < relevanceRows.length; i += 500) {
    const batch = relevanceRows.slice(i, i + 500);
    const { error } = await supabase
      .from('industry_product_relevance')
      .upsert(batch, { onConflict: 'product_id,industry_slug' });
    if (error) {
      console.error(`  Error upserting relevance batch at ${i}:`, error.message);
    } else {
      relevanceInserted += batch.length;
    }
  }

  console.log(`  Upserted ${relevanceInserted} relevance rows.\n`);

  // ── Phase 3: Recalculate ranks per industry ───────────────────────────

  console.log('Phase 3: Recalculating ranks per industry...');

  const MARKET_PRIORITY = { leader: 0, challenger: 1, niche: 2 };
  const industries = [...new Set(relevanceRows.map((r) => r.industry_slug))];

  for (const industrySlug of industries) {
    // Fetch ALL relevance rows for this industry
    const { data: rows, error } = await supabase
      .from('industry_product_relevance')
      .select('id, product_id, market_position, industry_specific')
      .eq('industry_slug', industrySlug);

    if (error || !rows) {
      console.error(`  Error fetching rows for ${industrySlug}:`, error?.message);
      continue;
    }

    // Fetch quality scores for these products
    const productIds = rows.map((r) => r.product_id);
    const qualityMap = new Map();
    for (let i = 0; i < productIds.length; i += 1000) {
      const batch = productIds.slice(i, i + 1000);
      const { data: products } = await supabase
        .from('reaper_products')
        .select('id, quality_score')
        .in('id', batch);
      if (products) {
        for (const p of products) qualityMap.set(p.id, p.quality_score || 0);
      }
    }

    // Sort: market_position priority, then quality_score DESC
    rows.sort((a, b) => {
      const posA = MARKET_PRIORITY[a.market_position] ?? 3;
      const posB = MARKET_PRIORITY[b.market_position] ?? 3;
      if (posA !== posB) return posA - posB;
      // Industry-specific products rank higher within same position
      if (a.industry_specific !== b.industry_specific) return a.industry_specific ? -1 : 1;
      return (qualityMap.get(b.product_id) || 0) - (qualityMap.get(a.product_id) || 0);
    });

    // Assign sequential ranks and batch update
    const updates = rows.map((row, idx) => ({
      id: row.id,
      relevance_rank: idx + 1,
    }));

    // Update in batches
    for (let i = 0; i < updates.length; i += 500) {
      const batch = updates.slice(i, i + 500);
      for (const u of batch) {
        await supabase
          .from('industry_product_relevance')
          .update({ relevance_rank: u.relevance_rank })
          .eq('id', u.id);
      }
    }

    console.log(`  ${industrySlug}: ${rows.length} products ranked`);
  }

  console.log('\n✓ Done! All products inserted and ranked.');
}

main().catch(console.error);
