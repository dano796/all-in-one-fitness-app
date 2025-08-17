import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Trash2, CheckCircle, X, ChevronDown, ChevronUp, Clock } from "lucide-react";
import axios from "axios";
import GalaxyBackground from "../components/GalaxyBackground";
import { Progress } from "@/components/ui/progress";
import { useTheme } from "./ThemeContext";
import timerEndSound from "../assets/sounds/timer-end.mp3.wav";
import * as tf from '@tensorflow/tfjs';
import * as posedetection from '@tensorflow-models/pose-detection';
import { useNotificationStore } from "../store/notificationStore";
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface Routine {
  id: string;
  day: string;
  name: string;
  exercises: Exercise[];
}

interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  target: string;
  secondaryMuscles: string[];
  instructions: string[];
  series: { sets: { kg: string; reps: string; completed?: boolean }[] }[];
  restTimer?: string;
  note?: string;
}

interface RoutineDetailsProps {
  user: User | null;
}

const RoutineDetails: React.FC<RoutineDetailsProps> = ({ user }) => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editedExercises, setEditedExercises] = useState<Exercise[]>([]);
  const [timer, setTimer] = useState<number>(0);
  const [initialTimer, setInitialTimer] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState<boolean>(false);
  const [timerCompleted, setTimerCompleted] = useState<boolean>(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [expandedExercises, setExpandedExercises] = useState<{ [key: string]: boolean }>({});
  const [customTimer, setCustomTimer] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toLocaleDateString("en-CA")
  );
  const [activeAnalysisExerciseId, setActiveAnalysisExerciseId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState<boolean>(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState<boolean>(false);
  const [idusuario, setIdusuario] = useState<number | null>(null);
  const [isIdLoading, setIsIdLoading] = useState<boolean>(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<posedetection.PoseDetector | null>(null);
  const isDetectingRef = useRef<boolean>(false);
  const lastFeedbackUpdate = useRef<number>(0);
  const { addNotification } = useNotificationStore();

  const timerSound = new Audio(timerEndSound);

  const queryParams = new URLSearchParams(location.search);
  const routineId = queryParams.get("id");
  const userEmail = user?.email || queryParams.get("email") || "";

  const isToday = selectedDate === new Date().toLocaleDateString("en-CA");

  // Verificar idusuario y suscripción al cargar el componente
  useEffect(() => {
    const fetchIdUsuarioAndSubscription = async () => {
      if (!user || !user.email) {
        setIdusuario(null);
        setIsSubscribed(null);
        setIsIdLoading(false);
        setFeedback('Por favor, inicia sesión para usar el análisis de ejercicios.');
        return;
      }

      setIsIdLoading(true);
      setIsCheckingSubscription(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/get-user-subscription`, {
          params: { email: user.email },
        });

        const data = response.data;
        setIdusuario(data.idusuario);
        setIsSubscribed(data.Suscripcion);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setFeedback('Error al obtener tu información de usuario. Por favor, intenta de nuevo más tarde.');
        setIdusuario(null);
        setIsSubscribed(false);
      } finally {
        setIsIdLoading(false);
        setIsCheckingSubscription(false);
      }
    };

    fetchIdUsuarioAndSubscription();
  }, [user]);

  // Mapeo de ejercicios a reglas de evaluación
  const exerciseRules: { [key: string]: (keypoints: posedetection.Keypoint[]) => string } = {
    squat: (keypoints) => {
      const leftKnee = keypoints.find((kp) => kp.name === 'left_knee');
      const leftHip = keypoints.find((kp) => kp.name === 'left_hip');
      const leftAnkle = keypoints.find((kp) => kp.name === 'left_ankle');
      const rightKnee = keypoints.find((kp) => kp.name === 'right_knee');
      const rightHip = keypoints.find((kp) => kp.name === 'right_hip');
      const rightAnkle = keypoints.find((kp) => kp.name === 'right_ankle');
      
      if (leftKnee && leftHip && leftAnkle && rightKnee && rightHip && rightAnkle &&
          leftKnee.score && leftHip.score && leftAnkle.score &&
          rightKnee.score && rightHip.score && rightAnkle.score && rightAnkle.score > 0.5) {
        const leftAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
        const rightAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
        const avgAngle = (leftAngle + rightAngle) / 2;
        
        if (avgAngle > 80 && avgAngle < 100) {
          return '¡Buena sentadilla! Mantén la espalda recta y baja lentamente hasta que tus muslos estén paralelos al suelo. Sube controladamente.';
        } else if (avgAngle <= 80) {
          return 'Ajusta tu postura: dobla más las rodillas y baja hasta que tus muslos estén paralelos al suelo. Mantén la espalda recta.';
        } else {
          return 'Ajusta tu postura: no bajes tanto, sube un poco y mantén el control de la bajada.';
        }
      }
      return getPoseAdjustmentFeedback(keypoints, ['left_knee', 'left_hip', 'left_ankle', 'right_knee', 'right_hip', 'right_ankle']);
    },
    bench_press: (keypoints) => {
      const leftElbow = keypoints.find((kp) => kp.name === 'left_elbow');
      const leftShoulder = keypoints.find((kp) => kp.name === 'left_shoulder');
      const leftWrist = keypoints.find((kp) => kp.name === 'left_wrist');
      const rightElbow = keypoints.find((kp) => kp.name === 'right_elbow');
      const rightShoulder = keypoints.find((kp) => kp.name === 'right_shoulder');
      const rightWrist = keypoints.find((kp) => kp.name === 'right_wrist');
      
      if (leftElbow && leftShoulder && leftWrist && rightElbow && rightShoulder && rightWrist &&
          leftElbow.score && leftShoulder.score && leftWrist.score &&
          rightElbow.score && rightShoulder.score && rightWrist.score && rightWrist.score > 0.5) {
        const leftAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
        const rightAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
        const avgAngle = (leftAngle + rightAngle) / 2;
        
        if (avgAngle > 80 && avgAngle < 110) {
          return '¡Buen press de banca! Mantén los codos a 90° en la bajada y sube la barra con control, sin arquear la espalda.';
        } else if (avgAngle <= 80) {
          return 'Ajusta tu postura: baja más los codos hasta formar un ángulo de 90° y mantén los hombros estables.';
        } else {
          return 'Ajusta tu postura: no extiendas tanto los codos, baja la barra hasta el pecho con control.';
        }
      }
      return getPoseAdjustmentFeedback(keypoints, ['left_elbow', 'left_shoulder', 'left_wrist', 'right_elbow', 'right_shoulder', 'right_wrist']);
    },
    bicep_curl: (keypoints) => {
      const leftElbow = keypoints.find((kp) => kp.name === 'left_elbow');
      const leftShoulder = keypoints.find((kp) => kp.name === 'left_shoulder');
      const leftWrist = keypoints.find((kp) => kp.name === 'left_wrist');
      const rightElbow = keypoints.find((kp) => kp.name === 'right_elbow');
      const rightShoulder = keypoints.find((kp) => kp.name === 'right_shoulder');
      const rightWrist = keypoints.find((kp) => kp.name === 'right_wrist');
      
      if (leftElbow && leftShoulder && leftWrist && leftElbow.score && leftShoulder.score && leftWrist.score && leftWrist.score > 0.5) {
        const leftAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
        if (leftAngle >= 30 && leftAngle <= 60) {
          return '¡Buen curl de bíceps! Mantén el codo cerca del cuerpo, sube la barra lentamente y baja con control.';
        } else if (leftAngle < 30) {
          return 'Ajusta tu postura: flexiona más el codo para subir la barra hasta el pecho, manteniendo el codo fijo.';
        } else {
          return 'Ajusta tu postura: no extiendas tanto el brazo, baja la barra hasta casi estirar el codo.';
        }
      } else if (rightElbow && rightShoulder && rightWrist && rightElbow.score && rightShoulder.score && rightWrist.score && rightWrist.score > 0.5) {
        const rightAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
        if (rightAngle >= 30 && rightAngle <= 60) {
          return '¡Buen curl de bíceps! Mantén el codo cerca del cuerpo, sube la barra lentamente y baja con control.';
        } else if (rightAngle < 30) {
          return 'Ajusta tu postura: flexiona más el codo para subir la barra hasta el pecho, manteniendo el codo fijo.';
        } else {
          return 'Ajusta tu postura: no extiendas tanto el brazo, baja la barra hasta casi estirar el codo.';
        }
      }
      return getPoseAdjustmentFeedback(keypoints, ['left_elbow', 'left_shoulder', 'left_wrist', 'right_elbow', 'right_shoulder', 'right_wrist']);
    },
    deadlift: (keypoints) => {
      const leftHip = keypoints.find((kp) => kp.name === 'left_hip');
      const leftKnee = keypoints.find((kp) => kp.name === 'left_knee');
      const leftAnkle = keypoints.find((kp) => kp.name === 'left_ankle');
      const rightHip = keypoints.find((kp) => kp.name === 'right_hip');
      const rightKnee = keypoints.find((kp) => kp.name === 'right_knee');
      const rightAnkle = keypoints.find((kp) => kp.name === 'right_ankle');
      
      if (leftHip && leftKnee && leftAnkle && rightHip && rightKnee && rightAnkle &&
          leftHip.score && leftKnee.score && leftAnkle.score &&
          rightHip.score && rightKnee.score && rightAnkle.score && rightAnkle.score > 0.5) {
        const leftAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
        const rightAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
        const avgAngle = (leftAngle + rightAngle) / 2;
        
        if (avgAngle > 160 && avgAngle < 180) {
          return '¡Buen peso muerto! Mantén la espalda recta, las rodillas ligeramente flexionadas y sube la barra con fuerza desde el suelo.';
        } else if (avgAngle < 160) {
          return 'Ajusta tu postura: flexiona menos las rodillas y mantén la espalda recta al levantar la barra.';
        } else {
          return 'Ajusta tu postura: no te inclines tanto hacia atrás, sube la barra hasta estar de pie completamente.';
        }
      }
      return getPoseAdjustmentFeedback(keypoints, ['left_hip', 'left_knee', 'left_ankle', 'right_hip', 'right_knee', 'right_ankle']);
    },
    military_press: (keypoints) => {
      const leftElbow = keypoints.find((kp) => kp.name === 'left_elbow');
      const leftShoulder = keypoints.find((kp) => kp.name === 'left_shoulder');
      const leftWrist = keypoints.find((kp) => kp.name === 'left_wrist');
      const rightElbow = keypoints.find((kp) => kp.name === 'right_elbow');
      const rightShoulder = keypoints.find((kp) => kp.name === 'right_shoulder');
      const rightWrist = keypoints.find((kp) => kp.name === 'right_wrist');
      
      if (leftElbow && leftShoulder && leftWrist && rightElbow && rightShoulder && rightWrist &&
          leftElbow.score && leftShoulder.score && leftWrist.score &&
          rightElbow.score && rightShoulder.score && rightWrist.score && rightWrist.score > 0.5) {
        const leftAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
        const rightAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
        const avgAngle = (leftAngle + rightAngle) / 2;
        
        if (avgAngle > 80 && avgAngle < 110) {
          return '¡Buen press militar! Mantén los codos alineados con los hombros y sube las mancuernas hasta arriba de la cabeza.';
        } else if (avgAngle <= 80) {
          return 'Ajusta tu postura: sube más las mancuernas, formando un ángulo de 90° con los codos.';
        } else {
          return 'Ajusta tu postura: no extiendas tanto los brazos, baja las mancuernas a la altura de los hombros.';
        }
      }
      return getPoseAdjustmentFeedback(keypoints, ['left_elbow', 'left_shoulder', 'left_wrist', 'right_elbow', 'right_shoulder', 'right_wrist']);
    },
    default: (keypoints) => {
      return getPoseAdjustmentFeedback(keypoints, ['left_knee', 'left_hip', 'left_ankle', 'left_elbow', 'left_shoulder', 'left_wrist']);
    },
  };

  // Función para proporcionar feedback detallado sobre ajustes de posición
  const getPoseAdjustmentFeedback = (keypoints: posedetection.Keypoint[], requiredKeypoints: string[]): string => {
    const videoWidth = videoRef.current?.videoWidth || 640;
    const videoHeight = videoRef.current?.videoHeight || 480;

    const missingKeypoints = requiredKeypoints.filter((kpName) => {
      const kp = keypoints.find((k) => k.name === kpName);
      return !kp || !kp.score || kp.score <= 0.5;
    });

    if (missingKeypoints.length > 0) {
      const detectedKeypoints = keypoints.filter((kp) => kp.score && kp.score > 0.5);
      if (detectedKeypoints.length === 0) {
        return 'No se detecta ninguna parte del cuerpo. Colócate frente a la cámara y asegúrate de estar completamente visible.';
      }

      const leftmostX = Math.min(...detectedKeypoints.map((kp) => kp.x));
      const rightmostX = Math.max(...detectedKeypoints.map((kp) => kp.x));
      const topmostY = Math.min(...detectedKeypoints.map((kp) => kp.y));
      const bottommostY = Math.max(...detectedKeypoints.map((kp) => kp.y));

      const suggestions: string[] = [];

      if (leftmostX < videoWidth * 0.1) {
        suggestions.push('Muévete más a la derecha para que todo tu cuerpo sea visible.');
      }
      if (rightmostX > videoWidth * 0.9) {
        suggestions.push('Muévete más a la izquierda para que todo tu cuerpo sea visible.');
      }
      if (topmostY < videoHeight * 0.1) {
        suggestions.push('Baja un poco tu posición o ajusta la cámara hacia arriba.');
      }
      if (bottommostY > videoHeight * 0.9) {
        suggestions.push('Sube un poco tu posición o ajusta la cámara hacia abajo.');
      }

      if (suggestions.length > 0) {
        return suggestions.join(' ');
      }

      return `No se detectan correctamente las partes necesarias (${missingKeypoints.join(', ')}). Asegúrate de que tus brazos, piernas y torso sean visibles para la cámara.`;
    }

    return 'Ajusta tu posición frente a la cámara para que se detecte el ejercicio correctamente.';
  };

  const fetchRoutineDetails = useCallback(async () => {
    if (!routineId) {
      setError("ID de rutina no proporcionado.");
      setLoading(false);
      return;
    }

    try {
      setEditedExercises([]);
      const response = await axios.get<{ routine: Routine }>(
        `${import.meta.env.VITE_BACKEND_URL}/api/routines/${routineId}`,
        {
          params: { date: selectedDate },
        }
      );
      const fetchedRoutine = response.data.routine;

      let exercises: Exercise[] = [];
      if (typeof fetchedRoutine.exercises === "string") {
        exercises = JSON.parse(fetchedRoutine.exercises);
      } else {
        exercises = fetchedRoutine.exercises || [];
      }

      if (!Array.isArray(exercises)) exercises = [];

      exercises = exercises.map((exercise) => ({
        ...exercise,
        series: exercise.series?.length
          ? exercise.series.map((serie) => ({
              sets: serie.sets?.length
                ? serie.sets.map((set) => ({
                    ...set,
                    kg: set.kg || "0",
                    reps: set.reps || "0",
                    completed: set.completed ?? false,
                  }))
                : [],
            }))
          : [{ sets: [] }],
        note: exercise.note || "",
      }));

      setRoutine(fetchedRoutine);
      setEditedExercises(exercises);
      setError(null);
    } catch (err) {
      console.error("Error al cargar los detalles de la rutina:", err);
      setError("Error al cargar los detalles de la rutina.");
    } finally {
      setLoading(false);
    }
  }, [routineId, selectedDate]);

  useEffect(() => {
    fetchRoutineDetails();
  }, [fetchRoutineDetails]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isToday && JSON.stringify(editedExercises) !== JSON.stringify(routine?.exercises)) {
        e.preventDefault();
        e.returnValue = "Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [editedExercises, routine, isToday]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setIsTimerModalOpen(false);
      setTimerCompleted(true);
      timerSound.play().catch((err) => console.error("Error al reproducir el sonido:", err));
      addNotification(
        "⏰ Descanso completado",
        "🏋️‍♂️ ¡Es hora de continuar con tu rutina!",
        "success",
        true,
        "ejercicio"
      );
      setTimeout(() => {
        timerSound.pause();
        timerSound.currentTime = 0;
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timer, addNotification]);

  useEffect(() => {
    console.log('Camera useEffect triggered', { activeAnalysisExerciseId, isSubscribed });
    if (activeAnalysisExerciseId && videoRef.current && isSubscribed) {
      async function setupCamera() {
        try {
          console.log('Setting up camera...');
          if (videoRef.current && videoRef.current.srcObject) {
            const oldStream = videoRef.current.srcObject as MediaStream;
            oldStream.getTracks().forEach(track => track.stop());
          }
          const constraints: MediaStreamConstraints = {
            video: { facingMode: 'user' },
          };
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
          await loadPoseDetector();
          detectPose();
        } catch (err) {
          console.error("Error al acceder a la cámara:", err);
          if (err instanceof Error) {
            setFeedback("No se pudo acceder a la cámara: " + err.message);
          } else {
            setFeedback("No se pudo acceder a la cámara debido a un error desconocido.");
          }
        }
      }
      setupCamera();
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      if (detectorRef.current) {
        detectorRef.current.dispose();
        detectorRef.current = null;
      }
      isDetectingRef.current = false;
    };
  }, [activeAnalysisExerciseId, isSubscribed]);

  async function loadPoseDetector() {
    try {
      await tf.setBackend('webgl');
      await tf.ready();
      detectorRef.current = await posedetection.createDetector(posedetection.SupportedModels.MoveNet, {
        modelType: 'SinglePose.Lightning',
      });
    } catch (err) {
      console.error("Error al cargar el detector de poses:", err);
      if (err instanceof Error) {
        setFeedback("Error al cargar el modelo de detección de poses: " + err.message);
      } else {
        setFeedback("Error al cargar el modelo de detección de poses.");
      }
    }
  }

  async function detectPose() {
    if (!activeAnalysisExerciseId || !videoRef.current || !canvasRef.current || !detectorRef.current || isDetectingRef.current) {
      return;
    }
    isDetectingRef.current = true;
    try {
      const poses = await detectorRef.current.estimatePoses(videoRef.current);
      if (poses.length > 0) {
        drawKeypoints(poses[0].keypoints);
        analyzeExercise(poses[0].keypoints);
      } else {
        setFeedback("No se detectaron poses en el video. Asegúrate de estar frente a la cámara.");
      }
    } catch (err) {
      console.error("Error al detectar poses:", err);
      if (err instanceof Error) {
        setFeedback("Error al procesar la pose: " + err.message);
      } else {
        setFeedback("Error al procesar la pose.");
      }
      if (err instanceof Error && err.message.includes('WebGL')) {
        try {
          await tf.setBackend('cpu');
          await tf.ready();
          setFeedback("Cambiado al backend CPU debido a un error con WebGL. Intenta de nuevo.");
        } catch (cpuErr) {
          console.error("Error al cambiar al backend CPU:", cpuErr);
          setFeedback("Error crítico: No se puede procesar la pose. Reinicia la aplicación.");
        }
      }
    } finally {
      isDetectingRef.current = false;
      setTimeout(() => {
        if (activeAnalysisExerciseId) detectPose();
      }, 500);
    }
  }

  function drawKeypoints(keypoints: posedetection.Keypoint[]) {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        keypoints.forEach((kp) => {
          if (kp.score && kp.score > 0.5) {
            ctx.beginPath();
            ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#ff9404';
            ctx.fill();
          }
        });
      }
    }
  }

  function analyzeExercise(keypoints: posedetection.Keypoint[]) {
    if (editedExercises[currentExerciseIndex]) {
      const exerciseName = editedExercises[currentExerciseIndex].name.toLowerCase();
      console.log("Analizando ejercicio:", exerciseName);
      let ruleKey = 'default';
      if (exerciseName.includes('squat') || exerciseName.includes('sentadilla')) {
        ruleKey = 'squat';
      } else if (exerciseName.includes('bench press') || exerciseName.includes('press de banca')) {
        ruleKey = 'bench_press';
      } else if (exerciseName.includes('bicep curl') || exerciseName.includes('curl de bíceps')) {
        ruleKey = 'bicep_curl';
      } else if (exerciseName.includes('deadlift') || exerciseName.includes('peso muerto')) {
        ruleKey = 'deadlift';
      } else if (exerciseName.includes('military press') || exerciseName.includes('press militar')) {
        ruleKey = 'military_press';
      }
      
      const currentTime = Date.now();
      if (currentTime - lastFeedbackUpdate.current >= 500) {
        const feedbackMessage = exerciseRules[ruleKey](keypoints);
        setFeedback(feedbackMessage);
        lastFeedbackUpdate.current = currentTime;
      }
    }
  }

  function calculateAngle(a: posedetection.Keypoint, b: posedetection.Keypoint, c: posedetection.Keypoint): number {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180) angle = 360 - angle;
    return angle;
  }

  const startRestTimer = (restTimer: string) => {
    const seconds = restTimer === "Otro" ? parseInt(customTimer) || 0 : parseInt(restTimer) || 0;
    setTimer(seconds);
    setInitialTimer(seconds);
    setIsTimerRunning(true);
    setIsTimerModalOpen(true);
    setTimerCompleted(false);
  };

  const toggleTimer = () => setIsTimerRunning((prev) => !prev);

  const closeTimerModal = () => {
    setIsTimerModalOpen(false);
    setIsTimerRunning(false);
    setTimer(0);
    setTimerCompleted(false);
  };

  const handleBackClick = () => navigate(`/routines?email=${encodeURIComponent(userEmail)}`);

  const saveRoutine = async (updatedExercises: Exercise[], includeFecha: boolean = false) => {
    if (!routineId) return;
    try {
      const payload: { exercises: Exercise[]; fecha?: string } = {
        exercises: updatedExercises,
      };
      if (includeFecha) {
        payload.fecha = new Date().toISOString().split("T")[0];
      }
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/routines/${routineId}`, payload);
      setRoutine((prev) => (prev ? { ...prev, exercises: updatedExercises } : prev));
    } catch (err) {
      console.error("Error al guardar los cambios automáticamente:", err);
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setError("No se pueden modificar sets de días anteriores.");
      } else {
        setError("Error al guardar los cambios.");
      }
    }
  };

  const handleAddSerie = (exerciseIndex: number) => {
    const updatedExercises = [...editedExercises];
    updatedExercises[exerciseIndex].series.push({ sets: [] });
    setEditedExercises(updatedExercises);
    saveRoutine(updatedExercises);
  };

  const handleRemoveSerie = (exerciseIndex: number, serieIndex: number) => {
    const updatedExercises = [...editedExercises];
    updatedExercises[exerciseIndex].series.splice(serieIndex, 1);
    setEditedExercises(updatedExercises);
    saveRoutine(updatedExercises);
  };

  const handleAddSet = (exerciseIndex: number, serieIndex: number) => {
    const updatedExercises = [...editedExercises];
    updatedExercises[exerciseIndex].series[serieIndex].sets.push({ kg: "", reps: "", completed: false });
    setEditedExercises(updatedExercises);
    saveRoutine(updatedExercises);
  };

  const handleRemoveSet = (exerciseIndex: number, serieIndex: number, setIndex: number) => {
    const updatedExercises = [...editedExercises];
    updatedExercises[exerciseIndex].series[serieIndex].sets.splice(setIndex, 1);
    setEditedExercises(updatedExercises);
    saveRoutine(updatedExercises);
  };

  const handleSetChange = (
    exerciseIndex: number,
    serieIndex: number,
    setIndex: number,
    field: "kg" | "reps",
    value: string
  ) => {
    const updatedExercises = [...editedExercises];
    const updatedSeries = [...updatedExercises[exerciseIndex].series];
    const updatedSets = [...updatedSeries[serieIndex].sets];
    updatedSets[setIndex] = { ...updatedSets[setIndex], [field]: value };
    updatedSeries[serieIndex] = { sets: updatedSets };
    updatedExercises[exerciseIndex] = {
      ...updatedExercises[exerciseIndex],
      series: updatedSeries,
    };
    setEditedExercises(updatedExercises);
  };

  const handleSetBlur = (exerciseIndex: number, serieIndex: number, setIndex: number) => {
    const updatedExercises = [...editedExercises];
    const updatedSeries = [...updatedExercises[exerciseIndex].series];
    const updatedSets = [...updatedSeries[serieIndex].sets];
    updatedSets[setIndex] = {
      ...updatedSets[setIndex],
      kg: updatedSets[setIndex].kg || "0",
      reps: updatedSets[setIndex].reps || "0",
      completed: updatedSets[setIndex].completed ?? false,
    };
    updatedSeries[serieIndex] = { sets: updatedSets };
    updatedExercises[exerciseIndex] = {
      ...updatedExercises[exerciseIndex],
      series: updatedSeries,
    };
    setEditedExercises(updatedExercises);
  };

  const handleToggleSetCompleted = (exerciseIndex: number, serieIndex: number, setIndex: number) => {
    const updatedExercises = [...editedExercises];
    const updatedSeries = [...updatedExercises[exerciseIndex].series];
    const updatedSets = [...updatedSeries[serieIndex].sets];
    
    const newCompletedState = !updatedSets[setIndex].completed;
    
    updatedSets[setIndex] = {
      ...updatedSets[setIndex],
      completed: newCompletedState,
    };
    updatedSeries[serieIndex] = { sets: updatedSets };
    updatedExercises[exerciseIndex] = {
      ...updatedExercises[exerciseIndex],
      series: updatedSeries,
    };
    setEditedExercises(updatedExercises);
    
    if (newCompletedState) {
      addNotification(
        "✅ Set completado", 
        `💪 Has completado un set de ${updatedExercises[exerciseIndex].name}`,
        "success",
        true,
        "ejercicio"
      );
      
      const allSetsInSerieCompleted = updatedSeries[serieIndex].sets.every(set => set.completed);
      if (allSetsInSerieCompleted && updatedSeries[serieIndex].sets.length > 0) {
        addNotification(
          "🎯 Serie completada", 
          `🔥 ¡Buen trabajo! Has completado la serie ${serieIndex + 1} de ${updatedExercises[exerciseIndex].name}`,
          "success",
          true,
          "ejercicio"
        );
      }
      
      const allSeriesCompleted = updatedExercises[exerciseIndex].series.every(
        serie => serie.sets.every(set => set.completed)
      );
      if (allSeriesCompleted && updatedExercises[exerciseIndex].series.some(serie => serie.sets.length > 0)) {
        addNotification(
          "🏆 Ejercicio completado", 
          `🎉 ¡Felicidades! Has completado todas las series de ${updatedExercises[exerciseIndex].name}`,
          "success",
          true,
          "ejercicio"
        );
      }
    }
    
    saveRoutine(updatedExercises);
  };

  const handleNoteChange = (exerciseIndex: number, value: string) => {
    const updatedExercises = [...editedExercises];
    updatedExercises[exerciseIndex].note = value;
    setEditedExercises(updatedExercises);
  };

  const handleNoteBlur = (exerciseIndex: number) => {};

  const handleRestTimerChange = (exerciseIndex: number, value: string) => {
    const updatedExercises = [...editedExercises];
    updatedExercises[exerciseIndex].restTimer = value;
    setEditedExercises(updatedExercises);
    saveRoutine(updatedExercises);
  };

  const handleToggleExercise = (exerciseId: string) => {
    setExpandedExercises((prev) => ({
      ...prev,
      [exerciseId]: !prev[exerciseId],
    }));
  };

  const handleFinish = async () => {
    await saveRoutine(editedExercises, true);
    navigate(`/routines?email=${encodeURIComponent(userEmail)}`);
  };

  const handleAddExercise = () => {
    navigate("/ejercicios", {
      state: { fromRoutineDetails: true, routineId, existingExercises: editedExercises },
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setSelectedDate(selectedDate);
  };

  const handleDatePicker = () => {
    if (dateInputRef.current) {
      dateInputRef.current.focus();
      dateInputRef.current.showPicker();
    }
  };

  const getDateLabel = () => {
    const selectedDateObj = new Date(selectedDate + "T00:00:00");
    const today = new Date(new Date().toLocaleDateString("en-CA") + "T00:00:00");
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (selectedDateObj.getTime() === today.getTime()) return "Hoy";
    if (selectedDateObj.getTime() === yesterday.getTime()) return "Ayer";
    return selectedDateObj.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const calculateProgress = () => {
    const totalSets = editedExercises.reduce(
      (total, exercise) =>
        total + exercise.series.reduce((serieTotal, serie) => serieTotal + serie.sets.length, 0),
      0
    );
    const completedSets = editedExercises.reduce(
      (total, exercise) =>
        total +
        exercise.series.reduce(
          (serieTotal, serie) =>
            serieTotal + serie.sets.filter((set) => set.completed).length,
          0
        ),
      0
    );
    return totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  };

  const hasSetsForDate = () => {
    return editedExercises.some((exercise) =>
      exercise.series.some((serie) => serie.sets.length > 0)
    );
  };

  const timerProgress = initialTimer > 0 ? ((initialTimer - timer) / initialTimer) * 100 : 0;

  // Estilos de botones manteniendo colores y efectos hover originales
  const dateButtonStyle = `px-3 py-1.5 text-sm font-semibold rounded-md border border-[#ff9404] shadow-[0_0_10px_rgba(255,148,4,0.3)] hover:shadow-[0_0_15px_rgba(255,148,4,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 ${
    isDarkMode
      ? "bg-gradient-to-br from-[#2D3242] to-[#3B4252] text-gray-200 hover:from-[#3B4252] hover:to-[#4B5563]"
      : "bg-gray-200 text-gray-900 hover:bg-gray-300"
  }`;

  const addExerciseButtonStyle = `px-3 py-1.5 text-sm font-semibold rounded-md border border-[#ff9404] shadow-[0_0_10px_rgba(255,148,4,0.3)] hover:shadow-[0_0_15px_rgba(255,148,4,0.5)] hover:scale-102 active:scale-95 transition-all duration-300 ${
    isDarkMode
      ? "bg-gradient-to-br from-[#2D3242] to-[#3B4252] text-gray-200 hover:from-[#3B4252] hover:to-[#4B5563]"
      : "bg-gray-200 text-gray-900 hover:bg-gray-300"
  }`;

  const addSetSerieButtonStyle = `px-3 py-1.5 text-sm font-semibold rounded-md border border-[#ff9404] shadow-[0_0_10px_rgba(255,148,4,0.3)] hover:shadow-[0_0_15px_rgba(255,148,4,0.5)] hover:scale-102 active:scale-95 transition-all duration-300 ${
    isDarkMode
      ? "bg-gradient-to-br from-[#2D3242] to-[#3B4252] text-gray-200 hover:from-[#3B4252] hover:to-[#4B5563]"
      : "bg-gray-200 text-gray-900 hover:bg-gray-300"
  }`;

  const cameraButtonStyle = `px-3 py-1.5 text-sm font-semibold rounded-md border border-[#ff9404] shadow-[0_0_10px_rgba(255,148,4,0.3)] hover:shadow-[0_0_15px_rgba(255,148,4,0.5)] hover:scale-102 active:scale-95 transition-all duration-300 ${
    isDarkMode
      ? "bg-gradient-to-br from-[#2D3242] to-[#3B4252] text-gray-200 hover:from-[#3B4252] hover:to-[#4B5563]"
      : "bg-gray-200 text-gray-900 hover:bg-gray-300"
  }`;

  const modalButtonStyle = `px-3 py-1.5 text-sm font-semibold rounded-md border border-[#ff9404] shadow-[0_0_10px_rgba(255,148,4,0.3)] hover:shadow-[0_0_15px_rgba(255,148,4,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 ${
    isDarkMode
      ? "bg-gradient-to-br from-[#2D3242] to-[#3B4252] text-gray-200 hover:from-[#3B4252] hover:to-[#4B5563]"
      : "bg-gray-200 text-gray-900 hover:bg-gray-300"
  }`;

  const handleAnalyzeExercise = (exerciseIndex: number, exerciseId: string) => {
    console.log('handleAnalyzeExercise called', { isSubscribed, exerciseIndex, exerciseId });
    if (isSubscribed) {
      setCurrentExerciseIndex(exerciseIndex);
      setActiveAnalysisExerciseId(exerciseId);
      setFeedback("");
    } else {
      setIsSubscriptionModalOpen(true);
    }
  };

  if (loading || isCheckingSubscription || isIdLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
        Cargando...
      </div>
    );
  }

  if (error || !routine) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? "text-red-400" : "text-red-600"}`}>
        {error || "Rutina no encontrada."}
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
        Debes iniciar sesión para ver los detalles de la rutina.
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen p-4 overflow-y-auto transition-colors duration-300 ${isDarkMode ? "bg-transparent text-white" : "bg-transparent text-gray-900"}`}>
      <div className="absolute inset-0 z-0">
        <GalaxyBackground />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.68, -0.55, 0.265, 1.55] }}
          className="flex items-center justify-between p-4 sticky top-0 bg-transparent z-20"
        >
          <button onClick={handleBackClick} className={`p-2 hover:text-[#ff9404] transition-colors ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDatePicker}
              className={dateButtonStyle}
            >
              {getDateLabel()}
            </button>
            <input
              type="date"
              ref={dateInputRef}
              value={selectedDate}
              onChange={handleDateChange}
              max={new Date().toLocaleDateString("en-CA")}
              className="absolute opacity-0 w-0 h-0 pointer-events-none"
            />
            {isToday && (
              <button
                onClick={handleFinish}
                className={dateButtonStyle}
              >
                Finalizar
              </button>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.68, -0.55, 0.265, 1.55] }}
          className="my-4"
        >
          <Progress
            value={calculateProgress()}
            className={`w-full h-2 rounded-full ${isDarkMode ? "bg-gray-600" : "bg-gray-300"} [&>div]:bg-[#ff9404] [&>div]:rounded-full [&>div]:transition-all [&>div]:duration-1000 [&>div]:ease-out`}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.68, -0.55, 0.265, 1.55] }}
          className="my-4 grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <div className="text-center">
            <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Duración</p>
            <p className="text-sm font-semibold">0s</p>
          </div>
          <div className="text-center">
            <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Volumen</p>
            <p className="text-sm font-semibold">0 kg</p>
          </div>
          <div className="text-center">
            <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Series</p>
            <p className="text-sm font-semibold">
              {editedExercises.reduce(
                (total, exercise) => total + exercise.series.length,
                0
              )}
            </p>
          </div>
          <div className="text-center">
            <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Sets</p>
            <p className="text-sm font-semibold">
              {editedExercises.reduce(
                (total, exercise) =>
                  total + exercise.series.reduce((serieTotal, serie) => serieTotal + serie.sets.length, 0),
                0
              )}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: [0.68, -0.55, 0.265, 1.55] }}
          className="mt-4"
        >
          {editedExercises.length > 0 ? (
            editedExercises.map((exercise, exerciseIndex) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + exerciseIndex * 0.2, duration: 0.8, ease: [0.68, -0.55, 0.265, 1.55] }}
                className={`rounded-xl p-4 mb-4 shadow-xl hover:-translate-y-1 transition-transform border border-[#ff9404]/50 ${isDarkMode ? "bg-[#3B4252]" : "bg-white"}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="text-base font-semibold uppercase">{exercise.name}</h3>
                      <p className={`text-xs uppercase ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{exercise.equipment}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleExercise(exercise.id)}
                    className="bg-transparent border-none cursor-pointer p-1 transition-transform duration-200 hover:scale-110"
                  >
                    {expandedExercises[exercise.id] ? (
                      <ChevronUp className={`w-4 h-4 text-[#ff9404]`} />
                    ) : (
                      <ChevronDown className={`w-4 h-4 text-[#ff9404]`} />
                    )}
                  </button>
                </div>

                {expandedExercises[exercise.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    {isToday && (
                      <>
                        <div className="my-3">
                          <input
                            type="text"
                            placeholder="Añadir notas..."
                            value={exercise.note || ""}
                            onChange={(e) => handleNoteChange(exerciseIndex, e.target.value)}
                            onBlur={() => handleNoteBlur(exerciseIndex)}
                            className={`w-full rounded-lg p-2 text-sm focus:border-[#ff9404] outline-none transition-colors ${isDarkMode ? "bg-[#4B5563] text-white border border-gray-600" : "bg-white text-gray-900 border border-gray-300"}`}
                          />
                        </div>

                        <div className="flex flex-col gap-2 mb-4">
                          <div className="flex items-center gap-3">
                            <label className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                              Descanso:
                            </label>
                            <div className="flex items-center gap-2">
                              <select
                                value={exercise.restTimer || "Apagado"}
                                onChange={(e) => handleRestTimerChange(exerciseIndex, e.target.value)}
                                className={`w-32 p-2 rounded-lg border text-sm transition-all duration-300 placeholder-gray-400 focus:outline-none focus:border-[#ff9404] focus:shadow-[0_0_8px_rgba(255,148,4,0.2)] focus:scale-102 ${isDarkMode ? "bg-[#4B5563] text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"}`}
                              >
                                <option value="Apagado">Apagado</option>
                                <option value="30">30 segundos</option>
                                <option value="60">60 segundos</option>
                                <option value="90">90 segundos</option>
                                <option value="Otro">Otro</option>
                              </select>
                              {exercise.restTimer && exercise.restTimer !== "Apagado" && (
                                <button
                                  onClick={() => startRestTimer(exercise.restTimer!)}
                                  className="text-[#ff9404] hover:text-[#e08503] transition-colors"
                                >
                                  <Clock className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          </div>
                          {exercise.restTimer === "Otro" && (
                            <input
                              type="number"
                              placeholder="Segundos"
                              value={customTimer}
                              onChange={(e) => setCustomTimer(e.target.value)}
                              className={`mt-2 w-32 p-2 rounded-lg border text-sm transition-all duration-300 placeholder-gray-400 focus:outline-none focus:border-[#ff9404] focus:shadow-[0_0_8px_rgba(255,148,4,0.2)] focus:scale-102 ${isDarkMode ? "bg-[#4B5563] text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"}`}
                            />
                          )}
                        </div>
                      </>
                    )}

                    {(isToday || hasSetsForDate()) && (
                      <div className="mt-4">
                        {exercise.series.map((serie, serieIndex) => (
                          <div key={serieIndex} className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Serie {serieIndex + 1}</h4>
                              {isToday && exercise.series.length > 1 && (
                                <button
                                  onClick={() => handleRemoveSerie(exerciseIndex, serieIndex)}
                                  className="text-red-500 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            {serie.sets.length > 0 && (
                              <div className={`flex items-center justify-between gap-2 py-2 border-b mb-2 ${isDarkMode ? "border-gray-600" : "border-gray-300"}`}>
                                <span className={`w-8 text-center text-xs font-semibold ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>SET</span>
                                <span className={`w-16 text-center text-xs font-semibold ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>PREVIO</span>
                                <span className={`w-14 text-center text-xs font-semibold ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>KG</span>
                                <span className={`w-14 text-center text-xs font-semibold ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>REPS</span>
                                <span className={`w-8 text-center text-xs font-semibold ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}></span>
                                {isToday && <span className={`w-8 text-center text-xs font-semibold ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}></span>}
                              </div>
                            )}
                            {serie.sets.map((set, setIndex) => (
                              <div key={setIndex} className="flex items-center justify-between gap-2 mb-2">
                                <span className="w-8 text-center text-sm">{setIndex + 1}</span>
                                <span className="w-16 text-center text-sm">
                                  {set.kg && set.reps ? `${set.kg} kg x ${set.reps}` : "-"}
                                </span>
                                <input
                                  type="text"
                                  placeholder="kg"
                                  value={set.kg}
                                  onChange={(e) =>
                                    handleSetChange(exerciseIndex, serieIndex, setIndex, "kg", e.target.value)
                                  }
                                  onBlur={() => handleSetBlur(exerciseIndex, serieIndex, setIndex)}
                                  className={`rounded-lg p-1.5 w-14 text-center text-sm focus:border-[#ff9404] outline-none transition-colors ${isDarkMode ? "bg-[#4B5563] text-white border border-gray-600" : "bg-white text-gray-900 border border-gray-300"}`}
                                  disabled={!isToday}
                                />
                                <input
                                  type="text"
                                  placeholder="reps"
                                  value={set.reps}
                                  onChange={(e) =>
                                    handleSetChange(exerciseIndex, serieIndex, setIndex, "reps", e.target.value)
                                  }
                                  onBlur={() => handleSetBlur(exerciseIndex, serieIndex, setIndex)}
                                  className={`rounded-lg p-1.5 w-14 text-center text-sm focus:border-[#ff9404] outline-none transition-colors ${isDarkMode ? "bg-[#4B5563] text-white border border-gray-600" : "bg-white text-gray-900 border border-gray-300"}`}
                                  disabled={!isToday}
                                />
                                <button
                                  onClick={() => handleToggleSetCompleted(exerciseIndex, serieIndex, setIndex)}
                                  className="p-1"
                                  disabled={!isToday}
                                >
                                  {set.completed ? (
                                    <CheckCircle className="w-4 h-4 text-[#ff9404]" />
                                  ) : (
                                    <CheckCircle className={`w-4 h-4 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
                                  )}
                                </button>
                                {isToday && (
                                  <button
                                    onClick={() => handleRemoveSet(exerciseIndex, serieIndex, setIndex)}
                                    className="text-red-500 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                            {isToday && (
                              <button
                                onClick={() => handleAddSet(exerciseIndex, serieIndex)}
                                className={addSetSerieButtonStyle}
                              >
                                + Añadir Set
                              </button>
                            )}
                          </div>
                        ))}
                        {isToday && (
                          <button
                            onClick={() => handleAddSerie(exerciseIndex)}
                            className={addSetSerieButtonStyle}
                          >
                            + Añadir Serie
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
                {isToday && (
                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      onClick={() => handleAnalyzeExercise(exerciseIndex, exercise.id)}
                      className={cameraButtonStyle}
                    >
                      Analizar Ejercicio
                    </button>
                    {activeAnalysisExerciseId === exercise.id && (
                      <div className={`relative mt-4 ${!isSubscribed ? "blur-md" : ""}`}>
                        <video ref={videoRef} className="w-full max-w-md rounded-lg" />
                        <canvas
                          ref={canvasRef}
                          className="absolute top-0 left-0 w-full max-w-md rounded-lg"
                          width={videoRef.current?.videoWidth || 640}
                          height={videoRef.current?.videoHeight || 480}
                        />
                        <p className={`mt-2 text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>{feedback}</p>
                        <button
                          onClick={() => {
                            setActiveAnalysisExerciseId(null);
                            setFeedback("");
                          }}
                          className={cameraButtonStyle}
                        >
                          Detener Análisis
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <p className={`text-center text-sm mt-8 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              No hay ejercicios en esta rutina.
            </p>
          )}
          {editedExercises.length > 0 && !hasSetsForDate() && (
            <p className={`text-center text-sm mt-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              No hay sets registrados para esta fecha.
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: [0.68, -0.55, 0.265, 1.55], delay: 1.2 }}
          className="mt-8 flex justify-center"
        >
          {isToday && (
            <button
              onClick={handleAddExercise}
              className={addExerciseButtonStyle}
            >
              + Añadir Ejercicio
            </button>
          )}
        </motion.div>

        <AnimatePresence>
          {isTimerModalOpen && isToday && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/90 flex items-center justify-center z-30"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`rounded-2xl p-6 w-11/12 max-w-sm relative shadow-2xl border ${isDarkMode ? "bg-gradient-to-br from-gray-700 to-gray-800 border-white/10" : "bg-white border-gray-300"}`}
              >
                <button
                  onClick={closeTimerModal}
                  className={`absolute top-3 right-3 transition-colors ${isDarkMode ? "text-white hover:text-red-500" : "text-gray-900 hover:text-red-600"}`}
                >
                  <X className="w-5 h-5" />
                </button>
                <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Tiempo de Descanso</h2>
                <div className="relative w-40 h-40 mx-auto mb-4">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                    <circle className={`fill-none stroke-[8] ${isDarkMode ? "stroke-gray-600" : "stroke-gray-300"}`} cx="100" cy="100" r="90" />
                    <circle
                      className="fill-none stroke-[#ff9404] stroke-[8] stroke-linecap-round transition-[stroke-dashoffset] duration-1000"
                      cx="100"
                      cy="100"
                      r="90"
                      strokeDasharray="565.48"
                      strokeDashoffset={565.48 * (1 - timerProgress / 100)}
                    />
                  </svg>
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {timer}s
                  </div>
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={toggleTimer}
                    className={modalButtonStyle}
                  >
                    {isTimerRunning ? "Pausar" : "Reanudar"}
                  </button>
                  <button
                    onClick={() => startRestTimer(editedExercises[currentExerciseIndex]?.restTimer || "0")}
                    className={modalButtonStyle}
                  >
                    Reiniciar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSubscriptionModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/90 flex items-center justify-center z-40"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`rounded-2xl p-6 w-11/12 max-w-sm relative shadow-2xl border ${isDarkMode ? "bg-gradient-to-br from-gray-700 to-gray-800 border-white/10" : "bg-white border-gray-300"}`}
              >
                <button
                  onClick={() => setIsSubscriptionModalOpen(false)}
                  className={`absolute top-3 right-3 transition-colors ${isDarkMode ? "text-white hover:text-red-500" : "text-gray-900 hover:text-red-600"}`}
                >
                  <X className="w-5 h-5" />
                </button>
                <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Función Premium</h2>
                <p className={`mb-4 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  El análisis de ejercicios con cámara es una función exclusiva para usuarios Premium. ¡Obtén una suscripción para desbloquear esta y otras funciones avanzadas!
                </p>
                <button
                  onClick={() => navigate(`/subscription-plans?email=${encodeURIComponent(userEmail)}`)}
                  className={modalButtonStyle}
                >
                  Ver planes
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {timerCompleted && isToday && (
            <motion.div
              className="fixed inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{ zIndex: 0 }}
            >
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-sm"
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: -50,
                    rotate: Math.random() * 360,
                  }}
                  animate={{
                    y: window.innerHeight + 50,
                    rotate: Math.random() * 720,
                    transition: { duration: 2 + Math.random() * 2, ease: "linear" },
                  }}
                  style={{
                    backgroundColor: ["#ff9404", "#4CAF50", "#2196F3", "#F44336"][Math.floor(Math.random() * 4)],
                    width: Math.random() * 10 + 5,
                    height: Math.random() * 10 + 5,
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default React.memo(RoutineDetails);