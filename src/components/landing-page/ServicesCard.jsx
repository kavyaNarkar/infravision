import React, { useRef, useState } from "react";
import { motion } from "framer-motion";


const ServicesCard = ({ service, index }) => {

  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false);

  const divRef = useRef(null)

  const handelMouseMove = (e) => {
    const bounds = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - bounds.left, y: e.clientY - bounds.top })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      viewport={{ once: true }}
      className="relative w-full rounded-2xl border border-gray-200 dark:border-gray-800 
         shadow-xl shadow-gray-100 dark:shadow-white/5 h-full"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      ref={divRef}
      onMouseMove={handelMouseMove}
    >
      <div
        className={`pointer-events-none blur-3xl rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 w-[300px] h-[300px] absolute z-0 transition-opacity duration-500 mix-blend-lighten ${visible ? "opacity-40" : "opacity-0"
          } `}
        style={{ top: position.y - 150, left: position.x - 150 }}
      />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6 p-4 md:p-8 transition-all duration-300 ease-in-out rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 z-10 relative h-full min-h-[12rem] hover:translate-y-[-5px] hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10">

        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl shrink-0 p-1.5 md:p-2 w-16 h-16 md:w-24 md:h-24 flex items-center justify-center shadow-inner">
          <img
            src={service.icon}
            alt=""
            className="w-full h-full object-contain bg-white dark:bg-gray-800 rounded-xl"
          />
        </div>
        <div className="flex-1 text-center sm:text-left flex flex-col justify-center h-full mt-2 sm:mt-0">
          <h3 className="font-black text-xs sm:text-sm md:text-lg leading-tight text-gray-900 dark:text-white uppercase tracking-tight">
            {service.title}
          </h3>
          <p className="text-[10px] sm:text-[11px] md:text-sm mt-1 md:mt-3 text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
            {service.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ServicesCard;
