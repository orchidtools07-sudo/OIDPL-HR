import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { loginUser } from '../utils/auth';

const LoginScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState(''); // Can be email or mobile
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 30,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Error', 'Please enter your credentials');
      return;
    }

    setLoading(true);
    
    try {
      const result = await loginUser(identifier.trim(), password);
      
      console.log('Login Result:', result);
      console.log('User Data:', result.user);
      
      if (result.success) {
        setLoading(false);
        if (result.role === 'employee') {
          console.log('Navigating to EmployeeDashboard with userData:', result.user);
          navigation.replace('EmployeeDashboard', { userData: result.user });
        } else if (result.role === 'admin') {
          navigation.replace('AdminDashboard');
        }
      } else {
        setLoading(false);
        Alert.alert('Login Failed', result.message || 'Invalid credentials');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'An error occurred during login');
      console.error('Login error:', error);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[COLORS.primary, '#004A8D', '#003366']}
          style={styles.gradientBackground}
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.logoContainer}>
              <View style={styles.logoWrapper}>
           
              </View>
              <Text style={styles.title}>OIDPL HR</Text>
              <Text style={styles.subtitle}>Professional Workforce Management</Text>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.welcomeSubtext}>Sign in with Email or Mobile Number</Text>

              <View style={styles.inputWrapper}>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={22} color={COLORS.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email or Mobile Number"
                    value={identifier}
                    onChangeText={setIdentifier}
                    autoCapitalize="none"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={22} color={COLORS.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color="#999"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.loginButton, loading && styles.disabledButton]} 
                onPress={handleLogin} 
                activeOpacity={0.8}
                disabled={loading}
              >
                <LinearGradient
                  colors={[COLORS.primary, '#0056b3']}
                  style={styles.loginGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <>
                      <Text style={styles.loginButtonText}>Sign In</Text>
                      <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  gradientBackground: {
    flex: 1,
    minHeight: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
    paddingTop: SPACING.xl * 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl * 1.5,
  },
  logoWrapper: {
    marginBottom: SPACING.lg,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.button,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: SPACING.xs,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: FONTS.sizes.medium,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '300',
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xlarge,
    padding: SPACING.xl,
    ...SHADOWS.card,
    shadowRadius: 20,
    shadowOpacity: 0.3,
    elevation: 10,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  welcomeSubtext: {
    fontSize: FONTS.sizes.medium,
    color: COLORS.darkGray,
    marginBottom: SPACING.xl,
  },
  inputWrapper: {
    marginBottom: SPACING.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  inputIcon: {
    marginRight: SPACING.md,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md + 2,
    fontSize: FONTS.sizes.medium,
    color: COLORS.text,
  },
  eyeIcon: {
    padding: SPACING.sm,
  },
  loginButton: {
    borderRadius: BORDER_RADIUS.medium,
    overflow: 'hidden',
    marginTop: SPACING.md,
    ...SHADOWS.button,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md + 4,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.large,
    fontWeight: '600',
    marginRight: SPACING.sm,
  },
});

export default LoginScreen;
