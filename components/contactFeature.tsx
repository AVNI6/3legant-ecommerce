import { features } from "@/constants/Data";

const ContactFeature = () => {
  return (
    <div className="bg-gray-100 py-6 min-[375px]:py-8  ">
      <div className="max-w-7xl px-4 min-[375px]:px-6 sm:px-14 lg:px-34  ">
        <div className="grid grid-cols-1 min-[300px]:grid-cols-2 md:grid-cols-4 gap-6 min-[300px]:gap-12">

          {features.map((item, index) => (
            <div key={index} className="flex flex-col gap-1 min-[300px]:gap-2 items-center min-[300px]:items-start text-center min-[375px]:text-left cursor-pointer transition-colors hover:text-black" >
              <div className="text-xl min-[375px]:text-2xl">
                {item.icon}
              </div>
              <h4 className="font-semibold text-xs min-[375px]:text-[14px] leading-tight min-[375px]:leading-[22px]">{item.title}</h4>
              <p className="text-[10px] min-[375px]:text-sm text-gray-500">{item.des}</p>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};

export default ContactFeature;