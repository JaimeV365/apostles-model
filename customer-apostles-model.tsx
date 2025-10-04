import React, { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

const ApostlesModel = () => {
  const [satisfactionScale, setSatisfactionScale] = useState('5');
  const [loyaltyScale, setLoyaltyScale] = useState('5');
  
  const [data, setData] = useState([
    { name: 'Customer 1', satisfaction: 4.5, loyalty: 4.8, group: 'Advocates' },
    { name: 'Customer 2', satisfaction: 1.2, loyalty: 1.0, group: 'Trolls' },
    { name: 'Customer 3', satisfaction: 4.2, loyalty: 2.1, group: 'Mercenaries' },
    { name: 'Customer 4', satisfaction: 1.8, loyalty: 4.2, group: 'Hostages' }
  ]);

  const [newEntry, setNewEntry] = useState({
    name: '',
    satisfaction: '',
    loyalty: ''
  });

  const getScaleMidpoint = (scale) => {
    return (parseFloat(scale) + 1) / 2;
  };

  const addDataPoint = () => {
    if (newEntry.name && newEntry.satisfaction && newEntry.loyalty) {
      if (newEntry.satisfaction > parseFloat(satisfactionScale) || 
          newEntry.loyalty > parseFloat(loyaltyScale) ||
          newEntry.satisfaction < 1 || 
          newEntry.loyalty < 1) {
        alert('Please enter valid values within the selected scales');
        return;
      }
      
      // Determine the group based on position
      const satisfaction = Number(newEntry.satisfaction);
      const loyalty = Number(newEntry.loyalty);
      const midSat = getScaleMidpoint(satisfactionScale);
      const midLoy = getScaleMidpoint(loyaltyScale);
      
      let group = '';
      if (satisfaction >= midSat) {
        if (loyalty >= midLoy) {
          group = satisfaction >= midSat * 1.5 && loyalty >= midLoy * 1.5 ? 'Advocates' : 'Loyalists';
        } else {
          group = 'Mercenaries';
        }
      } else {
        if (loyalty >= midLoy) {
          group = 'Hostages';
        } else {
          group = satisfaction <= midSat * 0.5 && loyalty <= midLoy * 0.5 ? 'Trolls' : 'Defectors';
        }
      }

      setData([...data, {
        name: newEntry.name,
        satisfaction: satisfaction,
        loyalty: loyalty,
        group: group
      }]);
      setNewEntry({ name: '', satisfaction: '', loyalty: '' });
    }
  };

  const removeDataPoint = (name) => {
    setData(data.filter(item => item.name !== name));
  };

  // Custom background for the chart
  const CustomBackground = () => (
    <g>
      {/* Hostages Quadrant - Light Blue */}
      <rect x="0" y="0" width="50%" height="50%" fill="#D6E6F5" />
      
      {/* Loyalists Quadrant - Light Green */}
      <rect x="50%" y="0" width="50%" height="50%" fill="#D6F5D6" />
      
      {/* Defectors Quadrant - Light Red */}
      <rect x="0" y="50%" width="50%" height="50%" fill="#F5D6D6" />
      
      {/* Mercenaries Quadrant - Light Yellow */}
      <rect x="50%" y="50%" width="50%" height="50%" fill="#F5F5D6" />
      
      {/* Special zones */}
      <rect x="0" y="80%" width="20%" height="20%" fill="#8B0000" opacity="0.2" /> {/* Trolls zone */}
      <rect x="80%" y="0" width="20%" height="20%" fill="#228B22" opacity="0.2" /> {/* Advocates zone */}
    </g>
  );

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">The Apostles Model (Reviewed)</h2>
          <div className="flex gap-4 mt-2">
            <div>
              <label className="block text-sm text-gray-500">Satisfaction Scale:</label>
              <select 
                value={satisfactionScale} 
                onChange={(e) => setSatisfactionScale(e.target.value)}
                className="border p-1 rounded"
              >
                <option value="5">1-5</option>
                <option value="7">1-7</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-500">Repurchase Scale:</label>
              <select 
                value={loyaltyScale} 
                onChange={(e) => setLoyaltyScale(e.target.value)}
                className="border p-1 rounded"
              >
                <option value="5">1-5</option>
                <option value="10">1-10</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Customer Name"
              className="border p-2 rounded"
              value={newEntry.name}
              onChange={(e) => setNewEntry({...newEntry, name: e.target.value})}
            />
            <input
              type="number"
              placeholder={`Satisfaction (1-${satisfactionScale})`}
              className="border p-2 rounded"
              min="1"
              max={satisfactionScale}
              step="0.1"
              value={newEntry.satisfaction}
              onChange={(e) => setNewEntry({...newEntry, satisfaction: e.target.value})}
            />
            <input
              type="number"
              placeholder={`Repurchase (1-${loyaltyScale})`}
              className="border p-2 rounded"
              min="1"
              max={loyaltyScale}
              step="0.1"
              value={newEntry.loyalty}
              onChange={(e) => setNewEntry({...newEntry, loyalty: e.target.value})}
            />
            <button 
              onClick={addDataPoint}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus size={16} /> Add
            </button>
          </div>

          <div className="mb-6">
            <div className="max-h-40 overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left">Name</th>
                    <th className="text-left">Satisfaction</th>
                    <th className="text-left">Repurchase</th>
                    <th className="text-left">Group</th>
                    <th className="text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr key={item.name}>
                      <td>{item.name}</td>
                      <td>{item.satisfaction}</td>
                      <td>{item.loyalty}</td>
                      <td>{item.group}</td>
                      <td>
                        <button 
                          onClick={() => removeDataPoint(item.name)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="w-full h-[500px] relative">
            <ScatterChart
              width={600}
              height={500}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid />
              {CustomBackground()}
              <XAxis 
                type="number" 
                dataKey="satisfaction" 
                name="Satisfaction" 
                domain={[1, parseFloat(satisfactionScale)]}
                label={{ value: 'Satisfaction', position: 'bottom' }}
              />
              <YAxis 
                type="number" 
                dataKey="loyalty" 
                name="Repurchase" 
                domain={[1, parseFloat(loyaltyScale)]}
                label={{ value: 'Repurchase', angle: -90, position: 'left' }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ payload }) => {
                  if (payload && payload.length > 0) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-2 border rounded shadow">
                        <p>{data.name}</p>
                        <p>Satisfaction: {data.satisfaction}</p>
                        <p>Repurchase: {data.loyalty}</p>
                        <p>Group: {data.group}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine x={getScaleMidpoint(satisfactionScale)} stroke="#666" strokeDasharray="3 3" />
              <ReferenceLine y={getScaleMidpoint(loyaltyScale)} stroke="#666" strokeDasharray="3 3" />
              <Scatter 
                data={data} 
                fill="#8884d8"
                shape={(props) => {
                  const { cx, cy, fill } = props;
                  return (
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r={6} 
                      fill={
                        props.payload.group === 'Advocates' ? '#228B22' :
                        props.payload.group === 'Trolls' ? '#8B0000' :
                        '#8884d8'
                      }
                    />
                  );
                }}
              />
            </ScatterChart>

            {/* Quadrant Labels */}
            <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 text-blue-800 font-bold">
              Hostages
            </div>
            <div className="absolute top-1/4 right-1/4 transform translate-x-1/2 -translate-y-1/2 text-green-800 font-bold">
              Loyalists
            </div>
            <div className="absolute bottom-1/4 left-1/4 transform -translate-x-1/2 translate-y-1/2 text-red-800 font-bold">
              Defectors
            </div>
            <div className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2 text-yellow-800 font-bold">
              Mercenaries
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApostlesModel;
