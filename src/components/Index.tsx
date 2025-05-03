import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, FileText, Mail, Bell, CheckCircle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Gestão de Membros",
      description: "Administre facilmente todos os membros da equipe com perfis detalhados.",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Acompanhamento",
      description: "Monitore notificações e advertências para manter o controle da equipe.",
      icon: FileText,
      color: "bg-amber-100 text-amber-600",
    },
    {
      title: "Notificações",
      description: "Sistema de notificações para manter todos informados sobre atualizações importantes.",
      icon: Bell,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Comunicação",
      description: "Facilite a comunicação entre os membros da equipe de forma eficiente.",
      icon: Mail,
      color: "bg-green-100 text-green-600",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        {/* Hero Section */}
        <motion.div 
          className="flex flex-col items-center text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-20 w-20 rounded-full bg-primary mb-6 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
            Sistema de Gestão IBMEC Jr
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mb-8">
            Uma plataforma completa para gerenciar membros, acompanhar atividades e otimizar a comunicação na equipe.
          </p>
          <Button 
            onClick={() => navigate("/dashboard")}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-lg text-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <span>Acessar Dashboard</span>
            <ArrowRight size={20} />
          </Button>
        </motion.div>

        {/* Features Section */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
              variants={itemVariants}
            >
              <div className={`${feature.color} p-3 rounded-lg inline-block mb-4`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to action */}
        <motion.div 
          className="text-center mt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <p className="text-gray-600 mb-4">
            Desenvolvido especialmente para a equipe IBMEC Jr
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/users")}
              className="flex items-center gap-2"
            >
              <Users size={16} />
              <span>Ver Membros</span>
            </Button>
            <Button 
              className="bg-teal-600 hover:bg-teal-700"
              onClick={() => navigate("/dashboard")}
            >
              Ir para Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
