# RegionComboBox Component

An enhanced React component for selecting Philippine addresses (Region, Province, Municipality, Barangay) using the PSGC (Philippine Standard Geographic Code) data.

## Features

- **Cascading Selection**: Selecting a region loads provinces, selecting a province loads municipalities, etc.
- **Initial Values Support**: Can be pre-populated with existing data for editing scenarios
- **Disabled State**: Can be made read-only for display purposes
- **Auto-Reset**: Dependent fields are automatically cleared when parent selections change
- **Backward Compatible**: Works with existing implementations without breaking changes
- **TypeScript Support**: Full type safety with proper interfaces

## Installation

The component uses the `psgc` package for Philippine geographic data:

```bash
npm install psgc
```

## Basic Usage

### New Address Entry
For creating new bookings or adding new addresses:

```tsx
import RegionComboBoxComponent from "@/components/(Bookings)/(AddBookings)/ComboBox/RegionComboBox";

function NewAddressForm() {
  const [region, setRegion] = useState("");
  const [province, setProvince] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [barangay, setBarangay] = useState("");

  return (
    <RegionComboBoxComponent
      regionOnChange={setRegion}
      provinceOnChange={setProvince}
      municipalityOnChange={setMunicipality}
      barangayOnChange={setBarangay}
    />
  );
}
```

### Editing Existing Address
For editing bookings or updating client information:

```tsx
import RegionComboBoxComponent from "@/components/(Bookings)/(AddBookings)/ComboBox/RegionComboBox";

function EditAddressForm({ existingAddress }) {
  const [region, setRegion] = useState(existingAddress.region);
  const [province, setProvince] = useState(existingAddress.province);
  const [municipality, setMunicipality] = useState(existingAddress.municipality);
  const [barangay, setBarangay] = useState(existingAddress.barangay);

  return (
    <RegionComboBoxComponent
      initialRegion={region}
      initialProvince={province}
      initialMunicipality={municipality}
      initialBarangay={barangay}
      regionOnChange={setRegion}
      provinceOnChange={setProvince}
      municipalityOnChange={setMunicipality}
      barangayOnChange={setBarangay}
    />
  );
}
```

### Read-Only Display
For displaying address information without allowing edits:

```tsx
<RegionComboBoxComponent
  initialRegion="National Capital Region (NCR)"
  initialProvince="Metro Manila"
  initialMunicipality="Quezon City"
  initialBarangay="Barangay Batasan Hills"
  regionOnChange={() => {}}
  provinceOnChange={() => {}}
  municipalityOnChange={() => {}}
  barangayOnChange={() => {}}
  disabled={true}
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `regionOnChange` | `(value: string) => void` | Yes | - | Callback when region is selected |
| `provinceOnChange` | `(value: string) => void` | Yes | - | Callback when province is selected |
| `municipalityOnChange` | `(value: string) => void` | Yes | - | Callback when municipality is selected |
| `barangayOnChange` | `(value: string) => void` | Yes | - | Callback when barangay is selected |
| `initialRegion` | `string` | No | `""` | Pre-populate region field |
| `initialProvince` | `string` | No | `""` | Pre-populate province field |
| `initialMunicipality` | `string` | No | `""` | Pre-populate municipality field |
| `initialBarangay` | `string` | No | `""` | Pre-populate barangay field |
| `disabled` | `boolean` | No | `false` | Disable all inputs for read-only mode |

## Behavior

### Cascading Updates
- When a region is selected, all provinces for that region become available
- When a province is selected, all municipalities for that province become available
- When a municipality is selected, all barangays for that municipality become available

### Auto-Reset Logic
- Changing the region clears and disables province, municipality, and barangay
- Changing the province clears and disables municipality and barangay
- Changing the municipality clears and disables barangay

### Initial Values
- If initial values are provided, the component automatically:
  - Loads the appropriate options for each level
  - Shows all relevant dropdowns (not hidden)
  - Maintains the cascade relationship

## Integration Examples

### In BookingDialog (Edit Mode)
```tsx
{isEditMode ? (
  <div className="mt-4 space-y-2">
    <Label className="font-normal">Address</Label>
    <RegionComboBoxComponent
      initialRegion={editFormData.region}
      initialProvince={editFormData.province}
      initialMunicipality={editFormData.municipality}
      initialBarangay={editFormData.barangay}
      regionOnChange={value => setEditFormData(prev => ({ ...prev, region: value }))}
      provinceOnChange={value => setEditFormData(prev => ({ ...prev, province: value }))}
      municipalityOnChange={value => setEditFormData(prev => ({ ...prev, municipality: value }))}
      barangayOnChange={value => setEditFormData(prev => ({ ...prev, barangay: value }))}
    />
  </div>
) : (
  <div className="mt-4">
    <Label className="font-normal">Address</Label>
    <Input
      className="mt-2"
      placeholder="Address"
      type="text"
      value={`${clientData?.region || ""}, ${clientData?.province || ""}, ${clientData?.municipality || ""}, ${clientData?.barangay || ""}`}
      disabled
    />
  </div>
)}
```

### In Add Bookings Page
```tsx
<RegionComboBoxComponent
  regionOnChange={setRegion}
  provinceOnChange={setProvince}
  municipalityOnChange={setMunicipality}
  barangayOnChange={setBarangay}
/>
```

## Styling

The component uses a responsive grid layout:
- **Desktop**: 2x2 grid (Region/Province on top row, Municipality/Barangay on bottom row)
- **Mobile**: Stacks vertically for better usability
- **Disabled State**: Visual opacity reduction to indicate read-only mode
- **Progressive Disclosure**: Fields appear as they become available

## Dependencies

- `psgc`: Philippine Standard Geographic Code data
- `@/components/ui/select`: Radix UI Select component
- `@/components/ui/label`: Label component for accessibility
- React hooks: `useState`, `useEffect`, `useId`

## Migration from Old Version

The enhanced version is fully backward compatible. Existing usages will continue to work without changes:

```tsx
// Old usage (still works)
<RegionComboBoxComponent
  regionOnChange={setRegion}
  provinceOnChange={setProvince}
  municipalityOnChange={setMunicipality}
  barangayOnChange={setBarangay}
/>

// Enhanced usage (new features)
<RegionComboBoxComponent
  initialRegion="Existing Region"
  initialProvince="Existing Province"
  initialMunicipality="Existing Municipality"
  initialBarangay="Existing Barangay"
  regionOnChange={setRegion}
  provinceOnChange={setProvince}
  municipalityOnChange={setMunicipality}
  barangayOnChange={setBarangay}
/>
```

## Demo

Visit `/demo/region-combobox` to see the component in action with various usage scenarios.

## Accessibility

- Proper ARIA labels and relationships
- Keyboard navigation support
- Screen reader friendly
- Focus management
- Disabled state indicators
