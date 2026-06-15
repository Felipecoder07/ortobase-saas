import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Flex, Text, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  FormControl, FormLabel, Select, Input, useToast, useColorModeValue, VStack, Badge, HStack, SimpleGrid, Table, Thead, Tbody, Tr, Th, Td,
  Tabs, TabList, TabPanels, Tab, TabPanel, Textarea
} from '@chakra-ui/react';
import { DollarSign, MessageCircle, RefreshCcw } from 'lucide-react';
import axios from 'axios';

const Finance: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [reports, setReports] = useState({ daily: 0, monthly: 0, yearly: 0 });
  const [loading, setLoading] = useState(false);
  
  // Payment Modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  // Refund Modal
  const { isOpen: isRefundOpen, onOpen: onRefundOpen, onClose: onRefundClose } = useDisclosure();
  
  const toast = useToast();
  
  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  // Selecionado para pagar
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [formData, setFormData] = useState({
    method: 'CREDIT_CARD', discount: 0, installments: 1
  });

  // Selecionado para estorno
  const [refundAppt, setRefundAppt] = useState<any>(null);
  const [refundReason, setRefundReason] = useState('');

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const resAppts = await axios.get(`http://localhost:3000/api/appointments`, { headers });
      setAppointments(resAppts.data);

      const resDefaulters = await axios.get(`http://localhost:3000/api/finance/defaulters`, { headers });
      setDefaulters(resDefaulters.data);

      const resReports = await axios.get(`http://localhost:3000/api/finance/reports`, { headers });
      setReports(resReports.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePay = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/finance', {
        appointmentId: selectedAppt.id,
        method: formData.method,
        discount: Number(formData.discount),
        installments: Number(formData.installments)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({ title: 'Pagamento registrado!', status: 'success' });
      onClose();
      fetchData();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.response?.data?.error, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!refundReason) {
      toast({ title: 'Erro', description: 'A justificativa é obrigatória.', status: 'error' });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:3000/api/finance/${refundAppt.payment.id}/refund`, {
        refundReason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({ title: 'Estorno realizado!', status: 'success' });
      onRefundClose();
      fetchData();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.response?.data?.error, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendReceipt = async (paymentId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:3000/api/finance/${paymentId}/receipt`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: 'Comprovante enviado via WhatsApp!', status: 'success' });
    } catch (error: any) {
      toast({ title: 'Erro ao enviar comprovante', status: 'error' });
    }
  };

  const openPaymentModal = (appt: any) => {
    setSelectedAppt(appt);
    setFormData({ method: 'CREDIT_CARD', discount: 0, installments: 1 });
    onOpen();
  };

  const openRefundModal = (appt: any) => {
    setRefundAppt(appt);
    setRefundReason('');
    onRefundOpen();
  };

  const pending = appointments.filter(a => !a.payment && a.status !== 'CANCELED');
  const paid = appointments.filter(a => a.payment && a.payment.status === 'PAID');

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={8}>
        <Heading size="lg">Financeiro</Heading>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Box bg={bg} p={6} borderRadius="xl" boxShadow="sm" borderTop="4px solid" borderColor="brand.500">
          <Text color="gray.500" fontSize="sm" fontWeight="bold">FATURAMENTO MENSAL</Text>
          <Heading size="xl" mt={2}>R$ {reports.monthly.toFixed(2)}</Heading>
        </Box>
        <Box bg={bg} p={6} borderRadius="xl" boxShadow="sm" borderTop="4px solid" borderColor="orange.400">
          <Text color="gray.500" fontSize="sm" fontWeight="bold">PENDENTES</Text>
          <Heading size="xl" mt={2}>{pending.length}</Heading>
        </Box>
        <Box bg={bg} p={6} borderRadius="xl" boxShadow="sm" borderTop="4px solid" borderColor="red.500">
          <Text color="gray.500" fontSize="sm" fontWeight="bold">INADIMPLENTES</Text>
          <Heading size="xl" mt={2} color="red.500">{defaulters.length}</Heading>
        </Box>
      </SimpleGrid>

      <Box bg={bg} borderRadius="xl" boxShadow="sm" mb={8}>
        <Tabs colorScheme="brand" variant="enclosed" p={4}>
          <TabList>
            <Tab fontWeight="bold">Pendentes</Tab>
            <Tab fontWeight="bold">Pagos</Tab>
            <Tab fontWeight="bold">Relatórios</Tab>
          </TabList>

          <TabPanels>
            {/* Aba Pendentes */}
            <TabPanel>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Data</Th>
                      <Th>Paciente</Th>
                      <Th>Serviço</Th>
                      <Th>Status</Th>
                      <Th>Preço Base</Th>
                      <Th>Ações</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {pending.length === 0 && <Tr><Td colSpan={6} textAlign="center">Nenhum pagamento pendente.</Td></Tr>}
                    {pending.map(p => {
                      const isDefaulter = p.status === 'COMPLETED';
                      return (
                      <Tr key={p.id}>
                        <Td>{new Date(p.date).toLocaleDateString('pt-BR')}</Td>
                        <Td>{p.patient.name}</Td>
                        <Td>{p.serviceType}</Td>
                        <Td>
                          <Badge colorScheme={isDefaulter ? 'red' : 'orange'}>
                            {isDefaulter ? 'Inadimplente' : 'Pendente'}
                          </Badge>
                        </Td>
                        <Td>R$ {p.price?.toFixed(2) || '0.00'}</Td>
                        <Td>
                          <Button size="sm" colorScheme="green" leftIcon={<DollarSign size={16} />} onClick={() => openPaymentModal(p)}>
                            Receber
                          </Button>
                        </Td>
                      </Tr>
                    )})}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>

            {/* Aba Pagos */}
            <TabPanel>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Data</Th>
                      <Th>Paciente</Th>
                      <Th>Serviço</Th>
                      <Th>Valor Pago</Th>
                      <Th>Ações</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {paid.length === 0 && <Tr><Td colSpan={5} textAlign="center">Nenhuma consulta paga encontrada.</Td></Tr>}
                    {paid.map(p => (
                      <Tr key={p.id}>
                        <Td>{new Date(p.date).toLocaleDateString('pt-BR')}</Td>
                        <Td>{p.patient.name}</Td>
                        <Td>{p.serviceType}</Td>
                        <Td fontWeight="bold" color="green.500">R$ {p.payment?.amount?.toFixed(2)}</Td>
                        <Td>
                          <HStack spacing={2}>
                            <Button size="sm" colorScheme="teal" variant="outline" leftIcon={<MessageCircle size={16} />} onClick={() => handleSendReceipt(p.payment.id)}>
                              Comprovante
                            </Button>
                            <Button size="sm" colorScheme="red" variant="outline" leftIcon={<RefreshCcw size={16} />} onClick={() => openRefundModal(p)}>
                              Estornar
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>

            {/* Aba Relatórios */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                {/* Resumo Financeiro */}
                <Box p={6} border="1px solid" borderColor="gray.200" borderRadius="md">
                  <Heading size="md" mb={6}>Resumo de Faturamento</Heading>
                  <VStack align="stretch" spacing={4}>
                    <Flex justify="space-between" p={4} bg={cardBg} borderRadius="md">
                      <Text fontWeight="bold">Faturamento Hoje</Text>
                      <Text fontWeight="bold" color="green.500">R$ {reports.daily.toFixed(2)}</Text>
                    </Flex>
                    <Flex justify="space-between" p={4} bg={cardBg} borderRadius="md">
                      <Text fontWeight="bold">Faturamento do Mês</Text>
                      <Text fontWeight="bold" color="green.500">R$ {reports.monthly.toFixed(2)}</Text>
                    </Flex>
                    <Flex justify="space-between" p={4} bg={cardBg} borderRadius="md">
                      <Text fontWeight="bold">Faturamento do Ano</Text>
                      <Text fontWeight="bold" color="green.500">R$ {reports.yearly.toFixed(2)}</Text>
                    </Flex>
                  </VStack>
                </Box>

                {/* Relatório de Inadimplência */}
                <Box p={6} border="1px solid" borderColor="gray.200" borderRadius="md">
                  <Heading size="md" mb={6} color="red.500">Relatório de Inadimplência</Heading>
                  {defaulters.length === 0 ? (
                    <Text color="gray.500">Nenhum paciente inadimplente.</Text>
                  ) : (
                    <VStack align="stretch" spacing={3} maxH="300px" overflowY="auto">
                      {defaulters.map(d => (
                        <Box key={d.id} p={3} bg={cardBg} borderRadius="md" borderLeft="4px solid" borderColor="red.500">
                          <Text fontWeight="bold">{d.patient.name}</Text>
                          <Text fontSize="sm" color="gray.600">Serviço: {d.serviceType} | Valor: R$ {d.price?.toFixed(2)}</Text>
                          <Text fontSize="xs" color="gray.500">Data: {new Date(d.date).toLocaleDateString('pt-BR')} - Tel: {d.patient.phone}</Text>
                        </Box>
                      ))}
                    </VStack>
                  )}
                </Box>
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* Modal de Pagamento */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader>Registrar Pagamento</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedAppt && (
              <Flex direction="column" gap={4}>
                <Box p={4} bg={cardBg} borderRadius="md">
                  <Text fontWeight="bold">{selectedAppt.patient.name}</Text>
                  <Text fontSize="sm" color="gray.500">Serviço: {selectedAppt.serviceType}</Text>
                  <Text mt={2}>Preço Base: <b>R$ {selectedAppt.price?.toFixed(2) || '0.00'}</b></Text>
                </Box>

                <FormControl>
                  <FormLabel>Desconto (%) - Máx 20% (Rec)</FormLabel>
                  <Input type="number" min="0" max="100" value={formData.discount} onChange={e => setFormData({...formData, discount: Number(e.target.value)})} />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Método de Pagamento</FormLabel>
                  <Select value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})}>
                    <option value="CREDIT_CARD">Cartão de Crédito</option>
                    <option value="DEBIT_CARD">Cartão de Débito</option>
                    <option value="PIX">PIX</option>
                    <option value="CASH">Dinheiro</option>
                  </Select>
                </FormControl>

                {formData.method === 'CREDIT_CARD' && (
                  <FormControl>
                    <FormLabel>Parcelas (Mínimo R$30 por parcela)</FormLabel>
                    <Input type="number" min="1" max="12" value={formData.installments} onChange={e => setFormData({...formData, installments: Number(e.target.value)})} />
                  </FormControl>
                )}
              </Flex>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
            <Button colorScheme="green" onClick={handlePay} isLoading={loading}>Confirmar Pagamento</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Estorno */}
      <Modal isOpen={isRefundOpen} onClose={onRefundClose}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader>Estornar Pagamento</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {refundAppt && (
              <Flex direction="column" gap={4}>
                <Box p={4} bg="red.50" borderRadius="md" color="red.800">
                  <Text fontWeight="bold">Atenção!</Text>
                  <Text fontSize="sm">Você está prestes a estornar o pagamento de <b>R$ {refundAppt.payment?.amount?.toFixed(2)}</b> do paciente <b>{refundAppt.patient.name}</b>.</Text>
                </Box>
                <FormControl isRequired>
                  <FormLabel>Justificativa do Estorno</FormLabel>
                  <Textarea 
                    placeholder="Descreva o motivo do estorno..." 
                    value={refundReason} 
                    onChange={e => setRefundReason(e.target.value)} 
                  />
                </FormControl>
              </Flex>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onRefundClose}>Cancelar</Button>
            <Button colorScheme="red" onClick={handleRefund} isLoading={loading}>Confirmar Estorno</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
};

export default Finance;
