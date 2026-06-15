import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Button, Table, Thead, Tbody, Tr, Th, Td, Flex, Input,
  useToast, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  FormControl, FormLabel, useColorModeValue, IconButton
} from '@chakra-ui/react';
import { Plus, Trash2 } from 'lucide-react';
import axios from 'axios';

interface Patient {
  id: string;
  name: string;
  cpf: string;
  phone: string;
}

const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');

  // Form State
  const [formData, setFormData] = useState({ name: '', cpf: '', dateOfBirth: '', phone: '' });

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:3000/api/patients?query=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [search]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/patients', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: 'Paciente salvo com sucesso', status: 'success' });
      onClose();
      fetchPatients();
    } catch (error: any) {
      toast({ title: 'Erro ao salvar', description: error.response?.data?.error, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja inativar este paciente?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/patients/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: 'Paciente inativado', status: 'info' });
      fetchPatients();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Pacientes</Heading>
        <Button leftIcon={<Plus size={18} />} colorScheme="brand" onClick={onOpen}>Novo Paciente</Button>
      </Flex>

      <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
        <Input 
          placeholder="Buscar por nome ou CPF..." 
          mb={6} maxW="400px" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
        
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Nome</Th>
                <Th>CPF</Th>
                <Th>Telefone</Th>
                <Th width="80px">Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {patients.map(p => (
                <Tr key={p.id}>
                  <Td fontWeight="medium">{p.name}</Td>
                  <Td>{p.cpf}</Td>
                  <Td>{p.phone}</Td>
                  <Td>
                    <IconButton aria-label="Deletar" icon={<Trash2 size={16} />} size="sm" colorScheme="red" variant="ghost" onClick={() => handleDelete(p.id)} />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* Modal de Cadastro */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader>Cadastrar Paciente</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction="column" gap={4}>
              <FormControl isRequired>
                <FormLabel>Nome Completo</FormLabel>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>CPF</FormLabel>
                <Input value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Data de Nascimento</FormLabel>
                <Input type="date" value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Telefone</FormLabel>
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </FormControl>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
            <Button colorScheme="brand" onClick={handleSave} isLoading={loading}>Salvar Paciente</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Patients;
