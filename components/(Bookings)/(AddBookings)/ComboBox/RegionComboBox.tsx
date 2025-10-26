"use client";
import { useEffect, useId, useState } from "react";

import { municipalities, provinces, regions } from "psgc";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RegionComboBoxProps {
  regionOnChange: (value: string) => void;
  provinceOnChange: (value: string) => void;
  municipalityOnChange: (value: string) => void;
  barangayOnChange: (value: string) => void;
  // Initial values for editing mode
  initialRegion?: string;
  initialProvince?: string;
  initialMunicipality?: string;
  initialBarangay?: string;
  // Optional disabled state
  disabled?: boolean;
}

export default function RegionComboBoxComponent({
  regionOnChange,
  provinceOnChange,
  municipalityOnChange,
  barangayOnChange,
  initialRegion = "",
  initialProvince = "",
  initialMunicipality = "",
  initialBarangay = "",
  disabled = false,
}: RegionComboBoxProps) {
  const id = useId();
  const provinceID = useId();
  const municipalityID = useId();
  const barangayID = useId();

  const allRegions = regions.all();

  const [regionValue, setRegionValue] = useState(initialRegion);
  const [provinceValue, setProvinceValue] = useState(initialProvince);
  const [municipalityValue, setMunicipalityValue] = useState(initialMunicipality);
  const [barangayValue, setBarangayValue] = useState(initialBarangay);

  const [provincesValues, setProvincesValues] = useState<Array<string>>([]);
  const [municipalitiesValues, setmunicipalitiesValues] = useState<Array<string>>([]);
  const [barangayValues, setBarangayValues] = useState<Array<string>>([]);

  const [showProvince, setShowProvince] = useState<boolean>(false);
  const [showMunicipality, setShowMunicipality] = useState<boolean>(false);
  const [showBarangay, setShowBarangay] = useState<boolean>(false);

  // Initialize dropdowns based on initial values
  useEffect(() => {
    if (initialRegion) {
      const allProvinces = regions.find(initialRegion);
      const mappedProvinces = allProvinces ? allProvinces.provinces : [];
      setProvincesValues(mappedProvinces.map(province => province.name));
      setShowProvince(true);

      if (initialProvince) {
        const allMunicipalities = provinces.find(initialProvince);
        const mappedMunicipalities = allMunicipalities ? allMunicipalities.municipalities : [];
        setmunicipalitiesValues(mappedMunicipalities.map(municipality => municipality.name));
        setShowMunicipality(true);

        if (initialMunicipality) {
          const allBarangays = municipalities.find(initialMunicipality);
          const mappedBarangays = allBarangays ? allBarangays.barangays : [];
          setBarangayValues(mappedBarangays.map(barangay => barangay.name));
          setShowBarangay(true);
        }
      }
    }
  }, [initialRegion, initialProvince, initialMunicipality]);

  // Reset dependent fields when initial values change
  useEffect(() => {
    setRegionValue(initialRegion);
    setProvinceValue(initialProvince);
    setMunicipalityValue(initialMunicipality);
    setBarangayValue(initialBarangay);
  }, [initialRegion, initialProvince, initialMunicipality, initialBarangay]);

  const handleClickRegion = (value: string) => {
    setRegionValue(value);
    // Reset dependent values
    setProvinceValue("");
    setMunicipalityValue("");
    setBarangayValue("");
    setShowProvince(false);
    setShowMunicipality(false);
    setShowBarangay(false);

    const allProvinces = regions.find(value);
    const mappedProvinces = allProvinces ? allProvinces.provinces : [];
    setProvincesValues(mappedProvinces.map(province => province.name));

    regionOnChange(value);
    // Clear dependent onChange calls
    provinceOnChange("");
    municipalityOnChange("");
    barangayOnChange("");

    if (mappedProvinces.length > 0) {
      setShowProvince(true);
    }
  };

  const handleClickProvince = (value: string) => {
    setProvinceValue(value);
    // Reset dependent values
    setMunicipalityValue("");
    setBarangayValue("");
    setShowMunicipality(false);
    setShowBarangay(false);

    const allMunicipalities = provinces.find(value);
    const mappedMunicipalities = allMunicipalities ? allMunicipalities.municipalities : [];

    setmunicipalitiesValues(mappedMunicipalities.map(municipality => municipality.name));
    provinceOnChange(value);
    // Clear dependent onChange calls
    municipalityOnChange("");
    barangayOnChange("");

    if (mappedMunicipalities.length > 0) {
      setShowMunicipality(true);
    }
  };

  const handleClickMunicipality = (value: string) => {
    setMunicipalityValue(value);
    // Reset dependent values
    setBarangayValue("");
    setShowBarangay(false);

    const allBarangays = municipalities.find(value);
    const mappedBarangays = allBarangays ? allBarangays.barangays : [];

    setBarangayValues(mappedBarangays.map(barangay => barangay.name));
    municipalityOnChange(value);
    barangayOnChange("");

    if (mappedBarangays.length > 0) {
      setShowBarangay(true);
    }
  };

  const handleClickBarangay = (value: string) => {
    setBarangayValue(value);
    barangayOnChange(value);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={id} className="font-normal text-foreground/50">
            Region
          </Label>
          <div className="mt-2">
            <Select value={regionValue} onValueChange={handleClickRegion} disabled={disabled}>
              <SelectTrigger id={id}>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent className="z-[10200]">
                {allRegions.map(region => (
                  <SelectItem value={region.name} key={region.name}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className={showProvince ? "" : "opacity-50"}>
          <Label htmlFor={provinceID} className="font-normal text-foreground/50">
            Province
          </Label>
          <div className="mt-2">
            <Select
              value={provinceValue}
              onValueChange={handleClickProvince}
              disabled={disabled || !showProvince}
            >
              <SelectTrigger id={provinceID}>
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent className="z-[10200]">
                {provincesValues?.map(province => (
                  <SelectItem value={province} key={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={showMunicipality ? "" : "opacity-50"}>
          <Label htmlFor={municipalityID} className="font-normal text-foreground/50">
            Municipality
          </Label>
          <div className="mt-2">
            <Select
              value={municipalityValue}
              onValueChange={handleClickMunicipality}
              disabled={disabled || !showMunicipality}
            >
              <SelectTrigger id={municipalityID}>
                <SelectValue placeholder="Select municipality" />
              </SelectTrigger>
              <SelectContent className="z-[10200]">
                {municipalitiesValues?.map(municipality => (
                  <SelectItem value={municipality} key={municipality}>
                    {municipality}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className={showBarangay ? "" : "opacity-50"}>
          <Label htmlFor={barangayID} className="font-normal text-foreground/50">
            Barangay
          </Label>
          <div className="mt-2">
            <Select
              value={barangayValue}
              onValueChange={handleClickBarangay}
              disabled={disabled || !showBarangay}
            >
              <SelectTrigger id={barangayID}>
                <SelectValue placeholder="Select barangay" />
              </SelectTrigger>
              <SelectContent className="z-[10200]">
                {barangayValues?.map((barangay, idx) => {
                  const compositeKey = `${barangay}::${idx}`;
                  return (
                    <SelectItem value={barangay} key={compositeKey}>
                      {barangay}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
