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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Previene comportamiento por defecto si está en un formulario
    if (!query.trim()) {
      setError('Por favor, ingresa un término de búsqueda');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:5000/api/foods/search', {
        params: { query, max_results: 50 },
      });
      // Verifica si la respuesta tiene datos válidos
      const foodResults = response.data.foods?.food || [];
      setFoods(Array.isArray(foodResults) ? foodResults : []);
    } catch (err) {
      setError('Error al buscar alimentos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Buscador de Alimentos (FatSecret)</h1>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Escribe un alimento (ej: apple)"
        disabled={loading} // Deshabilita el input mientras carga
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Buscando...' : 'Buscar'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {foods.length > 0 ? (
        <ul>
          {foods.map((food) => (
            <li key={food.food_id}>
              <strong>{food.food_name}</strong> - {food.food_description}
            </li>
          ))}
        </ul>
      ) : (
        !loading && <p>No se encontraron resultados</p>
      )}
    </div>
  );
};

export default FoodSearch;