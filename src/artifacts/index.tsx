import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Define TypeScript interfaces for our data
interface BudgetItem {
  description: string;
  amount: number;
  category: string;
}

interface IncomeItem {
  description: string;
  amount: number;
}

interface CategoryTotals {
  [key: string]: number; // Add index signature for string keys
}

interface ChartDataItem {
  name: string;
  value: number;
}

const SeniorWeekBudgetPlanner = () => {
  // Harvard branding colors
  const HARVARD_CRIMSON = "#A51C30";

  // Constants
  const TOTAL_CLASS_SIZE = 1965;
  const ROYALE_COSTS = 55250;
  const SOIREE_COSTS = 72574;
  const DEFAULT_ALTITUDE_COSTS = 11102.67;
  
  // Real World Wine Society Event total expense
  const WINE_SOCIETY_EXPENSE = 300 + 512 + 122; // $934
  
  // Tasty Burger total expense
  const TASTY_BURGER_EXPENSE = 450 + 2500; // $2,950
  
  // DX total expense
  const DX_EXPENSE = 2000 + 4543.07; // $6,543.07
  
  // Income data - updated with new event revenues
  const incomeData: IncomeItem[] = [
    { description: "Income from HY Game On", amount: 11250 },
    { description: "Income from January Game On", amount: 3130 },
    { description: "Real World Wine Society Revenue", amount: 1056 },
    { description: "DX Event Revenue", amount: 2900 },
    { description: "Tasty Burger Revenue", amount: 2415.19 }
  ];
  
  // State
  const [royaleAttendance, setRoyaleAttendance] = useState(1000);
  const [soireeAttendance, setSoireeAttendance] = useState(1200);
  const [altitudeAttendance, setAltitudeAttendance] = useState(500);
  const [targetSurplus, setTargetSurplus] = useState(5000);
  const [altitudeCosts, setAltitudeCosts] = useState(DEFAULT_ALTITUDE_COSTS);
  const [royalePrice, setRoyalePrice] = useState(0);
  const [soireePrice, setSoireePrice] = useState(0);
  const [altitudePrice, setAltitudePrice] = useState(0);
  const [projectedSurplus, setProjectedSurplus] = useState(0);

  // Budget data - create a dynamic version that updates with altitude costs
  const getDynamicBudgetData = (): BudgetItem[] => {
    return [
      { description: "Squarespace Domain Purchase", amount: 14, category: "Website & Communication" },
      { description: "MailChimp Email Subscriptions", amount: 382.5, category: "Website & Communication" },
      { description: "Wix Class Website Plan", amount: 242.25, category: "Website & Communication" },
      { description: "Game On Photography", amount: 400, category: "Events & Activities" },
      { description: "Real World Wine Society Event", amount: WINE_SOCIETY_EXPENSE, category: "Events & Activities" },
      { description: "Tasty Burger", amount: TASTY_BURGER_EXPENSE, category: "Events & Activities" },
      { description: "Altitude Rental & Buses", amount: altitudeCosts, category: "Events & Activities" },
      { description: "Camp Harvard Activities", amount: 3080, category: "Events & Activities" },
      { description: "DX deposit & remainder", amount: DX_EXPENSE, category: "Events & Activities" },
      { description: "Royale Rental", amount: 31250, category: "Royale Event" },
      { description: "Royale Buses Back to Campus", amount: 24000, category: "Royale Event" },
      { description: "Senior Soiree Food", amount: 28539, category: "Senior Soiree" },
      { description: "Senior Soiree Beer, Wine & Staff", amount: 40050, category: "Senior Soiree" },
      { description: "Senior Soiree DJ and photo booths", amount: 3985, category: "Senior Soiree" },
    ];
  };

  // Calculate Altitude price directly from costs
  const baseAltitudePrice = altitudeCosts / altitudeAttendance;
  
  // Game On Income
  const GAME_ON_INCOME = incomeData.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate Altitude Income based on attendance and price
  const altitudeIncome = baseAltitudePrice * altitudeAttendance;

  // Get budget data with current Altitude costs
  const budgetData = getDynamicBudgetData();
  
  // Calculated values
  const TOTAL_INCOME = GAME_ON_INCOME + altitudeIncome;
  const TOTAL_EXPENSES = budgetData.reduce((sum, item) => sum + item.amount, 0);
  const NET_EXPENDITURE = TOTAL_EXPENSES - TOTAL_INCOME;
  const TOTAL_EVENT_COSTS = ROYALE_COSTS + SOIREE_COSTS;

  // Calculate category totals for pie chart
  const categoryTotals: CategoryTotals = budgetData.reduce((acc: CategoryTotals, item) => {
    if (!acc[item.category]) {
      acc[item.category] = 0;
    }
    acc[item.category] += item.amount;
    return acc;
  }, {});

  const pieChartData: ChartDataItem[] = Object.keys(categoryTotals).map(category => ({
    name: category,
    value: categoryTotals[category]
  }));

  // Calculate projected revenues
  const projectedRoyaleIncome = royalePrice * royaleAttendance;
  const projectedSoireeIncome = soireePrice * soireeAttendance;
  
  // Income chart data
  const incomeChartData: ChartDataItem[] = [
    { name: "Game On Income", value: GAME_ON_INCOME },
    { name: "Altitude Ticket Income", value: altitudeIncome },
    { name: "Projected Royale Ticket Sales", value: projectedRoyaleIncome },
    { name: "Projected Soiree Ticket Sales", value: projectedSoireeIncome }
  ];
  
  // Colors for charts - using Harvard theme with enough colors for all categories
  const COLORS = [HARVARD_CRIMSON, '#B4A76C', '#4E84C4', '#8D8D8D', '#D9C574', '#1E1E1E'];
  const INCOME_COLORS = ['#B4A76C', '#D9C574', HARVARD_CRIMSON, '#4E84C4', '#8D8D8D', '#698269', '#A7D397'];

  // Calculate ticket prices based on attendance and all income
  const calculateTicketPrices = () => {
    // Set Altitude price directly from costs
    const calculatedAltitudePrice = altitudeCosts / altitudeAttendance;
    setAltitudePrice(calculatedAltitudePrice);
    
    // Calculate the total amount that needs to be covered by Royale and Soiree ticket sales
    // This is net expenditure (expenses - existing income) + target surplus
    const amountNeededFromTickets = NET_EXPENDITURE + targetSurplus;
    
    // Distribute this amount between Royale and Soiree proportionally based on their costs
    const royalePortionOfNeeded = (ROYALE_COSTS / TOTAL_EVENT_COSTS) * amountNeededFromTickets;
    const soireePortionOfNeeded = (SOIREE_COSTS / TOTAL_EVENT_COSTS) * amountNeededFromTickets;
    
    // Calculate ticket prices based on these portions
    const calculatedRoyalePrice = royalePortionOfNeeded / royaleAttendance;
    const calculatedSoireePrice = soireePortionOfNeeded / soireeAttendance;
    
    // Calculate projected surplus
    const calculatedTotalTicketRevenue = 
      (calculatedRoyalePrice * royaleAttendance) + 
      (calculatedSoireePrice * soireeAttendance);
    const calculatedProjectedSurplus = calculatedTotalTicketRevenue - NET_EXPENDITURE;
    
    setRoyalePrice(calculatedRoyalePrice);
    setSoireePrice(calculatedSoireePrice);
    setProjectedSurplus(calculatedProjectedSurplus);
  };

  // Recalculate when parameters change
  useEffect(() => {
    calculateTicketPrices();
  }, [royaleAttendance, soireeAttendance, altitudeAttendance, targetSurplus, altitudeCosts]);

  // Helper function to format values for the tooltip
  const formatValue = (value: any): string => {
    // Check if value is a number
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    // Check if value is an array (recharts sometimes passes arrays)
    if (Array.isArray(value) && value.length > 0) {
      const firstValue = value[0];
      if (typeof firstValue === 'number') {
        return firstValue.toFixed(2);
      }
      return String(firstValue);
    }
    // Default case: convert to string
    return String(value);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6" style={{ color: HARVARD_CRIMSON }}>
        <h1 className="text-3xl font-bold">Harvard Senior Class of 2025</h1>
        <h2 className="text-2xl font-bold">Budget & Ticket Allocation Planner</h2>
      </div>
      
      {/* Surplus explanation box */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4" style={{ borderColor: HARVARD_CRIMSON }}>
        <h3 className="text-lg font-medium mb-2" style={{ color: HARVARD_CRIMSON }}>Why We Need a $5,000 Surplus</h3>
        <p className="text-sm">
          This surplus is essential for sustaining our class committee operations over the next 5 years. 
          It will fund ongoing costs like website maintenance, MailChimp subscriptions, and miscellaneous expenses,
          as well as provide support for our class reunions. Planning ahead ensures we can stay connected as a class
          long after graduation.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Budget visualization */}
        <div className="bg-gray-50 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4" style={{ color: HARVARD_CRIMSON }}>Expense Allocation</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`${formatValue(value)}`, 'Amount']}
                  labelFormatter={(name) => name}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium">Total Expenses: ${TOTAL_EXPENSES.toFixed(2)}</p>
            <p className="text-sm font-medium">Current Income: ${TOTAL_INCOME.toFixed(2)}</p>
            <p className="text-sm font-medium">Net Expenditure: ${NET_EXPENDITURE.toFixed(2)}</p>
          </div>
          
          {/* Dropdown table for expense details */}
          <div className="mt-4">
            <details className="bg-white rounded-lg shadow p-2">
              <summary className="font-medium cursor-pointer p-2" style={{ color: HARVARD_CRIMSON }}>
                Show Expense Details
              </summary>
              <div className="overflow-x-auto">
                <table className="w-full mt-2 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-2">Description</th>
                      <th className="text-right p-2">Amount</th>
                      <th className="text-left p-2">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgetData.sort((a, b) => a.category.localeCompare(b.category)).map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="p-2">{item.description}</td>
                        <td className="text-right p-2">${item.amount.toFixed(2)}</td>
                        <td className="p-2">{item.category}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 font-medium">
                    <tr>
                      <td className="p-2">Total</td>
                      <td className="text-right p-2">${TOTAL_EXPENSES.toFixed(2)}</td>
                      <td className="p-2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </details>
          </div>
        </div>
        
        {/* Income visualization */}
        <div className="bg-gray-50 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4" style={{ color: HARVARD_CRIMSON }}>Income Sources</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {incomeChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={INCOME_COLORS[index % INCOME_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`${formatValue(value)}`, 'Amount']}
                  labelFormatter={(name) => name}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium">Game On Income: ${GAME_ON_INCOME.toFixed(2)}</p>
            <p className="text-sm font-medium">Altitude Income: ${altitudeIncome.toFixed(2)}</p>
            <p className="text-sm font-medium">Projected Ticket Income: ${(projectedRoyaleIncome + projectedSoireeIncome).toFixed(2)}</p>
            <p className="text-sm font-medium">Total Income: ${(TOTAL_INCOME + projectedRoyaleIncome + projectedSoireeIncome).toFixed(2)}</p>
          </div>
          
          {/* Dropdown table for income details */}
          <div className="mt-4">
            <details className="bg-white rounded-lg shadow p-2">
              <summary className="font-medium cursor-pointer p-2" style={{ color: HARVARD_CRIMSON }}>
                Show Income Details
              </summary>
              <div className="overflow-x-auto">
                <table className="w-full mt-2 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-2">Source</th>
                      <th className="text-right p-2">Amount</th>
                      <th className="text-left p-2">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Game On Income */}
                    {incomeData.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="p-2">{item.description}</td>
                        <td className="text-right p-2">${item.amount.toFixed(2)}</td>
                        <td className="p-2">Existing Income</td>
                      </tr>
                    ))}
                    {/* Altitude Income */}
                    <tr className={incomeData.length % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="p-2">Altitude Tickets</td>
                      <td className="text-right p-2">${altitudeIncome.toFixed(2)}</td>
                      <td className="p-2">Break-even Income</td>
                    </tr>
                    {/* Projected Income */}
                    <tr className="bg-gray-50">
                      <td className="p-2">Royale Tickets ({royaleAttendance} attendees)</td>
                      <td className="text-right p-2">${projectedRoyaleIncome.toFixed(2)}</td>
                      <td className="p-2">Projected Income</td>
                    </tr>
                    <tr>
                      <td className="p-2">Soiree Tickets ({soireeAttendance} attendees)</td>
                      <td className="text-right p-2">${projectedSoireeIncome.toFixed(2)}</td>
                      <td className="p-2">Projected Income</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-gray-100 font-medium">
                    <tr>
                      <td className="p-2">Total Income</td>
                      <td className="text-right p-2">${(TOTAL_INCOME + projectedRoyaleIncome + projectedSoireeIncome).toFixed(2)}</td>
                      <td className="p-2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </details>
          </div>
        </div>
      </div>
      
      {/* Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Event parameters */}
        <div className="bg-gray-50 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4" style={{ color: HARVARD_CRIMSON }}>Event Parameters</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Target Surplus: ${targetSurplus.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="15000"
              step="500"
              value={targetSurplus}
              onChange={(e) => setTargetSurplus(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: HARVARD_CRIMSON }}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Royale Attendance: {royaleAttendance} students ({(royaleAttendance/TOTAL_CLASS_SIZE*100).toFixed(1)}% of class)
            </label>
            <input
              type="range"
              min="500"
              max={TOTAL_CLASS_SIZE}
              step="50"
              value={royaleAttendance}
              onChange={(e) => setRoyaleAttendance(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: HARVARD_CRIMSON }}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Soiree Attendance: {soireeAttendance} students ({(soireeAttendance/TOTAL_CLASS_SIZE*100).toFixed(1)}% of class)
            </label>
            <input
              type="range"
              min="500"
              max={TOTAL_CLASS_SIZE}
              step="50"
              value={soireeAttendance}
              onChange={(e) => setSoireeAttendance(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: HARVARD_CRIMSON }}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Altitude Attendance: {altitudeAttendance} students ({(altitudeAttendance/TOTAL_CLASS_SIZE*100).toFixed(1)}% of class)
            </label>
            <input
              type="range"
              min="200"
              max={TOTAL_CLASS_SIZE}
              step="50"
              value={altitudeAttendance}
              onChange={(e) => setAltitudeAttendance(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: HARVARD_CRIMSON }}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Altitude Costs: ${altitudeCosts.toFixed(2)}
            </label>
            <input
              type="range"
              min="5000"
              max="20000"
              step="500"
              value={altitudeCosts}
              onChange={(e) => setAltitudeCosts(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: HARVARD_CRIMSON }}
            />
          </div>
          
          <div className="p-4 bg-gray-100 rounded-lg mt-4">
            <h3 className="text-md font-medium mb-2" style={{ color: HARVARD_CRIMSON }}>Altitude Ticket Information</h3>
            <p className="text-sm mb-1">Altitude Ticket Price: <strong>${Math.ceil(altitudePrice)}</strong> (${altitudePrice.toFixed(2)})</p>
            <p className="text-sm mb-1">Altitude Income: <strong>${(altitudeIncome).toFixed(2)}</strong></p>
            <p className="text-sm mb-1">Altitude Expenses: <strong>${(altitudeCosts).toFixed(2)}</strong></p>
            <p className="text-sm">Net Impact: <strong>${(altitudeIncome - altitudeCosts).toFixed(2)}</strong> (should be close to zero)</p>
          </div>
        </div>
        
        {/* Results preview */}
        <div className="bg-gray-50 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4" style={{ color: HARVARD_CRIMSON }}>Ticket Price Preview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <h3 className="text-lg font-medium mb-2" style={{ color: HARVARD_CRIMSON }}>Royale Ticket</h3>
              <p className="text-3xl font-bold" style={{ color: HARVARD_CRIMSON }}>${Math.ceil(royalePrice)}</p>
              <p className="text-sm text-gray-600 mt-1">Actual: ${royalePrice.toFixed(2)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <h3 className="text-lg font-medium mb-2" style={{ color: HARVARD_CRIMSON }}>Soiree Ticket</h3>
              <p className="text-3xl font-bold" style={{ color: HARVARD_CRIMSON }}>${Math.ceil(soireePrice)}</p>
              <p className="text-sm text-gray-600 mt-1">Actual: ${soireePrice.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 rounded-lg border-l-4" style={{ backgroundColor: '#f8f0f1', borderColor: HARVARD_CRIMSON }}>
            <p className="text-lg font-semibold" style={{ color: HARVARD_CRIMSON }}>Projected Surplus: ${projectedSurplus.toFixed(2)}</p>
            <p className="text-sm text-gray-600">Target: ${targetSurplus.toFixed(2)}</p>
            <p className="text-sm text-gray-600">Difference: ${(projectedSurplus - targetSurplus).toFixed(2)}</p>
          </div>
          
          <div className="mt-4 p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2" style={{ color: HARVARD_CRIMSON }}>Financial Summary</h3>
            <div className="space-y-1">
              <p className="text-sm">Total Expenses: <strong>${TOTAL_EXPENSES.toFixed(2)}</strong></p>
              <p className="text-sm">Game On Income: <strong>${GAME_ON_INCOME.toFixed(2)}</strong></p>
              <p className="text-sm">Altitude Income: <strong>${altitudeIncome.toFixed(2)}</strong></p>
              <p className="text-sm">Net Expenditure: <strong>${NET_EXPENDITURE.toFixed(2)}</strong></p>
              <p className="text-sm">Target Surplus: <strong>${targetSurplus.toFixed(2)}</strong></p>
              <p className="text-sm">Amount needed from Royale & Soiree: <strong>${(NET_EXPENDITURE + targetSurplus).toFixed(2)}</strong></p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Results display */}
      <div className="bg-gray-50 p-6 rounded-lg shadow mb-8" style={{ borderTop: `4px solid ${HARVARD_CRIMSON}` }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: HARVARD_CRIMSON }}>Ticket Price Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2" style={{ color: HARVARD_CRIMSON }}>Royale Ticket</h3>
            <p className="text-3xl font-bold" style={{ color: HARVARD_CRIMSON }}>${Math.ceil(royalePrice)}</p>
            <p className="text-sm text-gray-600 mt-1">Per student for {royaleAttendance} attendees</p>
            <p className="text-sm mt-2">Event Cost: ${ROYALE_COSTS.toFixed(2)}</p>
            <p className="text-sm">Revenue: ${(royalePrice * royaleAttendance).toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2" style={{ color: HARVARD_CRIMSON }}>Soiree Ticket</h3>
            <p className="text-3xl font-bold" style={{ color: HARVARD_CRIMSON }}>${Math.ceil(soireePrice)}</p>
            <p className="text-sm text-gray-600 mt-1">Per student for {soireeAttendance} attendees</p>
            <p className="text-sm mt-2">Event Cost: ${SOIREE_COSTS.toFixed(2)}</p>
            <p className="text-sm">Revenue: ${(soireePrice * soireeAttendance).toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2" style={{ color: HARVARD_CRIMSON }}>Altitude Ticket</h3>
            <p className="text-3xl font-bold" style={{ color: HARVARD_CRIMSON }}>${Math.ceil(altitudePrice)}</p>
            <p className="text-sm text-gray-600 mt-1">Per student for {altitudeAttendance} attendees</p>
            <p className="text-sm mt-2">Event Cost: ${altitudeCosts.toFixed(2)}</p>
            <p className="text-sm">Revenue: ${(altitudePrice * altitudeAttendance).toFixed(2)}</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-100 rounded-lg" style={{ borderLeft: `4px solid ${HARVARD_CRIMSON}` }}>
          <h3 className="text-lg font-medium mb-2" style={{ color: HARVARD_CRIMSON }}>Projected Financial Outcome</h3>
          <p className="text-2xl font-bold" style={{ color: HARVARD_CRIMSON }}>
            ${projectedSurplus.toFixed(2)} Surplus
          </p>
          <p className="text-sm text-gray-700 mt-2">
            Target Surplus: ${targetSurplus.toFixed(2)} | 
            Difference: ${(projectedSurplus - targetSurplus).toFixed(2)}
          </p>
          <p className="text-sm font-medium mt-2">
            Altitude is handled as a break-even event, with expenses matched by ticket income.
          </p>
          <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Total Expenses: ${TOTAL_EXPENSES.toFixed(2)}</p>
              <p className="text-sm font-medium">Game On Income: ${GAME_ON_INCOME.toFixed(2)}</p>
              <p className="text-sm font-medium">Altitude Income: ${altitudeIncome.toFixed(2)}</p>
              <p className="text-sm font-medium">Net Expenditure: ${NET_EXPENDITURE.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Royale & Soiree Revenue: ${((royalePrice * royaleAttendance) + (soireePrice * soireeAttendance)).toFixed(2)}</p>
              <p className="text-sm font-medium">Final Net Position: ${(GAME_ON_INCOME + altitudeIncome + (royalePrice * royaleAttendance) + (soireePrice * soireeAttendance) - TOTAL_EXPENSES).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg shadow" style={{ borderTop: `4px solid ${HARVARD_CRIMSON}` }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: HARVARD_CRIMSON }}>Pricing Strategy</h2>
        <div className="space-y-4">
          <ul className="list-disc pl-5 space-y-2">
            <li>Set Royale tickets at <strong style={{ color: HARVARD_CRIMSON }}>${Math.ceil(royalePrice)}</strong> and Soiree tickets at <strong style={{ color: HARVARD_CRIMSON }}>${Math.ceil(soireePrice)}</strong> for simplicity.</li>
            <li>Set Altitude tickets at <strong style={{ color: HARVARD_CRIMSON }}>${Math.ceil(altitudePrice)}</strong> to cover the costs of ${altitudeCosts.toFixed(2)}.</li>
            <li>Altitude is handled as a break-even event, with ticket price determined by dividing costs by attendance.</li>
            <li>Increasing Royale/Soiree attendance by 10% would allow you to decrease their ticket prices by approximately ${((royalePrice * 0.1)).toFixed(2)} per student.</li>
            <li>Our current pricing strategy is projected to generate a <strong style={{ color: HARVARD_CRIMSON }}>${projectedSurplus.toFixed(2)}</strong> surplus, which will help fund future class committee activities and reunions.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SeniorWeekBudgetPlanner;