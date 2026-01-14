import React, { memo, useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useDebounce, useThrottle } from '../../hooks/usePerformanceOptimization';

/**
 * Componente de formulario optimizado con validación,
 * debouncing, y optimizaciones de rendimiento
 */
const OptimizedForm = memo(({
  fields = [],
  onSubmit,
  onFieldChange,
  initialValues = {},
  validationRules = {},
  submitButtonText = 'Enviar',
  submitButtonStyle,
  containerStyle,
  fieldContainerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  showValidationErrors = true,
  debounceDelay = 300,
  throttleDelay = 100,
  enableAutoSave = false,
  autoSaveDelay = 2000,
  ...props
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const formRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);

  // Validar un campo específico
  const validateField = useCallback((fieldName, value) => {
    const rules = validationRules[fieldName];
    if (!rules) return null;

    // Validación requerida
    if (rules.required && (!value || value.toString().trim() === '')) {
      return rules.requiredMessage || `${fieldName} es requerido`;
    }

    // Validación de longitud mínima
    if (rules.minLength && value && value.length < rules.minLength) {
      const minMsg = rules.minLengthMessage || `${fieldName} debe tener al menos ${rules.minLength} caracteres`;
      return minMsg;
    }

    // Validación de longitud máxima
    if (rules.maxLength && value && value.length > rules.maxLength) {
      const maxMsg = rules.maxLengthMessage || `${fieldName} no puede tener más de ${rules.maxLength} caracteres`;
      return maxMsg;
    }

    // Validación de patrón
    if (rules.pattern && value && !rules.pattern.test(value)) {
      return rules.patternMessage || `${fieldName} tiene un formato inválido`;
    }

    // Validación personalizada
    if (rules.validate && typeof rules.validate === 'function') {
      const customError = rules.validate(value, values);
      if (customError) return customError;
    }

    return null;
  }, [validationRules, values]);

  // Validar todos los campos
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    fields.forEach(field => {
      const fieldName = field.name;
      const value = values[fieldName];
      const error = validateField(fieldName, value);

      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [fields, values, validateField]);

  // Manejar cambio de campo
  const handleFieldChange = useCallback((fieldName, value) => {
    setValues(prev => ({
      ...prev,
      [fieldName]: value,
    }));

    // Marcar como tocado
    setTouched(prev => ({
      ...prev,
      [fieldName]: true,
    }));

    // Marcar como sucio
    setIsDirty(true);

    // Validar campo si ya fue tocado
    if (touched[fieldName]) {
      const error = validateField(fieldName, value);
      setErrors(prev => ({
        ...prev,
        [fieldName]: error,
      }));
    }

    // Llamar callback personalizado
    onFieldChange?.(fieldName, value, values);
  }, [touched, validateField, onFieldChange, values]);

  // Debounce para cambios de campo
  const debouncedFieldChange = useDebounce(handleFieldChange, debounceDelay);

  // Throttle para envío
  const throttledSubmit = useThrottle(async() => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Validar formulario
      if (!validateForm()) {
        Alert.alert('Error', 'Por favor corrige los errores antes de enviar');
        return;
      }

      // Enviar formulario
      await onSubmit(values);

      // Resetear formulario si es exitoso
      setValues(initialValues);
      setErrors({});
      setTouched({});
      setIsDirty(false);
    } catch (error) {
      Alert.alert('Error', error.message || 'Error al enviar el formulario');
    } finally {
      setIsSubmitting(false);
    }
  }, throttleDelay);

  // Auto-guardado
  const handleAutoSave = useCallback(() => {
    if (!enableAutoSave || !isDirty) return;

    // Limpiar timeout anterior
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Configurar nuevo timeout
    autoSaveTimeoutRef.current = setTimeout(() => {
      if (validateForm()) {
        // Aquí podrías implementar la lógica de auto-guardado
        // eslint-disable-next-line no-console
        if (__DEV__) console.log('Auto-guardando formulario...', values);
      }
    }, autoSaveDelay);
  }, [enableAutoSave, isDirty, validateForm, values, autoSaveDelay]);

  // Efecto para auto-guardado
  React.useEffect(() => {
    handleAutoSave();

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [handleAutoSave]);

  // Renderizar campo
  const renderField = useCallback((field) => {
    const {
      name,
      label,
      type = 'text',
      placeholder,
      options = [],
      multiline = false,
      numberOfLines = 1,
      secureTextEntry = false,
      keyboardType = 'default',
      autoCapitalize = 'sentences',
      autoCorrect = true,
      style: fieldStyle,
      ...fieldProps
    } = field;

    const value = values[name] || '';
    const error = errors[name];
    const isTouched = touched[name];
    const showError = showValidationErrors && isTouched && error;

    return (
      <View key={name} style={[styles.fieldContainer, fieldContainerStyle]}>
        {label && (
          <Text style={[styles.label, labelStyle]}>
            {label}
            {validationRules[name]?.required && (
              <Text style={styles.required}> *</Text>
            )}
          </Text>
        )}

        {type === 'text' || type === 'email' || type === 'password' ? (
          <TextInput
            value={value}
            onChangeText={(text) => debouncedFieldChange(name, text)}
            placeholder={placeholder}
            style={[
              styles.input,
              inputStyle,
              showError && styles.inputError,
              fieldStyle,
            ]}
            multiline={multiline}
            numberOfLines={numberOfLines}
            secureTextEntry={type === 'password' || secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            {...fieldProps}
          />
        ) : type === 'select' ? (
          <View style={styles.selectContainer}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.selectOption,
                  value === option.value && styles.selectOptionSelected,
                ]}
                onPress={() => debouncedFieldChange(name, option.value)}
              >
                <Text
                  style={[
                    styles.selectOptionText,
                    value === option.value && styles.selectOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {showError && (
          <Text style={[styles.error, errorStyle]}>
            {error}
          </Text>
        )}
      </View>
    );
  }, [
    values,
    errors,
    touched,
    showValidationErrors,
    debouncedFieldChange,
    fieldContainerStyle,
    labelStyle,
    inputStyle,
    errorStyle,
    validationRules,
  ]);

  // Memoizar campos renderizados
  const renderedFields = useMemo(() => {
    return fields.map(renderField);
  }, [fields, renderField]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, containerStyle]}
      {...props}
    >
      <ScrollView
        ref={formRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderedFields}

        <TouchableOpacity
          style={[
            styles.submitButton,
            submitButtonStyle,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={throttledSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Enviando...' : submitButtonText}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

OptimizedForm.displayName = 'OptimizedForm';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#e74c3c',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  selectOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  selectOptionText: {
    fontSize: 14,
    color: '#333',
  },
  selectOptionTextSelected: {
    color: '#fff',
  },
  error: {
    fontSize: 14,
    color: '#e74c3c',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OptimizedForm;
