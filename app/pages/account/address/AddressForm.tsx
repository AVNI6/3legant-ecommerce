"use client";

import { useState } from "react";
import { AddressType as AddressTypeEnum } from "@/types/enums";

type AddressLabel = "Home" | "Office" | "School" | "Other";
type AddressKind = "shipping" | "billing";

export type AddressType = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  addressLabel?: AddressLabel;
  addressType?: AddressKind;
  isDefault?: boolean;
};

type AddressFormProps = {
  address: AddressType;
  submitLabel: string;
  isSaving: boolean;
  onSave: (updated: AddressType) => void;
  onCancel: () => void;
};

const ADDRESS_LABELS: AddressLabel[] = ["Home", "Office", "School", "Other"];

const EMPTY_ADDRESS: AddressType = {
  firstName: "",
  lastName: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  country: "",
  addressLabel: "Home",
  addressType: AddressTypeEnum.SHIPPING as any,
  isDefault: false,
};

const toText = (value?: string) => value ?? "";

const AddressForm = ({ address, submitLabel, isSaving, onSave, onCancel }: AddressFormProps) => {
  const [localAddress, setLocalAddress] = useState<AddressType>({
    ...EMPTY_ADDRESS,
    ...address,
    addressLabel: address.addressLabel || "Home",
    addressType: address.addressType || AddressTypeEnum.SHIPPING,
    isDefault: !!address.isDefault,
  });

  const fields: { key: keyof AddressType; label: string; placeholder: string; fullWidth?: boolean }[] = [
    { key: "firstName", label: "First Name", placeholder: "e.g. Sofia" },
    { key: "lastName", label: "Last Name", placeholder: "e.g. Havertz" },
    { key: "phone", label: "Phone Number", placeholder: "e.g. (+1) 234 567 890", fullWidth: true },
    { key: "street", label: "Street Address", placeholder: "345 Long Island", fullWidth: true },
    { key: "city", label: "City", placeholder: "New York" },
    { key: "state", label: "State / Province", placeholder: "New York" },
    { key: "zip", label: "ZIP / Postal Code", placeholder: "10001" },
    { key: "country", label: "Country", placeholder: "United States" },
  ];

  return (
    <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-xl w-full max-w-lg mx-auto border border-gray-100 animate-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg sm:text-2xl font-bold tracking-tight">{submitLabel}</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-black transition-colors text-2xl">&times;</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Address Type</label>
          <select
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-black focus:ring-1 focus:ring-black transition-all outline-none bg-gray-50/50 cursor-pointer"
            value={localAddress.addressType}
            onChange={(e) => setLocalAddress(prev => ({ ...prev, addressType: e.target.value as AddressKind }))}
          >
            <option value={AddressTypeEnum.SHIPPING}>Shipping</option>
            <option value={AddressTypeEnum.BILLING}>Billing</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Label</label>
          <select
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-black focus:ring-1 focus:ring-black transition-all outline-none bg-gray-50/50 cursor-pointer"
            value={localAddress.addressLabel}
            onChange={(e) => setLocalAddress(prev => ({ ...prev, addressLabel: e.target.value as AddressLabel }))}
          >
            {ADDRESS_LABELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
        {fields.map((f) => (
          <div key={f.key} className={`space-y-1.5 ${f.fullWidth ? 'md:col-span-2' : ''}`}>
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">{f.label}</label>
            <input
              type="text"
              placeholder={f.placeholder}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-black focus:ring-1 focus:ring-black transition-all outline-none"
              value={toText(localAddress[f.key] as string)}
              onChange={(e) => setLocalAddress(prev => ({ ...prev, [f.key]: e.target.value }))}
            />
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-50">
        <label className="flex items-center gap-3 group cursor-pointer">
          <input
            type="checkbox"
            className="w-5 h-5 rounded-lg border-gray-300 accent-black cursor-pointer transition-all"
            checked={!!localAddress.isDefault}
            onChange={(e) => setLocalAddress(prev => ({ ...prev, isDefault: e.target.checked }))}
          />
          <span className="text-[11px] sm:text-sm font-semibold text-gray-600 group-hover:text-black transition-colors">Set as default address</span>
        </label>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <button
          className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all sm:order-1"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          disabled={isSaving}
          className="flex-1 px-6 py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 disabled:opacity-50 transition-all shadow-lg active:scale-95 sm:order-2"
          onClick={() => {
            const requiredFields: (keyof AddressType)[] = ["firstName", "lastName", "phone", "street", "city", "state", "zip", "country"];
            const missing = requiredFields.filter(f => !localAddress[f] || (localAddress[f] as string).trim() === "");
            if (missing.length > 0) {
              import("react-toastify").then(({ toast }) => {
                toast.warning("Please fill in all fields.");
              });
              return;
            }
            onSave(localAddress);
          }}
        >
          {isSaving ? "Saving..." : submitLabel.includes("Save") ? "Save Changes" : "Save Address"}
        </button>
      </div>
    </div>
  );
};

export default AddressForm;
