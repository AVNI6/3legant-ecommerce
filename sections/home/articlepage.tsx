// import Article from "@/components/article";
// import BlackShopButton from "@/components/blackbutton";
// import { APP_ROUTE } from "@/constants/AppRoutes";
// import { articles } from "@/constants/Data";
// const ArticlePage = () => {
//     return (
//         <section className="px-4 sm:px-12 md:px-10 lg:px-30 overflow-x-hidden">
//             <div className="my-10 flex items-center justify-between">
//                 <h1 className="font-bold text-2xl sm:text-3xl">Articles</h1>
//                 <BlackShopButton  className="text-[18px]" content="More Articles" href={APP_ROUTE.blog}/>
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//                 {articles.slice(0, 3).map((data, i) => (
//                     <div key={i}>
                        
//                         <img src={data.image} alt="article" className=" w-full h-[283px] sm:h-[320px] md:h-auto object-cover " />
//                         <div className="pt-4">
//                             <h2 className="font-semibold text-lg mb-2">
//                                 {data.title}
//                             </h2>
//                             <BlackShopButton  className="text-[15px]" content="Read more" href={APP_ROUTE.blog} />
//                         </div>
//                     </div>
//                 ))}

//             </div>
//             {/* <Article data={articles}/> */}
//         </section>
//     );
// };

// export default ArticlePage;



import Article from "@/components/article";
import BlackShopButton from "@/components/blackbutton";
import { APP_ROUTE } from "@/constants/AppRoutes";
import { articles } from "@/constants/Data";
import Link from "next/link";

const ArticlePage = () => {
  const createSlug = (title: string) =>
    title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

  return (
    <section className="px-4 sm:px-12 md:px-10 lg:px-30 overflow-x-hidden">
      <div className="my-10 flex items-center justify-between">
        <h1 className="font-bold text-2xl sm:text-3xl">Articles</h1>

        <BlackShopButton
          className="text-[18px]"
          content="More Articles"
          href={APP_ROUTE.blog}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {articles.slice(0, 3).map((data, i) => {
          const slug = createSlug(data.title);

          return (
            <div key={i}>
              <Link href={`${APP_ROUTE.blog}/${slug}`}>
                <img
                  src={data.image}
                  alt="article"
                  className="w-full h-[283px] sm:h-[320px] md:h-auto object-cover"
                />
              </Link>

              <div className="pt-4">
                <h2 className="font-semibold text-lg mb-2">{data.title}</h2>

                <BlackShopButton
                  className="text-[15px]"
                  content="Read more"
                  href={`${APP_ROUTE.blog}/${slug}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ArticlePage;