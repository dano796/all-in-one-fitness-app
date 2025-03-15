import React, { useState } from 'react';
import axios from 'axios';

const FoodSearch: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  interface Food {
    food_id: string;
    food_name: string;
    food_description: string;
  }

  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('Query:', query); // Depuración para verificar el valor ingresado
    if (!query.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:5000/api/foods/search', {
        params: { query, max_results: 10 },
      });
      const foodResults = response.data.foods?.food || [];
      setFoods(Array.isArray(foodResults) ? foodResults : []);
      setSelectedFood(null);
    } catch (err) {
      setError('Error searching for foods');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFood = (food: Food) => {
    setSelectedFood(food);
  };

  const handleAddFood = () => {
    if (selectedFood) {
      console.log('Food to add:', selectedFood);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 bg-[#282c3c] text-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold mb-8 pb-5 text-center text-white">Food Search</h1>

        <div className="bg-[#3B4252] rounded-xl p-8 shadow-md mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-white">Search for Foods</h2>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a food (e.g., apple)"
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-500 rounded-lg bg-[#1C2526] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className={`py-2 px-4 bg-[#ff9404] text-white font-semibold rounded-lg ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:text-[#1C1C1E]'
              } transition duration-300`}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && <p className="text-red-400 mt-4">{error}</p>}
        </div>

        {/* Results Table */}
        {foods.length > 0 && (
          <div className="bg-[#3B4252] rounded-xl p-8 shadow-md">
            <h2 className="text-2xl font-semibold mb-6 text-white">Results</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#4B5563]">
                    <th className="p-3 font-semibold">Select</th>
                    <th className="p-3 font-semibold">Food Name</th>
                    <th className="p-3 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {foods.map((food) => (
                    <tr
                      key={food.food_id}
                      className={`border-b border-gray-600 ${
                        selectedFood?.food_id === food.food_id ? 'bg-[#4B5563]' : 'hover:bg-[#4B5563]'
                      }`}
                    >
                      <td className="p-3">
                        <input
                          type="radio"
                          name="foodSelection"
                          checked={selectedFood?.food_id === food.food_id}
                          onChange={() => handleSelectFood(food)}
                          className="w-4 h-4 text-[#FF6B35]"
                        />
                      </td>
                      <td className="p-3 font-medium">{food.food_name}</td>
                      <td className="p-3 text-gray-300">{food.food_description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={handleAddFood}
                disabled={!selectedFood}
                className={`py-2 px-4 bg-[#ff9404] text-white font-semibold rounded-lg ${
                  selectedFood ? 'hover:text-[#1C1C1E]' : 'opacity-50 cursor-not-allowed'
                } transition duration-300`}
              >
                Add Food
              </button>
            </div>
          </div>
        )}
        {!loading && foods.length === 0 && !error && (
          <p className="text-gray-300 text-center">No results found</p>
        )}
      </div>
    </div>
  );
};

export default FoodSearch;