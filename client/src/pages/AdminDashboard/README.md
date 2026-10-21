# Admin Dashboard Pages

This directory contains the admin dashboard pages for the ezPICRA application.

## Pages

### AdminDashboard.js
The main admin dashboard that provides system overview and management capabilities.

**Features:**
- System statistics overview
- User management
- Project management
- Quote management
- PICRA processing status
- Pending approvals

**Route:** `/admin`

### PipelineDashboard.js
A dark-themed pipeline dashboard for managing customers through sales stages.

**Features:**
- Dark theme UI matching the design specification
- Customer pipeline management with 7 stages:
  - **Leads** 🎯 - New potential customers
  - **Prospects** 👥 - Recently created accounts
  - **Qualified** ✅ - Customers with initial quotes
  - **Proposal** 📋 - Pending quote approvals
  - **Negotiation** 🤝 - Sent quotes awaiting response
  - **Closed Won** 💰 - Approved quotes
  - **Closed Lost** ❌ - Rejected quotes
- Interactive charts (pie chart, bar chart, line chart)
- Recent quotes table
- System status monitoring
- Responsive design for mobile and desktop

**Route:** `/admin/pipeline`

## Pipeline Categories

The pipeline dashboard automatically categorizes customers based on their quote status and activity:

1. **Leads** - Default stage for new customers
2. **Prospects** - Customers created within the last 7 days
3. **Qualified** - Customers who have received quotes
4. **Proposal** - Customers with pending quote approvals
5. **Negotiation** - Customers with sent quotes awaiting response
6. **Closed Won** - Customers with approved quotes
7. **Closed Lost** - Customers with rejected quotes

## Navigation

- Access the main admin dashboard at `/admin`
- Access the pipeline dashboard at `/admin/pipeline`
- Navigate between dashboards using the header links

## Styling

The pipeline dashboard uses a dark theme with:
- Dark gray backgrounds (`#1f2937`, `#111827`, `#374151`)
- Orange accent colors (`#f59e0b`)
- White text (`#f9fafb`)
- Responsive grid layouts
- Hover effects and transitions

## Data Sources

Both dashboards integrate with:
- User management API
- Quote management API
- Project management API
- PICRA processing API

The pipeline dashboard uses fake data when `config.useFakeData` is enabled for development and testing purposes. 