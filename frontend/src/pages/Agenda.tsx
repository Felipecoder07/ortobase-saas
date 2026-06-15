import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Button, Flex, Text, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  FormControl, FormLabel, Select, Input, useToast, useColorModeValue, VStack, Badge, HStack, IconButton
} from '@chakra-ui/react';
import { Plus, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

interface Appointment {
  id: string;
  date: string;
  durationInMinutes: number;
  serviceType: string;
  status: string;
  patient: { name: string; phone: string };
  dentist: { name: string };
}

const Agenda: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [dentists, setDentists] = useState<any[]>([]);
  
  // Controle de Data Diária
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    // Ajusta para o timezone local
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  });

  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const appointmentBg = useColorModeValue('gray.50', 'gray.700');

  // Form State
  const [formData, setFormData] = useState({
    patientId: '', dentistId: '', time: '', durationInMinutes: 30, serviceType: ''
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [apptRes, patRes, dentRes] = await Promise.all([
        axios.get(`http://localhost:3000/api/appointments?date=${currentDate}`, { headers }),
        axios.get('http://localhost:3000/api/patients', { headers }),
        axios.get('http://localhost:3000/api/dentists', { headers }),
      ]);

      setAppointments(apptRes.data);
      setPatients(patRes.data);
      setDentists(dentRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const changeDate = (days: number) => {
    const d = new Date(`${currentDate}T12:00:00.000Z`); // meio dia para evitar problemas de timezone
    d.setDate(d.getDate() + days);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Combina a data atual com o horário selecionado
      const dateTimeString = `${currentDate}T${formData.time}:00.000Z`;

      await axios.post('http://localhost:3000/api/appointments', {
        patientId: formData.patientId,
        dentistId: formData.dentistId,
        date: dateTimeString,
        durationInMinutes: Number(formData.durationInMinutes),
        serviceType: formData.serviceType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({ title: 'Consulta agendada', status: 'success' });
      onClose();
      fetchData();
    } catch (error: any) {
      toast({ title: 'Erro ao agendar', description: error.response?.data?.error, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:3000/api/appointments/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: 'Status atualizado', status: 'success' });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'SCHEDULED': return <Badge colorScheme="blue">Agendada</Badge>;
      case 'CONFIRMED': return <Badge colorScheme="purple">Confirmada</Badge>;
      case 'CANCELED': return <Badge colorScheme="red">Cancelada</Badge>;
      case 'COMPLETED': return <Badge colorScheme="green">Realizada</Badge>;
      case 'NO_SHOW': return <Badge colorScheme="orange">Faltou</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Agenda Diária</Heading>
        <Button leftIcon={<Plus size={18} />} colorScheme="brand" onClick={onOpen}>Nova Consulta</Button>
      </Flex>

      <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
        <Flex justify="center" align="center" mb={6} gap={4}>
          <IconButton aria-label="Anterior" icon={<ChevronLeft />} onClick={() => changeDate(-1)} />
          <Heading size="md" minW="150px" textAlign="center">{currentDate.split('-').reverse().join('/')}</Heading>
          <IconButton aria-label="Próximo" icon={<ChevronRight />} onClick={() => changeDate(1)} />
        </Flex>

        <VStack align="stretch" spacing={4}>
          {appointments.length === 0 ? (
            <Text color="gray.500" textAlign="center" py={8}>Nenhuma consulta para este dia.</Text>
          ) : (
            appointments.map(appt => (
              <Flex key={appt.id} p={4} bg={appointmentBg} borderRadius="md" borderWidth="1px" borderColor="gray.100" justify="space-between" align="center">
                <Box>
                  <Text fontSize="xl" fontWeight="bold" color="brand.500">{formatTime(appt.date)}</Text>
                  <Text fontSize="sm" color="gray.500">{appt.durationInMinutes} min</Text>
                </Box>
                <Box flex="1" ml={6}>
                  <Text fontWeight="bold">{appt.patient.name}</Text>
                  <Text fontSize="sm" color="gray.500">Procedimento: {appt.serviceType} • {appt.patient.phone}</Text>
                  <Text fontSize="xs" color="gray.400">Dentista: {appt.dentist.name}</Text>
                </Box>
                <VStack align="flex-end">
                  {getStatusBadge(appt.status)}
                  {appt.status !== 'CANCELED' && appt.status !== 'COMPLETED' && (
                    <HStack mt={2}>
                      <IconButton aria-label="Confirmar" icon={<CheckCircle size={16} />} size="sm" colorScheme="green" variant="ghost" onClick={() => updateStatus(appt.id, 'CONFIRMED')} />
                      <IconButton aria-label="Cancelar" icon={<XCircle size={16} />} size="sm" colorScheme="red" variant="ghost" onClick={() => updateStatus(appt.id, 'CANCELED')} />
                    </HStack>
                  )}
                </VStack>
              </Flex>
            ))
          )}
        </VStack>
      </Box>

      {/* Modal de Agendamento */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader>Agendar Consulta</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction="column" gap={4}>
              <FormControl isRequired>
                <FormLabel>Paciente</FormLabel>
                <Select placeholder="Selecione..." value={formData.patientId} onChange={e => setFormData({...formData, patientId: e.target.value})}>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Dentista</FormLabel>
                <Select placeholder="Selecione..." value={formData.dentistId} onChange={e => setFormData({...formData, dentistId: e.target.value})}>
                  {dentists.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
              </FormControl>

              <HStack>
                <FormControl isRequired>
                  <FormLabel>Horário</FormLabel>
                  <Input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Duração (min)</FormLabel>
                  <Input type="number" step="15" value={formData.durationInMinutes} onChange={e => setFormData({...formData, durationInMinutes: Number(e.target.value)})} />
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel>Serviço / Procedimento</FormLabel>
                <Input value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})} />
              </FormControl>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
            <Button colorScheme="brand" onClick={handleSave} isLoading={loading}>Confirmar Agendamento</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Agenda;
