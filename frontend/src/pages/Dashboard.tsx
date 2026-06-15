import React from 'react';
import { Box, Heading, Text, useColorModeValue } from '@chakra-ui/react';

const Dashboard: React.FC = () => {
  const cardBg = useColorModeValue('white', 'gray.800');

  return (
    <Box>
      <Heading size="lg" mb={8}>Visão Geral</Heading>
      <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
        <Heading size="md" mb={4}>Bem-vindo ao sistema de gestão!</Heading>
        <Text color="gray.500">
          Você está acessando a fundação técnica do Bot Odonto.
          Utilize o menu lateral para gerenciar Pacientes e Dentistas.
        </Text>
      </Box>
    </Box>
  );
};

export default Dashboard;
