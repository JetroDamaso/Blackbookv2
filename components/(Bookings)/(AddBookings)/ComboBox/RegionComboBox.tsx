"use client";
import { useId } from "react";

import { regions, provinces, municipalities, barangays } from "psgc";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";

export default function RegionComboBoxComponent({
  regionOnChange,
  provinceOnChange,
  municipalityOnChange,
  barangayOnChange,
}: {
  regionOnChange: (value: string) => void;
  provinceOnChange: (value: string) => void;
  municipalityOnChange: (value: string) => void;
  barangayOnChange: (value: string) => void;
}) {
  const id = useId();
  const provinceID = useId();
  const municipalityID = useId();
  const barangayID = useId();

  const allRegions = regions.all();

  const [regionValue, setRegionValue] = React.useState("");
  const [provinceValue, setProvinceValue] = React.useState("");
  const [municipalityValue, setMunicipalityValue] = React.useState("");
  const [barangayValue, setBarangayValue] = React.useState("");

  const [provincesValues, setProvincesValues] = React.useState<Array<string>>();
  const [municipalitiesValues, setmunicipalitiesValues] =
    React.useState<Array<string>>();
  const [barangayValues, setBarangayValues] = React.useState<Array<string>>();

  const [openProvince, setopenProvince] = React.useState<boolean>(false);
  const [openMunicipality, setopenMunicipality] =
    React.useState<boolean>(false);
  const [openBarangay, setopenBarangay] = React.useState<boolean>(false);

  const handleClickRegion = (value: string) => {
    setopenProvince(false);
    setRegionValue(value);
    console.log("Region: " + value);

    const allProvinces = regions.find(value);

    const mappedProvinces = allProvinces ? allProvinces.provinces : [];
    setProvincesValues(mappedProvinces.map((province) => province.name));
    regionOnChange(value);

    if (mappedProvinces.length > 0) {
      setopenProvince(true);
    }
  };

  const handleClickProvince = (value: string) => {
    setopenMunicipality(false);
    setProvinceValue(value);

    const allMunicipalities = provinces.find(value);
    const mappedMunicipalities = allMunicipalities
      ? allMunicipalities.municipalities
      : [];

    setmunicipalitiesValues(
      mappedMunicipalities.map((municipality) => municipality.name)
    );
    provinceOnChange(value);
    if (mappedMunicipalities.length > 0) {
      setopenMunicipality(true);
    }
  };

  const handleClickMunicipality = (value: string) => {
    setopenBarangay(false);
    setMunicipalityValue(value);

    const allBarangays = municipalities.find(value);
    const mappedBarangays = allBarangays ? allBarangays.barangays : [];

    setBarangayValues(mappedBarangays.map((barangay) => barangay.name));
    municipalityOnChange(value);
    if (mappedBarangays.length > 0) {
      setopenBarangay(true);
    }
  };

  const handleClickBarangay = (value: string) => {
    setBarangayValue(value);
    barangayOnChange(value);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <Label htmlFor={"region"} className="mb-3 font-normal">
          Region
        </Label>
        <div className="mt-2">
          <Select value={regionValue} onValueChange={handleClickRegion}>
            <SelectTrigger id={id}>
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              {allRegions.map((region) => (
                <SelectItem value={region.name} key={region.name}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div hidden={!openProvince} className="">
        <div className="">
          <Label htmlFor={"region"}>Province</Label>
          <div className="mt-2">
            <Select value={provinceValue} onValueChange={handleClickProvince}>
              <SelectTrigger id={provinceID}>
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                {provincesValues?.map((region) => (
                  <SelectItem value={region} key={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div hidden={!openMunicipality} className="">
        <div className="">
          <Label htmlFor={"region"}>Municipality</Label>
          <div className="mt-2">
            <Select
              value={municipalityValue}
              onValueChange={handleClickMunicipality}
            >
              <SelectTrigger id={municipalityID}>
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                {municipalitiesValues?.map((municipalities) => (
                  <SelectItem value={municipalities} key={municipalities}>
                    {municipalities}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div hidden={!openBarangay} className="">
        <div className="">
          <Label htmlFor={"barangay"}>Barangay</Label>
          <div className="mt-2">
            <Select value={barangayValue} onValueChange={handleClickBarangay}>
              <SelectTrigger id={barangayID}>
                <SelectValue placeholder="Select barangay" />
              </SelectTrigger>
              <SelectContent>
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
