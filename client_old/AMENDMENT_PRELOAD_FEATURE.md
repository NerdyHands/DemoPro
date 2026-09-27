# Amendment Pre-Load Feature

## Overview
When creating a new contract amendment, the system now automatically loads all existing line items from the contract and allows users to select which items to include or modify.

## How It Works

### 1. Automatic Line Item Loading
- When accessing the amendment creation page with a `contractId` parameter, the system fetches the contract details
- All existing line items from the contract are automatically loaded into the form
- Each line item is pre-populated with its current values (description, quantity, unit price, total)

### 2. Checkbox Selection
- Each pre-loaded line item displays a checkbox labeled "Include in Amendment"
- Users can check the boxes for line items they want to include in the amendment
- Unchecked items are visually dimmed (50% opacity, dashed border) to indicate they won't be included
- Form fields for unchecked items are disabled to prevent accidental edits

### 3. Editable Fields
For checked line items, users can:
- Change the line item number
- Select the change type (New Item, Modified Item, or Removed Item)
- Edit the original values (for modified/removed items)
- Edit the updated values (for modified/added items)

### 4. Adding New Line Items
- Users can still add completely new line items using the "+ Add New Line Item" button
- New line items don't have the checkbox (they're always included)
- New line items can be removed using the "Remove" button

## Implementation Details

### Component Changes: `AmendmentEdit.jsx`

**New State Variables:**
```javascript
const [contractLineItemsLoaded, setContractLineItemsLoaded] = useState(false);
```

**Modified Functions:**
- `fetchContract()`: Now pre-populates line items when creating a new amendment
- `handleLineItemChange()`: Added support for the 'included' field
- `handleToggleInclude()`: New function to toggle checkbox state
- `handleSubmit()`: Updated validation to only submit checked line items

**Line Item Structure:**
```javascript
{
  id: number,
  lineItemNumber: string,
  changeType: 'added' | 'modified' | 'removed',
  included: boolean,  // Only present for pre-loaded items
  original: { description, quantity, unitPrice, totalPrice },
  updated: { description, quantity, unitPrice, totalPrice }
}
```

### CSS Changes: `Amendments.css`

**New Styles:**
```css
.line-item-change.not-included {
  opacity: 0.5;
  background: #f5f5f5;
  border-style: dashed;
}
```

## User Experience

### Visual Indicators
- ✅ Info box shows how many line items were loaded
- ☑️ Checkboxes for each pre-loaded line item
- 🔒 Disabled fields for unchecked items
- 👻 Dimmed appearance for unchecked items

### Validation
- At least one line item must be checked before submission
- Error message: "Please select at least one line item to include in the amendment"
- Only checked items are submitted to the backend

## Usage Example

1. Navigate to: `/amendments/create?contractId=68e71efbb1e19858f6347724`
2. System loads all line items from the contract
3. Review the pre-loaded items
4. Check boxes for items to include/modify
5. Make any necessary changes to the selected items
6. Optionally add new line items
7. Submit the amendment

## Benefits

- **Faster Amendment Creation**: No need to manually re-enter existing line items
- **Reduced Errors**: Pre-populated with accurate current values
- **Selective Changes**: Easy to choose which items to include
- **Clear Visual Feedback**: Obvious which items are included vs. excluded
- **Flexible**: Can still add completely new line items

## Technical Notes

- Pre-loading only occurs when creating a **new** amendment (not editing)
- Pre-loading only triggers once (controlled by `contractLineItemsLoaded` flag)
- The `included` property is only added to pre-loaded items
- Manually added items don't have the `included` property and are always submitted if they have content
- All form fields are disabled when the line item is not included

