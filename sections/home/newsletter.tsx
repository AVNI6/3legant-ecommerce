// import { MdOutlineMail } from "react-icons/md";
// import Image from "next/image";

// const Newsletter = () => {
//   return (
//     <section className="mt-5 md:mt-16 w-full">

//       <div className="relative w-full bg-gray-100 overflow-hidden">
//         <Image
//           src="/newsletter.png"
//           width={1600}
//           height={500}
//           alt="Newsletter"
//           className="hidden md:block w-full h-auto object-contain"
//          />

//         <div className="w-full md:absolute md:inset-0 flex flex-col items-center justify-center text-center px-6 py-14 md:py-0">
//           <h1 className="font-semibold text-3xl sm:text-4xl mb-2">
//             Join Our Newsletter
//           </h1>
//           <p className="text-gray-600 mb-8 text-sm sm:text-base">
//             Sign up for deals, new products and promotions
//           </p>

//           <div className="w-full max-w-md border-b border-gray-400 flex items-center justify-between pb-2">
//             <div className="flex items-center gap-2 text-gray-500 w-full">
//               <MdOutlineMail />
//               <input  className="w-full outline-none bg-transparent" placeholder="Email address"  />
//             </div>
//             <button className="text-gray-500 font-medium">
//               Signup
//             </button>
//           </div>

//         </div>
//       </div>
//     </section>
//   );
// };

// export default Newsletter;

import { MdOutlineMail } from "react-icons/md";
import Image from "next/image";
import { useState } from "react";

const Newsletter = () => {
  const [email, setEmail] = useState(""); // store email input
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignup = async () => {
    if (!email) {
      setMessage("Please enter your email");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        "https://sxsjeofbzfxadywvysue.supabase.co/functions/v1/resend-email",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage("Signup failed: " + (data.error || "Unknown error"));
        return;
      }

      setMessage("Thanks for signing up! Check your inbox.");
      setEmail(""); // clear input
    } catch (err: any) {
      setMessage("Signup failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-5 md:mt-16 w-full">
      <div className="relative w-full bg-gray-100 overflow-hidden">
        <Image
          src="/newsletter.png"
          width={1600}
          height={500}
          alt="Newsletter"
          className="hidden md:block w-full h-auto object-contain"
        />

        <div className="w-full md:absolute md:inset-0 flex flex-col items-center justify-center text-center px-6 py-14 md:py-0">
          <h1 className="font-semibold text-3xl sm:text-4xl mb-2">
            Join Our Newsletter
          </h1>
          <p className="text-gray-600 mb-8 text-sm sm:text-base">
            Sign up for deals, new products and promotions
          </p>

          <div className="w-full max-w-md border-b border-gray-400 flex items-center justify-between pb-2">
            <div className="flex items-center gap-2 text-gray-500 w-full">
              <MdOutlineMail />
              <input
                className="w-full outline-none bg-transparent"
                placeholder="Email address"
                type="email"
                value={email} // controlled input
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              className="text-gray-500 font-medium"
              onClick={handleSignup} // call function on click
              disabled={loading} // disable while sending
            >
              {loading ? "Signing up..." : "Signup"}
            </button>
          </div>

          {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
        </div>
      </div>
    </section>
  );
};

export default Newsletter;