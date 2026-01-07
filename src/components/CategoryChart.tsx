import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { categorySpendingData } from "@/lib/mockData";

export function CategoryChart() {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={categorySpendingData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
          >
            {categorySpendingData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.75rem",
              boxShadow: "0 4px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {categorySpendingData.map((category) => (
          <div key={category.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <span className="text-xs text-muted-foreground">{category.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
