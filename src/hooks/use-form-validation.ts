"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import { ZodSchema, ZodError } from "zod";

/**
 * Custom hook for client-side form validation with support for async validation
 * @param schema The Zod schema to validate against
 * @param validateFn Optional async function for server-side validation
 */
export function useFormValidation<T extends object>(
  schema: ZodSchema<T>,
  validateFn?: (
    data: T,
  ) => Promise<{ valid: boolean; errors?: Record<string, string[]> }>,
) {
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidData, setLastValidData] = useState<T | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});

  // Optional SWR for persisted form data
  const { data: savedFormData, mutate: setSavedFormData } = useSWR<T | null>(
    "form-validation",
    null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const validate = useCallback(
    async (
      data: unknown,
    ): Promise<{ isValid: boolean; errors: Record<string, string[]> }> => {
      setIsValidating(true);
      setValidationErrors({});

      try {
        // Validate with Zod schema
        const validData = schema.parse(data) as T;

        // If we have a custom validation function, run it
        if (validateFn) {
          const serverValidation = await validateFn(validData);
          if (!serverValidation.valid) {
            setIsValidating(false);
            setValidationErrors(serverValidation.errors || {});
            return { isValid: false, errors: serverValidation.errors || {} };
          }
        }

        // All validation passed
        setLastValidData(validData);
        setIsValidating(false);
        return { isValid: true, errors: {} };
      } catch (error) {
        // Handle Zod validation errors
        if (error instanceof ZodError) {
          const errors: Record<string, string[]> = {};

          error.errors.forEach((err) => {
            const path = err.path.join(".");
            if (!errors[path]) {
              errors[path] = [];
            }
            errors[path].push(err.message);
          });

          setValidationErrors(errors);
          setIsValidating(false);
          return { isValid: false, errors };
        }

        // Handle other errors
        setIsValidating(false);
        const genericError = { "": ["An unexpected error occurred"] };
        setValidationErrors(genericError);
        return { isValid: false, errors: genericError };
      }
    },
    [schema, validateFn],
  );

  const saveFormData = useCallback(
    (data: T) => {
      setSavedFormData(data);
    },
    [setSavedFormData],
  );

  const clearSavedFormData = useCallback(() => {
    setSavedFormData(null);
  }, [setSavedFormData]);

  return {
    validate,
    isValidating,
    validationErrors,
    lastValidData,
    savedFormData,
    saveFormData,
    clearSavedFormData,
  };
}
