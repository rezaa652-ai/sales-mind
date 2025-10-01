'use client';

type IncomeRow = { age: string; tkr: number };

export type DemoData = {
  year: number;
  incomeByAge: IncomeRow[];
  population?: number;
  densityPerKm2?: number;
  households1pShare?: number; // 0..1 (optional)
  households2pShare?: number; // 0..1 (optional)
};

export default function DemographicsCard({
  data,
  title,
}: {
  data: DemoData;
  title: string;
}) {
  return (
    <div className="border rounded p-3 bg-slate-50">
      <div className="text-sm text-slate-600">
        {title} — {data.year}
      </div>
      <ul className="list-disc pl-5 text-sm">
        {typeof data.population === 'number' && (
          <li>Befolkning: {data.population.toLocaleString('sv-SE')}</li>
        )}
        {typeof data.densityPerKm2 === 'number' && (
          <li>Täthet: {Math.round(data.densityPerKm2)} /km²</li>
        )}
        {Array.isArray(data.incomeByAge) &&
          data.incomeByAge.map((r, i) => (
            <li key={i}>
              {r.age}: {r.tkr} tkr
            </li>
          ))}
        {typeof data.households1pShare === 'number' && (
          <li>Enpersonshushåll: {Math.round(data.households1pShare * 100)}%</li>
        )}
        {typeof data.households2pShare === 'number' && (
          <li>Tvåpersonshushåll: {Math.round(data.households2pShare * 100)}%</li>
        )}
      </ul>
    </div>
  );
}
