import { features } from "@/constants/Data";

const ContactFeature = () => {
  return (
    <div className="bg-gray-100 py-10 ">
      <div className="max-w-7xl mx-auto px-10 ">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          
          {features.map((item, index) => (
            <div key={index}>
              <div className="text-2xl flex ">
                {item.icon}
              </div>
              <h4 className=" my-2">{item.title}</h4>
              <p className="text-sm text-gray-500">{item.des}</p>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};

export default ContactFeature;