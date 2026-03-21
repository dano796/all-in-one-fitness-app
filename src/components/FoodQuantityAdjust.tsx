import React, { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { supabase } from "../lib/supabaseClient";
import Swal from "sweetalert2";
import { FaArrowLeft } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../pages/ThemeContext";
import { useNotificationStore } from "../store/notificationStore";

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

const NutritionalDisplay: React.FC<{
  quantity: string;
  fixedUnit: string;
  unitLabel: string;
  nutritionalValues: NutritionalValues;
  convertToFraction: (value: number, forceFractions?: boolean) => string;
  evaluateFraction: (value: string) => number;
}> = ({
  quantity,
  fixedUnit,
  unitLabel,
  nutritionalValues,
  convertToFraction,
  evaluateFraction,
}) => {
  const { isDarkMode } = useTheme();
  return (
    <div className="mt-4">
      <h3
        className={`text-sm font-semibold mb-2 ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        Valores Nutricionales Ajustados
      </h3>
      <p
        className={`text-xs ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
      >
        Per{" "}
        {quantity === ""
          ? "0"
          : fixedUnit === "oz" || fixedUnit === "cup"
          ? convertToFraction(evaluateFraction(quantity), fixedUnit === "cup")
          : quantity}{" "}
        {unitLabel} - Calories: {nutritionalValues.calories || 0}kcal | Fat:{" "}
        {(nutritionalValues.fat || 0).toFixed(2)}g | Carbs:{" "}
        {(nutritionalValues.carbs || 0).toFixed(2)}g | Protein:{" "}
        {(nutritionalValues.protein || 0).toFixed(2)}g
      </p>
    </div>
  );
};

const FoodQuantityAdjust: React.FC = () => {
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  
  //console.log("FoodQuantityAdjust - Estado recibido:", location.state);
  
  // Extraer datos del estado con mejor manejo de tipos
  const locationState = location.state || {};
  const { 
    food, 
    type, 
    isEdit, 
    registryId, 
    date 
  } = locationState as { 
    food?: Food;
    type?: string;
    isEdit?: boolean;
    registryId?: string;
    date?: string;
  };

  // Early validation
  useEffect(() => {
    if (!food || !type) {
      console.error("Datos incompletos:", { food, type, location });
      addNotification(
        "Error de navegación",
        "No se recibieron los datos necesarios para ajustar la cantidad.",
        "error",
        false,
        "comida"
      );
      navigate("/foodDashboard");
    }
  }, [food, type, location, addNotification, navigate]);

  const [userEmail, setUserEmail] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<string>("100");
  const [displayQuantity, setDisplayQuantity] = useState<string>("100");
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

  const evaluateFraction = useCallback((value: string): number => {
    const fractionMatch = value.match(/^(\d+)(?:\/(\d+))?$/);
    if (fractionMatch) {
      const whole = parseInt(fractionMatch[1], 10);
      const numerator = fractionMatch[2]
        ? parseInt(fractionMatch[2], 10)
        : null;
      if (numerator) {
        return whole / numerator;
      }
      return whole;
    }
    return parseFloat(value) || 0;
  }, []);

  const parseFoodDescription = useCallback((description: string): NutritionalValues => {
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
    const perMatchOz = perPart.match(/Per\s+([\d/]+)\s*(fl\s*)?oz/i);
    const perMatchCup = perPart.match(/Per\s+([\d/]+)\s*(cup|cups)/i);
    const perMatchUnit = perPart.match(/Per\s+(\d+)\s*(\w+)/i);

    if (perMatchG) {
      result.perg = parseInt(perMatchG[1], 10);
    } else if (perMatchOz) {
      result.peroz = evaluateFraction(perMatchOz[1]);
    } else if (perMatchCup) {
      result.percup = evaluateFraction(perMatchCup[1]);
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
  }, [evaluateFraction]);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
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

      if (parsedValues.perg) {
        setFixedUnit("g");
        setUnitLabel("g");
        setQuantity(parsedValues.perg.toString());
        setDisplayQuantity(parsedValues.perg.toString());
      } else if (parsedValues.peroz) {
        setFixedUnit("oz");
        setUnitLabel("fl oz");
        setQuantity(parsedValues.peroz.toString());
        setDisplayQuantity(
          evaluateFraction(parsedValues.peroz.toString()).toString()
        );
      } else if (parsedValues.percup) {
        setFixedUnit("cup");
        setUnitLabel("cup");
        setQuantity(parsedValues.percup.toString());
        setDisplayQuantity(
          evaluateFraction(parsedValues.percup.toString()).toString()
        );
      } else if (parsedValues.peru) {
        setFixedUnit("unit");
        const perMatchUnit = food.food_description.match(/Per\s+\d+\s*(\w+)/i);
        setUnitLabel(perMatchUnit ? perMatchUnit[1] : "unit");
        setQuantity(parsedValues.peru.toString());
        setDisplayQuantity(parsedValues.peru.toString());
      }
    } else {
      console.error("No se recibió información del alimento");
    }
  }, [food, navigate, evaluateFraction, parseFoodDescription]);

  const convertToFraction = useCallback(
    (value: number, forceFractions: boolean = false): string => {
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

      const roundedValue = Math.round(value * 4) / 4;
      if (fractions[roundedValue]) {
        return fractions[roundedValue];
      }

      if (!forceFractions) {
        return value.toString();
      }

      const closestFraction = Object.keys(fractions)
        .map(Number)
        .reduce((prev, curr) =>
          Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
        );
      return fractions[closestFraction] || value.toString();
    },
    []
  );

  const recalculateNutritionalValues = useCallback(
    (newQuantity: string) => {
      // Validación de seguridad para food
      if (!food) return;
      
      const originalValues = parseFoodDescription(food.food_description);
      let baseQuantity = 0;

      if (fixedUnit === "g") {
        baseQuantity = originalValues.perg || 100;
      } else if (fixedUnit === "oz") {
        baseQuantity = originalValues.peroz
          ? evaluateFraction(originalValues.peroz.toString())
          : 1;
      } else if (fixedUnit === "cup") {
        baseQuantity = originalValues.percup
          ? evaluateFraction(originalValues.percup.toString())
          : 1;
      } else if (fixedUnit === "unit") {
        baseQuantity = originalValues.peru || 1;
      }

      let factor: number;
      if (newQuantity === "") {
        factor = 0;
      } else {
        const newQuantityValue = evaluateFraction(newQuantity);
        factor = newQuantityValue / baseQuantity;
      }

      setNutritionalValues({
        ...originalValues,
        calories:
          factor === 0
            ? 0
            : originalValues.calories
            ? Math.round(originalValues.calories * factor)
            : null,
        fat:
          factor === 0
            ? 0
            : originalValues.fat
            ? Number((originalValues.fat * factor).toFixed(2))
            : null,
        carbs:
          factor === 0
            ? 0
            : originalValues.carbs
            ? Number((originalValues.carbs * factor).toFixed(2))
            : null,
        protein:
          factor === 0
            ? 0
            : originalValues.protein
            ? Number((originalValues.protein * factor).toFixed(2))
            : null,
        perg:
          fixedUnit === "g"
            ? newQuantity === ""
              ? null
              : parseInt(newQuantity, 10)
            : originalValues.perg,
        peroz:
          fixedUnit === "oz"
            ? newQuantity === ""
              ? null
              : evaluateFraction(newQuantity)
            : originalValues.peroz,
        percup:
          fixedUnit === "cup"
            ? newQuantity === ""
              ? null
              : evaluateFraction(newQuantity)
            : originalValues.percup,
        peru:
          fixedUnit === "unit"
            ? newQuantity === ""
              ? null
              : parseInt(newQuantity, 10)
            : originalValues.peru,
      });
    },
    [food, fixedUnit, evaluateFraction, parseFoodDescription]
  );

  const handleQuantityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDisplayQuantity = e.target.value;

      if (newDisplayQuantity === "") {
        setQuantity("");
        setDisplayQuantity("");
        recalculateNutritionalValues("");
        return;
      }

      const numericValue = parseFloat(newDisplayQuantity);
      if (isNaN(numericValue) || numericValue < 0) return;

      let newQuantity: string;

      if (fixedUnit === "g" || fixedUnit === "unit") {
        if (!/^\d+$/.test(newDisplayQuantity)) return;
        newQuantity = newDisplayQuantity;
      } else if (fixedUnit === "oz" || fixedUnit === "cup") {
        newQuantity = convertToFraction(numericValue, fixedUnit === "cup");
      } else {
        return;
      }

      setQuantity(newQuantity);
      setDisplayQuantity(newDisplayQuantity);
      recalculateNutritionalValues(newQuantity);
    },
    [fixedUnit, recalculateNutritionalValues, convertToFraction]
  );

  const handleSaveFood = useCallback(async () => {
    if (!food || !type || !userEmail) {
      setError("Faltan datos necesarios para guardar el alimento.");
      return;
    }

    if (quantity === "") {
      setError("Por favor ingresa una cantidad válida.");
      return;
    }

    const normalizedType =
      type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

    const formattedCalories = nutritionalValues.calories || 0;
    const formattedFat = (nutritionalValues.fat || 0).toFixed(2);
    const formattedCarbs = (nutritionalValues.carbs || 0).toFixed(2);
    const formattedProtein = (nutritionalValues.protein || 0).toFixed(2);

    const displayQuantityForDescription =
      fixedUnit === "oz" || fixedUnit === "cup"
        ? convertToFraction(evaluateFraction(quantity), fixedUnit === "cup")
        : quantity;

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

    try {
      const endpoint = isEdit ? "/api/foods/update" : "/api/foods/add";
      const requestBody = isEdit ? {
        email: userEmail,
        food_id: food.food_id,
        food_name: food.food_name,
        food_description: adjustedDescription,
        type: normalizedType,
        id_registro: registryId
      } : {
        email: userEmail,
        food_id: food.food_id,
        food_name: food.food_name,
        food_description: adjustedDescription,
        type: normalizedType
      };

      await axios({
        method: isEdit ? "put" : "post",
        url: `${import.meta.env.VITE_BACKEND_URL}${endpoint}`,
        data: requestBody
      });

      const actionText = isEdit ? "actualizado" : "añadido";
      
      addNotification(
        isEdit ? "Alimento actualizado" : "Alimento registrado",
        `Has ${actionText} ${food.food_name} en tu registro de ${normalizedType.toLowerCase()}.`,
        "success",
        true,
        "comida"
      );

      await Swal.fire({
        title: "¡Éxito!",
        text: `La comida ha sido ${actionText} exitosamente.`,
        icon: "success",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#ff9400",
        background: isDarkMode ? "#282c3c" : "#ffffff",
        customClass: {
          popup: isDarkMode ? "custom-dark-swal" : "custom-light-swal",
          icon: "custom-swal-icon",
          title: isDarkMode ? "text-white" : "text-gray-900",
          htmlContainer: isDarkMode ? "text-gray-400" : "text-gray-600",
        },
      });

      const searchParams = new URLSearchParams(location.search);
      const currentDate =
        date ||
        searchParams.get("date") ||
        new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });

      navigate(`/comidas?type=${normalizedType.toLowerCase()}&date=${currentDate}`, {
        state: { fromAddButton: true },
      });
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      const errorMessage =
        axiosError.response?.data?.error || `Error al ${isEdit ? "actualizar" : "agregar"} el alimento`;
      setError(errorMessage);
      
      addNotification(
        isEdit ? "Error al actualizar alimento" : "Error al registrar alimento",
        errorMessage,
        "error",
        true,
        "comida"
      );

      await Swal.fire({
        title: "¡Error!",
        text: errorMessage,
        icon: "error",
        iconColor: "#ff9400",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#ff9400",
        customClass: {
          popup: "custom-swal-background",
          icon: "custom-swal-icon",
          title: "custom-swal-title",
          htmlContainer: "custom-swal-text",
        },
      });
    }
  }, [food,type, userEmail, quantity, fixedUnit, unitLabel, nutritionalValues, convertToFraction, evaluateFraction, navigate, addNotification, isDarkMode, isEdit, registryId, location.search, date]);

  return (
    <div className="mt-0">
      <div className="ml-0 mr-2 mt-0">
        <Link
          to={`/foodsearch?type=${type || ""}`}
          state={{ fromAddButton: true }}
          className="inline-block"
        >
          <button
            className={`flex items-center py-2 px-4 bg-gradient-to-r from-[#ff9404] to-[#FF6B35] ${
              isDarkMode ? "text-white" : "text-gray-900"
            } font-semibold rounded-full shadow-md hover:shadow-lg hover:from-[#FF6B35] hover:to-[#ff9404] transition-all duration-300 hover:-translate-y-1 z-10`}
          >
            <FaArrowLeft className="mr-1 text-base" />
            Volver
          </button>
        </Link>
      </div>

      <div
        className={`${
          isDarkMode ? "bg-[#3B4252]" : "bg-white"
        } rounded-lg p-4 shadow-md flex-1 mt-9`}
      >
        <h2
          className={`text-sm font-semibold mb-2 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Ajustar Cantidad - {food?.food_name || ""}
        </h2>
        {error && <p className="text-red-400 mt-2 text-xs">{error}</p>}

        <div className="mt-4">
          <div className="mb-4">
            <label
              className={`text-sm font-medium ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Cantidad (en {unitLabel}):
            </label>
            <input
              type="number"
              value={displayQuantity}
              onChange={handleQuantityChange}
              className={`w-full border ${
                isDarkMode
                  ? "border-gray-500 bg-[#2D3242] text-gray-200 focus:bg-[#2D3242]"
                  : "border-gray-300 bg-white text-gray-900 focus:bg-gray-50"
              } rounded-md text-center focus:outline-none focus:border-[#ff9404] focus:ring-2 focus:ring-[#ff9404]/20 focus:scale-102 transition-all duration-300 placeholder:text-gray-500 [.error&]:border-[#ff4444] [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none mt-2 sm:text-sm sm:px-2.5 sm:py-1.5 text-xs px-2 py-1`}
              min={fixedUnit === "g" || fixedUnit === "unit" ? "0" : "0"}
              step={fixedUnit === "g" || fixedUnit === "unit" ? "1" : "0.25"}
            />
          </div>

          <NutritionalDisplay
            quantity={quantity}
            fixedUnit={fixedUnit}
            unitLabel={unitLabel}
            nutritionalValues={nutritionalValues}
            convertToFraction={convertToFraction}
            evaluateFraction={evaluateFraction}
          />

          <div className="mt-4 text-right">
            <button
              onClick={handleSaveFood}
              className={`py-2 px-4 bg-gradient-to-r from-[#ff9404] to-[#FF6B35] ${
                isDarkMode ? "text-white" : "text-gray-900"
              } font-semibold rounded-full shadow-md hover:shadow-lg hover:from-[#FF6B35] hover:to-[#ff9404] transition-all duration-300 hover:-translate-y-1 z-10`}
            >
              Agregar Alimento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(FoodQuantityAdjust);
