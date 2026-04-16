'use client';

interface DailyClicks {
  date: string;
  count: number;
}

interface AnalyticsProps {
  data: DailyClicks[];
  loading?: boolean;
}

export function Analytics({ data, loading = false }: AnalyticsProps) {
  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading analytics...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-gray-600">No click data yet</div>;
  }

  const totalClicks = data.reduce((sum, day) => sum + day.count, 0);
  const maxClicks = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600">Total Clicks (7 days)</p>
          <p className="text-3xl font-bold text-blue-600">{totalClicks}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600">Average per Day</p>
          <p className="text-3xl font-bold text-green-600">
            {(totalClicks / 7).toFixed(1)}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Clicks per Day</h3>
        <div className="space-y-2">
          {data.map((day) => {
            const percentage = (day.count / maxClicks) * 100;
            const formattedDate = new Date(day.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });

            return (
              <div key={day.date} className="flex items-center gap-4">
                <span className="w-20 text-sm font-medium text-gray-600">
                  {formattedDate}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-8 flex items-center justify-end pr-2 rounded-full"
                    style={{ width: `${percentage}%`, minWidth: '40px' }}
                  >
                    <span className="text-white font-bold text-sm">{day.count}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-2 font-medium text-gray-900">Date</th>
              <th className="px-4 py-2 font-medium text-gray-900">Clicks</th>
            </tr>
          </thead>
          <tbody>
            {data.map((day) => (
              <tr key={day.date} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">
                  {new Date(day.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </td>
                <td className="px-4 py-2 font-medium">{day.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
