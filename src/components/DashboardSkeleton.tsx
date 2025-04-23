const DashboardSkeleton = () => (
  <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
    {/* Skeleton para Ingesta Calórica */}
    <div className="space-y-6">
      <div className="bg-[#3B4252] rounded-lg p-5 animate-pulse">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-40 bg-gray-600 rounded"></div>
          </div>
          <div className="h-4 w-24 bg-gray-600 rounded"></div>
        </div>
        <div className="flex justify-center h-[350px] items-center">
          <div className="w-48 h-48 rounded-full border-8 border-gray-600"></div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center my-4">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="h-3 w-16 bg-gray-600 rounded mx-auto mb-2"></div>
              <div className="h-4 w-20 bg-gray-600 rounded mx-auto"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Skeleton para Ingesta de Agua */}
      <div className="bg-[#3B4252] rounded-lg p-5 animate-pulse">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-32 bg-gray-600 rounded"></div>
          </div>
          <div className="h-4 w-20 bg-gray-600 rounded"></div>
        </div>
        <div className="bg-[#4B5563]/50 rounded-lg p-4 mb-4">
          <div className="h-5 w-40 bg-gray-600 rounded mb-2"></div>
          <div className="h-4 w-24 bg-gray-600 rounded"></div>
        </div>
        <div className="flex items-center justify-center mb-4">
          <div className="h-6 w-6 rounded-full bg-gray-600 mr-2"></div>
          <div className="h-4 w-40 bg-gray-600 rounded"></div>
        </div>
        <div className="mt-4 bg-gray-700 rounded-full h-4"></div>
        <div className="h-4 w-48 bg-gray-600 rounded mx-auto mt-4"></div>
      </div>
    </div>

    {/* Skeleton para Gráficos */}
    <div className="space-y-6">
      {/* Skeleton para Ingesta Calórica - Resumen Semanal */}
      <div className="bg-[#3B4252] rounded-lg p-5 animate-pulse">
        <div className="flex items-center space-x-2 mb-4">
          <div className="h-4 w-64 bg-gray-600 rounded"></div>
        </div>
        <div className="h-[300px] bg-gray-700 rounded-lg opacity-50"></div>
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded bg-gray-600 mr-2"></div>
            <div className="h-3 w-36 bg-gray-600 rounded"></div>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded bg-gray-600 mr-2"></div>
            <div className="h-3 w-36 bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>

      {/* Skeleton para Distribución de Macronutrientes */}
      <div className="bg-[#3B4252] rounded-lg p-5 animate-pulse">
        <div className="flex items-center space-x-2 mb-4">
          <div className="h-4 w-52 bg-gray-600 rounded"></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="text-center">
              <div className="mx-auto w-20 h-20 rounded-full border-4 border-gray-600 flex items-center justify-center mb-2">
                <div className="h-6 w-10 bg-gray-600 rounded"></div>
              </div>
              <div className="h-3 w-20 bg-gray-600 rounded mx-auto mb-2"></div>
              <div className="h-4 w-16 bg-gray-600 rounded mx-auto mb-2"></div>
              <div className="h-3 w-12 bg-gray-600 rounded mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default DashboardSkeleton;
