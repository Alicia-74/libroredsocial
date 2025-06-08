import React, { useState,useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react'; 
import { FaMobileAlt, FaCopy, FaChrome } from 'react-icons/fa'; // Iconos para los pasos

function QR() {
    const [showInstructions, setShowInstructions] = useState(true);
    const [urlToEmbedInQr, setUrlToEmbedInQr] = useState("");

    useEffect(() => {
        const generatedUrl = "https://libroredsocial-amante-de-los-libros.vercel.app";
        setUrlToEmbedInQr(generatedUrl);
    });

    const animationClasses = "transition-all duration-700 ease-out transform";
    const fadeIn = "opacity-100 translate-y-0";
    const fadeOut = "opacity-0 translate-y-4";

    // Determinar el tamaño del QR dinámicamente basado en el tamaño de la pantalla
    // Usamos window.innerWidth para detectar el tamaño actual del viewport.
    // Esto se ejecutará una vez al cargar y cada vez que el componente se re-renderice.
    // Para un re-renderizado reactivo al redimensionar, necesitarías un useEffect adicional
    // que escuche el evento 'resize', pero para la mayoría de los casos de uso esto es suficiente.
    const qrSize = window.innerWidth < 640 ? 150 : 180; // 150px para móviles (sm), 180px para desktop

    return (
        <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 : bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
            {showInstructions ? (
                // Contenedor de Instrucciones
                <div 
                    className={`mb-[72px] md:mt-4 md:mb-4 lg:mt-4 lg:mb-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-6 sm:p-8 text-center max-w-xl w-full mx-auto
                                ${animationClasses} ${showInstructions ? fadeIn : fadeOut}`}
                >
                    <h1 className="text-2xl sm:text-3xl font-bold text-blue-800 dark:text-blue-200 mb-4 sm:mb-6">
                        Accede a LibroRedSocial con QR
                    </h1>
                    <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mb-6 sm:mb-8">
                        Sigue estos sencillos pasos para ver la app con el código QR.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-10">
                        {/* Paso 1 */}
                        <div className="flex flex-col items-center p-3 sm:p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md animate-bounce-custom-1">
                            <FaMobileAlt className="text-5xl sm:text-6xl text-blue-500 dark:text-blue-400 mb-3 sm:mb-4" />
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-1 sm:mb-2">Paso 1</h3>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                Escanea el QR con la cámara de tu móvil.
                            </p>
                        </div>
                        {/* Paso 2 */}
                        <div className="flex flex-col items-center p-3 sm:p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md animate-bounce-custom-2">
                            <FaCopy className="text-5xl sm:text-6xl text-green-500 dark:text-green-400 mb-3 sm:mb-4" />
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-1 sm:mb-2">Paso 2</h3>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                Copia la URL que te ofrece el escáner del móvil.
                            </p>
                        </div>
                        {/* Paso 3 */}
                        <div className="flex flex-col items-center p-3 sm:p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md animate-bounce-custom-3">
                            <FaChrome className="text-5xl sm:text-6xl text-red-500 dark:text-red-400 mb-3 sm:mb-4" />
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-1 sm:mb-2">Paso 3</h3>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                Abre Google Chrome y pega la URL en la barra de direcciones.
                            </p>
                        </div>
                    </div>

                    <button 
                        onClick={() => setShowInstructions(false)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 sm:py-3 sm:px-8 rounded-lg text-base sm:text-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                    >
                        Entendido, mostrar QR
                    </button>
                </div>
            ) : (
                // Contenedor del QR
                <div 
                    className={`bg-white dark:bg-blue-900/30  inset-x-0 top-[70px] bottom-[0px] mx-auto mb-7 mt-5 md:mt-12 md:mb-[39px] lg:mt-[53px] lg:mb-16 p-6 sm:p-8 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 text-center max-w-xs sm:max-w-sm w-full mx-auto
                                ${animationClasses} ${!showInstructions ? fadeIn : fadeOut}`}
                >
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-gray-800 dark:text-gray-200">
                        Código QR
                    </h2>
                    <p className="text-sm pb-5 pt-2 md:pb-1 md:pt-1 lg:pb-1 lg:pt-1 sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                        Escanea este código para acceder a LibroRedSocial.
                    </p>
                    
                    <div class = "flex items-center justify-center" >
                        <div class = "dark:bg-white dark:px-2 dark:py-2 dark:rounded-lg dark:shadow-md m-0" >
                            {urlToEmbedInQr && ( // Asegurarse de que la URL exista antes de renderizar el QR
                                <QRCodeSVG
                                    value={urlToEmbedInQr}
                                    size={qrSize} // <--- TAMAÑO DINÁMICO DEL QR
                                    level="H"
                                    bgColor="#ffffff"
                                    fgColor="#000000"
                                    className="m-0 p-0 block rounded-lg shadow-md xs:size-[90px]"
                                />
                            )}
                        </div>
                    </div>

                    <button 
                        onClick={() => setShowInstructions(true)}
                        className="mt-10 sm:mt-6 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm sm:text-sm font-medium transition-colors"
                    >
                        Volver a ver instrucciones
                    </button>
                </div>
            )}
        </div>
    );
}

export default QR;