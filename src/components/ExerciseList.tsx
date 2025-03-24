import React, { useCallback, useEffect, useState } from 'react';
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

  const fetchExercises = useCallback(async () => {
    if (!selectedBodyPart) {
      setExercises([]);
      setSelectedExercise(null);
      return;
    }

    setLoading(true);
    setError(null);
    setExercises([]);
    setSelectedExercise(null);

    try {
      const response = await axios.get<Exercise[]>(`${backendUrl}/api/exercises`, {
        params: { bodyPart: selectedBodyPart, t: Date.now() },
        headers: { 'Content-Type': 'application/json' },
      });
      setExercises(response.data);
      if (response.data.length > 0) {
        setSelectedExercise(response.data[0]);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error('Error en fetchExercises:', err.response?.data || err.message);
      } else {
        console.error('Error en fetchExercises:', err);
      }
      setError('Error al consultar los ejercicios');
    } finally {
      setLoading(false);
    }
  }, [backendUrl, selectedBodyPart]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const handleBodyPartChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBodyPart(e.target.value);
  };

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };

  return (
    <div className="mt-5 ml-10">
      <div className="ml-10 mr-2 mt-0">
        <Link to="/routines" className="inline-block">
          <button className="bg-[#FF9500] font-medium w-30 text-white py-2 px-4 rounded-lg hover:bg-[#FF9500] hover:text-[#1C1C1E] transition flex items-center justify-center"> 
            <FaArrowLeft className="mr-1 text-base" />
            Volver
          </button>
        </Link>
      </div>

      <div className="ml-10 bg-[#3B4252] rounded-lg p-4 shadow-md flex-1 mt-9">
        <h2 className="text-base font-medium mb-2 text-[#ff9404]">Lista de Ejercicios</h2>

        {/* Selector de parte del cuerpo */}
        <div className="mb-6">
          <label htmlFor="bodyPart" className="block text-white font-semibold mb-2 text-sm">
            Selecciona una parte del cuerpo:
          </label>
          <select
            id="bodyPart"
            value={selectedBodyPart}
            onChange={handleBodyPartChange}
            className="calorie-goal-input max-w-xs text-black w-40 p-2 rounded-lg bg-white text-sm"
            disabled={loading}
          >
            <option value=""> Selecciona </option>
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