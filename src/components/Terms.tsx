import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../pages/ThemeContext"; // Asegúrate de que esta ruta sea correcta

const Terms: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className={`container mx-auto px-4 py-16 transition-colors duration-300 ${
        isDarkMode ? "bg-[#282c3c] text-white" : "bg-[#F8F9FA] text-[#212529]"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-4xl font-bold mb-8 text-center"
        >
          Términos y Condiciones
        </motion.h1>
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`rounded-xl p-8 shadow-sm ${
            isDarkMode ? "bg-[#3B4252]" : "bg-white"
          }`}
        >
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">
              Política de Tratamiento de Datos Personales
            </h2>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              En cumplimiento de la{" "}
              <a
                href="https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ff9400] hover:underline"
              >
                Ley 1581 de 2012
              </a>{" "}
              y el{" "}
              <a
                href="https://sedeelectronica.sic.gov.co/transparencia/normativa/decreto-1377"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ff9400] hover:underline"
              >
                Decreto 1377 de 2013
              </a>
              , que desarrollan el derecho constitucional al habeas data establecido en el{" "}
              <a
                href="https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=4125"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ff9400] hover:underline"
              >
                Artículo 15 de la Constitución Política de Colombia
              </a>
              , AIO Fitness App, en su calidad de <strong>Responsable del Tratamiento</strong>, presenta la
              siguiente política para el tratamiento de datos personales recolectados a través de esta
              aplicación. Puede contactarnos en{" "}
              <a
                href="mailto:aiofitnessapp@gmail.com"
                className="text-[#ff9400] hover:underline"
              >
                aiofitnessapp@gmail.com
              </a>{" "}
              para cualquier consulta o solicitud relacionada con sus datos.
            </p>

            <h3 className="text-xl font-semibold mt-6">
              1. Finalidad del Tratamiento
            </h3>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Los datos personales recolectados serán utilizados para las siguientes finalidades:
              <ul className="list-disc pl-6 mt-2">
                <li>Gestionar el registro y acceso a los servicios de la aplicación.</li>
                <li>Personalizar la experiencia del usuario, incluyendo seguimiento de calorías y agua.</li>
                <li>Enviar notificaciones y comunicaciones relacionadas con el servicio.</li>
                <li>Cumplir con obligaciones legales y contractuales.</li>
                <li>Realizar análisis estadísticos para mejorar la aplicación.</li>
              </ul>
            </p>

            <h3 className="text-xl font-semibold mt-6">
              2. Datos Personales Recolectados
            </h3>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              La aplicación podrá recolectar los siguientes datos personales:
              <ul className="list-disc pl-6 mt-2">
                <li>Nombre de usuario.</li>
                <li>Correo electrónico.</li>
                <li>Datos de uso (como preferencias, hábitos de consumo de alimentos, y actividad física).</li>
                <li>
                  Datos sensibles (como información de salud o datos biométricos, si aplica), los cuales
                  serán tratados solo con autorización expresa y son de entrega opcional.
                </li>
              </ul>
            </p>

            <h3 className="text-xl font-semibold mt-6">
              3. Autorización
            </h3>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Al registrarse en la aplicación y aceptar esta política, usted otorga su{" "}
              <strong>consentimiento expreso e informado</strong> para el tratamiento de sus datos
              personales conforme a las finalidades descritas. Puede revocar esta autorización en
              cualquier momento contactándonos en{" "}
              <a
                href="mailto:aiofitnessapp@gmail.com"
                className="text-[#ff9400] hover:underline"
              >
                aiofitnessapp@gmail.com
              </a>
              .
            </p>

            <h3 className="text-xl font-semibold mt-6">
              4. Derechos de los Titulares
            </h3>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Como titular de los datos personales, usted tiene derecho a:
              <ul className="list-disc pl-6 mt-2">
                <li>Conocer, actualizar y rectificar sus datos personales.</li>
                <li>Solicitar la supresión de sus datos, cuando sea procedente.</li>
                <li>Revocar la autorización otorgada para el tratamiento.</li>
                <li>
                  Presentar quejas ante la{" "}
                  <a
                    href="https://www.sic.gov.co/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#ff9400] hover:underline"
                  >
                    Superintendencia de Industria y Comercio (SIC)
                  </a>{" "}
                  por infracciones a la Ley 1581.
                </li>
                <li>Acceder gratuitamente a sus datos personales.</li>
              </ul>
            </p>

            <h3 className="text-xl font-semibold mt-6">
              5. Procedimiento para Consultas y Reclamos
            </h3>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Para ejercer sus derechos, puede contactarnos en{" "}
              <a
                href="mailto:aiofitnessapp@gmail.com"
                className="text-[#ff9400] hover:underline"
              >
                aiofitnessapp@gmail.com
              </a>
              . Las consultas serán atendidas en un plazo máximo de <strong>10 días hábiles</strong>,
              prorrogables por 5 días más. Los reclamos serán resueltos en un plazo máximo de{" "}
              <strong>15 días hábiles</strong>, prorrogables por 8 días más. Todo reclamo debe incluir:
              <ul className="list-disc pl-6 mt-2">
                <li>Identificación del titular.</li>
                <li>Descripción de los hechos que originan el reclamo.</li>
                <li>Documentos de soporte, si aplica.</li>
              </ul>
            </p>

            <h3 className="text-xl font-semibold mt-6">
              6. Medidas de Seguridad
            </h3>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Implementamos medidas técnicas, administrativas y físicas para proteger sus datos
              personales contra pérdida, acceso no autorizado, uso indebido o alteración. Estas
              medidas incluyen cifrado SSL, autenticación segura y controles de acceso restringido.
            </p>

            <h3 className="text-xl font-semibold mt-6">
              7. Transferencia y Transmisión de Datos
            </h3>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Sus datos personales podrán ser transferidos a terceros solo con su autorización expresa
              o bajo las excepciones previstas en la Ley 1581 (por ejemplo, para cumplir con contratos
              o procesos judiciales). Si los datos se transmiten a encargados del tratamiento (como
              proveedores de servicios en la nube), garantizamos que estos cumplen con las
              disposiciones de la ley mediante contratos específicos.
            </p>

            <h3 className="text-xl font-semibold mt-6">
              8. Datos de Menores
            </h3>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              La aplicación no está dirigida a menores de edad. Si se recolectan datos de menores,
              estos serán tratados respetando el interés superior de los niños, niñas y adolescentes,
              y solo con la autorización de sus representantes legales.
            </p>

            <h3 className="text-xl font-semibold mt-6">
              9. Registro Nacional de Bases de Datos
            </h3>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Las bases de datos de la aplicación serán registradas en el{" "}
              <a
                href="https://www.sic.gov.co/registro-nacional-de-bases-de-datos"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ff9400] hover:underline"
              >
                Registro Nacional de Bases de Datos (RNBD)
              </a>{" "}
              administrado por la Superintendencia de Industria y Comercio, conforme a la normativa
              vigente.
            </p>

            <h3 className="text-xl font-semibold mt-6">
              10. Contacto
            </h3>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Para cualquier consulta, reclamo o solicitud relacionada con el tratamiento de datos
              personales, contáctenos en:
              <br />
              <strong>Correo:</strong>{" "}
              <a
                href="mailto:aiofitnessapp@gmail.com"
                className="text-[#ff9400] hover:underline"
              >
                aiofitnessapp@gmail.com
              </a>
            </p>

            <h3 className="text-xl font-semibold mt-6">
              11. Vigencia y Actualización
            </h3>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Esta política entra en vigencia el 11 de mayo de 2025 y podrá ser actualizada
              periódicamente. Cualquier cambio será notificado a los usuarios a través de la
              aplicación o por correo electrónico.
            </p>
          </section>

          <div className="mt-8 flex justify-center">
            <motion.button
              onClick={() => navigate(-1)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 font-semibold rounded-lg text-white bg-[#ff9400] hover:text-[#282c3c] transition-colors"
            >
              Volver
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Terms;