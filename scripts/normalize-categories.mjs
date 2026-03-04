import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// ─── Config ──────────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes('--dry-run');
const WRITE = process.argv.includes('--write');

if (!DRY_RUN && !WRITE) {
  console.log('Usage: node scripts/normalize-categories.mjs [--dry-run | --write]');
  console.log('  --dry-run  Show mapping without writing to DB');
  console.log('  --write    Write normalized_category to DB');
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

// ─── Normalized Category Names ───────────────────────────────────────────────
// These are the ~50 target categories. The first 39 come from industries.ts,
// the rest cover products that don't fit any industry mapping.

const NORMALIZED_CATEGORIES = [
  // From industries.ts taxonomy
  'CRM',
  'Scheduling & Booking',
  'Accounting Software',
  'Payment Processing',
  'Cybersecurity',
  'Healthcare IT',
  'Marketing Automation',
  'Website Builder',
  'Email Marketing',
  'Customer Support',
  'Document Management',
  'Financial Management',
  'Business Intelligence',
  'Expense Management',
  'Invoicing & Billing',
  'Legal Tech',
  'Legal Practice Management',
  'Time Tracking & Productivity',
  'Project Management',
  'Social Media Management',
  'Property Management',
  'Point of Sale',
  'Inventory Management',
  'HR & Payroll',
  'Event Management',
  'E-commerce',
  'SEO',
  'Logistics & Shipping',
  'Team Collaboration',
  'Design & Prototyping',
  'IT Service Management',
  'Construction Management',
  'Field Service Management',
  'Learning Management System',
  'DevOps',
  'Analytics',
  'Customer Success',
  'Knowledge Management',
  'Applicant Tracking System (ATS)',
  // Additional categories for products outside industry taxonomy
  'Database',
  'Cloud Infrastructure',
  'Video Conferencing',
  'Workflow Automation',
  'Communication & Collaboration',
  'Identity & Access Management',
  'Productivity',
  'AI & Machine Learning',
  'Content Management System',
  'Data Integration',
  'Sales Intelligence',
  'No-Code/Low-Code',
  'Observability & Monitoring',
  'Password Management',
  'WordPress Themes & Plugins',
  'Sales Engagement',
  'Customer Data Platform',
  'Product Analytics',
  'Form Builder',
  'Survey & Feedback',
];

// ─── Exact Match Overrides ───────────────────────────────────────────────────
// Raw category → normalized name (highest priority)

const EXACT_MAP = {
  // Already normalized names pass through (handled by exact set check)

  // Accounting variants
  'Accounting': 'Accounting Software',
  'Accounting & Bookkeeping': 'Accounting Software',
  'Accounting & Bookkeeping Software': 'Accounting Software',
  'Accounting & Finance': 'Accounting Software',
  'Finance & Accounting': 'Accounting Software',
  'Finance & Billing': 'Invoicing & Billing',
  'Finance & Expense Management': 'Expense Management',
  'Finance & Payments': 'Payment Processing',
  'Finance & Spend Management': 'Expense Management',
  'Corporate Finance & Spend Management': 'Expense Management',
  'Procurement & Finance': 'Expense Management',
  'Spend Management / Finance Operations': 'Expense Management',

  // CRM variants
  'CRM Platform': 'CRM',
  'CRM and Project Management Software': 'CRM',
  'Sales CRM': 'CRM',
  'Real Estate CRM': 'CRM',
  'Sales Automation / CRM': 'CRM',
  'Work Management Platform / Project Management / CRM': 'CRM',

  // E-commerce variants (case-sensitive)
  'E-Commerce': 'E-commerce',
  'ecommerce': 'E-commerce',
  'eCommerce': 'E-commerce',
  'Ecommerce': 'E-commerce',
  'E-commerce Platform': 'E-commerce',
  'eCommerce Platform': 'E-commerce',
  'Ecommerce Platform': 'E-commerce',
  'Ecommerce Platform / Shopify Apps': 'E-commerce',
  'Ecommerce Optimization & Personalization': 'E-commerce',
  'eCommerce Reviews & UGC': 'E-commerce',
  'Unified Commerce Platform': 'E-commerce',

  // Website Builder variants
  'Website Builder / Business Platform': 'Website Builder',
  'Website Builder / Hosting': 'Website Builder',
  'Website Builder / Template Library': 'Website Builder',
  'Website Builder / Template Marketplace': 'Website Builder',
  'Website Builder / Template Provider': 'Website Builder',
  'Website Builder / Web Development Platform': 'Website Builder',
  'Website Builder / Web Hosting': 'Website Builder',
  'Website Builder / WordPress Theme': 'WordPress Themes & Plugins',
  'Website Builder / WordPress Theme & Plugin Suite': 'WordPress Themes & Plugins',
  'Website Builder & Templates': 'Website Builder',
  'Web Design & Development': 'Website Builder',
  'Landing Page Builder': 'Website Builder',
  'Static Site Generator': 'Website Builder',

  // WordPress variants
  'WordPress Page Builder & Design Tools': 'WordPress Themes & Plugins',
  'WordPress Page Builder & Plugin Suite': 'WordPress Themes & Plugins',
  'WordPress Theme & Page Builder': 'WordPress Themes & Plugins',
  'WordPress Themes': 'WordPress Themes & Plugins',
  'WordPress Themes & Templates': 'WordPress Themes & Plugins',
  'WordPress Themes and Plugins': 'WordPress Themes & Plugins',

  // Project Management variants
  'Project Management / Collaboration': 'Project Management',
  'Project Management / Task Management': 'Project Management',
  'Project Management / Work Management Platform': 'Project Management',
  'Project Management & Time Tracking': 'Project Management',
  'Project & Issue Tracking': 'Project Management',
  'Task Management / Project Management': 'Project Management',
  'Productivity / Project Management': 'Project Management',
  'Productivity / Task Management': 'Productivity',
  'Productivity / Task Management / Daily Planner': 'Productivity',
  'Work Management': 'Project Management',
  'Work Management / Project Management / Collaboration Platform': 'Project Management',
  'Work Operating System / Project Management / Collaboration Platform': 'Project Management',
  'Workspace Platform / Project Management / Knowledge Base': 'Project Management',
  'Product Management': 'Project Management',
  'Product Management / Customer Feedback': 'Project Management',
  'Product Management & Development': 'Project Management',
  'Product Management Software': 'Project Management',

  // Construction Management variants
  'Construction Management Software': 'Construction Management',
  'Construction Management / Collaboration Software': 'Construction Management',
  'Construction Management / Preconstruction Software': 'Construction Management',
  'Construction Management / Project Management': 'Construction Management',
  'Construction Management / Workforce Management': 'Construction Management',
  'Construction Management ERP': 'Construction Management',
  'Construction Project Management': 'Construction Management',
  'Construction Accounting Software': 'Construction Management',
  'Construction Bidding & Lead Generation': 'Construction Management',
  'Construction ERP & Project Management': 'Construction Management',
  'Construction Estimating & Takeoff Software': 'Construction Management',
  'Construction Intelligence & Lead Generation': 'Construction Management',
  'ERP - Construction': 'Construction Management',
  'Project Information Management / Construction Management': 'Construction Management',

  // HR variants
  'HR & Payroll Software': 'HR & Payroll',
  'HR Management': 'HR & Payroll',
  'HR Software / ATS / HRIS': 'HR & Payroll',
  'HR Software / HRIS / Talent Management': 'HR & Payroll',
  'HR Software / HRMS': 'HR & Payroll',
  'HR Software / People Operations Platform': 'HR & Payroll',
  'HR Tech': 'HR & Payroll',
  'HR Tech / Employee Experience Platform': 'HR & Payroll',
  'HR/Payroll': 'HR & Payroll',
  'HRIS/HCM': 'HR & Payroll',
  'HCM (Human Capital Management)': 'HR & Payroll',
  'Human Resources': 'HR & Payroll',
  'Human Resources & Payroll': 'HR & Payroll',
  'Human Resources Management': 'HR & Payroll',
  'Payroll & HR': 'HR & Payroll',
  'Payroll & HR Software': 'HR & Payroll',
  'Payroll Management': 'HR & Payroll',
  'Payroll Software': 'HR & Payroll',
  'Performance Management / HR Software': 'HR & Payroll',
  'Workforce Management': 'HR & Payroll',
  'Labor Cost Management / Time Tracking': 'Time Tracking & Productivity',
  'Time Tracking & Payroll': 'Time Tracking & Productivity',
  'Time Tracking & Project Management': 'Time Tracking & Productivity',

  // Cybersecurity variants
  'Cybersecurity - SIEM': 'Cybersecurity',
  'Cybersecurity - Vulnerability Management & Exposure Management': 'Cybersecurity',
  'Cybersecurity / MDR (Managed Detection & Response)': 'Cybersecurity',
  'Cybersecurity / Network Detection and Response': 'Cybersecurity',
  'Cybersecurity / Network Security': 'Cybersecurity',
  'Cybersecurity / Security Operations': 'Cybersecurity',
  'Cybersecurity Consulting': 'Cybersecurity',
  'Cybersecurity Platform': 'Cybersecurity',
  'Application Security': 'Cybersecurity',
  'Cloud Security': 'Cybersecurity',
  'Cloud Security / CNAPP': 'Cybersecurity',
  'Cloud Security / Zero Trust Network Access': 'Cybersecurity',
  'Cloud Security & Network Access': 'Cybersecurity',
  'Cloud Infrastructure & Security': 'Cybersecurity',
  'Data Security': 'Cybersecurity',
  'Email Security': 'Cybersecurity',
  'Email Security & Human Risk Management': 'Cybersecurity',
  'Enterprise Security': 'Cybersecurity',
  'Network Security': 'Cybersecurity',
  'Security & Compliance': 'Cybersecurity',
  'Security & Identity Management': 'Cybersecurity',
  'Security & Password Management': 'Password Management',
  'Security Awareness Training': 'Cybersecurity',
  'Security and Observability Platform': 'Cybersecurity',
  'Code Quality & Security': 'Cybersecurity',

  // Communication variants
  'Communication': 'Communication & Collaboration',
  'Communication & Collaboration': 'Communication & Collaboration',
  'Communication Platform': 'Communication & Collaboration',
  'Communications': 'Communication & Collaboration',
  'Communications Platform': 'Communication & Collaboration',
  'Business Communications': 'Communication & Collaboration',
  'Enterprise Communication & Collaboration': 'Communication & Collaboration',
  'Unified Communications & Collaboration': 'Communication & Collaboration',
  'Secure Communication & Collaboration': 'Communication & Collaboration',
  'Secure Communications & Collaboration': 'Communication & Collaboration',
  'Real-time Communications': 'Communication & Collaboration',
  'Internal Communications': 'Communication & Collaboration',
  'Writing & Communication': 'Communication & Collaboration',

  // Messaging
  'Messaging': 'Communication & Collaboration',
  'Instant Messaging': 'Communication & Collaboration',
  'Private Messaging': 'Communication & Collaboration',
  'Secure Messaging': 'Communication & Collaboration',
  'Secure Messaging / Unified Communication': 'Communication & Collaboration',
  'Secure Messaging & File Sharing': 'Communication & Collaboration',

  // Team Collaboration variants
  'Team Collaboration & Communication': 'Team Collaboration',
  'Team Communication': 'Team Collaboration',
  'Team Communication & Collaboration': 'Team Collaboration',
  'Collaboration & Productivity': 'Team Collaboration',
  'Productivity & Collaboration': 'Team Collaboration',
  'Content Collaboration Platform': 'Team Collaboration',

  // Customer Support variants
  'Customer Communication & Support': 'Customer Support',
  'Customer Communication Platform': 'Customer Support',
  'Customer Service': 'Customer Support',
  'Customer Service / Knowledge Management': 'Customer Support',
  'Customer Service & Support': 'Customer Support',
  'Customer Service Platform / Helpdesk Software': 'Customer Support',
  'Customer Support / Helpdesk': 'Customer Support',
  'Help Desk / Customer Support Platform': 'Customer Support',
  'Conversational AI': 'Customer Support',

  // Customer Success variants
  'Customer Success Management': 'Customer Success',
  'Customer Success Platform': 'Customer Success',

  // Customer Experience → Customer Success
  'Customer Experience': 'Customer Success',
  'Customer Experience & Reviews': 'Customer Success',
  'Customer Experience Analytics': 'Customer Success',
  'Customer Experience Management': 'Customer Success',
  'Customer Experience Management (CXM)': 'Customer Success',
  'Customer Experience Platform / Marketing Automation': 'Marketing Automation',
  'Customer Engagement': 'Customer Success',
  'Customer Engagement Platform': 'Customer Success',
  'Customer Feedback & Analytics': 'Customer Success',
  'Customer Reviews & Reputation Management': 'Customer Success',
  'Reputation Management': 'Customer Success',
  'Product Experience': 'Customer Success',

  // Customer Data Platform
  'Customer Data Platform': 'Customer Data Platform',

  // Marketing Automation variants
  'Marketing Automation / AI Marketing Platform': 'Marketing Automation',
  'Marketing Automation / Conversion Optimization': 'Marketing Automation',
  'Marketing Automation / Landing Page Builder': 'Marketing Automation',
  'Marketing Automation & CRM': 'Marketing Automation',
  'Marketing Automation & CRM Platform': 'Marketing Automation',
  'Marketing Automation & Customer Data Platform': 'Marketing Automation',
  'Marketing Automation & Webinar Platform': 'Marketing Automation',
  'Email Marketing & Marketing Automation': 'Marketing Automation',
  'Email Marketing Automation': 'Marketing Automation',
  'Marketing Technology': 'Marketing Automation',
  'Marketing': 'Marketing Automation',
  'Digital Marketing': 'Marketing Automation',
  'Marketing & Conversion Optimization': 'Marketing Automation',
  'Marketing & Social Selling': 'Marketing Automation',
  'GTM AI Platform': 'Marketing Automation',
  'Conversion Rate Optimization (CRO)': 'Marketing Automation',
  'Lead Generation & Conversion Optimization': 'Marketing Automation',
  'Lead Generation & Sales Automation': 'Sales Intelligence',

  // Email Marketing variants
  'Email Marketing Platform': 'Email Marketing',
  'Email & Communication': 'Email Marketing',
  'Email & Calendar Management': 'Email Marketing',
  'Email Management': 'Email Marketing',

  // Social Media variants
  'Social Media Management & Monitoring': 'Social Media Management',
  'Social Listening & Analytics': 'Social Media Management',
  'Social Listening & Media Monitoring': 'Social Media Management',
  'Content Marketing': 'Social Media Management',
  'Content Marketing / Social Media Management': 'Social Media Management',
  'Content Creation': 'Social Media Management',
  'Marketing & Influencer Management': 'Social Media Management',

  // SEO variants
  'SEO & Content Marketing': 'SEO',
  'SEO & Marketing': 'SEO',
  'SEO & Marketing Analytics': 'SEO',
  'SEO & Marketing Intelligence': 'SEO',
  'SEO Tools': 'SEO',
  'Web Analytics': 'Analytics',

  // Sales Intelligence & Engagement
  'Sales Intelligence': 'Sales Intelligence',
  'Sales Intelligence & Automation': 'Sales Intelligence',
  'Sales Intelligence & Engagement': 'Sales Intelligence',
  'Sales Intelligence & Revenue Operations': 'Sales Intelligence',
  'B2B Data & Intelligence': 'Sales Intelligence',
  'Sales & Lead Generation': 'Sales Intelligence',
  'Sales & Prospecting': 'Sales Intelligence',
  'Sales Execution Platform': 'Sales Intelligence',
  'Sales & Marketing Automation': 'Sales Intelligence',

  // Sales Engagement
  'Sales Engagement': 'Sales Engagement',
  'Sales Engagement / Prospecting': 'Sales Engagement',
  'Sales Engagement & Lead Management': 'Sales Engagement',
  'Sales Engagement Platform': 'Sales Engagement',
  'Sales & Proposal Management': 'Sales Engagement',
  'Sales & Proposals': 'Sales Engagement',
  'Meeting Intelligence / Sales Enablement': 'Sales Engagement',

  // Analytics variants
  'Analytics & Business Intelligence': 'Analytics',
  'Business Intelligence & Analytics': 'Analytics',
  'Data Analytics': 'Analytics',
  'Data Analytics & Monitoring': 'Analytics',
  'Search & Analytics': 'Analytics',

  // Product Analytics
  'Product Analytics': 'Product Analytics',
  'Product Analytics & Experience Management': 'Product Analytics',
  'Product Analytics & Experience Platform': 'Product Analytics',
  'Product Analytics & Feature Management': 'Product Analytics',

  // Design variants
  'Design & Animation Tools': 'Design & Prototyping',
  'Design & Collaboration': 'Design & Prototyping',
  'Design & Collaboration Tool': 'Design & Prototyping',
  'Design & Collaboration Tools': 'Design & Prototyping',
  'Design & Content Creation': 'Design & Prototyping',
  'Design & Creative': 'Design & Prototyping',
  'Design & Creative Software': 'Design & Prototyping',
  'Design & Creativity': 'Design & Prototyping',
  'Design & Graphics': 'Design & Prototyping',
  'Design & Visual Content Creation': 'Design & Prototyping',
  'Design & Visualization': 'Design & Prototyping',
  'Design Collaboration': 'Design & Prototyping',
  'Design Tools': 'Design & Prototyping',
  'Graphic Design': 'Design & Prototyping',
  'Graphic Design / Design Software': 'Design & Prototyping',
  'Digital Art & Creative Software': 'Design & Prototyping',
  'Diagramming & Charting': 'Design & Prototyping',
  'Diagramming & Visual Collaboration': 'Design & Prototyping',
  'Motion Design & Animation': 'Design & Prototyping',

  // Presentation
  'Presentation Software': 'Design & Prototyping',
  'Productivity & Presentation': 'Productivity',
  'Productivity & Presentation Software': 'Productivity',

  // Video
  'Video Communication & Collaboration': 'Video Conferencing',
  'Video Conferencing & Webinar Software': 'Video Conferencing',
  'Web Conferencing & Online Meeting Software': 'Video Conferencing',
  'Virtual Classroom / Video Conferencing': 'Video Conferencing',
  'Webinar & Virtual Event Platform': 'Video Conferencing',
  'Live Streaming': 'Video Conferencing',
  'Live Streaming & Broadcasting': 'Video Conferencing',
  'Video Infrastructure': 'Video Conferencing',
  'Video Management': 'Video Conferencing',
  'Video Marketing': 'Video Conferencing',
  'Video Creation & Editing': 'Design & Prototyping',
  'Video Creation & Marketing': 'Design & Prototyping',
  'Audio & Video Editing': 'Design & Prototyping',
  'AI Content Creation & Video Generation': 'AI & Machine Learning',
  'AI Video Creation': 'AI & Machine Learning',

  // Meeting Intelligence
  'Meeting Intelligence / AI Notetaker': 'Productivity',
  'Meeting Intelligence & AI Productivity': 'Productivity',
  'Meeting Intelligence & Notetaking': 'Productivity',
  'Meeting Intelligence & Productivity': 'Productivity',
  'Voice AI / Meeting Intelligence': 'Productivity',

  // DevOps variants
  'DevOps & Continuous Delivery Platform': 'DevOps',
  'DevOps & Infrastructure': 'DevOps',
  'CI/CD': 'DevOps',
  'Feature Management / DevOps': 'DevOps',
  'Feature Management & Experimentation Platform': 'DevOps',
  'Infrastructure & DevOps': 'DevOps',
  'Infrastructure Automation': 'DevOps',
  'Infrastructure Management': 'DevOps',
  'Container Management': 'DevOps',
  'Container Orchestration': 'DevOps',
  'Container Platform': 'DevOps',
  'Web Hosting & DevOps': 'DevOps',

  // Cloud / Platform
  'Cloud Computing Platform': 'Cloud Infrastructure',
  'Cloud Infrastructure': 'Cloud Infrastructure',
  'Cloud Platform': 'Cloud Infrastructure',
  'Cloud Storage': 'Cloud Infrastructure',
  'Cloud Storage/Content Management': 'Cloud Infrastructure',
  'Platform as a Service': 'Cloud Infrastructure',
  'Platform as a Service (PaaS)': 'Cloud Infrastructure',
  'PaaS / Serverless Platform': 'Cloud Infrastructure',
  'Serverless Computing / Edge Computing': 'Cloud Infrastructure',
  'Backend as a Service': 'Cloud Infrastructure',
  'Backend Platform': 'Cloud Infrastructure',
  'Backend-as-a-Service': 'Cloud Infrastructure',

  // Database
  'Vector Database': 'Database',
  'Vector Database / Search Platform': 'Database',
  'Data Warehousing': 'Database',

  // AI & ML
  'AI Agent Platform': 'AI & Machine Learning',
  'AI App Builder / No-Code Platform': 'AI & Machine Learning',
  'AI Assistant / Large Language Model': 'AI & Machine Learning',
  'AI Content Generation': 'AI & Machine Learning',
  'AI Meeting Assistant': 'AI & Machine Learning',
  'AI Platform': 'AI & Machine Learning',
  'AI/ML Platform': 'AI & Machine Learning',
  'Enterprise AI / Agentic AI Platform': 'AI & Machine Learning',
  'Machine Learning / Data Labeling': 'AI & Machine Learning',
  'Machine Learning & AI': 'AI & Machine Learning',
  'Data Labeling & Annotation': 'AI & Machine Learning',
  'ML Operations': 'AI & Machine Learning',
  'ML/AI Development': 'AI & Machine Learning',

  // Data Integration
  'Data Integration': 'Data Integration',
  'Data Integration / ETL': 'Data Integration',
  'Data Integration & Analytics Platform': 'Data Integration',
  'Data Integration & ETL': 'Data Integration',
  'Data Activation / Reverse ETL': 'Data Integration',
  'Data Extraction & Web Scraping': 'Data Integration',
  'Data Management': 'Data Integration',
  'Data Orchestration': 'Data Integration',
  'Web Scraping & Data Extraction': 'Data Integration',
  'Big Data & Distributed Computing': 'Data Integration',

  // Identity & Access Management
  'Identity & Access Management': 'Identity & Access Management',
  'Identity & Access Management (IAM)': 'Identity & Access Management',
  'Identity and Access Management (CIAM)': 'Identity & Access Management',
  'Identity and Access Management (IAM)': 'Identity & Access Management',
  'Authentication & User Management': 'Identity & Access Management',
  'Membership & Authentication Platform': 'Identity & Access Management',

  // Password Management
  'Password Management': 'Password Management',
  'Password Management / Identity & Access Management': 'Password Management',
  'Password Management & Credential Security': 'Password Management',
  'Password Management & Identity Security': 'Password Management',
  'Password Manager': 'Password Management',
  'Password Manager / Identity & Access Management': 'Password Management',

  // Workflow / Automation
  'Workflow Automation': 'Workflow Automation',
  'Workflow Automation & AI Agents': 'Workflow Automation',
  'Workflow Management': 'Workflow Automation',
  'Workflow Orchestration': 'Workflow Automation',
  'Workflow Orchestration & AI Infrastructure': 'Workflow Automation',
  'Automation': 'Workflow Automation',
  'Automation & Integration': 'Workflow Automation',
  'Automation & Integration Platform': 'Workflow Automation',
  'Automation & Workflow': 'Workflow Automation',
  'Integration & Automation': 'Workflow Automation',
  'Integration Platform': 'Workflow Automation',
  'Integration Platform as a Service': 'Workflow Automation',
  'Integration Platform as a Service (iPaaS)': 'Workflow Automation',
  'Process Automation': 'Workflow Automation',
  'Robotic Process Automation': 'Workflow Automation',
  'RPA': 'Workflow Automation',
  'RPA & Process Automation': 'Workflow Automation',
  'Business Process Management': 'Workflow Automation',
  'Digital Operations Platform': 'Workflow Automation',

  // No-Code/Low-Code
  'No-Code App Development': 'No-Code/Low-Code',
  'No-Code Development': 'No-Code/Low-Code',
  'No-Code Platform': 'No-Code/Low-Code',
  'Low-Code Development': 'No-Code/Low-Code',
  'Low-Code Development Platform': 'No-Code/Low-Code',
  'Low-Code Platform': 'No-Code/Low-Code',
  'Low-Code/No-Code': 'No-Code/Low-Code',
  'Low-Code/No-Code App Development Platform': 'No-Code/Low-Code',

  // IT Service Management variants
  'IT Service Management (ITSM)': 'IT Service Management',
  'IT Management': 'IT Service Management',
  'IT Management & Security': 'IT Service Management',
  'Enterprise Service Management': 'IT Service Management',

  // Observability
  'Observability & Monitoring': 'Observability & Monitoring',
  'Observability Platform': 'Observability & Monitoring',
  'Monitoring & Observability': 'Observability & Monitoring',
  'Application Monitoring': 'Observability & Monitoring',
  'Application Performance Monitoring': 'Observability & Monitoring',
  'Application Performance Monitoring (APM)': 'Observability & Monitoring',
  'Error Monitoring & Observability': 'Observability & Monitoring',
  'Log Management & Observability': 'Observability & Monitoring',
  'Incident Management': 'Observability & Monitoring',

  // CMS
  'CMS': 'Content Management System',
  'Content Management': 'Content Management System',
  'Content Management System': 'Content Management System',
  'Content Management System (CMS)': 'Content Management System',
  'Headless CMS': 'Content Management System',
  'Publishing Platform / Newsletter Platform': 'Content Management System',
  'Media Management': 'Content Management System',

  // Document Management variants
  'Document Management & DMS': 'Document Management',
  'Documentation & Knowledge Management': 'Knowledge Management',
  'Digital Signature & Contract Management': 'Document Management',
  'PDF Generation / Document Management': 'Document Management',
  'Contract Lifecycle Management (CLM)': 'Document Management',

  // Knowledge Management variants
  'Knowledge Management / Note-Taking': 'Knowledge Management',
  'Note-Taking / Knowledge Management': 'Knowledge Management',

  // Scheduling & Booking variants
  'Appointment Scheduling / Booking Management': 'Scheduling & Booking',
  'Appointment Scheduling & Booking Software': 'Scheduling & Booking',
  'Scheduling & Calendar': 'Scheduling & Booking',
  'Scheduling & Calendar Management': 'Scheduling & Booking',
  'Calendar Management & Time Management': 'Scheduling & Booking',
  'Productivity & Scheduling': 'Scheduling & Booking',

  // Payment Processing variants
  'Payment Processing & Billing': 'Payment Processing',
  'Payment Processing & Financial Technology': 'Payment Processing',
  'Payment Processing & POS': 'Payment Processing',
  'Payments & Billing': 'Payment Processing',
  'Billing & Payments': 'Payment Processing',
  'Billing & Revenue Management': 'Payment Processing',
  'Subscription Management': 'Payment Processing',

  // Financial Management variants
  'Business Banking / Financial Management SaaS': 'Financial Management',
  'Business Banking / Fintech': 'Financial Management',
  'Business Banking & Financial Management': 'Financial Management',
  'FinTech': 'Financial Management',

  // Legal variants
  'Legal Software': 'Legal Tech',
  'Legal Technology': 'Legal Tech',
  'Compliance & Risk Management': 'Legal Tech',
  'Compliance Management': 'Legal Tech',
  'Governance & Compliance': 'Legal Tech',
  'GRC/Compliance Management': 'Legal Tech',

  // Logistics & Shipping
  'Shipping & Logistics': 'Logistics & Shipping',
  'Logistics & Fulfillment': 'Logistics & Shipping',
  'Fulfillment & Logistics': 'Logistics & Shipping',

  // Property Management
  'Real Estate Management': 'Property Management',

  // Healthcare
  'Healthcare': 'Healthcare IT',

  // Field Service Management
  'Field Service Management / ERP': 'Field Service Management',
  'Maintenance Management Software': 'Field Service Management',
  'Maintenance Management Software / CMMS': 'Field Service Management',
  'Facilities Management Software': 'Field Service Management',

  // Learning / Education
  'Learning Management System (LMS)': 'Learning Management System',
  'Learning Management': 'Learning Management System',
  'Learning & Development': 'Learning Management System',
  'E-Learning & Course Creation': 'Learning Management System',
  'E-Learning Platform': 'Learning Management System',
  'Education Technology': 'Learning Management System',
  'Course Creation & Digital Products': 'Learning Management System',

  // Event Management
  'Webinar & Virtual Event Platform': 'Event Management',

  // Expense Management
  'Expense Management & Accounting': 'Expense Management',

  // ERP → Financial Management
  'Enterprise Resource Planning': 'Financial Management',
  'Enterprise Resource Planning (ERP)': 'Financial Management',
  'Manufacturing ERP': 'Financial Management',

  // Productivity variants
  'Productivity': 'Productivity',
  'Productivity & Documentation': 'Productivity',
  'Productivity & Time Management': 'Productivity',
  'Business Productivity': 'Productivity',
  'Business Management': 'Productivity',

  // Developer Tools
  'Developer Tools': 'DevOps',
  'API Development': 'DevOps',
  'API Documentation & Developer Portal': 'DevOps',
  'Web Development Framework': 'DevOps',
  'Web Framework': 'DevOps',
  'Test Automation Platform': 'DevOps',
  'Testing & QA': 'DevOps',
  'QA & Testing': 'DevOps',

  // ATS variants
  'Applicant Tracking System': 'Applicant Tracking System (ATS)',
  'ATS (Applicant Tracking System)': 'Applicant Tracking System (ATS)',

  // Digital Adoption & User Research
  'Digital Adoption Platform': 'Product Analytics',
  'User Research': 'Product Analytics',

  // Surveys & Feedback
  'Survey & Feedback Software': 'Survey & Feedback',
  'Survey & Research Software': 'Survey & Feedback',
  'Market Research & Surveys': 'Survey & Feedback',
  'Forms & Surveys': 'Form Builder',

  // Form Builders
  'Form Builder': 'Form Builder',
  'Forms & Data Collection': 'Form Builder',
  'Form Builder / Workflow Automation': 'Form Builder',

  // Inventory
  'Asset Management & Inventory Tracking': 'Inventory Management',

  // Misc
  'Community Building Platform': 'Communication & Collaboration',
  'Community Platform': 'Communication & Collaboration',
  'Creator Economy': 'E-commerce',
  'SaaS Marketplace': 'Analytics',
  'SaaS Review Platform': 'Analytics',
  'SaaS Reviews & Analytics': 'Analytics',
  'Domain For Sale': 'Website Builder',
  'Domain Name / Digital Asset': 'Website Builder',
  'Domain Registrar/Marketplace': 'Website Builder',
  'Domain Registration & Web Services Platform': 'Website Builder',
  'Enterprise Software Consulting & Integration': 'IT Service Management',
  'Vertical Market Software Holding Company / M&A Platform': 'Financial Management',
  'Travel & Remote Work': 'Productivity',
  'Mobile App Monetization': 'E-commerce',
  'Power Tools & Equipment Manufacturing': 'E-commerce',
  'EDA (Electronic Design Automation) / Semiconductor Design Tools': 'Design & Prototyping',
  'AI Data & Infrastructure': 'AI & Machine Learning',
};

// ─── Keyword Rules (fallback after exact matches) ────────────────────────────
// Order matters — first match wins. More specific rules go first.

const KEYWORD_RULES = [
  // Construction — before general "Project Management"
  [/construction|preconstruction|BIM|building information/i, 'Construction Management'],
  // Healthcare / Dental / Medical
  [/dental|dentist/i, 'Healthcare IT'],
  [/healthcare|health care|medical|clinical|EHR|EMR|telemedicine|telehealth|patient|pharmacy|HIPAA|veterinar/i, 'Healthcare IT'],
  // ATS / Recruitment
  [/\bATS\b|applicant tracking|recruitment|talent acquisition|hiring/i, 'Applicant Tracking System (ATS)'],
  // Legal
  [/legal practice/i, 'Legal Practice Management'],
  [/\blegal\b|law firm|attorney|litigation|contract management|contract lifecycle|CLM\b|eSign|e-sign/i, 'Legal Tech'],
  // CRM (before general sales)
  [/\bCRM\b|customer relationship/i, 'CRM'],
  // Point of Sale (before general payment)
  [/\bPOS\b|point of sale/i, 'Point of Sale'],
  // Payment / Billing / Invoicing
  [/invoic|billing & subscription|subscription management|subscription billing/i, 'Invoicing & Billing'],
  [/payment|fintech|financial technology|checkout|merchant/i, 'Payment Processing'],
  // Accounting
  [/accounting|bookkeeping|tax software|tax compliance|tax management/i, 'Accounting Software'],
  // Expense Management
  [/expense management|spend management|AP automation|accounts payable|procure-to-pay/i, 'Expense Management'],
  // Financial Management / Banking / ERP
  [/\bERP\b|enterprise resource planning|banking|financial management|financial planning|financial service/i, 'Financial Management'],
  // Field Service Management
  [/field service|CMMS|maintenance management|facilities management/i, 'Field Service Management'],
  // Property Management
  [/property management|real estate(?! CRM)|vacation rental|rental management/i, 'Property Management'],
  // Inventory
  [/inventory management|inventory tracking|warehouse management|supply chain management/i, 'Inventory Management'],
  // Logistics & Shipping
  [/logistics|shipping|freight|fulfillment|fleet management|delivery management|delivery & logistics|route/i, 'Logistics & Shipping'],
  // E-commerce
  [/e-?commerce|ecommerce|shopify|online store|product feed|commerce platform/i, 'E-commerce'],
  // Scheduling & Booking
  [/scheduling|booking|appointment|reservation/i, 'Scheduling & Booking'],
  // HR & Payroll
  [/\bHR\b|human resource|payroll|HRIS|HCM|workforce management|employee|onboarding|talent management|people operations|people management|background check|background screen/i, 'HR & Payroll'],
  // Learning Management
  [/LMS\b|learning management|e-learning|online course|course creation|education tech|EdTech|training platform|learning platform/i, 'Learning Management System'],
  // Event Management
  [/event management|event planning|ticketing|webinar|virtual event/i, 'Event Management'],
  // Password Management
  [/password manag|password vault|credential/i, 'Password Management'],
  // Identity & Access Management
  [/identity.*access|IAM\b|CIAM\b|access management|single sign-on|SSO\b|authentication/i, 'Identity & Access Management'],
  // Cybersecurity (broad — after more specific security categories)
  [/cybersecurity|cyber security|security platform|threat|SIEM\b|SOC\b|endpoint protection|firewall|vulnerability|penetration test|MDR\b|XDR\b|zero trust|devsecops|anti-?virus|malware|ransomware|CASB|DLP\b|security awareness|security training|network security|app(?:lication)? security|cloud security|data security|email security|security compliance|information security|infosec|GRC\b|risk management|compliance management|compliance automation/i, 'Cybersecurity'],
  // Observability & Monitoring
  [/observability|APM\b|application performance|monitoring|error tracking|incident management|alerting|log management|tracing/i, 'Observability & Monitoring'],
  // IT Service Management
  [/ITSM\b|IT service management|IT management|helpdesk|help desk|service desk|asset management|ITIL\b/i, 'IT Service Management'],
  // DevOps (broad)
  [/devops|CI\/?CD|continuous delivery|continuous integration|container|kubernetes|docker|terraform|infrastructure as code|GitOps|feature flag|feature management|testing.*QA|QA.*testing|test automation|API develop|API gateway|API management|API testing|API monitor|API documentation|SDK|developer tool|developer platform|code quality|code review|static analysis|source control|version control/i, 'DevOps'],
  // Cloud Infrastructure
  [/cloud infrastructure|cloud platform|cloud computing|serverless|PaaS\b|BaaS\b|backend.as.a.service|platform as a service|cloud hosting|cloud storage|cloud backup|CDN\b|edge computing|cloud cost/i, 'Cloud Infrastructure'],
  // Database
  [/\bdatabase\b|data warehouse|vector database|time series|NoSQL|PostgreSQL|MySQL|Redis|graph database/i, 'Database'],
  // Data Integration
  [/data integration|ETL\b|ELT\b|data pipeline|data orchestration|data replication|data streaming|reverse ETL|data extraction|web scraping|data connector/i, 'Data Integration'],
  // AI & Machine Learning
  [/\bAI\b|artificial intelligence|machine learning|\bML\b|deep learning|NLP\b|natural language|computer vision|generative AI|LLM\b|large language model|GPT|neural network|data labeling|data annotation|speech recognition/i, 'AI & Machine Learning'],
  // No-Code/Low-Code
  [/no-?code|low-?code|app builder|visual development|citizen developer/i, 'No-Code/Low-Code'],
  // Workflow Automation
  [/workflow|automation platform|RPA\b|robotic process|integration platform|iPaaS\b|process automation|business process|zapier|make\.com/i, 'Workflow Automation'],
  // Content Management System
  [/\bCMS\b|content management system|headless CMS/i, 'Content Management System'],
  // WordPress
  [/wordpress|WooCommerce/i, 'WordPress Themes & Plugins'],
  // Website Builder
  [/website builder|web builder|page builder|landing page|web design|site builder|web hosting/i, 'Website Builder'],
  // Email Marketing
  [/email marketing|newsletter|email campaign|email automation/i, 'Email Marketing'],
  // Marketing Automation
  [/marketing automation|marketing platform|marketing cloud|campaign management|lead generation|conversion optimization|CRO\b|A\/B test|personalization|marketing intelligence|demand generation|inbound marketing|outbound marketing|marketing analytics/i, 'Marketing Automation'],
  // SEO
  [/\bSEO\b|search engine optimization|keyword research|backlink|link building|SERP/i, 'SEO'],
  // Social Media Management
  [/social media|social listening|social monitoring|influencer|content marketing|brand monitoring|reputation management/i, 'Social Media Management'],
  // Sales Intelligence
  [/sales intelligence|sales data|B2B data|lead intelligence|sales analytics|prospecting|sales automation|revenue intelligence|revenue operations/i, 'Sales Intelligence'],
  // Sales Engagement
  [/sales engagement|sales enablement|sales readiness|proposal management|CPQ\b|sales quoting|conversation intelligence|call tracking|call analytics/i, 'Sales Engagement'],
  // Customer Data Platform
  [/customer data platform|\bCDP\b/i, 'Customer Data Platform'],
  // Customer Support (broad)
  [/customer support|customer service|helpdesk|help desk|contact center|call center|live chat|chatbot|ticketing system|support ticket|CCaaS/i, 'Customer Support'],
  // Customer Success (broad)
  [/customer success|customer experience|customer engagement|customer feedback|customer loyalty|customer retention|customer journey|NPS\b|net promoter|CSAT\b|voice of customer|user feedback/i, 'Customer Success'],
  // Survey & Feedback
  [/survey|feedback.*platform|user research|market research|NPS\b.*survey|voice of customer/i, 'Survey & Feedback'],
  // Form Builder
  [/form builder|data collection|form management|form.*automation/i, 'Form Builder'],
  // Product Analytics
  [/product analytics|digital adoption|user behavior|session replay|heatmap|A\/B test.*product|feature flag.*product/i, 'Product Analytics'],
  // Analytics / BI (broad)
  [/analytics|business intelligence|\bBI\b|data visualization|dashboard|reporting|data analytics/i, 'Analytics'],
  // Communication & Collaboration
  [/VoIP|phone system|unified communication|video conferencing|video call|web conferenc|virtual meeting|video meeting|video platform/i, 'Video Conferencing'],
  [/communication|messaging|chat platform|collaboration.*platform|team communication|team messaging|internal comms/i, 'Communication & Collaboration'],
  // Team Collaboration
  [/team collaboration|project collaboration|work collaboration|knowledge base|wiki|intranet|digital workplace|employee engagement/i, 'Team Collaboration'],
  // Knowledge Management
  [/knowledge management|documentation|note-?taking|knowledge base/i, 'Knowledge Management'],
  // Document Management
  [/document management|document automation|PDF|file management|file sharing|digital signature/i, 'Document Management'],
  // Design & Prototyping (broad)
  [/design|prototyp|wireframe|mockup|UX\/UI|graphic|illustration|animation|3D|CAD\b|CAM\b|rendering|creative software|photo edit|image edit|video edit|video creation|screen record/i, 'Design & Prototyping'],
  // Project Management (broad — keep near end)
  [/project management|task management|work management|agile|scrum|kanban|issue tracking|bug tracking|product management|roadmap/i, 'Project Management'],
  // Time Tracking
  [/time tracking|time management|timesheet|clock in|attendance/i, 'Time Tracking & Productivity'],
  // Advertising / AdTech → Marketing Automation
  [/advertis|ad\s?tech|\bDSP\b|\bSSP\b|programmatic|media buying|affiliate market|partner management/i, 'Marketing Automation'],
  // IoT
  [/\bIoT\b|internet of things|connected device|smart device|connected mobility|telematics/i, 'Cloud Infrastructure'],
  // VPN / Privacy
  [/\bVPN\b|privacy.*security|proxy|anonymiz/i, 'Cybersecurity'],
  // Writing tools
  [/writing.*assist|writing.*tool|grammar|copywriting|content.*writing|AI writing/i, 'AI & Machine Learning'],
  // Manufacturing
  [/manufactur|MES\b|quality management system|industrial/i, 'Financial Management'],
  // App Development → DevOps
  [/app develop|mobile app develop|application lifecycle|ALM\b/i, 'DevOps'],
  // Salon & Spa / Beauty
  [/salon|spa management|beauty.*wellness|beauty industry/i, 'Scheduling & Booking'],
  // Church / Nonprofit / Volunteer
  [/church|nonprofit|donation|fundrais|ministry|volunteer|giving platform/i, 'Productivity'],
  // PIM / Product Info
  [/product information|PIM\b|commerce data|feed management/i, 'E-commerce'],
  // Insurance
  [/insurance/i, 'Financial Management'],
  // Agriculture / Farm
  [/agricultur|farm management|AgTech|crop/i, 'Productivity'],
  // Domain / Marketplace
  [/domain (marketplace|registry|name)/i, 'Website Builder'],
  // Visitor Management / Workplace
  [/visitor management|workplace management|facility management|access control/i, 'IT Service Management'],
  // Cannabis
  [/cannabis|seed.to.sale/i, 'Productivity'],
  // Climate / Sustainability
  [/climate|sustainability|carbon|ESG\b|environmental/i, 'Analytics'],
  // Accessibility
  [/accessibility/i, 'DevOps'],
  // Music / Audio
  [/music|audio production|audio editing|podcast/i, 'Design & Prototyping'],
  // Data Privacy / Compliance (without cybersecurity match)
  [/data privacy|consent management|privacy management|GDPR\b|CCPA\b/i, 'Legal Tech'],
  // Enterprise Content / Information Management
  [/enterprise content|enterprise information|ECM\b/i, 'Document Management'],
  // Business phone / VoIP (missed earlier)
  [/phone system|VoIP|cloud communications|contact center|CPaaS\b|telephony|voice over/i, 'Communication & Collaboration'],
  // Pricing / Revenue
  [/pricing.*optimization|revenue management|revenue optimization/i, 'Analytics'],
  // Billing / Financial Operations
  [/billing.*financial|billing.*operations|accounts receivable|billing.*subscription/i, 'Invoicing & Billing'],
  // Content Collaboration / File Storage
  [/file.*stor|file.*sharing|file.*collaborat|file.*hosting|IPFS/i, 'Cloud Infrastructure'],
  // Class / Club Management
  [/class management|club management|member management|membership management|association management|gym management|fitness management/i, 'Scheduling & Booking'],
  // Competitive Intelligence
  [/competitive intelligence/i, 'Sales Intelligence'],
  // Internal Tools
  [/internal tools|admin panel|back.?office/i, 'No-Code/Low-Code'],
  // Procurement
  [/procurement|source.to.pay|eProcurement/i, 'Expense Management'],
  // CAD (design) — additional catch
  [/CAD\b|CAM\b|BIM\b|architect/i, 'Design & Prototyping'],
  // Service Mesh / Network
  [/service mesh|load balanc|application delivery|networking/i, 'DevOps'],
  // Business Management fallback
  [/business management|business solution|business platform|SaaS platform/i, 'Productivity'],
  // Wedding
  [/wedding/i, 'Scheduling & Booking'],
  // Reviews / Social proof
  [/review.*platform|social proof|testimonial/i, 'Marketing Automation'],
  // Remote work
  [/remote work|virtual desktop|VDI\b|DaaS\b|desktop.*virtual/i, 'Cloud Infrastructure'],
  // General email services
  [/email (delivery|service|hosting|API)/i, 'Email Marketing'],
  // Dealership Management
  [/dealer management|dealership/i, 'CRM'],
  // Campaign
  [/campaign/i, 'Marketing Automation'],
  // Forms / Data Collection (handled above in Form Builder rule)
  // Crypto / Blockchain
  [/crypto|blockchain|web3|NFT/i, 'Financial Management'],
  // Automotive
  [/automotive|auto dealer/i, 'CRM'],
  // Background check (missed by HR rule somehow)
  [/background/i, 'HR & Payroll'],
  // Mobile Marketing
  [/mobile marketing|mobile monetization|mobile attribution/i, 'Marketing Automation'],
  // Sales broader
  [/sales.*outreach|sales.*acceleration|sales.*dialing|sales.*management/i, 'Sales Engagement'],
  // Writing / Content broader
  [/writing|editing software|content creation/i, 'AI & Machine Learning'],
  // IT Operations
  [/IT operations|enterprise IT/i, 'IT Service Management'],
  // Experimentation
  [/experimentation|A\/B|optimization platform/i, 'Product Analytics'],
  // Professional Services / Practice Management
  [/professional services|PSA\b|practice management/i, 'Project Management'],
  // Student / Education
  [/student information|SIS\b|education management|CPE\b|professional education/i, 'Learning Management System'],
  // Fitness / Gym (broader)
  [/fitness/i, 'Scheduling & Booking'],
  // Tax
  [/tax preparation|tax planning|tax software/i, 'Accounting Software'],
  // Community broader
  [/community management|community platform/i, 'Communication & Collaboration'],
  // Form Management (handled above in Form Builder rule)
  // Data backup
  [/data backup|backup.*recovery|disaster recovery/i, 'Cloud Infrastructure'],
  // Live video / streaming
  [/live.*video|live.*stream|streaming.*event/i, 'Video Conferencing'],
  // EDI / Commerce operations
  [/\bEDI\b|electronic data interchange|commerce operations/i, 'E-commerce'],
  // Test Management / QA (broader)
  [/test management|quality assurance|performance testing|load testing|QA\b/i, 'DevOps'],
  // Note taking
  [/note.*taking|note-taking/i, 'Knowledge Management'],
  // Privacy compliance
  [/privacy compliance/i, 'Legal Tech'],
  // Identity Governance
  [/identity governance|\bIGA\b/i, 'Identity & Access Management'],
  // Endpoint Management
  [/endpoint management|\bUEM\b|\bMDM\b/i, 'IT Service Management'],
  // Email & SMS
  [/email.*SMS|SMS.*marketing/i, 'Email Marketing'],
  // Domain registration broader
  [/domain (registration|brokerage|premium)/i, 'Website Builder'],
  // Transportation Management
  [/transportation management|\bTMS\b/i, 'Logistics & Shipping'],
  // HRMS / HCM broader
  [/\bHRMS\b|human capital/i, 'HR & Payroll'],
  // Gaming / Casino
  [/gaming|casino/i, 'E-commerce'],
  // Crowdfunding / Rewards
  [/crowdfunding|rewards|cashback/i, 'Financial Management'],
  // InsurTech
  [/insurtech|car ownership/i, 'Financial Management'],
  // FP&A / Planning
  [/FP&A|financial planning|enterprise planning/i, 'Financial Management'],
  // Subscription / Billing broader
  [/subscription/i, 'Invoicing & Billing'],
  // Content management broader
  [/content management|content publishing|magazine|publishing platform/i, 'Content Management System'],
  // Process orchestration
  [/process orchestration|intelligent document/i, 'Workflow Automation'],
  // Master data / data management broader
  [/master data|data management/i, 'Data Integration'],
  // Experience management
  [/experience management|digital experience/i, 'Customer Success'],
  // Service management broader
  [/service management/i, 'IT Service Management'],
  // Marketing tools/platform broader
  [/marketing (tool|data|platform)/i, 'Marketing Automation'],
  // Enterprise Software broader
  [/enterprise software|enterprise service/i, 'IT Service Management'],
  // Partnership management
  [/partnership management/i, 'Sales Engagement'],
  // News/Publishing
  [/news.*publishing|news.*magazine/i, 'Content Management System'],
  // Audience engagement
  [/audience engagement|interactive presentation/i, 'Event Management'],
  // Search engine
  [/search engine/i, 'Analytics'],
  // Sports Management
  [/sports management|league management|team management software/i, 'Scheduling & Booking'],
  // Library Management
  [/library management/i, 'Productivity'],
  // Restaurant / Food
  [/restaurant|food delivery|food service|food management|hospitality.*management|hotel.*management/i, 'Point of Sale'],
  // Remote Desktop / Access
  [/remote desktop|remote access|remote support/i, 'IT Service Management'],
  // PRM / Partner
  [/partner relationship|\bPRM\b/i, 'CRM'],
  // Localization / Translation
  [/localization|translation/i, 'Productivity'],
  // Parking
  [/parking/i, 'Property Management'],
  // Laboratory / LIMS
  [/laboratory|\bLIMS\b/i, 'Healthcare IT'],
  // Quality Management
  [/quality management|\bQMS\b/i, 'Project Management'],
  // Mobile Development
  [/mobile develop/i, 'DevOps'],
  // Mental Health
  [/mental health|wellness app/i, 'Healthcare IT'],
  // Meeting Management broader
  [/meeting management|transcription/i, 'Productivity'],
  // Marketplace
  [/marketplace.*platform/i, 'E-commerce'],
  // IP Management
  [/\bIP management|intellectual property/i, 'Legal Tech'],
  // Senior Living
  [/senior living|elderly|aged care/i, 'Healthcare IT'],
  // Government / Public Sector
  [/government|public sector|civic/i, 'Productivity'],
  // Fraud Detection
  [/fraud detection|fraud prevention/i, 'Cybersecurity'],
  // Virtualization
  [/virtualiz/i, 'Cloud Infrastructure'],
  // Review Management
  [/review management/i, 'Social Media Management'],
  // Video Recording broader
  [/video (stream|record)/i, 'Video Conferencing'],
  // Web Development broader
  [/web develop/i, 'DevOps'],
  // Workplace broader
  [/workplace/i, 'HR & Payroll'],
  // Website management
  [/website management|website govern/i, 'Website Builder'],
  // Photo management / sharing
  [/photo manag|photo shar|image manag/i, 'Design & Prototyping'],
  // Church broader (missed)
  [/church|ministry/i, 'Productivity'],
  // Childcare / Daycare
  [/childcare|daycare|child care|preschool/i, 'Scheduling & Booking'],
  // Productivity (very broad — last resort before General)
  [/productivity|calendar|task.*app|to-?do|note.*app|personal organiz/i, 'Productivity'],
  // Conversion/performance marketing broader
  [/conversion rate|performance marketing/i, 'Marketing Automation'],
  // Game Development
  [/game develop|gambling|lottery|casino|gaming/i, 'Design & Prototyping'],
  // Video Production
  [/video production/i, 'Video Conferencing'],
  // Retail
  [/retail.*management|retail.*operation|retail.*intelligence/i, 'Point of Sale'],
  // Domain services broader
  [/domain/i, 'Website Builder'],
  // Travel broader
  [/travel management/i, 'Expense Management'],
  // Education / eLearning broader
  [/education|e-?learning|eLearning|learning.*development|language learning|online learning|training/i, 'Learning Management System'],
  // Resume / Career
  [/resume|career/i, 'HR & Payroll'],
  // Document generation
  [/document generation|document automation/i, 'Document Management'],
  // Listing management
  [/listing management|local business/i, 'Marketing Automation'],
  // Enterprise automation
  [/enterprise automation|digital transformation/i, 'Workflow Automation'],
  // DAW / Audio broader
  [/DAW\b|audio workstation/i, 'Design & Prototyping'],
  // Financial broader
  [/financial/i, 'Financial Management'],
  // Frontline operations
  [/frontline/i, 'HR & Payroll'],
  // Identity verification / biometric
  [/identity verification|biometric|face recognition/i, 'Identity & Access Management'],
  // EV / Charging
  [/\bEV\b|charging infrastructure|electric vehicle/i, 'Productivity'],
  // Freelance / Marketplace broader
  [/freelance|marketplace/i, 'E-commerce'],
  // Financial crime
  [/financial crime/i, 'Legal Tech'],
  // Grants
  [/grants management/i, 'Financial Management'],
  // Grocery / Delivery broader
  [/grocery|on-demand delivery/i, 'Logistics & Shipping'],
  // Blog
  [/blog/i, 'Website Builder'],
  // Hospitality broader
  [/hospitality|housing/i, 'Property Management'],
  // Patent / IP broader
  [/patent|IP intelligence/i, 'Legal Tech'],
  // Pricing
  [/pricing.*intelligence|pricing.*management|dynamic pricing/i, 'Analytics'],
  // Pharmaceutical
  [/pharmaceutical|pharma/i, 'Healthcare IT'],
  // Print on Demand
  [/print.on.demand/i, 'E-commerce'],
  // Privacy broader
  [/privacy/i, 'Legal Tech'],
  // PR / Media Relations
  [/\bPR\b|press release|media relations/i, 'Marketing Automation'],
  // PLM
  [/PLM\b|product lifecycle/i, 'Project Management'],
  // Channel marketing
  [/channel marketing/i, 'Marketing Automation'],
  // Food & Beverage
  [/food.*beverage/i, 'Point of Sale'],
  // Unknown → Productivity as fallback
  [/^Unknown$/i, 'Productivity'],
  // Business Financing / Formation
  [/business financing|business formation/i, 'Financial Management'],
  // Workforce broader
  [/workforce/i, 'HR & Payroll'],
  // Cloud management broader
  [/cloud management/i, 'Cloud Infrastructure'],
  // Loyalty broader
  [/loyalty/i, 'Customer Success'],
  // Marketing broader
  [/marketing/i, 'Marketing Automation'],
  // Image processing
  [/image process|image enhancement/i, 'Design & Prototyping'],
  // Strategic portfolio
  [/strategic portfolio/i, 'Project Management'],
  // Digital governance
  [/digital governance|content intelligence/i, 'Content Management System'],
  // Catch-all: anything with "software" or "platform" → Productivity
  [/software|platform|tool|system|solution/i, 'Productivity'],
];

// ─── Normalize Function ──────────────────────────────────────────────────────

const normalizedSet = new Set(NORMALIZED_CATEGORIES);

function normalize(rawCategory) {
  if (!rawCategory) return null;

  // 1. Exact match to a normalized name
  if (normalizedSet.has(rawCategory)) return rawCategory;

  // 2. Exact match in override map
  if (EXACT_MAP[rawCategory]) return EXACT_MAP[rawCategory];

  // 3. Keyword rules (first match wins)
  for (const [pattern, normalized] of KEYWORD_RULES) {
    if (pattern.test(rawCategory)) return normalized;
  }

  // 4. Fallback — anything unmatched
  return null;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'WRITE'}\n`);

  // Fetch ALL products (paginated — Supabase default limit is 1000)
  let products = [];
  let page = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('reaper_products')
      .select('id, name, category')
      .eq('is_active', true)
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error) {
      console.error('Error fetching products:', error);
      process.exit(1);
    }
    products.push(...data);
    if (data.length < pageSize) break;
    page++;
  }

  console.log(`Total products: ${products.length}\n`);

  // Build category counts
  const rawCategoryCounts = {};
  for (const p of products) {
    if (p.category) {
      rawCategoryCounts[p.category] = (rawCategoryCounts[p.category] || 0) + 1;
    }
  }

  console.log(`Distinct raw categories: ${Object.keys(rawCategoryCounts).length}\n`);

  // Normalize each category
  const mappings = {}; // raw → normalized
  const unmapped = {}; // raw → count (for review)
  const normalizedCounts = {}; // normalized → count

  for (const [raw, count] of Object.entries(rawCategoryCounts)) {
    const normalized = normalize(raw);
    if (normalized) {
      mappings[raw] = normalized;
      normalizedCounts[normalized] = (normalizedCounts[normalized] || 0) + count;
    } else {
      unmapped[raw] = count;
    }
  }

  // Report: Mappings
  console.log('=== MAPPINGS ===\n');
  const sortedMappings = Object.entries(mappings).sort((a, b) => a[1].localeCompare(b[1]) || a[0].localeCompare(b[0]));
  let currentNorm = '';
  for (const [raw, norm] of sortedMappings) {
    if (norm !== currentNorm) {
      currentNorm = norm;
      console.log(`\n  ${norm} (${normalizedCounts[norm]} products):`);
    }
    if (raw !== norm) {
      console.log(`    ← "${raw}" (${rawCategoryCounts[raw]})`);
    }
  }

  console.log(`\n\nDistinct normalized categories: ${Object.keys(normalizedCounts).length}`);
  console.log(`Products mapped: ${Object.values(normalizedCounts).reduce((a, b) => a + b, 0)}`);

  // Report: Unmapped
  if (Object.keys(unmapped).length > 0) {
    console.log('\n=== UNMAPPED (needs manual review) ===\n');
    for (const [raw, count] of Object.entries(unmapped).sort((a, b) => b - a)) {
      console.log(`  "${raw}" (${count})`);
    }
    console.log(`\nTotal unmapped categories: ${Object.keys(unmapped).length}`);
    console.log(`Total unmapped products: ${Object.values(unmapped).reduce((a, b) => a + b, 0)}`);
  } else {
    console.log('\n✓ All categories mapped!');
  }

  // Write to DB
  if (WRITE) {
    console.log('\n=== WRITING TO DATABASE ===\n');

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    // Batch by normalized category for efficiency
    for (const [raw, normalized] of Object.entries(mappings)) {
      const { error: updateError, count } = await supabase
        .from('reaper_products')
        .update({ normalized_category: normalized })
        .eq('category', raw)
        .eq('is_active', true);

      if (updateError) {
        console.error(`  Error updating "${raw}" → "${normalized}":`, updateError.message);
        errors++;
      } else {
        updated += count || 0;
      }
    }

    // Also handle products with null category
    const { error: nullError } = await supabase
      .from('reaper_products')
      .update({ normalized_category: null })
      .is('category', null);

    console.log(`Updated: ${updated} products`);
    console.log(`Errors: ${errors}`);

    // Verify
    const { data: nullCheck } = await supabase
      .from('reaper_products')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .is('normalized_category', null)
      .not('category', 'is', null);

    console.log(`\nProducts with category but no normalized_category: ${nullCheck || 0}`);
  }
}

main().catch(console.error);
