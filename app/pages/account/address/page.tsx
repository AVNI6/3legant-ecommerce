const Address = () => {
  return (
    <><h1 className="text-xl font-semibold">Address</h1><div className="flex flex-col md:flex-row gap-6 mt-10">


      {/* Billing Address */}
      <div className="border rounded-md p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-medium">Billing Address</h2>
          <button className="text-blue-500 hover:underline">
            Edit
          </button>
        </div>
        <p className="text-gray-500">John Doe</p>
        <p className="text-gray-500">(+1) 234 567 890</p>
        <p className="text-gray-500">345 Long Island, New York, United States</p>
      </div>

      {/* Shipping Address */}
      <div className="border rounded-md p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-medium">Shipping Address</h2>
          <button className="text-blue-500 hover:underline">
            Edit
          </button>
        </div>
        <p className="text-gray-500">John Doe</p>
        <p className="text-gray-500">(+1) 234 567 890</p>
        <p className="text-gray-500">345 Long Island, New York, United States</p>
      </div>
    </div></>
  );
}

export default Address;