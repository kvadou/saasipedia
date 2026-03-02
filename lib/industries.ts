// Industry taxonomy data for SaaSipedia
// Maps industries -> business types -> relevant SaaS categories

export interface BusinessType {
  name: string;
  slug: string;
  description: string;
}

export interface CategoryMapping {
  category: string; // must match reaper_products.category exactly
  relevance: 'essential' | 'recommended' | 'nice-to-have';
  reason: string;
  businessTypes?: string[]; // if set, only show for these business type slugs
}

export interface Industry {
  name: string;
  slug: string;
  icon: string; // lucide-react icon name
  description: string;
  businessTypes: BusinessType[];
  categoryMappings: CategoryMapping[];
}

export const INDUSTRIES: Industry[] = [
  // ──────────────────────────────────────────────
  // 1. Healthcare
  // ──────────────────────────────────────────────
  {
    name: 'Healthcare',
    slug: 'healthcare',
    icon: 'Heart',
    description:
      'Software solutions for healthcare providers, from patient management to billing and compliance.',
    businessTypes: [
      {
        name: 'Dental Office',
        slug: 'dental-office',
        description: 'Dental practices and oral health clinics',
      },
      {
        name: 'Plastic Surgery Clinic',
        slug: 'plastic-surgery-clinic',
        description: 'Cosmetic and reconstructive surgery practices',
      },
      {
        name: 'Physical Therapy',
        slug: 'physical-therapy',
        description: 'Physical therapy and rehabilitation centers',
      },
      {
        name: 'Veterinary',
        slug: 'veterinary',
        description: 'Animal hospitals and veterinary clinics',
      },
    ],
    categoryMappings: [
      // Universal (shown for "All")
      {
        category: 'CRM',
        relevance: 'essential',
        reason: 'Track patient relationships and communication history',
      },
      {
        category: 'Scheduling & Booking',
        relevance: 'essential',
        reason: 'Automate appointment booking and reduce no-shows',
      },
      {
        category: 'Accounting Software',
        relevance: 'essential',
        reason:
          'Handle billing, insurance claims, and financial reporting',
      },
      {
        category: 'Payment Processing',
        relevance: 'recommended',
        reason: 'Process co-pays and patient payments seamlessly',
      },
      {
        category: 'Cybersecurity',
        relevance: 'recommended',
        reason: 'Protect sensitive patient data and meet HIPAA requirements',
      },
      // Business-type-specific
      {
        category: 'Healthcare IT',
        relevance: 'essential',
        reason: 'Specialized healthcare management and compliance tools',
        businessTypes: [
          'dental-office',
          'plastic-surgery-clinic',
          'physical-therapy',
        ],
      },
      {
        category: 'Marketing Automation',
        relevance: 'essential',
        reason: 'Drive new patient inquiries for high-value cosmetic procedures',
        businessTypes: ['plastic-surgery-clinic'],
      },
      {
        category: 'Marketing Automation',
        relevance: 'recommended',
        reason: 'Attract new patients with automated campaigns',
        businessTypes: ['dental-office', 'veterinary'],
      },
      {
        category: 'Website Builder',
        relevance: 'essential',
        reason: 'Showcase before/after galleries and attract new patients online',
        businessTypes: ['plastic-surgery-clinic'],
      },
      {
        category: 'Website Builder',
        relevance: 'recommended',
        reason: 'Build your practice website with online booking',
        businessTypes: ['dental-office', 'physical-therapy', 'veterinary'],
      },
      {
        category: 'Email Marketing',
        relevance: 'recommended',
        reason: 'Send appointment reminders, hygiene tips, and recall notices',
        businessTypes: ['dental-office', 'veterinary'],
      },
      {
        category: 'Email Marketing',
        relevance: 'nice-to-have',
        reason: 'Send post-procedure care instructions and promotions',
        businessTypes: ['plastic-surgery-clinic', 'physical-therapy'],
      },
      {
        category: 'Customer Support',
        relevance: 'nice-to-have',
        reason: 'Manage patient inquiries across phone, email, and chat',
        businessTypes: ['dental-office', 'plastic-surgery-clinic'],
      },
    ],
  },

  // ──────────────────────────────────────────────
  // 2. Financial Services
  // ──────────────────────────────────────────────
  {
    name: 'Financial Services',
    slug: 'financial-services',
    icon: 'Landmark',
    description:
      'Tools for banks, advisors, and financial firms to manage clients, compliance, and transactions.',
    businessTypes: [
      {
        name: 'Financial Advisor',
        slug: 'financial-advisor',
        description:
          'Wealth management and financial planning practices',
      },
      {
        name: 'Accounting Firm',
        slug: 'accounting-firm',
        description: 'CPA firms and bookkeeping services',
      },
      {
        name: 'Insurance Agency',
        slug: 'insurance-agency',
        description: 'Property, casualty, life, and health insurance brokers',
      },
      {
        name: 'Mortgage Broker',
        slug: 'mortgage-broker',
        description: 'Residential and commercial mortgage origination',
      },
    ],
    categoryMappings: [
      // Universal
      {
        category: 'CRM',
        relevance: 'essential',
        reason:
          'Manage client relationships, track interactions, and monitor portfolios',
      },
      {
        category: 'Accounting Software',
        relevance: 'essential',
        reason: 'Core financial record-keeping and reporting',
      },
      {
        category: 'Cybersecurity',
        relevance: 'essential',
        reason:
          'Protect sensitive financial data and meet regulatory requirements',
      },
      {
        category: 'Document Management',
        relevance: 'essential',
        reason:
          'Organize contracts, statements, and compliance documents',
      },
      // Business-type-specific
      {
        category: 'Financial Management',
        relevance: 'essential',
        reason: 'Advanced financial planning and analysis tools',
        businessTypes: ['financial-advisor', 'accounting-firm'],
      },
      {
        category: 'Marketing Automation',
        relevance: 'essential',
        reason: 'Generate leads and nurture prospects through multi-touch campaigns',
        businessTypes: ['insurance-agency', 'mortgage-broker'],
      },
      {
        category: 'Marketing Automation',
        relevance: 'recommended',
        reason: 'Nurture prospects and cross-sell to existing clients',
        businessTypes: ['financial-advisor'],
      },
      {
        category: 'Email Marketing',
        relevance: 'recommended',
        reason:
          'Send market updates, newsletters, and regulatory notices',
        businessTypes: ['financial-advisor', 'insurance-agency'],
      },
      {
        category: 'Website Builder',
        relevance: 'recommended',
        reason: 'Build a professional web presence with client portals',
        businessTypes: ['financial-advisor', 'mortgage-broker'],
      },
      {
        category: 'Business Intelligence',
        relevance: 'recommended',
        reason: 'Analyze portfolio performance and business metrics',
        businessTypes: ['financial-advisor', 'accounting-firm'],
      },
      {
        category: 'Expense Management',
        relevance: 'essential',
        reason: 'Track business expenses and client-billable costs',
        businessTypes: ['accounting-firm'],
      },
      {
        category: 'Scheduling & Booking',
        relevance: 'recommended',
        reason: 'Let clients self-schedule consultations and reviews',
        businessTypes: ['financial-advisor', 'mortgage-broker'],
      },
      {
        category: 'Invoicing & Billing',
        relevance: 'recommended',
        reason: 'Bill clients for advisory and preparation services',
        businessTypes: ['accounting-firm'],
      },
    ],
  },

  // ──────────────────────────────────────────────
  // 3. Legal
  // ──────────────────────────────────────────────
  {
    name: 'Legal',
    slug: 'legal',
    icon: 'Scale',
    description:
      'Practice management, document automation, and client tools for law firms and legal professionals.',
    businessTypes: [
      {
        name: 'Law Firm',
        slug: 'law-firm',
        description: 'General practice and specialty law firms',
      },
      {
        name: 'Solo Attorney',
        slug: 'solo-attorney',
        description: 'Independent lawyers and small practices',
      },
      {
        name: 'Legal Services',
        slug: 'legal-services',
        description:
          'Legal process outsourcing, paralegals, and support services',
      },
    ],
    categoryMappings: [
      // Universal
      {
        category: 'Legal Tech',
        relevance: 'essential',
        reason:
          'Specialized legal research, e-discovery, and case management',
      },
      {
        category: 'Legal Practice Management',
        relevance: 'essential',
        reason: 'Manage cases, deadlines, billing, and client matters',
      },
      {
        category: 'CRM',
        relevance: 'essential',
        reason:
          'Track client intake, referrals, and relationship history',
      },
      {
        category: 'Document Management',
        relevance: 'essential',
        reason:
          'Organize contracts, filings, and case documents securely',
      },
      {
        category: 'Accounting Software',
        relevance: 'essential',
        reason:
          'Handle trust accounting, billing, and financial compliance',
      },
      // Business-type-specific
      {
        category: 'Time Tracking & Productivity',
        relevance: 'essential',
        reason: 'Track billable hours accurately for client invoicing',
        businessTypes: ['law-firm', 'solo-attorney'],
      },
      {
        category: 'Website Builder',
        relevance: 'essential',
        reason:
          'Build your personal brand and attract clients online',
        businessTypes: ['solo-attorney'],
      },
      {
        category: 'Website Builder',
        relevance: 'recommended',
        reason:
          'Build a credible web presence to attract potential clients',
        businessTypes: ['law-firm'],
      },
      {
        category: 'Cybersecurity',
        relevance: 'essential',
        reason:
          'Protect attorney-client privileged communications and data',
        businessTypes: ['law-firm', 'legal-services'],
      },
      {
        category: 'Scheduling & Booking',
        relevance: 'essential',
        reason: 'Let clients book consultations directly online',
        businessTypes: ['solo-attorney'],
      },
      {
        category: 'Scheduling & Booking',
        relevance: 'nice-to-have',
        reason: 'Allow clients to book consultations online',
        businessTypes: ['law-firm'],
      },
      {
        category: 'Email Marketing',
        relevance: 'recommended',
        reason: 'Send firm newsletters, legal updates, and thought leadership',
        businessTypes: ['law-firm'],
      },
      {
        category: 'Project Management',
        relevance: 'recommended',
        reason: 'Coordinate paralegal teams and manage client deliverables',
        businessTypes: ['legal-services'],
      },
    ],
  },

  // ──────────────────────────────────────────────
  // 4. Real Estate
  // ──────────────────────────────────────────────
  {
    name: 'Real Estate',
    slug: 'real-estate',
    icon: 'Home',
    description:
      'CRM, listing management, and marketing tools for agents, brokerages, and property managers.',
    businessTypes: [
      {
        name: 'Real Estate Agent',
        slug: 'real-estate-agent',
        description: 'Individual agents and small teams',
      },
      {
        name: 'Brokerage',
        slug: 'brokerage',
        description: 'Real estate brokerages managing multiple agents',
      },
      {
        name: 'Property Manager',
        slug: 'property-manager',
        description:
          'Residential and commercial property management companies',
      },
      {
        name: 'Real Estate Investor',
        slug: 'real-estate-investor',
        description: 'Flippers, landlords, and investment firms',
      },
    ],
    categoryMappings: [
      // Universal
      {
        category: 'CRM',
        relevance: 'essential',
        reason:
          'Track leads, buyers, sellers, and deal pipeline from first contact to close',
      },
      {
        category: 'Accounting Software',
        relevance: 'recommended',
        reason: 'Track commissions, expenses, and rental income',
      },
      {
        category: 'Document Management',
        relevance: 'recommended',
        reason:
          'Handle contracts, disclosures, and transaction documents',
      },
      // Business-type-specific
      {
        category: 'Marketing Automation',
        relevance: 'essential',
        reason:
          'Automate listing alerts, drip campaigns, and lead nurture sequences',
        businessTypes: ['real-estate-agent', 'brokerage'],
      },
      {
        category: 'Website Builder',
        relevance: 'essential',
        reason: 'Showcase listings and capture leads with IDX integration',
        businessTypes: ['real-estate-agent', 'brokerage'],
      },
      {
        category: 'Email Marketing',
        relevance: 'recommended',
        reason: 'Send market updates, open house invites, and just-listed emails',
        businessTypes: ['real-estate-agent', 'brokerage'],
      },
      {
        category: 'Social Media Management',
        relevance: 'essential',
        reason: 'Promote listings across Instagram, Facebook, and more',
        businessTypes: ['real-estate-agent'],
      },
      {
        category: 'Social Media Management',
        relevance: 'recommended',
        reason: 'Build brokerage brand and recruit agents',
        businessTypes: ['brokerage'],
      },
      {
        category: 'Property Management',
        relevance: 'essential',
        reason:
          'Manage tenants, leases, maintenance, and rent collection',
        businessTypes: ['property-manager', 'real-estate-investor'],
      },
      {
        category: 'Scheduling & Booking',
        relevance: 'recommended',
        reason: 'Schedule showings and open houses efficiently',
        businessTypes: ['real-estate-agent', 'brokerage'],
      },
      {
        category: 'Financial Management',
        relevance: 'essential',
        reason: 'Track ROI, cap rates, and portfolio performance across properties',
        businessTypes: ['real-estate-investor'],
      },
      {
        category: 'Accounting Software',
        relevance: 'essential',
        reason: 'Track rental income, expenses, depreciation, and tax obligations',
        businessTypes: ['real-estate-investor', 'property-manager'],
      },
    ],
  },

  // ──────────────────────────────────────────────
  // 5. Restaurant & Hospitality
  // ──────────────────────────────────────────────
  {
    name: 'Restaurant & Hospitality',
    slug: 'restaurant-hospitality',
    icon: 'UtensilsCrossed',
    description:
      'POS, reservation, inventory, and marketing tools for restaurants, bars, hotels, and venues.',
    businessTypes: [
      {
        name: 'Restaurant',
        slug: 'restaurant',
        description: 'Full-service and fast-casual dining establishments',
      },
      {
        name: 'Bar & Nightlife',
        slug: 'bar-nightlife',
        description: 'Bars, breweries, and nightlife venues',
      },
      {
        name: 'Hotel',
        slug: 'hotel',
        description: 'Hotels, resorts, and lodging properties',
      },
      {
        name: 'Catering',
        slug: 'catering',
        description: 'Catering companies and event food services',
      },
      {
        name: 'Coffee Shop',
        slug: 'coffee-shop',
        description: 'Coffee shops, bakeries, and quick-service cafes',
      },
    ],
    categoryMappings: [
      // Universal
      {
        category: 'Point of Sale',
        relevance: 'essential',
        reason:
          'Process orders, manage tabs, and handle payments at the register',
      },
      {
        category: 'Accounting Software',
        relevance: 'essential',
        reason: 'Track revenue, food costs, payroll, and profitability',
      },
      {
        category: 'Payment Processing',
        relevance: 'essential',
        reason: 'Accept cards, mobile pay, and process tips seamlessly',
      },
      // Business-type-specific
      {
        category: 'Inventory Management',
        relevance: 'essential',
        reason:
          'Monitor food and beverage stock to reduce waste and control costs',
        businessTypes: ['restaurant', 'bar-nightlife', 'catering'],
      },
      {
        category: 'Scheduling & Booking',
        relevance: 'essential',
        reason: 'Manage reservations, table assignments, and waitlists',
        businessTypes: ['restaurant'],
      },
      {
        category: 'Scheduling & Booking',
        relevance: 'essential',
        reason: 'Handle room reservations and guest check-in/check-out',
        businessTypes: ['hotel'],
      },
      {
        category: 'Scheduling & Booking',
        relevance: 'recommended',
        reason: 'Manage event bookings and delivery schedules',
        businessTypes: ['catering'],
      },
      {
        category: 'Social Media Management',
        relevance: 'essential',
        reason:
          'Promote specials, share food photos, and build a loyal following',
        businessTypes: ['restaurant', 'coffee-shop'],
      },
      {
        category: 'Social Media Management',
        relevance: 'recommended',
        reason:
          'Promote events, drink specials, and live entertainment',
        businessTypes: ['bar-nightlife'],
      },
      {
        category: 'Email Marketing',
        relevance: 'recommended',
        reason:
          'Send promotions, loyalty rewards, and event announcements',
        businessTypes: ['restaurant', 'bar-nightlife', 'hotel'],
      },
      {
        category: 'Website Builder',
        relevance: 'recommended',
        reason:
          'Display menus, hours, and enable online ordering',
        businessTypes: ['restaurant', 'coffee-shop', 'catering'],
      },
      {
        category: 'Website Builder',
        relevance: 'essential',
        reason: 'Showcase rooms, amenities, and enable direct bookings',
        businessTypes: ['hotel'],
      },
      {
        category: 'HR & Payroll',
        relevance: 'recommended',
        reason:
          'Manage tipped employees, shift workers, and payroll compliance',
        businessTypes: ['restaurant', 'hotel', 'bar-nightlife'],
      },
      {
        category: 'Event Management',
        relevance: 'essential',
        reason: 'Coordinate event logistics, menus, and client communication',
        businessTypes: ['catering'],
      },
      {
        category: 'Event Management',
        relevance: 'nice-to-have',
        reason: 'Coordinate private events and banquet bookings',
        businessTypes: ['restaurant', 'hotel'],
      },
      {
        category: 'Property Management',
        relevance: 'essential',
        reason: 'Manage rooms, housekeeping, and guest services',
        businessTypes: ['hotel'],
      },
      {
        category: 'CRM',
        relevance: 'recommended',
        reason: 'Track corporate clients, repeat caterers, and referral sources',
        businessTypes: ['catering', 'hotel'],
      },
    ],
  },

  // ──────────────────────────────────────────────
  // 6. Retail & E-Commerce
  // ──────────────────────────────────────────────
  {
    name: 'Retail & E-Commerce',
    slug: 'retail-ecommerce',
    icon: 'ShoppingBag',
    description:
      'E-commerce platforms, inventory management, and marketing tools for online and brick-and-mortar retailers.',
    businessTypes: [
      {
        name: 'Online Store',
        slug: 'online-store',
        description: 'Pure e-commerce and DTC brands',
      },
      {
        name: 'Brick & Mortar',
        slug: 'brick-and-mortar',
        description: 'Physical retail stores and boutiques',
      },
      {
        name: 'Omnichannel Retailer',
        slug: 'omnichannel-retailer',
        description:
          'Retailers selling both online and in physical locations',
      },
      {
        name: 'Subscription Box',
        slug: 'subscription-box',
        description:
          'Recurring subscription product businesses',
      },
    ],
    categoryMappings: [
      // Universal
      {
        category: 'Inventory Management',
        relevance: 'essential',
        reason: 'Track stock levels, reorder points, and warehouse operations',
      },
      {
        category: 'Payment Processing',
        relevance: 'essential',
        reason: 'Accept payments online and in-store securely',
      },
      {
        category: 'CRM',
        relevance: 'essential',
        reason:
          'Track customer purchase history and segment for targeted outreach',
      },
      {
        category: 'Accounting Software',
        relevance: 'recommended',
        reason: 'Manage sales tax, revenue tracking, and financial reporting',
      },
      // Business-type-specific
      {
        category: 'E-commerce',
        relevance: 'essential',
        reason: 'Build and manage your online storefront and product catalog',
        businessTypes: ['online-store', 'omnichannel-retailer', 'subscription-box'],
      },
      {
        category: 'Marketing Automation',
        relevance: 'essential',
        reason:
          'Automate abandoned cart emails, upsells, and re-engagement flows',
        businessTypes: ['online-store', 'omnichannel-retailer', 'subscription-box'],
      },
      {
        category: 'Marketing Automation',
        relevance: 'recommended',
        reason: 'Send targeted promotions based on purchase history',
        businessTypes: ['brick-and-mortar'],
      },
      {
        category: 'Email Marketing',
        relevance: 'essential',
        reason: 'Drive repeat purchases with product launches and subscriber-only deals',
        businessTypes: ['subscription-box'],
      },
      {
        category: 'Email Marketing',
        relevance: 'recommended',
        reason: 'Send promotions, product launches, and loyalty campaigns',
        businessTypes: ['online-store', 'omnichannel-retailer'],
      },
      {
        category: 'Social Media Management',
        relevance: 'essential',
        reason: 'Build brand, show unboxing content, and drive subscriber growth',
        businessTypes: ['subscription-box'],
      },
      {
        category: 'Social Media Management',
        relevance: 'recommended',
        reason: 'Promote products and engage customers on social channels',
        businessTypes: ['online-store', 'omnichannel-retailer'],
      },
      {
        category: 'SEO',
        relevance: 'essential',
        reason: 'Drive organic traffic to product pages and category listings',
        businessTypes: ['online-store', 'omnichannel-retailer'],
      },
      {
        category: 'Customer Support',
        relevance: 'essential',
        reason: 'Handle returns, order inquiries, and post-purchase support',
        businessTypes: ['online-store', 'subscription-box'],
      },
      {
        category: 'Customer Support',
        relevance: 'recommended',
        reason: 'Manage customer inquiries and product questions',
        businessTypes: ['omnichannel-retailer'],
      },
      {
        category: 'Point of Sale',
        relevance: 'essential',
        reason: 'Process in-store transactions and sync with online inventory',
        businessTypes: ['brick-and-mortar', 'omnichannel-retailer'],
      },
      {
        category: 'Logistics & Shipping',
        relevance: 'essential',
        reason: 'Manage fulfillment, shipping rates, and delivery tracking',
        businessTypes: ['online-store', 'omnichannel-retailer', 'subscription-box'],
      },
    ],
  },

  // ──────────────────────────────────────────────
  // 7. Professional Services
  // ──────────────────────────────────────────────
  {
    name: 'Professional Services',
    slug: 'professional-services',
    icon: 'Briefcase',
    description:
      'Project management, time tracking, and client tools for consultancies, agencies, and freelancers.',
    businessTypes: [
      {
        name: 'Marketing Agency',
        slug: 'marketing-agency',
        description: 'Digital marketing, advertising, and creative agencies',
      },
      {
        name: 'Consulting Firm',
        slug: 'consulting-firm',
        description:
          'Management, strategy, and specialty consulting practices',
      },
      {
        name: 'IT Services',
        slug: 'it-services',
        description:
          'Managed service providers and IT consulting firms',
      },
      {
        name: 'Freelancer',
        slug: 'freelancer',
        description: 'Independent professionals and solo consultants',
      },
    ],
    categoryMappings: [
      // Universal
      {
        category: 'Project Management',
        relevance: 'essential',
        reason:
          'Plan, track, and deliver client projects on time and within budget',
      },
      {
        category: 'CRM',
        relevance: 'essential',
        reason:
          'Manage client relationships, proposals, and sales pipeline',
      },
      {
        category: 'Time Tracking & Productivity',
        relevance: 'essential',
        reason:
          'Track billable hours per client and project for accurate invoicing',
      },
      {
        category: 'Accounting Software',
        relevance: 'essential',
        reason:
          'Handle invoicing, expense tracking, and financial reporting',
      },
      // Business-type-specific
      {
        category: 'Team Collaboration',
        relevance: 'essential',
        reason:
          'Coordinate across team members and share work with clients',
        businessTypes: ['marketing-agency', 'consulting-firm', 'it-services'],
      },
      {
        category: 'Invoicing & Billing',
        relevance: 'essential',
        reason: 'Send professional invoices and track payments',
        businessTypes: ['freelancer', 'consulting-firm'],
      },
      {
        category: 'Marketing Automation',
        relevance: 'recommended',
        reason: 'Generate leads and nurture prospects through the sales funnel',
        businessTypes: ['marketing-agency', 'consulting-firm'],
      },
      {
        category: 'Website Builder',
        relevance: 'essential',
        reason: 'Showcase your portfolio and attract new clients online',
        businessTypes: ['freelancer'],
      },
      {
        category: 'Website Builder',
        relevance: 'recommended',
        reason:
          'Showcase your portfolio, case studies, and service offerings',
        businessTypes: ['marketing-agency', 'consulting-firm'],
      },
      {
        category: 'Social Media Management',
        relevance: 'essential',
        reason: 'Manage client social accounts and your own brand presence',
        businessTypes: ['marketing-agency'],
      },
      {
        category: 'Design & Prototyping',
        relevance: 'essential',
        reason: 'Create deliverables, mockups, and client presentations',
        businessTypes: ['marketing-agency'],
      },
      {
        category: 'IT Service Management',
        relevance: 'essential',
        reason: 'Track tickets, SLAs, and service delivery for clients',
        businessTypes: ['it-services'],
      },
      {
        category: 'Cybersecurity',
        relevance: 'essential',
        reason: 'Protect client environments and manage security posture',
        businessTypes: ['it-services'],
      },
      {
        category: 'Scheduling & Booking',
        relevance: 'recommended',
        reason: 'Let clients self-book consultation calls',
        businessTypes: ['freelancer', 'consulting-firm'],
      },
    ],
  },

  // ──────────────────────────────────────────────
  // 8. Construction & Trades
  // ──────────────────────────────────────────────
  {
    name: 'Construction & Trades',
    slug: 'construction-trades',
    icon: 'HardHat',
    description:
      'Estimating, project management, and field tools for contractors, builders, and skilled trades.',
    businessTypes: [
      {
        name: 'General Contractor',
        slug: 'general-contractor',
        description:
          'General contractors managing residential and commercial builds',
      },
      {
        name: 'Specialty Trade',
        slug: 'specialty-trade',
        description:
          'Electricians, plumbers, HVAC, and other specialty contractors',
      },
      {
        name: 'Remodeler',
        slug: 'remodeler',
        description: 'Kitchen, bath, and home renovation contractors',
      },
      {
        name: 'Commercial Builder',
        slug: 'commercial-builder',
        description:
          'Large-scale commercial and industrial construction firms',
      },
    ],
    categoryMappings: [
      // Universal
      {
        category: 'Project Management',
        relevance: 'essential',
        reason:
          'Track project phases, milestones, and task assignments',
      },
      {
        category: 'Accounting Software',
        relevance: 'essential',
        reason:
          'Handle job costing, progress billing, and financial reporting',
      },
      {
        category: 'CRM',
        relevance: 'recommended',
        reason:
          'Track leads, bids, and client relationships from estimate to close',
      },
      {
        category: 'Invoicing & Billing',
        relevance: 'recommended',
        reason: 'Send estimates, change orders, and progress invoices',
      },
      // Business-type-specific
      {
        category: 'Construction Management Software',
        relevance: 'essential',
        reason:
          'Manage bids, blueprints, schedules, and subcontractor coordination',
        businessTypes: ['general-contractor', 'commercial-builder'],
      },
      {
        category: 'Construction Management',
        relevance: 'essential',
        reason: 'Coordinate job sites, crews, and project timelines',
        businessTypes: ['general-contractor', 'commercial-builder'],
      },
      {
        category: 'Field Service Management',
        relevance: 'essential',
        reason: 'Dispatch crews, track job status, and manage work orders',
        businessTypes: ['specialty-trade'],
      },
      {
        category: 'Scheduling & Booking',
        relevance: 'essential',
        reason: 'Let homeowners book estimates and service calls online',
        businessTypes: ['specialty-trade', 'remodeler'],
      },
      {
        category: 'Scheduling & Booking',
        relevance: 'recommended',
        reason:
          'Coordinate crew schedules across multiple job sites',
        businessTypes: ['general-contractor', 'commercial-builder'],
      },
      {
        category: 'Time Tracking & Productivity',
        relevance: 'essential',
        reason:
          'Track labor hours per job for payroll and cost analysis',
        businessTypes: ['commercial-builder', 'general-contractor'],
      },
      {
        category: 'Time Tracking & Productivity',
        relevance: 'recommended',
        reason: 'Track hours per job for accurate invoicing',
        businessTypes: ['specialty-trade'],
      },
      {
        category: 'Website Builder',
        relevance: 'essential',
        reason:
          'Showcase before/after project galleries and collect leads online',
        businessTypes: ['remodeler'],
      },
      {
        category: 'Website Builder',
        relevance: 'nice-to-have',
        reason:
          'Build an online presence to attract new clients',
        businessTypes: ['specialty-trade', 'general-contractor'],
      },
      {
        category: 'HR & Payroll',
        relevance: 'essential',
        reason: 'Manage large crews, prevailing wages, and union compliance',
        businessTypes: ['commercial-builder'],
      },
    ],
  },

  // ──────────────────────────────────────────────
  // 9. Education
  // ──────────────────────────────────────────────
  {
    name: 'Education',
    slug: 'education',
    icon: 'GraduationCap',
    description:
      'Learning platforms, student management, and communication tools for schools, tutors, and ed-tech companies.',
    businessTypes: [
      {
        name: 'Tutoring Service',
        slug: 'tutoring-service',
        description: 'In-person and online tutoring businesses',
      },
      {
        name: 'Online Course Creator',
        slug: 'online-course-creator',
        description:
          'Individuals and companies selling digital courses',
      },
      {
        name: 'Private School',
        slug: 'private-school',
        description: 'K-12 private schools and academies',
      },
      {
        name: 'Training Company',
        slug: 'training-company',
        description:
          'Corporate training and professional development providers',
      },
    ],
    categoryMappings: [
      // Universal
      {
        category: 'Learning Management System',
        relevance: 'essential',
        reason:
          'Deliver courses, track progress, and manage curriculum content',
      },
      {
        category: 'CRM',
        relevance: 'essential',
        reason:
          'Track student enrollment pipeline and parent/student relationships',
      },
      {
        category: 'Payment Processing',
        relevance: 'recommended',
        reason:
          'Collect tuition, course fees, and subscription payments',
      },
      {
        category: 'Accounting Software',
        relevance: 'recommended',
        reason: 'Manage tuition revenue, instructor pay, and expenses',
      },
      // Business-type-specific
      {
        category: 'Scheduling & Booking',
        relevance: 'essential',
        reason: 'Schedule sessions, manage tutor availability, and handle cancellations',
        businessTypes: ['tutoring-service'],
      },
      {
        category: 'E-commerce',
        relevance: 'essential',
        reason: 'Sell courses, materials, and digital content online',
        businessTypes: ['online-course-creator'],
      },
      {
        category: 'Website Builder',
        relevance: 'essential',
        reason:
          'Market courses, display catalogs, and accept enrollments online',
        businessTypes: ['online-course-creator'],
      },
      {
        category: 'Website Builder',
        relevance: 'recommended',
        reason:
          'Market programs, display schedules, and accept registrations',
        businessTypes: ['tutoring-service', 'private-school', 'training-company'],
      },
      {
        category: 'Email Marketing',
        relevance: 'essential',
        reason: 'Launch courses, nurture leads, and drive enrollment',
        businessTypes: ['online-course-creator'],
      },
      {
        category: 'Email Marketing',
        relevance: 'recommended',
        reason: 'Send enrollment campaigns, updates, and newsletters',
        businessTypes: ['private-school', 'training-company'],
      },
      {
        category: 'Marketing Automation',
        relevance: 'essential',
        reason: 'Automate enrollment funnels and student win-back campaigns',
        businessTypes: ['online-course-creator'],
      },
      {
        category: 'Marketing Automation',
        relevance: 'recommended',
        reason: 'Automate enrollment follow-ups and re-engagement campaigns',
        businessTypes: ['training-company'],
      },
      {
        category: 'Social Media Management',
        relevance: 'recommended',
        reason: 'Build brand awareness and showcase student success stories',
        businessTypes: ['online-course-creator', 'tutoring-service'],
      },
      {
        category: 'Project Management',
        relevance: 'recommended',
        reason: 'Coordinate curriculum development and training delivery',
        businessTypes: ['training-company'],
      },
    ],
  },

  // ──────────────────────────────────────────────
  // 10. Fitness & Wellness
  // ──────────────────────────────────────────────
  {
    name: 'Fitness & Wellness',
    slug: 'fitness-wellness',
    icon: 'Dumbbell',
    description:
      'Membership management, booking, and marketing tools for gyms, studios, spas, and wellness practitioners.',
    businessTypes: [
      {
        name: 'Gym',
        slug: 'gym',
        description: 'Fitness centers and health clubs',
      },
      {
        name: 'Yoga / Pilates Studio',
        slug: 'yoga-pilates-studio',
        description: 'Boutique fitness studios and class-based businesses',
      },
      {
        name: 'Personal Trainer',
        slug: 'personal-trainer',
        description: 'Independent personal trainers and small training studios',
      },
      {
        name: 'Spa & Salon',
        slug: 'spa-salon',
        description: 'Day spas, med spas, and beauty salons',
      },
    ],
    categoryMappings: [
      // Universal
      {
        category: 'Scheduling & Booking',
        relevance: 'essential',
        reason:
          'Manage class schedules, appointments, and trainer availability',
      },
      {
        category: 'CRM',
        relevance: 'essential',
        reason:
          'Track member relationships, visit history, and retention metrics',
      },
      {
        category: 'Payment Processing',
        relevance: 'essential',
        reason: 'Process memberships, class packs, and recurring payments',
      },
      // Business-type-specific
      {
        category: 'Marketing Automation',
        relevance: 'essential',
        reason:
          'Automate trial-to-member conversion and win-back campaigns',
        businessTypes: ['gym', 'yoga-pilates-studio'],
      },
      {
        category: 'Email Marketing',
        relevance: 'recommended',
        reason:
          'Send class reminders, promotions, and re-engagement campaigns',
        businessTypes: ['gym', 'yoga-pilates-studio', 'spa-salon'],
      },
      {
        category: 'Website Builder',
        relevance: 'essential',
        reason:
          'Build your personal brand, display certifications, and attract clients',
        businessTypes: ['personal-trainer'],
      },
      {
        category: 'Website Builder',
        relevance: 'recommended',
        reason:
          'Showcase services, display schedules, and enable online booking',
        businessTypes: ['gym', 'yoga-pilates-studio', 'spa-salon'],
      },
      {
        category: 'Social Media Management',
        relevance: 'essential',
        reason:
          'Share transformations, workout content, and build your personal brand',
        businessTypes: ['personal-trainer'],
      },
      {
        category: 'Social Media Management',
        relevance: 'recommended',
        reason:
          'Share class highlights, transformations, and build community',
        businessTypes: ['gym', 'yoga-pilates-studio'],
      },
      {
        category: 'Accounting Software',
        relevance: 'recommended',
        reason:
          'Track membership revenue, instructor pay, and operating expenses',
        businessTypes: ['gym', 'yoga-pilates-studio', 'spa-salon'],
      },
      {
        category: 'Point of Sale',
        relevance: 'recommended',
        reason: 'Sell retail products, supplements, and merchandise in-studio',
        businessTypes: ['gym', 'yoga-pilates-studio', 'spa-salon'],
      },
      {
        category: 'Invoicing & Billing',
        relevance: 'recommended',
        reason: 'Invoice clients for personal training packages and sessions',
        businessTypes: ['personal-trainer'],
      },
      {
        category: 'Inventory Management',
        relevance: 'nice-to-have',
        reason: 'Track retail product stock and spa supplies',
        businessTypes: ['spa-salon'],
      },
    ],
  },

  // ──────────────────────────────────────────────
  // 11. Home Services
  // ──────────────────────────────────────────────
  {
    name: 'Home Services',
    slug: 'home-services',
    icon: 'Wrench',
    description:
      'Scheduling, dispatching, and CRM tools for cleaning, landscaping, pest control, and other home service businesses.',
    businessTypes: [
      {
        name: 'Cleaning Service',
        slug: 'cleaning-service',
        description: 'Residential and commercial cleaning companies',
      },
      {
        name: 'Landscaping',
        slug: 'landscaping',
        description: 'Lawn care, landscaping, and grounds maintenance',
      },
      {
        name: 'Pest Control',
        slug: 'pest-control',
        description: 'Pest control and extermination services',
      },
      {
        name: 'Handyman',
        slug: 'handyman',
        description: 'General repair and home maintenance services',
      },
    ],
    categoryMappings: [
      // Universal
      {
        category: 'Field Service Management',
        relevance: 'essential',
        reason:
          'Dispatch technicians, track job progress, and manage routes',
      },
      {
        category: 'CRM',
        relevance: 'essential',
        reason:
          'Track customers, service history, and recurring appointment schedules',
      },
      {
        category: 'Scheduling & Booking',
        relevance: 'essential',
        reason:
          'Let customers book online and manage crew calendars',
      },
      {
        category: 'Accounting Software',
        relevance: 'essential',
        reason: 'Handle invoicing, payroll, and financial tracking',
      },
      // Business-type-specific
      {
        category: 'Payment Processing',
        relevance: 'essential',
        reason: 'Accept payments in the field via mobile devices',
        businessTypes: ['handyman', 'cleaning-service'],
      },
      {
        category: 'Payment Processing',
        relevance: 'recommended',
        reason: 'Process recurring service payments and one-time charges',
        businessTypes: ['landscaping', 'pest-control'],
      },
      {
        category: 'Marketing Automation',
        relevance: 'essential',
        reason: 'Automate seasonal reminders and recurring service renewal campaigns',
        businessTypes: ['pest-control', 'landscaping'],
      },
      {
        category: 'Marketing Automation',
        relevance: 'recommended',
        reason: 'Generate referrals and automate follow-up campaigns',
        businessTypes: ['cleaning-service'],
      },
      {
        category: 'Email Marketing',
        relevance: 'recommended',
        reason:
          'Send seasonal lawn care tips, service reminders, and referral requests',
        businessTypes: ['landscaping', 'pest-control'],
      },
      {
        category: 'Website Builder',
        relevance: 'essential',
        reason:
          'Build a local web presence with service areas and online booking',
        businessTypes: ['cleaning-service', 'pest-control'],
      },
      {
        category: 'Website Builder',
        relevance: 'recommended',
        reason: 'Showcase past work and collect leads online',
        businessTypes: ['landscaping', 'handyman'],
      },
      {
        category: 'SEO',
        relevance: 'essential',
        reason:
          'Rank for "near me" searches like "house cleaning near me"',
        businessTypes: ['cleaning-service', 'pest-control'],
      },
      {
        category: 'SEO',
        relevance: 'recommended',
        reason:
          'Rank for local service searches in your area',
        businessTypes: ['landscaping', 'handyman'],
      },
      {
        category: 'Invoicing & Billing',
        relevance: 'recommended',
        reason: 'Generate and send professional invoices after each job',
        businessTypes: ['handyman', 'landscaping'],
      },
      {
        category: 'HR & Payroll',
        relevance: 'recommended',
        reason: 'Manage cleaning crews, schedules, and payroll',
        businessTypes: ['cleaning-service'],
      },
    ],
  },

  // ──────────────────────────────────────────────
  // 12. Technology & SaaS
  // ──────────────────────────────────────────────
  {
    name: 'Technology & SaaS',
    slug: 'technology-saas',
    icon: 'Code',
    description:
      'Development, DevOps, analytics, and growth tools for software companies, startups, and tech teams.',
    businessTypes: [
      {
        name: 'SaaS Startup',
        slug: 'saas-startup',
        description:
          'Early-stage SaaS companies building and scaling products',
      },
      {
        name: 'Software Agency',
        slug: 'software-agency',
        description: 'Custom software development and consulting shops',
      },
      {
        name: 'Enterprise Software',
        slug: 'enterprise-software',
        description:
          'Established software companies serving enterprise clients',
      },
      {
        name: 'Mobile App',
        slug: 'mobile-app',
        description: 'Mobile application development companies',
      },
    ],
    categoryMappings: [
      // Universal
      {
        category: 'Project Management',
        relevance: 'essential',
        reason:
          'Plan sprints, track features, and manage product development',
      },
      {
        category: 'Team Collaboration',
        relevance: 'essential',
        reason:
          'Coordinate distributed engineering and product teams',
      },
      {
        category: 'CRM',
        relevance: 'essential',
        reason:
          'Manage sales pipeline from leads to enterprise deals',
      },
      // Business-type-specific
      {
        category: 'DevOps',
        relevance: 'essential',
        reason:
          'Automate CI/CD pipelines, deployments, and infrastructure management',
        businessTypes: ['saas-startup', 'enterprise-software', 'mobile-app'],
      },
      {
        category: 'Analytics',
        relevance: 'essential',
        reason:
          'Track product usage, user behavior, and conversion funnels',
        businessTypes: ['saas-startup', 'enterprise-software', 'mobile-app'],
      },
      {
        category: 'Customer Support',
        relevance: 'essential',
        reason:
          'Handle support tickets, bugs, and customer feature requests',
        businessTypes: ['saas-startup', 'enterprise-software'],
      },
      {
        category: 'Cybersecurity',
        relevance: 'essential',
        reason:
          'Protect customer data and secure application infrastructure',
        businessTypes: ['saas-startup', 'enterprise-software'],
      },
      {
        category: 'Customer Success',
        relevance: 'essential',
        reason:
          'Reduce churn with proactive onboarding and health scoring',
        businessTypes: ['saas-startup', 'enterprise-software'],
      },
      {
        category: 'Marketing Automation',
        relevance: 'essential',
        reason:
          'Drive trial signups and convert free users to paid plans',
        businessTypes: ['saas-startup'],
      },
      {
        category: 'Marketing Automation',
        relevance: 'recommended',
        reason: 'Generate leads for client engagements',
        businessTypes: ['software-agency'],
      },
      {
        category: 'Business Intelligence',
        relevance: 'essential',
        reason:
          'Analyze MRR, churn, LTV, and other SaaS metrics',
        businessTypes: ['saas-startup', 'enterprise-software'],
      },
      {
        category: 'Time Tracking & Productivity',
        relevance: 'essential',
        reason: 'Track billable hours per client project for accurate invoicing',
        businessTypes: ['software-agency'],
      },
      {
        category: 'Invoicing & Billing',
        relevance: 'essential',
        reason: 'Invoice clients for development milestones and ongoing work',
        businessTypes: ['software-agency'],
      },
      {
        category: 'Applicant Tracking System (ATS)',
        relevance: 'recommended',
        reason: 'Scale hiring for engineering and go-to-market teams',
        businessTypes: ['saas-startup', 'enterprise-software'],
      },
      {
        category: 'Knowledge Management',
        relevance: 'recommended',
        reason:
          'Document product specs, internal processes, and engineering decisions',
        businessTypes: ['enterprise-software', 'software-agency'],
      },
      {
        category: 'Analytics',
        relevance: 'recommended',
        reason: 'Track app store performance, downloads, and user engagement',
        businessTypes: ['mobile-app'],
      },
    ],
  },
];

// ──────────────────────────────────────────────
// Helper functions
// ──────────────────────────────────────────────

function relevanceOrder(r: CategoryMapping['relevance']): number {
  return r === 'essential' ? 0 : r === 'recommended' ? 1 : 2;
}

export function getIndustryBySlug(slug: string): Industry | undefined {
  return INDUSTRIES.find((i) => i.slug === slug);
}

export function getIndustryCategories(
  industry: Industry,
  businessTypeSlug?: string
): CategoryMapping[] {
  if (!businessTypeSlug || businessTypeSlug === 'all') {
    return industry.categoryMappings
      .filter((m) => !m.businessTypes)
      .sort(
        (a, b) => relevanceOrder(a.relevance) - relevanceOrder(b.relevance)
      );
  }

  return industry.categoryMappings
    .filter(
      (m) => !m.businessTypes || m.businessTypes.includes(businessTypeSlug)
    )
    .sort(
      (a, b) => relevanceOrder(a.relevance) - relevanceOrder(b.relevance)
    );
}
