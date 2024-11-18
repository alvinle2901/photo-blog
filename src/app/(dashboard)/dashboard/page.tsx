import { Metadata } from "next";
import ShuffleHero from "../_components/ShuffleHero";

export const metadata: Metadata = {
  title: "Overview",
};

const page = () => {
  return (
    <section className="p-4 space-y-4 pb-20">
      <ShuffleHero />
    </section>
  );
};

export default page;
