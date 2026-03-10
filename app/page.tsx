import HomeSection from "@/sections/home/homeSection";
import HomeFeatures from "@/sections/home/homeFeatures";
import NewArrival from "@/sections/home/newArrival";
import Article from "@/sections/home/articlepage";
import Hundreds from "@/sections/home/hundreds";
import Newsletter from "@/sections/home/newsletter";
import ArticlePage from "@/sections/home/articlepage";
export default function Home() {
  return (
    <main>
      <HomeSection />
      <HomeFeatures/>
      <NewArrival/>
      <Hundreds/>
      <ArticlePage/>
      <Newsletter/>
    </main>
  );
}