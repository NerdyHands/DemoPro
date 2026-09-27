# Pre-Work Inspection Feature

## Overview
A comprehensive pre-work inspection system has been created to document the initial conditions and existing issues **before** work begins on a contract. This complements the existing after-work inspection reports, providing a complete before-and-after documentation workflow.

## What Was Created

### 1. **PreWorkInspectionInput Component**
- **Location**: `client/src/pages/PreWorkInspection/PreWorkInspectionInput.jsx`
- **Purpose**: Main form for creating and editing pre-work inspections
- **Features**:
  - Document initial conditions for each contract line item
  - Multiple photo uploads per line item with drag-to-reorder functionality
  - Condition status tracking (Good, Fair, Poor, Damaged, Not Present, Not Accessible, Not Assessed)
  - Assessment notes for documenting existing conditions and concerns
  - PDF generation for client-facing reports
  - Auto-loads all contract line items including amendments

### 2. **Styling**
- **Location**: `client/src/pages/PreWorkInspection/PreWorkInspectionInput.css`
- **Design**: Modern purple gradient theme to differentiate from after-work reports (green theme)
- **Features**: Fully responsive, mobile-friendly design

### 3. **Routing**
- **Updated File**: `client/src/App.jsx`
- **Routes Added**:
  - `/prework-inspection/:contractId` - Create new pre-work inspection
  - `/prework-inspection/edit?reportId=<id>` - Edit existing pre-work inspection

### 4. **Contract View Integration**
- **Updated File**: `client/src/pages/Contracts/ContractView.jsx`
- **Changes**:
  - Added dedicated "Pre-Work Inspections" section
  - "Create Pre-Work Inspection" button with purple gradient styling
  - Separate display of pre-work inspections with "PRE-WORK" badge
  - Updated "Final Reports" section to show only after-work reports
  - Both sections use the same report viewing, editing, and PDF generation functionality

## Key Differences from After-Work Reports

| Feature | Pre-Work Inspection | After-Work Report |
|---------|-------------------|-------------------|
| **Purpose** | Document conditions BEFORE work | Document completed work |
| **Status Field** | Condition Status (Good, Fair, Poor, etc.) | Inspection Status (Complete, In Progress, etc.) |
| **Notes Field** | Assessment Notes (existing conditions) | Inspection Notes (work performed) |
| **Color Theme** | Purple gradient | Green theme |
| **Badge Label** | "PRE-WORK" | Standard |
| **Focus** | Initial state documentation | Completion documentation |

## How to Use

### Creating a Pre-Work Inspection

1. **Navigate to Contract View**
   - Go to Contracts → Select a contract

2. **Create Inspection**
   - Find the "Pre-Work Inspections" section
   - Click "+ Create Pre-Work Inspection" button

3. **Fill Out Inspection Details**
   - Title (auto-populated, but editable)
   - Property Address
   - Description

4. **Document Each Line Item**
   - Select **Condition Status**:
     - ✓ Good Condition
     - ⚠ Fair - Minor Issues
     - ❌ Poor - Major Issues
     - 🔴 Damaged
     - ➖ Not Present
     - 🚫 Not Accessible
     - ⏸ Not Assessed
   
   - Add **Assessment Notes**: Document existing conditions, damage, concerns, or access issues
   
   - Upload **Before Photos**: Document initial conditions with multiple photos
     - Drag and drop to reorder
     - Up to 10 photos per line item

5. **Save or Generate PDF**
   - **Save Draft**: Save progress without generating PDF
   - **Generate PDF**: Save and download a client-facing PDF report

### Viewing Pre-Work Inspections

From the Contract View:
- Pre-work inspections appear in their own section above Final Reports
- Each inspection shows:
  - "PRE-WORK" badge for easy identification
  - Report number and creation date
  - Current status (Draft, In Review, Approved, Sent to Client)
  - Action buttons: View, Edit, Finalize, Delete, PDF

### Editing Pre-Work Inspections

- Click **✏️ Edit** button on any Draft or In Review inspection
- Make changes to conditions, notes, or photos
- Save Draft or Generate updated PDF

### Finalizing Pre-Work Inspections

- Click **✅ Finalize** to lock the report
- Once finalized (Approved status), the report becomes read-only
- PDFs can still be generated from finalized reports

## Workflow Example

### Typical Project Workflow:

1. **Contract Signed** → Customer signs contract
2. **Pre-Work Inspection** → Document "before" conditions
   - Take photos of existing damage, conditions
   - Note any concerns or access issues
   - Generate PDF for customer/records
3. **Work Performed** → Complete contracted work
4. **After-Work Report** → Document completed work
   - Take photos of finished work
   - Note materials used, work performed
   - Generate final PDF for customer

## Technical Details

### Data Structure

Pre-work inspections use the same `ClientReport` model as after-work reports, with the following distinctions:

- `reportType`: "Pre-Work Inspection"
- Line items use `conditionStatus` instead of `inspectionStatus`
- Line items use `assessmentNotes` instead of `inspectionNotes`

### Backend Compatibility

The feature uses existing backend API endpoints:
- `POST /api/client-reports` - Create new report
- `PUT /api/client-reports/:id` - Update report
- `GET /api/client-reports/:id` - View report
- `POST /api/client-reports/:id/images` - Upload images
- `GET /api/client-reports/:id/pdf` - Generate PDF
- `POST /api/client-reports/:id/finalize` - Finalize report
- `DELETE /api/client-reports/:id` - Delete report

The `reportType` field is automatically set to "Pre-Work Inspection" to differentiate from standard inspection reports.

## Benefits

1. **Complete Documentation**: Before and after photos provide clear evidence of work quality
2. **Liability Protection**: Document pre-existing conditions to avoid disputes
3. **Client Transparency**: Show clients exactly what conditions existed before work began
4. **Professional Image**: Demonstrates thoroughness and attention to detail
5. **Dispute Resolution**: Clear documentation helps resolve any disagreements about pre-existing conditions

## Future Enhancements (Optional)

- Side-by-side comparison view of pre-work and after-work photos
- Automated report pairing (link pre-work inspection to after-work report)
- Condition change tracking between pre and post-work
- Client signature on pre-work inspection to acknowledge conditions
- Email delivery of pre-work inspection PDFs to clients

## Support

If you encounter any issues or have questions about the pre-work inspection feature, check:
- Browser console for error messages
- Server logs for API errors
- Ensure all line items have been loaded from the contract
- Verify image upload limits (10 photos per line item, max file sizes)

