import BurndownChart from "@/components/BurndownChart";
import DeveloperTimeChart from "@/components/DeveloperTimeChart";

export default function Statistics() {
  return (
    <main className="flex flex-col gap-8">
      <h1 className="text-3xl font-semibold">📊 Statistics</h1>
      <section className="flex flex-wrap justify-between gap-y-8">
        <BurndownChart />
        <DeveloperTimeChart />
      </section>
    </main>
  );
}
