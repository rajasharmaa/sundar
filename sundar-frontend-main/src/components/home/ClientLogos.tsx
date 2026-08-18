import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Building, Factory, Globe2, Truck, Warehouse } from 'lucide-react';

const clients = [
  { name: 'UltraTech Cement', icon: Factory },
  { name: 'Reliance Industries', icon: Building },
  { name: 'Adani Agri', icon: Globe2 },
  { name: 'ITC Limited', icon: Warehouse },
  { name: 'Nirma', icon: Briefcase },
  { name: 'Delhivery', icon: Truck },
  // Duplicate for infinite scroll effect
  { name: 'UltraTech Cement', icon: Factory },
  { name: 'Reliance Industries', icon: Building },
  { name: 'Adani Agri', icon: Globe2 },
  { name: 'ITC Limited', icon: Warehouse },
  { name: 'Nirma', icon: Briefcase },
  { name: 'Delhivery', icon: Truck }
];

const ClientLogos: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50 border-y border-gray-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
        <p className="text-sm font-semibold text-gray-500 tracking-widest uppercase">
          Trusted by Industry Leaders
        </p>
      </div>
      
      <div className="relative flex overflow-x-hidden group">
        <motion.div
          className="flex space-x-12 px-6 items-center whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 20
          }}
        >
          {clients.map((client, index) => (
            <div key={index} className="flex items-center space-x-3 text-gray-400 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 hover:text-green-600 transition-all duration-300">
              <client.icon className="w-8 h-8" />
              <span className="text-xl font-bold">{client.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ClientLogos;
