"use client";

import { useEffect, useState } from "react";
import { CiEdit } from "react-icons/ci";
import { AddressType as AddressTypeEnum } from "@/types/enums";
import { AddressPageSkeleton } from "@/components/ui/skeleton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAddresses, createAddressThunk, updateAddressThunk, removeAddressThunk, setDefaultAddressThunk, selectAddresses, selectIsAddressCacheValid } from "@/store/slices/addressSlice";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { HiOutlineLocationMarker, HiOutlinePhone } from "react-icons/hi";
import AddressForm, { AddressType } from "./AddressForm";
import Pagination from "@/components/common/Pagination";
import { useSearchParams } from "next/navigation";
import Modal from "@/components/ui/Modal";

const Address = () => {
  const dispatch = useAppDispatch();
  const { user, loading: authLoading } = useAppSelector(state => state.auth);
  const addresses = useAppSelector(selectAddresses);
  const isCacheValid = useAppSelector(selectIsAddressCacheValid);
  const reduxLoading = useAppSelector((state: any) => state.addresses.loading);
  const totalCount = useAppSelector((state: any) => state.addresses.totalCount);

  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 4;

  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [addressToRemove, setAddressToRemove] = useState<string | null>(null);
  const [defaultAddressId, setDefaultAddressId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAddresses({ userId: user.id, page: currentPage, pageSize }));
    }
  }, [user?.id, currentPage, dispatch]);

  useEffect(() => {
    const def = addresses.find((a: any) => a.is_default);
    setDefaultAddressId(def?.id || null);
  }, [addresses]);

  // Prevent background scrolling when any modal/form is active
  useEffect(() => {
    const isAnyModalOpen = !!editingAddress || !!showAddForm || !!addressToRemove;
    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [editingAddress, showAddForm, addressToRemove]);

  const setDefaultAddress = (addressId: string) => {
    if (!user?.id) return;
    // ⚡ Optimistic update for instant UI response
    setDefaultAddressId(addressId);
    dispatch(setDefaultAddressThunk({ userId: user.id, addressId }))
      .unwrap().catch(err => {
        toast.error(err);
        // Sync back on error
        const def = addresses.find((a: any) => a.is_default);
        setDefaultAddressId(def?.id || null);
      });
  };

  const createAddress = async (newAddress: AddressType) => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      await dispatch(createAddressThunk({ userId: user.id, address: newAddress })).unwrap();
      toast.success("Address added successfully");
      setShowAddForm(false);
    } catch (err: any) {
      toast.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const updateAddress = async (address: any, updated: AddressType) => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      await dispatch(updateAddressThunk({ addressId: address.id, updates: updated, userId: user.id })).unwrap();
      toast.success("Address updated successfully");
      setEditingAddress(null);
    } catch (err: any) {
      toast.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const removeAddress = async (addressId: string) => {
    try {
      await dispatch(removeAddressThunk(addressId)).unwrap();
      toast.success("Address removed successfully");
    } catch (err: any) {
      toast.error(err);
    }
    setAddressToRemove(null);
  };

  const mapToForm = (addr: any) => ({
    firstName: addr.first_name || addr.firstName,
    lastName: addr.last_name || addr.lastName,
    phone: addr.phone,
    street: addr.street,
    city: addr.city,
    state: addr.state,
    zip: addr.zip,
    country: addr.country,
    addressLabel: addr.address_label || addr.addressLabel || "Home",
    addressType: addr.address_type || addr.addressType,
    isDefault: !!addr.is_default,
  });

  if ((reduxLoading || authLoading) && addresses.length === 0) return <AddressPageSkeleton />;

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-inter font-semibold text-[20px] leading-[32px] tracking-normalt">Address</h1>
        <button
          className="flex items-center justify-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-all font-bold text-sm shadow-lg active:scale-95 w-full sm:w-auto"
          onClick={() => setShowAddForm(true)}
        >
          <FiPlus /> Add New Address
        </button>
      </div>

      {addresses.length === 0 && !reduxLoading && !authLoading && (
        <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400 font-medium">No saved addresses yet.</p>
          <p className="text-xs text-gray-300 mt-1 uppercase tracking-widest">Start by adding your first one</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {addresses.map((addr: any) => (
          <div
            key={addr.id}
            className={`group relative border rounded-2xl p-6 transition-all duration-300 bg-white ${defaultAddressId === addr.id
              ? "border-black ring-1 ring-black shadow-md"
              : "border-gray-200 hover:border-black hover:shadow-lg"
              }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 mb-1">
                  {addr.address_type === AddressTypeEnum.SHIPPING ? "Shipping Address" : "Billing Address"}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-black bg-gray-900 text-white px-1.5 py-0.5 rounded tracking-tighter italic">
                    {addr.address_label || "Home"}
                  </span>
                  {defaultAddressId === addr.id && (
                    <span className="text-[8px] font-black bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded tracking-tighter uppercase">
                      Default
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
                  onClick={() => setEditingAddress(addr)}
                  title="Edit Address"
                >
                  <CiEdit className="text-lg" />
                </button>
                <button
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  onClick={() => setAddressToRemove(addr.id)}
                  title="Remove Address"
                >
                  <FiTrash2 className="text-base" />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <p className="font-bold text-gray-900 text-sm">
                {addr.first_name || addr.firstName} {addr.last_name || addr.lastName}
              </p>
              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                <HiOutlinePhone className="flex-shrink-0" />
                <span>{addr.phone}</span>
              </div>
              <div className="flex items-start gap-1.5 text-gray-500 text-xs pt-1">
                <HiOutlineLocationMarker className="flex-shrink-0 mt-0.5" />
                <span>
                  {addr.street}, {addr.city}, {addr.state} {addr.zip}, {addr.country}
                </span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group/label">
                <input
                  type="radio"
                  name="default-address"
                  checked={defaultAddressId === addr.id}
                  onChange={() => setDefaultAddress(addr.id)}
                  className="accent-black w-4 h-4"
                />
                <span className="text-[10px] font-bold text-gray-400 group-hover/label:text-black transition-colors uppercase">Set as Default</span>
              </label>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(totalCount / pageSize)}
      />

      {editingAddress && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto" onClick={() => setEditingAddress(null)}>
          <div className="w-full max-w-md my-auto" onClick={e => e.stopPropagation()}>
            <AddressForm
              address={mapToForm(editingAddress)}
              submitLabel="Save Changes"
              isSaving={isSaving}
              onSave={(updated) => updateAddress(editingAddress, updated)}
              onCancel={() => setEditingAddress(null)}
            />
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto" onClick={() => setShowAddForm(false)}>
          <div className="w-full max-w-md my-auto" onClick={e => e.stopPropagation()}>
            <AddressForm
              address={{ isDefault: addresses.length === 0 }}
              submitLabel="Add Address"
              isSaving={isSaving}
              onSave={(newAddress) => createAddress(newAddress)}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}

      <Modal
        isOpen={!!addressToRemove}
        onClose={() => setAddressToRemove(null)}
        title="Delete Address"
      >
        <div className="space-y-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-2">
            <FiTrash2 className="w-8 h-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-bold text-gray-900">Delete Address?</h4>
            <p className="text-gray-500 font-medium">Are you sure you want to remove this address? This action cannot be undone.</p>
          </div>
          <div className="flex gap-3 w-full pt-4">
            <button
              className="flex-1 py-3.5 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all text-gray-500"
              onClick={() => setAddressToRemove(null)}
            >
              Cancel
            </button>
            <button
              className="flex-1 py-3.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg active:scale-95"
              onClick={() => addressToRemove && removeAddress(addressToRemove)}
            >
              Remove
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Address;
