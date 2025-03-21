import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { supabase } from "../lib/supabaseClient";
import Swal from "sweetalert2";
import { FaArrowLeft } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface Food {
  food_id: string;
  food_name: string;
  food_description: string;
}

interface NutritionalValues {
  calories: number | null;
  fat: number | null;
  carbs: number | null;
  protein: number | null;
  perg: number | null;
  peroz: number | null;
  percup: number | null;
  peru: number | null;
}

const FoodQuantityAdjust: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { food, type } = location.state || {};
  const [userEmail, setUserEmail] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<string>("100"); // Usar string para manejar fracciones
  const [displayQuantity, setDisplayQuantity] = useState<string>("100"); // Cantidad mostrada en el input
  const [fixedUnit, setFixedUnit] = useState<string>("g");
  const [unitLabel, setUnitLabel] = useState<string>("g");
  const [nutritionalValues, setNutritionalValues] = useState<NutritionalValues>({
    calories: null,
    fat: null,
    carbs: null,
    protein: null,
    perg: null,
    peroz: null,
    percup: null,
    peru: null,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setError("Debes iniciar sesión para ajustar alimentos.");
        navigate("/login");
      } else {
        setUserEmail(user.email || "");
      }
    };
    checkAuth();

    if (food) {
      const parsedValues = parseFoodDescription(food.food_description);
      setNutritionalValues(parsedValues);

      // Determinar la unidad fija y la cantidad inicial
      if (parsedValues.perg) {
        setFixedUnit("g");
        setUnitLabel("g");
        setQuantity(parsedValues.perg.toString());
        setDisplayQuantity(parsedValues.perg.toString());
      } else if (parsedValues.peroz) {
        setFixedUnit("oz");
        setUnitLabel("fl oz");
        setQuantity(parsedValues.peroz.toString());
        setDisplayQuantity(evaluateFraction(parsedValues.peroz.toString()).toString());
      } else if (parsedValues.percup) {
        setFixedUnit("cup");
        setUnitLabel("cup");
        setQuantity(parsedValues.percup.toString());
        setDisplayQuantity(evaluateFraction(parsedValues.percup.toString()).toString());
      } else if (parsedValues.peru) {
        setFixedUnit("unit");
        const perMatchUnit = food.food_description.match(/Per\s+\d+\s*(\w+)/i);
        setUnitLabel(perMatchUnit ? perMatchUnit[1] : "unit");
        setQuantity(parsedValues.peru.toString());
        setDisplayQuantity(parsedValues.peru.toString());
      }
    }
  }, [food, navigate]);

  const parseFoodDescription = (description: string): NutritionalValues => {
    const result: NutritionalValues = {
      calories: null,
      fat: null,
      carbs: null,
      protein: null,
      perg: null,
      peroz: null,
      percup: null,
      peru: null,
    };

    if (!description) return result;

    const parts = description.split(" - ");
    if (parts.length < 2) return result;

    const perPart = parts[0].trim();
    const perMatchG = perPart.match(/Per\s+(\d+(?:\.\d+)?)\s*g/i);
    const perMatchOz = perPart.match(/Per\s+([\d\/]+)\s*(fl\s*)?oz/i);
    const perMatchCup = perPart.match(/Per\s+([\d\/]+)\s*(cup|cups)/i);
    const perMatchUnit = perPart.match(/Per\s+(\d+)\s*(\w+)/i);

    if (perMatchG) {
      result.perg = parseInt(perMatchG[1], 10);
    } else if (perMatchOz) {
      result.peroz = parseFraction(perMatchOz[1]);
    } else if (perMatchCup) {
      result.percup = parseFraction(perMatchCup[1]);
    } else if (perMatchUnit) {
      result.peru = parseInt(perMatchUnit[1], 10);
    }

    const nutritionPart = parts[1].split(" | ");
    nutritionPart.forEach((item) => {
      if (item.includes("Calories")) {
        const match = item.match(/Calories:\s*(\d+)\s*kcal/i);
        if (match) result.calories = parseInt(match[1], 10);
      } else if (item.includes("Fat")) {
        const match = item.match(/Fat:\s*([\d.]+)\s*g/i);
        if (match) result.fat = parseFloat(match[1]);
      } else if (item.includes("Carbs")) {
        const match = item.match(/Carbs:\s*([\d.]+)\s*g/i);
        if (match) result.carbs = parseFloat(match[1]);
      } else if (item.includes("Protein")) {
        const match = item.match(/Protein:\s*([\d.]+)\s*g/i);
        if (match) result.protein = parseFloat(match[1]);
      }
    });

    return result;
  };

  const parseFraction = (value: string): string => {
    const fractionMatch = value.match(/^(\d+)(?:\/(\d+))?$/);
    if (fractionMatch) {
      const whole = fractionMatch[1];
      const numerator = fractionMatch[2] ? fractionMatch[2] : null;
      if (numerator) {
        return `${whole}/${numerator}`; // Mantener la fracción como string, e.g., "1/2"
      }
      return whole; // Retornar como string para mantener consistencia
    }
    return value; // Retornar como string
  };

  const evaluateFraction = (value: string): number => {
    const fractionMatch = value.match(/^(\d+)(?:\/(\d+))?$/);
    if (fractionMatch) {
      const whole = parseInt(fractionMatch[1], 10);
      const numerator = fractionMatch[2] ? parseInt(fractionMatch[2], 10) : null;
      if (numerator) {
        return whole / numerator; // Convertir a decimal para cálculos
      }
      return whole;
    }
    return parseFloat(value) || 0;
  };

  const convertToFraction = (value: number, forceFractions: boolean = false): string => {
    // Convertir decimales a fracciones comunes
    const fractions: { [key: number]: string } = {
      0.25: "1/4",
      0.5: "1/2",
      0.75: "3/4",
      1: "1",
      1.25: "5/4",
      1.5: "3/2",
      1.75: "7/4",
      2: "2",
      2.25: "9/4",
      2.5: "5/2",
      2.75: "11/4",
      3: "3",
      3.25: "13/4",
      3.5: "7/2",
      3.75: "15/4",
      4: "4",
    };

    // Redondear a la fracción más cercana (en pasos de 0.25)
    const roundedValue = Math.round(value * 4) / 4;
    if (fractions[roundedValue]) {
      return fractions[roundedValue];
    }

    // Si no es una fracción común y no se fuerza el uso de fracciones, retornar como decimal
    if (!forceFractions) {
      return value.toString();
    }

    // Si se fuerza el uso de fracciones (para tazas), buscar la fracción más cercana
    const closestFraction = Object.keys(fractions)
      .map(Number)
      .reduce((prev, curr) =>
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
      );
    return fractions[closestFraction] || value.toString();
  };

  const recalculateNutritionalValues = (newQuantity: string) => {
    const originalValues = parseFoodDescription(food.food_description);
    let baseQuantity = 0;

    // Determinar la cantidad base según la unidad fija
    if (fixedUnit === "g") {
      baseQuantity = originalValues.perg || 100;
    } else if (fixedUnit === "oz") {
      baseQuantity = evaluateFraction(originalValues.peroz.toString()) || 1;
    } else if (fixedUnit === "cup") {
      baseQuantity = evaluateFraction(originalValues.percup.toString()) || 1;
    } else if (fixedUnit === "unit") {
      baseQuantity = originalValues.peru || 1;
    }

    const newQuantityValue = evaluateFraction(newQuantity);
    const factor = newQuantityValue / baseQuantity;

    // Ajustar los valores nutricionales
    setNutritionalValues({
      ...originalValues,
      calories: originalValues.calories ? Math.round(originalValues.calories * factor) : null,
      fat: originalValues.fat ? Number((originalValues.fat * factor).toFixed(2)) : null,
      carbs: originalValues.carbs ? Number((originalValues.carbs * factor).toFixed(2)) : null,
      protein: originalValues.protein ? Number((originalValues.protein * factor).toFixed(2)) : null,
      perg: fixedUnit === "g" ? parseInt(newQuantity, 10) : originalValues.perg,
      peroz: fixedUnit === "oz" ? newQuantity : originalValues.peroz,
      percup: fixedUnit === "cup" ? newQuantity : originalValues.percup,
      peru: fixedUnit === "unit" ? parseInt(newQuantity, 10) : originalValues.peru,
    });
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDisplayQuantity = e.target.value;
    if (newDisplayQuantity === "" || parseFloat(newDisplayQuantity) < 0) return;

    let newQuantity: string;

    if (fixedUnit === "g" || fixedUnit === "unit") {
      // Solo permitir números enteros para gramos y unidades
      if (!/^\d+$/.test(newDisplayQuantity)) return;
      newQuantity = newDisplayQuantity;
    } else if (fixedUnit === "oz" || fixedUnit === "cup") {
      // Para onzas y tazas, permitir decimales y convertir a fracciones
      const numericValue = parseFloat(newDisplayQuantity);
      if (isNaN(numericValue)) return;
      newQuantity = convertToFraction(numericValue, fixedUnit === "cup");
    } else {
      return;
    }

    setQuantity(newQuantity);
    setDisplayQuantity(newDisplayQuantity);
    recalculateNutritionalValues(newQuantity);
  };

  const handleSaveFood = async () => {
    if (!food || !type || !userEmail) {
      setError("Faltan datos necesarios para guardar el alimento.");
      return;
    }

    const normalizedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

    // Formatear los valores nutricionales con dos decimales
    const formattedCalories = nutritionalValues.calories || 0;
    const formattedFat = (nutritionalValues.fat || 0).toFixed(2);
    const formattedCarbs = (nutritionalValues.carbs || 0).toFixed(2);
    const formattedProtein = (nutritionalValues.protein || 0).toFixed(2);

    // Usar la cantidad en formato de fracción para la descripción
    const displayQuantityForDescription =
      fixedUnit === "oz" || fixedUnit === "cup"
        ? convertToFraction(evaluateFraction(quantity), fixedUnit === "cup")
        : quantity;

    // Generar la descripción ajustada según la unidad fija
    let adjustedDescription = "";
    if (fixedUnit === "g") {
      adjustedDescription = `Per ${displayQuantityForDescription}g - Calories: ${formattedCalories}kcal | Fat: ${formattedFat}g | Carbs: ${formattedCarbs}g | Protein: ${formattedProtein}g`;
    } else if (fixedUnit === "oz") {
      adjustedDescription = `Per ${displayQuantityForDescription} fl oz - Calories: ${formattedCalories}kcal | Fat: ${formattedFat}g | Carbs: ${formattedCarbs}g | Protein: ${formattedProtein}g`;
    } else if (fixedUnit === "cup") {
      adjustedDescription = `Per ${displayQuantityForDescription} cup - Calories: ${formattedCalories}kcal | Fat: ${formattedFat}g | Carbs: ${formattedCarbs}g | Protein: ${formattedProtein}g`;
    } else if (fixedUnit === "unit") {
      adjustedDescription = `Per ${displayQuantityForDescription} ${unitLabel} - Calories: ${formattedCalories}kcal | Fat: ${formattedFat}g | Carbs: ${formattedCarbs}g | Protein: ${formattedProtein}g`;
    }

    const requestBody = {
      email: userEmail,
      food_id: food.food_id,
      food_name: food.food_name,
      food_description: adjustedDescription,
      type: normalizedType,
    };

    try {
      const response = await axios.post("http://localhost:5000/api/foods/add", requestBody);

      await Swal.fire({
        title: "¡Éxito!",
        text: response.data.message,
        icon: "success",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#ff9404",
        customClass: {
          popup: "custom-swal-background",
          icon: "custom-swal-icon",
          title: "custom-swal-title",
          htmlContainer: "custom-swal-text",
        },
      });

      navigate(`/dashboard?type=${normalizedType}`, { state: { fromAddButton: true } });
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      const errorMessage = axiosError.response?.data?.error || "Error al agregar el alimento";
      setError(errorMessage);
      await Swal.fire({
        title: "¡Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#ff9400",
        customClass: {
          popup: "custom-swal-background",
          title: "custom-swal-title",
          htmlContainer: "custom-swal-text",
        },
      });
    }
  };

  if (!food || !type) {
    navigate("/foodsearch", { state: { fromAddButton: true } });
    return null;
  }

  return (
    <div className="mt-0">
      <div className="ml-0 mr-2 mt-0">
        <Link to={`/foodsearch?type=${type}`} state={{ fromAddButton: true }} className="inline-block">
          <button className="flex items-center py-2 px-4 bg-gradient-to-r from-[#ff9404] to-[#FF6B35] text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:from-[#FF6B35] hover:to-[#ff9404] transition-all duration-300 transform hover:-translate-y-1 z-10">
            <FaArrowLeft className="mr-1 text-base" />
            Volver
          </button>
        </Link>
      </div>

      <div className="bg-[#3B4252] rounded-lg p-4 shadow-md flex-1 mt-9">
        <h2 className="text-sm font-semibold mb-2">Ajustar Cantidad - {food.food_name}</h2>
        {error && <p className="text-red-400 mt-2 text-xs">{error}</p>}

        <div className="mt-4">
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-300">
              Cantidad (en {unitLabel}):
            </label>
            <input
              type="number"
              value={displayQuantity}
              onChange={handleQuantityChange}
              className="w-full mt-2 px-4 py-2 border border-gray-500 rounded-lg bg-[#1C2526] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
              min={fixedUnit === "g" || fixedUnit === "unit" ? "1" : "0.25"}
              step={fixedUnit === "g" || fixedUnit === "unit" ? "1" : "0.25"}
            />
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-semibold mb-2">Valores Nutricionales Ajustados</h3>
            <p className="text-xs text-gray-300">
              Per{" "}
              {(fixedUnit === "oz" || fixedUnit === "cup")
                ? convertToFraction(evaluateFraction(quantity), fixedUnit === "cup")
                : quantity}{" "}
              {unitLabel} - Calories: {nutritionalValues.calories || 0}kcal | Fat: {(nutritionalValues.fat || 0).toFixed(2)}g | Carbs: {(nutritionalValues.carbs || 0).toFixed(2)}g | Protein: {(nutritionalValues.protein || 0).toFixed(2)}g
            </p>
          </div>

          <div className="mt-4 text-right">
            <button
              onClick={handleSaveFood}
              className="py-2 px-4 bg-gradient-to-r from-[#ff9404] to-[#FF6B35] text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:from-[#FF6B35] hover:to-[#ff9404] transition-all duration-300 transform hover:-translate-y-1 z-10"
            >
              Agregar Alimento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodQuantityAdjust;