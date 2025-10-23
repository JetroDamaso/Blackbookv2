"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import RegionComboBoxComponent from "./RegionComboBox";

export default function RegionComboBoxDemo() {
  // State for new address form
  const [newRegion, setNewRegion] = useState("");
  const [newProvince, setNewProvince] = useState("");
  const [newMunicipality, setNewMunicipality] = useState("");
  const [newBarangay, setNewBarangay] = useState("");

  // State for editing existing address
  const [editRegion, setEditRegion] = useState("");
  const [editProvince, setEditProvince] = useState("");
  const [editMunicipality, setEditMunicipality] = useState("");
  const [editBarangay, setEditBarangay] = useState("");

  // Sample existing address data
  const existingAddress = {
    region: "National Capital Region (NCR)",
    province: "Metro Manila",
    municipality: "Quezon City",
    barangay: "Barangay Batasan Hills"
  };

  const handleLoadExistingAddress = () => {
    setEditRegion(existingAddress.region);
    setEditProvince(existingAddress.province);
    setEditMunicipality(existingAddress.municipality);
    setEditBarangay(existingAddress.barangay);
  };

  const handleClearEdit = () => {
    setEditRegion("");
    setEditProvince("");
    setEditMunicipality("");
    setEditBarangay("");
  };

  const getAddressString = (region: string, province: string, municipality: string, barangay: string) => {
    const parts = [barangay, municipality, province, region].filter(part => part.trim() !== "");
    return parts.length > 0 ? parts.join(", ") : "No address selected";
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">RegionComboBox Component Demo</h1>
        <p className="text-muted-foreground mt-2">
          Demonstrates the enhanced RegionComboBox with initial values support
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* New Address Form */}
        <Card>
          <CardHeader>
            <CardTitle>New Address Entry</CardTitle>
            <CardDescription>
              For creating new bookings or adding new client addresses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RegionComboBoxComponent
              regionOnChange={setNewRegion}
              provinceOnChange={setNewProvince}
              municipalityOnChange={setNewMunicipality}
              barangayOnChange={setNewBarangay}
            />

            <Separator />

            <div>
              <Label className="text-sm font-medium">Selected Address:</Label>
              <p className="text-sm text-muted-foreground mt-1 p-2 bg-gray-50 rounded border">
                {getAddressString(newRegion, newProvince, newMunicipality, newBarangay)}
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setNewRegion("");
                setNewProvince("");
                setNewMunicipality("");
                setNewBarangay("");
              }}
              className="w-full"
            >
              Clear Form
            </Button>
          </CardContent>
        </Card>

        {/* Edit Address Form */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Existing Address</CardTitle>
            <CardDescription>
              For editing booking dialog or updating client information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RegionComboBoxComponent
              initialRegion={editRegion}
              initialProvince={editProvince}
              initialMunicipality={editMunicipality}
              initialBarangay={editBarangay}
              regionOnChange={setEditRegion}
              provinceOnChange={setEditProvince}
              municipalityOnChange={setEditMunicipality}
              barangayOnChange={setEditBarangay}
            />

            <Separator />

            <div>
              <Label className="text-sm font-medium">Current Address:</Label>
              <p className="text-sm text-muted-foreground mt-1 p-2 bg-gray-50 rounded border">
                {getAddressString(editRegion, editProvince, editMunicipality, editBarangay)}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleLoadExistingAddress}
                className="flex-1"
              >
                Load Sample Address
              </Button>
              <Button
                variant="outline"
                onClick={handleClearEdit}
                className="flex-1"
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disabled State Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Disabled State</CardTitle>
          <CardDescription>
            Shows how the component appears when in read-only mode
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegionComboBoxComponent
            initialRegion={existingAddress.region}
            initialProvince={existingAddress.province}
            initialMunicipality={existingAddress.municipality}
            initialBarangay={existingAddress.barangay}
            regionOnChange={() => {}}
            provinceOnChange={() => {}}
            municipalityOnChange={() => {}}
            barangayOnChange={() => {}}
            disabled={true}
          />
        </CardContent>
      </Card>

      {/* Features Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-green-700">✓ New Features</h4>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• Initial values support for editing mode</li>
                <li>• Automatic dropdown initialization</li>
                <li>• Disabled state for read-only display</li>
                <li>• Proper cascading resets on changes</li>
                <li>• Improved visual feedback</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-700">✓ Backward Compatible</h4>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• Works with existing implementations</li>
                <li>• All new props are optional</li>
                <li>• Same callback interface</li>
                <li>• No breaking changes</li>
                <li>• Uses PSGC data as before</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
