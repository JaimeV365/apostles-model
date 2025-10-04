# CSV Format and Headers Guide

This guide explains the expected format for CSV files and the header conventions used by the CSV import system. Following these guidelines will ensure successful data imports.

## Basic CSV Structure

The CSV import system expects a standard CSV file with:
- Headers in the first row
- Data rows following the header row
- Values separated by commas
- Optional quotes around values containing commas or special characters

Example:
```csv
ID,Name,Email,Satisfaction:1-5,Loyalty:1-5,Date(dd/mm/yyyy)
1001,John Smith,john@example.com,4,5,15/06/2023
1002,Jane Doe,jane@example.com,5,4,16/06/2023
```

## Required Headers

The CSV import system requires two essential header columns:

1. **Satisfaction Scale Header**
   - Must include the term "Satisfaction", "Sat", or "CSAT"
   - Must include the scale range (e.g., ":1-5", "-1-7")
   - Examples: `Satisfaction:1-5`, `Sat-1-7`, `CSAT(1-10)`

2. **Loyalty Scale Header**
   - Must include the term "Loyalty", "Loy", or "NPS"
   - Must include the scale range (e.g., ":1-5", "-1-7")
   - Examples: `Loyalty:1-5`, `Loy-1-7`, `NPS(0-10)`

## Optional Headers

The system also recognizes these common optional headers:

1. **ID**
   - Contains unique identifiers for each data point
   - Example: `ID`, `CustomerID`, `ID_Number`

2. **Name**
   - Contains the name of the individual or entity
   - Example: `Name`, `Customer Name`, `Full Name`

3. **Email**
   - Contains email addresses
   - Example: `Email`, `Email Address`, `Contact Email`

4. **Date**
   - Contains dates in various formats
   - Can include format indicator
   - Example: `Date(dd/mm/yyyy)`, `Survey Date`, `Response Date(mm/dd/yyyy)`

5. **Custom Fields**
   - Any additional headers are preserved as custom fields
   - Example: `Country`, `TrueLoyalist`, `NumPurchases`

## Header Format Conventions

### Scale Format Indicators

Scales can be specified in several formats:

1. **Colon Format**: `Header:1-5`
   - Example: `Satisfaction:1-5`

2. **Hyphen Format**: `Header-1-5`
   - Example: `Loyalty-1-7`

3. **Parentheses Format**: `Header(1-5)`
   - Example: `CSAT(1-10)`

### Date Format Indicators

Date formats can be specified in the header using parentheses:

1. **Day/Month/Year**: `Date(dd/mm/yyyy)`
   - For European format (e.g., 31/12/2023)

2. **Month/Day/Year**: `Date(mm/dd/yyyy)`
   - For US format (e.g., 12/31/2023)

3. **Year-Month-Day**: `Date(yyyy-mm-dd)`
   - For ISO format (e.g., 2023-12-31)

If no format is specified, the system defaults to `dd/mm/yyyy`.

## Supported Scales

The system supports these standard scales:

### Satisfaction Scales
- `1-3`: Basic 3-point scale
- `1-5`: Standard CSAT scale (default)
- `1-7`: Extended CSAT scale

### Loyalty Scales
- `1-5`: Basic loyalty scale (default)
- `1-7`: Extended loyalty scale
- `1-10`: NPS-style scale
- `0-10`: Full NPS scale

## CSV Template Structure

When using the template download feature, a CSV with this structure is generated:

```csv
ID,Name,Email,Satisfaction:1-5,Loyalty:1-5,Date(dd/mm/yyyy),Country,TrueLoyalist,NumPurchases,NumComplaints
ABC123,John Smith,john@example.com,5,5,01/01/2024,United Kingdom,Yes,5,0
optional,optional,optional,REQUIRED (1-5),REQUIRED (1-5),optional (dd/mm/yyyy, mm/dd/yyyy, or yyyy-mm-dd),optional,optional,optional,optional
,,,"Use 'Sat' or 'CSAT' also works","Use 'Loy' or 'NPS' also works","Include format in header for clarity",,,,
```

This includes: