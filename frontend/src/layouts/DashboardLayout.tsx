import React from 'react';
import { Box, Flex, Heading, Text, Button, useColorModeValue, VStack } from '@chakra-ui/react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  const navItems = [
    { name: 'Visão Geral', path: '/dashboard' },
    { name: 'Agenda', path: '/dashboard/agenda' },
    { name: 'Pacientes', path: '/dashboard/patients' },
    { name: 'Dentistas', path: '/dashboard/dentists' },
    { name: 'Financeiro', path: '/dashboard/finance' },
  ];

  return (
    <Flex minH="100vh" bg={bg}>
      {/* Sidebar Simples */}
      <Box w="250px" bg={cardBg} borderRight="1px" borderColor="gray.200" p={4} display={{ base: 'none', md: 'block' }}>
        <Heading size="md" mb={8} color="brand.500">Bot Odonto</Heading>
        <Text color="gray.500" mb={4} fontSize="sm" fontWeight="bold" textTransform="uppercase">Menu Principal</Text>
        <VStack align="stretch" spacing={2}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              w="full"
              justifyContent="flex-start"
              variant={location.pathname === item.path ? 'solid' : 'ghost'}
              colorScheme={location.pathname === item.path ? 'brand' : 'gray'}
              onClick={() => navigate(item.path)}
            >
              {item.name}
            </Button>
          ))}
        </VStack>
      </Box>

      {/* Conteúdo Principal */}
      <Box flex="1" p={8}>
        <Flex justify="flex-end" align="center" mb={8}>
          <Button onClick={handleLogout} colorScheme="red" variant="outline" size="sm">Sair</Button>
        </Flex>

        {/* Aqui renderiza a página atual baseada na rota */}
        <Outlet />
      </Box>
    </Flex>
  );
};

export default DashboardLayout;
