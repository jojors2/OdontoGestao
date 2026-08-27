import {
  CalendarDays,
  Users,
  ClipboardList,
  Bell,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

function Dashboard() {
  const consultas = [
    {
      id: 1,
      horario: "08:00",
      paciente: "Mariana Silva",
      procedimento: "Limpeza",
      status: "Confirmada",
    },
    {
      id: 2,
      horario: "10:30",
      paciente: "Carlos Henrique",
      procedimento: "Avaliação",
      status: "Aguardando",
    },
    {
      id: 3,
      horario: "14:00",
      paciente: "Ana Beatriz",
      procedimento: "Restauração",
      status: "Confirmada",
    },
    {
      id: 4,
      horario: "16:30",
      paciente: "Lucas Souza",
      procedimento: "Retorno",
      status: "Aguardando",
    },
  ];


  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p>Visão geral da clínica</p>
    </div>
  );
}

export default Dashboard;