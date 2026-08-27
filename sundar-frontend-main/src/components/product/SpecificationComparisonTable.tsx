import React from 'react';

interface SpecsTableData {
  headers: string[];
  rows: string[][];
}

interface Props {
  data?: SpecsTableData;
  themeColor?: string;
}

const SpecificationComparisonTable: React.FC<Props> = ({ data, themeColor = '#07111F' }) => {
  if (!data || !data.headers || data.headers.length === 0 || !data.rows || data.rows.length === 0) return null;

  return (
    <section className="py-24 lg:py-32 bg-white border-t border-gray-100">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-16 lg:mb-24 flex flex-col items-center text-center">
          <div className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-gray-500">
            Technical Data
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight">
            Specification <span style={{ color: themeColor }}>Comparison</span>
          </h2>
          <p className="mt-6 text-gray-500 max-w-2xl text-lg font-medium">
            Detailed technical specifications across different variants to help you choose the right packaging solution.
          </p>
        </div>

        <div className="overflow-x-auto rounded-[24px] border border-gray-200 shadow-sm hide-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {data.headers.map((header, idx) => (
                  <th 
                    key={idx} 
                    className={`p-6 text-sm font-black uppercase tracking-widest ${idx === 0 ? 'text-gray-900 bg-gray-100/50 sticky left-0 z-10 border-r border-gray-200' : 'text-gray-600 text-center'}`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-gray-50/50 transition-colors">
                  {row.map((cell, cellIdx) => (
                    <td 
                      key={cellIdx} 
                      className={`p-6 ${cellIdx === 0 ? 'font-bold text-gray-900 bg-white sticky left-0 z-10 border-r border-gray-100 shadow-[2px_0_10px_rgba(0,0,0,0.02)]' : 'text-gray-600 font-medium text-center'}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default SpecificationComparisonTable;
