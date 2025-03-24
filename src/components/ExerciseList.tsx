import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  gifUrl: string;
  target: string;
  secondaryMuscles: string[];
  instructions: string[];
}

const customStyles = `
  /* Estilo para Inputs y Selects */
  .calorie-goal-input {
    width: 100%;
    padding: 6px 10px;
    font-size: 0.875rem;
    border: 1px solid #6B7280;
    border-radius: 6px;
    background: #2D3242;
    color: #E5E7EB;
    transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;
  }
  .calorie-goal-input:focus {
    outline: none;
    border-color: #ff9404;
    box-shadow: 0 0 0 3px rgba(255, 148, 4, 0.2);
    background: #2D3242;
    transform: scale(1.02);
  }
  .calorie-goal-input::placeholder {
    color: #6B7280;
    opacity: 1;
  }
  .calorie-goal-input.error {
    border-color: #ff4444;
  }
  .calorie-goal-input:disabled {
    background: #3B4252;
    cursor: not-allowed;
    opacity: 0.7;
  }

  /* Estilo para el Scrollbar */
  .scrollbar-hide::-webkit-scrollbar {
    width: 8px;
  }
  .scrollbar-hide::-webkit-scrollbar-track {
    background: #3B4252;
  }
  .scrollbar-hide::-webkit-scrollbar-thumb {
    background: #6B7280;
    border-radius: 4px;
  }
  .scrollbar-hide::-webkit-scrollbar-thumb:hover {
    background: #9CA3AF;
  }

  /* Responsive Adjustments */
  @media (max-width: 640px) {
    .calorie-goal-input {
      font-size: 0.75rem;
      padding: 4px 8px;
    }
  }
`;

const ExerciseList: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  const bodyParts = [
    { value: 'back', label: 'Espalda' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'chest', label: 'Pecho' },
    { value: 'lower arms', label: 'Brazos inferiores' },
    { value: 'lower legs', label: 'Piernas inferiores' },
    { value: 'neck', label: 'Cuello' },
    { value: 'shoulders', label: 'Hombros' },
    { value: 'upper arms', label: 'Brazos superiores' },
    { value: 'upper legs', label: 'Piernas superiores' },
    { value: 'waist', label: 'Cintura' },
  ];

  useEffect(() => {
    if (!selectedBodyPart) {
      setExercises([]);
      setSelectedExercise(null);
      return;
    }

    const fetchExercises = async () => {
      setLoading(true);
      setError(null);
      setExercises([]);
      setSelectedExercise(null);
      try {
        const response = await axios.get<Exercise[]>(`${backendUrl}/api/exercises`, {
          params: { 
            bodyPart: selectedBodyPart,
            t: Date.now(),
          },
          headers: {
            'Content-Type': 'application/json',
          },
        });
        setExercises(response.data);
        if (response.data.length > 0) {
            setSelectedExercise(response.data[0]);
          }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error('Error en fetchExercises:', err.response?.data || err.message);
        setError('Error al consultar los ejercicios');
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [backendUrl, selectedBodyPart]);

  const handleBodyPartChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBodyPart(e.target.value);
  };

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };

  return (
    <div className="mt-0">
      <style>{customStyles}</style>
      <div className="ml-0 mr-2 mt-0">
        <Link to="/dashboard" className="inline-block">
          <button className="bg-[#FF9500] font-semibold text-white py-2 px-4 rounded-lg hover:bg-[#FF9500] hover:text-[#1C1C1E] transition">
            <FaArrowLeft className="mr-1 text-base" />
            Volver
          </button>
        </Link>
      </div>

      <div className="bg-[#3B4252] rounded-lg p-4 shadow-md flex-1 mt-9">
        <h2 className="text-sm font-semibold mb-2 text-white">Lista de Ejercicios</h2>

        {/* Selector de parte del cuerpo */}
        <div className="mb-6">
          <label htmlFor="bodyPart" className="block text-gray-300 font-semibold mb-2 text-sm">
            Selecciona una parte del cuerpo:
          </label>
          <select
            id="bodyPart"
            value={selectedBodyPart}
            onChange={handleBodyPartChange}
            className="calorie-goal-input max-w-xs"
            disabled={loading}
          >
            <option value="">-- Selecciona --</option>
            {bodyParts.map((part) => (
              <option key={part.value} value={part.value}>
                {part.label}
              </option>
            ))}
          </select>
        </div>

        {/* Mensaje si no hay selección */}
        {!selectedBodyPart && (
          <p className="text-gray-300 text-center text-xs">
            Por favor, selecciona una parte del cuerpo para ver los ejercicios.
          </p>
        )}

        {/* Estado de carga */}
        {loading && (
          <p className="text-gray-300 text-center text-xs mt-2">Cargando...</p>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-400 text-center text-xs mt-2">{error}</p>
        )}

        {/* Lista de ejercicios y vista detallada */}
        {!loading && !error && selectedBodyPart && exercises.length > 0 && (
          <div className="mt-4 flex flex-col md:flex-row gap-4">
            {/* Lista de ejercicios (izquierda o arriba en móvil) */}
            <div className="md:w-1/3">
              <h3 className="text-sm font-semibold mb-2 text-white">Resultados</h3>
              <div className="space-y-3 max-h-[calc(8*4.5rem)] overflow-y-auto scrollbar-hide">
                {exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    onClick={() => handleExerciseClick(exercise)}
                    className={`p-3 rounded-lg border border-gray-600 hover:bg-[#4B5563] transition duration-200 cursor-pointer ${
                      selectedExercise?.id === exercise.id ? 'bg-[#4B5563]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={exercise.gifUrl}
                        alt={exercise.name}
                        className="w-12 h-12 object-contain rounded-md"
                      />
                      <p className="text-sm font-medium text-white">{exercise.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vista detallada del ejercicio seleccionado (derecha o abajo en móvil) */}
            {selectedExercise && (
              <div className="md:w-2/3 bg-[#2D3242] rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-2 text-white">
                  {selectedExercise.name}
                </h3>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="md:w-1/2">
                    <img
                      src={selectedExercise.gifUrl}
                      alt={selectedExercise.name}
                      className="w-full h-64 object-contain rounded-md"
                    />
                  </div>
                  <div className="md:w-1/2">
                    <p className="text-xs text-gray-300">
                      Parte del cuerpo: {selectedExercise.bodyPart}
                    </p>
                    <p className="text-xs text-gray-300">
                      Equipo: {selectedExercise.equipment}
                    </p>
                    <p className="text-xs text-gray-300">
                      Objetivo: {selectedExercise.target}
                    </p>
                    <p className="text-xs text-gray-300">
                      Músculos secundarios: {selectedExercise.secondaryMuscles.join(', ')}
                    </p>
                    <h4 className="text-xs font-semibold mt-2 text-gray-300">Instrucciones:</h4>
                    <ul className="list-disc list-inside text-gray-300 text-xs">
                      {selectedExercise.instructions.map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mensaje si no hay resultados */}
        {!loading && !error && selectedBodyPart && exercises.length === 0 && (
          <p className="text-gray-300 text-center text-xs mt-2">
            No se encontraron ejercicios para esta parte del cuerpo.
          </p>
        )}
      </div>
    </div>
  );
};

export default ExerciseList;