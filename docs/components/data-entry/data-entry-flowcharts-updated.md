# Data Entry Workflows

## Manual Entry Workflow

```
Start → Enter Data → Validation Checks → Errors? → [Yes] → Show Error Messages → Return to Entry
                                      → [No] → Compare with Existing Data → Duplicates? → [Yes] → Show Modal: Skip/Edit/Add
                                                                         → [No] → Add to Data Table → Clear Form
```

### Detailed Manual Entry Workflow

1. User enters data in the manual entry form
2. System performs validation (required fields, format checks, scale validation)
3. If validation errors exist, they are displayed to the user
4. If no validation errors, system checks for duplicates against all existing entries
5. If duplicates found, system shows duplicate resolution modal
   - User can choose to Skip (discard), Edit (modify), or Add Anyway
   - If Edit is chosen, user returns to form with current values
   - If Add is chosen, entry is added despite duplication
6. If no duplicates, entry is added to the data table
7. Form is cleared for next entry

## CSV Import Workflow

```
Start → Upload CSV → Header Detection → Validation Checks → Errors? → [Yes] → Show Error Messages → Return to Upload
                                                         → [No] → Internal Duplicate Checks → Duplicates? → [Yes] → Show Warning
                                                                                           → [No] → Check Existing Data → Duplicates? → [Yes] → Show Modal: Append/Replace
                                                                                                                        → [No] → Add to Data Table
```

### Detailed CSV Import Workflow

1. User uploads CSV file
2. System detects headers and validates file structure
3. System checks for required columns and validates data formats
4. If validation errors exist, they are displayed to the user
5. System checks for internal duplicates (within the CSV)
6. If internal duplicates exist, warnings are displayed
7. System checks for duplicates against existing data
8. If duplicates against existing data are found:
   - Show modal with Append/Replace options
   - Append: Add new entries alongside existing data
   - Replace: Delete all existing data and replace with imported data
9. Data is added to the table based on the selected option

## Editing Workflow

```
Start → Select Entry for Edit → Load Data into Form → User Modifies Data → Submit → Validation Checks → Errors? → [Yes] → Show Error Messages
                                                                                                     → [No] → Compare with Existing Data (excluding current ID) → Duplicates? → [Yes] → Show Modal: Skip/Edit/Add
                                                                                                                                                            → [No] → Update Entry → Clear Form
```

### Detailed Editing Workflow

1. User selects an entry for editing
2. System loads the entry data into the form
3. User modifies the data
4. On submission, system performs validation checks
5. If validation passes, system checks for duplicates against all other entries
   - The current entry's ID is excluded from comparison
   - All other criteria for duplicate detection are applied
6. If a duplicate is found, the duplicate resolution modal is shown:
   - Skip: Cancel the edit
   - Edit: Return to the form to make more changes
   - Add Anyway: Apply the edit despite the duplication
7. If no duplicate is found, the entry is updated in the data table
8. Form is cleared after successful edit

## Date Format Handling

```
Start → Enter Date → Format Check → Valid? → [No] → Show Error
                                          → [Yes] → Format according to selected format
      → Select New Format → Existing Dates? → [Yes] → Format Locked (show warning)
                                           → [No] → Update Date Format → Convert Displayed Date
```

### Detailed Date Format Workflow

1. User enters a date in the date field
2. System validates the date according to the selected format
3. If valid, the date is formatted and displayed
4. If not valid, an error is shown
5. If user attempts to change date format:
   - System checks if any existing entries have dates
   - If yes, the format is locked and a warning is shown
   - If no, the format is updated and any entered date is converted

## Path: /docs/data-entry/workflows/data-entry-workflows.md