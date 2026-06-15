
import React, { useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  useToast,
  VStack,
  useColorModeValue,
  Image,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const bgGradient = useColorModeValue(
    'linear(to-br, brand.50, white)',
    'linear(to-br, gray.900, brand.900)'
  );

  const glassBg = useColorModeValue('rgba(255, 255, 255, 0.7)', 'rgba(0, 0, 0, 0.5)');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        password,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);

      toast({
        title: 'Login realizado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Erro ao entrar',
        description: error.response?.data?.error || 'Verifique suas credenciais.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="100vh" bgGradient={bgGradient} align="center" justify="center" p={4}>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        maxW="1000px"
        w="full"
        bg={glassBg}
        backdropFilter="blur(16px)"
        boxShadow="2xl"
        borderRadius="2xl"
        overflow="hidden"
      >
        {/* Lado Esquerdo - Branding */}
        <Box flex="1" bg="brand.600" color="white" p={12} display="flex" flexDirection="column" justifyContent="center">
          <Heading size="2xl" mb={4} fontWeight="extrabold" letterSpacing="tight">
            Bot Odonto
          </Heading>
          <Text fontSize="lg" opacity={0.9}>
            A revolução na gestão e comunicação da sua clínica odontológica. Entre para acessar seu painel administrativo.
          </Text>
        </Box>

        {/* Lado Direito - Formulário */}
        <Box flex="1" p={12} display="flex" flexDirection="column" justifyContent="center">
          <Heading size="lg" mb={2}>Bem-vindo de volta</Heading>
          <Text color="gray.500" mb={8}>Por favor, insira suas credenciais.</Text>

          <form onSubmit={handleLogin}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>E-mail</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  variant="filled"
                  _focus={{ bg: useColorModeValue('white', 'gray.800'), borderColor: 'brand.500' }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Senha</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  variant="filled"
                  _focus={{ bg: useColorModeValue('white', 'gray.800'), borderColor: 'brand.500' }}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="brand"
                size="lg"
                w="full"
                mt={4}
                isLoading={isLoading}
                loadingText="Entrando..."
              >
                Entrar no Sistema
              </Button>
            </VStack>
          </form>
        </Box>
      </Flex>
    </Flex>
  );
};

export default Login;
