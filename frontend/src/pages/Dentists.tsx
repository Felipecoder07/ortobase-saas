import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Button, Table, Thead, Tbody, Tr, Th, Td, Flex, Input,
  useToast, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  FormControl, FormLabel, useColorModeValue, IconButton
} from '@chakra-ui/react';
import { Plus, Trash2 } from 'lucide-react';
import axios from 'axios';

interface Dentist {
  id: string;
  name: string;
  cro: string;
  phone: string;
  specialties: string;
}

const Dentists: React.FC = () => {
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');

  // Form State
  const [formData, setFormData] = useState({ name: '', cro: '', specialties: '', phone: '' });

  const fetchDentists = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:3000/api/dentists?query=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDentists(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDentists();
  }, [search]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/dentists', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: 'Dentista salvo com sucesso', status: 'success' });
      onClose();
      fetchDentists();
    } catch (error: any) {
      toast({ title: 'Erro ao salvar', description: error.response?.data?.error, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja inativar este dentista?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/dentists/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: 'Dentista inativado', status: 'info' });
      fetchDentists();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Dentistas</Heading>
        <Button leftIcon={<Plus size={18} />} colorScheme="brand" onClick={onOpen}>Novo Dentista</Button>
      </Flex>

      <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
        <Input 
          placeholder="Buscar por nome ou CRO..." 
          mb={6} maxW="400px" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
        
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Nome</Th>
                <Th>CRO</Th>
                <Th>Especialidade</Th>
                <Th>Telefone</Th>
                <Th width="80px">Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {dentists.map(d => (
                <Tr key={d.id}>
                  <Td fontWeight="medium">{d.name}</Td>
                  <Td>{d.cro}</Td>
                  <Td>{d.specialties || '-'}</Td>
                  <Td>{d.phone}</Td>
                  <Td>
                    <IconButton aria-label="Deletar" icon={<Trash2 size={16} />} size="sm" colorScheme="red" variant="ghost" onClick={() => handleDelete(d.id)} />
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
          <ModalHeader>Cadastrar Dentista</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction="column" gap={4}>
              <FormControl isRequired>
                <FormLabel>Nome Completo</FormLabel>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>CRO</FormLabel>
                <Input value={formData.cro} onChange={e => setFormData({...formData, cro: e.target.value})} />
              </FormControl>
              <FormControl>
                <FormLabel>Especialidades</FormLabel>
                <Input value={formData.specialties} onChange={e => setFormData({...formData, specialties: e.target.value})} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Telefone</FormLabel>
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </FormControl>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
            <Button colorScheme="brand" onClick={handleSave} isLoading={loading}>Salvar Dentista</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Dentists;
